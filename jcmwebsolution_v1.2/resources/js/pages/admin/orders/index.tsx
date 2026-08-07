import { Head, router, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Clock3, CreditCard, Plus, ShieldAlert, ShieldCheck, ShoppingCart, Trash2, XCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

import { ConfirmModal } from '@/components/admin-ui/confirm-modal';
import { DataTable } from '@/components/admin-ui/data-table';
import { FormModal } from '@/components/admin-ui/form-modal';
import { SearchInput } from '@/components/admin-ui/search-input';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';

type BillingType = 'trial' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

type PlanOption = {
    id: number;
    product_id: number;
    product_name: string;
    plan_name: string;
    price: number;
    duration_days: number;
    label: string;
};

type PaymentMethodOption = {
    id: number;
    name: string;
    slug: string;
    account_name: string | null;
    account_number: string | null;
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
    status: 'pending' | 'payment_submitted' | 'paid' | 'verified' | 'failed' | 'cancelled';
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
        status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'failed' | 'refunded';
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
    paymentMethods: PaymentMethodOption[];
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
    payment_method_id: number | '';
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
    const { orders, plans, users, paymentMethods, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [openVerifyModal, setOpenVerifyModal] = useState(false);
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
        payment_method_id: paymentMethods[0]?.id ?? '',
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
            payment_method_id: paymentMethods[0]?.id ?? '',
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

    const needsManualVerification = (order: OrderRow) => {
        if (!order.transaction) return false;

        const orderWaitingForReview =
            order.status === 'pending' ||
            order.status === 'payment_submitted' ||
            order.status === 'paid';

        const transactionWaitingForReview =
            order.transaction.status === 'pending' ||
            order.transaction.status === 'submitted';

        return orderWaitingForReview && transactionWaitingForReview;
    };

    const paymentAmountMatches = (order: OrderRow) => {
        if (!order.transaction) return false;

        return Math.abs(Number(order.transaction.amount) - Number(order.amount)) < 0.01;
    };

    const openVerify = (order: OrderRow) => {
        setSelectedOrder(order);
        setOpenVerifyModal(true);
    };

    const closeVerify = () => {
        setSelectedOrder(null);
        setOpenVerifyModal(false);
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

    const confirmVerify = () => {
        if (!selectedOrder) return;

        router.post(route('admin.orders.verify', selectedOrder.id), {}, {
            preserveScroll: true,
            onSuccess: () => closeVerify(),
        });
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

    const selectedPlan = createForm.data.plan_id === '' ? null : (plans.find((plan) => plan.id === createForm.data.plan_id) ?? null);

    const selectedUser = createForm.data.user_id === '' ? null : (users.find((user) => user.id === createForm.data.user_id) ?? null);

    const computedAmount = useMemo(() => {
        if (!selectedPlan) return 0;

        switch (createForm.data.billing_type) {
            case 'trial':
                return 0;
            case 'monthly':
                return Number(selectedPlan.price);
            case 'quarterly':
                return Number(selectedPlan.price) * 3;
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
            case 'quarterly':
                return 90;
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
            case 'quarterly':
                return 'Quarterly';
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
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
            case 'payment_submitted':
            case 'paid':
                return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
            case 'failed':
                return 'border-red-500/20 bg-red-500/10 text-red-300';
            case 'cancelled':
                return 'border-border bg-muted text-foreground';
            default:
                return 'border-primary/20 bg-primary/[0.06] text-primary';
        }
    };

    const txStatusClass = (status: NonNullable<OrderRow['transaction']>['status']) => {
        switch (status) {
            case 'verified':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
            case 'rejected':
                return 'border-red-500/20 bg-red-500/10 text-red-300';
            default:
                return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
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

            <div className="bg-background min-h-screen p-4 md:p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold tracking-tight">Orders</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage orders and manually verify submitted payments before subscription activation.
                        </p>
                    </div>

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
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 shadow-sm">
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
                                    className="border-border bg-card text-foreground hover:border-primary/20 hover:bg-primary/[0.06] hover:text-primary h-11 rounded-xl px-4"
                                >
                                    Reset Search
                                </Button>


                                <Button
                                    type="button"
                                    onClick={openCreate}
                                    className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-11 rounded-xl bg-gradient-to-r px-4 text-white"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Order
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
                                <tr key={order.id} className="cursor-pointer" onClick={() => openViewDrawer(order)}>
                                    <td className="px-4 py-4">
                                        <div className="text-foreground font-medium">{order.order_code}</div>
                                        <div className="text-muted-foreground text-xs">{order.ordered_at ?? '-'}</div>
                                    </td>

                                    <td className="text-foreground px-4 py-4">{order.user_name || '-'}</td>

                                    <td className="px-4 py-4">
                                        <div className="text-foreground font-medium">{order.product_name || '-'}</div>
                                        <div className="text-muted-foreground text-xs">{order.plan_name || '-'}</div>
                                    </td>

                                    <td className="text-foreground px-4 py-4">
                                        <div>{formatPrice(order.amount)}</div>
                                        <div className="text-muted-foreground text-xs">{billingLabel(order.billing_type)}</div>
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
                                            <span className="text-muted-foreground">No payment</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            {order.status === 'pending' && !order.has_transaction && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="border-primary/20 bg-card text-primary hover:bg-primary/[0.06] hover:text-primary h-10 rounded-xl px-3"
                                                    title="Submit payment details"
                                                    onClick={() => openPayment(order)}
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {needsManualVerification(order) && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="bg-card h-10 rounded-xl border-emerald-500/20 px-3 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-300"
                                                        title="Approve payment"
                                                        onClick={() => openVerify(order)}
                                                    >
                                                        <BadgeCheck className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="bg-card h-10 rounded-xl border-red-500/20 px-3 text-red-600 hover:bg-red-500/10 hover:text-red-300"
                                                        title="Reject payment"
                                                        onClick={() => openReject(order)}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="bg-card h-10 rounded-xl border-red-500/20 px-3 text-red-600 hover:bg-red-500/10 hover:text-red-300"
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
                                        onChange={(e) => createForm.setData('user_id', e.target.value === '' ? '' : Number(e.target.value))}
                                        className="border-border bg-card h-11 rounded-xl border px-3 text-sm"
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
                                        onChange={(e) => createForm.setData('plan_id', e.target.value === '' ? '' : Number(e.target.value))}
                                        className="border-border bg-card h-11 rounded-xl border px-3 text-sm"
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
                                        className="border-border bg-card h-11 rounded-xl border px-3 text-sm"
                                    >
                                        <option value="trial">Trial</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    <InputError message={createForm.errors.billing_type} />
                                </div>

                                {(createForm.data.billing_type === 'trial' || createForm.data.billing_type === 'custom') && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration_days_override">
                                            {createForm.data.billing_type === 'trial' ? 'Trial Duration (days)' : 'Custom Duration (days)'}
                                        </Label>
                                        <Input
                                            id="duration_days_override"
                                            type="number"
                                            min={1}
                                            value={createForm.data.duration_days_override}
                                            onChange={(e) =>
                                                createForm.setData('duration_days_override', e.target.value === '' ? '' : Number(e.target.value))
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
                                        className="border-border min-h-[110px] rounded-xl border px-3 py-2 text-sm"
                                        placeholder="Optional notes"
                                    />
                                    <InputError message={createForm.errors.notes} />
                                </div>
                            </div>
                        </div>

                        <div className="border-primary/20 bg-primary/[0.035] rounded-2xl border p-5">
                            <h3 className="text-foreground text-base font-semibold">Order Summary</h3>
                            <p className="text-muted-foreground mt-1 text-sm">Primary order information before saving.</p>

                            <div className="mt-5 space-y-4">
                                <div className="border-border bg-card rounded-xl border p-4">
                                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">User</p>
                                    <p className="text-foreground mt-1 text-sm font-medium">
                                        {selectedUser ? selectedUser.name : 'No user selected'}
                                    </p>
                                    <p className="text-muted-foreground text-xs">{selectedUser ? selectedUser.email : '-'}</p>
                                </div>

                                <div className="border-border bg-card rounded-xl border p-4">
                                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Product / Plan</p>
                                    <p className="text-foreground mt-1 text-sm font-medium">
                                        {selectedPlan ? selectedPlan.product_name : 'No product selected'}
                                    </p>
                                    <p className="text-muted-foreground text-xs">{selectedPlan ? selectedPlan.plan_name : '-'}</p>
                                </div>

                                <div className="border-border bg-card space-y-3 rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-muted-foreground text-sm">Billing Type</span>
                                        <span className="text-foreground text-sm font-semibold">{billingLabel(createForm.data.billing_type)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-muted-foreground text-sm">Duration</span>
                                        <span className="text-foreground text-sm font-semibold">
                                            {computedDuration} day{computedDuration !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-muted-foreground text-sm">Amount</span>
                                        <span className="text-foreground text-base font-bold">{formatPrice(computedAmount)}</span>
                                    </div>
                                </div>

                                <div className="border-primary/20 bg-primary/[0.06] rounded-xl border p-4">
                                    <p className="text-primary text-xs font-medium tracking-wide uppercase">Subscription Note</p>
                                    <p className="text-primary mt-1 text-sm">Subscription starts only after order verification.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closeCreate} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createForm.processing}
                            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl bg-gradient-to-r text-white"
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
                            <Label htmlFor="payment_method_id">Payment Method</Label>
                            <select
                                id="payment_method_id"
                                name="payment_method_id"
                                title="Select payment method"
                                value={paymentForm.data.payment_method_id}
                                onChange={(e) => paymentForm.setData('payment_method_id', e.target.value === '' ? '' : Number(e.target.value))}
                                className="border-border bg-card text-foreground h-11 rounded-xl border px-3 text-sm"
                            >
                                <option value="">Select payment method</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={paymentForm.errors.payment_method_id} />
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
                                className="border-border min-h-[100px] rounded-xl border px-3 py-2 text-sm"
                                placeholder="Optional payment notes"
                            />
                            <InputError message={paymentForm.errors.notes} />
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closePayment} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={paymentForm.processing}
                            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl bg-gradient-to-r text-white"
                        >
                            {paymentForm.processing ? 'Submitting...' : 'Submit Payment'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmModal
                open={openVerifyModal && !!selectedOrder}
                title="Approve Payment"
                description="Manual payment verification"
                message={
                    selectedOrder?.transaction
                        ? `Confirm that you checked ${selectedOrder.transaction.payment_method?.toUpperCase() || 'the payment channel'}, reference ${selectedOrder.transaction.reference_number || '-'}, and the exact amount of ${formatPrice(selectedOrder.transaction.amount)} before approving.`
                        : 'Confirm that you manually verified this payment before approving.'
                }
                confirmLabel="Approve Payment"
                onClose={closeVerify}
                onConfirm={confirmVerify}
            />

            <FormModal
                open={openRejectModal && !!selectedOrder}
                title="Reject Payment"
                description="A clear rejection reason is required and will be sent to the subscriber."
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
                            className="border-border min-h-[100px] rounded-xl border px-3 py-2 text-sm"
                            placeholder="Why are you rejecting this payment/order?"
                            required
                            minLength={5}
                            maxLength={2000}
                        />
                        <InputError message={rejectForm.errors.notes} />
                    </div>

                    <div className="border-border flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closeReject} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={rejectForm.processing} className="rounded-xl bg-red-600 text-white hover:bg-red-700">
                            {rejectForm.processing ? 'Rejecting...' : 'Reject Payment'}
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
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={closeViewDrawer} />

                    <div className="border-border bg-card absolute top-0 right-0 flex h-screen w-full max-w-md flex-col border-l shadow-2xl">
                        <div className="border-border from-primary/[0.06] to-card flex items-center justify-between border-b bg-gradient-to-r px-6 py-4">
                            <div>
                                <h2 className="text-foreground text-lg font-bold">Order Details</h2>
                                <p className="text-muted-foreground text-sm">View full order information</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewDrawer}
                                className="border-border text-muted-foreground hover:bg-muted rounded-xl border px-3 py-2 text-sm"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-6">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Order Code</p>
                                <p className="text-foreground mt-1 text-sm font-medium">{viewingOrder.order_code}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">User</p>
                                <p className="text-foreground mt-1 text-sm font-medium">{viewingOrder.user_name || '-'}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Product</p>
                                <p className="text-foreground mt-1 text-sm font-medium">{viewingOrder.product_name || '-'}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Plan</p>
                                <p className="text-foreground mt-1 text-sm font-medium">{viewingOrder.plan_name || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Billing Type</p>
                                    <p className="text-foreground mt-1 text-sm">{billingLabel(viewingOrder.billing_type)}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Amount</p>
                                    <p className="text-foreground mt-1 text-sm">{formatPrice(viewingOrder.amount)}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Duration</p>
                                    <p className="text-foreground mt-1 text-sm">{viewingOrder.duration_days} days</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Order Status</p>
                                    <p className="text-foreground mt-1 text-sm">{viewingOrder.status_label}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Ordered At</p>
                                    <p className="text-foreground mt-1 text-sm">{viewingOrder.ordered_at || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Paid At</p>
                                    <p className="text-foreground mt-1 text-sm">{viewingOrder.paid_at || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Verified At</p>
                                    <p className="text-foreground mt-1 text-sm">{viewingOrder.verified_at || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Subscription</p>
                                    <p className="text-foreground mt-1 text-sm">
                                        {viewingOrder.has_subscription ? (viewingOrder.subscription_code ?? 'Created') : 'Not created'}
                                    </p>
                                </div>
                            </div>

                            {viewingOrder.transaction ? (
                                needsManualVerification(viewingOrder) ? (
                                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.055] p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                                                <ShieldAlert className="h-5 w-5" />
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-foreground text-sm font-semibold">Manual Payment Verification</h3>
                                                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                                                            Check GCash or your bank account, then confirm the reference and exact amount.
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                                                            paymentAmountMatches(viewingOrder)
                                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                                : 'border-red-500/20 bg-red-500/10 text-red-400'
                                                        }`}
                                                    >
                                                        {paymentAmountMatches(viewingOrder) ? 'Amount matched' : 'Check amount'}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    <div className="border-border/70 bg-card rounded-xl border p-3">
                                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Expected</p>
                                                        <p className="text-foreground mt-1 text-sm font-bold">{formatPrice(viewingOrder.amount)}</p>
                                                    </div>

                                                    <div className="border-border/70 bg-card rounded-xl border p-3">
                                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Submitted</p>
                                                        <p
                                                            className={`mt-1 text-sm font-bold ${
                                                                paymentAmountMatches(viewingOrder) ? 'text-emerald-400' : 'text-red-400'
                                                            }`}
                                                        >
                                                            {formatPrice(viewingOrder.transaction.amount)}
                                                        </p>
                                                    </div>

                                                    <div className="border-border/70 bg-card rounded-xl border p-3">
                                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Method</p>
                                                        <p className="text-foreground mt-1 text-sm font-semibold">
                                                            {viewingOrder.transaction.payment_method?.toUpperCase() || '-'}
                                                        </p>
                                                    </div>

                                                    <div className="border-border/70 bg-card rounded-xl border p-3">
                                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Reference</p>
                                                        <p className="text-foreground mt-1 break-all text-sm font-semibold">
                                                            {viewingOrder.transaction.reference_number || '-'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="border-border/60 mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Transaction Code</p>
                                                        <p className="text-foreground mt-1 break-all text-xs font-medium">
                                                            {viewingOrder.transaction.transaction_code}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Status</p>
                                                        <p className="text-foreground mt-1 text-xs font-semibold capitalize">
                                                            {viewingOrder.transaction.status}
                                                        </p>
                                                    </div>
                                                </div>

                                                {viewingOrder.transaction.notes && (
                                                    <div className="mt-4">
                                                        <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">Notes</p>
                                                        <p className="text-foreground mt-1 text-sm leading-6">{viewingOrder.transaction.notes}</p>
                                                    </div>
                                                )}

                                                <div className="mt-5 flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                                        onClick={() => {
                                                            closeViewDrawer();
                                                            openVerify(viewingOrder);
                                                        }}
                                                    >
                                                        <BadgeCheck className="mr-2 h-4 w-4" />
                                                        Approve Payment
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                                        onClick={() => {
                                                            closeViewDrawer();
                                                            openReject(viewingOrder);
                                                        }}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject Payment
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-border rounded-xl border p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Payment Transaction</p>
                                                <p className="text-foreground mt-1 text-sm font-semibold">{viewingOrder.transaction.transaction_code}</p>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${txStatusClass(
                                                    viewingOrder.transaction.status,
                                                )}`}
                                            >
                                                {viewingOrder.transaction.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-muted-foreground text-xs">Method</p>
                                                <p className="text-foreground mt-1 text-sm font-medium">
                                                    {viewingOrder.transaction.payment_method?.toUpperCase() || '-'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-muted-foreground text-xs">Reference</p>
                                                <p className="text-foreground mt-1 break-all text-sm font-medium">
                                                    {viewingOrder.transaction.reference_number || '-'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-muted-foreground text-xs">Amount</p>
                                                <p className="text-foreground mt-1 text-sm font-medium">
                                                    {formatPrice(viewingOrder.transaction.amount)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-muted-foreground text-xs">Verified At</p>
                                                <p className="text-foreground mt-1 text-sm font-medium">
                                                    {viewingOrder.transaction.verified_at || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {viewingOrder.transaction.notes && (
                                            <div className="mt-4">
                                                <p className="text-muted-foreground text-xs">Notes</p>
                                                <p className="text-foreground mt-1 text-sm leading-6">{viewingOrder.transaction.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="border-border rounded-xl border p-4">
                                    <p className="text-muted-foreground text-sm">No payment transaction yet.</p>

                                    {viewingOrder.status === 'pending' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl"
                                            onClick={() => {
                                                closeViewDrawer();
                                                openPayment(viewingOrder);
                                            }}
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            Submit Payment
                                        </Button>
                                    )}
                                </div>
                            )}

                            <div className="border-border flex justify-end border-t pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-300"
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