import { PageHero } from '@/components/admin-ui/page-hero';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, CalendarClock, CircleAlert, Clock3, CreditCard, PhilippinePeso, ShieldCheck, TimerOff } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Subscriptions Overview', href: '/admin/overviews/subscriptions' }];

type Props = {
    stats: {
        total: number;
        active: number;
        trial: number;
        attention: number;
        expired: number;
        expiring_7_days: number;
        expiring_30_days: number;
        estimated_mrr: number;
    };
    statusDistribution: { label: string; status: string; total: number }[];
    productDistribution: {
        product_name: string;
        plan_name: string;
        subscriptions: number;
        live_subscriptions: number;
        value: number | string;
    }[];
    recentSubscriptions: {
        id: number;
        subscription_code: string;
        subscription_type: string;
        status: string;
        amount: number | string;
        start_date?: string | null;
        end_date?: string | null;
        current_period_end?: string | null;
        updated_at: string;
        owner_name: string;
        product_name: string;
        plan_name: string;
    }[];
    recentEvents: {
        id: number;
        event_type: string;
        old_status?: string | null;
        new_status?: string | null;
        notes?: string | null;
        created_at: string;
        owner_name: string;
        actor_name?: string | null;
        product_name?: string | null;
        subscription_code: string;
    }[];
};

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0));
}

function date(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value));
}

function dateTime(value: string) {
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function statusClass(status: string) {
    if (status === 'active' || status === 'trial') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500';
    if (status === 'past_due' || status === 'grace_period' || status === 'pending') return 'border-amber-500/20 bg-amber-500/10 text-amber-500';
    if (status === 'expired' || status === 'cancelled' || status === 'locked' || status === 'suspended')
        return 'border-rose-500/20 bg-rose-500/10 text-rose-500';
    return 'border-border bg-muted text-muted-foreground';
}

export default function SubscriptionsOverview({ stats, statusDistribution, productDistribution, recentSubscriptions, recentEvents }: Props) {
    const maxStatus = Math.max(...statusDistribution.map((row) => row.total), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions Overview" />

            <div className="space-y-5">
                <PageHero
                    eyebrow="Lifecycle & Recurring Access"
                    title="Subscriptions Overview"
                    description="See subscription health, recurring value, upcoming expirations, plan distribution, and recent lifecycle events across every JCM system."
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                    <StatsCard title="Total" value={stats.total} icon={<CreditCard className="size-5" />} />
                    <StatsCard title="Active" value={stats.active} icon={<ShieldCheck className="size-5" />} tone="emerald" />
                    <StatsCard title="Trials" value={stats.trial} icon={<Clock3 className="size-5" />} tone="indigo" />
                    <StatsCard title="Needs attention" value={stats.attention} icon={<CircleAlert className="size-5" />} tone="amber" />
                    <StatsCard title="Expired" value={stats.expired} icon={<TimerOff className="size-5" />} tone="rose" />
                    <StatsCard title="Expiring 7 days" value={stats.expiring_7_days} icon={<CalendarClock className="size-5" />} tone="amber" />
                    <StatsCard title="Expiring 30 days" value={stats.expiring_30_days} icon={<Activity className="size-5" />} />
                    <StatsCard title="Estimated MRR" value={money(stats.estimated_mrr)} icon={<PhilippinePeso className="size-5" />} tone="emerald" />
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
                    <SectionCard
                        title="Subscription health"
                        description="Current lifecycle-state distribution."
                        actions={
                            <Button asChild size="sm">
                                <Link href="/admin/subscriptions">Open controls</Link>
                            </Button>
                        }
                    >
                        <div className="space-y-4">
                            {statusDistribution.map((row) => (
                                <div key={row.status}>
                                    <div className="mb-1.5 flex items-center justify-between text-xs">
                                        <span className="text-foreground font-semibold">{row.label}</span>
                                        <span className="text-muted-foreground">{row.total}</span>
                                    </div>
                                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{ width: `${Math.max((row.total / maxStatus) * 100, 4)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Systems and plans" description="Subscription volume and value by product-plan combination.">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-left text-xs">
                                <thead className="border-border/60 text-muted-foreground border-b text-[9px] tracking-wider uppercase">
                                    <tr>
                                        <th className="px-3 py-2.5">System</th>
                                        <th className="px-3 py-2.5">Plan</th>
                                        <th className="px-3 py-2.5">Total</th>
                                        <th className="px-3 py-2.5">Live</th>
                                        <th className="px-3 py-2.5">Recorded value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border/50 divide-y">
                                    {productDistribution.map((row) => (
                                        <tr key={`${row.product_name}-${row.plan_name}`} className="hover:bg-muted/25">
                                            <td className="text-foreground px-3 py-3 font-semibold">{row.product_name}</td>
                                            <td className="text-muted-foreground px-3 py-3">{row.plan_name}</td>
                                            <td className="px-3 py-3">{row.subscriptions}</td>
                                            <td className="px-3 py-3 text-emerald-500">{row.live_subscriptions}</td>
                                            <td className="text-primary px-3 py-3 font-semibold">{money(row.value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <SectionCard title="Recent subscriptions" description="Latest subscription records and updates.">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-xs">
                                <thead className="border-border/60 text-muted-foreground border-b text-[9px] tracking-wider uppercase">
                                    <tr>
                                        <th className="px-3 py-2.5">Owner</th>
                                        <th className="px-3 py-2.5">System / plan</th>
                                        <th className="px-3 py-2.5">Period</th>
                                        <th className="px-3 py-2.5">Amount</th>
                                        <th className="px-3 py-2.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border/50 divide-y">
                                    {recentSubscriptions.map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-muted/25">
                                            <td className="px-3 py-3">
                                                <p className="text-foreground font-semibold">{subscription.owner_name}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[9px]">{subscription.subscription_code}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p>{subscription.product_name}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[9px]">{subscription.plan_name}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="capitalize">{subscription.subscription_type}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[9px]">
                                                    Ends {date(subscription.end_date || subscription.current_period_end)}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3 font-semibold">{money(subscription.amount)}</td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`rounded-full border px-2 py-1 text-[8px] font-semibold uppercase ${statusClass(subscription.status)}`}
                                                >
                                                    {subscription.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>

                    <SectionCard title="Lifecycle activity" description="Recent subscription events and administrative changes.">
                        <div className="space-y-3">
                            {recentEvents.map((event) => (
                                <article key={event.id} className="border-border/60 bg-background/35 rounded-xl border p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-foreground text-xs font-semibold capitalize">{event.event_type.replace('_', ' ')}</p>
                                            <p className="text-muted-foreground mt-1 text-[9px]">
                                                {event.owner_name} · {event.product_name || 'System'}
                                            </p>
                                        </div>
                                        <span className="text-muted-foreground text-[8px]">{dateTime(event.created_at)}</span>
                                    </div>
                                    {event.notes && <p className="text-muted-foreground mt-2 text-[9px] leading-4">{event.notes}</p>}
                                    <p className="text-muted-foreground mt-2 text-[8px]">
                                        Actor: {event.actor_name || 'System'} · {event.subscription_code}
                                    </p>
                                </article>
                            ))}
                            {recentEvents.length === 0 && <p className="text-muted-foreground text-xs">No subscription events yet.</p>}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}
