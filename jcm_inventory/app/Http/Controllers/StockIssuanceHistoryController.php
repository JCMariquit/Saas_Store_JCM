<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockIssuanceHistoryController extends Controller
{
    private const PRODUCT_CODE = 'JCM-INVENTORY-001';

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
    | Stock Issuance History
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): Response
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
            'inventory/history/index',
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
    | Void and Restore Stock
    |--------------------------------------------------------------------------
    */

    public function void(
        Request $request,
        int $issuance
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        abort_unless(
            $context['is_owner'],
            403,
            'Only the account owner can void posted stock issuances.'
        );

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'min:3',
                'max:1000',
            ],
        ]);

        $issuanceNumber = DB::connection('mysql')
            ->transaction(
                function () use (
                    $request,
                    $tenantId,
                    $issuance,
                    $validated
                ): string {
                    $database =
                        DB::connection('mysql');

                    $issuanceRecord = $database
                        ->table('stock_issuances')
                        ->where(
                            'id',
                            $issuance
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->lockForUpdate()
                        ->first();

                    if (! $issuanceRecord) {
                        abort(404);
                    }

                    if (
                        $issuanceRecord->status
                        !== 'posted'
                    ) {
                        throw ValidationException::withMessages([
                            'issuance' =>
                                'This stock issuance has already been voided.',
                        ]);
                    }

                    $items = $database
                        ->table(
                            'stock_issuance_items'
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->where(
                            'stock_issuance_id',
                            $issuanceRecord->id
                        )
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->get();

                    if ($items->isEmpty()) {
                        throw ValidationException::withMessages([
                            'issuance' =>
                                'This stock issuance has no items to reverse.',
                        ]);
                    }

                    if (
                        $items->contains(
                            fn ($item): bool =>
                                ! $item
                                    ->stock_movement_id
                                || $item
                                    ->void_stock_movement_id
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'issuance' =>
                                'This stock issuance cannot be safely voided because its movement links are incomplete or already reversed.',
                        ]);
                    }

                    $movementIds = $items
                        ->pluck(
                            'stock_movement_id'
                        )
                        ->map(
                            fn ($id): int => (int) $id
                        )
                        ->unique()
                        ->values();

                    $movements = $database
                        ->table('stock_movements')
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->whereIn(
                            'id',
                            $movementIds
                        )
                        ->lockForUpdate()
                        ->get()
                        ->keyBy('id');

                    if (
                        $movements->count()
                        !== $movementIds->count()
                    ) {
                        throw ValidationException::withMessages([
                            'issuance' =>
                                'One or more original stock movements could not be found.',
                        ]);
                    }

                    $now = now();

                    $voidReason = trim(
                        (string) $validated['reason']
                    );

                    foreach ($items as $item) {
                        $movement = $movements->get(
                            (int) $item
                                ->stock_movement_id
                        );

                        if (
                            ! $movement
                            || ! in_array(
                                $movement
                                    ->movement_type,
                                [
                                    'stock_out',
                                    'damage',
                                    'expired',
                                ],
                                true
                            )
                            || $movement
                                ->reference_type
                                !== 'stock_issuance'
                            || (int) $movement
                                ->reference_id
                                !== (int) $issuanceRecord
                                    ->id
                            || (int) $movement
                                ->warehouse_id
                                !== (int) $issuanceRecord
                                    ->warehouse_id
                            || (int) $movement
                                ->product_id
                                !== (int) $item
                                    ->product_id
                            || $movement
                                ->average_cost_before
                                === null
                            || $movement
                                ->average_cost_after
                                === null
                        ) {
                            throw ValidationException::withMessages([
                                'issuance' =>
                                    "{$item->product_name} does not have a complete reversible movement record.",
                            ]);
                        }

                        $alreadyReversed = $database
                            ->table('stock_movements')
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'reversal_of_movement_id',
                                $movement->id
                            )
                            ->exists();

                        if ($alreadyReversed) {
                            throw ValidationException::withMessages([
                                'issuance' =>
                                    "{$item->product_name} has already been reversed.",
                            ]);
                        }

                        $hasLaterMovement = $database
                            ->table('stock_movements')
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'warehouse_id',
                                $movement->warehouse_id
                            )
                            ->where(
                                'product_id',
                                $movement->product_id
                            )
                            ->where(
                                'id',
                                '>',
                                $movement->id
                            )
                            ->exists();

                        if ($hasLaterMovement) {
                            throw ValidationException::withMessages([
                                'issuance' =>
                                    "{$item->product_name} has later stock activity. Void that later activity first or use a controlled adjustment instead.",
                            ]);
                        }

                        $stock = $database
                            ->table('warehouse_stocks')
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'warehouse_id',
                                $movement->warehouse_id
                            )
                            ->where(
                                'product_id',
                                $movement->product_id
                            )
                            ->lockForUpdate()
                            ->first();

                        if (! $stock) {
                            throw ValidationException::withMessages([
                                'issuance' =>
                                    "The warehouse stock for {$item->product_name} could not be found.",
                            ]);
                        }

                        $currentQuantity = round(
                            (float) $stock->quantity,
                            3
                        );

                        $currentAverageCost = round(
                            (float) $stock->average_cost,
                            4
                        );

                        if (
                            ! $this->almostEqual(
                                $currentQuantity,
                                (float) $movement
                                    ->quantity_after,
                                0.0005
                            )
                            || ! $this->almostEqual(
                                $currentAverageCost,
                                (float) $movement
                                    ->average_cost_after,
                                0.00005
                            )
                        ) {
                            throw ValidationException::withMessages([
                                'issuance' =>
                                    "Current stock for {$item->product_name} no longer matches the posted issuance state.",
                            ]);
                        }

                        $restoredQuantity = round(
                            (float) $movement
                                ->quantity_before,
                            3
                        );

                        $restoredAverageCost = round(
                            (float) $movement
                                ->average_cost_before,
                            4
                        );

                        $database
                            ->table('warehouse_stocks')
                            ->where(
                                'id',
                                $stock->id
                            )
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->update([
                                'quantity' =>
                                    $restoredQuantity,
                                'average_cost' =>
                                    $restoredAverageCost,
                                'last_movement_at' =>
                                    $now,
                                'updated_at' => $now,
                            ]);

                        $voidMovementId = $database
                            ->table('stock_movements')
                            ->insertGetId([
                                'tenant_id' => $tenantId,
                                'warehouse_id' =>
                                    $movement->warehouse_id,
                                'product_id' =>
                                    $movement->product_id,
                                'movement_type' =>
                                    'adjustment_in',
                                'quantity' =>
                                    round(
                                        (float) $movement
                                            ->quantity,
                                        3
                                    ),
                                'quantity_before' =>
                                    $currentQuantity,
                                'quantity_after' =>
                                    $restoredQuantity,
                                'unit_cost' =>
                                    round(
                                        (float) $movement
                                            ->unit_cost,
                                        4
                                    ),
                                'total_cost' =>
                                    round(
                                        (float) $movement
                                            ->total_cost,
                                        2
                                    ),
                                'average_cost_before' =>
                                    $currentAverageCost,
                                'average_cost_after' =>
                                    $restoredAverageCost,
                                'reference_type' =>
                                    'stock_issuance_void',
                                'reference_id' =>
                                    $issuanceRecord->id,
                                'reference_no' =>
                                    $issuanceRecord
                                        ->issuance_number,
                                'related_warehouse_id' =>
                                    null,
                                'reversal_of_movement_id' =>
                                    $movement->id,
                                'remarks' =>
                                    "Voided stock issuance {$issuanceRecord->issuance_number}: {$voidReason}",
                                'movement_date' => $now,
                                'created_by' =>
                                    $request->user()->id,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                        $database
                            ->table(
                                'stock_issuance_items'
                            )
                            ->where(
                                'id',
                                $item->id
                            )
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->update([
                                'void_stock_movement_id' =>
                                    $voidMovementId,
                                'updated_at' => $now,
                            ]);
                    }

                    $database
                        ->table('stock_issuances')
                        ->where(
                            'id',
                            $issuanceRecord->id
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->update([
                            'status' => 'voided',
                            'voided_by' =>
                                $request->user()->id,
                            'voided_at' => $now,
                            'void_reason' =>
                                $voidReason,
                            'updated_at' => $now,
                        ]);

                    return $issuanceRecord
                        ->issuance_number;
                }
            );

        return back()->with(
            'success',
            "Stock issuance {$issuanceNumber} was voided and its stock was safely restored."
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

    private function userContext(
        Request $request
    ): array {
        $userId = (int) (
            $request->user()?->id
        );

        abort_unless(
            $userId > 0,
            401
        );

        $context = DB::connection('saas')
            ->table(
                'user_product_access as access'
            )
            ->join(
                'products as product',
                'product.id',
                '=',
                'access.product_id'
            )
            ->join(
                'product_user_types as product_role',
                function ($join): void {
                    $join
                        ->on(
                            'product_role.id',
                            '=',
                            'access.product_user_type_id'
                        )
                        ->on(
                            'product_role.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->join(
                'user_types as user_type',
                'user_type.id',
                '=',
                'product_role.user_type_id'
            )
            ->join(
                'subscriptions as subscription',
                function ($join): void {
                    $join
                        ->on(
                            'subscription.id',
                            '=',
                            'access.subscription_id'
                        )
                        ->on(
                            'subscription.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->where(
                'access.user_id',
                $userId
            )
            ->where(
                'access.status',
                'active'
            )
            ->where(
                'product.product_code',
                self::PRODUCT_CODE
            )
            ->whereIn(
                'product.status',
                [
                    'development',
                    'active',
                ]
            )
            ->where(
                'product_role.status',
                'active'
            )
            ->where(
                'user_type.status',
                'active'
            )
            ->whereIn(
                'subscription.status',
                [
                    'trial',
                    'active',
                ]
            )
            ->orderByDesc(
                'subscription.id'
            )
            ->select([
                'access.account_owner_id',
                'access.product_id',
                'access.subscription_id',
                'product_role.display_name as role_name',
                'user_type.type_code as role_code',
                'user_type.is_owner_type',
            ])
            ->first();

        abort_unless(
            $context,
            403,
            'Your account does not have active access to JCM Inventory.'
        );

        $isOwner =
            (bool) $context->is_owner_type;

        $assignedBranchId = $isOwner
            ? null
            : (int) (
                $request->user()
                    ?->branch_id
                ?? 0
            );

        if (
            ! $isOwner
            && $assignedBranchId <= 0
        ) {
            abort(
                403,
                'No branch is assigned to your inventory account.'
            );
        }

        return [
            'user_id' => $userId,
            'account_owner_id' =>
                (int) $context
                    ->account_owner_id,
            'product_id' =>
                (int) $context->product_id,
            'subscription_id' =>
                (int) $context
                    ->subscription_id,
            'role_code' =>
                (string) $context->role_code,
            'role_name' =>
                (string) (
                    $context->role_name
                    ?: $context->role_code
                ),
            'is_owner' => $isOwner,
            'branch_id' => $isOwner
                ? null
                : $assignedBranchId,
        ];
    }
}