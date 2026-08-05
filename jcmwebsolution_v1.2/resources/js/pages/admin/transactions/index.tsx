import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    ExternalLink,
    Trash2,
    Wallet,
    Clock3,
    ShieldCheck,
    XCircle,
} from 'lucide-react';

import AppLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/admin-ui/page-hero';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { SectionCard } from '@/components/admin-ui/section-card';
import { SearchInput } from '@/components/admin-ui/search-input';
import { DataTable } from '@/components/admin-ui/data-table';

type TransactionRow = {
    id: number;
    transaction_code: string;
    order_id: number | null;
    order_code: string | null;
    order_status: 'pending' | 'paid' | 'verified' | 'failed' | 'cancelled' | null;
    user_name: string | null;
    product_name: string | null;
    plan_name: string | null;
    payment_method: string | null;
    reference_number: string | null;
    account_name: string | null;
    account_number: string | null;
    amount: number;
    status: 'submitted' | 'verified' | 'rejected';
    notes: string | null;
    paid_at: string | null;
    verified_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TransactionsPagination = {
    data: TransactionRow[];
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
    transactions: TransactionsPagination;
    stats: {
        total_transactions: number;
        submitted_transactions: number;
        verified_transactions: number;
        rejected_transactions: number;
    };
    flash?: {
        success?: string;
    };
};

const transactionTableColumns = [
    { key: 'transaction', label: 'Transaction' },
    { key: 'order', label: 'Order' },
    { key: 'user', label: 'User' },
    { key: 'product_plan', label: 'Product / Plan' },
    { key: 'payment', label: 'Payment' },
    { key: 'amount', label: 'Amount' },
    { key: 'tx_status', label: 'Transaction Status' },
    { key: 'order_status', label: 'Order Status' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

export default function TransactionsIndex() {
    const { props } = usePage<PageProps>();
    const { transactions, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [viewingTransaction, setViewingTransaction] = useState<TransactionRow | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('admin.transactions.index'),
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

    const resetSearch = () => {
        setSearch('');
        router.get(
            route('admin.transactions.index'),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const deleteTransaction = (transaction: TransactionRow) => {
        router.delete(route('admin.transactions.destroy', transaction.id), {
            preserveScroll: true,
        });
    };

    const goToOrder = (transaction: TransactionRow) => {
        if (!transaction.order_id) return;

        router.get(
            route('admin.orders.index'),
            { search: transaction.order_code },
            { preserveScroll: true },
        );
    };

    const openViewDrawer = (transaction: TransactionRow) => {
        setViewingTransaction(transaction);
    };

    const closeViewDrawer = () => {
        setViewingTransaction(null);
    };

    const resultsText = useMemo(() => {
        if (!transactions.total) return 'No transactions found.';
        return `Showing ${transactions.from ?? 0} to ${transactions.to ?? 0} of ${transactions.total} transactions`;
    }, [transactions.from, transactions.to, transactions.total]);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value));

    const txStatusClass = (status: TransactionRow['status']) => {
        switch (status) {
            case 'verified':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
            case 'rejected':
                return 'border-red-500/20 bg-red-500/10 text-red-300';
            default:
                return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
        }
    };

    const orderStatusClass = (status: TransactionRow['order_status']) => {
        switch (status) {
            case 'verified':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
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

    const orderStatusLabel = (status: TransactionRow['order_status']) => {
        if (status === 'paid') return 'for verification';
        if (status === 'failed') return 'failed';
        return status ?? '-';
    };

    const getPaginationAriaLabel = (label: string) => {
        const cleaned = label
            .replace(/&laquo;/g, '')
            .replace(/&raquo;/g, '')
            .replace(/&amp;laquo;/g, '')
            .replace(/&amp;raquo;/g, '')
            .trim();

        if (label.includes('laquo')) return 'Previous page';
        if (label.includes('raquo')) return 'Next page';
        if (cleaned) return `Go to page ${cleaned}`;

        return 'Pagination link';
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Transactions',
            href: '/admin/transactions',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />

            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Transactions"
                        description="View all payment transactions, references, and linked order records."
                    />

                    <div className="grid gap-4 md:grid-cols-4">
                        <StatsCard
                            title="Total Transactions"
                            value={stats.total_transactions}
                            description="All transaction records"
                            icon={<Wallet className="h-5 w-5" />}
                            tone="blue"
                        />

                        <StatsCard
                            title="Submitted"
                            value={stats.submitted_transactions}
                            description="Pending transactions"
                            icon={<Clock3 className="h-5 w-5" />}
                            tone="amber"
                        />

                        <StatsCard
                            title="Verified"
                            value={stats.verified_transactions}
                            description="Reviewed transactions."
                            icon={<ShieldCheck className="h-5 w-5" />}
                            tone="emerald"
                        />

                        <StatsCard
                            title="Rejected"
                            value={stats.rejected_transactions}
                            description="Rejected transactions "
                            icon={<XCircle className="h-5 w-5" />}
                            tone="rose"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard
                        title="Transaction List"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput
                                    id="transaction-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search transaction, order, ref..."
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetSearch}
                                    className="h-11 rounded-xl border-border bg-card px-4 text-foreground hover:border-primary/20 hover:bg-primary/[0.06] hover:text-primary"
                                >
                                    Reset Search
                                </Button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={transactionTableColumns}
                            empty={transactions.data.length === 0}
                            emptyMessage="No transactions found."
                            colSpan={9}
                            striped
                            hoverable
                        >
                            {transactions.data.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="cursor-pointer"
                                    onClick={() => openViewDrawer(transaction)}
                                >
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-foreground">
                                            {transaction.transaction_code}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {transaction.paid_at ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-foreground">
                                        {transaction.order_code ?? '-'}
                                    </td>

                                    <td className="px-4 py-4 text-foreground">
                                        {transaction.user_name ?? '-'}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="font-medium text-foreground">
                                            {transaction.product_name ?? '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {transaction.plan_name ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="text-foreground">
                                            {transaction.payment_method?.toUpperCase() ?? '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Ref: {transaction.reference_number ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-foreground">
                                        {formatPrice(transaction.amount)}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${txStatusClass(
                                                transaction.status,
                                            )}`}
                                        >
                                            {transaction.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        {transaction.order_status ? (
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${orderStatusClass(
                                                    transaction.order_status,
                                                )}`}
                                            >
                                                {orderStatusLabel(transaction.order_status)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>

                                    <td
                                        className="px-4 py-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {transaction.order_id && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 rounded-xl border-border px-3 text-foreground hover:bg-muted/30"
                                                    title="Manage in Orders"
                                                    aria-label={`Manage order ${transaction.order_code}`}
                                                    onClick={() => goToOrder(transaction)}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {transaction.status !== 'verified' && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 rounded-xl border-red-500/20 px-3 text-red-600 hover:bg-red-500/10 hover:text-red-300"
                                                    title="Delete transaction"
                                                    aria-label={`Delete transaction ${transaction.transaction_code}`}
                                                    onClick={() => deleteTransaction(transaction)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>

                        {transactions.links.length > 3 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {transactions.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        title={getPaginationAriaLabel(link.label)}
                                        aria-label={getPaginationAriaLabel(link.label)}
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                });
                                            }
                                        }}
                                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                            link.active
                                                ? 'border-primary bg-gradient-to-r from-primary to-primary/80 text-white shadow-md'
                                                : link.url
                                                  ? 'border-border bg-card text-foreground hover:border-primary/20 hover:bg-primary/[0.06] hover:text-primary'
                                                  : 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>

            {viewingTransaction && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute right-0 top-0 flex h-screen w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/[0.06] to-card px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Transaction Details</h2>
                                <p className="text-sm text-muted-foreground">View full transaction information</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewDrawer}
                                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transaction Code</p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {viewingTransaction.transaction_code}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order Code</p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {viewingTransaction.order_code ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {viewingTransaction.user_name ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {viewingTransaction.product_name ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {viewingTransaction.plan_name ?? '-'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment Method</p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {viewingTransaction.payment_method?.toUpperCase() ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference Number</p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {viewingTransaction.reference_number ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {formatPrice(viewingTransaction.amount)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transaction Status</p>
                                    <p className="mt-1 text-sm capitalize text-foreground">
                                        {viewingTransaction.status}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order Status</p>
                                    <p className="mt-1 text-sm capitalize text-foreground">
                                        {orderStatusLabel(viewingTransaction.order_status)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paid At</p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {viewingTransaction.paid_at ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verified At</p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {viewingTransaction.verified_at ?? '-'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account Name</p>
                                <p className="mt-1 text-sm text-foreground">
                                    {viewingTransaction.account_name ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account Number</p>
                                <p className="mt-1 text-sm text-foreground">
                                    {viewingTransaction.account_number ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                                <p className="mt-1 text-sm leading-6 text-foreground">
                                    {viewingTransaction.notes || 'No notes'}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                                {viewingTransaction.order_id && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="inline-flex items-center gap-2 rounded-xl border-border text-foreground hover:bg-muted/30"
                                        onClick={() => {
                                            closeViewDrawer();
                                            goToOrder(viewingTransaction);
                                        }}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Manage Order
                                    </Button>
                                )}

                                {viewingTransaction.status !== 'verified' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="inline-flex items-center gap-2 rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-300"
                                        onClick={() => {
                                            closeViewDrawer();
                                            deleteTransaction(viewingTransaction);
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