<?php

namespace App\Http\Controllers\Staff\Staff;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StaffDashboardController extends Controller
{
    private function tenantId(): int
    {
        return (int) auth()->user()->client_id;
    }

    private function branchId(): int
    {
        $branchId = (int) auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this staff.');

        return $branchId;
    }

    public function index()
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $userId = (int) auth()->id();

        $branch = DB::table('branches')
            ->where('tenant_id', $tenantId)
            ->where('id', $branchId)
            ->where('is_active', 1)
            ->whereNull('deleted_at')
            ->select('id', 'name', 'code', 'is_main', 'is_active')
            ->first();

        abort_if(!$branch, 403, 'Invalid or inactive branch assignment.');

        $recentProducts = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('created_by', $userId)
            ->latest('created_at')
            ->limit(6)
            ->get([
                'id',
                'category_id',
                'name',
                'sku',
                'barcode',
                'quantity',
                'selling_price',
                'status',
                'stock_tracking',
                'created_at',
            ]);

        $lowStockProducts = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNull('deleted_at')
            ->where('stock_tracking', 'tracked')
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->limit(6)
            ->get([
                'id',
                'category_id',
                'name',
                'sku',
                'quantity',
                'reorder_level',
                'status',
            ]);

        return Inertia::render('staff/staff/dashboard', [
            'staff' => [
                'id' => $userId,
                'name' => auth()->user()->name,
            ],
            'branch' => $branch,
            'summary' => [
                'total_products' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->whereNull('deleted_at')
                    ->count(),

                'products_added_by_me' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('created_by', $userId)
                    ->whereNull('deleted_at')
                    ->count(),

                'added_today' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('created_by', $userId)
                    ->whereNull('deleted_at')
                    ->whereDate('created_at', now()->toDateString())
                    ->count(),

                'low_stock_products' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->whereNull('deleted_at')
                    ->where('stock_tracking', 'tracked')
                    ->whereColumn('quantity', '<=', 'reorder_level')
                    ->where('quantity', '>', 0)
                    ->count(),

                'out_of_stock_products' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->whereNull('deleted_at')
                    ->where('stock_tracking', 'tracked')
                    ->where('quantity', '<=', 0)
                    ->count(),
            ],
            'recent_products' => $recentProducts,
            'low_stock_products' => $lowStockProducts,
        ]);
    }
}