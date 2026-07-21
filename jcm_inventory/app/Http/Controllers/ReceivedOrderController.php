<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReceivedOrderController extends Controller
{
    private const PRODUCT_CODE =
        'JCM-INVENTORY-001';

    public function index(
        Request $request
    ): Response {
        $context = $this->userContext($request);
        $tenantId = $context['account_owner_id'];

        $search = trim(
            (string) $request->input(
                'search',
                ''
            )
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

        $postedReceiptSummary =
            $this->postedReceiptSummaryQuery(
                $tenantId
            );

        $receivedOrdersQuery =
            DB::connection('mysql')
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
                ->joinSub(
                    $postedReceiptSummary,
                    'receipt_summary',
                    function ($join): void {
                        $join->on(
                            'receipt_summary.purchase_order_id',
                            '=',
                            'purchase_orders.id'
                        );
                    }
                )
                ->where(
                    'purchase_orders.tenant_id',
                    $tenantId
                )
                ->where(
                    'purchase_orders.status',
                    'received'
                )
                ->whereNull(
                    'purchase_orders.deleted_at'
                )
                ->when(
                    $search !== '',
                    function ($query) use (
                        $search,
                        $tenantId
                    ): void {
                        $like = "%{$search}%";

                        $query->where(
                            function ($searchQuery) use (
                                $like,
                                $tenantId
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
                                    ->orWhereExists(
                                        function ($receiptQuery) use (
                                            $like,
                                            $tenantId
                                        ): void {
                                            $receiptQuery
                                                ->selectRaw('1')
                                                ->from(
                                                    'purchase_receipts'
                                                )
                                                ->whereColumn(
                                                    'purchase_receipts.purchase_order_id',
                                                    'purchase_orders.id'
                                                )
                                                ->where(
                                                    'purchase_receipts.tenant_id',
                                                    $tenantId
                                                )
                                                ->where(
                                                    function ($referenceQuery) use (
                                                        $like
                                                    ): void {
                                                        $referenceQuery
                                                            ->where(
                                                                'purchase_receipts.receipt_number',
                                                                'like',
                                                                $like
                                                            )
                                                            ->orWhere(
                                                                'purchase_receipts.delivery_reference',
                                                                'like',
                                                                $like
                                                            );
                                                    }
                                                );
                                        }
                                    );
                            }
                        );
                    }
                )
                ->when(
                    $supplierId > 0,
                    fn ($query) => $query->where(
                        'purchase_orders.supplier_id',
                        $supplierId
                    )
                )
                ->when(
                    $warehouseId > 0,
                    fn ($query) => $query->where(
                        'purchase_orders.warehouse_id',
                        $warehouseId
                    )
                )
                ->when(
                    $dateFrom !== null,
                    fn ($query) => $query->whereDate(
                        'receipt_summary.completed_date',
                        '>=',
                        $dateFrom
                    )
                )
                ->when(
                    $dateTo !== null,
                    fn ($query) => $query->whereDate(
                        'receipt_summary.completed_date',
                        '<=',
                        $dateTo
                    )
                )
                ->select([
                    'purchase_orders.id',
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
                    'purchase_orders.created_at',
                    'purchase_orders.updated_at',

                    'suppliers.name as supplier_name',
                    'suppliers.code as supplier_code',
                    'suppliers.contact_person as supplier_contact_person',
                    'suppliers.phone as supplier_phone',
                    'suppliers.email as supplier_email',

                    'branches.name as branch_name',
                    'branches.code as branch_code',

                    'warehouses.name as warehouse_name',
                    'warehouses.code as warehouse_code',

                    'receipt_summary.receipt_count',
                    'receipt_summary.first_received_date',
                    'receipt_summary.completed_date',
                    'receipt_summary.completed_at',
                    'receipt_summary.received_quantity',
                    'receipt_summary.received_value',
                ])
                ->orderByDesc(
                    'receipt_summary.completed_date'
                )
                ->orderByDesc(
                    'receipt_summary.completed_at'
                )
                ->orderByDesc(
                    'purchase_orders.id'
                );

        $receivedOrders =
            $receivedOrdersQuery
                ->paginate(12)
                ->withQueryString();

        $purchaseOrderIds = $receivedOrders
            ->getCollection()
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $orderItems = $this->getOrderItems(
            $tenantId,
            $purchaseOrderIds
        );

        $receipts = $this->getReceipts(
            $tenantId,
            $purchaseOrderIds
        );

        $receiptIds = $receipts
            ->flatten(1)
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $receiptItems = $this->getReceiptItems(
            $tenantId,
            $receiptIds
        );

        $userIds = $receivedOrders
            ->getCollection()
            ->flatMap(
                fn ($order): array => [
                    $order->created_by,
                    $order->submitted_by,
                    $order->approved_by,
                ]
            )
            ->merge(
                $receipts
                    ->flatten(1)
                    ->flatMap(
                        fn ($receipt): array => [
                            $receipt->received_by,
                            $receipt->voided_by,
                        ]
                    )
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

        $receivedOrders->setCollection(
            $receivedOrders
                ->getCollection()
                ->map(
                    function ($order) use (
                        $orderItems,
                        $receipts,
                        $receiptItems,
                        $users
                    ): array {
                        $items = $orderItems->get(
                            (int) $order->id,
                            collect()
                        );

                        $orderReceipts = $receipts->get(
                            (int) $order->id,
                            collect()
                        );

                        return [
                            'id' =>
                                (int) $order->id,

                            'po_number' =>
                                (string) $order->po_number,

                            'order_date' =>
                                $order->order_date,

                            'expected_delivery_date' =>
                                $order->expected_delivery_date,

                            'status' =>
                                (string) $order->status,

                            'status_label' =>
                                'Received',

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
                                (float) $order->total_amount,

                            'notes' =>
                                $order->notes,

                            'created_at' =>
                                $order->created_at,

                            'updated_at' =>
                                $order->updated_at,

                            'submitted_at' =>
                                $order->submitted_at,

                            'approved_at' =>
                                $order->approved_at,

                            'first_received_date' =>
                                $order->first_received_date,

                            'completed_date' =>
                                $order->completed_date,

                            'completed_at' =>
                                $order->completed_at,

                            'receipt_count' =>
                                (int) $order->receipt_count,

                            'item_count' =>
                                $items->count(),

                            'ordered_quantity' =>
                                round(
                                    (float) $items->sum(
                                        'quantity'
                                    ),
                                    3
                                ),

                            'received_quantity' =>
                                round(
                                    (float) $items->sum(
                                        'received_quantity'
                                    ),
                                    3
                                ),

                            'received_value' =>
                                (float) $order
                                    ->received_value,

                            'supplier' => [
                                'id' =>
                                    (int) $order->supplier_id,

                                'name' =>
                                    (string) $order
                                        ->supplier_name,

                                'code' =>
                                    $order->supplier_code,

                                'contact_person' =>
                                    $order
                                        ->supplier_contact_person,

                                'phone' =>
                                    $order->supplier_phone,

                                'email' =>
                                    $order->supplier_email,
                            ],

                            'branch' => [
                                'id' =>
                                    (int) $order->branch_id,

                                'name' =>
                                    (string) $order
                                        ->branch_name,

                                'code' =>
                                    $order->branch_code,
                            ],

                            'warehouse' => [
                                'id' =>
                                    (int) $order
                                        ->warehouse_id,

                                'name' =>
                                    (string) $order
                                        ->warehouse_name,

                                'code' =>
                                    $order->warehouse_code,
                            ],

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

                            'approved_by' =>
                                $this->formatUser(
                                    $order->approved_by,
                                    $users
                                ),

                            'items' =>
                                $items
                                    ->map(
                                        fn ($item): array => [
                                            'id' =>
                                                (int) $item->id,

                                            'product_id' =>
                                                (int) $item
                                                    ->product_id,

                                            'product_name' =>
                                                (string) $item
                                                    ->product_name,

                                            'product_sku' =>
                                                $item->product_sku,

                                            'unit' =>
                                                (string) $item->unit,

                                            'ordered_quantity' =>
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
                                    ->values()
                                    ->all(),

                            'receipts' =>
                                $orderReceipts
                                    ->map(
                                        function ($receipt) use (
                                            $receiptItems,
                                            $users
                                        ): array {
                                            return [
                                                'id' =>
                                                    (int) $receipt->id,

                                                'receipt_number' =>
                                                    (string) $receipt
                                                        ->receipt_number,

                                                'delivery_reference' =>
                                                    $receipt
                                                        ->delivery_reference,

                                                'received_date' =>
                                                    $receipt
                                                        ->received_date,

                                                'status' =>
                                                    (string) $receipt
                                                        ->status,

                                                'status_label' =>
                                                    $receipt->status
                                                        === 'posted'
                                                        ? 'Posted'
                                                        : 'Voided',

                                                'total_quantity' =>
                                                    (float) $receipt
                                                        ->total_quantity,

                                                'total_amount' =>
                                                    (float) $receipt
                                                        ->total_amount,

                                                'notes' =>
                                                    $receipt->notes,

                                                'posted_at' =>
                                                    $receipt->posted_at,

                                                'voided_at' =>
                                                    $receipt->voided_at,

                                                'void_reason' =>
                                                    $receipt->void_reason,

                                                'received_by' =>
                                                    $this->formatUser(
                                                        $receipt
                                                            ->received_by,
                                                        $users
                                                    ),

                                                'voided_by' =>
                                                    $this->formatUser(
                                                        $receipt
                                                            ->voided_by,
                                                        $users
                                                    ),

                                                'items' =>
                                                    $receiptItems
                                                        ->get(
                                                            (int) $receipt
                                                                ->id,
                                                            collect()
                                                        )
                                                        ->map(
                                                            fn ($item): array => [
                                                                'id' =>
                                                                    (int) $item
                                                                        ->id,

                                                                'purchase_order_item_id' =>
                                                                    (int) $item
                                                                        ->purchase_order_item_id,

                                                                'product_id' =>
                                                                    (int) $item
                                                                        ->product_id,

                                                                'product_name' =>
                                                                    (string) $item
                                                                        ->product_name,

                                                                'product_sku' =>
                                                                    $item
                                                                        ->product_sku,

                                                                'unit' =>
                                                                    (string) $item
                                                                        ->unit,

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
                                    ->values()
                                    ->all(),
                        ];
                    }
                )
        );

        $summaryQuery =
            DB::connection('mysql')
                ->table('purchase_orders')
                ->joinSub(
                    $this->postedReceiptSummaryQuery(
                        $tenantId
                    ),
                    'receipt_summary',
                    function ($join): void {
                        $join->on(
                            'receipt_summary.purchase_order_id',
                            '=',
                            'purchase_orders.id'
                        );
                    }
                )
                ->where(
                    'purchase_orders.tenant_id',
                    $tenantId
                )
                ->where(
                    'purchase_orders.status',
                    'received'
                )
                ->whereNull(
                    'purchase_orders.deleted_at'
                );

        $monthStart = Carbon::now()
            ->startOfMonth()
            ->toDateString();

        $monthEnd = Carbon::now()
            ->endOfMonth()
            ->toDateString();

        $summary = [
            'total_orders' =>
                (clone $summaryQuery)->count(),

            'total_receipts' =>
                (int) (
                    (clone $summaryQuery)
                        ->sum(
                            'receipt_summary.receipt_count'
                        )
                ),

            'received_quantity' =>
                (float) (
                    (clone $summaryQuery)
                        ->sum(
                            'receipt_summary.received_quantity'
                        )
                ),

            'received_value' =>
                (float) (
                    (clone $summaryQuery)
                        ->sum(
                            'receipt_summary.received_value'
                        )
                ),

            'completed_this_month' =>
                (clone $summaryQuery)
                    ->whereBetween(
                        'receipt_summary.completed_date',
                        [
                            $monthStart,
                            $monthEnd,
                        ]
                    )
                    ->count(),
        ];

        $suppliers = DB::connection('mysql')
            ->table('suppliers')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get([
                'id',
                'code',
                'name',
            ])
            ->map(
                fn ($supplier): array => [
                    'id' =>
                        (int) $supplier->id,

                    'code' =>
                        $supplier->code,

                    'name' =>
                        (string) $supplier->name,
                ]
            )
            ->values();

        $warehouses = DB::connection('mysql')
            ->table('warehouses')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->whereNull('deleted_at')
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get([
                'id',
                'branch_id',
                'code',
                'name',
                'is_main',
            ])
            ->map(
                fn ($warehouse): array => [
                    'id' =>
                        (int) $warehouse->id,

                    'branch_id' =>
                        (int) $warehouse->branch_id,

                    'code' =>
                        (string) $warehouse->code,

                    'name' =>
                        (string) $warehouse->name,

                    'is_main' =>
                        (bool) $warehouse->is_main,
                ]
            )
            ->values();

        return Inertia::render(
            'procurement/received-orders/index',
            [
                'received_orders' =>
                    $receivedOrders,

                'summary' =>
                    $summary,

                'suppliers' =>
                    $suppliers,

                'warehouses' =>
                    $warehouses,

                'filters' => [
                    'search' =>
                        $search,

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
                        $context[
                            'account_owner_id'
                        ],

                    'role_code' =>
                        $context['role_code'],

                    'role_name' =>
                        $context['role_name'],

                    'is_owner' =>
                        $context['is_owner'],
                ],
            ]
        );
    }

    private function postedReceiptSummaryQuery(
        int $tenantId
    ): Builder {
        return DB::connection('mysql')
            ->table('purchase_receipts')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'status',
                'posted'
            )
            ->groupBy(
                'purchase_order_id'
            )
            ->select([
                'purchase_order_id',
            ])
            ->selectRaw(
                'COUNT(*) AS receipt_count'
            )
            ->selectRaw(
                'MIN(received_date) AS first_received_date'
            )
            ->selectRaw(
                'MAX(received_date) AS completed_date'
            )
            ->selectRaw(
                'MAX(posted_at) AS completed_at'
            )
            ->selectRaw(
                'SUM(total_quantity) AS received_quantity'
            )
            ->selectRaw(
                'SUM(total_amount) AS received_value'
            );
    }

    private function getOrderItems(
        int $tenantId,
        Collection $purchaseOrderIds
    ): Collection {
        if ($purchaseOrderIds->isEmpty()) {
            return collect();
        }

        return DB::connection('mysql')
            ->table('purchase_order_items')
            ->where(
                'tenant_id',
                $tenantId
            )
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
            ->groupBy(
                'purchase_order_id'
            );
    }

    private function getReceipts(
        int $tenantId,
        Collection $purchaseOrderIds
    ): Collection {
        if ($purchaseOrderIds->isEmpty()) {
            return collect();
        }

        return DB::connection('mysql')
            ->table('purchase_receipts')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->whereIn(
                'purchase_order_id',
                $purchaseOrderIds
            )
            ->orderByDesc('received_date')
            ->orderByDesc('id')
            ->get([
                'id',
                'purchase_order_id',
                'receipt_number',
                'delivery_reference',
                'received_date',
                'status',
                'total_quantity',
                'total_amount',
                'notes',
                'received_by',
                'posted_at',
                'voided_by',
                'voided_at',
                'void_reason',
                'created_at',
                'updated_at',
            ])
            ->groupBy(
                'purchase_order_id'
            );
    }

    private function getReceiptItems(
        int $tenantId,
        Collection $receiptIds
    ): Collection {
        if ($receiptIds->isEmpty()) {
            return collect();
        }

        return DB::connection('mysql')
            ->table('purchase_receipt_items')
            ->where(
                'tenant_id',
                $tenantId
            )
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
                'product_name',
                'product_sku',
                'unit',
                'quantity_received',
                'unit_cost',
                'line_total',
                'notes',
            ])
            ->groupBy(
                'purchase_receipt_id'
            );
    }

    private function getSaasUsers(
        Collection $userIds
    ): Collection {
        if ($userIds->isEmpty()) {
            return collect();
        }

        return DB::connection('saas')
            ->table('users')
            ->whereIn(
                'id',
                $userIds
            )
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
            'id' =>
                (int) $userId,

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

            'is_owner' =>
                (bool) $context
                    ->is_owner_type,
        ];
    }
}