<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

class ProductReportController extends Controller
{
    public function pdf(Request $request): Response
    {
        $report = $this->buildReportData($request);

        $pdf = Pdf::loadView(
            'reports.inventory.products.product-list',
            $report
        )->setPaper('a4', 'landscape');

        return $pdf->stream(
            'product-directory-'.now()->format('Y-m-d-His').'.pdf'
        );
    }

    /**
     * Spreadsheet-style browser preview opened in a new tab.
     */
    public function excelPreview(Request $request): View
    {
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

    /**
     * Download the same plain spreadsheet table shown in the browser preview.
     *
     * This is an HTML-based .xls response. It does not require PhpSpreadsheet,
     * GD, ZIP, or browser-side JavaScript.
     */
    public function excel(Request $request): Response
    {
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

    /**
     * @return array{
     *     products: EloquentCollection<int, Product>,
     *     summary: array<string, int>,
     *     filterLabels: array<int, string>,
     *     filters: array{
     *         search: string,
     *         status: string,
     *         category_id: int,
     *         stock_tracking: string
     *     },
     *     generatedAt: \Illuminate\Support\Carbon,
     *     generatedBy: string
     * }
     */
    private function buildReportData(Request $request): array
    {
        $tenantId = $this->getTenantId($request);
        $filters = $this->readFilters($request);

        $products = $this->productQuery(
            $tenantId,
            $filters
        )->get();

        $this->attachWarehouseLocations(
            $tenantId,
            $products
        );

        return [
            'products' => $products,
            'summary' => $this->buildSummary($products),
            'filterLabels' => $this->filterLabels(
                $tenantId,
                $filters
            ),
            'filters' => $filters,
            'generatedAt' => now(),
            'generatedBy' => $request->user()?->name
                ?? $request->user()?->email
                ?? 'Authenticated user',
        ];
    }

    /**
     * Build catalog-only summary values.
     *
     * No quantity, movement, or inventory-value metrics are included here.
     *
     * @param EloquentCollection<int, Product> $products
     * @return array<string, int>
     */
    private function buildSummary(
        EloquentCollection $products
    ): array {
        $withWarehouse = $products->filter(
            fn (Product $product): bool =>
                $this->warehouseLocations($product)->isNotEmpty()
        )->count();

        $categoryCount = $products
            ->pluck('category_id')
            ->filter()
            ->unique()
            ->count();

        $warehouseCount = $products
            ->flatMap(
                fn (Product $product): Collection =>
                    $this->warehouseLocations($product)
            )
            ->pluck('warehouse_id')
            ->unique()
            ->count();

        return [
            'total' => $products->count(),
            'active' => $products
                ->where('is_active', true)
                ->count(),
            'inactive' => $products
                ->where('is_active', false)
                ->count(),
            'categorized' => $products
                ->whereNotNull('category_id')
                ->count(),
            'uncategorized' => $products
                ->whereNull('category_id')
                ->count(),
            'categories_used' => $categoryCount,
            'with_warehouse' => $withWarehouse,
            'without_warehouse' => max(
                0,
                $products->count() - $withWarehouse
            ),
            'warehouses_used' => $warehouseCount,
        ];
    }

    /**
     * Product-directory query only.
     *
     * Deliberately excludes stock totals, movement counts, and stock valuation.
     *
     * @param array{
     *     search: string,
     *     status: string,
     *     category_id: int,
     *     stock_tracking: string
     * } $filters
     */
    private function productQuery(
        int $tenantId,
        array $filters
    ): Builder {
        return Product::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'category:id,name,slug,is_active',
            ])
            ->when(
                $filters['search'] !== '',
                function (Builder $query) use ($filters): void {
                    $search = $filters['search'];

                    $query->where(
                        function (Builder $query) use ($search): void {
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
                $filters['category_id'] > 0,
                fn (Builder $query) => $query->where(
                    'category_id',
                    $filters['category_id']
                )
            )
            ->when(
                $filters['status'] === 'active',
                fn (Builder $query) => $query->where(
                    'is_active',
                    true
                )
            )
            ->when(
                $filters['status'] === 'inactive',
                fn (Builder $query) => $query->where(
                    'is_active',
                    false
                )
            )
            ->when(
                in_array(
                    $filters['stock_tracking'],
                    ['tracked', 'not_tracked'],
                    true
                ),
                fn (Builder $query) => $query->where(
                    'stock_tracking',
                    $filters['stock_tracking']
                )
            )
            ->orderByDesc('is_active')
            ->orderBy('name');
    }

    /**
     * Attach warehouse and branch names without exposing stock quantities.
     *
     * The location is based on the product's warehouse_stocks records, but the
     * quantity and movement fields are intentionally not selected.
     *
     * @param EloquentCollection<int, Product> $products
     */
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
                        ->on(
                            'warehouse.id',
                            '=',
                            'stock.warehouse_id'
                        )
                        ->on(
                            'warehouse.tenant_id',
                            '=',
                            'stock.tenant_id'
                        );
                }
            )
            ->join(
                'branches as branch',
                function ($join): void {
                    $join
                        ->on(
                            'branch.id',
                            '=',
                            'warehouse.branch_id'
                        )
                        ->on(
                            'branch.tenant_id',
                            '=',
                            'warehouse.tenant_id'
                        );
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
                'warehouse.is_main as warehouse_is_main',
                'branch.id as branch_id',
                'branch.code as branch_code',
                'branch.name as branch_name',
                'branch.is_main as branch_is_main',
            ])
            ->unique(
                fn ($row): string =>
                    $row->product_id.'-'.$row->warehouse_id
            )
            ->groupBy('product_id');

        foreach ($products as $product) {
            $product->setAttribute(
                'report_warehouses',
                collect(
                    $locationsByProduct->get(
                        $product->id,
                        collect()
                    )
                )->values()
            );
        }
    }

