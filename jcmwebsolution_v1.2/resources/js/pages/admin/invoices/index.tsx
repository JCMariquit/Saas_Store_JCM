import {
    FieldLabel,
    inputClassName,
    ModuleDrawer,
    ModuleEmpty,
    ModuleMetric,
    ModulePageHeader,
    ModuleStatus,
    selectClassName,
    textareaClassName,
} from '@/components/admin-ui/module-workspace';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    CalendarClock,
    CircleDollarSign,
    FileText,
    Plus,
    Search,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

type InvoiceItem = {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
};

type Invoice = {
    id: number;
    invoice_number: string;
    order_id?: number | null;
    subscription_id?: number | null;
    user_id: number;
    product_id?: number | null;
    status: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    notes?: string | null;
    paid_at?: string | null;
    created_at: string;
    user_name: string;
    user_email: string;
    product_name?: string | null;
    order_code?: string | null;
    subscription_code?: string | null;
    items: InvoiceItem[];
};

type Order = {
    id: number;
    order_code: string;
    user_id: number;
    product_id?: number | null;
    subscription_id?: number | null;
    amount: number;
    currency: string;
    status: string;
    user_name: string;
    user_email: string;
    product_name?: string | null;
};

type User = { id: number; name: string; email: string };
type Product = { id: number; name: string; product_code: string };

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

