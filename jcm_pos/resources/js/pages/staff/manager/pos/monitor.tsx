import { Fragment, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Boxes,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    GitBranch,
    Monitor,
    Package2,
    Receipt,
    TrendingUp,
    WalletCards,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
        href: '/manager/dashboard',
    },
    {
        title: 'POS Monitor',
        href: '/manager/pos/monitor',
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

type OpenDrawer = {
    id: number;
    tenant_id?: number;
    branch_id?: number;
    opening_amount?: number | string | null;
    status?: string | null;
    opened_at?: string | null;
};

type Summary = {
    today_sales: number;
    today_transactions: number;
    completed_transactions?: number;
    products_count: number;
    low_stock_count: number;
    out_of_stock_count?: number;
    open_drawer?: OpenDrawer | null;
};

type Product = {
    id: number;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    quantity?: number | string | null;
    reorder_level?: number | string | null;
    selling_price?: number | string | null;
    status?: string | null;
    stock_tracking?: string | null;
    category_name?: string | null;
};

type RecentTransaction = {
    id: number;
    sale_no?: string | null;
    grand_total?: number | string | null;
    amount_paid?: number | string | null;
    change_amount?: number | string | null;
    payment_status?: string | null;
    status?: string | null;
    sold_at?: string | null;
    payment_method?: string | null;
};

type LowStockProduct = {
    id: number;
    name: string;
    quantity?: number | string | null;
    reorder_level?: number | string | null;
};

type SalesTrend = {
    hour: number | string;
    transactions: number | string;
    total_sales: number | string;
};

type Props = {
    branch?: Branch | null;
    summary?: Summary;
    products?: Product[];
    recent_transactions?: RecentTransaction[];
    alerts?: {
        low_stock_products?: LowStockProduct[];
        pending_sales_count?: number;
    };
    sales_trend?: SalesTrend[];
    scope?: {
        tenant_id?: number;
        branch_id?: number;
    };
};

function money(value?: number | string | null) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isNaN(amount) ? 0 : amount);
}

function numberValue(value?: number | string | null) {
    const amount = Number(value ?? 0);

    return Number.isNaN(amount) ? 0 : amount;
}

function shortDateTime(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function hourLabel(value?: number | string | null) {
    const hour = Number(value ?? 0);

    if (Number.isNaN(hour)) return '—';

    const date = new Date();
    date.setHours(hour, 0, 0, 0);

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
    }).format(date);
}

