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

        $branch = DB::table('branches')
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

        abort_if(!$branch, 403, 'Invalid or inactive branch assignment.');

        $products = DB::table('products')
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
            ->orderBy('products.name')
            ->limit(10)
            ->get();

        $todaySales = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereDate('sold_at', now()->toDateString())
            ->where('status', 'completed')
            ->sum('grand_total');

        $todayTransactions = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereDate('sold_at', now()->toDateString())
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

        $openDrawer = DB::table('cash_drawers')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'open')
            ->select(
                'id',
                'tenant_id',
                'branch_id',
                'status',
                'opened_at'
            )
            ->latest('opened_at')
            ->first();

        $recentTransactions = DB::table('sales')
            ->leftJoin('payments', function ($join) use ($tenantId, $branchId) {
                $join->on('sales.id', '=', 'payments.sale_id')
                    ->where('payments.tenant_id', $tenantId)
                    ->where('payments.branch_id', $branchId);
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
                'payments.method as payment_method'
            )
            ->latest('sales.sold_at')
            ->limit(8)
            ->get();

        return Inertia::render('staff/manager/pos/monitor', [
            'branch' => $branch,
            'scope' => [
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
            ],
            'summary' => [
                'today_sales' => (float) $todaySales,
                'today_transactions' => $todayTransactions,
                'products_count' => $productsCount,
                'low_stock_count' => $lowStockCount,
                'open_drawer' => $openDrawer,
            ],
            'products' => $products,
            'recent_transactions' => $recentTransactions,
        ]);
    }
}