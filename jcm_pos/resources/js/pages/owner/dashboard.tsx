import {
    ChartCard,
    MixedBarLineChart,
    NestedDonutChart,
} from '@/components/charts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Boxes,
    Building2,
    CalendarDays,
    CreditCard,
    Package,
    Receipt,
    RotateCcw,
    ShoppingCart,
    Tags,
    WalletCards,
} from 'lucide-react';
import type { ElementType } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/client/dashboard',
    },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
    is_active: boolean;
};

type Summary = {
    today_sales: number;
    today_transactions: number;
    monthly_sales: number;
    monthly_transactions: number;
    total_products: number;
    active_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_branches: number;
    active_branches: number;
    total_categories: number;
    active_discounts: number;
    pending_returns: number;
    open_cash_drawers: number;
};

type RecentSale = {
    id: number;
    sale_no: string;
    branch_name: string;
    grand_total: number;
    payment_status: string;
    status: string;
    sold_at: string;
};

type LowStockProduct = {
    id: number;
    name: string;
    sku?: string | null;
    branch_name: string;
    category_name: string;
    quantity: number;
    reorder_level: number;
};

type StockMovement = {
    id: number;
    product_name: string;
    branch_name: string;
    movement_type: string;
    quantity: number;
    quantity_after: number;
    movement_date: string;
};

type DashboardProps = {
    filters: {
        branch_id?: string | number | null;
    };
    branches: Branch[];
    summary: Summary;
    recent_sales: RecentSale[];
    low_stock_list: LowStockProduct[];
    recent_stock_movements: StockMovement[];
};

