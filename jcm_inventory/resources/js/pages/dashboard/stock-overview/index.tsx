import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Boxes,
    CheckCircle2,
    Clock3,
    Layers3,
    PackageSearch,
    TrendingUp,
    Warehouse,
    type LucideIcon,
} from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

type StockOverviewProps = {
    context: {
        scopeLabel: string;
        activeProducts: number;
        trackedProducts: number;
        activeWarehouses: number;
    };
    summary: {
        positions: number;
        totalQuantity: number;
        inventoryValue: number;
        healthy: number;
        lowStock: number;
        outOfStock: number;
        dormant: number;
        productsWithStock: number;
        coveragePercentage: number;
    };
    stockHealth: {
        healthy: number;
        lowStock: number;
        outOfStock: number;
        total: number;
    };
    warehouseDistribution: WarehouseSummary[];
    categoryDistribution: CategorySummary[];
    movementActivity: MovementPoint[];
    topValuePositions: ValuePosition[];
    lowStockAlerts: LowStockAlert[];
    dormantStock: DormantPosition[];
};

type WarehouseSummary = {
    id: number;
    name: string;
    code: string;
    branch: string;
    isMain: boolean;
    positions: number;
    quantity: number;
    value: number;
    healthy: number;
    lowStock: number;
    outOfStock: number;
};

type CategorySummary = {
    label: string;
    value: number;
    quantity: number;
    positions: number;
    percentage: number;
};

type MovementPoint = {
    label: string;
    stockIn: number;
    stockOut: number;
};

type ValuePosition = {
    id: number;
    product: string;
    sku: string | null;
    warehouse: string;
    branch: string;
    quantity: number;
    averageCost: number;
    value: number;
};

type LowStockAlert = {
    id: number;
    product: string;
    sku: string | null;
    warehouse: string;
    branch: string;
    quantity: number;
    reorderLevel: number;
    severity: 'low' | 'critical';
};

type DormantPosition = {
    id: number;
    product: string;
    sku: string | null;
    warehouse: string;
    quantity: number;
    value: number;
    lastMovementAt: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Stock Overview',
        href: '/inventory/overview',
    },
];

const categoryColors = [
    'rgb(52 211 153)',
    'rgb(96 165 250)',
    'rgb(167 139 250)',
    'rgb(251 191 36)',
    'rgb(34 211 238)',
    'rgb(248 113 113)',
];

const categoryDots = [
    'bg-emerald-400',
    'bg-blue-400',
    'bg-violet-400',
    'bg-amber-400',
    'bg-cyan-400',
    'bg-red-400',
];