function statusClass(status?: string | null) {
    if (!status) return 'bg-muted text-muted-foreground';

    const normalized = status.toLowerCase().replaceAll(' ', '_');

    if (['completed', 'paid', 'active', 'open', 'in_stock'].includes(normalized)) {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    if (['pending', 'partial', 'low_stock'].includes(normalized)) {
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    }

    if (['cancelled', 'void', 'closed', 'inactive', 'out_of_stock'].includes(normalized)) {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    return 'bg-muted text-muted-foreground';
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    tone = 'default',
}: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const toneClass = {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
    }[tone];

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-dashed p-8 text-center">
            <Icon className="mx-auto size-9 text-muted-foreground" />
            <h3 className="mt-3 font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

export default function ManagerPosMonitorIndex({
    branch = null,
    summary,
    products = [],
    recent_transactions = [],
    alerts,
    sales_trend = [],
    scope,
}: Props) {
    const [openTransactionId, setOpenTransactionId] = useState<number | null>(null);
    const [openProductId, setOpenProductId] = useState<number | null>(null);

    const safeSummary: Summary = {
        today_sales: summary?.today_sales ?? 0,
        today_transactions: summary?.today_transactions ?? 0,
        completed_transactions: summary?.completed_transactions ?? 0,
        products_count: summary?.products_count ?? 0,
        low_stock_count: summary?.low_stock_count ?? 0,
        out_of_stock_count: summary?.out_of_stock_count ?? 0,
        open_drawer: summary?.open_drawer ?? null,
    };

    const lowStockProducts = alerts?.low_stock_products ?? [];
    const pendingSalesCount = alerts?.pending_sales_count ?? 0;

    const maxTrendSales = Math.max(...sales_trend.map((item) => numberValue(item.total_sales)), 1);
    const totalTrendSales = sales_trend.reduce((sum, item) => sum + numberValue(item.total_sales), 0);
    const totalTrendTransactions = sales_trend.reduce((sum, item) => sum + numberValue(item.transactions), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager POS Monitor" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Monitor className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">POS Monitor</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manager branch overview for sales, drawer, product alerts, and recent activity.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <GitBranch className="size-3" />
                                        Branch: {branch?.name ?? scope?.branch_id ?? '—'}
                                    </span>

                                    <span className="rounded-full border px-3 py-1">Code: {branch?.code ?? '—'}</span>
                                    <span className="rounded-full border px-3 py-1">Branch ID: {scope?.branch_id ?? '—'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-2">
                                {safeSummary.open_drawer ? (
                                    <>
                                        <CheckCircle2 className="size-4 text-emerald-600" />
                                        <span className="text-sm font-medium">Drawer Open</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="size-4 text-amber-600" />
                                        <span className="text-sm font-medium">No Open Drawer</span>
                                    </>
                                )}
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {safeSummary.open_drawer
                                    ? `Opened: ${shortDateTime(safeSummary.open_drawer.opened_at)}`
                                    : 'Cashier may need to open drawer before selling.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Today Sales" value={money(safeSummary.today_sales)} description="Completed sales total today." icon={Receipt} tone="success" />

                    <StatCard
                        title="Transactions"
                        value={safeSummary.today_transactions}
                        description={`${safeSummary.completed_transactions ?? 0} completed transactions.`}
                        icon={Activity}
                    />

                    <StatCard title="Products" value={safeSummary.products_count} description="Products assigned to this branch." icon={Package2} />

                    <StatCard
                        title="Stock Alerts"
                        value={safeSummary.low_stock_count}
                        description={`${safeSummary.out_of_stock_count ?? 0} out of stock items.`}
                        icon={AlertTriangle}
                        tone={(safeSummary.low_stock_count ?? 0) > 0 ? 'warning' : 'default'}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-4 border-b p-4">
                            <div>
                                <h2 className="font-semibold">Today Sales Movement</h2>
                                <p className="text-sm text-muted-foreground">Hourly completed sales for this branch.</p>
                            </div>

                            <BarChart3 className="size-5 text-muted-foreground" />
                        </div>

                        <div className="p-5">
                            {sales_trend.length > 0 ? (
                                <div className="space-y-5">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Tracked Sales</p>
                                            <p className="mt-1 text-lg font-semibold">{money(totalTrendSales)}</p>
                                        </div>

                                        <div className="rounded-xl border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Tracked Transactions</p>
                                            <p className="mt-1 text-lg font-semibold">{totalTrendTransactions}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {sales_trend.map((item) => {
                                            const totalSales = numberValue(item.total_sales);
                                            const percent = Math.max((totalSales / maxTrendSales) * 100, 4);

                                            return (
                                                <div key={`${item.hour}`} className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-3 text-xs">
                                                        <span className="font-medium">{hourLabel(item.hour)}</span>
                                                        <span className="text-muted-foreground">
                                                            {money(totalSales)} · {numberValue(item.transactions)} txns
                                                        </span>
                                                    </div>

                                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState icon={TrendingUp} title="No sales trend yet" description="Completed sales today will appear here by hour." />
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-4 border-b p-4">
                            <div>
                                <h2 className="font-semibold">Branch Alerts</h2>
                                <p className="text-sm text-muted-foreground">Items that need manager attention.</p>
                            </div>

                            <AlertTriangle className="size-5 text-muted-foreground" />
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium">Pending Sales</p>
                                        <p className="text-xs text-muted-foreground">Transactions marked as pending today.</p>
                                    </div>

                                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${pendingSalesCount > 0 ? statusClass('pending') : statusClass('completed')}`}>
                                        {pendingSalesCount}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-medium">Low Stock Products</p>
                                    <span className="text-xs text-muted-foreground">{lowStockProducts.length} shown</span>
                                </div>

                                {lowStockProducts.length > 0 ? (
                                    <div className="space-y-2">
                                        {lowStockProducts.map((product) => (
                                            <div key={product.id} className="rounded-xl border p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Qty: {numberValue(product.quantity)} · Reorder: {numberValue(product.reorder_level)}
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                        Low
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon={CheckCircle2} title="No low stock alerts" description="Tracked products are currently above reorder level." />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-4 border-b p-4">
                            <div>
                                <h2 className="font-semibold">Recent Transactions</h2>
                                <p className="text-sm text-muted-foreground">Click a transaction row to view more details.</p>
                            </div>

                            <Receipt className="size-5 text-muted-foreground" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="w-10 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-left font-medium">Sale No.</th>
                                        <th className="px-4 py-3 text-left font-medium">Payment</th>
                                        <th className="px-4 py-3 text-left font-medium">Payment Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Sale Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recent_transactions.length > 0 ? (
                                        recent_transactions.map((transaction) => {
                                            const isOpen = openTransactionId === transaction.id;

                                            return (
                                                <Fragment key={transaction.id}>
                                                    <tr
                                                        onClick={() => setOpenTransactionId(isOpen ? null : transaction.id)}
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
                                                            <div className="font-medium">{transaction.sale_no ?? `SALE-${transaction.id}`}</div>
                                                            <div className="text-xs text-muted-foreground">{shortDateTime(transaction.sold_at)}</div>
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <div className="capitalize">{transaction.payment_method ?? 'N/A'}</div>
                                                            <div className="text-xs text-muted-foreground">Paid: {money(transaction.amount_paid)}</div>
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(transaction.payment_status)}`}>
                                                                {transaction.payment_status ?? 'Unknown'}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(transaction.status)}`}>
                                                                {transaction.status ?? 'Unknown'}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-semibold">{money(transaction.grand_total)}</td>
                                                    </tr>

                                                    {isOpen && (
                                                        <tr className="border-t bg-muted/20">
                                                            <td colSpan={6} className="px-4 py-4">
                                                                <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Sale ID</p>
                                                                        <p className="font-medium">#{transaction.id}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Grand Total</p>
                                                                        <p className="font-medium">{money(transaction.grand_total)}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Amount Paid</p>
                                                                        <p className="font-medium">{money(transaction.amount_paid)}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Change</p>
                                                                        <p className="font-medium">{money(transaction.change_amount)}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Payment Method</p>
                                                                        <p className="font-medium capitalize">{transaction.payment_method ?? 'N/A'}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Payment Status</p>
                                                                        <p className="font-medium capitalize">{transaction.payment_status ?? 'Unknown'}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Sale Status</p>
                                                                        <p className="font-medium capitalize">{transaction.status ?? 'Unknown'}</p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Sold At</p>
                                                                        <p className="font-medium">{shortDateTime(transaction.sold_at)}</p>
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
                                            <td colSpan={6} className="px-4 py-10">
                                                <EmptyState icon={Receipt} title="No recent transactions" description="Latest branch transactions will appear here." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between gap-4 border-b p-4">
                            <div>
                                <h2 className="font-semibold">Cash Drawer</h2>
                                <p className="text-sm text-muted-foreground">Current drawer status for this branch.</p>
                            </div>

                            <WalletCards className="size-5 text-muted-foreground" />
                        </div>

                        <div className="p-5">
                            {safeSummary.open_drawer ? (
                                <div className="space-y-4">
                                    <div className="rounded-xl border bg-emerald-500/5 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Status</span>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(safeSummary.open_drawer.status)}`}>
                                                {safeSummary.open_drawer.status ?? 'Open'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-b pb-3">
                                        <span className="text-sm text-muted-foreground">Opening Amount</span>
                                        <span className="font-semibold">{money(safeSummary.open_drawer.opening_amount)}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b pb-3">
                                        <span className="text-sm text-muted-foreground">Opened At</span>
                                        <span className="text-sm">{shortDateTime(safeSummary.open_drawer.opened_at)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Drawer ID</span>
                                        <span className="text-sm">#{safeSummary.open_drawer.id}</span>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState icon={WalletCards} title="No Open Drawer" description="There is no active cash drawer for this branch." />
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">Branch Product Watchlist</h2>
                            <p className="text-sm text-muted-foreground">Click a product row to view stock and barcode details.</p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            Top 10 monitored products
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Category</th>
                                    <th className="px-4 py-3 text-left font-medium">Stock</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Price</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.length > 0 ? (
                                    products.map((product) => {
                                        const quantity = numberValue(product.quantity);
                                        const reorderLevel = numberValue(product.reorder_level);
                                        const isTracked = product.stock_tracking === 'tracked';
                                        const isOutOfStock = isTracked && quantity <= 0;
                                        const isLowStock = isTracked && quantity > 0 && quantity <= reorderLevel;
                                        const isOpen = openProductId === product.id;

                                        let displayStatus = product.status ?? 'Unknown';

                                        if (isOutOfStock) displayStatus = 'Out of Stock';
                                        else if (isLowStock) displayStatus = 'Low Stock';

                                        return (
                                            <Fragment key={product.id}>
                                                <tr
                                                    onClick={() => setOpenProductId(isOpen ? null : product.id)}
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
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground">SKU: {product.sku ?? 'N/A'}</div>
                                                    </td>

                                                    <td className="px-4 py-3">{product.category_name ?? 'Uncategorized'}</td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{isTracked ? quantity : 'Untracked'}</div>
                                                        <div className="text-xs text-muted-foreground">{isTracked ? `Reorder: ${reorderLevel}` : 'No stock deduction'}</div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                isOutOfStock
                                                                    ? statusClass('out_of_stock')
                                                                    : isLowStock
                                                                      ? statusClass('low_stock')
                                                                      : statusClass(product.status)
                                                            }`}
                                                        >
                                                            {displayStatus}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-semibold">{money(product.selling_price)}</td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td colSpan={6} className="px-4 py-4">
                                                            <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Product ID</p>
                                                                    <p className="font-medium">#{product.id}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">SKU</p>
                                                                    <p className="font-medium">{product.sku ?? 'N/A'}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Barcode</p>
                                                                    <p className="font-medium">{product.barcode ?? 'N/A'}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Category</p>
                                                                    <p className="font-medium">{product.category_name ?? 'Uncategorized'}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Stock Tracking</p>
                                                                    <p className="font-medium capitalize">{product.stock_tracking ?? 'Unknown'}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Quantity</p>
                                                                    <p className="font-medium">{isTracked ? quantity : 'Untracked'}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Reorder Level</p>
                                                                    <p className="font-medium">{isTracked ? reorderLevel : 'N/A'}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Selling Price</p>
                                                                    <p className="font-medium">{money(product.selling_price)}</p>
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
                                        <td colSpan={6} className="px-4 py-10">
                                            <EmptyState icon={Boxes} title="No products found" description="Products assigned to this branch will appear here." />
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