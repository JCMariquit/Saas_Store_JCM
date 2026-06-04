import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Activity,
    BarChart3,
    CalendarDays,
    Flame,
    Layers3,
    Package,
    Percent,
    Receipt,
    Radar,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import ChartCard from '@/components/charts/chart-card';
import HeatMap from '@/components/charts/heat-map';
import MixedBarLineChart from '@/components/charts/mixed-bar-line-chart';
import MountainTrendChart from '@/components/charts/mountain-trend-chart';
import NestedDonutChart from '@/components/charts/nested-donut-chart';
import RadarChart from '@/components/charts/radar-chart';
import StackedBarChart from '@/components/charts/stacked-bar-chart';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/client/reports/sales' },
    { title: 'Sales Reports', href: '/client/reports/sales' },
];

type Filters = {
    date_from: string;
    date_to: string;
};

type Summary = {
    gross_sales: number;
    total_discount: number;
    total_transactions: number;
    total_items_sold: number;
    average_sale: number;
};

type DailySale = {
    date: string;
    raw_date?: string;
    total_sales: number;
    transaction_count: number;
};

type TopProduct = {
    product_id: number | null;
    product_name: string;
    sku: string | null;
    total_quantity: number;
    total_sales: number;
};

type RecentSale = {
    id: number;
    sale_no: string;
    branch_name: string;
    items_count: number;
    grand_total: number;
    payment_status: string;
    status: string;
    sold_at: string;
};