export default function StockOverviewIndex({
    context,
    summary,
    stockHealth,
    warehouseDistribution,
    categoryDistribution,
    movementActivity,
    topValuePositions,
    lowStockAlerts,
    dormantStock,
}: StockOverviewProps) {
    const maxMovement = useMemo(() => {
        return Math.max(
            ...movementActivity.flatMap((point) => [
                point.stockIn,
                point.stockOut,
            ]),
            1,
        );
    }, [movementActivity]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Overview" />

            <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 md:gap-4 md:p-4">
                <OverviewHeader
                    context={context}
                    summary={summary}
                />

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Inventory Value"
                        value={formatCurrency(
                            summary.inventoryValue,
                        )}
                        description="Current cost valuation"
                        icon={TrendingUp}
                        tone="emerald"
                        footnote={`${formatNumber(
                            summary.positions,
                        )} positions`}
                    />

                    <MetricCard
                        label="Available Quantity"
                        value={formatQuantity(
                            summary.totalQuantity,
                        )}
                        description="Units across all warehouses"
                        icon={Boxes}
                        tone="blue"
                        footnote={`${formatNumber(
                            summary.productsWithStock,
                        )} products`}
                    />

                    <MetricCard
                        label="Stock Alerts"
                        value={formatNumber(
                            summary.lowStock +
                                summary.outOfStock,
                        )}
                        description="Low and unavailable stock"
                        icon={AlertTriangle}
                        tone="amber"
                        footnote={`${formatNumber(
                            summary.outOfStock,
                        )} out of stock`}
                    />

                    <MetricCard
                        label="Dormant Positions"
                        value={formatNumber(
                            summary.dormant,
                        )}
                        description="No movement in 30 days"
                        icon={Clock3}
                        tone="violet"
                        footnote="Review slow stock"
                    />
                </section>

                <section className="grid min-w-0 gap-3 xl:grid-cols-[330px_minmax(0,1fr)]">
                    <Panel
                        title="Stock Health"
                        description="Availability status across tracked warehouse positions."
                        icon={Activity}
                        badge={`${formatNumber(
                            stockHealth.total,
                        )} positions`}
                    >
                        <StockHealthDonut
                            health={stockHealth}
                        />
                    </Panel>

                    <Panel
                        title="30-Day Stock Movement"
                        description="Weekly stock-in and stock-out volume."
                        icon={BarChart3}
                        badge={`${formatQuantity(
                            movementActivity.reduce(
                                (sum, point) =>
                                    sum +
                                    point.stockIn +
                                    point.stockOut,
                                0,
                            ),
                        )} units`}
                    >
                        <MovementChart
                            points={movementActivity}
                            maxValue={maxMovement}
                        />
                    </Panel>
                </section>

                <section className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                    <Panel
                        title="Warehouse Distribution"
                        description="Value, quantity, and stock health by warehouse."
                        icon={Warehouse}
                        badge={`${formatNumber(
                            warehouseDistribution.length,
                        )} warehouses`}
                    >
                        <WarehouseList
                            warehouses={
                                warehouseDistribution
                            }
                        />
                    </Panel>

                    <Panel
                        title="Inventory by Category"
                        description="Share of current inventory value."
                        icon={Layers3}
                        badge={`${formatNumber(
                            categoryDistribution.length,
                        )} groups`}
                    >
                        <CategoryDonut
                            categories={
                                categoryDistribution
                            }
                        />
                    </Panel>
                </section>

                <section className="grid min-w-0 gap-3 xl:grid-cols-2">
                    <DashboardPanel
                        title="Highest Inventory Value"
                        description="Warehouse positions carrying the most stock value."
                        icon={TrendingUp}
                        href="/inventory/stocks"
                        actionLabel="Open Stock Management"
                    >
                        {topValuePositions.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {topValuePositions.map(
                                    (position) => (
                                        <ValuePositionRow
                                            key={position.id}
                                            position={position}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={PackageSearch}
                                title="No stock value yet"
                                description="Inventory valuation appears after tracked stock is added to a warehouse."
                            />
                        )}
                    </DashboardPanel>

                    <DashboardPanel
                        title="Low Stock Priorities"
                        description="Positions at or below their configured reorder level."
                        icon={AlertTriangle}
                        href="/inventory/stocks"
                        actionLabel="Review Stock"
                    >
                        {lowStockAlerts.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {lowStockAlerts.map(
                                    (alert) => (
                                        <LowStockRow
                                            key={alert.id}
                                            alert={alert}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={CheckCircle2}
                                title="No stock alerts"
                                description="All tracked positions are currently above their reorder level."
                            />
                        )}
                    </DashboardPanel>
                </section>

                <DashboardPanel
                    title="Dormant Inventory"
                    description="Available stock with no recorded movement during the last 30 days."
                    icon={Clock3}
                    href="/stock-movements"
                    actionLabel="View Movements"
                >
                    {dormantStock.length > 0 ? (
                        <div className="grid divide-y divide-border/50 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                            <div className="divide-y divide-border/50">
                                {dormantStock
                                    .slice(0, 3)
                                    .map((position) => (
                                        <DormantRow
                                            key={position.id}
                                            position={position}
                                        />
                                    ))}
                            </div>

                            <div className="divide-y divide-border/50">
                                {dormantStock
                                    .slice(3, 6)
                                    .map((position) => (
                                        <DormantRow
                                            key={position.id}
                                            position={position}
                                        />
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <EmptyState
                            icon={CheckCircle2}
                            title="Inventory is moving"
                            description="No available stock position is currently classified as dormant."
                        />
                    )}
                </DashboardPanel>
            </main>
        </AppLayout>
    );
}

function OverviewHeader({
    context,
    summary,
}: {
    context: StockOverviewProps['context'];
    summary: StockOverviewProps['summary'];
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/75 shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(16,185,129,0.09),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(34,211,238,0.07),transparent_26%)]" />

            <div className="relative flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                        <Boxes className="size-5" />

                        <span className="absolute -right-1 -top-1 size-2 rounded-full border-2 border-card bg-emerald-400" />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-base font-semibold tracking-tight">
                                Stock Overview
                            </h1>

                            <span className="inline-flex h-5 items-center rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                                Inventory Intelligence
                            </span>
                        </div>

                        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">
                            Review inventory health, valuation,
                            warehouse allocation, movement, and
                            replenishment priorities for{' '}
                            {context.scopeLabel}.
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <HeaderPill
                                icon={Boxes}
                                label={`${context.trackedProducts} tracked products`}
                            />

                            <HeaderPill
                                icon={Warehouse}
                                label={`${context.activeWarehouses} active warehouses`}
                            />

                            <HeaderPill
                                icon={CheckCircle2}
                                label={`${summary.coveragePercentage.toFixed(
                                    1,
                                )}% stock coverage`}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/stock-movements"
                        prefetch
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 bg-background/45 px-3 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <BarChart3 className="size-3.5" />
                        Stock Movements
                    </Link>

                    <Link
                        href="/inventory/stocks"
                        prefetch
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-500 px-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-emerald-500/90"
                    >
                        <Boxes className="size-3.5" />
                        Manage Stock
                    </Link>
                </div>
            </div>
        </section>
    );
}

function HeaderPill({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/35 px-2 py-1 text-[9px] text-muted-foreground">
            <Icon className="size-3" />
            {label}
        </span>
    );
}

function MetricCard({
    label,
    value,
    description,
    icon: Icon,
    tone,
    footnote,
}: {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    tone: 'emerald' | 'blue' | 'amber' | 'violet';
    footnote: string;
}) {
    const styles = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
        },
    }[tone];

    return (
        <article className="rounded-2xl border border-border/60 bg-card/70 p-3.5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {label}
                    </p>

                    <p
                        className={[
                            'mt-2 truncate text-2xl font-semibold leading-none tabular-nums',
                            styles.value,
                        ].join(' ')}
                    >
                        {value}
                    </p>
                </div>

                <span
                    className={[
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                        styles.icon,
                    ].join(' ')}
                >
                    <Icon className="size-4" />
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-[10px] text-muted-foreground">
                    {description}
                </p>

                <span className="shrink-0 rounded-full border border-border/60 bg-background/40 px-2 py-1 text-[8px] font-medium text-muted-foreground">
                    {footnote}
                </span>
            </div>
        </article>
    );
}

function Panel({
    title,
    description,
    icon: Icon,
    badge,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    badge: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-muted-foreground">
                        <Icon className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                <span className="inline-flex h-6 shrink-0 items-center rounded-full border border-border/60 bg-background/40 px-2.5 text-[9px] font-medium text-muted-foreground">
                    {badge}
                </span>
            </div>

            <div className="p-4">{children}</div>
        </section>
    );
}

function StockHealthDonut({
    health,
}: {
    health: StockOverviewProps['stockHealth'];
}) {
    const total = Math.max(health.total, 1);
    const healthy = (health.healthy / total) * 100;
    const low = (health.lowStock / total) * 100;
    const out = (health.outOfStock / total) * 100;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const healthyLength =
        (healthy / 100) * circumference;
    const lowLength = (low / 100) * circumference;
    const outLength = (out / 100) * circumference;

    return (
        <div className="grid items-center gap-4 sm:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-1">
            <div className="relative mx-auto size-[145px]">
                <svg
                    viewBox="0 0 140 140"
                    className="size-full -rotate-90"
                    aria-label="Stock health donut chart"
                >
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="13"
                        className="text-muted/70"
                    />

                    {health.total > 0 && (
                        <>
                            <circle
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="13"
                                strokeLinecap="round"
                                strokeDasharray={`${healthyLength} ${
                                    circumference -
                                    healthyLength
                                }`}
                                className="text-emerald-400"
                            />

                            <circle
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="13"
                                strokeLinecap="round"
                                strokeDasharray={`${lowLength} ${
                                    circumference -
                                    lowLength
                                }`}
                                strokeDashoffset={
                                    -healthyLength
                                }
                                className="text-amber-400"
                            />

                            <circle
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="13"
                                strokeLinecap="round"
                                strokeDasharray={`${outLength} ${
                                    circumference -
                                    outLength
                                }`}
                                strokeDashoffset={
                                    -(
                                        healthyLength +
                                        lowLength
                                    )
                                }
                                className="text-red-400"
                            />
                        </>
                    )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-semibold tabular-nums">
                        {health.total > 0
                            ? `${Math.round(healthy)}%`
                            : '0%'}
                    </p>

                    <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                        Healthy
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <LegendRow
                    label="Healthy"
                    value={health.healthy}
                    dotClassName="bg-emerald-400"
                />

                <LegendRow
                    label="Low Stock"
                    value={health.lowStock}
                    dotClassName="bg-amber-400"
                />

                <LegendRow
                    label="Out of Stock"
                    value={health.outOfStock}
                    dotClassName="bg-red-400"
                />
            </div>
        </div>
    );
}

function LegendRow({
    label,
    value,
    dotClassName,
}: {
    label: string;
    value: number;
    dotClassName: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/35 px-3 py-2">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium">
                <span
                    className={[
                        'size-2.5 rounded-full',
                        dotClassName,
                    ].join(' ')}
                />
                {label}
            </span>

            <span className="text-xs font-semibold tabular-nums">
                {formatNumber(value)}
            </span>
        </div>
    );
}

function MovementChart({
    points,
    maxValue,
}: {
    points: MovementPoint[];
    maxValue: number;
}) {
    return (
        <div>
            <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    Stock In
                </span>

                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-400" />
                    Stock Out
                </span>
            </div>

            <div className="mt-4 flex h-[175px] items-end gap-3">
                {points.map((point) => (
                    <div
                        key={point.label}
                        className="flex min-w-0 flex-1 flex-col justify-end"
                    >
                        <div className="flex h-[140px] items-end justify-center gap-1.5 rounded-lg bg-background/25 px-2">
                            <MovementBar
                                value={point.stockIn}
                                maxValue={maxValue}
                                className="bg-emerald-400/85"
                                label={`Stock in ${formatQuantity(
                                    point.stockIn,
                                )}`}
                            />

                            <MovementBar
                                value={point.stockOut}
                                maxValue={maxValue}
                                className="bg-blue-400/80"
                                label={`Stock out ${formatQuantity(
                                    point.stockOut,
                                )}`}
                            />
                        </div>

                        <p className="mt-2 truncate text-center text-[8px] text-muted-foreground">
                            {point.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MovementBar({
    value,
    maxValue,
    className,
    label,
}: {
    value: number;
    maxValue: number;
    className: string;
    label: string;
}) {
    const height =
        value <= 0
            ? 0
            : Math.max((value / maxValue) * 100, 4);

    return (
        <div
            title={label}
            className={[
                'w-full max-w-7 rounded-t-md transition-all duration-500',
                className,
            ].join(' ')}
            style={{
                height: `${height}%`,
            }}
        />
    );
}

function WarehouseList({
    warehouses,
}: {
    warehouses: WarehouseSummary[];
}) {
    if (warehouses.length === 0) {
        return (
            <EmptyState
                icon={Warehouse}
                title="No warehouses available"
                description="Create an active warehouse before adding tracked stock."
            />
        );
    }

    const maxValue = Math.max(
        ...warehouses.map(
            (warehouse) => warehouse.value,
        ),
        1,
    );

    return (
        <div className="space-y-2">
            {warehouses.map((warehouse) => (
                <div
                    key={warehouse.id}
                    className="grid gap-3 rounded-xl border border-border/50 bg-background/35 p-3 lg:grid-cols-[minmax(190px,0.8fr)_minmax(0,1fr)_190px]"
                >
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/15 bg-cyan-500/10 text-cyan-400">
                            <Warehouse className="size-3.5" />
                        </span>

                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="truncate text-[11px] font-semibold">
                                    {warehouse.name}
                                </p>

                                {warehouse.isMain && (
                                    <span className="rounded-full border border-cyan-500/15 bg-cyan-500/[0.06] px-1.5 py-0.5 text-[7px] font-semibold text-cyan-300">
                                        MAIN
                                    </span>
                                )}
                            </div>

                            <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
                                {warehouse.branch} ·{' '}
                                {warehouse.code}
                            </p>
                        </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 text-[8px] text-muted-foreground">
                                <span>
                                    Inventory value
                                </span>

                                <span className="font-medium text-foreground">
                                    {formatCurrency(
                                        warehouse.value,
                                    )}
                                </span>
                            </div>

                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-cyan-400"
                                    style={{
                                        width: `${
                                            (warehouse.value /
                                                maxValue) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <span className="w-16 text-right text-[9px] font-medium text-muted-foreground">
                            {formatQuantity(
                                warehouse.quantity,
                            )}{' '}
                            units
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        <MiniCount
                            label="Healthy"
                            value={warehouse.healthy}
                            tone="emerald"
                        />

                        <MiniCount
                            label="Low"
                            value={warehouse.lowStock}
                            tone="amber"
                        />

                        <MiniCount
                            label="Out"
                            value={warehouse.outOfStock}
                            tone="red"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function MiniCount({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'emerald' | 'amber' | 'red';
}) {
    const valueClass = {
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
    }[tone];

    return (
        <div className="rounded-lg border border-border/50 bg-card px-2 py-1.5 text-center">
            <p className="text-[7px] uppercase tracking-wider text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    'mt-0.5 text-[10px] font-semibold tabular-nums',
                    valueClass,
                ].join(' ')}
            >
                {value}
            </p>
        </div>
    );
}

function CategoryDonut({
    categories,
}: {
    categories: CategorySummary[];
}) {
    if (categories.length === 0) {
        return (
            <EmptyState
                icon={Layers3}
                title="No category value yet"
                description="Category distribution appears after tracked products receive stock."
            />
        );
    }

    const stops: string[] = [];
    let current = 0;

    categories.forEach((category, index) => {
        const next =
            index === categories.length - 1
                ? 100
                : current + category.percentage;

        stops.push(
            `${categoryColors[
                index % categoryColors.length
            ]} ${current}% ${next}%`,
        );

        current = next;
    });

    return (
        <div className="grid items-center gap-4 sm:grid-cols-[145px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[145px_minmax(0,1fr)]">
            <div className="relative mx-auto size-[140px]">
                <div
                    className="size-full rounded-full"
                    style={{
                        background: `conic-gradient(${stops.join(
                            ', ',
                        )})`,
                    }}
                />

                <div className="absolute inset-[27%] flex items-center justify-center rounded-full border border-border/60 bg-card">
                    <div className="text-center">
                        <p className="text-sm font-semibold">
                            {formatNumber(
                                categories.reduce(
                                    (sum, category) =>
                                        sum +
                                        category.positions,
                                    0,
                                ),
                            )}
                        </p>

                        <p className="mt-1 text-[7px] uppercase tracking-wider text-muted-foreground">
                            Positions
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                {categories.map(
                    (category, index) => (
                        <div
                            key={category.label}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/35 px-2.5 py-2"
                        >
                            <span className="inline-flex min-w-0 items-center gap-2">
                                <span
                                    className={[
                                        'size-2 shrink-0 rounded-full',
                                        categoryDots[
                                            index %
                                                categoryDots.length
                                        ],
                                    ].join(' ')}
                                />

                                <span className="truncate text-[9px] font-medium">
                                    {category.label}
                                </span>
                            </span>

                            <span className="text-[9px] font-semibold tabular-nums">
                                {category.percentage.toFixed(
                                    1,
                                )}
                                %
                            </span>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

function DashboardPanel({
    title,
    description,
    icon: Icon,
    href,
    actionLabel,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    actionLabel: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-muted-foreground">
                        <Icon className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                <Link
                    href={href}
                    prefetch
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/40 px-2.5 text-[9px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                    {actionLabel}
                    <ArrowRight className="size-3" />
                </Link>
            </div>

            {children}
        </section>
    );
}

function ValuePositionRow({
    position,
}: {
    position: ValuePosition;
}) {
    return (
        <article className="flex items-center gap-3 px-4 py-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold">
                    {position.product}
                </p>

                <p className="mt-1 truncate text-[9px] text-muted-foreground">
                    {position.sku ?? 'No SKU'} ·{' '}
                    {position.warehouse}
                </p>
            </div>

            <div className="hidden min-w-[105px] text-right sm:block">
                <p className="text-[10px] font-medium">
                    {formatQuantity(
                        position.quantity,
                    )}{' '}
                    units
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                    @{' '}
                    {formatCurrency(
                        position.averageCost,
                    )}
                </p>
            </div>

            <p className="min-w-[90px] text-right text-[11px] font-semibold tabular-nums text-emerald-400">
                {formatCurrency(position.value)}
            </p>
        </article>
    );
}

function LowStockRow({
    alert,
}: {
    alert: LowStockAlert;
}) {
    const critical =
        alert.severity === 'critical';

    return (
        <article className="flex items-center gap-3 px-4 py-3">
            <span
                className={[
                    'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                    critical
                        ? 'border-red-500/15 bg-red-500/10 text-red-400'
                        : 'border-amber-500/15 bg-amber-500/10 text-amber-400',
                ].join(' ')}
            >
                <AlertTriangle className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-[11px] font-semibold">
                        {alert.product}
                    </p>

                    <span
                        className={[
                            'rounded-full px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wider',
                            critical
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-amber-500/10 text-amber-400',
                        ].join(' ')}
                    >
                        {critical
                            ? 'Critical'
                            : 'Low'}
                    </span>
                </div>

                <p className="mt-1 truncate text-[9px] text-muted-foreground">
                    {alert.sku ?? 'No SKU'} ·{' '}
                    {alert.warehouse}
                </p>
            </div>

            <div className="shrink-0 text-right">
                <p
                    className={[
                        'text-sm font-semibold tabular-nums',
                        critical
                            ? 'text-red-400'
                            : 'text-amber-400',
                    ].join(' ')}
                >
                    {formatQuantity(alert.quantity)}
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                    Reorder{' '}
                    {formatQuantity(
                        alert.reorderLevel,
                    )}
                </p>
            </div>
        </article>
    );
}

function DormantRow({
    position,
}: {
    position: DormantPosition;
}) {
    return (
        <article className="flex items-center gap-3 px-4 py-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-violet-400">
                <Clock3 className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold">
                    {position.product}
                </p>

                <p className="mt-1 truncate text-[9px] text-muted-foreground">
                    {position.sku ?? 'No SKU'} ·{' '}
                    {position.warehouse}
                </p>
            </div>

            <div className="shrink-0 text-right">
                <p className="text-[10px] font-medium">
                    {formatQuantity(position.quantity)}{' '}
                    units
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                    {position.lastMovementAt
                        ? formatDate(
                              position.lastMovementAt,
                          )
                        : 'Never moved'}
                </p>
            </div>
        </article>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[145px] flex-col items-center justify-center px-6 py-8 text-center">
            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-muted-foreground">
                <Icon className="size-4.5" />
            </span>

            <p className="mt-3 text-sm font-semibold">
                {title}
            </p>

            <p className="mt-1 max-w-sm text-[10px] leading-5 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 0,
    }).format(value);
}

function formatQuantity(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(value);
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