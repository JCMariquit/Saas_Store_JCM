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
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    private function tenantId(): int
    {
        return auth()->id();
    }

    private function getSelectedBranchId(Request $request, int $tenantId): ?int
    {
        if ($request->filled('branch_id')) {
            $branchId = (int) $request->branch_id;

            return Branch::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $branchId)
                ->exists() ? $branchId : null;
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

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->when($selectedBranchId, fn ($query) => $query->where('branch_id', $selectedBranchId))
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::query()
            ->with([
                'category:id,name',
                'branch:id,name,code',
            ])
            ->where('tenant_id', $tenantId)
            ->when($selectedBranchId, fn ($query) => $query->where('branch_id', $selectedBranchId))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, function ($query, $categoryId) use ($selectedBranchId) {
                $query->where('category_id', $categoryId);

                if ($selectedBranchId) {
                    $query->whereHas('category', function ($categoryQuery) use ($selectedBranchId) {
                        $categoryQuery->where('branch_id', $selectedBranchId);
                    });
                }
            })
            ->when($request->status, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('owner/inventory/products/index', [
            'products' => $products,
            'branches' => $branches,
            'selectedBranchId' => $selectedBranchId,
            'categories' => $categories,
            'filters' => [
                'branch_id' => $selectedBranchId,
                'search' => $request->search,
                'category_id' => $request->category_id,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantId();

        $validated = $request->validate($this->rules($tenantId, $request));

        DB::connection('pos')->transaction(function () use ($validated, $tenantId) {
            $initialQuantity = (float) ($validated['quantity'] ?? 0);
            $costPrice = (float) ($validated['cost_price'] ?? 0);

            $product = Product::create([
                ...$validated,
                'tenant_id' => $tenantId,
                'branch_id' => $validated['branch_id'],
                'slug' => Str::slug($validated['name']),
                'unit' => $validated['unit'] ?? 'pcs',
                'cost_price' => $costPrice,
                'quantity' => $initialQuantity,
                'reorder_level' => $validated['reorder_level'] ?? 0,
                'is_taxable' => $validated['is_taxable'] ?? false,
                'allow_discount' => $validated['allow_discount'] ?? true,
                'low_stock_alert' => $validated['low_stock_alert'] ?? true,
            ]);

            if ($initialQuantity > 0 && $validated['stock_tracking'] === 'tracked') {
                $batch = ProductStockBatch::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $validated['branch_id'] ?? null,
                    'product_id' => $product->id,
                    'batch_no' => 'BATCH-' . now()->format('YmdHis') . '-' . $product->id,
                    'quantity_received' => $initialQuantity,
                    'quantity_remaining' => $initialQuantity,
                    'unit_cost' => $costPrice,
                    'selling_price' => $validated['selling_price'],
                    'received_date' => $validated['received_date'] ?? now()->toDateString(),
                    'expiry_date' => $validated['expiry_date'] ?? null,
                    'remarks' => $validated['remarks'] ?? 'Initial stock',
                ]);

                StockMovement::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $validated['branch_id'] ?? null,
                    'product_id' => $product->id,
                    'product_stock_batch_id' => $batch->id,
                    'movement_type' => 'initial_stock',
                    'quantity' => $initialQuantity,
                    'unit_cost' => $costPrice,
                    'total_cost' => $initialQuantity * $costPrice,
                    'quantity_before' => 0,
                    'quantity_after' => $initialQuantity,
                    'remarks' => 'Initial stock on product creation',
                    'movement_date' => now(),
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product)
    {
        abort_if((int) $product->tenant_id !== $this->tenantId(), 403);

        $tenantId = $this->tenantId();

        $validated = $request->validate($this->rules($tenantId, $request, false));

        $product->update([
            ...$validated,
            'branch_id' => $validated['branch_id'],
            'slug' => Str::slug($validated['name']),
            'unit' => $validated['unit'] ?? 'pcs',
            'is_taxable' => $validated['is_taxable'] ?? false,
            'allow_discount' => $validated['allow_discount'] ?? true,
            'low_stock_alert' => $validated['low_stock_alert'] ?? true,
        ]);

        return back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        abort_if((int) $product->tenant_id !== $this->tenantId(), 403);

        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }

    private function rules(int $tenantId, Request $request, bool $isCreate = true): array
    {
        return [
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('pos.branches', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('pos.categories', 'id')->where(function ($query) use ($tenantId, $request) {
                    $query->where('tenant_id', $tenantId);

                    if ($request->filled('branch_id')) {
                        $query->where('branch_id', $request->branch_id);
                    }
                }),
            ],
            'name' => ['required', 'string', 'max:180'],
            'sku' => ['nullable', 'string', 'max:100'],
            'barcode' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'unit' => ['nullable', 'string', 'max:50'],

            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'wholesale_price' => ['nullable', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],

            'quantity' => $isCreate ? ['nullable', 'numeric', 'min:0'] : ['nullable'],
            'reorder_level' => ['nullable', 'numeric', 'min:0'],
            'max_stock_level' => ['nullable', 'numeric', 'min:0'],

            'is_taxable' => ['boolean'],
            'tax_rate' => ['nullable', 'numeric', 'min:0'],
            'allow_discount' => ['boolean'],
            'discount_type' => ['nullable', 'in:fixed,percentage'],
            'discount_value' => ['nullable', 'numeric', 'min:0'],

            'product_type' => ['required', 'in:standard,service'],
            'stock_tracking' => ['required', 'in:tracked,not_tracked'],
            'low_stock_alert' => ['boolean'],
            'status' => ['required', 'in:active,inactive,draft'],

            'received_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}