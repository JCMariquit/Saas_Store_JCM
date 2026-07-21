import { AppPagination } from '@/components/shared/app-pagination';
import { FilterBar } from '@/components/shared/filter-bar';
import { IconInput } from '@/components/shared/icon-input';
import { PageContainer } from '@/components/shared/page-container';
import { SearchInput } from '@/components/shared/search-input';
import { SectionCard } from '@/components/shared/section-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    AlertTriangle,
    ArrowLeft,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    FileText,
    History,
    PackageMinus,
    ReceiptText,
    RotateCcw,
    Search,
    ShieldAlert,
    Trash2,
    UserRound,
    Warehouse,
    X,
} from 'lucide-react';
import {
    Fragment,
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type UserReference = {
    id: number;
    name: string;
    email: string | null;
};

type WarehouseOption = {
    id: number;
    branch_id: number;
    code: string | null;
    name: string;
    is_active: boolean;
};

type SelectOption = {
    value: string;
    label: string;
};

type IssuanceItem = {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string | null;
    unit: string;
    quantity_issued: number;
    unit_cost: number;
    line_total: number;
    notes: string | null;
    stock_movement_id: number | null;
    void_stock_movement_id: number | null;
};

type StockIssuance = {
    id: number;
    issuance_number: string;
    issuance_date: string;

    reason: string;
    reason_label: string;

    issued_to: string | null;
    department: string | null;
    purpose: string | null;
    reference_no: string | null;

    status: 'posted' | 'voided';

    total_quantity: number;
    total_cost: number;
    notes: string | null;
    items_count: number;

    branch: {
        id: number;
        code: string | null;
        name: string;
    };

    warehouse: {
        id: number;
        code: string | null;
        name: string;
    };

    issued_by: UserReference | null;
    posted_at: string | null;

    voided_by: UserReference | null;
    voided_at: string | null;
    void_reason: string | null;

    created_at: string | null;
    updated_at: string | null;

    items: IssuanceItem[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedIssuances = {
    current_page: number;
    data: StockIssuance[];
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

type IssuanceSummary = {
    total: number;
    posted: number;
    voided: number;
    quantity_issued: number;
    issued_today: number;
};

type IssuanceFilters = {
    search: string;
    status: string;
    reason: string;
    warehouse_id: string;
    date_from: string;
    date_to: string;
};

type IssuancePermissions = {
    can_void: boolean;
};

type PageProps = {
    issuances: PaginatedIssuances;
    summary: IssuanceSummary;
    warehouses: WarehouseOption[];
    reasons: SelectOption[];
    statuses: SelectOption[];
    filters: IssuanceFilters;
    permissions: IssuancePermissions;
};

type VoidFormData = {
    reason: string;
};

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const HISTORY_URL =
    '/stock-issuance/history';

const TERMINAL_URL =
    '/stock-issuance/terminal';

const ALL_VALUE = 'all';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Stock Issuance',
        href: TERMINAL_URL,
    },
    {
        title: 'Issuance History',
        href: HISTORY_URL,
    },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatNumber(
    value: number,
    maximumFractionDigits = 3,
): string {
    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(Number(value || 0));
}

function formatMoney(
    value: number,
): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(
    value: string | null,
): string {
    if (!value) {
        return '—';
    }

    const normalizedValue =
        value.length === 10
            ? `${value}T00:00:00`
            : value;

    const date = new Date(
        normalizedValue,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        'en-PH',
        {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        },
    ).format(date);
}

function formatDateTime(
    value: string | null,
): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        'en-PH',
        {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    ).format(date);
}

function getRecipientLabel(
    issuance: StockIssuance,
): string {
    if (issuance.issued_to) {
        return issuance.issued_to;
    }

    if (issuance.department) {
        return issuance.department;
    }

    return 'Internal stock release';
}

function getReasonTone(
    reason: string,
): string {
    const tones: Record<string, string> = {
        used_consumed:
            'border-blue-500/20 bg-blue-500/[0.08] text-blue-300',

        employee_issuance:
            'border-violet-500/20 bg-violet-500/[0.08] text-violet-300',

        department_issuance:
            'border-violet-500/20 bg-violet-500/[0.08] text-violet-300',

        damaged:
            'border-rose-500/20 bg-rose-500/[0.08] text-rose-300',

        expired:
            'border-amber-500/20 bg-amber-500/[0.08] text-amber-300',

        lost_missing:
            'border-rose-500/20 bg-rose-500/[0.08] text-rose-300',

        giveaway_sample:
            'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300',

        other:
            'border-border/70 bg-muted/30 text-muted-foreground',
    };

    return (
        tones[reason] ??
        tones.other
    );
}

/*
|--------------------------------------------------------------------------
| Main page
|--------------------------------------------------------------------------
*/

export default function StockIssuanceHistory({
    issuances,
    summary,
    warehouses,
    reasons,
    statuses,
    filters,
    permissions,
}: PageProps) {
    const [search, setSearch] =
        useState(filters.search ?? '');

    const [status, setStatus] =
        useState(filters.status ?? '');

    const [reason, setReason] =
        useState(filters.reason ?? '');

    const [
        warehouseId,
        setWarehouseId,
    ] = useState(
        filters.warehouse_id ?? '',
    );

    const [dateFrom, setDateFrom] =
        useState(filters.date_from ?? '');

    const [dateTo, setDateTo] =
        useState(filters.date_to ?? '');

    const [
        expandedIssuanceId,
        setExpandedIssuanceId,
    ] = useState<number | null>(null);

    const [
        voidTarget,
        setVoidTarget,
    ] =
        useState<StockIssuance | null>(
            null,
        );

    const voidForm =
        useForm<VoidFormData>({
            reason: '',
        });

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
        setReason(filters.reason ?? '');

        setWarehouseId(
            filters.warehouse_id ?? '',
        );

        setDateFrom(
            filters.date_from ?? '',
        );

        setDateTo(
            filters.date_to ?? '',
        );
    }, [
        filters.search,
        filters.status,
        filters.reason,
        filters.warehouse_id,
        filters.date_from,
        filters.date_to,
    ]);

    const hasActiveFilters =
        Boolean(
            search.trim() ||
                status ||
                reason ||
                warehouseId ||
                dateFrom ||
                dateTo,
        );

    const postedPercentage =
        summary.total > 0
            ? Math.round(
                  (summary.posted /
                      summary.total) *
                      100,
              )
            : 0;

    const voidedPercentage =
        summary.total > 0
            ? Math.round(
                  (summary.voided /
                      summary.total) *
                      100,
              )
            : 0;

    const pageQuantity =
        useMemo(
            () =>
                issuances.data.reduce(
                    (
                        total,
                        issuance,
                    ) =>
                        total +
                        Number(
                            issuance.total_quantity ||
                                0,
                        ),
                    0,
                ),
            [issuances.data],
        );

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            HISTORY_URL,
            {
                search:
                    search.trim() ||
                    undefined,

                status:
                    status || undefined,

                reason:
                    reason || undefined,

                warehouse_id:
                    warehouseId ||
                    undefined,

                date_from:
                    dateFrom ||
                    undefined,

                date_to:
                    dateTo || undefined,
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
        setReason('');
        setWarehouseId('');
        setDateFrom('');
        setDateTo('');
        setExpandedIssuanceId(null);

        router.get(
            HISTORY_URL,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function toggleIssuance(
        issuanceId: number,
    ): void {
        setExpandedIssuanceId(
            (currentId) =>
                currentId === issuanceId
                    ? null
                    : issuanceId,
        );
    }

    function openVoidDialog(
        issuance: StockIssuance,
    ): void {
        voidForm.reset();
        voidForm.clearErrors();

        setVoidTarget(issuance);
    }

    function closeVoidDialog(): void {
        if (voidForm.processing) {
            return;
        }

        setVoidTarget(null);
        voidForm.reset();
        voidForm.clearErrors();
    }

    function submitVoid(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (!voidTarget) {
            return;
        }

        voidForm.post(
            `${HISTORY_URL}/${voidTarget.id}/void`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setVoidTarget(null);
                    setExpandedIssuanceId(
                        null,
                    );

                    voidForm.reset();
                },
            },
        );
    }

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Issuance History" />

            <PageContainer className="gap-3.5 md:gap-4">
                {/* Archive summary */}

                <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/[0.08] text-violet-300">
                                <History className="size-4" />

                                <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-card bg-emerald-400" />
                            </span>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-sm font-semibold tracking-tight">
                                        Stock Issuance
                                        History
                                    </h1>

                                    <Badge
                                        variant="outline"
                                        className="h-5 rounded-full border-violet-500/15 bg-violet-500/[0.06] px-2 text-[8px] font-semibold tracking-[0.1em] text-violet-300"
                                    >
                                        AUDIT REGISTER
                                    </Badge>
                                </div>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Review posted and
                                    voided non-sales
                                    stock releases,
                                    item details,
                                    recipients, stock
                                    value, and movement
                                    references.
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.get(
                                    TERMINAL_URL,
                                )
                            }
                            className="h-8 rounded-lg border-rose-500/20 bg-rose-500/[0.06] px-3 text-[10px] text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                        >
                            <ArrowLeft className="size-3.5" />
                            Back to Terminal
                        </Button>
                    </div>

                    <div className="grid divide-y divide-border/60 md:grid-cols-[1fr_1fr_1fr_1.2fr] md:divide-x md:divide-y-0">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] text-blue-300">
                                <ReceiptText className="size-3.5" />
                            </span>

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Transactions
                                </p>

                                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                                    {formatNumber(
                                        summary.total,
                                        0,
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300">
                                <CheckCircle2 className="size-3.5" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Posted
                                    </p>

                                    <span className="text-[9px] font-semibold text-emerald-300">
                                        {
                                            postedPercentage
                                        }
                                        %
                                    </span>
                                </div>

                                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                                    {formatNumber(
                                        summary.posted,
                                        0,
                                    )}
                                </p>

                                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/50">
                                    <div
                                        className="h-full rounded-full bg-emerald-400"
                                        style={{
                                            width: `${postedPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/[0.08] text-rose-300">
                                <ShieldAlert className="size-3.5" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Voided
                                    </p>

                                    <span className="text-[9px] font-semibold text-rose-300">
                                        {
                                            voidedPercentage
                                        }
                                        %
                                    </span>
                                </div>

                                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                                    {formatNumber(
                                        summary.voided,
                                        0,
                                    )}
                                </p>

                                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/50">
                                    <div
                                        className="h-full rounded-full bg-rose-400"
                                        style={{
                                            width: `${voidedPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/[0.08] text-amber-300">
                                <PackageMinus className="size-3.5" />
                            </span>

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Active Issued
                                    Quantity
                                </p>

                                <p className="mt-0.5 text-sm font-semibold tabular-nums text-rose-300">
                                    −
                                    {formatNumber(
                                        summary.quantity_issued,
                                    )}
                                </p>

                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    {
                                        summary.issued_today
                                    }{' '}
                                    posted today
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main history register */}

                <SectionCard
                    title={
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/[0.07] text-violet-300">
                                <History className="size-3.5" />
                            </span>

                            <div>
                                <p className="text-xs font-semibold">
                                    Issuance
                                    Register
                                </p>

                                <p className="mt-0.5 text-[9px] font-normal text-muted-foreground">
                                    Expand a row to
                                    inspect products,
                                    movement links,
                                    recipient, notes,
                                    and audit details.
                                </p>
                            </div>
                        </div>
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-border/70 bg-muted/25 px-2.5 text-[9px] text-muted-foreground"
                            >
                                {
                                    issuances.total
                                }{' '}
                                transaction
                                {issuances.total === 1
                                    ? ''
                                    : 's'}
                            </Badge>

                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-rose-500/15 bg-rose-500/[0.06] px-2.5 text-[9px] text-rose-300"
                            >
                                −
                                {formatNumber(
                                    pageQuantity,
                                )}{' '}
                                on this page
                            </Badge>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(240px,1fr)_155px_190px_205px_155px_155px]"
                        actions={
                            <>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="h-10 px-4 text-sm"
                                >
                                    <Search className="size-3.5" />
                                    Apply
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={
                                        resetFilters
                                    }
                                    disabled={
                                        !hasActiveFilters
                                    }
                                    className="h-10 px-3 text-sm"
                                >
                                    <RotateCcw className="size-3.5" />
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
                            placeholder="Search issuance, recipient, reference, branch..."
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

                                {statuses.map(
                                    (
                                        statusOption,
                                    ) => (
                                        <SelectItem
                                            key={
                                                statusOption.value
                                            }
                                            value={
                                                statusOption.value
                                            }
                                        >
                                            {
                                                statusOption.label
                                            }
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                reason ||
                                ALL_VALUE
                            }
                            onValueChange={(
                                value,
                            ) =>
                                setReason(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All reasons" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        ALL_VALUE
                                    }
                                >
                                    All reasons
                                </SelectItem>

                                {reasons.map(
                                    (
                                        reasonOption,
                                    ) => (
                                        <SelectItem
                                            key={
                                                reasonOption.value
                                            }
                                            value={
                                                reasonOption.value
                                            }
                                        >
                                            {
                                                reasonOption.label
                                            }
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                warehouseId ||
                                ALL_VALUE
                            }
                            onValueChange={(
                                value,
                            ) =>
                                setWarehouseId(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All warehouses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        ALL_VALUE
                                    }
                                >
                                    All warehouses
                                </SelectItem>

                                {warehouses.map(
                                    (
                                        warehouse,
                                    ) => (
                                        <SelectItem
                                            key={
                                                warehouse.id
                                            }
                                            value={String(
                                                warehouse.id,
                                            )}
                                        >
                                            {warehouse.code
                                                ? `${warehouse.code} — ${warehouse.name}`
                                                : warehouse.name}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <IconInput
                            id="issuance_date_from"
                            icon={
                                CalendarDays
                            }
                            type="date"
                            value={dateFrom}
                            title="Issuance date from"
                            aria-label="Issuance date from"
                            onChange={(
                                event,
                            ) =>
                                setDateFrom(
                                    event.target
                                        .value,
                                )
                            }
                            className="h-10"
                            iconClassName="text-blue-400"
                        />

                        <IconInput
                            id="issuance_date_to"
                            icon={
                                CalendarDays
                            }
                            type="date"
                            value={dateTo}
                            min={
                                dateFrom ||
                                undefined
                            }
                            title="Issuance date to"
                            aria-label="Issuance date to"
                            onChange={(
                                event,
                            ) =>
                                setDateTo(
                                    event.target
                                        .value,
                                )
                            }
                            className="h-10"
                            iconClassName="text-violet-400"
                        />
                    </FilterBar>

                    {/* Register table */}

                    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1180px] border-collapse">
                                <thead className="border-b border-border/70 bg-muted/20">
                                    <tr>
                                        <th className="w-11 px-3 py-2.5">
                                            <span className="sr-only">
                                                Details
                                            </span>
                                        </th>

                                        <th className="min-w-[190px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Issuance
                                        </th>

                                        <th className="min-w-[185px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Recipient
                                        </th>

                                        <th className="min-w-[190px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Warehouse
                                        </th>

                                        <th className="min-w-[170px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Reason
                                        </th>

                                        <th className="min-w-[145px] px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Stock Out
                                        </th>

                                        <th className="min-w-[130px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Status
                                        </th>

                                        <th className="w-[105px] px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border/60">
                                    {issuances.data
                                        .length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    8
                                                }
                                                className="px-4 py-14"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                    <span className="flex size-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/[0.08] text-violet-300">
                                                        <History className="size-5" />
                                                    </span>

                                                    <h3 className="mt-3 text-sm font-semibold">
                                                        {hasActiveFilters
                                                            ? 'No matching issuances'
                                                            : 'No stock issuances yet'}
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        {hasActiveFilters
                                                            ? 'Adjust or reset the filters to review other issuance transactions.'
                                                            : 'Posted transactions from the Issuance Terminal will appear here.'}
                                                    </p>

                                                    {hasActiveFilters && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={
                                                                resetFilters
                                                            }
                                                            className="mt-4 h-8 rounded-lg text-[10px]"
                                                        >
                                                            <RotateCcw className="size-3.5" />
                                                            Clear
                                                            Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        issuances.data.map(
                                            (
                                                issuance,
                                            ) => {
                                                const isExpanded =
                                                    expandedIssuanceId ===
                                                    issuance.id;

                                                const detailsId = `issuance-details-${issuance.id}`;

                                                return (
                                                    <Fragment
                                                        key={
                                                            issuance.id
                                                        }
                                                    >
                                                        <tr
                                                            tabIndex={
                                                                0
                                                            }
                                                            aria-expanded={
                                                                isExpanded
                                                            }
                                                            aria-controls={
                                                                detailsId
                                                            }
                                                            onClick={() =>
                                                                toggleIssuance(
                                                                    issuance.id,
                                                                )
                                                            }
                                                            onKeyDown={(
                                                                event,
                                                            ) => {
                                                                if (
                                                                    event.target !==
                                                                    event.currentTarget
                                                                ) {
                                                                    return;
                                                                }

                                                                if (
                                                                    event.key ===
                                                                        'Enter' ||
                                                                    event.key ===
                                                                        ' '
                                                                ) {
                                                                    event.preventDefault();

                                                                    toggleIssuance(
                                                                        issuance.id,
                                                                    );
                                                                }
                                                            }}
                                                            className="cursor-pointer bg-card transition hover:bg-muted/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                                        >
                                                            <td className="px-3 py-3">
                                                                <span className="flex size-7 items-center justify-center rounded-lg border border-border/70 bg-background/40 text-muted-foreground">
                                                                    <ChevronDown
                                                                        className={cn(
                                                                            'size-3.5 transition-transform',
                                                                            isExpanded &&
                                                                                'rotate-180',
                                                                        )}
                                                                    />
                                                                </span>
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/[0.07] text-rose-300">
                                                                        <PackageMinus className="size-3.5" />
                                                                    </span>

                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-[10px] font-semibold">
                                                                            {
                                                                                issuance.issuance_number
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                                            {formatDate(
                                                                                issuance.issuance_date,
                                                                            )}
                                                                        </p>

                                                                        {issuance.reference_no && (
                                                                            <p className="mt-0.5 max-w-40 truncate text-[8px] text-blue-300">
                                                                                Ref:{' '}
                                                                                {
                                                                                    issuance.reference_no
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <div className="flex items-start gap-2">
                                                                    <UserRound className="mt-0.5 size-3.5 shrink-0 text-violet-300" />

                                                                    <div className="min-w-0">
                                                                        <p className="max-w-[165px] truncate text-[10px] font-medium">
                                                                            {getRecipientLabel(
                                                                                issuance,
                                                                            )}
                                                                        </p>

                                                                        <p className="mt-0.5 max-w-[165px] truncate text-[9px] text-muted-foreground">
                                                                            {issuance.department ||
                                                                                'No department'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <div className="flex items-start gap-2">
                                                                    <Warehouse className="mt-0.5 size-3.5 shrink-0 text-amber-300" />

                                                                    <div className="min-w-0">
                                                                        <p className="max-w-[175px] truncate text-[10px] font-medium">
                                                                            {
                                                                                issuance
                                                                                    .warehouse
                                                                                    .name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 max-w-[175px] truncate text-[9px] text-muted-foreground">
                                                                            {issuance
                                                                                .warehouse
                                                                                .code ||
                                                                                'No code'}{' '}
                                                                            ·{' '}
                                                                            {
                                                                                issuance
                                                                                    .branch
                                                                                    .name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'h-6 max-w-[160px] rounded-full px-2 text-[8px] font-semibold',
                                                                        getReasonTone(
                                                                            issuance.reason,
                                                                        ),
                                                                    )}
                                                                >
                                                                    <span className="truncate">
                                                                        {
                                                                            issuance.reason_label
                                                                        }
                                                                    </span>
                                                                </Badge>
                                                            </td>

                                                            <td className="px-3 py-3 text-right">
                                                                <p className="text-[11px] font-semibold tabular-nums text-rose-300">
                                                                    −
                                                                    {formatNumber(
                                                                        issuance.total_quantity,
                                                                    )}
                                                                </p>

                                                                <p className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">
                                                                    {formatMoney(
                                                                        issuance.total_cost,
                                                                    )}
                                                                </p>

                                                                <p className="mt-0.5 text-[8px] text-muted-foreground">
                                                                    {
                                                                        issuance.items_count
                                                                    }{' '}
                                                                    item
                                                                    {issuance.items_count ===
                                                                    1
                                                                        ? ''
                                                                        : 's'}
                                                                </p>
                                                            </td>

                                                            <td className="px-3 py-3">
                                                                <StatusBadge
                                                                    label={
                                                                        issuance.status ===
                                                                        'posted'
                                                                            ? 'Posted'
                                                                            : 'Voided'
                                                                    }
                                                                    variant={
                                                                        issuance.status ===
                                                                        'posted'
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="px-3 py-3 text-right">
                                                                {permissions.can_void &&
                                                                issuance.status ===
                                                                    'posted' ? (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={(
                                                                            event,
                                                                        ) => {
                                                                            event.stopPropagation();

                                                                            openVoidDialog(
                                                                                issuance,
                                                                            );
                                                                        }}
                                                                        className="h-8 rounded-lg px-2 text-[9px] text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                                                                    >
                                                                        <Trash2 className="size-3" />
                                                                        Void
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={(
                                                                            event,
                                                                        ) => {
                                                                            event.stopPropagation();

                                                                            toggleIssuance(
                                                                                issuance.id,
                                                                            );
                                                                        }}
                                                                        className="h-8 rounded-lg px-2 text-[9px]"
                                                                    >
                                                                        Details
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>

                                                        {isExpanded && (
                                                            <tr
                                                                id={
                                                                    detailsId
                                                                }
                                                            >
                                                                <td
                                                                    colSpan={
                                                                        8
                                                                    }
                                                                    className="bg-muted/[0.08] p-0"
                                                                >
                                                                    <IssuanceDetails
                                                                        issuance={
                                                                            issuance
                                                                        }
                                                                        canVoid={
                                                                            permissions.can_void
                                                                        }
                                                                        onVoid={() =>
                                                                            openVoidDialog(
                                                                                issuance,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            },
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <AppPagination
                        pagination={
                            issuances
                        }
                        itemLabel="stock issuances"
                    />
                </SectionCard>
            </PageContainer>

            {/* Void dialog */}

            {voidTarget && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="void-issuance-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onMouseDown={(
                        event,
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeVoidDialog();
                        }
                    }}
                >
                    <form
                        onSubmit={
                            submitVoid
                        }
                        className="w-full max-w-lg overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-4 py-3.5">
                            <div className="flex items-start gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/[0.08] text-rose-300">
                                    <ShieldAlert className="size-4" />
                                </span>

                                <div>
                                    <h2
                                        id="void-issuance-title"
                                        className="text-sm font-semibold"
                                    >
                                        Void Stock
                                        Issuance
                                    </h2>

                                    <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                        This will
                                        reverse{' '}
                                        <strong className="text-foreground">
                                            {
                                                voidTarget.issuance_number
                                            }
                                        </strong>{' '}
                                        and restore its
                                        stock when the
                                        movement remains
                                        safely reversible.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeVoidDialog
                                }
                                disabled={
                                    voidForm.processing
                                }
                                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:opacity-50"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="space-y-4 p-4">
                            <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/[0.12] p-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Issuance
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium">
                                        {
                                            voidTarget.issuance_number
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Stock to Restore
                                    </p>

                                    <p className="mt-1 text-[10px] font-semibold text-emerald-300">
                                        +
                                        {formatNumber(
                                            voidTarget.total_quantity,
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Warehouse
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium">
                                        {
                                            voidTarget
                                                .warehouse
                                                .name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Stock Value
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium">
                                        {formatMoney(
                                            voidTarget.total_cost,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-300" />

                                    <p className="text-[9px] leading-4 text-amber-200/80">
                                        The backend
                                        rejects reversal
                                        when later stock
                                        activity already
                                        exists or the
                                        current stock no
                                        longer matches
                                        the original
                                        issuance state.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium">
                                    Void Reason
                                    <span className="ml-1 text-rose-400">
                                        *
                                    </span>
                                </label>

                                <Textarea
                                    value={
                                        voidForm.data
                                            .reason
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        voidForm.setData(
                                            'reason',
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="Explain why this posted issuance must be reversed..."
                                    rows={4}
                                    autoFocus
                                    className="resize-y rounded-lg text-xs"
                                />

                                {voidForm.errors
                                    .reason && (
                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400">
                                        <AlertTriangle className="size-3" />
                                        {
                                            voidForm
                                                .errors
                                                .reason
                                        }
                                    </p>
                                )}

                                {(
                                    voidForm.errors as Record<
                                        string,
                                        string
                                    >
                                ).issuance && (
                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400">
                                        <AlertTriangle className="size-3" />

                                        {
                                            (
                                                voidForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            )
                                                .issuance
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/[0.08] px-4 py-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={
                                    closeVoidDialog
                                }
                                disabled={
                                    voidForm.processing
                                }
                                className="h-9 rounded-lg text-xs"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    voidForm.processing ||
                                    voidForm.data.reason
                                        .trim()
                                        .length < 3
                                }
                                className="h-9 rounded-lg bg-rose-600 px-4 text-xs text-white hover:bg-rose-500"
                            >
                                {voidForm.processing ? (
                                    <>
                                        <Clock3 className="size-3.5 animate-pulse" />
                                        Reversing...
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="size-3.5" />
                                        Void and Restore
                                        Stock
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Expanded issuance details
|--------------------------------------------------------------------------
*/

function IssuanceDetails({
    issuance,
    canVoid,
    onVoid,
}: {
    issuance: StockIssuance;
    canVoid: boolean;
    onVoid: () => void;
}) {
    return (
        <div className="space-y-4 border-t border-violet-500/15 px-4 py-4">
            <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr_1fr]">
                {/* Transaction information */}

                <div className="rounded-xl border border-border/70 bg-card p-3.5">
                    <div className="flex items-center gap-2">
                        <ReceiptText className="size-3.5 text-blue-300" />

                        <h3 className="text-[10px] font-semibold">
                            Transaction
                            Information
                        </h3>
                    </div>

                    <dl className="mt-3 grid gap-2.5 text-[9px] sm:grid-cols-2 lg:grid-cols-1">
                        <DetailRow
                            label="Issuance Number"
                            value={
                                issuance.issuance_number
                            }
                        />

                        <DetailRow
                            label="Issuance Date"
                            value={formatDate(
                                issuance.issuance_date,
                            )}
                        />

                        <DetailRow
                            label="Reference"
                            value={
                                issuance.reference_no ||
                                '—'
                            }
                        />

                        <DetailRow
                            label="Purpose"
                            value={
                                issuance.purpose ||
                                '—'
                            }
                        />
                    </dl>
                </div>

                {/* Recipient */}

                <div className="rounded-xl border border-border/70 bg-card p-3.5">
                    <div className="flex items-center gap-2">
                        <UserRound className="size-3.5 text-violet-300" />

                        <h3 className="text-[10px] font-semibold">
                            Recipient and
                            Destination
                        </h3>
                    </div>

                    <dl className="mt-3 space-y-2.5 text-[9px]">
                        <DetailRow
                            label="Issued To"
                            value={
                                issuance.issued_to ||
                                '—'
                            }
                        />

                        <DetailRow
                            label="Department"
                            value={
                                issuance.department ||
                                '—'
                            }
                        />

                        <DetailRow
                            label="Branch"
                            value={
                                issuance.branch.code
                                    ? `${issuance.branch.code} — ${issuance.branch.name}`
                                    : issuance.branch
                                          .name
                            }
                        />

                        <DetailRow
                            label="Warehouse"
                            value={
                                issuance.warehouse
                                    .code
                                    ? `${issuance.warehouse.code} — ${issuance.warehouse.name}`
                                    : issuance
                                          .warehouse
                                          .name
                            }
                        />
                    </dl>
                </div>

                {/* Audit */}

                <div className="rounded-xl border border-border/70 bg-card p-3.5">
                    <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-amber-300" />

                        <h3 className="text-[10px] font-semibold">
                            Audit Trail
                        </h3>
                    </div>

                    <dl className="mt-3 space-y-2.5 text-[9px]">
                        <DetailRow
                            label="Issued By"
                            value={
                                issuance.issued_by
                                    ?.name ||
                                'System user'
                            }
                        />

                        <DetailRow
                            label="Posted At"
                            value={formatDateTime(
                                issuance.posted_at,
                            )}
                        />

                        <DetailRow
                            label="Created At"
                            value={formatDateTime(
                                issuance.created_at,
                            )}
                        />

                        {issuance.status ===
                            'voided' && (
                            <>
                                <DetailRow
                                    label="Voided By"
                                    value={
                                        issuance
                                            .voided_by
                                            ?.name ||
                                        'System user'
                                    }
                                />

                                <DetailRow
                                    label="Voided At"
                                    value={formatDateTime(
                                        issuance.voided_at,
                                    )}
                                />
                            </>
                        )}
                    </dl>
                </div>
            </div>

            {issuance.notes && (
                <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.04] px-3.5 py-3">
                    <div className="flex items-start gap-2.5">
                        <FileText className="mt-0.5 size-3.5 shrink-0 text-blue-300" />

                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-300">
                                Transaction Notes
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-[10px] leading-5 text-muted-foreground">
                                {issuance.notes}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {issuance.status ===
                'voided' &&
                issuance.void_reason && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3.5 py-3">
                        <div className="flex items-start gap-2.5">
                            <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-rose-300" />

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-rose-300">
                                    Void Reason
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-[10px] leading-5 text-rose-100/70">
                                    {
                                        issuance.void_reason
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            {/* Items */}

            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                <div className="flex flex-col gap-2 border-b border-border/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/[0.07] text-rose-300">
                            <Boxes className="size-3.5" />
                        </span>

                        <div>
                            <h3 className="text-[10px] font-semibold">
                                Issued Products
                            </h3>

                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                Product snapshots
                                and linked stock
                                movement records.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant="outline"
                            className="h-6 rounded-full border-border/70 bg-muted/25 px-2 text-[8px]"
                        >
                            {
                                issuance.items_count
                            }{' '}
                            products
                        </Badge>

                        <Badge
                            variant="outline"
                            className="h-6 rounded-full border-rose-500/20 bg-rose-500/[0.07] px-2 text-[8px] text-rose-300"
                        >
                            −
                            {formatNumber(
                                issuance.total_quantity,
                            )}
                        </Badge>

                        <Badge
                            variant="outline"
                            className="h-6 rounded-full border-amber-500/20 bg-amber-500/[0.07] px-2 text-[8px] text-amber-300"
                        >
                            {formatMoney(
                                issuance.total_cost,
                            )}
                        </Badge>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse">
                        <thead className="border-b border-border/60 bg-muted/20">
                            <tr>
                                <th className="min-w-[230px] px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Product
                                </th>

                                <th className="min-w-[110px] px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Quantity
                                </th>

                                <th className="min-w-[130px] px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Unit Cost
                                </th>

                                <th className="min-w-[130px] px-3 py-2.5 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Line Total
                                </th>

                                <th className="min-w-[175px] px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Movement
                                </th>

                                <th className="min-w-[190px] px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Notes
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border/60">
                            {issuance.items.map(
                                (item) => (
                                    <tr
                                        key={
                                            item.id
                                        }
                                    >
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30 text-muted-foreground">
                                                    <Boxes className="size-3.5" />
                                                </span>

                                                <div className="min-w-0">
                                                    <p className="max-w-[220px] truncate text-[10px] font-medium">
                                                        {
                                                            item.product_name
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                        {item.product_sku ||
                                                            'No SKU'}{' '}
                                                        ·{' '}
                                                        {
                                                            item.unit
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 text-right">
                                            <p className="text-[10px] font-semibold tabular-nums text-rose-300">
                                                −
                                                {formatNumber(
                                                    item.quantity_issued,
                                                )}
                                            </p>

                                            <p className="mt-0.5 text-[8px] text-muted-foreground">
                                                {
                                                    item.unit
                                                }
                                            </p>
                                        </td>

                                        <td className="px-3 py-3 text-right text-[10px] tabular-nums">
                                            {formatMoney(
                                                item.unit_cost,
                                            )}
                                        </td>

                                        <td className="px-3 py-3 text-right text-[10px] font-semibold tabular-nums">
                                            {formatMoney(
                                                item.line_total,
                                            )}
                                        </td>

                                        <td className="px-3 py-3">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-medium text-blue-300">
                                                    {item.stock_movement_id
                                                        ? `Movement #${item.stock_movement_id}`
                                                        : 'No movement link'}
                                                </p>

                                                {item.void_stock_movement_id && (
                                                    <p className="text-[8px] text-rose-300">
                                                        Reversal
                                                        #
                                                        {
                                                            item.void_stock_movement_id
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3">
                                            <p
                                                title={
                                                    item.notes ||
                                                    undefined
                                                }
                                                className="max-w-[190px] truncate text-[9px] text-muted-foreground"
                                            >
                                                {item.notes ||
                                                    '—'}
                                            </p>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {canVoid &&
                issuance.status ===
                    'posted' && (
                    <div className="flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rose-300" />

                            <div>
                                <p className="text-[10px] font-semibold text-rose-300">
                                    Owner Reversal
                                    Control
                                </p>

                                <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground">
                                    Void only when
                                    this transaction
                                    was posted by
                                    mistake. The
                                    system validates
                                    all stock movement
                                    links before
                                    restoring
                                    quantity.
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onVoid}
                            className="h-8 shrink-0 rounded-lg border-rose-500/20 bg-rose-500/[0.07] px-3 text-[9px] text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                        >
                            <ShieldAlert className="size-3.5" />
                            Void Issuance
                        </Button>
                    </div>
                )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Detail row
|--------------------------------------------------------------------------
*/

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-2 last:border-0 last:pb-0">
            <dt className="shrink-0 text-muted-foreground">
                {label}
            </dt>

            <dd className="min-w-0 break-words text-right font-medium text-foreground">
                {value}
            </dd>
        </div>
    );
}