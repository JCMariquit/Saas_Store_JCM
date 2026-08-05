import { PageHero } from '@/components/admin-ui/page-hero';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, Banknote, CalendarDays, ChartColumnIncreasing, Clock3, ReceiptText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Sales Overview', href: '/admin/overviews/sales' }];

type TrendRow = {
    label: string;
    revenue: number;
    payments: number;
    orders: number;
    verified_orders: number;
    open_orders: number;
};

type RevenueRow = { label: string; revenue: number; payments: number };
type PaymentMethodRow = { label: string; payments: number; amount: number };
type TopPlanRow = { plan_name: string; product_name: string; revenue: number; sales: number };
type PaymentRow = {
    id: number;
    transaction_code: string;
    reference_number?: string | null;
    amount: number | string;
    status: string;
    created_at: string;
    user_name: string;
    payment_method: string;
    product_name?: string | null;
    plan_name?: string | null;
    order_code: string;
};

type Props = {
    stats: {
        total_revenue: number;
        monthly_revenue: number;
        revenue_today: number;
        pending_amount: number;
        submitted_payments: number;
        verified_orders: number;
    };
    trend: TrendRow[];
    revenueByProduct: RevenueRow[];
    paymentMethods: PaymentMethodRow[];
    topPlans: TopPlanRow[];
    recentPayments: PaymentRow[];
};

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
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
    if (status === 'verified') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500';
    if (status === 'submitted' || status === 'pending') return 'border-amber-500/20 bg-amber-500/10 text-amber-500';
    if (status === 'rejected' || status === 'failed') return 'border-rose-500/20 bg-rose-500/10 text-rose-500';
    return 'border-border bg-muted text-muted-foreground';
}

