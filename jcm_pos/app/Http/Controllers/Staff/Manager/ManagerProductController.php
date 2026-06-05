<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStockBatch;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ManagerProductController extends Controller
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

    public function index(Request $request)
    {
        $branch = $this->managerBranch();
        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::query()
            ->with(['category:id,name', 'branch:id,name,code'])
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($request->status, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('staff/manager/products/index', [
            'products' => $products,
            'branch' => $branch,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $branch = $this->managerBranch();
        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $validated = $request->validate($this->rules($tenantId, $branchId));

        DB::connection('pos')->transaction(function () use ($validated, $tenantId, $branchId) {
            $initialQuantity = (float) ($validated['quantity'] ?? 0);
            $costPrice = (float) ($validated['cost_price'] ?? 0);

            $product = Product::create([
                ...$validated,
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
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
                    'branch_id' => $branchId,
                    'product_id' => $product->id,
                    'batch_no' => 'BATCH-' . now()->format('YmdHis') . '-' . $product->id,
                    'quantity_received' => $initialQuantity,
                    'quantity_remaining' => $initialQuantity,
                    'unit_cost' => $costPrice,
                    'selling_price' => $validated['selling_price'],
                    'received_date' => $validated['received_date'] ?? now()->toDateString(),
                    'expiry_date' => $validated['expiry_date'] ?? null,
                    'remarks' => $validated['remarks'] ?? 'Initial stock by manager',
                ]);

                StockMovement::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,
                    'product_id' => $product->id,
                    'product_stock_batch_id' => $batch->id,
                    'movement_type' => 'initial_stock',
                    'quantity' => $initialQuantity,
                    'unit_cost' => $costPrice,
                    'total_cost' => $initialQuantity * $costPrice,
                    'quantity_before' => 0,
                    'quantity_after' => $initialQuantity,
                    'remarks' => 'Initial stock on product creation by manager',
                    'movement_date' => now(),
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Product created successfully.');
    }

    private function rules(int $tenantId, int $branchId): array
    {
        return [
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('pos.categories', 'id')->where(
                    fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->where('branch_id', $branchId)
                ),
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

            'quantity' => ['nullable', 'numeric', 'min:0'],
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