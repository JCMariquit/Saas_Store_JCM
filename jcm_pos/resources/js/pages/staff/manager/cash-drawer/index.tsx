import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    CircleDollarSign,
    DoorClosed,
    DoorOpen,
    MinusCircle,
    PlusCircle,
    ReceiptText,
    Store,
    Wallet,
    X,
} from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const CASH_DRAWER_URL = '/staff/manager/cash-drawer';
const OPEN_URL = '/staff/manager/cash-drawer/open';
const CASH_IN_URL = '/staff/manager/cash-drawer/cash-in';
const CASH_OUT_URL = '/staff/manager/cash-drawer/cash-out';
const CLOSE_URL = '/staff/manager/cash-drawer/close';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Cash Drawer', href: CASH_DRAWER_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type CashDrawer = {
    id: number;
    opening_balance: string | number;
    expected_balance: string | number;
    actual_balance?: string | number | null;
    variance_amount?: string | number | null;
    total_cash_sales: string | number;
    total_refunds: string | number;
    total_cash_in: string | number;
    total_cash_out: string | number;
    status: 'open' | 'closed' | string;
    opened_at?: string | null;
    closed_at?: string | null;
    notes?: string | null;
};

type DrawerTransaction = {
    id: number;
    type: string;
    cash_out_source?: 'change_fund' | 'cash_sales' | string | null;
    amount: string | number;
    remarks?: string | null;
    withdrawn_at?: string | null;
    created_at?: string | null;
};

type DrawerHistoryItem = CashDrawer;

type Props = {
    branch: Branch;
    drawer?: CashDrawer | null;
    transactions?: DrawerTransaction[];
    drawerHistory?: DrawerHistoryItem[];
    availableChangeFund?: number;
    availableCashSales?: number;
};

function money(value?: string | number | null) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isNaN(amount) ? 0 : amount);
}

function numberValue(value?: string | number | null) {
    const amount = Number(value ?? 0);
    return Number.isNaN(amount) ? 0 : amount;
}

