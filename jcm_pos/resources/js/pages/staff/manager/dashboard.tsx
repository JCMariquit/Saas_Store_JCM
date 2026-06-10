import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    PackageCheck,
    ReceiptText,
    ShoppingCart,
    Store,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { ReactNode } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager Dashboard',
        href: '/staff/manager/dashboard',
    },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type CashDrawer = {
    id: number;
    status: string;
    opening_balance: number;
    expected_balance: number;
    actual_balance: number | null;
    opened_at: string | null;
    closed_at: string | null;
} | null;

type TodayTrend = {
    label: string;
    sales: number;
    transactions: number;
};

type SevenDayTrend = {
    label: string;
    value: number;
};

type TopProduct = {
    product_id: number | null;
    product_name: string;
    sku?: string | null;
    quantity_sold: number;
    total_sales: number;
};

type LowStockProduct = {
    id: number;
    name: string;
    sku?: string | null;
    quantity: number;
    reorder_level: number;
    category_name: string;
};

type RecentSale = {
    id: number;
    sale_no: string;
    grand_total: number;
    payment_status: string | null;
    status: string | null;
    sold_at: string;
};

type Props = {
    branch: Branch;
    summary: {
        today_sales: number;
        today_transactions: number;
        month_sales: number;
        month_transactions: number;
        total_products: number;
        total_quantity: number;
        low_stock: number;
        out_of_stock: number;
    };
    cashDrawer: CashDrawer;
    todayTrend: TodayTrend[];
    sevenDayTrend: SevenDayTrend[];
    topProducts: TopProduct[];
    lowStockProducts: LowStockProduct[];
    recentSales: RecentSale[];
};

