import { Head, router } from '@inertiajs/react';
import {
    Boxes,
    ChevronDown,
    ChevronRight,
    PackageCheck,
    Receipt,
    RotateCcw,
    Search,
    Store,
    Undo2,
    Wallet,
    XCircle,
} from 'lucide-react';
import { Fragment, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const RETURNS_URL = '/staff/manager/returns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Sales Returns', href: RETURNS_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type ReturnItem = {
    id: number;
    sale_id: number;
    sale_item_id: number;
    product_id: number;
    return_no: string;
    quantity: number | string;
    unit_price: number | string;
    line_total: number | string;
    reason?: string | null;
    status: 'completed' | 'cancelled' | string;
    returned_by?: number | null;
    returned_at?: string | null;
    sale_no?: string | null;
    payment_status?: 'paid' | 'partial' | 'unpaid' | string | null;
    product_name?: string | null;
    sku?: string | null;
    current_product_name?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    returns: {
        data: ReturnItem[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    branch: Branch;
    summary: {
        total_returns: number;
        total_quantity: number;
        total_refund: number;
        completed_returns: number;
        cancelled_returns: number;
    };
    filters: {
        search?: string | null;
        status?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
};

function money(value?: string | number | null) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isNaN(amount) ? 0 : amount);
}

function numberValue(value?: string | number | null) {
    const amount = Number(value ?? 0);
    return Number.isNaN(amount) ? 0 : amount;
}

function shortDateTime(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function statusClass(status?: string | null) {
    if (status === 'completed' || status === 'paid') {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    if (status === 'partial') {
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    }

    if (status === 'cancelled' || status === 'unpaid') {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    return 'bg-muted text-muted-foreground';
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    variant = 'default',
}: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const variantClass = {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
    }[variant];

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

export default function ManagerReturnsIndex({ returns, branch, summary, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');
    const [openItemId, setOpenItemId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get(
            RETURNS_URL,
            {
                search: search || undefined,
                status: status || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        setOpenItemId(null);

        router.get(RETURNS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Sales Returns" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Undo2 className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Sales Returns</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Monitor returned items, refund totals, and return status for this branch.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>
                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>
                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                    {branch.is_active && <span className="rounded-full border px-3 py-1">Active</span>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-muted/30 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Current Result</p>
                            <p className="mt-1 text-sm font-semibold">
                                Showing {returns.from ?? 0} to {returns.to ?? 0} of {returns.total} return rows
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Return Rows"
                        value={summary.total_returns}
                        description="Filtered return item rows."
                        icon={Receipt}
                    />

                    <SummaryCard
                        title="Returned Qty"
                        value={Number(summary.total_quantity).toLocaleString()}
                        description="Total returned quantity."
                        icon={PackageCheck}
                        variant="success"
                    />

                    <SummaryCard
                        title="Refund Total"
                        value={money(summary.total_refund)}
                        description="Total returned item amount."
                        icon={Wallet}
                        variant="warning"
                    />

                    <SummaryCard
                        title="Completed"
                        value={summary.completed_returns}
                        description="Completed return records."
                        icon={Undo2}
                        variant="success"
                    />

                    <SummaryCard
                        title="Cancelled"
                        value={summary.cancelled_returns}
                        description="Cancelled return records."
                        icon={XCircle}
                        variant="danger"
                    />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="relative xl:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
                            <Search className="absolute left-3 top-[34px] size-4 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') applyFilters();
                                }}
                                placeholder="Search return no, sale no, product, SKU..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Return Status</label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

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
                                title="Reset filters"
                            >
                                <RotateCcw className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold">Return Records</h2>
                            <p className="text-sm text-muted-foreground">Click a row to view full return details.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left font-medium">Return</th>
                                    <th className="px-4 py-3 text-left font-medium">Sale</th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-right font-medium">Qty</th>
                                    <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                                    <th className="px-4 py-3 text-right font-medium">Refund</th>
                                    <th className="px-4 py-3 text-left font-medium">Payment</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {returns.data.length > 0 ? (
                                    returns.data.map((item) => {
                                        const isOpen = openItemId === item.id;
                                        const quantity = numberValue(item.quantity);
                                        const refundTotal = numberValue(item.line_total);
                                        const productName =
                                            item.product_name || item.current_product_name || 'Unknown product';

                                        return (
                                            <Fragment key={item.id}>
                                                <tr
                                                    onClick={() => setOpenItemId(isOpen ? null : item.id)}
                                                    className="cursor-pointer border-t transition hover:bg-muted/40"
                                                >
                                                    <td className="px-4 py-3">
                                                        {isOpen ? (
                                                            <ChevronDown className="size-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="size-4 text-muted-foreground" />
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{item.return_no}</div>
                                                        <div className="text-xs text-muted-foreground">Return ID: #{item.id}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {shortDateTime(item.returned_at)}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{item.sale_no || 'No sale no'}</div>
                                                        <div className="text-xs text-muted-foreground">Sale ID: #{item.sale_id}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Sale Item ID: #{item.sale_item_id}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                                                <Boxes className="size-4 text-muted-foreground" />
                                                            </div>

                                                            <div>
                                                                <div className="font-medium">{productName}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    SKU: {item.sku || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-right">{quantity}</td>
                                                    <td className="px-4 py-3 text-right">{money(item.unit_price)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">{money(item.line_total)}</td>

                                                    <td className="px-4 py-3">
                                                        {item.payment_status ? (
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(
                                                                    item.payment_status,
                                                                )}`}
                                                            >
                                                                {item.payment_status}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(
                                                                item.status,
                                                            )}`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td colSpan={9} className="px-4 py-4">
                                                            <div className="space-y-4 rounded-xl border bg-card p-4">
                                                                <div className="grid gap-3 md:grid-cols-4">
                                                                    <Detail label="Return ID" value={`#${item.id}`} />
                                                                    <Detail label="Return No." value={item.return_no} />
                                                                    <Detail label="Sale No." value={item.sale_no || 'N/A'} />
                                                                    <Detail label="Sale ID" value={`#${item.sale_id}`} />
                                                                    <Detail label="Sale Item ID" value={`#${item.sale_item_id}`} />
                                                                    <Detail label="Product ID" value={`#${item.product_id}`} />
                                                                    <Detail label="Product" value={productName} />
                                                                    <Detail label="SKU" value={item.sku || 'N/A'} />
                                                                    <Detail label="Quantity" value={quantity} />
                                                                    <Detail label="Unit Price" value={money(item.unit_price)} />
                                                                    <Detail label="Refund Total" value={money(refundTotal)} />
                                                                    <Detail label="Payment Status" value={item.payment_status || 'N/A'} />
                                                                    <Detail label="Return Status" value={item.status} />
                                                                    <Detail label="Returned By" value={item.returned_by ? `#${item.returned_by}` : 'N/A'} />
                                                                    <Detail label="Returned At" value={shortDateTime(item.returned_at)} />
                                                                    <Detail label="Reason" value={item.reason || 'No reason'} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <Undo2 className="size-5 text-muted-foreground" />
                                                </div>

                                                <h3 className="font-medium">No returns found</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Returned items from this branch will appear here.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {returns.links.length > 0 && (
                        <div className="flex flex-col gap-3 border-t p-4 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {returns.from ?? 0} to {returns.to ?? 0} of {returns.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {returns.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }
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
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function Detail({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium capitalize">{value}</p>
        </div>
    );
}