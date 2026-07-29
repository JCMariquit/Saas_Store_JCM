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
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    CreditCard,
    Crown,
    FileUp,
    PackageCheck,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    Users,
    Warehouse,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

interface SubscriptionPageProps {
    current: SubscriptionSummary | null;
    plans: SubscriptionPlan[];
    pendingOrder: SubscriptionOrder | null;
    paymentMethods: PaymentMethod[];
}

type PaymentForm = {
    order_id: number | '';
    payment_method_id: number | '';
    reference_number: string;
    account_name: string;
    account_number: string;
    payment_proof: File | null;
};

declare function route(
    name: string,
    params?: Record<string, unknown>,
): string;

type SubscriptionPlanFeature =
    SubscriptionPlan['features'][number];

interface PlanFeatureGroup {
    key: string;
    title: string;
    description: string;
    features: SubscriptionPlanFeature[];
}

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

const featureGroupDefinitions: Array<{
    key: string;
    title: string;
    description: string;
    codes: readonly string[];
}> = [
    {
        key: 'inventory',
        title: 'Inventory essentials',
        description:
            'Core catalog, product, stock, and adjustment tools.',
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
        key: 'stock-operations',
        title: 'Stock operations',
        description:
            'Withdrawal, movement, and warehouse transfer workflows.',
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
        description:
            'Supplier, purchasing, approval, receiving, and order history.',
        codes: [
            'supplier_management',
            'purchase_orders',
            'purchase_approvals',
            'receiving',
            'received_order_history',
        ],
    },
    {
        key: 'locations-team',
        title: 'Locations and team',
        description:
            'Branch, warehouse, staff, and role administration.',
        codes: [
            'branch_management',
            'warehouse_management',
            'team_overview',
            'staff_management',
            'roles_access',
        ],
    },
    {
        key: 'business-settings',
        title: 'Business settings',
        description:
            'Organization profile and visual branding.',
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
    if (!value) {
        return 'Not subscribed';
    }

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function priceFor(
    plan: SubscriptionPlan,
    interval: BillingInterval,
): PlanPrice | undefined {
    return (
        plan.prices.find((price) => price.billing_interval === interval) ??
        plan.prices.find((price) => price.is_default) ??
        plan.prices[0]
    );
}

function limitText(
    plan: SubscriptionPlan,
    code: string,
    fallback: string,
): string {
    const limit = plan.limits[code];

    if (!limit) {
        return fallback;
    }

    if (limit.is_unlimited) {
        return 'Unlimited';
    }

    return String(limit.value ?? 0);
}

function groupedPlanFeatures(
    plan: SubscriptionPlan,
): PlanFeatureGroup[] {
    const assignedFeatureCodes =
        new Set<string>();

    const groups: PlanFeatureGroup[] =
        featureGroupDefinitions
            .map(
                (
                    group,
                ): PlanFeatureGroup => {
                    const features:
                        SubscriptionPlanFeature[] =
                        plan.features.filter(
                            (
                                feature,
                            ): boolean =>
                                group.codes.includes(
                                    feature.code,
                                ),
                        );

                    features.forEach(
                        (
                            feature,
                        ): void => {
                            assignedFeatureCodes.add(
                                feature.code,
                            );
                        },
                    );

                    return {
                        key: group.key,
                        title: group.title,
                        description:
                            group.description,
                        features,
                    };
                },
            )
            .filter(
                (
                    group,
                ): boolean =>
                    group.features.length > 0,
            );

    const ungroupedFeatures:
        SubscriptionPlanFeature[] =
        plan.features.filter(
            (
                feature,
            ): boolean =>
                !assignedFeatureCodes.has(
                    feature.code,
                ),
        );

    if (ungroupedFeatures.length > 0) {
        groups.push({
            key: 'other',
            title: 'Other included tools',
            description:
                'Additional modules enabled for this plan.',
            features: ungroupedFeatures,
        });
    }

    return groups;
}

export default function SubscriptionIndex({
    current,
    plans,
    pendingOrder,
    paymentMethods,
}: SubscriptionPageProps) {
    const [interval, setInterval] = useState<BillingInterval>(
        current?.billing_interval &&
            ['monthly', 'quarterly', 'yearly'].includes(current.billing_interval)
            ? current.billing_interval
            : 'monthly',
    );

    const paymentForm = useForm<PaymentForm>({
        order_id: pendingOrder?.id ?? '',
        payment_method_id: '',
        reference_number: '',
        account_name: '',
        account_number: '',
        payment_proof: null,
    });

    const isOwner = current?.is_owner ?? true;
    const accessMode = current?.access_mode ?? 'blocked';

    const startCheckout = (planPriceId: number) => {
        router.post(
            route('subscription.checkout.store'),
            { plan_price_id: planPriceId },
            {
                preserveScroll: true,
            },
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

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 md:p-5">
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                    <div className="relative p-4 md:p-5">
                        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.13),transparent_68%)] lg:block" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                                    <CreditCard className="size-4" />
                                    JCM Inventory Subscription
                                </div>

                                <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                                    Subscription & Billing
                                </h1>

                                <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground md:text-sm">
                                    Manage the owner subscription shared by your
                                    Inventory team, review plan entitlements, and
                                    submit manual payments.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                        accessMode === 'full'
                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                            : accessMode === 'read_only'
                                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                              : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                                    }`}
                                >
                                    {humanize(current?.subscription_status)}
                                </span>

                                <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                                    {current?.role_name ?? 'Account owner'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={<Crown className="size-4" />}
                        label="Current plan"
                        value={current?.plan_name ?? 'No plan'}
                        detail={
                            current?.billing_interval
                                ? humanize(current.billing_interval)
                                : 'Choose a billing cycle'
                        }
                    />
                    <MetricCard
                        icon={<ShieldCheck className="size-4" />}
                        label="Access mode"
                        value={humanize(current?.access_mode)}
                        detail={
                            current?.can_write
                                ? 'Full create and update access'
                                : 'Renewal may be required'
                        }
                    />
                    <MetricCard
                        icon={<CalendarDays className="size-4" />}
                        label="Current period"
                        value={current?.end_date ?? 'Not available'}
                        detail="Owner subscription end date"
                    />
                    <MetricCard
                        icon={<Users className="size-4" />}
                        label="Shared access"
                        value={
                            [
                                'team',
                                'premium',
                            ].includes(
                                current?.plan_code ??
                                    '',
                            )
                                ? 'Owner + Team'
                                : 'Owner only'
                        }
                        detail="Manager and staff inherit owner status"
                    />
                </section>

                {current?.cancel_at_period_end && (
                    <section className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Clock3 className="mt-0.5 size-5 text-amber-400" />
                            <div>
                                <p className="font-semibold text-amber-100">
                                    Cancellation is scheduled
                                </p>
                                <p className="mt-1 text-sm text-amber-100/70">
                                    Access remains available until the current
                                    billing period ends.
                                </p>
                            </div>
                        </div>

                        {isOwner && (
                            <button
                                type="button"
                                onClick={resumeSubscription}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
                            >
                                <RefreshCcw className="size-4" />
                                Continue subscription
                            </button>
                        )}
                    </section>
                )}

                <section className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                <Sparkles className="size-3.5" />
                                Available plans
                            </div>

                            <h2 className="mt-1 text-lg font-bold tracking-tight">
                                Select an operating plan
                            </h2>

                            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                One owner subscription controls the included
                                modules, locations, and team access.
                            </p>
                        </div>

                        <div className="inline-flex w-fit rounded-lg border border-border bg-muted/30 p-1">
                            {intervals.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setInterval(item.value)}
                                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                                        interval === item.value
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
                        {plans.map((plan) => {
                            const price = priceFor(
                                plan,
                                interval,
                            );

                            const isCurrent =
                                current?.plan_id ===
                                plan.id;

                            const isPremium = [
                                'team',
                                'premium',
                            ].includes(plan.code);

                            const featureGroups =
                                groupedPlanFeatures(
                                    plan,
                                );

                            return (
                                <article
                                    key={plan.id}
                                    className={`relative overflow-hidden rounded-xl border p-4 md:p-5 ${
                                        isCurrent
                                            ? 'border-primary/40 bg-primary/[0.04]'
                                            : 'border-border bg-background/45'
                                    }`}
                                >
                                    {isCurrent && (
                                        <div className="absolute right-3 top-3 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
                                            Current plan
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`flex size-9 items-center justify-center rounded-lg border ${
                                                isPremium
                                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                                    : 'border-border bg-muted/40 text-muted-foreground'
                                            }`}
                                        >
                                            {isPremium ? (
                                                <Users className="size-4" />
                                            ) : (
                                                <PackageCheck className="size-4" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold">
                                                {plan.name}
                                            </h3>
                                            <p className="mt-1 pr-16 text-xs leading-5 text-muted-foreground">
                                                {plan.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-end gap-1.5">
                                        <span className="text-2xl font-bold tracking-tight">
                                            {price
                                                ? formatMoney(
                                                      price.price,
                                                      price.currency,
                                                  )
                                                : 'Unavailable'}
                                        </span>
                                        {price && (
                                            <span className="pb-0.5 text-xs text-muted-foreground">
                                                / {humanize(price.billing_interval)}
                                            </span>
                                        )}
                                    </div>

                                    {price?.compare_at_price && (
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            Regular total{' '}
                                            <span className="line-through">
                                                {formatMoney(
                                                    price.compare_at_price,
                                                    price.currency,
                                                )}
                                            </span>
                                        </p>
                                    )}

                                    <div className="mt-4 grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-lg border border-border/70 bg-muted/[0.14]">
                                        <PlanStat
                                            icon={<Building2 className="size-3.5" />}
                                            label="Branches"
                                            value={limitText(
                                                plan,
                                                'max_branches',
                                                '—',
                                            )}
                                        />

                                        <PlanStat
                                            icon={<Warehouse className="size-3.5" />}
                                            label="Warehouses"
                                            value={limitText(
                                                plan,
                                                'max_warehouses',
                                                '—',
                                            )}
                                        />

                                        <PlanStat
                                            icon={<Users className="size-3.5" />}
                                            label="Team"
                                            value={limitText(
                                                plan,
                                                'max_team_members',
                                                '—',
                                            )}
                                        />
                                    </div>

                                    <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
                                        <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/[0.14] px-3 py-2.5">
                                            <div>
                                                <p className="text-xs font-semibold">
                                                    Plan inclusions
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                    Modules enabled for {plan.name}
                                                </p>
                                            </div>

                                            <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-400">
                                                {plan.features.length}{' '}
                                                modules
                                            </span>
                                        </div>

                                        {featureGroups.length > 0 ? (
                                            <div className="divide-y divide-border/55">
                                                {featureGroups.map(
                                                    (group) => (
                                                        <div
                                                            key={
                                                                group.key
                                                            }
                                                            className="px-3 py-3"
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/75">
                                                                    {
                                                                        group.title
                                                                    }
                                                                </p>

                                                                <span className="text-[9px] font-medium text-muted-foreground">
                                                                    {
                                                                        group.features
                                                                            .length
                                                                    }{' '}
                                                                    included
                                                                </span>
                                                            </div>

                                                            <div className="mt-2 grid gap-x-5 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                                                {group.features.map(
                                                                    (
                                                                        feature,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                feature.code
                                                                            }
                                                                            className="flex min-w-0 items-center gap-2 py-0.5"
                                                                        >
                                                                            <Check className="size-3.5 shrink-0 text-emerald-400" />

                                                                            <span className="truncate text-[11px] font-medium text-foreground/80">
                                                                                {
                                                                                    feature.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-5 text-center text-xs text-muted-foreground">
                                                No enabled modules were returned for this plan.
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={
                                            !price ||
                                            !isOwner ||
                                            pendingOrder?.status ===
                                                'payment_submitted'
                                        }
                                        onClick={() =>
                                            price && startCheckout(price.id)
                                        }
                                        className={`mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                            isCurrent
                                                ? 'border border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        }`}
                                    >
                                        {isCurrent ? (
                                            <>
                                                <CheckCircle2 className="size-4" />
                                                Renew this plan
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="size-4" />
                                                Choose {plan.name}
                                            </>
                                        )}
                                    </button>

                                    {!isOwner && (
                                        <p className="mt-3 text-center text-xs text-muted-foreground">
                                            Only the account owner can change
                                            the subscription.
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    <p className="mt-4 border-t border-border/60 pt-4 text-[11px] leading-5 text-muted-foreground">
                        Basic covers core inventory and procurement for one
                        owner. Premium adds locations, stock movement and
                        transfer controls, received-order history, and team
                        management.
                    </p>
                </section>

                {pendingOrder && (
                    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <CreditCard className="size-4" />
                                Pending subscription order
                            </div>

                            <h2 className="mt-2 text-xl font-bold">
                                {pendingOrder.order_code}
                            </h2>

                            <div className="mt-5 space-y-3">
                                <OrderRow
                                    label="Order type"
                                    value={humanize(
                                        pendingOrder.order_type,
                                    )}
                                />
                                <OrderRow
                                    label="Billing"
                                    value={humanize(
                                        pendingOrder.billing_type,
                                    )}
                                />
                                <OrderRow
                                    label="Amount due"
                                    value={formatMoney(
                                        pendingOrder.amount,
                                        pendingOrder.currency,
                                    )}
                                    strong
                                />
                                <OrderRow
                                    label="Status"
                                    value={humanize(
                                        pendingOrder.status,
                                    )}
                                />
                            </div>

                            {pendingOrder.status === 'payment_submitted' && (
                                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <CheckCircle2 className="mt-0.5 size-5 text-emerald-400" />
                                    <div>
                                        <p className="font-semibold text-emerald-100">
                                            Payment submitted
                                        </p>
                                        <p className="mt-1 text-sm text-emerald-100/70">
                                            Your proof is waiting for JCM
                                            administrator verification.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {pendingOrder.status === 'pending' && (
                            <form
                                onSubmit={submitPayment}
                                className="rounded-2xl border border-border/70 bg-card p-5 md:p-6"
                            >
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <FileUp className="size-4" />
                                    Submit payment proof
                                </div>

                                <h2 className="mt-2 text-xl font-bold">
                                    Manual payment verification
                                </h2>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-2 sm:col-span-2">
                                        <span className="text-sm font-medium">
                                            Payment method
                                        </span>
                                        <select
                                            value={
                                                paymentForm.data
                                                    .payment_method_id
                                            }
                                            onChange={(event) =>
                                                paymentForm.setData(
                                                    'payment_method_id',
                                                    event.target.value === ''
                                                        ? ''
                                                        : Number(event.target.value),
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                            required
                                        >
                                            <option value="">
                                                Select payment method
                                            </option>
                                            {paymentMethods.map((method) => (
                                                <option
                                                    key={method.id}
                                                    value={method.id}
                                                >
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>
                                        {paymentForm.errors.payment_method_id && (
                                            <p className="text-xs text-rose-400">
                                                {
                                                    paymentForm.errors
                                                        .payment_method_id
                                                }
                                            </p>
                                        )}
                                    </label>

                                    <Field
                                        label="Reference number"
                                        value={
                                            paymentForm.data.reference_number
                                        }
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
                                        onChange={(value) =>
                                            paymentForm.setData(
                                                'account_name',
                                                value,
                                            )
                                        }
                                    />

                                    <Field
                                        label="Sender account number"
                                        value={paymentForm.data.account_number}
                                        onChange={(value) =>
                                            paymentForm.setData(
                                                'account_number',
                                                value,
                                            )
                                        }
                                    />

                                    <label className="space-y-2">
                                        <span className="text-sm font-medium">
                                            Payment proof
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) =>
                                                paymentForm.setData(
                                                    'payment_proof',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                            className="block h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-semibold"
                                            required
                                        />
                                    </label>
                                </div>

                                {paymentForm.hasErrors && (
                                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                        Review the payment details and try
                                        again.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={paymentForm.processing}
                                    className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FileUp className="size-4" />
                                    {paymentForm.processing
                                        ? 'Submitting...'
                                        : 'Submit payment proof'}
                                </button>
                            </form>
                        )}
                    </section>
                )}

                {current?.subscription_id &&
                    isOwner &&
                    !current.cancel_at_period_end && (
                        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    Subscription management
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Scheduling cancellation does not remove
                                    access immediately. The team keeps access
                                    until the current period ends.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cancelAtPeriodEnd}
                                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
                            >
                                Cancel at period end
                            </button>
                        </section>
                    )}
            </div>
        </AppLayout>
    );
}

function MetricCard({
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
        <div className="rounded-xl border border-border/70 bg-card p-3.5">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span className="text-primary">{icon}</span>
                {label}
            </div>

            <p className="mt-2 truncate text-base font-bold">
                {value}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {detail}
            </p>
        </div>
    );
}

function PlanStat({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                {icon}

                <span className="truncate text-[8px] font-semibold uppercase tracking-[0.1em]">
                    {label}
                </span>
            </div>

            <p className="mt-1 text-xs font-bold">
                {value}
            </p>
        </div>
    );
}

function OrderRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={strong ? 'font-bold text-primary' : 'font-semibold'}>
                {value}
            </span>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="space-y-2">
            <span className="text-sm font-medium">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            />
        </label>
    );
}