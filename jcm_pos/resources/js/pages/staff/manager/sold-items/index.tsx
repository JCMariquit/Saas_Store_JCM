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
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { Fragment, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const SOLD_ITEMS_URL = '/staff/manager/sold-items';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Sold Items', href: SOLD_ITEMS_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type SoldItem = {
    id: number;
    sale_id: number;
    product_id: number;
    product_name: string;
    sku?: string | null;
    quantity: number | string;
    unit_price: number | string;
    unit_cost: number | string;
    discount_amount: number | string;
    line_total: number | string;
    sale_no: string;
    status: 'completed' | 'voided' | 'refunded' | string;
    payment_status: 'paid' | 'partial' | 'unpaid' | string;
    sold_at?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    soldItems: {
        data: SoldItem[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    branch: Branch;
    summary: {
        total_items: number;
        total_quantity: number;
        total_sales: number;
        total_cost: number;
        gross_profit: number;
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
    if (status === 'completed' || status === 'paid') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (status === 'partial') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    if (status === 'voided' || status === 'refunded' || status === 'unpaid') return 'bg-red-500/10 text-red-700 dark:text-red-400';

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

export default function ManagerSoldItemsIndex({ soldItems, branch, summary, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');
    const [openItemId, setOpenItemId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get(
            SOLD_ITEMS_URL,
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

        router.get(SOLD_ITEMS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Sold Items" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Receipt className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Sold Items</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Monitor item-level sales, cost, discounts, and gross profit for this branch.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>
                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>
                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-muted/30 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Current Result</p>
                            <p className="mt-1 text-sm font-semibold">
                                Showing {soldItems.from ?? 0} to {soldItems.to ?? 0} of {soldItems.total} sold item rows
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard title="Sold Rows" value={summary.total_items} description="Filtered sold item rows." icon={Receipt} />
                    <SummaryCard title="Quantity Sold" value={Number(summary.total_quantity).toLocaleString()} description="Total item quantity sold." icon={PackageCheck} variant="success" />
                    <SummaryCard title="Total Sales" value={money(summary.total_sales)} description="Total line sales amount." icon={Wallet} variant="success" />
                    <SummaryCard title="Total Cost" value={money(summary.total_cost)} description="Estimated item cost." icon={Boxes} />
                    <SummaryCard
                        title="Gross Profit"
                        value={money(summary.gross_profit)}
                        description="Sales minus item cost."
                        icon={TrendingUp}
                        variant={summary.gross_profit >= 0 ? 'warning' : 'danger'}
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
                                placeholder="Search sale no, product, SKU..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sale Status</label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="voided">Voided</option>
                                <option value="refunded">Refunded</option>
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
                            <h2 className="font-semibold">Sold Item Records</h2>
                            <p className="text-sm text-muted-foreground">Click a row to view full item sale details.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left font-medium">Sale</th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-right font-medium">Qty</th>
                                    <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                                    <th className="px-4 py-3 text-right font-medium">Line Total</th>
                                    <th className="px-4 py-3 text-left font-medium">Payment</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {soldItems.data.length > 0 ? (
                                    soldItems.data.map((item) => {
                                        const isOpen = openItemId === item.id;
                                        const quantity = numberValue(item.quantity);
                                        const unitCost = numberValue(item.unit_cost);
                                        const lineTotal = numberValue(item.line_total);
                                        const totalCost = quantity * unitCost;
                                        const grossProfit = lineTotal - totalCost;

                                        return (
                                            <Fragment key={item.id}>
                                                <tr
                                                    onClick={() => setOpenItemId(isOpen ? null : item.id)}
                                                    className="cursor-pointer border-t transition hover:bg-muted/40"
                                                >
                                                    <td className="px-4 py-3">
                                                        {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{item.sale_no}</div>
                                                        <div className="text-xs text-muted-foreground">Sale ID: #{item.sale_id}</div>
                                                        <div className="text-xs text-muted-foreground">{shortDateTime(item.sold_at)}</div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                                                <Boxes className="size-4 text-muted-foreground" />
                                                            </div>

                                                            <div>
                                                                <div className="font-medium">{item.product_name}</div>
                                                                <div className="text-xs text-muted-foreground">SKU: {item.sku || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-right">{quantity}</td>
                                                    <td className="px-4 py-3 text-right">{money(item.unit_price)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">{money(item.line_total)}</td>

                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(item.payment_status)}`}>
                                                            {item.payment_status}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td colSpan={8} className="px-4 py-4">
                                                            <div className="space-y-4 rounded-xl border bg-card p-4">
                                                                <div className="grid gap-3 md:grid-cols-4">
                                                                    <Detail label="Sold Item ID" value={`#${item.id}`} />
                                                                    <Detail label="Sale No." value={item.sale_no} />
                                                                    <Detail label="Sale ID" value={`#${item.sale_id}`} />
                                                                    <Detail label="Product ID" value={`#${item.product_id}`} />
                                                                    <Detail label="Product" value={item.product_name} />
                                                                    <Detail label="SKU" value={item.sku || 'N/A'} />
                                                                    <Detail label="Quantity" value={quantity} />
                                                                    <Detail label="Unit Price" value={money(item.unit_price)} />
                                                                    <Detail label="Unit Cost" value={money(item.unit_cost)} />
                                                                    <Detail label="Discount" value={money(item.discount_amount)} />
                                                                    <Detail label="Line Total" value={money(item.line_total)} />
                                                                    <Detail label="Total Cost" value={money(totalCost)} />
                                                                    <Detail label="Gross Profit" value={money(grossProfit)} />
                                                                    <Detail label="Payment Status" value={item.payment_status} />
                                                                    <Detail label="Sale Status" value={item.status} />
                                                                    <Detail label="Sold At" value={shortDateTime(item.sold_at)} />
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
                                        <td colSpan={8} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <Receipt className="size-5 text-muted-foreground" />
                                                </div>

                                                <h3 className="font-medium">No sold items found</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">Sold products from this branch will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {soldItems.links.length > 0 && (
                        <div className="flex flex-col gap-3 border-t p-4 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {soldItems.from ?? 0} to {soldItems.to ?? 0} of {soldItems.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {soldItems.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) router.visit(link.url, { preserveState: true, preserveScroll: true });
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