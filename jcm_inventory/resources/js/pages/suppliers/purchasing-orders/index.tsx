import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    Ban,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    LoaderCircle,
    PackageCheck,
    Pencil,
    Plus,
    Search,
    Send,
    ShoppingCart,
    Trash2,
    Truck,
    Warehouse,
    X,
    XCircle,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useMemo,
    useState,
} from 'react';

type UserReference = {
    id: number;
    name: string;
    email: string | null;
};

type SupplierOption = {
    id: number;
    code: string;
    name: string;
    contact_person: string | null;
    payment_terms: string | null;
};

type BranchOption = {
    id: number;
    code: string;
    name: string;
    is_main: boolean;
};

type WarehouseOption = {
    id: number;
    branch_id: number;
    code: string;
    name: string;
    is_main: boolean;
};

type ProductOption = {
    id: number;
    name: string;
    sku: string | null;
    barcode: string | null;
    unit: string;
    cost_price: number;
};

type StatusOption = {
    value: string;
    label: string;
};

type PurchaseOrderItem = {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string | null;
    unit: string;
    quantity: number;
    received_quantity: number;
    unit_cost: number;
    line_total: number;
    notes: string | null;
};

type PurchaseOrder = {
    id: number;
    po_number: string;

    supplier: {
        id: number;
        name: string;
        code: string | null;
        contact_person: string | null;
    };

    branch: {
        id: number;
        name: string;
        code: string | null;
    };

    warehouse: {
        id: number;
        name: string;
        code: string | null;
    };

    order_date: string;
    expected_delivery_date: string | null;

    status: string;
    status_label: string;

    payment_terms: string | null;

    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    shipping_amount: number;
    total_amount: number;

    notes: string | null;

    items_count: number;
    ordered_quantity: number;
    received_quantity: number;

    items?: PurchaseOrderItem[];

    created_by: UserReference | null;
    submitted_by: UserReference | null;
    submitted_at: string | null;
    approved_by: UserReference | null;
    approved_at: string | null;
    cancelled_by: UserReference | null;
    cancelled_at: string | null;

    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedPurchaseOrders = {
    current_page: number;
    data: PurchaseOrder[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type PurchaseOrderSummary = {
    total: number;
    draft: number;
    pending: number;
    approved: number;
    partially_received: number;
    received: number;
    cancelled: number;
    total_value: number;
};

type PurchaseOrderFilters = {
    search: string;
    status: string;
    supplier_id: string;
    warehouse_id: string;
    date_from: string;
    date_to: string;
};

type PurchaseOrderFormItem = {
    product_id: string;
    quantity: string;
    unit_cost: string;
    notes: string;
};

type PurchaseOrderFormData = {
    supplier_id: string;
    branch_id: string;
    warehouse_id: string;
    order_date: string;
    expected_delivery_date: string;
    payment_terms: string;
    discount_amount: string;
    tax_amount: string;
    shipping_amount: string;
    notes: string;
    items: PurchaseOrderFormItem[];
};

type PurchaseOrderPageProps = {
    purchase_orders: PaginatedPurchaseOrders;
    summary: PurchaseOrderSummary;
    suppliers: SupplierOption[];
    branches: BranchOption[];
    warehouses: WarehouseOption[];
    products: ProductOption[];
    statuses: StatusOption[];
    filters: PurchaseOrderFilters;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Suppliers',
        href: '/suppliers',
    },
    {
        title: 'Purchase Orders',
        href: '/suppliers/purchase-orders',
    },
];

function todayDate(): string {
    const date = new Date();
    const timezoneOffset =
        date.getTimezoneOffset() * 60_000;

    return new Date(
        date.getTime() - timezoneOffset,
    )
        .toISOString()
        .slice(0, 10);
}

function emptyItem(): PurchaseOrderFormItem {
    return {
        product_id: '',
        quantity: '1',
        unit_cost: '',
        notes: '',
    };
}

function emptyOrderForm(): PurchaseOrderFormData {
    return {
        supplier_id: '',
        branch_id: '',
        warehouse_id: '',
        order_date: todayDate(),
        expected_delivery_date: '',
        payment_terms: '',
        discount_amount: '',
        tax_amount: '',
        shipping_amount: '',
        notes: '',
        items: [emptyItem()],
    };
}

export default function PurchaseOrderIndex({
    purchase_orders,
    summary,
    suppliers,
    branches,
    warehouses,
    products,
    statuses,
    filters,
}: PurchaseOrderPageProps) {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [
        editingPurchaseOrder,
        setEditingPurchaseOrder,
    ] = useState<PurchaseOrder | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [supplierId, setSupplierId] =
        useState(filters.supplier_id ?? '');

    const [warehouseId, setWarehouseId] =
        useState(filters.warehouse_id ?? '');

    const [dateFrom, setDateFrom] = useState(
        filters.date_from ?? '',
    );

    const [dateTo, setDateTo] = useState(
        filters.date_to ?? '',
    );

    const form = useForm<PurchaseOrderFormData>(
        emptyOrderForm(),
    );

    const modalWarehouses = useMemo(() => {
        if (!form.data.branch_id) {
            return [];
        }

        return warehouses.filter(
            (warehouse) =>
                String(warehouse.branch_id) ===
                form.data.branch_id,
        );
    }, [form.data.branch_id, warehouses]);

    const formSubtotal = useMemo(() => {
        return form.data.items.reduce(
            (total, item) => {
                const quantity = Number(
                    item.quantity || 0,
                );

                const unitCost = Number(
                    item.unit_cost || 0,
                );

                if (
                    !Number.isFinite(quantity) ||
                    !Number.isFinite(unitCost)
                ) {
                    return total;
                }

                return (
                    total + quantity * unitCost
                );
            },
            0,
        );
    }, [form.data.items]);

    const formDiscount = Number(
        form.data.discount_amount || 0,
    );

    const formTax = Number(
        form.data.tax_amount || 0,
    );

    const formShipping = Number(
        form.data.shipping_amount || 0,
    );

    const formTotal =
        formSubtotal -
        (Number.isFinite(formDiscount)
            ? formDiscount
            : 0) +
        (Number.isFinite(formTax) ? formTax : 0) +
        (Number.isFinite(formShipping)
            ? formShipping
            : 0);

    function openCreateModal(): void {
        setEditingPurchaseOrder(null);

        form.clearErrors();
        form.setData(emptyOrderForm());

        setIsModalOpen(true);
    }

    function openEditModal(
        purchaseOrder: PurchaseOrder,
    ): void {
        if (
            !purchaseOrder.items ||
            purchaseOrder.items.length === 0
        ) {
            window.alert(
                'Purchase order item details are not included in the controller response.',
            );

            return;
        }

        setEditingPurchaseOrder(purchaseOrder);

        form.clearErrors();

        form.setData({
            supplier_id: String(
                purchaseOrder.supplier.id,
            ),

            branch_id: String(
                purchaseOrder.branch.id,
            ),

            warehouse_id: String(
                purchaseOrder.warehouse.id,
            ),

            order_date:
                purchaseOrder.order_date,

            expected_delivery_date:
                purchaseOrder.expected_delivery_date ??
                '',

            payment_terms:
                purchaseOrder.payment_terms ?? '',

            discount_amount: String(
                purchaseOrder.discount_amount,
            ),

            tax_amount: String(
                purchaseOrder.tax_amount,
            ),

            shipping_amount: String(
                purchaseOrder.shipping_amount,
            ),

            notes: purchaseOrder.notes ?? '',

            items: purchaseOrder.items.map(
                (item) => ({
                    product_id: String(
                        item.product_id,
                    ),

                    quantity: String(
                        item.quantity,
                    ),

                    unit_cost: String(
                        item.unit_cost,
                    ),

                    notes: item.notes ?? '',
                }),
            ),
        });

        setIsModalOpen(true);
    }

    function closeModal(): void {
        if (form.processing) {
            return;
        }

        setIsModalOpen(false);
        setEditingPurchaseOrder(null);

        form.clearErrors();
        form.setData(emptyOrderForm());
    }

    function submitPurchaseOrder(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingPurchaseOrder) {
            form.put(
                `/suppliers/purchase-orders/${editingPurchaseOrder.id}`,
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        closeModal();
                    },
                },
            );

            return;
        }

        form.post('/suppliers/purchase-orders', {
            preserveScroll: true,

            onSuccess: () => {
                closeModal();
            },
        });
    }

    function changeSupplier(
        value: string,
    ): void {
        const supplier = suppliers.find(
            (item) => String(item.id) === value,
        );

        form.setData({
            ...form.data,
            supplier_id: value,
            payment_terms:
                supplier?.payment_terms ??
                form.data.payment_terms,
        });
    }

    function changeBranch(value: string): void {
        const selectedWarehouse =
            warehouses.find(
                (warehouse) =>
                    String(warehouse.id) ===
                    form.data.warehouse_id,
            );

        const warehouseBelongsToBranch =
            selectedWarehouse &&
            String(
                selectedWarehouse.branch_id,
            ) === value;

        form.setData({
            ...form.data,
            branch_id: value,
            warehouse_id:
                warehouseBelongsToBranch
                    ? form.data.warehouse_id
                    : '',
        });
    }

    function addItem(): void {
        form.setData('items', [
            ...form.data.items,
            emptyItem(),
        ]);
    }

    function removeItem(index: number): void {
        if (form.data.items.length === 1) {
            form.setData('items', [emptyItem()]);
            return;
        }

        form.setData(
            'items',
            form.data.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        );
    }

    function updateItem(
        index: number,
        field: keyof PurchaseOrderFormItem,
        value: string,
    ): void {
        const items = [...form.data.items];

        items[index] = {
            ...items[index],
            [field]: value,
        };

        form.setData('items', items);
    }

    function changeItemProduct(
        index: number,
        productId: string,
    ): void {
        const product = products.find(
            (item) =>
                String(item.id) === productId,
        );

        const items = [...form.data.items];

        items[index] = {
            ...items[index],
            product_id: productId,
            unit_cost: product
                ? String(product.cost_price)
                : '',
        };

        form.setData('items', items);
    }

    function itemError(
        index: number,
        field: keyof PurchaseOrderFormItem,
    ): string | undefined {
        return (
            form.errors as Record<string, string>
        )[`items.${index}.${field}`];
    }

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/suppliers/purchase-orders',
            {
                search:
                    search.trim() || undefined,

                status:
                    status || undefined,

                supplier_id:
                    supplierId || undefined,

                warehouse_id:
                    warehouseId || undefined,

                date_from:
                    dateFrom || undefined,

                date_to:
                    dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function resetFilters(): void {
        setSearch('');
        setStatus('');
        setSupplierId('');
        setWarehouseId('');
        setDateFrom('');
        setDateTo('');

        router.get(
            '/suppliers/purchase-orders',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function submitOrder(
        purchaseOrder: PurchaseOrder,
    ): void {
        const confirmed = window.confirm(
            `Submit ${purchaseOrder.po_number} for approval?`,
        );

        if (!confirmed) {
            return;
        }

        router.post(
            `/suppliers/purchase-orders/${purchaseOrder.id}/submit`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function approveOrder(
        purchaseOrder: PurchaseOrder,
    ): void {
        const confirmed = window.confirm(
            `Approve ${purchaseOrder.po_number}?`,
        );

        if (!confirmed) {
            return;
        }

        router.post(
            `/suppliers/purchase-orders/${purchaseOrder.id}/approve`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function cancelOrder(
        purchaseOrder: PurchaseOrder,
    ): void {
        const confirmed = window.confirm(
            `Cancel ${purchaseOrder.po_number}?`,
        );

        if (!confirmed) {
            return;
        }

        router.post(
            `/suppliers/purchase-orders/${purchaseOrder.id}/cancel`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function deleteOrder(
        purchaseOrder: PurchaseOrder,
    ): void {
        const confirmed = window.confirm(
            `Delete draft ${purchaseOrder.po_number}?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/suppliers/purchase-orders/${purchaseOrder.id}`,
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Procurement Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Purchase Orders
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Create, approve, and track
                            product orders from your
                            suppliers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Plus className="size-4" />

                        New Purchase Order
                    </button>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Orders"
                        value={summary.total}
                        icon={
                            <ShoppingCart className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Pending Approval"
                        value={summary.pending}
                        icon={
                            <Clock3 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Approved Orders"
                        value={summary.approved}
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Active Order Value"
                        value={formatCurrency(
                            summary.total_value,
                        )}
                        icon={
                            <Banknote className="size-5" />
                        }
                    />
                </section>

                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
                    <form
                        onSubmit={applyFilters}
                        className="grid gap-3 border-b p-4 lg:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_200px_200px_160px_160px_auto_auto]"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Search PO, supplier, branch, or warehouse..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All statuses
                            </option>

                            {statuses.map(
                                (item) => (
                                    <option
                                        key={
                                            item.value
                                        }
                                        value={
                                            item.value
                                        }
                                    >
                                        {item.label}
                                    </option>
                                ),
                            )}
                        </select>

                        <select
                            value={supplierId}
                            onChange={(event) =>
                                setSupplierId(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All suppliers
                            </option>

                            {suppliers.map(
                                (supplier) => (
                                    <option
                                        key={
                                            supplier.id
                                        }
                                        value={
                                            supplier.id
                                        }
                                    >
                                        {supplier.name}
                                    </option>
                                ),
                            )}
                        </select>

                        <select
                            value={warehouseId}
                            onChange={(event) =>
                                setWarehouseId(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All warehouses
                            </option>

                            {warehouses.map(
                                (warehouse) => (
                                    <option
                                        key={
                                            warehouse.id
                                        }
                                        value={
                                            warehouse.id
                                        }
                                    >
                                        {warehouse.name}
                                    </option>
                                ),
                            )}
                        </select>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) =>
                                setDateFrom(
                                    event.target.value,
                                )
                            }
                            title="Order date from"
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) =>
                                setDateTo(
                                    event.target.value,
                                )
                            }
                            title="Order date to"
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />

                        <button
                            type="submit"
                            className="h-10 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
                        >
                            Apply
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            Reset
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Purchase Order
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Supplier
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Destination
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Schedule
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Items
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Total
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {purchase_orders.data.map(
                                    (purchaseOrder) => (
                                        <tr
                                            key={
                                                purchaseOrder.id
                                            }
                                            className="transition hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <ClipboardCheck className="size-5" />
                                                    </div>

                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                purchaseOrder.po_number
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Created{' '}
                                                            {formatDate(
                                                                purchaseOrder.created_at,
                                                            )}
                                                        </p>

                                                        {purchaseOrder.created_by && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                By{' '}
                                                                {
                                                                    purchaseOrder
                                                                        .created_by
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-2">
                                                    <Truck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                purchaseOrder
                                                                    .supplier
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {purchaseOrder
                                                                .supplier
                                                                .code ??
                                                                'No supplier code'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-1.5">
                                                    <p className="flex items-center gap-2 text-sm">
                                                        <Warehouse className="size-4 text-muted-foreground" />

                                                        {
                                                            purchaseOrder
                                                                .warehouse
                                                                .name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            purchaseOrder
                                                                .branch
                                                                .name
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-1.5">
                                                    <p className="flex items-center gap-2 text-sm">
                                                        <CalendarDays className="size-4 text-muted-foreground" />

                                                        {formatDate(
                                                            purchaseOrder.order_date,
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        Expected:{' '}
                                                        {formatDate(
                                                            purchaseOrder.expected_delivery_date,
                                                        )}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="flex items-center gap-2 text-sm">
                                                        <Boxes className="size-4 text-muted-foreground" />

                                                        <span className="font-medium">
                                                            {
                                                                purchaseOrder.items_count
                                                            }
                                                        </span>

                                                        products
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {formatQuantity(
                                                            purchaseOrder.received_quantity,
                                                        )}{' '}
                                                        of{' '}
                                                        {formatQuantity(
                                                            purchaseOrder.ordered_quantity,
                                                        )}{' '}
                                                        received
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-semibold">
                                                    {formatCurrency(
                                                        purchaseOrder.total_amount,
                                                    )}
                                                </p>

                                                {purchaseOrder.discount_amount >
                                                    0 && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Discount:{' '}
                                                        {formatCurrency(
                                                            purchaseOrder.discount_amount,
                                                        )}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={
                                                        purchaseOrder.status
                                                    }
                                                    label={
                                                        purchaseOrder.status_label
                                                    }
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {purchaseOrder.status ===
                                                        'draft' &&
                                                        purchaseOrder.items && (
                                                            <ActionButton
                                                                title="Edit purchase order"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        purchaseOrder,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="size-4" />
                                                            </ActionButton>
                                                        )}

                                                    {purchaseOrder.status ===
                                                        'draft' && (
                                                        <ActionButton
                                                            title="Submit for approval"
                                                            onClick={() =>
                                                                submitOrder(
                                                                    purchaseOrder,
                                                                )
                                                            }
                                                        >
                                                            <Send className="size-4" />
                                                        </ActionButton>
                                                    )}

                                                    {purchaseOrder.status ===
                                                        'pending' && (
                                                        <ActionButton
                                                            title="Approve purchase order"
                                                            onClick={() =>
                                                                approveOrder(
                                                                    purchaseOrder,
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle2 className="size-4" />
                                                        </ActionButton>
                                                    )}

                                                    {[
                                                        'draft',
                                                        'pending',
                                                        'approved',
                                                    ].includes(
                                                        purchaseOrder.status,
                                                    ) && (
                                                        <ActionButton
                                                            title="Cancel purchase order"
                                                            destructive
                                                            onClick={() =>
                                                                cancelOrder(
                                                                    purchaseOrder,
                                                                )
                                                            }
                                                        >
                                                            <Ban className="size-4" />
                                                        </ActionButton>
                                                    )}

                                                    {purchaseOrder.status ===
                                                        'draft' && (
                                                        <ActionButton
                                                            title="Delete draft"
                                                            destructive
                                                            onClick={() =>
                                                                deleteOrder(
                                                                    purchaseOrder,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </ActionButton>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {purchase_orders.data
                                    .length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center"
                                        >
                                            <ClipboardCheck className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No purchase
                                                orders found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Create your first
                                                purchase order to
                                                begin ordering
                                                inventory.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    openCreateModal
                                                }
                                                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                            >
                                                <Plus className="size-4" />

                                                New Purchase
                                                Order
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <PurchaseOrderPagination
                        purchaseOrders={
                            purchase_orders
                        }
                    />
                </section>
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingPurchaseOrder
                                        ? `Edit ${editingPurchaseOrder.po_number}`
                                        : 'New Purchase Order'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Select a supplier,
                                    destination, and
                                    products to order.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={
                                    form.processing
                                }
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                submitPurchaseOrder
                            }
                            className="space-y-6 p-6"
                        >
                            <FormSection
                                title="Order Information"
                                description="Supplier and order schedule."
                                icon={
                                    <ClipboardCheck className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    <FormField
                                        label="Supplier"
                                        error={
                                            form.errors
                                                .supplier_id
                                        }
                                        required
                                    >
                                        <select
                                            value={
                                                form.data
                                                    .supplier_id
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                changeSupplier(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        >
                                            <option value="">
                                                Select
                                                supplier
                                            </option>

                                            {suppliers.map(
                                                (
                                                    supplier,
                                                ) => (
                                                    <option
                                                        key={
                                                            supplier.id
                                                        }
                                                        value={
                                                            supplier.id
                                                        }
                                                    >
                                                        {
                                                            supplier.name
                                                        }{' '}
                                                        (
                                                        {
                                                            supplier.code
                                                        }
                                                        )
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </FormField>

                                    <FormField
                                        label="Order Date"
                                        error={
                                            form.errors
                                                .order_date
                                        }
                                        required
                                    >
                                        <input
                                            type="date"
                                            value={
                                                form.data
                                                    .order_date
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'order_date',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Expected Delivery"
                                        error={
                                            form.errors
                                                .expected_delivery_date
                                        }
                                    >
                                        <input
                                            type="date"
                                            min={
                                                form.data
                                                    .order_date
                                            }
                                            value={
                                                form.data
                                                    .expected_delivery_date
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'expected_delivery_date',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Payment Terms"
                                        error={
                                            form.errors
                                                .payment_terms
                                        }
                                    >
                                        <input
                                            type="text"
                                            list="purchase-order-payment-terms"
                                            value={
                                                form.data
                                                    .payment_terms
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'payment_terms',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Net 30"
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />

                                        <datalist id="purchase-order-payment-terms">
                                            <option value="Cash on Delivery" />
                                            <option value="Cash Before Delivery" />
                                            <option value="Net 7" />
                                            <option value="Net 15" />
                                            <option value="Net 30" />
                                            <option value="Net 45" />
                                            <option value="Net 60" />
                                        </datalist>
                                    </FormField>
                                </div>
                            </FormSection>

                            <FormSection
                                title="Delivery Destination"
                                description="Choose the branch and warehouse that will receive the products."
                                icon={
                                    <Warehouse className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label="Branch"
                                        error={
                                            form.errors
                                                .branch_id
                                        }
                                        required
                                    >
                                        <select
                                            value={
                                                form.data
                                                    .branch_id
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                changeBranch(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        >
                                            <option value="">
                                                Select branch
                                            </option>

                                            {branches.map(
                                                (branch) => (
                                                    <option
                                                        key={
                                                            branch.id
                                                        }
                                                        value={
                                                            branch.id
                                                        }
                                                    >
                                                        {
                                                            branch.name
                                                        }{' '}
                                                        (
                                                        {
                                                            branch.code
                                                        }
                                                        )
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </FormField>

                                    <FormField
                                        label="Receiving Warehouse"
                                        error={
                                            form.errors
                                                .warehouse_id
                                        }
                                        required
                                    >
                                        <select
                                            value={
                                                form.data
                                                    .warehouse_id
                                            }
                                            disabled={
                                                !form.data
                                                    .branch_id
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'warehouse_id',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <option value="">
                                                {form.data
                                                    .branch_id
                                                    ? 'Select warehouse'
                                                    : 'Select a branch first'}
                                            </option>

                                            {modalWarehouses.map(
                                                (
                                                    warehouse,
                                                ) => (
                                                    <option
                                                        key={
                                                            warehouse.id
                                                        }
                                                        value={
                                                            warehouse.id
                                                        }
                                                    >
                                                        {
                                                            warehouse.name
                                                        }{' '}
                                                        (
                                                        {
                                                            warehouse.code
                                                        }
                                                        )
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </FormField>
                                </div>
                            </FormSection>

                            <FormSection
                                title="Order Items"
                                description="Add the products and quantities included in this purchase order."
                                icon={
                                    <Boxes className="size-4" />
                                }
                                action={
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                                    >
                                        <Plus className="size-4" />

                                        Add Product
                                    </button>
                                }
                            >
                                {form.errors.items && (
                                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                        {
                                            form.errors
                                                .items
                                        }
                                    </p>
                                )}

                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full min-w-[920px] text-left">
                                        <thead className="border-b bg-muted/40">
                                            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">
                                                    Product
                                                </th>

                                                <th className="w-32 px-4 py-3 font-medium">
                                                    Quantity
                                                </th>

                                                <th className="w-40 px-4 py-3 font-medium">
                                                    Unit Cost
                                                </th>

                                                <th className="w-40 px-4 py-3 font-medium">
                                                    Line Total
                                                </th>

                                                <th className="px-4 py-3 font-medium">
                                                    Notes
                                                </th>

                                                <th className="w-16 px-4 py-3" />
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {form.data.items.map(
                                                (
                                                    item,
                                                    index,
                                                ) => {
                                                    const selectedProduct =
                                                        products.find(
                                                            (
                                                                product,
                                                            ) =>
                                                                String(
                                                                    product.id,
                                                                ) ===
                                                                item.product_id,
                                                        );

                                                    const lineTotal =
                                                        Number(
                                                            item.quantity ||
                                                                0,
                                                        ) *
                                                        Number(
                                                            item.unit_cost ||
                                                                0,
                                                        );

                                                    const selectedProductIds =
                                                        form.data.items
                                                            .filter(
                                                                (
                                                                    _,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex !==
                                                                    index,
                                                            )
                                                            .map(
                                                                (
                                                                    otherItem,
                                                                ) =>
                                                                    otherItem.product_id,
                                                            );

                                                    return (
                                                        <tr
                                                            key={
                                                                index
                                                            }
                                                            className="align-top"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <select
                                                                    value={
                                                                        item.product_id
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        changeItemProduct(
                                                                            index,
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                                >
                                                                    <option value="">
                                                                        Select
                                                                        product
                                                                    </option>

                                                                    {products.map(
                                                                        (
                                                                            product,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    product.id
                                                                                }
                                                                                value={
                                                                                    product.id
                                                                                }
                                                                                disabled={selectedProductIds.includes(
                                                                                    String(
                                                                                        product.id,
                                                                                    ),
                                                                                )}
                                                                            >
                                                                                {
                                                                                    product.name
                                                                                }{' '}
                                                                                {product.sku
                                                                                    ? `(${product.sku})`
                                                                                    : ''}
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </select>

                                                                {selectedProduct && (
                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        Unit:{' '}
                                                                        {
                                                                            selectedProduct.unit
                                                                        }
                                                                    </p>
                                                                )}

                                                                {itemError(
                                                                    index,
                                                                    'product_id',
                                                                ) && (
                                                                    <p className="mt-1 text-xs text-destructive">
                                                                        {itemError(
                                                                            index,
                                                                            'product_id',
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    min="0.0001"
                                                                    step="0.0001"
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateItem(
                                                                            index,
                                                                            'quantity',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                                />

                                                                {itemError(
                                                                    index,
                                                                    'quantity',
                                                                ) && (
                                                                    <p className="mt-1 text-xs text-destructive">
                                                                        {itemError(
                                                                            index,
                                                                            'quantity',
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                                        ₱
                                                                    </span>

                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={
                                                                            item.unit_cost
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateItem(
                                                                                index,
                                                                                'unit_cost',
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="h-10 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                                    />
                                                                </div>

                                                                {itemError(
                                                                    index,
                                                                    'unit_cost',
                                                                ) && (
                                                                    <p className="mt-1 text-xs text-destructive">
                                                                        {itemError(
                                                                            index,
                                                                            'unit_cost',
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <div className="flex h-10 items-center rounded-lg bg-muted px-3 text-sm font-semibold">
                                                                    {formatCurrency(
                                                                        Number.isFinite(
                                                                            lineTotal,
                                                                        )
                                                                            ? lineTotal
                                                                            : 0,
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        item.notes
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateItem(
                                                                            index,
                                                                            'notes',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Optional"
                                                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                                />

                                                                {itemError(
                                                                    index,
                                                                    'notes',
                                                                ) && (
                                                                    <p className="mt-1 text-xs text-destructive">
                                                                        {itemError(
                                                                            index,
                                                                            'notes',
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeItem(
                                                                            index,
                                                                        )
                                                                    }
                                                                    title="Remove product"
                                                                    className="inline-flex size-10 items-center justify-center rounded-lg border text-destructive transition hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </FormSection>

                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                                <FormSection
                                    title="Additional Information"
                                    description="Optional notes for this purchase order."
                                    icon={
                                        <PackageCheck className="size-4" />
                                    }
                                >
                                    <FormField
                                        label="Notes"
                                        error={
                                            form.errors
                                                .notes
                                        }
                                    >
                                        <textarea
                                            rows={6}
                                            value={
                                                form.data
                                                    .notes
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'notes',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Delivery instructions, supplier notes, or internal remarks"
                                            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>
                                </FormSection>

                                <section className="rounded-xl border bg-muted/20 p-5">
                                    <h3 className="font-semibold">
                                        Order Summary
                                    </h3>

                                    <div className="mt-5 space-y-4">
                                        <SummaryRow
                                            label="Subtotal"
                                            value={formatCurrency(
                                                formSubtotal,
                                            )}
                                        />

                                        <FormField
                                            label="Discount"
                                            error={
                                                form.errors
                                                    .discount_amount
                                            }
                                        >
                                            <CurrencyInput
                                                value={
                                                    form.data
                                                        .discount_amount
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'discount_amount',
                                                        value,
                                                    )
                                                }
                                            />
                                        </FormField>

                                        <FormField
                                            label="Tax"
                                            error={
                                                form.errors
                                                    .tax_amount
                                            }
                                        >
                                            <CurrencyInput
                                                value={
                                                    form.data
                                                        .tax_amount
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'tax_amount',
                                                        value,
                                                    )
                                                }
                                            />
                                        </FormField>

                                        <FormField
                                            label="Shipping"
                                            error={
                                                form.errors
                                                    .shipping_amount
                                            }
                                        >
                                            <CurrencyInput
                                                value={
                                                    form.data
                                                        .shipping_amount
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'shipping_amount',
                                                        value,
                                                    )
                                                }
                                            />
                                        </FormField>

                                        <div className="border-t pt-4">
                                            <SummaryRow
                                                label="Total"
                                                value={formatCurrency(
                                                    Math.max(
                                                        formTotal,
                                                        0,
                                                    ),
                                                )}
                                                strong
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        form.processing
                                    }
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        form.processing
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {form.processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}

                                    {editingPurchaseOrder
                                        ? 'Save Changes'
                                        : 'Create Draft'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: ReactNode;
    icon: ReactNode;
}) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <div className="mt-2 truncate text-2xl font-semibold">
                        {value}
                    </div>
                </div>

                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FormSection({
    title,
    description,
    icon,
    action,
    children,
}: {
    title: string;
    description: string;
    icon: ReactNode;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold">
                            {title}
                        </h3>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                {action}
            </div>

            {children}
        </section>
    );
}

function FormField({
    label,
    error,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-destructive">
                        *
                    </span>
                )}
            </span>

            {children}

            {error && (
                <span className="block text-xs text-destructive">
                    {error}
                </span>
            )}
        </label>
    );
}

function CurrencyInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₱
            </span>

            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder="0.00"
                className="h-10 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
        </div>
    );
}

function SummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span
                className={
                    strong
                        ? 'font-semibold'
                        : 'text-sm text-muted-foreground'
                }
            >
                {label}
            </span>

            <span
                className={
                    strong
                        ? 'text-xl font-semibold'
                        : 'text-sm font-medium'
                }
            >
                {value}
            </span>
        </div>
    );
}

function StatusBadge({
    status,
    label,
}: {
    status: string;
    label: string;
}) {
    const styles: Record<string, string> = {
        draft:
            'bg-slate-500/10 text-slate-600',

        pending:
            'bg-amber-500/10 text-amber-600',

        approved:
            'bg-blue-500/10 text-blue-600',

        partially_received:
            'bg-violet-500/10 text-violet-600',

        received:
            'bg-emerald-500/10 text-emerald-600',

        cancelled:
            'bg-red-500/10 text-red-600',
    };

    const icons: Record<string, ReactNode> = {
        draft: <ClipboardCheck className="size-3.5" />,
        pending: <Clock3 className="size-3.5" />,
        approved: (
            <CheckCircle2 className="size-3.5" />
        ),
        partially_received: (
            <PackageCheck className="size-3.5" />
        ),
        received: (
            <PackageCheck className="size-3.5" />
        ),
        cancelled: (
            <XCircle className="size-3.5" />
        ),
    };

    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                styles[status] ??
                    'bg-muted text-muted-foreground',
            ].join(' ')}
        >
            {icons[status]}

            {label}
        </span>
    );
}

function ActionButton({
    title,
    destructive = false,
    onClick,
    children,
}: {
    title: string;
    destructive?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={[
                'inline-flex size-9 items-center justify-center rounded-lg border transition',
                destructive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'hover:bg-muted',
            ].join(' ')}
        >
            {children}
        </button>
    );
}

function PurchaseOrderPagination({
    purchaseOrders,
}: {
    purchaseOrders: PaginatedPurchaseOrders;
}) {
    if (purchaseOrders.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {purchaseOrders.from ?? 0} to{' '}
                {purchaseOrders.to ?? 0} of{' '}
                {purchaseOrders.total} purchase orders
            </p>

            <div className="flex flex-wrap gap-1">
                {purchaseOrders.links.map(
                    (link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            disabled={!link.url}
                            onClick={() => {
                                if (!link.url) {
                                    return;
                                }

                                router.get(
                                    link.url,
                                    {},
                                    {
                                        preserveState:
                                            true,

                                        preserveScroll:
                                            true,
                                    },
                                );
                            }}
                            className={[
                                'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition',
                                link.active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-muted',
                                !link.url
                                    ? 'cursor-not-allowed opacity-40'
                                    : '',
                            ].join(' ')}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}

function formatCurrency(
    value: number | string | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(
        Number.isFinite(amount) ? amount : 0,
    );
}

function formatQuantity(
    value: number | string | null,
): string {
    const quantity = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    }).format(
        Number.isFinite(quantity) ? quantity : 0,
    );
}

function formatDate(
    value: string | null,
): string {
    if (!value) {
        return 'Not set';
    }

    const date = new Date(
        value.includes('T')
            ? value
            : `${value}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date);
}