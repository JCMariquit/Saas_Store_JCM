import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

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

    const deleteTransaction = (transaction: TransactionRow) => {
        router.delete(route('admin.transactions.destroy', transaction.id), {
            preserveScroll: true,
        });
    };

    const goToOrder = (transaction: TransactionRow) => {
        if (!transaction.order_id) return;

        router.get(route('admin.orders.index'), { search: transaction.order_code }, { preserveScroll: true });
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
                return 'border-green-200 bg-green-100 text-green-700';
            case 'rejected':
                return 'border-red-200 bg-red-100 text-red-700';
            default:
                return 'border-yellow-200 bg-yellow-100 text-yellow-700';
        }
    };

    const orderStatusClass = (status: TransactionRow['order_status']) => {
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

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Transactions
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            View all payment transactions, references, and linked order records.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Transactions</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">
                            {stats.total_transactions}
                        </h3>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Submitted</p>
                        <h3 className="mt-2 text-2xl font-bold text-yellow-600">
                            {stats.submitted_transactions}
                        </h3>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Verified</p>
                        <h3 className="mt-2 text-2xl font-bold text-green-600">
                            {stats.verified_transactions}
                        </h3>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Rejected</p>
                        <h3 className="mt-2 text-2xl font-bold text-red-600">
                            {stats.rejected_transactions}
                        </h3>
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
                                <h2 className="text-lg font-semibold text-slate-900">Transaction List</h2>
                                <p className="mt-1 text-sm text-slate-500">{resultsText}</p>
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Label htmlFor="transaction-search" className="sr-only">
                                    Search transactions
                                </Label>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="transaction-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search transaction, order, ref..."
                                    className="rounded-md pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Transaction</th>
                                    <th className="px-4 py-3 text-left font-medium">Order</th>
                                    <th className="px-4 py-3 text-left font-medium">User</th>
                                    <th className="px-4 py-3 text-left font-medium">Product / Plan</th>
                                    <th className="px-4 py-3 text-left font-medium">Payment</th>
                                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                                    <th className="px-4 py-3 text-left font-medium">Transaction Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Order Status</th>
                                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                                            onClick={() => openViewDrawer(transaction)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">
                                                    {transaction.transaction_code}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {transaction.paid_at ?? '-'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {transaction.order_code ?? '-'}
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {transaction.user_name ?? '-'}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">
                                                    {transaction.product_name ?? '-'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {transaction.plan_name ?? '-'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="text-slate-700">
                                                    {transaction.payment_method?.toUpperCase() ?? '-'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Ref: {transaction.reference_number ?? '-'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {formatPrice(transaction.amount)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${txStatusClass(
                                                        transaction.status,
                                                    )}`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                {transaction.order_status ? (
                                                    <span
                                                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${orderStatusClass(
                                                            transaction.order_status,
                                                        )}`}
                                                    >
                                                        {orderStatusLabel(transaction.order_status)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div
                                                    className="flex items-center justify-center gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {transaction.order_id && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 rounded-md border-slate-300 px-3 text-slate-700 hover:bg-slate-50"
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
                                                            className="h-9 rounded-md border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
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
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transactions.links.length > 3 && (
                        <div className="border-t border-slate-200 px-5 py-4">
                            <div className="flex flex-wrap gap-2">
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
                                        className={`rounded-md border px-3 py-2 text-sm transition ${
                                            link.active
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : link.url
                                                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                  : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {viewingTransaction && (
                    <div className="fixed inset-0 z-50">
                        <div
                            className="absolute inset-0 bg-slate-950/40"
                            onClick={closeViewDrawer}
                        />

                        <div className="absolute right-0 top-0 flex h-screen w-full max-w-md flex-col bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
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
                                            className="inline-flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
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
                                            className="inline-flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
            </div>
        </AppLayout>
    );
}