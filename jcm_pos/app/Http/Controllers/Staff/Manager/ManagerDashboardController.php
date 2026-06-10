<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Support\ActivityLogger;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerDashboardController extends Controller
{
    private function managerBranch(): Branch
    {
        $branchId = auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this manager.');

        return Branch::query()
            ->where('id', $branchId)
            ->where('is_active', true)
            ->firstOrFail(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active']);
    }

    public function index()
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        $todaySales = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereBetween('sold_at', [$todayStart, $todayEnd])
            ->selectRaw('COUNT(*) as transactions')
            ->selectRaw('COALESCE(SUM(grand_total), 0) as total_sales')
            ->first();

        $monthSales = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereBetween('sold_at', [$monthStart, $monthEnd])
            ->selectRaw('COUNT(*) as transactions')
            ->selectRaw('COALESCE(SUM(grand_total), 0) as total_sales')
            ->first();

        $inventory = DB::connection('pos')
            ->table('products')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNull('deleted_at')
            ->selectRaw('COUNT(*) as total_products')
            ->selectRaw('COALESCE(SUM(quantity), 0) as total_quantity')
            ->selectRaw('COALESCE(SUM(CASE WHEN quantity <= 0 THEN 1 ELSE 0 END), 0) as out_of_stock')
            ->selectRaw('COALESCE(SUM(CASE WHEN quantity > 0 AND quantity <= reorder_level THEN 1 ELSE 0 END), 0) as low_stock')
            ->first();

        $cashDrawer = DB::connection('pos')
            ->table('cash_drawers')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->orderByDesc('opened_at')
            ->first();

        $todayTrend = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereBetween('sold_at', [$todayStart, $todayEnd])
            ->selectRaw('HOUR(sold_at) as hour')
            ->selectRaw('COUNT(*) as transactions')
            ->selectRaw('COALESCE(SUM(grand_total), 0) as total_sales')
            ->groupByRaw('HOUR(sold_at)')
            ->orderByRaw('HOUR(sold_at)')
            ->get()
            ->map(fn ($item) => [
                'label' => Carbon::createFromTime((int) $item->hour)->format('g A'),
                'sales' => (float) $item->total_sales,
                'transactions' => (int) $item->transactions,
            ]);

        $sevenDayTrend = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereBetween('sold_at', [now()->subDays(6)->startOfDay(), $todayEnd])
            ->selectRaw('DATE(sold_at) as date')
            ->selectRaw('COALESCE(SUM(grand_total), 0) as total_sales')
            ->groupByRaw('DATE(sold_at)')
            ->orderByRaw('DATE(sold_at)')
            ->get()
            ->map(fn ($item) => [
                'label' => Carbon::parse($item->date)->format('M d'),
                'value' => (float) $item->total_sales,
            ]);

        $topProducts = DB::connection('pos')
            ->table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sale_items.tenant_id', $tenantId)
            ->where('sale_items.branch_id', $branchId)
            ->whereBetween('sales.sold_at', [$monthStart, $monthEnd])
            ->select([
                'sale_items.product_id',
                'sale_items.product_name',
                'sale_items.sku',
            ])
            ->selectRaw('COALESCE(SUM(sale_items.quantity), 0) as quantity_sold')
            ->selectRaw('COALESCE(SUM(sale_items.line_total), 0) as total_sales')
            ->groupBy('sale_items.product_id', 'sale_items.product_name', 'sale_items.sku')
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get();

        $lowStockProducts = DB::connection('pos')
            ->table('products')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->where('products.tenant_id', $tenantId)
            ->where('products.branch_id', $branchId)
            ->whereNull('products.deleted_at')
            ->where('products.quantity', '>', 0)
            ->whereColumn('products.quantity', '<=', 'products.reorder_level')
            ->select([
                'products.id',
                'products.name',
                'products.sku',
                'products.quantity',
                'products.reorder_level',
                DB::raw('COALESCE(categories.name, "Uncategorized") as category_name'),
            ])
            ->orderBy('products.quantity')
            ->limit(5)
            ->get();

        $recentSales = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->select([
                'id',
                'sale_no',
                'grand_total',
                'payment_status',
                'status',
                'sold_at',
            ])
            ->orderByDesc('sold_at')
            ->limit(8)
            ->get();

        ActivityLogger::log(
            module: 'manager_dashboard',
            action: 'viewed',
            description: 'Viewed manager dashboard.'
        );

        return Inertia::render('staff/manager/dashboard', [
            'branch' => $branch,
            'summary' => [
                'today_sales' => (float) ($todaySales->total_sales ?? 0),
                'today_transactions' => (int) ($todaySales->transactions ?? 0),
                'month_sales' => (float) ($monthSales->total_sales ?? 0),
                'month_transactions' => (int) ($monthSales->transactions ?? 0),
                'total_products' => (int) ($inventory->total_products ?? 0),
                'total_quantity' => (float) ($inventory->total_quantity ?? 0),
                'low_stock' => (int) ($inventory->low_stock ?? 0),
                'out_of_stock' => (int) ($inventory->out_of_stock ?? 0),
            ],
            'cashDrawer' => $cashDrawer ? [
                'id' => $cashDrawer->id,
                'status' => $cashDrawer->status,
                'opening_balance' => (float) $cashDrawer->opening_balance,
                'expected_balance' => (float) $cashDrawer->expected_balance,
                'actual_balance' => $cashDrawer->actual_balance !== null ? (float) $cashDrawer->actual_balance : null,
                'opened_at' => $cashDrawer->opened_at,
                'closed_at' => $cashDrawer->closed_at,
            ] : null,
            'todayTrend' => $todayTrend,
            'sevenDayTrend' => $sevenDayTrend,
            'topProducts' => $topProducts,
            'lowStockProducts' => $lowStockProducts,
            'recentSales' => $recentSales,
        ]);
    }
}