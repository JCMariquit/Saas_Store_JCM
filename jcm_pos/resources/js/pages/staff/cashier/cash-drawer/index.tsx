import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownCircle,
    ArrowUpCircle,
    CheckCircle2,
    Clock,
    Lock,
    Receipt,
    RotateCcw,
    WalletCards,
} from 'lucide-react';
import { FormEvent } from 'react';

const CASH_DRAWER_URL = '/staff/cashier/cash-drawer';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cashier', href: '/staff/cashier/dashboard' },
    { title: 'Cash Drawer', href: CASH_DRAWER_URL },
];

type CashDrawer = {
    id: number;
    opening_balance: string | number;
    expected_balance: string | number;
    actual_balance: string | number | null;
    variance_amount: string | number | null;
    total_cash_sales: string | number;
    total_refunds: string | number;
    total_cash_in: string | number;
    total_cash_out: string | number;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at?: string | null;
    notes?: string | null;
};

type CashDrawerTransaction = {
    id: number;
    cash_drawer_id: number;
    type: string;
    cash_out_source?: string | null;
    amount: string | number;
    reference_type?: string | null;
    reference_id?: number | null;
    withdrawn_at?: string | null;
    remarks?: string | null;
    created_at: string;
    drawer_status?: string;
    drawer_opened_at?: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PageProps = {
    openDrawer: CashDrawer | null;
    drawers: {
        data: CashDrawer[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    transactions: CashDrawerTransaction[];
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
};

export default function CashierCashDrawerIndex({
    openDrawer,
    drawers,
    transactions,
    flash,
    errors,
}: PageProps) {
    const openForm = useForm({
        opening_balance: '',
        notes: '',
    });

    const cashInForm = useForm({
        amount: '',
        remarks: '',
    });

    const cashOutForm = useForm({
        amount: '',
        cash_out_source: 'change_fund',
        remarks: '',
    });

    const closeForm = useForm({
        actual_balance: openDrawer ? String(openDrawer.expected_balance ?? '') : '',
        notes: '',
    });

    const money = (value: number | string | null | undefined) =>
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openDrawerSubmit = (event: FormEvent) => {
        event.preventDefault();

        openForm.post(`${CASH_DRAWER_URL}/open`, {
            preserveScroll: true,
            onSuccess: () => openForm.reset(),
        });
    };

    const cashInSubmit = (event: FormEvent) => {
        event.preventDefault();

        cashInForm.post(`${CASH_DRAWER_URL}/cash-in`, {
            preserveScroll: true,
            onSuccess: () => cashInForm.reset(),
        });
    };

    const cashOutSubmit = (event: FormEvent) => {
        event.preventDefault();

        cashOutForm.post(`${CASH_DRAWER_URL}/cash-out`, {
            preserveScroll: true,
            onSuccess: () => cashOutForm.reset(),
        });
    };

    const closeDrawerSubmit = (event: FormEvent) => {
        event.preventDefault();

        closeForm.post(`${CASH_DRAWER_URL}/close`, {
            preserveScroll: true,
            onSuccess: () => closeForm.reset(),
        });
    };

    const transactionTypeBadge = (type: string) => {
        const normalized = type.replace('_', ' ');

        if (type === 'cash_sale') {
            return (
                <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold capitalize text-green-700 dark:bg-green-950 dark:text-green-300">
                    Cash Sale
                </span>
            );
        }

        if (type === 'cash_in' || type === 'opening_balance') {
            return (
                <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {normalized}
                </span>
            );
        }

        if (type === 'cash_out') {
            return (
                <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold capitalize text-red-700 dark:bg-red-950 dark:text-red-300">
                    Cash Out
                </span>
            );
        }

        return (
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold capitalize">
                {normalized}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cashier Cash Drawer" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="size-4" />
                        {flash.success}
                    </div>
                )}

                {(flash?.error || Object.keys(errors ?? {}).length > 0) && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        <AlertCircle className="size-4" />
                        {flash?.error || Object.values(errors ?? {})[0]}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        title="Drawer Status"
                        value={openDrawer ? 'Open' : 'Closed'}
                        icon={<WalletCards className="size-5" />}
                        tone={openDrawer ? 'success' : 'muted'}
                    />
                    <SummaryCard
                        title="Expected Balance"
                        value={money(openDrawer?.expected_balance ?? 0)}
                        icon={<Receipt className="size-5" />}
                    />
                    <SummaryCard
                        title="Cash Sales"
                        value={money(openDrawer?.total_cash_sales ?? 0)}
                        icon={<ArrowUpCircle className="size-5" />}
                    />
                    <SummaryCard
                        title="Cash Out"
                        value={money(openDrawer?.total_cash_out ?? 0)}
                        icon={<ArrowDownCircle className="size-5" />}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <div className="space-y-4">
                        {!openDrawer ? (
                            <Card tone="topline" variant="default">
                                <CardHeader className="border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <WalletCards className="size-5 text-primary" />
                                        Open Cash Drawer
                                    </CardTitle>
                                    <CardDescription>
                                        Start your cashier shift by opening a drawer.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-4">
                                    <form onSubmit={openDrawerSubmit} className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">
                                                Opening Balance
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={openForm.data.opening_balance}
                                                onChange={(e) =>
                                                    openForm.setData('opening_balance', e.target.value)
                                                }
                                                placeholder="0.00"
                                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium">
                                                Notes
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={openForm.data.notes}
                                                onChange={(e) => openForm.setData('notes', e.target.value)}
                                                placeholder="Optional shift notes..."
                                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={openForm.processing}
                                            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                        >
                                            {openForm.processing ? 'Opening...' : 'Open Drawer'}
                                        </button>
                                    </form>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <Card tone="topline" variant="success">
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <WalletCards className="size-5 text-primary" />
                                            Current Open Drawer
                                        </CardTitle>
                                        <CardDescription>
                                            Opened at {formatDate(openDrawer.opened_at)}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-3 p-4">
                                        <DrawerLine label="Opening Balance" value={money(openDrawer.opening_balance)} />
                                        <DrawerLine label="Cash Sales" value={money(openDrawer.total_cash_sales)} />
                                        <DrawerLine label="Cash In" value={money(openDrawer.total_cash_in)} />
                                        <DrawerLine label="Cash Out" value={money(openDrawer.total_cash_out)} />
                                        <DrawerLine label="Refunds" value={money(openDrawer.total_refunds)} />
                                        <DrawerLine label="Expected Balance" value={money(openDrawer.expected_balance)} strong />

                                        {openDrawer.notes && (
                                            <div className="rounded-lg bg-muted p-3 text-xs">
                                                <div className="text-muted-foreground">Notes</div>
                                                <div className="mt-1">{openDrawer.notes}</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <ArrowUpCircle className="size-5 text-primary" />
                                            Cash In
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-4">
                                        <form onSubmit={cashInSubmit} className="space-y-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={cashInForm.data.amount}
                                                onChange={(e) => cashInForm.setData('amount', e.target.value)}
                                                placeholder="Amount"
                                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />

                                            <textarea
                                                rows={2}
                                                value={cashInForm.data.remarks}
                                                onChange={(e) => cashInForm.setData('remarks', e.target.value)}
                                                placeholder="Remarks"
                                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />

                                            <button
                                                type="submit"
                                                disabled={cashInForm.processing}
                                                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                            >
                                                Save Cash In
                                            </button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <ArrowDownCircle className="size-5 text-primary" />
                                            Cash Out
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-4">
                                        <form onSubmit={cashOutSubmit} className="space-y-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={cashOutForm.data.amount}
                                                onChange={(e) => cashOutForm.setData('amount', e.target.value)}
                                                placeholder="Amount"
                                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />

                                            <select
                                                value={cashOutForm.data.cash_out_source}
                                                onChange={(e) =>
                                                    cashOutForm.setData('cash_out_source', e.target.value)
                                                }
                                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="change_fund">Change Fund</option>
                                                <option value="sales">Sales Cash</option>
                                            </select>

                                            <textarea
                                                rows={2}
                                                value={cashOutForm.data.remarks}
                                                onChange={(e) => cashOutForm.setData('remarks', e.target.value)}
                                                placeholder="Remarks"
                                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />

                                            <button
                                                type="submit"
                                                disabled={cashOutForm.processing}
                                                className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                                            >
                                                Save Cash Out
                                            </button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Lock className="size-5 text-primary" />
                                            Close Drawer
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-4">
                                        <form onSubmit={closeDrawerSubmit} className="space-y-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={closeForm.data.actual_balance}
                                                onChange={(e) =>
                                                    closeForm.setData('actual_balance', e.target.value)
                                                }
                                                placeholder="Actual counted cash"
                                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />

                                            <textarea
                                                rows={2}
                                                value={closeForm.data.notes}
                                                onChange={(e) => closeForm.setData('notes', e.target.value)}
                                                placeholder="Closing notes"
                                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            />

                                            <button
                                                type="submit"
                                                disabled={closeForm.processing}
                                                className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                                            >
                                                Close Drawer
                                            </button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="border-b">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="size-5 text-primary" />
                                            Recent Drawer Transactions
                                        </CardTitle>
                                        <CardDescription>
                                            Latest cash drawer movements from your account.
                                        </CardDescription>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.get(CASH_DRAWER_URL, {}, { preserveState: true, preserveScroll: true })
                                        }
                                        className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold hover:bg-muted"
                                    >
                                        <RotateCcw className="size-4" />
                                        Refresh
                                    </button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/60 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Type</th>
                                                <th className="px-4 py-3 font-medium">Source</th>
                                                <th className="px-4 py-3 text-right font-medium">Amount</th>
                                                <th className="px-4 py-3 font-medium">Remarks</th>
                                                <th className="px-4 py-3 font-medium">Date</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {transactions.length > 0 ? (
                                                transactions.map((transaction) => (
                                                    <tr key={transaction.id} className="border-t hover:bg-muted/30">
                                                        <td className="px-4 py-3">
                                                            {transactionTypeBadge(transaction.type)}
                                                        </td>

                                                        <td className="px-4 py-3 text-muted-foreground capitalize">
                                                            {transaction.cash_out_source?.replace('_', ' ') || transaction.reference_type || '—'}
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-bold">
                                                            {money(transaction.amount)}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <div className="max-w-[260px] truncate text-muted-foreground">
                                                                {transaction.remarks || '—'}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {formatDate(transaction.created_at)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-16 text-center">
                                                        <WalletCards className="mx-auto mb-3 size-10 text-muted-foreground" />
                                                        <h3 className="font-semibold">No drawer transactions</h3>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            Cash drawer movements will appear here.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="size-5 text-primary" />
                                    Drawer History
                                </CardTitle>
                                <CardDescription>
                                    Previous cash drawer sessions from your account.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 p-4">
                                <div className="overflow-hidden rounded-xl border">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/60 text-left">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Opened</th>
                                                    <th className="px-4 py-3 font-medium">Closed</th>
                                                    <th className="px-4 py-3 text-right font-medium">Expected</th>
                                                    <th className="px-4 py-3 text-right font-medium">Actual</th>
                                                    <th className="px-4 py-3 text-right font-medium">Variance</th>
                                                    <th className="px-4 py-3 text-center font-medium">Status</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {drawers.data.length > 0 ? (
                                                    drawers.data.map((drawer) => {
                                                        const variance = Number(drawer.variance_amount ?? 0);

                                                        return (
                                                            <tr key={drawer.id} className="border-t hover:bg-muted/30">
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {formatDate(drawer.opened_at)}
                                                                </td>

                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {formatDate(drawer.closed_at)}
                                                                </td>

                                                                <td className="px-4 py-3 text-right font-semibold">
                                                                    {money(drawer.expected_balance)}
                                                                </td>

                                                                <td className="px-4 py-3 text-right">
                                                                    {drawer.actual_balance === null ? '—' : money(drawer.actual_balance)}
                                                                </td>

                                                                <td
                                                                    className={`px-4 py-3 text-right font-semibold ${
                                                                        variance < 0
                                                                            ? 'text-red-600'
                                                                            : variance > 0
                                                                              ? 'text-green-600'
                                                                              : ''
                                                                    }`}
                                                                >
                                                                    {drawer.variance_amount === null ? '—' : money(drawer.variance_amount)}
                                                                </td>

                                                                <td className="px-4 py-3 text-center">
                                                                    <span
                                                                        className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${
                                                                            drawer.status === 'open'
                                                                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                                                : 'bg-muted text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        {drawer.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-16 text-center">
                                                            <Receipt className="mx-auto mb-3 size-10 text-muted-foreground" />
                                                            <h3 className="font-semibold">No drawer history</h3>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                Open and closed drawers will appear here.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {drawers.links.map((link, index) => (
                                        <button
                                            key={index}
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })
                                            }
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
                </div>
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    tone = 'default',
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    tone?: 'default' | 'success' | 'muted';
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-4">
                <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                        tone === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : tone === 'muted'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/10 text-primary'
                    }`}
                >
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

function DrawerLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={`flex justify-between text-sm ${strong ? 'border-t pt-3 text-base font-bold' : ''}`}>
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}