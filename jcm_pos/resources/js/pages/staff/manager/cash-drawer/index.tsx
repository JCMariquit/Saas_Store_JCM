import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Banknote, CircleDollarSign, DoorClosed, DoorOpen, MinusCircle, PlusCircle, ReceiptText, Store, Wallet, X } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

const CASH_DRAWER_URL = '/staff/manager/cash-drawer';
const OPEN_URL = '/staff/manager/cash-drawer/open';
const CASH_IN_URL = '/staff/manager/cash-drawer/cash-in';
const CASH_OUT_URL = '/staff/manager/cash-drawer/cash-out';
const CLOSE_URL = '/staff/manager/cash-drawer/close';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Cash Drawer', href: CASH_DRAWER_URL },
];

type Branch = { id: number; name: string; code?: string | null; is_main?: boolean };

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
    status: 'open' | 'closed';
    opened_at?: string | null;
    closed_at?: string | null;
    notes?: string | null;
};

type DrawerTransaction = {
    id: number;
    type: string;
    cash_out_source?: 'change_fund' | 'cash_sales' | null;
    amount: string | number;
    remarks?: string | null;
    withdrawn_at?: string | null;
    created_at?: string | null;
};

type Props = {
    branch?: Branch;
    drawer?: CashDrawer | null;
    transactions?: DrawerTransaction[];
    availableChangeFund?: number;
    availableCashSales?: number;
};

