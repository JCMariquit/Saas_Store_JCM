<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierProductController extends Controller
{
    private function tenantId(): int
    {
        return (int) auth()->user()->client_id;
    }

    private function branchId(): int
    {
        $branchId = (int) auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this cashier.');

        return $branchId;
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();

        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $stockStatus = $request->input('stock_status', 'in_stock');
        $status = $request->input('status');

        $products = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($stockStatus, function ($query) use ($stockStatus) {
                if ($stockStatus === 'in_stock') {
                    $query->where(function ($q) {
                        $q->where('stock_tracking', 'not_tracked')
                            ->orWhere('quantity', '>', 0);
                    });
                }

                if ($stockStatus === 'low_stock') {
                    $query->where('stock_tracking', 'tracked')
                        ->whereColumn('quantity', '<=', 'reorder_level')
                        ->where('quantity', '>', 0);
                }

                if ($stockStatus === 'out_of_stock') {
                    $query->where('stock_tracking', 'tracked')
                        ->where('quantity', '<=', 0);
                }
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $summaryBase = Product::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId);

        return Inertia::render('staff/cashier/products/index', [
            'products' => $products,
            'categories' => $categories,
            'summary' => [
                'total_products' => (clone $summaryBase)->count(),
                'active_products' => (clone $summaryBase)->where('status', 'active')->count(),
                'low_stock' => (clone $summaryBase)
                    ->where('stock_tracking', 'tracked')
                    ->whereColumn('quantity', '<=', 'reorder_level')
                    ->where('quantity', '>', 0)
                    ->count(),
                'out_of_stock' => (clone $summaryBase)
                    ->where('stock_tracking', 'tracked')
                    ->where('quantity', '<=', 0)
                    ->count(),
            ],
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'stock_status' => $stockStatus,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        abort(403, 'Cashiers cannot create products.');
    }
}