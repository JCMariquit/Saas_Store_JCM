<?php

namespace App\Http\Controllers;

use App\Services\Inventory\InventoryAccessContext;
use App\Services\Inventory\InventoryLedgerService;
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

    public function __construct(
        private readonly InventoryAccessContext $access,
        private readonly InventoryLedgerService $ledger
    ) {
    }

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
                ! $context['is_owner'],
                fn ($query) => $query->where(
                    'purchase_receipts.branch_id',
                    $context['branch_id']
                )
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

        $receiptItemIds = $receiptItems
            ->flatten(1)
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->values();

        $receiptItemBatches = $receiptItemIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table('purchase_receipt_item_batches as item_batch')
                ->join('stock_batches as batch', function ($join): void {
                    $join
                        ->on('batch.id', '=', 'item_batch.stock_batch_id')
                        ->on('batch.tenant_id', '=', 'item_batch.tenant_id');
                })
                ->where('item_batch.tenant_id', $tenantId)
                ->whereIn('item_batch.purchase_receipt_item_id', $receiptItemIds)
                ->orderBy('item_batch.id')
                ->get([
                    'item_batch.id',
                    'item_batch.purchase_receipt_item_id',
                    'item_batch.stock_batch_id',
                    'item_batch.stock_movement_batch_id',
                    'item_batch.void_stock_movement_batch_id',
                    'item_batch.quantity_received',
                    'item_batch.unit_cost',
                    'item_batch.line_total',
                    'batch.batch_code',
                    'batch.lot_number',
                    'batch.received_date',
                    'batch.manufactured_date',
                    'batch.expiration_date',
                    'batch.status',
                ])
                ->groupBy('purchase_receipt_item_id');

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
                        $receiptItemBatches,
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

                                        'batches' => $receiptItemBatches
                                            ->get((int) $item->id, collect())
                                            ->map(fn ($batch): array => [
                                                'id' => (int) $batch->id,
                                                'stock_batch_id' =>
                                                    (int) $batch->stock_batch_id,
                                                'batch_code' =>
                                                    $batch->batch_code,
                                                'lot_number' =>
                                                    $batch->lot_number,
                                                'quantity_received' =>
                                                    (float) $batch->quantity_received,
                                                'unit_cost' =>
                                                    (float) $batch->unit_cost,
                                                'line_total' =>
                                                    (float) $batch->line_total,
                                                'received_date' =>
                                                    $batch->received_date,
                                                'manufactured_date' =>
                                                    $batch->manufactured_date,
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

        $summaryQuery = DB::connection('mysql')
            ->table('purchase_receipts')
            ->where('tenant_id', $tenantId)
            ->when(
                ! $context['is_owner'],
                fn ($query) => $query->where(
                    'branch_id',
                    $context['branch_id']
                )
            );

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
            ->when(
                ! $context['is_owner'],
                fn ($query) => $query->where(
                    'branch_id',
                    $context['branch_id']
                )
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
            ->when(
                ! $context['is_owner'],
                fn ($query) => $query->where(
                    'purchase_orders.branch_id',
                    $context['branch_id']
                )
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
                ->table('purchase_order_items as poi')
                ->join('products as product', function ($join): void {
                    $join
                        ->on('product.tenant_id', '=', 'poi.tenant_id')
                        ->on('product.id', '=', 'poi.product_id');
                })
                ->where('poi.tenant_id', $tenantId)
                ->whereIn(
                    'poi.purchase_order_id',
                    $openOrderIds
                )
                ->whereColumn(
                    'poi.received_quantity',
                    '<',
                    'poi.quantity'
                )
                ->orderBy('poi.id')
                ->get([
                    'poi.id',
                    'poi.purchase_order_id',
                    'poi.product_id',
                    'poi.product_name',
                    'poi.product_sku',
                    'poi.unit',
                    'poi.quantity',
                    'poi.received_quantity',
                    'poi.unit_cost',
                    'poi.line_total',
                    'poi.notes',
                    'product.batch_tracking_enabled',
                    'product.batch_issue_policy',
                    'product.requires_expiration_date',
                    'product.expiry_warning_days',
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

                                    'batch_tracking_enabled' =>
                                        (bool) $item->batch_tracking_enabled,

                                    'batch_issue_policy' =>
                                        $item->batch_issue_policy,

                                    'requires_expiration_date' =>
                                        (bool) $item->requires_expiration_date,

                                    'expiry_warning_days' =>
                                        $item->expiry_warning_days !== null
                                            ? (int) $item->expiry_warning_days
                                            : null,
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

    public function store(Request $request): RedirectResponse
    {
        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];

        $validated = $request->validate([
            'purchase_order_id' => [
                'required',
                'integer',
                Rule::exists('purchase_orders', 'id')->where(
                    fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->whereIn('status', [
                            'approved',
                            'partially_received',
                        ])
                        ->whereNull('deleted_at')
                ),
            ],
            'delivery_reference' => ['nullable', 'string', 'max:120'],
            'received_date' => [
                'required',
                'date_format:Y-m-d',
                'before_or_equal:today',
            ],
            'notes' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
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
            'items.*.notes' => ['nullable', 'string', 'max:500'],
            'items.*.batch_code' => ['nullable', 'string', 'max:100'],
            'items.*.lot_number' => ['nullable', 'string', 'max:120'],
            'items.*.manufactured_date' => ['nullable', 'date_format:Y-m-d'],
            'items.*.expiration_date' => ['nullable', 'date_format:Y-m-d'],
            'items.*.batch_notes' => ['nullable', 'string', 'max:1000'],
            'items.*.batches' => ['nullable', 'array', 'min:1'],
            'items.*.batches.*.quantity' => [
                'required_with:items.*.batches',
                'numeric',
                'gt:0',
            ],
            'items.*.batches.*.batch_code' => [
                'nullable',
                'string',
                'max:100',
                'distinct',
            ],
            'items.*.batches.*.lot_number' => [
                'nullable',
                'string',
                'max:120',
            ],
            'items.*.batches.*.manufactured_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],
            'items.*.batches.*.expiration_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],
            'items.*.batches.*.notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $receiptNumber = DB::connection('mysql')->transaction(
            function () use ($request, $context, $tenantId, $validated): string {
                $database = DB::connection('mysql');
                $order = $database
                    ->table('purchase_orders')
                    ->where('id', (int) $validated['purchase_order_id'])
                    ->where('tenant_id', $tenantId)
                    ->whereNull('deleted_at')
                    ->lockForUpdate()
                    ->first();

                if (
                    ! $order
                    || ! in_array(
                        $order->status,
                        ['approved', 'partially_received'],
                        true
                    )
                ) {
                    throw ValidationException::withMessages([
                        'purchase_order_id' =>
                            'The selected purchase order is not available for receiving.',
                    ]);
                }

                $this->access->assertBranch(
                    $context,
                    (int) $order->branch_id
                );

                $warehouse = $this->ledger->lockWarehouse(
                    $tenantId,
                    (int) $order->warehouse_id
                );

                if ((int) $warehouse->branch_id !== (int) $order->branch_id) {
                    throw ValidationException::withMessages([
                        'purchase_order_id' =>
                            'The purchase order warehouse does not belong to its selected branch.',
                    ]);
                }

                $submittedItemIds = collect($validated['items'])
                    ->pluck('purchase_order_item_id')
                    ->map(fn ($id): int => (int) $id)
                    ->unique()
                    ->values();

                $orderItems = $database
                    ->table('purchase_order_items')
                    ->where('tenant_id', $tenantId)
                    ->where('purchase_order_id', $order->id)
                    ->whereIn('id', $submittedItemIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                if ($orderItems->count() !== $submittedItemIds->count()) {
                    throw ValidationException::withMessages([
                        'items' =>
                            'One or more selected items do not belong to the purchase order.',
                    ]);
                }

                $productIds = $orderItems
                    ->pluck('product_id')
                    ->map(fn ($id): int => (int) $id)
                    ->unique()
                    ->values();

                $products = $database
                    ->table('products')
                    ->where('tenant_id', $tenantId)
                    ->whereIn('id', $productIds)
                    ->whereNull('deleted_at')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                if ($products->count() !== $productIds->count()) {
                    throw ValidationException::withMessages([
                        'items' =>
                            'One or more products are no longer available.',
                    ]);
                }

                $preparedItems = collect();

                foreach ($validated['items'] as $index => $input) {
                    $orderItem = $orderItems->get(
                        (int) $input['purchase_order_item_id']
                    );
                    $product = $products->get((int) $orderItem->product_id);
                    $rawQuantity = (float) $input['quantity_received'];
                    $quantity = round($rawQuantity, 3);

                    if (abs($rawQuantity - $quantity) > 0.0000001) {
                        throw ValidationException::withMessages([
                            "items.{$index}.quantity_received" =>
                                'Quantity may only contain up to three decimal places.',
                        ]);
                    }

                    $remainingQuantity = round(
                        (float) $orderItem->quantity
                            - (float) $orderItem->received_quantity,
                        3
                    );

                    if ($remainingQuantity <= 0) {
                        throw ValidationException::withMessages([
                            "items.{$index}.quantity_received" =>
                                "{$orderItem->product_name} has already been fully received.",
                        ]);
                    }

                    if ($quantity > $remainingQuantity + 0.0001) {
                        throw ValidationException::withMessages([
                            "items.{$index}.quantity_received" =>
                                "Only {$remainingQuantity} {$orderItem->unit} remain for {$orderItem->product_name}.",
                        ]);
                    }

                    $rawBatches = collect($input['batches'] ?? [])
                        ->filter(
                            fn ($batch): bool =>
                                (float) ($batch['quantity'] ?? 0) > 0
                        )
                        ->values();

                    if ($rawBatches->isEmpty()) {
                        $rawBatches = collect([[
                            'quantity' => $quantity,
                            'batch_code' => $input['batch_code'] ?? null,
                            'lot_number' => $input['lot_number'] ?? null,
                            'manufactured_date' =>
                                $input['manufactured_date'] ?? null,
                            'expiration_date' =>
                                $input['expiration_date'] ?? null,
                            'notes' => $input['batch_notes'] ?? null,
                        ]]);
                    }

                    $batchQuantity = round(
                        (float) $rawBatches->sum(
                            fn ($batch): float =>
                                (float) ($batch['quantity'] ?? 0)
                        ),
                        3
                    );

                    if (abs($batchQuantity - $quantity) > 0.0001) {
                        throw ValidationException::withMessages([
                            "items.{$index}.batches" =>
                                'Batch quantities must exactly match the received quantity.',
                        ]);
                    }

                    if (
                        (bool) $product->batch_tracking_enabled
                        && (bool) $product->requires_expiration_date
                        && $rawBatches->contains(
                            fn ($batch): bool =>
                                blank($batch['expiration_date'] ?? null)
                        )
                    ) {
                        throw ValidationException::withMessages([
                            "items.{$index}.expiration_date" =>
                                "An expiration date is required for {$orderItem->product_name}.",
                        ]);
                    }

                    $unitCost = round((float) $orderItem->unit_cost, 4);
                    $lineTotal = round($quantity * $unitCost, 2);

                    $preparedItems->push([
                        'index' => $index,
                        'order_item' => $orderItem,
                        'product' => $product,
                        'quantity' => $quantity,
                        'unit_cost' => $unitCost,
                        'line_total' => $lineTotal,
                        'notes' => $this->nullableString(
                            $input['notes'] ?? null
                        ),
                        'layers' => $rawBatches
                            ->map(fn ($batch): array => [
                                'quantity' => round(
                                    (float) $batch['quantity'],
                                    3
                                ),
                                'unit_cost' => $unitCost,
                                'batch_code' =>
                                    $batch['batch_code'] ?? null,
                                'lot_number' =>
                                    $batch['lot_number'] ?? null,
                                'received_date' =>
                                    $validated['received_date'],
                                'manufactured_date' =>
                                    $batch['manufactured_date'] ?? null,
                                'expiration_date' =>
                                    $batch['expiration_date'] ?? null,
                                'notes' => $batch['notes'] ?? null,
                            ])
                            ->all(),
                    ]);
                }

                $totalQuantity = round(
                    (float) $preparedItems->sum('quantity'),
                    3
                );
                $totalAmount = round(
                    (float) $preparedItems->sum('line_total'),
                    2
                );
                $receiptNumber = $this->generateReceiptNumber($tenantId);
                $now = now();
                $movementDate = Carbon::parse(
                    $validated['received_date'].' '.$now->format('H:i:s')
                );
                $deliveryReference = $this->nullableString(
                    $validated['delivery_reference'] ?? null
                );
                $userId = (int) $request->user()->id;

                $receiptId = $database
                    ->table('purchase_receipts')
                    ->insertGetId([
                        'tenant_id' => $tenantId,
                        'purchase_order_id' => $order->id,
                        'supplier_id' => $order->supplier_id,
                        'branch_id' => $order->branch_id,
                        'warehouse_id' => $order->warehouse_id,
                        'receipt_number' => $receiptNumber,
                        'delivery_reference' => $deliveryReference,
                        'received_date' => $validated['received_date'],
                        'status' => 'posted',
                        'total_quantity' => $totalQuantity,
                        'total_amount' => $totalAmount,
                        'notes' => $this->nullableString(
                            $validated['notes'] ?? null
                        ),
                        'received_by' => $userId,
                        'posted_at' => $now,
                        'voided_by' => null,
                        'voided_at' => null,
                        'void_reason' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                foreach ($preparedItems as $preparedItem) {
                    $orderItem = $preparedItem['order_item'];
                    $receiptItemId = $database
                        ->table('purchase_receipt_items')
                        ->insertGetId([
                            'tenant_id' => $tenantId,
                            'purchase_receipt_id' => $receiptId,
                            'purchase_order_item_id' => $orderItem->id,
                            'product_id' => $orderItem->product_id,
                            'stock_movement_id' => null,
                            'void_stock_movement_id' => null,
                            'product_name' => $orderItem->product_name,
                            'product_sku' => $orderItem->product_sku,
                            'unit' => $orderItem->unit,
                            'quantity_received' =>
                                $preparedItem['quantity'],
                            'unit_cost' => $preparedItem['unit_cost'],
                            'line_total' => $preparedItem['line_total'],
                            'notes' => $preparedItem['notes'],
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);

                    $remarks = "Received from PO {$order->po_number}";
                    if ($deliveryReference) {
                        $remarks .=
                            " | Delivery reference: {$deliveryReference}";
                    }

                    $result = $this->ledger->postIncoming([
                        'tenant_id' => $tenantId,
                        'warehouse_id' => (int) $order->warehouse_id,
                        'product_id' => (int) $orderItem->product_id,
                        'quantity' => $preparedItem['quantity'],
                        'unit_cost' => $preparedItem['unit_cost'],
                        'movement_type' => 'purchase_receipt',
                        'reference_type' => 'purchase_receipt',
                        'reference_id' => $receiptId,
                        'reference_no' => $receiptNumber,
                        'source_type' => 'purchase_receipt',
                        'source_reference' => $receiptNumber,
                        'supplier_id' => (int) $order->supplier_id,
                        'purchase_receipt_item_id' => $receiptItemId,
                        'user_id' => $userId,
                        'movement_date' => $movementDate,
                        'remarks' => $remarks,
                        'layers' => $preparedItem['layers'],
                    ]);

                    $database
                        ->table('purchase_receipt_items')
                        ->where('tenant_id', $tenantId)
                        ->where('id', $receiptItemId)
                        ->update([
                            'stock_movement_id' => $result['movement_id'],
                            'unit_cost' => $result['unit_cost'],
                            'line_total' => $result['total_cost'],
                            'updated_at' => $now,
                        ]);

                    foreach ($result['allocations'] as $allocation) {
                        $database
                            ->table('purchase_receipt_item_batches')
                            ->insert([
                                'tenant_id' => $tenantId,
                                'purchase_receipt_item_id' => $receiptItemId,
                                'warehouse_id' => (int) $order->warehouse_id,
                                'product_id' => (int) $orderItem->product_id,
                                'stock_batch_id' =>
                                    $allocation['stock_batch_id'],
                                'stock_movement_batch_id' =>
                                    $allocation['stock_movement_batch_id'],
                                'void_stock_movement_batch_id' => null,
                                'quantity_received' =>
                                    $allocation['quantity'],
                                'unit_cost' => $allocation['unit_cost'],
                                'line_total' => $allocation['total_cost'],
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                    }

                    $database
                        ->table('purchase_order_items')
                        ->where('id', $orderItem->id)
                        ->where('tenant_id', $tenantId)
                        ->update([
                            'received_quantity' => round(
                                (float) $orderItem->received_quantity
                                    + $preparedItem['quantity'],
                                3
                            ),
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
            "Receipt {$receiptNumber} posted successfully with batch allocations."
        );
    }


    public function void(
        Request $request,
        int $receipt
    ): RedirectResponse {
        $context = $this->access->resolve($request);
        $tenantId = $context['account_owner_id'];

        abort_unless(
            $context['is_owner'],
            403,
            'Only the account owner can void posted receipts.'
        );

        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $receiptNumber = DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $receipt,
                $validated
            ): string {
                $database = DB::connection('mysql');
                $receiptRecord = $database
                    ->table('purchase_receipts')
                    ->where('id', $receipt)
                    ->where('tenant_id', $tenantId)
                    ->lockForUpdate()
                    ->first();

                if (! $receiptRecord) {
                    abort(404);
                }

                if ($receiptRecord->status !== 'posted') {
                    throw ValidationException::withMessages([
                        'receipt' => 'This receipt has already been voided.',
                    ]);
                }

                $order = $database
                    ->table('purchase_orders')
                    ->where('id', $receiptRecord->purchase_order_id)
                    ->where('tenant_id', $tenantId)
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
                    ->where('tenant_id', $tenantId)
                    ->where('purchase_receipt_id', $receiptRecord->id)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                if ($receiptItems->isEmpty()) {
                    throw ValidationException::withMessages([
                        'receipt' => 'This receipt has no items to reverse.',
                    ]);
                }

                if (
                    $receiptItems->contains(
                        fn ($item): bool =>
                            ! $item->stock_movement_id
                            || (bool) $item->void_stock_movement_id
                    )
                ) {
                    throw ValidationException::withMessages([
                        'receipt' =>
                            'This receipt has incomplete or already reversed movement links.',
                    ]);
                }

                $now = now();
                $reason = trim((string) $validated['reason']);
                $userId = (int) $request->user()->id;

                foreach ($receiptItems as $item) {
                    $result = $this->ledger->reverseMovement([
                        'tenant_id' => $tenantId,
                        'original_movement_id' =>
                            (int) $item->stock_movement_id,
                        'expected_reference_type' => 'purchase_receipt',
                        'expected_reference_id' => (int) $receiptRecord->id,
                        'movement_type' => 'purchase_receipt_void',
                        'reference_type' => 'purchase_receipt_void',
                        'reference_id' => (int) $receiptRecord->id,
                        'reference_no' => $receiptRecord->receipt_number,
                        'user_id' => $userId,
                        'movement_date' => $now,
                        'remarks' =>
                            "Void receipt {$receiptRecord->receipt_number}: {$reason}",
                    ]);

                    foreach ($result['allocations'] as $allocation) {
                        $updated = $database
                            ->table('purchase_receipt_item_batches')
                            ->where('tenant_id', $tenantId)
                            ->where('purchase_receipt_item_id', $item->id)
                            ->where(
                                'stock_movement_batch_id',
                                $allocation[
                                    'original_stock_movement_batch_id'
                                ]
                            )
                            ->whereNull('void_stock_movement_batch_id')
                            ->update([
                                'void_stock_movement_batch_id' =>
                                    $allocation['stock_movement_batch_id'],
                                'updated_at' => $now,
                            ]);

                        if ($updated !== 1) {
                            throw ValidationException::withMessages([
                                'receipt' =>
                                    "Batch links for {$item->product_name} are incomplete.",
                            ]);
                        }
                    }

                    $database
                        ->table('purchase_receipt_items')
                        ->where('tenant_id', $tenantId)
                        ->where('id', $item->id)
                        ->update([
                            'void_stock_movement_id' => $result['movement_id'],
                            'updated_at' => $now,
                        ]);

                    $orderItem = $database
                        ->table('purchase_order_items')
                        ->where('tenant_id', $tenantId)
                        ->where('id', $item->purchase_order_item_id)
                        ->where('purchase_order_id', $order->id)
                        ->lockForUpdate()
                        ->first();

                    if (! $orderItem) {
                        throw ValidationException::withMessages([
                            'receipt' =>
                                'A related purchase order item could not be found.',
                        ]);
                    }

                    $restoredReceivedQuantity = round(
                        (float) $orderItem->received_quantity
                            - (float) $item->quantity_received,
                        3
                    );

                    if ($restoredReceivedQuantity < -0.0001) {
                        throw ValidationException::withMessages([
                            'receipt' =>
                                "The received quantity for {$item->product_name} is inconsistent.",
                        ]);
                    }

                    $database
                        ->table('purchase_order_items')
                        ->where('tenant_id', $tenantId)
                        ->where('id', $orderItem->id)
                        ->update([
                            'received_quantity' =>
                                max(0, $restoredReceivedQuantity),
                            'updated_at' => $now,
                        ]);
                }

                $database
                    ->table('purchase_receipts')
                    ->where('tenant_id', $tenantId)
                    ->where('id', $receiptRecord->id)
                    ->update([
                        'status' => 'voided',
                        'voided_by' => $userId,
                        'voided_at' => $now,
                        'void_reason' => $reason,
                        'updated_at' => $now,
                    ]);

                $this->recalculatePurchaseOrderStatus(
                    $tenantId,
                    (int) $order->id,
                    $now
                );

                return (string) $receiptRecord->receipt_number;
            }
        );

        return back()->with(
            'success',
            "Receipt {$receiptNumber} was voided using exact batch reversal."
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

    private function userContext(Request $request): array
    {
        return $this->access->resolve($request);
    }

}