function money(value: number | string | null | undefined) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function numberFormat(value: number | string | null | undefined) {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function formatDateTime(value?: string | null) {
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

function pretty(value?: string | null) {
    if (!value) return '—';

    return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status?: string | null) {
    if (status === 'open' || status === 'completed' || status === 'paid') {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    if (status === 'pending' || status === 'partial') {
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    }

    if (status === 'closed' || status === 'cancelled' || status === 'void' || status === 'unpaid') {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    return 'bg-muted text-muted-foreground';
}

export default function ManagerDashboardIndex({
    branch,
    summary,
    cashDrawer,
    todayTrend,
    sevenDayTrend,
    topProducts,
    lowStockProducts,
    recentSales,
}: Props) {
    const maxTodaySales = Math.max(...todayTrend.map((item) => Number(item.sales || 0)), 1);
    const maxSevenDaySales = Math.max(...sevenDayTrend.map((item) => Number(item.value || 0)), 1);
    const maxTopSales = Math.max(...topProducts.map((item) => Number(item.total_sales || 0)), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Store className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Manager Dashboard</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Monitor today’s branch sales, stock health, cash drawer, and important activity.
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
                            <p className="text-xs text-muted-foreground">Cash Drawer</p>

                            {cashDrawer ? (
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(cashDrawer.status)}`}>
                                        {pretty(cashDrawer.status)}
                                    </span>
                                    <span className="text-sm font-semibold">{money(cashDrawer.expected_balance)}</span>
                                </div>
                            ) : (
                                <p className="mt-1 text-sm font-semibold">No drawer record</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Today's Sales"
                        value={money(summary.today_sales)}
                        description={`${numberFormat(summary.today_transactions)} transaction(s) today.`}
                        icon={<Wallet className="size-5" />}
                    />

                    <SummaryCard
                        title="Monthly Sales"
                        value={money(summary.month_sales)}
                        description={`${numberFormat(summary.month_transactions)} transaction(s) this month.`}
                        icon={<TrendingUp className="size-5" />}
                        variant="success"
                    />

                    <SummaryCard
                        title="Total Stock"
                        value={numberFormat(summary.total_quantity)}
                        description={`${numberFormat(summary.total_products)} product(s) in branch.`}
                        icon={<Boxes className="size-5" />}
                        variant="warning"
                    />

                    <SummaryCard
                        title="Stock Alerts"
                        value={numberFormat(summary.low_stock + summary.out_of_stock)}
                        description={`${numberFormat(summary.low_stock)} low, ${numberFormat(summary.out_of_stock)} out.`}
                        icon={<AlertTriangle className="size-5" />}
                        variant="danger"
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Today Sales Activity</h2>
                            <p className="text-sm text-muted-foreground">Sales amount and transaction count by hour.</p>
                        </div>

                        <div className="space-y-4 p-4">
                            {todayTrend.length > 0 ? (
                                todayTrend.map((item) => {
                                    const width = (Number(item.sales || 0) / maxTodaySales) * 100;

                                    return (
                                        <div key={item.label}>
                                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                <div>
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-xs text-muted-foreground">{numberFormat(item.transactions)} transaction(s)</p>
                                                </div>

                                                <p className="font-semibold">{money(item.sales)}</p>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={<ReceiptText className="size-5 text-muted-foreground" />}
                                    title="No sales activity today"
                                    description="Hourly sales will appear once transactions are recorded."
                                />
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">7-Day Sales Trend</h2>
                            <p className="text-sm text-muted-foreground">Recent branch sales movement.</p>
                        </div>

                        <div className="space-y-4 p-4">
                            {sevenDayTrend.length > 0 ? (
                                sevenDayTrend.map((item) => {
                                    const width = (Number(item.value || 0) / maxSevenDaySales) * 100;

                                    return (
                                        <div key={item.label}>
                                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                <p className="font-medium">{item.label}</p>
                                                <p className="font-semibold">{money(item.value)}</p>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={<TrendingUp className="size-5 text-muted-foreground" />}
                                    title="No 7-day trend"
                                    description="Sales trend will appear once transactions are recorded."
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border xl:col-span-1">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Top Products</h2>
                            <p className="text-sm text-muted-foreground">Best sellers this month.</p>
                        </div>

                        <div className="space-y-4 p-4">
                            {topProducts.length > 0 ? (
                                topProducts.map((item, index) => {
                                    const width = (Number(item.total_sales || 0) / maxTopSales) * 100;

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

                                                <p className="whitespace-nowrap font-semibold">{money(item.total_sales)}</p>
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
                                    title="No product sales"
                                    description="Top products will appear after sales are recorded."
                                />
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border xl:col-span-1">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Low Stock Alerts</h2>
                            <p className="text-sm text-muted-foreground">Products that need restocking soon.</p>
                        </div>

                        <div className="divide-y">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{item.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {item.category_name} • SKU: {item.sku || 'No SKU'}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                Low Stock
                                            </span>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Qty: {numberFormat(item.quantity)} / Reorder: {numberFormat(item.reorder_level)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8">
                                    <EmptyState
                                        icon={<PackageCheck className="size-5 text-muted-foreground" />}
                                        title="No low stock"
                                        description="All products are above reorder level."
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border xl:col-span-1">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Quick Actions</h2>
                            <p className="text-sm text-muted-foreground">Common manager tools.</p>
                        </div>

                        <div className="grid gap-3 p-4">
                            <QuickAction href="/staff/manager/pos/monitor" icon={<ShoppingCart className="size-4" />} title="Open POS Monitor" />
                            <QuickAction href="/staff/manager/transactions" icon={<ReceiptText className="size-4" />} title="View Transactions" />
                            <QuickAction href="/staff/manager/stocks" icon={<Boxes className="size-4" />} title="Manage Stocks" />
                            <QuickAction href="/staff/manager/reports/sales" icon={<TrendingUp className="size-4" />} title="Sales Reports" />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex items-center justify-between gap-4 border-b p-4">
                        <div>
                            <h2 className="font-semibold">Recent Sales</h2>
                            <p className="text-sm text-muted-foreground">Latest transactions from this branch.</p>
                        </div>

                        <Link href="/staff/manager/transactions" className="text-sm font-medium text-primary hover:underline">
                            View all
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Sale No.</th>
                                    <th className="px-4 py-3 text-left font-medium">Sold At</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Payment</th>
                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSales.length > 0 ? (
                                    recentSales.map((item) => (
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
                                            <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">{money(item.grand_total)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-14">
                                            <EmptyState
                                                icon={<ReceiptText className="size-5 text-muted-foreground" />}
                                                title="No recent sales"
                                                description="Recent sales will appear here once transactions are recorded."
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                    <h3 className="mt-2 truncate text-xl font-bold tracking-tight xl:text-2xl">{value}</h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>{icon}</div>
            </div>
        </div>
    );
}

function QuickAction({ href, icon, title }: { href: string; icon: ReactNode; title: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3 text-sm font-medium transition hover:bg-muted">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
            {title}
        </Link>
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