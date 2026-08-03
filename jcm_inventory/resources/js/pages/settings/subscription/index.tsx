import { SubscriptionWorkspaceNav } from '@/components/subscription/subscription-workspace-nav';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { BillingInterval, PaymentMethod, PlanPrice, SubscriptionOrder, SubscriptionPlan, SubscriptionSummary } from '@/types/subscription';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Check,
    CheckCircle2,
    Clock3,
    CreditCard,
    Crown,
    FileUp,
    Landmark,
    LockKeyhole,
    PackageCheck,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    UploadCloud,
    Users,
    Warehouse,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';

type SubscriptionPageProps = {
    current: SubscriptionSummary | null;
    plans: SubscriptionPlan[];
    pendingOrder: SubscriptionOrder | null;
    paymentMethods: PaymentMethod[];
};

type PaymentForm = {
    order_id: number | '';
    payment_method_id: number | '';
    reference_number: string;
    account_name: string;
    account_number: string;
    payment_proof: File | null;
};

type SubscriptionPlanFeature = SubscriptionPlan['features'][number];

type PlanFeatureGroup = {
    key: string;
    title: string;
    features: SubscriptionPlanFeature[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subscription & Billing',
        href: '/settings/subscription',
    },
];

const intervals: Array<{
    value: BillingInterval;
    label: string;
}> = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
];

const featureGroups: Array<{
    key: string;
    title: string;
    codes: readonly string[];
}> = [
    {
        key: 'inventory',
        title: 'Inventory essentials',
        codes: ['dashboard', 'inventory_overview', 'categories', 'products', 'stock_management', 'stock_adjustment'],
    },
    {
        key: 'stock',
        title: 'Stock operations',
        codes: ['stock_issuance_terminal', 'stock_issuance_history', 'stock_movements', 'stock_transfer'],
    },
    {
        key: 'procurement',
        title: 'Procurement',
        codes: ['supplier_management', 'purchase_orders', 'purchase_approvals', 'receiving', 'received_order_history'],
    },
    {
        key: 'locations-team',
        title: 'Locations and team',
        codes: ['branch_management', 'warehouse_management', 'team_overview', 'staff_management', 'roles_access'],
    },
    {
        key: 'settings',
        title: 'Business settings',
        codes: ['business_profile_general', 'business_profile_branding'],
    },
];

