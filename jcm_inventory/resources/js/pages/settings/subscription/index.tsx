import AppLayout from '@/layouts/app-layout';
import type {
    BillingInterval,
    PaymentMethod,
    PlanPrice,
    SubscriptionOrder,
    SubscriptionPlan,
    SubscriptionSummary,
} from '@/types/subscription';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    CreditCard,
    Crown,
    FileCheck2,
    FileUp,
    Landmark,
    LockKeyhole,
    PackageCheck,
    ReceiptText,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    UploadCloud,
    Users,
    Warehouse,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

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

type CheckoutStage = 'plans' | 'review' | 'payment' | 'verification';
type SubscriptionPlanFeature = SubscriptionPlan['features'][number];

type PlanFeatureGroup = {
    key: string;
    title: string;
    features: SubscriptionPlanFeature[];
};

declare function route(
    name: string,
    params?: Record<string, unknown>,
): string;

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

const wizardSteps: Array<{
    key: CheckoutStage;
    number: number;
    label: string;
}> = [
    { key: 'plans', number: 1, label: 'Plan' },
    { key: 'review', number: 2, label: 'Review' },
    { key: 'payment', number: 3, label: 'Payment' },
    { key: 'verification', number: 4, label: 'Verification' },
];

const featureGroups: Array<{
    key: string;
    title: string;
    codes: readonly string[];
}> = [
    {
        key: 'inventory',
        title: 'Inventory essentials',
        codes: [
            'dashboard',
            'inventory_overview',
            'categories',
            'products',
            'stock_management',
            'stock_adjustment',
        ],
    },
    {
        key: 'stock',
        title: 'Stock operations',
        codes: [
            'stock_issuance_terminal',
            'stock_issuance_history',
            'stock_movements',
            'stock_transfer',
        ],
    },
    {
        key: 'procurement',
        title: 'Procurement',
        codes: [
            'supplier_management',
            'purchase_orders',
            'purchase_approvals',
            'receiving',
            'received_order_history',
        ],
    },
    {
        key: 'team',
        title: 'Locations and team',
        codes: [
            'branch_management',
            'warehouse_management',
            'team_overview',
            'staff_management',
            'roles_access',
        ],
    },
    {
        key: 'settings',
        title: 'Business settings',
        codes: [
            'business_profile_general',
            'business_profile_branding',
        ],
    },
];

function formatMoney(value: number, currency = 'PHP'): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

