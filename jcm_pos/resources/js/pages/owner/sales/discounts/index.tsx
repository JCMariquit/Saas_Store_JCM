import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    BadgePercent,
    Building2,
    CalendarDays,
    Edit,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    Store,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

const DISCOUNTS_URL = '/client/sales/discounts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Discounts',
        href: DISCOUNTS_URL,
    },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type Discount = {
    id: number;
    tenant_id: number;
    branch_id?: number | null;
    name: string;
    code?: string | null;
    type: 'percent' | 'fixed';
    value: string | number;
    min_purchase: string | number;
    max_discount?: string | number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    is_active: boolean;
    notes?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

type PageProps = {
    branches?: Branch[];
    discounts: Paginated<Discount>;
    filters?: {
        branch_id?: string | number | null;
        search?: string | null;
        status?: string | null;
    };
};

export default function DiscountsIndex({ branches = [], discounts, filters }: PageProps) {
    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | 'branch_picker' | null>(null);
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

    const [selectedBranch, setSelectedBranch] = useState(String(filters?.branch_id ?? ''));
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    const activeBranch = useMemo(() => {
        return branches.find((branch) => String(branch.id) === String(selectedBranch)) ?? null;
    }, [branches, selectedBranch]);

    const form = useForm({
        branch_id: '',
        name: '',
        code: '',
        type: 'percent',
        value: '',
        min_purchase: '0',
        max_discount: '',
        starts_at: '',
        ends_at: '',
        is_active: true as boolean,
        notes: '',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                DISCOUNTS_URL,
                {
                    branch_id: selectedBranch || undefined,
                    search: search || undefined,
                    status: status || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [selectedBranch, search, status]);

    const money = (value: string | number | null | undefined) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value ?? 0));

    const formatDate = (value?: string | null) => {
        if (!value) return '—';

        return new Date(value).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    };

    const discountValue = (discount: Discount) => {
        if (discount.type === 'percent') {
            return `${Number(discount.value ?? 0).toLocaleString()}%`;
        }

        return money(discount.value);
    };

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        setSelectedDiscount(null);
    };

    const closeModal = () => {
        setModal(null);
        resetForm();
    };

    const openCreate = () => {
        resetForm();
        form.setData({
            branch_id: selectedBranch,
            name: '',
            code: '',
            type: 'percent',
            value: '',
            min_purchase: '0',
            max_discount: '',
            starts_at: '',
            ends_at: '',
            is_active: true,
            notes: '',
        });
        setModal('create');
    };

    const openEdit = (discount: Discount) => {
        setSelectedDiscount(discount);

        form.setData({
            branch_id: discount.branch_id ? String(discount.branch_id) : '',
            name: discount.name ?? '',
            code: discount.code ?? '',
            type: discount.type ?? 'percent',
            value: String(discount.value ?? ''),
            min_purchase: String(discount.min_purchase ?? '0'),
            max_discount: discount.max_discount ? String(discount.max_discount) : '',
            starts_at: toInputDate(discount.starts_at),
            ends_at: toInputDate(discount.ends_at),
            is_active: Boolean(discount.is_active),
            notes: discount.notes ?? '',
        });

        setModal('edit');
    };

    const openDelete = (discount: Discount) => {
        setSelectedDiscount(discount);
        setModal('delete');
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();

        if (modal === 'edit' && selectedDiscount) {
            form.put(`${DISCOUNTS_URL}/${selectedDiscount.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post(DISCOUNTS_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const submitDelete = () => {
        if (!selectedDiscount) return;

        router.delete(`${DISCOUNTS_URL}/${selectedDiscount.id}`, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const resetFilters = () => {
        setSelectedBranch('');
        setSearch('');
        setStatus('');

        router.get(
            DISCOUNTS_URL,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const selectBranch = (branchId: number | '') => {
        const id = branchId === '' ? '' : String(branchId);
        setSelectedBranch(id);
        setModal(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Discounts" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                    <BadgePercent className="size-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-xl">Discounts</CardTitle>

                                        {activeBranch ? (
                                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                {activeBranch.name}
                                            </span>
                                        ) : (
                                            <span className="rounded-md bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                All Branches
                                            </span>
                                        )}
                                    </div>

                                    <CardDescription className="mt-1">
                                        Manage percent and fixed discounts for POS checkout.
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModal('branch_picker')}
                                    className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
                                >
                                    <Building2 className="size-4" />
                                    {activeBranch ? 'Change Branch' : 'Filter Branch'}
                                </button>

                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                                >
                                    <Plus className="size-4" />
                                    Add Discount
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        title="Total Discounts"
                        value={String(discounts.total ?? 0)}
                        icon={<Tag className="size-5" />}
                    />
                    <SummaryCard
                        title="Active Filter"
                        value={activeBranch?.name ?? 'All Branches'}
                        icon={<Store className="size-5" />}
                    />
                    <SummaryCard
                        title="Status Filter"
                        value={status ? status.toUpperCase() : 'ALL'}
                        icon={<BadgePercent className="size-5" />}
                    />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardContent className="p-5">
                        <div className="grid gap-2 lg:grid-cols-[minmax(280px,1fr)_180px_44px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search discount name or code..."
                                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-11 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
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

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <CardTitle className="text-xl">Discount List</CardTitle>
                        <CardDescription className="mt-1">
                            Discounts can be global or assigned to a specific branch.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Discount</th>
                                        <th className="px-4 py-3 font-medium">Branch</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 text-right font-medium">Value</th>
                                        <th className="px-4 py-3 font-medium">Validity</th>
                                        <th className="px-4 py-3 text-center font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(discounts?.data ?? []).length > 0 ? (
                                        discounts.data.map((discount) => {
                                            const branch = branches.find((item) => Number(item.id) === Number(discount.branch_id));

                                            return (
                                                <tr key={discount.id} className="border-t border-sidebar-border/70 hover:bg-muted/30 dark:border-sidebar-border">
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold">{discount.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {discount.code ? `Code: ${discount.code}` : 'No code'}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {branch ? (
                                                            <div>
                                                                <div className="font-medium text-foreground">{branch.name}</div>
                                                                <div className="text-xs">{branch.code || 'NO CODE'}</div>
                                                            </div>
                                                        ) : (
                                                            'All Branches'
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                                            {discount.type}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {discountValue(discount)}
                                                        <div className="text-xs font-normal text-muted-foreground">
                                                            Min: {money(discount.min_purchase)}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="size-4" />
                                                            <span>
                                                                {formatDate(discount.starts_at)} - {formatDate(discount.ends_at)}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <StatusBadge active={discount.is_active} />
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEdit(discount)}
                                                                className="inline-flex size-9 items-center justify-center rounded-md border hover:bg-muted"
                                                                title="Edit"
                                                            >
                                                                <Edit className="size-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => openDelete(discount)}
                                                                className="inline-flex size-9 items-center justify-center rounded-md border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-16 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <BadgePercent className="size-5 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="font-medium">No discounts found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Add your first discount to use it in POS checkout.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={openCreate}
                                                        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                                    >
                                                        Add Discount
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing <b>{discounts?.from ?? 0}</b> to <b>{discounts?.to ?? 0}</b> of{' '}
                                <b>{discounts?.total ?? 0}</b> discounts
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(discounts?.links ?? []).map((link, index) => (
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

                {(modal === 'create' || modal === 'edit') && (
                    <Modal title={modal === 'create' ? 'Add Discount' : 'Edit Discount'} onClose={closeModal}>
                        <form onSubmit={submitForm} className="space-y-4 p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Discount Name" error={form.errors.name}>
                                    <input
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g. Senior Citizen Discount"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Code" error={form.errors.code}>
                                    <input
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value)}
                                        placeholder="e.g. SENIOR20"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>
                            </div>

                            <Field label="Branch" error={form.errors.branch_id}>
                                <select
                                    value={form.data.branch_id}
                                    onChange={(e) => form.setData('branch_id', e.target.value)}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={String(branch.id)}>
                                            {branch.name}
                                            {branch.code ? ` (${branch.code})` : ''}
                                            {branch.is_main ? ' — Main' : ''}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Type" error={form.errors.type}>
                                    <select
                                        value={form.data.type}
                                        onChange={(e) => form.setData('type', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="percent">Percent</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </Field>

                                <Field label={form.data.type === 'percent' ? 'Percent Value' : 'Fixed Amount'} error={form.errors.value}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.value}
                                        onChange={(e) => form.setData('value', e.target.value)}
                                        placeholder={form.data.type === 'percent' ? '20' : '100'}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Min Purchase" error={form.errors.min_purchase}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.min_purchase}
                                        onChange={(e) => form.setData('min_purchase', e.target.value)}
                                        placeholder="0"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Max Discount" error={form.errors.max_discount}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.max_discount}
                                        onChange={(e) => form.setData('max_discount', e.target.value)}
                                        placeholder="Optional"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Starts At" error={form.errors.starts_at}>
                                    <input
                                        type="date"
                                        value={form.data.starts_at}
                                        onChange={(e) => form.setData('starts_at', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Ends At" error={form.errors.ends_at}>
                                    <input
                                        type="date"
                                        value={form.data.ends_at}
                                        onChange={(e) => form.setData('ends_at', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>
                            </div>

                            <Field label="Status" error={form.errors.is_active}>
                                <select
                                    value={form.data.is_active ? '1' : '0'}
                                    onChange={(e) => form.setData('is_active', e.target.value === '1')}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </Field>

                            <Field label="Notes" error={form.errors.notes}>
                                <textarea
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Optional notes"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <ModalActions
                                onClose={closeModal}
                                disabled={form.processing}
                                submitText={modal === 'create' ? 'Save Discount' : 'Update Discount'}
                            />
                        </form>
                    </Modal>
                )}

                {modal === 'delete' && selectedDiscount && (
                    <Modal title="Delete Discount" onClose={closeModal}>
                        <div className="space-y-4 p-5">
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this discount?
                                </p>
                                <div className="mt-2 font-semibold">{selectedDiscount.name}</div>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={submitDelete}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Delete Discount
                                </button>
                            </div>
                        </div>
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

function toInputDate(value?: string | null) {
    if (!value) return '';

    return String(value).slice(0, 10);
}

function SummaryCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string;
    icon: ReactNode;
}) {
    return (
        <Card tone="topline" variant="default" className="min-h-[110px] overflow-hidden shadow-sm">
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return active ? (
        <span className="inline-flex rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
            Active
        </span>
    ) : (
        <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Inactive
        </span>
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
    onSelect: (branchId: number | '') => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-hidden shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                    <div>
                        <CardTitle className="text-lg">Choose Branch</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Select a branch to filter discounts.
                        </p>
                    </div>

                    <button onClick={onClose} className="rounded-md p-2 hover:bg-muted">
                        <X className="size-4" />
                    </button>
                </CardHeader>

                <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => onSelect('')}
                        className={[
                            'group overflow-hidden rounded-xl border text-left transition hover:border-primary/60 hover:bg-muted/40',
                            selectedBranch === '' ? 'border-primary bg-primary/5' : 'border-sidebar-border/70 dark:border-sidebar-border',
                        ].join(' ')}
                    >
                        <div className="flex items-start justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-full border bg-background">
                                    <Store className="size-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <div className="font-semibold">All Branches</div>
                                    <div className="text-xs uppercase text-muted-foreground">GLOBAL FILTER</div>
                                </div>
                            </div>

                            <MoreHorizontal className="size-4 text-muted-foreground" />
                        </div>

                        <div className="border-t px-4 py-4 text-sm text-muted-foreground">
                            Show global and branch-specific discounts.
                        </div>
                    </button>

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
                                Click this branch to filter discounts.
                            </div>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl">
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