function formatMoney(value: number, currency = 'PHP'): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value: string | null | undefined): string {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function humanize(value: string | null | undefined): string {
    if (!value) {
        return 'Not available';
    }

    return value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function activeSubscriptionPeriodEnd(current: SubscriptionSummary | null): string | null {
    return current?.current_period_end ?? current?.end_date ?? null;
}

function hasActiveUnexpiredSubscription(current: SubscriptionSummary | null): boolean {
    if (!current) {
        return false;
    }

    const status = current.subscription_status;

    const isLive = current.access_mode === 'full' && (status === 'active' || status === 'trial');

    if (!isLive) {
        return false;
    }

    const periodEnd = activeSubscriptionPeriodEnd(current);

    /*
     * An active subscription without a readable period end is
     * treated as active for safety. The backend applies the same rule.
     */
    if (!periodEnd) {
        return true;
    }

    const periodEndTime = new Date(periodEnd).getTime();

    if (Number.isNaN(periodEndTime)) {
        return true;
    }

    return periodEndTime > Date.now();
}

function activePlanButtonLabel(current: SubscriptionSummary | null): string {
    const periodEnd = activeSubscriptionPeriodEnd(current);

    if (!periodEnd) {
        return 'Current plan active';
    }

    return `Active until ${formatDate(periodEnd)}`;
}

function priceFor(plan: SubscriptionPlan, interval: BillingInterval): PlanPrice | undefined {
    return plan.prices.find((price) => price.billing_interval === interval) ?? plan.prices.find((price) => price.is_default) ?? plan.prices[0];
}

function limitText(plan: SubscriptionPlan, code: string, fallback = '—'): string {
    const limit = plan.limits[code];

    if (!limit) {
        return fallback;
    }

    if (limit.is_unlimited) {
        return 'Unlimited';
    }

    return String(limit.value ?? 0);
}

function groupedFeatures(plan: SubscriptionPlan): PlanFeatureGroup[] {
    const assigned = new Set<string>();

    const groups = featureGroups
        .map((definition): PlanFeatureGroup => {
            const features = plan.features.filter((feature) => definition.codes.includes(feature.code));

            features.forEach((feature) => assigned.add(feature.code));

            return {
                key: definition.key,
                title: definition.title,
                features,
            };
        })
        .filter((group) => group.features.length > 0);

    const additional = plan.features.filter((feature) => !assigned.has(feature.code));

    if (additional.length > 0) {
        groups.push({
            key: 'additional',
            title: 'Additional tools',
            features: additional,
        });
    }

    return groups;
}

function fileLabel(file: File | null): string {
    if (!file) {
        return 'PNG, JPG, or WEBP up to 5 MB';
    }

    const size = file.size / 1024 / 1024;

    return `${file.name} · ${size.toFixed(size >= 1 ? 1 : 2)} MB`;
}

export default function SubscriptionIndex({ current, plans, pendingOrder, paymentMethods }: SubscriptionPageProps) {
    const [interval, setInterval] = useState<BillingInterval>(
        current?.billing_interval && ['monthly', 'quarterly', 'yearly'].includes(current.billing_interval) ? current.billing_interval : 'monthly',
    );

    const [paymentOpen, setPaymentOpen] = useState(pendingOrder?.status === 'pending');

    const [checkoutProcessingId, setCheckoutProcessingId] = useState<number | null>(null);

    const [cancelCheckoutOpen, setCancelCheckoutOpen] = useState(false);

    const [cancelCheckoutProcessing, setCancelCheckoutProcessing] = useState(false);

    const paymentForm = useForm<PaymentForm>({
        order_id: pendingOrder?.id ?? '',
        payment_method_id: '',
        reference_number: '',
        account_name: '',
        account_number: '',
        payment_proof: null,
    });

    const { setData: setPaymentData } = paymentForm;

    const pendingOrderId = pendingOrder?.id ?? '';

    const pendingOrderStatus = pendingOrder?.status;

    useEffect(() => {
        setPaymentData('order_id', pendingOrderId);

        if (pendingOrderId === '') {
            setPaymentOpen(false);
            return;
        }

        if (pendingOrderStatus === 'pending') {
            setPaymentOpen(true);
            return;
        }

        setPaymentOpen(false);
    }, [pendingOrderId, pendingOrderStatus, setPaymentData]);

    const selectedPlan = useMemo(
        () => (pendingOrder ? (plans.find((plan) => plan.id === pendingOrder.plan_id) ?? null) : null),
        [pendingOrder, plans],
    );

    const selectedPrice = useMemo(
        () =>
            selectedPlan && pendingOrder
                ? (selectedPlan.prices.find((price) => price.id === pendingOrder.plan_price_id) ?? priceFor(selectedPlan, pendingOrder.billing_type))
                : undefined,
        [pendingOrder, selectedPlan],
    );

    const selectedMethod = useMemo(
        () => paymentMethods.find((method) => method.id === paymentForm.data.payment_method_id) ?? null,
        [paymentMethods, paymentForm.data.payment_method_id],
    );

    const isOwner = current?.is_owner ?? true;

    const currentPlanRenewalLocked = hasActiveUnexpiredSubscription(current);

    const currentPlanActiveLabel = activePlanButtonLabel(current);

    const startCheckout = (planPriceId: number): void => {
        if (!isOwner) {
            return;
        }

        setCheckoutProcessingId(planPriceId);

        router.post(
            route('subscription.checkout.store', undefined, false),
            {
                plan_price_id: planPriceId,
            },
            {
                preserveScroll: true,
                onSuccess: () => setPaymentOpen(true),
                onFinish: () => setCheckoutProcessingId(null),
            },
        );
    };

    const submitPayment = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        paymentForm.post(route('subscription.payment.store', undefined, false), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const cancelPendingCheckout = (): void => {
        if (!pendingOrder || pendingOrder.status !== 'pending') {
            return;
        }

        setCancelCheckoutProcessing(true);

        router.patch(
            route(
                'subscription.checkout.cancel',
                {
                    order: pendingOrder.id,
                },
                false,
            ),
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    setCancelCheckoutOpen(false);

                    setPaymentOpen(false);

                    paymentForm.clearErrors();
                },

                onFinish: () => setCancelCheckoutProcessing(false),
            },
        );
    };

    const cancelAtPeriodEnd = (): void => {
        router.patch(
            route('subscription.cancel-at-period-end', undefined, false),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const resumeSubscription = (): void => {
        router.patch(
            route('subscription.resume', undefined, false),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription & Billing" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-5">
                <SubscriptionWorkspaceNav active="overview" isOwner={isOwner} />

                <OverviewHeader current={current} />

                {current?.cancel_at_period_end && (
                    <StatusNotice
                        tone="amber"
                        icon={<Clock3 className="size-4" />}
                        title="Cancellation is scheduled"
                        description="The current plan remains available until the billing period ends."
                        action={
                            isOwner
                                ? {
                                      label: 'Continue subscription',
                                      onClick: resumeSubscription,
                                  }
                                : undefined
                        }
                    />
                )}

                {pendingOrder?.status === 'pending' && (
                    <StatusNotice
                        tone="blue"
                        icon={<CreditCard className="size-4" />}
                        title={`Order ${pendingOrder.order_code} is awaiting payment`}
                        description={`${selectedPlan?.name ?? 'Your selected plan'} · ${humanize(pendingOrder.billing_type)} · ${formatMoney(
                            pendingOrder.amount,
                            pendingOrder.currency,
                        )}`}
                        action={{
                            label: 'Review & pay',
                            onClick: () => setPaymentOpen(true),
                        }}
                        secondaryAction={{
                            label: 'Cancel checkout',
                            onClick: () => setCancelCheckoutOpen(true),
                            disabled: cancelCheckoutProcessing,
                        }}
                    />
                )}

                {pendingOrder?.status === 'payment_submitted' && (
                    <StatusNotice
                        tone="emerald"
                        icon={<CheckCircle2 className="size-4" />}
                        title="Payment is under verification"
                        description={`Order ${pendingOrder.order_code} was submitted. JCM will activate the plan after approval.`}
                    />
                )}

                <PlansSection
                    plans={plans}
                    interval={interval}
                    current={current}
                    pendingOrder={pendingOrder}
                    isOwner={isOwner}
                    currentPlanRenewalLocked={currentPlanRenewalLocked}
                    currentPlanActiveLabel={currentPlanActiveLabel}
                    checkoutProcessingId={checkoutProcessingId}
                    onInterval={setInterval}
                    onChoose={startCheckout}
                    onOpenPayment={() => setPaymentOpen(true)}
                />

                {current?.subscription_id && isOwner && !current.cancel_at_period_end && (
                    <section className="border-border/70 bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
                        <div className="flex items-start gap-3">
                            <span className="border-border/70 bg-muted/20 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl border">
                                <ShieldCheck className="size-4" />
                            </span>

                            <div>
                                <h2 className="text-sm font-semibold">Subscription management</h2>

                                <p className="text-muted-foreground mt-1 max-w-2xl text-[10px] leading-4">
                                    Cancellation takes effect after the current billing period.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={cancelAtPeriodEnd}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-4 text-[10px] font-semibold text-rose-300 transition hover:bg-rose-500/[0.11]"
                        >
                            Cancel at period end
                        </button>
                    </section>
                )}
            </div>

            <PaymentModal
                open={paymentOpen && pendingOrder?.status === 'pending'}
                order={pendingOrder}
                plan={selectedPlan}
                price={selectedPrice}
                selectedMethod={selectedMethod}
                paymentMethods={paymentMethods}
                paymentForm={paymentForm}
                onClose={() => setPaymentOpen(false)}
                onCancelCheckout={() => setCancelCheckoutOpen(true)}
                cancelCheckoutProcessing={cancelCheckoutProcessing}
                onSubmit={submitPayment}
            />

            <CancelCheckoutDialog
                open={cancelCheckoutOpen && pendingOrder?.status === 'pending'}
                order={pendingOrder}
                processing={cancelCheckoutProcessing}
                onClose={() => setCancelCheckoutOpen(false)}
                onConfirm={cancelPendingCheckout}
            />
        </AppLayout>
    );
}

function OverviewHeader({ current }: { current: SubscriptionSummary | null }) {
    const fullAccess = current?.access_mode === 'full';

    const readOnly = current?.access_mode === 'read_only';

    const tone = fullAccess
        ? 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300'
        : readOnly
          ? 'border-amber-500/20 bg-amber-500/[0.08] text-amber-300'
          : 'border-rose-500/20 bg-rose-500/[0.08] text-rose-300';

    return (
        <section className="border-border/70 bg-card overflow-hidden rounded-2xl border">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="relative p-5 md:p-6">
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_68%)] lg:block" />

                    <div className="relative">
                        <div className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] uppercase">
                            <CreditCard className="size-4" />
                            JCM Inventory Billing
                        </div>

                        <h1 className="mt-2 text-2xl font-bold tracking-tight">Plans & Subscription</h1>

                        <p className="text-muted-foreground mt-2 max-w-2xl text-xs leading-5">
                            Compare available plans, renew the current subscription, and complete payment without leaving this page.
                        </p>
                    </div>
                </div>

                <div className="border-border/60 bg-muted/[0.08] border-t p-5 lg:border-t-0 lg:border-l">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.12em] uppercase">Current subscription</p>

                            <p className="mt-1.5 truncate text-base font-bold">{current?.plan_name ?? 'No active plan'}</p>
                        </div>

                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.09em] uppercase ${tone}`}>
                            {humanize(current?.subscription_status)}
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <HeaderDetail label="Billing" value={humanize(current?.billing_interval)} />

                        <HeaderDetail label="Period end" value={formatDate(current?.current_period_end ?? current?.end_date)} />
                    </div>
                </div>
            </div>
        </section>
    );
}

function HeaderDetail({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-border/60 bg-background/25 min-w-0 rounded-xl border p-3">
            <p className="text-muted-foreground text-[8px] font-semibold tracking-[0.1em] uppercase">{label}</p>

            <p className="mt-1 truncate text-[10px] font-semibold">{value}</p>
        </div>
    );
}

function PlansSection({
    plans,
    interval,
    current,
    pendingOrder,
    isOwner,
    currentPlanRenewalLocked,
    currentPlanActiveLabel,
    checkoutProcessingId,
    onInterval,
    onChoose,
    onOpenPayment,
}: {
    plans: SubscriptionPlan[];
    interval: BillingInterval;
    current: SubscriptionSummary | null;
    pendingOrder: SubscriptionOrder | null;
    isOwner: boolean;
    currentPlanRenewalLocked: boolean;
    currentPlanActiveLabel: string;
    checkoutProcessingId: number | null;
    onInterval: (value: BillingInterval) => void;
    onChoose: (priceId: number) => void;
    onOpenPayment: () => void;
}) {
    return (
        <section className="border-border/70 bg-card overflow-hidden rounded-2xl border">
            <div className="border-border/60 flex flex-col gap-4 border-b p-4 md:flex-row md:items-end md:justify-between md:p-5">
                <div>
                    <div className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
                        <Sparkles className="size-3.5" />
                        Available plans
                    </div>

                    <h2 className="mt-1.5 text-xl font-bold tracking-tight">Choose the right plan</h2>

                    <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                        Plans remain visible while checkout and payment are handled in a modal.
                    </p>
                </div>

                <div className="border-border/70 bg-muted/20 inline-flex w-fit rounded-xl border p-1">
                    {intervals.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onInterval(item.value)}
                            className={`rounded-lg px-3.5 py-2 text-[10px] font-semibold transition ${
                                interval === item.value
                                    ? 'bg-background text-foreground ring-border/60 shadow-sm ring-1'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid items-start gap-4 p-4 md:p-5 lg:grid-cols-2">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        interval={interval}
                        isCurrent={current?.plan_id === plan.id}
                        pendingOrder={pendingOrder}
                        isOwner={isOwner}
                        renewalLocked={currentPlanRenewalLocked}
                        activePlanLabel={currentPlanActiveLabel}
                        checkoutProcessingId={checkoutProcessingId}
                        onChoose={onChoose}
                        onOpenPayment={onOpenPayment}
                    />
                ))}
            </div>

            {!isOwner && (
                <div className="border-border/60 bg-muted/[0.1] text-muted-foreground border-t px-5 py-3 text-center text-[10px]">
                    Only the account owner can purchase or renew a subscription.
                </div>
            )}
        </section>
    );
}

