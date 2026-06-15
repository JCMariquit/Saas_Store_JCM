import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    ChevronDown,
    CreditCard,
    Eye,
    Receipt,
    RotateCcw,
    Search,
    ShoppingBag,
    Wallet,
} from 'lucide-react';
import { Fragment, useState } from 'react';

const TRANSACTIONS_URL = '/staff/cashier/transactions';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cashier', href: '/staff/cashier/dashboard' },
    { title: 'Transactions', href: TRANSACTIONS_URL },
];

type SaleItem = {
    id: number;
    sale_id: number;
    product_id: number;
    product_name: string;
    sku?: string | null;
    quantity: string | number;
    unit_price: string | number;
    discount_amount: string | number;
    line_total: string | number;
};

type Payment = {
    id: number;
    sale_id: number;
    method: string;
    amount: string | number;
    reference_no?: string | null;
    remarks?: string | null;
    created_at: string;
};

type Sale = {
    id: number;
    sale_no: string;
    subtotal: string | number;
    discount_total: string | number;
    tax_total: string | number;
    grand_total: string | number;
    amount_paid: string | number;
    change_amount: string | number;
    payment_status: string;
    status: string;
    remarks?: string | null;
    sold_at: string;
    items: SaleItem[];
    payments: Payment[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PageProps = {
    sales: {
        data: Sale[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    summary: {
        total_transactions: number;
        total_sales: number;
        today_transactions: number;
        today_sales: number;
    };
    filters: {
        search?: string | null;
        status?: string | null;
        payment_method?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
};

export default function CashierTransactionsIndex({ sales, summary, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [openSaleId, setOpenSaleId] = useState<number | null>(null);

    const money = (value: number | string | null | undefined) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (value: string | null | undefined) => {
        if (!value) return '—';

        return new Date(value).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const applyFilters = () => {
        router.get(
            TRANSACTIONS_URL,
            {
                search,
                status,
                payment_method: paymentMethod,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setPaymentMethod('');
        setDateFrom('');
        setDateTo('');
        setOpenSaleId(null);

        router.get(TRANSACTIONS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const paymentBadge = (method?: string) => {
        const value = method ?? 'unknown';

        if (value === 'cash') {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                    <Banknote className="size-3.5" />
                    Cash
                </span>
            );
        }

        if (value === 'card') {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <CreditCard className="size-3.5" />
                    Card
                </span>
            );
        }

        if (value === 'gcash') {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    <Wallet className="size-3.5" />
                    GCash
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                <Wallet className="size-3.5" />
                {value.replace('_', ' ')}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cashier Transactions" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Today Sales" value={money(summary.today_sales)} icon={<Banknote className="size-5" />} />
                    <SummaryCard title="Today Transactions" value={summary.today_transactions.toString()} icon={<Receipt className="size-5" />} />
                    <SummaryCard title="Filtered Sales" value={money(summary.total_sales)} icon={<ShoppingBag className="size-5" />} />
                    <SummaryCard title="Filtered Transactions" value={summary.total_transactions.toString()} icon={<CalendarDays className="size-5" />} />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="size-5 text-primary" />
                                    Cashier Transactions
                                </CardTitle>
                                <CardDescription>
                                    View your own completed sales transactions in your assigned branch.
                                </CardDescription>
                            </div>

                            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                                Showing <span className="font-semibold">{sales.from ?? 0}</span> -{' '}
                                <span className="font-semibold">{sales.to ?? 0}</span> of{' '}
                                <span className="font-semibold">{sales.total}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 p-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_160px_160px_160px_auto_auto]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search sale no, product, SKU, reference..."
                                    className="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="void">Void</option>
                                <option value="refunded">Refunded</option>
                            </select>

                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Payments</option>
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                                <option value="card">Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />

                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                            >
                                Filter
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/60 text-left">
                                        <tr>
                                            <th className="w-12 px-4 py-3"></th>
                                            <th className="px-4 py-3 font-medium">Sale No</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Payment</th>
                                            <th className="px-4 py-3 text-center font-medium">Items</th>
                                            <th className="px-4 py-3 text-right font-medium">Total</th>
                                            <th className="px-4 py-3 text-center font-medium">Status</th>
                                            <th className="px-4 py-3 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sales.data.length > 0 ? (
                                            sales.data.map((sale) => {
                                                const isOpen = openSaleId === sale.id;
                                                const firstPayment = sale.payments?.[0];

                                                return (
                                                    <Fragment key={sale.id}>
                                                        <tr className="border-t hover:bg-muted/30">
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenSaleId(isOpen ? null : sale.id)}
                                                                    className="inline-flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
                                                                >
                                                                    <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                                </button>
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold">{sale.sale_no}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    Paid: {money(sale.amount_paid)} · Change: {money(sale.change_amount)}
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 text-muted-foreground">{formatDate(sale.sold_at)}</td>

                                                            <td className="px-4 py-3">{paymentBadge(firstPayment?.method)}</td>

                                                            <td className="px-4 py-3 text-center font-semibold">{sale.items.length}</td>

                                                            <td className="px-4 py-3 text-right font-bold">{money(sale.grand_total)}</td>

                                                            <td className="px-4 py-3 text-center">
                                                                <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold capitalize text-green-700 dark:bg-green-950 dark:text-green-300">
                                                                    {sale.status}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenSaleId(isOpen ? null : sale.id)}
                                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold hover:bg-muted"
                                                                >
                                                                    <Eye className="size-4" />
                                                                    Details
                                                                </button>
                                                            </td>
                                                        </tr>

                                                        {isOpen && (
                                                            <tr className="border-t bg-muted/20">
                                                                <td></td>
                                                                <td colSpan={7} className="px-4 py-4">
                                                                    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                                                                        <div className="rounded-xl border bg-background p-4">
                                                                            <div className="mb-3 font-semibold">Sold Items</div>

                                                                            <div className="space-y-2">
                                                                                {sale.items.map((item) => (
                                                                                    <div
                                                                                        key={item.id}
                                                                                        className="flex items-center justify-between rounded-lg border p-3"
                                                                                    >
                                                                                        <div>
                                                                                            <div className="font-medium">{item.product_name}</div>
                                                                                            <div className="text-xs text-muted-foreground">
                                                                                                SKU: {item.sku || 'N/A'} · Qty: {Number(item.quantity)}
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="text-right">
                                                                                            <div className="font-semibold">{money(item.line_total)}</div>
                                                                                            <div className="text-xs text-muted-foreground">
                                                                                                {money(item.unit_price)} each
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        <div className="rounded-xl border bg-background p-4">
                                                                            <div className="mb-3 font-semibold">Payment Summary</div>

                                                                            <div className="space-y-2 text-sm">
                                                                                <SummaryLine label="Subtotal" value={money(sale.subtotal)} />
                                                                                <SummaryLine label="Discount" value={`-${money(sale.discount_total)}`} />
                                                                                <SummaryLine label="Tax" value={money(sale.tax_total)} />
                                                                                <SummaryLine label="Grand Total" value={money(sale.grand_total)} strong />
                                                                                <SummaryLine label="Amount Paid" value={money(sale.amount_paid)} />
                                                                                <SummaryLine label="Change" value={money(sale.change_amount)} />
                                                                            </div>

                                                                            {firstPayment?.reference_no && (
                                                                                <div className="mt-4 rounded-lg bg-muted p-3 text-xs">
                                                                                    <div className="text-muted-foreground">Reference No.</div>
                                                                                    <div className="mt-1 font-semibold">{firstPayment.reference_no}</div>
                                                                                </div>
                                                                            )}

                                                                            {sale.remarks && (
                                                                                <div className="mt-4 rounded-lg bg-muted p-3 text-xs">
                                                                                    <div className="text-muted-foreground">Remarks</div>
                                                                                    <div className="mt-1">{sale.remarks}</div>
                                                                                </div>
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
                                                <td colSpan={8} className="px-4 py-16 text-center">
                                                    <Receipt className="mx-auto mb-3 size-10 text-muted-foreground" />
                                                    <h3 className="font-semibold">No transactions found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Completed cashier sales will appear here.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {sales.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    className={`rounded-md border px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>

                <div>
                    <div className="text-sm text-muted-foreground">{title}</div>
                    <div className="text-xl font-bold">{value}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function SummaryLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={`flex justify-between ${strong ? 'border-t pt-2 text-base font-bold' : ''}`}>
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}