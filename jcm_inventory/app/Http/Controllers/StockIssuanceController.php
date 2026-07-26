<?php

namespace App\Http\Controllers;

use App\Services\Inventory\InventoryAccessContext;
use App\Services\Inventory\InventoryLedgerService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class StockIssuanceController extends Controller
{
    private const PRODUCT_CODE = 'JCM-INVENTORY-001';


    public function __construct(
        private readonly InventoryAccessContext $access,
        private readonly InventoryLedgerService $ledger
    ) {
    }

    private const REASONS = [
        'used_consumed' => 'Used / Consumed',
        'employee_issuance' => 'Issued to Employee',
        'department_issuance' => 'Issued to Department',
        'damaged' => 'Damaged',
        'expired' => 'Expired',
        'lost_missing' => 'Lost / Missing',
        'giveaway_sample' => 'Giveaway / Sample',
        'other' => 'Other',
    ];

    /*
    |--------------------------------------------------------------------------
    | Issuance Terminal
    |--------------------------------------------------------------------------
    */

    public function terminal(Request $request): Response
    {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];
        $branchId = $context['branch_id'];

        $database = DB::connection('mysql');

        $warehouses = $database
            ->table('warehouses')
            ->join(
                'branches',
                function ($join): void {
                    $join
                        ->on(
                            'branches.id',
                            '=',
                            'warehouses.branch_id'
                        )
                        ->on(
                            'branches.tenant_id',
                            '=',
                            'warehouses.tenant_id'
                        );
                }
            )
            ->where(
                'warehouses.tenant_id',
                $tenantId
            )
            ->where(
                'warehouses.is_active',
                true
            )
            ->where(
                'branches.is_active',
                true
            )
            ->whereNull(
                'warehouses.deleted_at'
            )
            ->whereNull(
                'branches.deleted_at'
            )
            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'warehouses.branch_id',
                    $branchId
                )
            )
            ->orderByDesc(
                'warehouses.is_main'
            )
            ->orderBy(
                'warehouses.name'
            )
            ->get([
                'warehouses.id',
                'warehouses.branch_id',
                'warehouses.code',
                'warehouses.name',
                'warehouses.is_main',
                'branches.code as branch_code',
                'branches.name as branch_name',
            ])
            ->map(
                fn ($warehouse): array => [
                    'id' => (int) $warehouse->id,
                    'branch_id' =>
                        (int) $warehouse->branch_id,
                    'code' => $warehouse->code,
                    'name' => $warehouse->name,
                    'is_main' =>
                        (bool) $warehouse->is_main,
                    'branch' => [
                        'id' =>
                            (int) $warehouse->branch_id,
                        'code' =>
                            $warehouse->branch_code,
                        'name' =>
                            $warehouse->branch_name,
                    ],
                ]
            )
            ->values();

        $availableStocks = $database
            ->table(
                'warehouse_stocks as stock'
            )
            ->join(
                'products as product',
                function ($join): void {
                    $join
                        ->on(
                            'product.id',
                            '=',
                            'stock.product_id'
                        )
                        ->on(
                            'product.tenant_id',
                            '=',
                            'stock.tenant_id'
                        );
                }
            )
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
            ->leftJoin(
                'categories as category',
                function ($join): void {
                    $join
                        ->on(
                            'category.id',
                            '=',
                            'product.category_id'
                        )
                        ->on(
                            'category.tenant_id',
                            '=',
                            'product.tenant_id'
                        );
                }
            )
            ->where(
                'stock.tenant_id',
                $tenantId
            )
            ->where(
                'stock.quantity',
                '>',
                0
            )
            ->where(
                'product.is_active',
                true
            )
            ->where(
                'warehouse.is_active',
                true
            )
            ->where(
                'branch.is_active',
                true
            )
            ->whereNull(
                'product.deleted_at'
            )
            ->whereNull(
                'warehouse.deleted_at'
            )
            ->whereNull(
                'branch.deleted_at'
            )
            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'warehouse.branch_id',
                    $branchId
                )
            )
            ->orderBy(
                'product.name'
            )
            ->get([
                'stock.id as stock_id',
                'stock.warehouse_id',
                'stock.product_id',
                'stock.quantity',
                'stock.reorder_level',
                'stock.average_cost',

                'product.name',
                'product.sku',
                'product.barcode',
                'product.unit',
                'product.category_id',
                'product.batch_tracking_enabled',
                'product.batch_issue_policy',
                'product.requires_expiration_date',
                'product.expiry_warning_days',

                'category.name as category_name',

                'warehouse.branch_id',
                'warehouse.code as warehouse_code',
                'warehouse.name as warehouse_name',

                'branch.code as branch_code',
                'branch.name as branch_name',
            ])
            ->map(
                fn ($stock): array => [
                    'stock_id' =>
                        (int) $stock->stock_id,
                    'warehouse_id' =>
                        (int) $stock->warehouse_id,
                    'branch_id' =>
                        (int) $stock->branch_id,
                    'product_id' =>
                        (int) $stock->product_id,
                    'name' => $stock->name,
                    'sku' => $stock->sku,
                    'barcode' => $stock->barcode,
                    'unit' =>
                        $stock->unit ?? 'pcs',
                    'category' => [
                        'id' => $stock->category_id
                            ? (int) $stock->category_id
                            : null,
                        'name' =>
                            $stock->category_name,
                    ],
                    'warehouse' => [
                        'id' =>
                            (int) $stock->warehouse_id,
                        'code' =>
                            $stock->warehouse_code,
                        'name' =>
                            $stock->warehouse_name,
                    ],
                    'branch' => [
                        'id' =>
                            (int) $stock->branch_id,
                        'code' =>
                            $stock->branch_code,
                        'name' =>
                            $stock->branch_name,
                    ],
                    'available_quantity' =>
                        round(
                            (float) $stock->quantity,
                            3
                        ),
                    'reorder_level' =>
                        round(
                            (float) $stock->reorder_level,
                            3
                        ),
                    'average_cost' =>
                        round(
                            (float) $stock->average_cost,
                            4
                        ),
                    'batch_tracking_enabled' =>
                        (bool) $stock->batch_tracking_enabled,
                    'batch_issue_policy' =>
                        (string) $stock->batch_issue_policy,
                    'requires_expiration_date' =>
                        (bool) $stock->requires_expiration_date,
                    'expiry_warning_days' =>
                        $stock->expiry_warning_days !== null
                            ? (int) $stock->expiry_warning_days
                            : null,
                ]
            )
            ->values();

        $availableStocks = $availableStocks
            ->map(function (array $stock) use ($tenantId): array {
                $stock['eligible_batches'] = $this->ledger
                    ->eligibleBatches(
                        $tenantId,
                        $stock['warehouse_id'],
                        $stock['product_id'],
                        'issue'
                    )
                    ->map(fn ($batch): array => [
                        'stock_batch_id' => (int) $batch->stock_batch_id,
                        'batch_code' => (string) $batch->batch_code,
                        'lot_number' => $batch->lot_number,
                        'available_quantity' => round(
                            (float) $batch->available_quantity,
                            3
                        ),
                        'unit_cost' => round(
                            (float) $batch->unit_cost,
                            4
                        ),
                        'received_date' => $batch->received_date,
                        'expiration_date' => $batch->expiration_date,
                        'status' => $batch->status,
                    ])
                    ->values()
                    ->all();

                return $stock;
            })
            ->values();

        $recentIssuances = $this->issuanceBaseQuery(
            $tenantId,
            $branchId
        )
            ->orderByDesc(
                'stock_issuances.issuance_date'
            )
            ->orderByDesc(
                'stock_issuances.id'
            )
            ->limit(8)
            ->get([
                'stock_issuances.id',
                'stock_issuances.issuance_number',
                'stock_issuances.issuance_date',
                'stock_issuances.reason',
                'stock_issuances.issued_to',
                'stock_issuances.department',
                'stock_issuances.status',
                'stock_issuances.total_quantity',
                'stock_issuances.total_cost',
                'stock_issuances.issued_by',
                'stock_issuances.created_at',

                'warehouses.code as warehouse_code',
                'warehouses.name as warehouse_name',

                'branches.code as branch_code',
                'branches.name as branch_name',
            ]);

        $recentUserIds = $recentIssuances
            ->pluck('issued_by')
            ->filter()
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $recentUsers = $this->getSaasUsers(
            $recentUserIds
        );

        $recentIssuances = $recentIssuances
            ->map(
                function ($issuance) use (
                    $recentUsers
                ): array {
                    return [
                        'id' => (int) $issuance->id,
                        'issuance_number' =>
                            $issuance->issuance_number,
                        'issuance_date' =>
                            $issuance->issuance_date,
                        'reason' =>
                            $issuance->reason,
                        'reason_label' =>
                            $this->reasonLabel(
                                $issuance->reason
                            ),
                        'issued_to' =>
                            $issuance->issued_to,
                        'department' =>
                            $issuance->department,
                        'status' =>
                            $issuance->status,
                        'total_quantity' =>
                            round(
                                (float) $issuance
                                    ->total_quantity,
                                3
                            ),
                        'total_cost' =>
                            round(
                                (float) $issuance
                                    ->total_cost,
                                2
                            ),
                        'warehouse' => [
                            'code' =>
                                $issuance->warehouse_code,
                            'name' =>
                                $issuance->warehouse_name,
                        ],
                        'branch' => [
                            'code' =>
                                $issuance->branch_code,
                            'name' =>
                                $issuance->branch_name,
                        ],
                        'issued_by' =>
                            $this->formatUser(
                                $issuance->issued_by,
                                $recentUsers
                            ),
                        'created_at' =>
                            $issuance->created_at,
                    ];
                }
            )
            ->values();

        $todaySummary = $this->issuanceBaseQuery(
            $tenantId,
            $branchId
        )
            ->where(
                'stock_issuances.status',
                'posted'
            )
            ->whereDate(
                'stock_issuances.issuance_date',
                today()
            )
            ->selectRaw(
                'COUNT(*) as transactions_count'
            )
            ->selectRaw(
                'COALESCE(SUM(stock_issuances.total_quantity), 0) as total_quantity'
            )
            ->first();

        return Inertia::render(
            'inventory/withdraw/index',
            [
                'warehouses' => $warehouses,
                'products' => $availableStocks,
                'reasons' =>
                    $this->reasonOptions(),
                'recent_issuances' =>
                    $recentIssuances,
                'summary' => [
                    'warehouses' =>
                        $warehouses->count(),
                    'available_stock_lines' =>
                        $availableStocks->count(),
                    'available_quantity' =>
                        round(
                            (float) $availableStocks
                                ->sum(
                                    'available_quantity'
                                ),
                            3
                        ),
                    'issued_today' =>
                        (int) (
                            $todaySummary
                                ->transactions_count
                            ?? 0
                        ),
                    'quantity_issued_today' =>
                        round(
                            (float) (
                                $todaySummary
                                    ->total_quantity
                                ?? 0
                            ),
                            3
                        ),
                ],
                'permissions' => [
                    'can_void' =>
                        $context['is_owner'],
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Issuance History
    |--------------------------------------------------------------------------
    */

    public function history(Request $request): Response
    {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];
        $branchId = $context['branch_id'];

        $search = trim(
            (string) $request->input(
                'search',
                ''
            )
        );

        $status = trim(
            (string) $request->input(
                'status',
                ''
            )
        );

        $reason = trim(
            (string) $request->input(
                'reason',
                ''
            )
        );

        $warehouseId = (int) $request->input(
            'warehouse_id',
            0
        );

        $dateFrom = $this->validDate(
            (string) $request->input(
                'date_from',
                ''
            )
        );

        $dateTo = $this->validDate(
            (string) $request->input(
                'date_to',
                ''
            )
        );

        $allowedStatuses = [
            'posted',
            'voided',
        ];

        $issuances = $this->issuanceBaseQuery(
            $tenantId,
            $branchId
        )
            ->when(
                $search !== '',
                function ($query) use (
                    $search
                ): void {
                    $like = "%{$search}%";

                    $query->where(
                        function ($searchQuery) use (
                            $like
                        ): void {
                            $searchQuery
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
                                    'stock_issuances.notes',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'warehouses.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'warehouses.code',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'branches.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'branches.code',
                                    'like',
                                    $like
                                );
                        }
                    );
                }
            )
            ->when(
                in_array(
                    $status,
                    $allowedStatuses,
                    true
                ),
                fn ($query) => $query->where(
                    'stock_issuances.status',
                    $status
                )
            )
            ->when(
                array_key_exists(
                    $reason,
                    self::REASONS
                ),
                fn ($query) => $query->where(
                    'stock_issuances.reason',
                    $reason
                )
            )
            ->when(
                $warehouseId > 0,
                fn ($query) => $query->where(
                    'stock_issuances.warehouse_id',
                    $warehouseId
                )
            )
            ->when(
                $dateFrom !== null,
                fn ($query) => $query->whereDate(
                    'stock_issuances.issuance_date',
                    '>=',
                    $dateFrom
                )
            )
            ->when(
                $dateTo !== null,
                fn ($query) => $query->whereDate(
                    'stock_issuances.issuance_date',
                    '<=',
                    $dateTo
                )
            )
            ->select([
                'stock_issuances.id',
                'stock_issuances.branch_id',
                'stock_issuances.warehouse_id',
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
                'stock_issuances.created_at',
                'stock_issuances.updated_at',

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
                        ->selectRaw('COUNT(*)')
                        ->whereColumn(
                            'stock_issuance_items.stock_issuance_id',
                            'stock_issuances.id'
                        );
                },
                'items_count'
            )
            ->orderByDesc(
                'stock_issuances.issuance_date'
            )
            ->orderByDesc(
                'stock_issuances.id'
            )
            ->paginate(15)
            ->withQueryString();

        $issuanceIds = $issuances
            ->getCollection()
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $items = $issuanceIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table(
                    'stock_issuance_items'
                )
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->whereIn(
                    'stock_issuance_id',
                    $issuanceIds
                )
                ->orderBy('id')
                ->get([
                    'id',
                    'stock_issuance_id',
                    'product_id',
                    'stock_movement_id',
                    'void_stock_movement_id',
                    'product_name',
                    'product_sku',
                    'unit',
                    'quantity_issued',
                    'unit_cost',
                    'line_total',
                    'notes',
                ])
                ->groupBy(
                    'stock_issuance_id'
                );

        $userIds = $issuances
            ->getCollection()
            ->flatMap(
                fn ($issuance): array => [
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

        $users = $this->getSaasUsers(
            $userIds
        );

        $issuances->setCollection(
            $issuances
                ->getCollection()
                ->map(
                    function ($issuance) use (
                        $items,
                        $users
                    ): array {
                        return [
                            'id' =>
                                (int) $issuance->id,
                            'issuance_number' =>
                                $issuance
                                    ->issuance_number,
                            'issuance_date' =>
                                $issuance
                                    ->issuance_date,
                            'reason' =>
                                $issuance->reason,
                            'reason_label' =>
                                $this->reasonLabel(
                                    $issuance->reason
                                ),
                            'issued_to' =>
                                $issuance->issued_to,
                            'department' =>
                                $issuance->department,
                            'purpose' =>
                                $issuance->purpose,
                            'reference_no' =>
                                $issuance->reference_no,
                            'status' =>
                                $issuance->status,
                            'total_quantity' =>
                                round(
                                    (float) $issuance
                                        ->total_quantity,
                                    3
                                ),
                            'total_cost' =>
                                round(
                                    (float) $issuance
                                        ->total_cost,
                                    2
                                ),
                            'notes' =>
                                $issuance->notes,
                            'items_count' =>
                                (int) $issuance
                                    ->items_count,
                            'branch' => [
                                'id' =>
                                    (int) $issuance
                                        ->branch_id,
                                'code' =>
                                    $issuance
                                        ->branch_code,
                                'name' =>
                                    $issuance
                                        ->branch_name,
                            ],
                            'warehouse' => [
                                'id' =>
                                    (int) $issuance
                                        ->warehouse_id,
                                'code' =>
                                    $issuance
                                        ->warehouse_code,
                                'name' =>
                                    $issuance
                                        ->warehouse_name,
                            ],
                            'issued_by' =>
                                $this->formatUser(
                                    $issuance->issued_by,
                                    $users
                                ),
                            'posted_at' =>
                                $issuance->posted_at,
                            'voided_by' =>
                                $this->formatUser(
                                    $issuance->voided_by,
                                    $users
                                ),
                            'voided_at' =>
                                $issuance->voided_at,
                            'void_reason' =>
                                $issuance->void_reason,
                            'created_at' =>
                                $issuance->created_at,
                            'updated_at' =>
                                $issuance->updated_at,
                            'items' => $items
                                ->get(
                                    (int) $issuance->id,
                                    collect()
                                )
                                ->map(
                                    fn ($item): array => [
                                        'id' =>
                                            (int) $item->id,
                                        'product_id' =>
                                            (int) $item
                                                ->product_id,
                                        'product_name' =>
                                            $item
                                                ->product_name,
                                        'product_sku' =>
                                            $item
                                                ->product_sku,
                                        'unit' =>
                                            $item->unit,
                                        'quantity_issued' =>
                                            round(
                                                (float) $item
                                                    ->quantity_issued,
                                                3
                                            ),
                                        'unit_cost' =>
                                            round(
                                                (float) $item
                                                    ->unit_cost,
                                                4
                                            ),
                                        'line_total' =>
                                            round(
                                                (float) $item
                                                    ->line_total,
                                                2
                                            ),
                                        'notes' =>
                                            $item->notes,
                                        'stock_movement_id' =>
                                            $item
                                                ->stock_movement_id
                                                ? (int) $item
                                                    ->stock_movement_id
                                                : null,
                                        'void_stock_movement_id' =>
                                            $item
                                                ->void_stock_movement_id
                                                ? (int) $item
                                                    ->void_stock_movement_id
                                                : null,
                                    ]
                                )
                                ->values()
                                ->all(),
                        ];
                    }
                )
        );

        $summaryBase = $this->issuanceBaseQuery(
            $tenantId,
            $branchId
        );

        $summary = [
            'total' =>
                (clone $summaryBase)->count(),
            'posted' =>
                (clone $summaryBase)
                    ->where(
                        'stock_issuances.status',
                        'posted'
                    )
                    ->count(),
            'voided' =>
                (clone $summaryBase)
                    ->where(
                        'stock_issuances.status',
                        'voided'
                    )
                    ->count(),
            'quantity_issued' =>
                round(
                    (float) (
                        (clone $summaryBase)
                            ->where(
                                'stock_issuances.status',
                                'posted'
                            )
                            ->sum(
                                'stock_issuances.total_quantity'
                            )
                    ),
                    3
                ),
            'issued_today' =>
                (clone $summaryBase)
                    ->where(
                        'stock_issuances.status',
                        'posted'
                    )
                    ->whereDate(
                        'stock_issuances.issuance_date',
                        today()
                    )
                    ->count(),
        ];

        $warehouses = DB::connection('mysql')
            ->table('warehouses')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->whereNull('deleted_at')
            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'branch_id',
                    $branchId
                )
            )
            ->orderBy('name')
            ->get([
                'id',
                'branch_id',
                'code',
                'name',
                'is_active',
            ])
            ->map(
                fn ($warehouse): array => [
                    'id' => (int) $warehouse->id,
                    'branch_id' =>
                        (int) $warehouse->branch_id,
                    'code' => $warehouse->code,
                    'name' => $warehouse->name,
                    'is_active' =>
                        (bool) $warehouse->is_active,
                ]
            )
            ->values();

        return Inertia::render(
            'stock-issuance/history/index',
            [
                'issuances' => $issuances,
                'summary' => $summary,
                'warehouses' => $warehouses,
                'reasons' =>
                    $this->reasonOptions(),
                'statuses' => [
                    [
                        'value' => 'posted',
                        'label' => 'Posted',
                    ],
                    [
                        'value' => 'voided',
                        'label' => 'Voided',
                    ],
                ],
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'reason' => $reason,
                    'warehouse_id' =>
                        $warehouseId > 0
                            ? (string) $warehouseId
                            : '',
                    'date_from' =>
                        $dateFrom ?? '',
                    'date_to' =>
                        $dateTo ?? '',
                ],
                'permissions' => [
                    'can_void' =>
                        $context['is_owner'],
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Post Stock Issuance
    |--------------------------------------------------------------------------
    */

    public function store(Request $request): RedirectResponse
    {
        try {
            $context = $this->access->resolve($request);
            $tenantId = $context['account_owner_id'];

            $validated = $request->validate([
                'warehouse_id' => [
                    'required',
                    'integer',
                    Rule::exists('warehouses', 'id')->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->where('is_active', true)
                            ->whereNull('deleted_at')
                    ),
                ],
                'issuance_date' => [
                    'required',
                    'date_format:Y-m-d',
                    'before_or_equal:today',
                ],
                'reason' => [
                    'required',
                    'string',
                    Rule::in(array_keys(self::REASONS)),
                ],
                'issued_to' => ['nullable', 'string', 'max:150'],
                'department' => ['nullable', 'string', 'max:150'],
                'purpose' => ['nullable', 'string', 'max:500'],
                'reference_no' => ['nullable', 'string', 'max:120'],
                'notes' => ['nullable', 'string', 'max:5000'],
                'items' => ['required', 'array', 'min:1', 'max:100'],
                'items.*.product_id' => [
                    'required',
                    'integer',
                    'distinct',
                ],
                'items.*.quantity_issued' => [
                    'required',
                    'numeric',
                    'gt:0',
                    'max:99999999999.999',
                ],
                'items.*.notes' => ['nullable', 'string', 'max:500'],
                // FIFO/FEFO products legitimately submit no manual allocations.
                // Exact manual allocation requirements are enforced by
                // InventoryLedgerService after the product policy is locked.
                'items.*.batch_allocations' => ['sometimes', 'array'],
                'items.*.batch_allocations.*.stock_batch_id' => [
                    'required_with:items.*.batch_allocations',
                    'integer',
                    'distinct',
                ],
                'items.*.batch_allocations.*.quantity' => [
                    'required_with:items.*.batch_allocations',
                    'numeric',
                    'gt:0',
                    'max:99999999999.999',
                ],
            ]);

            $this->validateReasonDetails($validated);

            $issuanceNumber = DB::connection('mysql')->transaction(
                function () use ($request, $context, $tenantId, $validated): string {
                    $database = DB::connection('mysql');
                    $warehouse = $this->ledger->lockWarehouse(
                        $tenantId,
                        (int) $validated['warehouse_id']
                    );

                    $this->access->assertBranch(
                        $context,
                        (int) $warehouse->branch_id
                    );

                    $branchExists = $database
                        ->table('branches')
                        ->where('tenant_id', $tenantId)
                        ->where('id', (int) $warehouse->branch_id)
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                        ->lockForUpdate()
                        ->exists();

                    if (! $branchExists) {
                        throw ValidationException::withMessages([
                            'warehouse_id' =>
                                'The warehouse branch is inactive or unavailable.',
                        ]);
                    }

                    $productIds = collect($validated['items'])
                        ->pluck('product_id')
                        ->map(fn ($id): int => (int) $id)
                        ->unique()
                        ->values();

                    $products = $database
                        ->table('products')
                        ->where('tenant_id', $tenantId)
                        ->whereIn('id', $productIds)
                        ->where('is_active', true)
                        ->where('stock_tracking', 'tracked')
                        ->whereNull('deleted_at')
                        ->lockForUpdate()
                        ->get()
                        ->keyBy('id');

                    if ($products->count() !== $productIds->count()) {
                        throw ValidationException::withMessages([
                            'items' =>
                                'One or more selected products are unavailable or not stock-tracked.',
                        ]);
                    }

                    $now = now();
                    $movementDate = Carbon::parse(
                        $validated['issuance_date'].' '.$now->format('H:i:s')
                    );
                    $issuanceNumber = $this->generateIssuanceNumber($tenantId);
                    $reason = (string) $validated['reason'];
                    $issuedTo = $this->nullableString(
                        $validated['issued_to'] ?? null
                    );
                    $department = $this->nullableString(
                        $validated['department'] ?? null
                    );
                    $purpose = $this->nullableString(
                        $validated['purpose'] ?? null
                    );
                    $referenceNo = $this->nullableString(
                        $validated['reference_no'] ?? null
                    );

                    $issuanceId = $database
                        ->table('stock_issuances')
                        ->insertGetId([
                            'tenant_id' => $tenantId,
                            'branch_id' => (int) $warehouse->branch_id,
                            'warehouse_id' => (int) $warehouse->id,
                            'issuance_number' => $issuanceNumber,
                            'issuance_date' => $validated['issuance_date'],
                            'reason' => $reason,
                            'issued_to' => $issuedTo,
                            'department' => $department,
                            'purpose' => $purpose,
                            'reference_no' => $referenceNo,
                            'status' => 'posted',
                            'total_quantity' => 0,
                            'total_cost' => 0,
                            'notes' => $this->nullableString(
                                $validated['notes'] ?? null
                            ),
                            'issued_by' => $context['user_id'],
                            'posted_at' => $now,
                            'voided_by' => null,
                            'voided_at' => null,
                            'void_reason' => null,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);

                    $totalQuantity = 0.0;
                    $totalCost = 0.0;

                    foreach ($validated['items'] as $index => $input) {
                        $productId = (int) $input['product_id'];
                        $product = $products->get($productId);
                        $rawQuantity = (float) $input['quantity_issued'];
                        $quantity = $this->ledger->quantity($rawQuantity);

                        if (abs($rawQuantity - $quantity) > 0.0000001) {
                            throw ValidationException::withMessages([
                                "items.{$index}.quantity_issued" =>
                                    'Quantity may only contain up to three decimal places.',
                            ]);
                        }

                        $itemId = $database
                            ->table('stock_issuance_items')
                            ->insertGetId([
                                'tenant_id' => $tenantId,
                                'stock_issuance_id' => $issuanceId,
                                'product_id' => $productId,
                                'stock_movement_id' => null,
                                'void_stock_movement_id' => null,
                                'product_name' => $product->name,
                                'product_sku' => $product->sku,
                                'unit' => $product->unit ?: 'pcs',
                                'quantity_issued' => $quantity,
                                'unit_cost' => 0,
                                'line_total' => 0,
                                'notes' => $this->nullableString(
                                    $input['notes'] ?? null
                                ),
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                        $remarks = "Stock issuance {$issuanceNumber}"
                            .' | Reason: '.$this->reasonLabel($reason);

                        if ($issuedTo !== null) {
                            $remarks .= " | Issued to: {$issuedTo}";
                        }
                        if ($department !== null) {
                            $remarks .= " | Department: {$department}";
                        }
                        if ($purpose !== null) {
                            $remarks .= " | Purpose: {$purpose}";
                        }
                        if ($referenceNo !== null) {
                            $remarks .= " | Reference: {$referenceNo}";
                        }

                        $ledgerResult = $this->ledger->postOutgoing([
                            'tenant_id' => $tenantId,
                            'warehouse_id' => (int) $warehouse->id,
                            'product_id' => $productId,
                            'quantity' => $quantity,
                            'movement_type' =>
                                $this->movementTypeForReason($reason),
                            'reference_type' => 'stock_issuance',
                            'reference_id' => $issuanceId,
                            'reference_no' => $issuanceNumber,
                            'user_id' => $context['user_id'],
                            'movement_date' => $movementDate,
                            'purpose' => match ($reason) {
                                'damaged' => 'damage',
                                'expired' => 'expired',
                                default => 'issue',
                            },
                            'batch_allocations' =>
                                $input['batch_allocations'] ?? [],
                            'remarks' => $remarks,
                        ]);

                        $database
                            ->table('stock_issuance_items')
                            ->where('tenant_id', $tenantId)
                            ->where('id', $itemId)
                            ->update([
                                'stock_movement_id' =>
                                    $ledgerResult['movement_id'],
                                'unit_cost' => $ledgerResult['unit_cost'],
                                'line_total' => $ledgerResult['total_cost'],
                                'updated_at' => $now,
                            ]);

                        foreach ($ledgerResult['allocations'] as $allocation) {
                            $database
                                ->table('stock_issuance_item_batches')
                                ->insert([
                                    'tenant_id' => $tenantId,
                                    'stock_issuance_item_id' => $itemId,
                                    'warehouse_id' => (int) $warehouse->id,
                                    'product_id' => $productId,
                                    'stock_batch_id' =>
                                        $allocation['stock_batch_id'],
                                    'stock_movement_batch_id' =>
                                        $allocation['stock_movement_batch_id'],
                                    'void_stock_movement_batch_id' => null,
                                    'quantity_issued' =>
                                        $allocation['quantity'],
                                    'unit_cost' => $allocation['unit_cost'],
                                    'line_total' => $allocation['total_cost'],
                                    'created_at' => $now,
                                    'updated_at' => $now,
                                ]);
                        }

                        $totalQuantity = $this->ledger->quantity(
                            $totalQuantity + $ledgerResult['quantity']
                        );
                        $totalCost = $this->ledger->money(
                            $totalCost + $ledgerResult['total_cost']
                        );
                    }

                    $database
                        ->table('stock_issuances')
                        ->where('tenant_id', $tenantId)
                        ->where('id', $issuanceId)
                        ->update([
                            'total_quantity' => $totalQuantity,
                            'total_cost' => $totalCost,
                            'updated_at' => $now,
                        ]);

                    return $issuanceNumber;
                },
                5
            );

            return back()->with(
                'success',
                "Stock issuance {$issuanceNumber} posted successfully."
            );
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (QueryException $exception) {
            report($exception);

            return back()
                ->withInput()
                ->withErrors([
                    'issuance' => config('app.debug')
                        ? 'Database error: '.$exception->getMessage()
                        : 'The database rejected the withdrawal. Review stock and batch availability, then try again.',
                ]);
        } catch (Throwable $exception) {
            report($exception);

            return back()
                ->withInput()
                ->withErrors([
                    'issuance' => config('app.debug')
                        ? 'Withdrawal error: '.$exception->getMessage()
                        : 'The withdrawal could not be posted. Please review the request and try again.',
                ]);
        }
    }



    /*
    |--------------------------------------------------------------------------
    | Void and Reverse Stock Issuance
    |--------------------------------------------------------------------------
    */

    public function void(
        Request $request,
        int $issuance
    ): RedirectResponse {
        $this->access->resolve($request);

        return back()->with(
            'error',
            'Use the Stock Issuance History screen to void an issuance. The active history controller performs an exact batch reversal.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Query Helpers
    |--------------------------------------------------------------------------
    */

    private function issuanceBaseQuery(
        int $tenantId,
        ?int $branchId
    ) {
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
                fn ($query) => $query->where(
                    'stock_issuances.branch_id',
                    $branchId
                )
            );
    }

    private function movementTypeForReason(
        string $reason
    ): string {
        return match ($reason) {
            'damaged' => 'damage',
            'expired' => 'expired',
            default => 'stock_out',
        };
    }

    private function validateReasonDetails(
        array $validated
    ): void {
        $issuedTo = $this->nullableString(
            $validated['issued_to']
            ?? null
        );

        $department = $this->nullableString(
            $validated['department']
            ?? null
        );

        $purpose = $this->nullableString(
            $validated['purpose']
            ?? null
        );

        if (
            $validated['reason']
                === 'employee_issuance'
            && $issuedTo === null
        ) {
            throw ValidationException::withMessages([
                'issued_to' =>
                    'Enter the employee or recipient of this issuance.',
            ]);
        }

        if (
            $validated['reason']
                === 'department_issuance'
            && $department === null
        ) {
            throw ValidationException::withMessages([
                'department' =>
                    'Enter the department receiving the items.',
            ]);
        }

        if (
            $validated['reason'] === 'other'
            && $purpose === null
        ) {
            throw ValidationException::withMessages([
                'purpose' =>
                    'Describe the purpose of this stock issuance.',
            ]);
        }
    }

    private function generateIssuanceNumber(
        int $tenantId
    ): string {
        do {
            $issuanceNumber =
                'ISS-'
                .now()->format('Ymd')
                .'-'
                .Str::upper(
                    Str::random(6)
                );

            $exists = DB::connection('mysql')
                ->table('stock_issuances')
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->where(
                    'issuance_number',
                    $issuanceNumber
                )
                ->exists();
        } while ($exists);

        return $issuanceNumber;
    }

    private function reasonOptions(): array
    {
        return collect(self::REASONS)
            ->map(
                fn (
                    string $label,
                    string $value
                ): array => [
                    'value' => $value,
                    'label' => $label,
                ]
            )
            ->values()
            ->all();
    }

    private function reasonLabel(
        string $reason
    ): string {
        return self::REASONS[$reason]
            ?? Str::headline($reason);
    }

    private function almostEqual(
        float $first,
        float $second,
        float $tolerance
    ): bool {
        return abs($first - $second)
            <= $tolerance;
    }

    private function nullableString(
        mixed $value
    ): ?string {
        $value = trim(
            (string) ($value ?? '')
        );

        return $value !== ''
            ? $value
            : null;
    }

    private function getSaasUsers(
        Collection $userIds
    ): Collection {
        if ($userIds->isEmpty()) {
            return collect();
        }

        return DB::connection('saas')
            ->table('users')
            ->whereIn('id', $userIds)
            ->get([
                'id',
                'name',
                'email',
            ])
            ->keyBy('id');
    }

    private function formatUser(
        mixed $userId,
        Collection $users
    ): ?array {
        if (! $userId) {
            return null;
        }

        $user = $users->get(
            (int) $userId
        );

        return [
            'id' => (int) $userId,
            'name' =>
                $user?->name
                ?? "User #{$userId}",
            'email' =>
                $user?->email,
        ];
    }

    private function validDate(
        string $value
    ): ?string {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        $date = \DateTimeImmutable::createFromFormat(
            'Y-m-d',
            $value
        );

        if (
            ! $date
            || $date->format('Y-m-d')
                !== $value
        ) {
            return null;
        }

        return $value;
    }

    /*
    |--------------------------------------------------------------------------
    | Active Inventory Access Context
    |--------------------------------------------------------------------------
    */

    private function userContext(Request $request): array
    {
        return $this->access->resolve($request);
    }

}