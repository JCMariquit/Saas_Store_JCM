<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Services\Inventory\InventoryAccessContext;
use App\Services\Inventory\InventoryLedgerService;
use App\Services\Subscriptions\SubscriptionAccessService;
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

    public function __construct(
        private readonly InventoryAccessContext $access,
        private readonly InventoryLedgerService $ledger,
        private readonly SubscriptionAccessService $subscriptions
    ) {
    }

    public function index(Request $request): Response
    {
        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $db = DB::connection('mysql');
        $inventorySettings = $this->getInventorySettings($db, $tenantId);

        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));
        $batchStatus = trim((string) $request->input('batch_status', ''));
        $branchId = (int) (
            $this->access->selectedBranchId(
                $context,
                $request->input('branch_id')
            ) ?? 0
        );
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
            ->where('tenant_id', $tenantId)
            ->when(
                $branchId > 0,
                fn (Builder $query) => $query->whereHas(
                    'warehouse',
                    fn (Builder $query) =>
                        $query->where('branch_id', $branchId)
                )
            );

        $totalQuantity = (float) ((clone $summaryQuery)->sum('quantity') ?? 0);

        $inventoryValue = (float) (
            (clone $summaryQuery)
                ->selectRaw('COALESCE(SUM(quantity * average_cost), 0) as total_value')
                ->value('total_value') ?? 0
        );

        $activeBatchQuery = $db->table('vw_batch_inventory')
            ->where('tenant_id', $tenantId)
            ->when(
                $branchId > 0,
                fn ($query) => $query->where('branch_id', $branchId)
            )
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
            ->whereRaw('BINARY `expiry_state` IN (?, ?)', ['warning', 'critical'])
            ->distinct()
            ->count('warehouse_batch_stock_id');
        $expiredBatchCount = (clone $activeBatchQuery)
            ->whereRaw('BINARY `expiry_state` = ?', ['expired'])
            ->distinct()
            ->count('warehouse_batch_stock_id');
        $reconciliationMismatchCount = $db
            ->table('vw_batch_stock_reconciliation')
            ->where('tenant_id', $tenantId)
            ->when(
                $branchId > 0,
                fn ($query) => $query->where('branch_id', $branchId)
            )
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
            ->when(
                $branchId > 0,
                fn ($query) => $query->where('w.branch_id', $branchId)
            )
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
            ->when(
                $branchId > 0,
                fn ($query) => $query->where('w.branch_id', $branchId)
            )
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
            ->whereRaw(
                'BINARY `expiry_state` IN (?, ?, ?)',
                ['warning', 'critical', 'expired']
            )
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
            ->when(
                $branchId > 0,
                fn (Builder $query) => $query->whereKey($branchId)
            )
            ->where('is_active', true)
            ->select(['id', 'name', 'code', 'is_main'])
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get();

        $warehouses = Warehouse::query()
            ->where('tenant_id', $tenantId)
            ->when(
                $branchId > 0,
                fn (Builder $query) =>
                    $query->where('branch_id', $branchId)
            )
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
            ->when(
                $branchId > 0,
                fn ($query) => $query->whereIn(
                    'warehouse_id',
                    $warehouses->pluck('id')
                )
            )
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
            'capabilities' =>
                $this->subscriptionCapabilities($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureWriteAccess($request);

        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $validated = $request->validate($this->openingStockRules($tenantId));

        $warehouseId = (int) $validated['warehouse_id'];
        $productId = (int) $validated['product_id'];
        $quantity = $this->quantity($validated['opening_quantity']);
        $reorderLevel = $this->quantity($validated['reorder_level']);
        $maxStockLevel = filled($validated['max_stock_level'] ?? null)
            ? $this->quantity($validated['max_stock_level'])
            : null;

        $this->validateStockLevels($reorderLevel, $maxStockLevel);
        $createdNewPosition = false;

        DB::connection('mysql')->transaction(function () use (
            $request,
            $context,
            $tenantId,
            $validated,
            $warehouseId,
            $productId,
            $quantity,
            $reorderLevel,
            $maxStockLevel,
            &$createdNewPosition
        ): void {
            $database = DB::connection('mysql');
            $movementDate = now();
            $warehouse = $this->ledger->lockWarehouse(
                $tenantId,
                $warehouseId
            );
            $this->access->assertBranch($context, (int) $warehouse->branch_id);

            $product = $this->ledger->lockProduct($tenantId, $productId);
            $existingStock = $database
                ->table('warehouse_stocks')
                ->where('tenant_id', $tenantId)
                ->where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->lockForUpdate()
                ->first();

            $createdNewPosition = ! $existingStock;
            $averageCostBefore = $existingStock
                ? $this->cost($existingStock->average_cost)
                : 0.0;
            $unitCost = filled($validated['unit_cost'] ?? null)
                ? $this->cost($validated['unit_cost'])
                : ($averageCostBefore > 0
                    ? $averageCostBefore
                    : $this->cost($product->cost_price));

            $adjustmentNumber = $this->generateReferenceNumber(
                $createdNewPosition ? 'OPEN' : 'STK'
            );
            $movementType = $createdNewPosition
                ? 'opening_stock'
                : 'stock_in';
            $adjustmentType = $createdNewPosition
                ? 'opening_stock'
                : 'stock_in';
            $reason = $createdNewPosition
                ? 'Initial warehouse stock position'
                : 'Additional warehouse stock';
            $remarks = $this->nullableString($validated['remarks'] ?? null);
            $userId = (int) $request->user()->id;

            $adjustmentId = $database
                ->table('stock_adjustments')
                ->insertGetId([
                    'tenant_id' => $tenantId,
                    'branch_id' => (int) $warehouse->branch_id,
                    'warehouse_id' => $warehouseId,
                    'adjustment_number' => $adjustmentNumber,
                    'adjustment_date' => $movementDate->toDateString(),
                    'adjustment_type' => $adjustmentType,
                    'status' => 'posted',
                    'reference_no' => null,
                    'reason' => $reason,
                    'notes' => $remarks,
                    'total_quantity' => $quantity,
                    'total_cost' => 0,
                    'created_by' => $userId,
                    'posted_by' => $userId,
                    'posted_at' => $movementDate,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

            $adjustmentItemId = $database
                ->table('stock_adjustment_items')
                ->insertGetId([
                    'tenant_id' => $tenantId,
                    'stock_adjustment_id' => $adjustmentId,
                    'product_id' => $productId,
                    'direction' => 'in',
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'line_total' => 0,
                    'stock_movement_id' => null,
                    'void_stock_movement_id' => null,
                    'notes' => $remarks,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

            $ledgerResult = $this->ledger->postIncoming([
                'tenant_id' => $tenantId,
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'movement_type' => $movementType,
                'reference_type' => 'stock_adjustment',
                'reference_id' => $adjustmentId,
                'reference_no' => $adjustmentNumber,
                'source_type' => $createdNewPosition
                    ? 'opening_stock'
                    : 'adjustment',
                'source_reference' => $adjustmentNumber,
                'user_id' => $userId,
                'movement_date' => $movementDate,
                'remarks' => $remarks,
                'reorder_level' => $reorderLevel,
                'max_stock_level' => $maxStockLevel,
                'layers' => [[
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'batch_code' => $validated['batch_code'] ?? null,
                    'lot_number' => $validated['lot_number'] ?? null,
                    'received_date' => $validated['received_date']
                        ?? $movementDate->toDateString(),
                    'manufactured_date' =>
                        $validated['manufactured_date'] ?? null,
                    'expiration_date' =>
                        $validated['expiration_date'] ?? null,
                    'notes' => $validated['batch_notes'] ?? null,
                ]],
            ]);

            $database
                ->table('stock_adjustments')
                ->where('tenant_id', $tenantId)
                ->where('id', $adjustmentId)
                ->update([
                    'total_cost' => $ledgerResult['total_cost'],
                    'updated_at' => $movementDate,
                ]);

            $database
                ->table('stock_adjustment_items')
                ->where('tenant_id', $tenantId)
                ->where('id', $adjustmentItemId)
                ->update([
                    'unit_cost' => $ledgerResult['unit_cost'],
                    'line_total' => $ledgerResult['total_cost'],
                    'stock_movement_id' => $ledgerResult['movement_id'],
                    'updated_at' => $movementDate,
                ]);

            foreach ($ledgerResult['allocations'] as $allocation) {
                $database
                    ->table('stock_adjustment_item_batches')
                    ->insert([
                        'tenant_id' => $tenantId,
                        'stock_adjustment_item_id' => $adjustmentItemId,
                        'warehouse_id' => $warehouseId,
                        'product_id' => $productId,
                        'stock_batch_id' => $allocation['stock_batch_id'],
                        'direction' => 'in',
                        'quantity' => $allocation['quantity'],
                        'unit_cost' => $allocation['unit_cost'],
                        'line_total' => $allocation['total_cost'],
                        'stock_movement_batch_id' =>
                            $allocation['stock_movement_batch_id'],
                        'void_stock_movement_batch_id' => null,
                        'created_at' => $movementDate,
                        'updated_at' => $movementDate,
                    ]);
            }
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
        $this->ensureWriteAccess($request);

        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $this->ensureStockBelongsToTenant($stock, $tenantId);

        $warehouse = DB::connection('mysql')
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
            ->where('id', $stock->warehouse_id)
            ->first();
        abort_unless($warehouse, 404);
        $this->access->assertBranch($context, (int) $warehouse->branch_id);

        $validated = $request->validate([
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'max_stock_level' => ['nullable', 'numeric', 'min:0'],
        ]);

        $reorderLevel = $this->quantity($validated['reorder_level']);
        $maxStockLevel = filled($validated['max_stock_level'] ?? null)
            ? $this->quantity($validated['max_stock_level'])
            : null;
        $this->validateStockLevels($reorderLevel, $maxStockLevel);

        DB::connection('mysql')
            ->table('warehouse_stocks')
            ->where('tenant_id', $tenantId)
            ->where('id', $stock->id)
            ->update([
                'reorder_level' => $reorderLevel,
                'max_stock_level' => $maxStockLevel,
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Stock thresholds updated successfully.');
    }


    public function adjust(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $this->ensureWriteAccess($request);

        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $this->ensureStockBelongsToTenant($stock, $tenantId);

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
            'batch_allocations.*.stock_batch_id' => [
                'required',
                'integer',
                'distinct',
            ],
            'batch_allocations.*.quantity' => [
                'nullable',
                'numeric',
                'gt:0',
            ],
        ]);

        $quantity = $this->quantity($validated['quantity']);
        $isIncoming = in_array(
            $validated['movement_type'],
            self::INCOMING_MOVEMENT_TYPES,
            true
        );

        DB::connection('mysql')->transaction(function () use (
            $request,
            $context,
            $tenantId,
            $stock,
            $validated,
            $quantity,
            $isIncoming
        ): void {
            $database = DB::connection('mysql');
            $movementDate = now();
            $lockedStock = $this->ledger->lockExistingStockPosition(
                $tenantId,
                (int) $stock->warehouse_id,
                (int) $stock->product_id
            );
            $warehouse = $this->ledger->lockWarehouse(
                $tenantId,
                (int) $lockedStock->warehouse_id
            );
            $this->access->assertBranch($context, (int) $warehouse->branch_id);
            $product = $this->ledger->lockProduct(
                $tenantId,
                (int) $lockedStock->product_id
            );

            $movementType = (string) $validated['movement_type'];
            $adjustmentNumber = $this->generateReferenceNumber('ADJ');
            $remarks = $this->nullableString($validated['remarks'] ?? null);
            $userId = (int) $request->user()->id;

            $adjustmentId = $database
                ->table('stock_adjustments')
                ->insertGetId([
                    'tenant_id' => $tenantId,
                    'branch_id' => (int) $warehouse->branch_id,
                    'warehouse_id' => (int) $lockedStock->warehouse_id,
                    'adjustment_number' => $adjustmentNumber,
                    'adjustment_date' => $movementDate->toDateString(),
                    'adjustment_type' => $this->mapAdjustmentType($movementType),
                    'status' => 'posted',
                    'reference_no' => $this->nullableString(
                        $validated['reference_no'] ?? null
                    ),
                    'reason' => $this->movementReason($movementType),
                    'notes' => $remarks,
                    'total_quantity' => $quantity,
                    'total_cost' => 0,
                    'created_by' => $userId,
                    'posted_by' => $userId,
                    'posted_at' => $movementDate,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

            $direction = $isIncoming ? 'in' : 'out';
            $adjustmentItemId = $database
                ->table('stock_adjustment_items')
                ->insertGetId([
                    'tenant_id' => $tenantId,
                    'stock_adjustment_id' => $adjustmentId,
                    'product_id' => (int) $lockedStock->product_id,
                    'direction' => $direction,
                    'quantity' => $quantity,
                    'unit_cost' => 0,
                    'line_total' => 0,
                    'stock_movement_id' => null,
                    'void_stock_movement_id' => null,
                    'notes' => $remarks,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

            if ($isIncoming) {
                $averageCost = $this->cost($lockedStock->average_cost);
                $unitCost = filled($validated['unit_cost'] ?? null)
                    ? $this->cost($validated['unit_cost'])
                    : ($averageCost > 0
                        ? $averageCost
                        : $this->cost($product->cost_price));

                $result = $this->ledger->postIncoming([
                    'tenant_id' => $tenantId,
                    'warehouse_id' => (int) $lockedStock->warehouse_id,
                    'product_id' => (int) $lockedStock->product_id,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'movement_type' => $movementType,
                    'reference_type' => 'stock_adjustment',
                    'reference_id' => $adjustmentId,
                    'reference_no' => $adjustmentNumber,
                    'source_type' => $this->incomingBatchSourceType(
                        $movementType
                    ),
                    'source_reference' => $adjustmentNumber,
                    'user_id' => $userId,
                    'movement_date' => $movementDate,
                    'remarks' => $remarks,
                    'layers' => [[
                        'quantity' => $quantity,
                        'unit_cost' => $unitCost,
                        'batch_code' => $validated['batch_code'] ?? null,
                        'lot_number' => $validated['lot_number'] ?? null,
                        'received_date' => $validated['received_date']
                            ?? $movementDate->toDateString(),
                        'manufactured_date' =>
                            $validated['manufactured_date'] ?? null,
                        'expiration_date' =>
                            $validated['expiration_date'] ?? null,
                        'notes' => $validated['batch_notes'] ?? null,
                    ]],
                ]);
            } else {
                $result = $this->ledger->postOutgoing([
                    'tenant_id' => $tenantId,
                    'warehouse_id' => (int) $lockedStock->warehouse_id,
                    'product_id' => (int) $lockedStock->product_id,
                    'quantity' => $quantity,
                    'movement_type' => $movementType,
                    'reference_type' => 'stock_adjustment',
                    'reference_id' => $adjustmentId,
                    'reference_no' => $adjustmentNumber,
                    'user_id' => $userId,
                    'movement_date' => $movementDate,
                    'remarks' => $remarks,
                    'purpose' => $movementType,
                    'batch_allocations' =>
                        $validated['batch_allocations'] ?? [],
                ]);
            }

            $database
                ->table('stock_adjustments')
                ->where('tenant_id', $tenantId)
                ->where('id', $adjustmentId)
                ->update([
                    'total_cost' => $result['total_cost'],
                    'updated_at' => $movementDate,
                ]);

            $database
                ->table('stock_adjustment_items')
                ->where('tenant_id', $tenantId)
                ->where('id', $adjustmentItemId)
                ->update([
                    'unit_cost' => $result['unit_cost'],
                    'line_total' => $result['total_cost'],
                    'stock_movement_id' => $result['movement_id'],
                    'updated_at' => $movementDate,
                ]);

            foreach ($result['allocations'] as $allocation) {
                $database
                    ->table('stock_adjustment_item_batches')
                    ->insert([
                        'tenant_id' => $tenantId,
                        'stock_adjustment_item_id' => $adjustmentItemId,
                        'warehouse_id' => (int) $lockedStock->warehouse_id,
                        'product_id' => (int) $lockedStock->product_id,
                        'stock_batch_id' => $allocation['stock_batch_id'],
                        'direction' => $direction,
                        'quantity' => $allocation['quantity'],
                        'unit_cost' => $allocation['unit_cost'],
                        'line_total' => $allocation['total_cost'],
                        'stock_movement_batch_id' =>
                            $allocation['stock_movement_batch_id'],
                        'void_stock_movement_batch_id' => null,
                        'created_at' => $movementDate,
                        'updated_at' => $movementDate,
                    ]);
            }
        });

        return back()->with(
            'success',
            'Stock adjustment posted with exact batch allocations.'
        );
    }


    public function transfer(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $this->ensureWriteAccess($request);

        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $this->ensureStockBelongsToTenant($stock, $tenantId);

        $validated = $request->validate([
            'to_warehouse_id' => [
                'required',
                'integer',
                Rule::exists('warehouses', 'id')->where(
                    fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                ),
                Rule::notIn([(int) $stock->warehouse_id]),
            ],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'reference_no' => ['nullable', 'string', 'max:120'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'batch_allocations' => ['nullable', 'array'],
            'batch_allocations.*.stock_batch_id' => [
                'required',
                'integer',
                'distinct',
            ],
            'batch_allocations.*.quantity' => [
                'nullable',
                'numeric',
                'gt:0',
            ],
        ]);

        DB::connection('mysql')->transaction(function () use (
            $request,
            $context,
            $tenantId,
            $stock,
            $validated
        ): void {
            $database = DB::connection('mysql');
            $movementDate = now();
            $sourceWarehouseId = (int) $stock->warehouse_id;
            $destinationWarehouseId =
                (int) $validated['to_warehouse_id'];
            $warehouseIds = [
                $sourceWarehouseId,
                $destinationWarehouseId,
            ];
            sort($warehouseIds, SORT_NUMERIC);

            $lockedWarehouses = [];
            foreach ($warehouseIds as $warehouseId) {
                $lockedWarehouses[$warehouseId] =
                    $this->ledger->lockWarehouse(
                        $tenantId,
                        $warehouseId
                    );
            }

            $sourceWarehouse =
                $lockedWarehouses[$sourceWarehouseId];
            $destinationWarehouse =
                $lockedWarehouses[$destinationWarehouseId];
            $this->access->assertBranch(
                $context,
                (int) $sourceWarehouse->branch_id
            );
            $this->access->assertBranch(
                $context,
                (int) $destinationWarehouse->branch_id
            );

            $quantity = $this->quantity($validated['quantity']);
            $transferNumber = $this->generateReferenceNumber('TRF');
            $remarks = $this->nullableString($validated['remarks'] ?? null);
            $userId = (int) $request->user()->id;

            $transferId = $database
                ->table('stock_transfers')
                ->insertGetId([
                    'tenant_id' => $tenantId,
                    'from_branch_id' => (int) $sourceWarehouse->branch_id,
                    'from_warehouse_id' => (int) $stock->warehouse_id,
                    'to_branch_id' => (int) $destinationWarehouse->branch_id,
                    'to_warehouse_id' =>
                        (int) $validated['to_warehouse_id'],
                    'transfer_number' => $transferNumber,
                    'transfer_date' => $movementDate->toDateString(),
                    'expected_receive_date' =>
                        $movementDate->toDateString(),
                    'status' => 'received',
                    'reference_no' => $this->nullableString(
                        $validated['reference_no'] ?? null
                    ),
                    'notes' => $remarks,
                    'total_quantity_sent' => $quantity,
                    'total_quantity_received' => $quantity,
                    'total_cost' => 0,
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

            $transferItemId = $database
                ->table('stock_transfer_items')
                ->insertGetId([
                    'tenant_id' => $tenantId,
                    'stock_transfer_id' => $transferId,
                    'product_id' => (int) $stock->product_id,
                    'quantity_requested' => $quantity,
                    'quantity_sent' => $quantity,
                    'quantity_received' => $quantity,
                    'unit_cost' => 0,
                    'line_total' => 0,
                    'transfer_out_stock_movement_id' => null,
                    'transfer_in_stock_movement_id' => null,
                    'void_out_stock_movement_id' => null,
                    'void_in_stock_movement_id' => null,
                    'notes' => $remarks,
                    'created_at' => $movementDate,
                    'updated_at' => $movementDate,
                ]);

            $result = $this->ledger->transfer([
                'tenant_id' => $tenantId,
                'from_warehouse_id' => (int) $stock->warehouse_id,
                'to_warehouse_id' => (int) $validated['to_warehouse_id'],
                'product_id' => (int) $stock->product_id,
                'quantity' => $quantity,
                'reference_type' => 'stock_transfer',
                'reference_id' => $transferId,
                'reference_no' => $transferNumber,
                'user_id' => $userId,
                'movement_date' => $movementDate,
                'remarks' => $remarks,
                'batch_allocations' =>
                    $validated['batch_allocations'] ?? [],
            ]);

            $database
                ->table('stock_transfers')
                ->where('tenant_id', $tenantId)
                ->where('id', $transferId)
                ->update([
                    'total_cost' => $result['total_cost'],
                    'updated_at' => $movementDate,
                ]);

            $database
                ->table('stock_transfer_items')
                ->where('tenant_id', $tenantId)
                ->where('id', $transferItemId)
                ->update([
                    'unit_cost' => $result['unit_cost'],
                    'line_total' => $result['total_cost'],
                    'transfer_out_stock_movement_id' =>
                        $result['out_movement_id'],
                    'transfer_in_stock_movement_id' =>
                        $result['in_movement_id'],
                    'updated_at' => $movementDate,
                ]);

            foreach ($result['allocations'] as $allocation) {
                $database
                    ->table('stock_transfer_item_batches')
                    ->insert([
                        'tenant_id' => $tenantId,
                        'stock_transfer_item_id' => $transferItemId,
                        'product_id' => (int) $stock->product_id,
                        'stock_batch_id' => $allocation['stock_batch_id'],
                        'from_warehouse_id' => (int) $stock->warehouse_id,
                        'to_warehouse_id' =>
                            (int) $validated['to_warehouse_id'],
                        'quantity_sent' => $allocation['quantity'],
                        'quantity_received' => $allocation['quantity'],
                        'unit_cost' => $allocation['unit_cost'],
                        'line_total' => $allocation['total_cost'],
                        'transfer_out_stock_movement_batch_id' =>
                            $allocation[
                                'transfer_out_stock_movement_batch_id'
                            ],
                        'transfer_in_stock_movement_batch_id' =>
                            $allocation[
                                'transfer_in_stock_movement_batch_id'
                            ],
                        'void_out_stock_movement_batch_id' => null,
                        'void_in_stock_movement_batch_id' => null,
                        'created_at' => $movementDate,
                        'updated_at' => $movementDate,
                    ]);
            }
        });

        return back()->with(
            'success',
            'Stock transferred with exact batch allocations.'
        );
    }


    public function destroy(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $this->ensureWriteAccess($request);

        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $this->ensureStockBelongsToTenant($stock, $tenantId);
        $database = DB::connection('mysql');

        $warehouse = $database
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
            ->where('id', $stock->warehouse_id)
            ->first();
        abort_unless($warehouse, 404);
        $this->access->assertBranch($context, (int) $warehouse->branch_id);

        if (abs((float) $stock->quantity) > 0.0001) {
            return back()->with(
                'error',
                'The stock position cannot be deleted while it has an available quantity.'
            );
        }

        $hasMovementHistory = $database
            ->table('stock_movements')
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

        $hasBatchBalanceRows = $database
            ->table('warehouse_batch_stocks')
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

        $database
            ->table('warehouse_stocks')
            ->where('tenant_id', $tenantId)
            ->where('id', $stock->id)
            ->delete();

        return back()->with(
            'success',
            'Empty stock position deleted successfully.'
        );
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


    /**
     * @return array{
     *     access_mode: string,
     *     is_read_only: bool,
     *     can_write: bool,
     *     can_export: bool,
     *     message: string|null
     * }
     */
    private function subscriptionCapabilities(
        Request $request
    ): array {
        $user = $request->user();
        $context = $user
            ? $this->subscriptions->summary($user)
            : null;

        $accessMode = (string) (
            $context['access_mode'] ?? 'blocked'
        );

        $canOperate = $accessMode === 'full';
        $isReadOnly = $accessMode === 'read_only';

        return [
            'access_mode' => $accessMode,
            'is_read_only' => $isReadOnly,
            'can_write' => $canOperate,
            'can_export' => $canOperate,
            'message' => $isReadOnly
                ? 'Subscription expired or past due. Existing stock records remain available in read-only mode.'
                : (
                    $accessMode === 'blocked'
                        ? 'Renew the owner subscription to continue using JCM Inventory.'
                        : null
                ),
        ];
    }

    private function ensureWriteAccess(
        Request $request
    ): void {
        $capabilities =
            $this->subscriptionCapabilities($request);

        abort_unless(
            $capabilities['can_write'],
            403,
            'Your subscription is read-only. Renew the owner subscription to change stock records.'
        );
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


}