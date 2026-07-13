import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowRightLeft,
    ArrowUpFromLine,
    Boxes,
    CalendarDays,
    FileText,
    History,
    Package2,
    Search,
    UserRound,
    Warehouse,
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
| Breadcrumbs
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

/*
|--------------------------------------------------------------------------
| Stock Movement Page
|--------------------------------------------------------------------------
*/

export default function StockMovementIndex({
    movements,
    summary,
    warehouses,
    movement_types,
    filters,
}: StockMovementPageProps) {
    /*
    |--------------------------------------------------------------------------
    | Filter States
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [movementType, setMovementType] = useState(
        filters.movement_type ?? '',
    );

    const [direction, setDirection] = useState(
        filters.direction ?? '',
    );

    const [warehouseId, setWarehouseId] = useState(
        filters.warehouse_id ?? '',
    );

    const [dateFrom, setDateFrom] = useState(
        filters.date_from ?? '',
    );

    const [dateTo, setDateTo] = useState(
        filters.date_to ?? '',
    );

    /*
    |--------------------------------------------------------------------------
    | Apply Filters
    |--------------------------------------------------------------------------
    */

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/stock-movements',
            {
                search: search.trim() || undefined,

                movement_type:
                    movementType || undefined,

                direction:
                    direction || undefined,

                warehouse_id:
                    warehouseId || undefined,

                date_from:
                    dateFrom || undefined,

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

    /*
    |--------------------------------------------------------------------------
    | Reset Filters
    |--------------------------------------------------------------------------
    */

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
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Movements" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <section>
                    <p className="text-sm font-medium text-primary">
                        Inventory Audit Trail
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        Stock Movements
                    </h1>

                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                        Review every stock change recorded
                        across your warehouses. Movement records
                        are read-only to preserve inventory
                        history.
                    </p>
                </section>

                {/* Summary Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Movements"
                        value={formatNumber(
                            summary.total,
                        )}
                        icon={
                            <History className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Incoming Quantity"
                        value={formatQuantity(
                            summary.incoming_quantity,
                        )}
                        icon={
                            <ArrowDownToLine className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Outgoing Quantity"
                        value={formatQuantity(
                            summary.outgoing_quantity,
                        )}
                        icon={
                            <ArrowUpFromLine className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Affected Products"
                        value={formatNumber(
                            summary.affected_products,
                        )}
                        icon={
                            <Package2 className="size-5" />
                        }
                    />
                </section>

                {/* Main Table Card */}
                <section className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    {/* Search and Filters */}
                    <form
                        onSubmit={applyFilters}
                        className="space-y-3 border-b p-4"
                    >
                        <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_180px_210px_210px]">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search product, SKU, warehouse, reference, or remarks..."
                                    className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>

                            {/* Direction Filter */}
                            <select
                                value={direction}
                                onChange={(event) =>
                                    setDirection(
                                        event.target.value,
                                    )
                                }
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="">
                                    All directions
                                </option>

                                <option value="in">
                                    Stock In
                                </option>

                                <option value="out">
                                    Stock Out
                                </option>
                            </select>

                            {/* Movement Type Filter */}
                            <select
                                value={movementType}
                                onChange={(event) =>
                                    setMovementType(
                                        event.target.value,
                                    )
                                }
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="">
                                    All movement types
                                </option>

                                {movement_types.map(
                                    (movementTypeOption) => (
                                        <option
                                            key={
                                                movementTypeOption.value
                                            }
                                            value={
                                                movementTypeOption.value
                                            }
                                        >
                                            {
                                                movementTypeOption.label
                                            }
                                        </option>
                                    ),
                                )}
                            </select>

                            {/* Warehouse Filter */}
                            <select
                                value={warehouseId}
                                onChange={(event) =>
                                    setWarehouseId(
                                        event.target.value,
                                    )
                                }
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="">
                                    All warehouses
                                </option>

                                {warehouses.map(
                                    (warehouse) => (
                                        <option
                                            key={warehouse.id}
                                            value={warehouse.id}
                                        >
                                            {warehouse.name}

                                            {warehouse.code
                                                ? ` (${warehouse.code})`
                                                : ''}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        {/* Dates and Buttons */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {/* Date From */}
                                <label className="relative">
                                    <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(event) =>
                                            setDateFrom(
                                                event.target
                                                    .value,
                                            )
                                        }
                                        aria-label="Date from"
                                        className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </label>

                                {/* Date To */}
                                <label className="relative">
                                    <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(event) =>
                                            setDateTo(
                                                event.target
                                                    .value,
                                            )
                                        }
                                        aria-label="Date to"
                                        className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </label>
                            </div>

                            <div className="flex gap-3">
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
                            </div>
                        </div>
                    </form>

                    {/* Movement Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1450px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Date
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Product
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Warehouse
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Movement
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Quantity
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Before
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        After
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Reference
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Performed By
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {movements.data.map(
                                    (movement) => (
                                        <tr
                                            key={movement.id}
                                            className="transition hover:bg-muted/30"
                                        >
                                            {/* Date */}
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <p className="text-sm font-medium">
                                                    {formatDate(
                                                        movement.movement_date,
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatTime(
                                                        movement.movement_date,
                                                    )}
                                                </p>
                                            </td>

                                            {/* Product */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Package2 className="size-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="max-w-[220px] truncate font-medium">
                                                            {
                                                                movement
                                                                    .product
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            SKU:{' '}

                                                            {movement
                                                                .product
                                                                .sku ??
                                                                '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Warehouse */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-2">
                                                    <Warehouse className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                movement
                                                                    .warehouse
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {movement
                                                                .warehouse
                                                                .code ??
                                                                'No code'}
                                                        </p>

                                                        {movement.related_warehouse && (
                                                            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                                <ArrowRightLeft className="size-3" />

                                                                {
                                                                    movement
                                                                        .related_warehouse
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Movement Type */}
                                            <td className="px-5 py-4">
                                                <MovementBadge
                                                    movement={
                                                        movement
                                                    }
                                                />
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-5 py-4 text-right">
                                                <p
                                                    className={[
                                                        'font-semibold',
                                                        movement.direction ===
                                                        'in'
                                                            ? 'text-emerald-600'
                                                            : 'text-rose-600',
                                                    ].join(
                                                        ' ',
                                                    )}
                                                >
                                                    {movement.direction ===
                                                    'in'
                                                        ? '+'
                                                        : '-'}

                                                    {formatQuantity(
                                                        movement.quantity,
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {
                                                        movement
                                                            .product
                                                            .unit
                                                    }
                                                </p>
                                            </td>

                                            {/* Before */}
                                            <td className="px-5 py-4 text-right font-medium">
                                                {formatQuantity(
                                                    movement.quantity_before,
                                                )}
                                            </td>

                                            {/* After */}
                                            <td className="px-5 py-4 text-right font-semibold">
                                                {formatQuantity(
                                                    movement.quantity_after,
                                                )}
                                            </td>

                                            {/* Reference */}
                                            <td className="px-5 py-4">
                                                {movement.reference_no ? (
                                                    <div className="flex max-w-[190px] items-start gap-2">
                                                        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium">
                                                                {
                                                                    movement.reference_no
                                                                }
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                {formatReferenceType(
                                                                    movement.reference_type,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Performed By */}
                                            <td className="px-5 py-4">
                                                <div className="flex max-w-[190px] items-start gap-2">
                                                    <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {movement
                                                                .created_by
                                                                ?.name ??
                                                                'System'}
                                                        </p>

                                                        {movement
                                                            .created_by
                                                            ?.email && (
                                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                {
                                                                    movement
                                                                        .created_by
                                                                        .email
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Remarks */}
                                            <td className="px-5 py-4">
                                                <p
                                                    title={
                                                        movement.remarks ??
                                                        undefined
                                                    }
                                                    className="max-w-[260px] truncate text-sm text-muted-foreground"
                                                >
                                                    {movement.remarks ??
                                                        '—'}
                                                </p>
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {/* Empty State */}
                                {movements.data.length ===
                                    0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="px-5 py-16 text-center"
                                        >
                                            <Boxes className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No stock movements
                                                found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Stock changes will
                                                appear here after a
                                                stock-in,
                                                adjustment, transfer,
                                                sale, return, damage,
                                                or expiration entry.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <MovementPagination
                        movements={movements}
                    />
                </section>
            </div>
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
    value: string;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
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
| Movement Badge
|--------------------------------------------------------------------------
*/

function MovementBadge({
    movement,
}: {
    movement: StockMovement;
}) {
    const incoming =
        movement.direction === 'in';

    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                incoming
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-rose-500/10 text-rose-600',
            ].join(' ')}
        >
            {incoming ? (
                <ArrowDownToLine className="size-3.5" />
            ) : (
                <ArrowUpFromLine className="size-3.5" />
            )}

            {movement.movement_label}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

function MovementPagination({
    movements,
}: {
    movements: PaginatedMovements;
}) {
    if (movements.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {movements.from ?? 0} to{' '}
                {movements.to ?? 0} of{' '}
                {movements.total} movements
            </p>

            <div className="flex flex-wrap gap-1">
                {movements.links.map(
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
| Formatters
|--------------------------------------------------------------------------
*/

function formatNumber(
    value: number,
): string {
    return new Intl.NumberFormat().format(
        Number(value || 0),
    );
}

function formatQuantity(
    value: number,
): string {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(Number(value || 0));
}

function formatDate(
    value: string,
): string {
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

function formatTime(
    value: string,
): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatReferenceType(
    value: string | null,
): string {
    if (!value) {
        return 'Reference';
    }

    const name =
        value.split('\\').pop() ?? value;

    return name
        .replace(
            /([a-z])([A-Z])/g,
            '$1 $2',
        )
        .replace(/_/g, ' ');
}