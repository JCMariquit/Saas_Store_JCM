import { SubscriptionWorkspaceNav } from '@/components/subscription/subscription-workspace-nav';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SubscriptionSummary } from '@/types/subscription';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Building2, CheckCircle2, Gauge, Users, Warehouse } from 'lucide-react';
import type { ReactNode } from 'react';

interface UsageItem {
    code: string;
    label: string;
    description: string;
    used: number;
    active: number;
    limit: number | null;
    is_unlimited: boolean;
}

interface UsageProps {
    current: SubscriptionSummary;
    usage: UsageItem[];
    summary: {
        tracked_resources: number;
        near_limit: number;
        reached_limit: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription & Billing', href: '/settings/subscription' },
    { title: 'Usage & Limits', href: '/settings/subscription/usage' },
];

const icons = {
    max_branches: Building2,
    max_warehouses: Warehouse,
    max_team_members: Users,
};

function usagePercent(item: UsageItem): number {
    if (item.is_unlimited || item.limit === null) return 0;
    if (item.limit === 0) return item.used > 0 ? 100 : 0;
    return Math.min(100, Math.round((item.used / item.limit) * 100));
}

function limitLabel(item: UsageItem): string {
    if (item.is_unlimited) return 'Unlimited';
    if (item.limit === null) return 'Not configured';
    if (item.limit === 0) return 'Not included';
    return String(item.limit);
}

export default function UsageIndex({ current, usage, summary }: UsageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usage & Limits" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-5">
                <SubscriptionWorkspaceNav active="usage" />

                <section className="border-border/70 bg-card rounded-2xl border p-4 md:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-primary text-[10px] font-semibold tracking-[0.15em] uppercase">Plan capacity</p>
                            <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">Usage & Limits</h1>
                            <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                                Track the operational resources currently using your {current.plan_name ?? 'subscription plan'} allowance.
                            </p>
                        </div>

                        <Link
                            href={route('subscription.index', undefined, false)}
                            className="bg-primary text-primary-foreground inline-flex h-9 w-fit items-center rounded-lg px-3 text-xs font-semibold"
                        >
                            Review plans
                        </Link>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Tracked resources" value={String(summary.tracked_resources)} icon={<Gauge className="size-4" />} />
                    <Metric label="Near limit" value={String(summary.near_limit)} icon={<AlertCircle className="size-4" />} />
                    <Metric label="Limit reached" value={String(summary.reached_limit)} icon={<CheckCircle2 className="size-4" />} />
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    {usage.map((item) => {
                        const Icon = icons[item.code as keyof typeof icons] ?? Gauge;
                        const percent = usagePercent(item);
                        const reached = !item.is_unlimited && item.limit !== null && item.used >= item.limit;
                        const near = !reached && percent >= 80;

                        return (
                            <article key={item.code} className="border-border/70 bg-card rounded-2xl border p-4 md:p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="border-primary/15 bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl border">
                                        <Icon className="size-5" />
                                    </div>

                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-[0.08em] uppercase ${reached ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : near ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}
                                    >
                                        {reached ? 'Limit reached' : near ? 'Near limit' : 'Available'}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-sm font-semibold">{item.label}</h2>
                                <p className="text-muted-foreground mt-1 min-h-10 text-xs leading-5">{item.description}</p>

                                <div className="mt-5 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">Current usage</p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums">
                                            {item.used} <span className="text-muted-foreground text-sm font-medium">/ {limitLabel(item)}</span>
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground text-xs font-semibold">{item.active} active</p>
                                </div>

                                {!item.is_unlimited && item.limit !== null && item.limit > 0 ? (
                                    <div className="mt-4">
                                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                                            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                                        </div>
                                        <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px]">
                                            <span>{percent}% utilized</span>
                                            <span>{Math.max(0, item.limit - item.used)} remaining</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-border/60 bg-muted/20 text-muted-foreground mt-4 rounded-lg border px-3 py-2 text-[10px]">
                                        {item.is_unlimited
                                            ? 'This resource has no plan limit.'
                                            : 'This resource is not included in the current plan.'}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            </div>
        </AppLayout>
    );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="border-border/70 bg-card rounded-xl border p-3.5">
            <div className="text-muted-foreground flex items-center gap-2 text-[9px] font-semibold tracking-[0.12em] uppercase">
                <span className="text-primary">{icon}</span>
                {label}
            </div>
            <p className="mt-2 text-base font-bold">{value}</p>
        </div>
    );
}
