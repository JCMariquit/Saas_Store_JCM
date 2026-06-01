import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    CircleDollarSign,
    DoorClosed,
    DoorOpen,
    MinusCircle,
    PlusCircle,
    ReceiptText,
    Wallet,
    X,
} from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

const CASH_DRAWER_URL = '/client/sales/cash-drawer';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cash Drawer',
        href: CASH_DRAWER_URL,
    },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
};

type CashDrawer = {
    id: number;
    branch_id?: number | null;
    opening_balance: string | number;
    expected_balance: string | number;
    actual_balance?: string | number | null;
    variance_amount?: string | number | null;
    total_cash_sales: string | number;
    total_refunds: string | number;
    total_cash_in: string | number;
    total_cash_out: string | number;
    status: 'open' | 'closed';
    opened_at?: string | null;
    closed_at?: string | null;
    notes?: string | null;
};

type DrawerTransaction = {
    id: number;
    type: string;
    amount: string | number;
    remarks?: string | null;
    created_at: string;
};

type Paginated<T> = {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type PageProps = {
    branches: Branch[];
    activeDrawer?: CashDrawer | null;
    transactions: Paginated<DrawerTransaction>;
};

export default function CashDrawerIndex({ branches = [], activeDrawer = null, transactions }: PageProps) {
    const [modal, setModal] = useState<'open' | 'cash_in' | 'cash_out' | 'close' | null>(null);

    const openForm = useForm({
        branch_id: branches[0]?.id ? String(branches[0].id) : '',
        opening_balance: '',
        notes: '',
    });

    const movementForm = useForm({
        amount: '',
        remarks: '',
    });

    const closeForm = useForm({
        actual_balance: '',
        notes: '',
    });

    const money = (value: string | number | null | undefined) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value ?? 0));

    const formatDate = (date?: string | null) => {
        if (!date) return '—';

        return new Date(date).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const closeModal = () => {
        setModal(null);
        openForm.reset();
        movementForm.reset();
        closeForm.reset();
        openForm.clearErrors();
        movementForm.clearErrors();
        closeForm.clearErrors();
    };

    const submitOpen = (e: FormEvent) => {
        e.preventDefault();

        openForm.post(`${CASH_DRAWER_URL}/open`, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const submitMovement = (e: FormEvent) => {
        e.preventDefault();

        const endpoint = modal === 'cash_in' ? 'cash-in' : 'cash-out';

        movementForm.post(`${CASH_DRAWER_URL}/${endpoint}`, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const submitClose = (e: FormEvent) => {
        e.preventDefault();

        closeForm.post(`${CASH_DRAWER_URL}/close`, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Drawer" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Cash Drawer</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Track opening cash, cash sales, cash in/out, refunds, and closing variance.
                        </p>
                    </div>

                    {!activeDrawer ? (
                        <button
                            onClick={() => setModal('open')}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                        >
                            <DoorOpen className="size-4" />
                            Open Drawer
                        </button>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setModal('cash_in')}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                                <PlusCircle className="size-4" />
                                Cash In
                            </button>

                            <button
                                onClick={() => setModal('cash_out')}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                                <MinusCircle className="size-4" />
                                Cash Out
                            </button>

                            <button
                                onClick={() => setModal('close')}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                            >
                                <DoorClosed className="size-4" />
                                Close Drawer
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        title="Expected Cash"
                        value={money(activeDrawer?.expected_balance)}
                        icon={<Wallet className="size-5" />}
                    />
                    <SummaryCard
                        title="Opening Balance"
                        value={money(activeDrawer?.opening_balance)}
                        icon={<Banknote className="size-5" />}
                    />
                    <SummaryCard
                        title="Cash Sales"
                        value={money(activeDrawer?.total_cash_sales)}
                        icon={<CircleDollarSign className="size-5" />}
                        variant="success"
                    />
                    <SummaryCard
                        title="Cash Out"
                        value={money(activeDrawer?.total_cash_out)}
                        icon={<MinusCircle className="size-5" />}
                        variant="warning"
                    />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-xl">Current Drawer</CardTitle>
                                <CardDescription className="mt-1">
                                    {activeDrawer ? 'Active cash drawer session is open.' : 'No active cash drawer. Open one to start tracking cash.'}
                                </CardDescription>
                            </div>

                            <span
                                className={[
                                    'w-fit rounded-full px-3 py-1 text-xs font-medium',
                                    activeDrawer ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                                ].join(' ')}
                            >
                                {activeDrawer ? 'Open' : 'Closed'}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="grid gap-4 p-5 md:grid-cols-3">
                        <InfoBox label="Opened At" value={formatDate(activeDrawer?.opened_at)} />
                        <InfoBox label="Cash In" value={money(activeDrawer?.total_cash_in)} />
                        <InfoBox label="Refunds" value={money(activeDrawer?.total_refunds)} />
                    </CardContent>
                </Card>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <CardTitle className="text-xl">Cash Movement History</CardTitle>
                        <CardDescription className="mt-1">
                            All cash drawer transactions for the active drawer.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                                        <th className="px-4 py-3 font-medium">Remarks</th>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(transactions?.data ?? []).length > 0 ? (
                                        transactions.data.map((item) => (
                                            <tr key={item.id} className="border-t border-sidebar-border/70 hover:bg-muted/30 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                        {item.type.replaceAll('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">{money(item.amount)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.remarks || '—'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.created_at)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-16 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <ReceiptText className="size-5 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="font-medium">No cash movements yet</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Open a drawer or record cash in/out to see movement history.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing <b>{transactions?.from ?? 0}</b> to <b>{transactions?.to ?? 0}</b> of{' '}
                                <b>{transactions?.total ?? 0}</b> movements
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(transactions?.links ?? []).map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                        className={[
                                            'min-w-9 rounded-md border px-3 py-2 text-xs',
                                            link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                            !link.url ? 'cursor-not-allowed opacity-50' : '',
                                        ].join(' ')}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {modal === 'open' && (
                    <Modal title="Open Cash Drawer" onClose={closeModal}>
                        <form onSubmit={submitOpen} className="space-y-4 p-5">
                            <Field label="Branch" error={openForm.errors.branch_id}>
                                <select
                                    value={openForm.data.branch_id}
                                    onChange={(e) => openForm.setData('branch_id', e.target.value)}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">No branch</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={String(branch.id)}>
                                            {branch.name}
                                            {branch.code ? ` (${branch.code})` : ''}
                                            {branch.is_main ? ' — Main' : ''}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Opening Balance" error={openForm.errors.opening_balance}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={openForm.data.opening_balance}
                                    onChange={(e) => openForm.setData('opening_balance', e.target.value)}
                                    placeholder="0.00"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <Field label="Notes" error={openForm.errors.notes}>
                                <textarea
                                    value={openForm.data.notes}
                                    onChange={(e) => openForm.setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <ModalActions onClose={closeModal} disabled={openForm.processing} submitText="Open Drawer" />
                        </form>
                    </Modal>
                )}

                {(modal === 'cash_in' || modal === 'cash_out') && (
                    <Modal title={modal === 'cash_in' ? 'Cash In' : 'Cash Out'} onClose={closeModal}>
                        <form onSubmit={submitMovement} className="space-y-4 p-5">
                            <Field label="Amount" error={movementForm.errors.amount}>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={movementForm.data.amount}
                                    onChange={(e) => movementForm.setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <Field label="Remarks" error={movementForm.errors.remarks}>
                                <textarea
                                    value={movementForm.data.remarks}
                                    onChange={(e) => movementForm.setData('remarks', e.target.value)}
                                    placeholder={modal === 'cash_in' ? 'e.g. Added change fund' : 'e.g. Owner withdrawal'}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <ModalActions
                                onClose={closeModal}
                                disabled={movementForm.processing}
                                submitText={modal === 'cash_in' ? 'Save Cash In' : 'Save Cash Out'}
                            />
                        </form>
                    </Modal>
                )}

                {modal === 'close' && (
                    <Modal title="Close Cash Drawer" onClose={closeModal}>
                        <form onSubmit={submitClose} className="space-y-4 p-5">
                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                Expected Cash: <b>{money(activeDrawer?.expected_balance)}</b>
                            </div>

                            <Field label="Actual Cash Count" error={closeForm.errors.actual_balance}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={closeForm.data.actual_balance}
                                    onChange={(e) => closeForm.setData('actual_balance', e.target.value)}
                                    placeholder="0.00"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <Field label="Closing Notes" error={closeForm.errors.notes}>
                                <textarea
                                    value={closeForm.data.notes}
                                    onChange={(e) => closeForm.setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
    icon,
    variant = 'default',
}: {
    title: string;
    value: string;
    icon: ReactNode;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5">
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">{icon}</div>
            </CardContent>
        </Card>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-semibold">{value}</div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <button onClick={onClose} className="rounded-md p-2 hover:bg-muted">
                        <X className="size-4" />
                    </button>
                </CardHeader>
                {children}
            </Card>
        </div>
    );
}

function ModalActions({ onClose, disabled, submitText }: { onClose: () => void; disabled: boolean; submitText: string }) {
    return (
        <div className="flex justify-end gap-2 border-t pt-5">
            <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
            >
                Cancel
            </button>

            <button
                disabled={disabled}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
                {submitText}
            </button>
        </div>
    );
}