export default function ManagerCashDrawerIndex({
    branch,
    drawer = null,
    transactions = [],
    availableChangeFund = 0,
    availableCashSales = 0,
}: Props) {
    const [modal, setModal] = useState<'open' | 'cash_in' | 'cash_out' | 'close' | null>(null);

    const openForm = useForm({ opening_balance: '', notes: '' });

    const movementForm = useForm({
        amount: '',
        cash_out_source: 'change_fund',
        remarks: '',
    });

    const closeForm = useForm({
        actual_balance: drawer ? String(drawer.expected_balance ?? '') : '',
        notes: '',
    });

    const currentBalance = Number(drawer?.expected_balance ?? 0);
    const isDrawerEmpty = !drawer || currentBalance <= 0;

    const money = (value: string | number | null | undefined) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value ?? 0));

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

    const transactionLabel = (item: DrawerTransaction) => {
        if (item.type === 'cash_out') {
            return item.cash_out_source === 'cash_sales' ? 'Cash Out - Sales' : 'Cash Out - Pang Barya';
        }

        const labels: Record<string, string> = {
            opening: 'Opening Balance',
            cash_in: 'Add Cash / Pang Barya',
            cash_sale: item.withdrawn_at ? 'Cash Sale - Withdrawn' : 'Cash Sale - Available',
            closing_adjustment: 'Closing Adjustment',
            refund: 'Refund',
        };

        return labels[item.type] ?? item.type.replaceAll('_', ' ').toUpperCase();
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
        openForm.post(OPEN_URL, { preserveScroll: true, onSuccess: closeModal });
    };

    const submitMovement = (e: FormEvent) => {
        e.preventDefault();
        movementForm.post(modal === 'cash_in' ? CASH_IN_URL : CASH_OUT_URL, { preserveScroll: true, onSuccess: closeModal });
    };

    const submitClose = (e: FormEvent) => {
        e.preventDefault();
        closeForm.post(CLOSE_URL, { preserveScroll: true, onSuccess: closeModal });
    };

    if (!branch) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Manager Cash Drawer" />
                <div className="p-4">
                    <Card tone="topline" variant="danger">
                        <CardHeader>
                            <CardTitle>No Branch Found</CardTitle>
                            <CardDescription>Cash drawer cannot load because branch data was not provided.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Cash Drawer" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                <Store className="size-5 text-muted-foreground" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="text-xl">{branch.name} Cash Drawer</CardTitle>

                                    {branch.is_main && <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Main</span>}

                                    {drawer ? (
                                        <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">Open</span>
                                    ) : (
                                        <span className="rounded-md bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">Closed</span>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Branch code: {branch.code || 'No code'} · Uses your assigned branch only.
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Cash Drawer</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Track pang-barya fund, cash sales, and cash out source clearly.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {!drawer && (
                            <button type="button" onClick={() => setModal('open')} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
                                <DoorOpen className="size-4" />
                                Open Drawer
                            </button>
                        )}

                        <button type="button" onClick={() => setModal('cash_in')} disabled={!drawer} className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
                            <PlusCircle className="size-4" />
                            Add Cash / Pang Barya
                        </button>

                        <button type="button" onClick={() => setModal('cash_out')} disabled={isDrawerEmpty} className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
                            <MinusCircle className="size-4" />
                            Cash Out
                        </button>

                        {drawer && (
                            <button
                                type="button"
                                onClick={() => {
                                    closeForm.setData('actual_balance', String(drawer.expected_balance ?? ''));
                                    setModal('close');
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                            >
                                <DoorClosed className="size-4" />
                                Close Drawer
                            </button>
                        )}
                    </div>
                </div>

                {drawer && isDrawerEmpty && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <b>Walang laman ang cash drawer.</b>
                            <p className="mt-1">Hindi muna puwede mag cash out. Mag Add Cash / Pang Barya muna or hintayin pumasok ang cash sale.</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Current Balance" value={money(drawer?.expected_balance)} icon={<Wallet className="size-5" />} />
                    <SummaryCard title="Available Pang Barya" value={money(availableChangeFund)} icon={<Banknote className="size-5" />} variant="neutral" />
                    <SummaryCard title="Available Cash Sales" value={money(availableCashSales)} icon={<CircleDollarSign className="size-5" />} variant="success" />
                    <SummaryCard title="Total Cash Out" value={money(drawer?.total_cash_out)} icon={<MinusCircle className="size-5" />} variant="warning" />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <CardTitle className="text-xl">Current Drawer</CardTitle>
                        <CardDescription className="mt-1">
                            {drawer ? `Current drawer balance is ${money(drawer.expected_balance)}.` : 'No active cash drawer for this branch. Open one to start tracking cash.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-4 p-5 md:grid-cols-4">
                        <InfoBox label="Branch" value={branch.name} />
                        <InfoBox label="Opened At" value={formatDate(drawer?.opened_at)} />
                        <InfoBox label="Available Pang Barya" value={money(availableChangeFund)} />
                        <InfoBox label="Available Sales" value={money(availableCashSales)} />
                    </CardContent>
                </Card>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <CardTitle className="text-xl">Cash Movement History</CardTitle>
                        <CardDescription className="mt-1">Opening cash, add cash, cash sales, cash out source, and closing records.</CardDescription>
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
                                    {transactions.length > 0 ? (
                                        transactions.map((item) => (
                                            <tr key={item.id} className="border-t border-sidebar-border/70 hover:bg-muted/30 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{transactionLabel(item)}</span>
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
                                                    <p className="mt-1 text-sm text-muted-foreground">This branch has no cash drawer movements yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {modal === 'open' && (
                    <Modal title="Open Cash Drawer" description={`Branch: ${branch.name}`} onClose={closeModal}>
                        <form onSubmit={submitOpen} className="space-y-5 p-5">
                            <Field label="Opening Pang Barya / Change Fund" error={openForm.errors.opening_balance}>
                                <Input type="number" min="0" step="0.01" value={openForm.data.opening_balance} onChange={(value) => openForm.setData('opening_balance', value)} placeholder="Example: 2000" />
                            </Field>

                            <Field label="Notes" error={openForm.errors.notes}>
                                <Textarea value={openForm.data.notes} onChange={(value) => openForm.setData('notes', value)} placeholder="e.g. Initial pang-barya" />
                            </Field>

                            <ModalActions onClose={closeModal} disabled={openForm.processing} submitText="Open Drawer" />
                        </form>
                    </Modal>
                )}

                {(modal === 'cash_in' || modal === 'cash_out') && (
                    <Modal title={modal === 'cash_in' ? 'Add Cash / Pang Barya' : 'Cash Out / Withdraw'} description={modal === 'cash_in' ? 'Add cash to drawer.' : 'Withdraw cash from drawer.'} onClose={closeModal}>
                        <form onSubmit={submitMovement} className="space-y-5 p-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <InfoBox label="Current Balance" value={money(drawer?.expected_balance)} />
                                <InfoBox label="Pang Barya" value={money(availableChangeFund)} />
                                <InfoBox label="Cash Sales" value={money(availableCashSales)} />
                            </div>

                            {modal === 'cash_out' && (
                                <Field label="Cash Out Type" error={movementForm.errors.cash_out_source}>
                                    <Select value={movementForm.data.cash_out_source} onChange={(value) => movementForm.setData('cash_out_source', value)}>
                                        <option value="change_fund">Pang Barya Fund — {money(availableChangeFund)}</option>
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
                                    placeholder={modal === 'cash_in' ? 'Example: 2000' : 'Example: 3000'}
                                />
                            </Field>

                            <Field label="Remarks" error={movementForm.errors.remarks}>
                                <Textarea value={movementForm.data.remarks} onChange={(value) => movementForm.setData('remarks', value)} placeholder={modal === 'cash_in' ? 'e.g. Added pang-barya' : 'e.g. Owner withdrawal / withdraw sales'} />
                            </Field>

                            <ModalActions onClose={closeModal} disabled={movementForm.processing || (modal === 'cash_out' && isDrawerEmpty)} submitText={modal === 'cash_in' ? 'Save Add Cash' : 'Save Cash Out'} />
                        </form>
                    </Modal>
                )}

                {modal === 'close' && (
                    <Modal title="Close Cash Drawer" description="Enter actual counted cash." onClose={closeModal}>
                        <form onSubmit={submitClose} className="space-y-5 p-5">
                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                Expected Cash: <b>{money(drawer?.expected_balance)}</b>
                            </div>

                            <Field label="Actual Cash Count" error={closeForm.errors.actual_balance}>
                                <Input type="number" min="0" step="0.01" value={closeForm.data.actual_balance} onChange={(value) => closeForm.setData('actual_balance', value)} placeholder="0.00" />
                            </Field>

                            <Field label="Closing Notes" error={closeForm.errors.notes}>
                                <Textarea value={closeForm.data.notes} onChange={(value) => closeForm.setData('notes', value)} />
                            </Field>

                            <ModalActions onClose={closeModal} disabled={closeForm.processing} submitText="Close Drawer" />
                        </form>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}

function Input({ value, onChange, placeholder, type = 'text', min, max, step }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string; min?: string; max?: string | number; step?: string }) {
    return <input type={type} min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring" />;
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: ReactNode }) {
    return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring">{children}</select>;
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
    return <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring" />;
}

function SummaryCard({ title, value, icon, variant = 'default' }: { title: string; value: string; icon: ReactNode; variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger' }) {
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
            <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function Modal({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-hidden bg-background shadow-xl">
                <CardHeader className="flex flex-row items-start justify-between border-b bg-background p-5">
                    <div>
                        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
                        {description && <CardDescription className="mt-1">{description}</CardDescription>}
                    </div>

                    <button type="button" onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X className="size-4" />
                    </button>
                </CardHeader>

                <div className="bg-background">{children}</div>
            </Card>
        </div>
    );
}

function ModalActions({ onClose, disabled, submitText }: { onClose: () => void; disabled: boolean; submitText: string }) {
    return (
        <div className="flex justify-end gap-2 border-t pt-5">
            <button type="button" onClick={onClose} className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
            </button>

            <button disabled={disabled} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {submitText}
            </button>
        </div>
    );
}