type Props = {
    invoices: Paginated<Invoice>;
    orders: Order[];
    users: User[];
    products: Product[];
    filters: { search?: string; status?: string };
    stats: {
        total: number;
        outstanding: number;
        paid: number;
        overdue: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sales & Billing', href: '/admin/orders' },
    { title: 'Invoices', href: '/admin/invoices' },
];

function money(value: number | string, currency = 'PHP') {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

export default function Invoices({
    invoices,
    orders,
    users,
    products,
    filters,
    stats,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [selected, setSelected] = useState<Invoice | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const form = useForm({
        order_id: '',
        user_id: '',
        product_id: '',
        description: 'JCM system subscription and services',
        quantity: 1,
        unit_price: '',
        tax_amount: 0,
        discount_amount: 0,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 7 * 86400000)
            .toISOString()
            .slice(0, 10),
        status: 'issued',
        notes: '',
    });

    const selectedOrder = useMemo(
        () =>
            orders.find(
                (order) => String(order.id) === form.data.order_id,
            ),
        [form.data.order_id, orders],
    );

    const estimate = useMemo(() => {
        const quantity = Number(form.data.quantity || 0);
        const unitPrice = Number(
            form.data.unit_price || selectedOrder?.amount || 0,
        );
        const subtotal = quantity * unitPrice;
        return Math.max(
            0,
            subtotal +
                Number(form.data.tax_amount || 0) -
                Number(form.data.discount_amount || 0),
        );
    }, [form.data, selectedOrder]);

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/admin/invoices',
            { search, status },
            { preserveState: true, replace: true },
        );
    }

    function chooseOrder(value: string) {
        form.setData('order_id', value);
        const order = orders.find((item) => String(item.id) === value);
        if (order) {
            form.setData('user_id', String(order.user_id));
            form.setData(
                'product_id',
                order.product_id ? String(order.product_id) : '',
            );
            form.setData('unit_price', String(order.amount));
            form.setData(
                'description',
                `${order.product_name ?? 'JCM system'} — ${order.order_code}`,
            );
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />

            <div className="space-y-5">
                <ModulePageHeader
                    eyebrow="Billing Operations"
                    title="Invoices"
                    description="Create billing documents from verified orders or manual account charges, then control issuance, payment, due dates, and void status."
                    actions={
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="rounded-xl"
                        >
                            <Plus className="size-4" />
                            New invoice
                        </Button>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ModuleMetric
                        label="Invoices"
                        value={stats.total}
                        hint="All generated documents"
                        icon={FileText}
                    />
                    <ModuleMetric
                        label="Outstanding"
                        value={money(stats.outstanding)}
                        hint="Issued and overdue"
                        icon={CalendarClock}
                    />
                    <ModuleMetric
                        label="Paid revenue"
                        value={money(stats.paid)}
                        hint="Marked paid invoices"
                        icon={Banknote}
                    />
                    <ModuleMetric
                        label="Overdue"
                        value={stats.overdue}
                        hint="Past due documents"
                        icon={TriangleAlert}
                    />
                </div>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 flex flex-col gap-3 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-foreground text-sm font-semibold">
                                Invoice register
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Open a row to review line items and billing controls.
                            </p>
                        </div>

                        <form
                            onSubmit={applyFilters}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Invoice, order, or account..."
                                    className={`${inputClassName} sm:w-64 pl-9`}
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className={`${selectClassName} sm:w-40`}
                            >
                                <option value="">All statuses</option>
                                <option value="draft">Draft</option>
                                <option value="issued">Issued</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                                <option value="void">Void</option>
                            </select>
                            <Button type="submit" variant="outline">
                                Apply
                            </Button>
                        </form>
                    </div>

                    {invoices.data.length === 0 ? (
                        <ModuleEmpty
                            icon={FileText}
                            title="No invoices found"
                            description="Create an invoice from a verified order or a manual account charge."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left text-xs">
                                <thead>
                                    <tr className="border-border/70 text-muted-foreground border-b">
                                        <th className="px-4 py-3 font-semibold">
                                            Invoice
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Account
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Product / order
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Due date
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.data.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            onClick={() =>
                                                setSelected(invoice)
                                            }
                                            className="border-border/60 hover:bg-primary/[0.035] cursor-pointer border-b last:border-b-0"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-semibold">
                                                    {invoice.invoice_number}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    Issued{' '}
                                                    {new Date(
                                                        invoice.issue_date,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-medium">
                                                    {invoice.user_name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {invoice.user_email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p>
                                                    {invoice.product_name ??
                                                        'Manual billing'}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {invoice.order_code ??
                                                        invoice.subscription_code ??
                                                        'No linked order'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                {new Date(
                                                    invoice.due_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="text-foreground px-4 py-4 font-semibold tabular-nums">
                                                {money(
                                                    invoice.total_amount,
                                                    invoice.currency,
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <ModuleStatus
                                                    value={invoice.status}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-border/70 flex items-center justify-between border-t px-4 py-3">
                        <p className="text-muted-foreground text-xs">
                            Page {invoices.current_page} of{' '}
                            {invoices.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!invoices.prev_page_url}
                                onClick={() =>
                                    invoices.prev_page_url &&
                                    router.visit(invoices.prev_page_url)
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!invoices.next_page_url}
                                onClick={() =>
                                    invoices.next_page_url &&
                                    router.visit(invoices.next_page_url)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            <ModuleDrawer
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create invoice"
                description="Link a verified order or enter a manual billing item."
                widthClassName="max-w-2xl"
                footer={
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-muted-foreground text-[10px] font-semibold uppercase">
                                Estimated total
                            </p>
                            <p className="text-foreground mt-1 text-lg font-bold">
                                {money(estimate)}
                            </p>
                        </div>
                        <Button
                            type="button"
                            className="rounded-xl"
                            disabled={form.processing}
                            onClick={() =>
                                form.post('/admin/invoices', {
                                    onSuccess: () => {
                                        form.reset();
                                        setCreateOpen(false);
                                    },
                                })
                            }
                        >
                            Create invoice
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <div>
                        <FieldLabel>Verified order (optional)</FieldLabel>
                        <select
                            value={form.data.order_id}
                            onChange={(event) =>
                                chooseOrder(event.target.value)
                            }
                            className={selectClassName}
                        >
                            <option value="">
                                Manual invoice — no linked order
                            </option>
                            {orders.map((order) => (
                                <option key={order.id} value={order.id}>
                                    {order.order_code} — {order.user_name} —{' '}
                                    {money(order.amount, order.currency)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {!form.data.order_id && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <FieldLabel>Account owner</FieldLabel>
                                <select
                                    value={form.data.user_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'user_id',
                                            event.target.value,
                                        )
                                    }
                                    className={selectClassName}
                                >
                                    <option value="">Select account</option>
                                    {users.map((user) => (
                                        <option
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.name} — {user.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FieldLabel>Product (optional)</FieldLabel>
                                <select
                                    value={form.data.product_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'product_id',
                                            event.target.value,
                                        )
                                    }
                                    className={selectClassName}
                                >
                                    <option value="">No product</option>
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <FieldLabel>Line item description</FieldLabel>
                        <input
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData(
                                    'description',
                                    event.target.value,
                                )
                            }
                            className={inputClassName}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <FieldLabel>Quantity</FieldLabel>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.data.quantity}
                                onChange={(event) =>
                                    form.setData(
                                        'quantity',
                                        Number(event.target.value),
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>
                        <div>
                            <FieldLabel>Unit price</FieldLabel>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.unit_price}
                                onChange={(event) =>
                                    form.setData(
                                        'unit_price',
                                        event.target.value,
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>
                        <div>
                            <FieldLabel>Status</FieldLabel>
                            <select
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData(
                                        'status',
                                        event.target.value,
                                    )
                                }
                                className={selectClassName}
                            >
                                <option value="draft">Draft</option>
                                <option value="issued">Issued</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <FieldLabel>Tax amount</FieldLabel>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.tax_amount}
                                onChange={(event) =>
                                    form.setData(
                                        'tax_amount',
                                        Number(event.target.value),
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>
                        <div>
                            <FieldLabel>Discount amount</FieldLabel>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.discount_amount}
                                onChange={(event) =>
                                    form.setData(
                                        'discount_amount',
                                        Number(event.target.value),
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <FieldLabel>Issue date</FieldLabel>
                            <input
                                type="date"
                                value={form.data.issue_date}
                                onChange={(event) =>
                                    form.setData(
                                        'issue_date',
                                        event.target.value,
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>
                        <div>
                            <FieldLabel>Due date</FieldLabel>
                            <input
                                type="date"
                                value={form.data.due_date}
                                onChange={(event) =>
                                    form.setData(
                                        'due_date',
                                        event.target.value,
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Notes</FieldLabel>
                        <textarea
                            rows={4}
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            className={textareaClassName}
                        />
                    </div>
                </div>
            </ModuleDrawer>

            <ModuleDrawer
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.invoice_number ?? 'Invoice'}
                description={
                    selected
                        ? `${selected.user_name} · ${selected.user_email}`
                        : undefined
                }
                footer={
                    selected && (
                        <div className="flex flex-wrap gap-2">
                            {!['paid', 'void'].includes(selected.status) && (
                                <Button
                                    type="button"
                                    className="flex-1 rounded-xl"
                                    onClick={() =>
                                        router.post(
                                            `/admin/invoices/${selected.id}/mark-paid`,
                                            {},
                                            {
                                                onSuccess: () =>
                                                    setSelected(null),
                                            },
                                        )
                                    }
                                >
                                    Mark paid
                                </Button>
                            )}
                            {!['paid', 'void'].includes(selected.status) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.post(
                                            `/admin/invoices/${selected.id}/void`,
                                            {},
                                            {
                                                onSuccess: () =>
                                                    setSelected(null),
                                            },
                                        )
                                    }
                                >
                                    Void invoice
                                </Button>
                            )}
                            {['draft', 'void'].includes(selected.status) && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm('Delete this invoice?')) {
                                            router.delete(
                                                `/admin/invoices/${selected.id}`,
                                                {
                                                    onSuccess: () =>
                                                        setSelected(null),
                                                },
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            )}
                        </div>
                    )
                }
            >
                {selected && (
                    <div className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Info label="Status">
                                <ModuleStatus value={selected.status} />
                            </Info>
                            <Info label="Total">
                                <span className="text-lg font-bold">
                                    {money(
                                        selected.total_amount,
                                        selected.currency,
                                    )}
                                </span>
                            </Info>
                            <Info label="Issue date">
                                {new Date(
                                    selected.issue_date,
                                ).toLocaleDateString()}
                            </Info>
                            <Info label="Due date">
                                {new Date(
                                    selected.due_date,
                                ).toLocaleDateString()}
                            </Info>
                        </div>

                        <section className="border-border/70 bg-card overflow-hidden rounded-2xl border">
                            <div className="border-border/70 px-4 py-3 border-b">
                                <h3 className="text-foreground text-xs font-semibold uppercase tracking-widest">
                                    Line items
                                </h3>
                            </div>
                            {selected.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="border-border/60 flex items-start justify-between gap-3 border-b px-4 py-4 last:border-b-0"
                                >
                                    <div>
                                        <p className="text-foreground text-sm font-medium">
                                            {item.description}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {item.quantity} ×{' '}
                                            {money(
                                                item.unit_price,
                                                selected.currency,
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-foreground font-semibold">
                                        {money(
                                            item.line_total,
                                            selected.currency,
                                        )}
                                    </p>
                                </div>
                            ))}
                        </section>

                        <section className="border-border/70 bg-muted/20 space-y-2 rounded-xl border p-4 text-xs">
                            <SummaryRow
                                label="Subtotal"
                                value={money(
                                    selected.subtotal,
                                    selected.currency,
                                )}
                            />
                            <SummaryRow
                                label="Tax"
                                value={money(
                                    selected.tax_amount,
                                    selected.currency,
                                )}
                            />
                            <SummaryRow
                                label="Discount"
                                value={`-${money(
                                    selected.discount_amount,
                                    selected.currency,
                                )}`}
                            />
                            <div className="border-border/70 mt-3 flex items-center justify-between border-t pt-3 text-sm font-bold">
                                <span>Total</span>
                                <span>
                                    {money(
                                        selected.total_amount,
                                        selected.currency,
                                    )}
                                </span>
                            </div>
                        </section>

                        {selected.notes && (
                            <Info label="Notes">{selected.notes}</Info>
                        )}
                    </div>
                )}
            </ModuleDrawer>
        </AppLayout>
    );
}

function Info({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-border/70 bg-card rounded-xl border p-4">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
                {label}
            </p>
            <div className="text-foreground mt-2 text-sm">{children}</div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-muted-foreground flex items-center justify-between">
            <span>{label}</span>
            <span className="text-foreground tabular-nums">{value}</span>
        </div>
    );
}