    /**
     * @return Collection<int, object>
     */
    private function warehouseLocations(
        Product $product
    ): Collection {
        $locations = $product->getAttribute(
            'report_warehouses'
        );

        return $locations instanceof Collection
            ? $locations
            : collect($locations ?? []);
    }

    private function warehouseLocationText(
        Product $product
    ): string {
        $locations = $this->warehouseLocations($product);

        if ($locations->isEmpty()) {
            return 'No warehouse assigned';
        }

        return $locations
            ->map(
                function ($location): string {
                    $branch = trim(
                        (string) ($location->branch_name ?? '')
                    );

                    $branchCode = trim(
                        (string) ($location->branch_code ?? '')
                    );

                    $warehouse = trim(
                        (string) ($location->warehouse_name ?? '')
                    );

                    $warehouseCode = trim(
                        (string) ($location->warehouse_code ?? '')
                    );

                    $branchLabel = $branchCode !== ''
                        ? "{$branch} ({$branchCode})"
                        : $branch;

                    $warehouseLabel = $warehouseCode !== ''
                        ? "{$warehouse} ({$warehouseCode})"
                        : $warehouse;

                    return trim(
                        $branchLabel.' / '.$warehouseLabel,
                        ' /'
                    );
                }
            )
            ->filter()
            ->implode('; ');
    }

    /**
     * @return array{
     *     search: string,
     *     status: string,
     *     category_id: int,
     *     stock_tracking: string
     * }
     */
    private function readFilters(Request $request): array
    {
        $status = trim(
            (string) $request->input('status', '')
        );

        if (! in_array($status, ['active', 'inactive'], true)) {
            $status = '';
        }

        $stockTracking = trim(
            (string) $request->input('stock_tracking', '')
        );

        if (! in_array(
            $stockTracking,
            ['tracked', 'not_tracked'],
            true
        )) {
            $stockTracking = '';
        }

        return [
            'search' => trim(
                (string) $request->input('search', '')
            ),
            'status' => $status,
            'category_id' => max(
                0,
                (int) $request->input('category_id', 0)
            ),
            'stock_tracking' => $stockTracking,
        ];
    }

    /**
     * @param array{
     *     search: string,
     *     status: string,
     *     category_id: int,
     *     stock_tracking: string
     * } $filters
     * @return array<int, string>
     */
    private function filterLabels(
        int $tenantId,
        array $filters
    ): array {
        $labels = [];

        if ($filters['search'] !== '') {
            $labels[] = 'Search: '.$filters['search'];
        }

        if ($filters['status'] !== '') {
            $labels[] = 'Status: '.ucfirst(
                $filters['status']
            );
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
            $labels[] = 'Tracking: '
                .($filters['stock_tracking'] === 'tracked'
                    ? 'Stock tracked'
                    : 'Not tracked');
        }

        return $labels;
    }

    /**
     * @param array{
     *     search: string,
     *     status: string,
     *     category_id: int,
     *     stock_tracking: string
     * } $filters
     * @return array<string, string|int>
     */
    private function filterQuery(array $filters): array
    {
        return array_filter(
            [
                'search' => $filters['search'],
                'status' => $filters['status'],
                'category_id' => $filters['category_id'],
                'stock_tracking' => $filters['stock_tracking'],
            ],
            fn (string|int $value): bool =>
                $value !== '' && $value !== 0
        );
    }

    private function getTenantId(Request $request): int
    {
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

    private function spreadsheetSafe(mixed $value): string
    {
        $value = trim((string) ($value ?? ''));

        if (
            $value !== ''
            && preg_match('/^[=+\-@]/', $value) === 1
        ) {
            return "'{$value}";
        }

        return $value;
    }
}