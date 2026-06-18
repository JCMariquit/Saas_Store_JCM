import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Building2,
    ChevronDown,
    ChevronRight,
    Clock3,
    Package,
    PackageX,
    Receipt,
    RotateCcw,
    ShoppingCart,
    Store,
    TrendingUp,
    UserCheck,
    Wallet,
    X,
} from 'lucide-react';
import { Fragment, ReactNode, useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const POS_MONITOR_URL = '/client/pos/monitor';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'POS',
        href: '/client/pos/terminal',
    },
    {
        title: 'POS Monitor',
        href: POS_MONITOR_URL,
    },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean | number;
    is_active?: boolean | number;
};

type Summary = {
    today_sales: number;
    today_transactions: number;
    completed_transactions: number;
    products_count: number;
    low_stock_count: number;
    out_of_stock_count: number;
    open_drawers_count: number;
    open_drawers?: OpenDrawer[];
};

type OpenDrawer = {
    id: number;
    branch_id: number;
    opening_amount: number | string;
    expected_balance: number | string;
    total_cash_sales: number | string;
    status: string;
    opened_at: string;
    branch_name?: string | null;
    opened_by_name?: string | null;
};

type ProductPreview = {
    id: number;
    branch_id: number;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    quantity: number | string;
    reorder_level: number | string;
    selling_price: number | string;
    status: string;
    stock_tracking: 'tracked' | 'not_tracked';
    category_name?: string | null;
    branch_name?: string | null;
};

type RecentTransaction = {
    id: number;
    branch_id: number;
    sale_no: string;
    grand_total: number | string;
    amount_paid: number | string;
    change_amount: number | string;
    payment_status: string;
    status: string;
    sold_at: string;
    payment_method?: string | null;
    branch_name?: string | null;
    cashier_name?: string | null;
};

type CashierActivity = {
    cashier_user_id: number | null;
    cashier_name?: string | null;
    branch_name?: string | null;
    transactions_count: number | string;
    total_sales: number | string;
    last_sale_at?: string | null;
};

type LowStockProduct = {
    id: number;
    name: string;
    quantity: number | string;
    reorder_level: number | string;
    branch_name?: string | null;
};

type Alerts = {
    low_stock_products: LowStockProduct[];
    pending_sales_count: number;
};

type SalesTrend = {
    hour: number;
    transactions: number | string;
    total_sales: number | string;
};

type Props = {
    branches?: Branch[];
    selected_branch_id?: number | string | null;
    summary: Summary;
    products?: ProductPreview[];
    recent_transactions?: RecentTransaction[];
    cashiers?: CashierActivity[];
    alerts: Alerts;
    sales_trend?: SalesTrend[];
    filters?: {
        branch_id?: number | string | null;
    };
};

