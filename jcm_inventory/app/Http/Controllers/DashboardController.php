<?php

namespace App\Http\Controllers;

use Carbon\CarbonImmutable;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const RANGE_DAYS = [
        '7d' => 7,
        '30d' => 30,
        '90d' => 90,
    ];

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

        abort_if($tenantId <= 0, 403, 'No inventory tenant is assigned to this account.');

        $range = $request->string('range')->toString();

        if (! array_key_exists($range, self::RANGE_DAYS)) {
            $range = '30d';
        }

        $days = self::RANGE_DAYS[$range];
        $end = CarbonImmutable::now()->endOfDay();
        $start = $end->subDays($days - 1)->startOfDay();
        $previousEnd = $start->subSecond();
        $previousStart = $previousEnd->subDays($days - 1)->startOfDay();

        $branchId = $this->resolveBranchScope($user);
        $db = app('db')->connection();

        $stockQuery = $this->stockPositionQuery(
            db: $db,
            tenantId: $tenantId,
            branchId: $branchId,
        );

        $stockSummary = (clone $stockQuery)
            ->selectRaw(
                <<<'SQL'
                COUNT(ws.id) AS positions,
                COALESCE(SUM(GREATEST(ws.quantity, 0)), 0) AS total_quantity,
                COALESCE(SUM(GREATEST(ws.quantity, 0) * ws.average_cost), 0) AS inventory_value,
                COALESCE(SUM(CASE WHEN ws.quantity > ws.reorder_level THEN 1 ELSE 0 END), 0) AS healthy,
                COALESCE(SUM(CASE WHEN ws.quantity > 0 AND ws.quantity <= ws.reorder_level THEN 1 ELSE 0 END), 0) AS low_stock,
                COALESCE(SUM(CASE WHEN ws.quantity <= 0 THEN 1 ELSE 0 END), 0) AS out_of_stock
                SQL,
            )
            ->first();

        $receivedValue = $this->receiptValue(
            db: $db,
            tenantId: $tenantId,
            branchId: $branchId,
            start: $start,
            end: $end,
        );

        $previousReceivedValue = $this->receiptValue(
            db: $db,
            tenantId: $tenantId,
            branchId: $branchId,
            start: $previousStart,
            end: $previousEnd,
        );

        $purchaseOrders = $this->purchaseOrderCount(
            db: $db,
            tenantId: $tenantId,
            branchId: $branchId,
            start: $start,
            end: $end,
        );

        $previousPurchaseOrders = $this->purchaseOrderCount(
            db: $db,
            tenantId: $tenantId,
            branchId: $branchId,
            start: $previousStart,
            end: $previousEnd,
        );

        $lowStockCount = (int) ($stockSummary->low_stock ?? 0);
        $outOfStockCount = (int) ($stockSummary->out_of_stock ?? 0);

        return Inertia::render('dashboard/index', [
            'filters' => [
                'range' => $range,
            ],

            'period' => [
                'label' => $this->periodLabel($start, $end),
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],

            'context' => [
                'scopeLabel' => $branchId
                    ? $this->branchName($db, $tenantId, $branchId)
                    : 'All branches',
                'activeProducts' => $this->activeProductCount($db, $tenantId),
                'activeBranches' => $this->activeBranchCount($db, $tenantId, $branchId),
                'activeWarehouses' => $this->activeWarehouseCount($db, $tenantId, $branchId),
            ],

            'summary' => [
                'receivedValue' => round($receivedValue, 2),
                'receivedValueChange' => $this->percentageChange(
                    current: $receivedValue,
                    previous: $previousReceivedValue,
                ),
                'inventoryValue' => round((float) ($stockSummary->inventory_value ?? 0), 2),
                'inventoryPositions' => (int) ($stockSummary->positions ?? 0),
                'totalQuantity' => round((float) ($stockSummary->total_quantity ?? 0), 3),
                'purchaseOrders' => $purchaseOrders,
                'purchaseOrdersChange' => $this->percentageChange(
                    current: $purchaseOrders,
                    previous: $previousPurchaseOrders,
                ),
                'stockAlerts' => $lowStockCount + $outOfStockCount,
                'criticalAlerts' => $outOfStockCount,
            ],

            'inventoryFlow' => $this->inventoryFlow(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
                range: $range,
                start: $start,
                end: $end,
            ),

            'stockHealth' => [
                'healthy' => (int) ($stockSummary->healthy ?? 0),
                'lowStock' => $lowStockCount,
                'outOfStock' => $outOfStockCount,
                'total' => (int) ($stockSummary->positions ?? 0),
            ],

            'categoryDistribution' => $this->categoryDistribution(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),

            'procurementPipeline' => $this->procurementPipeline(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),

            'lowStockAlerts' => $this->lowStockAlerts(
                db: $db,
                tenantId: $tenantId,
                branchId: $branchId,
            ),

            'recentMovements' => $this->recentMovements(
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
            ->where('ws.tenant_id', $tenantId)
            ->where('p.stock_tracking', 'tracked')
            ->whereNull('p.deleted_at')
            ->whereNull('w.deleted_at');

        if ($branchId !== null) {
            $query->where('w.branch_id', $branchId);
        }

        return $query;
    }

    private function receiptValue(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
        CarbonImmutable $start,
        CarbonImmutable $end,
    ): float {
        $query = $db
            ->table('purchase_receipts')
            ->where('tenant_id', $tenantId)
            ->where('status', 'posted')
            ->whereBetween('received_date', [
                $start->toDateString(),
                $end->toDateString(),
            ]);

        if ($branchId !== null) {
            $query->where('branch_id', $branchId);
        }

        return (float) $query->sum('total_amount');
    }

    private function purchaseOrderCount(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
        CarbonImmutable $start,
        CarbonImmutable $end,
    ): int {
        $query = $db
            ->table('purchase_orders')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->whereBetween('order_date', [
                $start->toDateString(),
                $end->toDateString(),
            ]);

        if ($branchId !== null) {
            $query->where('branch_id', $branchId);
        }

        return $query->count();
    }

    /**
     * @return array<int, array{label: string, stockIn: float, stockOut: float}>
     */
    private function inventoryFlow(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
        string $range,
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
        $buckets = $this->flowBuckets($range, $start, $end);

        foreach ($movements as $movement) {
            $movementDate = CarbonImmutable::parse($movement->movement_date);
            $bucketIndex = $this->matchingBucketIndex($buckets, $movementDate);

            if ($bucketIndex === null) {
                continue;
            }

            $quantity = abs((float) $movement->quantity);
            $type = (string) $movement->movement_type;

            if (in_array($type, self::INCOMING_MOVEMENT_TYPES, true)) {
                $buckets[$bucketIndex]['stockIn'] += $quantity;
            }

            if (in_array($type, self::OUTGOING_MOVEMENT_TYPES, true)) {
                $buckets[$bucketIndex]['stockOut'] += $quantity;
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
     *     label: string,
     *     start: CarbonImmutable,
     *     end: CarbonImmutable,
     *     stockIn: float,
     *     stockOut: float
     * }>
     */
    private function flowBuckets(
        string $range,
        CarbonImmutable $start,
        CarbonImmutable $end,
    ): array {
        if ($range === '7d') {
            $buckets = [];
            $cursor = $start->startOfDay();

            while ($cursor->lessThanOrEqualTo($end)) {
                $buckets[] = [
                    'label' => $cursor->format('D'),
                    'start' => $cursor->startOfDay(),
                    'end' => $cursor->endOfDay(),
                    'stockIn' => 0.0,
                    'stockOut' => 0.0,
                ];

                $cursor = $cursor->addDay();
            }

            return $buckets;
        }

        if ($range === '30d') {
            $buckets = [];
            $cursor = $start->startOfDay();

            while ($cursor->lessThanOrEqualTo($end)) {
                $bucketEnd = $cursor->addDays(6)->endOfDay();

                if ($bucketEnd->greaterThan($end)) {
                    $bucketEnd = $end;
                }

                $buckets[] = [
                    'label' => $cursor->format('M j').'–'.$bucketEnd->format('j'),
                    'start' => $cursor,
                    'end' => $bucketEnd,
                    'stockIn' => 0.0,
                    'stockOut' => 0.0,
                ];

                $cursor = $bucketEnd->addSecond()->startOfDay();
            }

            return $buckets;
        }

        $buckets = [];
        $cursor = $start->startOfMonth();

        while ($cursor->lessThanOrEqualTo($end)) {
            $bucketStart = $cursor->greaterThan($start)
                ? $cursor
                : $start;

            $bucketEnd = $cursor->endOfMonth()->lessThan($end)
                ? $cursor->endOfMonth()
                : $end;

            $buckets[] = [
                'label' => $cursor->format('M'),
                'start' => $bucketStart,
                'end' => $bucketEnd,
                'stockIn' => 0.0,
                'stockOut' => 0.0,
            ];

            $cursor = $cursor->addMonth()->startOfMonth();
        }

        return $buckets;
    }

    /**
     * @param  array<int, array{
     *     label: string,
     *     start: CarbonImmutable,
     *     end: CarbonImmutable,
     *     stockIn: float,
     *     stockOut: float
     * }>  $buckets
     */
    private function matchingBucketIndex(
        array $buckets,
        CarbonImmutable $date,
    ): ?int {
        foreach ($buckets as $index => $bucket) {
            if ($date->betweenIncluded($bucket['start'], $bucket['end'])) {
                return $index;
            }
        }

        return null;
    }

    /**
     * @return array<int, array{label: string, value: float, percentage: float}>
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
                "COALESCE(c.name, 'Uncategorized') AS label,
                COALESCE(SUM(GREATEST(ws.quantity, 0) * ws.average_cost), 0) AS value",
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

        if ($total <= 0) {
            return [];
        }

        $top = $rows->take(3);
        $othersValue = (float) $rows
            ->slice(3)
            ->sum(static fn ($row): float => (float) $row->value);

        $result = $top
            ->map(function ($row) use ($total): array {
                $value = (float) $row->value;

                return [
                    'label' => (string) $row->label,
                    'value' => round($value, 2),
                    'percentage' => round(($value / $total) * 100, 1),
                ];
            })
            ->values()
            ->all();

        if ($othersValue > 0) {
            $result[] = [
                'label' => 'Others',
                'value' => round($othersValue, 2),
                'percentage' => round(($othersValue / $total) * 100, 1),
            ];
        }

        return $result;
    }

    /**
     * @return array<int, array{key: string, label: string, count: int}>
     */
    private function procurementPipeline(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): array {
        $query = $db
            ->table('purchase_orders')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->selectRaw('status, COUNT(*) AS aggregate')
            ->groupBy('status');

        if ($branchId !== null) {
            $query->where('branch_id', $branchId);
        }

        $counts = $query
            ->pluck('aggregate', 'status')
            ->map(static fn ($count): int => (int) $count);

        $stages = [
            ['key' => 'draft', 'label' => 'Draft'],
            ['key' => 'pending', 'label' => 'For Approval'],
            ['key' => 'approved', 'label' => 'Approved'],
            ['key' => 'partially_received', 'label' => 'Receiving'],
            ['key' => 'received', 'label' => 'Completed'],
            ['key' => 'cancelled', 'label' => 'Cancelled'],
        ];

        return array_map(
            static fn (array $stage): array => [
                ...$stage,
                'count' => (int) ($counts[$stage['key']] ?? 0),
            ],
            $stages,
        );
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     product: string,
     *     sku: string|null,
     *     warehouse: string,
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
        $query = $this
            ->stockPositionQuery($db, $tenantId, $branchId)
            ->where('p.is_active', true)
            ->where('w.is_active', true)
            ->whereColumn('ws.quantity', '<=', 'ws.reorder_level')
            ->select([
                'ws.id',
                'p.name as product',
                'p.sku',
                'w.name as warehouse',
                'ws.quantity',
                'ws.reorder_level',
            ])
            ->orderByRaw('CASE WHEN ws.quantity <= 0 THEN 0 ELSE 1 END')
            ->orderBy('ws.quantity')
            ->limit(6)
            ->get();

        return $query
            ->map(static function ($row): array {
                $quantity = (float) $row->quantity;
                $reorderLevel = (float) $row->reorder_level;

                return [
                    'id' => (int) $row->id,
                    'product' => (string) $row->product,
                    'sku' => $row->sku ? (string) $row->sku : null,
                    'warehouse' => (string) $row->warehouse,
                    'quantity' => round($quantity, 3),
                    'reorderLevel' => round($reorderLevel, 3),
                    'severity' => $quantity <= 0
                        || ($reorderLevel > 0 && $quantity <= ($reorderLevel * 0.5))
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
     *     reference: string,
     *     warehouse: string,
     *     movementType: string,
     *     direction: string,
     *     quantity: float,
     *     occurredAt: string
     * }>
     */
    private function recentMovements(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): array {
        $query = $db
            ->table('stock_movements as sm')
            ->join('products as p', function ($join): void {
                $join
                    ->on('p.id', '=', 'sm.product_id')
                    ->on('p.tenant_id', '=', 'sm.tenant_id');
            })
            ->join('warehouses as w', function ($join): void {
                $join
                    ->on('w.id', '=', 'sm.warehouse_id')
                    ->on('w.tenant_id', '=', 'sm.tenant_id');
            })
            ->where('sm.tenant_id', $tenantId)
            ->whereNull('p.deleted_at')
            ->whereNull('w.deleted_at')
            ->select([
                'sm.id',
                'sm.movement_type',
                'sm.quantity',
                'sm.reference_no',
                'sm.reference_type',
                'sm.movement_date',
                'p.name as product',
                'w.name as warehouse',
            ])
            ->orderByDesc('sm.movement_date')
            ->orderByDesc('sm.id')
            ->limit(8);

        if ($branchId !== null) {
            $query->where('w.branch_id', $branchId);
        }

        return $query
            ->get()
            ->map(function ($row): array {
                $type = (string) $row->movement_type;

                return [
                    'id' => (int) $row->id,
                    'product' => (string) $row->product,
                    'reference' => $row->reference_no
                        ? (string) $row->reference_no
                        : $this->referenceLabel($row->reference_type),
                    'warehouse' => (string) $row->warehouse,
                    'movementType' => $this->movementLabel($type),
                    'direction' => $this->movementDirection($type),
                    'quantity' => round(abs((float) $row->quantity), 3),
                    'occurredAt' => CarbonImmutable::parse(
                        $row->movement_date,
                    )->toIso8601String(),
                ];
            })
            ->all();
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

    private function activeBranchCount(
        ConnectionInterface $db,
        int $tenantId,
        ?int $branchId,
    ): int {
        $query = $db
            ->table('branches')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at');

        if ($branchId !== null) {
            $query->where('id', $branchId);
        }

        return $query->count();
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
        $role = strtolower((string) ($user->role ?? 'client'));

        if (in_array($role, ['client', 'owner', 'admin'], true)) {
            return null;
        }

        $branchId = (int) ($user->branch_id ?? 0);

        return $branchId > 0 ? $branchId : null;
    }

    private function percentageChange(
        float|int $current,
        float|int $previous,
    ): float {
        $current = (float) $current;
        $previous = (float) $previous;

        if ($previous == 0.0) {
            return $current == 0.0 ? 0.0 : 100.0;
        }

        return round(
            (($current - $previous) / abs($previous)) * 100,
            1,
        );
    }

    private function periodLabel(
        CarbonImmutable $start,
        CarbonImmutable $end,
    ): string {
        if ($start->isSameMonth($end)) {
            return $start->format('M j').'–'.$end->format('j, Y');
        }

        return $start->format('M j').' – '.$end->format('M j, Y');
    }

    private function movementDirection(string $type): string
    {
        if (in_array($type, self::INCOMING_MOVEMENT_TYPES, true)) {
            return 'in';
        }

        if (in_array($type, self::OUTGOING_MOVEMENT_TYPES, true)) {
            return 'out';
        }

        return 'neutral';
    }

    private function movementLabel(string $type): string
    {
        return match ($type) {
            'opening_stock' => 'Opening Stock',
            'stock_in', 'purchase_receipt' => 'Stock In',
            'stock_out', 'sale' => 'Stock Out',
            'adjustment_in', 'adjustment_out' => 'Adjustment',
            'transfer_in', 'transfer_out' => 'Transfer',
            'purchase_receipt_void' => 'Receipt Reversal',
            'return_in' => 'Return In',
            'return_out' => 'Return Out',
            'damage' => 'Damaged',
            'expired' => 'Expired',
            default => ucwords(str_replace('_', ' ', $type)),
        };
    }

    private function referenceLabel(?string $referenceType): string
    {
        if (! $referenceType) {
            return 'Manual movement';
        }

        return ucwords(str_replace(['_', '\\'], [' ', ' / '], $referenceType));
    }
}