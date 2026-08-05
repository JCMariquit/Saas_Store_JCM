import { DataTable } from '@/components/admin-ui/data-table';
import { FormModal } from '@/components/admin-ui/form-modal';
import { PageHero } from '@/components/admin-ui/page-hero';
import { SearchInput } from '@/components/admin-ui/search-input';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Activity,
    Ban,
    CalendarClock,
    CheckCircle2,
    Clock3,
    CreditCard,
    KeyRound,
    LockKeyhole,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    TimerReset,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SubscriptionStatus = 'pending' | 'trial' | 'active' | 'past_due' | 'grace_period' | 'expired' | 'cancelled' | 'suspended' | 'locked';

type ControlAction = 'activate' | 'restore' | 'expire' | 'past_due' | 'grace_period' | 'lock' | 'suspend' | 'cancel' | 'change_plan';

type SubscriptionRow = {
    id: number;
    subscription_code: string;
    user_name: string | null;
    account_owner_name: string | null;
    account_owner_email: string | null;
    product_id: number;
    product_name: string | null;
    product_code: string | null;
    plan_id: number;
    plan_name: string | null;
    plan_code: string | null;
    subscription_type: string;
    status: SubscriptionStatus;
    access_mode: 'full' | 'read_only' | 'blocked';
    start_date: string | null;
    end_date: string | null;
    current_period_end: string | null;
    grace_ends_at: string | null;
    duration_days: number;
    amount: number | null;
    currency: string;
    notes: string | null;
    updated_at: string | null;
};

type PlanOption = {
    id: number;
    product_id: number;
    product_name: string | null;
    plan_name: string;
    plan_code: string;
    price: number;
    duration_days: number;
    billing_interval: string;
    currency: string;
};

