import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import {
    BadgeCheck,
    CreditCard,
    Plus,
    Trash2,
    XCircle,
    ShoppingCart,
    Clock3,
    ShieldCheck,
} from 'lucide-react';

import AppLayout from '@/layouts/admin-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/admin-ui/page-hero';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { SectionCard } from '@/components/admin-ui/section-card';
import { SearchInput } from '@/components/admin-ui/search-input';
import { DataTable } from '@/components/admin-ui/data-table';
import { FormModal } from '@/components/admin-ui/form-modal';
import { ConfirmModal } from '@/components/admin-ui/confirm-modal';

type BillingType = 'trial' | 'monthly' | 'yearly' | 'custom';

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
    billing_type: BillingType;
    amount: number;
    duration_days: number;
    status: 'pending' | 'paid' | 'verified' | 'failed' | 'cancelled';
    status_label: string;
    ordered_at: string | null;
    paid_at: string | null;
    verified_at: string | null;
    has_subscription: boolean;
    subscription_code: string | null;
    has_transaction: boolean;
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
    billing_type: BillingType;
    duration_days_override: number | '';
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

const orderTableColumns = [
    { key: 'order', label: 'Order' },
    { key: 'user', label: 'User' },
    { key: 'product_plan', label: 'Product / Plan' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'payment', label: 'Payment' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

export default function OrdersIndex() {
    const { props } = usePage<PageProps>();
    const { orders, plans, users, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
    const [viewingOrder, setViewingOrder] = useState<OrderRow | null>(null);

    const createForm = useForm<CreateOrderForm>({
        user_id: '',
        plan_id: '',
        billing_type: 'monthly',
        duration_days_override: '',
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
        createForm.setData({
            user_id: '',
            plan_id: '',
            billing_type: 'monthly',
            duration_days_override: '',
            notes: '',
        });
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

    const openDelete = (order: OrderRow) => {
        setSelectedOrder(order);
        setOpenDeleteModal(true);
    };

    const closeDelete = () => {
        setSelectedOrder(null);
        setOpenDeleteModal(false);
    };

    const openViewDrawer = (order: OrderRow) => {
        setViewingOrder(order);
    };

    const closeViewDrawer = () => {
        setViewingOrder(null);
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

    const confirmDelete = () => {
        if (!selectedOrder) return;

        router.delete(route('admin.orders.destroy', selectedOrder.id), {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
        });
    };

    const resetSearch = () => {
        setSearch('');
        router.get(
            route('admin.orders.index'),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
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

    const selectedPlan =
        createForm.data.plan_id === ''
            ? null
            : plans.find((plan) => plan.id === createForm.data.plan_id) ?? null;

    const selectedUser =
        createForm.data.user_id === ''
            ? null
            : users.find((user) => user.id === createForm.data.user_id) ?? null;

    const computedAmount = useMemo(() => {
        if (!selectedPlan) return 0;

        switch (createForm.data.billing_type) {
            case 'trial':
                return 0;
            case 'monthly':
                return Number(selectedPlan.price);
            case 'yearly':
                return Number(selectedPlan.price) * 12;
            case 'custom':
                return Number(selectedPlan.price);
            default:
                return Number(selectedPlan.price);
        }
    }, [selectedPlan, createForm.data.billing_type]);

    const computedDuration = useMemo(() => {
        switch (createForm.data.billing_type) {
            case 'trial':
                return createForm.data.duration_days_override === '' ? 7 : Number(createForm.data.duration_days_override);
            case 'monthly':
                return 30;
            case 'yearly':
                return 365;
            case 'custom':
                return createForm.data.duration_days_override === '' ? 30 : Number(createForm.data.duration_days_override);
            default:
                return 0;
        }
    }, [createForm.data.billing_type, createForm.data.duration_days_override]);

    const billingLabel = (type: BillingType) => {
        switch (type) {
            case 'trial':
                return 'Trial';
            case 'monthly':
                return 'Monthly';
            case 'yearly':
                return 'Yearly';
            default:
                return 'Custom';
        }
    };

    const handleBillingTypeChange = (value: BillingType) => {
        if (value === 'trial') {
            createForm.setData({
                ...createForm.data,
                billing_type: value,
                duration_days_override: 7,
            });
            return;
        }

        if (value === 'custom') {
            createForm.setData({
                ...createForm.data,
                billing_type: value,
                duration_days_override: 30,
            });
            return;
        }

        createForm.setData({
            ...createForm.data,
            billing_type: value,
            duration_days_override: '',
        });
    };

    const orderStatusClass = (status: OrderRow['status']) => {
        switch (status) {
            case 'verified':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'paid':
                return 'border-amber-200 bg-amber-50 text-amber-700';
            case 'failed':
                return 'border-red-200 bg-red-50 text-red-700';
            case 'cancelled':
                return 'border-slate-200 bg-slate-100 text-slate-700';
            default:
                return 'border-blue-200 bg-blue-50 text-blue-700';
        }
    };

    const txStatusClass = (status: 'submitted' | 'verified' | 'rejected') => {
        switch (status) {
            case 'verified':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'rejected':
                return 'border-red-200 bg-red-50 text-red-700';
            default:
                return 'border-amber-200 bg-amber-50 text-amber-700';
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

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Orders"
                        description="Manage order records, payment references, and transaction verification."
                        actionLabel="Create Order"
                        actionIcon={<Plus className="h-4 w-4" />}
                        onAction={openCreate}
                    />

                    <div className="grid gap-4 md:grid-cols-4">
                        <StatsCard
                            title="Total Orders"
                            value={stats.total_orders}
                            description="All orders recorded in the system."
                            icon={<ShoppingCart className="h-5 w-5" />}
                            tone="blue"
                        />

                        <StatsCard
                            title="Pending"
                            value={stats.pending_orders}
                            description="Pending payments."
                            icon={<Clock3 className="h-5 w-5" />}
                            tone="indigo"
                        />

                        <StatsCard
                            title="For Verification"
                            value={stats.for_verification_orders}
                            description="To review payments."
                            icon={<CreditCard className="h-5 w-5" />}
                            tone="amber"
                        />

                        <StatsCard
                            title="Verified"
                            value={stats.verified_orders}
                            description="Approved orders."
                            icon={<ShieldCheck className="h-5 w-5" />}
                            tone="emerald"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard
                        title="Order List"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput
                                    id="order-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search order, user, product, plan, ref..."
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
                            columns={orderTableColumns}
                            empty={orders.data.length === 0}
                            emptyMessage="No orders found."
                            colSpan={7}
                            striped
                            hoverable
                        >
                            {orders.data.map((order) => (
                                <tr
                                    key={order.id}
                                    className="cursor-pointer"
                                    onClick={() => openViewDrawer(order)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-900">{order.order_code}</div>
                                        <div className="text-xs text-slate-500">{order.ordered_at ?? '-'}</div>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {order.user_name || '-'}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-900">{order.product_name || '-'}</div>
                                        <div className="text-xs text-slate-500">{order.plan_name || '-'}</div>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        <div>{formatPrice(order.amount)}</div>
                                        <div className="text-xs text-slate-500">{billingLabel(order.billing_type)}</div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${orderStatusClass(
                                                order.status,
                                            )}`}
                                        >
                                            {order.status_label}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        {order.transaction ? (
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${txStatusClass(
                                                    order.transaction.status,
                                                )}`}
                                            >
                                                {order.transaction.status}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">No payment</span>
                                        )}
                                    </td>

                                    <td
                                        className="px-4 py-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {order.status === 'pending' && !order.has_transaction && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 rounded-xl border-blue-200 bg-white px-3 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                                    title="Submit payment details"
                                                    onClick={() => openPayment(order)}
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {order.status === 'pending' && order.has_transaction && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-emerald-200 bg-white px-3 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                        title="Accept order"
                                                        onClick={() => verifyOrder(order)}
                                                    >
                                                        <BadgeCheck className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-red-200 bg-white px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        title="Deny order"
                                                        onClick={() => openReject(order)}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {order.status === 'paid' && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-emerald-200 bg-white px-3 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                        title="Verify order"
                                                        onClick={() => verifyOrder(order)}
                                                    >
                                                        <BadgeCheck className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-red-200 bg-white px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
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
                                                className="h-10 rounded-xl border-red-200 bg-white px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                title="Delete order"
                                                onClick={() => openDelete(order)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    </SectionCard>
                </div>
            </div>

            <FormModal
                open={openCreateModal}
                title="Create Order"
                description="Select the user, plan, and billing type. Subscription starts after verification."
                onClose={closeCreate}
                tone="blue"
                maxWidthClass="max-w-4xl"
            >
                <form onSubmit={submitCreate} className="space-y-5">
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_.9fr]">
                        <div className="space-y-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
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
                                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
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

                                <div className="grid gap-2 md:col-span-2">
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
                                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
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
                                    <Label htmlFor="billing_type">Billing Type</Label>
                                    <select
                                        id="billing_type"
                                        name="billing_type"
                                        title="Select billing type"
                                        value={createForm.data.billing_type}
                                        onChange={(e) => handleBillingTypeChange(e.target.value as BillingType)}
                                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                                    >
                                        <option value="trial">Trial</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    <InputError message={createForm.errors.billing_type} />
                                </div>

                                {(createForm.data.billing_type === 'trial' ||
                                    createForm.data.billing_type === 'custom') && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration_days_override">
                                            {createForm.data.billing_type === 'trial'
                                                ? 'Trial Duration (days)'
                                                : 'Custom Duration (days)'}
                                        </Label>
                                        <Input
                                            id="duration_days_override"
                                            type="number"
                                            min={1}
                                            value={createForm.data.duration_days_override}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'duration_days_override',
                                                    e.target.value === '' ? '' : Number(e.target.value),
                                                )
                                            }
                                            placeholder="Enter number of days"
                                            className="rounded-xl"
                                        />
                                        <InputError message={createForm.errors.duration_days_override} />
                                    </div>
                                )}

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="create_notes">Notes</Label>
                                    <textarea
                                        id="create_notes"
                                        value={createForm.data.notes}
                                        onChange={(e) => createForm.setData('notes', e.target.value)}
                                        className="min-h-[110px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                        placeholder="Optional notes"
                                    />
                                    <InputError message={createForm.errors.notes} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
                            <h3 className="text-base font-semibold text-slate-900">Order Summary</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Primary order information before saving.
                            </p>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">User</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {selectedUser ? selectedUser.name : 'No user selected'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {selectedUser ? selectedUser.email : '-'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Product / Plan</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {selectedPlan ? selectedPlan.product_name : 'No product selected'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {selectedPlan ? selectedPlan.plan_name : '-'}
                                    </p>
                                </div>

                                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">Billing Type</span>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {billingLabel(createForm.data.billing_type)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">Duration</span>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {computedDuration} day{computedDuration !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">Amount</span>
                                        <span className="text-base font-bold text-slate-900">
                                            {formatPrice(computedAmount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                                        Subscription Note
                                    </p>
                                    <p className="mt-1 text-sm text-blue-800">
                                        Subscription starts only after order verification.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="outline" onClick={closeCreate} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createForm.processing}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        >
                            {createForm.processing ? 'Creating...' : 'Create Order'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={openPaymentModal && !!selectedOrder}
                title="Submit Payment"
                description={`Submit payment details for ${selectedOrder?.order_code ?? ''}.`}
                onClose={closePayment}
                tone="blue"
            >
                <form onSubmit={submitPayment} className="space-y-5">
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
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
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
                                className="rounded-xl"
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
                                className="rounded-xl"
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
                                className="rounded-xl"
                            />
                            <InputError message={paymentForm.errors.account_number} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="payment_notes">Notes</Label>
                            <textarea
                                id="payment_notes"
                                value={paymentForm.data.notes}
                                onChange={(e) => paymentForm.setData('notes', e.target.value)}
                                className="min-h-[100px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Optional payment notes"
                            />
                            <InputError message={paymentForm.errors.notes} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="outline" onClick={closePayment} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={paymentForm.processing}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        >
                            {paymentForm.processing ? 'Submitting...' : 'Submit Payment'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={openRejectModal && !!selectedOrder}
                title="Reject Order"
                description="Add a note and reject this order."
                onClose={closeReject}
                tone="red"
                maxWidthClass="max-w-md"
            >
                <form onSubmit={submitReject} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="reject_notes">Reason / Notes</Label>
                        <textarea
                            id="reject_notes"
                            value={rejectForm.data.notes}
                            onChange={(e) => rejectForm.setData('notes', e.target.value)}
                            className="min-h-[100px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Why are you rejecting this order?"
                        />
                        <InputError message={rejectForm.errors.notes} />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="outline" onClick={closeReject} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={rejectForm.processing}
                            className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                        >
                            {rejectForm.processing ? 'Rejecting...' : 'Reject Order'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmModal
                open={openDeleteModal && !!selectedOrder}
                title="Delete Order"
                description="This action will permanently remove the selected order."
                message={`Are you sure you want to delete ${selectedOrder?.order_code ?? ''}?`}
                confirmLabel="Delete Order"
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />

            {viewingOrder && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute right-0 top-0 flex h-screen w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
                                <p className="text-sm text-slate-500">View full order information</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewDrawer}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Code</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{viewingOrder.order_code}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">User</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{viewingOrder.user_name || '-'}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Product</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{viewingOrder.product_name || '-'}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{viewingOrder.plan_name || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Billing Type</p>
                                    <p className="mt-1 text-sm text-slate-900">{billingLabel(viewingOrder.billing_type)}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</p>
                                    <p className="mt-1 text-sm text-slate-900">{formatPrice(viewingOrder.amount)}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingOrder.duration_days} days</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Status</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingOrder.status_label}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ordered At</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingOrder.ordered_at || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Paid At</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingOrder.paid_at || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Verified At</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingOrder.verified_at || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subscription</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {viewingOrder.has_subscription
                                            ? viewingOrder.subscription_code ?? 'Created'
                                            : 'Not created'}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Transaction</p>

                                {viewingOrder.transaction ? (
                                    <div className="mt-3 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">Transaction Code</p>
                                                <p className="mt-1 text-sm font-medium text-slate-900">
                                                    {viewingOrder.transaction.transaction_code}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">Status</p>
                                                <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                                                    {viewingOrder.transaction.status}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">Payment Method</p>
                                                <p className="mt-1 text-sm font-medium text-slate-900">
                                                    {viewingOrder.transaction.payment_method?.toUpperCase() || '-'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">Reference Number</p>
                                                <p className="mt-1 text-sm font-medium text-slate-900">
                                                    {viewingOrder.transaction.reference_number || '-'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">Amount</p>
                                                <p className="mt-1 text-sm font-medium text-slate-900">
                                                    {formatPrice(viewingOrder.transaction.amount)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">Verified At</p>
                                                <p className="mt-1 text-sm font-medium text-slate-900">
                                                    {viewingOrder.transaction.verified_at || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">Notes</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-900">
                                                {viewingOrder.transaction.notes || 'No notes'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-slate-500">No payment transaction yet.</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                                {viewingOrder.status === 'pending' && !viewingOrder.has_transaction && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="inline-flex items-center gap-2 rounded-xl"
                                        onClick={() => {
                                            closeViewDrawer();
                                            openPayment(viewingOrder);
                                        }}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Submit Payment
                                    </Button>
                                )}

                                {viewingOrder.status === 'pending' && viewingOrder.has_transaction && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="inline-flex items-center gap-2 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                            onClick={() => {
                                                closeViewDrawer();
                                                verifyOrder(viewingOrder);
                                            }}
                                        >
                                            <BadgeCheck className="h-4 w-4" />
                                            Accept
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => {
                                                closeViewDrawer();
                                                openReject(viewingOrder);
                                            }}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Deny
                                        </Button>
                                    </>
                                )}

                                {viewingOrder.status === 'paid' && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="inline-flex items-center gap-2 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                            onClick={() => {
                                                closeViewDrawer();
                                                verifyOrder(viewingOrder);
                                            }}
                                        >
                                            <BadgeCheck className="h-4 w-4" />
                                            Verify
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => {
                                                closeViewDrawer();
                                                openReject(viewingOrder);
                                            }}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                        </Button>
                                    </>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openDelete(viewingOrder);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}