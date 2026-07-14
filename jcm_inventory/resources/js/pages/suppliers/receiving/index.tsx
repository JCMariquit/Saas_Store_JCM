import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownToLine,
    Banknote,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Eye,
    LoaderCircle,
    PackageCheck,
    Plus,
    ReceiptText,
    RotateCcw,
    Search,
    Truck,
    Warehouse,
    X,
    XCircle,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useMemo, useState } from 'react';

type UserReference = {
    id: number;
    name: string;
    email: string | null;
};

type SupplierOption = {
    id: number;
    code: string;
    name: string;
};

type WarehouseOption = {
    id: number;
    branch_id: number;
    code: string;
    name: string;
    is_main: boolean;
};

type StatusOption = {
    value: string;
    label: string;
};

type PurchaseOrderItemOption = {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string | null;
    unit: string;
    ordered_quantity: number;
    received_quantity: number;
    remaining_quantity: number;
    unit_cost: number;
    notes: string | null;
};

type PurchaseOrderOption = {
    id: number;
    po_number: string;
    order_date: string;
    expected_delivery_date: string | null;
    status: string;
    total_amount: number;

    supplier: {
        id: number;
        name: string;
        code: string | null;
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

    items: PurchaseOrderItemOption[];
};

type ReceiptItem = {
    id: number;
    purchase_order_item_id: number;
    product_id: number;
    product_name: string;
    product_sku: string | null;
    unit: string;
    quantity_received: number;
    unit_cost: number;
    line_total: number;
    notes: string | null;
};

type Receipt = {
    id: number;
    receipt_number: string;
    delivery_reference: string | null;
    received_date: string;
    status: string;
    status_label: string;
    can_void: boolean;

    purchase_order: {
        id: number;
        po_number: string;
    };

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

    items_count: number;
    total_quantity: number;
    total_amount: number;
    notes: string | null;

    received_by: UserReference | null;

    voided_by: UserReference | null;
    voided_at: string | null;
    void_reason: string | null;

    created_at: string | null;
    updated_at: string | null;

    items: ReceiptItem[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedReceipts = {
    current_page: number;
    data: Receipt[];
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

type ReceivingSummary = {
    total: number;
    posted: number;
    voided: number;
    received_quantity: number;
    received_value: number;
};

type ReceivingFilters = {
    search: string;
    status: string;
    supplier_id: string;
    warehouse_id: string;
    date_from: string;
    date_to: string;
};

type ReceivingFormItem = {
    purchase_order_item_id: string;
    quantity_received: string;
    notes: string;
};

type ReceivingFormData = {
    purchase_order_id: string;
    delivery_reference: string;
    received_date: string;
    notes: string;
    items: ReceivingFormItem[];
};

type VoidReceiptFormData = {
    reason: string;
};

type ReceivingPageProps = {
    receipts: PaginatedReceipts;
    summary: ReceivingSummary;
    suppliers: SupplierOption[];
    warehouses: WarehouseOption[];
    purchase_orders: PurchaseOrderOption[];
    statuses: StatusOption[];
    filters: ReceivingFilters;
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
        title: 'Receiving',
        href: '/suppliers/receiving',
    },
];

function todayDate(): string {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function emptyForm(): ReceivingFormData {
    return {
        purchase_order_id: '',
        delivery_reference: '',
        received_date: todayDate(),
        notes: '',
        items: [],
    };
}

export default function ReceivingIndex({
    receipts,
    summary,
    suppliers,
    warehouses,
    purchase_orders,
    statuses,
    filters,
}: ReceivingPageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

    const [voidingReceipt, setVoidingReceipt] = useState<Receipt | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');

    const [status, setStatus] = useState(filters.status ?? '');

    const [supplierId, setSupplierId] = useState(filters.supplier_id ?? '');

    const [warehouseId, setWarehouseId] = useState(filters.warehouse_id ?? '');

    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');

    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const form = useForm<ReceivingFormData>(emptyForm());

    const voidForm = useForm<VoidReceiptFormData>({
        reason: '',
    });

    const voidErrors = voidForm.errors as Record<string, string | undefined>;

    const selectedPurchaseOrder = useMemo(() => {
        return (
            purchase_orders.find(
                (order) => String(order.id) === form.data.purchase_order_id,
            ) ?? null
        );
    }, [form.data.purchase_order_id, purchase_orders]);

    const receiptTotals = useMemo(() => {
        if (!selectedPurchaseOrder) {
            return {
                quantity: 0,
                amount: 0,
                itemCount: 0,
            };
        }

        return form.data.items.reduce(
            (totals, item) => {
                const quantity = Number(item.quantity_received || 0);

                const orderItem = selectedPurchaseOrder.items.find(
                    (candidate) =>
                        String(candidate.id) === item.purchase_order_item_id,
                );

                if (!orderItem || !Number.isFinite(quantity) || quantity <= 0) {
                    return totals;
                }

                return {
                    quantity: totals.quantity + quantity,

                    amount:
                        totals.amount + quantity * Number(orderItem.unit_cost),

                    itemCount: totals.itemCount + 1,
                };
            },
            {
                quantity: 0,
                amount: 0,
                itemCount: 0,
            },
        );
    }, [form.data.items, selectedPurchaseOrder]);

    function openCreateModal(): void {
        form.clearErrors();
        form.setData(emptyForm());
        setIsCreateModalOpen(true);
    }

    function closeCreateModal(): void {
        if (form.processing) {
            return;
        }

        setIsCreateModalOpen(false);
        form.clearErrors();
        form.setData(emptyForm());
    }

    function changePurchaseOrder(purchaseOrderId: string): void {
        const order = purchase_orders.find(
            (item) => String(item.id) === purchaseOrderId,
        );

        form.clearErrors();

        form.setData({
            ...form.data,

            purchase_order_id: purchaseOrderId,

            items:
                order?.items.map((item) => ({
                    purchase_order_item_id: String(item.id),

                    quantity_received: '',

                    notes: '',
                })) ?? [],
        });
    }

    function updateItem(
        index: number,
        field: keyof ReceivingFormItem,
        value: string,
    ): void {
        const items = [...form.data.items];

        items[index] = {
            ...items[index],
            [field]: value,
        };

        form.setData('items', items);
    }

    function fillRemainingQuantities(): void {
        if (!selectedPurchaseOrder) {
            return;
        }

        form.setData(
            'items',
            form.data.items.map((item) => {
                const orderItem = selectedPurchaseOrder.items.find(
                    (candidate) =>
                        String(candidate.id) === item.purchase_order_item_id,
                );

                return {
                    ...item,

                    quantity_received: orderItem
                        ? String(orderItem.remaining_quantity)
                        : '',
                };
            }),
        );
    }

    function clearQuantities(): void {
        form.setData(
            'items',
            form.data.items.map((item) => ({
                ...item,
                quantity_received: '',
            })),
        );
    }

    function itemError(
        index: number,
        field: keyof ReceivingFormItem,
    ): string | undefined {
        return (form.errors as Record<string, string>)[
            `items.${index}.${field}`
        ];
    }

    function submitReceipt(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const selectedItems = form.data.items.filter((item) => {
            const quantity = Number(item.quantity_received || 0);

            return Number.isFinite(quantity) && quantity > 0;
        });

        if (selectedItems.length === 0) {
            form.setError(
                'items',
                'Enter a received quantity for at least one product.',
            );

            return;
        }

        form.clearErrors();

        form.transform((data) => ({
            ...data,
            items: data.items.filter((item) => {
                const quantity = Number(item.quantity_received || 0);

                return Number.isFinite(quantity) && quantity > 0;
            }),
        }));

        form.post('/suppliers/receiving', {
            preserveScroll: true,

            onSuccess: () => {
                setIsCreateModalOpen(false);
                form.reset();
                form.setData(emptyForm());
            },

            onFinish: () => {
                form.transform((data) => data);
            },
        });
    }

    function openVoidModal(receipt: Receipt): void {
        if (!receipt.can_void) {
            return;
        }

        voidForm.clearErrors();
        voidForm.setData('reason', '');
        setVoidingReceipt(receipt);
    }

    function closeVoidModal(): void {
        if (voidForm.processing) {
            return;
        }

        setVoidingReceipt(null);
        voidForm.clearErrors();
        voidForm.reset();
    }

    function submitVoidReceipt(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!voidingReceipt) {
            return;
        }

        voidForm.post(`/suppliers/receiving/${voidingReceipt.id}/void`, {
            preserveScroll: true,
            onSuccess: () => {
                setVoidingReceipt(null);
                setViewingReceipt(null);
                voidForm.reset();
            },
        });
    }

    function applyFilters(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        router.get(
            '/suppliers/receiving',
            {
                search: search.trim() || undefined,

                status: status || undefined,

                supplier_id: supplierId || undefined,

                warehouse_id: warehouseId || undefined,

                date_from: dateFrom || undefined,

                date_to: dateTo || undefined,
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
            '/suppliers/receiving',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Receiving" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Procurement Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Receiving
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Record supplier deliveries and automatically update
                            warehouse stock.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={purchase_orders.length === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="size-4" />
                        Receive Delivery
                    </button>
                </section>

                {purchase_orders.length === 0 && (
                    <section className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                        <PackageCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />

                        <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                No approved purchase orders available
                            </p>

                            <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                                Approve a purchase order first before recording
                                a supplier delivery.
                            </p>
                        </div>
                    </section>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Receipts"
                        value={summary.total}
                        icon={<ReceiptText className="size-5" />}
                    />

                    <SummaryCard
                        title="Posted Receipts"
                        value={summary.posted}
                        icon={<CheckCircle2 className="size-5" />}
                    />

                    <SummaryCard
                        title="Quantity Received"
                        value={formatQuantity(summary.received_quantity)}
                        icon={<Boxes className="size-5" />}
                    />

                    <SummaryCard
                        title="Received Value"
                        value={formatCurrency(summary.received_value)}
                        icon={<Banknote className="size-5" />}
                    />
                </section>

                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
                    <form
                        onSubmit={applyFilters}
                        className="grid gap-3 border-b p-4 lg:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_160px_190px_190px_160px_160px_auto_auto]"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search receipt, PO, supplier, or reference..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">All statuses</option>

                            {statuses.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={supplierId}
                            onChange={(event) =>
                                setSupplierId(event.target.value)
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">All suppliers</option>

                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={warehouseId}
                            onChange={(event) =>
                                setWarehouseId(event.target.value)
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">All warehouses</option>

                            {warehouses.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) =>
                                setDateFrom(event.target.value)
                            }
                            title="Received date from"
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            title="Received date to"
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
                        <table className="w-full min-w-[1200px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Receipt
                                    </th>

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
                                        Received
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Value
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
                                {receipts.data.map((receipt) => (
                                    <tr
                                        key={receipt.id}
                                        className="transition hover:bg-muted/30"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <ReceiptText className="size-5" />
                                                </div>

                                                <div>
                                                    <p className="font-medium">
                                                        {receipt.receipt_number}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {receipt.delivery_reference
                                                            ? `Reference: ${receipt.delivery_reference}`
                                                            : 'No delivery reference'}
                                                    </p>

                                                    {receipt.received_by && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Received by{' '}
                                                            {
                                                                receipt
                                                                    .received_by
                                                                    .name
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-2">
                                                <ClipboardList className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {
                                                            receipt
                                                                .purchase_order
                                                                .po_number
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {receipt.items_count}{' '}
                                                        product
                                                        {receipt.items_count !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-2">
                                                <Truck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {receipt.supplier.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {receipt.supplier
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

                                                    {receipt.warehouse.name}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {receipt.branch.name}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="flex items-center gap-2 text-sm">
                                                <CalendarDays className="size-4 text-muted-foreground" />

                                                {formatDate(
                                                    receipt.received_date,
                                                )}
                                            </p>

                                            <p className="mt-1.5 text-xs text-muted-foreground">
                                                {formatQuantity(
                                                    receipt.total_quantity,
                                                )}{' '}
                                                units
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-semibold">
                                                {formatCurrency(
                                                    receipt.total_amount,
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={receipt.status}
                                                label={receipt.status_label}
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    title="View receipt"
                                                    onClick={() =>
                                                        setViewingReceipt(
                                                            receipt,
                                                        )
                                                    }
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                                                >
                                                    <Eye className="size-4" />
                                                </button>

                                                {receipt.can_void && (
                                                    <button
                                                        type="button"
                                                        title="Void receipt"
                                                        onClick={() =>
                                                            openVoidModal(
                                                                receipt,
                                                            )
                                                        }
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition hover:bg-destructive/10"
                                                    >
                                                        <RotateCcw className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {receipts.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center"
                                        >
                                            <ArrowDownToLine className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No receiving records found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Posted supplier deliveries will
                                                appear here.
                                            </p>

                                            {purchase_orders.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={openCreateModal}
                                                    className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                                >
                                                    <Plus className="size-4" />
                                                    Receive Delivery
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <ReceiptPagination receipts={receipts} />
                </section>
            </div>

            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeCreateModal();
                        }
                    }}
                >
                    <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Receive Supplier Delivery
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Record delivered items from an approved
                                    purchase order.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCreateModal}
                                disabled={form.processing}
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitReceipt}
                            className="space-y-6 p-6"
                        >
                            <FormSection
                                title="Delivery Information"
                                description="Select the approved purchase order and provide the delivery details."
                                icon={<Truck className="size-4" />}
                            >
                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    <FormField
                                        label="Purchase Order"
                                        error={form.errors.purchase_order_id}
                                        required
                                    >
                                        <select
                                            value={form.data.purchase_order_id}
                                            onChange={(event) =>
                                                changePurchaseOrder(
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        >
                                            <option value="">
                                                Select purchase order
                                            </option>

                                            {purchase_orders.map((order) => (
                                                <option
                                                    key={order.id}
                                                    value={order.id}
                                                >
                                                    {order.po_number} —{' '}
                                                    {order.supplier.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField
                                        label="Received Date"
                                        error={form.errors.received_date}
                                        required
                                    >
                                        <input
                                            type="date"
                                            value={form.data.received_date}
                                            onChange={(event) =>
                                                form.setData(
                                                    'received_date',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Delivery Reference"
                                        error={form.errors.delivery_reference}
                                    >
                                        <input
                                            type="text"
                                            value={form.data.delivery_reference}
                                            onChange={(event) =>
                                                form.setData(
                                                    'delivery_reference',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="DR, invoice, or delivery number"
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>
                                </div>
                            </FormSection>

                            {selectedPurchaseOrder && (
                                <section className="grid gap-4 rounded-xl border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-4">
                                    <DetailItem
                                        label="Supplier"
                                        value={
                                            selectedPurchaseOrder.supplier.name
                                        }
                                        icon={<Truck className="size-4" />}
                                    />

                                    <DetailItem
                                        label="Branch"
                                        value={
                                            selectedPurchaseOrder.branch.name
                                        }
                                        icon={<Boxes className="size-4" />}
                                    />

                                    <DetailItem
                                        label="Warehouse"
                                        value={
                                            selectedPurchaseOrder.warehouse.name
                                        }
                                        icon={<Warehouse className="size-4" />}
                                    />

                                    <DetailItem
                                        label="Expected Delivery"
                                        value={formatDate(
                                            selectedPurchaseOrder.expected_delivery_date,
                                        )}
                                        icon={
                                            <CalendarDays className="size-4" />
                                        }
                                    />
                                </section>
                            )}

                            {selectedPurchaseOrder && (
                                <FormSection
                                    title="Delivered Items"
                                    description="Enter the actual quantity delivered for each product."
                                    icon={<PackageCheck className="size-4" />}
                                    action={
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={
                                                    fillRemainingQuantities
                                                }
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                                            >
                                                <ArrowDownToLine className="size-4" />
                                                Receive All Remaining
                                            </button>

                                            <button
                                                type="button"
                                                onClick={clearQuantities}
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
                                            >
                                                <RotateCcw className="size-4" />
                                                Clear
                                            </button>
                                        </div>
                                    }
                                >
                                    {form.errors.items && (
                                        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                            {form.errors.items}
                                        </p>
                                    )}

                                    <div className="overflow-x-auto rounded-xl border">
                                        <table className="w-full min-w-[1000px] text-left">
                                            <thead className="border-b bg-muted/40">
                                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    <th className="px-4 py-3 font-medium">
                                                        Product
                                                    </th>

                                                    <th className="w-32 px-4 py-3 font-medium">
                                                        Ordered
                                                    </th>

                                                    <th className="w-32 px-4 py-3 font-medium">
                                                        Previously Received
                                                    </th>

                                                    <th className="w-32 px-4 py-3 font-medium">
                                                        Remaining
                                                    </th>

                                                    <th className="w-40 px-4 py-3 font-medium">
                                                        Receive Now
                                                    </th>

                                                    <th className="w-40 px-4 py-3 font-medium">
                                                        Value
                                                    </th>

                                                    <th className="px-4 py-3 font-medium">
                                                        Notes
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y">
                                                {selectedPurchaseOrder.items.map(
                                                    (orderItem, index) => {
                                                        const formItem =
                                                            form.data.items[
                                                                index
                                                            ];

                                                        const quantity = Number(
                                                            formItem?.quantity_received ||
                                                                0,
                                                        );

                                                        const lineTotal =
                                                            Number.isFinite(
                                                                quantity,
                                                            )
                                                                ? quantity *
                                                                  Number(
                                                                      orderItem.unit_cost,
                                                                  )
                                                                : 0;

                                                        const exceedsRemaining =
                                                            quantity >
                                                            Number(
                                                                orderItem.remaining_quantity,
                                                            );

                                                        return (
                                                            <tr
                                                                key={
                                                                    orderItem.id
                                                                }
                                                                className="align-top"
                                                            >
                                                                <td className="px-4 py-3">
                                                                    <p className="text-sm font-medium">
                                                                        {
                                                                            orderItem.product_name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        {orderItem.product_sku
                                                                            ? `${orderItem.product_sku} · `
                                                                            : ''}
                                                                        {
                                                                            orderItem.unit
                                                                        }
                                                                    </p>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <p className="text-sm font-medium">
                                                                        {formatQuantity(
                                                                            orderItem.ordered_quantity,
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        {
                                                                            orderItem.unit
                                                                        }
                                                                    </p>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <p className="text-sm">
                                                                        {formatQuantity(
                                                                            orderItem.received_quantity,
                                                                        )}
                                                                    </p>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <p className="text-sm font-semibold text-primary">
                                                                        {formatQuantity(
                                                                            orderItem.remaining_quantity,
                                                                        )}
                                                                    </p>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={
                                                                            orderItem.remaining_quantity
                                                                        }
                                                                        step="0.001"
                                                                        value={
                                                                            formItem?.quantity_received ??
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateItem(
                                                                                index,
                                                                                'quantity_received',
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="0"
                                                                        className={[
                                                                            'h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/10',
                                                                            exceedsRemaining
                                                                                ? 'border-destructive focus:border-destructive'
                                                                                : 'focus:border-primary',
                                                                        ].join(
                                                                            ' ',
                                                                        )}
                                                                    />

                                                                    {exceedsRemaining && (
                                                                        <p className="mt-1 text-xs text-destructive">
                                                                            Cannot
                                                                            exceed{' '}
                                                                            {formatQuantity(
                                                                                orderItem.remaining_quantity,
                                                                            )}
                                                                            .
                                                                        </p>
                                                                    )}

                                                                    {itemError(
                                                                        index,
                                                                        'quantity_received',
                                                                    ) && (
                                                                        <p className="mt-1 text-xs text-destructive">
                                                                            {itemError(
                                                                                index,
                                                                                'quantity_received',
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <div className="flex h-10 items-center rounded-lg bg-muted px-3 text-sm font-semibold">
                                                                        {formatCurrency(
                                                                            lineTotal,
                                                                        )}
                                                                    </div>

                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        @{' '}
                                                                        {formatCurrency(
                                                                            orderItem.unit_cost,
                                                                        )}
                                                                    </p>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            formItem?.notes ??
                                                                            ''
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
                                                            </tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </FormSection>
                            )}

                            {selectedPurchaseOrder && (
                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                                    <FormSection
                                        title="Receiving Notes"
                                        description="Optional remarks about the delivery."
                                        icon={
                                            <ReceiptText className="size-4" />
                                        }
                                    >
                                        <FormField
                                            label="Notes"
                                            error={form.errors.notes}
                                        >
                                            <textarea
                                                rows={6}
                                                value={form.data.notes}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Delivery condition, shortages, damaged items, or other remarks"
                                                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                            />
                                        </FormField>
                                    </FormSection>

                                    <section className="rounded-xl border bg-muted/20 p-5">
                                        <h3 className="font-semibold">
                                            Receipt Summary
                                        </h3>

                                        <div className="mt-5 space-y-4">
                                            <SummaryRow
                                                label="Products"
                                                value={String(
                                                    receiptTotals.itemCount,
                                                )}
                                            />

                                            <SummaryRow
                                                label="Total Quantity"
                                                value={formatQuantity(
                                                    receiptTotals.quantity,
                                                )}
                                            />

                                            <div className="border-t pt-4">
                                                <SummaryRow
                                                    label="Total Value"
                                                    value={formatCurrency(
                                                        receiptTotals.amount,
                                                    )}
                                                    strong
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    disabled={form.processing}
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !selectedPurchaseOrder ||
                                        receiptTotals.itemCount === 0
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {form.processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <PackageCheck className="size-4" />
                                    )}
                                    Post Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingReceipt && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setViewingReceipt(null);
                        }
                    }}
                >
                    <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-semibold">
                                        {viewingReceipt.receipt_number}
                                    </h2>

                                    <StatusBadge
                                        status={viewingReceipt.status}
                                        label={viewingReceipt.status_label}
                                    />
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Purchase order{' '}
                                    {viewingReceipt.purchase_order.po_number}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewingReceipt(null)}
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <section className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
                                <DetailItem
                                    label="Supplier"
                                    value={viewingReceipt.supplier.name}
                                    icon={<Truck className="size-4" />}
                                />

                                <DetailItem
                                    label="Warehouse"
                                    value={viewingReceipt.warehouse.name}
                                    icon={<Warehouse className="size-4" />}
                                />

                                <DetailItem
                                    label="Received Date"
                                    value={formatDate(
                                        viewingReceipt.received_date,
                                    )}
                                    icon={<CalendarDays className="size-4" />}
                                />

                                <DetailItem
                                    label="Delivery Reference"
                                    value={
                                        viewingReceipt.delivery_reference ??
                                        'Not provided'
                                    }
                                    icon={<ReceiptText className="size-4" />}
                                />
                            </section>

                            <section>
                                <div className="mb-3">
                                    <h3 className="font-semibold">
                                        Received Items
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        Products added to warehouse inventory.
                                    </p>
                                </div>

                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full min-w-[760px] text-left">
                                        <thead className="border-b bg-muted/40">
                                            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">
                                                    Product
                                                </th>

                                                <th className="px-4 py-3 font-medium">
                                                    Quantity
                                                </th>

                                                <th className="px-4 py-3 font-medium">
                                                    Unit Cost
                                                </th>

                                                <th className="px-4 py-3 font-medium">
                                                    Line Total
                                                </th>

                                                <th className="px-4 py-3 font-medium">
                                                    Notes
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {viewingReceipt.items.map(
                                                (item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    item.product_name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {item.product_sku
                                                                    ? `${item.product_sku} · `
                                                                    : ''}
                                                                {item.unit}
                                                            </p>
                                                        </td>

                                                        <td className="px-4 py-3 text-sm">
                                                            {formatQuantity(
                                                                item.quantity_received,
                                                            )}{' '}
                                                            {item.unit}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm">
                                                            {formatCurrency(
                                                                item.unit_cost,
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 font-medium">
                                                            {formatCurrency(
                                                                item.line_total,
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                                            {item.notes ?? '—'}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>

                                        <tfoot className="border-t bg-muted/30">
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="px-4 py-3 font-semibold"
                                                >
                                                    Total
                                                </td>

                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {formatQuantity(
                                                        viewingReceipt.total_quantity,
                                                    )}{' '}
                                                    units
                                                </td>

                                                <td className="px-4 py-3 font-semibold">
                                                    {formatCurrency(
                                                        viewingReceipt.total_amount,
                                                    )}
                                                </td>

                                                <td />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Received By
                                    </p>

                                    <p className="mt-2 font-medium">
                                        {viewingReceipt.received_by?.name ??
                                            'Unknown user'}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Created{' '}
                                        {formatDateTime(
                                            viewingReceipt.created_at,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Notes
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm">
                                        {viewingReceipt.notes ??
                                            'No receiving notes provided.'}
                                    </p>
                                </div>
                            </section>

                            {viewingReceipt.status === 'voided' && (
                                <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

                                        <div>
                                            <p className="font-medium text-destructive">
                                                Receipt Voided
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {viewingReceipt.void_reason ??
                                                    'No void reason provided.'}
                                            </p>

                                            <p className="mt-2 text-xs text-muted-foreground">
                                                By{' '}
                                                {viewingReceipt.voided_by
                                                    ?.name ??
                                                    'Unknown user'}{' '}
                                                on{' '}
                                                {formatDateTime(
                                                    viewingReceipt.voided_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                                {viewingReceipt.can_void && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openVoidModal(viewingReceipt)
                                        }
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                                    >
                                        <RotateCcw className="size-4" />
                                        Void Receipt
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setViewingReceipt(null)}
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {voidingReceipt && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeVoidModal();
                        }
                    }}
                >
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                                    <RotateCcw className="size-5" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Void Receipt
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Reverse{' '}
                                        <span className="font-medium text-foreground">
                                            {voidingReceipt.receipt_number}
                                        </span>{' '}
                                        and restore its previous stock state.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeVoidModal}
                                disabled={voidForm.processing}
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitVoidReceipt}
                            className="space-y-5 p-6"
                        >
                            <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                                <div className="flex items-start gap-3">
                                    <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />

                                    <div>
                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                            This action creates a reversal
                                            record
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-amber-700/80 dark:text-amber-400/80">
                                            The receipt will remain in history
                                            as voided. Stock quantity, weighted
                                            average cost, and purchase order
                                            received quantities will be restored
                                            only when the receipt is still
                                            safely reversible.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Purchase Order
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {
                                            voidingReceipt.purchase_order
                                                .po_number
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Received Value
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {formatCurrency(
                                            voidingReceipt.total_amount,
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Warehouse
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {voidingReceipt.warehouse.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Quantity
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {formatQuantity(
                                            voidingReceipt.total_quantity,
                                        )}{' '}
                                        units
                                    </p>
                                </div>
                            </section>

                            <FormField
                                label="Reason for voiding"
                                error={voidForm.errors.reason}
                                required
                            >
                                <textarea
                                    rows={5}
                                    value={voidForm.data.reason}
                                    onChange={(event) =>
                                        voidForm.setData(
                                            'reason',
                                            event.target.value,
                                        )
                                    }
                                    maxLength={1000}
                                    placeholder="Explain why this receipt must be reversed"
                                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-destructive focus:ring-2 focus:ring-destructive/10"
                                />
                            </FormField>

                            {(voidErrors.receipt || voidErrors.void) && (
                                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {voidErrors.receipt ?? voidErrors.void}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeVoidModal}
                                    disabled={voidForm.processing}
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        voidForm.processing ||
                                        voidForm.data.reason.trim().length < 3
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {voidForm.processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="size-4" />
                                    )}
                                    Confirm Void
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
                    <p className="text-sm text-muted-foreground">{title}</p>

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
                        <h3 className="text-sm font-semibold">{title}</h3>

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

                {required && <span className="ml-1 text-destructive">*</span>}
            </span>

            {children}

            {error && (
                <span className="block text-xs text-destructive">{error}</span>
            )}
        </label>
    );
}

function DetailItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: ReactNode;
    icon: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>

                <p className="mt-1 truncate text-sm font-medium">{value}</p>
            </div>
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
                    strong ? 'font-semibold' : 'text-sm text-muted-foreground'
                }
            >
                {label}
            </span>

            <span
                className={
                    strong ? 'text-xl font-semibold' : 'text-sm font-medium'
                }
            >
                {value}
            </span>
        </div>
    );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
    const style =
        status === 'posted'
            ? 'bg-emerald-500/10 text-emerald-600'
            : 'bg-red-500/10 text-red-600';

    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                style,
            ].join(' ')}
        >
            {status === 'posted' ? (
                <CheckCircle2 className="size-3.5" />
            ) : (
                <XCircle className="size-3.5" />
            )}

            {label}
        </span>
    );
}

function ReceiptPagination({ receipts }: { receipts: PaginatedReceipts }) {
    if (receipts.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {receipts.from ?? 0} to {receipts.to ?? 0} of{' '}
                {receipts.total} receipts
            </p>

            <div className="flex flex-wrap gap-1">
                {receipts.links.map((link, index) => (
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
                                    preserveState: true,

                                    preserveScroll: true,
                                },
                            );
                        }}
                        className={[
                            'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted',
                            !link.url ? 'cursor-not-allowed opacity-40' : '',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function formatCurrency(value: number | string | null): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
}

function formatQuantity(value: number | string | null): string {
    const quantity = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(Number.isFinite(quantity) ? quantity : 0);
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not set';
    }

    const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date);
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}