import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CreditCard, Plus, Search, Trash2, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

type PlanOption = {
    id: number;
    product_id: number;
    product_name: string;
    plan_name: string;
    price: number;
    duration_days: number;
    label: string;
};

type UserOption = {
    id: number;
    name: string;
    email: string;
    label: string;
};

type OrderRow = {
    id: number;
    order_code: string;
    user_name: string | null;
    product_name: string | null;
    plan_name: string | null;
    amount: number;
    duration_days: number;
    status: 'pending' | 'paid' | 'verified' | 'failed' | 'cancelled';
    status_label: string;
    ordered_at: string | null;
    paid_at: string | null;
    verified_at: string | null;
    has_subscription: boolean;
    subscription_code: string | null;
    transaction: null | {
        id: number;
        transaction_code: string;
        payment_method: string | null;
        reference_number: string | null;
        amount: number;
        status: 'submitted' | 'verified' | 'rejected';
        paid_at: string | null;
        verified_at: string | null;
        notes: string | null;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type OrdersPagination = {
    data: OrderRow[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number | null;
    total: number;
};

type PageProps = {
    filters: {
        search: string;
    };
    orders: OrdersPagination;
    plans: PlanOption[];
    users: UserOption[];
    stats: {
        total_orders: number;
        pending_orders: number;
        for_verification_orders: number;
        verified_orders: number;
    };
    flash?: {
        success?: string;
    };
};

type CreateOrderForm = {
    user_id: number | '';
    plan_id: number | '';
    notes: string;
};

type PaymentForm = {
    payment_method: 'gcash' | 'maya' | 'bank_transfer' | 'cash' | 'other';
    reference_number: string;
    account_name: string;
    account_number: string;
    notes: string;
};

type RejectForm = {
    notes: string;
};

export default function OrdersIndex() {
    const { props } = usePage<PageProps>();
    const { orders, plans, users, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

    const createForm = useForm<CreateOrderForm>({
        user_id: '',
        plan_id: '',
        notes: '',
    });

    const paymentForm = useForm<PaymentForm>({
        payment_method: 'gcash',
        reference_number: '',
        account_name: '',
        account_number: '',
        notes: '',
    });

    const rejectForm = useForm<RejectForm>({
        notes: '',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('admin.orders.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setOpenCreateModal(true);
    };

    const closeCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setOpenCreateModal(false);
    };

    const openPayment = (order: OrderRow) => {
        setSelectedOrder(order);
        paymentForm.reset();
        paymentForm.clearErrors();
        paymentForm.setData({
            payment_method: 'gcash',
            reference_number: '',
            account_name: '',
            account_number: '',
            notes: '',
        });
        setOpenPaymentModal(true);
    };

    const closePayment = () => {
        setSelectedOrder(null);
        paymentForm.reset();
        paymentForm.clearErrors();
        setOpenPaymentModal(false);
    };

    const openReject = (order: OrderRow) => {
        setSelectedOrder(order);
        rejectForm.reset();
        rejectForm.clearErrors();
        setOpenRejectModal(true);
    };

    const closeReject = () => {
        setSelectedOrder(null);
        rejectForm.reset();
        rejectForm.clearErrors();
        setOpenRejectModal(false);
    };

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();

        createForm.post(route('admin.orders.store'), {
            preserveScroll: true,
            onSuccess: () => closeCreate(),
        });
    };

    const submitPayment: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedOrder) return;

        paymentForm.post(route('admin.orders.submit-payment', selectedOrder.id), {
            preserveScroll: true,
            onSuccess: () => closePayment(),
        });
    };

    const submitReject: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedOrder) return;

        rejectForm.post(route('admin.orders.reject', selectedOrder.id), {
            preserveScroll: true,
            onSuccess: () => closeReject(),
        });
    };

    const verifyOrder = (order: OrderRow) => {
        router.post(route('admin.orders.verify', order.id), {}, { preserveScroll: true });
    };

    const deleteOrder = (order: OrderRow) => {
        router.delete(route('admin.orders.destroy', order.id), { preserveScroll: true });
    };

    const resultsText = useMemo(() => {
        if (!orders.total) return 'No orders found.';
        return `Showing ${orders.from ?? 0} to ${orders.to ?? 0} of ${orders.total} orders`;
    }, [orders.from, orders.to, orders.total]);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value));

    const orderStatusClass = (status: OrderRow['status']) => {
        switch (status) {
            case 'verified':
                return 'border-green-200 bg-green-100 text-green-700';
            case 'paid':
                return 'border-yellow-200 bg-yellow-100 text-yellow-700';
            case 'failed':
                return 'border-red-200 bg-red-100 text-red-700';
            case 'cancelled':
                return 'border-slate-200 bg-slate-100 text-slate-700';
            default:
                return 'border-blue-200 bg-blue-100 text-blue-700';
        }
    };

    const txStatusClass = (status: 'submitted' | 'verified' | 'rejected') => {
        switch (status) {
            case 'verified':
                return 'border-green-200 bg-green-100 text-green-700';
            case 'rejected':
                return 'border-red-200 bg-red-100 text-red-700';
            default:
                return 'border-yellow-200 bg-yellow-100 text-yellow-700';
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: '/admin/orders',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage order records, payment references, and transaction verification.
                        </p>
                    </div>

                    <Button type="button" onClick={openCreate} className="rounded-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Order
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Orders</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">{stats.total_orders}</h3>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Pending</p>
                        <h3 className="mt-2 text-2xl font-bold text-blue-600">{stats.pending_orders}</h3>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">For Verification</p>
                        <h3 className="mt-2 text-2xl font-bold text-yellow-600">{stats.for_verification_orders}</h3>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Verified</p>
                        <h3 className="mt-2 text-2xl font-bold text-green-600">{stats.verified_orders}</h3>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Order List</h2>
                                <p className="mt-1 text-sm text-slate-500">{resultsText}</p>
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Label htmlFor="order-search" className="sr-only">
                                    Search orders
                                </Label>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="order-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search order, user, product, plan, ref..."
                                    className="rounded-md pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Order</th>
                                    <th className="px-4 py-3 text-left font-medium">User</th>
                                    <th className="px-4 py-3 text-left font-medium">Product / Plan</th>
                                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                                    <th className="px-4 py-3 text-left font-medium">Order Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Transaction</th>
                                    <th className="px-4 py-3 text-left font-medium">Subscription</th>
                                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-t border-slate-200 transition hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{order.order_code}</div>
                                                <div className="text-xs text-slate-500">{order.ordered_at ?? '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{order.user_name}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{order.product_name}</div>
                                                <div className="text-xs text-slate-500">{order.plan_name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                <div>{formatPrice(order.amount)}</div>
                                                <div className="text-xs text-slate-500">{order.duration_days} days</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${orderStatusClass(
                                                        order.status,
                                                    )}`}
                                                >
                                                    {order.status_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.transaction ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {order.transaction.payment_method?.toUpperCase()}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            Ref: {order.transaction.reference_number}
                                                        </div>
                                                        <div className="mt-1">
                                                            <span
                                                                className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${txStatusClass(
                                                                    order.transaction.status,
                                                                )}`}
                                                            >
                                                                {order.transaction.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">No payment yet</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.has_subscription ? (
                                                    <span className="inline-flex rounded-md border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                        {order.subscription_code ?? 'Created'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">Not created</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {order.status === 'pending' && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 rounded-md px-3"
                                                            title="Submit payment details"
                                                            onClick={() => openPayment(order)}
                                                        >
                                                            <CreditCard className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {order.status === 'paid' && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-9 rounded-md border-green-200 px-3 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                title="Verify order"
                                                                onClick={() => verifyOrder(order)}
                                                            >
                                                                <BadgeCheck className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-9 rounded-md border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                title="Reject order"
                                                                onClick={() => openReject(order)}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-9 rounded-md border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        title="Delete order"
                                                        onClick={() => deleteOrder(order)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {openCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Create Order</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Create an order by selecting a user and plan.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_user_id">User</Label>
                                    <select
                                        id="create_user_id"
                                        name="user_id"
                                        title="Select user"
                                        value={createForm.data.user_id}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'user_id',
                                                e.target.value === '' ? '' : Number(e.target.value),
                                            )
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                                    >
                                        <option value="">Select user</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={createForm.errors.user_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_plan_id">Plan</Label>
                                    <select
                                        id="create_plan_id"
                                        name="plan_id"
                                        title="Select plan"
                                        value={createForm.data.plan_id}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'plan_id',
                                                e.target.value === '' ? '' : Number(e.target.value),
                                            )
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                                    >
                                        <option value="">Select plan</option>
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.label} - {formatPrice(plan.price)}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={createForm.errors.plan_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_notes">Notes</Label>
                                    <textarea
                                        id="create_notes"
                                        value={createForm.data.notes}
                                        onChange={(e) => createForm.setData('notes', e.target.value)}
                                        className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        placeholder="Optional notes"
                                    />
                                    <InputError message={createForm.errors.notes} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <Button type="button" variant="outline" onClick={closeCreate}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? 'Creating...' : 'Create Order'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openPaymentModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Submit Payment</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Submit payment details for {selectedOrder.order_code}.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closePayment}
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitPayment} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <select
                                        id="payment_method"
                                        name="payment_method"
                                        title="Select payment method"
                                        value={paymentForm.data.payment_method}
                                        onChange={(e) =>
                                            paymentForm.setData(
                                                'payment_method',
                                                e.target.value as PaymentForm['payment_method'],
                                            )
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                                    >
                                        <option value="gcash">GCash</option>
                                        <option value="maya">Maya</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cash">Cash</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <InputError message={paymentForm.errors.payment_method} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        value={paymentForm.data.reference_number}
                                        onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                                        placeholder="Enter reference number"
                                    />
                                    <InputError message={paymentForm.errors.reference_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="account_name">Account Name</Label>
                                    <Input
                                        id="account_name"
                                        value={paymentForm.data.account_name}
                                        onChange={(e) => paymentForm.setData('account_name', e.target.value)}
                                        placeholder="Optional account name"
                                    />
                                    <InputError message={paymentForm.errors.account_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="account_number">Account Number</Label>
                                    <Input
                                        id="account_number"
                                        value={paymentForm.data.account_number}
                                        onChange={(e) => paymentForm.setData('account_number', e.target.value)}
                                        placeholder="Optional account number"
                                    />
                                    <InputError message={paymentForm.errors.account_number} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="payment_notes">Notes</Label>
                                    <textarea
                                        id="payment_notes"
                                        value={paymentForm.data.notes}
                                        onChange={(e) => paymentForm.setData('notes', e.target.value)}
                                        className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        placeholder="Optional payment notes"
                                    />
                                    <InputError message={paymentForm.errors.notes} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <Button type="button" variant="outline" onClick={closePayment}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={paymentForm.processing}>
                                    {paymentForm.processing ? 'Submitting...' : 'Submit Payment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openRejectModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-slate-900">Reject Order</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Add a note and reject this order.
                            </p>
                        </div>

                        <form onSubmit={submitReject} className="space-y-5 px-6 py-5">
                            <div className="grid gap-2">
                                <Label htmlFor="reject_notes">Reason / Notes</Label>
                                <textarea
                                    id="reject_notes"
                                    value={rejectForm.data.notes}
                                    onChange={(e) => rejectForm.setData('notes', e.target.value)}
                                    className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    placeholder="Why are you rejecting this order?"
                                />
                                <InputError message={rejectForm.errors.notes} />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <Button type="button" variant="outline" onClick={closeReject}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={rejectForm.processing}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    {rejectForm.processing ? 'Rejecting...' : 'Reject Order'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}