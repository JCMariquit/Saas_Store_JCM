<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductStockBatch;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryReportController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = auth()->id();

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main', 'is_active'])
            ->map(fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'is_main' => (bool) $branch->is_main,
                'status' => $branch->is_active ? 'Active' : 'Inactive',
            ]);

        $requestedBranchId = $request->input('branch_id');

        $selectedBranch = $requestedBranchId
            ? $branches->firstWhere('id', (int) $requestedBranchId)
            : $branches->first();

        $branchId = $selectedBranch['id'] ?? null;

        $productsQuery = Product::query()
            ->with(['branch', 'category'])
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId));

        $products = (clone $productsQuery)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $summaryBase = Product::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId));

        $totalProducts = (clone $summaryBase)->count();

        $activeProducts = (clone $summaryBase)
            ->where('status', 'active')
            ->count();

        $inactiveProducts = (clone $summaryBase)
            ->where('status', 'inactive')
            ->count();

        $inStockProducts = (clone $summaryBase)
            ->where('quantity', '>', 0)
            ->count();

        $outOfStockProducts = (clone $summaryBase)
            ->where('quantity', '<=', 0)
            ->count();

        $lowStockProducts = (clone $summaryBase)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->where('quantity', '>', 0)
            ->count();

        $totalStockQuantity = (clone $summaryBase)
            ->sum('quantity');

        $inventoryCostValue = (clone $summaryBase)
            ->selectRaw('SUM(quantity * cost_price) as total')
            ->value('total') ?? 0;

        $inventoryRetailValue = (clone $summaryBase)
            ->selectRaw('SUM(quantity * selling_price) as total')
            ->value('total') ?? 0;

        $potentialProfit = $inventoryRetailValue - $inventoryCostValue;

        $categoryBreakdown = Product::query()
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('products.tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('products.branch_id', $branchId))
            ->selectRaw('COALESCE(categories.name, "Uncategorized") as category_name')
            ->selectRaw('COUNT(products.id) as product_count')
            ->selectRaw('COALESCE(SUM(products.quantity), 0) as total_quantity')
            ->selectRaw('COALESCE(SUM(products.quantity * products.selling_price), 0) as retail_value')
            ->groupBy('category_name')
            ->orderByDesc('retail_value')
            ->get()
            ->map(fn ($row) => [
                'category_name' => $row->category_name,
                'product_count' => (int) $row->product_count,
                'total_quantity' => (float) $row->total_quantity,
                'retail_value' => (float) $row->retail_value,
            ]);

        $stockStatusBreakdown = [
            [
                'label' => 'In Stock',
                'value' => $inStockProducts,
            ],
            [
                'label' => 'Low Stock',
                'value' => $lowStockProducts,
            ],
            [
                'label' => 'Out of Stock',
                'value' => $outOfStockProducts,
            ],
        ];

        $topInventoryValue = Product::query()
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->select('id', 'name', 'sku', 'quantity', 'cost_price', 'selling_price')
            ->selectRaw('COALESCE(quantity * selling_price, 0) as inventory_value')
            ->orderByDesc('inventory_value')
            ->limit(10)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'quantity' => (float) $product->quantity,
                'cost_price' => (float) $product->cost_price,
                'selling_price' => (float) $product->selling_price,
                'inventory_value' => (float) $product->inventory_value,
            ]);

        $lowStockItems = Product::query()
            ->with(['branch', 'category'])
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->limit(10)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'branch_name' => $product->branch?->name ?? 'Main Branch',
                'category_name' => $product->category?->name ?? 'Uncategorized',
                'quantity' => (float) $product->quantity,
                'reorder_level' => (float) $product->reorder_level,
                'status' => $product->quantity <= 0 ? 'out_of_stock' : 'low_stock',
            ]);

        $expiringBatches = ProductStockBatch::query()
            ->with(['product', 'branch'])
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereNotNull('expiry_date')
            ->where('quantity_remaining', '>', 0)
            ->whereDate('expiry_date', '>=', now()->toDateString())
            ->whereDate('expiry_date', '<=', now()->addDays(30)->toDateString())
            ->orderBy('expiry_date')
            ->limit(10)
            ->get()
            ->map(fn ($batch) => [
                'id' => $batch->id,
                'batch_no' => $batch->batch_no,
                'product_name' => $batch->product?->name ?? '-',
                'branch_name' => $batch->branch?->name ?? 'Main Branch',
                'quantity_remaining' => (float) $batch->quantity_remaining,
                'expiry_date' => optional($batch->expiry_date)->format('M d, Y'),
                'days_left' => now()->startOfDay()->diffInDays($batch->expiry_date, false),
            ]);

        $recentMovements = StockMovement::query()
            ->with(['product', 'branch'])
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->latest('movement_date')
            ->limit(10)
            ->get()
            ->map(fn ($movement) => [
                'id' => $movement->id,
                'product_name' => $movement->product?->name ?? '-',
                'branch_name' => $movement->branch?->name ?? 'Main Branch',
                'movement_type' => $movement->movement_type,
                'quantity' => (float) $movement->quantity,
                'quantity_before' => (float) $movement->quantity_before,
                'quantity_after' => (float) $movement->quantity_after,
                'movement_date' => optional($movement->movement_date)->format('M d, Y h:i A'),
                'remarks' => $movement->remarks,
            ]);

        return Inertia::render('owner/reports/inventory/index', [
            'branches' => $branches,
            'selected_branch_id' => $branchId,
            'current_branch' => $selectedBranch,

            'filters' => [
                'branch_id' => $branchId,
            ],

            'summary' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'inactive_products' => $inactiveProducts,
                'in_stock_products' => $inStockProducts,
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
                'total_stock_quantity' => (float) $totalStockQuantity,
                'inventory_cost_value' => (float) $inventoryCostValue,
                'inventory_retail_value' => (float) $inventoryRetailValue,
                'potential_profit' => (float) $potentialProfit,
            ],

            'category_breakdown' => $categoryBreakdown,
            'stock_status_breakdown' => $stockStatusBreakdown,
            'top_inventory_value' => $topInventoryValue,
            'low_stock_items' => $lowStockItems,
            'expiring_batches' => $expiringBatches,
            'recent_movements' => $recentMovements,
            'products' => $products,
        ]);
    }
}