function money(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

function number(value: number) {
    return new Intl.NumberFormat('en-PH').format(Number(value || 0));
}

function badgeClass(status: string) {
    const value = String(status || '').toLowerCase();

    if (['completed', 'paid', 'active'].includes(value)) {
        return 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15';
    }

    if (['pending', 'open'].includes(value)) {
        return 'bg-amber-500/10 text-amber-600 ring-amber-500/15';
    }

    if (['cancelled', 'void', 'failed'].includes(value)) {
        return 'bg-red-500/10 text-red-600 ring-red-500/15';
    }

    return 'bg-slate-500/10 text-slate-600 ring-slate-500/15';
}

function MetricCard({
    title,
    value,
    sub,
    icon: Icon,
}: {
    title: string;
    value: string;
    sub: string;
    icon: ElementType;
}) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                </div>

                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function MiniStat({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string;
    icon: ElementType;
}) {
    return (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-muted p-3 text-muted-foreground">
                    <Icon className="size-5" />
                </div>

                <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">{title}</p>
                    <p className="text-lg font-bold">{value}</p>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({
    filters,
    branches,
    summary,
    recent_sales,
    low_stock_list,
}: DashboardProps) {
    const selectedBranchId = filters?.branch_id ? String(filters.branch_id) : '';

    const salesChartData = recent_sales
        .slice()
        .reverse()
        .map((sale) => ({
            label: sale.sale_no.replace('SALE-', ''),
            barValue: Number(sale.grand_total || 0),
            lineValue: Number(sale.grand_total || 0),
        }));

    const inventoryRings = [
        {
            label: 'Product Stock',
            segments: [
                { label: 'Active', value: summary.active_products },
                { label: 'Low Stock', value: summary.low_stock_products },
                { label: 'Out of Stock', value: summary.out_of_stock_products },
            ],
        },
        {
            label: 'Store Setup',
            segments: [
                { label: 'Branches', value: summary.total_branches },
                { label: 'Categories', value: summary.total_categories },
                { label: 'Discounts', value: summary.active_discounts },
            ],
        },
    ];

    const miniStats: {
        title: string;
        value: string;
        icon: ElementType;
    }[] = [
        {
            title: 'Branches',
            value: `${summary.active_branches}/${summary.total_branches}`,
            icon: Building2,
        },
        {
            title: 'Categories',
            value: number(summary.total_categories),
            icon: Tags,
        },
        {
            title: 'Discounts',
            value: number(summary.active_discounts),
            icon: CreditCard,
        },
        {
            title: 'Returns',
            value: number(summary.pending_returns),
            icon: RotateCcw,
        },
        {
            title: 'Drawers',
            value: number(summary.open_cash_drawers),
            icon: WalletCards,
        },
    ];

    function handleBranchChange(branchId: string) {
        router.get(
            '/client/dashboard',
            { branch_id: branchId || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-5 p-4">
                <div className="rounded-3xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/15">
                                <BarChart3 className="size-3.5" />
                                Owner Dashboard
                            </div>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight">
                                Store Overview
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Clean summary of sales, inventory, branches, returns, and cash drawer status.
                            </p>
                        </div>

                        <select
                            value={selectedBranchId}
                            onChange={(event) => handleBranchChange(event.target.value)}
                            className="h-11 rounded-xl border bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        >
                            <option value="">All Branches</option>

                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                    {branch.is_main ? ' • Main' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Today Sales"
                        value={money(summary.today_sales)}
                        sub={`${number(summary.today_transactions)} transactions today`}
                        icon={ShoppingCart}
                    />

                    <MetricCard
                        title="Monthly Sales"
                        value={money(summary.monthly_sales)}
                        sub={`${number(summary.monthly_transactions)} transactions this month`}
                        icon={CalendarDays}
                    />

                    <MetricCard
                        title="Products"
                        value={number(summary.total_products)}
                        sub={`${number(summary.active_products)} active products`}
                        icon={Package}
                    />

                    <MetricCard
                        title="Stock Alerts"
                        value={number(summary.low_stock_products)}
                        sub={`${number(summary.out_of_stock_products)} out of stock`}
                        icon={AlertTriangle}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {miniStats.map((item) => (
                        <MiniStat
                            key={item.title}
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                        />
                    ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                    <ChartCard
                        title="Sales Performance"
                        description="Recent sales amount based on latest transactions."
                        icon={Receipt}
                        className="xl:col-span-2"
                    >
                        <MixedBarLineChart
                            data={salesChartData}
                            height={320}
                            barLabel="Sales"
                            lineLabel="Trend"
                            formatter={money}
                        />
                    </ChartCard>

                    <ChartCard
                        title="Inventory Health"
                        description="Product stock status and store setup."
                        icon={Boxes}
                    >
                        <NestedDonutChart
                            rings={inventoryRings}
                            size={300}
                            centerTitle="Products"
                            centerValue={number(summary.total_products)}
                            formatter={number}
                        />
                    </ChartCard>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="border-b p-5">
                            <h2 className="font-semibold">Recent Sales</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Latest sales transactions.
                            </p>
                        </div>

                        <div className="overflow-x-auto p-5">
                            {recent_sales.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    No recent sales found.
                                </div>
                            ) : (
                                <table className="w-full min-w-[620px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                            <th className="pb-3">Sale</th>
                                            <th className="pb-3">Branch</th>
                                            <th className="pb-3">Amount</th>
                                            <th className="pb-3">Payment</th>
                                            <th className="pb-3">Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recent_sales.map((sale) => (
                                            <tr key={sale.id} className="border-b last:border-0">
                                                <td className="py-3 font-semibold">{sale.sale_no}</td>
                                                <td className="py-3 text-muted-foreground">{sale.branch_name}</td>
                                                <td className="py-3 font-semibold">{money(sale.grand_total)}</td>
                                                <td className="py-3">
                                                    <span className={`rounded-md px-2 py-1 text-xs font-bold ring-1 ${badgeClass(sale.payment_status)}`}>
                                                        {sale.payment_status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-muted-foreground">{sale.sold_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="border-b p-5">
                            <h2 className="font-semibold">Low Stock Products</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Items that need restocking.
                            </p>
                        </div>

                        <div className="space-y-3 p-5">
                            {low_stock_list.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    No low stock products found.
                                </div>
                            ) : (
                                low_stock_list.map((product) => (
                                    <div key={product.id} className="rounded-xl border bg-muted/20 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">{product.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {product.category_name} • {product.branch_name}
                                                </p>
                                            </div>

                                            <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 ring-1 ring-amber-500/15">
                                                {product.quantity}/{product.reorder_level}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}