import { AppPagination } from '@/components/shared/app-pagination';
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
    ArrowRightLeft,
    ArrowUpFromLine,
    Boxes,
    CalendarDays,
    CircleDollarSign,
    Eye,
    FileText,
    Fingerprint,
    Package2,
    RefreshCw,
    Scale,
    Search,
    ShieldCheck,
    Warehouse,
    X,
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

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const MOVEMENTS_URL = '/inventory/stock-movements';
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
        title: 'Stock Movements',
        href: MOVEMENTS_URL,
    },
];

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
    const [selectedMovement, setSelectedMovement] =
        useState<StockMovement | null>(null);

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

    useEffect(() => {
        if (!selectedMovement) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleKeyDown(event: globalThis.KeyboardEvent): void {
            if (event.key === 'Escape') {
                setSelectedMovement(null);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedMovement]);

    const incomingQuantity = Number(summary.incoming_quantity || 0);
    const outgoingQuantity = Number(summary.outgoing_quantity || 0);
    const totalFlow = incomingQuantity + outgoingQuantity;
    const netQuantity = incomingQuantity - outgoingQuantity;

    const incomingPercentage =
        totalFlow > 0
            ? Math.round((incomingQuantity / totalFlow) * 100)
            : 0;

    const outgoingPercentage =
        totalFlow > 0
            ? Math.max(0, 100 - incomingPercentage)
            : 0;

    const averageMovementsPerProduct =
        summary.affected_products > 0
            ? Number(summary.total || 0) / summary.affected_products
            : 0;


    const hasActiveFilters = Boolean(
        search.trim() ||
            movementType ||
            direction ||
            warehouseId ||
            dateFrom ||
            dateTo,
    );

    function applyFilters(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        router.get(
            MOVEMENTS_URL,
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
            MOVEMENTS_URL,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Movements" />

            <PageContainer className="gap-4 md:gap-5">
                <MovementControlBoard
                    summary={summary}
                    incomingQuantity={incomingQuantity}
                    outgoingQuantity={outgoingQuantity}
                    netQuantity={netQuantity}
                    incomingPercentage={incomingPercentage}
                    outgoingPercentage={outgoingPercentage}
                    averageMovementsPerProduct={averageMovementsPerProduct}
                />

                

                <SectionCard
                    title="Stock Movement Ledger"
                    description="Review every inventory increase, decrease, adjustment, transfer, withdrawal, receipt, return, and linked source record."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-emerald-500/15 bg-emerald-500/[0.045] px-2.5 text-[9px] font-semibold text-emerald-400"
                            >
                                <ShieldCheck className="mr-1 size-3" />
                                Read-only audit
                            </Badge>

                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-border/60 bg-muted/20 px-2.5 text-[9px] text-muted-foreground"
                            >
                                {formatNumber(movements.total)} records
                            </Badge>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_150px_190px_200px_155px_155px]"
                        actions={
                            <>
                                <Button
                                    type="submit"
                                    className="h-10 border border-emerald-500/25 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200"
                                >
                                    <Search className="size-3.5" />
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
                            placeholder="Search product, SKU, warehouse, reference, user, or remarks..."
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
                                        {warehouse.code
                                            ? `${warehouse.code} — ${warehouse.name}`
                                            : warehouse.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <IconInput
                            id="movement_date_from"
                            icon={CalendarDays}
                            type="date"
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                            aria-label="Movement date from"
                            title="Movement date from"
                            className="h-10"
                            iconClassName="group-focus-within:text-emerald-400"
                        />

                        <IconInput
                            id="movement_date_to"
                            icon={CalendarDays}
                            type="date"
                            min={dateFrom || undefined}
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            aria-label="Movement date to"
                            title="Movement date to"
                            className="h-10"
                            iconClassName="group-focus-within:text-emerald-400"
                        />
                    </FilterBar>
                    <div className="border-t border-border/60">
                        <MovementLedgerTable
                            movements={movements.data}
                            hasActiveFilters={hasActiveFilters}
                            onResetFilters={resetFilters}
                            onSelectMovement={setSelectedMovement}
                        />
                    </div>

                    <AppPagination
                        pagination={movements}
                        itemLabel="stock movements"
                    />
                </SectionCard>
            </PageContainer>

            <MovementDetailsDrawer
                movement={selectedMovement}
                onClose={() => setSelectedMovement(null)}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Compact movement ledger
|--------------------------------------------------------------------------
*/

function MovementLedgerTable({
    movements,
    hasActiveFilters,
    onResetFilters,
    onSelectMovement,
}: {
    movements: StockMovement[];
    hasActiveFilters: boolean;
    onResetFilters: () => void;
    onSelectMovement: (movement: StockMovement) => void;
}) {
    return (
        <div className="overflow-hidden bg-background/10">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse">
                    <thead className="border-b border-emerald-500/10 bg-emerald-500/[0.025]">
                        <tr>
                            <th className="min-w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                Movement
                            </th>
                            <th className="min-w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                Product
                            </th>
                            <th className="min-w-[210px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                Warehouse
                            </th>
                            <th className="min-w-[180px] px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                Quantity Flow
                            </th>
                            <th className="min-w-[190px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                Reference
                            </th>
                            <th className="w-[115px] px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border/60">
                        {movements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-14">
                                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                        <span className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.045] text-emerald-400">
                                            <Activity className="size-5" />
                                        </span>
                                        <h3 className="mt-3 text-sm font-semibold">
                                            {hasActiveFilters
                                                ? 'No matching movements'
                                                : 'No stock movements yet'}
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {hasActiveFilters
                                                ? 'Adjust or reset the active filters to review other inventory activity.'
                                                : 'Inventory transactions will appear here after receipts, withdrawals, adjustments, transfers, and returns.'}
                                        </p>

                                        {hasActiveFilters && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={onResetFilters}
                                                className="mt-4"
                                            >
                                                <RefreshCw className="size-4" />
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            movements.map((movement) => (
                                <tr
                                    key={movement.id}
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => onSelectMovement(movement)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' ||
                                            event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            onSelectMovement(movement);
                                        }
                                    }}
                                    className="group cursor-pointer bg-card/55 transition-colors hover:bg-emerald-500/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40"
                                >
                                    <td className="px-4 py-3.5">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span
                                                className={cn(
                                                    'mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                                                    movement.direction === 'in'
                                                        ? 'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-400'
                                                        : 'border-rose-500/15 bg-rose-500/[0.055] text-rose-400',
                                                )}
                                            >
                                                {movement.direction === 'in' ? (
                                                    <ArrowDownToLine className="size-4" />
                                                ) : (
                                                    <ArrowUpFromLine className="size-4" />
                                                )}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="max-w-[170px] truncate text-[11px] font-semibold">
                                                    {movement.movement_label}
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    {formatDate(movement.movement_date)} ·{' '}
                                                    {formatTime(movement.movement_date)}
                                                </p>
                                                <p className="mt-1 font-mono text-[8px] text-muted-foreground">
                                                    ID #{movement.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3.5">
                                        <p className="max-w-[190px] truncate text-[11px] font-semibold">
                                            {movement.product.name}
                                        </p>
                                        <p className="mt-1 max-w-[190px] truncate font-mono text-[9px] text-muted-foreground">
                                            {movement.product.sku ?? 'No SKU'}
                                            {movement.product.barcode
                                                ? ` · ${movement.product.barcode}`
                                                : ''}
                                        </p>
                                        <p className="mt-1 text-[8px] text-muted-foreground">
                                            Unit: {movement.product.unit}
                                        </p>
                                    </td>

                                    <td className="px-4 py-3.5">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <Warehouse className="size-3.5 shrink-0 text-emerald-400" />
                                            <div className="min-w-0">
                                                <p className="max-w-[165px] truncate text-[10px] font-semibold">
                                                    {movement.warehouse.name}
                                                </p>
                                                <p className="mt-1 max-w-[165px] truncate text-[8px] text-muted-foreground">
                                                    {movement.related_warehouse
                                                        ? `To ${movement.related_warehouse.name}`
                                                        : movement.warehouse.code ??
                                                          'Single warehouse'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3.5 text-right">
                                        <p
                                            className={cn(
                                                'text-[13px] font-semibold tabular-nums',
                                                movement.direction === 'in'
                                                    ? 'text-emerald-400'
                                                    : 'text-rose-400',
                                            )}
                                        >
                                            {movement.direction === 'in' ? '+' : '−'}
                                            {formatQuantity(movement.quantity)}{' '}
                                            <span className="text-[8px] font-medium text-muted-foreground">
                                                {movement.product.unit}
                                            </span>
                                        </p>
                                        <p className="mt-1 text-[8px] tabular-nums text-muted-foreground">
                                            {formatQuantity(movement.quantity_before)} →{' '}
                                            {formatQuantity(movement.quantity_after)}
                                        </p>
                                    </td>

                                    <td className="px-4 py-3.5">
                                        <p className="max-w-[165px] truncate text-[10px] font-semibold">
                                            {movement.reference_no ?? 'No reference'}
                                        </p>
                                        <p className="mt-1 max-w-[165px] truncate text-[8px] text-muted-foreground">
                                            {formatReferenceType(
                                                movement.reference_type,
                                            )}
                                        </p>
                                        <p className="mt-1 max-w-[165px] truncate text-[8px] text-muted-foreground">
                                            By {movement.created_by?.name ?? 'System'}
                                        </p>
                                    </td>

                                    <td className="px-4 py-3.5 text-right">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onSelectMovement(movement);
                                            }}
                                            className="h-8 rounded-lg border-emerald-500/15 bg-emerald-500/[0.035] px-2.5 text-[9px] text-emerald-400 hover:bg-emerald-500/[0.08] hover:text-emerald-300"
                                        >
                                            <Eye className="size-3.5" />
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MovementDetailsDrawer({
    movement,
    onClose,
}: {
    movement: StockMovement | null;
    onClose: () => void;
}) {
    if (!movement) {
        return null;
    }

    const incoming = movement.direction === 'in';
    const directionLabel = incoming ? 'Stock In' : 'Stock Out';

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close movement details"
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="movement-details-title"
                className="absolute inset-y-0 right-0 flex w-full max-w-[720px] flex-col overflow-hidden border-l border-emerald-500/15 bg-card shadow-[-24px_0_80px_-30px_rgba(0,0,0,0.85)] animate-in slide-in-from-right duration-300 sm:w-[92vw]"
            >
                <div
                    className={cn(
                        'absolute inset-x-0 top-0 h-0.5',
                        incoming ? 'bg-emerald-400' : 'bg-rose-400',
                    )}
                />

                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-emerald-500/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.05)_0%,rgba(16,185,129,0.015)_48%,transparent_100%)] px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-start gap-3.5">
                        <span
                            className={cn(
                                'flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-sm',
                                incoming
                                    ? 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400'
                                    : 'border-rose-500/20 bg-rose-500/[0.08] text-rose-400',
                            )}
                        >
                            {incoming ? (
                                <ArrowDownToLine className="size-5" />
                            ) : (
                                <ArrowUpFromLine className="size-5" />
                            )}
                        </span>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2
                                    id="movement-details-title"
                                    className="text-base font-semibold tracking-tight text-foreground sm:text-lg"
                                >
                                    Stock Movement
                                </h2>
                                <MovementTypeBadge movement={movement} />
                            </div>

                            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                                <span className="font-mono">Record #{movement.id}</span>
                                <span className="text-border">•</span>
                                <span>{formatDate(movement.movement_date)}</span>
                                <span className="text-border">•</span>
                                <span>{formatTime(movement.movement_date)}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/40 text-muted-foreground transition hover:border-border hover:bg-muted/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                        aria-label="Close movement details"
                    >
                        <X className="size-4" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <section className="border-b border-border/60 bg-muted/[0.025] px-4 py-4 sm:px-6 sm:py-5">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] md:items-stretch">
                            <div
                                className={cn(
                                    'relative overflow-hidden rounded-xl border p-4 sm:p-5',
                                    incoming
                                        ? 'border-emerald-500/20 bg-emerald-500/[0.045]'
                                        : 'border-rose-500/20 bg-rose-500/[0.045]',
                                )}
                            >
                                <div
                                    className={cn(
                                        'pointer-events-none absolute -right-10 -top-14 size-36 rounded-full blur-3xl',
                                        incoming
                                            ? 'bg-emerald-500/[0.09]'
                                            : 'bg-rose-500/[0.09]',
                                    )}
                                />

                                <div className="relative flex h-full flex-col justify-between gap-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Quantity movement
                                            </p>
                                            <p
                                                className={cn(
                                                    'mt-2 text-3xl font-semibold leading-none tracking-[-0.04em] tabular-nums sm:text-4xl',
                                                    incoming
                                                        ? 'text-emerald-400'
                                                        : 'text-rose-400',
                                                )}
                                            >
                                                {incoming ? '+' : '−'}
                                                {formatQuantity(movement.quantity)}
                                            </p>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'h-7 rounded-full px-2.5 text-[10px] font-semibold',
                                                incoming
                                                    ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400'
                                                    : 'border-rose-500/20 bg-rose-500/[0.06] text-rose-400',
                                            )}
                                        >
                                            {directionLabel}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {movement.product.name}
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {movement.movement_label} · {movement.product.unit}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border/70 bg-background/25">
                                <ModalStat
                                    label="Before"
                                    value={formatQuantity(movement.quantity_before)}
                                    helper="Opening balance"
                                    icon={Scale}
                                    className="border-b border-r border-border/60"
                                />
                                <ModalStat
                                    label="After"
                                    value={formatQuantity(movement.quantity_after)}
                                    helper="Resulting balance"
                                    icon={Boxes}
                                    valueClassName={
                                        incoming ? 'text-emerald-400' : 'text-rose-400'
                                    }
                                    className="border-b border-border/60"
                                />
                                <ModalStat
                                    label="Unit Cost"
                                    value={formatMoney(movement.unit_cost)}
                                    helper="Cost per unit"
                                    icon={CircleDollarSign}
                                    className="border-r border-border/60"
                                />
                                <ModalStat
                                    label="Total Value"
                                    value={formatMoney(movement.total_cost)}
                                    helper="Recorded movement value"
                                    icon={CircleDollarSign}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] xl:gap-6">
                        <div className="space-y-5">
                            <ModalSection
                                title="Movement Overview"
                                description="Core transaction and timing details."
                                icon={Activity}
                            >
                                <div className="divide-y divide-border/60">
                                    <ModalInfoRow
                                        label="Movement label"
                                        value={movement.movement_label}
                                    />
                                    <ModalInfoRow
                                        label="Movement type"
                                        value={movement.movement_type.replace(
                                            /[_-]+/g,
                                            ' ',
                                        )}
                                    />
                                    <ModalInfoRow
                                        label="Direction"
                                        value={directionLabel}
                                        valueClassName={
                                            incoming
                                                ? 'text-emerald-400'
                                                : 'text-rose-400'
                                        }
                                    />
                                    <ModalInfoRow
                                        label="Recorded at"
                                        value={`${formatDate(
                                            movement.movement_date,
                                        )}, ${formatTime(movement.movement_date)}`}
                                    />
                                </div>
                            </ModalSection>

                            <ModalSection
                                title="Product Information"
                                description="Product snapshot stored with this ledger record."
                                icon={Package2}
                            >
                                <div className="p-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        {movement.product.name}
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Product ID #{movement.product.id}
                                    </p>

                                    <div className="mt-4 grid gap-x-5 gap-y-4 border-t border-border/60 pt-4 sm:grid-cols-3">
                                        <ModalDataPoint
                                            label="SKU"
                                            value={movement.product.sku ?? '—'}
                                            mono
                                        />
                                        <ModalDataPoint
                                            label="Barcode"
                                            value={movement.product.barcode ?? '—'}
                                            mono
                                        />
                                        <ModalDataPoint
                                            label="Unit"
                                            value={movement.product.unit}
                                        />
                                    </div>
                                </div>
                            </ModalSection>

                            <ModalSection
                                title="Remarks"
                                description="Additional notes attached to the movement."
                                icon={FileText}
                            >
                                <div className="px-4 py-3.5">
                                    <p className="whitespace-pre-wrap text-xs leading-6 text-foreground/85">
                                        {movement.remarks ??
                                            'No remarks were recorded for this movement.'}
                                    </p>
                                </div>
                            </ModalSection>
                        </div>

                        <div className="space-y-5">
                            <ModalSection
                                title="Warehouse Route"
                                description="Storage location involved in this movement."
                                icon={Warehouse}
                            >
                                <div className="space-y-3 p-3">
                                    <ModalWarehouse
                                        label={
                                            movement.related_warehouse
                                                ? 'Primary warehouse'
                                                : 'Warehouse'
                                        }
                                        warehouse={movement.warehouse}
                                        tone="emerald"
                                    />

                                    {movement.related_warehouse && (
                                        <>
                                            <div className="flex items-center gap-2 px-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                <span className="h-px flex-1 bg-border/60" />
                                                <ArrowRightLeft className="size-3.5 text-teal-400" />
                                                Transfer route
                                                <span className="h-px flex-1 bg-border/60" />
                                            </div>

                                            <ModalWarehouse
                                                label="Related warehouse"
                                                warehouse={movement.related_warehouse}
                                                tone="teal"
                                            />
                                        </>
                                    )}
                                </div>
                            </ModalSection>

                            <ModalSection
                                title="Audit & Reference"
                                description="Source record and responsible user."
                                icon={Fingerprint}
                            >
                                <div className="divide-y divide-border/60">
                                    <ModalInfoRow
                                        label="Reference no."
                                        value={movement.reference_no ?? '—'}
                                        mono
                                    />
                                    <ModalInfoRow
                                        label="Reference ID"
                                        value={
                                            movement.reference_id
                                                ? `#${movement.reference_id}`
                                                : '—'
                                        }
                                    />
                                    <ModalInfoRow
                                        label="Reference type"
                                        value={formatReferenceType(
                                            movement.reference_type,
                                        )}
                                    />
                                    <ModalInfoRow
                                        label="Created by"
                                        value={movement.created_by?.name ?? 'System'}
                                    />
                                    <ModalInfoRow
                                        label="User email"
                                        value={
                                            movement.created_by?.email ??
                                            'Automated record'
                                        }
                                    />
                                </div>
                            </ModalSection>
                        </div>
                    </div>
                </div>

                <footer className="flex shrink-0 flex-col gap-3 border-t border-emerald-500/10 bg-emerald-500/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-emerald-400" />
                        Read-only inventory audit record
                    </div>

                    <Button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg bg-emerald-600 px-5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                        Close
                    </Button>
                </footer>
            </aside>
        </div>
    );
}

