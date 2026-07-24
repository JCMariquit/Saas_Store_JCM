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
    CalendarDays,
    Clock3,
    Fingerprint,
    History,
    PackageMinus,
    ReceiptText,
    RotateCcw,
    Search,
    ShieldAlert,
    UserRound,
    Warehouse,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
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

const HISTORY_URL = '/inventory/history';
const TERMINAL_URL = '/inventory/withdraw';

const ALL_VALUE = 'all';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Inventory',
        href: '/inventory/overview',
    },
    {
        title: 'Withdraw Stock',
        href: TERMINAL_URL,
    },
    {
        title: 'Withdrawal History',
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
            'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-400',

        department_issuance:
            'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-400',

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


function HistoryHeader({
    onBack,
}: {
    summary: IssuanceSummary;
    postedPercentage: number;
    voidedPercentage: number;
    onBack: () => void;
}) {
    return (
        <div className="space-y-4">
            <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.055] via-card/95 to-card shadow-sm">
                <div className="pointer-events-none absolute -left-16 -top-20 size-48 rounded-full bg-primary/[0.06] blur-3xl" />

                <div className="relative flex flex-col gap-3 border-b border-border/60 bg-background/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                            <History className="size-4" />
                        </span>

                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-foreground">
                                Inventory Withdrawal Archive
                            </p>
                            <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                                Posted, voided, and restored stock movement records.
                            </p>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className="h-6 w-fit rounded-full border-emerald-500/15 bg-emerald-500/[0.055] px-2.5 text-[9px] font-semibold tracking-[0.08em] text-emerald-400"
                    >
                        AUDIT REGISTER
                    </Badge>
                </div>

                <div className="relative flex flex-col gap-5 px-4 py-5 lg:flex-row lg:items-center lg:justify-between md:px-6 md:py-6">
                    <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                            Stock movement history
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2.5">
                            <h1 className="text-[26px] font-semibold leading-none tracking-[-0.035em] text-foreground md:text-[30px]">
                                Stock Withdrawal History
                            </h1>
                            <Badge
                                variant="outline"
                                className="h-6 rounded-full border-emerald-500/15 bg-emerald-500/[0.055] px-2.5 text-[9px] font-semibold text-emerald-400"
                            >
                                INVENTORY
                            </Badge>
                        </div>

                        <p className="mt-2 max-w-2xl text-[10px] leading-5 text-muted-foreground md:text-[11px]">
                            Review every non-sales stock withdrawal, inspect item and recipient details, and safely reverse eligible posted records.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="h-9 shrink-0 rounded-xl border-primary/15 bg-primary/[0.055] px-3 text-xs text-primary hover:bg-primary/[0.1] hover:text-primary"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Withdrawal
                    </Button>
                </div>

                <div className="relative h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
            </section>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main page
|--------------------------------------------------------------------------
*/

export default function StockWithdrawalHistory({
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
        selectedIssuance,
        setSelectedIssuance,
    ] = useState<StockIssuance | null>(null);

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

    useEffect(() => {
        if (!selectedIssuance && !voidTarget) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleKeyDown(
            event: globalThis.KeyboardEvent,
        ): void {
            if (event.key !== 'Escape') {
                return;
            }

            if (voidTarget) {
                if (!voidForm.processing) {
                    closeVoidDialog();
                }

                return;
            }

            setSelectedIssuance(null);
        }

        window.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, );

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
        setSelectedIssuance(null);

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

    function openVoidDialog(
        issuance: StockIssuance,
    ): void {
        voidForm.reset();
        voidForm.clearErrors();
        setSelectedIssuance(null);
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
                    setSelectedIssuance(null);
                    voidForm.reset();
                },
            },
        );
    }

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Withdrawal History" />

            <PageContainer className="gap-4 md:gap-5">
                <HistoryHeader
                    summary={summary}
                    postedPercentage={postedPercentage}
                    voidedPercentage={voidedPercentage}
                    onBack={() => router.get(TERMINAL_URL)}
                />

                {/* Withdrawal history register */}

                <SectionCard
                    title="Withdrawal Register"
                    description="Filter the archive and open a transaction to inspect its products, destination, movement links, notes, and audit trail."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-emerald-500/15 bg-emerald-500/[0.045] px-2.5 text-[9px] text-emerald-400"
                            >
                                <ReceiptText className="mr-1 size-3" />
                                {issuances.total} record{issuances.total === 1 ? '' : 's'}
                            </Badge>

                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-amber-500/15 bg-amber-500/[0.045] px-2.5 text-[9px] text-amber-400"
                            >
                                −{formatNumber(pageQuantity)} on this page
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
                                    className="h-10 border border-primary/15 bg-primary/[0.06] px-4 text-sm text-primary hover:bg-primary/[0.1] hover:text-primary"
                                >
                                    <Search className="size-3.5" />
                                    Apply Filters
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
                            placeholder="Search withdrawal no., recipient, reference, branch..."
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
                            title="Withdrawal date from"
                            aria-label="Withdrawal date from"
                            onChange={(
                                event,
                            ) =>
                                setDateFrom(
                                    event.target
                                        .value,
                                )
                            }
                            className="h-10"
                            iconClassName="text-primary"
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
                            title="Withdrawal date to"
                            aria-label="Withdrawal date to"
                            onChange={(
                                event,
                            ) =>
                                setDateTo(
                                    event.target
                                        .value,
                                )
                            }
                            className="h-10"
                            iconClassName="text-primary"
                        />
                    </FilterBar>

                    {/* Register table */}

                    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1080px] border-collapse">
                                <thead className="border-b border-border/70 bg-primary/[0.025]">
                                    <tr>
                                        <th className="min-w-[190px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Withdrawal
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

                                        <th className="w-[110px] px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border/60">
                                    {issuances.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-14"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                    <span className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06] text-primary">
                                                        <History className="size-5" />
                                                    </span>

                                                    <h3 className="mt-3 text-sm font-semibold">
                                                        {hasActiveFilters
                                                            ? 'No matching withdrawals'
                                                            : 'No stock withdrawals yet'}
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        {hasActiveFilters
                                                            ? 'Adjust or reset the filters to review other withdrawal transactions.'
                                                            : 'Posted transactions from the Withdrawal Terminal will appear here.'}
                                                    </p>

                                                    {hasActiveFilters && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={resetFilters}
                                                            className="mt-4 h-8 rounded-lg text-[10px]"
                                                        >
                                                            <RotateCcw className="size-3.5" />
                                                            Clear Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        issuances.data.map(
                                            (issuance) => (
                                                <tr
                                                    key={issuance.id}
                                                    tabIndex={0}
                                                    role="button"
                                                    onClick={() =>
                                                        setSelectedIssuance(
                                                            issuance,
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
                                                            event.key === ' '
                                                        ) {
                                                            event.preventDefault();

                                                            setSelectedIssuance(
                                                                issuance,
                                                            );
                                                        }
                                                    }}
                                                    className="group cursor-pointer bg-card transition hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
                                                >
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
                                                                    <p className="mt-0.5 max-w-40 truncate text-[8px] text-primary/80">
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
                                                            <UserRound className="mt-0.5 size-3.5 shrink-0 text-primary" />

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
                                                            <Warehouse className="mt-0.5 size-3.5 shrink-0 text-primary" />

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
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.stopPropagation();

                                                                setSelectedIssuance(
                                                                    issuance,
                                                                );
                                                            }}
                                                            className="h-8 rounded-lg border-primary/15 bg-primary/[0.04] px-2.5 text-[9px] text-primary hover:bg-primary/[0.09] hover:text-primary"
                                                        >
                                                            Details
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ),
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
                        itemLabel="stock withdrawals"
                    />
                </SectionCard>
            </PageContainer>

            <WithdrawalDetailsDrawer
                issuance={selectedIssuance}
                canVoid={permissions.can_void}
                onClose={() =>
                    setSelectedIssuance(null)
                }
                onVoid={(issuance) =>
                    openVoidDialog(issuance)
                }
            />

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
                                        Withdrawal
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
                                        Withdrawal
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
                                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" />

                                    <p className="text-[9px] leading-4 text-amber-200/80">
                                        The backend
                                        rejects reversal
                                        when later stock
                                        activity already
                                        exists or the
                                        current stock no
                                        longer matches
                                        the original
                                        withdrawal state.
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
| Withdrawal details side drawer
|--------------------------------------------------------------------------
*/

