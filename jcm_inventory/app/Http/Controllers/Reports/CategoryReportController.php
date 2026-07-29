<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\Inventory\InventoryAccessContext;
use App\Services\Subscriptions\SubscriptionAccessService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

final class CategoryReportController extends Controller
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

        return Pdf::loadView(
            'reports.inventory.categories.category-list',
            $report
        )
            ->setPaper('a4', 'landscape')
            ->stream(
                'category-directory-'
                .now()->format('Y-m-d-His')
                .'.pdf'
            );
    }

    public function excelPreview(Request $request): View
    {
        $this->ensureExportAccess($request);

        $report = $this->buildReportData($request);

        return view(
            'reports.inventory.categories.excel-preview',
            [
                ...$report,
                'excelDownloadUrl' => route(
                    'reports.inventory.categories.excel',
                    $this->filterQuery($report['filters'])
                ),
                'pdfUrl' => route(
                    'reports.inventory.categories.pdf',
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
            'reports.inventory.categories.excel-preview',
            [
                ...$report,
                'downloadMode' => true,
                'excelDownloadUrl' => '',
                'pdfUrl' => '',
            ]
        )->render();

        return response(
            "\xEF\xBB\xBF".$html,
            200,
            [
                'Content-Type' =>
                    'application/vnd.ms-excel; charset=UTF-8',
                'Content-Disposition' =>
                    'attachment; filename="category-directory-'
                    .now()->format('Y-m-d-His')
                    .'.xls"',
                'Cache-Control' =>
                    'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]
        );
    }


    private function ensureExportAccess(
        Request $request
    ): void {
        $user = $request->user();

        $context = $user
            ? $this->subscriptions
                ->summary($user)
            : null;

        abort_unless(
            ($context['access_mode'] ?? 'blocked')
                === 'full',
            403,
            'PDF and Excel exports are unavailable while the subscription is read-only.'
        );
    }

    private function buildReportData(
        Request $request
    ): array {
        $tenantId = $this->access
            ->tenantId($request);

        $filters = $this->readFilters(
            $request
        );

        $categories = $this->categoryQuery(
            $tenantId,
            $filters
        )->get();

        return [
            'categories' => $categories,
            'summary' => [
                'total' => $categories->count(),
                'active' => $categories
                    ->where('is_active', true)
                    ->count(),
                'inactive' => $categories
                    ->where('is_active', false)
                    ->count(),
                'root' => $categories
                    ->whereNull('parent_id')
                    ->count(),
                'nested' => $categories
                    ->whereNotNull('parent_id')
                    ->count(),
                'used' => $categories
                    ->filter(
                        fn (Category $category): bool =>
                            (int) $category->products_count > 0
                    )
                    ->count(),
            ],
            'filterLabels' =>
                $this->filterLabels(
                    $tenantId,
                    $filters
                ),
            'filters' => $filters,
            'generatedAt' => now(),
            'generatedBy' =>
                $request->user()?->name
                ?? $request->user()?->email
                ?? 'Authenticated user',
        ];
    }

    private function categoryQuery(
        int $tenantId,
        array $filters
    ): Builder {
        return Category::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'parent:id,name,slug',
            ])
            ->withCount([
                'products',
                'children',
            ])
            ->when(
                $filters['search'] !== '',
                function (
                    Builder $query
                ) use ($filters): void {
                    $search =
                        $filters['search'];

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
                                    'slug',
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
                $filters['status'] === 'active',
                fn (Builder $query) =>
                    $query->where(
                        'is_active',
                        true
                    )
            )
            ->when(
                $filters['status'] === 'inactive',
                fn (Builder $query) =>
                    $query->where(
                        'is_active',
                        false
                    )
            )
            ->when(
                $filters['parent_id'] === 'root',
                fn (Builder $query) =>
                    $query->whereNull(
                        'parent_id'
                    )
            )
            ->when(
                ctype_digit(
                    $filters['parent_id']
                ),
                fn (Builder $query) =>
                    $query->where(
                        'parent_id',
                        (int) $filters[
                            'parent_id'
                        ]
                    )
            )
            ->orderBy('sort_order')
            ->orderBy('name');
    }

    private function readFilters(
        Request $request
    ): array {
        $status = trim(
            (string) $request->input(
                'status',
                ''
            )
        );

        if (
            ! in_array(
                $status,
                ['active', 'inactive'],
                true
            )
        ) {
            $status = '';
        }

        $parentId = trim(
            (string) $request->input(
                'parent_id',
                ''
            )
        );

        if (
            $parentId !== 'root'
            && ! ctype_digit($parentId)
        ) {
            $parentId = '';
        }

        return [
            'search' => trim(
                (string) $request->input(
                    'search',
                    ''
                )
            ),
            'status' => $status,
            'parent_id' => $parentId,
        ];
    }

    private function filterLabels(
        int $tenantId,
        array $filters
    ): array {
        $labels = [];

        if ($filters['search'] !== '') {
            $labels[] =
                'Search: '.$filters['search'];
        }

        if ($filters['status'] !== '') {
            $labels[] =
                'Status: '.ucfirst(
                    $filters['status']
                );
        }

        if ($filters['parent_id'] === 'root') {
            $labels[] =
                'Level: Root categories';
        } elseif (
            ctype_digit(
                $filters['parent_id']
            )
        ) {
            $parentName = DB::connection(
                'mysql'
            )
                ->table('categories')
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->where(
                    'id',
                    (int) $filters[
                        'parent_id'
                    ]
                )
                ->value('name');

            $labels[] =
                'Parent: '
                .($parentName
                    ?? 'Unavailable category');
        }

        return $labels;
    }

    private function filterQuery(
        array $filters
    ): array {
        return array_filter(
            $filters,
            fn (string $value): bool =>
                $value !== ''
        );
    }
}