function MetricBars({ rows }: { rows: RevenueRow[] }) {
    const max = Math.max(...rows.map((row) => row.revenue), 1);

    return (
        <div className="space-y-4">
            {rows.length === 0 && <p className="text-muted-foreground text-xs">No verified revenue yet.</p>}
            {rows.map((row) => (
                <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="text-foreground truncate font-semibold">{row.label}</span>
                        <span className="text-muted-foreground shrink-0">{money(row.revenue)}</span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${Math.max((row.revenue / max) * 100, 3)}%` }}
                        />
                    </div>
                    <p className="text-muted-foreground mt-1 text-[9px]">{row.payments} verified payment(s)</p>
                </div>
            ))}
        </div>
    );
}

export default function SalesOverview({ stats, trend, revenueByProduct, paymentMethods, topPlans, recentPayments }: Props) {
    const maxTrend = Math.max(...trend.map((row) => row.revenue), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Overview" />

            <div className="space-y-5">
                <PageHero
                    eyebrow="Revenue & Commerce"
                    title="Sales Overview"
                    description="Track verified revenue, submitted payments, order performance, payment channels, and top-selling plans across every JCM system."
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <StatsCard title="Total revenue" value={money(stats.total_revenue)} icon={<Banknote className="size-5" />} tone="emerald" />
                    <StatsCard title="This month" value={money(stats.monthly_revenue)} icon={<CalendarDays className="size-5" />} tone="indigo" />
                    <StatsCard title="Today" value={money(stats.revenue_today)} icon={<ChartColumnIncreasing className="size-5" />} />
                    <StatsCard title="Pending amount" value={money(stats.pending_amount)} icon={<Clock3 className="size-5" />} tone="amber" />
                    <StatsCard title="For review" value={stats.submitted_payments} icon={<ReceiptText className="size-5" />} tone="rose" />
                    <StatsCard title="Verified orders" value={stats.verified_orders} icon={<BadgeCheck className="size-5" />} tone="emerald" />
                </div>

                <SectionCard
                    title="12-month sales trend"
                    description="Verified revenue with order and payment volume per month."
                    actions={
                        <Button asChild size="sm">
                            <Link href="/admin/payment-verifications">Review payments</Link>
                        </Button>
                    }
                >
                    <div className="overflow-x-auto">
                        <div className="border-border/60 bg-background/30 flex min-w-[820px] items-end gap-3 rounded-2xl border p-4">
                            {trend.map((row) => (
                                <div key={row.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                                    <span className="text-muted-foreground text-[8px] font-semibold">{money(row.revenue)}</span>
                                    <div className="bg-muted/45 flex h-44 w-full items-end justify-center rounded-xl px-2 pt-3">
                                        <div
                                            className="from-primary to-primary/55 w-full rounded-t-lg bg-gradient-to-t"
                                            style={{ height: `${Math.max((row.revenue / maxTrend) * 100, row.orders > 0 ? 8 : 2)}%` }}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-foreground text-[9px] font-semibold">{row.label}</p>
                                        <p className="text-muted-foreground text-[8px]">
                                            {row.orders} orders · {row.payments} payments
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <div className="grid gap-5 xl:grid-cols-2">
                    <SectionCard title="Revenue by system" description="Verified revenue contribution by product or service.">
                        <MetricBars rows={revenueByProduct} />
                    </SectionCard>

                    <SectionCard title="Payment channels" description="Transaction volume and submitted value by payment method.">
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.label}
                                    className="border-border/60 bg-background/35 flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                                >
                                    <div>
                                        <p className="text-foreground text-xs font-semibold">{method.label}</p>
                                        <p className="text-muted-foreground mt-1 text-[9px]">{method.payments} transaction(s)</p>
                                    </div>
                                    <p className="text-primary text-sm font-semibold">{money(method.amount)}</p>
                                </div>
                            ))}
                            {paymentMethods.length === 0 && <p className="text-muted-foreground text-xs">No payment transactions yet.</p>}
                        </div>
                    </SectionCard>
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                    <SectionCard title="Top plans" description="Plans ranked by verified payment revenue.">
                        <div className="space-y-3">
                            {topPlans.map((plan, index) => (
                                <div
                                    key={`${plan.product_name}-${plan.plan_name}`}
                                    className="border-border/60 bg-background/35 flex items-center gap-3 rounded-xl border p-3"
                                >
                                    <span className="border-primary/20 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-foreground truncate text-xs font-semibold">{plan.plan_name}</p>
                                        <p className="text-muted-foreground mt-0.5 truncate text-[9px]">
                                            {plan.product_name} · {plan.sales} sale(s)
                                        </p>
                                    </div>
                                    <span className="text-primary shrink-0 text-xs font-semibold">{money(plan.revenue)}</span>
                                </div>
                            ))}
                            {topPlans.length === 0 && <p className="text-muted-foreground text-xs">No verified plan sales yet.</p>}
                        </div>
                    </SectionCard>

                    <SectionCard title="Recent payments" description="Latest submitted, verified, and rejected payment attempts.">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-xs">
                                <thead className="border-border/60 text-muted-foreground border-b text-[9px] tracking-wider uppercase">
                                    <tr>
                                        <th className="px-3 py-2.5">Subscriber</th>
                                        <th className="px-3 py-2.5">System / plan</th>
                                        <th className="px-3 py-2.5">Payment</th>
                                        <th className="px-3 py-2.5">Amount</th>
                                        <th className="px-3 py-2.5">Status</th>
                                        <th className="px-3 py-2.5">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border/50 divide-y">
                                    {recentPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-muted/25">
                                            <td className="px-3 py-3">
                                                <p className="text-foreground font-semibold">{payment.user_name}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[9px]">{payment.order_code}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-foreground font-medium">{payment.product_name || 'Service'}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[9px]">{payment.plan_name || 'Custom order'}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p>{payment.payment_method}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[9px]">
                                                    {payment.reference_number || 'No reference'}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3 font-semibold">{money(payment.amount)}</td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`rounded-full border px-2 py-1 text-[8px] font-semibold uppercase ${statusClass(payment.status)}`}
                                                >
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground px-3 py-3 text-[9px]">{dateTime(payment.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}
