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
import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Mail,
    MapPin,
    Network,
    Pencil,
    Phone,
    Plus,
    Star,
    Trash2,
    Warehouse,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useEffect,
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

type BranchMetricTone =
    | 'blue'
    | 'violet'
    | 'amber'
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

const ALL_VALUE = 'all';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function BranchIndex({
    branches,
    summary,
    filters,
}: BranchPageProps) {
    const [isDialogOpen, setIsDialogOpen] =
        useState(false);

    const [editingBranch, setEditingBranch] =
        useState<Branch | null>(null);

    const [
        statusConfirmTarget,
        setStatusConfirmTarget,
    ] = useState<Branch | null>(null);

    const [
        statusProcessingId,
        setStatusProcessingId,
    ] = useState<number | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Branch | null>(null);

    const [
        deleteProcessing,
        setDeleteProcessing,
    ] = useState(false);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const form = useForm<BranchFormData>({
        ...emptyBranchForm,
    });

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
    }, [
        filters.search,
        filters.status,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Branch form dialog
    |--------------------------------------------------------------------------
    */

    function resetBranchForm(): void {
        form.clearErrors();

        form.setData({
            ...emptyBranchForm,
        });
    }

    function resetAndCloseBranchDialog(): void {
        setIsDialogOpen(false);
        setEditingBranch(null);
        resetBranchForm();
    }

    function closeBranchDialog(): void {
        if (form.processing) {
            return;
        }

        resetAndCloseBranchDialog();
    }

    function handleDialogOpenChange(
        open: boolean,
    ): void {
        if (open) {
            setIsDialogOpen(true);

            return;
        }

        closeBranchDialog();
    }

    function openCreateDialog(): void {
        setEditingBranch(null);
        resetBranchForm();
        setIsDialogOpen(true);
    }

    function openEditDialog(
        branch: Branch,
    ): void {
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

        setIsDialogOpen(true);
    }

    function submitBranch(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingBranch) {
            form.put(
                `/branches/${editingBranch.id}`,
                {
                    preserveScroll: true,
                    onSuccess:
                        resetAndCloseBranchDialog,
                },
            );

            return;
        }

        form.post('/branches', {
            preserveScroll: true,
            onSuccess:
                resetAndCloseBranchDialog,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Search and filters
    |--------------------------------------------------------------------------
    */

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/branches',
            {
                search:
                    search.trim() || undefined,

                status:
                    status || undefined,
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
    | Status management
    |--------------------------------------------------------------------------
    */

    function requestStatusToggle(
        branch: Branch,
    ): void {
        if (
            branch.is_main &&
            branch.is_active
        ) {
            setStatusConfirmTarget(branch);

            return;
        }

        updateBranchStatus(branch);
    }

    function updateBranchStatus(
        branch: Branch,
    ): void {
        if (
            statusProcessingId === branch.id
        ) {
            return;
        }

        router.patch(
            `/branches/${branch.id}/status`,
            {
                is_active:
                    !branch.is_active,
            },
            {
                preserveScroll: true,

                onStart: () =>
                    setStatusProcessingId(
                        branch.id,
                    ),

                onSuccess: () =>
                    setStatusConfirmTarget(null),

                onFinish: () =>
                    setStatusProcessingId(null),
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete management
    |--------------------------------------------------------------------------
    */

    function requestDelete(
        branch: Branch,
    ): void {
        setDeleteTarget(branch);
    }

    function deleteBranch(): void {
        if (
            !deleteTarget ||
            deleteProcessing
        ) {
            return;
        }

        router.delete(
            `/branches/${deleteTarget.id}`,
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
    | Table columns
    |--------------------------------------------------------------------------
    */

    const branchColumns: DataTableColumn<Branch>[] =
        [
            {
                key: 'branch',
                header: 'Branch',
                className: 'min-w-[245px]',

                cell: (branch) => (
                    <EntityInfo
                        avatar={
                            <EntityAvatar
                                icon={Building2}
                                className="border-blue-500/15 bg-blue-500/10 text-blue-400 group-hover:border-blue-500/25 group-hover:bg-blue-500/15"
                            />
                        }
                        title={branch.name}
                        badges={
                            branch.is_main ? (
                                <Badge
                                    variant="outline"
                                    className="h-5 gap-1 rounded-full border-amber-500/20 bg-amber-500/10 px-2 text-[9px] font-semibold text-amber-300"
                                >
                                    <Star className="size-2.5 fill-current" />
                                    MAIN
                                </Badge>
                            ) : undefined
                        }
                        subtitle={
                            <>
                                Code:{' '}

                                <span className="font-semibold text-foreground/75">
                                    {branch.code}
                                </span>
                            </>
                        }
                    />
                ),
            },
            {
                key: 'address',
                header: 'Location',
                className: 'min-w-[240px]',

                cell: (branch) => (
                    <div className="flex max-w-[270px] items-start gap-2.5">
                        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-red-500/15 bg-red-500/10 text-red-400">
                            <MapPin className="size-3.5" />
                        </span>

                        <div className="min-w-0">
                            <p className="text-[10px] font-medium text-muted-foreground">
                                Branch address
                            </p>

                            <p className="mt-0.5 text-[12px] leading-5 text-foreground/80">
                                {branch.address ??
                                    'No address provided'}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                key: 'contact',
                header: 'Contact Details',
                className: 'min-w-[220px]',

                cell: (branch) => (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                                <Phone className="size-3" />
                            </span>

                            <span
                                className={
                                    branch.phone
                                        ? 'text-foreground/80'
                                        : 'text-muted-foreground'
                                }
                            >
                                {branch.phone ??
                                    'No phone'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
                                <Mail className="size-3" />
                            </span>

                            <span
                                className={
                                    branch.email
                                        ? 'max-w-[170px] truncate text-foreground/80'
                                        : 'text-muted-foreground'
                                }
                            >
                                {branch.email ??
                                    'No email'}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'warehouses',
                header: 'Storage',
                className: 'min-w-[140px]',

                cell: (branch) => (
                    <div className="space-y-1.5">
                        <Badge
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full border-violet-500/15 bg-violet-500/10 px-2.5 text-[10px] font-medium text-violet-300"
                        >
                            <span className="inline-flex size-4 items-center justify-center rounded-full bg-violet-500/15">
                                <Warehouse className="size-2.5" />
                            </span>

                            {branch.warehouses_count}
                        </Badge>

                        <p className="text-[9px] text-muted-foreground">
                            warehouse
                            {branch.warehouses_count ===
                            1
                                ? ''
                                : 's'}{' '}
                            connected
                        </p>
                    </div>
                ),
            },
            {
                key: 'status',
                header: 'Operation',
                className: 'min-w-[125px]',

                cell: (branch) => (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={
                            statusProcessingId ===
                            branch.id
                        }
                        onClick={() =>
                            requestStatusToggle(
                                branch,
                            )
                        }
                        className="h-auto rounded-full p-0 disabled:opacity-60"
                    >
                        <StatusBadge
                            label={
                                branch.is_active
                                    ? 'Operational'
                                    : 'Inactive'
                            }
                            variant={
                                branch.is_active
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
                headerClassName:
                    'text-right',
                className: 'text-right',

                cell: (branch) => (
                    <ActionGroup>
                        <IconButton
                            label="Edit branch"
                            onClick={() =>
                                openEditDialog(
                                    branch,
                                )
                            }
                            className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                            <Pencil className="size-3.5" />
                        </IconButton>

                        <IconButton
                            label={
                                branch.warehouses_count >
                                0
                                    ? 'Branch has linked warehouses'
                                    : 'Delete branch'
                            }
                            onClick={() =>
                                requestDelete(branch)
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
    | Derived values
    |--------------------------------------------------------------------------
    */

    const deleteHasWarehouses =
        Boolean(
            deleteTarget &&
                deleteTarget.warehouses_count >
                    0,
        );

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
                  100 -
                      operationalPercentage,
              )
            : 0;

    const networkStatusLabel =
        summary.total === 0
            ? 'No locations'
            : summary.inactive === 0
              ? 'All operational'
              : `${summary.inactive} unavailable`;

    const networkStatusClass =
        summary.total === 0
            ? 'border-slate-500/20 bg-slate-500/10 text-slate-300'
            : summary.inactive === 0
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-300';

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Management" />

            <PageContainer className="gap-4 md:gap-5">
                {/*
                |--------------------------------------------------------------------------
                | Compact branch network overview
                |--------------------------------------------------------------------------
                */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-500/[0.08] via-card/70 to-card/40">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                <Network className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-foreground">
                                    Location Network Snapshot
                                </p>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Live branch availability and primary-location health.
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
                                <Building2 className="mr-1 size-3" />
                            ) : summary.inactive === 0 ? (
                                <CheckCircle2 className="mr-1 size-3" />
                            ) : (
                                <XCircle className="mr-1 size-3" />
                            )}

                            {networkStatusLabel}
                        </Badge>
                    </div>

                    <div className="grid min-w-0 lg:grid-cols-[minmax(300px,1.05fr)_minmax(0,1.95fr)]">
                        <div className="relative overflow-hidden border-b border-border/60 p-4 lg:border-b-0 lg:border-r">
                            <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-blue-500/10 blur-3xl" />
                            <Network className="pointer-events-none absolute -bottom-7 -right-5 size-28 text-blue-400 opacity-[0.025]" />

                            <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                                <div className="flex size-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.04)]">
                                    <Network className="size-7" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-blue-300">
                                                Operational coverage
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
                                            <p className="text-lg font-semibold tabular-nums text-blue-400">
                                                {operationalPercentage}%
                                            </p>

                                            <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                                                Available
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/60">
                                        <div
                                            className="h-full rounded-full bg-blue-400 transition-all duration-500"
                                            style={{
                                                width: `${operationalPercentage}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                                        Active branches ready for warehouse and inventory operations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 sm:grid-cols-3">
                            <BranchNetworkMetric
                                title="Total Locations"
                                value={summary.total}
                                description="Registered branches"
                                icon={Building2}
                                tone="violet"
                                className="border-b border-border/60 sm:border-b-0 sm:border-r"
                                footer={
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3 text-[9px] font-medium">
                                            <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                                <span className="size-1.5 rounded-full bg-emerald-400" />

                                                {
                                                    summary.active
                                                }{' '}
                                                active
                                            </span>

                                            <span className="inline-flex items-center gap-1.5 text-red-400">
                                                <span className="size-1.5 rounded-full bg-red-400" />

                                                {
                                                    summary.inactive
                                                }{' '}
                                                inactive
                                            </span>
                                        </div>

                                        <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
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
                                    </div>
                                }
                            />

                            <BranchNetworkMetric
                                title="Main Branch"
                                value={summary.main}
                                description="Primary location"
                                icon={Star}
                                tone="amber"
                                className="border-b border-border/60 sm:border-b-0 sm:border-r"
                                footer={
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={cn(
                                                'flex size-7 shrink-0 items-center justify-center rounded-lg',
                                                summary.main >
                                                    0
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : 'bg-red-500/10 text-red-400',
                                            )}
                                        >
                                            {summary.main >
                                            0 ? (
                                                <Star className="size-3.5 fill-current" />
                                            ) : (
                                                <XCircle className="size-3.5" />
                                            )}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-[10px] font-semibold text-foreground/85">
                                                {summary.main >
                                                0
                                                    ? 'Primary branch assigned'
                                                    : 'No main branch'}
                                            </p>

                                            <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                                                {summary.main >
                                                0
                                                    ? 'Ready for default operations'
                                                    : 'Assign one active location'}
                                            </p>
                                        </div>
                                    </div>
                                }
                            />

                            <BranchNetworkMetric
                                title="Inactive"
                                value={
                                    summary.inactive
                                }
                                description="Unavailable locations"
                                icon={XCircle}
                                tone="red"
                                footer={
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={cn(
                                                'flex size-7 shrink-0 items-center justify-center rounded-lg',
                                                summary.inactive ===
                                                    0
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-red-500/10 text-red-400',
                                            )}
                                        >
                                            {summary.inactive ===
                                            0 ? (
                                                <CheckCircle2 className="size-3.5" />
                                            ) : (
                                                <XCircle className="size-3.5" />
                                            )}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-[10px] font-semibold text-foreground/85">
                                                {summary.inactive ===
                                                0
                                                    ? 'Network is healthy'
                                                    : 'Attention required'}
                                            </p>

                                            <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                                                {summary.inactive ===
                                                0
                                                    ? 'No unavailable branches'
                                                    : `${summary.inactive} location${
                                                          summary.inactive ===
                                                          1
                                                              ? ''
                                                              : 's'
                                                      } need review`}
                                            </p>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </section>

                {/*
                |--------------------------------------------------------------------------
                | Business locations directory
                |--------------------------------------------------------------------------
                */}

                <SectionCard
                    title="Business Locations"
                    description="Browse branch locations, contact details, operational status, and connected warehouses."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-2.5 text-[10px] font-medium text-blue-300"
                            >
                                <Building2 className="mr-1 size-3" />
                                {branches.total} location{branches.total === 1 ? '' : 's'}
                            </Badge>

                            <Button
                                type="button"
                                onClick={openCreateDialog}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Add Branch
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-[minmax(220px,1fr)_180px]"
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
                                    onClick={
                                        resetFilters
                                    }
                                    className="h-10 px-4 text-sm"
                                >
                                    Reset
                                </Button>
                            </>
                        }
                    >
                        <SearchInput
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value,
                                )
                            }
                            onClear={() =>
                                setSearch('')
                            }
                            placeholder="Search branch name, code, or address..."
                        />

                        <Select
                            value={
                                status ||
                                ALL_VALUE
                            }
                            onValueChange={(
                                value,
                            ) =>
                                setStatus(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        ALL_VALUE
                                    }
                                >
                                    All statuses
                                </SelectItem>

                                <SelectItem value="active">
                                    Operational
                                </SelectItem>

                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <DataTable
                        data={branches.data}
                        columns={branchColumns}
                        getRowKey={(branch) =>
                            branch.id
                        }
                        emptyIcon={Building2}
                        emptyTitle="No branches found"
                        emptyDescription="Create your first business location before adding warehouse records."
                        emptyAction={
                            <Button
                                type="button"
                                onClick={
                                    openCreateDialog
                                }
                            >
                                <Plus className="size-4" />
                                Add Branch
                            </Button>
                        }
                        minWidth="1050px"
                    />

                    <AppPagination
                        pagination={branches}
                        itemLabel="branches"
                    />
                </SectionCard>
            </PageContainer>

            {/*
            |--------------------------------------------------------------------------
            | Create and edit form
            |--------------------------------------------------------------------------
            */}

            <FormDialog
                open={isDialogOpen}
                onOpenChange={
                    handleDialogOpenChange
                }
                title={
                    editingBranch
                        ? 'Edit Branch'
                        : 'Add Branch'
                }
                description={
                    editingBranch
                        ? `Update the business information for ${editingBranch.name}.`
                        : 'Register a new business location in the branch network.'
                }
                onSubmit={submitBranch}
                processing={form.processing}
                submitText={
                    editingBranch
                        ? 'Save Changes'
                        : 'Create Branch'
                }
                processingText={
                    editingBranch
                        ? 'Saving Changes...'
                        : 'Creating Branch...'
                }
                maxWidth="max-w-2xl"
            >
                <FormSection
                    title="Location Identity"
                    description="Enter the identifying information for this branch."
                    icon={<Building2 />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="name"
                            label="Branch Name"
                            error={
                                form.errors.name
                            }
                            required
                        >
                            <Input
                                id="name"
                                type="text"
                                value={
                                    form.data.name
                                }
                                disabled={
                                    form.processing
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'name',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Main Branch"
                                autoComplete="off"
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            id="code"
                            label="Branch Code"
                            description="Use a short and unique location code."
                            error={
                                form.errors.code
                            }
                            required
                        >
                            <Input
                                id="code"
                                type="text"
                                value={
                                    form.data.code
                                }
                                disabled={
                                    form.processing
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'code',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="MAIN"
                                className="font-mono uppercase"
                                autoComplete="off"
                            />
                        </FormField>
                    </div>

                    <FormField
                        id="address"
                        label="Branch Address"
                        description="Enter the complete physical location."
                        error={
                            form.errors.address
                        }
                    >
                        <Textarea
                            id="address"
                            rows={3}
                            value={
                                form.data.address
                            }
                            disabled={
                                form.processing
                            }
                            onChange={(event) =>
                                form.setData(
                                    'address',
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Complete branch address"
                            className="resize-none"
                        />
                    </FormField>
                </FormSection>

                <FormSection
                    title="Communication"
                    description="Optional contact details for branch-related communication."
                    icon={<Phone />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="phone"
                            label="Phone Number"
                            error={
                                form.errors.phone
                            }
                        >
                            <IconInput
                                id="phone"
                                icon={Phone}
                                type="text"
                                inputMode="tel"
                                value={
                                    form.data.phone
                                }
                                disabled={
                                    form.processing
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'phone',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="09XXXXXXXXX"
                                autoComplete="tel"
                                iconClassName="group-focus-within:text-emerald-400"
                            />
                        </FormField>

                        <FormField
                            id="email"
                            label="Email Address"
                            error={
                                form.errors.email
                            }
                        >
                            <IconInput
                                id="email"
                                icon={Mail}
                                type="email"
                                value={
                                    form.data.email
                                }
                                disabled={
                                    form.processing
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'email',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="branch@example.com"
                                autoComplete="email"
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormSection
                    title="Operational Settings"
                    description="Configure the role and availability of this branch."
                    icon={<Star />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <BooleanField
                            id="is_main"
                            checked={
                                form.data.is_main
                            }
                            disabled={
                                form.processing
                            }
                            onCheckedChange={(
                                checked,
                            ) =>
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
                                })
                            }
                            label="Main Branch"
                            description="Mark this as the primary business location. A main branch must remain active."
                            error={
                                form.errors
                                    .is_main
                            }
                            className="h-full border-amber-500/15 bg-amber-500/[0.035]"
                        />

                        <BooleanField
                            id="is_active"
                            checked={
                                form.data.is_active
                            }
                            disabled={
                                form.processing ||
                                form.data.is_main
                            }
                            onCheckedChange={(
                                checked,
                            ) =>
                                form.setData(
                                    'is_active',
                                    checked,
                                )
                            }
                            label="Operational Branch"
                            description={
                                form.data.is_main
                                    ? 'The main branch cannot be set as inactive.'
                                    : 'Allow inventory and warehouse operations for this location.'
                            }
                            error={
                                form.errors
                                    .is_active
                            }
                            className="h-full border-emerald-500/15 bg-emerald-500/[0.035]"
                        />
                    </div>
                </FormSection>
            </FormDialog>

            {/*
            |--------------------------------------------------------------------------
            | Main branch status confirmation
            |--------------------------------------------------------------------------
            */}

            <ConfirmDialog
                open={
                    statusConfirmTarget !==
                    null
                }
                onOpenChange={(open) => {
                    if (
                        !open &&
                        statusProcessingId ===
                            null
                    ) {
                        setStatusConfirmTarget(
                            null,
                        );
                    }
                }}
                title="Deactivate Main Branch"
                description={`"${statusConfirmTarget?.name}" is currently the main branch. Another active branch may need to be assigned as the primary location before this branch can be deactivated.`}
                confirmText="Deactivate Branch"
                processing={
                    statusConfirmTarget
                        ? statusProcessingId ===
                          statusConfirmTarget.id
                        : false
                }
                destructive
                onConfirm={() => {
                    if (
                        statusConfirmTarget
                    ) {
                        updateBranchStatus(
                            statusConfirmTarget,
                        );
                    }
                }}
            />

            {/*
            |--------------------------------------------------------------------------
            | Delete confirmation
            |--------------------------------------------------------------------------
            */}

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
                title="Delete Branch"
                description={
                    deleteHasWarehouses
                        ? `"${deleteTarget?.name}" has ${deleteTarget?.warehouses_count} linked warehouse record(s). The system may prevent deletion until those warehouses are reassigned or removed.`
                        : deleteTarget?.is_main
                          ? `"${deleteTarget.name}" is currently marked as the main branch. Another branch may need to be assigned as main before deletion.`
                          : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
                }
                confirmText="Delete Branch"
                processing={
                    deleteProcessing
                }
                destructive
                onConfirm={deleteBranch}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Compact network metric
|--------------------------------------------------------------------------
*/

function BranchNetworkMetric({
    title,
    value,
    description,
    icon: Icon,
    tone,
    footer,
    className,
}: {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: BranchMetricTone;
    footer?: ReactNode;
    className?: string;
}) {
    const toneStyles: Record<
        BranchMetricTone,
        {
            icon: string;
            value: string;
            accent: string;
            glow: string;
            footer: string;
        }
    > = {
        blue: {
            icon:
                'border-blue-500/20 bg-blue-500/10 text-blue-400',

            value: 'text-blue-400',

            accent: 'bg-blue-400',

            glow: 'bg-blue-500/10',

            footer:
                'border-blue-500/10 bg-blue-500/[0.035]',
        },

        violet: {
            icon:
                'border-violet-500/20 bg-violet-500/10 text-violet-400',

            value: 'text-violet-400',

            accent: 'bg-violet-400',

            glow: 'bg-violet-500/10',

            footer:
                'border-violet-500/10 bg-violet-500/[0.035]',
        },

        amber: {
            icon:
                'border-amber-500/20 bg-amber-500/10 text-amber-400',

            value: 'text-amber-400',

            accent: 'bg-amber-400',

            glow: 'bg-amber-500/10',

            footer:
                'border-amber-500/10 bg-amber-500/[0.035]',
        },

        red: {
            icon:
                'border-red-500/20 bg-red-500/10 text-red-400',

            value: 'text-red-400',

            accent: 'bg-red-400',

            glow: 'bg-red-500/10',

            footer:
                'border-red-500/10 bg-red-500/[0.035]',
        },
    };

    const styles = toneStyles[tone];

    return (
        <div
            className={cn(
                'group relative flex min-w-0 flex-col overflow-hidden p-4',
                'transition-colors hover:bg-muted/[0.025]',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute -bottom-12 -right-12 size-32 rounded-full blur-3xl',
                    styles.glow,
                )}
            />

            <Icon className="pointer-events-none absolute -bottom-3 -right-2 size-16 opacity-[0.025]" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {title}
                    </p>

                    <p
                        className={cn(
                            'mt-2 text-2xl font-semibold leading-none tabular-nums',
                            styles.value,
                        )}
                    >
                        {value}
                    </p>
                </div>

                <div
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg border',
                        styles.icon,
                    )}
                >
                    <Icon className="size-4" />
                </div>
            </div>

            <p className="relative mt-2 text-[10px] leading-4 text-muted-foreground">
                {description}
            </p>

            <div className="relative mt-3 h-px overflow-hidden bg-border/60">
                <div
                    className={cn(
                        'h-full w-7 rounded-full',
                        styles.accent,
                    )}
                />
            </div>

            {footer && (
                <div
                    className={cn(
                        'relative mt-3 min-h-[48px] rounded-lg border px-3 py-2.5',
                        styles.footer,
                    )}
                >
                    {footer}
                </div>
            )}
        </div>
    );
}