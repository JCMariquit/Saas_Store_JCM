import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Banknote,
    Barcode,
    ChevronDown,
    CreditCard,
    Hash,
    Package,
    Receipt,
    RotateCcw,
    Search,
    ShoppingBag,
    User,
    Wallet,
} from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/sales/transactions',
    },
];

type SaleItem = {
    id: number;
    sale_id: number;
    product_id: number;
    product_name: string;
    sku?: string | null;
    quantity: number | string;
    unit_price: number | string;
    unit_cost: number | string;
    discount_amount: number | string;
    line_total: number | string;
};

type Transaction = {
    id: number;
    sale_no: string;
    subtotal: number | string;
    discount_total: number | string;
    tax_total: number | string;
    grand_total: number | string;
    amount_paid: number | string;
    change_amount: number | string;
    payment_status: 'paid' | 'partial' | 'unpaid';
    status: 'completed' | 'voided' | 'refunded';
    remarks?: string | null;
    sold_at?: string | null;
    cashier_name?: string | null;
    payment_method?: 'cash' | 'gcash' | 'card' | 'bank_transfer' | null;
    reference_no?: string | null;
    payment_remarks?: string | null;
    items: SaleItem[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PageProps = {
    transactions: {
        data: Transaction[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    summary: {
        total_sales: number | string;
        transactions: number;
        average_sale: number | string;
        total_items: number | string;
    };
    filters: {
        search?: string | null;
        status?: string | null;
        payment_method?: string | null;
    };
};

export default function TransactionsIndex({ transactions, summary, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [paymentMethod, setPaymentMethod] = useState(filters?.payment_method ?? '');
    const [openSaleId, setOpenSaleId] = useState<number | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/sales/transactions',
                {
                    search,
                    status,
                    payment_method: paymentMethod,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, status, paymentMethod]);

    const money = (value: number | string) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (value?: string | null) => {
        if (!value) return '—';

        return new Date(value).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setPaymentMethod('');

        router.get(
            '/sales/transactions',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };


    const paymentLabel = (method?: string | null) => {
        if (!method) return 'No Payment';
        return method.replace('_', ' ').toUpperCase();
    };

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Transactions" />

        <div className="flex min-h-screen flex-col gap-4 p-4">
            {/* HEADER */}
            <Card tone="topline" variant="default" className="shrink-0 overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Receipt className="size-5" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">Sales Transactions</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Review POS sales, payment references, sold items, and transaction status.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-2 text-sm">
                            <ShoppingBag className="size-4 text-primary" />
                            <span className="font-bold">{transactions.total}</span>
                            <span className="text-muted-foreground">records found</span>
                        </div>
                    </div>

                    {/* FILTERS */}
                    <div className="mt-5 grid gap-2 lg:grid-cols-[minmax(280px,1fr)_180px_190px_44px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search sale no. or payment reference..."
                                className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-11 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="voided">Voided</option>
                            <option value="refunded">Refunded</option>
                        </select>

                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-11 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">All Payments</option>
                            <option value="cash">Cash</option>
                            <option value="gcash">GCash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex h-11 items-center justify-center rounded-xl border bg-background transition hover:bg-muted"
                            title="Reset filters"
                        >
                            <RotateCcw className="size-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* KPI */}
            <div className="grid shrink-0 gap-4 md:grid-cols-4">
                <SummaryCard icon={<Receipt className="size-5" />} label="Total Sales" value={money(summary.total_sales)} />
                <SummaryCard icon={<Hash className="size-5" />} label="Transactions" value={String(summary.transactions)} />
                <SummaryCard icon={<Banknote className="size-5" />} label="Average Sale" value={money(summary.average_sale)} />
                <SummaryCard icon={<Package className="size-5" />} label="Items Sold" value={Number(summary.total_items ?? 0).toLocaleString()} />
            </div>

            {/* TABLE */}
            <Card className="overflow-hidden">
                <CardHeader className="shrink-0 border-b px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Receipt className="size-4 text-primary" />
                        Transaction List
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="transactions-scrollbar overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-background/95 text-left shadow-sm backdrop-blur">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="w-12 px-5 py-3"></th>
                                    <th className="px-4 py-3 font-semibold">Sale</th>
                                    <th className="px-4 py-3 font-semibold">Cashier</th>
                                    <th className="px-4 py-3 font-semibold">Payment</th>
                                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                                    <th className="px-5 py-3 text-right font-semibold">Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => {
                                        const isOpen = openSaleId === transaction.id;

                                        return (
                                            <Fragment key={transaction.id}>
                                                <tr className="border-t transition hover:bg-muted/35">
                                                    <td className="px-5 py-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenSaleId(isOpen ? null : transaction.id)}
                                                            className="inline-flex size-8 items-center justify-center rounded-lg border bg-background shadow-sm transition hover:bg-muted"
                                                        >
                                                            <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="font-bold">{transaction.sale_no}</div>
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            {transaction.items.length} item line{transaction.items.length === 1 ? '' : 's'}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <User className="size-4" />
                                                            <span>{transaction.cashier_name ?? 'Unknown'}</span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <PaymentBadge method={transaction.payment_method} />
                                                        {transaction.reference_no && (
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                Ref: {transaction.reference_no}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-right">
                                                        <div className="text-base font-bold">{money(transaction.grand_total)}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Paid: {money(transaction.amount_paid)}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-center">
                                                        <StatusBadge status={transaction.status} />
                                                    </td>

                                                    <td className="px-5 py-4 text-right text-muted-foreground">
                                                        {formatDate(transaction.sold_at)}
                                                    </td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td></td>
                                                        <td colSpan={6} className="px-5 py-5">
                                                            <div className="grid gap-4 rounded-2xl border bg-background p-4 shadow-sm xl:grid-cols-[minmax(0,1fr)_340px]">
                                                                <div className="min-w-0">
                                                                    <div className="mb-3 flex items-center gap-2 font-semibold">
                                                                        <Package className="size-4 text-primary" />
                                                                        Sold Items
                                                                    </div>

                                                                    <div className="overflow-hidden rounded-xl border">
                                                                        <table className="w-full text-sm">
                                                                            <thead className="bg-muted/60">
                                                                                <tr>
                                                                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                                                                    <th className="px-4 py-3 text-center font-medium">Qty</th>
                                                                                    <th className="px-4 py-3 text-right font-medium">Price</th>
                                                                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                                                                </tr>
                                                                            </thead>

                                                                            <tbody>
                                                                                {transaction.items.map((item) => (
                                                                                    <tr key={item.id} className="border-t">
                                                                                        <td className="px-4 py-3">
                                                                                            <div className="font-semibold">{item.product_name}</div>
                                                                                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                                                                <Barcode className="size-3.5" />
                                                                                                SKU: {item.sku || 'N/A'}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-center">{Number(item.quantity)}</td>
                                                                                        <td className="px-4 py-3 text-right">{money(item.unit_price)}</td>
                                                                                        <td className="px-4 py-3 text-right font-bold">{money(item.line_total)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                                                                    <div className="flex items-center gap-2 font-semibold">
                                                                        <Wallet className="size-4 text-primary" />
                                                                        Payment Summary
                                                                    </div>

                                                                    <SummaryLine label="Subtotal" value={money(transaction.subtotal)} />
                                                                    <SummaryLine label="Discount" value={money(transaction.discount_total)} muted />
                                                                    <SummaryLine label="Tax" value={money(transaction.tax_total)} muted />

                                                                    <div className="flex justify-between border-t pt-3 text-base font-bold">
                                                                        <span>Grand Total</span>
                                                                        <span>{money(transaction.grand_total)}</span>
                                                                    </div>

                                                                    <SummaryLine label="Amount Paid" value={money(transaction.amount_paid)} />
                                                                    <SummaryLine label="Change" value={money(transaction.change_amount)} />
                                                                    <SummaryLine label="Payment Status" value={transaction.payment_status.toUpperCase()} />
                                                                    <SummaryLine label="Payment Method" value={paymentLabel(transaction.payment_method)} />

                                                                    {transaction.reference_no && (
                                                                        <SummaryLine label="Reference No." value={transaction.reference_no} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <Receipt className="mx-auto mb-3 size-10 text-muted-foreground" />
                                            <h3 className="font-semibold">No transactions found</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Try changing your search or filters.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                    Showing {transactions.from ?? 0} to {transactions.to ?? 0} of {transactions.total}
                </div>

                <div className="flex flex-wrap gap-1">
                    {transactions.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                                link.active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    </AppLayout>
);
}

function SummaryCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon}
                </div>

                <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="truncate text-2xl font-bold tracking-tight">{value}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function SummaryLine({
    label,
    value,
    muted = false,
}: {
    label: string;
    value: string;
    muted?: boolean;
}) {
    return (
        <div className={`flex justify-between gap-3 text-sm ${muted ? 'text-muted-foreground' : ''}`}>
            <span>{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const className =
        status === 'completed'
            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
            : status === 'refunded'
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';

    return (
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${className}`}>
            {status}
        </span>
    );
}
function PaymentBadge({ method }: { method?: string | null }) {
    const label = !method ? 'No Payment' : method.replace('_', ' ').toUpperCase();

    return (
        <span className="inline-flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1 text-xs font-semibold shadow-sm">
            {method === 'cash' ? (
                <Banknote className="size-3.5 text-green-600" />
            ) : method === 'card' ? (
                <CreditCard className="size-3.5 text-blue-600" />
            ) : (
                <Wallet className="size-3.5 text-primary" />
            )}
            {label}
        </span>
    );
}