function WithdrawalDetailsDrawer({
    issuance,
    canVoid,
    onClose,
    onVoid,
}: {
    issuance: StockIssuance | null;
    canVoid: boolean;
    onClose: () => void;
    onVoid: (issuance: StockIssuance) => void;
}) {
    if (!issuance) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                aria-label="Close withdrawal details"
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] animate-in fade-in duration-200"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="withdrawal-details-title"
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[840px] flex-col overflow-hidden border-l border-border/80 bg-card shadow-[-24px_0_70px_-30px_rgba(0,0,0,0.82)] animate-in slide-in-from-right duration-300"
            >
                <header className="relative shrink-0 border-b border-border/70 bg-card px-4 py-4 sm:px-6 sm:py-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3.5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary shadow-sm">
                                <ReceiptText className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-primary">
                                    Withdrawal audit record
                                </p>

                                <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                                    <h2
                                        id="withdrawal-details-title"
                                        className="truncate font-mono text-base font-semibold tracking-tight text-foreground sm:text-lg"
                                    >
                                        {issuance.issuance_number}
                                    </h2>

                                    <StatusBadge
                                        label={issuance.status === 'posted' ? 'Posted' : 'Voided'}
                                        variant={issuance.status === 'posted' ? 'success' : 'danger'}
                                    />
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground">
                                    <span>{formatDate(issuance.issuance_date)}</span>
                                    <span className="text-border">•</span>
                                    <span>{issuance.warehouse.name}</span>
                                    <span className="text-border">•</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'h-5 max-w-[190px] rounded-full px-2 text-[8px] font-semibold',
                                            getReasonTone(issuance.reason),
                                        )}
                                    >
                                        <span className="truncate">{issuance.reason_label}</span>
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/35 text-muted-foreground transition hover:border-primary/20 hover:bg-primary/[0.06] hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            aria-label="Close withdrawal details"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto bg-background/20">
                    <WithdrawalDrawerContent issuance={issuance} />
                </div>

                <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/70 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <Fingerprint className="size-3.5 text-primary" />
                        Immutable inventory transaction snapshot
                    </div>

                    <div className="flex items-center gap-2">
                        {canVoid && issuance.status === 'posted' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onVoid(issuance)}
                                className="h-9 rounded-lg border-rose-500/20 bg-rose-500/[0.06] px-3 text-[10px] text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                            >
                                <ShieldAlert className="size-3.5" />
                                Void Withdrawal
                            </Button>
                        )}

                        <Button
                            type="button"
                            onClick={onClose}
                            className="h-9 rounded-lg bg-foreground px-5 text-[10px] font-semibold text-background hover:bg-foreground/90"
                        >
                            Close
                        </Button>
                    </div>
                </footer>
            </aside>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Professional withdrawal drawer content
