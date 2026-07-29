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

final class StockMovementReportController extends Controller
{
    private const INCOMING_TYPES = [
        'opening_stock',
        'stock_in',
        'adjustment_in',
        'return_in',
        'transfer_in',
        'purchase_receipt',
        'stock_issuance_void',
        'issuance_void',
    ];

    private const OUTGOING_TYPES = [
        'stock_out',
        'adjustment_out',
        'return_out',
        'damage',
        'expired',
        'transfer_out',
        'sale',
        'stock_issuance',
        'issuance',
        'purchase_receipt_void',
    ];

    private const LABELS = [
        'opening_stock' =>
            'Opening Stock',
        'stock_in' =>
            'Stock In',
        'stock_out' =>
            'Stock Out',
        'adjustment_in' =>
            'Adjustment In',
        'adjustment_out' =>
            'Adjustment Out',
        'return_in' =>
            'Return In',
        'return_out' =>
            'Return Out',
        'damage' =>
            'Damaged Stock',
        'expired' =>
            'Expired Stock',
        'transfer_in' =>
            'Transfer In',
        'transfer_out' =>
            'Transfer Out',
        'purchase_receipt' =>
            'Purchase Receipt',
        'purchase_receipt_void' =>
            'Purchase Receipt Reversal',
        'stock_issuance' =>
            'Stock Withdrawal',
        'stock_issuance_void' =>
            'Withdrawal Reversal',
        'issuance' =>
            'Stock Withdrawal',
        'issuance_void' =>
            'Withdrawal Reversal',
        'sale' =>
            'Sale',
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
            'reports.inventory.stock-movements.movement-history',
            $report
        )
            ->setPaper('a4', 'landscape')
            ->stream(
                'stock-movement-history-'
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
            'reports.inventory.stock-movements.excel-preview',
            [
                ...$report,
                'excelDownloadUrl' => route(
                    'reports.inventory.stock-movements.excel',
                    $this->filterQuery(
                        $report['filters']
                    )
                ),
                'pdfUrl' => route(
                    'reports.inventory.stock-movements.pdf',
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
            'reports.inventory.stock-movements.excel-preview',
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
                    'attachment; filename="stock-movement-history-'
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

        $movements = $this->baseQuery(
            $tenantId,
            $branchId,
            $filters
        )
            ->orderByDesc(
                'stock_movements.movement_date'
            )
            ->orderByDesc(
                'stock_movements.id'
            )
            ->get()
            ->map(
                function (
                    object $movement
                ): object {
                    $movement->movement_label =
                        self::LABELS[
                            $movement
                                ->movement_type
                        ]
                        ?? ucwords(
                            str_replace(
                                ['_', '-'],
                                ' ',
                                $movement
                                    ->movement_type
                            )
                        );

                    $movement->direction =
                        $this->direction(
                            (string) $movement
                                ->movement_type,
                            (float) $movement
                                ->quantity_before,
                            (float) $movement
                                ->quantity_after
                        );

                    return $movement;
                }
            );

        $creatorIds = $movements
            ->pluck('created_by')
            ->filter()
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $creators = $creatorIds->isEmpty()
            ? collect()
            : DB::connection('saas')
                ->table('users')
                ->whereIn(
                    'id',
                    $creatorIds
                )
                ->get([
                    'id',
                    'name',
                ])
                ->keyBy('id');

        $movements->each(
            function (
                object $movement
            ) use ($creators): void {
                $movement->created_by_name =
                    $movement->created_by
                        ? (
                            $creators->get(
                                (int) $movement
                                    ->created_by
                            )?->name
                            ?? 'User #'
                            .$movement->created_by
                        )
                        : '—';
            }
        );

        return [
            'movements' => $movements,
            'summary' => [
                'total' =>
                    $movements->count(),
                'incoming_quantity' =>
                    (float) $movements
                        ->where(
                            'direction',
                            'in'
                        )
                        ->sum(
                            fn (object $movement) =>
                                abs(
                                    (float) $movement
                                        ->quantity
                                )
                        ),
                'outgoing_quantity' =>
                    (float) $movements
                        ->where(
                            'direction',
                            'out'
                        )
                        ->sum(
                            fn (object $movement) =>
                                abs(
                                    (float) $movement
                                        ->quantity
                                )
                        ),
                'affected_products' =>
                    $movements
                        ->pluck('product_id')
                        ->unique()
                        ->count(),
                'movement_value' =>
                    (float) $movements
                        ->sum(
                            fn (object $movement) =>
                                abs(
                                    (float) $movement
                                        ->total_cost
                                )
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
            ->table('stock_movements')
            ->leftJoin(
                'products',
                function ($join): void {
                    $join
                        ->on(
                            'products.id',
                            '=',
                            'stock_movements.product_id'
                        )
                        ->on(
                            'products.tenant_id',
                            '=',
                            'stock_movements.tenant_id'
                        );
                }
            )
            ->leftJoin(
                'warehouses',
                function ($join): void {
                    $join
                        ->on(
                            'warehouses.id',
                            '=',
                            'stock_movements.warehouse_id'
                        )
                        ->on(
                            'warehouses.tenant_id',
                            '=',
                            'stock_movements.tenant_id'
                        );
                }
            )
            ->leftJoin(
                'warehouses as related_warehouses',
                function ($join): void {
                    $join
                        ->on(
                            'related_warehouses.id',
                            '=',
                            'stock_movements.related_warehouse_id'
                        )
                        ->on(
                            'related_warehouses.tenant_id',
                            '=',
                            'stock_movements.tenant_id'
                        );
                }
            )
            ->where(
                'stock_movements.tenant_id',
                $tenantId
            )
            ->when(
                $branchId !== null,
                fn (Builder $query) =>
                    $query->where(
                        'warehouses.branch_id',
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
                                    'products.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'products.sku',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'products.barcode',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'warehouses.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_movements.reference_no',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'stock_movements.remarks',
                                    'like',
                                    $like
                                );
                        }
                    );
                }
            )
            ->when(
                $filters['movement_type']
                    !== '',
                fn (Builder $query) =>
                    $query->where(
                        'stock_movements.movement_type',
                        $filters[
                            'movement_type'
                        ]
                    )
            )
            ->when(
                $filters['direction'] === 'in',
                fn (Builder $query) =>
                    $query->whereIn(
                        'stock_movements.movement_type',
                        self::INCOMING_TYPES
                    )
            )
            ->when(
                $filters['direction'] === 'out',
                fn (Builder $query) =>
                    $query->whereIn(
                        'stock_movements.movement_type',
                        self::OUTGOING_TYPES
                    )
            )
            ->when(
                $filters['warehouse_id'] > 0,
                fn (Builder $query) =>
                    $query->where(
                        'stock_movements.warehouse_id',
                        $filters[
                            'warehouse_id'
                        ]
                    )
            )
            ->when(
                $filters['date_from'] !== null,
                fn (Builder $query) =>
                    $query->whereDate(
                        'stock_movements.movement_date',
                        '>=',
                        $filters['date_from']
                    )
            )
            ->when(
                $filters['date_to'] !== null,
                fn (Builder $query) =>
                    $query->whereDate(
                        'stock_movements.movement_date',
                        '<=',
                        $filters['date_to']
                    )
            )
            ->select([
                'stock_movements.id',
                'stock_movements.product_id',
                'stock_movements.warehouse_id',
                'stock_movements.movement_type',
                'stock_movements.quantity',
                'stock_movements.quantity_before',
                'stock_movements.quantity_after',
                'stock_movements.unit_cost',
                'stock_movements.total_cost',
                'stock_movements.reference_type',
                'stock_movements.reference_no',
                'stock_movements.remarks',
                'stock_movements.movement_date',
                'stock_movements.created_by',
                'products.name as product_name',
                'products.sku as product_sku',
                'products.unit as product_unit',
                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
                'related_warehouses.name as related_warehouse_name',
                'related_warehouses.code as related_warehouse_code',
            ]);
    }

    private function readFilters(
        Request $request
    ): array {
        $movementType = trim(
            (string) $request->input(
                'movement_type',
                ''
            )
        );

        if (
            ! array_key_exists(
                $movementType,
                self::LABELS
            )
        ) {
            $movementType = '';
        }

        $direction = trim(
            (string) $request->input(
                'direction',
                ''
            )
        );

        if (
            ! in_array(
                $direction,
                ['in', 'out'],
                true
            )
        ) {
            $direction = '';
        }

        return [
            'search' => trim(
                (string) $request->input(
                    'search',
                    ''
                )
            ),
            'movement_type' =>
                $movementType,
            'direction' =>
                $direction,
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

        if (
            $filters['movement_type']
                !== ''
        ) {
            $labels[] =
                'Type: '
                .self::LABELS[
                    $filters[
                        'movement_type'
                    ]
                ];
        }

        if ($filters['direction'] !== '') {
            $labels[] =
                'Direction: '
                .ucfirst(
                    $filters['direction']
                );
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
            $filters,
            fn (
                string|int|null $value
            ): bool =>
                $value !== ''
                && $value !== 0
                && $value !== null
        );
    }

    private function direction(
        string $movementType,
        float $before,
        float $after
    ): string {
        if ($after > $before + 0.0001) {
            return 'in';
        }

        if ($after < $before - 0.0001) {
            return 'out';
        }

        return in_array(
            $movementType,
            self::OUTGOING_TYPES,
            true
        )
            ? 'out'
            : 'in';
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
