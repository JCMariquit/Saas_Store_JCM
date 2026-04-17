import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, CheckCircle, Trash2, Layers3, Clock3, ShieldCheck } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

type SubscriptionRow = {
    id: number;
    code: string;
    user: string;
    product: string;
    type: 'trial' | 'monthly' | 'yearly' | 'custom';
    status: 'pending' | 'active' | 'expired' | 'cancelled' | 'locked';
    start_date: string | null;
    end_date: string | null;
};

type SubscriptionPagination = {
    data: SubscriptionRow[];
    total?: number;
};

type SelectUser = {
    id: number;
    name: string;
};

type SelectProduct = {
    id: number;
    name: string;
};

type PageProps = {
    subscriptions: SubscriptionPagination;
    filters: {
        search: string;
    };
    users: SelectUser[];
    products: SelectProduct[];
    flash?: {
        success?: string;
    };
};

type SubscriptionForm = {
    user_id: number | '';
    product_id: number | '';
    subscription_type: 'trial' | 'monthly' | 'yearly' | 'custom';
    duration_days: number;
};

export default function SubscriptionsIndex() {
    const { props } = usePage<PageProps>();
    const { subscriptions, filters, users, products, flash } = props;

    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);

    const form = useForm<SubscriptionForm>({
        user_id: '',
        product_id: '',
        subscription_type: 'trial',
        duration_days: 7,
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

    const openCreateModal = () => {
        form.reset();
        form.setData({
            user_id: '',
            product_id: '',
            subscription_type: 'trial',
            duration_days: 7,
        });
        setOpen(true);
    };

    const closeCreateModal = () => {
        form.reset();
        setOpen(false);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        form.post(route('admin.subscriptions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    const totalSubscriptions = useMemo(
        () => subscriptions.total ?? subscriptions.data.length,
        [subscriptions],
    );

    const activeCount = useMemo(
        () => subscriptions.data.filter((s) => s.status === 'active').length,
        [subscriptions.data],
    );

    const pendingCount = useMemo(
        () => subscriptions.data.filter((s) => s.status === 'pending').length,
        [subscriptions.data],
    );

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

    const handleTypeChange = (value: SubscriptionForm['subscription_type']) => {
        let days = form.data.duration_days;

        if (value === 'trial') days = 7;
        if (value === 'monthly') days = 30;
        if (value === 'yearly') days = 365;

        form.setData({
            ...form.data,
            subscription_type: value,
            duration_days: days,
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
                            Manage subscription plans, durations, and manual verification.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="rounded-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Subscription
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Subscriptions</p>
                                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                    {totalSubscriptions}
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
                                    {activeCount}
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
                                    {pendingCount}
                                </h3>
                            </div>
                            <div className="rounded-md bg-yellow-50 p-3">
                                <Clock3 className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search user..."
                            className="rounded-md pl-9"
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">Subscription List</h2>
                        <p className="text-sm text-slate-500">
                            Showing {subscriptions.data.length} record
                            {subscriptions.data.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Code</th>
                                    <th className="px-4 py-3 text-left font-medium">User</th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Start</th>
                                    <th className="px-4 py-3 text-left font-medium">End</th>
                                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {subscriptions.data.map((sub) => (
                                    <tr
                                        key={sub.id}
                                        className="border-t border-slate-200 transition hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {sub.code}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{sub.user}</td>
                                        <td className="px-4 py-3 text-slate-700">{sub.product}</td>
                                        <td className="px-4 py-3 capitalize text-slate-700">
                                            {sub.type}
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
                                            {sub.start_date ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            {sub.end_date ?? '-'}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {sub.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        className="rounded-md"
                                                        onClick={() =>
                                                            router.post(
                                                                route(
                                                                    'admin.subscriptions.verify',
                                                                    sub.id,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <CheckCircle className="mr-1 h-4 w-4" />
                                                        Verify
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="rounded-md"
                                                    onClick={() =>
                                                        router.delete(
                                                            route(
                                                                'admin.subscriptions.destroy',
                                                                sub.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {subscriptions.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
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

                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Create Subscription
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add a new subscription record for a user.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="user_id">User</Label>
                                    <select
                                        id="user_id"
                                        className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500"
                                        value={form.data.user_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'user_id',
                                                e.target.value ? Number(e.target.value) : '',
                                            )
                                        }
                                    >
                                        <option value="">Select user</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="product_id">Product</Label>
                                    <select
                                        id="product_id"
                                        className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500"
                                        value={form.data.product_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'product_id',
                                                e.target.value ? Number(e.target.value) : '',
                                            )
                                        }
                                    >
                                        <option value="">Select product</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="subscription_type">Type</Label>
                                    <select
                                        id="subscription_type"
                                        className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500"
                                        value={form.data.subscription_type}
                                        onChange={(e) =>
                                            handleTypeChange(
                                                e.target.value as SubscriptionForm['subscription_type'],
                                            )
                                        }
                                    >
                                        <option value="trial">Trial</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="duration_days">Duration (days)</Label>
                                    <Input
                                        id="duration_days"
                                        type="number"
                                        min={1}
                                        value={form.data.duration_days}
                                        onChange={(e) =>
                                            form.setData(
                                                'duration_days',
                                                Number(e.target.value || 0),
                                            )
                                        }
                                        className="mt-1 rounded-md"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeCreateModal}
                                    >
                                        Cancel
                                    </Button>

                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}