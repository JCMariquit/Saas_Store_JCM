<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosMonitorController extends Controller
{
    private function tenantId(): int
    {
        $user = auth()->user();

        return (int) ($user->client_id ?: $user->id);
    }

    private function usersTable(): string
    {
        return config('database.connections.saas.database') . '.users';
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $request->filled('branch_id') ? (int) $request->branch_id : null;

        ActivityLogger::log(
            module: 'owner_pos_monitor',
            action: 'viewed',
            description: 'Owner viewed POS monitor.',
            properties: [
                'branch_id' => $branchId,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return Inertia::render('owner/terminal/monitor', [
            'branches' => $this->getBranches($tenantId),
            'selected_branch_id' => $branchId,

            'scope' => [
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
            ],

            'summary' => $this->getSummary($tenantId, $branchId),
            'products' => $this->getProductPreview($tenantId, $branchId),
            'recent_transactions' => $this->getRecentTransactions($tenantId, $branchId),
            'cashiers' => $this->getCashierActivity($tenantId, $branchId),
            'alerts' => $this->getAlerts($tenantId, $branchId),
            'sales_trend' => $this->getTodayHourlySales($tenantId, $branchId),

            'filters' => [
                'branch_id' => $branchId,
            ],
        ]);
    }

    private function getBranches(int $tenantId)
    {
        return DB::table('branches')
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->whereNull('deleted_at')
            ->select('id', 'name', 'code', 'is_main', 'is_active')
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get();
    }

    private function getSummary(int $tenantId, ?int $branchId): array
    {
        $today = now()->toDateString();

        $salesQuery = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereDate('sold_at', $today);

        $todaySales = (clone $salesQuery)
            ->where('status', 'completed')
            ->sum('grand_total');

        $todayTransactions = (clone $salesQuery)->count();

        $completedTransactions = (clone $salesQuery)
            ->where('status', 'completed')
            ->count();

        $productsQuery = DB::table('products')
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereNull('deleted_at');

        $productsCount = (clone $productsQuery)->count();

        $lowStockCount = (clone $productsQuery)
            ->where('stock_tracking', 'tracked')
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->count();

        $outOfStockCount = (clone $productsQuery)
            ->where('stock_tracking', 'tracked')
            ->where('quantity', '<=', 0)
            ->count();

        $openDrawersCount = DB::table('cash_drawers')
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->where('status', 'open')
            ->count();

        return [
            'today_sales' => (float) $todaySales,
            'today_transactions' => (int) $todayTransactions,
            'completed_transactions' => (int) $completedTransactions,
            'products_count' => (int) $productsCount,
            'low_stock_count' => (int) $lowStockCount,
            'out_of_stock_count' => (int) $outOfStockCount,
            'open_drawers_count' => (int) $openDrawersCount,
            'open_drawers' => $this->getOpenDrawers($tenantId, $branchId),
        ];
    }

    private function getOpenDrawers(int $tenantId, ?int $branchId)
    {
        return DB::table('cash_drawers')
            ->leftJoin('branches', 'cash_drawers.branch_id', '=', 'branches.id')
            ->leftJoin($this->usersTable() . ' as users', 'cash_drawers.opened_by', '=', 'users.id')
            ->where('cash_drawers.tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('cash_drawers.branch_id', $branchId))
            ->where('cash_drawers.status', 'open')
            ->select(
                'cash_drawers.id',
                'cash_drawers.branch_id',
                'cash_drawers.opening_balance as opening_amount',
                'cash_drawers.expected_balance',
                'cash_drawers.total_cash_sales',
                'cash_drawers.status',
                'cash_drawers.opened_at',
                'branches.name as branch_name',
                'users.name as opened_by_name'
            )
            ->latest('cash_drawers.opened_at')
            ->limit(10)
            ->get();
    }

    private function getProductPreview(int $tenantId, ?int $branchId)
    {
        return DB::table('products')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->leftJoin('branches', 'products.branch_id', '=', 'branches.id')
            ->where('products.tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('products.branch_id', $branchId))
            ->whereNull('products.deleted_at')
            ->select(
                'products.id',
                'products.branch_id',
                'products.name',
                'products.sku',
                'products.barcode',
                'products.quantity',
                'products.reorder_level',
                'products.selling_price',
                'products.status',
                'products.stock_tracking',
                'categories.name as category_name',
                'branches.name as branch_name'
            )
            ->orderByRaw("
                CASE
                    WHEN products.stock_tracking = 'tracked'
                    AND products.quantity <= products.reorder_level
                    THEN 0
                    ELSE 1
                END
            ")
            ->orderBy('products.name')
            ->limit(10)
            ->get();
    }

    private function getRecentTransactions(int $tenantId, ?int $branchId)
    {
        $paymentSubquery = DB::table('payments')
            ->select('sale_id', DB::raw('MAX(method) as payment_method'))
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->groupBy('sale_id');

        return DB::table('sales')
            ->leftJoinSub($paymentSubquery, 'latest_payment', function ($join) {
                $join->on('sales.id', '=', 'latest_payment.sale_id');
            })
            ->leftJoin('branches', 'sales.branch_id', '=', 'branches.id')
            ->leftJoin($this->usersTable() . ' as users', 'sales.cashier_user_id', '=', 'users.id')
            ->where('sales.tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('sales.branch_id', $branchId))
            ->select(
                'sales.id',
                'sales.branch_id',
                'sales.sale_no',
                'sales.grand_total',
                'sales.amount_paid',
                'sales.change_amount',
                'sales.payment_status',
                'sales.status',
                'sales.sold_at',
                'latest_payment.payment_method',
                'branches.name as branch_name',
                'users.name as cashier_name'
            )
            ->latest('sales.sold_at')
            ->limit(10)
            ->get();
    }

    private function getCashierActivity(int $tenantId, ?int $branchId)
    {
        return DB::table('sales')
            ->leftJoin($this->usersTable() . ' as users', 'sales.cashier_user_id', '=', 'users.id')
            ->leftJoin('branches', 'sales.branch_id', '=', 'branches.id')
            ->where('sales.tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('sales.branch_id', $branchId))
            ->whereDate('sales.sold_at', now()->toDateString())
            ->select(
                'sales.cashier_user_id',
                'users.name as cashier_name',
                'branches.name as branch_name',
                DB::raw('COUNT(sales.id) as transactions_count'),
                DB::raw("SUM(CASE WHEN sales.status = 'completed' THEN sales.grand_total ELSE 0 END) as total_sales"),
                DB::raw('MAX(sales.sold_at) as last_sale_at')
            )
            ->groupBy('sales.cashier_user_id', 'users.name', 'branches.name')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get();
    }

    private function getAlerts(int $tenantId, ?int $branchId): array
    {
        $lowStockProducts = DB::table('products')
            ->leftJoin('branches', 'products.branch_id', '=', 'branches.id')
            ->where('products.tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('products.branch_id', $branchId))
            ->whereNull('products.deleted_at')
            ->where('products.stock_tracking', 'tracked')
            ->whereColumn('products.quantity', '<=', 'products.reorder_level')
            ->select(
                'products.id',
                'products.name',
                'products.quantity',
                'products.reorder_level',
                'branches.name as branch_name'
            )
            ->orderBy('products.quantity')
            ->limit(5)
            ->get();

        $pendingSalesCount = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereDate('sold_at', now()->toDateString())
            ->where('status', 'pending')
            ->count();

        return [
            'low_stock_products' => $lowStockProducts,
            'pending_sales_count' => (int) $pendingSalesCount,
        ];
    }

    private function getTodayHourlySales(int $tenantId, ?int $branchId)
    {
        return DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereDate('sold_at', now()->toDateString())
            ->where('status', 'completed')
            ->selectRaw('HOUR(sold_at) as hour')
            ->selectRaw('COUNT(*) as transactions')
            ->selectRaw('SUM(grand_total) as total_sales')
            ->groupByRaw('HOUR(sold_at)')
            ->orderBy('hour')
            ->get();
    }
}