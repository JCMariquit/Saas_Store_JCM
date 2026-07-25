<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use Illuminate\Database\Connection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    private const INCOMING_MOVEMENT_TYPES = [
        'stock_in',
        'adjustment_in',
        'return_in',
    ];

    private const OUTGOING_MOVEMENT_TYPES = [
        'stock_out',
        'adjustment_out',
        'return_out',
        'damage',
        'expired',
    ];

    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);
        $db = DB::connection('mysql');
        $inventorySettings = $this->getInventorySettings($db, $tenantId);

        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));
        $batchStatus = trim((string) $request->input('batch_status', ''));
        $branchId = (int) $request->input('branch_id', 0);
        $warehouseId = (int) $request->input('warehouse_id', 0);
        $categoryId = (int) $request->input('category_id', 0);

        $stocks = WarehouseStock::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'product' => function ($query): void {
                    $query->select([
                        'id',
                        'category_id',
                        'name',
                        'sku',
                        'barcode',
                        'unit',
                        'cost_price',
                        'stock_tracking',
                        'batch_tracking_enabled',
                        'batch_issue_policy',
                        'requires_expiration_date',
                        'expiry_warning_days',
                        'is_active',
                    ]);
                },
                'product.category:id,name,slug',
                'warehouse' => function ($query): void {
                    $query->select([
                        'id',
                        'branch_id',
                        'name',
                        'code',
                        'is_main',
                        'is_active',
                    ]);
                },
                'warehouse.branch:id,name,code,is_main,is_active',
            ])
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    $query->where(function (Builder $query) use ($search): void {
                        $query
                            ->whereHas('product', function (Builder $query) use ($search): void {
                                $query
                                    ->where('name', 'like', "%{$search}%")
                                    ->orWhere('sku', 'like', "%{$search}%")
                                    ->orWhere('barcode', 'like', "%{$search}%");
                            })
                            ->orWhereHas('warehouse', function (Builder $query) use ($search): void {
                                $query
                                    ->where('name', 'like', "%{$search}%")
                                    ->orWhere('code', 'like', "%{$search}%");
                            })
                            ->orWhereHas('warehouse.branch', function (Builder $query) use ($search): void {
                                $query
                                    ->where('name', 'like', "%{$search}%")
                                    ->orWhere('code', 'like', "%{$search}%");
                            });
                    });
                }
            )
            ->when(
                $branchId > 0,
                fn (Builder $query) => $query->whereHas(
                    'warehouse',
                    fn (Builder $query) => $query->where('branch_id', $branchId)
                )
            )
            ->when(
                $warehouseId > 0,
                fn (Builder $query) => $query->where('warehouse_id', $warehouseId)
            )
            ->when(
                $categoryId > 0,
                fn (Builder $query) => $query->whereHas(
                    'product',
                    fn (Builder $query) => $query->where('category_id', $categoryId)
                )
            )
            ->when(
                $status === 'in_stock',
                fn (Builder $query) => $query
                    ->where('quantity', '>', 0)
                    ->whereColumn('quantity', '>', 'reorder_level')
            )
            ->when(
                $status === 'low_stock',
                fn (Builder $query) => $query
                    ->where('quantity', '>', 0)
                    ->whereColumn('quantity', '<=', 'reorder_level')
            )
            ->when(
                $status === 'out_of_stock',
                fn (Builder $query) => $query->where('quantity', '<=', 0)
            )
            ->when(
                $batchStatus === 'batch_enabled',
                fn (Builder $query) => $query->whereHas(
                    'product',
                    fn (Builder $query) => $query->where('batch_tracking_enabled', true)
                )
            )
            ->when(
                $batchStatus === 'standard',
                fn (Builder $query) => $query->whereHas(
                    'product',
                    fn (Builder $query) => $query->where('batch_tracking_enabled', false)
                )
            )
            ->when(
                $batchStatus === 'mismatch',
                fn (Builder $query) => $query->whereRaw(
                    'ABS(warehouse_stocks.quantity - COALESCE((
                        SELECT SUM(wbs.quantity)
                        FROM warehouse_batch_stocks AS wbs
                        WHERE wbs.tenant_id = warehouse_stocks.tenant_id
                          AND wbs.warehouse_id = warehouse_stocks.warehouse_id
                          AND wbs.product_id = warehouse_stocks.product_id
                    ), 0)) > 0.0001'
                )
            )
            ->when(
                $batchStatus === 'expiring',
                function (Builder $query) use ($inventorySettings): void {
                    $warningDays = (int) $inventorySettings['expiry_warning_days'];

                    $query->whereExists(function ($subQuery) use ($warningDays): void {
                        $subQuery
                            ->selectRaw('1')
                            ->from('warehouse_batch_stocks as wbs')
                            ->join('stock_batches as sb', function ($join): void {
                                $join
                                    ->on('sb.tenant_id', '=', 'wbs.tenant_id')
                                    ->on('sb.id', '=', 'wbs.stock_batch_id')
                                    ->on('sb.product_id', '=', 'wbs.product_id');
                            })
                            ->whereColumn('wbs.tenant_id', 'warehouse_stocks.tenant_id')
                            ->whereColumn('wbs.warehouse_id', 'warehouse_stocks.warehouse_id')
                            ->whereColumn('wbs.product_id', 'warehouse_stocks.product_id')
                            ->where('wbs.quantity', '>', 0)
                            ->whereNotNull('sb.expiration_date')
                            ->whereRaw('DATEDIFF(sb.expiration_date, CURDATE()) BETWEEN 0 AND ?', [$warningDays]);
                    });
                }
            )
            ->when(
                $batchStatus === 'expired',
                function (Builder $query): void {
                    $query->whereExists(function ($subQuery): void {
                        $subQuery
                            ->selectRaw('1')
                            ->from('warehouse_batch_stocks as wbs')
                            ->join('stock_batches as sb', function ($join): void {
                                $join
                                    ->on('sb.tenant_id', '=', 'wbs.tenant_id')
                                    ->on('sb.id', '=', 'wbs.stock_batch_id')
                                    ->on('sb.product_id', '=', 'wbs.product_id');
                            })
                            ->whereColumn('wbs.tenant_id', 'warehouse_stocks.tenant_id')
                            ->whereColumn('wbs.warehouse_id', 'warehouse_stocks.warehouse_id')
                            ->whereColumn('wbs.product_id', 'warehouse_stocks.product_id')
                            ->where('wbs.quantity', '>', 0)
                            ->whereNotNull('sb.expiration_date')
                            ->whereDate('sb.expiration_date', '<', now()->toDateString());
                    });
                }
            )
            ->orderByDesc('last_movement_at')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $this->attachBatchDetails($db, $stocks->getCollection(), $tenantId);

        $summaryQuery = WarehouseStock::query()
            ->where('tenant_id', $tenantId);

        $totalQuantity = (float) ((clone $summaryQuery)->sum('quantity') ?? 0);

        $inventoryValue = (float) (
            (clone $summaryQuery)
                ->selectRaw('COALESCE(SUM(quantity * average_cost), 0) as total_value')
                ->value('total_value') ?? 0
        );

        $activeBatchQuery = $db->table('vw_batch_inventory')
            ->where('tenant_id', $tenantId)
            ->where('quantity', '>', 0);

        $recordsCount = (clone $summaryQuery)->count();
        $lowStockCount = (clone $summaryQuery)
            ->where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->count();
        $outOfStockCount = (clone $summaryQuery)
            ->where('quantity', '<=', 0)
            ->count();
        $healthyCount = max(0, $recordsCount - $lowStockCount - $outOfStockCount);
        $activeBatchCount = (clone $activeBatchQuery)
            ->distinct()
            ->count('warehouse_batch_stock_id');
        $expiringBatchCount = (clone $activeBatchQuery)
            ->whereIn('expiry_state', ['warning', 'critical'])
            ->distinct()
            ->count('warehouse_batch_stock_id');
        $expiredBatchCount = (clone $activeBatchQuery)
            ->where('expiry_state', 'expired')
            ->distinct()
            ->count('warehouse_batch_stock_id');
        $reconciliationMismatchCount = $db
            ->table('vw_batch_stock_reconciliation')
            ->where('tenant_id', $tenantId)
            ->where('reconciliation_status', 'mismatch')
            ->count();

        $positionOverview = $db->table('warehouse_stocks as ws')
            ->join('products as p', function ($join): void {
                $join
                    ->on('p.tenant_id', '=', 'ws.tenant_id')
                    ->on('p.id', '=', 'ws.product_id');
            })
            ->join('warehouses as w', function ($join): void {
                $join
                    ->on('w.tenant_id', '=', 'ws.tenant_id')
                    ->on('w.id', '=', 'ws.warehouse_id');
            })
            ->leftJoin('branches as b', function ($join): void {
                $join
                    ->on('b.tenant_id', '=', 'w.tenant_id')
                    ->on('b.id', '=', 'w.branch_id');
            })
            ->where('ws.tenant_id', $tenantId)
            ->select([
                'ws.id',
                'ws.warehouse_id',
                'ws.product_id',
                'p.name as product_name',
                'p.sku',
                'p.unit',
                'p.batch_tracking_enabled',
                'w.name as warehouse_name',
                'w.code as warehouse_code',
                'b.name as branch_name',
                'ws.quantity',
                'ws.reorder_level',
                'ws.max_stock_level',
                'ws.average_cost',
                'ws.last_movement_at',
            ])
            ->selectRaw('(ws.quantity * ws.average_cost) as total_value')
            ->selectRaw("CASE
                WHEN ws.quantity <= 0 THEN 'out_of_stock'
                WHEN ws.quantity <= ws.reorder_level THEN 'low_stock'
                ELSE 'healthy'
            END as stock_status")
            ->selectRaw('(SELECT COUNT(*)
                FROM warehouse_batch_stocks wbs
                WHERE wbs.tenant_id = ws.tenant_id
                  AND wbs.warehouse_id = ws.warehouse_id
                  AND wbs.product_id = ws.product_id
                  AND wbs.quantity > 0) as batch_count')
            ->selectRaw('(SELECT COALESCE(SUM(wbs.quantity), 0)
                FROM warehouse_batch_stocks wbs
                WHERE wbs.tenant_id = ws.tenant_id
                  AND wbs.warehouse_id = ws.warehouse_id
                  AND wbs.product_id = ws.product_id) as batch_quantity')
            ->orderByDesc('ws.last_movement_at')
            ->orderBy('p.name')
            ->limit(100)
            ->get()
            ->map(function ($row): array {
                return [
                    'id' => (int) $row->id,
                    'warehouse_id' => (int) $row->warehouse_id,
                    'product_id' => (int) $row->product_id,
                    'product_name' => $row->product_name,
                    'sku' => $row->sku,
                    'unit' => $row->unit,
                    'batch_tracking_enabled' => (bool) $row->batch_tracking_enabled,
                    'warehouse_name' => $row->warehouse_name,
                    'warehouse_code' => $row->warehouse_code,
                    'branch_name' => $row->branch_name,
                    'quantity' => $this->quantity($row->quantity),
                    'reorder_level' => $this->quantity($row->reorder_level),
                    'max_stock_level' => $row->max_stock_level !== null
                        ? $this->quantity($row->max_stock_level)
                        : null,
                    'average_cost' => $this->cost($row->average_cost),
                    'total_value' => $this->money($row->total_value),
                    'batch_count' => (int) $row->batch_count,
                    'batch_quantity' => $this->quantity($row->batch_quantity),
                    'stock_status' => $row->stock_status,
                    'last_movement_at' => $row->last_movement_at,
                ];
            })
            ->values();

        $warehouseOverview = $db->table('warehouse_stocks as ws')
            ->join('warehouses as w', function ($join): void {
                $join
                    ->on('w.tenant_id', '=', 'ws.tenant_id')
                    ->on('w.id', '=', 'ws.warehouse_id');
            })
            ->leftJoin('branches as b', function ($join): void {
                $join
                    ->on('b.tenant_id', '=', 'w.tenant_id')
                    ->on('b.id', '=', 'w.branch_id');
            })
            ->where('ws.tenant_id', $tenantId)
            ->groupBy('w.id', 'w.name', 'w.code', 'b.name')
            ->select([
                'w.id as warehouse_id',
                'w.name as warehouse_name',
                'w.code as warehouse_code',
                'b.name as branch_name',
            ])
            ->selectRaw('COUNT(*) as position_count')
            ->selectRaw('COALESCE(SUM(ws.quantity), 0) as total_quantity')
            ->selectRaw('COALESCE(SUM(ws.quantity * ws.average_cost), 0) as total_value')
            ->orderByDesc('total_quantity')
            ->get()
            ->map(fn ($row): array => [
                'warehouse_id' => (int) $row->warehouse_id,
                'warehouse_name' => $row->warehouse_name,
                'warehouse_code' => $row->warehouse_code,
                'branch_name' => $row->branch_name,
                'position_count' => (int) $row->position_count,
                'total_quantity' => $this->quantity($row->total_quantity),
                'total_value' => $this->money($row->total_value),
            ])
            ->values();

        $batchOverview = (clone $activeBatchQuery)
            ->select([
                'stock_batch_id',
                'product_id',
                'product_name',
                'product_sku as sku',
                'warehouse_id',
                'warehouse_name',
                'branch_name',
                'batch_code',
                'lot_number',
                'received_date',
                'expiration_date',
                'unit_cost',
                'quantity',
                'batch_value',
                'days_to_expiry',
                'expiry_state',
            ])
            ->orderByRaw('CASE WHEN expiration_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('expiration_date')
            ->orderBy('received_date')
            ->limit(100)
            ->get()
            ->map(fn ($row): array => [
                'stock_batch_id' => (int) $row->stock_batch_id,
                'product_id' => (int) $row->product_id,
                'product_name' => $row->product_name,
                'sku' => $row->sku,
                'warehouse_id' => (int) $row->warehouse_id,
                'warehouse_name' => $row->warehouse_name,
                'branch_name' => $row->branch_name,
                'batch_code' => $row->batch_code,
                'lot_number' => $row->lot_number,
                'received_date' => $row->received_date,
                'expiration_date' => $row->expiration_date,
                'unit_cost' => $this->cost($row->unit_cost),
                'quantity' => $this->quantity($row->quantity),
                'batch_value' => $this->money($row->batch_value),
                'days_to_expiry' => $row->days_to_expiry !== null
                    ? (int) $row->days_to_expiry
                    : null,
                'expiry_state' => $row->expiry_state,
            ])
            ->values();

        $expiryOverview = (clone $activeBatchQuery)
            ->whereIn('expiry_state', ['warning', 'critical', 'expired'])
            ->select([
                'stock_batch_id',
                'product_name',
                'product_sku as sku',
                'warehouse_name',
                'branch_name',
                'batch_code',
                'expiration_date',
                'quantity',
                'days_to_expiry',
                'expiry_state',
            ])
            ->orderBy('expiration_date')
            ->limit(100)
            ->get()
            ->map(fn ($row): array => [
                'stock_batch_id' => (int) $row->stock_batch_id,
                'product_name' => $row->product_name,
                'sku' => $row->sku,
                'warehouse_name' => $row->warehouse_name,
                'branch_name' => $row->branch_name,
                'batch_code' => $row->batch_code,
                'expiration_date' => $row->expiration_date,
                'quantity' => $this->quantity($row->quantity),
                'days_to_expiry' => $row->days_to_expiry !== null
                    ? (int) $row->days_to_expiry
                    : null,
                'expiry_state' => $row->expiry_state,
            ])
            ->values();

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->select(['id', 'name', 'code', 'is_main'])
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get();

        $warehouses = Warehouse::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->with(['branch:id,name,code'])
            ->select(['id', 'branch_id', 'name', 'code', 'is_main'])
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get();

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->select(['id', 'parent_id', 'name'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $products = Product::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('stock_tracking', 'tracked')
            ->with(['category:id,name'])
            ->select([
                'id',
                'category_id',
                'name',
                'sku',
                'barcode',
                'unit',
                'cost_price',
                'batch_tracking_enabled',
                'batch_issue_policy',
                'requires_expiration_date',
                'expiry_warning_days',
            ])
            ->orderByDesc('batch_tracking_enabled')
            ->orderBy('name')
            ->get()
            ->each(function (Product $product): void {
                $product->setAttribute(
                    'batch_tracking_enabled',
                    (bool) $product->batch_tracking_enabled
                );
                $product->setAttribute(
                    'requires_expiration_date',
                    (bool) $product->requires_expiration_date
                );
            });

        $positionKeys = $db->table('warehouse_stocks')
            ->where('tenant_id', $tenantId)
            ->select(['warehouse_id', 'product_id'])
            ->get()
            ->map(fn ($row) => "{$row->warehouse_id}:{$row->product_id}")
            ->values();

        return Inertia::render('inventory/stocks/index', [
            'stocks' => $stocks,
            'branches' => $branches,
            'warehouses' => $warehouses,
            'categories' => $categories,
            'products' => $products,
            'positionKeys' => $positionKeys,
            'batchSettings' => $inventorySettings,
            'summary' => [
                'records' => $recordsCount,
                'total_quantity' => $this->quantity($totalQuantity),
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
                'inventory_value' => $this->money($inventoryValue),
                'active_batches' => $activeBatchCount,
                'expiring_batches' => $expiringBatchCount,
                'expired_batches' => $expiredBatchCount,
                'reconciliation_mismatches' => $reconciliationMismatchCount,
            ],
            'overviewDetails' => [
                'positions' => $positionOverview,
                'warehouses' => $warehouseOverview,
                'batches' => $batchOverview,
                'expiry' => $expiryOverview,
                'health' => [
                    ['key' => 'healthy', 'label' => 'Healthy', 'count' => $healthyCount],
                    ['key' => 'low_stock', 'label' => 'Low Stock', 'count' => $lowStockCount],
                    ['key' => 'out_of_stock', 'label' => 'Out of Stock', 'count' => $outOfStockCount],
                    ['key' => 'expired', 'label' => 'Expired Batches', 'count' => $expiredBatchCount],
                    ['key' => 'mismatch', 'label' => 'Reconciliation Mismatches', 'count' => $reconciliationMismatchCount],
                ],
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'batch_status' => $batchStatus,
                'branch_id' => $branchId > 0 ? $branchId : null,
                'warehouse_id' => $warehouseId > 0 ? $warehouseId : null,
                'category_id' => $categoryId > 0 ? $categoryId : null,
            ],
            'movementTypes' => [
                ['value' => 'stock_in', 'label' => 'Stock In', 'direction' => 'in'],
                ['value' => 'stock_out', 'label' => 'Stock Out', 'direction' => 'out'],
                ['value' => 'adjustment_in', 'label' => 'Correction In', 'direction' => 'in'],
                ['value' => 'adjustment_out', 'label' => 'Correction Out', 'direction' => 'out'],
                ['value' => 'return_in', 'label' => 'Return In', 'direction' => 'in'],
                ['value' => 'return_out', 'label' => 'Return Out', 'direction' => 'out'],
                ['value' => 'damage', 'label' => 'Damaged Stock', 'direction' => 'out'],
                ['value' => 'expired', 'label' => 'Expired Stock', 'direction' => 'out'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = $this->getTenantId($request);
        $db = DB::connection('mysql');
        $settings = $this->getInventorySettings($db, $tenantId);

        $validated = $request->validate($this->openingStockRules($tenantId));
        $warehouseId = (int) $validated['warehouse_id'];
        $productId = (int) $validated['product_id'];
        $quantityToAdd = $this->quantity($validated['opening_quantity']);
        $reorderLevel = $this->quantity($validated['reorder_level']);
        $maxStockLevel = filled($validated['max_stock_level'] ?? null)
            ? $this->quantity($validated['max_stock_level'])
            : null;

        $this->validateStockLevels($reorderLevel, $maxStockLevel);

        $product = Product::query()
            ->where('tenant_id', $tenantId)
            ->whereKey($productId)
            ->firstOrFail();

        $this->validateIncomingBatchData(
            $db,
            $tenantId,
            $product,
            $validated,
            $quantityToAdd,
            $settings
        );

        $createdNewPosition = false;

        $db->transaction(function () use (
            $request,
            $db,
            $tenantId,
            $validated,
            $warehouseId,
            $productId,
            $quantityToAdd,
            $reorderLevel,
            $maxStockLevel,
            $product,
            $settings,
            &$createdNewPosition
        ): void {
            $warehouse = $db->table('warehouses')
                ->where('tenant_id', $tenantId)
                ->where('id', $warehouseId)
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->first();

            abort_unless($warehouse, 404);

            $lockedStock = $db->table('warehouse_stocks')
                ->where('tenant_id', $tenantId)
                ->where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->lockForUpdate()
                ->first();

            $movementDate = now();
            $userId = $request->user()?->id;
            $createdNewPosition = ! $lockedStock;

            if ($lockedStock) {
                $this->ensureBatchReconciled(
                    $db,
                    $tenantId,
                    $warehouseId,
                    $productId,
                    $this->quantity($lockedStock->quantity)
                );

                $stockId = (int) $lockedStock->id;
                $quantityBefore = $this->quantity($lockedStock->quantity);
                $averageCostBefore = $this->cost($lockedStock->average_cost);

                $unitCost = filled($validated['unit_cost'] ?? null)
                    ? $this->cost($validated['unit_cost'])
                    : (
                        $averageCostBefore > 0
                            ? $averageCostBefore
                            : $this->cost($product->cost_price)
                    );

                $adjustmentNumber = $this->generateReferenceNumber('STK');
                $adjustmentType = 'stock_in';
                $movementType = 'stock_in';
                $batchSourceType = 'adjustment';
                $reason = 'Additional warehouse stock';
            } else {
                $unitCost = filled($validated['unit_cost'] ?? null)
                    ? $this->cost($validated['unit_cost'])
                    : $this->cost($product->cost_price);

                $stockId = $db->table('warehouse_stocks')->insertGetId([
                    'tenant_id' => $tenantId,
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'quantity' => 0,
                    'reorder_level' => $reorderLevel,
                    'max_stock_level' => $maxStockLevel,
                    'average_cost' => $unitCost,
                    'last_movement_at' => null,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

                $quantityBefore = 0;
                $averageCostBefore = 0;
                $adjustmentNumber = $this->generateReferenceNumber('OPEN');
                $adjustmentType = 'opening_stock';
                $movementType = 'opening_stock';
                $batchSourceType = 'opening_stock';
                $reason = 'Initial warehouse stock position';
            }

            $totalCost = $this->money($quantityToAdd * $unitCost);

            $adjustmentId = $db->table('stock_adjustments')->insertGetId([
                'tenant_id' => $tenantId,
                'branch_id' => $warehouse->branch_id,
                'warehouse_id' => $warehouseId,
                'adjustment_number' => $adjustmentNumber,
                'adjustment_date' => $movementDate->toDateString(),
                'adjustment_type' => $adjustmentType,
                'status' => 'posted',
                'reference_no' => null,
                'reason' => $reason,
                'notes' => $this->nullableString($validated['remarks'] ?? null),
                'total_quantity' => $quantityToAdd,
                'total_cost' => $totalCost,
                'created_by' => $userId,
                'posted_by' => $userId,
                'posted_at' => $movementDate,
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

            $adjustmentItemId = $db->table('stock_adjustment_items')->insertGetId([
                'tenant_id' => $tenantId,
                'stock_adjustment_id' => $adjustmentId,
                'product_id' => $productId,
                'direction' => 'in',
                'quantity' => $quantityToAdd,
                'unit_cost' => $unitCost,
                'line_total' => $totalCost,
                'notes' => $this->nullableString($validated['remarks'] ?? null),
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

            $batchId = $this->createIncomingBatch(
                $db,
                $tenantId,
                $product,
                $validated,
                $quantityToAdd,
                $unitCost,
                $batchSourceType,
                $adjustmentNumber,
                $userId,
                $settings,
                $movementDate
            );

            $batchBalance = $this->addToBatchBalance(
                $db,
                $tenantId,
                $warehouseId,
                $productId,
                $batchId,
                $quantityToAdd,
                $movementDate
            );

            $aggregate = $this->syncWarehouseStockFromBatches(
                $db,
                $stockId,
                $tenantId,
                $warehouseId,
                $productId,
                $movementDate
            );

            $movementId = $this->createStockMovement($db, [
                'tenant_id' => $tenantId,
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'movement_type' => $movementType,
                'quantity' => $quantityToAdd,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $aggregate['quantity'],
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'average_cost_before' => $averageCostBefore,
                'average_cost_after' => $aggregate['average_cost'],
                'reference_type' => 'stock_adjustment',
                'reference_id' => $adjustmentId,
                'reference_no' => $adjustmentNumber,
                'related_warehouse_id' => null,
                'remarks' => $this->nullableString($validated['remarks'] ?? null),
                'movement_date' => $movementDate,
                'created_by' => $userId,
            ]);

            $movementBatchId = $this->createMovementBatch($db, [
                'tenant_id' => $tenantId,
                'stock_movement_id' => $movementId,
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'stock_batch_id' => $batchId,
                'direction' => 'in',
                'quantity' => $quantityToAdd,
                'batch_quantity_before' => $batchBalance['before'],
                'batch_quantity_after' => $batchBalance['after'],
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'created_at' => $movementDate,
            ]);

            $db->table('stock_adjustment_items')
                ->where('tenant_id', $tenantId)
                ->where('id', $adjustmentItemId)
                ->update([
                    'stock_movement_id' => $movementId,
                    'updated_at' => $movementDate,
                ]);

            $db->table('stock_adjustment_item_batches')->insert([
                'tenant_id' => $tenantId,
                'stock_adjustment_item_id' => $adjustmentItemId,
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'stock_batch_id' => $batchId,
                'direction' => 'in',
                'quantity' => $quantityToAdd,
                'unit_cost' => $unitCost,
                'line_total' => $totalCost,
                'stock_movement_batch_id' => $movementBatchId,
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

            $this->refreshBatchStatus(
                $db,
                $tenantId,
                $batchId,
                $userId,
                'stock_adjustment',
                $adjustmentId,
                $adjustmentNumber,
                $movementDate
            );
        });

        return back()->with(
            'success',
            $createdNewPosition
                ? 'Stock position created with its first batch/cost layer.'
                : 'Stock added successfully as a new batch/cost layer.'
        );
    }

    public function updateSettings(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);
        $this->ensureStockBelongsToTenant($stock, $tenantId);

        $validated = $request->validate([
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'max_stock_level' => ['nullable', 'numeric', 'min:0'],
        ]);

        $reorderLevel = $this->quantity($validated['reorder_level']);
        $maxStockLevel = filled($validated['max_stock_level'] ?? null)
            ? $this->quantity($validated['max_stock_level'])
            : null;

        $this->validateStockLevels($reorderLevel, $maxStockLevel);

        $stock->update([
            'reorder_level' => $reorderLevel,
            'max_stock_level' => $maxStockLevel,
        ]);

        return back()->with('success', 'Stock thresholds updated successfully.');
    }

    public function adjust(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);
        $this->ensureStockBelongsToTenant($stock, $tenantId);

        $db = DB::connection('mysql');
        $settings = $this->getInventorySettings($db, $tenantId);
        $allowedTypes = [
            ...self::INCOMING_MOVEMENT_TYPES,
            ...self::OUTGOING_MOVEMENT_TYPES,
        ];

        $validated = $request->validate([
            'movement_type' => ['required', Rule::in($allowedTypes)],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'reference_no' => ['nullable', 'string', 'max:120'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            ...$this->batchInputRules(),
            'batch_allocations' => ['nullable', 'array'],
            'batch_allocations.*.stock_batch_id' => ['required', 'integer', 'distinct'],
            'batch_allocations.*.quantity' => ['nullable', 'numeric', 'gt:0'],
        ]);

        $quantity = $this->quantity($validated['quantity']);
        $isIncoming = in_array(
            $validated['movement_type'],
            self::INCOMING_MOVEMENT_TYPES,
            true
        );

        $product = Product::query()
            ->where('tenant_id', $tenantId)
            ->whereKey($stock->product_id)
            ->firstOrFail();

        if ($isIncoming) {
            $this->validateIncomingBatchData(
                $db,
                $tenantId,
                $product,
                $validated,
                $quantity,
                $settings
            );
        }

        $db->transaction(function () use (
            $request,
            $db,
            $tenantId,
            $stock,
            $validated,
            $quantity,
            $isIncoming,
            $settings
        ): void {
            $lockedStock = $db->table('warehouse_stocks')
                ->where('tenant_id', $tenantId)
                ->where('id', $stock->id)
                ->lockForUpdate()
                ->first();

            abort_unless($lockedStock, 404);

            $this->ensureBatchReconciled(
                $db,
                $tenantId,
                (int) $lockedStock->warehouse_id,
                (int) $lockedStock->product_id,
                $this->quantity($lockedStock->quantity)
            );

            $product = Product::query()
                ->where('tenant_id', $tenantId)
                ->whereKey($lockedStock->product_id)
                ->firstOrFail();

            $warehouse = $db->table('warehouses')
                ->where('tenant_id', $tenantId)
                ->where('id', $lockedStock->warehouse_id)
                ->first();

            abort_unless($warehouse, 404);

            $movementType = $validated['movement_type'];
            $movementDate = now();
            $userId = $request->user()?->id;
            $adjustmentNumber = $this->generateReferenceNumber('ADJ');
            $averageCostBefore = $this->cost($lockedStock->average_cost);
            $quantityBefore = $this->quantity($lockedStock->quantity);

            $adjustmentId = $db->table('stock_adjustments')->insertGetId([
                'tenant_id' => $tenantId,
                'branch_id' => $warehouse->branch_id,
                'warehouse_id' => $lockedStock->warehouse_id,
                'adjustment_number' => $adjustmentNumber,
                'adjustment_date' => $movementDate->toDateString(),
                'adjustment_type' => $this->mapAdjustmentType($movementType),
                'status' => 'posted',
                'reference_no' => $this->nullableString($validated['reference_no'] ?? null),
                'reason' => $this->movementReason($movementType),
                'notes' => $this->nullableString($validated['remarks'] ?? null),
                'total_quantity' => $quantity,
                'total_cost' => 0,
                'created_by' => $userId,
                'posted_by' => $userId,
                'posted_at' => $movementDate,
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

            if ($isIncoming) {
                $unitCost = filled($validated['unit_cost'] ?? null)
                    ? $this->cost($validated['unit_cost'])
                    : ($averageCostBefore > 0
                        ? $averageCostBefore
                        : $this->cost($product->cost_price));

                $totalCost = $this->money($quantity * $unitCost);

                $adjustmentItemId = $db->table('stock_adjustment_items')->insertGetId([
                    'tenant_id' => $tenantId,
                    'stock_adjustment_id' => $adjustmentId,
                    'product_id' => $lockedStock->product_id,
                    'direction' => 'in',
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'line_total' => $totalCost,
                    'notes' => $this->nullableString($validated['remarks'] ?? null),
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

                $batchId = $this->createIncomingBatch(
                    $db,
                    $tenantId,
                    $product,
                    $validated,
                    $quantity,
                    $unitCost,
                    $this->incomingBatchSourceType($movementType),
                    $adjustmentNumber,
                    $userId,
                    $settings,
                    $movementDate
                );

                $batchBalance = $this->addToBatchBalance(
                    $db,
                    $tenantId,
                    $lockedStock->warehouse_id,
                    $lockedStock->product_id,
                    $batchId,
                    $quantity,
                    $movementDate
                );

                $aggregate = $this->syncWarehouseStockFromBatches(
                    $db,
                    $lockedStock->id,
                    $tenantId,
                    $lockedStock->warehouse_id,
                    $lockedStock->product_id,
                    $movementDate
                );

                $movementId = $this->createStockMovement($db, [
                    'tenant_id' => $tenantId,
                    'warehouse_id' => $lockedStock->warehouse_id,
                    'product_id' => $lockedStock->product_id,
                    'movement_type' => $movementType,
                    'quantity' => $quantity,
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $aggregate['quantity'],
                    'unit_cost' => $unitCost,
                    'total_cost' => $totalCost,
                    'average_cost_before' => $averageCostBefore,
                    'average_cost_after' => $aggregate['average_cost'],
                    'reference_type' => 'stock_adjustment',
                    'reference_id' => $adjustmentId,
                    'reference_no' => $adjustmentNumber,
                    'related_warehouse_id' => null,
                    'remarks' => $this->nullableString($validated['remarks'] ?? null),
                    'movement_date' => $movementDate,
                    'created_by' => $userId,
                ]);

                $movementBatchId = $this->createMovementBatch($db, [
                    'tenant_id' => $tenantId,
                    'stock_movement_id' => $movementId,
                    'warehouse_id' => $lockedStock->warehouse_id,
                    'product_id' => $lockedStock->product_id,
                    'stock_batch_id' => $batchId,
                    'direction' => 'in',
                    'quantity' => $quantity,
                    'batch_quantity_before' => $batchBalance['before'],
                    'batch_quantity_after' => $batchBalance['after'],
                    'unit_cost' => $unitCost,
                    'total_cost' => $totalCost,
                    'created_at' => $movementDate,
                ]);

                $db->table('stock_adjustment_items')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $adjustmentItemId)
                    ->update([
                        'stock_movement_id' => $movementId,
                        'updated_at' => $movementDate,
                    ]);

                $db->table('stock_adjustment_item_batches')->insert([
                    'tenant_id' => $tenantId,
                    'stock_adjustment_item_id' => $adjustmentItemId,
                    'warehouse_id' => $lockedStock->warehouse_id,
                    'product_id' => $lockedStock->product_id,
                    'stock_batch_id' => $batchId,
                    'direction' => 'in',
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'line_total' => $totalCost,
                    'stock_movement_batch_id' => $movementBatchId,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

                $db->table('stock_adjustments')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $adjustmentId)
                    ->update([
                        'total_cost' => $totalCost,
                        'updated_at' => $movementDate,
                    ]);

                $this->refreshBatchStatus(
                    $db,
                    $tenantId,
                    $batchId,
                    $userId,
                    'stock_adjustment',
                    $adjustmentId,
                    $adjustmentNumber,
                    $movementDate
                );

                return;
            }

            if ($quantity > $quantityBefore + 0.0001) {
                throw ValidationException::withMessages([
                    'quantity' => 'The requested quantity is greater than the aggregate stock balance.',
                ]);
            }

            $allocations = $this->allocateOutgoingBatches(
                $db,
                $tenantId,
                $lockedStock->warehouse_id,
                $lockedStock->product_id,
                $product,
                $quantity,
                $validated['batch_allocations'] ?? [],
                $movementType,
                $settings
            );

            $totalCost = $this->money(
                collect($allocations)->sum(
                    fn (array $allocation) => $allocation['quantity'] * $allocation['unit_cost']
                )
            );

            $movementUnitCost = $quantity > 0
                ? $this->cost($totalCost / $quantity)
                : 0;

            $adjustmentItemId = $db->table('stock_adjustment_items')->insertGetId([
                'tenant_id' => $tenantId,
                'stock_adjustment_id' => $adjustmentId,
                'product_id' => $lockedStock->product_id,
                'direction' => 'out',
                'quantity' => $quantity,
                'unit_cost' => $movementUnitCost,
                'line_total' => $totalCost,
                'notes' => $this->nullableString($validated['remarks'] ?? null),
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

            foreach ($allocations as &$allocation) {
                $allocation['after'] = $this->quantity(
                    $allocation['before'] - $allocation['quantity']
                );

                $db->table('warehouse_batch_stocks')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $allocation['warehouse_batch_stock_id'])
                    ->update([
                        'quantity' => $allocation['after'],
                        'last_movement_at' => $movementDate,
                        'updated_at' => $movementDate,
                    ]);
            }
            unset($allocation);

            $aggregate = $this->syncWarehouseStockFromBatches(
                $db,
                $lockedStock->id,
                $tenantId,
                $lockedStock->warehouse_id,
                $lockedStock->product_id,
                $movementDate
            );

            $movementId = $this->createStockMovement($db, [
                'tenant_id' => $tenantId,
                'warehouse_id' => $lockedStock->warehouse_id,
                'product_id' => $lockedStock->product_id,
                'movement_type' => $movementType,
                'quantity' => -$quantity,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $aggregate['quantity'],
                'unit_cost' => $movementUnitCost,
                'total_cost' => $totalCost,
                'average_cost_before' => $averageCostBefore,
                'average_cost_after' => $aggregate['average_cost'],
                'reference_type' => 'stock_adjustment',
                'reference_id' => $adjustmentId,
                'reference_no' => $adjustmentNumber,
                'related_warehouse_id' => null,
                'remarks' => $this->nullableString($validated['remarks'] ?? null),
                'movement_date' => $movementDate,
                'created_by' => $userId,
            ]);

            foreach ($allocations as $allocation) {
                $allocationTotal = $this->money(
                    $allocation['quantity'] * $allocation['unit_cost']
                );

                $movementBatchId = $this->createMovementBatch($db, [
                    'tenant_id' => $tenantId,
                    'stock_movement_id' => $movementId,
                    'warehouse_id' => $lockedStock->warehouse_id,
                    'product_id' => $lockedStock->product_id,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'direction' => 'out',
                    'quantity' => $allocation['quantity'],
                    'batch_quantity_before' => $allocation['before'],
                    'batch_quantity_after' => $allocation['after'],
                    'unit_cost' => $allocation['unit_cost'],
                    'total_cost' => $allocationTotal,
                    'created_at' => $movementDate,
                ]);

                $db->table('stock_adjustment_item_batches')->insert([
                    'tenant_id' => $tenantId,
                    'stock_adjustment_item_id' => $adjustmentItemId,
                    'warehouse_id' => $lockedStock->warehouse_id,
                    'product_id' => $lockedStock->product_id,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'direction' => 'out',
                    'quantity' => $allocation['quantity'],
                    'unit_cost' => $allocation['unit_cost'],
                    'line_total' => $allocationTotal,
                    'stock_movement_batch_id' => $movementBatchId,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

                $this->refreshBatchStatus(
                    $db,
                    $tenantId,
                    $allocation['stock_batch_id'],
                    $userId,
                    'stock_adjustment',
                    $adjustmentId,
                    $adjustmentNumber,
                    $movementDate
                );
            }

            $db->table('stock_adjustment_items')
                ->where('tenant_id', $tenantId)
                ->where('id', $adjustmentItemId)
                ->update([
                    'stock_movement_id' => $movementId,
                    'updated_at' => $movementDate,
                ]);

            $db->table('stock_adjustments')
                ->where('tenant_id', $tenantId)
                ->where('id', $adjustmentId)
                ->update([
                    'total_cost' => $totalCost,
                    'updated_at' => $movementDate,
                ]);
        });

        return back()->with('success', 'Stock adjustment posted with batch allocations.');
    }

    public function transfer(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);
        $this->ensureStockBelongsToTenant($stock, $tenantId);

        $db = DB::connection('mysql');
        $settings = $this->getInventorySettings($db, $tenantId);

        $validated = $request->validate([
            'destination_warehouse_id' => [
                'required',
                'integer',
                Rule::exists('warehouses', 'id')->where(
                    fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                ),
            ],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'reference_no' => ['nullable', 'string', 'max:120'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'batch_allocations' => ['nullable', 'array'],
            'batch_allocations.*.stock_batch_id' => ['required', 'integer', 'distinct'],
            'batch_allocations.*.quantity' => ['nullable', 'numeric', 'gt:0'],
        ]);

        $destinationWarehouseId = (int) $validated['destination_warehouse_id'];

        if ($destinationWarehouseId === (int) $stock->warehouse_id) {
            throw ValidationException::withMessages([
                'destination_warehouse_id' => 'The destination warehouse must be different from the source warehouse.',
            ]);
        }

        $quantity = $this->quantity($validated['quantity']);

        $db->transaction(function () use (
            $request,
            $db,
            $tenantId,
            $stock,
            $validated,
            $destinationWarehouseId,
            $quantity,
            $settings
        ): void {
            $sourceStock = $db->table('warehouse_stocks')
                ->where('tenant_id', $tenantId)
                ->where('id', $stock->id)
                ->lockForUpdate()
                ->first();

            abort_unless($sourceStock, 404);

            $this->ensureBatchReconciled(
                $db,
                $tenantId,
                (int) $sourceStock->warehouse_id,
                (int) $sourceStock->product_id,
                $this->quantity($sourceStock->quantity)
            );

            if ($quantity > $this->quantity($sourceStock->quantity) + 0.0001) {
                throw ValidationException::withMessages([
                    'quantity' => 'The transfer quantity is greater than the aggregate stock balance.',
                ]);
            }

            $sourceWarehouse = $db->table('warehouses')
                ->where('tenant_id', $tenantId)
                ->where('id', $sourceStock->warehouse_id)
                ->first();

            $destinationWarehouse = $db->table('warehouses')
                ->where('tenant_id', $tenantId)
                ->where('id', $destinationWarehouseId)
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->first();

            abort_unless($sourceWarehouse && $destinationWarehouse, 404);

            $product = Product::query()
                ->where('tenant_id', $tenantId)
                ->whereKey($sourceStock->product_id)
                ->firstOrFail();

            $allocations = $this->allocateOutgoingBatches(
                $db,
                $tenantId,
                $sourceStock->warehouse_id,
                $sourceStock->product_id,
                $product,
                $quantity,
                $validated['batch_allocations'] ?? [],
                'transfer',
                $settings
            );

            $movementDate = now();
            $userId = $request->user()?->id;
            $transferNumber = $this->generateReferenceNumber('TRF');
            $sourceQuantityBefore = $this->quantity($sourceStock->quantity);
            $sourceAverageBefore = $this->cost($sourceStock->average_cost);

            $destinationStock = $db->table('warehouse_stocks')
                ->where('tenant_id', $tenantId)
                ->where('warehouse_id', $destinationWarehouseId)
                ->where('product_id', $sourceStock->product_id)
                ->lockForUpdate()
                ->first();

            if (! $destinationStock) {
                $destinationStockId = $db->table('warehouse_stocks')->insertGetId([
                    'tenant_id' => $tenantId,
                    'warehouse_id' => $destinationWarehouseId,
                    'product_id' => $sourceStock->product_id,
                    'quantity' => 0,
                    'reorder_level' => $sourceStock->reorder_level,
                    'max_stock_level' => $sourceStock->max_stock_level,
                    'average_cost' => 0,
                    'last_movement_at' => null,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

                $destinationStock = $db->table('warehouse_stocks')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $destinationStockId)
                    ->lockForUpdate()
                    ->first();
            }

            $destinationQuantityBefore = $this->quantity($destinationStock->quantity);
            $destinationAverageBefore = $this->cost($destinationStock->average_cost);
            $totalCost = $this->money(
                collect($allocations)->sum(
                    fn (array $allocation) => $allocation['quantity'] * $allocation['unit_cost']
                )
            );
            $movementUnitCost = $quantity > 0
                ? $this->cost($totalCost / $quantity)
                : 0;

            $transferId = $db->table('stock_transfers')->insertGetId([
                'tenant_id' => $tenantId,
                'from_branch_id' => $sourceWarehouse->branch_id,
                'from_warehouse_id' => $sourceStock->warehouse_id,
                'to_branch_id' => $destinationWarehouse->branch_id,
                'to_warehouse_id' => $destinationWarehouseId,
                'transfer_number' => $transferNumber,
                'transfer_date' => $movementDate->toDateString(),
                'expected_receive_date' => $movementDate->toDateString(),
                'status' => 'received',
                'reference_no' => $this->nullableString($validated['reference_no'] ?? null),
                'notes' => $this->nullableString($validated['remarks'] ?? null),
                'total_quantity_sent' => $quantity,
                'total_quantity_received' => $quantity,
                'total_cost' => $totalCost,
                'created_by' => $userId,
                'submitted_by' => $userId,
                'submitted_at' => $movementDate,
                'approved_by' => $userId,
                'approved_at' => $movementDate,
                'dispatched_by' => $userId,
                'dispatched_at' => $movementDate,
                'received_by' => $userId,
                'received_at' => $movementDate,
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

            $transferItemId = $db->table('stock_transfer_items')->insertGetId([
                'tenant_id' => $tenantId,
                'stock_transfer_id' => $transferId,
                'product_id' => $sourceStock->product_id,
                'quantity_requested' => $quantity,
                'quantity_sent' => $quantity,
                'quantity_received' => $quantity,
                'unit_cost' => $movementUnitCost,
                'line_total' => $totalCost,
                'notes' => $this->nullableString($validated['remarks'] ?? null),
                'created_at' => $movementDate,
                'updated_at' => $movementDate,
            ]);

            foreach ($allocations as &$allocation) {
                $allocation['source_after'] = $this->quantity(
                    $allocation['before'] - $allocation['quantity']
                );

                $db->table('warehouse_batch_stocks')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $allocation['warehouse_batch_stock_id'])
                    ->update([
                        'quantity' => $allocation['source_after'],
                        'last_movement_at' => $movementDate,
                        'updated_at' => $movementDate,
                    ]);

                $destinationBatch = $this->addToBatchBalance(
                    $db,
                    $tenantId,
                    $destinationWarehouseId,
                    $sourceStock->product_id,
                    $allocation['stock_batch_id'],
                    $allocation['quantity'],
                    $movementDate
                );

                $allocation['destination_before'] = $destinationBatch['before'];
                $allocation['destination_after'] = $destinationBatch['after'];
            }
            unset($allocation);

            $sourceAggregate = $this->syncWarehouseStockFromBatches(
                $db,
                $sourceStock->id,
                $tenantId,
                $sourceStock->warehouse_id,
                $sourceStock->product_id,
                $movementDate
            );

            $destinationAggregate = $this->syncWarehouseStockFromBatches(
                $db,
                $destinationStock->id,
                $tenantId,
                $destinationWarehouseId,
                $sourceStock->product_id,
                $movementDate
            );

            $outMovementId = $this->createStockMovement($db, [
                'tenant_id' => $tenantId,
                'warehouse_id' => $sourceStock->warehouse_id,
                'product_id' => $sourceStock->product_id,
                'movement_type' => 'transfer_out',
                'quantity' => -$quantity,
                'quantity_before' => $sourceQuantityBefore,
                'quantity_after' => $sourceAggregate['quantity'],
                'unit_cost' => $movementUnitCost,
                'total_cost' => $totalCost,
                'average_cost_before' => $sourceAverageBefore,
                'average_cost_after' => $sourceAggregate['average_cost'],
                'reference_type' => 'stock_transfer',
                'reference_id' => $transferId,
                'reference_no' => $transferNumber,
                'related_warehouse_id' => $destinationWarehouseId,
                'remarks' => $this->nullableString($validated['remarks'] ?? null),
                'movement_date' => $movementDate,
                'created_by' => $userId,
            ]);

            $inMovementId = $this->createStockMovement($db, [
                'tenant_id' => $tenantId,
                'warehouse_id' => $destinationWarehouseId,
                'product_id' => $sourceStock->product_id,
                'movement_type' => 'transfer_in',
                'quantity' => $quantity,
                'quantity_before' => $destinationQuantityBefore,
                'quantity_after' => $destinationAggregate['quantity'],
                'unit_cost' => $movementUnitCost,
                'total_cost' => $totalCost,
                'average_cost_before' => $destinationAverageBefore,
                'average_cost_after' => $destinationAggregate['average_cost'],
                'reference_type' => 'stock_transfer',
                'reference_id' => $transferId,
                'reference_no' => $transferNumber,
                'related_warehouse_id' => $sourceStock->warehouse_id,
                'remarks' => $this->nullableString($validated['remarks'] ?? null),
                'movement_date' => $movementDate,
                'created_by' => $userId,
            ]);

            $db->table('stock_transfer_items')
                ->where('tenant_id', $tenantId)
                ->where('id', $transferItemId)
                ->update([
                    'transfer_out_stock_movement_id' => $outMovementId,
                    'transfer_in_stock_movement_id' => $inMovementId,
                    'updated_at' => $movementDate,
                ]);

            foreach ($allocations as $allocation) {
                $allocationTotal = $this->money(
                    $allocation['quantity'] * $allocation['unit_cost']
                );

                $outMovementBatchId = $this->createMovementBatch($db, [
                    'tenant_id' => $tenantId,
                    'stock_movement_id' => $outMovementId,
                    'warehouse_id' => $sourceStock->warehouse_id,
                    'product_id' => $sourceStock->product_id,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'direction' => 'out',
                    'quantity' => $allocation['quantity'],
                    'batch_quantity_before' => $allocation['before'],
                    'batch_quantity_after' => $allocation['source_after'],
                    'unit_cost' => $allocation['unit_cost'],
                    'total_cost' => $allocationTotal,
                    'created_at' => $movementDate,
                ]);

                $inMovementBatchId = $this->createMovementBatch($db, [
                    'tenant_id' => $tenantId,
                    'stock_movement_id' => $inMovementId,
                    'warehouse_id' => $destinationWarehouseId,
                    'product_id' => $sourceStock->product_id,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'direction' => 'in',
                    'quantity' => $allocation['quantity'],
                    'batch_quantity_before' => $allocation['destination_before'],
                    'batch_quantity_after' => $allocation['destination_after'],
                    'unit_cost' => $allocation['unit_cost'],
                    'total_cost' => $allocationTotal,
                    'created_at' => $movementDate,
                ]);

                $db->table('stock_transfer_item_batches')->insert([
                    'tenant_id' => $tenantId,
                    'stock_transfer_item_id' => $transferItemId,
                    'product_id' => $sourceStock->product_id,
                    'stock_batch_id' => $allocation['stock_batch_id'],
                    'from_warehouse_id' => $sourceStock->warehouse_id,
                    'to_warehouse_id' => $destinationWarehouseId,
                    'quantity_sent' => $allocation['quantity'],
                    'quantity_received' => $allocation['quantity'],
                    'unit_cost' => $allocation['unit_cost'],
                    'line_total' => $allocationTotal,
                    'transfer_out_stock_movement_batch_id' => $outMovementBatchId,
                    'transfer_in_stock_movement_batch_id' => $inMovementBatchId,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

                $this->refreshBatchStatus(
                    $db,
                    $tenantId,
                    $allocation['stock_batch_id'],
                    $userId,
                    'stock_transfer',
                    $transferId,
                    $transferNumber,
                    $movementDate
                );
            }
        });

        return back()->with('success', 'Stock transferred with exact batch allocations.');
    }

    public function destroy(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);
        $this->ensureStockBelongsToTenant($stock, $tenantId);
        $db = DB::connection('mysql');

        if (abs((float) $stock->quantity) > 0.0001) {
            return back()->with(
                'error',
                'The stock position cannot be deleted while it has an available quantity.'
            );
        }

        $hasMovementHistory = $db->table('stock_movements')
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $stock->warehouse_id)
            ->where('product_id', $stock->product_id)
            ->exists();

        if ($hasMovementHistory) {
            return back()->with(
                'error',
                'The stock position cannot be deleted because movement history must be preserved.'
            );
        }

        $hasBatchBalanceRows = $db->table('warehouse_batch_stocks')
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $stock->warehouse_id)
            ->where('product_id', $stock->product_id)
            ->exists();

        if ($hasBatchBalanceRows) {
            return back()->with(
                'error',
                'The stock position cannot be deleted because batch balance records exist.'
            );
        }

        $stock->delete();

        return back()->with('success', 'Empty stock position deleted successfully.');
    }

    private function openingStockRules(int $tenantId): array
    {
        return [
            'warehouse_id' => [
                'required',
                'integer',
                Rule::exists('warehouses', 'id')->where(
                    fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                ),
            ],
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(
                    fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->where('is_active', true)
                        ->where('stock_tracking', 'tracked')
                        ->whereNull('deleted_at')
                ),
            ],
            'opening_quantity' => ['required', 'numeric', 'gt:0'],
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'max_stock_level' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            ...$this->batchInputRules(),
        ];
    }

    private function batchInputRules(): array
    {
        return [
            'batch_code' => ['nullable', 'string', 'max:100'],
            'lot_number' => ['nullable', 'string', 'max:120'],
            'received_date' => ['nullable', 'date'],
            'manufactured_date' => ['nullable', 'date'],
            'expiration_date' => ['nullable', 'date'],
            'batch_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    private function validateIncomingBatchData(
        Connection $db,
        int $tenantId,
        Product $product,
        array $validated,
        float $quantity,
        array $settings
    ): void {
        if ($quantity <= 0) {
            return;
        }

        $batchEnabled = (bool) $product->batch_tracking_enabled;
        $batchCode = $this->nullableUppercaseString($validated['batch_code'] ?? null);
        $manufacturedDate = $validated['manufactured_date'] ?? null;
        $expirationDate = $validated['expiration_date'] ?? null;

        if (
            $batchEnabled
            && ! (bool) $settings['auto_generate_batch_code']
            && $batchCode === null
        ) {
            throw ValidationException::withMessages([
                'batch_code' => 'A batch code is required because automatic batch code generation is disabled.',
            ]);
        }

        if (
            $batchEnabled
            && (bool) $product->requires_expiration_date
            && blank($expirationDate)
        ) {
            throw ValidationException::withMessages([
                'expiration_date' => 'An expiration date is required for this product.',
            ]);
        }

        if (
            filled($manufacturedDate)
            && filled($expirationDate)
            && $expirationDate < $manufacturedDate
        ) {
            throw ValidationException::withMessages([
                'expiration_date' => 'The expiration date must be on or after the manufactured date.',
            ]);
        }

        if (
            $batchCode !== null
            && $db->table('stock_batches')
                ->where('tenant_id', $tenantId)
                ->where('batch_code', $batchCode)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'batch_code' => 'This batch code is already in use.',
            ]);
        }
    }

    private function ensureBatchReconciled(
        Connection $db,
        int $tenantId,
        int $warehouseId,
        int $productId,
        float $aggregateQuantity
    ): void {
        $batchQuantity = $this->quantity(
            $db->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->select('quantity')
                ->lockForUpdate()
                ->get()
                ->sum('quantity')
        );

        if (abs($aggregateQuantity - $batchQuantity) > 0.0001) {
            throw ValidationException::withMessages([
                'quantity' => 'This stock position has a batch reconciliation mismatch. Repair the aggregate and batch balances before posting another transaction.',
            ]);
        }
    }

    private function validateStockLevels(
        float $reorderLevel,
        ?float $maxStockLevel
    ): void {
        if (
            $maxStockLevel !== null
            && $maxStockLevel < $reorderLevel
        ) {
            throw ValidationException::withMessages([
                'max_stock_level' => 'Maximum stock level must be equal to or greater than the reorder level.',
            ]);
        }
    }

    private function createIncomingBatch(
        Connection $db,
        int $tenantId,
        Product $product,
        array $validated,
        float $quantity,
        float $unitCost,
        string $sourceType,
        string $sourceReference,
        ?int $userId,
        array $settings,
        mixed $movementDate
    ): int {
        $batchEnabled = (bool) $product->batch_tracking_enabled;
        $providedCode = $this->nullableUppercaseString($validated['batch_code'] ?? null);
        $batchCode = $providedCode ?? $this->generateBatchCode(
            $db,
            $tenantId,
            $settings
        );

        $receivedDate = filled($validated['received_date'] ?? null)
            ? $validated['received_date']
            : $movementDate->toDateString();

        $manufacturedDate = $batchEnabled
            ? ($validated['manufactured_date'] ?? null)
            : null;

        $expirationDate = $batchEnabled
            ? ($validated['expiration_date'] ?? null)
            : null;

        $status = filled($expirationDate)
            && $expirationDate < $movementDate->toDateString()
                ? 'expired'
                : 'active';

        return $db->table('stock_batches')->insertGetId([
            'tenant_id' => $tenantId,
            'product_id' => $product->id,
            'supplier_id' => null,
            'purchase_receipt_item_id' => null,
            'batch_code' => $batchCode,
            'lot_number' => $batchEnabled
                ? $this->nullableString($validated['lot_number'] ?? null)
                : null,
            'source_type' => $sourceType,
            'source_reference' => $sourceReference,
            'received_date' => $receivedDate,
            'manufactured_date' => $manufacturedDate,
            'expiration_date' => $expirationDate,
            'unit_cost' => $unitCost,
            'original_quantity' => $quantity,
            'status' => $status,
            'notes' => $batchEnabled
                ? $this->nullableString($validated['batch_notes'] ?? null)
                : 'System-generated internal cost layer for a non-batch-managed product.',
            'created_by' => $userId,
            'created_at' => $movementDate,
            'updated_at' => $movementDate,
        ]);
    }

    private function allocateOutgoingBatches(
        Connection $db,
        int $tenantId,
        int $warehouseId,
        int $productId,
        Product $product,
        float $requiredQuantity,
        array $manualAllocations,
        string $purpose,
        array $settings
    ): array {
        $query = $db->table('warehouse_batch_stocks as wbs')
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
                    ->orWhereDate('sb.expiration_date', '<', now()->toDateString());
            });
        } elseif (
            ! (bool) $settings['allow_expired_issue']
            && ! in_array($purpose, ['damage', 'return_out'], true)
        ) {
            $query
                ->where('sb.status', '!=', 'expired')
                ->where(function ($query): void {
                    $query
                        ->whereNull('sb.expiration_date')
                        ->orWhereDate('sb.expiration_date', '>=', now()->toDateString());
                });
        }

        $policy = (bool) $product->batch_tracking_enabled
            ? (string) $product->batch_issue_policy
            : 'fifo';

        if ($policy === 'fefo') {
            $query
                ->orderByRaw('CASE WHEN sb.expiration_date IS NULL THEN 1 ELSE 0 END')
                ->orderBy('sb.expiration_date')
                ->orderBy('sb.received_date')
                ->orderBy('sb.id');
        } else {
            $query
                ->orderBy('sb.received_date')
                ->orderBy('sb.id');
        }

        $availableRows = $query
            ->lockForUpdate()
            ->get();

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
            if ($remaining <= 0.0001) {
                break;
            }

            $available = $this->quantity($row->available_quantity);
            $allocated = min($available, $remaining);

            if ($allocated <= 0) {
                continue;
            }

            $allocations[] = [
                'warehouse_batch_stock_id' => (int) $row->warehouse_batch_stock_id,
                'stock_batch_id' => (int) $row->stock_batch_id,
                'batch_code' => $row->batch_code,
                'quantity' => $this->quantity($allocated),
                'before' => $available,
                'unit_cost' => $this->cost($row->unit_cost),
            ];

            $remaining = $this->quantity($remaining - $allocated);
        }

        if ($remaining > 0.0001) {
            throw ValidationException::withMessages([
                'quantity' => $purpose === 'expired'
                    ? 'The requested quantity is greater than the available expired batch stock.'
                    : 'The requested quantity is greater than the eligible batch stock.',
            ]);
        }

        return $allocations;
    }

    private function buildManualAllocations(
        Collection $availableRows,
        array $manualAllocations,
        float $requiredQuantity
    ): array {
        $normalized = collect($manualAllocations)
            ->map(function (array $allocation): array {
                return [
                    'stock_batch_id' => (int) ($allocation['stock_batch_id'] ?? 0),
                    'quantity' => $this->quantity($allocation['quantity'] ?? 0),
                ];
            })
            ->filter(fn (array $allocation) => $allocation['quantity'] > 0)
            ->values();

        if ($normalized->isEmpty()) {
            throw ValidationException::withMessages([
                'batch_allocations' => 'Select at least one batch and enter its allocation quantity.',
            ]);
        }

        $allocatedTotal = $this->quantity($normalized->sum('quantity'));

        if (abs($allocatedTotal - $requiredQuantity) > 0.0001) {
            throw ValidationException::withMessages([
                'batch_allocations' => 'Manual batch allocations must exactly match the requested quantity.',
            ]);
        }

        $availableByBatch = $availableRows->keyBy(
            fn ($row) => (int) $row->stock_batch_id
        );

        return $normalized->map(function (array $allocation) use ($availableByBatch): array {
            $row = $availableByBatch->get($allocation['stock_batch_id']);

            if (! $row) {
                throw ValidationException::withMessages([
                    'batch_allocations' => 'One of the selected batches is unavailable or not eligible.',
                ]);
            }

            $available = $this->quantity($row->available_quantity);

            if ($allocation['quantity'] > $available + 0.0001) {
                throw ValidationException::withMessages([
                    'batch_allocations' => "Allocation for batch {$row->batch_code} exceeds its available quantity.",
                ]);
            }

            return [
                'warehouse_batch_stock_id' => (int) $row->warehouse_batch_stock_id,
                'stock_batch_id' => (int) $row->stock_batch_id,
                'batch_code' => $row->batch_code,
                'quantity' => $allocation['quantity'],
                'before' => $available,
                'unit_cost' => $this->cost($row->unit_cost),
            ];
        })->all();
    }

    private function addToBatchBalance(
        Connection $db,
        int $tenantId,
        int $warehouseId,
        int $productId,
        int $batchId,
        float $quantity,
        mixed $movementDate
    ): array {
        $row = $db->table('warehouse_batch_stocks')
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->where('stock_batch_id', $batchId)
            ->lockForUpdate()
            ->first();

        $before = $row
            ? $this->quantity($row->quantity)
            : 0.0;

        $after = $this->quantity($before + $quantity);

        if ($row) {
            $db->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('id', $row->id)
                ->update([
                    'quantity' => $after,
                    'last_movement_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);
        } else {
            $db->table('warehouse_batch_stocks')->insert([
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

        return [
            'before' => $before,
            'after' => $after,
        ];
    }

    private function syncWarehouseStockFromBatches(
        Connection $db,
        int $stockId,
        int $tenantId,
        int $warehouseId,
        int $productId,
        mixed $movementDate
    ): array {
        $totals = $db->table('warehouse_batch_stocks as wbs')
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

        $db->table('warehouse_stocks')
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

    private function createStockMovement(
        Connection $db,
        array $data
    ): int {
        return $db->table('stock_movements')->insertGetId([
            'tenant_id' => $data['tenant_id'],
            'warehouse_id' => $data['warehouse_id'],
            'product_id' => $data['product_id'],
            'is_batch_tracked' => true,
            'batch_allocation_status' => 'allocated',
            'movement_type' => $data['movement_type'],
            'quantity' => $data['quantity'],
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
            'reversal_of_movement_id' => null,
            'remarks' => $data['remarks'],
            'movement_date' => $data['movement_date'],
            'created_by' => $data['created_by'],
            'created_at' => $data['movement_date'],
            'updated_at' => $data['movement_date'],
        ]);
    }

    private function createMovementBatch(
        Connection $db,
        array $data
    ): int {
        return $db->table('stock_movement_batches')->insertGetId([
            'tenant_id' => $data['tenant_id'],
            'stock_movement_id' => $data['stock_movement_id'],
            'warehouse_id' => $data['warehouse_id'],
            'product_id' => $data['product_id'],
            'stock_batch_id' => $data['stock_batch_id'],
            'reversal_of_stock_movement_batch_id' => null,
            'direction' => $data['direction'],
            'quantity' => $data['quantity'],
            'batch_quantity_before' => $data['batch_quantity_before'],
            'batch_quantity_after' => $data['batch_quantity_after'],
            'unit_cost' => $data['unit_cost'],
            'total_cost' => $data['total_cost'],
            'created_at' => $data['created_at'],
            'updated_at' => $data['created_at'],
        ]);
    }

    private function refreshBatchStatus(
        Connection $db,
        int $tenantId,
        int $batchId,
        ?int $userId,
        string $referenceType,
        int $referenceId,
        string $referenceNo,
        mixed $changedAt
    ): void {
        $batch = $db->table('stock_batches')
            ->where('tenant_id', $tenantId)
            ->where('id', $batchId)
            ->lockForUpdate()
            ->first();

        if (! $batch) {
            return;
        }

        if (in_array($batch->status, ['quarantined', 'recalled', 'closed'], true)) {
            return;
        }

        $totalQuantity = $this->quantity(
            $db->table('warehouse_batch_stocks')
                ->where('tenant_id', $tenantId)
                ->where('stock_batch_id', $batchId)
                ->sum('quantity')
        );

        $newStatus = $totalQuantity <= 0.0001
            ? 'depleted'
            : (
                filled($batch->expiration_date)
                && $batch->expiration_date < $changedAt->toDateString()
                    ? 'expired'
                    : 'active'
            );

        if ($newStatus === $batch->status) {
            return;
        }

        $db->table('stock_batches')
            ->where('tenant_id', $tenantId)
            ->where('id', $batchId)
            ->update([
                'status' => $newStatus,
                'updated_at' => $changedAt,
            ]);

        $db->table('stock_batch_status_histories')->insert([
            'tenant_id' => $tenantId,
            'stock_batch_id' => $batchId,
            'previous_status' => $batch->status,
            'new_status' => $newStatus,
            'reason' => 'Status synchronized from the remaining warehouse batch quantity.',
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'reference_no' => $referenceNo,
            'changed_by' => $userId,
            'changed_at' => $changedAt,
            'created_at' => $changedAt,
            'updated_at' => $changedAt,
        ]);
    }

    private function attachBatchDetails(
        Connection $db,
        Collection $stocks,
        int $tenantId
    ): void {
        if ($stocks->isEmpty()) {
            return;
        }

        $warehouseIds = $stocks->pluck('warehouse_id')->unique()->values();
        $productIds = $stocks->pluck('product_id')->unique()->values();

        $batchRows = $db->table('vw_batch_inventory')
            ->where('tenant_id', $tenantId)
            ->whereIn('warehouse_id', $warehouseIds)
            ->whereIn('product_id', $productIds)
            ->where('quantity', '>', 0)
            ->orderByRaw('CASE WHEN expiration_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('expiration_date')
            ->orderBy('received_date')
            ->orderBy('stock_batch_id')
            ->get()
            ->groupBy(fn ($row) => "{$row->warehouse_id}:{$row->product_id}");

        foreach ($stocks as $stock) {
            $key = "{$stock->warehouse_id}:{$stock->product_id}";
            $rows = $batchRows->get($key, collect());
            $batchQuantity = $this->quantity($rows->sum('quantity'));
            $aggregateQuantity = $this->quantity($stock->quantity);

            if ($stock->product) {
                $stock->product->setAttribute(
                    'batch_tracking_enabled',
                    (bool) $stock->product->batch_tracking_enabled
                );
                $stock->product->setAttribute(
                    'requires_expiration_date',
                    (bool) $stock->product->requires_expiration_date
                );
            }

            $stock->setAttribute('batch_stocks', $rows->map(function ($row): array {
                return [
                    'warehouse_batch_stock_id' => (int) $row->warehouse_batch_stock_id,
                    'stock_batch_id' => (int) $row->stock_batch_id,
                    'batch_code' => $row->batch_code,
                    'lot_number' => $row->lot_number,
                    'source_type' => $row->source_type,
                    'source_reference' => $row->source_reference,
                    'received_date' => $row->received_date,
                    'manufactured_date' => $row->manufactured_date,
                    'expiration_date' => $row->expiration_date,
                    'unit_cost' => $row->unit_cost,
                    'original_quantity' => $row->original_quantity,
                    'batch_status' => $row->batch_status,
                    'quantity' => $row->quantity,
                    'batch_value' => $row->batch_value,
                    'last_movement_at' => $row->last_movement_at,
                    'days_to_expiry' => $row->days_to_expiry !== null
                        ? (int) $row->days_to_expiry
                        : null,
                    'expiry_state' => $row->expiry_state,
                ];
            })->values());

            $stock->setAttribute('batch_count', $rows->count());
            $stock->setAttribute('batch_quantity', $batchQuantity);
            $stock->setAttribute(
                'reconciliation_difference',
                $this->quantity($aggregateQuantity - $batchQuantity)
            );
            $stock->setAttribute(
                'is_reconciled',
                abs($aggregateQuantity - $batchQuantity) <= 0.0001
            );
            $stock->setAttribute(
                'expiring_batch_count',
                $rows->whereIn('expiry_state', ['warning', 'critical'])->count()
            );
            $stock->setAttribute(
                'expired_batch_count',
                $rows->where('expiry_state', 'expired')->count()
            );
        }
    }

    private function getInventorySettings(
        Connection $db,
        int $tenantId
    ): array {
        $settings = $db->table('inventory_settings')
            ->where('tenant_id', $tenantId)
            ->first();

        return [
            'batch_code_prefix' => $settings?->batch_code_prefix ?? 'BAT',
            'batch_code_sequence_padding' => (int) (
                $settings?->batch_code_sequence_padding ?? 6
            ),
            'auto_generate_batch_code' => (bool) (
                $settings?->auto_generate_batch_code ?? true
            ),
            'default_batch_issue_policy' => $settings?->default_batch_issue_policy ?? 'fifo',
            'expiry_warning_days' => (int) ($settings?->expiry_warning_days ?? 30),
            'expiry_critical_days' => (int) ($settings?->expiry_critical_days ?? 7),
            'allow_expired_issue' => (bool) ($settings?->allow_expired_issue ?? false),
            'allow_negative_stock' => (bool) ($settings?->allow_negative_stock ?? false),
            'require_batch_for_tracked_products' => (bool) (
                $settings?->require_batch_for_tracked_products ?? false
            ),
        ];
    }

    private function generateBatchCode(
        Connection $db,
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

        $padding = max(
            3,
            min(12, (int) $settings['batch_code_sequence_padding'])
        );

        do {
            $code = sprintf(
                '%s-%s-%s',
                $prefix,
                now()->format('Ymd'),
                Str::upper(Str::random($padding))
            );
        } while (
            $db->table('stock_batches')
                ->where('tenant_id', $tenantId)
                ->where('batch_code', $code)
                ->exists()
        );

        return $code;
    }

    private function mapAdjustmentType(string $movementType): string
    {
        return match ($movementType) {
            'stock_in' => 'stock_in',
            'stock_out' => 'stock_out',
            'adjustment_in' => 'correction_in',
            'adjustment_out' => 'correction_out',
            'return_in' => 'return_in',
            'return_out' => 'return_out',
            'damage' => 'damage',
            'expired' => 'expired',
            default => 'other',
        };
    }

    private function incomingBatchSourceType(string $movementType): string
    {
        return match ($movementType) {
            'return_in' => 'return_in',
            default => 'adjustment',
        };
    }

    private function movementReason(string $movementType): string
    {
        return match ($movementType) {
            'stock_in' => 'Manual stock-in',
            'stock_out' => 'Manual stock-out',
            'adjustment_in' => 'Inventory correction in',
            'adjustment_out' => 'Inventory correction out',
            'return_in' => 'Returned stock received',
            'return_out' => 'Stock returned out',
            'damage' => 'Damaged stock removal',
            'expired' => 'Expired stock removal',
            default => 'Inventory adjustment',
        };
    }

    private function getTenantId(Request $request): int
    {
        $tenantId = (int) ($request->user()?->client_id ?? 0);

        if ($tenantId <= 0 && app()->environment('local')) {
            return 1;
        }

        abort_if(
            $tenantId <= 0,
            403,
            'Your account is not assigned to a client.'
        );

        return $tenantId;
    }

    private function ensureStockBelongsToTenant(
        WarehouseStock $stock,
        int $tenantId
    ): void {
        abort_unless((int) $stock->tenant_id === $tenantId, 404);
    }

    private function generateReferenceNumber(string $prefix): string
    {
        return sprintf(
            '%s-%s-%s',
            Str::upper($prefix),
            now()->format('YmdHis'),
            Str::upper(Str::random(6))
        );
    }

    private function quantity(mixed $value): float
    {
        return round((float) $value, 3);
    }

    private function cost(mixed $value): float
    {
        return round((float) $value, 4);
    }

    private function money(mixed $value): float
    {
        return round((float) $value, 2);
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }

    private function nullableUppercaseString(mixed $value): ?string
    {
        $value = $this->nullableString($value);

        return $value !== null ? Str::upper($value) : null;
    }
}