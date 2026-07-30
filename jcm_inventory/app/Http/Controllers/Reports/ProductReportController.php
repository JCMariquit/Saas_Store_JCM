<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\Inventory\InventoryAccessContext;
use App\Services\Subscriptions\SubscriptionAccessService;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

class ProductReportController extends Controller
{
    public function __construct(
        private readonly InventoryAccessContext $access,
        private readonly SubscriptionAccessService $subscriptions
    ) {
    }

    public function pdf(Request $request): Response
    {
        $this->ensureExportAccess($request);

        $report = $this->buildReportData($request);

        $pdf = app('dompdf.wrapper')->loadView(
            'reports.inventory.products.product-list',
            $report
        )->setPaper('a4', 'landscape');

        return $pdf->stream(
            'product-directory-'.now()->format('Y-m-d-His').'.pdf'
        );
    }

    public function excelPreview(Request $request): View
    {
        $this->ensureExportAccess($request);

        $report = $this->buildReportData($request);

        return view(
            'reports.inventory.products.excel-preview',
            [
                ...$report,
                'excelDownloadUrl' => route(
                    'reports.inventory.products.excel',
                    $this->filterQuery($report['filters'])
                ),
                'pdfUrl' => route(
                    'reports.inventory.products.pdf',
                    $this->filterQuery($report['filters'])
                ),
            ]
        );
    }

    public function excel(Request $request): Response
    {
        $this->ensureExportAccess($request);

        $report = $this->buildReportData($request);

        $html = view(
            'reports.inventory.products.excel-preview',
            [
                ...$report,
                'downloadMode' => true,
                'excelDownloadUrl' => '',
                'pdfUrl' => route(
                    'reports.inventory.products.pdf',
                    $this->filterQuery($report['filters'])
                ),
            ]
        )->render();

        $fileName = 'product-directory-'
            .now()->format('Y-m-d-His')
            .'.xls';

        return response(
            "\xEF\xBB\xBF".$html,
            200,
            [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]
        );
    }

    private function buildReportData(Request $request): array
    {
        $tenantId = $this->getTenantId($request);
        $filters = $this->readFilters($request);

        $products = $this->productQuery($tenantId, $filters)->get();
        $this->attachWarehouseLocations($tenantId, $products);

        return [
            'products' => $products,
            'summary' => $this->buildSummary($products),
            'filterLabels' => $this->filterLabels($tenantId, $filters),
            'filters' => $filters,
            'generatedAt' => now(),
            'generatedBy' => $request->user()?->name
                ?? $request->user()?->email
                ?? 'Authenticated user',
        ];
    }

    private function buildSummary(EloquentCollection $products): array
    {
        $withWarehouse = $products->filter(
            fn (Product $product): bool =>
                $this->warehouseLocations($product)->isNotEmpty()
        )->count();

        return [
            'total' => $products->count(),
            'active' => $products->where('is_active', true)->count(),
            'inactive' => $products->where('is_active', false)->count(),
            'tracked' => $products
                ->where('stock_tracking', 'tracked')
                ->count(),
            'not_tracked' => $products
                ->where('stock_tracking', 'not_tracked')
                ->count(),
            'batch_enabled' => $products
                ->where('batch_tracking_enabled', true)
                ->count(),
            'expiration_required' => $products
                ->where('requires_expiration_date', true)
                ->count(),
            'categorized' => $products
                ->whereNotNull('category_id')
                ->count(),
            'uncategorized' => $products
                ->whereNull('category_id')
                ->count(),
            'with_warehouse' => $withWarehouse,
            'without_warehouse' => max(
                0,
                $products->count() - $withWarehouse
            ),
        ];
    }

