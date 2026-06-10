import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Coins,
    PackageCheck,
    ReceiptText,
    RotateCcw,
    Search,
    Store,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { ReactNode, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const SALES_REPORT_URL = '/staff/manager/reports/sales';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Sales Reports', href: SALES_REPORT_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type DailySale = {
    date: string;
    transactions: number;
    total: number;
};

type TopProduct = {
    product_id: number | null;
    product_name: string;
    sku?: string | null;
    quantity_sold: number;
    total_sales: number;
    total_cost: number;
    gross_profit: number;
};

type RecentSale = {
    id: number;
    sale_no: string;
    cashier_user_id: number | null;
    subtotal: number;
    discount_total: number;
    tax_total: number;
    grand_total: number;
    amount_paid: number;
    change_amount: number;
    payment_status: string | null;
    status: string | null;
    sold_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    branch: Branch;
    summary: {
        total_transactions: number;
        total_sales: number;
        subtotal: number;
        total_discount: number;
        total_tax: number;
        total_paid: number;
        total_change: number;
        total_items_sold: number;
        total_cost: number;
        gross_profit: number;
    };
    dailySales: DailySale[];
    topProducts: TopProduct[];
    recentSales: {
        data: RecentSale[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    statuses: string[];
    paymentStatuses: string[];
    filters: {
        date_from?: string | null;
        date_to?: string | null;
        status?: string | null;
        payment_status?: string | null;
    };
};

function money(value: number | string | null | undefined) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}

function numberFormat(value: number | string | null | undefined) {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatDateTime(value: string) {
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

function pretty(value?: string | null) {
    if (!value) return '—';

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function statusClass(status?: string | null) {
    if (status === 'completed' || status === 'paid') {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    if (status === 'pending' || status === 'partial') {
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    }

    if (status === 'cancelled' || status === 'void' || status === 'unpaid') {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    return 'bg-muted text-muted-foreground';
}

export default function ManagerSalesReportsIndex({
    branch,
    summary,
    dailySales,
    topProducts,
    recentSales,
    statuses,
    paymentStatuses,
    filters,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [paymentStatus, setPaymentStatus] = useState(filters?.payment_status ?? '');

    const maxDailyTotal = Math.max(...dailySales.map((item) => Number(item.total || 0)), 1);
    const maxProductSales = Math.max(...topProducts.map((item) => Number(item.total_sales || 0)), 1);

    const applyFilters = () => {
        router.get(
            SALES_REPORT_URL,
            {
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                status: status || undefined,
                payment_status: paymentStatus || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setDateFrom('');
        setDateTo('');
        setStatus('');
        setPaymentStatus('');

        router.get(SALES_REPORT_URL, {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Sales Reports" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <BarChart3 className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Sales Reports</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Review branch sales performance, sold items, revenue, and top products.
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
                                Showing {recentSales.from ?? 0} to {recentSales.to ?? 0} of {recentSales.total} sales
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Total Sales"
                        value={money(summary.total_sales)}
                        description="Gross sales in selected."
                        icon={<Wallet className="size-5" />}
                    />

                    <SummaryCard
                        title="Transactions"
                        value={numberFormat(summary.total_transactions)}
                        description="Total completed sale."
                        icon={<ReceiptText className="size-5" />}
                        variant="success"
                    />

                    <SummaryCard
                        title="Items Sold"
                        value={numberFormat(summary.total_items_sold)}
                        description="Total quantity sold."
                        icon={<PackageCheck className="size-5" />}
                        variant="warning"
                    />

                    <SummaryCard
                        title="Gross Profit"
                        value={money(summary.gross_profit)}
                        description="Sales less item cost."
                        icon={<TrendingUp className="size-5" />}
                    />

                    <SummaryCard
                        title="Discounts"
                        value={money(summary.total_discount)}
                        description="Total discount given."
                        icon={<Coins className="size-5" />}
                        variant="danger"
                    />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
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

                        <FilterSelect label="Sale Status" value={status} onChange={setStatus}>
                            <option value="">All Status</option>
                            {statuses.map((item) => (
                                <option key={item} value={item}>
                                    {pretty(item)}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect label="Payment Status" value={paymentStatus} onChange={setPaymentStatus}>
                            <option value="">All Payments</option>
                            {paymentStatuses.map((item) => (
                                <option key={item} value={item}>
                                    {pretty(item)}
                                </option>
                            ))}
                        </FilterSelect>

                        <div className="flex items-end gap-2 xl:col-span-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 w-[120px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Search className="size-4" />
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Daily Sales Trend</h2>
                            <p className="text-sm text-muted-foreground">Sales performance per day in the selected range.</p>
                        </div>

                        <div className="space-y-4 p-4">
                            {dailySales.length > 0 ? (
                                dailySales.map((item) => {
                                    const width = (Number(item.total || 0) / maxDailyTotal) * 100;

                                    return (
                                        <div key={item.date}>
                                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                <div>
                                                    <p className="font-medium">{formatDate(item.date)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {numberFormat(item.transactions)} transaction(s)
                                                    </p>
                                                </div>

                                                <p className="font-semibold">{money(item.total)}</p>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={<CalendarDays className="size-5 text-muted-foreground" />}
                                    title="No daily sales found"
                                    description="Sales trend will appear once transactions are recorded."
                                />
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Top Selling Products</h2>
                            <p className="text-sm text-muted-foreground">Products ranked by sales amount.</p>
                        </div>

                        <div className="space-y-4 p-4">
                            {topProducts.length > 0 ? (
                                topProducts.map((item, index) => {
                                    const width = (Number(item.total_sales || 0) / maxProductSales) * 100;

                                    return (
                                        <div key={`${item.product_id}-${item.product_name}`}>
                                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        #{index + 1} {item.product_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        SKU: {item.sku || 'No SKU'} • Qty: {numberFormat(item.quantity_sold)}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-semibold">{money(item.total_sales)}</p>
                                                    <p className="text-xs text-muted-foreground">Profit: {money(item.gross_profit)}</p>
                                                </div>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={<PackageCheck className="size-5 text-muted-foreground" />}
                                    title="No product sales found"
                                    description="Top products will appear after items are sold."
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Recent Sales</h2>
                        <p className="text-sm text-muted-foreground">Latest sales included in this report.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Sale No.</th>
                                    <th className="px-4 py-3 text-left font-medium">Sold At</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Payment</th>
                                    <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                                    <th className="px-4 py-3 text-right font-medium">Discount</th>
                                    <th className="px-4 py-3 text-right font-medium">Grand Total</th>
                                    <th className="px-4 py-3 text-right font-medium">Paid</th>
                                    <th className="px-4 py-3 text-right font-medium">Change</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSales.data.length > 0 ? (
                                    recentSales.data.map((item) => (
                                        <tr key={item.id} className="border-t transition hover:bg-muted/40">
                                            <td className="whitespace-nowrap px-4 py-4 font-medium">{item.sale_no}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatDateTime(item.sold_at)}</td>

                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>
                                                    {pretty(item.status)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.payment_status)}`}>
                                                    {pretty(item.payment_status)}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4 text-right">{money(item.subtotal)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right text-muted-foreground">
                                                {money(item.discount_total)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">{money(item.grand_total)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right">{money(item.amount_paid)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right text-muted-foreground">{money(item.change_amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-14">
                                            <EmptyState
                                                icon={<ReceiptText className="size-5 text-muted-foreground" />}
                                                title="No sales found"
                                                description="Try changing your filters or record a new sale first."
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {recentSales.links.length > 0 && (
                        <div className="flex flex-col gap-3 border-t p-4 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {recentSales.from ?? 0} to {recentSales.to ?? 0} of {recentSales.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {recentSales.links.map((link, index) => (
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
                                            'inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition',
                                            link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                            !link.url ? 'cursor-not-allowed opacity-50' : '',
                                        ].join(' ')}
                                    >
                                        {link.label.includes('Previous') ? <ChevronLeft className="size-4" /> : null}
                                        {link.label.includes('Next') ? <ChevronRight className="size-4" /> : cleanLabel(link.label)}
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

function SummaryCard({
    title,
    value,
    description,
    icon,
    variant = 'default',
}: {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
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
                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>{icon}</div>
            </div>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
                {children}
            </select>
        </div>
    );
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">{icon}</div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}