function shortDateTime(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function transactionLabel(item: DrawerTransaction) {
    if (item.type === 'cash_out') {
        return item.cash_out_source === 'cash_sales' ? 'Cash Out - Cash Sales' : 'Cash Out - Change Fund';
    }

    const labels: Record<string, string> = {
        opening: 'Opening Balance',
        cash_in: 'Cash In / Add Change Fund',
        cash_sale: 'Cash Sale',
        refund: 'Refund',
        closing_adjustment: 'Closing Adjustment',
    };

    return labels[item.type] ?? item.type.replaceAll('_', ' ');
}

function transactionClass(item: DrawerTransaction) {
    if (item.type === 'cash_out' || item.type === 'refund') {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    if (item.type === 'cash_in' || item.type === 'opening' || item.type === 'cash_sale') {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    return 'bg-muted text-muted-foreground';
}

function drawerStatusClass(status?: string | null) {
    if (status === 'open') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (status === 'closed') return 'bg-muted text-muted-foreground';

    return 'bg-muted text-muted-foreground';
}

export default function ManagerCashDrawerIndex({
    branch,
    drawer = null,
    transactions = [],
    drawerHistory = [],
    availableChangeFund = 0,
    availableCashSales = 0,
}: Props) {
    const [modal, setModal] = useState<'open' | 'cash_in' | 'cash_out' | 'close' | null>(null);

    const openForm = useForm({
        opening_balance: '',
        notes: '',
    });

    const movementForm = useForm({
        amount: '',
        cash_out_source: 'change_fund',
        remarks: '',
    });

    const closeForm = useForm({
        actual_balance: drawer ? String(drawer.expected_balance ?? '') : '',
        notes: '',
    });

    const currentBalance = numberValue(drawer?.expected_balance);
    const isDrawerEmpty = !drawer || currentBalance <= 0;

    const closeModal = () => {
        setModal(null);

        openForm.reset();
        movementForm.reset();
        closeForm.reset();

        openForm.clearErrors();
        movementForm.clearErrors();
        closeForm.clearErrors();
    };

    const openCloseModal = () => {
        closeForm.setData('actual_balance', String(drawer?.expected_balance ?? ''));
        closeForm.setData('notes', drawer?.notes ?? '');
        setModal('close');
    };

    const submitOpen = (event: FormEvent) => {
        event.preventDefault();

        openForm.post(OPEN_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const submitMovement = (event: FormEvent) => {
        event.preventDefault();

        movementForm.post(modal === 'cash_in' ? CASH_IN_URL : CASH_OUT_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const submitClose = (event: FormEvent) => {
        event.preventDefault();

        closeForm.post(CLOSE_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Cash Drawer" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Wallet className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Cash Drawer</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Track change fund, cash sales, cash out, and drawer closing for this branch.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>
                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>
                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                    {branch.is_active && <span className="rounded-full border px-3 py-1">Active</span>}
                                    <span className={`rounded-full px-3 py-1 font-medium ${drawerStatusClass(drawer?.status ?? 'closed')}`}>
                                        {drawer ? 'Open Drawer' : 'No Open Drawer'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {!drawer && (
                                <button
                                    type="button"
                                    onClick={() => setModal('open')}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    <DoorOpen className="size-4" />
                                    Open Drawer
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={!drawer}
                                onClick={() => setModal('cash_in')}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <PlusCircle className="size-4" />
                                Add Cash
                            </button>

                            <button
                                type="button"
                                disabled={isDrawerEmpty}
                                onClick={() => setModal('cash_out')}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <MinusCircle className="size-4" />
                                Cash Out
                            </button>

                            {drawer && (
                                <button
                                    type="button"
                                    onClick={openCloseModal}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    <DoorClosed className="size-4" />
                                    Close Drawer
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {drawer && isDrawerEmpty && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <p className="font-semibold">Drawer balance is empty.</p>
                            <p className="mt-1">Cash out is disabled until there is available change fund or cash sales.</p>
                        </div>
                    </div>
                )}

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Current Balance"
                        value={money(drawer?.expected_balance)}
                        description="Expected cash inside drawer."
                        icon={Wallet}
                    />

                    <SummaryCard
                        title="Available Change Fund"
                        value={money(availableChangeFund)}
                        description="Opening balance plus cash in, minus change fund cash out."
                        icon={Banknote}
                        variant="success"
                    />

                    <SummaryCard
                        title="Available Cash Sales"
                        value={money(availableCashSales)}
                        description="Cash sales minus refunds and sales cash out."
                        icon={CircleDollarSign}
                        variant="warning"
                    />

                    <SummaryCard
                        title="Total Cash Out"
                        value={money(drawer?.total_cash_out)}
                        description="Total withdrawn amount."
                        icon={MinusCircle}
                        variant="danger"
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border xl:col-span-2">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Current Drawer Details</h2>
                            <p className="text-sm text-muted-foreground">
                                {drawer
                                    ? `Opened drawer #${drawer.id} with current expected balance of ${money(drawer.expected_balance)}.`
                                    : 'No active drawer. Open a drawer to start tracking cash movements.'}
                            </p>
                        </div>

                        <div className="grid gap-3 p-4 md:grid-cols-3">
                            <InfoBox label="Status" value={drawer ? drawer.status : 'closed'} />
                            <InfoBox label="Opening Balance" value={money(drawer?.opening_balance)} />
                            <InfoBox label="Expected Balance" value={money(drawer?.expected_balance)} />
                            <InfoBox label="Total Cash Sales" value={money(drawer?.total_cash_sales)} />
                            <InfoBox label="Total Refunds" value={money(drawer?.total_refunds)} />
                            <InfoBox label="Total Cash In" value={money(drawer?.total_cash_in)} />
                            <InfoBox label="Total Cash Out" value={money(drawer?.total_cash_out)} />
                            <InfoBox label="Opened At" value={shortDateTime(drawer?.opened_at)} />
                            <InfoBox label="Notes" value={drawer?.notes || '—'} />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Drawer History</h2>
                            <p className="text-sm text-muted-foreground">Latest 10 drawer sessions.</p>
                        </div>

                        <div className="divide-y">
                            {drawerHistory.length > 0 ? (
                                drawerHistory.map((item) => (
                                    <div key={item.id} className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">Drawer #{item.id}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {shortDateTime(item.opened_at)} - {shortDateTime(item.closed_at)}
                                                </p>
                                            </div>

                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${drawerStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                            <InfoMini label="Expected" value={money(item.expected_balance)} />
                                            <InfoMini label="Actual" value={money(item.actual_balance)} />
                                            <InfoMini label="Variance" value={money(item.variance_amount)} />
                                            <InfoMini label="Cash Out" value={money(item.total_cash_out)} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <ReceiptText className="mx-auto size-8 text-muted-foreground" />
                                    <p className="mt-2 text-sm font-medium">No drawer history</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Drawer sessions will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Cash Movement History</h2>
                        <p className="text-sm text-muted-foreground">Latest 25 cash drawer transactions.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Source</th>
                                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    <th className="px-4 py-3 text-left font-medium">Remarks</th>
                                    <th className="px-4 py-3 text-left font-medium">Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map((item) => (
                                        <tr key={item.id} className="border-t transition hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${transactionClass(item)}`}>
                                                    {transactionLabel(item)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.cash_out_source ? item.cash_out_source.replaceAll('_', ' ') : '—'}
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold">{money(item.amount)}</td>

                                            <td className="px-4 py-3 text-muted-foreground">{item.remarks || '—'}</td>

                                            <td className="px-4 py-3 text-muted-foreground">{shortDateTime(item.created_at)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <ReceiptText className="size-5 text-muted-foreground" />
                                                </div>

                                                <h3 className="font-medium">No cash movements yet</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Cash drawer movements from this branch will appear here.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {modal === 'open' && (
                    <Modal title="Open Cash Drawer" description={`Branch: ${branch.name}`} onClose={closeModal}>
                        <form onSubmit={submitOpen} className="space-y-5 p-5">
                            <Field label="Opening Balance / Change Fund" error={openForm.errors.opening_balance}>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={openForm.data.opening_balance}
                                    onChange={(value) => openForm.setData('opening_balance', value)}
                                    placeholder="Example: 2000"
                                />
                            </Field>

                            <Field label="Notes" error={openForm.errors.notes}>
                                <Textarea
                                    value={openForm.data.notes}
                                    onChange={(value) => openForm.setData('notes', value)}
                                    placeholder="Optional notes"
                                />
                            </Field>

                            <ModalActions onClose={closeModal} disabled={openForm.processing} submitText="Open Drawer" />
                        </form>
                    </Modal>
                )}

                {(modal === 'cash_in' || modal === 'cash_out') && (
                    <Modal
                        title={modal === 'cash_in' ? 'Add Cash / Change Fund' : 'Cash Out'}
                        description={modal === 'cash_in' ? 'Add cash to the change fund.' : 'Withdraw from change fund or cash sales.'}
                        onClose={closeModal}
                    >
                        <form onSubmit={submitMovement} className="space-y-5 p-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <InfoBox label="Current Balance" value={money(drawer?.expected_balance)} />
                                <InfoBox label="Change Fund" value={money(availableChangeFund)} />
                                <InfoBox label="Cash Sales" value={money(availableCashSales)} />
                            </div>

                            {modal === 'cash_out' && (
                                <Field label="Cash Out Source" error={movementForm.errors.cash_out_source}>
                                    <Select
                                        value={movementForm.data.cash_out_source}
                                        onChange={(value) => movementForm.setData('cash_out_source', value)}
                                    >
                                        <option value="change_fund">Change Fund — {money(availableChangeFund)}</option>
                                        <option value="cash_sales">Cash Sales — {money(availableCashSales)}</option>
                                    </Select>
                                </Field>
                            )}

                            <Field label="Amount" error={movementForm.errors.amount}>
                                <Input
                                    type="number"
                                    min="0.01"
                                    max={modal === 'cash_out' ? currentBalance : undefined}
                                    step="0.01"
                                    value={movementForm.data.amount}
                                    onChange={(value) => movementForm.setData('amount', value)}
                                    placeholder="0.00"
                                />
                            </Field>

                            <Field label="Remarks" error={movementForm.errors.remarks}>
                                <Textarea
                                    value={movementForm.data.remarks}
                                    onChange={(value) => movementForm.setData('remarks', value)}
                                    placeholder="Optional remarks"
                                />
                            </Field>

                            <ModalActions
                                onClose={closeModal}
                                disabled={movementForm.processing || (modal === 'cash_out' && isDrawerEmpty)}
                                submitText={modal === 'cash_in' ? 'Save Cash In' : 'Save Cash Out'}
                            />
                        </form>
                    </Modal>
                )}

                {modal === 'close' && (
                    <Modal title="Close Cash Drawer" description="Enter the actual counted cash." onClose={closeModal}>
                        <form onSubmit={submitClose} className="space-y-5 p-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <InfoBox label="Expected Balance" value={money(drawer?.expected_balance)} />
                                <InfoBox label="Cash Sales" value={money(drawer?.total_cash_sales)} />
                                <InfoBox label="Cash Out" value={money(drawer?.total_cash_out)} />
                            </div>

                            <Field label="Actual Cash Count" error={closeForm.errors.actual_balance}>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={closeForm.data.actual_balance}
                                    onChange={(value) => closeForm.setData('actual_balance', value)}
                                    placeholder="0.00"
                                />
                            </Field>

                            <Field label="Closing Notes" error={closeForm.errors.notes}>
                                <Textarea
                                    value={closeForm.data.notes}
                                    onChange={(value) => closeForm.setData('notes', value)}
                                    placeholder="Optional closing notes"
                                />
                            </Field>

                            <ModalActions onClose={closeModal} disabled={closeForm.processing} submitText="Close Drawer" />
                        </form>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    variant = 'default',
}: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const variantClass = {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
    }[variant];

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-semibold capitalize">{value}</p>
        </div>
    );
}

function InfoMini({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="mt-0.5 font-medium">{value}</p>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function Input({
    value,
    onChange,
    placeholder,
    type = 'text',
    min,
    max,
    step,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    min?: string;
    max?: string | number;
    step?: string;
}) {
    return (
        <input
            type={type}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
    );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: ReactNode }) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
            {children}
        </select>
    );
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
    return (
        <textarea
            rows={3}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
    );
}

function Modal({
    title,
    description,
    children,
    onClose,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b p-5">
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                    </div>

                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-88px)] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

function ModalActions({ onClose, disabled, submitText }: { onClose: () => void; disabled: boolean; submitText: string }) {
    return (
        <div className="flex justify-end gap-2 border-t pt-5">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
            </button>

            <button
                type="submit"
                disabled={disabled}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
                {submitText}
            </button>
        </div>
    );
}