type PaginationLink = { url: string | null; label: string; active: boolean };
type PaginatedSubscriptions = {
    data: SubscriptionRow[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    to: number | null;
    total: number;
};

type PageProps = {
    subscriptions: PaginatedSubscriptions;
    filters: { search: string; status: string; product_id: number | null };
    plans: PlanOption[];
    products: { id: number; name: string | null }[];
    statuses: SubscriptionStatus[];
    stats: { total: number; full_access: number; read_only: number; blocked: number };
    flash?: { success?: string };
};

type ControlForm = {
    action: ControlAction;
    plan_id: string;
    duration_days: string;
    grace_days: string;
    notes: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Subscription Control', href: '/admin/subscriptions' },
];

const actionOptions: Array<{
    value: ControlAction;
    label: string;
    description: string;
}> = [
    { value: 'activate', label: 'Activate', description: 'Grant full access for a new period.' },
    { value: 'restore', label: 'Restore full access', description: 'Recover a restricted subscription.' },
    { value: 'expire', label: 'Expire now', description: 'Move the account to read-only immediately.' },
    { value: 'past_due', label: 'Mark past due', description: 'Keep records readable while payment is due.' },
    { value: 'grace_period', label: 'Start grace period', description: 'Apply temporary read-only access.' },
    { value: 'lock', label: 'Lock access', description: 'Block the product immediately.' },
    { value: 'suspend', label: 'Suspend', description: 'Temporarily block the subscription.' },
    { value: 'cancel', label: 'Cancel', description: 'End the subscription and deactivate access.' },
    { value: 'change_plan', label: 'Change plan', description: 'Switch the account to another plan for the same product.' },
];

const tableColumns = [
    { key: 'subscription', label: 'Subscription' },
    { key: 'account', label: 'Account Owner' },
    { key: 'product', label: 'Product / Plan' },
    { key: 'access', label: 'Access' },
    { key: 'period', label: 'Period' },
    { key: 'actions', label: 'Control', align: 'center' as const },
];

function statusLabel(value: string): string {
    return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: SubscriptionStatus): string {
    switch (status) {
        case 'active':
        case 'trial':
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500';
        case 'past_due':
        case 'grace_period':
            return 'border-amber-500/20 bg-amber-500/10 text-amber-500';
        case 'expired':
            return 'border-orange-500/20 bg-orange-500/10 text-orange-500';
        case 'cancelled':
        case 'suspended':
        case 'locked':
            return 'border-red-500/20 bg-red-500/10 text-red-500';
        default:
            return 'border-border bg-muted text-muted-foreground';
    }
}

function formatMoney(value: number | null, currency = 'PHP'): string {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(value);
}

export default function SubscriptionsIndex() {
    const { subscriptions, filters, plans, products, statuses, stats, flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [productId, setProductId] = useState(filters.product_id?.toString() ?? '');
    const [selected, setSelected] = useState<SubscriptionRow | null>(null);
    const [controlOpen, setControlOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const form = useForm<ControlForm>({
        action: 'activate',
        plan_id: '',
        duration_days: '30',
        grace_days: '7',
        notes: '',
    });

    useEffect(() => {
        const timer = window.setTimeout(() => {
            router.get(
                route('admin.subscriptions.index'),
                {
                    search: search || undefined,
                    status: status || undefined,
                    product_id: productId || undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => window.clearTimeout(timer);
    }, [search, status, productId]);

    const availablePlans = useMemo(() => plans.filter((plan) => plan.product_id === selected?.product_id), [plans, selected?.product_id]);

    const openControl = (subscription: SubscriptionRow, action: ControlAction = 'activate') => {
        setSelected(subscription);
        form.setData({
            action,
            plan_id: subscription.plan_id.toString(),
            duration_days: Math.max(subscription.duration_days || 30, 1).toString(),
            grace_days: '7',
            notes: '',
        });
        form.clearErrors();
        setControlOpen(true);
    };

    const closeControl = () => {
        setControlOpen(false);
        setSelected(null);
        form.reset();
        form.clearErrors();
    };

    const submitControl = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selected) return;

        form.post(route('admin.subscriptions.control', selected.id), {
            preserveScroll: true,
            onSuccess: closeControl,
        });
    };

    const deleteSubscription = (subscription: SubscriptionRow) => {
        if (!window.confirm(`Delete ${subscription.subscription_code}? This is allowed only for cancelled or expired subscriptions.`)) {
            return;
        }

        router.delete(route('admin.subscriptions.destroy', subscription.id), {
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setProductId('');
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription Control" />

            <div className="space-y-5">
                <PageHero
                    eyebrow="JCM Flagship"
                    title="Subscription Control"
                    description="Control access states across every JCM product without editing the database manually."
                />

                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                        <CheckCircle2 className="size-4" />
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatsCard title="Total Subscriptions" value={stats.total} icon={<CreditCard className="size-5" />} tone="blue" />
                    <StatsCard
                        title="Full Access"
                        value={stats.full_access}
                        description="Active and trial"
                        icon={<ShieldCheck className="size-5" />}
                        tone="emerald"
                    />
                    <StatsCard
                        title="Read Only"
                        value={stats.read_only}
                        description="Past due, grace, expired"
                        icon={<Clock3 className="size-5" />}
                        tone="amber"
                    />
                    <StatsCard
                        title="Blocked"
                        value={stats.blocked}
                        description="Cancelled, suspended, locked"
                        icon={<ShieldAlert className="size-5" />}
                        tone="rose"
                    />
                </div>

                <SectionCard
                    title="All Product Subscriptions"
                    description="Filter by account, product, plan, or access state."
                    actions={
                        <Button type="button" variant="outline" onClick={resetFilters} className="rounded-xl">
                            <RefreshCw className="size-3.5" />
                            Reset
                        </Button>
                    }
                >
                    <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_220px]">
                        <SearchInput value={search} onChange={setSearch} placeholder="Search code, account, product, or plan..." />

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="border-input bg-background text-foreground focus:ring-primary/20 h-10 rounded-xl border px-3 text-xs outline-none focus:ring-2"
                        >
                            <option value="">All statuses</option>
                            {statuses.map((item) => (
                                <option key={item} value={item}>
                                    {statusLabel(item)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={productId}
                            onChange={(event) => setProductId(event.target.value)}
                            className="border-input bg-background text-foreground focus:ring-primary/20 h-10 rounded-xl border px-3 text-xs outline-none focus:ring-2"
                        >
                            <option value="">All products</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name ?? `Product ${product.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DataTable
                        columns={tableColumns}
                        empty={subscriptions.data.length === 0}
                        emptyMessage="No subscriptions match the current filters."
                    >
                        {subscriptions.data.map((subscription) => (
                            <tr key={subscription.id} className="border-border/70 hover:bg-primary/[0.035] border-t transition">
                                <td className="px-4 py-4">
                                    <p className="text-foreground text-xs font-semibold">{subscription.subscription_code}</p>
                                    <p className="text-muted-foreground mt-1 text-[9px] capitalize">{subscription.subscription_type}</p>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="text-foreground text-xs font-semibold">
                                        {subscription.account_owner_name ?? subscription.user_name ?? 'Unknown account'}
                                    </p>
                                    <p className="text-muted-foreground mt-1 max-w-52 truncate text-[9px]">
                                        {subscription.account_owner_email ?? 'No email'}
                                    </p>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="text-foreground text-xs font-semibold">{subscription.product_name ?? 'Unknown product'}</p>
                                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-[9px]">
                                        <span>{subscription.plan_name ?? 'No plan'}</span>
                                        <span>•</span>
                                        <span>{formatMoney(subscription.amount, subscription.currency)}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col items-start gap-1.5">
                                        <span
                                            className={cn(
                                                'rounded-full border px-2 py-1 text-[8px] font-semibold tracking-[0.08em] uppercase',
                                                statusClass(subscription.status),
                                            )}
                                        >
                                            {statusLabel(subscription.status)}
                                        </span>
                                        <span className="text-muted-foreground text-[8px] tracking-[0.08em] uppercase">
                                            {subscription.access_mode.replace('_', ' ')} access
                                        </span>
                                    </div>
                                </td>
                                <td className="text-muted-foreground px-4 py-4 text-[10px]">
                                    <p>{subscription.start_date ?? '—'}</p>
                                    <p className="mt-1">to {subscription.end_date ?? '—'}</p>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelected(subscription);
                                                setDetailsOpen(true);
                                            }}
                                            className="h-8 rounded-lg px-2.5 text-[9px]"
                                        >
                                            <Activity className="size-3.5" />
                                            View
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => openControl(subscription, subscription.access_mode === 'full' ? 'expire' : 'restore')}
                                            className="h-8 rounded-lg px-2.5 text-[9px]"
                                        >
                                            <SlidersHorizontal className="size-3.5" />
                                            Control
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    {subscriptions.links.length > 3 && (
                        <div className="border-border/60 mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                            <p className="text-muted-foreground text-[10px]">
                                Showing {subscriptions.from ?? 0}–{subscriptions.to ?? 0} of {subscriptions.total}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {subscriptions.links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url}
                                            preserveScroll
                                            className={cn(
                                                'rounded-lg border px-2.5 py-1.5 text-[9px] font-semibold transition',
                                                link.active
                                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={`${link.label}-${index}`}
                                            className="border-border/50 text-muted-foreground/50 rounded-lg border px-2.5 py-1.5 text-[9px]"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </SectionCard>
            </div>

            <FormModal
                open={controlOpen}
                title="Control Subscription"
                description={selected ? `${selected.subscription_code} · ${selected.product_name}` : undefined}
                onClose={closeControl}
                maxWidthClass="max-w-xl"
                tone={form.data.action === 'cancel' || form.data.action === 'lock' ? 'red' : 'blue'}
            >
                <form onSubmit={submitControl} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="control_action">Action</Label>
                        <select
                            id="control_action"
                            value={form.data.action}
                            onChange={(event) => form.setData('action', event.target.value as ControlAction)}
                            className="border-input bg-background text-foreground h-10 rounded-xl border px-3 text-xs"
                        >
                            {actionOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-muted-foreground text-[10px] leading-5">
                            {actionOptions.find((option) => option.value === form.data.action)?.description}
                        </p>
                        <InputError message={form.errors.action} />
                    </div>

                    {form.data.action === 'change_plan' && (
                        <div className="grid gap-2">
                            <Label htmlFor="plan_id">New plan</Label>
                            <select
                                id="plan_id"
                                value={form.data.plan_id}
                                onChange={(event) => form.setData('plan_id', event.target.value)}
                                className="border-input bg-background text-foreground h-10 rounded-xl border px-3 text-xs"
                            >
                                <option value="">Select plan</option>
                                {availablePlans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.plan_name} · {formatMoney(plan.price, plan.currency)} · {plan.duration_days} days
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.plan_id} />
                        </div>
                    )}

                    {(form.data.action === 'activate' || form.data.action === 'restore') && (
                        <div className="grid gap-2">
                            <Label htmlFor="duration_days">Access duration</Label>
                            <div className="relative">
                                <CalendarClock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <input
                                    id="duration_days"
                                    type="number"
                                    min={1}
                                    max={3650}
                                    value={form.data.duration_days}
                                    onChange={(event) => form.setData('duration_days', event.target.value)}
                                    className="border-input bg-background text-foreground h-10 w-full rounded-xl border pr-3 pl-10 text-xs"
                                />
                            </div>
                            <InputError message={form.errors.duration_days} />
                        </div>
                    )}

                    {form.data.action === 'grace_period' && (
                        <div className="grid gap-2">
                            <Label htmlFor="grace_days">Grace period days</Label>
                            <input
                                id="grace_days"
                                type="number"
                                min={1}
                                max={365}
                                value={form.data.grace_days}
                                onChange={(event) => form.setData('grace_days', event.target.value)}
                                className="border-input bg-background text-foreground h-10 rounded-xl border px-3 text-xs"
                            />
                            <InputError message={form.errors.grace_days} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="control_notes">Admin note</Label>
                        <textarea
                            id="control_notes"
                            value={form.data.notes}
                            onChange={(event) => form.setData('notes', event.target.value)}
                            className="border-input bg-background text-foreground min-h-24 rounded-xl border px-3 py-2 text-xs"
                            placeholder="Reason, test scenario, or internal note"
                        />
                        <InputError message={form.errors.notes} />
                    </div>

                    <div className="border-border/60 flex justify-end gap-2 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closeControl} className="rounded-xl">
                            Close
                        </Button>
                        <Button type="submit" disabled={form.processing} className="rounded-xl">
                            {form.processing ? <TimerReset className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                            {form.processing ? 'Applying...' : 'Apply control action'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            {detailsOpen && selected && (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        aria-label="Close details"
                        onClick={() => setDetailsOpen(false)}
                        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                    />
                    <aside className="app-scrollbar border-border bg-card absolute top-0 right-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l shadow-2xl">
                        <div className="border-border from-primary/[0.08] to-card border-b bg-gradient-to-r px-5 py-4">
                            <p className="text-primary text-[9px] font-semibold tracking-[0.12em] uppercase">Subscription record</p>
                            <h2 className="text-foreground mt-1 text-lg font-semibold">{selected.subscription_code}</h2>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {selected.account_owner_name} · {selected.product_name}
                            </p>
                        </div>

                        <div className="space-y-5 p-5">
                            <div className="grid grid-cols-2 gap-3">
                                <Detail label="Status" value={statusLabel(selected.status)} />
                                <Detail label="Access mode" value={selected.access_mode.replace('_', ' ')} />
                                <Detail label="Plan" value={selected.plan_name ?? '—'} />
                                <Detail label="Amount" value={formatMoney(selected.amount, selected.currency)} />
                                <Detail label="Start" value={selected.start_date ?? '—'} />
                                <Detail label="End" value={selected.end_date ?? '—'} />
                            </div>

                            <div className="border-border bg-muted/30 rounded-xl border p-4">
                                <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">Admin notes</p>
                                <p className="text-foreground/85 mt-2 text-xs leading-5">{selected.notes || 'No admin notes.'}</p>
                            </div>

                            <div className="border-border grid grid-cols-2 gap-2 border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        openControl(selected, 'restore');
                                    }}
                                    className="rounded-xl"
                                >
                                    <KeyRound className="size-4" /> Restore
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        openControl(selected, 'expire');
                                    }}
                                    className="rounded-xl border-orange-500/25 text-orange-500"
                                >
                                    <Clock3 className="size-4" /> Expire
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        openControl(selected, 'lock');
                                    }}
                                    className="rounded-xl border-red-500/25 text-red-500"
                                >
                                    <LockKeyhole className="size-4" /> Lock
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        openControl(selected, 'cancel');
                                    }}
                                    className="rounded-xl border-red-500/25 text-red-500"
                                >
                                    <Ban className="size-4" /> Cancel
                                </Button>
                            </div>

                            {(['cancelled', 'expired'] as SubscriptionStatus[]).includes(selected.status) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        deleteSubscription(selected);
                                    }}
                                    className="w-full rounded-xl border-red-500/25 text-red-500"
                                >
                                    <Trash2 className="size-4" /> Delete subscription record
                                </Button>
                            )}

                            <Button type="button" onClick={() => setDetailsOpen(false)} className="w-full rounded-xl">
                                Close details
                            </Button>
                        </div>
                    </aside>
                </div>
            )}
        </AdminLayout>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-border bg-background/50 rounded-xl border p-3">
            <p className="text-muted-foreground text-[8px] font-semibold tracking-[0.1em] uppercase">{label}</p>
            <p className="text-foreground mt-1 truncate text-[11px] font-semibold capitalize">{value}</p>
        </div>
    );
}
