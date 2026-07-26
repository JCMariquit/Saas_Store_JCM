<?php

namespace App\Http\Controllers;

use App\Services\Inventory\InventoryAccessContext;
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
    public function __construct(
        private readonly InventoryAccessContext $access
    ) {
    }

    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);

        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));
        $categoryId = max(0, (int) $request->input('category_id', 0));
        $stockTracking = trim((string) $request->input('stock_tracking', ''));
        $batchTracking = trim((string) $request->input('batch_tracking', ''));

        if (! in_array($status, ['active', 'inactive'], true)) {
            $status = '';
        }

        if (! in_array($stockTracking, ['tracked', 'not_tracked'], true)) {
            $stockTracking = '';
        }

        if (! in_array($batchTracking, ['enabled', 'disabled'], true)) {
            $batchTracking = '';
        }

        $batchCountSubquery = DB::connection('mysql')
            ->table('stock_batches')
            ->selectRaw('COUNT(*)')
            ->whereColumn('stock_batches.tenant_id', 'products.tenant_id')
            ->whereColumn('stock_batches.product_id', 'products.id');

        $availableBatchCountSubquery = DB::connection('mysql')
            ->table('warehouse_batch_stocks')
            ->selectRaw('COUNT(DISTINCT warehouse_batch_stocks.stock_batch_id)')
            ->whereColumn('warehouse_batch_stocks.tenant_id', 'products.tenant_id')
            ->whereColumn('warehouse_batch_stocks.product_id', 'products.id')
            ->where('warehouse_batch_stocks.quantity', '>', 0);

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
            ->addSelect([
                'stock_batches_count' => $batchCountSubquery,
                'available_stock_batches_count' => $availableBatchCountSubquery,
            ])
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    $query->where(
                        function (Builder $query) use ($search): void {
                            $query
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('sku', 'like', "%{$search}%")
                                ->orWhere('barcode', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%");
                        }
                    );
                }
            )
            ->when(
                $categoryId > 0,
                fn (Builder $query) => $query->where('category_id', $categoryId)
            )
            ->when(
                $status === 'active',
                fn (Builder $query) => $query->where('is_active', true)
            )
            ->when(
                $status === 'inactive',
                fn (Builder $query) => $query->where('is_active', false)
            )
            ->when(
                $stockTracking !== '',
                fn (Builder $query) => $query->where('stock_tracking', $stockTracking)
            )
            ->when(
                $batchTracking === 'enabled',
                fn (Builder $query) => $query->where('batch_tracking_enabled', true)
            )
            ->when(
                $batchTracking === 'disabled',
                fn (Builder $query) => $query->where('batch_tracking_enabled', false)
            )
            ->orderByDesc('is_active')
            ->orderByDesc('batch_tracking_enabled')
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
                    'total' => (clone $summaryQuery)->count(),
                    'active' => (clone $summaryQuery)
                        ->where('is_active', true)
                        ->count(),
                    'tracked' => (clone $summaryQuery)
                        ->where('stock_tracking', 'tracked')
                        ->count(),
                    'not_tracked' => (clone $summaryQuery)
                        ->where('stock_tracking', 'not_tracked')
                        ->count(),
                    'batch_enabled' => (clone $summaryQuery)
                        ->where('batch_tracking_enabled', true)
                        ->count(),
                    'expiration_required' => (clone $summaryQuery)
                        ->where('requires_expiration_date', true)
                        ->count(),
                ],
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'category_id' => $categoryId > 0 ? $categoryId : null,
                    'stock_tracking' => $stockTracking,
                    'batch_tracking' => $batchTracking,
                ],
            ]
        );
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = $this->getTenantId($request);
        $validated = $request->validate($this->validationRules($tenantId));
        $payload = $this->normalisePayload($validated);

        DB::connection('mysql')->transaction(
            function () use ($request, $tenantId, $payload): void {
                $name = trim($payload['name']);

                $product = new Product();
                $product->forceFill([
                    'tenant_id' => $tenantId,
                    'category_id' => $payload['category_id'],
                    'name' => $name,
                    'slug' => $this->createUniqueSlug($name, $tenantId),
                    'sku' => $this->nullableUppercaseString($payload['sku']),
                    'barcode' => $this->nullableString($payload['barcode']),
                    'description' => $this->nullableString($payload['description']),
                    'unit' => trim($payload['unit']),
                    'cost_price' => $payload['cost_price'],
                    'stock_tracking' => $payload['stock_tracking'],
                    'batch_tracking_enabled' => $payload['batch_tracking_enabled'],
                    'batch_issue_policy' => $payload['batch_issue_policy'],
                    'requires_expiration_date' => $payload['requires_expiration_date'],
                    'expiry_warning_days' => $payload['expiry_warning_days'],
                    'is_active' => $payload['is_active'],
                    'created_by' => $request->user()?->id,
                ])->save();
            }
        );

        return back()->with('success', 'Product created successfully.');
    }

    public function update(
        Request $request,
        Product $product
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);
        $this->ensureProductBelongsToTenant($product, $tenantId);

        $validated = $request->validate(
            $this->validationRules($tenantId, $product->id)
        );
        $payload = $this->normalisePayload($validated);

        if (
            $product->stock_tracking === 'tracked'
            && $payload['stock_tracking'] === 'not_tracked'
            && $this->productHasInventoryHistory($product)
        ) {
            throw ValidationException::withMessages([
                'stock_tracking' => 'Stock tracking cannot be disabled because this product already has warehouse stock, batch, or movement history.',
            ]);
        }

        if (
            (bool) $product->batch_tracking_enabled
            && ! $payload['batch_tracking_enabled']
            && $this->productHasBatchHistory($tenantId, $product->id)
        ) {
            throw ValidationException::withMessages([
                'batch_tracking_enabled' => 'Batch tracking cannot be disabled because this product already has batch records or batch movement history.',
            ]);
        }

        if (
            ! (bool) $product->batch_tracking_enabled
            && $payload['batch_tracking_enabled']
        ) {
            $this->ensureBatchBalancesAreReconciled($tenantId, $product->id);
        }

        DB::connection('mysql')->transaction(
            function () use ($product, $tenantId, $payload): void {
                $name = trim($payload['name']);

                $product->forceFill([
                    'category_id' => $payload['category_id'],
                    'name' => $name,
                    'slug' => $this->createUniqueSlug(
                        $name,
                        $tenantId,
                        $product->id
                    ),
                    'sku' => $this->nullableUppercaseString($payload['sku']),
                    'barcode' => $this->nullableString($payload['barcode']),
                    'description' => $this->nullableString($payload['description']),
                    'unit' => trim($payload['unit']),
                    'cost_price' => $payload['cost_price'],
                    'stock_tracking' => $payload['stock_tracking'],
                    'batch_tracking_enabled' => $payload['batch_tracking_enabled'],
                    'batch_issue_policy' => $payload['batch_issue_policy'],
                    'requires_expiration_date' => $payload['requires_expiration_date'],
                    'expiry_warning_days' => $payload['expiry_warning_days'],
                    'is_active' => $payload['is_active'],
                ])->save();
            }
        );

        return back()->with('success', 'Product updated successfully.');
    }

    public function updateStatus(
        Request $request,
        Product $product
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);
        $this->ensureProductBelongsToTenant($product, $tenantId);

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $isActive = (bool) $validated['is_active'];

        $product->forceFill([
            'is_active' => $isActive,
        ])->save();

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
        $this->ensureProductBelongsToTenant($product, $tenantId);

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

        if ($this->productHasBatchHistory($tenantId, $product->id)) {
            return back()->with(
                'error',
                'This product cannot be deleted because it has batch records or batch allocation history.'
            );
        }

        $product->delete();

        return back()->with('success', 'Product deleted successfully.');
    }

    private function validationRules(
        int $tenantId,
        ?int $ignoreProductId = null
    ): array {
        return [
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where(
                    fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->whereNull('deleted_at')
                ),
            ],
            'name' => ['required', 'string', 'max:180'],
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'sku')
                    ->ignore($ignoreProductId)
                    ->where(
                        fn ($query) => $query->where('tenant_id', $tenantId)
                    ),
            ],
            'barcode' => [
                'nullable',
                'string',
                'max:120',
                Rule::unique('products', 'barcode')
                    ->ignore($ignoreProductId)
                    ->where(
                        fn ($query) => $query->where('tenant_id', $tenantId)
                    ),
            ],
            'description' => ['nullable', 'string'],
            'unit' => ['required', 'string', 'max:50'],
            'cost_price' => ['required', 'numeric', 'min:0', 'max:99999999999999.9999'],
            'stock_tracking' => [
                'required',
                Rule::in(['tracked', 'not_tracked']),
            ],
            'batch_tracking_enabled' => ['required', 'boolean'],
            'batch_issue_policy' => [
                'required',
                Rule::in(['fifo', 'fefo', 'manual']),
            ],
            'requires_expiration_date' => ['required', 'boolean'],
            'expiry_warning_days' => [
                'nullable',
                'integer',
                'min:1',
                'max:3650',
            ],
            'is_active' => ['required', 'boolean'],
        ];
    }

    private function normalisePayload(array $validated): array
    {
        $stockTracking = $validated['stock_tracking'];
        $batchTrackingEnabled = $stockTracking === 'tracked'
            && (bool) $validated['batch_tracking_enabled'];

        $requiresExpirationDate = $batchTrackingEnabled
            && (bool) $validated['requires_expiration_date'];

        $expiryWarningDays = $batchTrackingEnabled
            && filled($validated['expiry_warning_days'] ?? null)
                ? (int) $validated['expiry_warning_days']
                : null;

        return [
            'category_id' => filled($validated['category_id'] ?? null)
                ? (int) $validated['category_id']
                : null,
            'name' => trim($validated['name']),
            'sku' => $validated['sku'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
            'description' => $validated['description'] ?? null,
            'unit' => trim($validated['unit']),
            'cost_price' => $validated['cost_price'],
            'stock_tracking' => $stockTracking,
            'batch_tracking_enabled' => $batchTrackingEnabled,
            'batch_issue_policy' => $batchTrackingEnabled
                ? $validated['batch_issue_policy']
                : 'fifo',
            'requires_expiration_date' => $requiresExpirationDate,
            'expiry_warning_days' => $expiryWarningDays,
            'is_active' => (bool) $validated['is_active'],
        ];
    }

    private function productHasInventoryHistory(Product $product): bool
    {
        return $product->warehouseStocks()->exists()
            || $product->stockMovements()->exists()
            || $this->productHasBatchHistory(
                (int) $product->tenant_id,
                (int) $product->id
            );
    }

    private function productHasBatchHistory(
        int $tenantId,
        int $productId
    ): bool {
        return DB::connection('mysql')
            ->table('stock_batches')
            ->where('tenant_id', $tenantId)
            ->where('product_id', $productId)
            ->exists()
            || DB::connection('mysql')
                ->table('stock_movement_batches')
                ->where('tenant_id', $tenantId)
                ->where('product_id', $productId)
                ->exists();
    }

    private function ensureBatchBalancesAreReconciled(
        int $tenantId,
        int $productId
    ): void {
        $hasMismatch = DB::connection('mysql')
            ->table('vw_batch_stock_reconciliation')
            ->where('tenant_id', $tenantId)
            ->where('product_id', $productId)
            ->where('reconciliation_status', 'mismatch')
            ->exists();

        if ($hasMismatch) {
            throw ValidationException::withMessages([
                'batch_tracking_enabled' => 'Batch tracking cannot be enabled until every warehouse balance and batch balance for this product are reconciled.',
            ]);
        }
    }

    private function getTenantId(Request $request): int
    {
        return $this->access->tenantId($request);
    }


    private function ensureProductBelongsToTenant(
        Product $product,
        int $tenantId
    ): void {
        abort_unless((int) $product->tenant_id === $tenantId, 404);
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
                ->where('tenant_id', $tenantId)
                ->where('slug', $slug)
                ->when(
                    $ignoreProductId !== null,
                    fn (Builder $query) => $query->where('id', '!=', $ignoreProductId)
                )
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }

    private function nullableUppercaseString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? Str::upper($value) : null;
    }
}