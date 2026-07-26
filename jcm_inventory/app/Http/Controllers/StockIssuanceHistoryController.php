<?php

namespace App\Http\Controllers;

use App\Services\Inventory\InventoryAccessContext;
use App\Services\Inventory\InventoryLedgerService;
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

        $itemIds = $items
            ->flatten(1)
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->values();

        $itemBatches = $itemIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table('stock_issuance_item_batches as item_batch')
                ->join('stock_batches as batch', function ($join): void {
                    $join
                        ->on('batch.id', '=', 'item_batch.stock_batch_id')
                        ->on('batch.tenant_id', '=', 'item_batch.tenant_id');
                })
                ->where('item_batch.tenant_id', $tenantId)
                ->whereIn('item_batch.stock_issuance_item_id', $itemIds)
                ->orderBy('item_batch.id')
                ->get([
                    'item_batch.id',
                    'item_batch.stock_issuance_item_id',
                    'item_batch.stock_batch_id',
                    'item_batch.stock_movement_batch_id',
                    'item_batch.void_stock_movement_batch_id',
                    'item_batch.quantity_issued',
                    'item_batch.unit_cost',
                    'item_batch.line_total',
                    'batch.batch_code',
                    'batch.lot_number',
                    'batch.received_date',
                    'batch.expiration_date',
                    'batch.status',
                ])
                ->groupBy('stock_issuance_item_id');

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
                        $itemBatches,
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
                                        'batches' => $itemBatches
                                            ->get((int) $item->id, collect())
                                            ->map(fn ($batch): array => [
                                                'id' => (int) $batch->id,
                                                'stock_batch_id' =>
                                                    (int) $batch->stock_batch_id,
                                                'batch_code' =>
                                                    $batch->batch_code,
                                                'lot_number' =>
                                                    $batch->lot_number,
                                                'quantity_issued' =>
                                                    (float) $batch->quantity_issued,
                                                'unit_cost' =>
                                                    (float) $batch->unit_cost,
                                                'line_total' =>
                                                    (float) $batch->line_total,
                                                'received_date' =>
                                                    $batch->received_date,
                                                'expiration_date' =>
                                                    $batch->expiration_date,
                                                'status' => $batch->status,
                                                'stock_movement_batch_id' =>
                                                    $batch->stock_movement_batch_id
                                                        ? (int) $batch->stock_movement_batch_id
                                                        : null,
                                                'void_stock_movement_batch_id' =>
                                                    $batch->void_stock_movement_batch_id
                                                        ? (int) $batch->void_stock_movement_batch_id
                                                        : null,
                                            ])
                                            ->values()
                                            ->all(),
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
        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];

        abort_unless(
            $context['is_owner'],
            403,
            'Only the account owner can void posted stock issuances.'
        );

        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $issuanceNumber = DB::connection('mysql')->transaction(
            function () use (
                $context,
                $tenantId,
                $issuance,
                $validated
            ): string {
                $database = DB::connection('mysql');
                $issuanceRecord = $database
                    ->table('stock_issuances')
                    ->where('id', $issuance)
                    ->where('tenant_id', $tenantId)
                    ->lockForUpdate()
                    ->first();

                if (! $issuanceRecord) {
                    abort(404);
                }

                if ($issuanceRecord->status !== 'posted') {
                    throw ValidationException::withMessages([
                        'issuance' =>
                            'This stock issuance has already been voided.',
                    ]);
                }

                $items = $database
                    ->table('stock_issuance_items')
                    ->where('tenant_id', $tenantId)
                    ->where('stock_issuance_id', $issuanceRecord->id)
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
                            ! $item->stock_movement_id
                            || $item->void_stock_movement_id
                    )
                ) {
                    throw ValidationException::withMessages([
                        'issuance' =>
                            'This issuance has incomplete or already-reversed movement links.',
                    ]);
                }

                $now = now();
                $voidReason = trim((string) $validated['reason']);

                foreach ($items as $item) {
                    $itemBatches = $database
                        ->table('stock_issuance_item_batches')
                        ->where('tenant_id', $tenantId)
                        ->where('stock_issuance_item_id', $item->id)
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->get();

                    if ($itemBatches->isEmpty()) {
                        throw ValidationException::withMessages([
                            'issuance' =>
                                "{$item->product_name} has no exact batch allocation. A legacy issuance cannot be safely voided automatically.",
                        ]);
                    }

                    if (
                        $itemBatches->contains(
                            fn ($batch): bool =>
                                ! $batch->stock_movement_batch_id
                                || $batch->void_stock_movement_batch_id
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'issuance' =>
                                "{$item->product_name} has incomplete or already-reversed batch links.",
                        ]);
                    }

                    $reversal = $this->ledger->reverseMovement([
                        'tenant_id' => $tenantId,
                        'original_movement_id' =>
                            (int) $item->stock_movement_id,
                        'expected_reference_type' => 'stock_issuance',
                        'expected_reference_id' =>
                            (int) $issuanceRecord->id,
                        'movement_type' => 'return_in',
                        'reference_type' => 'stock_issuance_void',
                        'reference_id' => (int) $issuanceRecord->id,
                        'reference_no' =>
                            (string) $issuanceRecord->issuance_number,
                        'remarks' =>
                            "Voided stock issuance {$issuanceRecord->issuance_number}: {$voidReason}",
                        'movement_date' => $now,
                        'user_id' => $context['user_id'],
                    ]);

                    $voidBatchByOriginal = collect(
                        $reversal['allocations']
                    )->keyBy(
                        fn (array $allocation): int =>
                            (int) $allocation[
                                'original_stock_movement_batch_id'
                            ]
                    );

                    foreach ($itemBatches as $itemBatch) {
                        $voidAllocation = $voidBatchByOriginal->get(
                            (int) $itemBatch->stock_movement_batch_id
                        );

                        if (! $voidAllocation) {
                            throw ValidationException::withMessages([
                                'issuance' =>
                                    "The reversal batch link for {$item->product_name} is incomplete.",
                            ]);
                        }

                        $database
                            ->table('stock_issuance_item_batches')
                            ->where('tenant_id', $tenantId)
                            ->where('id', $itemBatch->id)
                            ->update([
                                'void_stock_movement_batch_id' =>
                                    $voidAllocation[
                                        'stock_movement_batch_id'
                                    ],
                                'updated_at' => $now,
                            ]);
                    }

                    $database
                        ->table('stock_issuance_items')
                        ->where('tenant_id', $tenantId)
                        ->where('id', $item->id)
                        ->update([
                            'void_stock_movement_id' =>
                                $reversal['movement_id'],
                            'updated_at' => $now,
                        ]);
                }

                $database
                    ->table('stock_issuances')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $issuanceRecord->id)
                    ->update([
                        'status' => 'voided',
                        'voided_by' => $context['user_id'],
                        'voided_at' => $now,
                        'void_reason' => $voidReason,
                        'updated_at' => $now,
                    ]);

                return (string) $issuanceRecord->issuance_number;
            },
            5
        );

        return back()->with(
            'success',
            "Stock issuance {$issuanceNumber} was voided and its exact batches were restored."
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

    private function userContext(Request $request): array
    {
        return $this->access->resolve($request);
    }

}