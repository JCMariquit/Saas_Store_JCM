import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    BarChart3,
    CalendarDays,
    Package,
    Percent,
    Receipt,
    RefreshCcw,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import MountainTrendChart from '@/components/charts/mountain-trend-chart';

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

function percent(value: number, total: number) {
    if (total <= 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
}


export default function SalesReportIndex({
    filters,
    summary,
    daily_sales,
    top_products,
    recent_sales,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const netSales = Number(summary.gross_sales || 0) - Number(summary.total_discount || 0);
    const discountRate = percent(Number(summary.total_discount || 0), Number(summary.gross_sales || 0));
    const totalProductSales = top_products.reduce((sum, product) => sum + Number(product.total_sales || 0), 0);
    const bestProduct = top_products[0];

    const paidSales = recent_sales.filter((sale) => String(sale.payment_status).toLowerCase() === 'paid').length;
    const partialSales = recent_sales.filter((sale) => String(sale.payment_status).toLowerCase() === 'partial').length;
    const unpaidSales = recent_sales.filter((sale) => String(sale.payment_status).toLowerCase() === 'unpaid').length;

    const trendSeries = useMemo(() => {
        return [
            {
                label: 'Gross Sales',
                color: '#10b981',
                data: daily_sales.map((item) => ({
                    label: item.date,
                    value: Number(item.total_sales || 0),
                })),
            },
        ];
    }, [daily_sales]);

    const maxTopProductSales = Math.max(...top_products.map((item) => Number(item.total_sales || 0)), 1);

    function applyFilters() {
        router.get(
            '/client/reports/sales',
            { date_from: dateFrom, date_to: dateTo },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilters() {
        router.get('/client/reports/sales');
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Reports" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-500/10 p-3">
                                    <BarChart3 className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold tracking-tight">Sales Reports</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Revenue and transaction overview for {filters.date_from} to {filters.date_to}.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <DateInput label="From" value={dateFrom} onChange={setDateFrom} />
                                <DateInput label="To" value={dateTo} onChange={setDateTo} />

                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="h-10 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
                                >
                                    Apply
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted"
                                >
                                    <RefreshCcw className="size-4" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <MetricCard title="Gross Sales" value={money(summary.gross_sales)} helper="Before discounts" icon={Wallet} />
                    <MetricCard title="Net Sales" value={money(netSales)} helper="After discounts" icon={TrendingUp} />
                    <MetricCard title="Transactions" value={formatNumber(summary.total_transactions)} helper="Completed sales" icon={Receipt} />
                    <MetricCard title="Items Sold" value={formatNumber(summary.total_items_sold)} helper="Total quantity" icon={Package} />
                    <MetricCard title="Discount Rate" value={discountRate} helper={money(summary.total_discount)} icon={Percent} />
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel
                        title="Sales Movement"
                        description="Daily gross sales trend for the selected period."
                        icon={TrendingUp}
                        className="xl:col-span-8"
                    >
                        <MountainTrendChart series={trendSeries} height={300} formatter={money} />
                    </Panel>

                    <Panel
                        title="Period Summary"
                        description="Quick read of the selected sales period."
                        icon={CalendarDays}
                        className="xl:col-span-4"
                    >
                        <div className="grid gap-3">
                            <SummaryRow label="Net Sales" value={money(netSales)} />
                            <SummaryRow label="Gross Sales" value={money(summary.gross_sales)} />
                            <SummaryRow label="Discounts" value={money(summary.total_discount)} />
                            <SummaryRow label="Average Sale" value={money(summary.average_sale)} />
                            <SummaryRow label="Best Product" value={bestProduct ? bestProduct.product_name : '-'} />

                            <div className="mt-2 grid grid-cols-3 gap-2">
                                <StatusBox label="Paid" value={paidSales} tone="success" />
                                <StatusBox label="Partial" value={partialSales} tone="warning" />
                                <StatusBox label="Unpaid" value={unpaidSales} tone="danger" />
                            </div>
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel
                        title="Top Products"
                        description="Ranked by total sales amount."
                        icon={Package}
                        className="xl:col-span-7"
                    >
                        <div className="space-y-3">
                            {top_products.length === 0 ? (
                                <EmptyState text="No product sales found." />
                            ) : (
                                top_products.slice(0, 8).map((product, index) => {
                                    const width = (Number(product.total_sales || 0) / maxTopProductSales) * 100;
                                    const share = percent(Number(product.total_sales || 0), totalProductSales);

                                    return (
                                        <div
                                            key={`${product.product_id ?? 'product'}-${index}`}
                                            className="rounded-xl border bg-background p-4 transition hover:bg-muted/40"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                                                            {index + 1}
                                                        </span>
                                                        <div className="truncate font-semibold">{product.product_name}</div>
                                                    </div>

                                                    <div className="mt-1 pl-9 text-xs text-muted-foreground">
                                                        {product.sku ?? 'No SKU'} • Qty {formatNumber(product.total_quantity)} • {share}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <div className="font-semibold">{money(product.total_sales)}</div>
                                                    <div className="text-xs text-muted-foreground">sales</div>
                                                </div>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-emerald-500"
                                                    style={{ width: `${Math.max(width, 4)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Panel>

                    <Panel
                        title="Sales Quality"
                        description="Useful ratios and quick indicators."
                        icon={Percent}
                        className="xl:col-span-5"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <InsightBox label="Average Sale" value={money(summary.average_sale)} sub="Per transaction" />
                            <InsightBox label="Discount Rate" value={discountRate} sub={money(summary.total_discount)} />
                            <InsightBox label="Product Sales" value={money(totalProductSales)} sub="Subtotal of top products" />
                            <InsightBox label="Items / Transaction" value={formatNumber(summary.total_transactions > 0 ? summary.total_items_sold / summary.total_transactions : 0)} sub="Average basket size" />
                        </div>
                    </Panel>
                </div>

                <Panel title="Recent Sales" description="Latest transactions inside the selected period." icon={Receipt}>
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-4 py-3 font-medium">Sale No.</th>
                                    <th className="px-4 py-3 font-medium">Branch</th>
                                    <th className="px-4 py-3 font-medium">Items</th>
                                    <th className="px-4 py-3 font-medium">Payment</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recent_sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            No recent sales found.
                                        </td>
                                    </tr>
                                ) : (
                                    recent_sales.map((sale) => (
                                        <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium">{sale.sale_no}</td>
                                            <td className="px-4 py-3">{sale.branch_name}</td>
                                            <td className="px-4 py-3">{sale.items_count}</td>
                                            <td className="px-4 py-3">
                                                <PaymentBadge status={sale.payment_status} />
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{sale.sold_at}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{money(sale.grand_total)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            </div>
        </AppLayout>
    );
}

function DateInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <input
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-emerald-500"
            />
        </div>
    );
}

function MetricCard({
    title,
    value,
    helper,
    icon: Icon,
}: {
    title: string;
    value: string;
    helper: string;
    icon: typeof Wallet;
}) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
                </div>

                <div className="rounded-xl bg-emerald-500/10 p-3">
                    <Icon className="size-5 text-emerald-500" />
                </div>
            </div>
        </div>
    );
}

function Panel({
    title,
    description,
    icon: Icon,
    className = '',
    children,
}: {
    title: string;
    description: string;
    icon: typeof Wallet;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>

                <div className="rounded-xl bg-emerald-500/10 p-3">
                    <Icon className="size-5 text-emerald-500" />
                </div>
            </div>

            {children}
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-background px-4 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="max-w-[170px] truncate text-right text-sm font-semibold">{value}</span>
        </div>
    );
}

function StatusBox({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'success' | 'warning' | 'danger';
}) {
    const styles = {
        success: 'bg-emerald-500/10 text-emerald-600',
        warning: 'bg-amber-500/10 text-amber-600',
        danger: 'bg-red-500/10 text-red-600',
    };

    return (
        <div className={`rounded-xl p-3 text-center ${styles[tone]}`}>
            <div className="text-lg font-bold">{formatNumber(value)}</div>
            <div className="text-xs font-medium">{label}</div>
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

function PaymentBadge({ status }: { status: string }) {
    const normalized = String(status || '').toLowerCase();

    const style =
        normalized === 'paid'
            ? 'bg-emerald-500/10 text-emerald-600'
            : normalized === 'partial'
              ? 'bg-amber-500/10 text-amber-600'
              : 'bg-red-500/10 text-red-600';

    return (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${style}`}>
            {status || 'unknown'}
        </span>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {text}
        </div>
    );
}