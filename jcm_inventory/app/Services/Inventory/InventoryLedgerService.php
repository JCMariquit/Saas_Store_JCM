<?php

namespace App\Services\Inventory;

use Carbon\CarbonInterface;
use Illuminate\Database\Connection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class InventoryLedgerService
{
    private const QUANTITY_TOLERANCE = 0.0001;

    public function database(): Connection
    {
        return DB::connection('mysql');
    }

    /**
     * @return array{
     *     batch_code_prefix:string,
     *     batch_code_sequence_padding:int,
     *     auto_generate_batch_code:bool,
     *     default_batch_issue_policy:string,
     *     expiry_warning_days:int,
     *     expiry_critical_days:int,
     *     allow_expired_issue:bool,
     *     allow_negative_stock:bool,
     *     require_batch_for_tracked_products:bool
     * }
     */
    public function settings(int $tenantId): array
    {
        $settings = $this->database()
            ->table('inventory_settings')
            ->where('tenant_id', $tenantId)
            ->first();

        return [
            'batch_code_prefix' =>
                (string) ($settings?->batch_code_prefix ?? 'BAT'),
            'batch_code_sequence_padding' => max(
                3,
                min(
                    12,
                    (int) (
                        $settings?->batch_code_sequence_padding ?? 6
                    )
                )
            ),
            'auto_generate_batch_code' =>
                (bool) ($settings?->auto_generate_batch_code ?? true),
            'default_batch_issue_policy' =>
                (string) (
                    $settings?->default_batch_issue_policy ?? 'fifo'
                ),
            'expiry_warning_days' =>
                (int) ($settings?->expiry_warning_days ?? 30),
            'expiry_critical_days' =>
                (int) ($settings?->expiry_critical_days ?? 7),
            'allow_expired_issue' =>
                (bool) ($settings?->allow_expired_issue ?? false),
            'allow_negative_stock' =>
                (bool) ($settings?->allow_negative_stock ?? false),
            'require_batch_for_tracked_products' =>
                (bool) (
                    $settings?->require_batch_for_tracked_products ?? false
                ),
        ];
    }

    public function lockWarehouse(
        int $tenantId,
        int $warehouseId,
        bool $activeOnly = true
    ): object {
        $query = $this->database()
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
            ->where('id', $warehouseId)
            ->whereNull('deleted_at');

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        $warehouse = $query
            ->lockForUpdate()
            ->first();

        if (! $warehouse) {
            throw ValidationException::withMessages([
                'warehouse_id' =>
                    'The selected warehouse is unavailable for this account.',
            ]);
        }

        return $warehouse;
    }

    public function lockProduct(
        int $tenantId,
        int $productId,
        bool $activeOnly = true
    ): object {
        $query = $this->database()
            ->table('products')
            ->where('tenant_id', $tenantId)
            ->where('id', $productId)
            ->whereNull('deleted_at');

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        $product = $query
            ->lockForUpdate()
            ->first();

        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' =>
                    'The selected product is unavailable for this account.',
            ]);
        }

        if ($product->stock_tracking !== 'tracked') {
            throw ValidationException::withMessages([
                'product_id' =>
                    'The selected product is not configured for stock tracking.',
            ]);
        }

        return $product;
    }

    public function lockOrCreateStockPosition(
        int $tenantId,
        int $warehouseId,
        int $productId,
        CarbonInterface $timestamp,
        float $reorderLevel = 0.0,
        ?float $maxStockLevel = null
    ): object {
        $database = $this->database();

        /*
         * Do not call insertOrIgnore() before checking the existing row.
         * MariaDB executes BEFORE INSERT triggers even when the insert will
         * later be ignored by a duplicate key. The warehouse_stocks guard
         * therefore sees the attempted zero quantity and correctly rejects it
         * whenever batch balances already exist.
         */
        $stock = $database
            ->table('warehouse_stocks')
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->lockForUpdate()
            ->first();

        if ($stock) {
            $this->assertReconciled(
                $tenantId,
                $warehouseId,
                $productId,
                $this->quantity($stock->quantity)
            );

            return $stock;
        }

        /*
         * A legacy or repaired database can contain batch rows before its
         * aggregate warehouse_stocks row is recreated. Build the initial
         * aggregate from the locked cost layers so the database trigger sees
         * an already-reconciled insert instead of an artificial zero balance.
         */
        $existingLayers = $database
            ->table('warehouse_batch_stocks as wbs')
            ->join('stock_batches as sb', function ($join): void {
                $join
                    ->on('sb.tenant_id', '=', 'wbs.tenant_id')
                    ->on('sb.id', '=', 'wbs.stock_batch_id')
                    ->on('sb.product_id', '=', 'wbs.product_id');
            })
            ->where('wbs.tenant_id', $tenantId)
            ->where('wbs.warehouse_id', $warehouseId)
            ->where('wbs.product_id', $productId)
            ->select([
                'wbs.quantity',
                'sb.unit_cost',
            ])
            ->lockForUpdate()
            ->get();

        $baselineQuantity = $this->quantity(
            $existingLayers->sum(
                fn ($layer): float => (float) $layer->quantity
            )
        );

        $baselineValue = $existingLayers->sum(
            fn ($layer): float =>
                (float) $layer->quantity * (float) $layer->unit_cost
        );

        $baselineAverageCost = $baselineQuantity > 0
            ? $this->cost($baselineValue / $baselineQuantity)
            : 0.0;

        $database
            ->table('warehouse_stocks')
            ->insert([
                'tenant_id' => $tenantId,
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'quantity' => $baselineQuantity,
                'reorder_level' => $this->quantity($reorderLevel),
                'max_stock_level' => $maxStockLevel !== null
                    ? $this->quantity($maxStockLevel)
                    : null,
                'average_cost' => $baselineAverageCost,
                'last_movement_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

        $stock = $database
            ->table('warehouse_stocks')
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->lockForUpdate()
            ->first();

        if (! $stock) {
            throw ValidationException::withMessages([
                'stock' =>
                    'Unable to prepare the warehouse stock position.',
            ]);
        }

        $this->assertReconciled(
            $tenantId,
            $warehouseId,
            $productId,
            $this->quantity($stock->quantity)
        );

        return $stock;
    }

    public function lockExistingStockPosition(
        int $tenantId,
        int $warehouseId,
        int $productId
    ): object {
        $stock = $this->database()
            ->table('warehouse_stocks')
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->lockForUpdate()
            ->first();

        if (! $stock) {
            throw ValidationException::withMessages([
                'stock' =>
                    'The requested warehouse stock position could not be found.',
            ]);
        }

        $this->assertReconciled(
            $tenantId,
            $warehouseId,
            $productId,
            $this->quantity($stock->quantity)
        );

        return $stock;
    }

    public function assertReconciled(
        int $tenantId,
        int $warehouseId,
        int $productId,
        ?float $aggregateQuantity = null
    ): void {
        $database = $this->database();

        if ($aggregateQuantity === null) {
            $aggregateQuantity = $this->quantity(
                $database
                    ->table('warehouse_stocks')
                    ->where('tenant_id', $tenantId)
                    ->where('warehouse_id', $warehouseId)
                    ->where('product_id', $productId)
                    ->lockForUpdate()
                    ->value('quantity') ?? 0
            );
        }

        $batchQuantity = $this->quantity(
            $database
                ->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->select('quantity')
                ->lockForUpdate()
                ->get()
                ->sum('quantity')
        );

        if (
            abs($aggregateQuantity - $batchQuantity)
            > self::QUANTITY_TOLERANCE
        ) {
            throw ValidationException::withMessages([
                'stock' =>
                    'This stock position has a batch reconciliation mismatch. Repair the aggregate and batch balances before posting another transaction.',
            ]);
        }
    }

    /**
     * Post an incoming inventory transaction using one or more new cost layers.
     * The caller must already be inside DB::connection('mysql')->transaction().
     *
     * Required payload keys:
     * tenant_id, warehouse_id, product_id, quantity, unit_cost,
     * movement_type, reference_type, reference_id, reference_no,
     * source_type, source_reference, user_id, movement_date.
     *
     * Optional: supplier_id, purchase_receipt_item_id, related_warehouse_id,
     * remarks, reorder_level, max_stock_level, layers.
     *
     * @return array{
     *     stock_id:int,
     *     movement_id:int,
     *     quantity:float,
     *     unit_cost:float,
     *     total_cost:float,
     *     quantity_before:float,
     *     quantity_after:float,
     *     average_cost_before:float,
     *     average_cost_after:float,
     *     allocations:array<int,array<string,mixed>>
     * }
     */
    public function postIncoming(array $payload): array
    {
        $tenantId = (int) $payload['tenant_id'];
        $warehouseId = (int) $payload['warehouse_id'];
        $productId = (int) $payload['product_id'];
        $quantity = $this->quantity($payload['quantity']);
        $defaultUnitCost = $this->cost($payload['unit_cost']);
        $movementDate = $payload['movement_date'];

        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity must be greater than zero.',
            ]);
        }

        $product = $this->lockProduct($tenantId, $productId);
        $this->lockWarehouse($tenantId, $warehouseId);

        $stock = $this->lockOrCreateStockPosition(
            $tenantId,
            $warehouseId,
            $productId,
            $movementDate,
            $this->quantity($payload['reorder_level'] ?? 0),
            array_key_exists('max_stock_level', $payload)
                && $payload['max_stock_level'] !== null
                    ? $this->quantity($payload['max_stock_level'])
                    : null
        );

        $quantityBefore = $this->quantity($stock->quantity);
        $averageCostBefore = $this->cost($stock->average_cost);
        $settings = $this->settings($tenantId);

        $layers = $this->normalizeIncomingLayers(
            $payload['layers'] ?? [],
            $quantity,
            $defaultUnitCost,
            $product,
            $settings,
            $movementDate
        );

        $allocations = [];
        $totalCost = 0.0;

        foreach ($layers as $layer) {
            $batchId = $this->createIncomingBatch(
                tenantId: $tenantId,
                product: $product,
                layer: $layer,
                sourceType: (string) $payload['source_type'],
                sourceReference: (string) $payload['source_reference'],
                supplierId: isset($payload['supplier_id'])
                    ? (int) $payload['supplier_id']
                    : null,
                purchaseReceiptItemId:
                    isset($payload['purchase_receipt_item_id'])
                        ? (int) $payload['purchase_receipt_item_id']
                        : null,
                userId: isset($payload['user_id'])
                    ? (int) $payload['user_id']
                    : null,
                movementDate: $movementDate,
                settings: $settings
            );

            $balance = $this->addToBatchBalance(
                $tenantId,
                $warehouseId,
                $productId,
                $batchId,
                $layer['quantity'],
                $movementDate
            );

            $layerTotal = $this->money(
                $layer['quantity'] * $layer['unit_cost']
            );

            $totalCost = $this->money($totalCost + $layerTotal);

            $allocations[] = [
                'stock_batch_id' => $batchId,
                'batch_code' => $layer['batch_code'],
                'quantity' => $layer['quantity'],
                'unit_cost' => $layer['unit_cost'],
                'total_cost' => $layerTotal,
                'batch_quantity_before' => $balance['before'],
                'batch_quantity_after' => $balance['after'],
            ];
        }

        $aggregate = $this->synchronizeStock(
            (int) $stock->id,
            $tenantId,
            $warehouseId,
            $productId,
            $movementDate
        );

        $movementUnitCost = $quantity > 0
            ? $this->cost($totalCost / $quantity)
            : 0.0;

        $movementId = $this->createMovement([
            'tenant_id' => $tenantId,
            'warehouse_id' => $warehouseId,
            'product_id' => $productId,
            'movement_type' => (string) $payload['movement_type'],
            'quantity' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $aggregate['quantity'],
            'unit_cost' => $movementUnitCost,
            'total_cost' => $totalCost,
            'average_cost_before' => $averageCostBefore,
            'average_cost_after' => $aggregate['average_cost'],
            'reference_type' => (string) $payload['reference_type'],
            'reference_id' => (int) $payload['reference_id'],
            'reference_no' => (string) $payload['reference_no'],
            'related_warehouse_id' => isset($payload['related_warehouse_id'])
                ? (int) $payload['related_warehouse_id']
                : null,
            'reversal_of_movement_id' => null,
            'remarks' => $this->nullableString($payload['remarks'] ?? null),
            'movement_date' => $movementDate,
            'created_by' => isset($payload['user_id'])
                ? (int) $payload['user_id']
                : null,
        ]);

        foreach ($allocations as &$allocation) {
            $movementBatchId = $this->createMovementBatch([
                'tenant_id' => $tenantId,
                'stock_movement_id' => $movementId,
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'stock_batch_id' => $allocation['stock_batch_id'],
                'reversal_of_stock_movement_batch_id' => null,
                'direction' => 'in',
                'quantity' => $allocation['quantity'],
                'batch_quantity_before' =>
                    $allocation['batch_quantity_before'],
                'batch_quantity_after' =>
                    $allocation['batch_quantity_after'],
                'unit_cost' => $allocation['unit_cost'],
                'total_cost' => $allocation['total_cost'],
                'created_at' => $movementDate,
            ]);

            $allocation['stock_movement_batch_id'] = $movementBatchId;

            $this->refreshBatchStatus(
                $tenantId,
                $allocation['stock_batch_id'],
                isset($payload['user_id'])
                    ? (int) $payload['user_id']
                    : null,
                (string) $payload['reference_type'],
                (int) $payload['reference_id'],
                (string) $payload['reference_no'],
                $movementDate
            );
        }
        unset($allocation);

        return [
            'stock_id' => (int) $stock->id,
            'movement_id' => $movementId,
            'quantity' => $quantity,
            'unit_cost' => $movementUnitCost,
            'total_cost' => $totalCost,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $aggregate['quantity'],
            'average_cost_before' => $averageCostBefore,
            'average_cost_after' => $aggregate['average_cost'],
            'allocations' => $allocations,
        ];
    }

    /**
     * Post an outgoing inventory transaction with FIFO, FEFO, or exact manual
     * allocations. Quantity is always stored as a positive magnitude.
     *
     * @return array{
     *     stock_id:int,
     *     movement_id:int,
     *     quantity:float,
     *     unit_cost:float,
     *     total_cost:float,
     *     quantity_before:float,
     *     quantity_after:float,
     *     average_cost_before:float,
     *     average_cost_after:float,
     *     allocations:array<int,array<string,mixed>>
     * }
     */
    public function postOutgoing(array $payload): array
    {
        $tenantId = (int) $payload['tenant_id'];
        $warehouseId = (int) $payload['warehouse_id'];
        $productId = (int) $payload['product_id'];
        $quantity = $this->quantity($payload['quantity']);
        $movementDate = $payload['movement_date'];

        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity must be greater than zero.',
            ]);
        }

        $product = $this->lockProduct($tenantId, $productId);
        $this->lockWarehouse($tenantId, $warehouseId);
        $stock = $this->lockExistingStockPosition(
            $tenantId,
            $warehouseId,
            $productId
        );

        $quantityBefore = $this->quantity($stock->quantity);
        $averageCostBefore = $this->cost($stock->average_cost);
        $settings = $this->settings($tenantId);

        if ($quantity > $quantityBefore + self::QUANTITY_TOLERANCE) {
            throw ValidationException::withMessages([
                'quantity' =>
                    'The requested quantity exceeds the available batch-reconciled warehouse stock. Negative inventory is not allowed because every outgoing unit must be assigned to an exact cost layer.',
            ]);
        }

        $allocations = $this->allocateOutgoingBatches(
            tenantId: $tenantId,
            warehouseId: $warehouseId,
            productId: $productId,
            product: $product,
            requiredQuantity: $quantity,
            manualAllocations: $payload['batch_allocations'] ?? [],
            purpose: (string) ($payload['purpose'] ?? 'issue'),
            settings: $settings
        );

        $totalCost = 0.0;

        foreach ($allocations as &$allocation) {
            $after = $this->quantity(
                $allocation['before'] - $allocation['quantity']
            );

            if ($after < -self::QUANTITY_TOLERANCE) {
                throw ValidationException::withMessages([
                    'quantity' =>
                        "Allocation for batch {$allocation['batch_code']} exceeds its locked quantity.",
                ]);
            }

            $this->database()
                ->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('id', $allocation['warehouse_batch_stock_id'])
                ->update([
                    'quantity' => max(0, $after),
                    'last_movement_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

            $allocation['after'] = max(0, $after);
            $allocation['total_cost'] = $this->money(
                $allocation['quantity'] * $allocation['unit_cost']
            );
            $totalCost = $this->money(
                $totalCost + $allocation['total_cost']
            );
        }
        unset($allocation);

        $aggregate = $this->synchronizeStock(
            (int) $stock->id,
            $tenantId,
            $warehouseId,
            $productId,
            $movementDate
        );

        $movementUnitCost = $quantity > 0
            ? $this->cost($totalCost / $quantity)
            : 0.0;

        $movementId = $this->createMovement([
            'tenant_id' => $tenantId,
            'warehouse_id' => $warehouseId,
            'product_id' => $productId,
            'movement_type' => (string) $payload['movement_type'],
            'quantity' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $aggregate['quantity'],
            'unit_cost' => $movementUnitCost,
            'total_cost' => $totalCost,
            'average_cost_before' => $averageCostBefore,
            'average_cost_after' => $aggregate['average_cost'],
            'reference_type' => (string) $payload['reference_type'],
            'reference_id' => (int) $payload['reference_id'],
            'reference_no' => (string) $payload['reference_no'],
            'related_warehouse_id' => isset($payload['related_warehouse_id'])
                ? (int) $payload['related_warehouse_id']
                : null,
            'reversal_of_movement_id' => null,
            'remarks' => $this->nullableString($payload['remarks'] ?? null),
            'movement_date' => $movementDate,
            'created_by' => isset($payload['user_id'])
                ? (int) $payload['user_id']
                : null,
        ]);

        foreach ($allocations as &$allocation) {
            $movementBatchId = $this->createMovementBatch([
                'tenant_id' => $tenantId,
                'stock_movement_id' => $movementId,
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'stock_batch_id' => $allocation['stock_batch_id'],
                'reversal_of_stock_movement_batch_id' => null,
                'direction' => 'out',
                'quantity' => $allocation['quantity'],
                'batch_quantity_before' => $allocation['before'],
                'batch_quantity_after' => $allocation['after'],
                'unit_cost' => $allocation['unit_cost'],
                'total_cost' => $allocation['total_cost'],
                'created_at' => $movementDate,
            ]);

            $allocation['stock_movement_batch_id'] = $movementBatchId;

            $this->refreshBatchStatus(
                $tenantId,
                $allocation['stock_batch_id'],
                isset($payload['user_id'])
                    ? (int) $payload['user_id']
                    : null,
                (string) $payload['reference_type'],
                (int) $payload['reference_id'],
                (string) $payload['reference_no'],
                $movementDate
            );
        }
        unset($allocation);

        return [
            'stock_id' => (int) $stock->id,
            'movement_id' => $movementId,
            'quantity' => $quantity,
            'unit_cost' => $movementUnitCost,
            'total_cost' => $totalCost,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $aggregate['quantity'],
            'average_cost_before' => $averageCostBefore,
            'average_cost_after' => $aggregate['average_cost'],
            'allocations' => $allocations,
        ];
    }

    /**
     * Reverse an already allocated movement by applying the exact opposite
     * change to every original batch allocation.
     *
     * @return array{
     *     movement_id:int,
     *     quantity:float,
     *     unit_cost:float,
     *     total_cost:float,
     *     allocations:array<int,array<string,mixed>>
     * }
     */
    public function reverseMovement(array $payload): array
    {
        $tenantId = (int) $payload['tenant_id'];
        $originalMovementId = (int) $payload['original_movement_id'];
        $movementDate = $payload['movement_date'];
        $database = $this->database();

        $original = $database
            ->table('stock_movements')
            ->where('tenant_id', $tenantId)
            ->where('id', $originalMovementId)
            ->lockForUpdate()
            ->first();

        if (! $original) {
            throw ValidationException::withMessages([
                'movement' => 'The original stock movement could not be found.',
            ]);
        }

        if (
            isset($payload['expected_reference_type'])
            && $original->reference_type
                !== (string) $payload['expected_reference_type']
        ) {
            throw ValidationException::withMessages([
                'movement' =>
                    'The original stock movement has an unexpected reference type.',
            ]);
        }

        if (
            isset($payload['expected_reference_id'])
            && (int) $original->reference_id
                !== (int) $payload['expected_reference_id']
        ) {
            throw ValidationException::withMessages([
                'movement' =>
                    'The original stock movement does not belong to this document.',
            ]);
        }

        $alreadyReversed = $database
            ->table('stock_movements')
            ->where('tenant_id', $tenantId)
            ->where('reversal_of_movement_id', $originalMovementId)
            ->exists();

        if ($alreadyReversed) {
            throw ValidationException::withMessages([
                'movement' => 'This stock movement has already been reversed.',
            ]);
        }

        $originalBatches = $database
            ->table('stock_movement_batches')
            ->where('tenant_id', $tenantId)
            ->where('stock_movement_id', $originalMovementId)
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        if ($originalBatches->isEmpty()) {
            throw ValidationException::withMessages([
                'movement' =>
                    'This legacy movement has no exact batch allocation and cannot be safely reversed. Use a controlled stock adjustment after reconciliation.',
            ]);
        }

        $allocatedQuantity = $this->quantity(
            $originalBatches->sum('quantity')
        );
        $movementQuantity = $this->quantity($original->quantity);

        if (
            abs($allocatedQuantity - $movementQuantity)
            > self::QUANTITY_TOLERANCE
        ) {
            throw ValidationException::withMessages([
                'movement' =>
                    'The original movement batch allocations do not match its quantity.',
            ]);
        }

        $stock = $this->lockExistingStockPosition(
            $tenantId,
            (int) $original->warehouse_id,
            (int) $original->product_id
        );

        $quantityBefore = $this->quantity($stock->quantity);
        $averageCostBefore = $this->cost($stock->average_cost);
        $reversalAllocations = [];
        $totalCost = 0.0;

        foreach ($originalBatches as $originalBatch) {
            $batchStock = $database
                ->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('warehouse_id', $original->warehouse_id)
                ->where('product_id', $original->product_id)
                ->where('stock_batch_id', $originalBatch->stock_batch_id)
                ->lockForUpdate()
                ->first();

            $before = $batchStock
                ? $this->quantity($batchStock->quantity)
                : 0.0;
            $quantity = $this->quantity($originalBatch->quantity);

            if ($originalBatch->direction === 'in') {
                if ($before + self::QUANTITY_TOLERANCE < $quantity) {
                    throw ValidationException::withMessages([
                        'movement' =>
                            'The received batch has already been consumed or transferred and no longer has enough quantity for an exact void.',
                    ]);
                }

                $after = $this->quantity($before - $quantity);
                $reversalDirection = 'out';
            } else {
                $after = $this->quantity($before + $quantity);
                $reversalDirection = 'in';
            }

            if ($batchStock) {
                $database
                    ->table('warehouse_batch_stocks')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $batchStock->id)
                    ->update([
                        'quantity' => max(0, $after),
                        'last_movement_at' => $movementDate,
                        'updated_at' => $movementDate,
                    ]);
            } else {
                $database
                    ->table('warehouse_batch_stocks')
                    ->insert([
                        'tenant_id' => $tenantId,
                        'warehouse_id' => (int) $original->warehouse_id,
                        'product_id' => (int) $original->product_id,
                        'stock_batch_id' =>
                            (int) $originalBatch->stock_batch_id,
                        'quantity' => max(0, $after),
                        'last_movement_at' => $movementDate,
                        'created_at' => $movementDate,
                        'updated_at' => $movementDate,
                    ]);
            }

            $lineTotal = $this->money(
                $quantity * $this->cost($originalBatch->unit_cost)
            );
            $totalCost = $this->money($totalCost + $lineTotal);

            $reversalAllocations[] = [
                'original_stock_movement_batch_id' =>
                    (int) $originalBatch->id,
                'stock_batch_id' =>
                    (int) $originalBatch->stock_batch_id,
                'direction' => $reversalDirection,
                'quantity' => $quantity,
                'batch_quantity_before' => $before,
                'batch_quantity_after' => max(0, $after),
                'unit_cost' => $this->cost($originalBatch->unit_cost),
                'total_cost' => $lineTotal,
            ];
        }

        $aggregate = $this->synchronizeStock(
            (int) $stock->id,
            $tenantId,
            (int) $original->warehouse_id,
            (int) $original->product_id,
            $movementDate
        );

        $unitCost = $movementQuantity > 0
            ? $this->cost($totalCost / $movementQuantity)
            : 0.0;

        $movementId = $this->createMovement([
            'tenant_id' => $tenantId,
            'warehouse_id' => (int) $original->warehouse_id,
            'product_id' => (int) $original->product_id,
            'movement_type' => (string) $payload['movement_type'],
            'quantity' => $movementQuantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $aggregate['quantity'],
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'average_cost_before' => $averageCostBefore,
            'average_cost_after' => $aggregate['average_cost'],
            'reference_type' => (string) $payload['reference_type'],
            'reference_id' => (int) $payload['reference_id'],
            'reference_no' => (string) $payload['reference_no'],
            'related_warehouse_id' => $original->related_warehouse_id !== null
                ? (int) $original->related_warehouse_id
                : null,
            'reversal_of_movement_id' => $originalMovementId,
            'remarks' => $this->nullableString($payload['remarks'] ?? null),
            'movement_date' => $movementDate,
            'created_by' => isset($payload['user_id'])
                ? (int) $payload['user_id']
                : null,
        ]);

        foreach ($reversalAllocations as &$allocation) {
            $allocation['stock_movement_batch_id'] =
                $this->createMovementBatch([
                    'tenant_id' => $tenantId,
                    'stock_movement_id' => $movementId,
                    'warehouse_id' => (int) $original->warehouse_id,
                    'product_id' => (int) $original->product_id,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'reversal_of_stock_movement_batch_id' =>
                        $allocation['original_stock_movement_batch_id'],
                    'direction' => $allocation['direction'],
                    'quantity' => $allocation['quantity'],
                    'batch_quantity_before' =>
                        $allocation['batch_quantity_before'],
                    'batch_quantity_after' =>
                        $allocation['batch_quantity_after'],
                    'unit_cost' => $allocation['unit_cost'],
                    'total_cost' => $allocation['total_cost'],
                    'created_at' => $movementDate,
                ]);

            $this->refreshBatchStatus(
                $tenantId,
                $allocation['stock_batch_id'],
                isset($payload['user_id'])
                    ? (int) $payload['user_id']
                    : null,
                (string) $payload['reference_type'],
                (int) $payload['reference_id'],
                (string) $payload['reference_no'],
                $movementDate
            );
        }
        unset($allocation);

        $database
            ->table('stock_movements')
            ->where('tenant_id', $tenantId)
            ->where('id', $originalMovementId)
            ->update([
                'batch_allocation_status' => 'reversed',
                'updated_at' => $movementDate,
            ]);

        return [
            'movement_id' => $movementId,
            'quantity' => $movementQuantity,
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'allocations' => $reversalAllocations,
        ];
    }

    /**
     * Move exact source batches to a destination warehouse in one atomic
     * operation. The caller creates the transfer header/item first.
     *
     * @return array<string,mixed>
     */
    public function transfer(array $payload): array
    {
        $tenantId = (int) $payload['tenant_id'];
        $fromWarehouseId = (int) $payload['from_warehouse_id'];
        $toWarehouseId = (int) $payload['to_warehouse_id'];
        $productId = (int) $payload['product_id'];
        $quantity = $this->quantity($payload['quantity']);
        $movementDate = $payload['movement_date'];

        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'Transfer quantity must be greater than zero.',
            ]);
        }

        if ($fromWarehouseId === $toWarehouseId) {
            throw ValidationException::withMessages([
                'to_warehouse_id' =>
                    'The destination warehouse must be different from the source warehouse.',
            ]);
        }

        $product = $this->lockProduct($tenantId, $productId);

        $warehouseIds = [$fromWarehouseId, $toWarehouseId];
        sort($warehouseIds, SORT_NUMERIC);

        foreach ($warehouseIds as $warehouseId) {
            $this->lockWarehouse($tenantId, $warehouseId);
        }

        if ($fromWarehouseId < $toWarehouseId) {
            $sourceStock = $this->lockExistingStockPosition(
                $tenantId,
                $fromWarehouseId,
                $productId
            );
            $destinationStock = $this->lockOrCreateStockPosition(
                $tenantId,
                $toWarehouseId,
                $productId,
                $movementDate
            );
        } else {
            $destinationStock = $this->lockOrCreateStockPosition(
                $tenantId,
                $toWarehouseId,
                $productId,
                $movementDate
            );
            $sourceStock = $this->lockExistingStockPosition(
                $tenantId,
                $fromWarehouseId,
                $productId
            );
        }

        $sourceQuantityBefore = $this->quantity($sourceStock->quantity);
        $sourceAverageBefore = $this->cost($sourceStock->average_cost);
        $destinationQuantityBefore =
            $this->quantity($destinationStock->quantity);
        $destinationAverageBefore =
            $this->cost($destinationStock->average_cost);
        $settings = $this->settings($tenantId);

        $allocations = $this->allocateOutgoingBatches(
            tenantId: $tenantId,
            warehouseId: $fromWarehouseId,
            productId: $productId,
            product: $product,
            requiredQuantity: $quantity,
            manualAllocations: $payload['batch_allocations'] ?? [],
            purpose: 'transfer',
            settings: $settings
        );

        $totalCost = 0.0;

        foreach ($allocations as &$allocation) {
            $sourceAfter = $this->quantity(
                $allocation['before'] - $allocation['quantity']
            );

            $this->database()
                ->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('id', $allocation['warehouse_batch_stock_id'])
                ->update([
                    'quantity' => max(0, $sourceAfter),
                    'last_movement_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

            $destinationBalance = $this->addToBatchBalance(
                $tenantId,
                $toWarehouseId,
                $productId,
                $allocation['stock_batch_id'],
                $allocation['quantity'],
                $movementDate
            );

            $allocation['source_after'] = max(0, $sourceAfter);
            $allocation['destination_before'] =
                $destinationBalance['before'];
            $allocation['destination_after'] =
                $destinationBalance['after'];
            $allocation['total_cost'] = $this->money(
                $allocation['quantity'] * $allocation['unit_cost']
            );
            $totalCost = $this->money(
                $totalCost + $allocation['total_cost']
            );
        }
        unset($allocation);

        $sourceAggregate = $this->synchronizeStock(
            (int) $sourceStock->id,
            $tenantId,
            $fromWarehouseId,
            $productId,
            $movementDate
        );
        $destinationAggregate = $this->synchronizeStock(
            (int) $destinationStock->id,
            $tenantId,
            $toWarehouseId,
            $productId,
            $movementDate
        );

        $unitCost = $quantity > 0
            ? $this->cost($totalCost / $quantity)
            : 0.0;

        $outMovementId = $this->createMovement([
            'tenant_id' => $tenantId,
            'warehouse_id' => $fromWarehouseId,
            'product_id' => $productId,
            'movement_type' => 'transfer_out',
            'quantity' => $quantity,
            'quantity_before' => $sourceQuantityBefore,
            'quantity_after' => $sourceAggregate['quantity'],
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'average_cost_before' => $sourceAverageBefore,
            'average_cost_after' => $sourceAggregate['average_cost'],
            'reference_type' => (string) $payload['reference_type'],
            'reference_id' => (int) $payload['reference_id'],
            'reference_no' => (string) $payload['reference_no'],
            'related_warehouse_id' => $toWarehouseId,
            'reversal_of_movement_id' => null,
            'remarks' => $this->nullableString($payload['remarks'] ?? null),
            'movement_date' => $movementDate,
            'created_by' => isset($payload['user_id'])
                ? (int) $payload['user_id']
                : null,
        ]);

        $inMovementId = $this->createMovement([
            'tenant_id' => $tenantId,
            'warehouse_id' => $toWarehouseId,
            'product_id' => $productId,
            'movement_type' => 'transfer_in',
            'quantity' => $quantity,
            'quantity_before' => $destinationQuantityBefore,
            'quantity_after' => $destinationAggregate['quantity'],
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'average_cost_before' => $destinationAverageBefore,
            'average_cost_after' => $destinationAggregate['average_cost'],
            'reference_type' => (string) $payload['reference_type'],
            'reference_id' => (int) $payload['reference_id'],
            'reference_no' => (string) $payload['reference_no'],
            'related_warehouse_id' => $fromWarehouseId,
            'reversal_of_movement_id' => null,
            'remarks' => $this->nullableString($payload['remarks'] ?? null),
            'movement_date' => $movementDate,
            'created_by' => isset($payload['user_id'])
                ? (int) $payload['user_id']
                : null,
        ]);

        foreach ($allocations as &$allocation) {
            $allocation['transfer_out_stock_movement_batch_id'] =
                $this->createMovementBatch([
                    'tenant_id' => $tenantId,
                    'stock_movement_id' => $outMovementId,
                    'warehouse_id' => $fromWarehouseId,
                    'product_id' => $productId,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'reversal_of_stock_movement_batch_id' => null,
                    'direction' => 'out',
                    'quantity' => $allocation['quantity'],
                    'batch_quantity_before' => $allocation['before'],
                    'batch_quantity_after' => $allocation['source_after'],
                    'unit_cost' => $allocation['unit_cost'],
                    'total_cost' => $allocation['total_cost'],
                    'created_at' => $movementDate,
                ]);

            $allocation['transfer_in_stock_movement_batch_id'] =
                $this->createMovementBatch([
                    'tenant_id' => $tenantId,
                    'stock_movement_id' => $inMovementId,
                    'warehouse_id' => $toWarehouseId,
                    'product_id' => $productId,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'reversal_of_stock_movement_batch_id' => null,
                    'direction' => 'in',
                    'quantity' => $allocation['quantity'],
                    'batch_quantity_before' =>
                        $allocation['destination_before'],
                    'batch_quantity_after' =>
                        $allocation['destination_after'],
                    'unit_cost' => $allocation['unit_cost'],
                    'total_cost' => $allocation['total_cost'],
                    'created_at' => $movementDate,
                ]);

            $this->refreshBatchStatus(
                $tenantId,
                $allocation['stock_batch_id'],
                isset($payload['user_id'])
                    ? (int) $payload['user_id']
                    : null,
                (string) $payload['reference_type'],
                (int) $payload['reference_id'],
                (string) $payload['reference_no'],
                $movementDate
            );
        }
        unset($allocation);

        return [
            'source_stock_id' => (int) $sourceStock->id,
            'destination_stock_id' => (int) $destinationStock->id,
            'out_movement_id' => $outMovementId,
            'in_movement_id' => $inMovementId,
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'allocations' => $allocations,
        ];
    }

    /**
     * @return Collection<int,object>
     */
    public function eligibleBatches(
        int $tenantId,
        int $warehouseId,
        int $productId,
        string $purpose = 'issue'
    ): Collection {
        $product = $this->database()
            ->table('products')
            ->where('tenant_id', $tenantId)
            ->where('id', $productId)
            ->first();

        if (! $product) {
            return collect();
        }

        return $this->eligibleBatchQuery(
            $tenantId,
            $warehouseId,
            $productId,
            $product,
            $purpose,
            $this->settings($tenantId)
        )->get();
    }

    /** @return array<int,array<string,mixed>> */
    private function normalizeIncomingLayers(
        array $rawLayers,
        float $totalQuantity,
        float $defaultUnitCost,
        object $product,
        array $settings,
        CarbonInterface $movementDate
    ): array {
        if ($rawLayers === []) {
            $rawLayers = [[
                'quantity' => $totalQuantity,
                'unit_cost' => $defaultUnitCost,
            ]];
        }

        $layers = [];

        foreach ($rawLayers as $index => $rawLayer) {
            $quantity = $this->quantity($rawLayer['quantity'] ?? 0);
            $unitCost = array_key_exists('unit_cost', $rawLayer)
                && $rawLayer['unit_cost'] !== null
                && $rawLayer['unit_cost'] !== ''
                    ? $this->cost($rawLayer['unit_cost'])
                    : $defaultUnitCost;

            if ($quantity <= 0) {
                throw ValidationException::withMessages([
                    "layers.{$index}.quantity" =>
                        'Every incoming batch quantity must be greater than zero.',
                ]);
            }

            $batchCode = $this->nullableUppercaseString(
                $rawLayer['batch_code'] ?? null
            );
            $manufacturedDate = $this->nullableString(
                $rawLayer['manufactured_date'] ?? null
            );
            $expirationDate = $this->nullableString(
                $rawLayer['expiration_date'] ?? null
            );
            $receivedDate = $this->nullableString(
                $rawLayer['received_date'] ?? null
            ) ?? $movementDate->toDateString();

            if (
                (bool) $product->batch_tracking_enabled
                && ! $settings['auto_generate_batch_code']
                && $batchCode === null
            ) {
                throw ValidationException::withMessages([
                    "layers.{$index}.batch_code" =>
                        'A batch code is required because automatic batch code generation is disabled.',
                ]);
            }

            if (
                (bool) $product->batch_tracking_enabled
                && (bool) $product->requires_expiration_date
                && $expirationDate === null
            ) {
                throw ValidationException::withMessages([
                    "layers.{$index}.expiration_date" =>
                        'An expiration date is required for this product.',
                ]);
            }

            if (
                $manufacturedDate !== null
                && $expirationDate !== null
                && $expirationDate < $manufacturedDate
            ) {
                throw ValidationException::withMessages([
                    "layers.{$index}.expiration_date" =>
                        'The expiration date must be on or after the manufactured date.',
                ]);
            }

            $layers[] = [
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'batch_code' => $batchCode,
                'lot_number' => $this->nullableString(
                    $rawLayer['lot_number'] ?? null
                ),
                'received_date' => $receivedDate,
                'manufactured_date' => (bool) $product->batch_tracking_enabled
                    ? $manufacturedDate
                    : null,
                'expiration_date' => (bool) $product->batch_tracking_enabled
                    ? $expirationDate
                    : null,
                'notes' => $this->nullableString(
                    $rawLayer['notes'] ?? $rawLayer['batch_notes'] ?? null
                ),
            ];
        }

        $layerTotal = $this->quantity(
            collect($layers)->sum('quantity')
        );

        if (
            abs($layerTotal - $totalQuantity)
            > self::QUANTITY_TOLERANCE
        ) {
            throw ValidationException::withMessages([
                'layers' =>
                    'The incoming batch quantities must exactly match the received quantity.',
            ]);
        }

        return $layers;
    }

    private function createIncomingBatch(
        int $tenantId,
        object $product,
        array &$layer,
        string $sourceType,
        string $sourceReference,
        ?int $supplierId,
        ?int $purchaseReceiptItemId,
        ?int $userId,
        CarbonInterface $movementDate,
        array $settings
    ): int {
        $database = $this->database();
        $batchCode = $layer['batch_code']
            ?? $this->generateBatchCode($tenantId, $settings);

        if (
            $database
                ->table('stock_batches')
                ->where('tenant_id', $tenantId)
                ->where('batch_code', $batchCode)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'batch_code' =>
                    "Batch code {$batchCode} is already in use for this account.",
            ]);
        }

        $layer['batch_code'] = $batchCode;

        $status = $layer['expiration_date'] !== null
            && $layer['expiration_date'] < now()->toDateString()
                ? 'expired'
                : 'active';

        return $database
            ->table('stock_batches')
            ->insertGetId([
                'tenant_id' => $tenantId,
                'product_id' => (int) $product->id,
                'supplier_id' => $supplierId,
                'purchase_receipt_item_id' => $purchaseReceiptItemId,
                'batch_code' => $batchCode,
                'lot_number' => (bool) $product->batch_tracking_enabled
                    ? $layer['lot_number']
                    : null,
                'source_type' => $sourceType,
                'source_reference' => $sourceReference,
                'received_date' => $layer['received_date'],
                'manufactured_date' => $layer['manufactured_date'],
                'expiration_date' => $layer['expiration_date'],
                'unit_cost' => $layer['unit_cost'],
                'original_quantity' => $layer['quantity'],
                'status' => $status,
                'notes' => (bool) $product->batch_tracking_enabled
                    ? $layer['notes']
                    : 'System-generated internal cost layer for a non-batch-managed product.',
                'created_by' => $userId,
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);
    }

    /** @return array<int,array<string,mixed>> */
    private function allocateOutgoingBatches(
        int $tenantId,
        int $warehouseId,
        int $productId,
        object $product,
        float $requiredQuantity,
        array $manualAllocations,
        string $purpose,
        array $settings
    ): array {
        $availableRows = $this->eligibleBatchQuery(
            $tenantId,
            $warehouseId,
            $productId,
            $product,
            $purpose,
            $settings
        )
            ->lockForUpdate()
            ->get();

        $policy = (bool) $product->batch_tracking_enabled
            ? (string) $product->batch_issue_policy
            : 'fifo';

        if ($policy === 'manual' && (bool) $product->batch_tracking_enabled) {
            return $this->buildManualAllocations(
                $availableRows,
                $manualAllocations,
                $requiredQuantity
            );
        }

        $remaining = $requiredQuantity;
        $allocations = [];

        foreach ($availableRows as $row) {
            if ($remaining <= self::QUANTITY_TOLERANCE) {
                break;
            }

            $available = $this->quantity($row->available_quantity);
            $allocated = min($available, $remaining);

            if ($allocated <= 0) {
                continue;
            }

            $allocations[] = [
                'warehouse_batch_stock_id' =>
                    (int) $row->warehouse_batch_stock_id,
                'stock_batch_id' => (int) $row->stock_batch_id,
                'batch_code' => (string) $row->batch_code,
                'quantity' => $this->quantity($allocated),
                'before' => $available,
                'unit_cost' => $this->cost($row->unit_cost),
            ];

            $remaining = $this->quantity($remaining - $allocated);
        }

        if ($remaining > self::QUANTITY_TOLERANCE) {
            throw ValidationException::withMessages([
                'quantity' => $purpose === 'expired'
                    ? 'The requested quantity is greater than the available expired batch stock.'
                    : 'The requested quantity is greater than the eligible batch stock.',
            ]);
        }

        return $allocations;
    }

    private function eligibleBatchQuery(
        int $tenantId,
        int $warehouseId,
        int $productId,
        object $product,
        string $purpose,
        array $settings
    ) {
        $query = $this->database()
            ->table('warehouse_batch_stocks as wbs')
            ->join('stock_batches as sb', function ($join): void {
                $join
                    ->on('sb.tenant_id', '=', 'wbs.tenant_id')
                    ->on('sb.id', '=', 'wbs.stock_batch_id')
                    ->on('sb.product_id', '=', 'wbs.product_id');
            })
            ->where('wbs.tenant_id', $tenantId)
            ->where('wbs.warehouse_id', $warehouseId)
            ->where('wbs.product_id', $productId)
            ->where('wbs.quantity', '>', 0)
            ->whereNotIn('sb.status', ['quarantined', 'recalled', 'closed'])
            ->select([
                'wbs.id as warehouse_batch_stock_id',
                'wbs.stock_batch_id',
                'wbs.quantity as available_quantity',
                'sb.batch_code',
                'sb.lot_number',
                'sb.received_date',
                'sb.expiration_date',
                'sb.unit_cost',
                'sb.status',
            ]);

        if ($purpose === 'expired') {
            $query->where(function ($query): void {
                $query
                    ->where('sb.status', 'expired')
                    ->orWhereDate(
                        'sb.expiration_date',
                        '<',
                        now()->toDateString()
                    );
            });
        } elseif (
            ! $settings['allow_expired_issue']
            && ! in_array($purpose, ['damage', 'return_out'], true)
        ) {
            $query
                ->where('sb.status', '!=', 'expired')
                ->where(function ($query): void {
                    $query
                        ->whereNull('sb.expiration_date')
                        ->orWhereDate(
                            'sb.expiration_date',
                            '>=',
                            now()->toDateString()
                        );
                });
        }

        $policy = (bool) $product->batch_tracking_enabled
            ? (string) $product->batch_issue_policy
            : 'fifo';

        if ($policy === 'fefo') {
            $query
                ->orderByRaw(
                    'CASE WHEN sb.expiration_date IS NULL THEN 1 ELSE 0 END'
                )
                ->orderBy('sb.expiration_date')
                ->orderBy('sb.received_date')
                ->orderBy('sb.id');
        } else {
            $query
                ->orderBy('sb.received_date')
                ->orderBy('sb.id');
        }

        return $query;
    }

    /** @return array<int,array<string,mixed>> */
    private function buildManualAllocations(
        Collection $availableRows,
        array $manualAllocations,
        float $requiredQuantity
    ): array {
        $normalized = collect($manualAllocations)
            ->map(fn (array $allocation): array => [
                'stock_batch_id' =>
                    (int) ($allocation['stock_batch_id'] ?? 0),
                'quantity' =>
                    $this->quantity($allocation['quantity'] ?? 0),
            ])
            ->filter(
                fn (array $allocation): bool =>
                    $allocation['stock_batch_id'] > 0
                    && $allocation['quantity'] > 0
            )
            ->values();

        if ($normalized->isEmpty()) {
            throw ValidationException::withMessages([
                'batch_allocations' =>
                    'Select at least one batch and enter its allocation quantity.',
            ]);
        }

        if ($normalized->pluck('stock_batch_id')->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages([
                'batch_allocations' =>
                    'The same batch may only be selected once.',
            ]);
        }

        $allocatedTotal = $this->quantity($normalized->sum('quantity'));

        if (
            abs($allocatedTotal - $requiredQuantity)
            > self::QUANTITY_TOLERANCE
        ) {
            throw ValidationException::withMessages([
                'batch_allocations' =>
                    'Manual batch allocations must exactly match the requested quantity.',
            ]);
        }

        $availableByBatch = $availableRows->keyBy(
            fn ($row): int => (int) $row->stock_batch_id
        );

        return $normalized
            ->map(function (array $allocation) use ($availableByBatch): array {
                $row = $availableByBatch->get(
                    $allocation['stock_batch_id']
                );

                if (! $row) {
                    throw ValidationException::withMessages([
                        'batch_allocations' =>
                            'One of the selected batches is unavailable or not eligible.',
                    ]);
                }

                $available = $this->quantity($row->available_quantity);

                if (
                    $allocation['quantity']
                    > $available + self::QUANTITY_TOLERANCE
                ) {
                    throw ValidationException::withMessages([
                        'batch_allocations' =>
                            "Allocation for batch {$row->batch_code} exceeds its available quantity.",
                    ]);
                }

                return [
                    'warehouse_batch_stock_id' =>
                        (int) $row->warehouse_batch_stock_id,
                    'stock_batch_id' => (int) $row->stock_batch_id,
                    'batch_code' => (string) $row->batch_code,
                    'quantity' => $allocation['quantity'],
                    'before' => $available,
                    'unit_cost' => $this->cost($row->unit_cost),
                ];
            })
            ->all();
    }

    /** @return array{before:float,after:float} */
    private function addToBatchBalance(
        int $tenantId,
        int $warehouseId,
        int $productId,
        int $batchId,
        float $quantity,
        CarbonInterface $movementDate
    ): array {
        $database = $this->database();

        $row = $database
            ->table('warehouse_batch_stocks')
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->where('stock_batch_id', $batchId)
            ->lockForUpdate()
            ->first();

        $before = $row ? $this->quantity($row->quantity) : 0.0;
        $after = $this->quantity($before + $quantity);

        if ($row) {
            $database
                ->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('id', $row->id)
                ->update([
                    'quantity' => $after,
                    'last_movement_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);
        } else {
            $database
                ->table('warehouse_batch_stocks')
                ->insert([
                    'tenant_id' => $tenantId,
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'stock_batch_id' => $batchId,
                    'quantity' => $after,
                    'last_movement_at' => $movementDate,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);
        }

        return ['before' => $before, 'after' => $after];
    }

    /** @return array{quantity:float,average_cost:float,total_value:float} */
    private function synchronizeStock(
        int $stockId,
        int $tenantId,
        int $warehouseId,
        int $productId,
        CarbonInterface $movementDate
    ): array {
        $database = $this->database();

        $totals = $database
            ->table('warehouse_batch_stocks as wbs')
            ->join('stock_batches as sb', function ($join): void {
                $join
                    ->on('sb.tenant_id', '=', 'wbs.tenant_id')
                    ->on('sb.id', '=', 'wbs.stock_batch_id')
                    ->on('sb.product_id', '=', 'wbs.product_id');
            })
            ->where('wbs.tenant_id', $tenantId)
            ->where('wbs.warehouse_id', $warehouseId)
            ->where('wbs.product_id', $productId)
            ->selectRaw(
                'COALESCE(SUM(wbs.quantity), 0) AS total_quantity,
                 COALESCE(SUM(wbs.quantity * sb.unit_cost), 0) AS total_value'
            )
            ->first();

        $quantity = $this->quantity($totals->total_quantity ?? 0);
        $totalValue = (float) ($totals->total_value ?? 0);
        $averageCost = $quantity > 0
            ? $this->cost($totalValue / $quantity)
            : 0.0;

        $database
            ->table('warehouse_stocks')
            ->where('tenant_id', $tenantId)
            ->where('id', $stockId)
            ->update([
                'quantity' => $quantity,
                'average_cost' => $averageCost,
                'last_movement_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

        return [
            'quantity' => $quantity,
            'average_cost' => $averageCost,
            'total_value' => $this->money($totalValue),
        ];
    }

    private function createMovement(array $data): int
    {
        return $this->database()
            ->table('stock_movements')
            ->insertGetId([
                'tenant_id' => $data['tenant_id'],
                'warehouse_id' => $data['warehouse_id'],
                'product_id' => $data['product_id'],
                'is_batch_tracked' => true,
                'batch_allocation_status' => 'allocated',
                'movement_type' => $data['movement_type'],
                'quantity' => $this->quantity(abs((float) $data['quantity'])),
                'quantity_before' => $data['quantity_before'],
                'quantity_after' => $data['quantity_after'],
                'unit_cost' => $data['unit_cost'],
                'total_cost' => $data['total_cost'],
                'average_cost_before' => $data['average_cost_before'],
                'average_cost_after' => $data['average_cost_after'],
                'reference_type' => $data['reference_type'],
                'reference_id' => $data['reference_id'],
                'reference_no' => $data['reference_no'],
                'related_warehouse_id' => $data['related_warehouse_id'],
                'reversal_of_movement_id' =>
                    $data['reversal_of_movement_id'],
                'remarks' => $data['remarks'],
                'movement_date' => $data['movement_date'],
                'created_by' => $data['created_by'],
                'created_at' => $data['movement_date'],
                'updated_at' => $data['movement_date'],
            ]);
    }

    private function createMovementBatch(array $data): int
    {
        return $this->database()
            ->table('stock_movement_batches')
            ->insertGetId([
                'tenant_id' => $data['tenant_id'],
                'stock_movement_id' => $data['stock_movement_id'],
                'warehouse_id' => $data['warehouse_id'],
                'product_id' => $data['product_id'],
                'stock_batch_id' => $data['stock_batch_id'],
                'reversal_of_stock_movement_batch_id' =>
                    $data['reversal_of_stock_movement_batch_id'],
                'direction' => $data['direction'],
                'quantity' => $this->quantity($data['quantity']),
                'batch_quantity_before' =>
                    $this->quantity($data['batch_quantity_before']),
                'batch_quantity_after' =>
                    $this->quantity($data['batch_quantity_after']),
                'unit_cost' => $this->cost($data['unit_cost']),
                'total_cost' => $this->money($data['total_cost']),
                'created_at' => $data['created_at'],
                'updated_at' => $data['created_at'],
            ]);
    }

    private function refreshBatchStatus(
        int $tenantId,
        int $batchId,
        ?int $userId,
        string $referenceType,
        int $referenceId,
        string $referenceNo,
        CarbonInterface $changedAt
    ): void {
        $database = $this->database();

        $batch = $database
            ->table('stock_batches')
            ->where('tenant_id', $tenantId)
            ->where('id', $batchId)
            ->lockForUpdate()
            ->first();

        if (! $batch) {
            return;
        }

        if (
            in_array(
                $batch->status,
                ['quarantined', 'recalled', 'closed'],
                true
            )
        ) {
            return;
        }

        $totalQuantity = $this->quantity(
            $database
                ->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('stock_batch_id', $batchId)
                ->sum('quantity')
        );

        $newStatus = $totalQuantity <= self::QUANTITY_TOLERANCE
            ? 'depleted'
            : (
                $batch->expiration_date !== null
                && $batch->expiration_date < now()->toDateString()
                    ? 'expired'
                    : 'active'
            );

        if ($newStatus === $batch->status) {
            return;
        }

        $database
            ->table('stock_batches')
            ->where('tenant_id', $tenantId)
            ->where('id', $batchId)
            ->update([
                'status' => $newStatus,
                'updated_at' => $changedAt,
            ]);

        $database
            ->table('stock_batch_status_histories')
            ->insert([
                'tenant_id' => $tenantId,
                'stock_batch_id' => $batchId,
                'previous_status' => $batch->status,
                'new_status' => $newStatus,
                'reason' =>
                    'Status synchronized from the remaining warehouse batch quantity.',
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'reference_no' => $referenceNo,
                'changed_by' => $userId,
                'changed_at' => $changedAt,
                'created_at' => $changedAt,
                'updated_at' => $changedAt,
            ]);
    }

    private function generateBatchCode(
        int $tenantId,
        array $settings
    ): string {
        $prefix = Str::upper(
            preg_replace(
                '/[^A-Za-z0-9]/',
                '',
                (string) $settings['batch_code_prefix']
            ) ?: 'BAT'
        );

        do {
            $code = sprintf(
                '%s-%s-%s',
                $prefix,
                now()->format('Ymd'),
                Str::upper(
                    Str::random(
                        (int) $settings['batch_code_sequence_padding']
                    )
                )
            );
        } while (
            $this->database()
                ->table('stock_batches')
                ->where('tenant_id', $tenantId)
                ->where('batch_code', $code)
                ->exists()
        );

        return $code;
    }

    public function quantity(mixed $value): float
    {
        return round((float) $value, 3);
    }

    public function cost(mixed $value): float
    {
        return round((float) $value, 4);
    }

    public function money(mixed $value): float
    {
        return round((float) $value, 2);
    }

    public function nullableString(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));

        return $value !== '' ? $value : null;
    }

    private function nullableUppercaseString(mixed $value): ?string
    {
        $value = $this->nullableString($value);

        return $value !== null ? Str::upper($value) : null;
    }
}
