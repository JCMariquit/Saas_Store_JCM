import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    Layers3,
    Package,
    ReceiptText,
    ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type SubscriptionItem = {
    id: number;
    subscription_code: string;
    subscription_type: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    duration_days: number | null;
    amount: number | string | null;
    notes: string | null;
    days_left: number | null;
    product: {
        name: string | null;
        description: string | null;
    };
    plan: {
        name: string | null;
        price: number | string | null;
        duration_days: number | null;
    };
    order: {
        code: string | null;
    };
};

type PageProps = {
    subscriptions: SubscriptionItem[];
    stats: {
        total_subscriptions: number;
        active_subscriptions: number;
        expiring_soon: number;
        expired_subscriptions: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Subscriptions',
        href: '/my-subscription',
    },
];

export default function MySubscriptionPage() {
    const { props } = usePage<PageProps>();
    const { subscriptions = [], stats } = props;

    const [activeTab, setActiveTab] = useState<number>(subscriptions[0]?.id ?? 0);

    const selectedSubscription = useMemo(() => {
        return subscriptions.find((item) => item.id === activeTab) ?? subscriptions[0] ?? null;
    }, [subscriptions, activeTab]);

    const formatAmount = (value: number | string | null) => {
        if (value === null || value === undefined || value === '') return '-';

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value));
    };

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-green-200 bg-green-100 text-green-700';
            case 'pending':
                return 'border-yellow-200 bg-yellow-100 text-yellow-700';
            case 'expired':
                return 'border-red-200 bg-red-100 text-red-700';
            case 'cancelled':
                return 'border-slate-200 bg-slate-100 text-slate-700';
            case 'locked':
                return 'border-orange-200 bg-orange-100 text-orange-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    const statusTextClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-700';
            case 'pending':
                return 'text-yellow-700';
            case 'expired':
                return 'text-red-700';
            case 'cancelled':
                return 'text-slate-700';
            case 'locked':
                return 'text-orange-700';
            default:
                return 'text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Subscription is active';
            case 'pending':
                return 'Waiting for activation';
            case 'expired':
                return 'Subscription has expired';
            case 'cancelled':
                return 'Subscription was cancelled';
            case 'locked':
                return 'Subscription is temporarily locked';
            default:
                return 'Subscription status unavailable';
        }
    };

    const getProgressPercent = (subscription: SubscriptionItem) => {
        if (
            subscription.duration_days === null ||
            subscription.duration_days <= 0 ||
            subscription.days_left === null
        ) {
            return 0;
        }

        const raw = (subscription.days_left / subscription.duration_days) * 100;
        return Math.max(0, Math.min(100, raw));
    };

    const getProgressBarClass = (subscription: SubscriptionItem) => {
        if (subscription.status === 'expired' || subscription.status === 'cancelled') {
            return 'bg-red-500';
        }
        if (subscription.status === 'locked') {
            return 'bg-orange-500';
        }
        if (subscription.status === 'pending') {
            return 'bg-yellow-500';
        }
        if ((subscription.days_left ?? 0) <= 5) {
            return 'bg-red-500';
        }
        if ((subscription.days_left ?? 0) <= 10) {
            return 'bg-yellow-500';
        }
        return 'bg-green-500';
    };

    const getTopInsight = (subscription: SubscriptionItem) => {
        if (subscription.status === 'active' && subscription.days_left !== null) {
            if (subscription.days_left <= 5) {
                return {
                    icon: AlertTriangle,
                    title: 'Expiry is near',
                    description: 'This subscription is close to ending. Plan ahead to avoid interruption.',
                    boxClass: 'border-red-200 bg-red-50',
                    iconClass: 'text-red-600',
                    textClass: 'text-red-800',
                };
            }

            if (subscription.days_left <= 10) {
                return {
                    icon: Clock3,
                    title: 'Renewal reminder',
                    description: 'This subscription is still active, but expiry is getting close.',
                    boxClass: 'border-yellow-200 bg-yellow-50',
                    iconClass: 'text-yellow-600',
                    textClass: 'text-yellow-800',
                };
            }

            return {
                icon: CheckCircle2,
                title: 'In good standing',
                description: 'This subscription is active and running normally.',
                boxClass: 'border-green-200 bg-green-50',
                iconClass: 'text-green-600',
                textClass: 'text-green-800',
            };
        }

        if (subscription.status === 'pending') {
            return {
                icon: Clock3,
                title: 'Pending activation',
                description: 'This subscription exists but is not fully active yet.',
                boxClass: 'border-yellow-200 bg-yellow-50',
                iconClass: 'text-yellow-600',
                textClass: 'text-yellow-800',
            };
        }

        if (subscription.status === 'locked') {
            return {
                icon: AlertTriangle,
                title: 'Subscription is locked',
                description: 'Access may be limited until the subscription issue is resolved.',
                boxClass: 'border-orange-200 bg-orange-50',
                iconClass: 'text-orange-600',
                textClass: 'text-orange-800',
            };
        }

        return {
            icon: AlertTriangle,
            title: 'Needs attention',
            description: 'This subscription is not currently active.',
            boxClass: 'border-red-200 bg-red-50',
            iconClass: 'text-red-600',
            textClass: 'text-red-800',
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Subscriptions" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-8 text-white">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                    Account Subscriptions
                                </p>
                                <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                                    My Subscriptions
                                </h1>
                                <p className="mt-2 text-sm leading-7 text-slate-300">
                                    Each subscription is organized into its own tab so you can switch
                                    between products easily.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-wide text-slate-300">
                                    Active Subscriptions
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">
                                    {stats.active_subscriptions}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        {subscriptions.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                                    <Layers3 className="h-6 w-6 text-slate-500" />
                                </div>

                                <h2 className="mt-4 text-lg font-bold text-slate-900">
                                    No subscriptions found
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    You do not have any subscription records yet.
                                </p>

                                <Link
                                    href="/dashboard"
                                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Browse Store
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-sm text-slate-500">Total Subscriptions</p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            {stats.total_subscriptions}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-sm text-slate-500">Active</p>
                                        <p className="mt-2 text-2xl font-bold text-green-600">
                                            {stats.active_subscriptions}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-sm text-slate-500">Expiring Soon</p>
                                        <p className="mt-2 text-2xl font-bold text-yellow-600">
                                            {stats.expiring_soon}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-sm text-slate-500">Expired</p>
                                        <p className="mt-2 text-2xl font-bold text-red-600">
                                            {stats.expired_subscriptions}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                    <div className="mb-3">
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Subscription Tabs
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Only your existing subscriptions will appear here.
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <div className="flex min-w-max gap-2 pb-1">
                                            {subscriptions.map((subscription) => (
                                                <button
                                                    key={subscription.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(subscription.id)}
                                                    className={`rounded-xl border px-4 py-3 text-left transition ${
                                                        selectedSubscription?.id === subscription.id
                                                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="text-sm font-semibold">
                                                        {subscription.product.name || 'Subscription'}
                                                    </div>
                                                    <div
                                                        className={`mt-1 text-xs ${
                                                            selectedSubscription?.id === subscription.id
                                                                ? 'text-slate-300'
                                                                : 'text-slate-500'
                                                        }`}
                                                    >
                                                        {subscription.plan.name || '-'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {selectedSubscription && (() => {
                                    const subscription = selectedSubscription;
                                    const insight = getTopInsight(subscription);
                                    const InsightIcon = insight.icon;
                                    const progressPercent = getProgressPercent(subscription);

                                    return (
                                        <div className="space-y-6">
                                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                                <div className="border-b border-slate-200 px-6 py-5">
                                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <h2 className="text-xl font-bold text-slate-900">
                                                                    {subscription.product.name || 'Subscription'}
                                                                </h2>

                                                                <span
                                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                                                                        subscription.status,
                                                                    )}`}
                                                                >
                                                                    {subscription.status}
                                                                </span>
                                                            </div>

                                                            <p className="mt-2 text-sm text-slate-500">
                                                                {subscription.plan.name || '-'} •{' '}
                                                                {subscription.subscription_type} • Code:{' '}
                                                                {subscription.subscription_code}
                                                            </p>
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                                                    Expiry
                                                                </p>
                                                                <p className="mt-1 font-semibold text-slate-900">
                                                                    {subscription.end_date || '-'}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                                                    Days Left
                                                                </p>
                                                                <p className="mt-1 font-semibold text-slate-900">
                                                                    {subscription.days_left !== null
                                                                        ? `${subscription.days_left} day${subscription.days_left !== 1 ? 's' : ''}`
                                                                        : '-'}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                                                    Amount
                                                                </p>
                                                                <p className="mt-1 font-semibold text-slate-900">
                                                                    {formatAmount(subscription.amount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6 px-6 py-6">
                                                    <div className={`rounded-2xl border p-5 ${insight.boxClass}`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-0.5 ${insight.iconClass}`}>
                                                                <InsightIcon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className={`font-semibold ${insight.textClass}`}>
                                                                    {insight.title}
                                                                </h3>
                                                                <p className={`mt-1 text-sm leading-6 ${insight.textClass}`}>
                                                                    {insight.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-slate-900">
                                                                    Subscription Timeline
                                                                </h3>
                                                                <p className="mt-1 text-sm text-slate-500">
                                                                    Track how much of this subscription period remains.
                                                                </p>
                                                            </div>

                                                            <div className={`text-sm font-semibold ${statusTextClass(subscription.status)}`}>
                                                                {getStatusLabel(subscription.status)}
                                                            </div>
                                                        </div>

                                                        <div className="mt-5">
                                                            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                                                                <span>{subscription.start_date || '-'}</span>
                                                                <span>{subscription.end_date || '-'}</span>
                                                            </div>

                                                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${getProgressBarClass(subscription)}`}
                                                                    style={{ width: `${progressPercent}%` }}
                                                                />
                                                            </div>

                                                            <div className="mt-3 flex items-center justify-between text-sm">
                                                                <span className="text-slate-500">
                                                                    Duration: {subscription.duration_days ?? '-'} days
                                                                </span>
                                                                <span className="font-semibold text-slate-900">
                                                                    {subscription.days_left !== null
                                                                        ? `${subscription.days_left} days remaining`
                                                                        : 'No remaining days data'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                                                        <div className="space-y-6">
                                                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="h-5 w-5 text-slate-700" />
                                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                                        Subscription Details
                                                                    </h3>
                                                                </div>

                                                                <div className="mt-6 grid gap-5 md:grid-cols-2">
                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Product
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {subscription.product.name || '-'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Plan
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {subscription.plan.name || '-'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Subscription Type
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                                                                            {subscription.subscription_type}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Order Code
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {subscription.order.code || '-'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Start Date
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {subscription.start_date || '-'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            End Date
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {subscription.end_date || '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-6">
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                        Product Description
                                                                    </p>
                                                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                                                        {subscription.product.description || 'No product description available.'}
                                                                    </p>
                                                                </div>

                                                                <div className="mt-6">
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                        Notes
                                                                    </p>
                                                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                                                        {subscription.notes || 'No notes'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                                                <div className="flex items-center gap-2">
                                                                    <ReceiptText className="h-5 w-5 text-slate-700" />
                                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                                        Plan Snapshot
                                                                    </h3>
                                                                </div>

                                                                <div className="mt-5 grid gap-5 md:grid-cols-3">
                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Plan Name
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {subscription.plan.name || '-'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Plan Price
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {formatAmount(subscription.plan.price)}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Plan Duration
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                                                            {subscription.plan.duration_days ?? '-'} days
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                                                <div className="flex items-center gap-2">
                                                                    <CreditCard className="h-5 w-5 text-slate-700" />
                                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                                        Billing Summary
                                                                    </h3>
                                                                </div>

                                                                <div className="mt-5 space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Amount Paid</span>
                                                                        <span className="text-sm font-semibold text-slate-900">
                                                                            {formatAmount(subscription.amount)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Subscription Duration</span>
                                                                        <span className="text-sm font-semibold text-slate-900">
                                                                            {subscription.duration_days ?? '-'} days
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Plan Duration</span>
                                                                        <span className="text-sm font-semibold text-slate-900">
                                                                            {subscription.plan.duration_days ?? '-'} days
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Subscription Type</span>
                                                                        <span className="text-sm font-semibold capitalize text-slate-900">
                                                                            {subscription.subscription_type}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                                                <div className="flex items-center gap-2">
                                                                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                                        Status Overview
                                                                    </h3>
                                                                </div>

                                                                <div className="mt-5 space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Current Status</span>
                                                                        <span
                                                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                                                                                subscription.status,
                                                                            )}`}
                                                                        >
                                                                            {subscription.status}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Days Left</span>
                                                                        <span className="text-sm font-semibold text-slate-900">
                                                                            {subscription.days_left !== null
                                                                                ? `${subscription.days_left} day${subscription.days_left !== 1 ? 's' : ''}`
                                                                                : '-'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Expiry Date</span>
                                                                        <span className="text-sm font-semibold text-slate-900">
                                                                            {subscription.end_date || '-'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-slate-500">Order Reference</span>
                                                                        <span className="text-sm font-semibold text-slate-900">
                                                                            {subscription.order.code || '-'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                                                                <div className="flex items-center gap-2">
                                                                    <CalendarDays className="h-5 w-5 text-blue-700" />
                                                                    <h3 className="text-sm font-semibold text-blue-900">
                                                                        Reminder
                                                                    </h3>
                                                                </div>

                                                                <p className="mt-2 text-sm leading-6 text-blue-800">
                                                                    Keep track of your subscription end date to avoid
                                                                    service interruption. Future upgrade: renewal action,
                                                                    payment history, and downloadable receipts can be added here.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}