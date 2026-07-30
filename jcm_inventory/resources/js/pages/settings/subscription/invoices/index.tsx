import { SubscriptionWorkspaceNav } from '@/components/subscription/subscription-workspace-nav';
import AppLayout from '@/layouts/app-layout';
import type { SubscriptionSummary } from '@/types/subscription';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Printer,
    ReceiptText,
    ScrollText,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ReceiptRecord {
    id: number;
    receipt_code: string;
    order_code: string;
    plan_name: string;
    order_type: string;
    billing_type: string;
    amount: number;
    currency: string;
    status: string;
    payment_method_name: string | null;
    reference_number: string | null;
    sender_name: string | null;
    sender_account: string | null;
    paid_at: string | null;
    verified_at: string | null;
    verified_by_name: string | null;
}

interface PaginatedReceipts {
    data: ReceiptRecord[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface InvoiceProps {
    current: SubscriptionSummary;
    receipts: PaginatedReceipts;
    summary: {
        total_receipts: number;
        total_paid: number;
        latest_verified_at: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription & Billing', href: '/settings/subscription' },
    { title: 'Invoices & Receipts', href: '/settings/subscription/invoices' },
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

function humanize(value: string): string {
    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function InvoicesIndex({
    current,
    receipts,
    summary,
}: InvoiceProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices & Receipts" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-5">
                <SubscriptionWorkspaceNav active="invoices" />

                <section className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
                                Verified payments
                            </p>
                            <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">Invoices & Receipts</h1>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                Verified subscription payments become official receipt records for the account owner.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-muted/40"
                        >
                            <Printer className="size-3.5" />
                            Print records
                        </button>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Verified receipts" value={String(summary.total_receipts)} icon={<ReceiptText className="size-4" />} />
                    <Metric label="Verified amount" value={formatMoney(summary.total_paid, current.currency ?? 'PHP')} icon={<CheckCircle2 className="size-4" />} />
                    <Metric label="Latest verification" value={formatDate(summary.latest_verified_at)} icon={<ScrollText className="size-4" />} />
                </section>

                <section className="space-y-3">
                    {receipts.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                            <ReceiptText className="mx-auto size-9 text-muted-foreground/50" />
                            <h2 className="mt-3 text-sm font-semibold">No verified receipts yet</h2>
                            <p className="mt-1 text-xs text-muted-foreground">A receipt will appear after a submitted payment is verified.</p>
                        </div>
                    ) : (
                        receipts.data.map((receipt) => (
                            <article key={receipt.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                                <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-300">
                                            <ReceiptText className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{receipt.receipt_code}</p>
                                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">Order {receipt.order_code}</p>
                                        </div>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-lg font-bold tabular-nums">{formatMoney(receipt.amount, receipt.currency)}</p>
                                        <p className="text-[10px] text-muted-foreground">Verified {formatDate(receipt.verified_at)}</p>
                                    </div>
                                </div>

                                <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
                                    <ReceiptCell label="Plan" value={receipt.plan_name} detail={`${humanize(receipt.order_type)} · ${humanize(receipt.billing_type)}`} />
                                    <ReceiptCell label="Payment method" value={receipt.payment_method_name ?? 'Not recorded'} detail={receipt.reference_number ?? 'No reference number'} />
                                    <ReceiptCell label="Sender" value={receipt.sender_name ?? 'Not recorded'} detail={receipt.sender_account ?? 'No account number'} />
                                    <ReceiptCell label="Verified by" value={receipt.verified_by_name ?? 'JCM administrator'} detail={formatDate(receipt.verified_at)} />
                                </div>
                            </article>
                        ))
                    )}

                    <Pagination data={receipts} />
                </section>
            </div>
        </AppLayout>
    );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="rounded-xl border border-border/70 bg-card p-3.5">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span className="text-primary">{icon}</span>{label}
            </div>
            <p className="mt-2 truncate text-base font-bold">{value}</p>
        </div>
    );
}

function ReceiptCell({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <div className="min-w-0 bg-card p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
            <p className="mt-1.5 truncate text-xs font-semibold">{value}</p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">{detail}</p>
        </div>
    );
}

function Pagination({ data }: { data: PaginatedReceipts }) {
    if (data.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-xs">
            <p className="text-muted-foreground">Showing {data.from ?? 0}–{data.to ?? 0} of {data.total}</p>
            <div className="flex items-center gap-2">
                {data.prev_page_url ? <Link href={data.prev_page_url} preserveScroll preserveState className="rounded-lg border px-3 py-1.5 font-semibold">Previous</Link> : null}
                <span className="text-muted-foreground">Page {data.current_page} of {data.last_page}</span>
                {data.next_page_url ? <Link href={data.next_page_url} preserveScroll preserveState className="rounded-lg border px-3 py-1.5 font-semibold">Next</Link> : null}
            </div>
        </div>
    );
}
