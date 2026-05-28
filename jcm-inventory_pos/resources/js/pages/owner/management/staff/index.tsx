import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    ShieldCheck,
    Trash2,
    UserRound,
    UsersRound,
    X,
    XCircle,
} from 'lucide-react';

const STAFF_URL = '/client/management/staff';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff',
        href: STAFF_URL,
    },
];

type Staff = {
    id: number;
    tenant_id: number;
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

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
};

type StaffForm = {
    name: string;
    email: string;
    password: string;
    branch_id: string;
    is_active: boolean;
};

type StaffPageProps = {
    staff: Staff[];
    branches: Branch[];
    filters?: {
        search?: string | null;
    };
};

export default function StaffIndex({ staff = [], branches = [], filters }: StaffPageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const defaultBranchId = branches[0]?.id ? String(branches[0].id) : '';

    const form = useForm<StaffForm>({
        name: '',
        email: '',
        password: '',
        branch_id: defaultBranchId,
        is_active: true,
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                STAFF_URL,
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const branchName = (branchId: number) => {
        const branch = branches.find((item) => item.id === branchId);

        if (!branch) return 'No branch';

        return `${branch.name}${branch.code ? ` (${branch.code})` : ''}${branch.is_main ? ' — Main' : ''}`;
    };

    const filteredStaff = useMemo(() => {
        if (!statusFilter) return staff;

        return staff.filter((item) => (statusFilter === 'active' ? item.is_active : !item.is_active));
    }, [staff, statusFilter]);

    const summary = useMemo(() => {
        const total = staff.length;
        const active = staff.filter((item) => item.is_active).length;
        const inactive = staff.filter((item) => !item.is_active).length;

        const now = new Date();

        const newThisMonth = staff.filter((item) => {
            const created = new Date(item.created_at);

            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;

        return { total, active, inactive, newThisMonth };
    }, [staff]);

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');

        router.get(STAFF_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetForm = () => {
        form.setData({
            name: '',
            email: '',
            password: '',
            branch_id: defaultBranchId,
            is_active: true,
        });

        form.clearErrors();
        setShowPassword(false);
    };

    const openCreateModal = () => {
        setEditingStaff(null);
        resetForm();
        setIsOpen(true);
    };

    const openEditModal = (item: Staff) => {
        setEditingStaff(item);

        form.setData({
            name: item.name ?? '',
            email: item.email ?? '',
            password: '',
            branch_id: item.branch_id ? String(item.branch_id) : defaultBranchId,
            is_active: item.is_active,
        });

        form.clearErrors();
        setShowPassword(false);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingStaff(null);
        form.clearErrors();
        setShowPassword(false);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (editingStaff) {
            form.put(`${STAFF_URL}/${editingStaff.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post(STAFF_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const toggleStatus = (item: Staff) => {
        router.patch(`${STAFF_URL}/${item.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const deleteStaff = (item: Staff) => {
        if (!confirm(`Delete "${item.name}"? This will remove the cashier account.`)) return;

        router.delete(`${STAFF_URL}/${item.id}`, {
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
            <Head title="Staff" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Staff Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage cashier accounts connected to your POS branches.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                        <Plus className="size-4" />
                        Add Staff
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Total Staff" value={summary.total} icon={<UsersRound className="size-5" />} />
                    <SummaryCard
                        title="Active Staff"
                        value={summary.active}
                        variant="success"
                        icon={<CheckCircle2 className="size-5" />}
                    />
                    <SummaryCard
                        title="Inactive Staff"
                        value={summary.inactive}
                        variant="neutral"
                        icon={<XCircle className="size-5" />}
                    />
                    <SummaryCard title="New This Month" value={summary.newThisMonth} icon={<UserRound className="size-5" />} />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-xl">Cashier Accounts</CardTitle>
                                <CardDescription className="mt-1">
                                    Staff accounts are saved under your POS system and assigned to a branch.
                                </CardDescription>
                            </div>

                            <div className="flex rounded-md border bg-muted/30 p-1 text-xs">
                                <button
                                    onClick={() => setStatusFilter('')}
                                    className={`rounded px-3 py-1.5 ${!statusFilter ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setStatusFilter('active')}
                                    className={`rounded px-3 py-1.5 ${statusFilter === 'active' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    Active
                                </button>
                                <button
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
                                    placeholder="Search staff name, email, or username..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Staff</th>
                                        <th className="px-4 py-3 font-medium">Role</th>
                                        <th className="px-4 py-3 font-medium">Branch</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Created</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredStaff.length > 0 ? (
                                        filteredStaff.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t border-sidebar-border/70 transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                                                            {initials(item.name)}
                                                        </div>

                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="mt-1 text-xs text-muted-foreground">{item.email}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                        <ShieldCheck className="size-3.5" />
                                                        Cashier
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {branchName(item.branch_id)}
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
                                                            onClick={() => openEditModal(item)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input hover:bg-muted"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => deleteStaff(item)}
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

                                                    <h3 className="font-medium">No staff found</h3>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Create your first cashier account and assign it to a branch.
                                                    </p>

                                                    <button
                                                        onClick={openCreateModal}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                                    >
                                                        <Plus className="size-4" />
                                                        Add Staff
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing <b>{filteredStaff.length}</b> of <b>{staff.length}</b> staff accounts
                        </div>
                    </CardContent>
                </Card>

                {isOpen && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">{editingStaff ? 'Edit Staff' : 'Add Staff'}</CardTitle>
                                <CardDescription>
                                    {editingStaff
                                        ? 'Update cashier details, branch assignment, or reset their password.'
                                        : 'Create a cashier account and assign it to a branch.'}
                                </CardDescription>
                            </div>

                            <button onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submit} className="space-y-5 p-5">
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

                                <Field label="Branch" error={form.errors.branch_id}>
                                    <select
                                        value={form.data.branch_id}
                                        onChange={(e) => form.setData('branch_id', e.target.value)}
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

                                <Field
                                    label={editingStaff ? 'New Password (optional)' : 'Password'}
                                    error={form.errors.password}
                                >
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            placeholder={editingStaff ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
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
                                Role is fixed as <b>Cashier</b>. This account can access POS terminal and cashier-side
                                transaction pages only. Branch assignment controls which store branch this staff belongs to.
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
                                    disabled={form.processing || branches.length === 0}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                >
                                    {editingStaff ? 'Update Staff' : 'Create Staff'}
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