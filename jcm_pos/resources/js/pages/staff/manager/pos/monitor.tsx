import { Head } from '@inertiajs/react';
import { Activity, AlertTriangle, Boxes, GitBranch, Monitor, Package2, Receipt, WalletCards } from 'lucide-react';

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

type Summary = {
    today_sales: number;
    today_transactions: number;
    products_count: number;
    low_stock_count: number;
    open_drawer?: {
        id: number;
        opening_amount?: number | string | null;
        status?: string | null;
        opened_at?: string | null;
    } | null;
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

type Props = {
    branch?: Branch | null;
    summary?: Summary;
    products?: Product[];
    recent_transactions?: RecentTransaction[];
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

function statusClass(status?: string | null) {
    if (!status) return 'bg-muted text-muted-foreground';

    const normalized = status.toLowerCase();

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

export default function ManagerPosMonitorIndex({
    branch = null,
    summary,
    products = [],
    recent_transactions = [],
    scope,
}: Props) {
    const safeSummary: Summary = {
        today_sales: summary?.today_sales ?? 0,
        today_transactions: summary?.today_transactions ?? 0,
        products_count: summary?.products_count ?? 0,
        low_stock_count: summary?.low_stock_count ?? 0,
        open_drawer: summary?.open_drawer ?? null,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager POS Monitor" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Monitor className="size-5" />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">POS Monitor</h1>
                            <p className="text-sm text-muted-foreground">
                                Branch-scoped sales, drawer, products, and recent transaction overview.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                            <GitBranch className="size-3" />
                            Branch: {branch?.name ?? scope?.branch_id ?? '—'}
                        </span>

                        <span className="rounded-full border px-3 py-1">Code: {branch?.code ?? '—'}</span>
                        <span className="rounded-full border px-3 py-1">Tenant: {scope?.tenant_id ?? '—'}</span>
                        <span className="rounded-full border px-3 py-1">Branch ID: {scope?.branch_id ?? '—'}</span>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <StatCard title="Today Sales" value={money(safeSummary.today_sales)} description="Completed sales for this branch." icon={Receipt} />
                    <StatCard title="Transactions" value={safeSummary.today_transactions} description="Total sales transactions today." icon={Activity} />
                    <StatCard title="Products" value={safeSummary.products_count} description="Available products under this branch." icon={Package2} />
                    <StatCard title="Low Stock" value={safeSummary.low_stock_count} description="Tracked products at reorder level." icon={AlertTriangle} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b p-4">
                            <div>
                                <h2 className="font-semibold">Recent Transactions</h2>
                                <p className="text-sm text-muted-foreground">Latest sales recorded from this manager branch.</p>
                            </div>

                            <Receipt className="size-5 text-muted-foreground" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Sale No.</th>
                                        <th className="px-4 py-3 text-left font-medium">Payment</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recent_transactions.length > 0 ? (
                                        recent_transactions.map((transaction) => (
                                            <tr key={transaction.id} className="border-t">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{transaction.sale_no ?? `SALE-${transaction.id}`}</div>
                                                    <div className="text-xs text-muted-foreground">{transaction.sold_at ?? 'No date'}</div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="capitalize">{transaction.payment_method ?? 'N/A'}</div>
                                                    <div className="text-xs text-muted-foreground">Paid: {money(transaction.amount_paid)}</div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(transaction.status)}`}>
                                                        {transaction.status ?? 'Unknown'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-right font-semibold">{money(transaction.grand_total)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                                No recent transactions found for this branch.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card shadow-sm">
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
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(safeSummary.open_drawer.status)}`}>
                                            {safeSummary.open_drawer.status ?? 'Open'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Opening Amount</span>
                                        <span className="font-semibold">{money(safeSummary.open_drawer.opening_amount)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Opened At</span>
                                        <span className="text-sm">{safeSummary.open_drawer.opened_at ?? '—'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed p-6 text-center">
                                    <WalletCards className="mx-auto size-8 text-muted-foreground" />
                                    <h3 className="mt-3 font-medium">No Open Drawer</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">There is no active cash drawer for this branch.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b p-4">
                        <div>
                            <h2 className="font-semibold">Branch Products</h2>
                            <p className="text-sm text-muted-foreground">Preview of products visible to this manager branch only.</p>
                        </div>

                        <Boxes className="size-5 text-muted-foreground" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
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
                                        const isLowStock = product.stock_tracking === 'tracked' && quantity <= reorderLevel;

                                        return (
                                            <tr key={product.id} className="border-t">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        SKU: {product.sku ?? 'N/A'} · Barcode: {product.barcode ?? 'N/A'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">{product.category_name ?? 'Uncategorized'}</td>

                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{quantity}</div>
                                                    <div className="text-xs text-muted-foreground">Reorder: {reorderLevel}</div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isLowStock ? statusClass('low_stock') : statusClass(product.status)}`}>
                                                        {isLowStock ? 'Low Stock' : product.status ?? 'Unknown'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-right font-semibold">{money(product.selling_price)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                            No products found for this branch.
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