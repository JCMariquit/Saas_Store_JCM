<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $categoryId = (int) $request->input(
            'category_id',
            0
        );

        $stockTracking = trim(
            (string) $request->input(
                'stock_tracking',
                ''
            )
        );

        $products = Product::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'category:id,name,slug,is_active',
            ])
            ->withCount([
                'warehouseStocks',
                'stockMovements',
            ])
            ->withSum(
                'warehouseStocks as total_stock',
                'quantity'
            )
            ->when(
                $search !== '',
                function (
                    Builder $query
                ) use ($search): void {
                    $query->where(
                        function (
                            Builder $query
                        ) use ($search): void {
                            $query
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'sku',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'barcode',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'description',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
            )
            ->when(
                $categoryId > 0,
                fn (Builder $query) => $query->where(
                    'category_id',
                    $categoryId
                )
            )
            ->when(
                $status === 'active',
                fn (Builder $query) => $query->where(
                    'is_active',
                    true
                )
            )
            ->when(
                $status === 'inactive',
                fn (Builder $query) => $query->where(
                    'is_active',
                    false
                )
            )
            ->when(
                in_array(
                    $stockTracking,
                    ['tracked', 'not_tracked'],
                    true
                ),
                fn (Builder $query) => $query->where(
                    'stock_tracking',
                    $stockTracking
                )
            )
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $summaryQuery = Product::query()
            ->where('tenant_id', $tenantId);

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->select([
                'id',
                'parent_id',
                'name',
                'slug',
                'is_active',
            ])
            ->orderByDesc('is_active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'inventory/products/index',
            [
                'products' => $products,

                'categories' => $categories,

                'summary' => [
                    'total' => (clone $summaryQuery)
                        ->count(),

                    'active' => (clone $summaryQuery)
                        ->where('is_active', true)
                        ->count(),

                    'tracked' => (clone $summaryQuery)
                        ->where(
                            'stock_tracking',
                            'tracked'
                        )
                        ->count(),

                    'not_tracked' => (clone $summaryQuery)
                        ->where(
                            'stock_tracking',
                            'not_tracked'
                        )
                        ->count(),
                ],

                'filters' => [
                    'search' => $search,

                    'status' => $status,

                    'category_id' => $categoryId > 0
                        ? $categoryId
                        : null,

                    'stock_tracking' => $stockTracking,
                ],
            ]
        );
    }

    public function store(
        Request $request
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate(
            $this->validationRules(
                $tenantId
            )
        );

        DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $validated
            ): void {
                $name = trim(
                    $validated['name']
                );

                Product::query()->create([
                    'tenant_id' => $tenantId,

                    'category_id' => filled(
                        $validated['category_id']
                            ?? null
                    )
                        ? (int) $validated['category_id']
                        : null,

                    'name' => $name,

                    'slug' => $this->createUniqueSlug(
                        $name,
                        $tenantId
                    ),

                    'sku' => $this->nullableUppercaseString(
                        $validated['sku'] ?? null
                    ),

                    'barcode' => $this->nullableString(
                        $validated['barcode'] ?? null
                    ),

                    'description' => $this->nullableString(
                        $validated['description'] ?? null
                    ),

                    'unit' => trim(
                        $validated['unit']
                    ),

                    'cost_price' => $validated[
                        'cost_price'
                    ],

                    'selling_price' => $validated[
                        'selling_price'
                    ],

                    'wholesale_price' => filled(
                        $validated['wholesale_price']
                            ?? null
                    )
                        ? $validated['wholesale_price']
                        : null,

                    'stock_tracking' => $validated[
                        'stock_tracking'
                    ],

                    'is_active' => (bool) $validated[
                        'is_active'
                    ],

                    'created_by' => $request->user()?->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Product created successfully.'
        );
    }

    public function update(
        Request $request,
        Product $product
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureProductBelongsToTenant(
            $product,
            $tenantId
        );

        $validated = $request->validate(
            $this->validationRules(
                $tenantId,
                $product->id
            )
        );

        $newStockTracking = $validated[
            'stock_tracking'
        ];

        if (
            $product->stock_tracking === 'tracked'
            && $newStockTracking === 'not_tracked'
            && (
                $product->warehouseStocks()->exists()
                || $product->stockMovements()->exists()
            )
        ) {
            throw ValidationException::withMessages([
                'stock_tracking' => 'Stock tracking cannot be disabled because this product already has stock records or movement history.',
            ]);
        }

        DB::connection('mysql')->transaction(
            function () use (
                $product,
                $tenantId,
                $validated
            ): void {
                $name = trim(
                    $validated['name']
                );

                $product->update([
                    'category_id' => filled(
                        $validated['category_id']
                            ?? null
                    )
                        ? (int) $validated['category_id']
                        : null,

                    'name' => $name,

                    'slug' => $this->createUniqueSlug(
                        $name,
                        $tenantId,
                        $product->id
                    ),

                    'sku' => $this->nullableUppercaseString(
                        $validated['sku'] ?? null
                    ),

                    'barcode' => $this->nullableString(
                        $validated['barcode'] ?? null
                    ),

                    'description' => $this->nullableString(
                        $validated['description'] ?? null
                    ),

                    'unit' => trim(
                        $validated['unit']
                    ),

                    'cost_price' => $validated[
                        'cost_price'
                    ],

                    'selling_price' => $validated[
                        'selling_price'
                    ],

                    'wholesale_price' => filled(
                        $validated['wholesale_price']
                            ?? null
                    )
                        ? $validated['wholesale_price']
                        : null,

                    'stock_tracking' => $validated[
                        'stock_tracking'
                    ],

                    'is_active' => (bool) $validated[
                        'is_active'
                    ],
                ]);
            }
        );

        return back()->with(
            'success',
            'Product updated successfully.'
        );
    }

    public function updateStatus(
        Request $request,
        Product $product
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureProductBelongsToTenant(
            $product,
            $tenantId
        );

        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $isActive = (bool) $validated[
            'is_active'
        ];

        $product->update([
            'is_active' => $isActive,
        ]);

        return back()->with(
            'success',
            $isActive
                ? 'Product activated successfully.'
                : 'Product deactivated successfully.'
        );
    }

    public function destroy(
        Request $request,
        Product $product
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureProductBelongsToTenant(
            $product,
            $tenantId
        );

        if ($product->warehouseStocks()->exists()) {
            return back()->with(
                'error',
                'This product cannot be deleted because it has warehouse stock records.'
            );
        }

        if ($product->stockMovements()->exists()) {
            return back()->with(
                'error',
                'This product cannot be deleted because it has stock movement history.'
            );
        }

        $product->delete();

        return back()->with(
            'success',
            'Product deleted successfully.'
        );
    }

    private function validationRules(
        int $tenantId,
        ?int $ignoreProductId = null
    ): array {
        return [
            'category_id' => [
                'nullable',
                'integer',

                Rule::exists(
                    'categories',
                    'id'
                )->where(
                    fn ($query) => $query
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->whereNull('deleted_at')
                ),
            ],

            'name' => [
                'required',
                'string',
                'max:180',
            ],

            'sku' => [
                'nullable',
                'string',
                'max:100',

                Rule::unique(
                    'products',
                    'sku'
                )
                    ->ignore($ignoreProductId)
                    ->where(
                        fn ($query) => $query->where(
                            'tenant_id',
                            $tenantId
                        )
                    ),
            ],

            'barcode' => [
                'nullable',
                'string',
                'max:120',

                Rule::unique(
                    'products',
                    'barcode'
                )
                    ->ignore($ignoreProductId)
                    ->where(
                        fn ($query) => $query->where(
                            'tenant_id',
                            $tenantId
                        )
                    ),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'unit' => [
                'required',
                'string',
                'max:50',
            ],

            'cost_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'selling_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'wholesale_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'stock_tracking' => [
                'required',
                Rule::in([
                    'tracked',
                    'not_tracked',
                ]),
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ];
    }

    private function getTenantId(
        Request $request
    ): int {
        $tenantId = (int) (
            $request->user()?->client_id ?? 0
        );

        if (
            $tenantId <= 0
            && app()->environment('local')
        ) {
            return 1;
        }

        abort_if(
            $tenantId <= 0,
            403,
            'Your account is not assigned to a client.'
        );

        return $tenantId;
    }

    private function ensureProductBelongsToTenant(
        Product $product,
        int $tenantId
    ): void {
        abort_unless(
            (int) $product->tenant_id === $tenantId,
            404
        );
    }

    private function createUniqueSlug(
        string $name,
        int $tenantId,
        ?int $ignoreProductId = null
    ): string {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            $baseSlug = 'product';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            Product::withTrashed()
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->where('slug', $slug)
                ->when(
                    $ignoreProductId !== null,
                    fn (Builder $query) => $query
                        ->where(
                            'id',
                            '!=',
                            $ignoreProductId
                        )
                )
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function nullableString(
        mixed $value
    ): ?string {
        $value = trim(
            (string) $value
        );

        return $value !== ''
            ? $value
            : null;
    }

    private function nullableUppercaseString(
        mixed $value
    ): ?string {
        $value = trim(
            (string) $value
        );

        return $value !== ''
            ? Str::upper($value)
            : null;
    }
}