function humanize(value: string | null | undefined): string {
    if (!value) return 'Not subscribed';

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function priceFor(
    plan: SubscriptionPlan,
    interval: BillingInterval,
): PlanPrice | undefined {
    return (
        plan.prices.find(
            (price) => price.billing_interval === interval,
        ) ??
        plan.prices.find((price) => price.is_default) ??
        plan.prices[0]
    );
}

function limitText(
    plan: SubscriptionPlan,
    code: string,
    fallback = '—',
): string {
    const limit = plan.limits[code];

    if (!limit) return fallback;
    if (limit.is_unlimited) return 'Unlimited';

    return String(limit.value ?? 0);
}

function groupedFeatures(plan: SubscriptionPlan): PlanFeatureGroup[] {
    const assigned = new Set<string>();

    const groups = featureGroups
        .map((definition): PlanFeatureGroup => {
            const features = plan.features.filter((feature) =>
                definition.codes.includes(feature.code),
            );

            features.forEach((feature) => assigned.add(feature.code));

            return {
                key: definition.key,
                title: definition.title,
                features,
            };
        })
        .filter((group) => group.features.length > 0);

    const other = plan.features.filter(
        (feature) => !assigned.has(feature.code),
    );

    if (other.length > 0) {
        groups.push({
            key: 'other',
            title: 'Additional tools',
            features: other,
        });
    }

    return groups;
}

function stageNumber(stage: CheckoutStage): number {
    return wizardSteps.find((step) => step.key === stage)?.number ?? 1;
}

function fileLabel(file: File | null): string {
    if (!file) return 'PNG, JPG, or WEBP up to 5 MB';

    const size = file.size / 1024 / 1024;
    return `${file.name} · ${size.toFixed(size >= 1 ? 1 : 2)} MB`;
}

export default function SubscriptionIndex({
    current,
    plans,
    pendingOrder,
    paymentMethods,
}: SubscriptionPageProps) {
    const [interval, setInterval] = useState<BillingInterval>(
        current?.billing_interval &&
            ['monthly', 'quarterly', 'yearly'].includes(
                current.billing_interval,
            )
            ? current.billing_interval
            : 'monthly',
    );

    const [stage, setStage] = useState<CheckoutStage>(
        pendingOrder?.status === 'payment_submitted'
            ? 'verification'
            : pendingOrder
              ? 'review'
              : 'plans',
    );

    const paymentForm = useForm<PaymentForm>({
        order_id: pendingOrder?.id ?? '',
        payment_method_id: '',
        reference_number: '',
        account_name: '',
        account_number: '',
        payment_proof: null,
    });

    useEffect(() => {
        if (!pendingOrder) {
            setStage('plans');
            return;
        }

        paymentForm.setData('order_id', pendingOrder.id);

        if (pendingOrder.status === 'payment_submitted') {
            setStage('verification');
            return;
        }

        setStage((value) => (value === 'payment' ? 'payment' : 'review'));
    }, [pendingOrder?.id, pendingOrder?.status]);

    const selectedPlan = useMemo(
        () =>
            pendingOrder
                ? plans.find((plan) => plan.id === pendingOrder.plan_id) ?? null
                : null,
        [pendingOrder, plans],
    );

    const selectedPrice = useMemo(
        () =>
            selectedPlan && pendingOrder
                ? selectedPlan.prices.find(
                      (price) => price.id === pendingOrder.plan_price_id,
                  ) ?? priceFor(selectedPlan, pendingOrder.billing_type)
                : undefined,
        [pendingOrder, selectedPlan],
    );

    const selectedMethod = useMemo(
        () =>
            paymentMethods.find(
                (method) =>
                    method.id === paymentForm.data.payment_method_id,
            ) ?? null,
        [paymentMethods, paymentForm.data.payment_method_id],
    );

    const isOwner = current?.is_owner ?? true;
    const accessMode = current?.access_mode ?? 'blocked';

    const startCheckout = (planPriceId: number) => {
        router.post(
            route('subscription.checkout.store'),
            { plan_price_id: planPriceId },
            { preserveScroll: true },
        );
    };

    const submitPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        paymentForm.post(route('subscription.payment.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const cancelAtPeriodEnd = () => {
        router.patch(
            route('subscription.cancel-at-period-end'),
            {},
            { preserveScroll: true },
        );
    };

    const resumeSubscription = () => {
        router.patch(
            route('subscription.resume'),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription & Billing" />

            <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-5 p-4 md:p-5 lg:p-6">
                <Header current={current} accessMode={accessMode} />
                <CurrentStrip current={current} />

                {current?.cancel_at_period_end && (
                    <Notice
                        title="Cancellation is scheduled"
                        detail="Access remains available until the current billing period ends."
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

                <Stepper stage={stage} />

                {stage === 'plans' ? (
                    <PlanSelection
                        plans={plans}
                        interval={interval}
                        current={current}
                        isOwner={isOwner}
                        onInterval={setInterval}
                        onChoose={startCheckout}
                    />
                ) : (
                    <CheckoutWorkspace
                        stage={stage}
                        pendingOrder={pendingOrder}
                        selectedPlan={selectedPlan}
                        selectedPrice={selectedPrice}
                        selectedMethod={selectedMethod}
                        paymentMethods={paymentMethods}
                        paymentForm={paymentForm}
                        onReview={() => setStage('review')}
                        onPayment={() => setStage('payment')}
                        onSubmit={submitPayment}
                    />
                )}

                {current?.subscription_id &&
                    isOwner &&
                    !current.cancel_at_period_end && (
                        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/20 text-muted-foreground">
                                    <ShieldCheck className="size-4" />
                                </span>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Subscription management
                                    </h2>
                                    <p className="mt-1 max-w-2xl text-[10px] leading-4 text-muted-foreground">
                                        Scheduling cancellation keeps access
                                        available until the period ends.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={cancelAtPeriodEnd}
                                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/[0.065] px-4 text-[10px] font-semibold text-rose-300 transition hover:bg-rose-500/[0.11]"
                            >
                                Cancel at period end
                            </button>
                        </section>
                    )}
            </div>
        </AppLayout>
    );
}

function Header({
    current,
    accessMode,
}: {
    current: SubscriptionSummary | null;
    accessMode: string;
}) {
    const tone =
        accessMode === 'full'
            ? 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300'
            : accessMode === 'read_only'
              ? 'border-amber-500/20 bg-amber-500/[0.08] text-amber-300'
              : 'border-rose-500/20 bg-rose-500/[0.08] text-rose-300';

    return (
        <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_70%_25%,rgba(99,102,241,0.12),transparent_65%)] lg:block" />

            <div className="relative flex flex-col gap-5 p-5 md:p-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                        <CreditCard className="size-4" />
                        JCM Inventory Billing
                    </div>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-[28px]">
                        Subscription & Billing
                    </h1>

                    <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground md:text-sm">
                        Choose a plan, review the order, submit payment, and
                        track verification inside one guided workspace.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${tone}`}
                    >
                        {humanize(current?.subscription_status)}
                    </span>

                    <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">
                        {current?.role_name ?? 'Account owner'}
                    </span>
                </div>
            </div>
        </section>
    );
}

function CurrentStrip({
    current,
}: {
    current: SubscriptionSummary | null;
}) {
    const shared = ['team', 'premium'].includes(current?.plan_code ?? '')
        ? 'Owner + Team'
        : 'Owner only';

    return (
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                <Metric
                    icon={<Crown className="size-4" />}
                    label="Current plan"
                    value={current?.plan_name ?? 'No active plan'}
                    detail={
                        current?.billing_interval
                            ? humanize(current.billing_interval)
                            : 'Billing cycle not selected'
                    }
                />
                <Metric
                    icon={<ShieldCheck className="size-4" />}
                    label="Access mode"
                    value={humanize(current?.access_mode)}
                    detail={
                        current?.can_write
                            ? 'Create and update access enabled'
                            : 'Renewal may be required'
                    }
                />
                <Metric
                    icon={<CalendarDays className="size-4" />}
                    label="Period end"
                    value={current?.end_date ?? 'Not available'}
                    detail="Owner subscription end date"
                />
                <Metric
                    icon={<Users className="size-4" />}
                    label="Shared access"
                    value={shared}
                    detail="Team follows the owner status"
                />
            </div>
        </section>
    );
}

function Metric({
    icon,
    label,
    value,
    detail,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="min-w-0 p-4 md:p-5">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                <span className="text-primary">{icon}</span>
                {label}
            </div>
            <p className="mt-2 truncate text-sm font-bold">{value}</p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
                {detail}
            </p>
        </div>
    );
}

function Stepper({ stage }: { stage: CheckoutStage }) {
    const active = stageNumber(stage);

    return (
        <section className="rounded-2xl border border-border/70 bg-card px-4 py-4 md:px-5">
            <div className="grid gap-3 md:grid-cols-4">
                {wizardSteps.map((step, index) => {
                    const done = step.number < active;
                    const current = step.number === active;

                    return (
                        <div
                            key={step.key}
                            className="flex min-w-0 items-center gap-3"
                        >
                            <span
                                className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                    done
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                        : current
                                          ? 'border-primary/40 bg-primary/10 text-primary'
                                          : 'border-border bg-background/50 text-muted-foreground'
                                }`}
                            >
                                {done ? <Check className="size-4" /> : step.number}
                            </span>

                            <div className="min-w-0">
                                <p
                                    className={`truncate text-[11px] font-semibold ${
                                        done || current
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {step.label}
                                </p>
                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    Step {step.number} of 4
                                </p>
                            </div>

                            {index < wizardSteps.length - 1 && (
                                <ChevronRight className="ml-auto hidden size-4 text-border md:block" />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function PlanSelection({
    plans,
    interval,
    current,
    isOwner,
    onInterval,
    onChoose,
}: {
    plans: SubscriptionPlan[];
    interval: BillingInterval;
    current: SubscriptionSummary | null;
    isOwner: boolean;
    onInterval: (value: BillingInterval) => void;
    onChoose: (priceId: number) => void;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="flex flex-col gap-4 border-b border-border/60 p-5 md:flex-row md:items-end md:justify-between md:p-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                        <Sparkles className="size-3.5" />
                        Step 1 · Choose a plan
                    </div>
                    <h2 className="mt-2 text-xl font-bold tracking-tight">
                        Select the right operating plan
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                        Compare limits and modules. Your selection opens a
                        separate review workspace inside this same page.
                    </p>
                </div>

                <div className="inline-flex w-fit rounded-xl border border-border/70 bg-muted/20 p-1">
                    {intervals.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onInterval(item.value)}
                            className={`rounded-lg px-3.5 py-2 text-[10px] font-semibold transition ${
                                interval === item.value
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-2 md:p-6">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        interval={interval}
                        isCurrent={current?.plan_id === plan.id}
                        isOwner={isOwner}
                        onChoose={onChoose}
                    />
                ))}
            </div>

            {!isOwner && (
                <div className="border-t border-border/60 bg-muted/[0.12] px-5 py-3 text-center text-[11px] text-muted-foreground">
                    Only the account owner can change the subscription.
                </div>
            )}
        </section>
    );
}

function PlanCard({
    plan,
    interval,
    isCurrent,
    isOwner,
    onChoose,
}: {
    plan: SubscriptionPlan;
    interval: BillingInterval;
    isCurrent: boolean;
    isOwner: boolean;
    onChoose: (priceId: number) => void;
}) {
    const price = priceFor(plan, interval);
    const premium = ['team', 'premium'].includes(plan.code);
    const groups = groupedFeatures(plan);

    return (
        <article
            className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border ${
                isCurrent
                    ? 'border-primary/35 bg-primary/[0.025]'
                    : 'border-border/70 bg-background/30'
            }`}
        >
            <div className="border-b border-border/60 p-5">
                <div className="flex items-start gap-3">
                    <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                            premium
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : 'border-border/70 bg-muted/30 text-muted-foreground'
                        }`}
                    >
                        {premium ? (
                            <Crown className="size-4" />
                        ) : (
                            <PackageCheck className="size-4" />
                        )}
                    </span>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold">{plan.name}</h3>
                            {isCurrent && (
                                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-primary">
                                    Current
                                </span>
                            )}
                            {premium && (
                                <span className="rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-violet-300">
                                    Recommended
                                </span>
                            )}
                        </div>

                        <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                            {plan.description}
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-2xl font-bold tracking-tight">
                            {price
                                ? formatMoney(price.price, price.currency)
                                : 'Unavailable'}
                        </p>
                        {price && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                per {humanize(price.billing_interval)}
                            </p>
                        )}
                    </div>

                    {price?.compare_at_price && (
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                                Regular
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground line-through">
                                {formatMoney(
                                    price.compare_at_price,
                                    price.currency,
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border/60 border-b border-border/60">
                <Limit
                    icon={<Building2 className="size-3.5" />}
                    label="Branches"
                    value={limitText(plan, 'max_branches')}
                />
                <Limit
                    icon={<Warehouse className="size-3.5" />}
                    label="Warehouses"
                    value={limitText(plan, 'max_warehouses')}
                />
                <Limit
                    icon={<Users className="size-3.5" />}
                    label="Team"
                    value={limitText(plan, 'max_team_members')}
                />
            </div>

            <div className="flex-1 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold">Included modules</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {plan.features.length} enabled capabilities
                        </p>
                    </div>
                    <ShieldCheck className="size-4 text-emerald-400" />
                </div>

                <div className="mt-4 space-y-4">
                    {groups.map((group) => (
                        <div key={group.key}>
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/70">
                                    {group.title}
                                </p>
                                <span className="text-[9px] text-muted-foreground">
                                    {group.features.length}
                                </span>
                            </div>

                            <div className="mt-2 grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
                                {group.features.map((feature) => (
                                    <div
                                        key={feature.code}
                                        className="flex min-w-0 items-center gap-2"
                                    >
                                        <Check className="size-3.5 shrink-0 text-emerald-400" />
                                        <span className="truncate text-[10px] font-medium text-foreground/80">
                                            {feature.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-border/60 p-4">
                <button
                    type="button"
                    disabled={!price || !isOwner}
                    onClick={() => price && onChoose(price.id)}
                    className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        isCurrent
                            ? 'border border-border/70 bg-muted/30 hover:bg-muted/50'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                >
                    {isCurrent ? (
                        <>
                            <RefreshCcw className="size-3.5" />
                            Renew this plan
                        </>
                    ) : (
                        <>
                            <CreditCard className="size-3.5" />
                            Choose {plan.name}
                        </>
                    )}
                </button>
            </div>
        </article>
    );
}

function Limit({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0 p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                {icon}
                <span className="truncate text-[8px] font-semibold uppercase tracking-[0.1em]">
                    {label}
                </span>
            </div>
            <p className="mt-1.5 text-xs font-bold">{value}</p>
        </div>
    );
}

function CheckoutWorkspace({
    stage,
    pendingOrder,
    selectedPlan,
    selectedPrice,
    selectedMethod,
    paymentMethods,
    paymentForm,
    onReview,
    onPayment,
    onSubmit,
}: {
    stage: CheckoutStage;
    pendingOrder: SubscriptionOrder | null;
    selectedPlan: SubscriptionPlan | null;
    selectedPrice: PlanPrice | undefined;
    selectedMethod: PaymentMethod | null;
    paymentMethods: PaymentMethod[];
    paymentForm: ReturnType<typeof useForm<PaymentForm>>;
    onReview: () => void;
    onPayment: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    if (!pendingOrder) return null;

    return (
        <section className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <OrderSummary
                order={pendingOrder}
                plan={selectedPlan}
                price={selectedPrice}
                stage={stage}
            />

            <div className="min-w-0">
                {stage === 'review' && (
                    <ReviewPanel
                        order={pendingOrder}
                        plan={selectedPlan}
                        price={selectedPrice}
                        onContinue={onPayment}
                    />
                )}

                {stage === 'payment' && (
                    <PaymentPanel
                        order={pendingOrder}
                        selectedMethod={selectedMethod}
                        paymentMethods={paymentMethods}
                        paymentForm={paymentForm}
                        onBack={onReview}
                        onSubmit={onSubmit}
                    />
                )}

                {stage === 'verification' && (
                    <VerificationPanel
                        order={pendingOrder}
                        plan={selectedPlan}
                    />
                )}
            </div>
        </section>
    );
}

function OrderSummary({
    order,
    plan,
    price,
    stage,
}: {
    order: SubscriptionOrder;
    plan: SubscriptionPlan | null;
    price: PlanPrice | undefined;
    stage: CheckoutStage;
}) {
    return (
        <aside className="overflow-hidden rounded-2xl border border-border/70 bg-card xl:sticky xl:top-5">
            <div className="border-b border-border/60 p-5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    <ReceiptText className="size-3.5" />
                    Order summary
                </div>
                <p className="mt-2 font-mono text-xs font-semibold">
                    {order.order_code}
                </p>
            </div>

            <div className="p-5">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <Crown className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                            {plan?.name ?? 'Subscription plan'}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                            {humanize(order.billing_type)} billing
                        </p>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <SummaryRow
                        label="Order type"
                        value={humanize(order.order_type)}
                    />
                    <SummaryRow
                        label="Billing cycle"
                        value={humanize(
                            price?.billing_interval ?? order.billing_type,
                        )}
                    />
                    <SummaryRow
                        label="Status"
                        value={humanize(order.status)}
                    />
                </div>

                <div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.045] p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Amount due
                    </p>
                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-primary">
                        {formatMoney(order.amount, order.currency)}
                    </p>
                </div>

                <div className="mt-5 flex items-start gap-2.5 border-t border-border/60 pt-4">
                    <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                    <p className="text-[10px] leading-4 text-muted-foreground">
                        Plan activation happens only after administrator
                        verification.
                    </p>
                </div>
            </div>

            <div className="border-t border-border/60 bg-muted/[0.1] px-5 py-3">
                <p className="text-[9px] text-muted-foreground">
                    Current step:{' '}
                    <span className="font-semibold text-foreground">
                        {wizardSteps.find((item) => item.key === stage)?.label}
                    </span>
                </p>
            </div>
        </aside>
    );
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-right text-[10px] font-semibold">
                {value}
            </span>
        </div>
    );
}

function ReviewPanel({
    order,
    plan,
    price,
    onContinue,
}: {
    order: SubscriptionOrder;
    plan: SubscriptionPlan | null;
    price: PlanPrice | undefined;
    onContinue: () => void;
}) {
    const groups = plan ? groupedFeatures(plan) : [];

    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <PanelHeader
                icon={<FileCheck2 className="size-3.5" />}
                eyebrow="Step 2 · Review order"
                title="Confirm your subscription order"
                description="Review the plan, billing interval, limits, and enabled modules before payment."
            />

            <div className="p-5 md:p-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <ReviewMetric
                        icon={<Crown className="size-4" />}
                        label="Selected plan"
                        value={plan?.name ?? 'Plan unavailable'}
                    />
                    <ReviewMetric
                        icon={<CalendarDays className="size-4" />}
                        label="Billing"
                        value={humanize(
                            price?.billing_interval ?? order.billing_type,
                        )}
                    />
                    <ReviewMetric
                        icon={<CreditCard className="size-4" />}
                        label="Amount due"
                        value={formatMoney(order.amount, order.currency)}
                    />
                </div>

                {plan && (
                    <>
                        <div className="mt-5 grid grid-cols-3 divide-x divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-background/25">
                            <Limit
                                icon={<Building2 className="size-3.5" />}
                                label="Branches"
                                value={limitText(plan, 'max_branches')}
                            />
                            <Limit
                                icon={<Warehouse className="size-3.5" />}
                                label="Warehouses"
                                value={limitText(plan, 'max_warehouses')}
                            />
                            <Limit
                                icon={<Users className="size-3.5" />}
                                label="Team"
                                value={limitText(plan, 'max_team_members')}
                            />
                        </div>

                        <div className="mt-5 overflow-hidden rounded-xl border border-border/70">
                            <div className="flex items-center justify-between border-b border-border/60 bg-muted/[0.1] px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold">
                                        Plan inclusions
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        Modules activated after verification
                                    </p>
                                </div>

                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                                    {plan.features.length} modules
                                </span>
                            </div>

                            <div className="grid divide-y divide-border/50 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                                {groups.map((group) => (
                                    <div key={group.key} className="p-4">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/70">
                                            {group.title}
                                        </p>

                                        <div className="mt-2.5 space-y-1.5">
                                            {group.features.map((feature) => (
                                                <div
                                                    key={feature.code}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Check className="size-3.5 shrink-0 text-emerald-400" />
                                                    <span className="text-[10px] font-medium text-foreground/80">
                                                        {feature.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2.5">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                        <p className="max-w-xl text-[10px] leading-4 text-muted-foreground">
                            Continuing does not activate the plan. Activation
                            occurs only after payment verification.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onContinue}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                        Continue to payment
                        <ChevronRight className="size-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReviewMetric({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-background/25 p-4">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span className="text-primary">{icon}</span>
                {label}
            </div>
            <p className="mt-2 text-sm font-bold">{value}</p>
        </div>
    );
}

function PaymentPanel({
    order,
    selectedMethod,
    paymentMethods,
    paymentForm,
    onBack,
    onSubmit,
}: {
    order: SubscriptionOrder;
    selectedMethod: PaymentMethod | null;
    paymentMethods: PaymentMethod[];
    paymentForm: ReturnType<typeof useForm<PaymentForm>>;
    onBack: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    const canSubmit =
        paymentForm.data.payment_method_id !== '' &&
        paymentForm.data.payment_proof !== null;

    return (
        <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-2xl border border-border/70 bg-card"
        >
            <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-start sm:justify-between md:p-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                        <CreditCard className="size-3.5" />
                        Step 3 · Payment
                    </div>
                    <h2 className="mt-2 text-xl font-bold tracking-tight">
                        Submit payment details
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                        Select a channel, enter sender information, and upload a
                        clear proof of payment.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background/30 px-3 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Review order
                </button>
            </div>

            <div className="space-y-6 p-5 md:p-6">
                <PaymentSection
                    number="01"
                    title="Payment method"
                    description="Choose where the subscription payment was sent."
                >
                    {paymentMethods.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                            {paymentMethods.map((method) => {
                                const selected =
                                    paymentForm.data.payment_method_id ===
                                    method.id;

                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() =>
                                            paymentForm.setData(
                                                'payment_method_id',
                                                method.id,
                                            )
                                        }
                                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                                            selected
                                                ? 'border-primary/40 bg-primary/[0.055] ring-1 ring-primary/10'
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
                                                <p className="truncate text-xs font-semibold">
                                                    {method.name}
                                                </p>

                                                <span
                                                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                                                        selected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-border'
                                                    }`}
                                                >
                                                    {selected && (
                                                        <Check className="size-2.5" />
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                                {method.account_name ||
                                                    'Payment account'}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[10px] text-foreground/75">
                                                {method.account_number ||
                                                    'Account number unavailable'}
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
                                <p className="text-xs font-semibold text-amber-200">
                                    No payment method available
                                </p>
                                <p className="mt-1 text-[10px] leading-4 text-amber-100/60">
                                    Contact JCM support before continuing.
                                </p>
                            </div>
                        </div>
                    )}

                    <FormError
                        message={paymentForm.errors.payment_method_id}
                    />

                    {selectedMethod && (
                        <div className="mt-3 rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold">
                                        Send to {selectedMethod.name}
                                    </p>

                                    <div className="mt-2 grid gap-2 text-[10px] sm:grid-cols-2">
                                        <div>
                                            <p className="text-muted-foreground">
                                                Account name
                                            </p>
                                            <p className="mt-0.5 font-semibold">
                                                {selectedMethod.account_name ||
                                                    'Not provided'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-muted-foreground">
                                                Account number
                                            </p>
                                            <p className="mt-0.5 font-mono font-semibold">
                                                {selectedMethod.account_number ||
                                                    'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedMethod.instructions && (
                                        <p className="mt-3 border-t border-primary/10 pt-3 text-[10px] leading-4 text-muted-foreground">
                                            {selectedMethod.instructions}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </PaymentSection>

                <PaymentSection
                    number="02"
                    title="Sender information"
                    description="Use the exact details shown in the transaction receipt."
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Reference number"
                            value={paymentForm.data.reference_number}
                            placeholder="Enter transaction reference"
                            error={paymentForm.errors.reference_number}
                            onChange={(value) =>
                                paymentForm.setData(
                                    'reference_number',
                                    value,
                                )
                            }
                        />
                        <Field
                            label="Sender account name"
                            value={paymentForm.data.account_name}
                            placeholder="Name used for payment"
                            error={paymentForm.errors.account_name}
                            onChange={(value) =>
                                paymentForm.setData('account_name', value)
                            }
                        />
                        <Field
                            label="Sender account number"
                            value={paymentForm.data.account_number}
                            placeholder="Mobile or account number"
                            error={paymentForm.errors.account_number}
                            className="sm:col-span-2"
                            onChange={(value) =>
                                paymentForm.setData('account_number', value)
                            }
                        />
                    </div>
                </PaymentSection>

                <PaymentSection
                    number="03"
                    title="Payment proof"
                    description="Upload a clear screenshot or photo of the completed transaction."
                >
                    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/20 px-5 py-8 text-center transition hover:border-primary/35 hover:bg-primary/[0.025]">
                        <span className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06] text-primary">
                            <UploadCloud className="size-5" />
                        </span>
                        <p className="mt-3 text-xs font-semibold">
                            {paymentForm.data.payment_proof
                                ? 'Payment proof selected'
                                : 'Choose payment proof'}
                        </p>
                        <p className="mt-1 max-w-sm text-[10px] leading-4 text-muted-foreground">
                            {fileLabel(paymentForm.data.payment_proof)}
                        </p>

                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) =>
                                paymentForm.setData(
                                    'payment_proof',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                            className="sr-only"
                            required
                        />
                    </label>

                    <FormError message={paymentForm.errors.payment_proof} />
                </PaymentSection>

                {paymentForm.hasErrors && (
                    <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] p-4 text-rose-300">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold">
                                Payment details need attention
                            </p>
                            <p className="mt-1 text-[10px] leading-4 text-rose-200/70">
                                Review the marked fields before submitting.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Total payment
                        </p>
                        <p className="mt-1 text-xl font-bold text-primary">
                            {formatMoney(order.amount, order.currency)}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={paymentForm.processing || !canSubmit}
                        className="inline-flex h-11 min-w-56 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        <FileUp className="size-4" />
                        {paymentForm.processing
                            ? 'Submitting payment...'
                            : 'Submit for verification'}
                    </button>
                </div>
            </div>
        </form>
    );
}

function PaymentSection({
    number,
    title,
    description,
    children,
}: {
    number: string;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section>
            <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.07] text-[9px] font-bold text-primary">
                    {number}
                </span>
                <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                        {description}
                    </p>
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
                className={`mt-2 h-10 w-full rounded-xl border bg-background/35 px-3 text-xs outline-none transition placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-ring ${
                    error ? 'border-rose-500/40' : 'border-input'
                }`}
            />
            <FormError message={error} />
        </label>
    );
}

function FormError({ message }: { message?: string }) {
    if (!message) return null;

    return <p className="mt-1.5 text-[10px] text-rose-400">{message}</p>;
}

function VerificationPanel({
    order,
    plan,
}: {
    order: SubscriptionOrder;
    plan: SubscriptionPlan | null;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <PanelHeader
                icon={<Clock3 className="size-3.5" />}
                eyebrow="Step 4 · Verification"
                title="Payment submitted successfully"
                description="Your payment details are waiting for administrator review."
                tone="emerald"
            />

            <div className="p-5 md:p-6">
                <div className="flex flex-col items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.045] px-5 py-10 text-center">
                    <span className="flex size-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                        <CheckCircle2 className="size-7" />
                    </span>

                    <h3 className="mt-4 text-base font-bold">
                        Verification in progress
                    </h3>

                    <p className="mt-2 max-w-lg text-xs leading-5 text-muted-foreground">
                        JCM will review the proof. The{' '}
                        <span className="font-semibold text-foreground">
                            {plan?.name ?? 'selected plan'}
                        </span>{' '}
                        will activate after approval.
                    </p>

                    <div className="mt-5 grid w-full max-w-xl gap-3 sm:grid-cols-3">
                        <VerificationItem
                            label="Order"
                            value={order.order_code}
                        />
                        <VerificationItem
                            label="Amount"
                            value={formatMoney(order.amount, order.currency)}
                        />
                        <VerificationItem
                            label="Status"
                            value={humanize(order.status)}
                        />
                    </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-border/70 bg-background/20 p-4">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                        <p className="text-xs font-semibold">
                            What happens next?
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                            After verification, the subscription status and
                            enabled modules update automatically on this page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VerificationItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-emerald-500/15 bg-background/25 p-3">
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 truncate text-[10px] font-semibold">{value}</p>
        </div>
    );
}

function PanelHeader({
    icon,
    eyebrow,
    title,
    description,
    tone = 'primary',
}: {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    tone?: 'primary' | 'emerald';
}) {
    return (
        <div className="border-b border-border/60 p-5 md:p-6">
            <div
                className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    tone === 'emerald' ? 'text-emerald-400' : 'text-primary'
                }`}
            >
                {icon}
                {eyebrow}
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight">{title}</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function Notice({
    title,
    detail,
    action,
}: {
    title: string;
    detail: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}) {
    return (
        <section className="flex flex-col gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.065] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <div>
                    <p className="text-xs font-semibold text-amber-200">
                        {title}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-amber-100/60">
                        {detail}
                    </p>
                </div>
            </div>

            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.08] px-4 text-[10px] font-semibold text-amber-100 transition hover:bg-amber-400/[0.14]"
                >
                    <RefreshCcw className="size-3.5" />
                    {action.label}
                </button>
            )}
        </section>
    );
}