function PlanCard({
    plan,
    interval,
    isCurrent,
    pendingOrder,
    isOwner,
    renewalLocked,
    activePlanLabel,
    checkoutProcessingId,
    onChoose,
    onOpenPayment,
}: {
    plan: SubscriptionPlan;
    interval: BillingInterval;
    isCurrent: boolean;
    pendingOrder: SubscriptionOrder | null;
    isOwner: boolean;
    renewalLocked: boolean;
    activePlanLabel: string;
    checkoutProcessingId: number | null;
    onChoose: (priceId: number) => void;
    onOpenPayment: () => void;
}) {
    const price = priceFor(plan, interval);

    const premium = ['team', 'premium'].includes(plan.code);

    const groups = groupedFeatures(plan);

    const isPendingPlan = pendingOrder?.plan_id === plan.id;

    const paymentPending = pendingOrder?.status === 'pending';

    const verificationPending = pendingOrder?.status === 'payment_submitted';

    const blockedByOtherOrder = Boolean(pendingOrder && !isPendingPlan);

    /*
     * Do not allow a new renewal for the same plan while the current
     * subscription is active and unexpired. Existing pending checkout
     * remains reviewable/cancellable.
     */
    const activeCurrentPlanLocked = isCurrent && renewalLocked && !isPendingPlan;

    const processing = price !== undefined && checkoutProcessingId === price.id;

    const disabled = !price || !isOwner || processing || verificationPending || blockedByOtherOrder || activeCurrentPlanLocked;

    const handleAction = (): void => {
        if (paymentPending && isPendingPlan) {
            onOpenPayment();
            return;
        }

        if (price) {
            onChoose(price.id);
        }
    };

    const buttonLabel = processing
        ? 'Creating order...'
        : verificationPending && isPendingPlan
          ? 'Verification pending'
          : paymentPending && isPendingPlan
            ? 'Review & pay'
            : blockedByOtherOrder
              ? 'Finish current checkout first'
              : activeCurrentPlanLocked
                ? activePlanLabel
                : isCurrent
                  ? 'Renew this plan'
                  : `Choose ${plan.name}`;

    return (
        <article
            className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border ${
                isCurrent ? 'border-primary/35 bg-primary/[0.025]' : 'border-border/70 bg-background/25'
            }`}
        >
            <div className="border-border/60 border-b p-5">
                <div className="flex items-start gap-3">
                    <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                            premium
                                ? 'border-violet-500/20 bg-violet-500/[0.08] text-violet-300'
                                : 'border-border/70 bg-muted/30 text-muted-foreground'
                        }`}
                    >
                        {premium ? <Crown className="size-4" /> : <PackageCheck className="size-4" />}
                    </span>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold">{plan.name}</h3>

                            {isCurrent && (
                                <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2 py-0.5 text-[8px] font-bold tracking-[0.1em] uppercase">
                                    Current
                                </span>
                            )}

                            {premium && (
                                <span className="rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-2 py-0.5 text-[8px] font-bold tracking-[0.1em] text-violet-300 uppercase">
                                    Recommended
                                </span>
                            )}
                        </div>

                        <p className="text-muted-foreground mt-1.5 text-[11px] leading-5">{plan.description}</p>
                    </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-2xl font-bold tracking-tight">{price ? formatMoney(price.price, price.currency) : 'Unavailable'}</p>

                        {price && <p className="text-muted-foreground mt-0.5 text-[10px]">per {humanize(price.billing_interval)}</p>}
                    </div>

                    {price?.compare_at_price && (
                        <div className="text-right">
                            <p className="text-muted-foreground text-[8px] font-semibold tracking-[0.1em] uppercase">Regular</p>

                            <p className="text-muted-foreground mt-1 text-xs line-through">{formatMoney(price.compare_at_price, price.currency)}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="divide-border/60 border-border/60 grid grid-cols-3 divide-x border-b">
                <PlanLimit icon={<Building2 className="size-3.5" />} label="Branches" value={limitText(plan, 'max_branches')} />

                <PlanLimit icon={<Warehouse className="size-3.5" />} label="Warehouses" value={limitText(plan, 'max_warehouses')} />

                <PlanLimit icon={<Users className="size-3.5" />} label="Team" value={limitText(plan, 'max_team_members')} />
            </div>

            <div className="flex-1 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold">Included modules</p>

                        <p className="text-muted-foreground mt-0.5 text-[10px]">{plan.features.length} enabled capabilities</p>
                    </div>

                    <ShieldCheck className="size-4 text-emerald-400" />
                </div>

                <div className="mt-4 space-y-4">
                    {groups.map((group) => (
                        <div key={group.key}>
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-foreground/70 text-[9px] font-bold tracking-[0.12em] uppercase">{group.title}</p>

                                <span className="text-muted-foreground text-[9px]">{group.features.length}</span>
                            </div>

                            <div className="mt-2 grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
                                {group.features.map((feature) => (
                                    <div key={feature.code} className="flex min-w-0 items-center gap-2">
                                        <Check className="size-3.5 shrink-0 text-emerald-400" />

                                        <span className="text-foreground/80 truncate text-[10px] font-medium">{feature.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-border/60 border-t p-4">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleAction}
                    className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        paymentPending && isPendingPlan
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : activeCurrentPlanLocked
                              ? 'border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300'
                              : isCurrent
                                ? 'border-border/70 bg-muted/30 hover:bg-muted/50 border'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                >
                    {paymentPending && isPendingPlan ? (
                        <CreditCard className="size-3.5" />
                    ) : activeCurrentPlanLocked ? (
                        <LockKeyhole className="size-3.5" />
                    ) : isCurrent ? (
                        <RefreshCcw className="size-3.5" />
                    ) : (
                        <CreditCard className="size-3.5" />
                    )}

                    {buttonLabel}
                </button>
            </div>
        </article>
    );
}

function PlanLimit({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="min-w-0 p-3.5 text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1.5">
                {icon}

                <span className="truncate text-[8px] font-semibold tracking-[0.1em] uppercase">{label}</span>
            </div>

            <p className="mt-1.5 text-xs font-bold">{value}</p>
        </div>
    );
}

function StatusNotice({
    icon,
    title,
    description,
    tone,
    action,
    secondaryAction,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    tone: 'blue' | 'amber' | 'emerald';
    action?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
    };
}) {
    const classes = {
        blue: {
            section: 'border-blue-500/20 bg-blue-500/[0.055]',
            icon: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
            button: 'border-blue-500/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15',
        },
        amber: {
            section: 'border-amber-500/20 bg-amber-500/[0.055]',
            icon: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
            button: 'border-amber-500/25 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15',
        },
        emerald: {
            section: 'border-emerald-500/20 bg-emerald-500/[0.055]',
            icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
            button: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15',
        },
    }[tone];

    return (
        <section className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${classes.section}`}>
            <div className="flex items-start gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${classes.icon}`}>{icon}</span>

                <div>
                    <p className="text-xs font-semibold">{title}</p>

                    <p className="text-muted-foreground mt-1 text-[10px] leading-4">{description}</p>
                </div>
            </div>

            {(action || secondaryAction) && (
                <div className="flex flex-col gap-2 sm:flex-row">
                    {secondaryAction && (
                        <button
                            type="button"
                            disabled={secondaryAction.disabled}
                            onClick={secondaryAction.onClick}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/[0.07] px-4 text-[10px] font-semibold text-rose-300 transition hover:bg-rose-500/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {secondaryAction.label}
                        </button>
                    )}

                    {action && (
                        <button
                            type="button"
                            disabled={action.disabled}
                            onClick={action.onClick}
                            className={`inline-flex h-9 shrink-0 items-center justify-center rounded-lg border px-4 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${classes.button}`}
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}

function PaymentModal({
    open,
    order,
    plan,
    price,
    selectedMethod,
    paymentMethods,
    paymentForm,
    onClose,
    onCancelCheckout,
    cancelCheckoutProcessing,
    onSubmit,
}: {
    open: boolean;
    order: SubscriptionOrder | null;
    plan: SubscriptionPlan | null;
    price: PlanPrice | undefined;
    selectedMethod: PaymentMethod | null;
    paymentMethods: PaymentMethod[];
    paymentForm: ReturnType<typeof useForm<PaymentForm>>;
    onClose: () => void;
    onCancelCheckout: () => void;
    cancelCheckoutProcessing: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape' && !paymentForm.processing) {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;

            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose, paymentForm.processing]);

    if (!open || !order) {
        return null;
    }

    const canSubmit = paymentForm.data.payment_method_id !== '' && paymentForm.data.payment_proof !== null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm md:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-payment-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !paymentForm.processing) {
                    onClose();
                }
            }}
        >
            <div className="border-border/80 bg-card flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
                <div className="border-border/60 flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6">
                    <div>
                        <div className="text-primary flex items-center gap-2 text-[9px] font-semibold tracking-[0.14em] uppercase">
                            <CreditCard className="size-3.5" />
                            Secure manual checkout
                        </div>

                        <h2 id="subscription-payment-title" className="mt-1.5 text-xl font-bold tracking-tight">
                            Complete subscription payment
                        </h2>

                        <p className="text-muted-foreground mt-1 text-[10px] leading-4">
                            Review the order, select a payment channel, and upload proof.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={paymentForm.processing}
                        onClick={onClose}
                        aria-label="Close payment modal"
                        className="border-border/70 bg-background/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border transition disabled:opacity-50"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="min-h-0 flex-1 overflow-y-auto">
                    <div className="grid min-h-full lg:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="border-border/60 bg-muted/[0.08] border-b p-5 md:p-6 lg:border-r lg:border-b-0">
                            <div className="flex items-start gap-3">
                                <span className="border-primary/20 bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border">
                                    <Crown className="size-4" />
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold">{plan?.name ?? 'Subscription plan'}</p>

                                    <p className="text-muted-foreground mt-1 text-[10px]">
                                        {humanize(price?.billing_interval ?? order.billing_type)} billing
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <ModalSummaryRow label="Order" value={order.order_code} />

                                <ModalSummaryRow label="Order type" value={humanize(order.order_type)} />

                                <ModalSummaryRow label="Status" value={humanize(order.status)} />
                            </div>

                            <div className="border-primary/15 bg-primary/[0.045] mt-5 rounded-xl border p-4">
                                <p className="text-muted-foreground text-[8px] font-semibold tracking-[0.11em] uppercase">Amount due</p>

                                <p className="text-primary mt-1.5 text-2xl font-bold tracking-tight">{formatMoney(order.amount, order.currency)}</p>
                            </div>

                            <div className="border-border/60 mt-5 flex items-start gap-2.5 border-t pt-4">
                                <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />

                                <p className="text-muted-foreground text-[10px] leading-4">
                                    Activation occurs only after administrator verification.
                                </p>
                            </div>
                        </aside>

                        <div className="space-y-6 p-5 md:p-6">
                            <ModalSection number="01" title="Payment method" description="Choose the account where payment was sent.">
                                {paymentMethods.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {paymentMethods.map((method) => {
                                            const selected = paymentForm.data.payment_method_id === method.id;

                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => paymentForm.setData('payment_method_id', method.id)}
                                                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                                                        selected
                                                            ? 'border-primary/40 bg-primary/[0.055] ring-primary/10 ring-1'
                                                            : 'border-border/70 bg-background/25 hover:bg-muted/[0.12]'
                                                    }`}
                                                >
                                                    <span
                                                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                                                            selected
                                                                ? 'border-primary/25 bg-primary/10 text-primary'
                                                                : 'border-border/70 bg-muted/25 text-muted-foreground'
                                                        }`}
                                                    >
                                                        <Landmark className="size-4" />
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="truncate text-xs font-semibold">{method.name}</p>

                                                            <span
                                                                className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                                                                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                                                                }`}
                                                            >
                                                                {selected && <Check className="size-2.5" />}
                                                            </span>
                                                        </div>

                                                        <p className="text-muted-foreground mt-1 truncate text-[10px]">
                                                            {method.account_name || 'Payment account'}
                                                        </p>

                                                        <p className="text-foreground/75 mt-0.5 truncate font-mono text-[10px]">
                                                            {method.account_number || 'No account number'}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-300" />

                                        <div>
                                            <p className="text-xs font-semibold text-amber-200">No payment method available</p>

                                            <p className="mt-1 text-[10px] leading-4 text-amber-100/60">Contact JCM support before continuing.</p>
                                        </div>
                                    </div>
                                )}

                                <FormError message={paymentForm.errors.payment_method_id} />

                                {selectedMethod && (
                                    <div className="border-primary/15 bg-primary/[0.035] mt-3 rounded-xl border p-4">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />

                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold">Send to {selectedMethod.name}</p>

                                                <div className="mt-2 grid gap-3 text-[10px] sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-muted-foreground">Account name</p>

                                                        <p className="mt-0.5 font-semibold">{selectedMethod.account_name || 'Not provided'}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">Account number</p>

                                                        <p className="mt-0.5 font-mono font-semibold">
                                                            {selectedMethod.account_number || 'Not provided'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {selectedMethod.instructions && (
                                                    <p className="border-primary/10 text-muted-foreground mt-3 border-t pt-3 text-[10px] leading-4">
                                                        {selectedMethod.instructions}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalSection>

                            <ModalSection number="02" title="Sender information" description="Enter the transaction details shown on the receipt.">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Reference number"
                                        value={paymentForm.data.reference_number}
                                        placeholder="Transaction reference"
                                        error={paymentForm.errors.reference_number}
                                        onChange={(value) => paymentForm.setData('reference_number', value)}
                                    />

                                    <Field
                                        label="Sender account name"
                                        value={paymentForm.data.account_name}
                                        placeholder="Name used for payment"
                                        error={paymentForm.errors.account_name}
                                        onChange={(value) => paymentForm.setData('account_name', value)}
                                    />

                                    <Field
                                        label="Sender account number"
                                        value={paymentForm.data.account_number}
                                        placeholder="Mobile or account number"
                                        error={paymentForm.errors.account_number}
                                        className="sm:col-span-2"
                                        onChange={(value) => paymentForm.setData('account_number', value)}
                                    />
                                </div>
                            </ModalSection>

                            <ModalSection
                                number="03"
                                title="Payment proof"
                                description="Upload a clear screenshot or photo of the completed transaction."
                            >
                                <label className="group border-border bg-background/20 hover:border-primary/35 hover:bg-primary/[0.025] flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-7 text-center transition">
                                    <span className="border-primary/15 bg-primary/[0.06] text-primary flex size-11 items-center justify-center rounded-xl border">
                                        <UploadCloud className="size-5" />
                                    </span>

                                    <p className="mt-3 text-xs font-semibold">
                                        {paymentForm.data.payment_proof ? 'Payment proof selected' : 'Choose payment proof'}
                                    </p>

                                    <p className="text-muted-foreground mt-1 max-w-sm text-[10px] leading-4">
                                        {fileLabel(paymentForm.data.payment_proof)}
                                    </p>

                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(event) => paymentForm.setData('payment_proof', event.target.files?.[0] ?? null)}
                                        className="sr-only"
                                        required
                                    />
                                </label>

                                <FormError message={paymentForm.errors.payment_proof} />
                            </ModalSection>

                            {paymentForm.hasErrors && (
                                <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] p-4 text-rose-300">
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />

                                    <div>
                                        <p className="text-xs font-semibold">Payment details need attention</p>

                                        <p className="mt-1 text-[10px] leading-4 text-rose-200/70">Review the marked fields before submitting.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-border/60 bg-card flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                        <div>
                            <p className="text-muted-foreground text-[8px] font-semibold tracking-[0.11em] uppercase">Total payment</p>

                            <p className="text-primary mt-1 text-xl font-bold">{formatMoney(order.amount, order.currency)}</p>
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <button
                                type="button"
                                disabled={paymentForm.processing || cancelCheckoutProcessing}
                                onClick={onCancelCheckout}
                                className="inline-flex h-10 min-w-36 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/[0.06] px-4 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/[0.11] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel checkout
                            </button>

                            <button
                                type="button"
                                disabled={paymentForm.processing || cancelCheckoutProcessing}
                                onClick={onClose}
                                className="border-border/70 bg-background/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground inline-flex h-10 min-w-28 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition disabled:opacity-50"
                            >
                                Close
                            </button>

                            <button
                                type="submit"
                                disabled={paymentForm.processing || cancelCheckoutProcessing || !canSubmit}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 min-w-52 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                <FileUp className="size-4" />

                                {paymentForm.processing ? 'Submitting payment...' : 'Submit for verification'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CancelCheckoutDialog({
    open,
    order,
    processing,
    onClose,
    onConfirm,
}: {
    open: boolean;
    order: SubscriptionOrder | null;
    processing: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape' && !processing) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose, processing]);

    if (!open || !order) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-checkout-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !processing) {
                    onClose();
                }
            }}
        >
            <div className="border-border/80 bg-card w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
                <div className="p-5 md:p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/[0.08] text-rose-300">
                            <X className="size-4" />
                        </span>

                        <div>
                            <h2 id="cancel-checkout-title" className="text-base font-bold">
                                Cancel this checkout?
                            </h2>

                            <p className="text-muted-foreground mt-1.5 text-[11px] leading-5">
                                Order <span className="text-foreground font-semibold">{order.order_code}</span> will be marked as cancelled. You can
                                select another plan immediately afterward.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.055] p-3.5">
                        <p className="text-[10px] leading-4 text-amber-100/70">
                            This option is available only before payment proof is submitted. Your current active subscription will not be changed.
                        </p>
                    </div>
                </div>

                <div className="border-border/60 bg-muted/[0.08] flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onClose}
                        className="border-border/70 bg-background/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground inline-flex h-10 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition disabled:opacity-50"
                    >
                        Keep checkout
                    </button>

                    <button
                        type="button"
                        disabled={processing}
                        onClick={onConfirm}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Cancelling...' : 'Yes, cancel order'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalSummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-border/50 flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
            <span className="text-muted-foreground text-[10px]">{label}</span>

            <span className="max-w-[170px] truncate text-right text-[10px] font-semibold">{value}</span>
        </div>
    );
}

function ModalSection({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
    return (
        <section>
            <div className="flex items-start gap-3">
                <span className="border-primary/20 bg-primary/[0.07] text-primary flex size-7 shrink-0 items-center justify-center rounded-lg border text-[9px] font-bold">
                    {number}
                </span>

                <div>
                    <h3 className="text-sm font-semibold">{title}</h3>

                    <p className="text-muted-foreground mt-0.5 text-[10px] leading-4">{description}</p>
                </div>
            </div>

            <div className="mt-4">{children}</div>
        </section>
    );
}

function Field({
    label,
    value,
    placeholder,
    error,
    className = '',
    onChange,
}: {
    label: string;
    value: string;
    placeholder: string;
    error?: string;
    className?: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className={`block ${className}`}>
            <span className="text-[10px] font-semibold">{label}</span>

            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`bg-background/35 placeholder:text-muted-foreground/55 focus:ring-ring mt-2 h-10 w-full rounded-xl border px-3 text-xs transition outline-none focus:ring-2 ${
                    error ? 'border-rose-500/40' : 'border-input'
                }`}
            />

            <FormError message={error} />
        </label>
    );
}

function FormError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-[10px] text-rose-400">{message}</p>;
}
