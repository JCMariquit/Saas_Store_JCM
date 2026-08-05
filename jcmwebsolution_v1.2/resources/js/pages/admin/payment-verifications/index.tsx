import { DataTable } from '@/components/admin-ui/data-table';
import { FormModal } from '@/components/admin-ui/form-modal';
import { PageHero } from '@/components/admin-ui/page-hero';
import { SearchInput } from '@/components/admin-ui/search-input';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Banknote,
    CalendarDays,
    CheckCircle2,
    Clock3,
    ExternalLink,
    Eye,
    FileImage,
    FilterX,
    ReceiptText,
    SearchCheck,
    ShieldCheck,
    TriangleAlert,
    UserRound,
    XCircle,
} from 'lucide-react';
import { type FormEventHandler, type ReactNode, useEffect, useMemo, useState } from 'react';

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'all';
type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low';
type TransactionStatus = 'pending' | 'submitted' | 'verified' | 'rejected' | 'failed' | 'refunded';

type SelectOption = {
    id: number;
    name: string;
};

type PaymentRow = {
    id: number;
    transaction_code: string;
    status: TransactionStatus;
    status_label: string;
    reference_number: string | null;
    account_name: string | null;
    account_number: string | null;
    amount: number;
    expected_amount: number;
    amount_matches: boolean;
    payment_proof: string | null;
    proof_url: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    review_notes: string | null;
    reviewer_name: string | null;
    can_review: boolean;
    payment_method: {
        id: number | null;
        name: string | null;
        slug: string | null;
        destination_name: string | null;
        destination_number: string | null;
    };
    subscriber: {
        id: number | null;
        name: string | null;
        email: string | null;
    };
    order: {
        id: number | null;
        order_code: string | null;
        status: string | null;
        order_type: string | null;
        billing_type: string | null;
        currency: string;
        duration_days: number;
        ordered_at: string | null;
    };
    product: {
        id: number | null;
        code: string | null;
        name: string | null;
    };
    plan: {
        id: number | null;
        name: string | null;
    };
    subscription: null | {
        id: number;
        code: string;
        status: string;
        current_period_end: string | null;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaymentsPagination = {
    data: PaymentRow[];
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
        status: VerificationStatus;
        product_id: number | null;
        payment_method_id: number | null;
        date_from: string;
        date_to: string;
        sort: SortOption;
    };
    payments: PaymentsPagination;
    products: SelectOption[];
    paymentMethods: SelectOption[];
    stats: {
        pending_count: number;
        pending_amount: number;
        approved_today: number;
        rejected_today: number;
    };
    flash?: {
        success?: string;
    };
    errors?: Record<string, string>;
};

type ApproveForm = {
    review_notes: string;
};

type RejectForm = {
    rejection_reason: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Verification',
        href: '/admin/payment-verifications',
    },
];

