import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { PackageCheck, Receipt, RotateCcw, Search, Store, Undo2, Wallet, XCircle } from 'lucide-react';
import { useState } from 'react';

const RETURNS_URL = '/staff/manager/returns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Sales Returns', href: RETURNS_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type ReturnItem = {
    id: number;
    sale_id: number;
    sale_item_id: number;
    product_id: number;
    return_no: string;
    quantity: number | string;
    unit_price: number | string;
    line_total: number | string;
    reason?: string | null;
    status: 'completed' | 'cancelled';
    returned_by?: number | null;
    returned_at?: string | null;
    sale_no?: string | null;
    payment_status?: 'paid' | 'partial' | 'unpaid' | null;
    product_name?: string | null;
    sku?: string | null;
    current_product_name?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    returns: {
        data: ReturnItem[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    branch: Branch;
    summary: {
        total_returns: number;
        total_quantity: number;
        total_refund: number;
        completed_returns: number;
        cancelled_returns: number;
    };
    filters: {
        search?: string | null;
        status?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
};

export default function ManagerReturnsIndex({ returns, branch, summary, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');

    const money = (value: string | number | null | undefined) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (value?: string | null) => {
        if (!value) return '-';

        return new Date(value).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusBadge = (value: ReturnItem['status']) => {
        const classes = {
            completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
        };

        return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes[value]}`}>{value}</span>;
    };

    const paymentBadge = (value?: ReturnItem['payment_status']) => {
        if (!value) return <span className="text-muted-foreground">-</span>;

        const classes = {
            paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
            partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
            unpaid: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
        };

        return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes[value]}`}>{value}</span>;
    };

    const applyFilters = () => {
        router.get(
            RETURNS_URL,
            {
                search,
                status,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');

        router.get(RETURNS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Sales Returns" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                <Store className="size-5 text-muted-foreground" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="text-xl">{branch.name}</CardTitle>

                                    {branch.is_main && (
                                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            Main
                                        </span>
                                    )}

                                    <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                        Active
                                    </span>
                                </div>

                                <CardDescription className="mt-1">
                                    Branch code: {branch.code || 'No code'} · Manager branch returns only.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-5">
                    <SummaryCard title="Return Rows" value={summary.total_returns} icon={Receipt} variant="default" />
                    <SummaryCard title="Returned Qty" value={Number(summary.total_quantity).toLocaleString()} icon={PackageCheck} variant="success" />
                    <SummaryCard title="Refund Total" value={money(summary.total_refund)} icon={Wallet} variant="warning" />
                    <SummaryCard title="Completed" value={summary.completed_returns} icon={Undo2} variant="success" />
                    <SummaryCard title="Cancelled" value={summary.cancelled_returns} icon={XCircle} variant="danger" />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div>
                            <CardTitle className="text-xl">Sales Returns</CardTitle>
                            <CardDescription className="mt-1">
                                View returned items from your assigned branch.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 grid gap-3 md:grid-cols-6">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    placeholder="Search return no, sale no, product, SKU..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    Filter
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Return</th>
                                        <th className="px-4 py-3 font-medium">Sale</th>
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 text-right font-medium">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                                        <th className="px-4 py-3 text-right font-medium">Refund</th>
                                        <th className="px-4 py-3 font-medium">Payment</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Returned At</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {returns.data.length > 0 ? (
                                        returns.data.map((item) => (
                                            <tr key={item.id} className="border-t border-sidebar-border/70 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{item.return_no}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Reason: {item.reason || 'No reason'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{item.sale_no || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">Sale ID: {item.sale_id}</div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                                            <Undo2 className="size-4 text-muted-foreground" />
                                                        </div>

                                                        <div>
                                                            <div className="font-medium">
                                                                {item.product_name || item.current_product_name || 'Unknown product'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">SKU: {item.sku || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-right">{Number(item.quantity ?? 0)}</td>
                                                <td className="px-4 py-3 text-right">{money(item.unit_price)}</td>
                                                <td className="px-4 py-3 text-right font-medium">{money(item.line_total)}</td>
                                                <td className="px-4 py-3">{paymentBadge(item.payment_status)}</td>
                                                <td className="px-4 py-3">{statusBadge(item.status)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.returned_at)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-14 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <Undo2 className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">No returns found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Returned items from this branch will appear here.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {returns.from ?? 0} to {returns.to ?? 0} of {returns.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {returns.links.map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                                        }`}
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
    icon: Icon,
    variant = 'default',
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
                <CardDescription>{title}</CardDescription>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>

            <CardContent className="p-5 pt-0">
                <CardTitle className="text-xl">{value}</CardTitle>
            </CardContent>
        </Card>
    );
}