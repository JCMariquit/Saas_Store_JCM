<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ReceivingController extends Controller
{
    private const PRODUCT_CODE =
        'JCM-INVENTORY-001';

    public function index(Request $request): Response
    {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];
        $isOwner = $context['is_owner'];

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

        $allowedStatuses = [
            'posted',
            'voided',
        ];

        $receipts = DB::connection('mysql')
            ->table('purchase_receipts')
            ->join(
                'purchase_orders',
                function ($join): void {
                    $join
                        ->on(
                            'purchase_orders.id',
                            '=',
                            'purchase_receipts.purchase_order_id'
                        )
                        ->on(
                            'purchase_orders.tenant_id',
                            '=',
                            'purchase_receipts.tenant_id'
                        );
                }
            )
            ->join(
                'suppliers',
                function ($join): void {
                    $join
                        ->on(
                            'suppliers.id',
                            '=',
                            'purchase_receipts.supplier_id'
                        )
                        ->on(
                            'suppliers.tenant_id',
                            '=',
                            'purchase_receipts.tenant_id'
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
                            'purchase_receipts.branch_id'
                        )
                        ->on(
                            'branches.tenant_id',
                            '=',
                            'purchase_receipts.tenant_id'
                        );
                }
            )
            ->join(
                'warehouses',
                function ($join): void {
                    $join
                        ->on(
                            'warehouses.id',
                            '=',
                            'purchase_receipts.warehouse_id'
                        )
                        ->on(
                            'warehouses.tenant_id',
                            '=',
                            'purchase_receipts.tenant_id'
                        );
                }
            )
            ->where(
                'purchase_receipts.tenant_id',
                $tenantId
            )
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
                                    'purchase_receipts.receipt_number',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'purchase_receipts.delivery_reference',
                                    'like',
                                    $like
                                )
                                ->orWhere(
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
                                    'warehouses.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'purchase_receipts.notes',
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
                    'purchase_receipts.status',
                    $status
                )
            )
            ->when(
                $supplierId > 0,
                fn ($query) => $query->where(
                    'purchase_receipts.supplier_id',
                    $supplierId
                )
            )
            ->when(
                $warehouseId > 0,
                fn ($query) => $query->where(
                    'purchase_receipts.warehouse_id',
                    $warehouseId
                )
            )
            ->when(
                $dateFrom !== null,
                fn ($query) => $query->whereDate(
                    'purchase_receipts.received_date',
                    '>=',
                    $dateFrom
                )
            )
            ->when(
                $dateTo !== null,
                fn ($query) => $query->whereDate(
                    'purchase_receipts.received_date',
                    '<=',
                    $dateTo
                )
            )
            ->select([
                'purchase_receipts.id',
                'purchase_receipts.purchase_order_id',
                'purchase_receipts.supplier_id',
                'purchase_receipts.branch_id',
                'purchase_receipts.warehouse_id',
                'purchase_receipts.receipt_number',
                'purchase_receipts.delivery_reference',
                'purchase_receipts.received_date',
                'purchase_receipts.status',
                'purchase_receipts.total_quantity',
                'purchase_receipts.total_amount',
                'purchase_receipts.notes',
                'purchase_receipts.received_by',
                'purchase_receipts.posted_at',
                'purchase_receipts.voided_by',
                'purchase_receipts.voided_at',
                'purchase_receipts.void_reason',
                'purchase_receipts.created_at',
                'purchase_receipts.updated_at',

                'purchase_orders.po_number',

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
                        ->from('purchase_receipt_items')
                        ->selectRaw('COUNT(*)')
                        ->whereColumn(
                            'purchase_receipt_items.purchase_receipt_id',
                            'purchase_receipts.id'
                        );
                },
                'items_count'
            )
            ->orderByDesc(
                'purchase_receipts.received_date'
            )
            ->orderByDesc(
                'purchase_receipts.id'
            )
            ->paginate(15)
            ->withQueryString();

        $receiptIds = $receipts
            ->getCollection()
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $receiptItems = $receiptIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table('purchase_receipt_items')
                ->where('tenant_id', $tenantId)
                ->whereIn(
                    'purchase_receipt_id',
                    $receiptIds
                )
                ->orderBy('id')
                ->get([
                    'id',
                    'purchase_receipt_id',
                    'purchase_order_item_id',
                    'product_id',
                    'stock_movement_id',
                    'void_stock_movement_id',
                    'product_name',
                    'product_sku',
                    'unit',
                    'quantity_received',
                    'unit_cost',
                    'line_total',
                    'notes',
                ])
                ->groupBy('purchase_receipt_id');

        $userIds = $receipts
            ->getCollection()
            ->flatMap(
                fn ($receipt): array => [
                    $receipt->received_by,
                    $receipt->voided_by,
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

        $receipts->setCollection(
            $receipts
                ->getCollection()
                ->map(
                    function ($receipt) use (
                        $receiptItems,
                        $users,
                        $isOwner
                    ): array {
                        return [
                            'id' => (int) $receipt->id,

                            'receipt_number' =>
                                $receipt->receipt_number,

                            'delivery_reference' =>
                                $receipt->delivery_reference,

                            'received_date' =>
                                $receipt->received_date,

                            'status' =>
                                $receipt->status,

                            'status_label' =>
                                $receipt->status === 'posted'
                                    ? 'Posted'
                                    : 'Voided',

                            'can_void' =>
                                $isOwner
                                && $receipt->status === 'posted',

                            'purchase_order' => [
                                'id' => (int) $receipt
                                    ->purchase_order_id,

                                'po_number' =>
                                    $receipt->po_number,
                            ],

                            'supplier' => [
                                'id' => (int) $receipt
                                    ->supplier_id,

                                'name' =>
                                    $receipt->supplier_name,

                                'code' =>
                                    $receipt->supplier_code,

                                'contact_person' =>
                                    $receipt
                                        ->supplier_contact_person,
                            ],

                            'branch' => [
                                'id' => (int) $receipt
                                    ->branch_id,

                                'name' =>
                                    $receipt->branch_name,

                                'code' =>
                                    $receipt->branch_code,
                            ],

                            'warehouse' => [
                                'id' => (int) $receipt
                                    ->warehouse_id,

                                'name' =>
                                    $receipt->warehouse_name,

                                'code' =>
                                    $receipt->warehouse_code,
                            ],

                            'items_count' =>
                                (int) $receipt->items_count,

                            'total_quantity' =>
                                (float) $receipt
                                    ->total_quantity,

                            'total_amount' =>
                                (float) $receipt
                                    ->total_amount,

                            'notes' => $receipt->notes,

                            'posted_at' =>
                                $receipt->posted_at,

                            'received_by' =>
                                $this->formatUser(
                                    $receipt->received_by,
                                    $users
                                ),

                            'voided_by' =>
                                $this->formatUser(
                                    $receipt->voided_by,
                                    $users
                                ),

                            'voided_at' =>
                                $receipt->voided_at,

                            'void_reason' =>
                                $receipt->void_reason,

                            'created_at' =>
                                $receipt->created_at,

                            'updated_at' =>
                                $receipt->updated_at,

                            'items' => $receiptItems
                                ->get(
                                    (int) $receipt->id,
                                    collect()
                                )
                                ->map(
                                    fn ($item): array => [
                                        'id' =>
                                            (int) $item->id,

                                        'purchase_order_item_id' =>
                                            (int) $item
                                                ->purchase_order_item_id,

                                        'product_id' =>
                                            (int) $item
                                                ->product_id,

                                        'stock_movement_id' =>
                                            $item->stock_movement_id
                                                ? (int) $item
                                                    ->stock_movement_id
                                                : null,

                                        'void_stock_movement_id' =>
                                            $item->void_stock_movement_id
                                                ? (int) $item
                                                    ->void_stock_movement_id
                                                : null,

                                        'product_name' =>
                                            $item->product_name,

                                        'product_sku' =>
                                            $item->product_sku,

                                        'unit' =>
                                            $item->unit,

                                        'quantity_received' =>
                                            (float) $item
                                                ->quantity_received,

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
                                ->values()
                                ->all(),
                        ];
                    }
                )
        );

        $summaryQuery = DB::connection('mysql')
            ->table('purchase_receipts')
            ->where('tenant_id', $tenantId);

        $summary = [
            'total' => (clone $summaryQuery)
                ->count(),

            'posted' => (clone $summaryQuery)
                ->where('status', 'posted')
                ->count(),

            'voided' => (clone $summaryQuery)
                ->where('status', 'voided')
                ->count(),

            'received_quantity' =>
                (float) (clone $summaryQuery)
                    ->where('status', 'posted')
                    ->sum('total_quantity'),

            'received_value' =>
                (float) (clone $summaryQuery)
                    ->where('status', 'posted')
                    ->sum('total_amount'),
        ];

        $suppliers = DB::connection('mysql')
            ->table('suppliers')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get([
                'id',
                'code',
                'name',
            ]);

        $warehouses = DB::connection('mysql')
            ->table('warehouses')
            ->where('tenant_id', $tenantId)
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

        $openOrders = DB::connection('mysql')
            ->table('purchase_orders')
            ->join(
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
            ->join(
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
            ->join(
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
            ->whereIn(
                'purchase_orders.status',
                [
                    'approved',
                    'partially_received',
                ]
            )
            ->orderByDesc(
                'purchase_orders.order_date'
            )
            ->orderByDesc(
                'purchase_orders.id'
            )
            ->get([
                'purchase_orders.id',
                'purchase_orders.po_number',
                'purchase_orders.supplier_id',
                'purchase_orders.branch_id',
                'purchase_orders.warehouse_id',
                'purchase_orders.order_date',
                'purchase_orders.expected_delivery_date',
                'purchase_orders.status',
                'purchase_orders.total_amount',

                'suppliers.name as supplier_name',
                'suppliers.code as supplier_code',

                'branches.name as branch_name',
                'branches.code as branch_code',

                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
            ]);

        $openOrderIds = $openOrders
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $openOrderItems = $openOrderIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table('purchase_order_items')
                ->where('tenant_id', $tenantId)
                ->whereIn(
                    'purchase_order_id',
                    $openOrderIds
                )
                ->whereColumn(
                    'received_quantity',
                    '<',
                    'quantity'
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

        $purchaseOrders = $openOrders
            ->map(
                function ($order) use (
                    $openOrderItems
                ): array {
                    $items = $openOrderItems
                        ->get(
                            (int) $order->id,
                            collect()
                        )
                        ->map(
                            function ($item): array {
                                $remaining = round(
                                    (float) $item->quantity
                                    - (float) $item
                                        ->received_quantity,
                                    3
                                );

                                return [
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

                                    'ordered_quantity' =>
                                        (float) $item
                                            ->quantity,

                                    'received_quantity' =>
                                        (float) $item
                                            ->received_quantity,

                                    'remaining_quantity' =>
                                        max($remaining, 0),

                                    'unit_cost' =>
                                        (float) $item
                                            ->unit_cost,

                                    'notes' =>
                                        $item->notes,
                                ];
                            }
                        )
                        ->filter(
                            fn (array $item): bool =>
                                $item[
                                    'remaining_quantity'
                                ] > 0
                        )
                        ->values();

                    return [
                        'id' => (int) $order->id,

                        'po_number' =>
                            $order->po_number,

                        'order_date' =>
                            $order->order_date,

                        'expected_delivery_date' =>
                            $order
                                ->expected_delivery_date,

                        'status' => $order->status,

                        'total_amount' =>
                            (float) $order
                                ->total_amount,

                        'supplier' => [
                            'id' => (int) $order
                                ->supplier_id,

                            'name' =>
                                $order->supplier_name,

                            'code' =>
                                $order->supplier_code,
                        ],

                        'branch' => [
                            'id' => (int) $order
                                ->branch_id,

                            'name' =>
                                $order->branch_name,

                            'code' =>
                                $order->branch_code,
                        ],

                        'warehouse' => [
                            'id' => (int) $order
                                ->warehouse_id,

                            'name' =>
                                $order->warehouse_name,

                            'code' =>
                                $order->warehouse_code,
                        ],

                        'items' => $items->all(),
                    ];
                }
            )
            ->filter(
                fn (array $order): bool =>
                    count($order['items']) > 0
            )
            ->values();

        return Inertia::render(
            'procurement/receiving/index',
            [
                'receipts' => $receipts,

                'summary' => $summary,

                'suppliers' => $suppliers,

                'warehouses' => $warehouses,

                'purchase_orders' =>
                    $purchaseOrders,

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
            ]
        );
    }

    public function store(
        Request $request
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        $validated = $request->validate([
            'purchase_order_id' => [
                'required',
                'integer',
                Rule::exists(
                    'purchase_orders',
                    'id'
                )->where(
                    fn ($query) => $query
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->whereIn(
                            'status',
                            [
                                'approved',
                                'partially_received',
                            ]
                        )
                        ->whereNull('deleted_at')
                ),
            ],
            'delivery_reference' => [
                'nullable',
                'string',
                'max:120',
            ],
            'received_date' => [
                'required',
                'date_format:Y-m-d',
                'before_or_equal:today',
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
            'items.*.purchase_order_item_id' => [
                'required',
                'integer',
                'distinct',
            ],
            'items.*.quantity_received' => [
                'required',
                'numeric',
                'gt:0',
                'max:99999999999.999',
            ],
            'items.*.notes' => [
                'nullable',
                'string',
                'max:500',
            ],
        ]);

        $receiptNumber = DB::connection('mysql')
            ->transaction(
                function () use (
                    $request,
                    $tenantId,
                    $validated
                ): string {
                    $database = DB::connection('mysql');

                    $order = $database
                        ->table('purchase_orders')
                        ->where(
                            'id',
                            (int) $validated[
                                'purchase_order_id'
                            ]
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->whereNull('deleted_at')
                        ->lockForUpdate()
                        ->first();

                    if (
                        ! $order
                        || ! in_array(
                            $order->status,
                            [
                                'approved',
                                'partially_received',
                            ],
                            true
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'purchase_order_id' =>
                                'The selected purchase order is not available for receiving.',
                        ]);
                    }

                    $submittedItemIds = collect(
                        $validated['items']
                    )
                        ->pluck('purchase_order_item_id')
                        ->map(
                            fn ($id): int => (int) $id
                        )
                        ->unique()
                        ->values();

                    $orderItems = $database
                        ->table('purchase_order_items')
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->where(
                            'purchase_order_id',
                            $order->id
                        )
                        ->whereIn(
                            'id',
                            $submittedItemIds
                        )
                        ->lockForUpdate()
                        ->get()
                        ->keyBy('id');

                    if (
                        $orderItems->count()
                        !== $submittedItemIds->count()
                    ) {
                        throw ValidationException::withMessages([
                            'items' =>
                                'One or more selected items do not belong to the purchase order.',
                        ]);
                    }

                    $preparedItems = collect();

                    foreach (
                        $validated['items'] as $index => $input
                    ) {
                        $orderItem = $orderItems->get(
                            (int) $input[
                                'purchase_order_item_id'
                            ]
                        );

                        $rawQuantity = (float) $input[
                            'quantity_received'
                        ];

                        $quantity = round(
                            $rawQuantity,
                            3
                        );

                        if (
                            abs(
                                $rawQuantity - $quantity
                            ) > 0.0000001
                        ) {
                            throw ValidationException::withMessages([
                                "items.{$index}.quantity_received" =>
                                    'Quantity may only contain up to three decimal places.',
                            ]);
                        }

                        $remainingQuantity = round(
                            (float) $orderItem->quantity
                            - (float) $orderItem
                                ->received_quantity,
                            3
                        );

                        if ($remainingQuantity <= 0) {
                            throw ValidationException::withMessages([
                                "items.{$index}.quantity_received" =>
                                    "{$orderItem->product_name} has already been fully received.",
                            ]);
                        }

                        if ($quantity > $remainingQuantity) {
                            throw ValidationException::withMessages([
                                "items.{$index}.quantity_received" =>
                                    "Only {$remainingQuantity} {$orderItem->unit} remain for {$orderItem->product_name}.",
                            ]);
                        }

                        $unitCost = round(
                            (float) $orderItem->unit_cost,
                            4
                        );

                        $lineTotal = round(
                            $quantity * $unitCost,
                            2
                        );

                        $preparedItems->push([
                            'order_item' => $orderItem,
                            'quantity' => $quantity,
                            'unit_cost' => $unitCost,
                            'line_total' => $lineTotal,
                            'notes' => $this->nullableString(
                                $input['notes'] ?? null
                            ),
                        ]);
                    }

                    $totalQuantity = round(
                        (float) $preparedItems->sum(
                            'quantity'
                        ),
                        3
                    );

                    $totalAmount = round(
                        (float) $preparedItems->sum(
                            'line_total'
                        ),
                        2
                    );

                    $receiptNumber =
                        $this->generateReceiptNumber(
                            $tenantId
                        );

                    $now = now();

                    $movementDate = Carbon::parse(
                        $validated['received_date']
                        .' '
                        .$now->format('H:i:s')
                    );

                    $deliveryReference =
                        $this->nullableString(
                            $validated[
                                'delivery_reference'
                            ] ?? null
                        );

                    $receiptId = $database
                        ->table('purchase_receipts')
                        ->insertGetId([
                            'tenant_id' => $tenantId,
                            'purchase_order_id' =>
                                $order->id,
                            'supplier_id' =>
                                $order->supplier_id,
                            'branch_id' =>
                                $order->branch_id,
                            'warehouse_id' =>
                                $order->warehouse_id,
                            'receipt_number' =>
                                $receiptNumber,
                            'delivery_reference' =>
                                $deliveryReference,
                            'received_date' =>
                                $validated['received_date'],
                            'status' => 'posted',
                            'total_quantity' =>
                                $totalQuantity,
                            'total_amount' =>
                                $totalAmount,
                            'notes' =>
                                $this->nullableString(
                                    $validated['notes']
                                    ?? null
                                ),
                            'received_by' =>
                                $request->user()->id,
                            'posted_at' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);

                    foreach (
                        $preparedItems as $preparedItem
                    ) {
                        $orderItem =
                            $preparedItem['order_item'];

                        $quantity =
                            $preparedItem['quantity'];

                        $unitCost =
                            $preparedItem['unit_cost'];

                        $lineTotal =
                            $preparedItem['line_total'];

                        $database
                            ->table('warehouse_stocks')
                            ->insertOrIgnore([
                                'tenant_id' => $tenantId,
                                'warehouse_id' =>
                                    $order->warehouse_id,
                                'product_id' =>
                                    $orderItem->product_id,
                                'quantity' => 0,
                                'reorder_level' => 0,
                                'average_cost' => 0,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                        $stock = $database
                            ->table('warehouse_stocks')
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->where(
                                'warehouse_id',
                                $order->warehouse_id
                            )
                            ->where(
                                'product_id',
                                $orderItem->product_id
                            )
                            ->lockForUpdate()
                            ->first();

                        if (! $stock) {
                            throw ValidationException::withMessages([
                                'items' =>
                                    'Unable to prepare the warehouse stock record.',
                            ]);
                        }

                        $quantityBefore = round(
                            (float) $stock->quantity,
                            3
                        );

                        $quantityAfter = round(
                            $quantityBefore + $quantity,
                            3
                        );

                        $averageCostBefore = round(
                            (float) $stock->average_cost,
                            4
                        );

                        $previousValue =
                            $quantityBefore
                            * $averageCostBefore;

                        $receivedValue =
                            $quantity
                            * $unitCost;

                        $averageCostAfter =
                            $quantityAfter > 0
                                ? round(
                                    (
                                        $previousValue
                                        + $receivedValue
                                    ) / $quantityAfter,
                                    4
                                )
                                : 0;

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
                                    $quantityAfter,
                                'average_cost' =>
                                    $averageCostAfter,
                                'last_movement_at' =>
                                    $movementDate,
                                'updated_at' => $now,
                            ]);

                        $remarks =
                            "Received from PO {$order->po_number}";

                        if ($deliveryReference) {
                            $remarks .=
                                " | Delivery reference: {$deliveryReference}";
                        }

                        $movementId = $database
                            ->table('stock_movements')
                            ->insertGetId([
                                'tenant_id' => $tenantId,
                                'warehouse_id' =>
                                    $order->warehouse_id,
                                'product_id' =>
                                    $orderItem->product_id,
                                'movement_type' =>
                                    'purchase_receipt',
                                'quantity' => $quantity,
                                'quantity_before' =>
                                    $quantityBefore,
                                'quantity_after' =>
                                    $quantityAfter,
                                'unit_cost' => $unitCost,
                                'total_cost' => $lineTotal,
                                'average_cost_before' =>
                                    $averageCostBefore,
                                'average_cost_after' =>
                                    $averageCostAfter,
                                'reference_type' =>
                                    'purchase_receipt',
                                'reference_id' =>
                                    $receiptId,
                                'reference_no' =>
                                    $receiptNumber,
                                'related_warehouse_id' =>
                                    null,
                                'reversal_of_movement_id' =>
                                    null,
                                'remarks' => $remarks,
                                'movement_date' =>
                                    $movementDate,
                                'created_by' =>
                                    $request->user()->id,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                        $database
                            ->table(
                                'purchase_receipt_items'
                            )
                            ->insert([
                                'tenant_id' => $tenantId,
                                'purchase_receipt_id' =>
                                    $receiptId,
                                'purchase_order_item_id' =>
                                    $orderItem->id,
                                'product_id' =>
                                    $orderItem->product_id,
                                'stock_movement_id' =>
                                    $movementId,
                                'void_stock_movement_id' =>
                                    null,
                                'product_name' =>
                                    $orderItem->product_name,
                                'product_sku' =>
                                    $orderItem->product_sku,
                                'unit' =>
                                    $orderItem->unit,
                                'quantity_received' =>
                                    $quantity,
                                'unit_cost' =>
                                    $unitCost,
                                'line_total' =>
                                    $lineTotal,
                                'notes' =>
                                    $preparedItem['notes'],
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                        $newReceivedQuantity = round(
                            (float) $orderItem
                                ->received_quantity
                            + $quantity,
                            3
                        );

                        $database
                            ->table('purchase_order_items')
                            ->where(
                                'id',
                                $orderItem->id
                            )
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->update([
                                'received_quantity' =>
                                    $newReceivedQuantity,
                                'updated_at' => $now,
                            ]);
                    }

                    $this->recalculatePurchaseOrderStatus(
                        $tenantId,
                        (int) $order->id,
                        $now
                    );

                    return $receiptNumber;
                }
            );

        return back()->with(
            'success',
            "Receipt {$receiptNumber} posted successfully."
        );
    }

    public function void(
        Request $request,
        int $receipt
    ): RedirectResponse {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        abort_unless(
            $context['is_owner'],
            403,
            'Only the account owner can void posted receipts.'
        );

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'min:3',
                'max:1000',
            ],
        ]);

        $receiptNumber = DB::connection('mysql')
            ->transaction(
                function () use (
                    $request,
                    $tenantId,
                    $receipt,
                    $validated
                ): string {
                    $database = DB::connection('mysql');

                    $receiptRecord = $database
                        ->table('purchase_receipts')
                        ->where(
                            'id',
                            $receipt
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->lockForUpdate()
                        ->first();

                    if (! $receiptRecord) {
                        abort(404);
                    }

                    if (
                        $receiptRecord->status !== 'posted'
                    ) {
                        throw ValidationException::withMessages([
                            'receipt' =>
                                'This receipt has already been voided.',
                        ]);
                    }

                    $order = $database
                        ->table('purchase_orders')
                        ->where(
                            'id',
                            $receiptRecord
                                ->purchase_order_id
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->lockForUpdate()
                        ->first();

                    if (! $order) {
                        throw ValidationException::withMessages([
                            'receipt' =>
                                'The related purchase order could not be found.',
                        ]);
                    }

                    $receiptItems = $database
                        ->table('purchase_receipt_items')
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->where(
                            'purchase_receipt_id',
                            $receiptRecord->id
                        )
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->get();

                    if ($receiptItems->isEmpty()) {
                        throw ValidationException::withMessages([
                            'receipt' =>
                                'This receipt has no items to reverse.',
                        ]);
                    }

                    if (
                        $receiptItems->contains(
                            fn ($item): bool =>
                                ! $item->stock_movement_id
                                || $item
                                    ->void_stock_movement_id
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'receipt' =>
                                'This receipt cannot be safely voided because its movement links are incomplete or already reversed.',
                        ]);
                    }

                    $movementIds = $receiptItems
                        ->pluck('stock_movement_id')
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
                            'receipt' =>
                                'One or more original stock movements could not be found.',
                        ]);
                    }

                    $orderItemIds = $receiptItems
                        ->pluck('purchase_order_item_id')
                        ->map(
                            fn ($id): int => (int) $id
                        )
                        ->unique()
                        ->values();

                    $orderItems = $database
                        ->table('purchase_order_items')
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->where(
                            'purchase_order_id',
                            $order->id
                        )
                        ->whereIn(
                            'id',
                            $orderItemIds
                        )
                        ->lockForUpdate()
                        ->get()
                        ->keyBy('id');

                    if (
                        $orderItems->count()
                        !== $orderItemIds->count()
                    ) {
                        throw ValidationException::withMessages([
                            'receipt' =>
                                'One or more purchase order items could not be found.',
                        ]);
                    }

                    $now = now();
                    $reason = trim(
                        (string) $validated['reason']
                    );

                    foreach ($receiptItems as $item) {
                        $movement = $movements->get(
                            (int) $item
                                ->stock_movement_id
                        );

                        if (
                            ! $movement
                            || $movement->movement_type
                                !== 'purchase_receipt'
                            || $movement->reference_type
                                !== 'purchase_receipt'
                            || (int) $movement->reference_id
                                !== (int) $receiptRecord->id
                            || (int) $movement->warehouse_id
                                !== (int) $receiptRecord
                                    ->warehouse_id
                            || (int) $movement->product_id
                                !== (int) $item->product_id
                            || $movement
                                ->average_cost_before === null
                            || $movement
                                ->average_cost_after === null
                        ) {
                            throw ValidationException::withMessages([
                                'receipt' =>
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
                                'receipt' =>
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
                                'receipt' =>
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
                                'receipt' =>
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
                                'receipt' =>
                                    "Current stock for {$item->product_name} no longer matches the posted receipt state.",
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
                                'last_movement_at' => $now,
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
                                    'purchase_receipt_void',
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
                                    'purchase_receipt_void',
                                'reference_id' =>
                                    $receiptRecord->id,
                                'reference_no' =>
                                    $receiptRecord
                                        ->receipt_number,
                                'related_warehouse_id' =>
                                    null,
                                'reversal_of_movement_id' =>
                                    $movement->id,
                                'remarks' =>
                                    "Voided receipt {$receiptRecord->receipt_number}: {$reason}",
                                'movement_date' => $now,
                                'created_by' =>
                                    $request->user()->id,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                        $database
                            ->table(
                                'purchase_receipt_items'
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

                        $orderItem = $orderItems->get(
                            (int) $item
                                ->purchase_order_item_id
                        );

                        $newReceivedQuantity = max(
                            round(
                                (float) $orderItem
                                    ->received_quantity
                                - (float) $item
                                    ->quantity_received,
                                3
                            ),
                            0
                        );

                        $database
                            ->table('purchase_order_items')
                            ->where(
                                'id',
                                $orderItem->id
                            )
                            ->where(
                                'tenant_id',
                                $tenantId
                            )
                            ->update([
                                'received_quantity' =>
                                    $newReceivedQuantity,
                                'updated_at' => $now,
                            ]);
                    }

                    $database
                        ->table('purchase_receipts')
                        ->where(
                            'id',
                            $receiptRecord->id
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
                            'void_reason' => $reason,
                            'updated_at' => $now,
                        ]);

                    $this->recalculatePurchaseOrderStatus(
                        $tenantId,
                        (int) $order->id,
                        $now
                    );

                    return $receiptRecord
                        ->receipt_number;
                }
            );

        return back()->with(
            'success',
            "Receipt {$receiptNumber} was voided and its stock was safely reversed."
        );
    }

    private function recalculatePurchaseOrderStatus(
        int $tenantId,
        int $purchaseOrderId,
        mixed $updatedAt
    ): void {
        $items = DB::connection('mysql')
            ->table('purchase_order_items')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'purchase_order_id',
                $purchaseOrderId
            )
            ->get([
                'quantity',
                'received_quantity',
            ]);

        if ($items->isEmpty()) {
            return;
        }

        $allReceived = $items->every(
            fn ($item): bool =>
                (float) $item->received_quantity
                >= (float) $item->quantity
            );

        $hasReceived = $items->contains(
            fn ($item): bool =>
                (float) $item->received_quantity > 0
        );

        $status = $allReceived
            ? 'received'
            : ($hasReceived
                ? 'partially_received'
                : 'approved');

        DB::connection('mysql')
            ->table('purchase_orders')
            ->where(
                'id',
                $purchaseOrderId
            )
            ->where(
                'tenant_id',
                $tenantId
            )
            ->update([
                'status' => $status,
                'updated_at' => $updatedAt,
            ]);
    }

    private function almostEqual(
        float $first,
        float $second,
        float $tolerance
    ): bool {
        return abs($first - $second)
            <= $tolerance;
    }

    private function generateReceiptNumber(
        int $tenantId
    ): string {
        do {
            $receiptNumber =
                'RCV-'
                .now()->format('Ymd')
                .'-'
                .Str::upper(
                    Str::random(6)
                );

            $exists = DB::connection('mysql')
                ->table('purchase_receipts')
                ->where(
                    'tenant_id',
                    $tenantId
                )
                ->where(
                    'receipt_number',
                    $receiptNumber
                )
                ->exists();
        } while ($exists);

        return $receiptNumber;
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
            || $date->format('Y-m-d') !== $value
        ) {
            return null;
        }

        return $value;
    }

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
}