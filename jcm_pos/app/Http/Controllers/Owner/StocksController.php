<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStockBatch;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StocksController extends Controller
{
    private function tenantId(): int
    {
        $user = auth()->user();

        return (int) ($user->client_id ?: $user->id);
    }

    private function getSelectedBranchId(Request $request, int $tenantId): ?int
    {
        if ($request->filled('branch_id')) {
            $branchId = (int) $request->branch_id;

            return Branch::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $branchId)
                ->exists()
                    ? $branchId
                    : null;
        }

        return Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->value('id');
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $selectedBranchId = $this->getSelectedBranchId($request, $tenantId);

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main', 'is_active']);

        $productsQuery = Product::query()
            ->with([
                'category:id,name',
                'branch:id,name,code',
            ])
            ->where('tenant_id', $tenantId)
            ->when($selectedBranchId, function ($query) use ($selectedBranchId) {
                $query->where('branch_id', $selectedBranchId);
            })
            ->where('stock_tracking', 'tracked');

        $products = (clone $productsQuery)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category_id'), function ($query) use ($request, $selectedBranchId) {
                $query->where('category_id', $request->category_id);

                if ($selectedBranchId) {
                    $query->whereHas('category', function ($categoryQuery) use ($selectedBranchId) {
                        $categoryQuery->where('branch_id', $selectedBranchId);
                    });
                }
            })
            ->when($request->filled('stock_status'), function ($query) use ($request) {
                if ($request->stock_status === 'out') {
                    $query->where('quantity', '<=', 0);
                }

                if ($request->stock_status === 'low') {
                    $query->whereColumn('quantity', '<=', 'reorder_level')
                        ->where('quantity', '>', 0);
                }

                if ($request->stock_status === 'normal') {
                    $query->whereColumn('quantity', '>', 'reorder_level');
                }
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->when($selectedBranchId, function ($query) use ($selectedBranchId) {
                $query->where('branch_id', $selectedBranchId);
            })
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $summary = [
            'total_products' => (clone $productsQuery)->count(),

            'low_stock' => (clone $productsQuery)
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->where('quantity', '>', 0)
                ->count(),

            'out_of_stock' => (clone $productsQuery)
                ->where('quantity', '<=', 0)
                ->count(),

            'inventory_value' => (clone $productsQuery)
                ->selectRaw('COALESCE(SUM(quantity * cost_price), 0) as total')
                ->value('total'),
        ];

        return Inertia::render('owner/inventory/stocks/index', [
            'products' => $products,
            'categories' => $categories,
            'branches' => $branches,
            'selectedBranchId' => $selectedBranchId,
            'summary' => $summary,
            'filters' => [
                'branch_id' => $selectedBranchId,
                'search' => $request->search,
                'category_id' => $request->category_id,
                'stock_status' => $request->stock_status,
            ],
        ]);
    }

    public function adjust(Request $request)
    {
        $tenantId = $this->tenantId();

        $validated = $request->validate([
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('pos.branches', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
            'product_id' => [
                'required',
                'integer',
                Rule::exists('pos.products', 'id')->where(function ($query) use ($tenantId, $request) {
                    $query->where('tenant_id', $tenantId);

                    if ($request->filled('branch_id')) {
                        $query->where('branch_id', $request->branch_id);
                    }
                }),
            ],
            'movement_type' => ['required', 'in:stock_in,adjustment_in,adjustment_out,damage,expired'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string'],
            'received_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
        ]);

        DB::connection('pos')->transaction(function () use ($validated, $tenantId) {
            $product = Product::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $validated['branch_id'])
                ->where('id', $validated['product_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $quantity = (float) $validated['quantity'];
            $unitCost = (float) ($validated['unit_cost'] ?? $product->cost_price ?? 0);
            $before = (float) $product->quantity;

            $increaseTypes = ['stock_in', 'adjustment_in'];
            $isIncrease = in_array($validated['movement_type'], $increaseTypes, true);

            $after = $isIncrease
                ? $before + $quantity
                : $before - $quantity;

            if ($after < 0) {
                abort(422, 'Stock quantity cannot be negative.');
            }

            $batchId = null;

            if ($validated['movement_type'] === 'stock_in') {
                $batch = ProductStockBatch::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $validated['branch_id'],
                    'product_id' => $product->id,
                    'batch_no' => 'BATCH-' . now()->format('YmdHis') . '-' . $product->id,
                    'quantity_received' => $quantity,
                    'quantity_remaining' => $quantity,
                    'unit_cost' => $unitCost,
                    'selling_price' => $product->selling_price,
                    'received_date' => $validated['received_date'] ?? now()->toDateString(),
                    'expiry_date' => $validated['expiry_date'] ?? null,
                    'remarks' => $validated['remarks'] ?? 'Stock in',
                ]);

                $batchId = $batch->id;
            }

            $product->update([
                'quantity' => $after,
                'cost_price' => $unitCost,
            ]);

            StockMovement::create([
                'tenant_id' => $tenantId,
                'branch_id' => $validated['branch_id'],
                'product_id' => $product->id,
                'product_stock_batch_id' => $batchId,
                'movement_type' => $validated['movement_type'],
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $quantity * $unitCost,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'remarks' => $validated['remarks'] ?? null,
                'movement_date' => now(),
                'created_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Stock updated successfully.');
    }
}