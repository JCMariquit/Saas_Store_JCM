import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, EyeOff, Pencil, Plus, RotateCcw, Search, ShieldCheck, Store, Trash2, UserRound, UsersRound, X, XCircle } from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

const CASHIERS_URL = '/staff/manager/cashiers';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Cashiers', href: CASHIERS_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type Cashier = {
    id: number;
    created_by: number;
    branch_id: number;
    name: string;
    email: string;
    phone?: string | null;
    username: string;
    role: 'cashier';
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type CashierForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    is_active: boolean;
};

type Props = {
    cashiers: Cashier[];
    branch: Branch;
    filters?: {
        search?: string | null;
    };
};

export default function ManagerCashiersIndex({ cashiers = [], branch, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);

    const form = useForm<CashierForm>({
        name: '',
        email: '',
        phone: '',
        password: '',
        is_active: true,
    });

    const filteredCashiers = useMemo(() => {
        if (!statusFilter) return cashiers;

        return cashiers.filter((item) => (statusFilter === 'active' ? item.is_active : !item.is_active));
    }, [cashiers, statusFilter]);

    const summary = useMemo(() => {
        const total = cashiers.length;
        const active = cashiers.filter((item) => item.is_active).length;
        const inactive = cashiers.filter((item) => !item.is_active).length;

        const now = new Date();

        const newThisMonth = cashiers.filter((item) => {
            const created = new Date(item.created_at);

            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;

        return { total, active, inactive, newThisMonth };
    }, [cashiers]);

    const applySearch = () => {
        router.get(
            CASHIERS_URL,
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');

        router.get(CASHIERS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetForm = () => {
        form.setData({
            name: '',
            email: '',
            phone: '',
            password: '',
            is_active: true,
        });

        form.clearErrors();
        setShowPassword(false);
    };

    const openCreateModal = () => {
        setEditingCashier(null);
        resetForm();
        setIsOpen(true);
    };

    const openEditModal = (item: Cashier) => {
        setEditingCashier(item);

        form.setData({
            name: item.name ?? '',
            email: item.email ?? '',
            phone: item.phone ?? '',
            password: '',
            is_active: item.is_active,
        });

        form.clearErrors();
        setShowPassword(false);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingCashier(null);
        form.clearErrors();
        setShowPassword(false);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (editingCashier) {
            form.put(`${CASHIERS_URL}/${editingCashier.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post(CASHIERS_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const toggleStatus = (item: Cashier) => {
        router.patch(`${CASHIERS_URL}/${item.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const deleteCashier = (item: Cashier) => {
        if (!confirm(`Delete "${item.name}"? This will remove the cashier account.`)) return;

        router.delete(`${CASHIERS_URL}/${item.id}`, {
            preserveScroll: true,
        });
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });

    const initials = (name: string) =>
        name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Cashiers" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                <Store className="size-5 text-muted-foreground" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="text-xl">{branch.name}</CardTitle>

                                    {branch.is_main && (
                                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            Main
                                        </span>
                                    )}

                                    <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                        Active
                                    </span>
                                </div>

                                <CardDescription className="mt-1">
                                    Branch code: {branch.code || 'No code'} · Manager can manage cashiers only in this branch.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Cashier Control</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Manage cashier accounts assigned to your branch.</p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                        <Plus className="size-4" />
                        Add Cashier
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Total Cashiers" value={summary.total} icon={<UsersRound className="size-5" />} />
                    <SummaryCard title="Active Cashiers" value={summary.active} variant="success" icon={<CheckCircle2 className="size-5" />} />
                    <SummaryCard title="Inactive Cashiers" value={summary.inactive} variant="neutral" icon={<XCircle className="size-5" />} />
                    <SummaryCard title="New This Month" value={summary.newThisMonth} icon={<UserRound className="size-5" />} />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-xl">Cashier Accounts</CardTitle>
                                <CardDescription className="mt-1">
                                    These accounts can access cashier POS, transactions, returns, and cash drawer pages.
                                </CardDescription>
                            </div>

                            <div className="flex rounded-md border bg-muted/30 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('')}
                                    className={`rounded px-3 py-1.5 ${!statusFilter ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    All
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('active')}
                                    className={`rounded px-3 py-1.5 ${statusFilter === 'active' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    Active
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('inactive')}
                                    className={`rounded px-3 py-1.5 ${statusFilter === 'inactive' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-md">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                                    placeholder="Search cashier name, email, or username..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={applySearch}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    Search
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    <RotateCcw className="size-4" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Cashier</th>
                                        <th className="px-4 py-3 font-medium">Username</th>
                                        <th className="px-4 py-3 font-medium">Role</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Created</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCashiers.length > 0 ? (
                                        filteredCashiers.map((item) => (
                                            <tr key={item.id} className="border-t border-sidebar-border/70 transition hover:bg-muted/30 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                                                            {initials(item.name)}
                                                        </div>

                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="mt-1 text-xs text-muted-foreground">{item.email}</div>
                                                            {item.phone && <div className="mt-0.5 text-xs text-muted-foreground">{item.phone}</div>}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{item.username}</td>

                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                        <ShieldCheck className="size-3.5" />
                                                        Cashier
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    {item.is_active ? (
                                                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.created_at)}</td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(item)}
                                                            className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs ${
                                                                item.is_active
                                                                    ? 'border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-300 dark:hover:bg-orange-950'
                                                                    : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-300 dark:hover:bg-green-950'
                                                            }`}
                                                        >
                                                            {item.is_active ? 'Deactivate' : 'Activate'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input hover:bg-muted"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => deleteCashier(item)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <UsersRound className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">No cashiers found</h3>

                                                    <p className="mt-1 text-sm text-muted-foreground">Create your first cashier account for this branch.</p>

                                                    <button
                                                        type="button"
                                                        onClick={openCreateModal}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                                    >
                                                        <Plus className="size-4" />
                                                        Add Cashier
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing <b>{filteredCashiers.length}</b> of <b>{cashiers.length}</b> cashier accounts
                        </div>
                    </CardContent>
                </Card>

                {isOpen && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">{editingCashier ? 'Edit Cashier' : 'Add Cashier'}</CardTitle>
                                <CardDescription>{editingCashier ? 'Update cashier details or reset password.' : `Create a cashier account under ${branch.name}.`}</CardDescription>
                            </div>

                            <button type="button" onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submit} className="space-y-5 p-5">
                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                This cashier will be assigned to <b>{branch.name}</b>. Branch is fixed by manager assignment.
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Full Name" error={form.errors.name}>
                                    <input
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g. Juan Dela Cruz"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Email Address" error={form.errors.email}>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="cashier@email.com"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Phone" error={form.errors.phone}>
                                    <input
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="Optional"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label={editingCashier ? 'New Password (optional)' : 'Password'} error={form.errors.password}>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            placeholder={editingCashier ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((value) => !value)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                                        >
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                </Field>

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
                            </div>

                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                Role is fixed as <b>Cashier</b>. This account can access cashier-side POS features only.
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button type="button" onClick={closeModal} className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
                                    Cancel
                                </button>

                                <button disabled={form.processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                                    {form.processing ? 'Saving...' : editingCashier ? 'Update Cashier' : 'Create Cashier'}
                                </button>
                            </div>
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
    value: number;
    icon: ReactNode;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5">
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
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

function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-hidden shadow-xl">{children}</Card>
        </div>
    );
}