function ModalStat({
    label,
    value,
    helper,
    icon: Icon,
    valueClassName,
    className,
}: {
    label: string;
    value: string;
    helper: string;
    icon: LucideIcon;
    valueClassName?: string;
    className?: string;
}) {
    return (
        <div className={cn('min-w-0 p-3.5 sm:p-4', className)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {label}
                    </p>
                    <p
                        className={cn(
                            'mt-2 truncate text-sm font-semibold tabular-nums text-foreground sm:text-base',
                            valueClassName,
                        )}
                    >
                        {value}
                    </p>
                    <p className="mt-1 truncate text-[9px] text-muted-foreground">
                        {helper}
                    </p>
                </div>

                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                    <Icon className="size-3.5" />
                </span>
            </div>
        </div>
    );
}

function ModalSection({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section>
            <div className="mb-3 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/[0.045] text-emerald-400">
                    <Icon className="size-3.5" />
                </span>

                <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-foreground">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
                {children}
            </div>
        </section>
    );
}

function ModalInfoRow({
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
        <div className="grid min-w-0 gap-1 px-4 py-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-start sm:gap-4">
            <p className="text-[10px] font-medium text-muted-foreground">
                {label}
            </p>
            <p
                className={cn(
                    'min-w-0 break-words text-[11px] font-semibold text-foreground/90 sm:text-right',
                    mono && 'font-mono',
                    valueClassName,
                )}
            >
                {value}
            </p>
        </div>
    );
}

function ModalDataPoint({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </p>
            <p
                className={cn(
                    'mt-1.5 truncate text-[11px] font-semibold text-foreground/90',
                    mono && 'font-mono',
                )}
                title={value}
            >
                {value}
            </p>
        </div>
    );
}

function ModalWarehouse({
    label,
    warehouse,
    tone,
}: {
    label: string;
    warehouse: WarehouseInfo;
    tone: 'emerald' | 'teal';
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/25 p-3.5">
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                    tone === 'emerald'
                        ? 'border-emerald-500/15 bg-emerald-500/[0.05] text-emerald-400'
                        : 'border-teal-500/15 bg-teal-500/[0.05] text-teal-400',
                )}
            >
                <Warehouse className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-foreground">
                    {warehouse.name}
                </p>
                <p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">
                    {warehouse.code ?? 'No warehouse code'} · ID #{warehouse.id}
                </p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Control board
|--------------------------------------------------------------------------
*/

function MovementControlBoard({
    summary,
    incomingQuantity,
    outgoingQuantity,
    netQuantity,
    incomingPercentage,
    outgoingPercentage,
    averageMovementsPerProduct,
}: {
    summary: MovementSummary;
    incomingQuantity: number;
    outgoingQuantity: number;
    netQuantity: number;
    incomingPercentage: number;
    outgoingPercentage: number;
    averageMovementsPerProduct: number;
}) {
    const netIncoming = netQuantity >= 0;

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.035] via-card/70 to-card/40">
            <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400">
                        <Activity className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground">
                            Inventory Movement Control
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Read-only stock flow, warehouse routing, source references, and quantity balance.
                        </p>
                    </div>
                </div>

                <Badge
                    variant="outline"
                    className="h-6 w-fit rounded-full border-emerald-500/15 bg-emerald-500/[0.045] px-2.5 text-[9px] font-semibold text-emerald-400"
                >
                    <ShieldCheck className="mr-1 size-3" />
                    AUDIT LEDGER
                </Badge>
            </div>

            <div className="grid min-w-0 xl:grid-cols-[minmax(320px,1.15fr)_minmax(0,1.85fr)]">
                <div className="relative overflow-hidden border-b border-border/60 p-4 xl:border-b-0 xl:border-r md:p-5">
                    <div className="pointer-events-none absolute -left-16 -top-20 size-48 rounded-full bg-emerald-500/[0.055] blur-3xl" />

                    <div className="relative">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-emerald-300">
                            Net inventory quantity
                        </p>

                        <div className="mt-3 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'inline-flex size-11 shrink-0 items-center justify-center rounded-xl border',
                                        netIncoming
                                            ? 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400'
                                            : 'border-rose-500/20 bg-rose-500/[0.07] text-rose-400',
                                    )}
                                >
                                    {netIncoming ? (
                                        <ArrowDownToLine className="size-5" />
                                    ) : (
                                        <ArrowUpFromLine className="size-5" />
                                    )}
                                </span>

                                <div>
                                    <p
                                        className={cn(
                                            'text-[28px] font-semibold leading-none tracking-[-0.04em] tabular-nums',
                                            netIncoming
                                                ? 'text-emerald-400'
                                                : 'text-rose-400',
                                        )}
                                    >
                                        {netIncoming ? '+' : '−'}
                                        {formatQuantity(Math.abs(netQuantity))}
                                    </p>
                                    <p className="mt-1.5 text-[9px] text-muted-foreground">
                                        {netIncoming
                                            ? 'More stock entered than left'
                                            : 'More stock left than entered'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xl font-semibold tabular-nums text-emerald-400">
                                    {formatNumber(summary.total)}
                                </p>
                                <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                                    Records
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="flex items-center justify-between gap-3 text-[9px] font-medium">
                                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                    <span className="size-1.5 rounded-full bg-emerald-400" />
                                    {formatQuantity(incomingQuantity)} incoming
                                </span>

                                <span className="inline-flex items-center gap-1.5 text-rose-400">
                                    {formatQuantity(outgoingQuantity)} outgoing
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
                        </div>
                    </div>
                </div>

                <div className="grid min-w-0 sm:grid-cols-3">
                    <ControlSnapshot
                        label="Incoming Share"
                        value={`${incomingPercentage}%`}
                        helper={`${formatQuantity(incomingQuantity)} quantity`}
                        icon={ArrowDownToLine}
                        tone="emerald"
                        className="border-b border-border/60 sm:border-r"
                    />

                    <ControlSnapshot
                        label="Outgoing Share"
                        value={`${outgoingPercentage}%`}
                        helper={`${formatQuantity(outgoingQuantity)} quantity`}
                        icon={ArrowUpFromLine}
                        tone="rose"
                        className="border-b border-border/60 sm:border-r"
                    />

                    <ControlSnapshot
                        label="Affected Products"
                        value={formatNumber(summary.affected_products)}
                        helper={`${formatDecimal(averageMovementsPerProduct)} events/product`}
                        icon={Package2}
                        tone="teal"
                        className="border-b border-border/60"
                    />

                    <div className="p-4 sm:col-span-3">
                        <div className="grid gap-3 md:grid-cols-3">
                            <ControlDetail
                                icon={ArrowRightLeft}
                                label="Flow coverage"
                                value={`${incomingPercentage}% in / ${outgoingPercentage}% out`}
                            />
                            <ControlDetail
                                icon={Boxes}
                                label="Ledger coverage"
                                value={`${formatNumber(summary.total)} movement events`}
                            />
                            <ControlDetail
                                icon={Scale}
                                label="Average activity"
                                value={`${formatDecimal(averageMovementsPerProduct)} events per product`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/*
|--------------------------------------------------------------------------
| Presentation helpers
|--------------------------------------------------------------------------
*/


function ControlSnapshot({
    label,
    value,
    helper,
    icon: Icon,
    tone,
    className,
}: {
    label: string;
    value: string;
    helper: string;
    icon: LucideIcon;
    tone: 'emerald' | 'rose' | 'teal';
    className?: string;
}) {
    const toneClass = {
        emerald:
            'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-400',
        rose: 'border-rose-500/15 bg-rose-500/[0.055] text-rose-400',
        teal: 'border-teal-500/15 bg-teal-500/[0.055] text-teal-400',
    }[tone];

    return (
        <div className={cn('min-w-0 p-4', className)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-2 text-xl font-semibold leading-none tabular-nums">
                        {value}
                    </p>
                    <p className="mt-2 truncate text-[9px] text-muted-foreground">
                        {helper}
                    </p>
                </div>

                <span
                    className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border',
                        toneClass,
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>
        </div>
    );
}

function ControlDetail({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border/60 bg-background/30 px-3 py-2.5">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.055] text-emerald-400">
                <Icon className="size-4" />
            </span>

            <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 truncate text-[10px] font-semibold">
                    {value}
                </p>
            </div>
        </div>
    );
}

function MovementTypeBadge({ movement }: { movement: StockMovement }) {
    const normalized = movement.movement_type
        .toLowerCase()
        .replace(/[_\\-]+/g, ' ');

    const className = normalized.includes('transfer')
        ? 'border-teal-500/15 bg-teal-500/[0.045] text-teal-400'
        : normalized.includes('adjust')
          ? 'border-amber-500/15 bg-amber-500/[0.045] text-amber-400'
          : normalized.includes('return')
            ? 'border-blue-500/15 bg-blue-500/[0.045] text-blue-400'
            : normalized.includes('damage') || normalized.includes('expire')
              ? 'border-red-500/15 bg-red-500/[0.045] text-red-400'
              : movement.direction === 'in'
                ? 'border-emerald-500/15 bg-emerald-500/[0.045] text-emerald-400'
                : 'border-rose-500/15 bg-rose-500/[0.045] text-rose-400';

    return (
        <Badge
            variant="outline"
            className={cn(
                'h-5 max-w-[125px] truncate rounded-full px-2 text-[8px] font-semibold uppercase tracking-wide',
                className,
            )}
        >
            {movement.movement_type.replace(/[_-]+/g, ' ')}
        </Badge>
    );
}

/*
|--------------------------------------------------------------------------
| Formatters
|--------------------------------------------------------------------------
*/

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function formatQuantity(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(Number(value || 0));
}

function formatDecimal(value: number): string {
    return new Intl.NumberFormat('en-PH', {
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
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatReferenceType(value: string | null): string {
    if (!value) {
        return 'Direct inventory entry';
    }

    const name = value.split('\\').pop() ?? value;

    return name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ');
}