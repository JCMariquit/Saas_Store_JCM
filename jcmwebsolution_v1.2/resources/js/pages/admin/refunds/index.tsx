import {
    FieldLabel,
    inputClassName,
    ModuleDrawer,
    ModuleEmpty,
    ModuleMetric,
    ModulePageHeader,
    ModuleStatus,
    selectClassName,
    textareaClassName,
} from '@/components/admin-ui/module-workspace';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    CircleCheck,
    Clock3,
    Plus,
    RefreshCcw,
    Search,
    WalletCards,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

type Refund = {
    id: number;
    refund_code: string;
    transaction_id?: number | null;
    order_id?: number | null;
    user_id: number;
    amount: number;
    currency: string;
    reason: string;
    status: string;
    admin_notes?: string | null;
    requested_at?: string | null;
    reviewed_at?: string | null;
    processed_at?: string | null;
    created_at: string;
    transaction_code?: string | null;
    transaction_amount?: number | null;
    reference_number?: string | null;
    order_code?: string | null;
    user_name: string;
    user_email: string;
    reviewed_by_name?: string | null;
    processed_by_name?: string | null;
};

type Transaction = {
    id: number;
    transaction_code: string;
    order_id: number;
    user_id: number;
    amount: number;
    status: string;
    reference_number?: string | null;
    order_code: string;
    user_name: string;
    user_email: string;
    refunded_amount: number;
    refundable_amount: number;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

type Props = {
    refunds: Paginated<Refund>;
    transactions: Transaction[];
    filters: { search?: string; status?: string };
    stats: {
        total: number;
        requested: number;
        processing: number;
        refunded_amount: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sales & Billing', href: '/admin/transactions' },
    { title: 'Refunds', href: '/admin/refunds' },
];

function money(value: number | string, currency = 'PHP') {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

export default function Refunds({
    refunds,
    transactions,
    filters,
    stats,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [selected, setSelected] = useState<Refund | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const form = useForm({
        transaction_id: '',
        amount: '',
        reason: '',
    });

    const selectedTransaction = useMemo(
        () =>
            transactions.find(
                (transaction) =>
                    String(transaction.id) === form.data.transaction_id,
            ),
        [form.data.transaction_id, transactions],
    );

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/admin/refunds',
            { search, status },
            { preserveState: true, replace: true },
        );
    }

    function selectTransaction(value: string) {
        form.setData('transaction_id', value);
        const transaction = transactions.find(
            (item) => String(item.id) === value,
        );
        if (transaction) {
            form.setData(
                'amount',
                String(transaction.refundable_amount),
            );
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Refunds" />

            <div className="space-y-5">
                <ModulePageHeader
                    eyebrow="Payment Recovery"
                    title="Refunds"
                    description="Create, review, approve, process, and complete refund requests against verified payment transactions."
                    actions={
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="rounded-xl"
                        >
                            <Plus className="size-4" />
                            New refund
                        </Button>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ModuleMetric
                        label="Refund records"
                        value={stats.total}
                        hint="All refund requests"
                        icon={RefreshCcw}
                    />
                    <ModuleMetric
                        label="For review"
                        value={stats.requested}
                        hint="Requested status"
                        icon={Clock3}
                    />
                    <ModuleMetric
                        label="Processing"
                        value={stats.processing}
                        hint="Approved or in progress"
                        icon={WalletCards}
                    />
                    <ModuleMetric
                        label="Refunded amount"
                        value={money(stats.refunded_amount)}
                        hint="Completed refunds"
                        icon={Banknote}
                    />
                </div>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 flex flex-col gap-3 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-foreground text-sm font-semibold">
                                Refund register
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Open a record to review its transaction and workflow controls.
                            </p>
                        </div>

                        <form
                            onSubmit={applyFilters}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Refund, transaction, account..."
                                    className={`${inputClassName} sm:w-64 pl-9`}
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className={`${selectClassName} sm:w-44`}
                            >
                                <option value="">All statuses</option>
                                <option value="requested">Requested</option>
                                <option value="approved">Approved</option>
                                <option value="processing">Processing</option>
                                <option value="refunded">Refunded</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Button type="submit" variant="outline">
                                Apply
                            </Button>
                        </form>
                    </div>

                    {refunds.data.length === 0 ? (
                        <ModuleEmpty
                            icon={RefreshCcw}
                            title="No refunds found"
                            description="Create a refund request from an eligible verified transaction."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left text-xs">
                                <thead>
                                    <tr className="border-border/70 text-muted-foreground border-b">
                                        <th className="px-4 py-3 font-semibold">
                                            Refund
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Account
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Transaction
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Requested
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refunds.data.map((refund) => (
                                        <tr
                                            key={refund.id}
                                            onClick={() =>
                                                setSelected(refund)
                                            }
                                            className="border-border/60 hover:bg-primary/[0.035] cursor-pointer border-b last:border-b-0"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-semibold">
                                                    {refund.refund_code}
                                                </p>
                                                <p className="text-muted-foreground mt-1 line-clamp-1 text-[10px]">
                                                    {refund.reason}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-medium">
                                                    {refund.user_name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {refund.user_email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p>
                                                    {refund.transaction_code ??
                                                        'Manual'}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {refund.order_code ??
                                                        refund.reference_number ??
                                                        'No reference'}
                                                </p>
                                            </td>
                                            <td className="text-foreground px-4 py-4 font-semibold tabular-nums">
                                                {money(
                                                    refund.amount,
                                                    refund.currency,
                                                )}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-4 text-[10px]">
                                                {new Date(
                                                    refund.requested_at ??
                                                        refund.created_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <ModuleStatus
                                                    value={refund.status}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-border/70 flex items-center justify-between border-t px-4 py-3">
                        <p className="text-muted-foreground text-xs">
                            Page {refunds.current_page} of{' '}
                            {refunds.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!refunds.prev_page_url}
                                onClick={() =>
                                    refunds.prev_page_url &&
                                    router.visit(refunds.prev_page_url)
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!refunds.next_page_url}
                                onClick={() =>
                                    refunds.next_page_url &&
                                    router.visit(refunds.next_page_url)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            <ModuleDrawer
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create refund request"
                description="Choose an eligible payment transaction and enter the refund reason."
                footer={
                    <Button
                        type="button"
                        className="w-full rounded-xl"
                        disabled={form.processing}
                        onClick={() =>
                            form.post('/admin/refunds', {
                                onSuccess: () => {
                                    form.reset();
                                    setCreateOpen(false);
                                },
                            })
                        }
                    >
                        Create refund request
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Transaction</FieldLabel>
                        <select
                            value={form.data.transaction_id}
                            onChange={(event) =>
                                selectTransaction(event.target.value)
                            }
                            className={selectClassName}
                        >
                            <option value="">
                                Select verified transaction
                            </option>
                            {transactions.map((transaction) => (
                                <option
                                    key={transaction.id}
                                    value={transaction.id}
                                >
                                    {transaction.transaction_code} —{' '}
                                    {transaction.user_name} —{' '}
                                    {money(
                                        transaction.refundable_amount,
                                    )}{' '}
                                    available
                                </option>
                            ))}
                        </select>
                        {form.errors.transaction_id && (
                            <p className="text-destructive mt-1 text-xs">
                                {form.errors.transaction_id}
                            </p>
                        )}
                    </div>

                    {selectedTransaction && (
                        <div className="border-border/70 bg-card rounded-2xl border p-4">
                            <p className="text-primary text-[10px] font-semibold uppercase tracking-widest">
                                Refundable balance
                            </p>
                            <p className="text-foreground mt-2 text-xl font-bold">
                                {money(
                                    selectedTransaction.refundable_amount,
                                )}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Original amount:{' '}
                                {money(selectedTransaction.amount)} · Already
                                allocated:{' '}
                                {money(
                                    selectedTransaction.refunded_amount,
                                )}
                            </p>
                        </div>
                    )}

                    <div>
                        <FieldLabel>Refund amount</FieldLabel>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={form.data.amount}
                            onChange={(event) =>
                                form.setData('amount', event.target.value)
                            }
                            className={inputClassName}
                        />
                        {form.errors.amount && (
                            <p className="text-destructive mt-1 text-xs">
                                {form.errors.amount}
                            </p>
                        )}
                    </div>

                    <div>
                        <FieldLabel>Reason</FieldLabel>
                        <textarea
                            rows={6}
                            value={form.data.reason}
                            onChange={(event) =>
                                form.setData('reason', event.target.value)
                            }
                            className={textareaClassName}
                            placeholder="Describe why the refund is required."
                        />
                    </div>
                </div>
            </ModuleDrawer>

            <ModuleDrawer
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.refund_code ?? 'Refund'}
                description={
                    selected
                        ? `${selected.user_name} · ${selected.transaction_code ?? 'No transaction'}`
                        : undefined
                }
                footer={selected && <RefundActions refund={selected} />}
            >
                {selected && (
                    <div className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Detail label="Status">
                                <ModuleStatus value={selected.status} />
                            </Detail>
                            <Detail label="Amount">
                                <span className="text-lg font-bold">
                                    {money(
                                        selected.amount,
                                        selected.currency,
                                    )}
                                </span>
                            </Detail>
                            <Detail label="Transaction">
                                {selected.transaction_code ?? 'No linked transaction'}
                            </Detail>
                            <Detail label="Order">
                                {selected.order_code ?? 'No linked order'}
                            </Detail>
                        </div>

                        <Detail label="Reason">{selected.reason}</Detail>

                        {selected.admin_notes && (
                            <Detail label="Admin notes">
                                {selected.admin_notes}
                            </Detail>
                        )}

                        <div className="border-border/70 bg-card rounded-2xl border p-4">
                            <h3 className="text-foreground text-xs font-semibold uppercase tracking-widest">
                                Workflow timeline
                            </h3>
                            <div className="text-muted-foreground mt-4 space-y-3 text-xs">
                                <Timeline
                                    label="Requested"
                                    value={selected.requested_at}
                                />
                                <Timeline
                                    label="Reviewed"
                                    value={selected.reviewed_at}
                                    actor={selected.reviewed_by_name}
                                />
                                <Timeline
                                    label="Processed"
                                    value={selected.processed_at}
                                    actor={selected.processed_by_name}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </ModuleDrawer>
        </AppLayout>
    );
}

function RefundActions({ refund }: { refund: Refund }) {
    if (refund.status === 'requested') {
        return (
            <div className="grid grid-cols-2 gap-2">
                <Button
                    type="button"
                    className="rounded-xl"
                    onClick={() => {
                        const notes = prompt(
                            'Optional approval notes:',
                            '',
                        );
                        if (notes !== null) {
                            router.post(
                                `/admin/refunds/${refund.id}/review`,
                                {
                                    decision: 'approved',
                                    admin_notes: notes,
                                },
                            );
                        }
                    }}
                >
                    <CircleCheck className="size-4" />
                    Approve
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => {
                        const notes = prompt(
                            'Rejection reason:',
                            '',
                        );
                        if (notes !== null && notes.trim()) {
                            router.post(
                                `/admin/refunds/${refund.id}/review`,
                                {
                                    decision: 'rejected',
                                    admin_notes: notes,
                                },
                            );
                        }
                    }}
                >
                    Reject
                </Button>
            </div>
        );
    }

    if (refund.status === 'approved') {
        return (
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() =>
                        router.post(
                            `/admin/refunds/${refund.id}/processing`,
                        )
                    }
                >
                    Start processing
                </Button>
                <Button
                    type="button"
                    className="flex-1 rounded-xl"
                    onClick={() =>
                        router.post(
                            `/admin/refunds/${refund.id}/complete`,
                        )
                    }
                >
                    Complete refund
                </Button>
            </div>
        );
    }

    if (refund.status === 'processing') {
        return (
            <Button
                type="button"
                className="w-full rounded-xl"
                onClick={() =>
                    router.post(
                        `/admin/refunds/${refund.id}/complete`,
                    )
                }
            >
                Complete refund
            </Button>
        );
    }

    if (!['refunded', 'cancelled'].includes(refund.status)) {
        return (
            <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() =>
                    router.post(
                        `/admin/refunds/${refund.id}/cancel`,
                    )
                }
            >
                Cancel refund
            </Button>
        );
    }

    return null;
}

function Detail({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-border/70 bg-card rounded-xl border p-4">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
                {label}
            </p>
            <div className="text-foreground mt-2 text-sm leading-6">
                {children}
            </div>
        </div>
    );
}

function Timeline({
    label,
    value,
    actor,
}: {
    label: string;
    value?: string | null;
    actor?: string | null;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span>{label}</span>
            <span className="text-foreground text-right">
                {value ? new Date(value).toLocaleString() : 'Not yet'}
                {actor && (
                    <span className="text-muted-foreground mt-1 block text-[10px]">
                        {actor}
                    </span>
                )}
            </span>
        </div>
    );
}