const columns = [
    { key: 'payment', label: 'Payment' },
    { key: 'subscriber', label: 'Subscriber' },
    { key: 'system', label: 'System / Plan' },
    { key: 'method', label: 'Method / Reference' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

const statusOptions: Array<{
    value: VerificationStatus;
    label: string;
}> = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All Payments' },
];

export default function PaymentVerificationsIndex() {
    const { props } = usePage<PageProps>();
    const { filters, payments, products, paymentMethods, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState<VerificationStatus>(filters.status ?? 'pending');
    const [productId, setProductId] = useState(filters.product_id?.toString() ?? '');
    const [paymentMethodId, setPaymentMethodId] = useState(filters.payment_method_id?.toString() ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [sort, setSort] = useState<SortOption>(filters.sort ?? 'newest');
    const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
    const [viewingPayment, setViewingPayment] = useState<PaymentRow | null>(null);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [proofFailed, setProofFailed] = useState(false);

    const approveForm = useForm<ApproveForm>({ review_notes: '' });
    const rejectForm = useForm<RejectForm>({ rejection_reason: '' });

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            router.get(
                route('admin.payment-verifications.index'),
                {
                    search,
                    status,
                    product_id: productId || undefined,
                    payment_method_id: paymentMethodId || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    sort,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [search, status, productId, paymentMethodId, dateFrom, dateTo, sort]);

    const formatMoney = (value: number, currency = 'PHP') =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency,
        }).format(Number(value));

    const statusClass = (paymentStatus: TransactionStatus) => {
        if (paymentStatus === 'verified') {
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
        }

        if (paymentStatus === 'rejected' || paymentStatus === 'failed') {
            return 'border-red-500/20 bg-red-500/10 text-red-400';
        }

        return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
    };

    const resultsText = useMemo(() => {
        if (payments.total === 0) return 'No payment submissions found.';

        return `Showing ${payments.from ?? 0} to ${payments.to ?? 0} of ${payments.total} payment submissions`;
    }, [payments.from, payments.to, payments.total]);

    const openDetails = (payment: PaymentRow) => {
        setProofFailed(false);
        setViewingPayment(payment);
    };

    const openApprove = (payment: PaymentRow) => {
        setSelectedPayment(payment);
        approveForm.reset();
        approveForm.clearErrors();
        setApproveOpen(true);
    };

    const closeApprove = () => {
        setSelectedPayment(null);
        approveForm.reset();
        approveForm.clearErrors();
        setApproveOpen(false);
    };

    const openReject = (payment: PaymentRow) => {
        setSelectedPayment(payment);
        rejectForm.reset();
        rejectForm.clearErrors();
        setRejectOpen(true);
    };

    const closeReject = () => {
        setSelectedPayment(null);
        rejectForm.reset();
        rejectForm.clearErrors();
        setRejectOpen(false);
    };

    const submitApprove: FormEventHandler = (event) => {
        event.preventDefault();
        if (!selectedPayment) return;

        approveForm.post(route('admin.payment-verifications.approve', selectedPayment.id), {
            preserveScroll: true,
            onSuccess: () => closeApprove(),
        });
    };

    const submitReject: FormEventHandler = (event) => {
        event.preventDefault();
        if (!selectedPayment) return;

        rejectForm.post(route('admin.payment-verifications.reject', selectedPayment.id), {
            preserveScroll: true,
            onSuccess: () => closeReject(),
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('pending');
        setProductId('');
        setPaymentMethodId('');
        setDateFrom('');
        setDateTo('');
        setSort('newest');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Verification" />

            <div className="bg-background min-h-screen p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        eyebrow="Commerce Control"
                        title="Payment Verification"
                        description="Review subscriber payment references and proofs before activating, renewing, upgrading, or downgrading system access."
                    />

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatsCard
                            title="Pending Review"
                            value={stats.pending_count}
                            description="Submitted payments waiting for action"
                            icon={<Clock3 className="size-5" />}
                            tone="amber"
                        />
                        <StatsCard
                            title="Pending Amount"
                            value={formatMoney(stats.pending_amount)}
                            description="Total value awaiting verification"
                            icon={<Banknote className="size-5" />}
                            tone="blue"
                        />
                        <StatsCard
                            title="Approved Today"
                            value={stats.approved_today}
                            description="Payments approved today"
                            icon={<BadgeCheck className="size-5" />}
                            tone="emerald"
                        />
                        <StatsCard
                            title="Rejected Today"
                            value={stats.rejected_today}
                            description="Payments rejected today"
                            icon={<XCircle className="size-5" />}
                            tone="rose"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard title="Verification Queue" description={resultsText}>
                        <div className="mb-5 grid gap-3 lg:grid-cols-12">
                            <div className="lg:col-span-4">
                                <SearchInput
                                    id="payment-verification-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search subscriber, order, transaction, reference..."
                                />
                            </div>

                            <FilterSelect
                                label="Status"
                                value={status}
                                onChange={(value) => setStatus(value as VerificationStatus)}
                                className="lg:col-span-2"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </FilterSelect>

                            <FilterSelect label="System" value={productId} onChange={setProductId} className="lg:col-span-2">
                                <option value="">All systems</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </FilterSelect>

                            <FilterSelect label="Payment method" value={paymentMethodId} onChange={setPaymentMethodId} className="lg:col-span-2">
                                <option value="">All methods</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.name}
                                    </option>
                                ))}
                            </FilterSelect>

                            <FilterSelect label="Sort" value={sort} onChange={(value) => setSort(value as SortOption)} className="lg:col-span-2">
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="amount_high">Highest amount</option>
                                <option value="amount_low">Lowest amount</option>
                            </FilterSelect>
                        </div>

                        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                            <DateFilter label="Submitted from" value={dateFrom} onChange={setDateFrom} />
                            <DateFilter label="Submitted to" value={dateTo} onChange={setDateTo} />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetFilters}
                                className="border-border bg-card h-10 self-end rounded-xl text-xs"
                            >
                                <FilterX className="size-3.5" />
                                Reset filters
                            </Button>
                        </div>

                        <DataTable
                            columns={columns}
                            empty={payments.data.length === 0}
                            emptyMessage="No payments match the selected filters."
                            colSpan={7}
                        >
                            {payments.data.map((payment) => (
                                <tr key={payment.id} className="border-border/55 hover:bg-primary/[0.025] border-t transition">
                                    <td className="px-4 py-4">
                                        <p className="text-foreground text-xs font-semibold">{payment.transaction_code}</p>
                                        <p className="text-muted-foreground mt-1 text-[9px]">
                                            {payment.submitted_at ?? 'Submission date unavailable'}
                                        </p>
                                        <p className="text-primary mt-1 text-[9px] font-medium">{payment.order.order_code ?? 'No order code'}</p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-foreground text-xs font-semibold">{payment.subscriber.name ?? 'Unknown subscriber'}</p>
                                        <p className="text-muted-foreground mt-1 max-w-48 truncate text-[9px]">{payment.subscriber.email ?? '-'}</p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-foreground text-xs font-semibold">{payment.product.name ?? 'Unknown system'}</p>
                                        <p className="text-muted-foreground mt-1 text-[9px]">
                                            {payment.plan.name ?? 'Plan unavailable'} · {humanize(payment.order.billing_type)}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-[9px]">{humanize(payment.order.order_type)}</p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-foreground text-xs font-semibold">{payment.payment_method.name ?? 'Unknown method'}</p>
                                        <p className="text-muted-foreground mt-1 text-[9px]">Ref: {payment.reference_number || 'Not provided'}</p>
                                        {payment.payment_proof && (
                                            <p className="text-primary mt-1 inline-flex items-center gap-1 text-[9px] font-medium">
                                                <FileImage className="size-3" /> Proof attached
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-foreground text-xs font-semibold">{formatMoney(payment.amount, payment.order.currency)}</p>
                                        {!payment.amount_matches && (
                                            <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-amber-400">
                                                <TriangleAlert className="size-3" /> Expected{' '}
                                                {formatMoney(payment.expected_amount, payment.order.currency)}
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold ${statusClass(payment.status)}`}
                                        >
                                            {payment.status_label}
                                        </span>
                                        {payment.reviewer_name && <p className="text-muted-foreground mt-1 text-[9px]">by {payment.reviewer_name}</p>}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openDetails(payment)}
                                                className="h-8 rounded-lg px-2.5 text-[9px]"
                                            >
                                                <Eye className="size-3.5" />
                                                Review
                                            </Button>

                                            {payment.can_review && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => openApprove(payment)}
                                                        className="h-8 rounded-lg px-2.5 text-[9px]"
                                                    >
                                                        <CheckCircle2 className="size-3.5" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openReject(payment)}
                                                        className="h-8 rounded-lg px-2.5 text-[9px]"
                                                    >
                                                        <XCircle className="size-3.5" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>

                        {payments.last_page > 1 && (
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                {payments.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        asChild={Boolean(link.url)}
                                        disabled={!link.url}
                                        className="h-8 min-w-8 rounded-lg px-2.5 text-[9px]"
                                    >
                                        {link.url ? (
                                            <Link href={link.url} preserveScroll preserveState>
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </Link>
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>

            <FormModal
                open={viewingPayment !== null}
                title="Payment review details"
                description="Compare the submitted reference and proof with the expected order details."
                onClose={() => setViewingPayment(null)}
                maxWidthClass="max-w-5xl"
            >
                {viewingPayment && (
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
                        <div className="space-y-4">
                            <DetailSection title="Subscriber and order">
                                <DetailRow
                                    icon={<UserRound className="size-3.5" />}
                                    label="Subscriber"
                                    value={`${viewingPayment.subscriber.name ?? '-'} (${viewingPayment.subscriber.email ?? '-'})`}
                                />
                                <DetailRow icon={<ReceiptText className="size-3.5" />} label="Order" value={viewingPayment.order.order_code ?? '-'} />
                                <DetailRow
                                    icon={<ShieldCheck className="size-3.5" />}
                                    label="System / plan"
                                    value={`${viewingPayment.product.name ?? '-'} · ${viewingPayment.plan.name ?? '-'}`}
                                />
                                <DetailRow
                                    icon={<CalendarDays className="size-3.5" />}
                                    label="Billing"
                                    value={`${humanize(viewingPayment.order.billing_type)} · ${viewingPayment.order.duration_days} days`}
                                />
                            </DetailSection>

                            <DetailSection title="Payment information">
                                <DetailRow
                                    icon={<Banknote className="size-3.5" />}
                                    label="Submitted amount"
                                    value={formatMoney(viewingPayment.amount, viewingPayment.order.currency)}
                                />
                                <DetailRow
                                    icon={<SearchCheck className="size-3.5" />}
                                    label="Expected amount"
                                    value={formatMoney(viewingPayment.expected_amount, viewingPayment.order.currency)}
                                    valueClassName={viewingPayment.amount_matches ? 'text-emerald-400' : 'text-amber-400'}
                                />
                                <DetailRow
                                    icon={<ReceiptText className="size-3.5" />}
                                    label="Reference number"
                                    value={viewingPayment.reference_number || 'Not provided'}
                                />
                                <DetailRow
                                    icon={<UserRound className="size-3.5" />}
                                    label="Sender account"
                                    value={`${viewingPayment.account_name || '-'} · ${viewingPayment.account_number || '-'}`}
                                />
                            </DetailSection>

                            {viewingPayment.review_notes && (
                                <div className="border-border/70 bg-background/35 rounded-xl border p-4">
                                    <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">
                                        Review notes / rejection reason
                                    </p>
                                    <p className="text-foreground mt-2 text-xs leading-5 whitespace-pre-wrap">{viewingPayment.review_notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="border-border/70 bg-background/35 overflow-hidden rounded-2xl border">
                                <div className="border-border/60 flex items-center justify-between border-b px-4 py-3">
                                    <div>
                                        <p className="text-foreground text-xs font-semibold">Payment proof</p>
                                        <p className="text-muted-foreground mt-1 text-[9px]">Uploaded by the subscriber</p>
                                    </div>
                                    {viewingPayment.proof_url && (
                                        <Button type="button" variant="outline" size="sm" asChild className="h-8 rounded-lg text-[9px]">
                                            <a href={viewingPayment.proof_url} target="_blank" rel="noreferrer">
                                                <ExternalLink className="size-3.5" /> Open
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                <div className="flex min-h-80 items-center justify-center bg-black/15 p-3">
                                    {viewingPayment.proof_url && !proofFailed ? (
                                        <img
                                            src={viewingPayment.proof_url}
                                            alt="Submitted payment proof"
                                            onError={() => setProofFailed(true)}
                                            className="max-h-[480px] w-full rounded-xl object-contain"
                                        />
                                    ) : (
                                        <div className="max-w-sm px-5 py-12 text-center">
                                            <FileImage className="text-muted-foreground mx-auto size-10" />
                                            <p className="text-foreground mt-3 text-xs font-semibold">Proof preview unavailable</p>
                                            <p className="text-muted-foreground mt-2 text-[10px] leading-5">
                                                Configure JCM_INVENTORY_PUBLIC_STORAGE_PATH in the Flagship .env file when the proof was uploaded by
                                                JCM Inventory.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {viewingPayment.can_review && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setViewingPayment(null);
                                            openApprove(viewingPayment);
                                        }}
                                        className="h-10 rounded-xl text-xs"
                                    >
                                        <CheckCircle2 className="size-4" /> Approve payment
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => {
                                            setViewingPayment(null);
                                            openReject(viewingPayment);
                                        }}
                                        className="h-10 rounded-xl text-xs"
                                    >
                                        <XCircle className="size-4" /> Reject payment
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </FormModal>

            <FormModal
                open={approveOpen}
                title="Approve payment"
                description="This will activate or update the subscriber's system access."
                onClose={closeApprove}
                maxWidthClass="max-w-xl"
            >
                {selectedPayment && (
                    <form onSubmit={submitApprove} className="space-y-5">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <p className="text-xs font-semibold text-emerald-400">
                                {selectedPayment.subscriber.name} · {selectedPayment.product.name}
                            </p>
                            <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                {selectedPayment.order.order_code} · Reference {selectedPayment.reference_number || 'not provided'} ·{' '}
                                {formatMoney(selectedPayment.amount, selectedPayment.order.currency)}
                            </p>
                        </div>

                        {!selectedPayment.amount_matches && (
                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-[10px] leading-5 text-amber-300">
                                <span className="font-semibold">Amount mismatch:</span> expected{' '}
                                {formatMoney(selectedPayment.expected_amount, selectedPayment.order.currency)} but the transaction records{' '}
                                {formatMoney(selectedPayment.amount, selectedPayment.order.currency)}. Review the proof carefully before approving.
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="review_notes" className="text-xs font-semibold">
                                Review notes (optional)
                            </Label>
                            <textarea
                                id="review_notes"
                                value={approveForm.data.review_notes}
                                onChange={(event) => approveForm.setData('review_notes', event.target.value)}
                                rows={4}
                                maxLength={2000}
                                placeholder="Add an internal note about the verification..."
                                className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs transition outline-none focus:ring-2"
                            />
                            <InputError message={approveForm.errors.review_notes} />
                        </div>

                        <div className="border-border/60 flex justify-end gap-3 border-t pt-4">
                            <Button type="button" variant="outline" onClick={closeApprove}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={approveForm.processing}>
                                <CheckCircle2 className="size-4" />
                                {approveForm.processing ? 'Approving...' : 'Approve & activate'}
                            </Button>
                        </div>
                    </form>
                )}
            </FormModal>

            <FormModal
                open={rejectOpen}
                title="Reject payment"
                description="A clear rejection reason is required and will be sent to the subscriber."
                onClose={closeReject}
                maxWidthClass="max-w-xl"
                tone="red"
            >
                {selectedPayment && (
                    <form onSubmit={submitReject} className="space-y-5">
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                            <p className="text-xs font-semibold text-red-400">{selectedPayment.transaction_code}</p>
                            <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                {selectedPayment.subscriber.name} · {selectedPayment.product.name} · Reference{' '}
                                {selectedPayment.reference_number || 'not provided'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rejection_reason" className="text-xs font-semibold">
                                Rejection reason
                            </Label>
                            <textarea
                                id="rejection_reason"
                                value={rejectForm.data.rejection_reason}
                                onChange={(event) => rejectForm.setData('rejection_reason', event.target.value)}
                                rows={5}
                                required
                                minLength={5}
                                maxLength={2000}
                                placeholder="Example: The reference number could not be found, or the uploaded proof does not match the expected amount."
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs transition outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            />
                            <InputError message={rejectForm.errors.rejection_reason} />
                        </div>

                        <div className="border-border/60 flex justify-end gap-3 border-t pt-4">
                            <Button type="button" variant="outline" onClick={closeReject}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                <XCircle className="size-4" />
                                {rejectForm.processing ? 'Rejecting...' : 'Reject payment'}
                            </Button>
                        </div>
                    </form>
                )}
            </FormModal>
        </AppLayout>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    children,
    className = '',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <Label className="sr-only">{label}</Label>
            <select
                aria-label={label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="border-border bg-card text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border px-3 text-[10px] font-medium transition outline-none focus:ring-2"
            >
                {children}
            </select>
        </div>
    );
}

function DateFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">{label}</Label>
            <input
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="border-border bg-card text-foreground focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border px-3 text-[10px] transition outline-none focus:ring-2"
            />
        </div>
    );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="border-border/70 bg-background/35 overflow-hidden rounded-xl border">
            <div className="border-border/60 border-b px-4 py-3">
                <p className="text-foreground text-xs font-semibold">{title}</p>
            </div>
            <div className="divide-border/55 divide-y px-4">{children}</div>
        </div>
    );
}

function DetailRow({
    icon,
    label,
    value,
    valueClassName = 'text-foreground',
}: {
    icon: ReactNode;
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-start gap-3 py-3">
            <span className="text-primary mt-0.5">{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">{label}</p>
                <p className={`mt-1 text-[10px] font-medium break-words ${valueClassName}`}>{value}</p>
            </div>
        </div>
    );
}

function humanize(value: string | null): string {
    if (!value) return '-';

    return value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}
