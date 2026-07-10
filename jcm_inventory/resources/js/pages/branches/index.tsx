import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    LoaderCircle,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Search,
    Star,
    Trash2,
    Warehouse,
    X,
    XCircle,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Branch = {
    id: number;
    tenant_id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    is_main: boolean;
    is_active: boolean;
    warehouses_count: number;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedBranches = {
    current_page: number;
    data: Branch[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type BranchSummary = {
    total: number;
    active: number;
    inactive: number;
    main: number;
};

type BranchFilters = {
    search: string;
    status: string;
};

type BranchFormData = {
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    is_main: boolean;
    is_active: boolean;
};

type BranchPageProps = {
    branches: PaginatedBranches;
    summary: BranchSummary;
    filters: BranchFilters;
};

/*
|--------------------------------------------------------------------------
| Page Configuration
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Branches',
        href: '/branches',
    },
];

const emptyBranchForm: BranchFormData = {
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    is_main: false,
    is_active: true,
};

/*
|--------------------------------------------------------------------------
| Branch Page
|--------------------------------------------------------------------------
*/

export default function BranchIndex({
    branches,
    summary,
    filters,
}: BranchPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingBranch, setEditingBranch] =
        useState<Branch | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const form = useForm<BranchFormData>({
        ...emptyBranchForm,
    });

    /*
    |--------------------------------------------------------------------------
    | Modal Actions
    |--------------------------------------------------------------------------
    */

    function openCreateModal(): void {
        setEditingBranch(null);

        form.clearErrors();

        form.setData({
            ...emptyBranchForm,
        });

        setIsModalOpen(true);
    }

    function openEditModal(branch: Branch): void {
        setEditingBranch(branch);

        form.clearErrors();

        form.setData({
            name: branch.name,
            code: branch.code,
            address: branch.address ?? '',
            phone: branch.phone ?? '',
            email: branch.email ?? '',
            is_main: branch.is_main,
            is_active: branch.is_active,
        });

        setIsModalOpen(true);
    }

    function closeModal(): void {
        if (form.processing) {
            return;
        }

        setIsModalOpen(false);
        setEditingBranch(null);

        form.clearErrors();

        form.setData({
            ...emptyBranchForm,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Create and Update
    |--------------------------------------------------------------------------
    */

    function submitBranch(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingBranch) {
            form.put(`/branches/${editingBranch.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                },
            });

            return;
        }

        form.post('/branches', {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Search and Filters
    |--------------------------------------------------------------------------
    */

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/branches',
            {
                search: search.trim() || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function resetFilters(): void {
        setSearch('');
        setStatus('');

        router.get(
            '/branches',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Status and Delete
    |--------------------------------------------------------------------------
    */

    function toggleStatus(branch: Branch): void {
        if (branch.is_main && branch.is_active) {
            const confirmed = window.confirm(
                'This is currently the main branch. Another active branch is required before it can be deactivated. Continue?',
            );

            if (!confirmed) {
                return;
            }
        }

        router.patch(
            `/branches/${branch.id}/status`,
            {
                is_active: !branch.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function deleteBranch(branch: Branch): void {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${branch.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(`/branches/${branch.id}`, {
            preserveScroll: true,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Management" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Business Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Branches
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your business branches before
                            assigning warehouse locations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Plus className="size-4" />

                        Add Branch
                    </button>
                </section>

                {/* Summary Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Branches"
                        value={summary.total}
                        icon={
                            <Building2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Active Branches"
                        value={summary.active}
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Main Branch"
                        value={summary.main}
                        icon={<Star className="size-5" />}
                    />

                    <SummaryCard
                        title="Inactive Branches"
                        value={summary.inactive}
                        icon={<XCircle className="size-5" />}
                    />
                </section>

                {/* Branch Table Card */}
                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
                    {/* Search and Filters */}
                    <form
                        onSubmit={applyFilters}
                        className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search branch name, code, or address..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All statuses
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>

                        <button
                            type="submit"
                            className="h-10 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
                        >
                            Apply Filters
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            Reset
                        </button>
                    </form>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Branch
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Address
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Contact
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Warehouses
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {branches.data.map((branch) => (
                                    <tr
                                        key={branch.id}
                                        className="transition hover:bg-muted/30"
                                    >
                                        {/* Branch Information */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Building2 className="size-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-medium">
                                                            {
                                                                branch.name
                                                            }
                                                        </p>

                                                        {branch.is_main && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                                                <Star className="size-3" />

                                                                MAIN
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Code:{' '}
                                                        {branch.code}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Address */}
                                        <td className="px-5 py-4">
                                            <div className="flex max-w-[270px] items-start gap-2 text-sm">
                                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                <span>
                                                    {branch.address ??
                                                        'No address provided'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-1">
                                                <p className="flex items-center gap-2 text-sm">
                                                    <Phone className="size-3.5 text-muted-foreground" />

                                                    <span>
                                                        {branch.phone ??
                                                            'No phone'}
                                                    </span>
                                                </p>

                                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="size-3.5" />

                                                    <span>
                                                        {branch.email ??
                                                            'No email'}
                                                    </span>
                                                </p>
                                            </div>
                                        </td>

                                        {/* Warehouse Count */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                                                <Warehouse className="size-4 text-muted-foreground" />

                                                <span className="font-medium">
                                                    {
                                                        branch.warehouses_count
                                                    }
                                                </span>
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleStatus(
                                                        branch,
                                                    )
                                                }
                                                className={[
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                                                    branch.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                                        : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
                                                ].join(' ')}
                                            >
                                                {branch.is_active ? (
                                                    <CheckCircle2 className="size-3.5" />
                                                ) : (
                                                    <XCircle className="size-3.5" />
                                                )}

                                                {branch.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            branch,
                                                        )
                                                    }
                                                    title="Edit branch"
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteBranch(
                                                            branch,
                                                        )
                                                    }
                                                    title={
                                                        branch.warehouses_count >
                                                        0
                                                            ? 'Branch has warehouses and cannot be deleted'
                                                            : 'Delete branch'
                                                    }
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border text-destructive transition hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Empty State */}
                                {branches.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-16 text-center"
                                        >
                                            <Building2 className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No branches found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Create your first
                                                branch before adding
                                                warehouses.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    openCreateModal
                                                }
                                                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                            >
                                                <Plus className="size-4" />

                                                Add Branch
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <BranchPagination
                        branches={branches}
                    />
                </section>
            </div>

            {/* Create and Edit Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingBranch
                                        ? 'Edit Branch'
                                        : 'Add Branch'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Enter the branch information
                                    below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={form.processing}
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Branch Form */}
                        <form
                            onSubmit={submitBranch}
                            className="space-y-5 p-6"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    label="Branch Name"
                                    error={form.errors.name}
                                    required
                                >
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Main Branch"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Branch Code"
                                    error={form.errors.code}
                                    required
                                >
                                    <input
                                        type="text"
                                        value={form.data.code}
                                        onChange={(event) =>
                                            form.setData(
                                                'code',
                                                event.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="MAIN"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Phone Number"
                                    error={form.errors.phone}
                                >
                                    <input
                                        type="text"
                                        value={form.data.phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="09XXXXXXXXX"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Email Address"
                                    error={form.errors.email}
                                >
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="branch@example.com"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Branch Address"
                                error={form.errors.address}
                            >
                                <textarea
                                    rows={3}
                                    value={form.data.address}
                                    onChange={(event) =>
                                        form.setData(
                                            'address',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Complete branch address"
                                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </FormField>

                            {/* Branch Settings */}
                            <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 md:grid-cols-2">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.data.is_main
                                        }
                                        onChange={(event) => {
                                            const checked =
                                                event.target
                                                    .checked;

                                            form.setData({
                                                ...form.data,
                                                is_main: checked,
                                                is_active: checked
                                                    ? true
                                                    : form.data
                                                          .is_active,
                                            });
                                        }}
                                        className="mt-1 size-4 rounded border"
                                    />

                                    <span>
                                        <span className="block text-sm font-medium">
                                            Main Branch
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Set this branch as
                                            the primary business
                                            branch.
                                        </span>
                                    </span>
                                </label>

                                <label
                                    className={[
                                        'flex items-start gap-3',
                                        form.data.is_main
                                            ? 'cursor-not-allowed opacity-60'
                                            : 'cursor-pointer',
                                    ].join(' ')}
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.data.is_active
                                        }
                                        disabled={
                                            form.data.is_main
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'is_active',
                                                event.target
                                                    .checked,
                                            )
                                        }
                                        className="mt-1 size-4 rounded border"
                                    />

                                    <span>
                                        <span className="block text-sm font-medium">
                                            Active Branch
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Allow this branch to
                                            be used in the
                                            inventory system.
                                        </span>
                                    </span>
                                </label>
                            </div>

                            {(form.errors.is_main ||
                                form.errors.is_active) && (
                                <p className="text-sm text-destructive">
                                    {form.errors.is_main ??
                                        form.errors.is_active}
                                </p>
                            )}

                            {/* Form Buttons */}
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={form.processing}
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {form.processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}

                                    {editingBranch
                                        ? 'Save Changes'
                                        : 'Create Branch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: ReactNode;
}) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                        {value}
                    </p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Form Field
|--------------------------------------------------------------------------
*/

function FormField({
    label,
    error,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-destructive">
                        *
                    </span>
                )}
            </span>

            {children}

            {error && (
                <span className="block text-xs text-destructive">
                    {error}
                </span>
            )}
        </label>
    );
}

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

function BranchPagination({
    branches,
}: {
    branches: PaginatedBranches;
}) {
    if (branches.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {branches.from ?? 0} to{' '}
                {branches.to ?? 0} of {branches.total}{' '}
                branches
            </p>

            <div className="flex flex-wrap gap-1">
                {branches.links.map((link, index) => (
                    <button
                        key={`${link.label}-${index}`}
                        type="button"
                        disabled={!link.url}
                        onClick={() => {
                            if (!link.url) {
                                return;
                            }

                            router.get(
                                link.url,
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                        className={[
                            'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted',
                            !link.url
                                ? 'cursor-not-allowed opacity-40'
                                : '',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}