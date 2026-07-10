import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Head,
    Link,
    router,
    useForm,
} from '@inertiajs/react';
import {
    Activity,
    Boxes,
    Building2,
    CheckCircle2,
    LoaderCircle,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Search,
    Star,
    Trash2,
    User,
    Warehouse as WarehouseIcon,
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

type BranchOption = {
    id: number;
    name: string;
    code: string;
    is_main: boolean;
    is_active: boolean;
};

type Warehouse = {
    id: number;
    tenant_id: number;
    branch_id: number;
    name: string;
    code: string;
    description: string | null;
    address: string | null;
    contact_person: string | null;
    phone: string | null;
    is_main: boolean;
    is_active: boolean;
    stocks_count: number;
    stock_movements_count: number;
    branch: BranchOption | null;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedWarehouses = {
    current_page: number;
    data: Warehouse[];
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

type WarehouseSummary = {
    total: number;
    active: number;
    inactive: number;
    main: number;
};

type WarehouseFilters = {
    search: string;
    status: string;
    branch_id: number | null;
};

type WarehouseFormData = {
    branch_id: string;
    name: string;
    code: string;
    description: string;
    address: string;
    contact_person: string;
    phone: string;
    is_main: boolean;
    is_active: boolean;
};

type WarehousePageProps = {
    warehouses: PaginatedWarehouses;
    branches: BranchOption[];
    summary: WarehouseSummary;
    filters: WarehouseFilters;
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
        title: 'Warehouses',
        href: '/warehouses',
    },
];

function getDefaultBranchId(
    branches: BranchOption[],
): string {
    const activeBranch = branches.find(
        (branch) => branch.is_active,
    );

    if (activeBranch) {
        return String(activeBranch.id);
    }

    if (branches.length > 0) {
        return String(branches[0].id);
    }

    return '';
}

function getEmptyWarehouseForm(
    branches: BranchOption[],
): WarehouseFormData {
    return {
        branch_id: getDefaultBranchId(branches),
        name: '',
        code: '',
        description: '',
        address: '',
        contact_person: '',
        phone: '',
        is_main: false,
        is_active: true,
    };
}

/*
|--------------------------------------------------------------------------
| Warehouse Page
|--------------------------------------------------------------------------
*/

export default function WarehouseIndex({
    warehouses,
    branches,
    summary,
    filters,
}: WarehousePageProps) {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingWarehouse, setEditingWarehouse] =
        useState<Warehouse | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [branchId, setBranchId] = useState(
        filters.branch_id
            ? String(filters.branch_id)
            : '',
    );

    const form = useForm<WarehouseFormData>(
        getEmptyWarehouseForm(branches),
    );

    /*
    |--------------------------------------------------------------------------
    | Modal Actions
    |--------------------------------------------------------------------------
    */

    function resetAndCloseModal(): void {
        setIsModalOpen(false);
        setEditingWarehouse(null);

        form.clearErrors();
        form.setData(
            getEmptyWarehouseForm(branches),
        );
    }

    function closeModal(): void {
        if (form.processing) {
            return;
        }

        resetAndCloseModal();
    }

    function openCreateModal(): void {
        setEditingWarehouse(null);

        form.clearErrors();
        form.setData(
            getEmptyWarehouseForm(branches),
        );

        setIsModalOpen(true);
    }

    function openEditModal(
        warehouse: Warehouse,
    ): void {
        setEditingWarehouse(warehouse);

        form.clearErrors();

        form.setData({
            branch_id: String(warehouse.branch_id),
            name: warehouse.name,
            code: warehouse.code,
            description:
                warehouse.description ?? '',
            address: warehouse.address ?? '',
            contact_person:
                warehouse.contact_person ?? '',
            phone: warehouse.phone ?? '',
            is_main: warehouse.is_main,
            is_active: warehouse.is_active,
        });

        setIsModalOpen(true);
    }

    /*
    |--------------------------------------------------------------------------
    | Create and Update
    |--------------------------------------------------------------------------
    */

    function submitWarehouse(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingWarehouse) {
            form.put(
                `/warehouses/${editingWarehouse.id}`,
                {
                    preserveScroll: true,
                    onSuccess: resetAndCloseModal,
                },
            );

            return;
        }

        form.post('/warehouses', {
            preserveScroll: true,
            onSuccess: resetAndCloseModal,
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
            '/warehouses',
            {
                search: search.trim() || undefined,
                status: status || undefined,
                branch_id:
                    branchId || undefined,
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
        setBranchId('');

        router.get(
            '/warehouses',
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

    function toggleStatus(
        warehouse: Warehouse,
    ): void {
        if (
            warehouse.is_main &&
            warehouse.is_active
        ) {
            const confirmed = window.confirm(
                'This is the main warehouse of its branch. Another active warehouse may be required before deactivating it. Continue?',
            );

            if (!confirmed) {
                return;
            }
        }

        router.patch(
            `/warehouses/${warehouse.id}/status`,
            {
                is_active: !warehouse.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function deleteWarehouse(
        warehouse: Warehouse,
    ): void {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${warehouse.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/warehouses/${warehouse.id}`,
            {
                preserveScroll: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse Management" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Header */}
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Location Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Warehouses
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage warehouse locations under
                            each business branch.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={branches.length === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="size-4" />

                        Add Warehouse
                    </button>
                </section>

                {/* No Branch Warning */}
                {branches.length === 0 && (
                    <section className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Building2 className="mt-0.5 size-5 shrink-0 text-amber-600" />

                            <div>
                                <p className="text-sm font-medium">
                                    No branch available
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create a branch before adding
                                    a warehouse.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/branches"
                            className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            Manage Branches
                        </Link>
                    </section>
                )}

                {/* Summary Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Warehouses"
                        value={summary.total}
                        icon={
                            <WarehouseIcon className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Active Warehouses"
                        value={summary.active}
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Main Warehouses"
                        value={summary.main}
                        icon={
                            <Star className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Inactive Warehouses"
                        value={summary.inactive}
                        icon={
                            <XCircle className="size-5" />
                        }
                    />
                </section>

                {/* Main Table Card */}
                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
                    {/* Filters */}
                    <form
                        onSubmit={applyFilters}
                        className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search warehouse, code, location, or contact..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={branchId}
                            onChange={(event) =>
                                setBranchId(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All branches
                            </option>

                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name} ({branch.code})
                                    {!branch.is_active
                                        ? ' - Inactive'
                                        : ''}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value,
                                )
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
                        <table className="w-full min-w-[1150px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Warehouse
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Branch
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Location
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Contact
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Stock Records
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Movements
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
                                {warehouses.data.map(
                                    (warehouse) => (
                                        <tr
                                            key={warehouse.id}
                                            className="transition hover:bg-muted/30"
                                        >
                                            {/* Warehouse */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <WarehouseIcon className="size-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium">
                                                                {
                                                                    warehouse.name
                                                                }
                                                            </p>

                                                            {warehouse.is_main && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                                                    <Star className="size-3" />
                                                                    MAIN
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Code:{' '}
                                                            {
                                                                warehouse.code
                                                            }
                                                        </p>

                                                        {warehouse.description && (
                                                            <p className="mt-1 max-w-[230px] truncate text-xs text-muted-foreground">
                                                                {
                                                                    warehouse.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Branch */}
                                            <td className="px-5 py-4">
                                                {warehouse.branch ? (
                                                    <div>
                                                        <div className="flex items-center gap-2 text-sm font-medium">
                                                            <Building2 className="size-4 text-muted-foreground" />

                                                            {
                                                                warehouse
                                                                    .branch
                                                                    .name
                                                            }
                                                        </div>

                                                        <p className="mt-1 pl-6 text-xs text-muted-foreground">
                                                            {
                                                                warehouse
                                                                    .branch
                                                                    .code
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        No branch
                                                    </span>
                                                )}
                                            </td>

                                            {/* Location */}
                                            <td className="px-5 py-4">
                                                <div className="flex max-w-[240px] items-start gap-2 text-sm">
                                                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <span>
                                                        {warehouse.address ??
                                                            'No address provided'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="flex items-center gap-2 text-sm">
                                                        <User className="size-3.5 text-muted-foreground" />

                                                        <span>
                                                            {warehouse.contact_person ??
                                                                'No contact person'}
                                                        </span>
                                                    </p>

                                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="size-3.5" />

                                                        <span>
                                                            {warehouse.phone ??
                                                                'No phone'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Stock Count */}
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                                                    <Boxes className="size-4 text-muted-foreground" />

                                                    <span className="font-medium">
                                                        {
                                                            warehouse.stocks_count
                                                        }
                                                    </span>
                                                </span>
                                            </td>

                                            {/* Movement Count */}
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                                                    <Activity className="size-4 text-muted-foreground" />

                                                    <span className="font-medium">
                                                        {
                                                            warehouse.stock_movements_count
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
                                                            warehouse,
                                                        )
                                                    }
                                                    className={[
                                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                                                        warehouse.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                                            : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
                                                    ].join(
                                                        ' ',
                                                    )}
                                                >
                                                    {warehouse.is_active ? (
                                                        <CheckCircle2 className="size-3.5" />
                                                    ) : (
                                                        <XCircle className="size-3.5" />
                                                    )}

                                                    {warehouse.is_active
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
                                                                warehouse,
                                                            )
                                                        }
                                                        title="Edit warehouse"
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteWarehouse(
                                                                warehouse,
                                                            )
                                                        }
                                                        title={
                                                            warehouse.stocks_count >
                                                                0 ||
                                                            warehouse.stock_movements_count >
                                                                0
                                                                ? 'Warehouse has stock records or movement history'
                                                                : 'Delete warehouse'
                                                        }
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border text-destructive transition hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {/* Empty State */}
                                {warehouses.data.length ===
                                    0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center"
                                        >
                                            <WarehouseIcon className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No warehouses
                                                found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Add a warehouse
                                                under an existing
                                                branch.
                                            </p>

                                            {branches.length >
                                            0 ? (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        openCreateModal
                                                    }
                                                    className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                                >
                                                    <Plus className="size-4" />
                                                    Add Warehouse
                                                </button>
                                            ) : (
                                                <Link
                                                    href="/branches"
                                                    className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                                >
                                                    <Building2 className="size-4" />
                                                    Create Branch
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <WarehousePagination
                        warehouses={warehouses}
                    />
                </section>
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingWarehouse
                                        ? 'Edit Warehouse'
                                        : 'Add Warehouse'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Enter the warehouse
                                    information below.
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

                        {/* Form */}
                        <form
                            onSubmit={submitWarehouse}
                            className="space-y-5 p-6"
                        >
                            <FormField
                                label="Branch"
                                error={
                                    form.errors.branch_id
                                }
                                required
                            >
                                <select
                                    value={
                                        form.data.branch_id
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'branch_id',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    <option value="">
                                        Select a branch
                                    </option>

                                    {branches.map(
                                        (branch) => (
                                            <option
                                                key={
                                                    branch.id
                                                }
                                                value={
                                                    branch.id
                                                }
                                            >
                                                {
                                                    branch.name
                                                }{' '}
                                                (
                                                {
                                                    branch.code
                                                })
                                                {!branch.is_active
                                                    ? ' - Inactive'
                                                    : ''}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </FormField>

                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    label="Warehouse Name"
                                    error={
                                        form.errors.name
                                    }
                                    required
                                >
                                    <input
                                        type="text"
                                        value={
                                            form.data.name
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Main Warehouse"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Warehouse Code"
                                    error={
                                        form.errors.code
                                    }
                                    required
                                >
                                    <input
                                        type="text"
                                        value={
                                            form.data.code
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'code',
                                                event.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="WH-MAIN"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Contact Person"
                                    error={
                                        form.errors
                                            .contact_person
                                    }
                                >
                                    <input
                                        type="text"
                                        value={
                                            form.data
                                                .contact_person
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'contact_person',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Warehouse supervisor"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Phone Number"
                                    error={
                                        form.errors.phone
                                    }
                                >
                                    <input
                                        type="text"
                                        value={
                                            form.data.phone
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="09XXXXXXXXX"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Address"
                                error={
                                    form.errors.address
                                }
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
                                    placeholder="Complete warehouse address"
                                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </FormField>

                            <FormField
                                label="Description"
                                error={
                                    form.errors.description
                                }
                            >
                                <textarea
                                    rows={3}
                                    value={
                                        form.data.description
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Optional warehouse description"
                                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </FormField>

                            {/* Settings */}
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
                                                is_main:
                                                    checked,
                                                is_active:
                                                    checked
                                                        ? true
                                                        : form
                                                              .data
                                                              .is_active,
                                            });
                                        }}
                                        className="mt-1 size-4 rounded border"
                                    />

                                    <span>
                                        <span className="block text-sm font-medium">
                                            Main Warehouse
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Set as the primary
                                            warehouse of the
                                            selected branch.
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
                                            Active Warehouse
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Allow stock records
                                            to use this
                                            warehouse.
                                        </span>
                                    </span>
                                </label>
                            </div>

                            {(form.errors.is_main ||
                                form.errors.is_active) && (
                                <p className="text-sm text-destructive">
                                    {form.errors.is_main ??
                                        form.errors
                                            .is_active}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={
                                        form.processing
                                    }
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        form.processing
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {form.processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}

                                    {editingWarehouse
                                        ? 'Save Changes'
                                        : 'Create Warehouse'}
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

function WarehousePagination({
    warehouses,
}: {
    warehouses: PaginatedWarehouses;
}) {
    if (warehouses.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {warehouses.from ?? 0} to{' '}
                {warehouses.to ?? 0} of{' '}
                {warehouses.total} warehouses
            </p>

            <div className="flex flex-wrap gap-1">
                {warehouses.links.map(
                    (link, index) => (
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
                    ),
                )}
            </div>
        </div>
    );
}