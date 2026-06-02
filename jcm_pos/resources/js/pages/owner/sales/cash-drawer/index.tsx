import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    Building2,
    CircleDollarSign,
    DoorClosed,
    DoorOpen,
    MoreHorizontal,
    MinusCircle,
    PlusCircle,
    ReceiptText,
    Store,
    Wallet,
    X,
} from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

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
    is_active?: boolean;
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
    cash_out_source?: 'change_fund' | 'cash_sales' | null;
    amount: string | number;
    remarks?: string | null;
    withdrawn_at?: string | null;
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
    selectedBranchId?: number | string | null;
    activeDrawer?: CashDrawer | null;
    transactions: Paginated<DrawerTransaction>;
    availableChangeFund?: number;
    availableCashSales?: number;
    filters?: {
        branch_id?: number | string | null;
    };
};

export default function CashDrawerIndex({
    branches = [],
    selectedBranchId = null,
    activeDrawer = null,
    transactions,
    availableChangeFund = 0,
    availableCashSales = 0,
    filters,
}: PageProps) {
    const initialBranchId = String(filters?.branch_id ?? selectedBranchId ?? branches[0]?.id ?? '');

    const [modal, setModal] = useState<'open' | 'cash_in' | 'cash_out' | 'close' | 'branch_picker' | null>(null);
    const [selectedBranch, setSelectedBranch] = useState(initialBranchId);

    const activeBranch = useMemo(() => {
        return branches.find((branch) => String(branch.id) === String(selectedBranch)) ?? null;
    }, [branches, selectedBranch]);

    const currentBalance = Number(activeDrawer?.expected_balance ?? 0);
    const isDrawerEmpty = !activeDrawer || currentBalance <= 0;

    const openForm = useForm({
        branch_id: selectedBranch,
        opening_balance: '',
        notes: '',
    });

    const movementForm = useForm({
        branch_id: selectedBranch,
        amount: '',
        cash_out_source: 'change_fund',
        remarks: '',
    });

    const closeForm = useForm({
        branch_id: selectedBranch,
        actual_balance: '',
        notes: '',
    });

    useEffect(() => {
        openForm.setData('branch_id', selectedBranch);
        movementForm.setData('branch_id', selectedBranch);
        closeForm.setData('branch_id', selectedBranch);
    }, [selectedBranch]);

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

    const selectBranch = (branchId: number) => {
        const id = String(branchId);

        setSelectedBranch(id);
        setModal(null);

        router.get(
            CASH_DRAWER_URL,
            { branch_id: id },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const closeModal = () => {
        setModal(null);
        openForm.reset();
        movementForm.reset();
        closeForm.reset();
        openForm.setData('branch_id', selectedBranch);
        movementForm.setData('branch_id', selectedBranch);
        closeForm.setData('branch_id', selectedBranch);
        openForm.clearErrors();
        movementForm.clearErrors();
        closeForm.clearErrors();
    };

    const submitOpen = (e: FormEvent) => {
        e.preventDefault();

        openForm.setData('branch_id', selectedBranch);

        openForm.post(`${CASH_DRAWER_URL}/open`, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const submitMovement = (e: FormEvent) => {
        e.preventDefault();

        const endpoint = modal === 'cash_in' ? 'cash-in' : 'cash-out';

        movementForm.setData('branch_id', selectedBranch);

        movementForm.post(`${CASH_DRAWER_URL}/${endpoint}`, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const submitClose = (e: FormEvent) => {
        e.preventDefault();

        closeForm.setData('branch_id', selectedBranch);

        closeForm.post(`${CASH_DRAWER_URL}/close`, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cash Drawer" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                    <Store className="size-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-xl">
                                            {activeBranch ? `${activeBranch.name} Cash Drawer` : 'Select Branch'}
                                        </CardTitle>

                                        {activeBranch?.is_main && (
                                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                Main
                                            </span>
                                        )}

                                        {activeDrawer ? (
                                            <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                                Open
                                            </span>
                                        ) : (
                                            <span className="rounded-md bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                Closed
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {activeBranch
                                            ? `Branch code: ${activeBranch.code || 'No code'}`
                                            : 'Choose a branch to manage its cash drawer.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModal('branch_picker')}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
                            >
                                <Building2 className="size-4" />
                                {activeBranch ? 'Change Branch' : 'Select Branch'}
                            </button>
                        </div>
                    </CardHeader>
                </Card>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Cash Drawer</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Track pang-barya fund, cash sales, and cash out source clearly.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {!activeDrawer && (
                            <button
                                onClick={() => setModal('open')}
                                disabled={!selectedBranch}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <DoorOpen className="size-4" />
                                Open Drawer
                            </button>
                        )}

                        <button
                            onClick={() => setModal('cash_in')}
                            disabled={!selectedBranch}
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <PlusCircle className="size-4" />
                            Add Cash / Pang Barya
                        </button>

                        <button
                            onClick={() => setModal('cash_out')}
                            disabled={isDrawerEmpty || !selectedBranch}
                            className={[
                                'inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted',
                                isDrawerEmpty || !selectedBranch ? 'cursor-not-allowed opacity-50' : '',
                            ].join(' ')}
                        >
                            <MinusCircle className="size-4" />
                            Cash Out
                        </button>

                        {activeDrawer && (
                            <button
                                onClick={() => setModal('close')}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                            >
                                <DoorClosed className="size-4" />
                                Close Drawer
                            </button>
                        )}
                    </div>
                </div>

                {activeDrawer && isDrawerEmpty && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <b>Walang laman ang cash drawer.</b>
                            <p className="mt-1">
                                Hindi muna puwede mag cash out. Mag Add Cash / Pang Barya muna or hintayin pumasok ang cash sale.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Current Balance" value={money(activeDrawer?.expected_balance)} icon={<Wallet className="size-5" />} />
                    <SummaryCard title="Available Pang Barya" value={money(availableChangeFund)} icon={<Banknote className="size-5" />} variant="neutral" />
                    <SummaryCard title="Available Cash Sales" value={money(availableCashSales)} icon={<CircleDollarSign className="size-5" />} variant="success" />
                    <SummaryCard title="Total Cash Out" value={money(activeDrawer?.total_cash_out)} icon={<MinusCircle className="size-5" />} variant="warning" />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-xl">Current Drawer</CardTitle>
                                <CardDescription className="mt-1">
                                    {activeDrawer
                                        ? `Current drawer balance is ${money(activeDrawer.expected_balance)}.`
                                        : 'No active cash drawer for this branch. Open one to start tracking cash.'}
                                </CardDescription>
                            </div>

                            <span
                                className={[
                                    'w-fit rounded-full px-3 py-1 text-xs font-medium',
                                    activeDrawer
                                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                                ].join(' ')}
                            >
                                {activeDrawer ? 'Open' : 'Closed'}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="grid gap-4 p-5 md:grid-cols-4">
                        <InfoBox label="Branch" value={activeBranch?.name ?? '—'} />
                        <InfoBox label="Opened At" value={formatDate(activeDrawer?.opened_at)} />
                        <InfoBox label="Available Pang Barya" value={money(availableChangeFund)} />
                        <InfoBox label="Available Sales" value={money(availableCashSales)} />
                    </CardContent>
                </Card>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <CardTitle className="text-xl">Cash Movement History</CardTitle>
                        <CardDescription className="mt-1">
                            Opening cash, add cash, cash sales, cash out source, and closing records.
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
                                                        {transactionLabel(item)}
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
                                                        This branch has no cash drawer movements yet.
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
                                Showing <b>{transactions?.from ?? 0}</b> to <b>{transactions?.to ?? 0}</b> of <b>{transactions?.total ?? 0}</b> movements
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
                                    onChange={(e) => {
                                        openForm.setData('branch_id', e.target.value);
                                        setSelectedBranch(e.target.value);
                                    }}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select branch</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={String(branch.id)}>
                                            {branch.name}
                                            {branch.code ? ` (${branch.code})` : ''}
                                            {branch.is_main ? ' — Main' : ''}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Opening Pang Barya / Change Fund" error={openForm.errors.opening_balance}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={openForm.data.opening_balance}
                                    onChange={(e) => openForm.setData('opening_balance', e.target.value)}
                                    placeholder="Example: 2000"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <Field label="Notes" error={openForm.errors.notes}>
                                <textarea
                                    value={openForm.data.notes}
                                    onChange={(e) => openForm.setData('notes', e.target.value)}
                                    placeholder="e.g. Initial pang-barya"
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <ModalActions onClose={closeModal} disabled={openForm.processing} submitText="Open Drawer" />
                        </form>
                    </Modal>
                )}

                {(modal === 'cash_in' || modal === 'cash_out') && (
                    <Modal title={modal === 'cash_in' ? 'Add Cash / Pang Barya' : 'Cash Out / Withdraw'} onClose={closeModal}>
                        <form onSubmit={submitMovement} className="space-y-4 p-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <InfoBox label="Current Balance" value={money(activeDrawer?.expected_balance)} />
                                <InfoBox label="Pang Barya" value={money(availableChangeFund)} />
                                <InfoBox label="Cash Sales" value={money(availableCashSales)} />
                            </div>

                            {modal === 'cash_out' && isDrawerEmpty && (
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                    Cannot cash out. Walang laman ang cash drawer.
                                </div>
                            )}

                            {modal === 'cash_out' && (
                                <Field label="Cash Out Type" error={movementForm.errors.cash_out_source}>
                                    <select
                                        value={movementForm.data.cash_out_source}
                                        onChange={(e) => movementForm.setData('cash_out_source', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="change_fund">Pang Barya Fund — {money(availableChangeFund)}</option>
                                        <option value="cash_sales">Cash Sales — {money(availableCashSales)}</option>
                                    </select>
                                </Field>
                            )}

                            <Field label="Amount" error={movementForm.errors.amount}>
                                <input
                                    type="number"
                                    min="0.01"
                                    max={modal === 'cash_out' ? currentBalance : undefined}
                                    step="0.01"
                                    value={movementForm.data.amount}
                                    onChange={(e) => movementForm.setData('amount', e.target.value)}
                                    placeholder={modal === 'cash_in' ? 'Example: 2000' : 'Example: 3000'}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <Field label="Remarks" error={movementForm.errors.remarks}>
                                <textarea
                                    value={movementForm.data.remarks}
                                    onChange={(e) => movementForm.setData('remarks', e.target.value)}
                                    placeholder={modal === 'cash_in' ? 'e.g. Added pang-barya' : 'e.g. Owner withdrawal / withdraw sales'}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <ModalActions
                                onClose={closeModal}
                                disabled={movementForm.processing || (modal === 'cash_out' && isDrawerEmpty)}
                                submitText={modal === 'cash_in' ? 'Save Add Cash' : 'Save Cash Out'}
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

                {modal === 'branch_picker' && (
                    <BranchPickerModal
                        branches={branches}
                        selectedBranch={selectedBranch}
                        onSelect={selectBranch}
                        onClose={() => setModal(null)}
                    />
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

function BranchPickerModal({
    branches,
    selectedBranch,
    onSelect,
    onClose,
}: {
    branches: Branch[];
    selectedBranch: string;
    onSelect: (branchId: number) => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-hidden shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                    <div>
                        <CardTitle className="text-lg">Choose Branch</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Select which branch cash drawer you want to manage.
                        </p>
                    </div>

                    <button onClick={onClose} className="rounded-md p-2 hover:bg-muted">
                        <X className="size-4" />
                    </button>
                </CardHeader>

                <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
                    {branches.map((branch) => (
                        <button
                            type="button"
                            key={branch.id}
                            onClick={() => onSelect(branch.id)}
                            className={[
                                'group overflow-hidden rounded-xl border text-left transition hover:border-primary/60 hover:bg-muted/40',
                                String(selectedBranch) === String(branch.id)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-sidebar-border/70 dark:border-sidebar-border',
                            ].join(' ')}
                        >
                            <div className="flex items-start justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-full border bg-background">
                                        <Store className="size-5 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <div className="font-semibold">{branch.name}</div>
                                        <div className="text-xs uppercase text-muted-foreground">
                                            {branch.code || 'NO CODE'}
                                        </div>
                                    </div>
                                </div>

                                <MoreHorizontal className="size-4 text-muted-foreground" />
                            </div>

                            <div className="flex gap-2 border-t px-4 py-3">
                                {branch.is_main && (
                                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                                        Main
                                    </span>
                                )}

                                <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-medium text-white">
                                    Active
                                </span>
                            </div>

                            <div className="border-t px-4 py-4 text-sm text-muted-foreground">
                                Click this branch to view and manage its cash drawer.
                            </div>
                        </button>
                    ))}
                </div>
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