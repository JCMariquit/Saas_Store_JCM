import { AppPagination } from '@/components/shared/app-pagination';
import {
    DataTable,
    type DataTableColumn,
} from '@/components/shared/data-table';
import { EntityAvatar } from '@/components/shared/entity-avatar';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { IconInput } from '@/components/shared/icon-input';
import { PageContainer } from '@/components/shared/page-container';
import { SearchInput } from '@/components/shared/search-input';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    ArrowDownToLine,
    ArrowRight,
    ArrowRightLeft,
    ArrowUpFromLine,
    Boxes,
    CalendarDays,
    CircleDollarSign,
    FileText,
    History,
    Package2,
    RefreshCw,
    Scale,
    ShieldCheck,
    UserRound,
    Warehouse,
    type LucideIcon,
} from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type ProductInfo = {
    id: number;
    name: string;
    sku: string | null;
    barcode: string | null;
    unit: string;
};

type WarehouseInfo = {
    id: number;
    name: string;
    code: string | null;
};

type CreatorInfo = {
    id: number;
    name: string;
    email: string | null;
};

type StockMovement = {
    id: number;
    product: ProductInfo;
    warehouse: WarehouseInfo;
    related_warehouse: WarehouseInfo | null;
    movement_type: string;
    movement_label: string;
    direction: 'in' | 'out';
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    unit_cost: number;
    total_cost: number;
    reference_type: string | null;
    reference_id: number | null;
    reference_no: string | null;
    remarks: string | null;
    movement_date: string;
    created_by: CreatorInfo | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedMovements = {
    current_page: number;
    data: StockMovement[];
    first_page_url: string;
    from: number | null;
    to: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    per_page: number;
    total: number;
};

type MovementSummary = {
    total: number;
    incoming_quantity: number;
    outgoing_quantity: number;
    affected_products: number;
};

type WarehouseOption = {
    id: number;
    name: string;
    code: string | null;
};

type MovementTypeOption = {
    value: string;
    label: string;
};

type MovementFilters = {
    search: string;
    movement_type: string;
    direction: string;
    warehouse_id: string;
    date_from: string;
    date_to: string;
};

type StockMovementPageProps = {
    movements: PaginatedMovements;
    summary: MovementSummary;
    warehouses: WarehouseOption[];
    movement_types: MovementTypeOption[];
    filters: MovementFilters;
};

type SnapshotTone = 'blue' | 'emerald' | 'rose' | 'violet';

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
        title: 'Stock Movements',
        href: '/stock-movements',
    },
];

