import { SubscriptionWorkspaceNav } from '@/components/subscription/subscription-workspace-nav';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SubscriptionSummary } from '@/types/subscription';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Clock3, CreditCard, ReceiptText, Search } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

interface BillingOrder {
    id: number;
    order_code: string;
    plan_name: string;
    order_type: string;
    billing_type: string;
    amount: number;
    currency: string;
    order_status: string;
    ordered_at: string | null;
    paid_at: string | null;
    verified_at: string | null;
    transaction_code: string | null;
    transaction_status: string | null;
    reference_number: string | null;
    payment_method_name: string | null;
    submitted_at: string | null;
}

interface PaginatedOrders {
    data: BillingOrder[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface HistoryProps {
    current: SubscriptionSummary;
    orders: PaginatedOrders;
    filters: {
        search: string;
        status: string;
    };
    summary: {
        total: number;
        pending: number;
        submitted: number;
        completed: number;
        total_paid: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subscription & Billing',
        href: '/settings/subscription',
    },
    {
        title: 'Billing History',
        href: '/settings/subscription/history',
    },
];

function formatMoney(value: number, currency = 'PHP'): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
    }).format(value);
}

function formatDate(value: string | null): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function humanize(value: string | null): string {
    if (!value) return 'Not available';

    return value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClasses(status: string): string {
    if (['paid', 'verified'].includes(status)) {
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    }

    if (status === 'payment_submitted') {
        return 'border-blue-500/20 bg-blue-500/10 text-blue-300';
    }

    if (status === 'pending') {
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
    }

    return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
}

export default function BillingHistoryIndex({ current, orders, filters, summary }: HistoryProps) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            route('subscription.history', undefined, false),
            { search, status },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing History" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-5">
                <SubscriptionWorkspaceNav active="history" />

                <section className="border-border/70 bg-card rounded-2xl border p-4 md:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-primary text-[10px] font-semibold tracking-[0.15em] uppercase">Subscription records</p>

                            <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">Billing History</h1>

                            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                                Review every subscription order, payment submission, and verification result for {current.plan_name ?? 'your account'}
                                .
                            </p>
                        </div>

                        <span className="border-border bg-muted/40 text-muted-foreground w-fit rounded-full border px-3 py-1.5 text-xs font-semibold">
                            {orders.total} records
                        </span>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="All orders" value={String(summary.total)} icon={<ReceiptText className="size-4" />} />
                    <SummaryCard label="Pending" value={String(summary.pending)} icon={<Clock3 className="size-4" />} />
                    <SummaryCard label="Submitted" value={String(summary.submitted)} icon={<CreditCard className="size-4" />} />
                    <SummaryCard
                        label="Verified value"
                        value={formatMoney(summary.total_paid, current.currency ?? 'PHP')}
                        icon={<CheckCircle2 className="size-4" />}
                    />
                </section>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border">
                    <form onSubmit={applyFilters} className="border-border/60 flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
                        <label className="relative min-w-0 flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search order, transaction, reference, or plan"
                                className="border-input bg-background focus:ring-ring h-10 w-full rounded-lg border pr-3 pl-9 text-xs outline-none focus:ring-2"
                            />
                        </label>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="border-input bg-background focus:ring-ring h-10 rounded-lg border px-3 text-xs outline-none focus:ring-2"
                        >
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="payment_submitted">Payment submitted</option>
                            <option value="paid">Paid</option>
                            <option value="verified">Verified</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground inline-flex h-10 items-center justify-center rounded-lg px-4 text-xs font-semibold"
                        >
                            Apply filters
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left">
                            <thead className="border-border/60 bg-muted/25 text-muted-foreground border-b text-[9px] tracking-[0.1em] uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Order</th>
                                    <th className="px-4 py-3 font-semibold">Plan</th>
                                    <th className="px-4 py-3 font-semibold">Payment</th>
                                    <th className="px-4 py-3 font-semibold">Amount</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Ordered</th>
                                </tr>
                            </thead>

                            <tbody className="divide-border/60 divide-y">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center">
                                            <ReceiptText className="text-muted-foreground/50 mx-auto size-8" />
                                            <p className="mt-3 text-sm font-semibold">No billing records found</p>
                                            <p className="text-muted-foreground mt-1 text-xs">Try changing the search or status filter.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/20 align-top transition">
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-semibold">{order.order_code}</p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">{humanize(order.order_type)}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-semibold">{order.plan_name}</p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">{humanize(order.billing_type)}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-medium">{order.payment_method_name ?? 'Not submitted'}</p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {order.reference_number ?? order.transaction_code ?? 'No reference'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold tabular-nums">
                                                {formatMoney(order.amount, order.currency)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-[0.08em] uppercase ${statusClasses(order.order_status)}`}
                                                >
                                                    {humanize(order.order_status)}
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 text-[10px]">{formatDate(order.ordered_at)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination data={orders} />
                </section>
            </div>
        </AppLayout>
    );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="border-border/70 bg-card rounded-xl border p-3.5">
            <div className="text-muted-foreground flex items-center gap-2 text-[9px] font-semibold tracking-[0.12em] uppercase">
                <span className="text-primary">{icon}</span>
                {label}
            </div>
            <p className="mt-2 truncate text-base font-bold">{value}</p>
        </div>
    );
}

function Pagination({ data }: { data: PaginatedOrders }) {
    if (data.last_page <= 1) return null;

    return (
        <div className="border-border/60 flex items-center justify-between gap-3 border-t px-4 py-3 text-xs">
            <p className="text-muted-foreground">
                Showing {data.from ?? 0}–{data.to ?? 0} of {data.total}
            </p>

            <div className="flex items-center gap-2">
                {data.prev_page_url ? (
                    <Link
                        href={data.prev_page_url}
                        preserveScroll
                        preserveState
                        className="hover:bg-muted/40 rounded-lg border px-3 py-1.5 font-semibold"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="text-muted-foreground rounded-lg border px-3 py-1.5 opacity-50">Previous</span>
                )}

                <span className="text-muted-foreground">
                    Page {data.current_page} of {data.last_page}
                </span>

                {data.next_page_url ? (
                    <Link
                        href={data.next_page_url}
                        preserveScroll
                        preserveState
                        className="hover:bg-muted/40 rounded-lg border px-3 py-1.5 font-semibold"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="text-muted-foreground rounded-lg border px-3 py-1.5 opacity-50">Next</span>
                )}
            </div>
        </div>
    );
}
