<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerPosController extends Controller
{
    private function tenantId(): int
    {
        return (int) auth()->user()->client_id;
    }

    private function branchId(): int
    {
        return (int) auth()->user()->branch_id;
    }

    public function index()
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();

        $branch = $this->getBranch($tenantId, $branchId);

        abort_if(!$branch, 403, 'Invalid or inactive branch assignment.');

        return Inertia::render('staff/manager/pos/monitor', [
            'branch' => $branch,

            'scope' => [
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
            ],

            'summary' => $this->getSummary($tenantId, $branchId),
            'products' => $this->getProductPreview($tenantId, $branchId),
            'recent_transactions' => $this->getRecentTransactions($tenantId, $branchId),

            // extra data ready for improved UI later
            'alerts' => $this->getAlerts($tenantId, $branchId),
            'sales_trend' => $this->getTodayHourlySales($tenantId, $branchId),
        ]);
    }

    private function getBranch(int $tenantId, int $branchId)
    {
        return DB::table('branches')
            ->where('id', $branchId)
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->whereNull('deleted_at')
            ->select(
                'id',
                'tenant_id',
                'name',
                'code',
                'is_main',
                'is_active'
            )
            ->first();
    }

    private function getSummary(int $tenantId, int $branchId): array
    {
        $today = now()->toDateString();

        $todaySales = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereDate('sold_at', $today)
            ->where('status', 'completed')
            ->sum('grand_total');

        $todayTransactions = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereDate('sold_at', $today)
            ->count();

        $completedTransactions = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereDate('sold_at', $today)
            ->where('status', 'completed')
            ->count();

        $productsCount = DB::table('products')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNull('deleted_at')
            ->count();

        $lowStockCount = DB::table('products')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNull('deleted_at')
            ->where('stock_tracking', 'tracked')
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->count();

        $outOfStockCount = DB::table('products')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNull('deleted_at')
            ->where('stock_tracking', 'tracked')
            ->where('quantity', '<=', 0)
            ->count();

        return [
            'today_sales' => (float) $todaySales,
            'today_transactions' => (int) $todayTransactions,
            'completed_transactions' => (int) $completedTransactions,
            'products_count' => (int) $productsCount,
            'low_stock_count' => (int) $lowStockCount,
            'out_of_stock_count' => (int) $outOfStockCount,
            'open_drawer' => $this->getOpenDrawer($tenantId, $branchId),
        ];
    }

    private function getOpenDrawer(int $tenantId, int $branchId)
    {
        return DB::table('cash_drawers')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'open')
            ->select(
                'id',
                'tenant_id',
                'branch_id',
                'opening_balance as opening_amount',
                'status',
                'opened_at'
            )
            ->latest('opened_at')
            ->first();
    }

    private function getProductPreview(int $tenantId, int $branchId)
    {
        return DB::table('products')
            ->leftJoin('categories', function ($join) use ($tenantId, $branchId) {
                $join->on('products.category_id', '=', 'categories.id')
                    ->where('categories.tenant_id', $tenantId)
                    ->where('categories.branch_id', $branchId)
                    ->whereNull('categories.deleted_at');
            })
            ->where('products.tenant_id', $tenantId)
            ->where('products.branch_id', $branchId)
            ->whereNull('products.deleted_at')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                'products.barcode',
                'products.quantity',
                'products.reorder_level',
                'products.selling_price',
                'products.status',
                'products.stock_tracking',
                'categories.name as category_name'
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

    private function getRecentTransactions(int $tenantId, int $branchId)
    {
        $paymentSubquery = DB::table('payments')
            ->select(
                'sale_id',
                DB::raw('MAX(method) as payment_method')
            )
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->groupBy('sale_id');

        return DB::table('sales')
            ->leftJoinSub($paymentSubquery, 'latest_payment', function ($join) {
                $join->on('sales.id', '=', 'latest_payment.sale_id');
            })
            ->where('sales.tenant_id', $tenantId)
            ->where('sales.branch_id', $branchId)
            ->select(
                'sales.id',
                'sales.sale_no',
                'sales.grand_total',
                'sales.amount_paid',
                'sales.change_amount',
                'sales.payment_status',
                'sales.status',
                'sales.sold_at',
                'latest_payment.payment_method'
            )
            ->latest('sales.sold_at')
            ->limit(8)
            ->get();
    }

    private function getAlerts(int $tenantId, int $branchId): array
    {
        $lowStockProducts = DB::table('products')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNull('deleted_at')
            ->where('stock_tracking', 'tracked')
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->select(
                'id',
                'name',
                'quantity',
                'reorder_level'
            )
            ->orderBy('quantity')
            ->limit(5)
            ->get();

        $pendingSalesCount = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereDate('sold_at', now()->toDateString())
            ->where('status', 'pending')
            ->count();

        return [
            'low_stock_products' => $lowStockProducts,
            'pending_sales_count' => (int) $pendingSalesCount,
        ];
    }

    private function getTodayHourlySales(int $tenantId, int $branchId)
    {
        return DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
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