const ALL_VALUE = 'all';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function StockMovementIndex({
    movements,
    summary,
    warehouses,
    movement_types,
    filters,
}: StockMovementPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [movementType, setMovementType] = useState(
        filters.movement_type ?? '',
    );
    const [direction, setDirection] = useState(filters.direction ?? '');
    const [warehouseId, setWarehouseId] = useState(
        filters.warehouse_id ?? '',
    );
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    useEffect(() => {
        setSearch(filters.search ?? '');
        setMovementType(filters.movement_type ?? '');
        setDirection(filters.direction ?? '');
        setWarehouseId(filters.warehouse_id ?? '');
        setDateFrom(filters.date_from ?? '');
        setDateTo(filters.date_to ?? '');
    }, [
        filters.search,
        filters.movement_type,
        filters.direction,
        filters.warehouse_id,
        filters.date_from,
        filters.date_to,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    function applyFilters(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        router.get(
            '/stock-movements',
            {
                search: search.trim() || undefined,
                movement_type: movementType || undefined,
                direction: direction || undefined,
                warehouse_id: warehouseId || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
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
        setMovementType('');
        setDirection('');
        setWarehouseId('');
        setDateFrom('');
        setDateTo('');

        router.get(
            '/stock-movements',
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
    | Derived values
    |--------------------------------------------------------------------------
    */

    const incomingQuantity = Number(summary.incoming_quantity || 0);
    const outgoingQuantity = Number(summary.outgoing_quantity || 0);
    const totalQuantityFlow = incomingQuantity + outgoingQuantity;

    const incomingPercentage =
        totalQuantityFlow > 0
            ? Math.round((incomingQuantity / totalQuantityFlow) * 100)
            : 0;

    const outgoingPercentage =
        totalQuantityFlow > 0
            ? Math.max(0, 100 - incomingPercentage)
            : 0;

    const netQuantity = incomingQuantity - outgoingQuantity;
    const netDirection = netQuantity >= 0 ? 'in' : 'out';
    const averageMovementsPerProduct =
        summary.affected_products > 0
            ? summary.total / summary.affected_products
            : 0;

    const hasActiveFilters = Boolean(
        search ||
            movementType ||
            direction ||
            warehouseId ||
            dateFrom ||
            dateTo,
    );

    /*
    |--------------------------------------------------------------------------
    | Table columns
    |--------------------------------------------------------------------------
    */

    const movementColumns: DataTableColumn<StockMovement>[] = [
        {
            key: 'timeline',
            header: 'Timeline',
            className: 'min-w-[155px]',
            cell: (movement) => (
                <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/10 text-blue-400">
                        <CalendarDays className="size-4" />
                    </span>

                    <div>
                        <p className="whitespace-nowrap text-[12px] font-semibold">
                            {formatDate(movement.movement_date)}
                        </p>

                        <Badge
                            variant="outline"
                            className="mt-1 h-5 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-2 text-[9px] font-medium text-blue-400"
                        >
                            {formatTime(movement.movement_date)}
                        </Badge>
                    </div>
                </div>
            ),
        },
        {
            key: 'product',
            header: 'Product',
            className: 'min-w-[235px]',
            cell: (movement) => (
                <EntityInfo
                    avatar={
                        <EntityAvatar
                            icon={Package2}
                            className="border-violet-500/15 bg-violet-500/10 text-violet-400 group-hover:border-violet-500/25 group-hover:bg-violet-500/15"
                        />
                    }
                    title={movement.product.name}
                    subtitle={
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge
                                variant="outline"
                                className="h-5 rounded-full border-violet-500/15 bg-violet-500/[0.06] px-2 font-mono text-[9px] font-medium text-violet-400"
                            >
                                SKU {movement.product.sku ?? '—'}
                            </Badge>

                            {movement.product.barcode && (
                                <Badge
                                    variant="outline"
                                    className="h-5 rounded-full border-slate-500/15 bg-slate-500/[0.06] px-2 font-mono text-[9px] font-medium text-slate-400"
                                >
                                    {movement.product.barcode}
                                </Badge>
                            )}
                        </div>
                    }
                />
            ),
        },
        {
            key: 'route',
            header: 'Storage Route',
            className: 'min-w-[245px]',
            cell: (movement) => (
                <div className="max-w-[260px] rounded-xl border border-cyan-500/10 bg-cyan-500/[0.025] px-3 py-2.5">
                    <WarehouseNode
                        warehouse={movement.warehouse}
                        tone="cyan"
                    />

                    {movement.related_warehouse ? (
                        <div className="my-2 flex items-center gap-2 pl-2 text-[9px] font-medium uppercase tracking-[0.1em] text-cyan-400">
                            <span className="h-px flex-1 bg-cyan-500/15" />
                            <ArrowRightLeft className="size-3" />
                            Transfer
                            <span className="h-px flex-1 bg-cyan-500/15" />
                        </div>
                    ) : (
                        <div className="my-2 h-px bg-border/50" />
                    )}

                    {movement.related_warehouse ? (
                        <WarehouseNode
                            warehouse={movement.related_warehouse}
                            tone="amber"
                        />
                    ) : (
                        <p className="text-[9px] text-muted-foreground">
                            Single-location movement
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: 'movement',
            header: 'Movement',
            className: 'min-w-[165px]',
            cell: (movement) => (
                <div className="space-y-2">
                    <MovementBadge movement={movement} />

                    <Badge
                        variant="outline"
                        className={cn(
                            'h-5 rounded-full px-2 text-[9px] font-semibold uppercase tracking-wide',
                            movement.direction === 'in'
                                ? 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400'
                                : 'border-rose-500/15 bg-rose-500/[0.06] text-rose-400',
                        )}
                    >
                        {movement.direction === 'in' ? (
                            <ArrowDownToLine className="mr-1 size-2.5" />
                        ) : (
                            <ArrowUpFromLine className="mr-1 size-2.5" />
                        )}
                        Stock {movement.direction}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'change',
            header: 'Inventory Change',
            className: 'min-w-[210px]',
            cell: (movement) => (
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Quantity
                        </span>

                        <span
                            className={cn(
                                'text-[14px] font-semibold tabular-nums',
                                movement.direction === 'in'
                                    ? 'text-emerald-400'
                                    : 'text-rose-400',
                            )}
                        >
                            {movement.direction === 'in' ? '+' : '-'}
                            {formatQuantity(movement.quantity)}{' '}
                            <span className="text-[9px] font-medium text-muted-foreground">
                                {movement.product.unit}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/45 px-2.5 py-2">
                        <QuantityState
                            label="Before"
                            value={movement.quantity_before}
                            tone="slate"
                        />

                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />

                        <QuantityState
                            label="After"
                            value={movement.quantity_after}
                            tone={movement.direction === 'in' ? 'emerald' : 'rose'}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: 'valuation',
            header: 'Valuation',
            className: 'min-w-[165px]',
            cell: (movement) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/15 bg-amber-500/10 text-amber-400">
                            <CircleDollarSign className="size-3.5" />
                        </span>

                        <div>
                            <p className="text-[12px] font-semibold tabular-nums text-amber-400">
                                {formatMoney(movement.total_cost)}
                            </p>
                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                Total movement value
                            </p>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className="h-5 rounded-full border-amber-500/15 bg-amber-500/[0.05] px-2 text-[9px] font-medium text-amber-400"
                    >
                        {formatMoney(movement.unit_cost)} / unit
                    </Badge>
                </div>
            ),
        },
        {
            key: 'audit',
            header: 'Audit Source',
            className: 'min-w-[230px]',
            cell: (movement) => (
                <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400">
                            <FileText className="size-3" />
                        </span>

                        <div className="min-w-0">
                            <p className="max-w-[175px] truncate text-[11px] font-semibold">
                                {movement.reference_no ?? 'No reference'}
                            </p>
                            <p className="mt-0.5 max-w-[175px] truncate text-[9px] text-muted-foreground">
                                {formatReferenceType(movement.reference_type)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-fuchsia-500/10 text-fuchsia-400">
                            <UserRound className="size-3" />
                        </span>

                        <div className="min-w-0">
                            <p className="max-w-[175px] truncate text-[11px] font-medium text-foreground/85">
                                {movement.created_by?.name ?? 'System'}
                            </p>
                            <p className="mt-0.5 max-w-[175px] truncate text-[9px] text-muted-foreground">
                                {movement.created_by?.email ?? 'Automated record'}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'remarks',
            header: 'Remarks',
            className: 'min-w-[210px]',
            cell: (movement) =>
                movement.remarks ? (
                    <div
                        title={movement.remarks}
                        className="flex max-w-[230px] items-start gap-2 rounded-lg border border-slate-500/15 bg-slate-500/[0.05] px-2.5 py-2 text-slate-400"
                    >
                        <FileText className="mt-0.5 size-3.5 shrink-0" />
                        <p className="line-clamp-2 text-[10px] leading-4">
                            {movement.remarks}
                        </p>
                    </div>
                ) : (
                    <Badge
                        variant="outline"
                        className="h-5 rounded-full border-slate-500/15 bg-slate-500/[0.05] px-2 text-[9px] text-slate-500"
                    >
                        No remarks
                    </Badge>
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
            <Head title="Stock Movements" />

            <PageContainer className="gap-4 md:gap-5">
                {/* Inventory flow audit board */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/55">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex size-8 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/10 text-blue-400">
                                <Activity className="size-4" />
                            </span>

                            <div>
                                <p className="text-[12px] font-semibold">
                                    Inventory Flow Audit Board
                                </p>
                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    Read-only movement balance and inventory activity
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="h-6 w-fit gap-1.5 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[9px] font-semibold text-emerald-300"
                        >
                            <ShieldCheck className="size-3" />
                            Audit history protected
                        </Badge>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
                        <div className="relative overflow-hidden border-b border-border/60 p-4 xl:border-b-0 xl:border-r md:p-5">
                            <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-blue-500/10 blur-3xl" />
                            <ArrowRightLeft className="pointer-events-none absolute -bottom-8 -right-5 size-32 text-blue-400 opacity-[0.02]" />

                            <div className="relative">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                            Net Quantity Position
                                        </p>

                                        <div className="mt-2 flex items-center gap-2.5">
                                            <span
                                                className={cn(
                                                    'inline-flex size-9 items-center justify-center rounded-xl border',
                                                    netDirection === 'in'
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-rose-500/20 bg-rose-500/10 text-rose-400',
                                                )}
                                            >
                                                {netDirection === 'in' ? (
                                                    <ArrowDownToLine className="size-4.5" />
                                                ) : (
                                                    <ArrowUpFromLine className="size-4.5" />
                                                )}
                                            </span>

                                            <div>
                                                <p
                                                    className={cn(
                                                        'text-[25px] font-semibold leading-none tracking-[-0.04em] tabular-nums',
                                                        netDirection === 'in'
                                                            ? 'text-emerald-400'
                                                            : 'text-rose-400',
                                                    )}
                                                >
                                                    {netQuantity >= 0 ? '+' : '-'}
                                                    {formatQuantity(
                                                        Math.abs(netQuantity),
                                                    )}
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    {netDirection === 'in'
                                                        ? 'More stock entered than left'
                                                        : 'More stock left than entered'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FlowQuantityBadge
                                            label="Incoming"
                                            value={incomingQuantity}
                                            tone="emerald"
                                        />
                                        <FlowQuantityBadge
                                            label="Outgoing"
                                            value={outgoingQuantity}
                                            tone="rose"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center justify-between gap-3 text-[9px] font-medium">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                            <span className="size-1.5 rounded-full bg-emerald-400" />
                                            {incomingPercentage}% stock in
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-rose-400">
                                            {outgoingPercentage}% stock out
                                            <span className="size-1.5 rounded-full bg-rose-400" />
                                        </span>
                                    </div>

                                    <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-emerald-400 transition-all duration-500"
                                            style={{ width: `${incomingPercentage}%` }}
                                        />
                                        <div
                                            className="h-full bg-rose-400 transition-all duration-500"
                                            style={{ width: `${outgoingPercentage}%` }}
                                        />
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <History className="size-3 text-blue-400" />
                                            {formatNumber(summary.total)} recorded events
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Package2 className="size-3 text-violet-400" />
                                            {formatNumber(summary.affected_products)} affected products
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Scale className="size-3 text-amber-400" />
                                            {formatDecimal(averageMovementsPerProduct)} avg. events/product
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-2">
                            <AuditSnapshot
                                title="Movement Records"
                                value={formatNumber(summary.total)}
                                description="Ledger entries"
                                icon={History}
                                tone="blue"
                                className="border-b border-r border-border/60"
                            />
                            <AuditSnapshot
                                title="Affected Products"
                                value={formatNumber(summary.affected_products)}
                                description="Unique inventory items"
                                icon={Package2}
                                tone="violet"
                                className="border-b border-border/60"
                            />
                            <AuditSnapshot
                                title="Incoming Share"
                                value={`${incomingPercentage}%`}
                                description={formatQuantity(incomingQuantity)}
                                icon={ArrowDownToLine}
                                tone="emerald"
                                className="border-r border-border/60"
                            />
                            <AuditSnapshot
                                title="Outgoing Share"
                                value={`${outgoingPercentage}%`}
                                description={formatQuantity(outgoingQuantity)}
                                icon={ArrowUpFromLine}
                                tone="rose"
                            />
                        </div>
                    </div>
                </section>

                {/* Movement ledger */}

                <SectionCard
                    title={
                        <div className="flex flex-wrap items-center gap-2">
                            <span>Movement Ledger</span>
                            <Badge
                                variant="outline"
                                className="h-5 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-2 text-[9px] font-semibold text-blue-400"
                            >
                                {formatNumber(movements.total)} records
                            </Badge>
                        </div>
                    }
                    description="Trace stock changes, storage routes, valuation, source references, and the user responsible for every movement."
                    actions={
                        <Badge
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[9px] font-semibold text-emerald-300"
                        >
                            <ShieldCheck className="size-3" />
                            Read-only audit
                        </Badge>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(250px,1fr)_150px_190px_190px_155px_155px]"
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
                            onChange={(event) => setSearch(event.target.value)}
                            onClear={() => setSearch('')}
                            placeholder="Search product, SKU, warehouse, reference, or remarks..."
                        />

                        <Select
                            value={direction || ALL_VALUE}
                            onValueChange={(value) =>
                                setDirection(value === ALL_VALUE ? '' : value)
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All directions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All directions
                                </SelectItem>
                                <SelectItem value="in">Stock In</SelectItem>
                                <SelectItem value="out">Stock Out</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={movementType || ALL_VALUE}
                            onValueChange={(value) =>
                                setMovementType(value === ALL_VALUE ? '' : value)
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All movement types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All movement types
                                </SelectItem>
                                {movement_types.map((movementTypeOption) => (
                                    <SelectItem
                                        key={movementTypeOption.value}
                                        value={movementTypeOption.value}
                                    >
                                        {movementTypeOption.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={warehouseId || ALL_VALUE}
                            onValueChange={(value) =>
                                setWarehouseId(value === ALL_VALUE ? '' : value)
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All warehouses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All warehouses
                                </SelectItem>
                                {warehouses.map((warehouse) => (
                                    <SelectItem
                                        key={warehouse.id}
                                        value={String(warehouse.id)}
                                    >
                                        {warehouse.name}
                                        {warehouse.code
                                            ? ` (${warehouse.code})`
                                            : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <IconInput
                            id="date_from"
                            icon={CalendarDays}
                            type="date"
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                            aria-label="Date from"
                            iconClassName="group-focus-within:text-blue-400"
                        />

                        <IconInput
                            id="date_to"
                            icon={CalendarDays}
                            type="date"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            aria-label="Date to"
                            iconClassName="group-focus-within:text-blue-400"
                        />
                    </FilterBar>

                    <DataTable
                        data={movements.data}
                        columns={movementColumns}
                        getRowKey={(movement) => movement.id}
                        emptyIcon={Boxes}
                        emptyTitle="No stock movements found"
                        emptyDescription="Stock changes will appear here after a stock-in, adjustment, transfer, sale, return, damage, or expiration entry."
                        minWidth="1560px"
                    />

                    <AppPagination
                        pagination={movements}
                        itemLabel="movements"
                    />
                </SectionCard>
            </PageContainer>
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Local presentation helpers
|--------------------------------------------------------------------------
*/

function FlowQuantityBadge({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'emerald' | 'rose';
}) {
    const incoming = tone === 'emerald';

    return (
        <div
            className={cn(
                'min-w-[105px] rounded-xl border px-3 py-2',
                incoming
                    ? 'border-emerald-500/15 bg-emerald-500/[0.045]'
                    : 'border-rose-500/15 bg-rose-500/[0.045]',
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em]',
                    incoming ? 'text-emerald-400' : 'text-rose-400',
                )}
            >
                {incoming ? (
                    <ArrowDownToLine className="size-3" />
                ) : (
                    <ArrowUpFromLine className="size-3" />
                )}
                {label}
            </div>
            <p className="mt-1 text-[13px] font-semibold tabular-nums">
                {formatQuantity(value)}
            </p>
        </div>
    );
}

function AuditSnapshot({
    title,
    value,
    description,
    icon: Icon,
    tone,
    className,
}: {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    tone: SnapshotTone;
    className?: string;
}) {
    const toneStyles: Record<
        SnapshotTone,
        {
            icon: string;
            value: string;
            glow: string;
        }
    > = {
        blue: {
            icon: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
            glow: 'bg-blue-500/10',
        },
        emerald: {
            icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            glow: 'bg-emerald-500/10',
        },
        rose: {
            icon: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
            value: 'text-rose-400',
            glow: 'bg-rose-500/10',
        },
        violet: {
            icon: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
            glow: 'bg-violet-500/10',
        },
    };

    const styles = toneStyles[tone];

    return (
        <div
            className={cn(
                'group relative min-w-0 overflow-hidden p-4 transition-colors hover:bg-muted/[0.025]',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute -bottom-12 -right-12 size-28 rounded-full blur-3xl',
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
                    <p className="mt-2 truncate text-[9px] text-muted-foreground">
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

function WarehouseNode({
    warehouse,
    tone,
}: {
    warehouse: WarehouseInfo;
    tone: 'cyan' | 'amber';
}) {
    return (
        <div className="flex items-center gap-2.5">
            <span
                className={cn(
                    'inline-flex size-7 shrink-0 items-center justify-center rounded-lg border',
                    tone === 'cyan'
                        ? 'border-cyan-500/15 bg-cyan-500/10 text-cyan-400'
                        : 'border-amber-500/15 bg-amber-500/10 text-amber-400',
                )}
            >
                <Warehouse className="size-3.5" />
            </span>

            <div className="min-w-0">
                <p className="max-w-[175px] truncate text-[11px] font-semibold">
                    {warehouse.name}
                </p>
                <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                    {warehouse.code ?? 'No code'}
                </p>
            </div>
        </div>
    );
}

function QuantityState({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'slate' | 'emerald' | 'rose';
}) {
    return (
        <div className="min-w-0 flex-1 text-center">
            <p className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <p
                className={cn(
                    'mt-1 text-[11px] font-semibold tabular-nums',
                    tone === 'emerald'
                        ? 'text-emerald-400'
                        : tone === 'rose'
                          ? 'text-rose-400'
                          : 'text-slate-300',
                )}
            >
                {formatQuantity(value)}
            </p>
        </div>
    );
}

function MovementBadge({ movement }: { movement: StockMovement }) {
    const normalizedType = movement.movement_type
        .toLowerCase()
        .replace(/[_\\-]+/g, ' ');

    const isTransfer = normalizedType.includes('transfer');
    const isAdjustment = normalizedType.includes('adjust');
    const isReturn = normalizedType.includes('return');
    const isDamageOrExpiry =
        normalizedType.includes('damage') || normalizedType.includes('expire');

    const badgeClass = isTransfer
        ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'
        : isAdjustment
          ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
          : isReturn
            ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
            : isDamageOrExpiry
              ? 'border-red-500/20 bg-red-500/10 text-red-400'
              : movement.direction === 'in'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-400';

    return (
        <Badge
            variant="outline"
            className={cn(
                'h-7 gap-1.5 rounded-full px-2.5 text-[10px] font-semibold',
                badgeClass,
            )}
        >
            {isTransfer ? (
                <ArrowRightLeft className="size-3.5" />
            ) : movement.direction === 'in' ? (
                <ArrowDownToLine className="size-3.5" />
            ) : (
                <ArrowUpFromLine className="size-3.5" />
            )}
            {movement.movement_label}
        </Badge>
    );
}

/*
|--------------------------------------------------------------------------
| Formatters
|--------------------------------------------------------------------------
*/

function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(Number(value || 0));
}

function formatQuantity(value: number): string {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(Number(value || 0));
}

function formatDecimal(value: number): string {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(Number(value || 0));
}

function formatMoney(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function formatTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatReferenceType(value: string | null): string {
    if (!value) {
        return 'Reference';
    }

    const name = value.split('\\').pop() ?? value;

    return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
}