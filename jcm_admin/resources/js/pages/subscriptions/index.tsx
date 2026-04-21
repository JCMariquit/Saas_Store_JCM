import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Trash2,
    Layers3,
    Clock3,
    ShieldCheck,
    Ban,
    Lock,
    AlertTriangle,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/jcm-ui/page-hero';
import { StatsCard } from '@/components/jcm-ui/stats-card';
import { SectionCard } from '@/components/jcm-ui/section-card';
import { SearchInput } from '@/components/jcm-ui/search-input';
import { DataTable } from '@/components/jcm-ui/data-table';
import { FormModal } from '@/components/jcm-ui/form-modal';

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

const subscriptionTableColumns = [
    { key: 'subscription', label: 'Subscription' },
    { key: 'user', label: 'User' },
    { key: 'product_plan', label: 'Product / Plan' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'end_date', label: 'End Date' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

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

    const resetSearch = () => {
        setSearch('');
        router.get(
            route('admin.subscriptions.index'),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

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
                return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'pending':
                return 'border-amber-200 bg-amber-50 text-amber-700';
            case 'expired':
                return 'border-red-200 bg-red-50 text-red-700';
            case 'cancelled':
                return 'border-slate-200 bg-slate-100 text-slate-700';
            case 'locked':
                return 'border-orange-200 bg-orange-50 text-orange-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
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

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Subscriptions"
                        description="View active subscriptions generated from verified orders."
                    />

                    <div className="grid gap-4 md:grid-cols-4">
                        <StatsCard
                            title="Total Subscriptions"
                            value={stats.total_subscriptions}
                            description="All subscriptions recorded."
                            icon={<Layers3 className="h-5 w-5" />}
                            tone="blue"
                        />

                        <StatsCard
                            title="Active"
                            value={stats.active_subscriptions}
                            description=" Currently active subscriptions."
                            icon={<ShieldCheck className="h-5 w-5" />}
                            tone="emerald"
                        />

                        <StatsCard
                            title="Pending"
                            value={stats.pending_subscriptions}
                            description="Processing subscriptions."
                            icon={<Clock3 className="h-5 w-5" />}
                            tone="amber"
                        />

                        <StatsCard
                            title="Expired"
                            value={stats.expired_subscriptions}
                            description="Expired subscriptions."
                            icon={<AlertTriangle className="h-5 w-5" />}
                            tone="rose"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard
                        title="Subscription List"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput
                                    id="subscription-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search code, order, user, product, plan..."
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetSearch}
                                    className="h-11 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    Reset Search
                                </Button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={subscriptionTableColumns}
                            empty={subscriptions.data.length === 0}
                            emptyMessage="No subscriptions found."
                            colSpan={7}
                            striped
                            hoverable
                        >
                            {subscriptions.data.map((sub) => (
                                <tr
                                    key={sub.id}
                                    className="cursor-pointer"
                                    onClick={() => openViewDrawer(sub)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-900">
                                            {sub.subscription_code}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Order: {sub.order_code ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {sub.user_name ?? '-'}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-900">
                                            {sub.product_name ?? '-'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {sub.plan_name ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 capitalize text-slate-700">
                                        {sub.subscription_type}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
                                                sub.status,
                                            )}`}
                                        >
                                            {sub.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {sub.end_date ?? '-'}
                                    </td>

                                    <td
                                        className="px-4 py-4 text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {sub.status === 'active' && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-slate-300 px-3 text-slate-700 hover:bg-slate-50"
                                                        title="Cancel subscription"
                                                        onClick={() => openCancel(sub)}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-orange-200 px-3 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
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
                                                    className="h-10 rounded-xl border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    title="Delete subscription"
                                                    onClick={() => deleteSubscription(sub)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    </SectionCard>
                </div>
            </div>

            <FormModal
                open={openCancelModal && !!selectedSubscription}
                title="Cancel Subscription"
                description="Add a note and cancel this subscription."
                onClose={closeCancel}
                tone="red"
                maxWidthClass="max-w-md"
            >
                <form onSubmit={submitCancel} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="cancel_notes">Reason / Notes</Label>
                        <textarea
                            id="cancel_notes"
                            value={actionForm.data.notes}
                            onChange={(e) => actionForm.setData('notes', e.target.value)}
                            className="min-h-[100px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Why are you cancelling this subscription?"
                        />
                        <InputError message={actionForm.errors.notes} />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="outline" onClick={closeCancel} className="rounded-xl">
                            Close
                        </Button>
                        <Button
                            type="submit"
                            disabled={actionForm.processing}
                            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                        >
                            {actionForm.processing ? 'Cancelling...' : 'Cancel Subscription'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={openLockModal && !!selectedSubscription}
                title="Lock Subscription"
                description="Add a note and lock this subscription."
                onClose={closeLock}
                tone="red"
                maxWidthClass="max-w-md"
            >
                <form onSubmit={submitLock} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="lock_notes">Reason / Notes</Label>
                        <textarea
                            id="lock_notes"
                            value={actionForm.data.notes}
                            onChange={(e) => actionForm.setData('notes', e.target.value)}
                            className="min-h-[100px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Why are you locking this subscription?"
                        />
                        <InputError message={actionForm.errors.notes} />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="outline" onClick={closeLock} className="rounded-xl">
                            Close
                        </Button>
                        <Button
                            type="submit"
                            disabled={actionForm.processing}
                            className="rounded-xl bg-orange-600 text-white hover:bg-orange-700"
                        >
                            {actionForm.processing ? 'Locking...' : 'Lock Subscription'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            {viewingSubscription && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute right-0 top-0 flex h-screen w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
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
                                            className="inline-flex items-center gap-2 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
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
                                            className="inline-flex items-center gap-2 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
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
                                        className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
        </AppLayout>
    );
}