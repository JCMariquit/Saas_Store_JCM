import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    ShieldCheck,
    Store,
    Trash2,
    UserCog,
    UsersRound,
    X,
    XCircle,
} from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const STAFF_URL = '/staff/manager/employee';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Employee', href: STAFF_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type StaffRole = 'cashier' | 'staff';

type Staff = {
    id: number;
    created_by: number;
    branch_id: number;
    name: string;
    email: string;
    role: StaffRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type StaffForm = {
    name: string;
    email: string;
    password: string;
    role: StaffRole;
    is_active: boolean;
};

type Props = {
    staff: Staff[];
    branch: Branch;
    filters?: {
        search?: string | null;
    };
};

function formatDate(date: string) {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return date;

    return value.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
}

function initials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function roleLabel(role: StaffRole | string) {
    if (role === 'cashier') return 'Cashier';
    if (role === 'staff') return 'Support Staff';

    return role;
}

function roleClass(role: StaffRole | string) {
    if (role === 'cashier') {
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
    }

    return 'bg-violet-500/10 text-violet-700 dark:text-violet-300';
}

function statusClass(active: boolean) {
    return active
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
        : 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300';
}

export default function ManagerEmployeeIndex({ staff = [], branch, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const form = useForm<StaffForm>({
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        is_active: true,
    });

    const filteredStaff = useMemo(() => {
        return staff.filter((item) => {
            const matchStatus = !statusFilter || (statusFilter === 'active' ? item.is_active : !item.is_active);
            const matchRole = !roleFilter || item.role === roleFilter;

            return matchStatus && matchRole;
        });
    }, [staff, statusFilter, roleFilter]);

    const summary = useMemo(() => {
        const total = staff.length;
        const active = staff.filter((item) => item.is_active).length;
        const inactive = staff.filter((item) => !item.is_active).length;
        const cashiers = staff.filter((item) => item.role === 'cashier').length;
        const support = staff.filter((item) => item.role === 'staff').length;

        const now = new Date();

        const newThisMonth = staff.filter((item) => {
            const created = new Date(item.created_at);

            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;

        return { total, active, inactive, cashiers, support, newThisMonth };
    }, [staff]);

    const applySearch = () => {
        router.get(
            STAFF_URL,
            {
                search: search || undefined,
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
        setStatusFilter('');
        setRoleFilter('');

        router.get(STAFF_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetForm = () => {
        form.setData({
            name: '',
            email: '',
            password: '',
            role: 'cashier',
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
            role: item.role,
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

    const submit = (event: FormEvent) => {
        event.preventDefault();

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
        if (!confirm(`Delete "${item.name}"? This will remove the employee account.`)) return;

        router.delete(`${STAFF_URL}/${item.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Employee" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UsersRound className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Employee Control</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage cashier and support staff accounts assigned to your manager branch.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>

                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>

                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                    {branch.is_active && <span className="rounded-full border px-3 py-1">Active</span>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                            <Plus className="size-4" />
                            Add Employee
                        </button>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Total Employees"
                        value={summary.total}
                        description="All branch employee accounts."
                        icon={<UsersRound className="size-5" />}
                    />

                    <SummaryCard
                        title="Active"
                        value={summary.active}
                        description="Can access assigned pages."
                        icon={<CheckCircle2 className="size-5" />}
                        variant="success"
                    />

                    <SummaryCard
                        title="Inactive"
                        value={summary.inactive}
                        description="Temporarily disabled."
                        icon={<XCircle className="size-5" />}
                        variant="danger"
                    />

                    <SummaryCard
                        title="Cashiers"
                        value={summary.cashiers}
                        description="Cashier POS users."
                        icon={<ShieldCheck className="size-5" />}
                        variant="warning"
                    />

                    <SummaryCard
                        title="Support Staff"
                        value={summary.support}
                        description="Support or branch staff."
                        icon={<UserCog className="size-5" />}
                    />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="relative xl:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
                            <Search className="absolute left-3 top-[34px] size-4 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') applySearch();
                                }}
                                placeholder="Search employee name, email, or role..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
                            <select
                                value={roleFilter}
                                onChange={(event) => setRoleFilter(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Roles</option>
                                <option value="cashier">Cashier</option>
                                <option value="staff">Support Staff</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2 xl:col-span-2">
                            <button
                                type="button"
                                onClick={applySearch}
                                className="inline-flex h-10 w-[130px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Search className="size-4" />
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold">Employee Accounts</h2>
                            <p className="text-sm text-muted-foreground">
                                Cashiers can access POS features, while support staff can access support-side branch features.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-muted/30 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Current Result</p>
                            <p className="mt-1 text-sm font-semibold">
                                Showing {filteredStaff.length} of {staff.length} employee accounts
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Employee</th>
                                    <th className="px-4 py-3 text-left font-medium">Email</th>
                                    <th className="px-4 py-3 text-left font-medium">Role</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Created</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStaff.length > 0 ? (
                                    filteredStaff.map((item) => (
                                        <tr key={item.id} className="border-t transition hover:bg-muted/40">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                                                        {initials(item.name)}
                                                    </div>

                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="mt-1 text-xs text-muted-foreground">ID: #{item.id}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-muted-foreground">{item.email}</td>

                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${roleClass(item.role)}`}>
                                                    <ShieldCheck className="size-3.5" />
                                                    {roleLabel(item.role)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.is_active)}`}>
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-muted-foreground">{formatDate(item.created_at)}</td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStatus(item)}
                                                        className={`inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium ${
                                                            item.is_active
                                                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950'
                                                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950'
                                                        }`}
                                                    >
                                                        {item.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="inline-flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => deleteStaff(item)}
                                                        className="inline-flex size-8 items-center justify-center rounded-lg border text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
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
                                        <td colSpan={6} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <UsersRound className="size-5 text-muted-foreground" />
                                                </div>

                                                <h3 className="font-medium">No employees found</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Create your first cashier or support staff account for this branch.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={openCreateModal}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                                >
                                                    <Plus className="size-4" />
                                                    Add Employee
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isOpen && (
                    <Modal>
                        <div className="flex items-start justify-between gap-4 border-b p-5">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">{editingStaff ? 'Edit Employee' : 'Add Employee'}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {editingStaff ? 'Update employee details or reset password.' : `Create an employee account under ${branch.name}.`}
                                </p>
                            </div>

                            <button type="button" onClick={closeModal} className="rounded-lg p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-5 p-5">
                            <div className="rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
                                This employee will be assigned to <b>{branch.name}</b>. Branch is fixed by manager assignment.
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Full Name" error={form.errors.name}>
                                    <input
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="e.g. Juan Dela Cruz"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </Field>

                                <Field label="Email Address" error={form.errors.email}>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        placeholder="employee@email.com"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </Field>

                                <Field label="Role" error={form.errors.role}>
                                    <select
                                        value={form.data.role}
                                        onChange={(event) => form.setData('role', event.target.value as StaffRole)}
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="cashier">Cashier</option>
                                        <option value="staff">Support Staff</option>
                                    </select>
                                </Field>

                                <Field label={editingStaff ? 'New Password (optional)' : 'Password'} error={form.errors.password}>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.data.password}
                                            onChange={(event) => form.setData('password', event.target.value)}
                                            placeholder={editingStaff ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                                            className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((value) => !value)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                                        >
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                </Field>

                                <Field label="Status" error={form.errors.is_active}>
                                    <select
                                        value={form.data.is_active ? '1' : '0'}
                                        onChange={(event) => form.setData('is_active', event.target.value === '1')}
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </Field>
                            </div>

                            <div className="rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
                                Role controls the employee access level. Cashier is for POS operation, while Support Staff is for branch support tasks.
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                                    Cancel
                                </button>

                                <button
                                    disabled={form.processing}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {form.processing ? 'Saving...' : editingStaff ? 'Update Employee' : 'Create Employee'}
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
    description,
    icon,
    variant = 'default',
}: {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
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

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>{icon}</div>
            </div>
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

function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-xl">{children}</div>
        </div>
    );
}