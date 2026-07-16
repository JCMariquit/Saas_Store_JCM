<?php

namespace App\Http\Controllers;

use Carbon\CarbonImmutable;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockOverviewController extends Controller
{
    private const INCOMING_MOVEMENT_TYPES = [
        'opening_stock',
        'stock_in',
        'adjustment_in',
        'transfer_in',
        'purchase_receipt',
        'return_in',
    ];

    private const OUTGOING_MOVEMENT_TYPES = [
        'stock_out',
        'adjustment_out',
        'transfer_out',
        'purchase_receipt_void',
        'sale',
        'return_out',
        'damage',
        'expired',
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user, 401);

        $tenantId = (int) ($user->client_id ?: $user->id);

        abort_if(
            $tenantId <= 0,
            403,
            'No inventory tenant is assigned to this account.',
        );

        $branchId = $this->resolveBranchScope($user);
        $db = app('db')->connection();

        $stockQuery = $this->stockPositionQuery(
            db: $db,
            tenantId: $tenantId,
            branchId: $branchId,
        );

        $summary = (clone $stockQuery)
            ->selectRaw(
                <<<'SQL'
                COUNT(ws.id) AS positions,
                COALESCE(SUM(GREATEST(ws.quantity, 0)), 0) AS total_quantity,
                COALESCE(SUM(GREATEST(ws.quantity, 0) * ws.average_cost), 0) AS inventory_value,
                COALESCE(SUM(CASE WHEN ws.quantity > ws.reorder_level THEN 1 ELSE 0 END), 0) AS healthy,
                COALESCE(SUM(CASE WHEN ws.quantity > 0 AND ws.quantity <= ws.reorder_level THEN 1 ELSE 0 END), 0) AS low_stock,
                COALESCE(SUM(CASE WHEN ws.quantity <= 0 THEN 1 ELSE 0 END), 0) AS out_of_stock,
                COALESCE(SUM(CASE WHEN ws.last_movement_at IS NULL OR ws.last_movement_at < ? THEN 1 ELSE 0 END), 0) AS dormant
                SQL,
                [
                    CarbonImmutable::now()
                        ->subDays(30)
                        ->startOfDay(),
                ],
            )
            ->first();

        $trackedProducts = $this->trackedProductCount(
            db: $db,
            tenantId: $tenantId,
        );

        $productsWithStock = (clone $stockQuery)
            ->where('ws.quantity', '>', 0)
            ->distinct()
            ->count('ws.product_id');

        $movementWindowStart = CarbonImmutable::now()
            ->subDays(29)
            ->startOfDay();

        $movementWindowEnd = CarbonImmutable::now()
            ->endOfDay();

        return Inertia::render('dashboard/stock-overview/index', [
            'context' => [
                'scopeLabel' => $branchId
                    ? $this->branchName(
                        db: $db,
                        tenantId: $tenantId,
                        branchId: $branchId,
                    )
                    : 'All branches',
                'activeProducts' => $this->activeProductCount(
                    db: $db,
                    tenantId: $tenantId,
                ),
                'trackedProducts' => $trackedProducts,
                'activeWarehouses' => $this->activeWarehouseCount(
                    db: $db,
                    tenantId: $tenantId,
                    branchId: $branchId,
                ),
            ],

            'summary' => [
                'positions' => (int) ($summary->positions ?? 0),
                'totalQuantity' => round(
                    (float) ($summary->total_quantity ?? 0),
                    3,
                ),
                'inventoryValue' => round(
                    (float) ($summary->inventory_value ?? 0),
                    2,
                ),
                'healthy' => (int) ($summary->healthy ?? 0),
                'lowStock' => (int) ($summary->low_stock ?? 0),
                'outOfStock' => (int) ($summary->out_of_stock ?? 0),
                'dormant' => (int) ($summary->dormant ?? 0),
                'productsWithStock' => $productsWithStock,
                'coveragePercentage' => $trackedProducts > 0
                    ? round(
                        ($productsWithStock / $trackedProducts) * 100,
                        1,
                    )
                    : 0.0,
            ],

            'stockHealth' => [
                'healthy' => (int) ($summary->healthy ?? 0),
                'lowStock' => (int) ($summary->low_stock ?? 0),
                'outOfStock' => (int) ($summary->out_of_stock ?? 0),
                'total' => (int) ($summary->positions ?? 0),
            ],

            'warehouseDistribution' => $this->warehouseDistribution(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),

            'categoryDistribution' => $this->categoryDistribution(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),

            'movementActivity' => $this->movementActivity(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
                start: $movementWindowStart,
                end: $movementWindowEnd,
            ),

            'topValuePositions' => $this->topValuePositions(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),

            'lowStockAlerts' => $this->lowStockAlerts(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),

            'dormantStock' => $this->dormantStock(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),
        ]);
    }

    private function stockPositionQuery(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): Builder {
        $query = $db
            ->table('warehouse_stocks as ws')
            ->join('products as p', function ($join): void {
                $join
                    ->on('p.id', '=', 'ws.product_id')
                    ->on('p.tenant_id', '=', 'ws.tenant_id');
            })
            ->join('warehouses as w', function ($join): void {
                $join
                    ->on('w.id', '=', 'ws.warehouse_id')
                    ->on('w.tenant_id', '=', 'ws.tenant_id');
            })
            ->join('branches as b', function ($join): void {
                $join
                    ->on('b.id', '=', 'w.branch_id')
                    ->on('b.tenant_id', '=', 'w.tenant_id');
            })
            ->where('ws.tenant_id', $tenantId)
            ->where('p.stock_tracking', 'tracked')
            ->whereNull('p.deleted_at')
            ->whereNull('w.deleted_at')
            ->whereNull('b.deleted_at');

        if ($branchId !== null) {
            $query->where('w.branch_id', $branchId);
        }

        return $query;
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     code: string,
     *     branch: string,
     *     isMain: bool,
     *     positions: int,
     *     quantity: float,
     *     value: float,
     *     healthy: int,
     *     lowStock: int,
     *     outOfStock: int
     * }>
     */
    private function warehouseDistribution(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): array {
        $query = $db
            ->table('warehouses as w')
            ->join('branches as b', function ($join): void {
                $join
                    ->on('b.id', '=', 'w.branch_id')
                    ->on('b.tenant_id', '=', 'w.tenant_id');
            })
            ->leftJoin('warehouse_stocks as ws', function ($join): void {
                $join
                    ->on('ws.warehouse_id', '=', 'w.id')
                    ->on('ws.tenant_id', '=', 'w.tenant_id');
            })
            ->leftJoin('products as p', function ($join): void {
                $join
                    ->on('p.id', '=', 'ws.product_id')
                    ->on('p.tenant_id', '=', 'w.tenant_id')
                    ->where('p.stock_tracking', '=', 'tracked')
                    ->whereNull('p.deleted_at');
            })
            ->where('w.tenant_id', $tenantId)
            ->whereNull('w.deleted_at')
            ->whereNull('b.deleted_at')
            ->selectRaw(
                <<<'SQL'
                w.id,
                w.name,
                w.code,
                w.is_main,
                b.name AS branch,
                COUNT(p.id) AS positions,
                COALESCE(SUM(CASE WHEN p.id IS NOT NULL THEN GREATEST(ws.quantity, 0) ELSE 0 END), 0) AS quantity,
                COALESCE(SUM(CASE WHEN p.id IS NOT NULL THEN GREATEST(ws.quantity, 0) * ws.average_cost ELSE 0 END), 0) AS value,
                COALESCE(SUM(CASE WHEN p.id IS NOT NULL AND ws.quantity > ws.reorder_level THEN 1 ELSE 0 END), 0) AS healthy,
                COALESCE(SUM(CASE WHEN p.id IS NOT NULL AND ws.quantity > 0 AND ws.quantity <= ws.reorder_level THEN 1 ELSE 0 END), 0) AS low_stock,
                COALESCE(SUM(CASE WHEN p.id IS NOT NULL AND ws.quantity <= 0 THEN 1 ELSE 0 END), 0) AS out_of_stock
                SQL,
            )
            ->groupBy(
                'w.id',
                'w.name',
                'w.code',
                'w.is_main',
                'b.name',
            )
            ->orderByDesc('value')
            ->orderBy('w.name');

        if ($branchId !== null) {
            $query->where('w.branch_id', $branchId);
        }

        return $query
            ->get()
            ->map(static fn ($row): array => [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'code' => (string) $row->code,
                'branch' => (string) $row->branch,
                'isMain' => (bool) $row->is_main,
                'positions' => (int) $row->positions,
                'quantity' => round((float) $row->quantity, 3),
                'value' => round((float) $row->value, 2),
                'healthy' => (int) $row->healthy,
                'lowStock' => (int) $row->low_stock,
                'outOfStock' => (int) $row->out_of_stock,
            ])
            ->all();
    }

    /**
     * @return array<int, array{
     *     label: string,
     *     value: float,
     *     quantity: float,
     *     positions: int,
     *     percentage: float
     * }>
     */
    private function categoryDistribution(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): array {
        $query = $db
            ->table('warehouse_stocks as ws')
            ->join('products as p', function ($join): void {
                $join
                    ->on('p.id', '=', 'ws.product_id')
                    ->on('p.tenant_id', '=', 'ws.tenant_id');
            })
            ->join('warehouses as w', function ($join): void {
                $join
                    ->on('w.id', '=', 'ws.warehouse_id')
                    ->on('w.tenant_id', '=', 'ws.tenant_id');
            })
            ->leftJoin('categories as c', function ($join): void {
                $join
                    ->on('c.id', '=', 'p.category_id')
                    ->on('c.tenant_id', '=', 'p.tenant_id')
                    ->whereNull('c.deleted_at');
            })
            ->where('ws.tenant_id', $tenantId)
            ->where('p.stock_tracking', 'tracked')
            ->whereNull('p.deleted_at')
            ->whereNull('w.deleted_at')
            ->selectRaw(
                <<<'SQL'
                COALESCE(c.name, 'Uncategorized') AS label,
                COUNT(ws.id) AS positions,
                COALESCE(SUM(GREATEST(ws.quantity, 0)), 0) AS quantity,
                COALESCE(SUM(GREATEST(ws.quantity, 0) * ws.average_cost), 0) AS value
                SQL,
            )
            ->groupBy('c.id', 'c.name')
            ->orderByDesc('value');

        if ($branchId !== null) {
            $query->where('w.branch_id', $branchId);
        }

        $rows = $query->get();
        $total = (float) $rows->sum(
            static fn ($row): float => (float) $row->value,
        );

        return $rows
            ->take(6)
            ->map(static function ($row) use ($total): array {
                $value = (float) $row->value;

                return [
                    'label' => (string) $row->label,
                    'value' => round($value, 2),
                    'quantity' => round((float) $row->quantity, 3),
                    'positions' => (int) $row->positions,
                    'percentage' => $total > 0
                        ? round(($value / $total) * 100, 1)
                        : 0.0,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{
     *     label: string,
     *     stockIn: float,
     *     stockOut: float
     * }>
     */
    private function movementActivity(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
        CarbonImmutable $start,
        CarbonImmutable $end,
    ): array {
        $query = $db
            ->table('stock_movements as sm')
            ->join('warehouses as w', function ($join): void {
                $join
                    ->on('w.id', '=', 'sm.warehouse_id')
                    ->on('w.tenant_id', '=', 'sm.tenant_id');
            })
            ->where('sm.tenant_id', $tenantId)
            ->whereNull('w.deleted_at')
            ->whereBetween('sm.movement_date', [$start, $end])
            ->select([
                'sm.movement_type',
                'sm.quantity',
                'sm.movement_date',
            ])
            ->orderBy('sm.movement_date');

        if ($branchId !== null) {
            $query->where('w.branch_id', $branchId);
        }

        $movements = $query->get();
        $buckets = [];
        $cursor = $start->startOfDay();

        while ($cursor->lessThanOrEqualTo($end)) {
            $bucketEnd = $cursor->addDays(6)->endOfDay();

            if ($bucketEnd->greaterThan($end)) {
                $bucketEnd = $end;
            }

            $buckets[] = [
                'label' => $cursor->format('M j'),
                'start' => $cursor,
                'end' => $bucketEnd,
                'stockIn' => 0.0,
                'stockOut' => 0.0,
            ];

            $cursor = $bucketEnd->addSecond()->startOfDay();
        }

        foreach ($movements as $movement) {
            $date = CarbonImmutable::parse($movement->movement_date);

            foreach ($buckets as $index => $bucket) {
                if (! $date->betweenIncluded(
                    $bucket['start'],
                    $bucket['end'],
                )) {
                    continue;
                }

                $quantity = abs((float) $movement->quantity);
                $type = (string) $movement->movement_type;

                if (in_array(
                    $type,
                    self::INCOMING_MOVEMENT_TYPES,
                    true,
                )) {
                    $buckets[$index]['stockIn'] += $quantity;
                }

                if (in_array(
                    $type,
                    self::OUTGOING_MOVEMENT_TYPES,
                    true,
                )) {
                    $buckets[$index]['stockOut'] += $quantity;
                }

                break;
            }
        }

        return array_map(
            static fn (array $bucket): array => [
                'label' => $bucket['label'],
                'stockIn' => round($bucket['stockIn'], 3),
                'stockOut' => round($bucket['stockOut'], 3),
            ],
            $buckets,
        );
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     product: string,
     *     sku: string|null,
     *     warehouse: string,
     *     branch: string,
     *     quantity: float,
     *     averageCost: float,
     *     value: float
     * }>
     */
    private function topValuePositions(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): array {
        return $this
            ->stockPositionQuery($db, $tenantId, $branchId)
            ->selectRaw(
                <<<'SQL'
                ws.id,
                p.name AS product,
                p.sku,
                w.name AS warehouse,
                b.name AS branch,
                ws.quantity,
                ws.average_cost,
                GREATEST(ws.quantity, 0) * ws.average_cost AS value
                SQL,
            )
            ->orderByDesc('value')
            ->limit(6)
            ->get()
            ->map(static fn ($row): array => [
                'id' => (int) $row->id,
                'product' => (string) $row->product,
                'sku' => $row->sku ? (string) $row->sku : null,
                'warehouse' => (string) $row->warehouse,
                'branch' => (string) $row->branch,
                'quantity' => round((float) $row->quantity, 3),
                'averageCost' => round(
                    (float) $row->average_cost,
                    4,
                ),
                'value' => round((float) $row->value, 2),
            ])
            ->all();
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     product: string,
     *     sku: string|null,
     *     warehouse: string,
     *     branch: string,
     *     quantity: float,
     *     reorderLevel: float,
     *     severity: string
     * }>
     */
    private function lowStockAlerts(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): array {
        return $this
            ->stockPositionQuery($db, $tenantId, $branchId)
            ->where('p.is_active', true)
            ->where('w.is_active', true)
            ->whereColumn(
                'ws.quantity',
                '<=',
                'ws.reorder_level',
            )
            ->select([
                'ws.id',
                'p.name as product',
                'p.sku',
                'w.name as warehouse',
                'b.name as branch',
                'ws.quantity',
                'ws.reorder_level',
            ])
            ->orderByRaw(
                'CASE WHEN ws.quantity <= 0 THEN 0 ELSE 1 END',
            )
            ->orderBy('ws.quantity')
            ->limit(6)
            ->get()
            ->map(static function ($row): array {
                $quantity = (float) $row->quantity;
                $reorderLevel = (float) $row->reorder_level;

                return [
                    'id' => (int) $row->id,
                    'product' => (string) $row->product,
                    'sku' => $row->sku
                        ? (string) $row->sku
                        : null,
                    'warehouse' => (string) $row->warehouse,
                    'branch' => (string) $row->branch,
                    'quantity' => round($quantity, 3),
                    'reorderLevel' => round(
                        $reorderLevel,
                        3,
                    ),
                    'severity' => $quantity <= 0
                        || (
                            $reorderLevel > 0
                            && $quantity <= ($reorderLevel * 0.5)
                        )
                            ? 'critical'
                            : 'low',
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     product: string,
     *     sku: string|null,
     *     warehouse: string,
     *     quantity: float,
     *     value: float,
     *     lastMovementAt: string|null
     * }>
     */
    private function dormantStock(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): array {
        $threshold = CarbonImmutable::now()
            ->subDays(30)
            ->startOfDay();

        return $this
            ->stockPositionQuery($db, $tenantId, $branchId)
            ->where('ws.quantity', '>', 0)
            ->where(function (Builder $query) use ($threshold): void {
                $query
                    ->whereNull('ws.last_movement_at')
                    ->orWhere(
                        'ws.last_movement_at',
                        '<',
                        $threshold,
                    );
            })
            ->selectRaw(
                <<<'SQL'
                ws.id,
                p.name AS product,
                p.sku,
                w.name AS warehouse,
                ws.quantity,
                GREATEST(ws.quantity, 0) * ws.average_cost AS value,
                ws.last_movement_at
                SQL,
            )
            ->orderByRaw(
                'CASE WHEN ws.last_movement_at IS NULL THEN 0 ELSE 1 END',
            )
            ->orderBy('ws.last_movement_at')
            ->limit(6)
            ->get()
            ->map(static fn ($row): array => [
                'id' => (int) $row->id,
                'product' => (string) $row->product,
                'sku' => $row->sku ? (string) $row->sku : null,
                'warehouse' => (string) $row->warehouse,
                'quantity' => round((float) $row->quantity, 3),
                'value' => round((float) $row->value, 2),
                'lastMovementAt' => $row->last_movement_at
                    ? CarbonImmutable::parse(
                        $row->last_movement_at,
                    )->toIso8601String()
                    : null,
            ])
            ->all();
    }

    private function trackedProductCount(
        ConnectionInterface $db,
        int $tenantId,
    ): int {
        return $db
            ->table('products')
            ->where('tenant_id', $tenantId)
            ->where('stock_tracking', 'tracked')
            ->whereNull('deleted_at')
            ->count();
    }

    private function activeProductCount(
        ConnectionInterface $db,
        int $tenantId,
    ): int {
        return $db
            ->table('products')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->count();
    }

    private function activeWarehouseCount(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): int {
        $query = $db
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at');

        if ($branchId !== null) {
            $query->where('branch_id', $branchId);
        }

        return $query->count();
    }

    private function branchName(
        ConnectionInterface $db,
        int $tenantId,
        int $branchId,
    ): string {
        return (string) (
            $db
                ->table('branches')
                ->where('tenant_id', $tenantId)
                ->where('id', $branchId)
                ->whereNull('deleted_at')
                ->value('name')
            ?? 'Assigned branch'
        );
    }

    private function resolveBranchScope(object $user): ?int
    {
        $role = strtolower(
            (string) ($user->role ?? 'client'),
        );

        if (in_array(
            $role,
            ['client', 'owner', 'admin'],
            true,
        )) {
            return null;
        }

        $branchId = (int) ($user->branch_id ?? 0);

        return $branchId > 0
            ? $branchId
            : null;
    }
}