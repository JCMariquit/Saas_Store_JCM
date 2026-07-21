<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    private const PRODUCT_CODE = 'JCM-INVENTORY-001';

    /*
    |--------------------------------------------------------------------------
    | Purchase Order List
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): Response
    {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $supplierId = (int) $request->input(
            'supplier_id',
            0
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

        $allowedStatuses = array_keys(
            $this->statusLabels()
        );

        /*
        |--------------------------------------------------------------------------
        | Purchase Order Query
        |--------------------------------------------------------------------------
        */

        $orders = DB::connection('mysql')
            ->table('purchase_orders')
            ->leftJoin(
                'suppliers',
                function ($join): void {
                    $join
                        ->on(
                            'suppliers.id',
                            '=',
                            'purchase_orders.supplier_id'
                        )
                        ->on(
                            'suppliers.tenant_id',
                            '=',
                            'purchase_orders.tenant_id'
                        );
                }
            )
            ->leftJoin(
                'branches',
                function ($join): void {
                    $join
                        ->on(
                            'branches.id',
                            '=',
                            'purchase_orders.branch_id'
                        )
                        ->on(
                            'branches.tenant_id',
                            '=',
                            'purchase_orders.tenant_id'
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
                            'purchase_orders.warehouse_id'
                        )
                        ->on(
                            'warehouses.tenant_id',
                            '=',
                            'purchase_orders.tenant_id'
                        );
                }
            )
            ->where(
                'purchase_orders.tenant_id',
                $tenantId
            )
            ->whereNull(
                'purchase_orders.deleted_at'
            )

            /*
             * Search by:
             * - PO number
             * - supplier
             * - branch
             * - warehouse
             * - notes
             */
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $like = "%{$search}%";

                    $query->where(
                        function ($searchQuery) use (
                            $like
                        ): void {
                            $searchQuery
                                ->where(
                                    'purchase_orders.po_number',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.code',
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
                                    'purchase_orders.notes',
                                    'like',
                                    $like
                                );
                        }
                    );
                }
            )

            /*
             * Status filter.
             */
            ->when(
                in_array(
                    $status,
                    $allowedStatuses,
                    true
                ),
                fn ($query) => $query->where(
                    'purchase_orders.status',
                    $status
                )
            )

            /*
             * Supplier filter.
             */
            ->when(
                $supplierId > 0,
                fn ($query) => $query->where(
                    'purchase_orders.supplier_id',
                    $supplierId
                )
            )

            /*
             * Warehouse filter.
             */
            ->when(
                $warehouseId > 0,
                fn ($query) => $query->where(
                    'purchase_orders.warehouse_id',
                    $warehouseId
                )
            )

            /*
             * Date filters.
             */
            ->when(
                $dateFrom !== null,
                fn ($query) => $query->whereDate(
                    'purchase_orders.order_date',
                    '>=',
                    $dateFrom
                )
            )
            ->when(
                $dateTo !== null,
                fn ($query) => $query->whereDate(
                    'purchase_orders.order_date',
                    '<=',
                    $dateTo
                )
            )

            ->select([
                'purchase_orders.id',
                'purchase_orders.tenant_id',
                'purchase_orders.supplier_id',
                'purchase_orders.branch_id',
                'purchase_orders.warehouse_id',

                'purchase_orders.po_number',
                'purchase_orders.order_date',
                'purchase_orders.expected_delivery_date',
                'purchase_orders.status',
                'purchase_orders.payment_terms',

                'purchase_orders.subtotal',
                'purchase_orders.discount_amount',
                'purchase_orders.tax_amount',
                'purchase_orders.shipping_amount',
                'purchase_orders.total_amount',

                'purchase_orders.notes',

                'purchase_orders.created_by',
                'purchase_orders.submitted_by',
                'purchase_orders.submitted_at',
                'purchase_orders.approved_by',
                'purchase_orders.approved_at',
                'purchase_orders.cancelled_by',
                'purchase_orders.cancelled_at',

                'purchase_orders.created_at',
                'purchase_orders.updated_at',

                'suppliers.name as supplier_name',
                'suppliers.code as supplier_code',
                'suppliers.contact_person as supplier_contact_person',

                'branches.name as branch_name',
                'branches.code as branch_code',

                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
            ])

            ->selectSub(
                function ($query): void {
                    $query
                        ->from('purchase_order_items')
                        ->selectRaw('COUNT(*)')
                        ->whereColumn(
                            'purchase_order_items.purchase_order_id',
                            'purchase_orders.id'
                        )
                        ->whereColumn(
                            'purchase_order_items.tenant_id',
                            'purchase_orders.tenant_id'
                        );
                },
                'items_count'
            )

            ->selectSub(
                function ($query): void {
                    $query
                        ->from('purchase_order_items')
                        ->selectRaw(
                            'COALESCE(SUM(quantity), 0)'
                        )
                        ->whereColumn(
                            'purchase_order_items.purchase_order_id',
                            'purchase_orders.id'
                        )
                        ->whereColumn(
                            'purchase_order_items.tenant_id',
                            'purchase_orders.tenant_id'
                        );
                },
                'ordered_quantity'
            )

            ->selectSub(
                function ($query): void {
                    $query
                        ->from('purchase_order_items')
                        ->selectRaw(
                            'COALESCE(SUM(received_quantity), 0)'
                        )
                        ->whereColumn(
                            'purchase_order_items.purchase_order_id',
                            'purchase_orders.id'
                        )
                        ->whereColumn(
                            'purchase_order_items.tenant_id',
                            'purchase_orders.tenant_id'
                        );
                },
                'received_quantity'
            )

            ->orderByDesc(
                'purchase_orders.order_date'
            )
            ->orderByDesc(
                'purchase_orders.id'
            )
            ->paginate(15)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Purchase Order Item Details
        |--------------------------------------------------------------------------
        */

        $purchaseOrderIds = $orders
            ->getCollection()
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $itemsByOrder = $purchaseOrderIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table('purchase_order_items')
                ->where('tenant_id', $tenantId)
                ->whereIn(
                    'purchase_order_id',
                    $purchaseOrderIds
                )
                ->orderBy('id')
                ->get([
                    'id',
                    'purchase_order_id',
                    'product_id',
                    'product_name',
                    'product_sku',
                    'unit',
                    'quantity',
                    'received_quantity',
                    'unit_cost',
                    'line_total',
                    'notes',
                ])
                ->groupBy('purchase_order_id');

        /*
        |--------------------------------------------------------------------------
        | SaaS User Names
        |--------------------------------------------------------------------------
        */

        $userIds = $orders
            ->getCollection()
            ->flatMap(
                fn ($order): array => [
                    $order->created_by,
                    $order->submitted_by,
                    $order->approved_by,
                    $order->cancelled_by,
                ]
            )
            ->filter()
            ->map(
                fn ($userId): int => (int) $userId
            )
            ->unique()
            ->values();

        $users = $this->getSaasUsers(
            $userIds
        );

        /*
        |--------------------------------------------------------------------------
        | Format Orders
        |--------------------------------------------------------------------------
        */

        $statusLabels = $this->statusLabels();

        $orders->setCollection(
            $orders
                ->getCollection()
                ->map(
                    function ($order) use (
                        $users,
                        $statusLabels,
                        $itemsByOrder
                    ): array {
                        return [
                            'id' => (int) $order->id,

                            'po_number' =>
                                $order->po_number,

                            'supplier' => [
                                'id' => (int) $order
                                    ->supplier_id,

                                'name' =>
                                    $order->supplier_name
                                    ?? 'Deleted supplier',

                                'code' =>
                                    $order->supplier_code,

                                'contact_person' =>
                                    $order
                                        ->supplier_contact_person,
                            ],

                            'branch' => [
                                'id' => (int) $order
                                    ->branch_id,

                                'name' =>
                                    $order->branch_name
                                    ?? 'Deleted branch',

                                'code' =>
                                    $order->branch_code,
                            ],

                            'warehouse' => [
                                'id' => (int) $order
                                    ->warehouse_id,

                                'name' =>
                                    $order->warehouse_name
                                    ?? 'Deleted warehouse',

                                'code' =>
                                    $order->warehouse_code,
                            ],

                            'order_date' =>
                                $order->order_date,

                            'expected_delivery_date' =>
                                $order
                                    ->expected_delivery_date,

                            'status' => $order->status,

                            'status_label' =>
                                $statusLabels[
                                    $order->status
                                ] ?? Str::headline(
                                    $order->status
                                ),

                            'payment_terms' =>
                                $order->payment_terms,

                            'subtotal' =>
                                (float) $order->subtotal,

                            'discount_amount' =>
                                (float) $order
                                    ->discount_amount,

                            'tax_amount' =>
                                (float) $order->tax_amount,

                            'shipping_amount' =>
                                (float) $order
                                    ->shipping_amount,

                            'total_amount' =>
                                (float) $order
                                    ->total_amount,

                            'notes' => $order->notes,

                            'items_count' =>
                                (int) $order->items_count,

                            'ordered_quantity' =>
                                (float) $order
                                    ->ordered_quantity,

                            'received_quantity' =>
                                (float) $order
                                    ->received_quantity,

                            'items' => collect(
                                $itemsByOrder->get(
                                    $order->id,
                                    collect()
                                )
                            )
                                ->map(
                                    fn ($item): array => [
                                        'id' =>
                                            (int) $item->id,
                                        'product_id' =>
                                            (int) $item
                                                ->product_id,
                                        'product_name' =>
                                            $item->product_name,
                                        'product_sku' =>
                                            $item->product_sku,
                                        'unit' =>
                                            $item->unit,
                                        'quantity' =>
                                            (float) $item
                                                ->quantity,
                                        'received_quantity' =>
                                            (float) $item
                                                ->received_quantity,
                                        'unit_cost' =>
                                            (float) $item
                                                ->unit_cost,
                                        'line_total' =>
                                            (float) $item
                                                ->line_total,
                                        'notes' =>
                                            $item->notes,
                                    ]
                                )
                                ->values(),

                            'created_by' =>
                                $this->formatUser(
                                    $order->created_by,
                                    $users
                                ),

                            'submitted_by' =>
                                $this->formatUser(
                                    $order->submitted_by,
                                    $users
                                ),

                            'submitted_at' =>
                                $order->submitted_at,

                            'approved_by' =>
                                $this->formatUser(
                                    $order->approved_by,
                                    $users
                                ),

                            'approved_at' =>
                                $order->approved_at,

                            'cancelled_by' =>
                                $this->formatUser(
                                    $order->cancelled_by,
                                    $users
                                ),

                            'cancelled_at' =>
                                $order->cancelled_at,

                            'created_at' =>
                                $order->created_at,

                            'updated_at' =>
                                $order->updated_at,
                        ];
                    }
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $summaryQuery = DB::connection('mysql')
            ->table('purchase_orders')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at');

        $summary = [
            'total' => (clone $summaryQuery)
                ->count(),

            'draft' => (clone $summaryQuery)
                ->where('status', 'draft')
                ->count(),

            'pending' => (clone $summaryQuery)
                ->where('status', 'pending')
                ->count(),

            'approved' => (clone $summaryQuery)
                ->where('status', 'approved')
                ->count(),

            'partially_received' =>
                (clone $summaryQuery)
                    ->where(
                        'status',
                        'partially_received'
                    )
                    ->count(),

            'received' => (clone $summaryQuery)
                ->where('status', 'received')
                ->count(),

            'cancelled' => (clone $summaryQuery)
                ->where('status', 'cancelled')
                ->count(),

            'total_value' =>
                (float) (clone $summaryQuery)
                    ->whereNot(
                        'status',
                        'cancelled'
                    )
                    ->sum('total_amount'),
        ];

        /*
        |--------------------------------------------------------------------------
        | Form and Filter Options
        |--------------------------------------------------------------------------
        */

        $suppliers = DB::connection('mysql')
            ->table('suppliers')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get([
                'id',
                'code',
                'name',
                'contact_person',
                'payment_terms',
            ]);

        $branches = DB::connection('mysql')
            ->table('branches')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get([
                'id',
                'code',
                'name',
                'is_main',
            ]);

        $warehouses = DB::connection('mysql')
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get([
                'id',
                'branch_id',
                'code',
                'name',
                'is_main',
            ]);

        $products = DB::connection('mysql')
            ->table('products')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'sku',
                'barcode',
                'unit',
                'cost_price',
            ])
            ->map(
                fn ($product): array => [
                    'id' => (int) $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'barcode' => $product->barcode,
                    'unit' => $product->unit,
                    'cost_price' =>
                        (float) $product->cost_price,
                ]
            );

        $statuses = collect(
            $statusLabels
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
        | Render
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'procurement/purchasing-orders/index',
            [
                'purchase_orders' => $orders,

                'summary' => $summary,

                'suppliers' => $suppliers,

                'branches' => $branches,

                'warehouses' => $warehouses,

                'products' => $products,

                'statuses' => $statuses,

                'filters' => [
                    'search' => $search,

                    'status' => $status,

                    'supplier_id' =>
                        $supplierId > 0
                            ? (string) $supplierId
                            : '',

                    'warehouse_id' =>
                        $warehouseId > 0
                            ? (string) $warehouseId
                            : '',

                    'date_from' =>
                        $dateFrom ?? '',

                    'date_to' =>
                        $dateTo ?? '',
                ],

                'viewer' => [
                    'user_id' =>
                        $context['user_id'],

                    'account_owner_id' =>
                        $context['account_owner_id'],

                    'role_code' =>
                        $context['role_code'],

                    'role_name' =>
                        $context['role_name'],

                    'is_owner' =>
                        $context['is_owner'],

                    'can_submit_for_approval' =>
                        true,

                    'can_approve_own_draft' =>
                        false,

                    'approval_page_url' =>
                        $context['is_owner']
                            ? '/suppliers/purchase-approvals'
                            : null,
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Store Purchase Order
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        $validated = $this->validateOrder(
            request: $request,
            tenantId: $tenantId
        );

        $prepared = $this->prepareOrder(
            validated: $validated,
            tenantId: $tenantId
        );

        $poNumber = $this->generatePoNumber(
            $tenantId
        );

        DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $validated,
                $prepared,
                $poNumber
            ): void {
                $now = now();

                $purchaseOrderId = DB::connection(
                    'mysql'
                )
                    ->table('purchase_orders')
                    ->insertGetId([
                        'tenant_id' => $tenantId,

                        'supplier_id' =>
                            (int) $validated[
                                'supplier_id'
                            ],

                        'branch_id' =>
                            (int) $validated[
                                'branch_id'
                            ],

                        'warehouse_id' =>
                            (int) $validated[
                                'warehouse_id'
                            ],

                        'po_number' => $poNumber,

                        'order_date' =>
                            $validated['order_date'],

                        'expected_delivery_date' =>
                            $validated[
                                'expected_delivery_date'
                            ] ?? null,

                        'status' => 'draft',

                        'payment_terms' =>
                            $prepared[
                                'payment_terms'
                            ],

                        'subtotal' =>
                            $prepared['subtotal'],

                        'discount_amount' =>
                            $prepared[
                                'discount_amount'
                            ],

                        'tax_amount' =>
                            $prepared['tax_amount'],

                        'shipping_amount' =>
                            $prepared[
                                'shipping_amount'
                            ],

                        'total_amount' =>
                            $prepared['total_amount'],

                        'notes' =>
                            $validated['notes']
                            ?? null,

                        'created_by' =>
                            $request->user()->id,

                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                $items = collect(
                    $prepared['items']
                )
                    ->map(
                        function (
                            array $item
                        ) use (
                            $purchaseOrderId,
                            $tenantId,
                            $now
                        ): array {
                            return [
                                'tenant_id' =>
                                    $tenantId,

                                'purchase_order_id' =>
                                    $purchaseOrderId,

                                'product_id' =>
                                    $item['product_id'],

                                'product_name' =>
                                    $item['product_name'],

                                'product_sku' =>
                                    $item['product_sku'],

                                'unit' => $item['unit'],

                                'quantity' =>
                                    $item['quantity'],

                                'received_quantity' =>
                                    0,

                                'unit_cost' =>
                                    $item['unit_cost'],

                                'line_total' =>
                                    $item['line_total'],

                                'notes' =>
                                    $item['notes'],

                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }
                    )
                    ->all();

                DB::connection('mysql')
                    ->table(
                        'purchase_order_items'
                    )
                    ->insert($items);
            }
        );

        return back()->with(
            'success',
            "Purchase order {$poNumber} created as a draft. Submit it for approval when ready."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Purchase Order
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        int $purchaseOrder
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        $order = $this->findOrder(
            tenantId: $tenantId,
            purchaseOrderId: $purchaseOrder
        );

        if ($order->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' =>
                    'Only draft purchase orders can be edited.',
            ]);
        }

        $this->authorizeDraftOwner(
            order: $order,
            context: $context,
            action: 'edit'
        );

        $validated = $this->validateOrder(
            request: $request,
            tenantId: $tenantId
        );

        $prepared = $this->prepareOrder(
            validated: $validated,
            tenantId: $tenantId
        );

        DB::connection('mysql')->transaction(
            function () use (
                $purchaseOrder,
                $validated,
                $prepared,
                $tenantId
            ): void {
                $now = now();

                DB::connection('mysql')
                    ->table('purchase_orders')
                    ->where('id', $purchaseOrder)
                    ->where('tenant_id', $tenantId)
                    ->update([
                        'supplier_id' =>
                            (int) $validated[
                                'supplier_id'
                            ],

                        'branch_id' =>
                            (int) $validated[
                                'branch_id'
                            ],

                        'warehouse_id' =>
                            (int) $validated[
                                'warehouse_id'
                            ],

                        'order_date' =>
                            $validated['order_date'],

                        'expected_delivery_date' =>
                            $validated[
                                'expected_delivery_date'
                            ] ?? null,

                        'payment_terms' =>
                            $prepared[
                                'payment_terms'
                            ],

                        'subtotal' =>
                            $prepared['subtotal'],

                        'discount_amount' =>
                            $prepared[
                                'discount_amount'
                            ],

                        'tax_amount' =>
                            $prepared['tax_amount'],

                        'shipping_amount' =>
                            $prepared[
                                'shipping_amount'
                            ],

                        'total_amount' =>
                            $prepared['total_amount'],

                        'notes' =>
                            $validated['notes']
                            ?? null,

                        'updated_at' => $now,
                    ]);

                DB::connection('mysql')
                    ->table(
                        'purchase_order_items'
                    )
                    ->where(
                        'purchase_order_id',
                        $purchaseOrder
                    )
                    ->where('tenant_id', $tenantId)
                    ->delete();

                $items = collect(
                    $prepared['items']
                )
                    ->map(
                        function (
                            array $item
                        ) use (
                            $purchaseOrder,
                            $tenantId,
                            $now
                        ): array {
                            return [
                                'tenant_id' =>
                                    $tenantId,

                                'purchase_order_id' =>
                                    $purchaseOrder,

                                'product_id' =>
                                    $item['product_id'],

                                'product_name' =>
                                    $item['product_name'],

                                'product_sku' =>
                                    $item['product_sku'],

                                'unit' => $item['unit'],

                                'quantity' =>
                                    $item['quantity'],

                                'received_quantity' =>
                                    0,

                                'unit_cost' =>
                                    $item['unit_cost'],

                                'line_total' =>
                                    $item['line_total'],

                                'notes' =>
                                    $item['notes'],

                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }
                    )
                    ->all();

                DB::connection('mysql')
                    ->table(
                        'purchase_order_items'
                    )
                    ->insert($items);
            }
        );

        return back()->with(
            'success',
            'Purchase order updated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Submit Purchase Order
    |--------------------------------------------------------------------------
    */

    public function submit(
        Request $request,
        int $purchaseOrder
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];
        $userId = $context['user_id'];

        $poNumber = DB::connection('mysql')
            ->transaction(
                function () use (
                    $context,
                    $tenantId,
                    $userId,
                    $purchaseOrder
                ): string {
                    $database = DB::connection('mysql');

                    $order = $database
                        ->table('purchase_orders')
                        ->where('id', $purchaseOrder)
                        ->where('tenant_id', $tenantId)
                        ->whereNull('deleted_at')
                        ->lockForUpdate()
                        ->first();

                    abort_if(
                        ! $order,
                        404,
                        'Purchase order not found.'
                    );

                    if ($order->status !== 'draft') {
                        throw ValidationException::withMessages([
                            'status' =>
                                'Only draft purchase orders can be submitted for approval.',
                        ]);
                    }

                    $this->authorizeDraftOwner(
                        order: $order,
                        context: $context,
                        action: 'submit'
                    );

                    $hasItems = $database
                        ->table('purchase_order_items')
                        ->where(
                            'purchase_order_id',
                            $purchaseOrder
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->exists();

                    if (! $hasItems) {
                        throw ValidationException::withMessages([
                            'items' =>
                                'Add at least one product before submitting the purchase order.',
                        ]);
                    }

                    $now = now();

                    $database
                        ->table('purchase_orders')
                        ->where('id', $purchaseOrder)
                        ->where('tenant_id', $tenantId)
                        ->update([
                            'status' => 'pending',
                            'submitted_by' => $userId,
                            'submitted_at' => $now,
                            'approved_by' => null,
                            'approved_at' => null,
                            'updated_at' => $now,
                        ]);

                    return (string) $order->po_number;
                },
                3
            );

        return back()->with(
            'success',
            "{$poNumber} submitted for approval."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Purchase Order
    |--------------------------------------------------------------------------
    */

    public function cancel(
        Request $request,
        int $purchaseOrder
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];
        $userId = $context['user_id'];

        $poNumber = DB::connection('mysql')
            ->transaction(
                function () use (
                    $context,
                    $tenantId,
                    $userId,
                    $purchaseOrder
                ): string {
                    $database = DB::connection('mysql');

                    $order = $database
                        ->table('purchase_orders')
                        ->where('id', $purchaseOrder)
                        ->where('tenant_id', $tenantId)
                        ->whereNull('deleted_at')
                        ->lockForUpdate()
                        ->first();

                    abort_if(
                        ! $order,
                        404,
                        'Purchase order not found.'
                    );

                    $allowedStatuses = $context['is_owner']
                        ? [
                            'draft',
                            'pending',
                            'approved',
                        ]
                        : [
                            'draft',
                            'pending',
                        ];

                    if (
                        ! in_array(
                            $order->status,
                            $allowedStatuses,
                            true
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'status' =>
                                'This purchase order can no longer be cancelled by your role.',
                        ]);
                    }

                    if (
                        ! $context['is_owner']
                        && (int) $order->created_by
                            !== $userId
                    ) {
                        throw ValidationException::withMessages([
                            'status' =>
                                'You may only cancel purchase orders that you created.',
                        ]);
                    }

                    $hasReceivedItems = $database
                        ->table('purchase_order_items')
                        ->where(
                            'purchase_order_id',
                            $purchaseOrder
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->where(
                            'received_quantity',
                            '>',
                            0
                        )
                        ->exists();

                    if ($hasReceivedItems) {
                        throw ValidationException::withMessages([
                            'status' =>
                                'A purchase order with received items cannot be cancelled.',
                        ]);
                    }

                    $now = now();

                    $database
                        ->table('purchase_orders')
                        ->where('id', $purchaseOrder)
                        ->where('tenant_id', $tenantId)
                        ->update([
                            'status' => 'cancelled',
                            'cancelled_by' => $userId,
                            'cancelled_at' => $now,
                            'updated_at' => $now,
                        ]);

                    return (string) $order->po_number;
                },
                3
            );

        return back()->with(
            'success',
            "{$poNumber} cancelled successfully."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Draft Purchase Order
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        int $purchaseOrder
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        $order = $this->findOrder(
            tenantId: $tenantId,
            purchaseOrderId: $purchaseOrder
        );

        if ($order->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' =>
                    'Only draft purchase orders can be deleted.',
            ]);
        }

        $this->authorizeDraftOwner(
            order: $order,
            context: $context,
            action: 'delete'
        );

        DB::connection('mysql')
            ->table('purchase_orders')
            ->where('id', $purchaseOrder)
            ->where('tenant_id', $tenantId)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        return back()->with(
            'success',
            'Purchase order deleted successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Purchase Order
    |--------------------------------------------------------------------------
    */

    private function validateOrder(
        Request $request,
        int $tenantId
    ): array {
        $validated = $request->validate([
            'supplier_id' => [
                'required',
                'integer',

                Rule::exists(
                    'suppliers',
                    'id'
                )
                    ->where(
                        fn ($query) => $query
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'is_active',
                                true
                            )
                            ->whereNull(
                                'deleted_at'
                            )
                    ),
            ],

            'branch_id' => [
                'required',
                'integer',

                Rule::exists(
                    'branches',
                    'id'
                )
                    ->where(
                        fn ($query) => $query
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'is_active',
                                true
                            )
                            ->whereNull(
                                'deleted_at'
                            )
                    ),
            ],

            'warehouse_id' => [
                'required',
                'integer',

                Rule::exists(
                    'warehouses',
                    'id'
                )
                    ->where(
                        fn ($query) => $query
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'is_active',
                                true
                            )
                            ->whereNull(
                                'deleted_at'
                            )
                    ),
            ],

            'order_date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'expected_delivery_date' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:order_date',
            ],

            'payment_terms' => [
                'nullable',
                'string',
                'max:100',
            ],

            'discount_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999999.99',
            ],

            'tax_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999999.99',
            ],

            'shipping_amount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999999.99',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.product_id' => [
                'required',
                'integer',
                'distinct',

                Rule::exists(
                    'products',
                    'id'
                )
                    ->where(
                        fn ($query) => $query
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'is_active',
                                true
                            )
                            ->whereNull(
                                'deleted_at'
                            )
                    ),
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'gt:0',
                'max:99999999999.9999',
            ],

            'items.*.unit_cost' => [
                'required',
                'numeric',
                'min:0',
                'max:999999999999.99',
            ],

            'items.*.notes' => [
                'nullable',
                'string',
                'max:500',
            ],
        ]);

        $warehouse = DB::connection('mysql')
            ->table('warehouses')
            ->where(
                'id',
                (int) $validated[
                    'warehouse_id'
                ]
            )
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->first([
                'id',
                'branch_id',
            ]);

        if (
            ! $warehouse
            || (int) $warehouse->branch_id
                !== (int) $validated['branch_id']
        ) {
            throw ValidationException::withMessages([
                'warehouse_id' =>
                    'The selected warehouse does not belong to the selected branch.',
            ]);
        }

        return $validated;
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare Totals and Item Snapshots
    |--------------------------------------------------------------------------
    */

    private function prepareOrder(
        array $validated,
        int $tenantId
    ): array {
        $productIds = collect(
            $validated['items']
        )
            ->pluck('product_id')
            ->map(
                fn ($productId): int =>
                    (int) $productId
            )
            ->unique()
            ->values();

        $products = DB::connection('mysql')
            ->table('products')
            ->where('tenant_id', $tenantId)
            ->whereIn('id', $productIds)
            ->whereNull('deleted_at')
            ->get([
                'id',
                'name',
                'sku',
                'unit',
            ])
            ->keyBy('id');

        if (
            $products->count()
            !== $productIds->count()
        ) {
            throw ValidationException::withMessages([
                'items' =>
                    'One or more selected products are unavailable.',
            ]);
        }

        $items = collect(
            $validated['items']
        )
            ->map(
                function (
                    array $item
                ) use ($products): array {
                    $product = $products->get(
                        (int) $item['product_id']
                    );

                    $quantity = round(
                        (float) $item['quantity'],
                        4
                    );

                    $unitCost = round(
                        (float) $item['unit_cost'],
                        2
                    );

                    $lineTotal = round(
                        $quantity * $unitCost,
                        2
                    );

                    return [
                        'product_id' =>
                            (int) $product->id,

                        'product_name' =>
                            $product->name,

                        'product_sku' =>
                            $product->sku,

                        'unit' =>
                            $product->unit
                            ?? 'pcs',

                        'quantity' => $quantity,

                        'unit_cost' => $unitCost,

                        'line_total' =>
                            $lineTotal,

                        'notes' =>
                            isset($item['notes'])
                                && trim(
                                    (string) $item[
                                        'notes'
                                    ]
                                ) !== ''
                                    ? trim(
                                        (string) $item[
                                            'notes'
                                        ]
                                    )
                                    : null,
                    ];
                }
            )
            ->values();

        $subtotal = round(
            (float) $items->sum(
                'line_total'
            ),
            2
        );

        $discountAmount = round(
            (float) (
                $validated['discount_amount']
                ?? 0
            ),
            2
        );

        $taxAmount = round(
            (float) (
                $validated['tax_amount']
                ?? 0
            ),
            2
        );

        $shippingAmount = round(
            (float) (
                $validated['shipping_amount']
                ?? 0
            ),
            2
        );

        if ($discountAmount > $subtotal) {
            throw ValidationException::withMessages([
                'discount_amount' =>
                    'Discount cannot be greater than the subtotal.',
            ]);
        }

        $totalAmount = round(
            $subtotal
            - $discountAmount
            + $taxAmount
            + $shippingAmount,
            2
        );

        $supplier = DB::connection('mysql')
            ->table('suppliers')
            ->where(
                'id',
                (int) $validated[
                    'supplier_id'
                ]
            )
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->first([
                'payment_terms',
            ]);

        $paymentTerms = trim(
            (string) (
                $validated['payment_terms']
                ?? ''
            )
        );

        if ($paymentTerms === '') {
            $paymentTerms = trim(
                (string) (
                    $supplier?->payment_terms
                    ?? ''
                )
            );
        }

        return [
            'items' => $items->all(),

            'subtotal' => $subtotal,

            'discount_amount' =>
                $discountAmount,

            'tax_amount' => $taxAmount,

            'shipping_amount' =>
                $shippingAmount,

            'total_amount' => $totalAmount,

            'payment_terms' =>
                $paymentTerms !== ''
                    ? $paymentTerms
                    : null,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Find Tenant Purchase Order
    |--------------------------------------------------------------------------
    */

    private function findOrder(
        int $tenantId,
        int $purchaseOrderId
    ): object {
        $order = DB::connection('mysql')
            ->table('purchase_orders')
            ->where('id', $purchaseOrderId)
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->first();

        abort_if(
            ! $order,
            404,
            'Purchase order not found.'
        );

        return $order;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate PO Number
    |--------------------------------------------------------------------------
    */

    private function generatePoNumber(
        int $tenantId
    ): string {
        do {
            $poNumber = 'PO-'
                .now()->format('Ymd')
                .'-'
                .Str::upper(
                    Str::random(6)
                );

            $exists = DB::connection('mysql')
                ->table('purchase_orders')
                ->where('tenant_id', $tenantId)
                ->where(
                    'po_number',
                    $poNumber
                )
                ->exists();
        } while ($exists);

        return $poNumber;
    }

    /*
    |--------------------------------------------------------------------------
    | SaaS Users
    |--------------------------------------------------------------------------
    */

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
                $user->name
                ?? "User #{$userId}",

            'email' =>
                $user->email
                ?? null,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Status Labels
    |--------------------------------------------------------------------------
    */

    private function statusLabels(): array
    {
        return [
            'draft' => 'Draft',
            'pending' => 'Pending Approval',
            'approved' => 'Approved',
            'partially_received' =>
                'Partially Received',
            'received' => 'Received',
            'cancelled' => 'Cancelled',
        ];
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

        return [
            'user_id' =>
                $userId,

            'account_owner_id' =>
                (int) $context->account_owner_id,

            'product_id' =>
                (int) $context->product_id,

            'subscription_id' =>
                (int) $context->subscription_id,

            'role_code' =>
                (string) $context->role_code,

            'role_name' =>
                (string) (
                    $context->role_name
                    ?: $context->role_code
                ),

            'is_owner' =>
                (bool) $context->is_owner_type,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Draft Ownership Guard
    |--------------------------------------------------------------------------
    */

    private function authorizeDraftOwner(
        object $order,
        array $context,
        string $action
    ): void {
        if ($context['is_owner']) {
            return;
        }

        if (
            (int) $order->created_by
            !== $context['user_id']
        ) {
            throw ValidationException::withMessages([
                'status' =>
                    "You may only {$action} purchase orders that you created.",
            ]);
        }
    }
}