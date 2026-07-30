import { SubscriptionWorkspaceNav } from '@/components/subscription/subscription-workspace-nav';
import AppLayout from '@/layouts/app-layout';
import type { SubscriptionSummary } from '@/types/subscription';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    RefreshCcw,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ActivityRecord {
    id: string;
    source: string;
    type: string;
    title: string;
    description: string;
    status: string;
    reference: string | null;
    actor_name: string | null;
    occurred_at: string | null;
}

interface CycleRecord {
    id: number;
    cycle_number: number;
    plan_name: string;
    billing_type: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    amount: number;
    currency: string;
    activated_at: string | null;
    completed_at: string | null;
}

interface ActivityProps {
    current: SubscriptionSummary;
    activities: ActivityRecord[];
    cycles: CycleRecord[];
    summary: {
        total_activities: number;
        total_cycles: number;
        active_cycles: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription & Billing', href: '/settings/subscription' },
    { title: 'Subscription Activity', href: '/settings/subscription/activity' },
];

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

function formatShortDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
    }).format(value);
}

function statusClasses(status: string): string {
    if (['active', 'activated', 'renewed', 'verified', 'paid', 'resumed'].includes(status)) {
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    }
    if (['pending', 'submitted', 'payment_submitted', 'past_due'].includes(status)) {
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
    }
    if (['expired', 'cancelled', 'failed', 'rejected', 'suspended'].includes(status)) {
        return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
    }
    return 'border-border bg-muted/30 text-muted-foreground';
}

export default function ActivityIndex({
    current,
    activities,
    cycles,
    summary,
}: ActivityProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription Activity" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-5">
                <SubscriptionWorkspaceNav active="activity" />

                <section className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">Audit timeline</p>
                    <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">Subscription Activity</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                        A chronological record of plan changes, billing orders, payment updates, and subscription cycles.
                    </p>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Timeline records" value={String(summary.total_activities)} icon={<Activity className="size-4" />} />
                    <Metric label="Billing cycles" value={String(summary.total_cycles)} icon={<CalendarDays className="size-4" />} />
                    <Metric label="Active cycles" value={String(summary.active_cycles)} icon={<CheckCircle2 className="size-4" />} />
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                    <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
                        <div className="flex items-center gap-2">
                            <Activity className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">Account timeline</h2>
                        </div>

                        <div className="mt-5 space-y-0">
                            {activities.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
                                    <Clock3 className="mx-auto size-8 text-muted-foreground/50" />
                                    <p className="mt-3 text-sm font-semibold">No subscription activity yet</p>
                                </div>
                            ) : (
                                activities.map((item, index) => (
                                    <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                                        {index < activities.length - 1 && <span className="absolute left-[17px] top-8 h-full w-px bg-border" />}
                                        <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary">
                                            {item.source === 'payment' ? <CreditCard className="size-4" /> : item.source === 'order' ? <RefreshCcw className="size-4" /> : <Activity className="size-4" />}
                                        </div>
                                        <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-muted/10 p-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold">{item.title}</p>
                                                    <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{item.description}</p>
                                                </div>
                                                <span className={`w-fit shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusClasses(item.status)}`}>
                                                    {item.status.replaceAll('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-muted-foreground">
                                                <span>{formatDate(item.occurred_at)}</span>
                                                {item.reference && <span>{item.reference}</span>}
                                                {item.actor_name && <span>by {item.actor_name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold">Billing cycles</h2>
                        </div>

                        <div className="mt-4 space-y-3">
                            {cycles.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-xs text-muted-foreground">No billing cycles recorded.</div>
                            ) : (
                                cycles.map((cycle) => (
                                    <article key={cycle.id} className="rounded-xl border border-border/60 bg-muted/10 p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold">Cycle {cycle.cycle_number}</p>
                                                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{cycle.plan_name} · {cycle.billing_type}</p>
                                            </div>
                                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${statusClasses(cycle.status)}`}>{cycle.status}</span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-[10px]">
                                            <div><p className="text-muted-foreground">Period</p><p className="mt-1 font-semibold">{formatShortDate(cycle.start_date)} – {formatShortDate(cycle.end_date)}</p></div>
                                            <div><p className="text-muted-foreground">Amount</p><p className="mt-1 font-semibold">{formatMoney(cycle.amount, cycle.currency)}</p></div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
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
            <p className="mt-2 text-base font-bold">{value}</p>
        </div>
    );
}
