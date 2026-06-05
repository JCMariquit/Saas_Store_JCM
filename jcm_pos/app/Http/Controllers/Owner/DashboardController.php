<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CashDrawer;
use App\Models\Category;
use App\Models\Discount;
use App\Models\Product;
use App\Models\ReturnItem;
use App\Models\Sale;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = auth()->id();

        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $branchId = $request->input('branch_id');

        $salesQuery = Sale::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId));

        $productQuery = Product::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId));

        $todaySales = (clone $salesQuery)
            ->whereDate('sold_at', $today)
            ->where('status', 'completed')
            ->sum('grand_total');

        $todayTransactions = (clone $salesQuery)
            ->whereDate('sold_at', $today)
            ->where('status', 'completed')
            ->count();

        $monthlySales = (clone $salesQuery)
            ->whereBetween('sold_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'completed')
            ->sum('grand_total');

        $monthlyTransactions = (clone $salesQuery)
            ->whereBetween('sold_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'completed')
            ->count();

        $totalProducts = (clone $productQuery)->count();

        $activeProducts = (clone $productQuery)
            ->where('status', 'active')
            ->count();

        $lowStockProducts = (clone $productQuery)
            ->where('stock_tracking', true)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->count();

        $outOfStockProducts = (clone $productQuery)
            ->where('stock_tracking', true)
            ->where('quantity', '<=', 0)
            ->count();

        $totalBranches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->count();

        $activeBranches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->count();

        $totalCategories = Category::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->count();

        $activeDiscounts = Discount::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            })
            ->count();

        $pendingReturns = ReturnItem::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->where('status', 'pending')
            ->count();

        $openCashDrawers = CashDrawer::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->where('status', 'open')
            ->count();

        $recentSales = (clone $salesQuery)
            ->with(['branch'])
            ->latest('sold_at')
            ->limit(8)
            ->get()
            ->map(fn ($sale) => [
                'id' => $sale->id,
                'sale_no' => $sale->sale_no,
                'branch_name' => $sale->branch?->name ?? 'Main',
                'grand_total' => (float) $sale->grand_total,
                'payment_status' => $sale->payment_status,
                'status' => $sale->status,
                'sold_at' => optional($sale->sold_at)->format('M d, Y h:i A'),
            ]);

        $lowStockList = (clone $productQuery)
            ->with(['branch', 'category'])
            ->where('stock_tracking', true)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->limit(8)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'branch_name' => $product->branch?->name ?? 'Main',
                'category_name' => $product->category?->name ?? 'Uncategorized',
                'quantity' => (float) $product->quantity,
                'reorder_level' => (float) $product->reorder_level,
            ]);

        $recentStockMovements = StockMovement::query()
            ->with(['product', 'branch'])
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->latest('movement_date')
            ->limit(8)
            ->get()
            ->map(fn ($movement) => [
                'id' => $movement->id,
                'product_name' => $movement->product?->name ?? 'Unknown Product',
                'branch_name' => $movement->branch?->name ?? 'Main',
                'movement_type' => $movement->movement_type,
                'quantity' => (float) $movement->quantity,
                'quantity_after' => (float) $movement->quantity_after,
                'movement_date' => optional($movement->movement_date)->format('M d, Y h:i A'),
            ]);

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get()
            ->map(fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'is_main' => (bool) $branch->is_main,
                'is_active' => (bool) $branch->is_active,
            ]);

        return Inertia::render('owner/dashboard', [
            'filters' => [
                'branch_id' => $branchId,
            ],

            'branches' => $branches,

            'summary' => [
                'today_sales' => (float) $todaySales,
                'today_transactions' => $todayTransactions,
                'monthly_sales' => (float) $monthlySales,
                'monthly_transactions' => $monthlyTransactions,
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
                'total_branches' => $totalBranches,
                'active_branches' => $activeBranches,
                'total_categories' => $totalCategories,
                'active_discounts' => $activeDiscounts,
                'pending_returns' => $pendingReturns,
                'open_cash_drawers' => $openCashDrawers,
            ],

            'recent_sales' => $recentSales,
            'low_stock_list' => $lowStockList,
            'recent_stock_movements' => $recentStockMovements,
        ]);
    }
}