|--------------------------------------------------------------------------
*/

function WithdrawalDrawerContent({
    issuance,
}: {
    issuance: StockIssuance;
}) {
    const recipient = getRecipientLabel(issuance);
    const warehouseLabel = issuance.warehouse.code
        ? `${issuance.warehouse.code} — ${issuance.warehouse.name}`
        : issuance.warehouse.name;
    const branchLabel = issuance.branch.code
        ? `${issuance.branch.code} — ${issuance.branch.name}`
        : issuance.branch.name;

    return (
        <div className="px-4 py-5 sm:px-6 sm:py-6">
            {/* Single transaction summary band */}
            <section className="border-b border-border/70 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Total quantity released
                        </p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <p className="text-3xl font-semibold tracking-[-0.045em] tabular-nums text-rose-300 sm:text-4xl">
                                −{formatNumber(issuance.total_quantity)}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                                across {issuance.items_count} product{issuance.items_count === 1 ? '' : 's'}
                            </span>
                        </div>
                        <p className="mt-2 max-w-xl text-[10px] leading-5 text-muted-foreground">
                            Released from <span className="font-medium text-foreground">{issuance.warehouse.name}</span> to{' '}
                            <span className="font-medium text-foreground">{recipient}</span>.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge
                            label={issuance.status === 'posted' ? 'Posted' : 'Voided'}
                            variant={issuance.status === 'posted' ? 'success' : 'danger'}
                        />
                        <Badge
                            variant="outline"
                            className={cn(
                                'h-6 max-w-[210px] rounded-full px-2.5 text-[8px] font-semibold',
                                getReasonTone(issuance.reason),
                            )}
                        >
                            <span className="truncate">{issuance.reason_label}</span>
                        </Badge>
                    </div>
                </div>

                <dl className="mt-5 grid overflow-hidden rounded-xl border border-border/70 bg-background/25 sm:grid-cols-4 sm:divide-x sm:divide-border/70">
                    <SummaryDatum
                        label="Stock value"
                        value={formatMoney(issuance.total_cost)}
                        valueClassName="text-amber-300"
                    />
                    <SummaryDatum
                        label="Withdrawal date"
                        value={formatDate(issuance.issuance_date)}
                    />
                    <SummaryDatum
                        label="Reference"
                        value={issuance.reference_no || '—'}
                        mono
                    />
                    <SummaryDatum
                        label="Warehouse"
                        value={issuance.warehouse.code || issuance.warehouse.name}
                    />
                </dl>
            </section>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                <main className="min-w-0 py-6 lg:pr-7">
                    <ProfessionalSection
                        title="Transaction information"
                        description="Request, purpose, and source record details."
                    >
                        <dl className="grid gap-x-8 sm:grid-cols-2">
                            <DefinitionRow
                                label="Withdrawal number"
                                value={issuance.issuance_number}
                                mono
                            />
                            <DefinitionRow
                                label="Reason"
                                value={issuance.reason_label}
                            />
                            <DefinitionRow
                                label="Reference number"
                                value={issuance.reference_no || '—'}
                                mono
                            />
                            <DefinitionRow
                                label="Purpose / justification"
                                value={issuance.purpose || '—'}
                            />
                        </dl>

                        {issuance.notes && (
                            <div className="mt-5 border-l-2 border-primary/40 pl-4">
                                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-primary">
                                    Transaction notes
                                </p>
                                <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-foreground/80">
                                    {issuance.notes}
                                </p>
                            </div>
                        )}
                    </ProfessionalSection>

                    <ProfessionalSection
                        title="Withdrawn products"
                        description="Item quantities, recorded costs, and linked stock movements."
                        className="mt-7"
                    >
                        <div className="mt-4 overflow-hidden border-y border-border/70">
                            <div className="hidden grid-cols-[minmax(0,1fr)_100px_120px] gap-4 border-b border-border/70 bg-muted/[0.08] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:grid">
                                <span>Product</span>
                                <span className="text-right">Quantity</span>
                                <span className="text-right">Line value</span>
                            </div>
                            <div className="divide-y divide-border/60">
                                {issuance.items.map((item) => (
                                    <ProfessionalItemRow key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    </ProfessionalSection>
                </main>

                <aside className="border-t border-border/70 py-6 lg:border-l lg:border-t-0 lg:pl-7">
                    <ProfessionalSection
                        title="Recipient and location"
                        description="Accountability and inventory source."
                    >
                        <dl>
                            <CompactDefinition label="Issued to" value={recipient} />
                            <CompactDefinition
                                label="Department / office"
                                value={issuance.department || '—'}
                            />
                            <CompactDefinition label="Branch" value={branchLabel} />
                            <CompactDefinition label="Warehouse" value={warehouseLabel} />
                        </dl>
                    </ProfessionalSection>

                    <ProfessionalSection
                        title="Audit trail"
                        description="Users and system timestamps."
                        className="mt-7"
                    >
                        <div className="mt-4 space-y-4">
                            <AuditLine
                                label="Created"
                                value={formatDateTime(issuance.created_at)}
                                helper={issuance.issued_by?.name || 'System user'}
                            />
                            <AuditLine
                                label="Posted"
                                value={formatDateTime(issuance.posted_at)}
                                helper={issuance.issued_by?.email || 'No email recorded'}
                            />
                            {issuance.status === 'voided' && (
                                <AuditLine
                                    label="Voided"
                                    value={formatDateTime(issuance.voided_at)}
                                    helper={issuance.voided_by?.name || 'System user'}
                                    tone="rose"
                                />
                            )}
                        </div>
                    </ProfessionalSection>

                    {issuance.status === 'voided' && issuance.void_reason && (
                        <div className="mt-7 border-l-2 border-rose-400/50 pl-4">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-rose-300">
                                Void reason
                            </p>
                            <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-foreground/80">
                                {issuance.void_reason}
                            </p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

function SummaryDatum({
    label,
    value,
    valueClassName,
    mono = false,
}: {
    label: string;
    value: string;
    valueClassName?: string;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0 border-b border-border/70 px-3.5 py-3 last:border-b-0 sm:border-b-0">
            <dt className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </dt>
            <dd
                className={cn(
                    'mt-1.5 truncate text-[10px] font-semibold text-foreground',
                    mono && 'font-mono',
                    valueClassName,
                )}
                title={value}
            >
                {value}
            </dd>
        </div>
    );
}

function ProfessionalSection({
    title,
    description,
    className,
    children,
}: {
    title: string;
    description: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section className={className}>
            <div className="border-b border-border/70 pb-3">
                <h3 className="text-[11px] font-semibold text-foreground">
                    {title}
                </h3>
                <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="pt-1">{children}</div>
        </section>
    );
}

function DefinitionRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="border-b border-border/60 py-3.5">
            <dt className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </dt>
            <dd
                className={cn(
                    'mt-1.5 break-words text-[10px] font-medium leading-5 text-foreground/90',
                    mono && 'font-mono',
                )}
            >
                {value}
            </dd>
        </div>
    );
}

function CompactDefinition({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="border-b border-border/60 py-3 last:border-b-0">
            <dt className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1.5 break-words text-[10px] font-medium leading-5 text-foreground/90">
                {value}
            </dd>
        </div>
    );
}

function ProfessionalItemRow({
    item,
}: {
    item: IssuanceItem;
}) {
    return (
        <article className="px-3 py-3.5 transition-colors hover:bg-muted/[0.06]">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_100px_120px] sm:items-start sm:gap-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold leading-4 text-foreground">
                        {item.product_name}
                    </p>
                    <p className="mt-1 font-mono text-[8px] text-muted-foreground">
                        {item.product_sku || 'No SKU'} · {item.unit}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                    <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground sm:hidden">
                        Quantity
                    </span>
                    <p className="text-[10px] font-semibold tabular-nums text-rose-300">
                        −{formatNumber(item.quantity_issued)} {item.unit}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                    <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground sm:hidden">
                        Line value
                    </span>
                    <p className="text-[10px] font-semibold tabular-nums text-foreground">
                        {formatMoney(item.line_total)}
                    </p>
                    <p className="mt-0.5 hidden text-[8px] text-muted-foreground sm:block">
                        {formatMoney(item.unit_cost)} / unit
                    </p>
                </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/50 pt-2.5 text-[8px] text-muted-foreground">
                <span>
                    Movement:{' '}
                    <strong className="font-mono font-medium text-primary">
                        {item.stock_movement_id ? `#${item.stock_movement_id}` : 'Not linked'}
                    </strong>
                </span>
                {item.void_stock_movement_id && (
                    <span>
                        Reversal:{' '}
                        <strong className="font-mono font-medium text-rose-300">
                            #{item.void_stock_movement_id}
                        </strong>
                    </span>
                )}
            </div>

            {item.notes && (
                <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                    <span className="font-medium text-foreground/80">Note:</span>{' '}
                    {item.notes}
                </p>
            )}
        </article>
    );
}

function AuditLine({
    label,
    value,
    helper,
    tone = 'primary',
}: {
    label: string;
    value: string;
    helper: string;
    tone?: 'primary' | 'rose';
}) {
    return (
        <div className="flex gap-3">
            <span
                className={cn(
                    'mt-1 size-2 shrink-0 rounded-full',
                    tone === 'rose' ? 'bg-rose-400' : 'bg-primary',
                )}
            />
            <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 text-[10px] font-medium text-foreground">
                    {value}
                </p>
                <p className="mt-0.5 break-words text-[8px] leading-4 text-muted-foreground">
                    {helper}
                </p>
            </div>
        </div>
    );
}