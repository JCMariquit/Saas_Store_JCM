<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\Inventory\InventoryAccessContext;
use App\Services\Subscriptions\SubscriptionAccessService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

final class StockIssuanceReportController extends Controller
{
    private const REASONS = [
        'used_consumed' =>
            'Used / Consumed',
        'employee_issuance' =>
            'Issued to Employee',
        'department_issuance' =>
            'Issued to Department',
        'damaged' =>
            'Damaged',
        'expired' =>
            'Expired',
        'lost_missing' =>
            'Lost / Missing',
        'giveaway_sample' =>
            'Giveaway / Sample',
        'other' =>
            'Other',
    ];

    public function __construct(
        private readonly InventoryAccessContext $access,
        private readonly SubscriptionAccessService $subscriptions
    ) {
    }

    public function pdf(Request $request): Response
    {
        $this->ensureExportAccess($request);

        $report = $this->buildReportData(
            $request
        );

        return Pdf::loadView(
            'reports.inventory.withdrawals.withdrawal-history',
            $report
        )
            ->setPaper('a4', 'landscape')
            ->stream(
                'withdrawal-history-'
                .now()->format('Y-m-d-His')
                .'.pdf'
            );
    }

    public function excelPreview(
        Request $request
    ): View {
        $this->ensureExportAccess($request);

        $report = $this->buildReportData(
            $request
        );

        return view(
            'reports.inventory.withdrawals.excel-preview',
            [
                ...$report,
                'excelDownloadUrl' => route(
                    'reports.inventory.withdrawals.excel',
                    $this->filterQuery(
                        $report['filters']
                    )
                ),
                'pdfUrl' => route(
                    'reports.inventory.withdrawals.pdf',
                    $this->filterQuery(
                        $report['filters']
                    )
                ),
            ]
        );
    }

