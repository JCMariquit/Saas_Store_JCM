<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Services\Inventory\InventoryAccessContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    /**
     * Inventory movements that increase warehouse stock.
     */
    private const INCOMING_TYPES = [
        'opening_stock',
        'stock_in',
        'adjustment_in',
        'return_in',
        'transfer_in',
        'purchase_receipt',
        'stock_issuance_void',
        'issuance_void',
    ];

    /**
     * Inventory movements that decrease warehouse stock.
     */
    private const OUTGOING_TYPES = [
        'stock_out',
        'adjustment_out',
        'return_out',
        'damage',
        'expired',
        'transfer_out',
        'sale',
        'stock_issuance',
        'issuance',
        'purchase_receipt_void',
    ];

    /**
     * Labels used by the movement filter and movement cards.
     */
    private const MOVEMENT_LABELS = [
        'opening_stock' => 'Opening Stock',
        'stock_in' => 'Stock In',
        'stock_out' => 'Stock Out',
        'adjustment_in' => 'Adjustment In',
        'adjustment_out' => 'Adjustment Out',
        'return_in' => 'Return In',
        'return_out' => 'Return Out',
        'damage' => 'Damaged Stock',
        'expired' => 'Expired Stock',
        'transfer_in' => 'Transfer In',
        'transfer_out' => 'Transfer Out',
        'purchase_receipt' => 'Purchase Receipt',
        'purchase_receipt_void' => 'Purchase Receipt Reversal',
        'stock_issuance' => 'Stock Withdrawal',
        'stock_issuance_void' => 'Withdrawal Reversal',
        'issuance' => 'Stock Withdrawal',
        'issuance_void' => 'Withdrawal Reversal',
        'sale' => 'Sale',
    ];

    public function __construct(
        private readonly InventoryAccessContext $access
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Stock Movement History
    |--------------------------------------------------------------------------
    |
    | Read-only page ito.
    |
    | Ang movement records ay manggagaling sa:
    | - Opening stock
    | - Stock in
    | - Stock out
    | - Adjustment 
    | - Transfer
    | - Sale
    | - Return
    | - Damage
    | - Expired stock
    |
    */

    public function index(Request $request): Response
    {
        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $branchId = $context['branch_id'];

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input('search', '')
        );

        $movementType = trim(
            (string) $request->input(
                'movement_type',
                ''
            )
        );

        $direction = trim(
            (string) $request->input(
                'direction',
                ''
            )
        );

        $warehouseId = (int) $request->input(
            'warehouse_id',
            0
        );

        $dateFrom = $this->validDate(
            (string) $request->input(
                'date_from',
                ''
            )
        );

        $dateTo = $this->validDate(
            (string) $request->input(
                'date_to',
                ''
            )
        );

        /*
        |--------------------------------------------------------------------------
        | Movement Query
        |--------------------------------------------------------------------------
        */

        $movements = StockMovement::query()
            ->forTenant($tenantId)

            ->leftJoin(
                'products as products',
                function ($join): void {
                    $join
                        ->on(
                            'products.id',
                            '=',
                            'stock_movements.product_id'
                        )
                        ->on(
                            'products.tenant_id',
                            '=',
                            'stock_movements.tenant_id'
                        );
                }
            )

            ->leftJoin(
                'warehouses as warehouses',
                function ($join): void {
                    $join
                        ->on(
                            'warehouses.id',
                            '=',
                            'stock_movements.warehouse_id'
                        )
                        ->on(
                            'warehouses.tenant_id',
                            '=',
                            'stock_movements.tenant_id'
                        );
                }
            )

            ->leftJoin(
                'warehouses as related_warehouses',
                function ($join): void {
                    $join
                        ->on(
                            'related_warehouses.id',
                            '=',
                            'stock_movements.related_warehouse_id'
                        )
                        ->on(
                            'related_warehouses.tenant_id',
                            '=',
                            'stock_movements.tenant_id'
                        );
                }
            )

            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'warehouses.branch_id',
                    $branchId
                )
            )

            /*
             * Search:
             * product, SKU, barcode, warehouse,
             * reference number, or remarks.
             */
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(
                        function ($searchQuery) use (
                            $search
                        ): void {
                            $like = "%{$search}%";

                            $searchQuery
                                ->where(
                                    'products.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'products.sku',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'products.barcode',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'warehouses.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'warehouses.code',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'related_warehouses.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_movements.reference_no',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_movements.remarks',
                                    'like',
                                    $like
                                );
                        }
                    );
                }
            )

            /*
             * Filter by exact movement type.
             */
            ->when(
                array_key_exists(
                    $movementType,
                    self::MOVEMENT_LABELS
                ),
                fn ($query) => $query->where(
                    'stock_movements.movement_type',
                    $movementType
                )
            )

            /*
             * Incoming or outgoing filter.
             */
            ->when(
                $direction === 'in',
                fn ($query) => $query->whereIn(
                    'stock_movements.movement_type',
                    self::INCOMING_TYPES
                )
            )

            ->when(
                $direction === 'out',
                fn ($query) => $query->whereIn(
                    'stock_movements.movement_type',
                    self::OUTGOING_TYPES
                )
            )

            /*
             * Warehouse filter.
             */
            ->when(
                $warehouseId > 0,
                fn ($query) => $query->where(
                    'stock_movements.warehouse_id',
                    $warehouseId
                )
            )

            /*
             * Date range filters.
             */
            ->when(
                $dateFrom !== null,
                fn ($query) => $query->whereDate(
                    'stock_movements.movement_date',
                    '>=',
                    $dateFrom
                )
            )

            ->when(
                $dateTo !== null,
                fn ($query) => $query->whereDate(
                    'stock_movements.movement_date',
                    '<=',
                    $dateTo
                )
            )

            ->select([
                'stock_movements.id',
                'stock_movements.tenant_id',
                'stock_movements.warehouse_id',
                'stock_movements.product_id',
                'stock_movements.is_batch_tracked',
                'stock_movements.batch_allocation_status',
                'stock_movements.movement_type',
                'stock_movements.quantity',
                'stock_movements.quantity_before',
                'stock_movements.quantity_after',
                'stock_movements.unit_cost',
                'stock_movements.total_cost',
                'stock_movements.average_cost_before',
                'stock_movements.average_cost_after',
                'stock_movements.reference_type',
                'stock_movements.reference_id',
                'stock_movements.reference_no',
                'stock_movements.related_warehouse_id',
                'stock_movements.reversal_of_movement_id',
                'stock_movements.remarks',
                'stock_movements.movement_date',
                'stock_movements.created_by',
                'stock_movements.created_at',

                'products.name as product_name',
                'products.sku as product_sku',
                'products.barcode as product_barcode',
                'products.unit as product_unit',

                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',

                'related_warehouses.name as related_warehouse_name',
                'related_warehouses.code as related_warehouse_code',
            ])

            ->orderByDesc(
                'stock_movements.movement_date'
            )
            ->orderByDesc(
                'stock_movements.id'
            )
            ->paginate(15)
            ->withQueryString();

        $movementIds = $movements
            ->getCollection()
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->values();

        $movementBatches = $movementIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table('stock_movement_batches as allocation')
                ->join('stock_batches as batch', function ($join): void {
                    $join
                        ->on('batch.id', '=', 'allocation.stock_batch_id')
                        ->on('batch.tenant_id', '=', 'allocation.tenant_id');
                })
                ->where('allocation.tenant_id', $tenantId)
                ->whereIn('allocation.stock_movement_id', $movementIds)
                ->orderBy('allocation.id')
                ->get([
                    'allocation.id',
                    'allocation.stock_movement_id',
                    'allocation.stock_batch_id',
                    'allocation.reversal_of_stock_movement_batch_id',
                    'allocation.direction',
                    'allocation.quantity',
                    'allocation.batch_quantity_before',
                    'allocation.batch_quantity_after',
                    'allocation.unit_cost',
                    'allocation.total_cost',
                    'batch.batch_code',
                    'batch.lot_number',
                    'batch.received_date',
                    'batch.expiration_date',
                    'batch.status as batch_status',
                ])
                ->groupBy('stock_movement_id');

        /*
        |--------------------------------------------------------------------------
        | Get SaaS User Names
        |--------------------------------------------------------------------------
        |
        | created_by contains the ID from jcm_saas_db.users.
        | Walang cross-database foreign key.
        |
        */

        $creatorIds = $movements
            ->getCollection()
            ->pluck('created_by')
            ->filter()
            ->map(
                fn ($userId): int => (int) $userId
            )
            ->unique()
            ->values();

        $creators = $creatorIds->isEmpty()
            ? collect()
            : DB::connection('saas')
                ->table('users')
                ->whereIn('id', $creatorIds)
                ->get([
                    'id',
                    'name',
                    'email',
                ])
                ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Format Movement Records
        |--------------------------------------------------------------------------
        */

        $movements->setCollection(
            $movements
                ->getCollection()
                ->map(
                    function (
                        StockMovement $movement
                    ) use ($creators, $movementBatches): array {
                        $creator = $movement->created_by
                            ? $creators->get(
                                (int) $movement->created_by
                            )
                            : null;

                        return [
                            'id' => (int) $movement->id,

                            'product' => [
                                'id' => (int) $movement
                                    ->product_id,

                                'name' => $movement
                                    ->product_name
                                    ?? 'Deleted product',

                                'sku' => $movement
                                    ->product_sku,

                                'barcode' => $movement
                                    ->product_barcode,

                                'unit' => $movement
                                    ->product_unit
                                    ?? 'unit',
                            ],

                            'warehouse' => [
                                'id' => (int) $movement
                                    ->warehouse_id,

                                'name' => $movement
                                    ->warehouse_name
                                    ?? 'Deleted warehouse',

                                'code' => $movement
                                    ->warehouse_code,
                            ],

                            'related_warehouse' =>
                                $movement
                                    ->related_warehouse_id
                                    ? [
                                        'id' => (int) $movement
                                            ->related_warehouse_id,

                                        'name' => $movement
                                            ->related_warehouse_name
                                            ?? 'Deleted warehouse',

                                        'code' => $movement
                                            ->related_warehouse_code,
                                    ]
                                    : null,

                            'is_batch_tracked' =>
                                (bool) $movement->is_batch_tracked,

                            'batch_allocation_status' =>
                                $movement->batch_allocation_status,

                            'movement_type' =>
                                $movement->movement_type,

                            'movement_label' =>
                                $this->movementLabel(
                                    (string) $movement->movement_type
                                ),

                            'direction' =>
                                $this->movementDirection(
                                    (string) $movement->movement_type,
                                    (float) $movement->quantity_before,
                                    (float) $movement->quantity_after
                                ),

                            'quantity' =>
                                abs((float) $movement->quantity),

                            'quantity_before' =>
                                (float) $movement
                                    ->quantity_before,

                            'quantity_after' =>
                                (float) $movement
                                    ->quantity_after,

                            'unit_cost' =>
                                (float) $movement->unit_cost,

                            'total_cost' =>
                                (float) $movement->total_cost,

                            'average_cost_before' =>
                                $movement->average_cost_before !== null
                                    ? (float) $movement->average_cost_before
                                    : null,

                            'average_cost_after' =>
                                $movement->average_cost_after !== null
                                    ? (float) $movement->average_cost_after
                                    : null,

                            'reference_type' =>
                                $movement->reference_type,

                            'reference_id' =>
                                $movement->reference_id
                                    ? (int) $movement
                                        ->reference_id
                                    : null,

                            'reference_no' =>
                                $movement->reference_no,

                            'reversal_of_movement_id' =>
                                $movement->reversal_of_movement_id
                                    ? (int) $movement->reversal_of_movement_id
                                    : null,

                            'remarks' =>
                                $movement->remarks,

                            'batches' => $movementBatches
                                ->get((int) $movement->id, collect())
                                ->map(fn ($allocation): array => [
                                    'id' => (int) $allocation->id,
                                    'stock_batch_id' =>
                                        (int) $allocation->stock_batch_id,
                                    'batch_code' => $allocation->batch_code,
                                    'lot_number' => $allocation->lot_number,
                                    'direction' => $allocation->direction,
                                    'quantity' =>
                                        (float) $allocation->quantity,
                                    'batch_quantity_before' =>
                                        (float) $allocation->batch_quantity_before,
                                    'batch_quantity_after' =>
                                        (float) $allocation->batch_quantity_after,
                                    'unit_cost' =>
                                        (float) $allocation->unit_cost,
                                    'total_cost' =>
                                        (float) $allocation->total_cost,
                                    'received_date' =>
                                        $allocation->received_date,
                                    'expiration_date' =>
                                        $allocation->expiration_date,
                                    'batch_status' =>
                                        $allocation->batch_status,
                                    'reversal_of_stock_movement_batch_id' =>
                                        $allocation->reversal_of_stock_movement_batch_id
                                            ? (int) $allocation->reversal_of_stock_movement_batch_id
                                            : null,
                                ])
                                ->values()
                                ->all(),

                            'movement_date' =>
                                $movement->movement_date
                                    ?->toISOString(),

                            'created_by' =>
                                $movement->created_by
                                    ? [
                                        'id' => (int) $movement
                                            ->created_by,

                                        'name' => $creator
                                            ->name
                                            ?? 'User #'
                                            .$movement
                                                ->created_by,

                                        'email' => $creator
                                            ->email
                                            ?? null,
                                    ]
                                    : null,
                        ];
                    }
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $summaryQuery = StockMovement::query()
            ->forTenant($tenantId)
            ->join('warehouses as summary_warehouses', function ($join): void {
                $join
                    ->on(
                        'summary_warehouses.id',
                        '=',
                        'stock_movements.warehouse_id'
                    )
                    ->on(
                        'summary_warehouses.tenant_id',
                        '=',
                        'stock_movements.tenant_id'
                    );
            })
            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'summary_warehouses.branch_id',
                    $branchId
                )
            );

        $summary = [
            'total' => (clone $summaryQuery)
                ->count(),

            'incoming_quantity' =>
                (float) ((clone $summaryQuery)
                    ->whereIn(
                        'stock_movements.movement_type',
                        self::INCOMING_TYPES
                    )
                    ->selectRaw(
                        'COALESCE(SUM(ABS(stock_movements.quantity)), 0) AS aggregate_quantity'
                    )
                    ->value('aggregate_quantity') ?? 0),

            'outgoing_quantity' =>
                (float) ((clone $summaryQuery)
                    ->whereIn(
                        'stock_movements.movement_type',
                        self::OUTGOING_TYPES
                    )
                    ->selectRaw(
                        'COALESCE(SUM(ABS(stock_movements.quantity)), 0) AS aggregate_quantity'
                    )
                    ->value('aggregate_quantity') ?? 0),

            'affected_products' =>
                (clone $summaryQuery)
                    ->distinct()
                    ->count('stock_movements.product_id'),
        ];

        /*
        |--------------------------------------------------------------------------
        | Warehouse Filter Options
        |--------------------------------------------------------------------------
        */

        $warehouses = DB::connection('mysql')
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->when(
                $branchId !== null,
                fn ($query) => $query->where('branch_id', $branchId)
            )
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Movement Type Options
        |--------------------------------------------------------------------------
        */

        $movementTypes = collect(
            self::MOVEMENT_LABELS
        )
            ->map(
                fn (
                    string $label,
                    string $value
                ): array => [
                    'value' => $value,
                    'label' => $label,
                ]
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Render Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'inventory/stock-movements/index',
            [
                'movements' => $movements,

                'summary' => $summary,

                'warehouses' => $warehouses,

                'movement_types' =>
                    $movementTypes,

                'filters' => [
                    'search' => $search,

                    'movement_type' =>
                        $movementType,

                    'direction' => $direction,

                    'warehouse_id' =>
                        $warehouseId > 0
                            ? (string) $warehouseId
                            : '',

                    'date_from' =>
                        $dateFrom ?? '',

                    'date_to' =>
                        $dateTo ?? '',
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Movement Presentation Helpers
    |--------------------------------------------------------------------------
    */

    private function movementDirection(
        string $movementType,
        float $quantityBefore,
        float $quantityAfter
    ): string {
        // The recorded balance change is the strongest source of truth.
        // This prevents a newly added movement type from being displayed with
        // the wrong sign merely because it was missing from a label list.
        if ($quantityAfter > $quantityBefore + 0.0001) {
            return 'in';
        }

        if ($quantityAfter < $quantityBefore - 0.0001) {
            return 'out';
        }

        if (in_array($movementType, self::INCOMING_TYPES, true)) {
            return 'in';
        }

        if (in_array($movementType, self::OUTGOING_TYPES, true)) {
            return 'out';
        }

        // The current UI accepts only in/out. Unknown zero-delta movements
        // default to incoming-neutral styling instead of a destructive sign.
        return 'in';
    }

    private function movementLabel(string $movementType): string
    {
        return self::MOVEMENT_LABELS[$movementType]
            ?? ucwords(str_replace(['_', '-'], ' ', $movementType));
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Helper
    |--------------------------------------------------------------------------
    */

    private function getTenantId(Request $request): int
    {
        return $this->access->tenantId($request);
    }


    /*
    |--------------------------------------------------------------------------
    | Date Validation Helper
    |--------------------------------------------------------------------------
    */

    private function validDate(
        string $value
    ): ?string {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        $date = \DateTimeImmutable::createFromFormat(
            'Y-m-d',
            $value
        );

        if (
            ! $date
            || $date->format('Y-m-d') !== $value
        ) {
            return null;
        }

        return $value;
    }
}