type Props = {
    filters: Filters;
    summary: Summary;
    daily_sales: DailySale[];
    top_products: TopProduct[];
    recent_sales: RecentSale[];
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

const dummyNestedDonut = [
    {
        label: 'Sales Status',
        segments: [
            { label: 'Completed', value: 72, color: '#16a34a' },
            { label: 'Returned', value: 11, color: '#dc2626' },
            { label: 'Voided', value: 4, color: '#f59e0b' },
        ],
    },
    {
        label: 'Payment Type',
        segments: [
            { label: 'Cash', value: 48, color: '#2563eb' },
            { label: 'GCash', value: 22, color: '#0891b2' },
            { label: 'Card', value: 13, color: '#7c3aed' },
            { label: 'Split', value: 4, color: '#ea580c' },
        ],
    },
    {
        label: 'Branch Mix',
        segments: [
            { label: 'Main', value: 55, color: '#0f766e' },
            { label: 'Branch 2', value: 21, color: '#65a30d' },
            { label: 'Branch 3', value: 11, color: '#db2777' },
        ],
    },
];

const dummyVerticalStacked = [
    {
        label: 'Mon',
        segments: [
            { label: 'Cash', value: 4200, color: '#2563eb' },
            { label: 'GCash', value: 2300, color: '#0891b2' },
            { label: 'Card', value: 900, color: '#7c3aed' },
        ],
    },
    {
        label: 'Tue',
        segments: [
            { label: 'Cash', value: 5100, color: '#2563eb' },
            { label: 'GCash', value: 1800, color: '#0891b2' },
            { label: 'Card', value: 1200, color: '#7c3aed' },
        ],
    },
    {
        label: 'Wed',
        segments: [
            { label: 'Cash', value: 3900, color: '#2563eb' },
            { label: 'GCash', value: 2800, color: '#0891b2' },
            { label: 'Card', value: 1500, color: '#7c3aed' },
        ],
    },
    {
        label: 'Thu',
        segments: [
            { label: 'Cash', value: 6200, color: '#2563eb' },
            { label: 'GCash', value: 2100, color: '#0891b2' },
            { label: 'Card', value: 1700, color: '#7c3aed' },
        ],
    },
    {
        label: 'Fri',
        segments: [
            { label: 'Cash', value: 7300, color: '#2563eb' },
            { label: 'GCash', value: 3100, color: '#0891b2' },
            { label: 'Card', value: 2200, color: '#7c3aed' },
        ],
    },
];

const dummyHorizontalStacked = [
    {
        label: 'Beverages',
        segments: [
            { label: 'Revenue', value: 18500, color: '#16a34a' },
            { label: 'Discounts', value: 1200, color: '#f59e0b' },
            { label: 'Returns', value: 800, color: '#dc2626' },
        ],
    },
    {
        label: 'Snacks',
        segments: [
            { label: 'Revenue', value: 14200, color: '#16a34a' },
            { label: 'Discounts', value: 900, color: '#f59e0b' },
            { label: 'Returns', value: 500, color: '#dc2626' },
        ],
    },
    {
        label: 'Household',
        segments: [
            { label: 'Revenue', value: 9800, color: '#16a34a' },
            { label: 'Discounts', value: 700, color: '#f59e0b' },
            { label: 'Returns', value: 300, color: '#dc2626' },
        ],
    },
];

const dummyMountainTrend = [
    {
        label: 'Gross Sales',
        color: '#2563eb',
        data: [
            { label: 'Jan', value: 25000 },
            { label: 'Feb', value: 33000 },
            { label: 'Mar', value: 29000 },
            { label: 'Apr', value: 41000 },
            { label: 'May', value: 52000 },
            { label: 'Jun', value: 47000 },
        ],
    },
    {
        label: 'Net Sales',
        color: '#16a34a',
        data: [
            { label: 'Jan', value: 22000 },
            { label: 'Feb', value: 30100 },
            { label: 'Mar', value: 26000 },
            { label: 'Apr', value: 37400 },
            { label: 'May', value: 48900 },
            { label: 'Jun', value: 43100 },
        ],
    },
];

const dummyRadar = [
    {
        label: 'Current Month',
        color: '#2563eb',
        data: [
            { label: 'Revenue', value: 88 },
            { label: 'Profit', value: 74 },
            { label: 'Items', value: 92 },
            { label: 'Discount', value: 43 },
            { label: 'Returns', value: 28 },
            { label: 'Cashflow', value: 81 },
        ],
    },
    {
        label: 'Previous Month',
        color: '#16a34a',
        data: [
            { label: 'Revenue', value: 75 },
            { label: 'Profit', value: 68 },
            { label: 'Items', value: 79 },
            { label: 'Discount', value: 38 },
            { label: 'Returns', value: 33 },
            { label: 'Cashflow', value: 70 },
        ],
    },
];

const dummyMixedBarLine = [
    { label: 'Jan', barValue: 25000, lineValue: 21000 },
    { label: 'Feb', barValue: 33000, lineValue: 28500 },
    { label: 'Mar', barValue: 29000, lineValue: 24400 },
    { label: 'Apr', barValue: 41000, lineValue: 35900 },
    { label: 'May', barValue: 52000, lineValue: 46800 },
    { label: 'Jun', barValue: 47000, lineValue: 42100 },
];

const dummyHeatMap = [
    { label: '01', value: 1200 },
    { label: '02', value: 3200 },
    { label: '03', value: 0 },
    { label: '04', value: 5400 },
    { label: '05', value: 2100 },
    { label: '06', value: 4300 },
    { label: '07', value: 7000 },
    { label: '08', value: 2500 },
    { label: '09', value: 1900 },
    { label: '10', value: 8500 },
    { label: '11', value: 6400 },
    { label: '12', value: 3300 },
    { label: '13', value: 1100 },
    { label: '14', value: 7800 },
    { label: '15', value: 9200 },
    { label: '16', value: 4200 },
    { label: '17', value: 0 },
    { label: '18', value: 3100 },
    { label: '19', value: 5900 },
    { label: '20', value: 7200 },
    { label: '21', value: 2800 },
];

export default function SalesReportIndex({
    filters,
    summary,
    top_products,
    recent_sales,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    function applyFilters() {
        router.get(
            '/client/reports/sales',
            {
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function resetFilters() {
        router.get('/client/reports/sales');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Reports" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <BarChart3 className="size-5 text-primary" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold">Sales Reports</h1>
                                <p className="text-sm text-muted-foreground">
                                    Analytics UI module test using reusable chart components.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">From</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) => setDateFrom(event.target.value)}
                                    className="mt-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground">To</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) => setDateTo(event.target.value)}
                                    className="mt-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={applyFilters}
                                className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                            >
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="h-10 rounded-lg border px-4 text-sm font-medium"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard title="Gross Sales" value={money(summary.gross_sales)} icon={Wallet} />
                    <SummaryCard title="Transactions" value={formatNumber(summary.total_transactions)} icon={Receipt} />
                    <SummaryCard title="Items Sold" value={formatNumber(summary.total_items_sold)} icon={Package} />
                    <SummaryCard title="Discounts" value={money(summary.total_discount)} icon={Percent} />
                    <SummaryCard title="Average Sale" value={money(summary.average_sale)} icon={TrendingUp} />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <ChartCard title="Nested Sales Breakdown" description="Reusable nested donut chart. Supports 2 to 5 rings." icon={Layers3}>
                        <NestedDonutChart rings={dummyNestedDonut} centerTitle="Sales Mix" formatter={formatNumber} />
                    </ChartCard>

                    <ChartCard title="Mountain Sales Trend" description="Smooth mountain-style trend chart for monthly movement." icon={TrendingUp}>
                        <MountainTrendChart series={dummyMountainTrend} formatter={money} />
                    </ChartCard>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <ChartCard title="Daily Payment Mix" description="Vertical stacked bar chart." icon={BarChart3}>
                        <StackedBarChart data={dummyVerticalStacked} orientation="vertical" formatter={money} />
                    </ChartCard>

                    <ChartCard title="Category Revenue Health" description="Horizontal stacked bar chart." icon={CalendarDays}>
                        <StackedBarChart data={dummyHorizontalStacked} orientation="horizontal" formatter={money} />
                    </ChartCard>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <ChartCard title="Sales Performance Radar" description="Radar chart for comparing multiple business metrics." icon={Radar}>
                        <RadarChart series={dummyRadar} max={100} formatter={formatNumber} />
                    </ChartCard>

                    <ChartCard title="Gross vs Net Sales" description="Mixed bar and line chart for trend comparison." icon={Activity}>
                        <MixedBarLineChart
                            data={dummyMixedBarLine}
                            barLabel="Gross Sales"
                            lineLabel="Net Sales"
                            formatter={money}
                        />
                    </ChartCard>
                </div>

                <div className="grid gap-4 xl:grid-cols-1">
                    <ChartCard title="Daily Sales Heat Map" description="Heat map for daily activity intensity." icon={Flame}>
                        <HeatMap data={dummyHeatMap} columns={7} formatter={money} />
                    </ChartCard>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <ChartCard title="Top Products" description="Current backend data." icon={Package} className="xl:col-span-1">
                        <div className="space-y-3">
                            {top_products.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    No product sales found.
                                </div>
                            ) : (
                                top_products.map((product, index) => (
                                    <div key={`${product.product_id ?? 'item'}-${index}`} className="rounded-lg border p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-medium">{product.product_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {product.sku ?? 'No SKU'} • Qty {formatNumber(product.total_quantity)}
                                                </div>
                                            </div>

                                            <div className="text-right text-sm font-semibold">
                                                {money(product.total_sales)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ChartCard>

                    <ChartCard title="Recent Sales" description="Latest completed transactions in selected date range." icon={Receipt} className="xl:col-span-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-3 pr-4 font-medium">Sale No.</th>
                                        <th className="py-3 pr-4 font-medium">Branch</th>
                                        <th className="py-3 pr-4 font-medium">Items</th>
                                        <th className="py-3 pr-4 font-medium">Payment</th>
                                        <th className="py-3 pr-4 font-medium">Date</th>
                                        <th className="py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recent_sales.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No recent sales found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recent_sales.map((sale) => (
                                            <tr key={sale.id} className="border-b last:border-0">
                                                <td className="py-3 pr-4 font-medium">{sale.sale_no}</td>
                                                <td className="py-3 pr-4">{sale.branch_name}</td>
                                                <td className="py-3 pr-4">{sale.items_count}</td>
                                                <td className="py-3 pr-4">
                                                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                                                        {sale.payment_status}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">{sale.sold_at}</td>
                                                <td className="py-3 text-right font-semibold">{money(sale.grand_total)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </div>
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string;
    icon: typeof Wallet;
}) {
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-xl font-semibold">{value}</p>
                </div>

                <div className="rounded-xl bg-primary/10 p-3">
                    <Icon className="size-5 text-primary" />
                </div>
            </div>
        </div>
    );
}