    private function productQuery(
        int $tenantId,
        array $filters
    ): Builder {
        return Product::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'category:id,name,slug,is_active,description',
            ])
            ->when(
                $filters['search'] !== '',
                function (Builder $query) use ($filters): void {
                    $search = $filters['search'];

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
                $filters['category_id'] > 0,
                fn (Builder $query) => $query->where(
                    'category_id',
                    $filters['category_id']
                )
            )
            ->when(
                $filters['status'] === 'active',
                fn (Builder $query) => $query->where('is_active', true)
            )
            ->when(
                $filters['status'] === 'inactive',
                fn (Builder $query) => $query->where('is_active', false)
            )
            ->when(
                $filters['stock_tracking'] !== '',
                fn (Builder $query) => $query->where(
                    'stock_tracking',
                    $filters['stock_tracking']
                )
            )
            ->when(
                $filters['batch_tracking'] === 'enabled',
                fn (Builder $query) => $query->where(
                    'batch_tracking_enabled',
                    true
                )
            )
            ->when(
                $filters['batch_tracking'] === 'disabled',
                fn (Builder $query) => $query->where(
                    'batch_tracking_enabled',
                    false
                )
            )
            ->orderByDesc('is_active')
            ->orderByDesc('batch_tracking_enabled')
            ->orderBy('name');
    }

    private function attachWarehouseLocations(
        int $tenantId,
        EloquentCollection $products
    ): void {
        $productIds = $products
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->values();

        if ($productIds->isEmpty()) {
            return;
        }

        $locationsByProduct = DB::connection('mysql')
            ->table('warehouse_stocks as stock')
            ->join(
                'warehouses as warehouse',
                function ($join): void {
                    $join
                        ->on('warehouse.id', '=', 'stock.warehouse_id')
                        ->on('warehouse.tenant_id', '=', 'stock.tenant_id');
                }
            )
            ->join(
                'branches as branch',
                function ($join): void {
                    $join
                        ->on('branch.id', '=', 'warehouse.branch_id')
                        ->on('branch.tenant_id', '=', 'warehouse.tenant_id');
                }
            )
            ->where('stock.tenant_id', $tenantId)
            ->whereIn('stock.product_id', $productIds)
            ->whereNull('warehouse.deleted_at')
            ->whereNull('branch.deleted_at')
            ->orderByDesc('branch.is_main')
            ->orderBy('branch.name')
            ->orderByDesc('warehouse.is_main')
            ->orderBy('warehouse.name')
            ->get([
                'stock.product_id',
                'warehouse.id as warehouse_id',
                'warehouse.code as warehouse_code',
                'warehouse.name as warehouse_name',
                'branch.id as branch_id',
                'branch.code as branch_code',
                'branch.name as branch_name',
            ])
            ->unique(
                fn ($row): string =>
                    $row->product_id.'-'.$row->warehouse_id
            )
            ->groupBy('product_id');

        foreach ($products as $product) {
            $locations = collect(
                $locationsByProduct->get($product->id, collect())
            )->values();

            $product->setAttribute('report_warehouses', $locations);
            $product->setAttribute(
                'report_warehouse_text',
                $this->warehouseLocationTextFromCollection($locations)
            );
        }
    }

    private function warehouseLocations(Product $product): Collection
    {
        $locations = $product->getAttribute('report_warehouses');

        return $locations instanceof Collection
            ? $locations
            : collect($locations ?? []);
    }

    private function warehouseLocationTextFromCollection(
        Collection $locations
    ): string {
        if ($locations->isEmpty()) {
            return 'No warehouse assigned';
        }

        return $locations
            ->map(
                function ($location): string {
                    $branch = trim((string) ($location->branch_name ?? ''));
                    $branchCode = trim((string) ($location->branch_code ?? ''));
                    $warehouse = trim((string) ($location->warehouse_name ?? ''));
                    $warehouseCode = trim((string) ($location->warehouse_code ?? ''));

                    $branchLabel = $branchCode !== ''
                        ? "{$branch} ({$branchCode})"
                        : $branch;
                    $warehouseLabel = $warehouseCode !== ''
                        ? "{$warehouse} ({$warehouseCode})"
                        : $warehouse;

                    return trim($branchLabel.' / '.$warehouseLabel, ' /');
                }
            )
            ->filter()
            ->implode('; ');
    }

    private function readFilters(Request $request): array
    {
        $status = trim((string) $request->input('status', ''));
        $stockTracking = trim(
            (string) $request->input('stock_tracking', '')
        );
        $batchTracking = trim(
            (string) $request->input('batch_tracking', '')
        );

        if (! in_array($status, ['active', 'inactive'], true)) {
            $status = '';
        }

        if (! in_array(
            $stockTracking,
            ['tracked', 'not_tracked'],
            true
        )) {
            $stockTracking = '';
        }

        if (! in_array(
            $batchTracking,
            ['enabled', 'disabled'],
            true
        )) {
            $batchTracking = '';
        }

        return [
            'search' => trim((string) $request->input('search', '')),
            'status' => $status,
            'category_id' => max(
                0,
                (int) $request->input('category_id', 0)
            ),
            'stock_tracking' => $stockTracking,
            'batch_tracking' => $batchTracking,
        ];
    }

    private function filterLabels(
        int $tenantId,
        array $filters
    ): array {
        $labels = [];

        if ($filters['search'] !== '') {
            $labels[] = 'Search: '.$filters['search'];
        }

        if ($filters['status'] !== '') {
            $labels[] = 'Status: '.ucfirst($filters['status']);
        }

        if ($filters['category_id'] > 0) {
            $categoryName = Category::query()
                ->where('tenant_id', $tenantId)
                ->whereKey($filters['category_id'])
                ->value('name');

            $labels[] = 'Category: '
                .($categoryName ?? 'Unavailable category');
        }

        if ($filters['stock_tracking'] !== '') {
            $labels[] = 'Stock: '
                .($filters['stock_tracking'] === 'tracked'
                    ? 'Tracked'
                    : 'Not tracked');
        }

        if ($filters['batch_tracking'] !== '') {
            $labels[] = 'Batch: '.ucfirst($filters['batch_tracking']);
        }

        return $labels;
    }

    private function filterQuery(array $filters): array
    {
        return array_filter(
            [
                'search' => $filters['search'],
                'status' => $filters['status'],
                'category_id' => $filters['category_id'],
                'stock_tracking' => $filters['stock_tracking'],
                'batch_tracking' => $filters['batch_tracking'],
            ],
            fn (string|int $value): bool =>
                $value !== '' && $value !== 0
        );
    }

    private function getTenantId(
        Request $request
    ): int {
        return $this->access->tenantId($request);
    }

    private function ensureExportAccess(
        Request $request
    ): void {
        $user = $request->user();
        $context = $user
            ? $this->subscriptions->summary($user)
            : null;

        abort_unless(
            ($context['access_mode'] ?? 'blocked') === 'full',
            403,
            'PDF and Excel exports are unavailable while the subscription is read-only.'
        );
    }
}