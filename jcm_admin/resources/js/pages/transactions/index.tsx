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

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/jcm-ui/page-hero';
import { StatsCard } from '@/components/jcm-ui/stats-card';
import { SectionCard } from '@/components/jcm-ui/section-card';
import { SearchInput } from '@/components/jcm-ui/search-input';
import { DataTable } from '@/components/jcm-ui/data-table';

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
                return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'rejected':
                return 'border-red-200 bg-red-50 text-red-700';
            default:
                return 'border-amber-200 bg-amber-50 text-amber-700';
        }
    };

    const orderStatusClass = (status: TransactionRow['order_status']) => {
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

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
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
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
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
                                    className="h-11 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
                                        <div className="font-medium text-slate-900">
                                            {transaction.transaction_code}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {transaction.paid_at ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {transaction.order_code ?? '-'}
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {transaction.user_name ?? '-'}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-900">
                                            {transaction.product_name ?? '-'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {transaction.plan_name ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="text-slate-700">
                                            {transaction.payment_method?.toUpperCase() ?? '-'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Ref: {transaction.reference_number ?? '-'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
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
                                            <span className="text-slate-400">-</span>
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
                                                    className="h-10 rounded-xl border-slate-300 px-3 text-slate-700 hover:bg-slate-50"
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
                                                    className="h-10 rounded-xl border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
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
                                                ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                : link.url
                                                  ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                                  : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
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
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute right-0 top-0 flex h-screen w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Transaction Details</h2>
                                <p className="text-sm text-slate-500">View full transaction information</p>
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
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Transaction Code</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {viewingTransaction.transaction_code}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Code</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {viewingTransaction.order_code ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">User</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {viewingTransaction.user_name ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Product</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {viewingTransaction.product_name ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {viewingTransaction.plan_name ?? '-'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment Method</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {viewingTransaction.payment_method?.toUpperCase() ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reference Number</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {viewingTransaction.reference_number ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {formatPrice(viewingTransaction.amount)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Transaction Status</p>
                                    <p className="mt-1 text-sm capitalize text-slate-900">
                                        {viewingTransaction.status}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Status</p>
                                    <p className="mt-1 text-sm capitalize text-slate-900">
                                        {orderStatusLabel(viewingTransaction.order_status)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Paid At</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {viewingTransaction.paid_at ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Verified At</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {viewingTransaction.verified_at ?? '-'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account Name</p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {viewingTransaction.account_name ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account Number</p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {viewingTransaction.account_number ?? '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
                                <p className="mt-1 text-sm leading-6 text-slate-900">
                                    {viewingTransaction.notes || 'No notes'}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                                {viewingTransaction.order_id && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="inline-flex items-center gap-2 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
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
                                        className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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