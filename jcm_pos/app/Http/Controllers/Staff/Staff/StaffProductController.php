<?php

namespace App\Http\Controllers\Staff\Staff;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StaffProductController extends Controller
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

    private function usersTable(): string
    {
        return DB::connection('saas')->getDatabaseName() . '.users';
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();

        $branch = DB::table('branches')
            ->where('tenant_id', $tenantId)
            ->where('id', $branchId)
            ->where('is_active', 1)
            ->whereNull('deleted_at')
            ->select('id', 'name', 'code', 'is_main', 'is_active')
            ->first();

        abort_if(!$branch, 403, 'Invalid or inactive branch assignment.');

        $products = Product::query()
            ->leftJoin($this->usersTable() . ' as users', 'products.created_by', '=', 'users.id')
            ->leftJoin('categories', function ($join) use ($tenantId, $branchId) {
                $join->on('products.category_id', '=', 'categories.id')
                    ->where('categories.tenant_id', $tenantId)
                    ->where('categories.branch_id', $branchId)
                    ->whereNull('categories.deleted_at');
            })
            ->where('products.tenant_id', $tenantId)
            ->where('products.branch_id', $branchId)
            ->whereNull('products.deleted_at')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    $q->where('products.name', 'like', "%{$search}%")
                        ->orWhere('products.sku', 'like', "%{$search}%")
                        ->orWhere('products.barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category_id'), fn ($query) => $query->where('products.category_id', $request->category_id))
            ->when($request->filled('status'), fn ($query) => $query->where('products.status', $request->status))
            ->select(
                'products.*',
                'categories.name as category_name',
                'users.name as created_by_name'
            )
            ->orderBy('products.name')
            ->paginate(12)
            ->withQueryString();

        $products->getCollection()->transform(function ($product) {
            $product->category = $product->category_name
                ? [
                    'id' => $product->category_id,
                    'name' => $product->category_name,
                ]
                : null;

            return $product;
        });

        $categories = DB::table('categories')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'active')
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('staff/staff/products/index', [
            'branch' => $branch,
            'products' => $products,
            'categories' => $categories,
            'summary' => [
                'total_products' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->whereNull('deleted_at')
                    ->count(),

                'active_products' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->whereNull('deleted_at')
                    ->where('status', 'active')
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
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $userId = (int) auth()->user()->id;

        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId),
            ],
            'name' => ['required', 'string', 'max:180'],
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'sku')
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->whereNull('deleted_at'),
            ],
            'barcode' => [
                'nullable',
                'string',
                'max:120',
                Rule::unique('products', 'barcode')
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string'],
            'unit' => ['nullable', 'string', 'max:50'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'wholesale_price' => ['nullable', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['nullable', 'numeric', 'min:0'],
            'reorder_level' => ['nullable', 'numeric', 'min:0'],
            'product_type' => ['required', 'in:standard,service'],
            'stock_tracking' => ['required', 'in:tracked,not_tracked'],
            'status' => ['required', 'in:active,inactive,draft'],
        ]);

        $product = Product::create([
            'tenant_id' => $tenantId,
            'branch_id' => $branchId,
            'created_by' => $userId,

            'category_id' => $validated['category_id'] ?? null,
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::lower(Str::random(5)),
            'sku' => $validated['sku'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
            'description' => $validated['description'] ?? null,
            'unit' => $validated['unit'] ?: 'pcs',

            'cost_price' => $validated['cost_price'] ?? 0,
            'selling_price' => $validated['selling_price'],
            'wholesale_price' => $validated['wholesale_price'] ?? null,
            'compare_at_price' => $validated['compare_at_price'] ?? null,

            'quantity' => $validated['stock_tracking'] === 'tracked'
                ? ($validated['quantity'] ?? 0)
                : 0,
            'reorder_level' => $validated['reorder_level'] ?? 0,

            'is_taxable' => 0,
            'tax_rate' => 0,
            'allow_discount' => 1,
            'discount_type' => null,
            'discount_value' => 0,

            'product_type' => $validated['product_type'],
            'stock_tracking' => $validated['stock_tracking'],
            'low_stock_alert' => 1,
            'status' => $validated['status'],
        ]);

        ActivityLogger::log(
            module: 'staff_products',
            action: 'created',
            description: "Staff added product {$product->name}.",
            subject: $product,
            properties: [
                'product_id' => $product->id,
                'created_by' => $userId,
                'created_by_name' => auth()->user()->name,
                'sku' => $product->sku,
                'barcode' => $product->barcode,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return back()->with('success', 'Product added successfully.');
    }
}