import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    AlertTriangle,
    Archive,
    BarChart3,
    Boxes,
    Building2,
    CalendarClock,
    ClipboardList,
    Package,
    TrendingUp,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';

import StackedBarChart from '@/components/charts/stacked-bar-chart';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/client/reports/inventory' },
    { title: 'Inventory Reports', href: '/client/reports/inventory' },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    status?: string;
};

type Summary = {
    total_products: number;
    active_products: number;
    inactive_products: number;
    in_stock_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_stock_quantity: number;
    inventory_cost_value: number;
    inventory_retail_value: number;
    potential_profit: number;
};

type CategoryBreakdown = {
    category_name: string;
    product_count: number;
    total_quantity: number;
    retail_value: number;
};

type TopInventoryValue = {
    id: number;
    name: string;
    sku: string | null;
    quantity: number;
    cost_price: number;
    selling_price: number;
    inventory_value: number;
};

type LowStockItem = {
    id: number;
    name: string;
    sku: string | null;
    branch_name: string;
    category_name: string;
    quantity: number;
    reorder_level: number;
    status: string;
};

type ExpiringBatch = {
    id: number;
    batch_no: string | null;
    product_name: string;
    branch_name: string;
    quantity_remaining: number;
    expiry_date: string;
    days_left: number;
};

type RecentMovement = {
    id: number;
    product_name: string;
    branch_name: string;
    movement_type: string;
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    movement_date: string;
    remarks: string | null;
};

type Props = {
    branches?: Branch[];
    selected_branch_id?: number | string | null;
    current_branch?: Branch | null;
    summary: Summary;
    category_breakdown: CategoryBreakdown[];
    top_inventory_value: TopInventoryValue[];
    low_stock_items: LowStockItem[];
    expiring_batches: ExpiringBatch[];
    recent_movements: RecentMovement[];
};

function money(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number(value || 0));
}

function formatNumber(value: number) {
    return new Intl.NumberFormat('en-PH').format(Number(value || 0));
}

