<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Stock Movement History
    |--------------------------------------------------------------------------
    |
    | Read-only page ito.
    |
    | Ang movement records ay manggagaling sa:
    | - Opening stock
    | - Stock in
    | - Stock out
    | - Adjustment
    | - Transfer
    | - Sale
    | - Return
    | - Damage
    | - Expired stock
    |
    */

    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input('search', '')
        );

        $movementType = trim(
            (string) $request->input(
                'movement_type',
                ''
            )
        );

        $direction = trim(
            (string) $request->input(
                'direction',
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

        /*
        |--------------------------------------------------------------------------
        | Movement Query
        |--------------------------------------------------------------------------
        */

        $movements = StockMovement::query()
            ->forTenant($tenantId)

            ->leftJoin(
                'products as products',
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
                'warehouses as warehouses',
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

            /*
             * Search:
             * product, SKU, barcode, warehouse,
             * reference number, or remarks.
             */
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(
                        function ($searchQuery) use (
                            $search
                        ): void {
                            $like = "%{$search}%";

                            $searchQuery
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
                                    'warehouses.code',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'related_warehouses.name',
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

            /*
             * Filter by exact movement type.
             */
            ->when(
                array_key_exists(
                    $movementType,
                    StockMovement::movementLabels()
                ),
                fn ($query) => $query->where(
                    'stock_movements.movement_type',
                    $movementType
                )
            )

            /*
             * Incoming or outgoing filter.
             */
            ->when(
                $direction === 'in',
                fn ($query) => $query->whereIn(
                    'stock_movements.movement_type',
                    StockMovement::incomingTypes()
                )
            )

            ->when(
                $direction === 'out',
                fn ($query) => $query->whereIn(
                    'stock_movements.movement_type',
                    StockMovement::outgoingTypes()
                )
            )

            /*
             * Warehouse filter.
             */
            ->when(
                $warehouseId > 0,
                fn ($query) => $query->where(
                    'stock_movements.warehouse_id',
                    $warehouseId
                )
            )

            /*
             * Date range filters.
             */
            ->when(
                $dateFrom !== null,
                fn ($query) => $query->whereDate(
                    'stock_movements.movement_date',
                    '>=',
                    $dateFrom
                )
            )

            ->when(
                $dateTo !== null,
                fn ($query) => $query->whereDate(
                    'stock_movements.movement_date',
                    '<=',
                    $dateTo
                )
            )

            ->select([
                'stock_movements.id',
                'stock_movements.tenant_id',
                'stock_movements.warehouse_id',
                'stock_movements.product_id',
                'stock_movements.movement_type',
                'stock_movements.quantity',
                'stock_movements.quantity_before',
                'stock_movements.quantity_after',
                'stock_movements.unit_cost',
                'stock_movements.total_cost',
                'stock_movements.reference_type',
                'stock_movements.reference_id',
                'stock_movements.reference_no',
                'stock_movements.related_warehouse_id',
                'stock_movements.remarks',
                'stock_movements.movement_date',
                'stock_movements.created_by',
                'stock_movements.created_at',

                'products.name as product_name',
                'products.sku as product_sku',
                'products.barcode as product_barcode',
                'products.unit as product_unit',

                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',

                'related_warehouses.name as related_warehouse_name',
                'related_warehouses.code as related_warehouse_code',
            ])

            ->orderByDesc(
                'stock_movements.movement_date'
            )
            ->orderByDesc(
                'stock_movements.id'
            )
            ->paginate(15)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Get SaaS User Names
        |--------------------------------------------------------------------------
        |
        | created_by contains the ID from jcm_saas_db.users.
        | Walang cross-database foreign key.
        |
        */

        $creatorIds = $movements
            ->getCollection()
            ->pluck('created_by')
            ->filter()
            ->map(
                fn ($userId): int => (int) $userId
            )
            ->unique()
            ->values();

        $creators = $creatorIds->isEmpty()
            ? collect()
            : DB::connection('saas')
                ->table('users')
                ->whereIn('id', $creatorIds)
                ->get([
                    'id',
                    'name',
                    'email',
                ])
                ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Format Movement Records
        |--------------------------------------------------------------------------
        */

        $movements->setCollection(
            $movements
                ->getCollection()
                ->map(
                    function (
                        StockMovement $movement
                    ) use ($creators): array {
                        $creator = $movement->created_by
                            ? $creators->get(
                                (int) $movement->created_by
                            )
                            : null;

                        return [
                            'id' => (int) $movement->id,

                            'product' => [
                                'id' => (int) $movement
                                    ->product_id,

                                'name' => $movement
                                    ->product_name
                                    ?? 'Deleted product',

                                'sku' => $movement
                                    ->product_sku,

                                'barcode' => $movement
                                    ->product_barcode,

                                'unit' => $movement
                                    ->product_unit
                                    ?? 'unit',
                            ],

                            'warehouse' => [
                                'id' => (int) $movement
                                    ->warehouse_id,

                                'name' => $movement
                                    ->warehouse_name
                                    ?? 'Deleted warehouse',

                                'code' => $movement
                                    ->warehouse_code,
                            ],

                            'related_warehouse' =>
                                $movement
                                    ->related_warehouse_id
                                    ? [
                                        'id' => (int) $movement
                                            ->related_warehouse_id,

                                        'name' => $movement
                                            ->related_warehouse_name
                                            ?? 'Deleted warehouse',

                                        'code' => $movement
                                            ->related_warehouse_code,
                                    ]
                                    : null,

                            'movement_type' =>
                                $movement->movement_type,

                            'movement_label' =>
                                $movement->movementLabel(),

                            'direction' =>
                                $movement->direction(),

                            'quantity' =>
                                (float) $movement->quantity,

                            'quantity_before' =>
                                (float) $movement
                                    ->quantity_before,

                            'quantity_after' =>
                                (float) $movement
                                    ->quantity_after,

                            'unit_cost' =>
                                (float) $movement->unit_cost,

                            'total_cost' =>
                                (float) $movement->total_cost,

                            'reference_type' =>
                                $movement->reference_type,

                            'reference_id' =>
                                $movement->reference_id
                                    ? (int) $movement
                                        ->reference_id
                                    : null,

                            'reference_no' =>
                                $movement->reference_no,

                            'remarks' =>
                                $movement->remarks,

                            'movement_date' =>
                                $movement->movement_date
                                    ?->toISOString(),

                            'created_by' =>
                                $movement->created_by
                                    ? [
                                        'id' => (int) $movement
                                            ->created_by,

                                        'name' => $creator
                                            ->name
                                            ?? 'User #'
                                            .$movement
                                                ->created_by,

                                        'email' => $creator
                                            ->email
                                            ?? null,
                                    ]
                                    : null,
                        ];
                    }
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $summaryQuery = StockMovement::query()
            ->forTenant($tenantId);

        $summary = [
            'total' => (clone $summaryQuery)
                ->count(),

            'incoming_quantity' =>
                (float) (clone $summaryQuery)
                    ->incoming()
                    ->sum('quantity'),

            'outgoing_quantity' =>
                (float) (clone $summaryQuery)
                    ->outgoing()
                    ->sum('quantity'),

            'affected_products' =>
                (clone $summaryQuery)
                    ->distinct()
                    ->count('product_id'),
        ];

        /*
        |--------------------------------------------------------------------------
        | Warehouse Filter Options
        |--------------------------------------------------------------------------
        */

        $warehouses = DB::connection('mysql')
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Movement Type Options
        |--------------------------------------------------------------------------
        */

        $movementTypes = collect(
            StockMovement::movementLabels()
        )
            ->map(
                fn (
                    string $label,
                    string $value
                ): array => [
                    'value' => $value,
                    'label' => $label,
                ]
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Render Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'inventory/stock-movements/index',
            [
                'movements' => $movements,

                'summary' => $summary,

                'warehouses' => $warehouses,

                'movement_types' =>
                    $movementTypes,

                'filters' => [
                    'search' => $search,

                    'movement_type' =>
                        $movementType,

                    'direction' => $direction,

                    'warehouse_id' =>
                        $warehouseId > 0
                            ? (string) $warehouseId
                            : '',

                    'date_from' =>
                        $dateFrom ?? '',

                    'date_to' =>
                        $dateTo ?? '',
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Helper
    |--------------------------------------------------------------------------
    */

    private function getTenantId(
        Request $request
    ): int {
        $tenantId = (int) (
            $request->user()->client_id ?? 0
        );

        /*
         * Temporary local development fallback.
         */
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

    /*
    |--------------------------------------------------------------------------
    | Date Validation Helper
    |--------------------------------------------------------------------------
    */

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
            || $date->format('Y-m-d') !== $value
        ) {
            return null;
        }

        return $value;
    }
}