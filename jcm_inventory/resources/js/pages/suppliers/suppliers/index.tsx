import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    CircleUserRound,
    Hash,
    LoaderCircle,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    ReceiptText,
    Search,
    Trash2,
    Truck,
    UserRound,
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

type SupplierCreator = {
    id: number;
    name: string;
    email: string | null;
};

type Supplier = {
    id: number;
    code: string;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    alternate_phone: string | null;
    address: string | null;
    tax_number: string | null;
    payment_terms: string | null;
    credit_limit: number;
    notes: string | null;
    is_active: boolean;
    created_by: SupplierCreator | null;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedSuppliers = {
    current_page: number;
    data: Supplier[];
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

type SupplierSummary = {
    total: number;
    active: number;
    inactive: number;
};

type SupplierFilters = {
    search: string;
    status: string;
    sort: string;
};

type SupplierFormData = {
    code: string;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    alternate_phone: string;
    address: string;
    tax_number: string;
    payment_terms: string;
    credit_limit: string;
    notes: string;
    is_active: boolean;
};

type SupplierPageProps = {
    suppliers: PaginatedSuppliers;
    summary: SupplierSummary;
    filters: SupplierFilters;
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
        title: 'Suppliers',
        href: '/suppliers',
    },
];

const emptySupplierForm: SupplierFormData = {
    code: '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    alternate_phone: '',
    address: '',
    tax_number: '',
    payment_terms: '',
    credit_limit: '',
    notes: '',
    is_active: true,
};

/*
|--------------------------------------------------------------------------
| Supplier Page
|--------------------------------------------------------------------------
*/

export default function SupplierIndex({
    suppliers,
    summary,
    filters,
}: SupplierPageProps) {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingSupplier, setEditingSupplier] =
        useState<Supplier | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [sort, setSort] = useState(
        filters.sort ?? 'latest',
    );

    const form = useForm<SupplierFormData>({
        ...emptySupplierForm,
    });

    /*
    |--------------------------------------------------------------------------
    | Modal Actions
    |--------------------------------------------------------------------------
    */

    function resetModal(): void {
        setIsModalOpen(false);
        setEditingSupplier(null);

        form.clearErrors();

        form.setData({
            ...emptySupplierForm,
        });
    }

    function openCreateModal(): void {
        setEditingSupplier(null);

        form.clearErrors();

        form.setData({
            ...emptySupplierForm,
        });

        setIsModalOpen(true);
    }

    function openEditModal(
        supplier: Supplier,
    ): void {
        setEditingSupplier(supplier);

        form.clearErrors();

        form.setData({
            code: supplier.code ?? '',
            name: supplier.name,
            contact_person:
                supplier.contact_person ?? '',
            email: supplier.email ?? '',
            phone: supplier.phone ?? '',
            alternate_phone:
                supplier.alternate_phone ?? '',
            address: supplier.address ?? '',
            tax_number:
                supplier.tax_number ?? '',
            payment_terms:
                supplier.payment_terms ?? '',
            credit_limit:
                supplier.credit_limit > 0
                    ? String(supplier.credit_limit)
                    : '',
            notes: supplier.notes ?? '',
            is_active: supplier.is_active,
        });

        setIsModalOpen(true);
    }

    function closeModal(): void {
        if (form.processing) {
            return;
        }

        resetModal();
    }

    /*
    |--------------------------------------------------------------------------
    | Create and Update
    |--------------------------------------------------------------------------
    */

    function submitSupplier(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingSupplier) {
            form.put(
                `/suppliers/${editingSupplier.id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        resetModal();
                    },
                },
            );

            return;
        }

        form.post('/suppliers', {
            preserveScroll: true,
            onSuccess: () => {
                resetModal();
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
            '/suppliers',
            {
                search:
                    search.trim() || undefined,

                status:
                    status || undefined,

                sort:
                    sort !== 'latest'
                        ? sort
                        : undefined,
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
        setSort('latest');

        router.get(
            '/suppliers',
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
        supplier: Supplier,
    ): void {
        router.patch(
            `/suppliers/${supplier.id}/status`,
            {
                is_active:
                    !supplier.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function deleteSupplier(
        supplier: Supplier,
    ): void {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${supplier.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/suppliers/${supplier.id}`,
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
            <Head title="Supplier Management" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Procurement Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Suppliers
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage supplier contact
                            information, payment terms,
                            and credit details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Plus className="size-4" />

                        Add Supplier
                    </button>
                </section>

                {/* Summary Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="Total Suppliers"
                        value={summary.total}
                        icon={
                            <Truck className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Active Suppliers"
                        value={summary.active}
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Inactive Suppliers"
                        value={summary.inactive}
                        icon={
                            <XCircle className="size-5" />
                        }
                    />
                </section>

                {/* Supplier Table Card */}
                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
                    {/* Search and Filters */}
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
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Search supplier, code, contact, phone, email, or address..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

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

                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="latest">
                                Latest added
                            </option>

                            <option value="oldest">
                                Oldest added
                            </option>

                            <option value="name_asc">
                                Name A–Z
                            </option>

                            <option value="name_desc">
                                Name Z–A
                            </option>

                            <option value="code_asc">
                                Code A–Z
                            </option>

                            <option value="code_desc">
                                Code Z–A
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
                        <table className="w-full min-w-[1280px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Supplier
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Contact Person
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Contact Details
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Address
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Terms and Credit
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
                                {suppliers.data.map(
                                    (supplier) => (
                                        <tr
                                            key={
                                                supplier.id
                                            }
                                            className="transition hover:bg-muted/30"
                                        >
                                            {/* Supplier Information */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Truck className="size-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="max-w-[240px] truncate font-medium">
                                                            {
                                                                supplier.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Hash className="size-3" />

                                                            {
                                                                supplier.code
                                                            }
                                                        </p>

                                                        {supplier.tax_number && (
                                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <ReceiptText className="size-3" />

                                                                Tax:{' '}
                                                                {
                                                                    supplier.tax_number
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Person */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CircleUserRound className="size-4 shrink-0 text-muted-foreground" />

                                                    <span>
                                                        {supplier.contact_person ??
                                                            'Not provided'}
                                                    </span>
                                                </div>

                                                {supplier.created_by && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Added by{' '}
                                                        {
                                                            supplier
                                                                .created_by
                                                                .name
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            {/* Contact Details */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-1.5">
                                                    <p className="flex items-center gap-2 text-sm">
                                                        <Phone className="size-3.5 shrink-0 text-muted-foreground" />

                                                        <span>
                                                            {supplier.phone ??
                                                                'No phone'}
                                                        </span>
                                                    </p>

                                                    {supplier.alternate_phone && (
                                                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Phone className="size-3.5 shrink-0" />

                                                            <span>
                                                                {
                                                                    supplier.alternate_phone
                                                                }
                                                            </span>
                                                        </p>
                                                    )}

                                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="size-3.5 shrink-0" />

                                                        <span className="max-w-[220px] truncate">
                                                            {supplier.email ??
                                                                'No email'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Address */}
                                            <td className="px-5 py-4">
                                                <div className="flex max-w-[280px] items-start gap-2 text-sm">
                                                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <span className="line-clamp-3">
                                                        {supplier.address ??
                                                            'No address provided'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Terms and Credit */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <ReceiptText className="size-4 text-muted-foreground" />

                                                        <span>
                                                            {supplier.payment_terms ??
                                                                'No terms'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Banknote className="size-4 text-muted-foreground" />

                                                        <span className="font-medium">
                                                            {formatCurrency(
                                                                supplier.credit_limit,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleStatus(
                                                            supplier,
                                                        )
                                                    }
                                                    className={[
                                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                                                        supplier.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                                            : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
                                                    ].join(
                                                        ' ',
                                                    )}
                                                >
                                                    {supplier.is_active ? (
                                                        <CheckCircle2 className="size-3.5" />
                                                    ) : (
                                                        <XCircle className="size-3.5" />
                                                    )}

                                                    {supplier.is_active
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
                                                                supplier,
                                                            )
                                                        }
                                                        title="Edit supplier"
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteSupplier(
                                                                supplier,
                                                            )
                                                        }
                                                        title="Delete supplier"
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
                                {suppliers.data.length ===
                                    0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-16 text-center"
                                        >
                                            <Truck className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No suppliers
                                                found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Add your first
                                                supplier to begin
                                                creating purchase
                                                orders.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    openCreateModal
                                                }
                                                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                            >
                                                <Plus className="size-4" />

                                                Add Supplier
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <SupplierPagination
                        suppliers={suppliers}
                    />
                </section>
            </div>

            {/* Create and Edit Modal */}
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
                    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingSupplier
                                        ? 'Edit Supplier'
                                        : 'Add Supplier'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Enter the supplier
                                    information below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={
                                    form.processing
                                }
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Supplier Form */}
                        <form
                            onSubmit={
                                submitSupplier
                            }
                            className="space-y-6 p-6"
                        >
                            {/* Basic Information */}
                            <FormSection
                                title="Supplier Information"
                                description="Basic identification details of the supplier."
                                icon={
                                    <Truck className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label="Supplier Name"
                                        error={
                                            form.errors
                                                .name
                                        }
                                        required
                                    >
                                        <input
                                            type="text"
                                            value={
                                                form.data
                                                    .name
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'name',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="ABC Trading"
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Supplier Code"
                                        error={
                                            form.errors
                                                .code
                                        }
                                        hint="Leave blank to generate automatically."
                                    >
                                        <input
                                            type="text"
                                            value={
                                                form.data
                                                    .code
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'code',
                                                    event.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="SUP-001"
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
                                        <div className="relative">
                                            <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                type="text"
                                                value={
                                                    form
                                                        .data
                                                        .contact_person
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'contact_person',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Juan Dela Cruz"
                                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        label="Tax Number / TIN"
                                        error={
                                            form.errors
                                                .tax_number
                                        }
                                    >
                                        <div className="relative">
                                            <ReceiptText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                type="text"
                                                value={
                                                    form
                                                        .data
                                                        .tax_number
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'tax_number',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="000-000-000-000"
                                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                    </FormField>
                                </div>
                            </FormSection>

                            {/* Contact Information */}
                            <FormSection
                                title="Contact Information"
                                description="Phone numbers, email, and business address."
                                icon={
                                    <Phone className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label="Primary Phone"
                                        error={
                                            form.errors
                                                .phone
                                        }
                                    >
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                type="text"
                                                value={
                                                    form.data
                                                        .phone
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'phone',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="09XXXXXXXXX"
                                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        label="Alternate Phone"
                                        error={
                                            form.errors
                                                .alternate_phone
                                        }
                                    >
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                type="text"
                                                value={
                                                    form
                                                        .data
                                                        .alternate_phone
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'alternate_phone',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Optional alternate number"
                                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        label="Email Address"
                                        error={
                                            form.errors
                                                .email
                                        }
                                    >
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                type="email"
                                                value={
                                                    form.data
                                                        .email
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'email',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="supplier@example.com"
                                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <FormField
                                    label="Business Address"
                                    error={
                                        form.errors
                                            .address
                                    }
                                >
                                    <textarea
                                        rows={3}
                                        value={
                                            form.data
                                                .address
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'address',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Complete supplier business address"
                                        className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>
                            </FormSection>

                            {/* Financial Information */}
                            <FormSection
                                title="Payment Information"
                                description="Default purchasing terms and allowed credit limit."
                                icon={
                                    <Banknote className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label="Payment Terms"
                                        error={
                                            form.errors
                                                .payment_terms
                                        }
                                    >
                                        <input
                                            type="text"
                                            list="payment-terms-options"
                                            value={
                                                form
                                                    .data
                                                    .payment_terms
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'payment_terms',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Example: Net 30"
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />

                                        <datalist id="payment-terms-options">
                                            <option value="Cash on Delivery" />
                                            <option value="Cash Before Delivery" />
                                            <option value="Net 7" />
                                            <option value="Net 15" />
                                            <option value="Net 30" />
                                            <option value="Net 45" />
                                            <option value="Net 60" />
                                        </datalist>
                                    </FormField>

                                    <FormField
                                        label="Credit Limit"
                                        error={
                                            form.errors
                                                .credit_limit
                                        }
                                    >
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                ₱
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                inputMode="decimal"
                                                value={
                                                    form
                                                        .data
                                                        .credit_limit
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'credit_limit',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="h-10 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <FormField
                                    label="Notes"
                                    error={
                                        form.errors.notes
                                    }
                                >
                                    <textarea
                                        rows={4}
                                        value={
                                            form.data.notes
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'notes',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Additional supplier information, delivery instructions, or remarks"
                                        className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>
                            </FormSection>

                            {/* Supplier Status */}
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.data
                                                .is_active
                                        }
                                        onChange={(
                                            event,
                                        ) =>
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
                                            Active
                                            Supplier
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            Allow this
                                            supplier to be
                                            selected in
                                            purchase orders
                                            and receiving
                                            transactions.
                                        </span>
                                    </span>
                                </label>

                                {form.errors
                                    .is_active && (
                                    <p className="mt-2 text-sm text-destructive">
                                        {
                                            form.errors
                                                .is_active
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Form Buttons */}
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
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

                                    {editingSupplier
                                        ? 'Save Changes'
                                        : 'Create Supplier'}
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
| Form Section
|--------------------------------------------------------------------------
*/

function FormSection({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="space-y-5">
            <div className="flex items-start gap-3 border-b pb-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>

                <div>
                    <h3 className="text-sm font-semibold">
                        {title}
                    </h3>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
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
    hint,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
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

            {hint && !error && (
                <span className="block text-xs text-muted-foreground">
                    {hint}
                </span>
            )}

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

function SupplierPagination({
    suppliers,
}: {
    suppliers: PaginatedSuppliers;
}) {
    if (suppliers.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {suppliers.from ?? 0} to{' '}
                {suppliers.to ?? 0} of{' '}
                {suppliers.total} suppliers
            </p>

            <div className="flex flex-wrap gap-1">
                {suppliers.links.map(
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
                                        preserveState:
                                            true,
                                        preserveScroll:
                                            true,
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

/*
|--------------------------------------------------------------------------
| Currency Formatter
|--------------------------------------------------------------------------
*/

function formatCurrency(
    value: number | string | null,
): string {
    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount)) {
        return '₱0.00';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}