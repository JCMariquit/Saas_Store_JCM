import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    BarChart3,
    CalendarDays,
    Package,
    Percent,
    Receipt,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/client/reports/sales',
    },
    {
        title: 'Sales Reports',
        href: '/client/reports/sales',
    },
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

export default function SalesReportIndex({
    filters,
    summary,
    daily_sales,
    top_products,
    recent_sales,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const maxSales = Math.max(...daily_sales.map((item) => Number(item.total_sales || 0)), 1);

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
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <BarChart3 className="size-5 text-primary" />
                                </div>

                                <div>
                                    <h1 className="text-xl font-semibold">Sales Reports</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Monitor sales performance, transactions, and top-selling products.
                                    </p>
                                </div>
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

                <div className="grid gap-4 xl:grid-cols-3">
                    <div className="rounded-xl border bg-card p-5 shadow-sm xl:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">Daily Sales</h2>
                                <p className="text-sm text-muted-foreground">Sales total per day.</p>
                            </div>
                            <CalendarDays className="size-5 text-muted-foreground" />
                        </div>

                        <div className="flex h-72 items-end gap-3 overflow-x-auto border-b pb-2">
                            {daily_sales.length === 0 ? (
                                <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                                    No sales found for selected date range.
                                </div>
                            ) : (
                                daily_sales.map((item) => (
                                    <div key={item.raw_date ?? item.date} className="flex min-w-16 flex-1 flex-col items-center gap-2">
                                        <div className="text-xs font-medium">{money(item.total_sales)}</div>

                                        <div
                                            className="w-full rounded-t-lg bg-primary/80 transition-all hover:bg-primary"
                                            style={{
                                                height: `${Math.max((Number(item.total_sales || 0) / maxSales) * 180, 8)}px`,
                                            }}
                                            title={`${item.date}: ${money(item.total_sales)} • ${item.transaction_count} transaction(s)`}
                                        />

                                        <div className="text-xs text-muted-foreground">{item.date}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="mb-4">
                            <h2 className="font-semibold">Top Products</h2>
                            <p className="text-sm text-muted-foreground">By total sales amount.</p>
                        </div>

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
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="font-semibold">Recent Sales</h2>
                        <p className="text-sm text-muted-foreground">
                            Latest completed transactions in selected date range.
                        </p>
                    </div>

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