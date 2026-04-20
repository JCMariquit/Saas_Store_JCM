import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, Layers3, Clock3, ShieldCheck, Ban, Lock } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

type SubscriptionRow = {
    id: number;
    subscription_code: string;
    order_code: string | null;
    user_name: string | null;
    product_name: string | null;
    plan_name: string | null;
    subscription_type: 'trial' | 'monthly' | 'yearly' | 'custom';
    status: 'pending' | 'active' | 'expired' | 'cancelled' | 'locked';
    start_date: string | null;
    end_date: string | null;
    duration_days: number;
    amount: number | string | null;
    notes: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type SubscriptionPagination = {
    data: SubscriptionRow[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number | null;
    total: number;
};

type PageProps = {
    subscriptions: SubscriptionPagination;
    filters: {
        search: string;
    };
    stats: {
        total_subscriptions: number;
        active_subscriptions: number;
        pending_subscriptions: number;
        expired_subscriptions: number;
    };
    flash?: {
        success?: string;
    };
};

type ActionForm = {
    notes: string;
};

export default function SubscriptionsIndex() {
    const { props } = usePage<PageProps>();
    const { subscriptions, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search || '');
    const [openCancelModal, setOpenCancelModal] = useState(false);
    const [openLockModal, setOpenLockModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionRow | null>(null);
    const [viewingSubscription, setViewingSubscription] = useState<SubscriptionRow | null>(null);

    const actionForm = useForm<ActionForm>({
        notes: '',
    });

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route('admin.subscriptions.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    const resultsText = useMemo(() => {
        if (!subscriptions.total) return 'No subscriptions found.';
        return `Showing ${subscriptions.from ?? 0} to ${subscriptions.to ?? 0} of ${subscriptions.total} subscriptions`;
    }, [subscriptions.from, subscriptions.to, subscriptions.total]);

    const formatPrice = (value: number | string | null) => {
        if (value === null || value === undefined) return '-';

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value));
    };

    const getStatusBadgeClass = (status: SubscriptionRow['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'expired':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'cancelled':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'locked':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const openCancel = (subscription: SubscriptionRow) => {
        setSelectedSubscription(subscription);
        actionForm.reset();
        actionForm.clearErrors();
        setOpenCancelModal(true);
    };

    const closeCancel = () => {
        setSelectedSubscription(null);
        actionForm.reset();
        actionForm.clearErrors();
        setOpenCancelModal(false);
    };

    const openLock = (subscription: SubscriptionRow) => {
        setSelectedSubscription(subscription);
        actionForm.reset();
        actionForm.clearErrors();
        setOpenLockModal(true);
    };

    const closeLock = () => {
        setSelectedSubscription(null);
        actionForm.reset();
        actionForm.clearErrors();
        setOpenLockModal(false);
    };

    const openViewDrawer = (subscription: SubscriptionRow) => {
        setViewingSubscription(subscription);
    };

    const closeViewDrawer = () => {
        setViewingSubscription(null);
    };

    const submitCancel = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSubscription) return;

        actionForm.post(route('admin.subscriptions.cancel', selectedSubscription.id), {
            preserveScroll: true,
            onSuccess: () => closeCancel(),
        });
    };

    const submitLock = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSubscription) return;

        actionForm.post(route('admin.subscriptions.lock', selectedSubscription.id), {
            preserveScroll: true,
            onSuccess: () => closeLock(),
        });
    };

    const deleteSubscription = (subscription: SubscriptionRow) => {
        router.delete(route('admin.subscriptions.destroy', subscription.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Subscriptions',
            href: '/admin/subscriptions',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Subscriptions
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            View active subscriptions generated from verified orders.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Subscriptions</p>
                                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                    {stats.total_subscriptions}
                                </h3>
                            </div>
                            <div className="rounded-md bg-slate-100 p-3">
                                <Layers3 className="h-5 w-5 text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Active</p>
                                <h3 className="mt-1 text-2xl font-bold text-green-600">
                                    {stats.active_subscriptions}
                                </h3>
                            </div>
                            <div className="rounded-md bg-green-50 p-3">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Pending</p>
                                <h3 className="mt-1 text-2xl font-bold text-yellow-600">
                                    {stats.pending_subscriptions}
                                </h3>
                            </div>
                            <div className="rounded-md bg-yellow-50 p-3">
                                <Clock3 className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Expired</p>
                                <h3 className="mt-1 text-2xl font-bold text-red-600">
                                    {stats.expired_subscriptions}
                                </h3>
                            </div>
                            <div className="rounded-md bg-red-50 p-3">
                                <Clock3 className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Subscription List
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">{resultsText}</p>
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Label htmlFor="subscription-search" className="sr-only">
                                    Search subscriptions
                                </Label>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="subscription-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search code, order, user, product, plan..."
                                    className="rounded-md pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Subscription</th>
                                    <th className="px-4 py-3 text-left font-medium">User</th>
                                    <th className="px-4 py-3 text-left font-medium">Product / Plan</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">End Date</th>
                                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {subscriptions.data.length > 0 ? (
                                    subscriptions.data.map((sub) => (
                                        <tr
                                            key={sub.id}
                                            className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                                            onClick={() => openViewDrawer(sub)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">
                                                    {sub.subscription_code}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Order: {sub.order_code ?? '-'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {sub.user_name ?? '-'}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">
                                                    {sub.product_name ?? '-'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {sub.plan_name ?? '-'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 capitalize text-slate-700">
                                                {sub.subscription_type}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                                                        sub.status,
                                                    )}`}
                                                >
                                                    {sub.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {sub.end_date ?? '-'}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <div
                                                    className="flex items-center justify-center gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {sub.status === 'active' && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-9 rounded-md border-slate-300 px-3 text-slate-700 hover:bg-slate-50"
                                                                title="Cancel subscription"
                                                                onClick={() => openCancel(sub)}
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-9 rounded-md border-orange-200 px-3 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                                title="Lock subscription"
                                                                onClick={() => openLock(sub)}
                                                            >
                                                                <Lock className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {sub.status !== 'active' && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 rounded-md border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            title="Delete subscription"
                                                            onClick={() => deleteSubscription(sub)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-8 text-center text-sm text-slate-500"
                                        >
                                            No subscriptions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {openCancelModal && selectedSubscription && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-xl font-semibold text-slate-900">Cancel Subscription</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add a note and cancel this subscription.
                                </p>
                            </div>

                            <form onSubmit={submitCancel} className="space-y-5 px-6 py-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="cancel_notes">Reason / Notes</Label>
                                    <textarea
                                        id="cancel_notes"
                                        value={actionForm.data.notes}
                                        onChange={(e) => actionForm.setData('notes', e.target.value)}
                                        className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        placeholder="Why are you cancelling this subscription?"
                                    />
                                    <InputError message={actionForm.errors.notes} />
                                </div>

                                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                    <Button type="button" variant="outline" onClick={closeCancel}>
                                        Close
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={actionForm.processing}
                                        className="bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                        {actionForm.processing ? 'Cancelling...' : 'Cancel Subscription'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {openLockModal && selectedSubscription && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-xl font-semibold text-slate-900">Lock Subscription</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add a note and lock this subscription.
                                </p>
                            </div>

                            <form onSubmit={submitLock} className="space-y-5 px-6 py-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="lock_notes">Reason / Notes</Label>
                                    <textarea
                                        id="lock_notes"
                                        value={actionForm.data.notes}
                                        onChange={(e) => actionForm.setData('notes', e.target.value)}
                                        className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        placeholder="Why are you locking this subscription?"
                                    />
                                    <InputError message={actionForm.errors.notes} />
                                </div>

                                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                    <Button type="button" variant="outline" onClick={closeLock}>
                                        Close
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={actionForm.processing}
                                        className="bg-orange-600 text-white hover:bg-orange-700"
                                    >
                                        {actionForm.processing ? 'Locking...' : 'Lock Subscription'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {viewingSubscription && (
                    <div className="fixed inset-0 z-50">
                        <div
                            className="absolute inset-0 bg-slate-950/40"
                            onClick={closeViewDrawer}
                        />

                        <div className="absolute right-0 top-0 flex h-screen w-full max-w-md flex-col bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Subscription Details</h2>
                                    <p className="text-sm text-slate-500">View full subscription information</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeViewDrawer}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto p-6">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subscription Code</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{viewingSubscription.subscription_code}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Code</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{viewingSubscription.order_code ?? '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">User</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{viewingSubscription.user_name ?? '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Product</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{viewingSubscription.product_name ?? '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{viewingSubscription.plan_name ?? '-'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Type</p>
                                        <p className="mt-1 text-sm capitalize text-slate-900">{viewingSubscription.subscription_type}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                                        <p className="mt-1 text-sm capitalize text-slate-900">{viewingSubscription.status}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</p>
                                        <p className="mt-1 text-sm text-slate-900">{formatPrice(viewingSubscription.amount)}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                                        <p className="mt-1 text-sm text-slate-900">{viewingSubscription.duration_days} days</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start Date</p>
                                        <p className="mt-1 text-sm text-slate-900">{viewingSubscription.start_date ?? '-'}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">End Date</p>
                                        <p className="mt-1 text-sm text-slate-900">{viewingSubscription.end_date ?? '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-900">
                                        {viewingSubscription.notes || 'No notes'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                                    {viewingSubscription.status === 'active' && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="inline-flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                                                onClick={() => {
                                                    closeViewDrawer();
                                                    openCancel(viewingSubscription);
                                                }}
                                            >
                                                <Ban className="h-4 w-4" />
                                                Cancel
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="inline-flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                onClick={() => {
                                                    closeViewDrawer();
                                                    openLock(viewingSubscription);
                                                }}
                                            >
                                                <Lock className="h-4 w-4" />
                                                Lock
                                            </Button>
                                        </>
                                    )}

                                    {viewingSubscription.status !== 'active' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="inline-flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => {
                                                closeViewDrawer();
                                                deleteSubscription(viewingSubscription);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}