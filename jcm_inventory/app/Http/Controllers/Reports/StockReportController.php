<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\Inventory\InventoryAccessContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class StockReportController extends Controller
{
    public function __construct(
        private readonly InventoryAccessContext $access
    ) {
    }

    public function pdf(Request $request): Response
    {
        $this->ensureExportAccess($request);
        $data = $this->reportData($request);

        return Pdf::loadView(
            'reports.inventory.stocks.stock-list',
            $data
        )
            ->setPaper('a4', 'landscape')
            ->stream('inventory-stock-report-' . now()->format('Y-m-d-His') . '.pdf');
    }

    public function excelPreview(Request $request): Response
    {
        $this->ensureExportAccess($request);

        return response()->view(
            'reports.inventory.stocks.excel-preview',
            [
                ...$this->reportData($request),
                'downloadMode' => false,
            ]
        );
    }

    public function excel(Request $request): Response
    {
        $this->ensureExportAccess($request);

        $filename = 'inventory-stock-report-' . now()->format('Y-m-d-His') . '.xls';

        return response()->view(
            'reports.inventory.stocks.excel-preview',
            [
                ...$this->reportData($request),
                'downloadMode' => true,
            ],
            200,
            [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'max-age=0, no-cache, no-store, must-revalidate',
                'Pragma' => 'public',
            ]
        );
    }

    private function reportData(Request $request): array
    {
        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];
        $db = DB::connection('mysql');
        $warningDays = (int) (
            $db->table('inventory_settings')
                ->where('tenant_id', $tenantId)
                ->value('expiry_warning_days') ?? 30
        );

        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'status' => trim((string) $request->input('status', '')),
            'batch_status' => trim((string) $request->input('batch_status', '')),
            'branch_id' => (int) (
                $this->access->selectedBranchId(
                    $context,
                    $request->input('branch_id')
                ) ?? 0
            ),
            'warehouse_id' => (int) $request->input('warehouse_id', 0),
            'category_id' => (int) $request->input('category_id', 0),
        ];

        $query = $this->baseQuery($tenantId);
        $this->applyFilters($query, $filters, $warningDays);

        $rows = $query
            ->orderBy('b.name')
            ->orderBy('w.name')
            ->orderBy('p.name')
            ->get();

        $summary = [
            'positions' => $rows->count(),
            'quantity' => (float) $rows->sum('quantity'),
            'value' => round((float) $rows->sum('total_value'), 2),
            'active_batches' => (int) $rows->sum('batch_count'),
            'expiring_batches' => (int) $rows->sum('expiring_batch_count'),
            'expired_batches' => (int) $rows->sum('expired_batch_count'),
            'mismatches' => $rows->where('reconciliation_status', 'mismatch')->count(),
        ];

        return [
            'rows' => $rows,
            'summary' => $summary,
            'filters' => $filters,
            'generatedAt' => now(),
            'preparedBy' => $request->user()?->name ?? 'System User',
            'reportTitle' => 'Inventory Stock Management Report',
        ];
    }

    private function baseQuery(int $tenantId): Builder
    {
        return DB::connection('mysql')
            ->table('warehouse_stocks as ws')
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
            ->leftJoin('categories as c', function ($join): void {
                $join
                    ->on('c.tenant_id', '=', 'p.tenant_id')
                    ->on('c.id', '=', 'p.category_id');
            })
            ->where('ws.tenant_id', $tenantId)
            ->select([
                'ws.id',
                'p.name as product_name',
                'p.sku',
                'p.barcode',
                'p.unit',
                'p.batch_tracking_enabled',
                'p.batch_issue_policy',
                'c.name as category_name',
                'b.name as branch_name',
                'w.name as warehouse_name',
                'w.code as warehouse_code',
                'ws.quantity',
                'ws.reorder_level',
                'ws.max_stock_level',
                'ws.average_cost',
                'ws.last_movement_at',
            ])
            ->selectRaw('(ws.quantity * ws.average_cost) as total_value')
            ->selectRaw('(SELECT COUNT(*) FROM warehouse_batch_stocks wbs WHERE wbs.tenant_id = ws.tenant_id AND wbs.warehouse_id = ws.warehouse_id AND wbs.product_id = ws.product_id AND wbs.quantity > 0) as batch_count')
            ->selectRaw('(SELECT COALESCE(SUM(wbs.quantity), 0) FROM warehouse_batch_stocks wbs WHERE wbs.tenant_id = ws.tenant_id AND wbs.warehouse_id = ws.warehouse_id AND wbs.product_id = ws.product_id) as batch_quantity')
            ->selectRaw('(SELECT COUNT(*) FROM warehouse_batch_stocks wbs JOIN stock_batches sb ON sb.tenant_id = wbs.tenant_id AND sb.id = wbs.stock_batch_id AND sb.product_id = wbs.product_id WHERE wbs.tenant_id = ws.tenant_id AND wbs.warehouse_id = ws.warehouse_id AND wbs.product_id = ws.product_id AND wbs.quantity > 0 AND sb.expiration_date IS NOT NULL AND DATEDIFF(sb.expiration_date, CURDATE()) BETWEEN 0 AND COALESCE(p.expiry_warning_days, 30)) as expiring_batch_count')
            ->selectRaw('(SELECT COUNT(*) FROM warehouse_batch_stocks wbs JOIN stock_batches sb ON sb.tenant_id = wbs.tenant_id AND sb.id = wbs.stock_batch_id AND sb.product_id = wbs.product_id WHERE wbs.tenant_id = ws.tenant_id AND wbs.warehouse_id = ws.warehouse_id AND wbs.product_id = ws.product_id AND wbs.quantity > 0 AND sb.expiration_date < CURDATE()) as expired_batch_count')
            ->selectRaw("CASE WHEN ABS(ws.quantity - (SELECT COALESCE(SUM(wbs.quantity), 0) FROM warehouse_batch_stocks wbs WHERE wbs.tenant_id = ws.tenant_id AND wbs.warehouse_id = ws.warehouse_id AND wbs.product_id = ws.product_id)) > 0.0001 THEN 'mismatch' ELSE 'reconciled' END as reconciliation_status")
            ->selectRaw("CASE WHEN ws.quantity <= 0 THEN 'Out of Stock' WHEN ws.quantity <= ws.reorder_level THEN 'Low Stock' ELSE 'In Stock' END as stock_status");
    }

    private function applyFilters(
        Builder $query,
        array $filters,
        int $warningDays
    ): void {
        $query
            ->when($filters['search'] !== '', function (Builder $query) use ($filters): void {
                $search = $filters['search'];
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('p.name', 'like', "%{$search}%")
                        ->orWhere('p.sku', 'like', "%{$search}%")
                        ->orWhere('p.barcode', 'like', "%{$search}%")
                        ->orWhere('w.name', 'like', "%{$search}%")
                        ->orWhere('w.code', 'like', "%{$search}%")
                        ->orWhere('b.name', 'like', "%{$search}%");
                });
            })
            ->when($filters['branch_id'] > 0, fn (Builder $query) => $query->where('w.branch_id', $filters['branch_id']))
            ->when($filters['warehouse_id'] > 0, fn (Builder $query) => $query->where('ws.warehouse_id', $filters['warehouse_id']))
            ->when($filters['category_id'] > 0, fn (Builder $query) => $query->where('p.category_id', $filters['category_id']))
            ->when($filters['status'] === 'in_stock', fn (Builder $query) => $query->where('ws.quantity', '>', 0)->whereColumn('ws.quantity', '>', 'ws.reorder_level'))
            ->when($filters['status'] === 'low_stock', fn (Builder $query) => $query->where('ws.quantity', '>', 0)->whereColumn('ws.quantity', '<=', 'ws.reorder_level'))
            ->when($filters['status'] === 'out_of_stock', fn (Builder $query) => $query->where('ws.quantity', '<=', 0))
            ->when($filters['batch_status'] === 'batch_enabled', fn (Builder $query) => $query->where('p.batch_tracking_enabled', true))
            ->when($filters['batch_status'] === 'standard', fn (Builder $query) => $query->where('p.batch_tracking_enabled', false))
            ->when($filters['batch_status'] === 'mismatch', fn (Builder $query) => $query->whereRaw('ABS(ws.quantity - (SELECT COALESCE(SUM(wbs.quantity), 0) FROM warehouse_batch_stocks wbs WHERE wbs.tenant_id = ws.tenant_id AND wbs.warehouse_id = ws.warehouse_id AND wbs.product_id = ws.product_id)) > 0.0001'))
            ->when($filters['batch_status'] === 'expiring', fn (Builder $query) => $query->whereExists(function ($subQuery) use ($warningDays): void {
                $subQuery
                    ->selectRaw('1')
                    ->from('warehouse_batch_stocks as wbs')
                    ->join('stock_batches as sb', function ($join): void {
                        $join->on('sb.tenant_id', '=', 'wbs.tenant_id')->on('sb.id', '=', 'wbs.stock_batch_id')->on('sb.product_id', '=', 'wbs.product_id');
                    })
                    ->whereColumn('wbs.tenant_id', 'ws.tenant_id')
                    ->whereColumn('wbs.warehouse_id', 'ws.warehouse_id')
                    ->whereColumn('wbs.product_id', 'ws.product_id')
                    ->where('wbs.quantity', '>', 0)
                    ->whereNotNull('sb.expiration_date')
                    ->whereRaw('DATEDIFF(sb.expiration_date, CURDATE()) BETWEEN 0 AND ?', [$warningDays]);
            }))
            ->when($filters['batch_status'] === 'expired', fn (Builder $query) => $query->whereExists(function ($subQuery): void {
                $subQuery
                    ->selectRaw('1')
                    ->from('warehouse_batch_stocks as wbs')
                    ->join('stock_batches as sb', function ($join): void {
                        $join->on('sb.tenant_id', '=', 'wbs.tenant_id')->on('sb.id', '=', 'wbs.stock_batch_id')->on('sb.product_id', '=', 'wbs.product_id');
                    })
                    ->whereColumn('wbs.tenant_id', 'ws.tenant_id')
                    ->whereColumn('wbs.warehouse_id', 'ws.warehouse_id')
                    ->whereColumn('wbs.product_id', 'ws.product_id')
                    ->where('wbs.quantity', '>', 0)
                    ->whereDate('sb.expiration_date', '<', now()->toDateString());
            }));
    }

    private function ensureExportAccess(Request $request): void
    {
        abort_unless(
            $this->access->canExport($request),
            403,
            'PDF and Excel exports are unavailable while the subscription is read-only.'
        );
    }
}