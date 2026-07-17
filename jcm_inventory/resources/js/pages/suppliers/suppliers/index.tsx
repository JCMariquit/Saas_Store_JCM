import { ActionGroup } from '@/components/shared/action-group';
import { AppPagination } from '@/components/shared/app-pagination';
import { BooleanField } from '@/components/shared/boolean-field';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
    DataTable,
    type DataTableColumn,
} from '@/components/shared/data-table';
import { EntityAvatar } from '@/components/shared/entity-avatar';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { FormDialog } from '@/components/shared/form-dialog';
import { FormField } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
import { IconButton } from '@/components/shared/icon-button';
import { IconInput } from '@/components/shared/icon-input';
import { MoneyInput } from '@/components/shared/money-input';
import { PageContainer } from '@/components/shared/page-container';
import { SearchInput } from '@/components/shared/search-input';
import { SectionCard } from '@/components/shared/section-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem, 
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    CircleDollarSign,
    Hash,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    ReceiptText,
    RefreshCw,
    ShieldCheck,
    Trash2,
    Truck,
    UserRound,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import {
    type FormEvent,
    useEffect,
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

type SupplierMetricTone =
    | 'amber'
    | 'emerald'
    | 'red';

/*
|--------------------------------------------------------------------------
| Configuration
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

const ALL_VALUE = 'all';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function SupplierIndex({
    suppliers,
    summary,
    filters,
}: SupplierPageProps) {
    const [isDialogOpen, setIsDialogOpen] =
        useState(false);

    const [editingSupplier, setEditingSupplier] =
        useState<Supplier | null>(null);

    const [statusProcessingId, setStatusProcessingId] =
        useState<number | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Supplier | null>(null);

    const [deleteProcessing, setDeleteProcessing] =
        useState(false);

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

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
        setSort(filters.sort ?? 'latest');
    }, [
        filters.search,
        filters.status,
        filters.sort,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Form dialog
    |--------------------------------------------------------------------------
    */

    function resetSupplierForm(): void {
        form.clearErrors();
        form.setData({
            ...emptySupplierForm,
        });
    }

    function resetAndCloseDialog(): void {
        setIsDialogOpen(false);
        setEditingSupplier(null);
        resetSupplierForm();
    }

    function closeDialog(): void {
        if (form.processing) {
            return;
        }

        resetAndCloseDialog();
    }

    function handleDialogOpenChange(
        open: boolean,
    ): void {
        if (open) {
            setIsDialogOpen(true);
            return;
        }

        closeDialog();
    }

    function openCreateDialog(): void {
        setEditingSupplier(null);
        resetSupplierForm();
        setIsDialogOpen(true);
    }

    function openEditDialog(
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

        setIsDialogOpen(true);
    }

    function submitSupplier(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingSupplier) {
            form.put(
                `/suppliers/${editingSupplier.id}`,
                {
                    preserveScroll: true,
                    onSuccess: resetAndCloseDialog,
                },
            );

            return;
        }

        form.post('/suppliers', {
            preserveScroll: true,
            onSuccess: resetAndCloseDialog,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Filters
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
                status: status || undefined,
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
    | Status and delete
    |--------------------------------------------------------------------------
    */

    function toggleStatus(
        supplier: Supplier,
    ): void {
        if (statusProcessingId === supplier.id) {
            return;
        }

        router.patch(
            `/suppliers/${supplier.id}/status`,
            {
                is_active: !supplier.is_active,
            },
            {
                preserveScroll: true,
                onStart: () =>
                    setStatusProcessingId(
                        supplier.id,
                    ),
                onFinish: () =>
                    setStatusProcessingId(null),
            },
        );
    }

    function requestDelete(
        supplier: Supplier,
    ): void {
        setDeleteTarget(supplier);
    }

    function deleteSupplier(): void {
        if (
            !deleteTarget ||
            deleteProcessing
        ) {
            return;
        }

        router.delete(
            `/suppliers/${deleteTarget.id}`,
            {
                preserveScroll: true,
                onStart: () =>
                    setDeleteProcessing(true),
                onSuccess: () =>
                    setDeleteTarget(null),
                onFinish: () =>
                    setDeleteProcessing(false),
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Derived values
    |--------------------------------------------------------------------------
    */

    const operationalPercentage =
        summary.total > 0
            ? Math.round(
                  (summary.active /
                      summary.total) *
                      100,
              )
            : 0;

    const inactivePercentage =
        summary.total > 0
            ? Math.max(
                  0,
                  100 - operationalPercentage,
              )
            : 0;

    const hasActiveFilters = Boolean(
        search ||
            status ||
            sort !== 'latest',
    );

    const networkStatusLabel =
        summary.total === 0
            ? 'No supplier partners'
            : summary.inactive === 0
              ? 'Partner network ready'
              : `${summary.inactive} supplier${
                    summary.inactive === 1
                        ? ''
                        : 's'
                } inactive`;

    const networkStatusClass =
        summary.total === 0
            ? 'border-slate-500/20 bg-slate-500/10 text-slate-300'
            : summary.inactive === 0
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-300';

    /*
    |--------------------------------------------------------------------------
    | Table columns
    |--------------------------------------------------------------------------
    */

    const supplierColumns: DataTableColumn<Supplier>[] = [
        {
            key: 'supplier',
            header: 'Supplier',
            className: 'min-w-[250px]',
            cell: (supplier) => (
                <EntityInfo
                    avatar={
                        <EntityAvatar
                            icon={Truck}
                            className="border-amber-500/15 bg-amber-500/10 text-amber-400 group-hover:border-amber-500/25 group-hover:bg-amber-500/15"
                        />
                    }
                    title={supplier.name}
                    badges={
                        <Badge
                            variant="outline"
                            className="h-5 gap-1 rounded-full border-amber-500/15 bg-amber-500/[0.06] px-2 font-mono text-[9px] font-semibold text-amber-300"
                        >
                            <Hash className="size-2.5" />
                            {supplier.code}
                        </Badge>
                    }
                    subtitle={
                        supplier.tax_number ? (
                            <>
                                Tax / TIN:{' '}
                                <span className="font-mono font-medium text-foreground/75">
                                    {supplier.tax_number}
                                </span>
                            </>
                        ) : (
                            'No tax number provided'
                        )
                    }
                    description={
                        supplier.notes ?? undefined
                    }
                />
            ),
        },
        {
            key: 'contact-person',
            header: 'Primary Contact',
            className: 'min-w-[190px]',
            cell: (supplier) => (
                <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/10 text-blue-400">
                            <UserRound className="size-3.5" />
                        </span>

                        <div className="min-w-0">
                            <p
                                className={cn(
                                    'max-w-[150px] truncate text-[12px] font-semibold',
                                    !supplier.contact_person &&
                                        'text-muted-foreground',
                                )}
                            >
                                {supplier.contact_person ??
                                    'Not provided'}
                            </p>

                            <p className="mt-1 max-w-[160px] truncate text-[9px] text-muted-foreground">
                                {supplier.created_by
                                    ? `Added by ${supplier.created_by.name}`
                                    : 'Creator not recorded'}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'communication',
            header: 'Communication',
            className: 'min-w-[220px]',
            cell: (supplier) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                            <Phone className="size-3" />
                        </span>

                        <span
                            className={cn(
                                'max-w-[165px] truncate',
                                supplier.phone
                                    ? 'text-foreground/80'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {supplier.phone ?? 'No phone'}
                        </span>
                    </div>

                    {supplier.alternate_phone && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-500/10 text-slate-400">
                                <Phone className="size-3" />
                            </span>

                            <span className="max-w-[165px] truncate">
                                {supplier.alternate_phone}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
                            <Mail className="size-3" />
                        </span>

                        <span
                            className={cn(
                                'max-w-[165px] truncate',
                                supplier.email
                                    ? 'text-foreground/80'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {supplier.email ?? 'No email'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'location',
            header: 'Business Location',
            className: 'min-w-[230px]',
            cell: (supplier) => (
                <div className="flex max-w-[260px] items-start gap-2.5">
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-red-500/15 bg-red-500/10 text-red-400">
                        <MapPin className="size-3.5" />
                    </span>

                    <div className="min-w-0">
                        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Supplier address
                        </p>

                        <p
                            className={cn(
                                'mt-1 line-clamp-3 text-[11px] leading-5',
                                supplier.address
                                    ? 'text-foreground/80'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {supplier.address ??
                                'No address provided'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'terms',
            header: 'Commercial Terms',
            className: 'min-w-[190px]',
            cell: (supplier) => (
                <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10 text-violet-400">
                            <ReceiptText className="size-3.5" />
                        </span>

                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                                Payment terms
                            </p>

                            <p
                                className={cn(
                                    'mt-1 max-w-[145px] truncate text-[11px] font-medium',
                                    !supplier.payment_terms &&
                                        'text-muted-foreground',
                                )}
                            >
                                {supplier.payment_terms ??
                                    'Not configured'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                            <CircleDollarSign className="size-3.5" />
                        </span>

                        <div>
                            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                                Credit limit
                            </p>

                            <p className="mt-1 text-[12px] font-semibold tabular-nums text-emerald-400">
                                {formatCurrency(
                                    supplier.credit_limit,
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            className: 'min-w-[110px]',
            cell: (supplier) => (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={
                        statusProcessingId ===
                        supplier.id
                    }
                    onClick={() =>
                        toggleStatus(supplier)
                    }
                    className="h-auto rounded-full p-0 disabled:opacity-60"
                >
                    <StatusBadge
                        label={
                            supplier.is_active
                                ? 'Active'
                                : 'Inactive'
                        }
                        variant={
                            supplier.is_active
                                ? 'success'
                                : 'danger'
                        }
                    />
                </Button>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (supplier) => (
                <ActionGroup>
                    <IconButton
                        label="Edit supplier"
                        onClick={() =>
                            openEditDialog(supplier)
                        }
                        className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-400"
                    >
                        <Pencil className="size-3.5" />
                    </IconButton>

                    <IconButton
                        label="Delete supplier"
                        onClick={() =>
                            requestDelete(supplier)
                        }
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <Trash2 className="size-3.5" />
                    </IconButton>
                </ActionGroup>
            ),
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier Management" />

            <PageContainer className="gap-4 md:gap-5">
                {/* Supply partner overview */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.07] via-card/70 to-card/40">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                                <Truck className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-foreground">
                                    Supply Partner Network
                                </p>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Supplier availability, commercial readiness, and procurement access.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className={cn(
                                'h-6 w-fit shrink-0 rounded-full px-2.5 text-[9px] font-semibold',
                                networkStatusClass,
                            )}
                        >
                            {summary.total === 0 ? (
                                <Truck className="mr-1 size-3" />
                            ) : summary.inactive === 0 ? (
                                <ShieldCheck className="mr-1 size-3" />
                            ) : (
                                <XCircle className="mr-1 size-3" />
                            )}

                            {networkStatusLabel}
                        </Badge>
                    </div>

                    <div className="grid min-w-0 lg:grid-cols-[minmax(300px,1.05fr)_minmax(0,1.95fr)]">
                        <div className="relative overflow-hidden border-b border-border/60 p-4 lg:border-b-0 lg:border-r">
                            <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-amber-500/10 blur-3xl" />
                            <Truck className="pointer-events-none absolute -bottom-8 -right-5 size-28 text-amber-400 opacity-[0.025]" />

                            <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                                <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.04)]">
                                    <Truck className="size-7" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-300">
                                                Procurement coverage
                                            </p>

                                            <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.04em]">
                                                {summary.active}

                                                <span className="mx-1.5 text-base font-medium text-muted-foreground">
                                                    /
                                                </span>

                                                {summary.total}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-semibold tabular-nums text-amber-400">
                                                {operationalPercentage}%
                                            </p>

                                            <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                                                Available
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-background/60">
                                        <div
                                            className="h-full bg-emerald-400 transition-all duration-500"
                                            style={{
                                                width: `${operationalPercentage}%`,
                                            }}
                                        />

                                        <div
                                            className="h-full bg-red-400 transition-all duration-500"
                                            style={{
                                                width: `${inactivePercentage}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                                        Active suppliers can be selected for purchasing and receiving workflows.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 sm:grid-cols-3">
                            <SupplierNetworkMetric
                                title="Registered Partners"
                                value={summary.total}
                                description="Supplier records"
                                icon={Truck}
                                tone="amber"
                                className="border-b border-border/60 sm:border-b-0 sm:border-r"
                            />

                            <SupplierNetworkMetric
                                title="Active Suppliers"
                                value={summary.active}
                                description="Ready for purchasing"
                                icon={CheckCircle2}
                                tone="emerald"
                                className="border-b border-border/60 sm:border-b-0 sm:border-r"
                            />

                            <SupplierNetworkMetric
                                title="Inactive Suppliers"
                                value={summary.inactive}
                                description="Unavailable partners"
                                icon={XCircle}
                                tone="red"
                            />
                        </div>
                    </div>
                </section>

                {/* Supplier directory */}

                <SectionCard
                    title="Supplier Directory"
                    description="Browse supplier identity, communication details, business locations, payment terms, and operational status."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-amber-500/15 bg-amber-500/[0.06] px-2.5 text-[10px] font-medium text-amber-300"
                            >
                                <Truck className="mr-1 size-3" />
                                {suppliers.total} partner
                                {suppliers.total === 1
                                    ? ''
                                    : 's'}
                            </Badge>

                            <Button
                                type="button"
                                onClick={openCreateDialog}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Add Supplier
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_170px_180px]"
                        actions={
                            <>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="h-10 px-4 text-sm"
                                >
                                    Apply Filters
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilters}
                                    disabled={!hasActiveFilters}
                                    className="h-10 px-3 text-sm"
                                >
                                    <RefreshCw className="size-3.5" />
                                    Reset
                                </Button>
                            </>
                        }
                    >
                        <SearchInput
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            onClear={() => setSearch('')}
                            placeholder="Search supplier, code, contact, phone, email, or address..."
                            className="sm:col-span-2 xl:col-span-1"
                        />

                        <Select
                            value={status || ALL_VALUE}
                            onValueChange={(value) =>
                                setStatus(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All statuses
                                </SelectItem>
                                <SelectItem value="active">
                                    Active
                                </SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={sort}
                            onValueChange={setSort}
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="Sort suppliers" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="latest">
                                    Latest added
                                </SelectItem>
                                <SelectItem value="oldest">
                                    Oldest added
                                </SelectItem>
                                <SelectItem value="name_asc">
                                    Name A–Z
                                </SelectItem>
                                <SelectItem value="name_desc">
                                    Name Z–A
                                </SelectItem>
                                <SelectItem value="code_asc">
                                    Code A–Z
                                </SelectItem>
                                <SelectItem value="code_desc">
                                    Code Z–A
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <DataTable
                        data={suppliers.data}
                        columns={supplierColumns}
                        getRowKey={(supplier) =>
                            supplier.id
                        }
                        emptyIcon={Truck}
                        emptyTitle="No suppliers found"
                        emptyDescription="Adjust the current filters or register your first supplier partner."
                        emptyAction={
                            <Button
                                type="button"
                                onClick={openCreateDialog}
                            >
                                <Plus className="size-4" />
                                Add Supplier
                            </Button>
                        }
                        minWidth="1260px"
                    />

                    <AppPagination
                        pagination={suppliers}
                        itemLabel="suppliers"
                    />
                </SectionCard>
            </PageContainer>

            {/* Create and edit supplier */}

            <FormDialog
                open={isDialogOpen}
                onOpenChange={handleDialogOpenChange}
                title={
                    editingSupplier
                        ? 'Edit Supplier'
                        : 'Add Supplier'
                }
                description={
                    editingSupplier
                        ? `Update the procurement profile for ${editingSupplier.name}.`
                        : 'Register a supplier partner for purchasing and receiving operations.'
                }
                onSubmit={submitSupplier}
                processing={form.processing}
                submitText={
                    editingSupplier
                        ? 'Save Changes'
                        : 'Create Supplier'
                }
                processingText={
                    editingSupplier
                        ? 'Saving Changes...'
                        : 'Creating Supplier...'
                }
                maxWidth="max-w-4xl"
            >
                <FormSection
                    title="Supplier Identity"
                    description="Enter the business name, code, contact person, and tax information."
                    icon={<Truck />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="name"
                            label="Supplier Name"
                            error={form.errors.name}
                            required
                        >
                            <Input
                                id="name"
                                type="text"
                                value={form.data.name}
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                                placeholder="ABC Trading"
                                autoComplete="organization"
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            id="code"
                            label="Supplier Code"
                            description="Leave blank when the system should generate the code."
                            error={form.errors.code}
                        >
                            <Input
                                id="code"
                                type="text"
                                value={form.data.code}
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'code',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="SUP-001"
                                className="font-mono uppercase"
                                autoComplete="off"
                            />
                        </FormField>

                        <FormField
                            id="contact_person"
                            label="Contact Person"
                            error={
                                form.errors.contact_person
                            }
                        >
                            <IconInput
                                id="contact_person"
                                icon={UserRound}
                                type="text"
                                value={
                                    form.data.contact_person
                                }
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_person',
                                        event.target.value,
                                    )
                                }
                                placeholder="Juan Dela Cruz"
                                autoComplete="name"
                                iconClassName="group-focus-within:text-blue-400"
                            />
                        </FormField>

                        <FormField
                            id="tax_number"
                            label="Tax Number / TIN"
                            error={form.errors.tax_number}
                        >
                            <IconInput
                                id="tax_number"
                                icon={ReceiptText}
                                type="text"
                                value={form.data.tax_number}
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'tax_number',
                                        event.target.value,
                                    )
                                }
                                placeholder="000-000-000-000"
                                autoComplete="off"
                                iconClassName="group-focus-within:text-violet-400"
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormSection
                    title="Communication"
                    description="Store the primary contact channels and supplier business location."
                    icon={<Phone />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="phone"
                            label="Primary Phone"
                            error={form.errors.phone}
                        >
                            <IconInput
                                id="phone"
                                icon={Phone}
                                type="text"
                                inputMode="tel"
                                value={form.data.phone}
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'phone',
                                        event.target.value,
                                    )
                                }
                                placeholder="09XXXXXXXXX"
                                autoComplete="tel"
                                iconClassName="group-focus-within:text-emerald-400"
                            />
                        </FormField>

                        <FormField
                            id="alternate_phone"
                            label="Alternate Phone"
                            description="Optional secondary number."
                            error={
                                form.errors.alternate_phone
                            }
                        >
                            <IconInput
                                id="alternate_phone"
                                icon={Phone}
                                type="text"
                                inputMode="tel"
                                value={
                                    form.data.alternate_phone
                                }
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'alternate_phone',
                                        event.target.value,
                                    )
                                }
                                placeholder="Optional alternate number"
                                autoComplete="tel"
                            />
                        </FormField>

                        <FormField
                            id="email"
                            label="Email Address"
                            error={form.errors.email}
                        >
                            <IconInput
                                id="email"
                                icon={Mail}
                                type="email"
                                value={form.data.email}
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'email',
                                        event.target.value,
                                    )
                                }
                                placeholder="supplier@example.com"
                                autoComplete="email"
                                iconClassName="group-focus-within:text-blue-400"
                            />
                        </FormField>
                    </div>

                    <FormField
                        id="address"
                        label="Business Address"
                        error={form.errors.address}
                    >
                        <Textarea
                            id="address"
                            rows={3}
                            value={form.data.address}
                            disabled={form.processing}
                            onChange={(event) =>
                                form.setData(
                                    'address',
                                    event.target.value,
                                )
                            }
                            placeholder="Complete supplier business address"
                            className="resize-none"
                        />
                    </FormField>
                </FormSection>

                <FormSection
                    title="Commercial Terms"
                    description="Set the default purchasing terms, credit allowance, and internal notes."
                    icon={<Banknote />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="payment_terms"
                            label="Payment Terms"
                            error={form.errors.payment_terms}
                        >
                            <Input
                                id="payment_terms"
                                type="text"
                                list="payment-terms-options"
                                value={form.data.payment_terms}
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'payment_terms',
                                        event.target.value,
                                    )
                                }
                                placeholder="Example: Net 30"
                                autoComplete="off"
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
                            id="credit_limit"
                            label="Credit Limit"
                            error={form.errors.credit_limit}
                        >
                            <MoneyInput
                                id="credit_limit"
                                value={form.data.credit_limit}
                                disabled={form.processing}
                                onValueChange={(value) =>
                                    form.setData(
                                        'credit_limit',
                                        value,
                                    )
                                }
                                placeholder="0.00"
                            />
                        </FormField>
                    </div>

                    <FormField
                        id="notes"
                        label="Notes"
                        description="Optional delivery instructions, commercial notes, or internal remarks."
                        error={form.errors.notes}
                    >
                        <Textarea
                            id="notes"
                            rows={4}
                            value={form.data.notes}
                            disabled={form.processing}
                            onChange={(event) =>
                                form.setData(
                                    'notes',
                                    event.target.value,
                                )
                            }
                            placeholder="Additional supplier information or delivery instructions"
                            className="resize-none"
                        />
                    </FormField>
                </FormSection>

                <FormSection
                    title="Procurement Availability"
                    description="Control whether this supplier can be selected in purchasing workflows."
                    icon={<ShieldCheck />}
                >
                    <BooleanField
                        id="is_active"
                        checked={form.data.is_active}
                        disabled={form.processing}
                        onCheckedChange={(checked) =>
                            form.setData(
                                'is_active',
                                checked,
                            )
                        }
                        label="Active Supplier"
                        description="Active suppliers can be selected in purchase orders and receiving transactions."
                        error={form.errors.is_active}
                        className="border-emerald-500/15 bg-emerald-500/[0.035]"
                    />
                </FormSection>
            </FormDialog>

            {/* Delete supplier */}

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (
                        !open &&
                        !deleteProcessing
                    ) {
                        setDeleteTarget(null);
                    }
                }}
                title="Delete Supplier"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? 'this supplier'}"? The system may prevent deletion when the supplier is linked to purchasing records.`}
                confirmText="Delete Supplier"
                processing={deleteProcessing}
                destructive
                onConfirm={deleteSupplier}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Supplier network metric
|--------------------------------------------------------------------------
*/

function SupplierNetworkMetric({
    title,
    value,
    description,
    icon: Icon,
    tone,
    className,
}: {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: SupplierMetricTone;
    className?: string;
}) {
    const toneStyles = {
        amber: {
            icon: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            glow: 'bg-amber-500/10',
        },
        emerald: {
            icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            glow: 'bg-emerald-500/10',
        },
        red: {
            icon: 'border-red-500/20 bg-red-500/10 text-red-400',
            value: 'text-red-400',
            glow: 'bg-red-500/10',
        },
    } as const;

    const styles = toneStyles[tone];

    return (
        <div
            className={cn(
                'group relative min-w-0 overflow-hidden px-4 py-3.5 transition-colors hover:bg-muted/[0.025]',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute -right-10 -top-10 size-24 rounded-full blur-2xl',
                    styles.glow,
                )}
            />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                        {title}
                    </p>

                    <p
                        className={cn(
                            'mt-2 text-xl font-semibold leading-none tabular-nums',
                            styles.value,
                        )}
                    >
                        {value}
                    </p>

                    <p className="mt-1.5 truncate text-[9px] text-muted-foreground">
                        {description}
                    </p>
                </div>

                <span
                    className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border',
                        styles.icon,
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatCurrency(
    value: number | string | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(
        Number.isFinite(amount) ? amount : 0,
    );
}