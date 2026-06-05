import { Head, router } from '@inertiajs/react';
import { Activity, BadgeCheck, CalendarDays, GitBranch, Receipt, RotateCcw, Search, XCircle } from 'lucide-react';
import * as React from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
        href: '/manager/dashboard',
    },
    {
        title: 'Transactions',
        href: '/manager/transactions',
    },
];

type Branch = {
    id: number;
    tenant_id: number;
    name: string;
    code?: string | null;
    is_main?: number | boolean;
    is_active?: number | boolean;
};

type SaleItem = {
    id: number;
    sale_id: number;
    product_id?: number | null;
    product_name?: string | null;
    sku?: string | null;
    quantity?: number | string | null;
    unit_price?: number | string | null;
    discount_amount?: number | string | null;
    line_total?: number | string | null;
};

type Transaction = {
    id: number;
    sale_no?: string | null;
    cashier_user_id?: number | null;
    subtotal?: number | string | null;
    discount_total?: number | string | null;
    tax_total?: number | string | null;
    grand_total?: number | string | null;
    amount_paid?: number | string | null;
    change_amount?: number | string | null;
    payment_status?: string | null;
    status?: string | null;
    remarks?: string | null;
    sold_at?: string | null;
    created_at?: string | null;
    payment_method?: string | null;
    payment_amount?: number | string | null;
    payment_reference_no?: string | null;
    items?: SaleItem[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedTransactions = {
    data: Transaction[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Summary = {
    total_transactions: number;
    total_sales: number;
    total_discount: number;
    total_tax: number;
    completed_count: number;
    voided_count: number;
    refunded_count: number;
};

type Filters = {
    search?: string | null;
    status?: string | null;
    payment_status?: string | null;
    payment_method?: string | null;
    date_from?: string | null;
    date_to?: string | null;
};

type Props = {
    branch?: Branch | null;
    scope?: {
        tenant_id?: number;
        branch_id?: number;
    };
    transactions?: PaginatedTransactions;
    summary?: Summary;
    filters?: Filters;
};

function money(value?: number | string | null) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isNaN(amount) ? 0 : amount);
}

function statusClass(status?: string | null) {
    if (!status) return 'bg-muted text-muted-foreground';

    const normalized = status.toLowerCase();

    if (['completed', 'paid', 'active', 'open'].includes(normalized)) {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    if (['pending', 'partial'].includes(normalized)) {
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    }

    if (['cancelled', 'void', 'voided', 'refunded', 'failed'].includes(normalized)) {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    return 'bg-muted text-muted-foreground';
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
}) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

export default function ManagerTransactionsIndex({ branch = null, scope, transactions, summary, filters }: Props) {
    const [search, setSearch] = React.useState(filters?.search ?? '');
    const [status, setStatus] = React.useState(filters?.status ?? '');
    const [paymentStatus, setPaymentStatus] = React.useState(filters?.payment_status ?? '');
    const [paymentMethod, setPaymentMethod] = React.useState(filters?.payment_method ?? '');
    const [dateFrom, setDateFrom] = React.useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = React.useState(filters?.date_to ?? '');

    const safeTransactions: PaginatedTransactions = transactions ?? {
        data: [],
        links: [],
        current_page: 1,
        last_page: 1,
        from: null,
        to: null,
        total: 0,
    };

    const safeSummary: Summary = {
        total_transactions: summary?.total_transactions ?? 0,
        total_sales: summary?.total_sales ?? 0,
        total_discount: summary?.total_discount ?? 0,
        total_tax: summary?.total_tax ?? 0,
        completed_count: summary?.completed_count ?? 0,
        voided_count: summary?.voided_count ?? 0,
        refunded_count: summary?.refunded_count ?? 0,
    };

    const applyFilters = () => {
        router.get(
            '/staff/manager/transactions',
            {
                search: search || undefined,
                status: status || undefined,
                payment_status: paymentStatus || undefined,
                payment_method: paymentMethod || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setPaymentStatus('');
        setPaymentMethod('');
        setDateFrom('');
        setDateTo('');

        router.get('/staff/manager/transactions', {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Transactions" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Receipt className="size-5" />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
                            <p className="text-sm text-muted-foreground">Branch-scoped transaction monitoring for this manager account.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                            <GitBranch className="size-3" />
                            Branch: {branch?.name ?? scope?.branch_id ?? '—'}
                        </span>
                        <span className="rounded-full border px-3 py-1">Code: {branch?.code ?? '—'}</span>
                        <span className="rounded-full border px-3 py-1">Tenant: {scope?.tenant_id ?? '—'}</span>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <StatCard title="Total Sales" value={money(safeSummary.total_sales)} description="Total sales under current filters." icon={Receipt} />
                    <StatCard title="Transactions" value={safeSummary.total_transactions} description="Number of filtered transactions." icon={Activity} />
                    <StatCard title="Completed" value={safeSummary.completed_count} description="Completed branch sales records." icon={BadgeCheck} />
                    <StatCard title="Refunded / Voided" value={`${safeSummary.refunded_count} / ${safeSummary.voided_count}`} description="Refunded and voided sales count." icon={RotateCcw} />
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-card p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') applyFilters();
                                    }}
                                    placeholder="Sale no, reference, remarks..."
                                    className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="voided">Voided</option>
                                <option value="refunded">Refunded</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Payment</label>
                            <select
                                value={paymentStatus}
                                onChange={(event) => setPaymentStatus(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(event) => setPaymentMethod(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All</option>
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                                <option value="card">Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Search className="size-4" />
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
                            >
                                <XCircle className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => setDateFrom(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold">Transaction Records</h2>
                            <p className="text-sm text-muted-foreground">
                                Showing {safeTransactions.from ?? 0} to {safeTransactions.to ?? 0} of {safeTransactions.total} records.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDays className="size-4" />
                            Current page {safeTransactions.current_page} of {safeTransactions.last_page}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Sale</th>
                                    <th className="px-4 py-3 text-left font-medium">Payment</th>
                                    <th className="px-4 py-3 text-left font-medium">Items</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {safeTransactions.data.length > 0 ? (
                                    safeTransactions.data.map((transaction) => (
                                        <tr key={transaction.id} className="border-t align-top">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{transaction.sale_no ?? `SALE-${transaction.id}`}</div>
                                                <div className="text-xs text-muted-foreground">{transaction.sold_at ?? transaction.created_at ?? 'No date'}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">Cashier ID: {transaction.cashier_user_id ?? '—'}</div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="capitalize">{transaction.payment_method ?? 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">Paid: {money(transaction.amount_paid)}</div>
                                                <div className="text-xs text-muted-foreground">Change: {money(transaction.change_amount)}</div>
                                                {transaction.payment_reference_no && (
                                                    <div className="text-xs text-muted-foreground">Ref: {transaction.payment_reference_no}</div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                {transaction.items && transaction.items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {transaction.items.slice(0, 3).map((item) => (
                                                            <div key={item.id} className="text-xs">
                                                                <span className="font-medium">{item.product_name ?? 'Product'}</span>
                                                                <span className="text-muted-foreground"> × {item.quantity ?? 0}</span>
                                                            </div>
                                                        ))}

                                                        {transaction.items.length > 3 && (
                                                            <div className="text-xs text-muted-foreground">+{transaction.items.length - 3} more item(s)</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No items</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(transaction.status)}`}>
                                                        {transaction.status ?? 'Unknown'}
                                                    </span>

                                                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(transaction.payment_status)}`}>
                                                        {transaction.payment_status ?? 'Unknown payment'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <div className="font-semibold">{money(transaction.grand_total)}</div>
                                                <div className="text-xs text-muted-foreground">Subtotal: {money(transaction.subtotal)}</div>
                                                <div className="text-xs text-muted-foreground">Discount: {money(transaction.discount_total)}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                            No transactions found for this branch.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {safeTransactions.links.length > 0 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t p-4">
                            {safeTransactions.links.map((link, index) => (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) router.visit(link.url, { preserveState: true });
                                    }}
                                    className={[
                                        'h-9 rounded-lg border px-3 text-sm font-medium transition',
                                        link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                        !link.url ? 'cursor-not-allowed opacity-50' : '',
                                    ].join(' ')}
                                >
                                    {cleanLabel(link.label)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}