    public function excel(
        Request $request
    ): Response {
        $this->ensureExportAccess($request);

        $report = $this->buildReportData(
            $request
        );

        $html = view(
            'reports.inventory.withdrawals.excel-preview',
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
                    'attachment; filename="withdrawal-history-'
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
        $context = $this->access
            ->resolve($request);

        $tenantId =
            $context['account_owner_id'];

        $branchId =
            $context['branch_id'];

        $filters = $this->readFilters(
            $request
        );

        $issuances = $this->baseQuery(
            $tenantId,
            $branchId,
            $filters
        )
            ->orderByDesc(
                'stock_issuances.issuance_date'
            )
            ->orderByDesc(
                'stock_issuances.id'
            )
            ->get();

        $userIds = $issuances
            ->flatMap(
                fn (object $issuance): array => [
                    $issuance->issued_by,
                    $issuance->voided_by,
                ]
            )
            ->filter()
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $users = $userIds->isEmpty()
            ? collect()
            : DB::connection('saas')
                ->table('users')
                ->whereIn('id', $userIds)
                ->get([
                    'id',
                    'name',
                    'email',
                ])
                ->keyBy('id');

        $issuances = $issuances
            ->map(
                function (
                    object $issuance
                ) use ($users): object {
                    $issuance->reason_label =
                        self::REASONS[
                            $issuance->reason
                        ]
                        ?? ucwords(
                            str_replace(
                                '_',
                                ' ',
                                $issuance->reason
                            )
                        );

                    $issuance->issued_by_name =
                        $issuance->issued_by
                            ? (
                                $users->get(
                                    (int) $issuance
                                        ->issued_by
                                )?->name
                                ?? 'User #'
                                .$issuance
                                    ->issued_by
                            )
                            : '—';

                    $issuance->voided_by_name =
                        $issuance->voided_by
                            ? (
                                $users->get(
                                    (int) $issuance
                                        ->voided_by
                                )?->name
                                ?? 'User #'
                                .$issuance
                                    ->voided_by
                            )
                            : null;

                    return $issuance;
                }
            );

        return [
            'issuances' => $issuances,
            'summary' => [
                'total' =>
                    $issuances->count(),
                'posted' =>
                    $issuances
                        ->where(
                            'status',
                            'posted'
                        )
                        ->count(),
                'voided' =>
                    $issuances
                        ->where(
                            'status',
                            'voided'
                        )
                        ->count(),
                'quantity_issued' =>
                    (float) $issuances
                        ->where(
                            'status',
                            'posted'
                        )
                        ->sum(
                            'total_quantity'
                        ),
                'total_cost' =>
                    (float) $issuances
                        ->where(
                            'status',
                            'posted'
                        )
                        ->sum(
                            'total_cost'
                        ),
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

    private function baseQuery(
        int $tenantId,
        ?int $branchId,
        array $filters
    ): Builder {
        return DB::connection('mysql')
            ->table('stock_issuances')
            ->join(
                'warehouses',
                function ($join): void {
                    $join
                        ->on(
                            'warehouses.id',
                            '=',
                            'stock_issuances.warehouse_id'
                        )
                        ->on(
                            'warehouses.tenant_id',
                            '=',
                            'stock_issuances.tenant_id'
                        );
                }
            )
            ->join(
                'branches',
                function ($join): void {
                    $join
                        ->on(
                            'branches.id',
                            '=',
                            'stock_issuances.branch_id'
                        )
                        ->on(
                            'branches.tenant_id',
                            '=',
                            'stock_issuances.tenant_id'
                        );
                }
            )
            ->where(
                'stock_issuances.tenant_id',
                $tenantId
            )
            ->when(
                $branchId !== null,
                fn (Builder $query) =>
                    $query->where(
                        'stock_issuances.branch_id',
                        $branchId
                    )
            )
            ->when(
                $filters['search'] !== '',
                function (
                    Builder $query
                ) use ($filters): void {
                    $like =
                        '%'.$filters['search'].'%';

                    $query->where(
                        function (
                            Builder $query
                        ) use ($like): void {
                            $query
                                ->where(
                                    'stock_issuances.issuance_number',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_issuances.reference_no',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_issuances.issued_to',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_issuances.department',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_issuances.purpose',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'warehouses.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'branches.name',
                                    'like',
                                    $like
                                );
                        }
                    );
                }
            )
            ->when(
                $filters['status'] !== '',
                fn (Builder $query) =>
                    $query->where(
                        'stock_issuances.status',
                        $filters['status']
                    )
            )
            ->when(
                $filters['reason'] !== '',
                fn (Builder $query) =>
                    $query->where(
                        'stock_issuances.reason',
                        $filters['reason']
                    )
            )
            ->when(
                $filters['warehouse_id'] > 0,
                fn (Builder $query) =>
                    $query->where(
                        'stock_issuances.warehouse_id',
                        $filters[
                            'warehouse_id'
                        ]
                    )
            )
            ->when(
                $filters['date_from'] !== null,
                fn (Builder $query) =>
                    $query->whereDate(
                        'stock_issuances.issuance_date',
                        '>=',
                        $filters['date_from']
                    )
            )
            ->when(
                $filters['date_to'] !== null,
                fn (Builder $query) =>
                    $query->whereDate(
                        'stock_issuances.issuance_date',
                        '<=',
                        $filters['date_to']
                    )
            )
            ->select([
                'stock_issuances.id',
                'stock_issuances.issuance_number',
                'stock_issuances.issuance_date',
                'stock_issuances.reason',
                'stock_issuances.issued_to',
                'stock_issuances.department',
                'stock_issuances.purpose',
                'stock_issuances.reference_no',
                'stock_issuances.status',
                'stock_issuances.total_quantity',
                'stock_issuances.total_cost',
                'stock_issuances.notes',
                'stock_issuances.issued_by',
                'stock_issuances.posted_at',
                'stock_issuances.voided_by',
                'stock_issuances.voided_at',
                'stock_issuances.void_reason',
                'warehouses.code as warehouse_code',
                'warehouses.name as warehouse_name',
                'branches.code as branch_code',
                'branches.name as branch_name',
            ])
            ->selectSub(
                function ($query): void {
                    $query
                        ->from(
                            'stock_issuance_items'
                        )
                        ->selectRaw(
                            'COUNT(*)'
                        )
                        ->whereColumn(
                            'stock_issuance_items.stock_issuance_id',
                            'stock_issuances.id'
                        );
                },
                'items_count'
            )
            ->selectSub(
                function ($query): void {
                    $query
                        ->from(
                            'stock_issuance_items'
                        )
                        ->selectRaw(
                            "GROUP_CONCAT(product_name ORDER BY id SEPARATOR ', ')"
                        )
                        ->whereColumn(
                            'stock_issuance_items.stock_issuance_id',
                            'stock_issuances.id'
                        );
                },
                'item_names'
            );
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
                ['posted', 'voided'],
                true
            )
        ) {
            $status = '';
        }

        $reason = trim(
            (string) $request->input(
                'reason',
                ''
            )
        );

        if (
            ! array_key_exists(
                $reason,
                self::REASONS
            )
        ) {
            $reason = '';
        }

        return [
            'search' => trim(
                (string) $request->input(
                    'search',
                    ''
                )
            ),
            'status' => $status,
            'reason' => $reason,
            'warehouse_id' => max(
                0,
                (int) $request->input(
                    'warehouse_id',
                    0
                )
            ),
            'date_from' =>
                $this->validDate(
                    (string) $request->input(
                        'date_from',
                        ''
                    )
                ),
            'date_to' =>
                $this->validDate(
                    (string) $request->input(
                        'date_to',
                        ''
                    )
                ),
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

        if ($filters['reason'] !== '') {
            $labels[] =
                'Reason: '
                .self::REASONS[
                    $filters['reason']
                ];
        }

        if ($filters['warehouse_id'] > 0) {
            $warehouse = DB::connection(
                'mysql'
            )
                ->table('warehouses')
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->where(
                    'id',
                    $filters[
                        'warehouse_id'
                    ]
                )
                ->value('name');

            $labels[] =
                'Warehouse: '
                .($warehouse
                    ?? 'Unavailable warehouse');
        }

        if ($filters['date_from']) {
            $labels[] =
                'From: '.$filters['date_from'];
        }

        if ($filters['date_to']) {
            $labels[] =
                'To: '.$filters['date_to'];
        }

        return $labels;
    }

    private function filterQuery(
        array $filters
    ): array {
        return array_filter(
            [
                'search' =>
                    $filters['search'],
                'status' =>
                    $filters['status'],
                'reason' =>
                    $filters['reason'],
                'warehouse_id' =>
                    $filters['warehouse_id'],
                'date_from' =>
                    $filters['date_from'],
                'date_to' =>
                    $filters['date_to'],
            ],
            fn (
                string|int|null $value
            ): bool =>
                $value !== ''
                && $value !== 0
                && $value !== null
        );
    }

    private function validDate(
        string $value
    ): ?string {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        $date =
            \DateTimeImmutable::createFromFormat(
                'Y-m-d',
                $value
            );

        return $date
            && $date->format('Y-m-d')
                === $value
            ? $value
            : null;
    }
}
