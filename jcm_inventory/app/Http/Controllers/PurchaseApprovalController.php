<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseApprovalController extends Controller
{
    private const PRODUCT_CODE = 'JCM-INVENTORY-001';

    /**
     * Display the owner-only purchase order approval queue.
     */
    public function index(Request $request): Response
    {
        $context = $this->ownerContext($request);
        $tenantId = $context['account_owner_id'];

        $search = trim(
            (string) $request->input('search', '')
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

        $ordersQuery = DB::connection('mysql')
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
            ->where(
                'purchase_orders.status',
                'pending'
            )
            ->whereNull(
                'purchase_orders.deleted_at'
            )
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $like = "%{$search}%";

                    $query->where(
                        function ($searchQuery) use ($like): void {
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
                    'purchase_orders.submitted_at',
                    '>=',
                    $dateFrom
                )
            )
            ->when(
                $dateTo !== null,
                fn ($query) => $query->whereDate(
                    'purchase_orders.submitted_at',
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
            ->orderByRaw(
                'purchase_orders.submitted_at IS NULL'
            )
            ->orderBy(
                'purchase_orders.submitted_at'
            )
            ->orderBy(
                'purchase_orders.id'
            );

        $purchaseOrders = $ordersQuery
            ->paginate(12)
            ->withQueryString();

        $purchaseOrderIds = collect(
            $purchaseOrders->items()
        )
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $itemsByOrder = $purchaseOrderIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
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
                ->groupBy('purchase_order_id');

        $userIds = collect(
            $purchaseOrders->items()
        )
            ->flatMap(
                fn ($order): array => [
                    $order->created_by,
                    $order->submitted_by,
                    $order->approved_by,
                ]
            )
            ->filter()
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $users = $this->userDirectory($userIds);

        $purchaseOrders->setCollection(
            collect($purchaseOrders->items())
                ->map(
                    function ($order) use (
                        $itemsByOrder,
                        $users
                    ): array {
                        $items = collect(
                            $itemsByOrder->get(
                                $order->id,
                                collect()
                            )
                        )
                            ->map(
                                fn ($item): array => [
                                    'id' => (int) $item->id,
                                    'product_id' =>
                                        (int) $item->product_id,
                                    'product_name' =>
                                        (string) $item->product_name,
                                    'product_sku' =>
                                        $item->product_sku,
                                    'unit' =>
                                        (string) $item->unit,
                                    'quantity' =>
                                        (float) $item->quantity,
                                    'received_quantity' =>
                                        (float) $item
                                            ->received_quantity,
                                    'unit_cost' =>
                                        (float) $item->unit_cost,
                                    'line_total' =>
                                        (float) $item->line_total,
                                    'notes' =>
                                        $item->notes,
                                ]
                            )
                            ->values();

                        return [
                            'id' => (int) $order->id,
                            'po_number' =>
                                (string) $order->po_number,

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
                            ],

                            'branch' => [
                                'id' =>
                                    (int) $order->branch_id,
                                'name' =>
                                    (string) $order->branch_name,
                                'code' =>
                                    $order->branch_code,
                            ],

                            'warehouse' => [
                                'id' =>
                                    (int) $order->warehouse_id,
                                'name' =>
                                    (string) $order
                                        ->warehouse_name,
                                'code' =>
                                    $order->warehouse_code,
                            ],

                            'order_date' =>
                                (string) $order->order_date,
                            'expected_delivery_date' =>
                                $order->expected_delivery_date,

                            'status' =>
                                (string) $order->status,
                            'status_label' =>
                                'Awaiting Approval',

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

                            'items_count' =>
                                (int) $order->items_count,
                            'ordered_quantity' =>
                                (float) $order
                                    ->ordered_quantity,
                            'received_quantity' =>
                                (float) $order
                                    ->received_quantity,
                            'items' => $items,

                            'created_by' =>
                                $this->userReference(
                                    $order->created_by,
                                    $users
                                ),
                            'submitted_by' =>
                                $this->userReference(
                                    $order->submitted_by,
                                    $users
                                ),
                            'submitted_at' =>
                                $order->submitted_at,
                            'approved_by' =>
                                $this->userReference(
                                    $order->approved_by,
                                    $users
                                ),
                            'approved_at' =>
                                $order->approved_at,

                            'created_at' =>
                                $order->created_at,
                            'updated_at' =>
                                $order->updated_at,
                        ];
                    }
                )
                ->values()
        );

        $summaryQuery = DB::connection('mysql')
            ->table('purchase_orders')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'status',
                'pending'
            )
            ->whereNull('deleted_at');

        $pendingOrders = (int) (
            clone $summaryQuery
        )->count();

        $pendingValue = (float) (
            clone $summaryQuery
        )->sum('total_amount');

        $submittedToday = (int) (
            clone $summaryQuery
        )
            ->whereDate(
                'submitted_at',
                now()->toDateString()
            )
            ->count();

        $oldestSubmittedAt = (
            clone $summaryQuery
        )->min('submitted_at');

        $suppliers = DB::connection('mysql')
            ->table('suppliers')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'is_active',
                1
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
                    'id' => (int) $supplier->id,
                    'code' => (string) $supplier->code,
                    'name' => (string) $supplier->name,
                ]
            )
            ->values();

        $warehouses = DB::connection('mysql')
            ->table('warehouses')
            ->where(
                'tenant_id',
                $tenantId
            )
            ->where(
                'is_active',
                1
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
                    'id' => (int) $warehouse->id,
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
            'procurement/purchase-approvals/index',
            [
                'purchase_orders' =>
                    $purchaseOrders,

                'summary' => [
                    'pending_orders' =>
                        $pendingOrders,
                    'pending_value' =>
                        $pendingValue,
                    'submitted_today' =>
                        $submittedToday,
                    'oldest_submitted_at' =>
                        $oldestSubmittedAt,
                ],

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
                    'is_owner' => true,
                    'account_owner_id' =>
                        $tenantId,
                    'product_id' =>
                        $context['product_id'],
                    'subscription_id' =>
                        $context['subscription_id'],
                ],
            ]
        );
    }

    /**
     * Approve a submitted purchase order.
     */
    public function approve(
        Request $request,
        int $purchaseOrder
    ): RedirectResponse {
        $context = $this->ownerContext($request);
        $tenantId = $context['account_owner_id'];
        $userId = (int) $request->user()->id;

        $poNumber = DB::connection('mysql')
            ->transaction(
                function () use (
                    $tenantId,
                    $userId,
                    $purchaseOrder
                ): string {
                    $database = DB::connection('mysql');

                    $order = $database
                        ->table('purchase_orders')
                        ->where(
                            'id',
                            $purchaseOrder
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->whereNull(
                            'deleted_at'
                        )
                        ->lockForUpdate()
                        ->first();

                    if (! $order) {
                        throw ValidationException::withMessages([
                            'purchase_order' =>
                                'The selected purchase order was not found.',
                        ]);
                    }

                    if ($order->status !== 'pending') {
                        throw ValidationException::withMessages([
                            'purchase_order' =>
                                'Only purchase orders awaiting approval can be approved.',
                        ]);
                    }

                    $itemsCount = $database
                        ->table('purchase_order_items')
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->where(
                            'purchase_order_id',
                            $order->id
                        )
                        ->count();

                    if ($itemsCount < 1) {
                        throw ValidationException::withMessages([
                            'purchase_order' =>
                                'A purchase order without products cannot be approved.',
                        ]);
                    }

                    $now = now();

                    $database
                        ->table('purchase_orders')
                        ->where(
                            'id',
                            $order->id
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->update([
                            'status' =>
                                'approved',
                            'approved_by' =>
                                $userId,
                            'approved_at' =>
                                $now,
                            'updated_at' =>
                                $now,
                        ]);

                    return (string) $order->po_number;
                },
                3
            );

        return back()->with(
            'success',
            "{$poNumber} approved successfully and is now ready for receiving."
        );
    }

    /**
     * Return a submitted purchase order to draft for correction.
     *
     * The current database has no rejected status or rejection fields,
     * so this action safely returns the order to an editable draft.
     */
    public function returnToDraft(
        Request $request,
        int $purchaseOrder
    ): RedirectResponse {
        $context = $this->ownerContext($request);
        $tenantId = $context['account_owner_id'];

        $poNumber = DB::connection('mysql')
            ->transaction(
                function () use (
                    $tenantId,
                    $purchaseOrder
                ): string {
                    $database = DB::connection('mysql');

                    $order = $database
                        ->table('purchase_orders')
                        ->where(
                            'id',
                            $purchaseOrder
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->whereNull(
                            'deleted_at'
                        )
                        ->lockForUpdate()
                        ->first();

                    if (! $order) {
                        throw ValidationException::withMessages([
                            'purchase_order' =>
                                'The selected purchase order was not found.',
                        ]);
                    }

                    if ($order->status !== 'pending') {
                        throw ValidationException::withMessages([
                            'purchase_order' =>
                                'Only purchase orders awaiting approval can be returned to draft.',
                        ]);
                    }

                    $now = now();

                    $database
                        ->table('purchase_orders')
                        ->where(
                            'id',
                            $order->id
                        )
                        ->where(
                            'tenant_id',
                            $tenantId
                        )
                        ->update([
                            'status' =>
                                'draft',
                            'submitted_by' =>
                                null,
                            'submitted_at' =>
                                null,
                            'approved_by' =>
                                null,
                            'approved_at' =>
                                null,
                            'updated_at' =>
                                $now,
                        ]);

                    return (string) $order->po_number;
                },
                3
            );

        return back()->with(
            'success',
            "{$poNumber} returned to draft for correction."
        );
    }

    /**
     * Resolve and authorize the active JCM Inventory account owner.
     */
    private function ownerContext(
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
                'access.account_owner_id',
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
            ->where(
                'user_type.is_owner_type',
                1
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
            ])
            ->first();

        abort_unless(
            $context,
            403,
            'Only the JCM Inventory account owner can approve purchase orders.'
        );

        return [
            'account_owner_id' =>
                (int) $context->account_owner_id,
            'product_id' =>
                (int) $context->product_id,
            'subscription_id' =>
                (int) $context->subscription_id,
        ];
    }

    /**
     * Load SaaS users referenced by the operational database.
     */
    private function userDirectory(
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

    /**
     * Convert a SaaS user ID into the reference expected by Inertia.
     */
    private function userReference(
        mixed $userId,
        Collection $users
    ): ?array {
        if (! $userId) {
            return null;
        }

        $user = $users->get(
            (int) $userId
        );

        if (! $user) {
            return [
                'id' => (int) $userId,
                'name' => 'Unknown user',
                'email' => null,
            ];
        }

        return [
            'id' => (int) $user->id,
            'name' => (string) $user->name,
            'email' => $user->email,
        ];
    }

    /**
     * Accept only strict Y-m-d dates used by the page filters.
     */
    private function validDate(
        string $value
    ): ?string {
        if ($value === '') {
            return null;
        }

        try {
            $date = Carbon::createFromFormat(
                'Y-m-d',
                $value
            );
        } catch (\Throwable) {
            return null;
        }

        if (
            ! $date
            || $date->format('Y-m-d') !== $value
        ) {
            return null;
        }

        return $value;
    }
}