function money(value?: number | string | null) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function formatNumber(value?: number | string | null) {
    return new Intl.NumberFormat('en-PH').format(Number(value ?? 0));
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';

    return new Date(value).toLocaleString('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusClass(status?: string | null) {
    if (status === 'completed' || status === 'paid' || status === 'open' || status === 'active') {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    if (status === 'pending') {
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    }

    if (status === 'cancelled' || status === 'void' || status === 'closed' || status === 'inactive') {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    return 'bg-muted text-muted-foreground';
}

function paymentClass(method?: string | null) {
    if (method === 'cash') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (method === 'gcash') return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    if (method === 'card') return 'bg-violet-500/10 text-violet-700 dark:text-violet-400';
    if (method === 'bank_transfer') return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';

    return 'bg-muted text-muted-foreground';
}

function getStockState(product: ProductPreview) {
    if (product.stock_tracking === 'not_tracked') {
        return {
            label: 'Not Tracked',
            className: 'bg-muted text-muted-foreground',
        };
    }

    const quantity = Number(product.quantity ?? 0);
    const reorderLevel = Number(product.reorder_level ?? 0);

    if (quantity <= 0) {
        return {
            label: 'Out of Stock',
            className: 'bg-red-500/10 text-red-700 dark:text-red-400',
        };
    }

    if (quantity <= reorderLevel) {
        return {
            label: 'Low Stock',
            className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        };
    }

    return {
        label: 'In Stock',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    };
}

function hourLabel(hour: number) {
    const date = new Date();

    date.setHours(hour, 0, 0, 0);

    return date.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        hour12: true,
    });
}

export default function OwnerPosMonitorIndex({
    branches = [],
    selected_branch_id,
    summary,
    products = [],
    recent_transactions = [],
    cashiers = [],
    alerts,
    sales_trend = [],
}: Props) {
    const [selectedBranch, setSelectedBranch] = useState(String(selected_branch_id ?? ''));
    const [showBranchPicker, setShowBranchPicker] = useState(false);
    const [openTransactionId, setOpenTransactionId] = useState<number | null>(null);

    const activeBranch = branches.find((branch) => String(branch.id) === String(selectedBranch)) ?? null;

    const branchName = activeBranch?.name ?? 'All Branches';
    const branchCode = activeBranch?.code ?? 'Tenant-wide monitoring';
    const openDrawers = summary.open_drawers ?? [];

    const maxTrendSales = Math.max(...sales_trend.map((item) => Number(item.total_sales || 0)), 1);

    const bestCashier = useMemo(() => {
        return [...cashiers].sort((a, b) => Number(b.total_sales || 0) - Number(a.total_sales || 0))[0] ?? null;
    }, [cashiers]);

    const resetFilter = () => {
        setSelectedBranch('');
        setShowBranchPicker(false);

        router.get(POS_MONITOR_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const selectBranch = (branchId: number) => {
        const id = String(branchId);

        setSelectedBranch(id);
        setShowBranchPicker(false);

        router.get(
            POS_MONITOR_URL,
            { branch_id: id },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="POS Monitor" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShoppingCart className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">POS Monitor</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Monitor cashier activity, branch sales, open drawers, and POS transactions in real time.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Scope: {branchName}
                                    </span>

                                    <span className="rounded-full border px-3 py-1">Code: {branchCode}</span>

                                    {activeBranch?.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}

                                    {!activeBranch && <span className="rounded-full border px-3 py-1">Owner View</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setShowBranchPicker(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted"
                            >
                                <Building2 className="size-4" />
                                Change Scope
                            </button>

                            <button
                                type="button"
                                onClick={resetFilter}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <SummaryCard
                        title="Today's Sales"
                        value={money(summary.today_sales)}
                        description="Completed sales"
                        icon={Wallet}
                        variant="success"
                    />

                    <SummaryCard
                        title="Transactions"
                        value={formatNumber(summary.today_transactions)}
                        description="All sales recorded"
                        icon={Receipt}
                    />

                    <SummaryCard
                        title="Completed"
                        value={formatNumber(summary.completed_transactions)}
                        description="Completed orders"
                        icon={TrendingUp}
                        variant="success"
                    />

                    <SummaryCard
                        title="Products"
                        value={formatNumber(summary.products_count)}
                        description="Products scope"
                        icon={Package}
                    />

                    <SummaryCard
                        title="Low Stock"
                        value={formatNumber(summary.low_stock_count)}
                        description="Needs restocking."
                        icon={AlertTriangle}
                        variant={summary.low_stock_count > 0 ? 'warning' : 'default'}
                    />

                    <SummaryCard
                        title="Open Drawers"
                        value={formatNumber(summary.open_drawers_count)}
                        description="Active drawers."
                        icon={Wallet}
                        variant={summary.open_drawers_count > 0 ? 'success' : 'default'}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel
                        title="Hourly Sales Trend"
                        description="Today sales activity grouped by hour."
                        icon={BarChart3}
                        className="xl:col-span-7"
                    >
                        <div className="grid gap-3">
                            {sales_trend.length > 0 ? (
                                sales_trend.map((item) => {
                                    const width = (Number(item.total_sales || 0) / maxTrendSales) * 100;

                                    return (
                                        <div key={item.hour} className="rounded-xl border bg-background p-4">
                                            <div className="mb-3 flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="font-semibold">{hourLabel(Number(item.hour))}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatNumber(item.transactions)} transaction(s)
                                                    </div>
                                                </div>

                                                <div className="text-right font-semibold">{money(item.total_sales)}</div>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(width, 4)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState text="No sales trend available today." />
                            )}
                        </div>
                    </Panel>

                    <Panel
                        title="Cashier Performance"
                        description="Cashier sales activity for today."
                        icon={UserCheck}
                        className="xl:col-span-5"
                    >
                        <div className="grid gap-3">
                            {bestCashier && (
                                <div className="rounded-xl border bg-primary/5 p-4">
                                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Top Cashier</div>
                                    <div className="mt-2 text-lg font-semibold">{bestCashier.cashier_name ?? 'Unknown Cashier'}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{bestCashier.branch_name ?? 'No Branch'}</div>
                                    <div className="mt-3 text-2xl font-bold">{money(bestCashier.total_sales)}</div>
                                </div>
                            )}

                            {cashiers.length > 0 ? (
                                cashiers.map((cashier) => (
                                    <div key={`${cashier.cashier_user_id}-${cashier.branch_name}`} className="rounded-xl border bg-background p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold">{cashier.cashier_name ?? 'Unknown Cashier'}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">{cashier.branch_name ?? 'No Branch'}</div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-semibold">{money(cashier.total_sales)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatNumber(cashier.transactions_count)} sale(s)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock3 className="size-3" />
                                            Last sale: {formatDateTime(cashier.last_sale_at)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState text="No cashier activity today." />
                            )}
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel title="Recent Transactions" description="Latest POS transactions from cashiers." icon={Receipt} className="xl:col-span-8">
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="w-10 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-left font-medium">Sale No</th>
                                        <th className="px-4 py-3 text-left font-medium">Cashier</th>
                                        <th className="px-4 py-3 text-left font-medium">Branch</th>
                                        <th className="px-4 py-3 text-left font-medium">Payment</th>
                                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recent_transactions.length > 0 ? (
                                        recent_transactions.map((sale) => {
                                            const isOpen = openTransactionId === sale.id;

                                            return (
                                                <Fragment key={sale.id}>
                                                    <tr
                                                        onClick={() => setOpenTransactionId(isOpen ? null : sale.id)}
                                                        className="cursor-pointer border-t transition hover:bg-muted/40"
                                                    >
                                                        <td className="px-4 py-3">
                                                            {isOpen ? (
                                                                <ChevronDown className="size-4 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronRight className="size-4 text-muted-foreground" />
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 font-medium">{sale.sale_no}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{sale.cashier_name ?? 'Unknown Cashier'}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{sale.branch_name ?? 'No Branch'}</td>

                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${paymentClass(sale.payment_method)}`}>
                                                                {(sale.payment_method ?? 'N/A').replace('_', ' ')}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-semibold">{money(sale.grand_total)}</td>

                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(sale.status)}`}>
                                                                {sale.status}
                                                            </span>
                                                        </td>
                                                    </tr>

                                                    {isOpen && (
                                                        <tr className="border-t bg-muted/20">
                                                            <td></td>
                                                            <td colSpan={6} className="px-4 py-4">
                                                                <div className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-4">
                                                                    <Info label="Sold At" value={formatDateTime(sale.sold_at)} />
                                                                    <Info label="Amount Paid" value={money(sale.amount_paid)} />
                                                                    <Info label="Change" value={money(sale.change_amount)} />
                                                                    <Info label="Payment Status" value={sale.payment_status} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7}>
                                                <EmptyState text="No recent transactions found." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <Panel title="Stock Alerts" description="Products that reached reorder level." icon={AlertTriangle} className="xl:col-span-4">
                        <div className="grid gap-3">
                            {alerts.low_stock_products.length > 0 ? (
                                alerts.low_stock_products.map((item) => (
                                    <div key={item.id} className="rounded-xl border bg-background p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold">{item.name}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">{item.branch_name ?? 'No Branch'}</div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-bold text-amber-600">{formatNumber(item.quantity)}</div>
                                                <div className="text-xs text-muted-foreground">Reorder: {formatNumber(item.reorder_level)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState text="No low stock products found." />
                            )}

                            {alerts.pending_sales_count > 0 && (
                                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
                                    {formatNumber(alerts.pending_sales_count)} pending sale(s) need review.
                                </div>
                            )}
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel title="Open Cash Drawers" description="Currently active cash drawers." icon={Wallet} className="xl:col-span-5">
                        <div className="grid gap-3">
                            {openDrawers.length > 0 ? (
                                openDrawers.map((drawer) => (
                                    <div key={drawer.id} className="rounded-xl border bg-background p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="font-semibold">{drawer.branch_name ?? 'No Branch'}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    Opened by {drawer.opened_by_name ?? 'Unknown'} • {formatDateTime(drawer.opened_at)}
                                                </div>
                                            </div>

                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(drawer.status)}`}>
                                                {drawer.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <Info label="Opening" value={money(drawer.opening_amount)} />
                                            <Info label="Cash Sales" value={money(drawer.total_cash_sales)} />
                                            <Info label="Expected" value={money(drawer.expected_balance)} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState text="No open cash drawers." />
                            )}
                        </div>
                    </Panel>

                    <Panel title="Priority Product Watch" description="Low stock and out of stock products." icon={PackageX} className="xl:col-span-7">
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Product</th>
                                        <th className="px-4 py-3 text-left font-medium">Branch</th>
                                        <th className="px-4 py-3 text-left font-medium">Category</th>
                                        <th className="px-4 py-3 text-right font-medium">Price</th>
                                        <th className="px-4 py-3 text-left font-medium">Stock</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product) => {
                                            const stockState = getStockState(product);

                                            return (
                                                <tr key={product.id} className="border-t transition hover:bg-muted/40">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            SKU: {product.sku ?? 'N/A'} • Barcode: {product.barcode ?? 'N/A'}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-muted-foreground">{product.branch_name ?? 'No Branch'}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{product.category_name ?? 'Uncategorized'}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">{money(product.selling_price)}</td>

                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stockState.className}`}>
                                                            {stockState.label} • {product.stock_tracking === 'tracked' ? formatNumber(product.quantity) : '∞'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5}>
                                                <EmptyState text="No priority products found." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </div>
            </div>

            {showBranchPicker && (
                <Modal title="Select Monitoring Scope" onClose={() => setShowBranchPicker(false)}>
                    <div className="grid gap-3">
                        <button
                            type="button"
                            onClick={resetFilter}
                            className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:bg-muted ${
                                !selectedBranch ? 'border-primary bg-primary/5' : ''
                            }`}
                        >
                            <div>
                                <div className="font-semibold">All Branches</div>
                                <div className="mt-1 text-sm text-muted-foreground">Tenant-wide owner monitoring</div>
                            </div>

                            <Store className="size-5 text-muted-foreground" />
                        </button>

                        {branches.map((branch) => (
                            <button
                                key={branch.id}
                                type="button"
                                onClick={() => selectBranch(branch.id)}
                                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:bg-muted ${
                                    String(selectedBranch) === String(branch.id) ? 'border-primary bg-primary/5' : ''
                                }`}
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{branch.name}</span>

                                        {branch.is_main && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                                Main
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-1 text-sm text-muted-foreground">Code: {branch.code ?? 'N/A'}</div>
                                </div>

                                <Building2 className="size-5 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                </Modal>
            )}
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    variant = 'default',
}: {
    title: string;
    value: number | string;
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

function Panel({
    title,
    description,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border ${className}`}>
            <div className="flex items-start gap-3 border-b p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>

                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>

            <div className="p-4">{children}</div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold">{value}</div>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {text}
        </div>
    );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">{title}</h2>

                    <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
            </div>
        </div>
    );
}