function percent(value: number, total: number) {
    if (total <= 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
}

export default function InventoryReportIndex({
    branches = [],
    selected_branch_id,
    current_branch,
    summary,
    category_breakdown,
    top_inventory_value,
    low_stock_items,
    expiring_batches,
    recent_movements,
}: Props) {
    const [selectedBranch, setSelectedBranch] = useState(String(selected_branch_id ?? current_branch?.id ?? ''));
    const [showBranchPicker, setShowBranchPicker] = useState(false);

    const activeBranch =
        branches.find((branch) => String(branch.id) === String(selectedBranch)) ??
        current_branch ??
        null;

    const branchName = activeBranch?.name ?? 'No Branch Selected';
    const branchCode = activeBranch?.code ?? 'N/A';
    const branchStatus = activeBranch?.status ?? 'Active';

    const maxCategoryValue = Math.max(...category_breakdown.map((item) => Number(item.retail_value || 0)), 1);
    const maxInventoryValue = Math.max(...top_inventory_value.map((item) => Number(item.inventory_value || 0)), 1);

    const stockHealthData = [
        {
            label: 'Stock',
            segments: [
                { label: 'In Stock', value: summary.in_stock_products, color: '#16a34a' },
                { label: 'Low Stock', value: summary.low_stock_products, color: '#f59e0b' },
                { label: 'Out of Stock', value: summary.out_of_stock_products, color: '#dc2626' },
            ],
        },
        {
            label: 'Status',
            segments: [
                { label: 'Active', value: summary.active_products, color: '#2563eb' },
                { label: 'Inactive', value: summary.inactive_products, color: '#64748b' },
            ],
        },
    ];

    function selectBranch(branchId: number) {
        const id = String(branchId);

        setSelectedBranch(id);
        setShowBranchPicker(false);

        router.get(
            '/client/reports/inventory',
            { branch_id: id },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-blue-500 p-3 text-white shadow-sm">
                                <Boxes className="size-6" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Inventory Reports</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Stock health, inventory value, low stock alerts, expiring batches, and recent movements.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-background p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="rounded-xl border bg-muted/30 p-3">
                                        <Building2 className="size-5 text-muted-foreground" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-semibold">{branchName}</p>

                                            {activeBranch?.is_main && (
                                                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                                    Main
                                                </span>
                                            )}

                                            {activeBranch && (
                                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                                                    {branchStatus}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 text-sm text-muted-foreground">Branch code: {branchCode}</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowBranchPicker(true)}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                                >
                                    <Building2 className="size-4" />
                                    Change Branch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <MetricCard title="Total Products" value={formatNumber(summary.total_products)} helper="All inventory items" icon={Package} tone="blue" />
                    <MetricCard title="In Stock" value={formatNumber(summary.in_stock_products)} helper="Available items" icon={Archive} tone="success" />
                    <MetricCard title="Low Stock" value={formatNumber(summary.low_stock_products)} helper="Needs restocking" icon={AlertTriangle} tone="warning" />
                    <MetricCard title="Out of Stock" value={formatNumber(summary.out_of_stock_products)} helper="No quantity left" icon={ClipboardList} tone="danger" />
                    <MetricCard title="Retail Value" value={money(summary.inventory_retail_value)} helper="Estimated selling value" icon={Wallet} tone="blue" />
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel title="Inventory Value by Category" description="Retail value grouped by category." icon={BarChart3} className="xl:col-span-7" tone="blue">
                        <div className="grid gap-3 md:grid-cols-2">
                            {category_breakdown.length === 0 ? (
                                <EmptyState text="No category breakdown available." />
                            ) : (
                                category_breakdown.slice(0, 6).map((item) => {
                                    const width = (Number(item.retail_value || 0) / maxCategoryValue) * 100;
                                    const share = percent(Number(item.retail_value || 0), summary.inventory_retail_value);

                                    return (
                                        <div key={item.category_name} className="rounded-xl border bg-background p-4">
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold">{item.category_name}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {formatNumber(item.product_count)} products • Qty {formatNumber(item.total_quantity)} • {share}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right font-semibold">{money(item.retail_value)}</div>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(width, 4)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Panel>

                    <Panel title="Stock Health" description="Availability and product status composition." icon={TrendingUp} className="xl:col-span-5" tone="blue">
                        <StackedBarChart data={stockHealthData} orientation="horizontal" formatter={formatNumber} />

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <InsightBox label="Cost Value" value={money(summary.inventory_cost_value)} sub="Estimated inventory cost." />
                            <InsightBox label="Potential Profit" value={money(summary.potential_profit)} sub="Retail value minus cost." />
                            <InsightBox label="Total Quantity" value={formatNumber(summary.total_stock_quantity)} sub="Quantity across products." />
                            <InsightBox label="Active Rate" value={percent(summary.active_products, summary.total_products)} sub="Active product share." />
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel title="Top Inventory Value" description="Highest retail inventory value." icon={Wallet} className="xl:col-span-7" tone="blue">
                        <div className="grid gap-3 md:grid-cols-2">
                            {top_inventory_value.length === 0 ? (
                                <EmptyState text="No inventory value data found." />
                            ) : (
                                top_inventory_value.slice(0, 6).map((product, index) => {
                                    const width = (Number(product.inventory_value || 0) / maxInventoryValue) * 100;

                                    return (
                                        <div key={product.id} className="rounded-xl border bg-background p-4 transition hover:bg-muted/40">
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600">
                                                            {index + 1}
                                                        </span>
                                                        <div className="truncate font-semibold">{product.name}</div>
                                                    </div>

                                                    <div className="mt-1 pl-9 text-xs text-muted-foreground">
                                                        {product.sku ?? 'No SKU'} • Qty {formatNumber(product.quantity)} • {money(product.selling_price)}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <div className="font-semibold">{money(product.inventory_value)}</div>
                                                    <div className="text-xs text-muted-foreground">value</div>
                                                </div>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(width, 4)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Panel>

                    <Panel title="Low Stock Alerts" description="Reached or passed reorder level." icon={AlertTriangle} className="xl:col-span-5" tone="warning">
                        <div className="grid gap-3">
                            {low_stock_items.length === 0 ? (
                                <EmptyState text="No low stock items found." />
                            ) : (
                                low_stock_items.slice(0, 6).map((item) => (
                                    <AlertItem
                                        key={item.id}
                                        title={item.name}
                                        subtitle={`${item.sku ?? 'No SKU'} • ${item.category_name}`}
                                        value={`${formatNumber(item.quantity)} / ${formatNumber(item.reorder_level)}`}
                                        status={item.status}
                                    />
                                ))
                            )}
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel title="Expiring Batches" description="Batches expiring within 30 days." icon={CalendarClock} className="xl:col-span-5" tone="danger">
                        <div className="grid gap-3">
                            {expiring_batches.length === 0 ? (
                                <EmptyState text="No expiring batches within 30 days." />
                            ) : (
                                expiring_batches.slice(0, 6).map((batch) => (
                                    <AlertItem
                                        key={batch.id}
                                        title={batch.product_name}
                                        subtitle={`${batch.batch_no ?? 'No Batch'} • ${batch.branch_name}`}
                                        value={`${batch.days_left} day(s) left`}
                                        status="expiring"
                                        helper={`Qty ${formatNumber(batch.quantity_remaining)} • ${batch.expiry_date}`}
                                    />
                                ))
                            )}
                        </div>
                    </Panel>

                    <Panel title="Recent Stock Movements" description="Latest adjustments and stock movement logs." icon={ClipboardList} className="xl:col-span-7" tone="blue">
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Qty</th>
                                        <th className="px-4 py-3 font-medium">Before</th>
                                        <th className="px-4 py-3 font-medium">After</th>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recent_movements.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                No recent stock movements found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recent_movements.map((movement) => (
                                            <tr key={movement.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium">{movement.product_name}</td>
                                                <td className="px-4 py-3">
                                                    <MovementBadge type={movement.movement_type} />
                                                </td>
                                                <td className="px-4 py-3">{formatNumber(movement.quantity)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatNumber(movement.quantity_before)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatNumber(movement.quantity_after)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{movement.movement_date}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </div>
            </div>

            {showBranchPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b p-5">
                            <div>
                                <h2 className="text-lg font-bold">Choose Branch</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Select which branch inventory report will display.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowBranchPicker(false)}
                                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
                            {branches.length > 0 ? (
                                branches.map((branch) => (
                                    <button
                                        type="button"
                                        key={branch.id}
                                        onClick={() => selectBranch(branch.id)}
                                        className={`overflow-hidden rounded-xl border text-left transition hover:border-blue-500/60 hover:bg-muted/40 ${
                                            String(selectedBranch) === String(branch.id)
                                                ? 'border-blue-500 bg-blue-500/5'
                                                : 'border-sidebar-border/70 dark:border-sidebar-border'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3 p-4">
                                            <div className="flex size-11 items-center justify-center rounded-full border bg-background">
                                                <Building2 className="size-5 text-muted-foreground" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="truncate font-semibold">{branch.name}</div>
                                                <div className="mt-1 text-xs uppercase text-muted-foreground">
                                                    {branch.code || 'NO CODE'}
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {branch.is_main && (
                                                        <span className="rounded-full bg-blue-500 px-2.5 py-1 text-xs font-medium text-white">
                                                            Main
                                                        </span>
                                                    )}

                                                    <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-medium text-white">
                                                        {branch.status || 'Active'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                                            Click this branch to load its inventory report.
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full rounded-xl border border-dashed p-10 text-center">
                                    <Building2 className="mx-auto mb-3 size-10 text-muted-foreground" />
                                    <h3 className="font-semibold">No active branches found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Create or activate a branch first.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function MetricCard({ title, value, helper, icon: Icon, tone }: { title: string; value: string; helper: string; icon: typeof Package; tone: 'blue' | 'success' | 'warning' | 'danger' }) {
    const styles = {
        blue: 'bg-blue-500/10 text-blue-600',
        success: 'bg-emerald-500/10 text-emerald-600',
        warning: 'bg-amber-500/10 text-amber-600',
        danger: 'bg-red-500/10 text-red-600',
    };

    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
                </div>

                <div className={`rounded-xl p-3 ${styles[tone]}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function Panel({ title, description, icon: Icon, className = '', children, tone }: { title: string; description: string; icon: typeof Package; className?: string; children: React.ReactNode; tone: 'blue' | 'warning' | 'danger' }) {
    const styles = {
        blue: 'bg-blue-500/10 text-blue-600',
        warning: 'bg-amber-500/10 text-amber-600',
        danger: 'bg-red-500/10 text-red-600',
    };

    return (
        <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>

                <div className={`rounded-xl p-3 ${styles[tone]}`}>
                    <Icon className="size-5" />
                </div>
            </div>

            {children}
        </div>
    );
}

function InsightBox({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="rounded-xl border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 truncate text-lg font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
    );
}

function AlertItem({ title, subtitle, value, status, helper }: { title: string; subtitle: string; value: string; status: string; helper?: string }) {
    const normalized = String(status || '').toLowerCase();

    const style =
        normalized === 'out_of_stock' || normalized === 'expiring'
            ? 'bg-red-500/10 text-red-600'
            : 'bg-amber-500/10 text-amber-600';

    return (
        <div className="rounded-xl border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate font-semibold">{title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
                    {helper && <div className="mt-1 text-xs text-muted-foreground">{helper}</div>}
                </div>

                <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${style}`}>{value}</span>
            </div>
        </div>
    );
}

function MovementBadge({ type }: { type: string }) {
    const normalized = String(type || '').toLowerCase();

    const style =
        normalized.includes('in')
            ? 'bg-emerald-500/10 text-emerald-600'
            : normalized.includes('out')
              ? 'bg-red-500/10 text-red-600'
              : 'bg-blue-500/10 text-blue-600';

    return <span className={`rounded-full px-2 py-1 text-xs font-medium ${style}`}>{type || 'movement'}</span>;
}

function EmptyState({ text }: { text: string }) {
    return <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>;
}