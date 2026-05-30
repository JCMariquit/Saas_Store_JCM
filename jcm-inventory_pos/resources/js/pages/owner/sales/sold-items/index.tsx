import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package2, PhilippinePeso, RotateCcw, Search, ShoppingBag, TrendingUp } from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';

const SOLD_ITEMS_URL = '/client/sales/sold-items';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sold Items', href: SOLD_ITEMS_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
};

type SoldItem = {
    id: number;
    sale_id: number;
    product_id: number;
    product_name: string;
    sku?: string | null;
    quantity: string | number;
    unit_price: string | number;
    unit_cost: string | number;
    discount_amount: string | number;
    line_total: string | number;
    created_at: string;
    sale_no: string;
    sale_status: string;
    sold_at: string;
    branch_name?: string | null;
    branch_code?: string | null;
    payment_method?: string | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type Summary = {
    total_lines: number | string;
    total_qty: number | string;
    total_revenue: number | string;
    estimated_profit: number | string;
};

type PageProps = {
    items: Paginated<SoldItem>;
    branches: Branch[];
    summary: Summary;
    filters?: {
        search?: string | null;
        branch_id?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
};

export default function SoldItemsIndex({ items, branches = [], summary, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [branchId, setBranchId] = useState(filters?.branch_id ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                SOLD_ITEMS_URL,
                {
                    search,
                    branch_id: branchId,
                    date_from: dateFrom,
                    date_to: dateTo,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, branchId, dateFrom, dateTo]);

    const resetFilters = () => {
        setSearch('');
        setBranchId('');
        setDateFrom('');
        setDateTo('');

        router.get(SOLD_ITEMS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const rows = useMemo(() => items?.data ?? [], [items]);

    const money = (value: string | number | null | undefined) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value ?? 0));

    const number = (value: string | number | null | undefined) =>
        new Intl.NumberFormat('en-PH', {
            maximumFractionDigits: 2,
        }).format(Number(value ?? 0));

    const formatDate = (date: string | null | undefined) => {
        if (!date) return '—';

        return new Date(date).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const paymentLabel = (method?: string | null) => {
        if (!method) return '—';

        return method.replace('_', ' ').toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sold Items" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Sold Items</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View all products sold from completed POS transactions.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        title="Sold Lines"
                        value={number(summary?.total_lines)}
                        icon={<ShoppingBag className="size-5" />}
                    />

                    <SummaryCard
                        title="Total Qty Sold"
                        value={number(summary?.total_qty)}
                        icon={<Package2 className="size-5" />}
                        variant="success"
                    />

                    <SummaryCard
                        title="Total Revenue"
                        value={money(summary?.total_revenue)}
                        icon={<PhilippinePeso className="size-5" />}
                    />

                    <SummaryCard
                        title="Est. Profit"
                        value={money(summary?.estimated_profit)}
                        icon={<TrendingUp className="size-5" />}
                        variant="success"
                    />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl">Sold Product Records</CardTitle>
                            <CardDescription>
                                Product-level sales list with quantity, unit price, receipt number, branch, and payment method.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 grid gap-3 md:grid-cols-5">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search product, SKU, or sale no..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <select
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All branches</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={String(branch.id)}>
                                        {branch.name}
                                        {branch.code ? ` (${branch.code})` : ''}
                                        {branch.is_main ? ' — Main' : ''}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />

                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                    title="Reset"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Receipt</th>
                                        <th className="px-4 py-3 font-medium">Branch</th>
                                        <th className="px-4 py-3 text-right font-medium">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                                        <th className="px-4 py-3 text-right font-medium">Discount</th>
                                        <th className="px-4 py-3 text-right font-medium">Line Total</th>
                                        <th className="px-4 py-3 font-medium">Payment</th>
                                        <th className="px-4 py-3 font-medium">Sold At</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.length > 0 ? (
                                        rows.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t border-sidebar-border/70 transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                            <Package2 className="size-4" />
                                                        </div>

                                                        <div>
                                                            <div className="font-medium">{item.product_name}</div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                SKU: {item.sku || '—'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className="font-medium">{item.sale_no}</span>
                                                    <div className="mt-1 text-xs text-muted-foreground">{item.sale_status}</div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {item.branch_name ?? 'No branch'}
                                                    {item.branch_code ? ` (${item.branch_code})` : ''}
                                                </td>

                                                <td className="px-4 py-3 text-right">{number(item.quantity)}</td>
                                                <td className="px-4 py-3 text-right">{money(item.unit_price)}</td>
                                                <td className="px-4 py-3 text-right">{money(item.discount_amount)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{money(item.line_total)}</td>

                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                        {paymentLabel(item.payment_method)}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.sold_at)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-16 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <Package2 className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">No sold items found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Sold products will appear here after checkout transactions.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing <b>{items?.from ?? 0}</b> to <b>{items?.to ?? 0}</b> of <b>{items?.total ?? 0}</b> sold items
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(items?.links ?? []).map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                        className={[
                                            'min-w-9 rounded-md border px-3 py-2 text-xs',
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted',
                                            !link.url ? 'cursor-not-allowed opacity-50' : '',
                                        ].join(' ')}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    variant = 'default',
}: {
    title: string;
    value: string;
    icon: ReactNode;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5">
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
                </div>

                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}