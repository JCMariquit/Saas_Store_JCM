import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Boxes,
    Building2,
    CheckCircle2,
    Clock3,
    Database,
    Layers3,
    PackagePlus,
    PackageSearch,
    Sparkles,
    TrendingUp,
    Warehouse,
    type LucideIcon,
} from 'lucide-react';
import {
    type ReactNode,
    useId,
    useMemo,
} from 'react';

type StatusTone =
    | 'neutral'
    | 'emerald'
    | 'cyan'
    | 'amber'
    | 'red'
    | 'violet';

type AccentTone =
    | 'emerald'
    | 'cyan'
    | 'amber'
    | 'violet';

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

type Point = {
    x: number;
    y: number;
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
    'rgb(34 211 238)',
    'rgb(96 165 250)',
    'rgb(167 139 250)',
    'rgb(251 191 36)',
    'rgb(248 113 113)',
];

const categoryDots = [
    'bg-emerald-400',
    'bg-cyan-400',
    'bg-blue-400',
    'bg-violet-400',
    'bg-amber-400',
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
    const movementTotals = useMemo(
        () =>
            movementActivity.reduce(
                (totals, point) => ({
                    stockIn:
                        totals.stockIn + point.stockIn,
                    stockOut:
                        totals.stockOut + point.stockOut,
                }),
                {
                    stockIn: 0,
                    stockOut: 0,
                },
            ),
        [movementActivity],
    );

    const hasMovementData =
        movementTotals.stockIn > 0 ||
        movementTotals.stockOut > 0;

    const hasStockData =
        summary.positions > 0 ||
        summary.inventoryValue > 0 ||
        summary.totalQuantity > 0 ||
        warehouseDistribution.some(
            (warehouse) =>
                warehouse.positions > 0 ||
                warehouse.quantity > 0,
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Overview" />

            <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 md:gap-4 md:p-4">
                <OverviewHeader
                    context={context}
                    summary={summary}
                    hasStockData={hasStockData}
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
                        statusLabel={
                            summary.positions > 0
                                ? `${formatNumber(
                                      summary.positions,
                                  )} positions`
                                : 'Valuation ready'
                        }
                        statusTone={
                            summary.positions > 0
                                ? 'emerald'
                                : 'neutral'
                        }
                        sparkValues={
                            topValuePositions.length > 0
                                ? topValuePositions.map(
                                      (position) =>
                                          position.value,
                                  )
                                : warehouseDistribution.map(
                                      (warehouse) =>
                                          warehouse.value,
                                  )
                        }
                    />

                    <MetricCard
                        label="Available Quantity"
                        value={formatQuantity(
                            summary.totalQuantity,
                        )}
                        description="Units across all warehouses"
                        icon={Boxes}
                        tone="cyan"
                        statusLabel={
                            summary.productsWithStock > 0
                                ? `${formatNumber(
                                      summary.productsWithStock,
                                  )} products`
                                : 'Awaiting stock'
                        }
                        statusTone={
                            summary.productsWithStock > 0
                                ? 'cyan'
                                : 'neutral'
                        }
                        sparkValues={warehouseDistribution.map(
                            (warehouse) =>
                                warehouse.quantity,
                        )}
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
                        statusLabel={
                            summary.positions <= 0
                                ? 'Monitoring ready'
                                : summary.lowStock +
                                      summary.outOfStock <=
                                  0
                                  ? 'All clear'
                                  : `${formatNumber(
                                        summary.outOfStock,
                                    )} out of stock`
                        }
                        statusTone={
                            summary.positions <= 0
                                ? 'neutral'
                                : summary.lowStock +
                                      summary.outOfStock <=
                                  0
                                  ? 'emerald'
                                  : summary.outOfStock > 0
                                    ? 'red'
                                    : 'amber'
                        }
                        sparkValues={[
                            summary.healthy,
                            summary.lowStock,
                            summary.outOfStock,
                            summary.lowStock,
                            summary.outOfStock,
                        ]}
                    />

                    <MetricCard
                        label="Dormant Positions"
                        value={formatNumber(
                            summary.dormant,
                        )}
                        description="No movement in 30 days"
                        icon={Clock3}
                        tone="violet"
                        statusLabel={
                            summary.positions <= 0
                                ? 'Ageing monitor ready'
                                : summary.dormant <= 0
                                  ? 'Inventory moving'
                                  : 'Review slow stock'
                        }
                        statusTone={
                            summary.positions <= 0
                                ? 'neutral'
                                : summary.dormant <= 0
                                  ? 'emerald'
                                  : 'violet'
                        }
                        sparkValues={dormantStock.map(
                            (position) =>
                                position.value,
                        )}
                    />
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
                    <OverviewPanel
                        title="Stock Health"
                        description="Availability readiness across tracked warehouse positions."
                        icon={Activity}
                        badge={
                            stockHealth.total > 0
                                ? `${formatNumber(
                                      stockHealth.total,
                                  )} positions`
                                : 'Monitoring ready'
                        }
                        accent="emerald"
                    >
                        <StockHealthGauge
                            health={stockHealth}
                        />
                    </OverviewPanel>

                    <OverviewPanel
                        title="30-Day Stock Movement"
                        description="Weekly stock-in and stock-out activity across inventory."
                        icon={BarChart3}
                        badge={
                            hasMovementData
                                ? `${formatQuantity(
                                      movementTotals.stockIn +
                                          movementTotals.stockOut,
                                  )} units`
                                : 'Chart ready'
                        }
                        accent="cyan"
                    >
                        <MovementTrendChart
                            points={movementActivity}
                            totals={movementTotals}
                        />
                    </OverviewPanel>
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                    <OverviewPanel
                        title="Warehouse Distribution"
                        description="Inventory value, quantity, and health by warehouse."
                        icon={Warehouse}
                        badge={
                            warehouseDistribution.length > 0
                                ? `${formatNumber(
                                      warehouseDistribution.length,
                                  )} warehouses`
                                : 'Network ready'
                        }
                        accent="cyan"
                    >
                        <WarehouseDistribution
                            warehouses={
                                warehouseDistribution
                            }
                        />
                    </OverviewPanel>

                    <OverviewPanel
                        title="Inventory by Category"
                        description="Contribution of each category to current stock value."
                        icon={Layers3}
                        badge={
                            categoryDistribution.length > 0
                                ? `${formatNumber(
                                      categoryDistribution.length,
                                  )} groups`
                                : 'Mix ready'
                        }
                        accent="emerald"
                    >
                        <CategoryDistribution
                            categories={
                                categoryDistribution
                            }
                        />
                    </OverviewPanel>
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-2">
                    <DashboardPanel
                        title="Highest Inventory Value"
                        description="Warehouse positions carrying the most stock value."
                        icon={TrendingUp}
                        href="/inventory/stocks"
                        actionLabel="Open Stock Management"
                        accent="emerald"
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
                            <OperationalEmptyState
                                icon={PackageSearch}
                                title="Valuation ranking is ready"
                                description="Highest-value positions will rank automatically after tracked stock is added to warehouses."
                                href="/inventory/stocks"
                                actionLabel="Add inventory stock"
                                tone="emerald"
                                pattern="ranking"
                            />
                        )}
                    </DashboardPanel>

                    <DashboardPanel
                        title="Low Stock Priorities"
                        description="Positions at or below their configured reorder level."
                        icon={AlertTriangle}
                        href="/inventory/stocks"
                        actionLabel="Review Stock"
                        accent="amber"
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
                            <OperationalEmptyState
                                icon={
                                    summary.positions > 0
                                        ? CheckCircle2
                                        : PackagePlus
                                }
                                title={
                                    summary.positions > 0
                                        ? 'Stock levels are healthy'
                                        : 'Replenishment monitoring is ready'
                                }
                                description={
                                    summary.positions > 0
                                        ? 'All tracked positions are currently above their configured reorder levels.'
                                        : 'Add tracked stock and reorder levels to activate automatic replenishment priorities.'
                                }
                                href="/inventory/stocks"
                                actionLabel={
                                    summary.positions > 0
                                        ? 'Review stock'
                                        : 'Configure stock'
                                }
                                tone={
                                    summary.positions > 0
                                        ? 'emerald'
                                        : 'amber'
                                }
                                pattern="threshold"
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
                    accent="violet"
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
                        <OperationalEmptyState
                            icon={
                                summary.positions > 0
                                    ? CheckCircle2
                                    : Database
                            }
                            title={
                                summary.positions > 0
                                    ? 'Inventory is moving'
                                    : 'Ageing analysis is ready'
                            }
                            description={
                                summary.positions > 0
                                    ? 'No available stock position is currently classified as dormant.'
                                    : 'Movement history will automatically identify slow and dormant stock after inventory activity begins.'
                            }
                            href="/stock-movements"
                            actionLabel="View stock movements"
                            tone={
                                summary.positions > 0
                                    ? 'emerald'
                                    : 'violet'
                            }
                            pattern="timeline"
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
    hasStockData,
}: {
    context: StockOverviewProps['context'];
    summary: StockOverviewProps['summary'];
    hasStockData: boolean;
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-card/75 shadow-[0_12px_40px_rgba(16,185,129,0.055)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(34,211,238,0.08),transparent_28%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/55 to-transparent" />

            <div className="relative flex flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_48%)]" />
                        <Boxes className="relative size-5" />

                        <span
                            className={[
                                'absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-card',
                                hasStockData
                                    ? 'bg-cyan-400'
                                    : 'bg-emerald-400',
                            ].join(' ')}
                        />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-base font-semibold tracking-tight">
                                Stock Intelligence Overview
                            </h1>

                            <span
                                className={[
                                    'inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-[9px] font-semibold uppercase tracking-[0.12em]',
                                    hasStockData
                                        ? 'border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-300'
                                        : 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300',
                                ].join(' ')}
                            >
                                {hasStockData ? (
                                    <Activity className="size-2.5" />
                                ) : (
                                    <Sparkles className="size-2.5" />
                                )}

                                {hasStockData
                                    ? 'Live Inventory'
                                    : 'System Ready'}
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
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.045] px-3 text-[10px] font-semibold text-cyan-300 transition hover:bg-cyan-500/10 hover:text-cyan-200"
                    >
                        <BarChart3 className="size-3.5" />
                        Stock Movements
                    </Link>

                    <Link
                        href="/inventory/stocks"
                        prefetch
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-500 px-3 text-[10px] font-semibold text-white shadow-[0_7px_22px_rgba(16,185,129,0.18)] transition hover:bg-emerald-500/90"
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/[0.035] px-2 py-1 text-[9px] text-muted-foreground">
            <Icon className="size-3 text-emerald-400" />
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
    statusLabel,
    statusTone,
    sparkValues,
}: {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    tone: AccentTone;
    statusLabel: string;
    statusTone: StatusTone;
    sparkValues: number[];
}) {
    const styles = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            glow: 'from-emerald-500/[0.075]',
            line: 'text-emerald-400',
        },
        cyan: {
            icon: 'border-cyan-500/15 bg-cyan-500/10 text-cyan-400',
            value: 'text-cyan-400',
            glow: 'from-cyan-500/[0.075]',
            line: 'text-cyan-400',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            glow: 'from-amber-500/[0.075]',
            line: 'text-amber-400',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
            glow: 'from-violet-500/[0.075]',
            line: 'text-violet-400',
        },
    }[tone];

    return (
        <article className="group relative min-h-[134px] overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-3.5 transition hover:border-emerald-500/15 sm:p-4">
            <div
                className={[
                    'pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent opacity-80',
                    styles.glow,
                ].join(' ')}
            />

            <div className="pointer-events-none absolute -bottom-2 right-2 h-12 w-[42%] opacity-60">
                <MetricSparkline
                    values={sparkValues}
                    toneClass={styles.line}
                />
            </div>

            <div className="relative flex items-start justify-between gap-3">
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
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-sm',
                        styles.icon,
                    ].join(' ')}
                >
                    <Icon className="size-4" />
                </span>
            </div>

            <div className="relative mt-4 flex items-end justify-between gap-3">
                <p className="truncate text-[10px] text-muted-foreground">
                    {description}
                </p>

                <StatusPill
                    label={statusLabel}
                    tone={statusTone}
                />
            </div>
        </article>
    );
}

function MetricSparkline({
    values,
    toneClass,
}: {
    values: number[];
    toneClass: string;
}) {
    const normalized =
        values.length >= 2
            ? values
            : [0, 0, 0, 0, 0];

    const hasValues = normalized.some(
        (value) => value > 0,
    );
    const max = Math.max(...normalized, 1);
    const points = normalized.map(
        (value, index) => ({
            x:
                normalized.length <= 1
                    ? 0
                    : (index /
                          (normalized.length -
                              1)) *
                      138,
            y: 38 - (value / max) * 30,
        }),
    );

    if (!hasValues) {
        return (
            <svg
                viewBox="0 0 140 40"
                className="size-full"
                aria-hidden="true"
            >
                <path
                    d="M 4 27 H 136"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeDasharray="4 5"
                    className="text-muted-foreground/25"
                />

                {[18, 52, 86, 120].map(
                    (x) => (
                        <circle
                            key={x}
                            cx={x}
                            cy="27"
                            r="2"
                            fill="currentColor"
                            className="text-emerald-400/25"
                        />
                    ),
                )}
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 140 40"
            className={[
                'size-full',
                toneClass,
            ].join(' ')}
            aria-hidden="true"
        >
            <path
                d={createSmoothPath(points)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
            />

            <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="2.5"
                fill="currentColor"
                opacity="0.85"
            />
        </svg>
    );
}

function StatusPill({
    label,
    tone,
}: {
    label: string;
    tone: StatusTone;
}) {
    const toneClass: Record<
        StatusTone,
        string
    > = {
        neutral:
            'border-border/60 bg-background/45 text-muted-foreground',
        emerald:
            'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
        cyan:
            'border-cyan-500/15 bg-cyan-500/10 text-cyan-300',
        amber:
            'border-amber-500/15 bg-amber-500/10 text-amber-400',
        red:
            'border-red-500/15 bg-red-500/10 text-red-400',
        violet:
            'border-violet-500/15 bg-violet-500/10 text-violet-400',
    };

    return (
        <span
            className={[
                'inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[8px] font-semibold',
                toneClass[tone],
            ].join(' ')}
        >
            {label}
        </span>
    );
}

function OverviewPanel({
    title,
    description,
    icon: Icon,
    badge,
    accent,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    badge: string;
    accent: AccentTone;
    children: ReactNode;
}) {
    const styles = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400',
            badge: 'border-emerald-500/10 bg-emerald-500/[0.035] text-emerald-300/80',
            line: 'via-emerald-400/45',
        },
        cyan: {
            icon: 'border-cyan-500/15 bg-cyan-500/[0.06] text-cyan-400',
            badge: 'border-cyan-500/10 bg-cyan-500/[0.035] text-cyan-300/80',
            line: 'via-cyan-400/45',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/[0.06] text-amber-400',
            badge: 'border-amber-500/10 bg-amber-500/[0.035] text-amber-300/80',
            line: 'via-amber-400/45',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/[0.06] text-violet-400',
            badge: 'border-violet-500/10 bg-violet-500/[0.035] text-violet-300/80',
            line: 'via-violet-400/45',
        },
    }[accent];

    return (
        <section className="relative min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div
                className={[
                    'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
                    styles.line,
                ].join(' ')}
            />

            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className={[
                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                            styles.icon,
                        ].join(' ')}
                    >
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

                <span
                    className={[
                        'inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-[9px] font-medium',
                        styles.badge,
                    ].join(' ')}
                >
                    {badge}
                </span>
            </div>

            <div className="p-3.5 sm:p-4">
                {children}
            </div>
        </section>
    );
}

function StockHealthGauge({
    health,
}: {
    health: StockOverviewProps['stockHealth'];
}) {
    const total = Math.max(health.total, 1);
    const healthy =
        (health.healthy / total) * 100;
    const low =
        (health.lowStock / total) * 100;
    const out =
        (health.outOfStock / total) * 100;
    const hasData = health.total > 0;

    const ringBackground = hasData
        ? `conic-gradient(
            rgb(52 211 153) 0% ${healthy}%,
            rgb(251 191 36) ${healthy}% ${
              healthy + low
          }%,
            rgb(248 113 113) ${
                healthy + low
            }% 100%
        )`
        : `conic-gradient(
            from 210deg,
            rgba(16,185,129,0.62),
            rgba(34,211,238,0.18),
            rgba(16,185,129,0.62)
        )`;

    return (
        <div className="flex min-h-[286px] flex-col justify-center">
            <div className="relative mx-auto size-[168px]">
                <div
                    className={[
                        'absolute inset-0 rounded-full',
                        hasData
                            ? 'shadow-[0_0_28px_rgba(52,211,153,0.10)]'
                            : 'shadow-[0_0_30px_rgba(16,185,129,0.12)]',
                    ].join(' ')}
                    style={{
                        background: ringBackground,
                    }}
                />

                <div className="absolute inset-[11px] rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-[20px] rounded-full border border-dashed border-emerald-500/15" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-3xl font-semibold tabular-nums">
                        {hasData
                            ? `${Math.round(healthy)}%`
                            : '—'}
                    </p>

                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {hasData
                            ? 'Healthy Stock'
                            : 'Awaiting Stock'}
                    </p>

                    <span
                        className={[
                            'mt-2 inline-flex rounded-full border px-2 py-1 text-[8px] font-medium',
                            hasData
                                ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
                                : 'border-cyan-500/15 bg-cyan-500/10 text-cyan-300',
                        ].join(' ')}
                    >
                        {hasData
                            ? `${formatNumber(
                                  health.total,
                              )} tracked positions`
                            : 'Monitoring ready'}
                    </span>
                </div>
            </div>

            <div className="mt-4 grid gap-2">
                <HealthRow
                    label="Healthy"
                    value={health.healthy}
                    description="Above reorder level"
                    tone="emerald"
                />

                <HealthRow
                    label="Low Stock"
                    value={health.lowStock}
                    description="At or below threshold"
                    tone="amber"
                />

                <HealthRow
                    label="Out of Stock"
                    value={health.outOfStock}
                    description="No available quantity"
                    tone="red"
                />
            </div>
        </div>
    );
}

function HealthRow({
    label,
    value,
    description,
    tone,
}: {
    label: string;
    value: number;
    description: string;
    tone: 'emerald' | 'amber' | 'red';
}) {
    const styles = {
        emerald: {
            dot: 'bg-emerald-400',
            value: 'text-emerald-400',
        },
        amber: {
            dot: 'bg-amber-400',
            value: 'text-amber-400',
        },
        red: {
            dot: 'bg-red-400',
            value: 'text-red-400',
        },
    }[tone];

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/30 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
                <span
                    className={[
                        'size-2.5 shrink-0 rounded-full shadow-sm',
                        styles.dot,
                    ].join(' ')}
                />

                <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium">
                        {label}
                    </p>

                    <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <span
                className={[
                    'text-xs font-semibold tabular-nums',
                    styles.value,
                ].join(' ')}
            >
                {formatNumber(value)}
            </span>
        </div>
    );
}

function MovementTrendChart({
    points,
    totals,
}: {
    points: MovementPoint[];
    totals: {
        stockIn: number;
        stockOut: number;
    };
}) {
    const rawId = useId();
    const id = rawId.replace(/:/g, '');
    const hasData =
        totals.stockIn > 0 ||
        totals.stockOut > 0;

    const chart = useMemo(() => {
        const width = 760;
        const height = 236;
        const padding = {
            top: 20,
            right: 18,
            bottom: 36,
            left: 44,
        };
        const plotWidth =
            width - padding.left - padding.right;
        const plotHeight =
            height - padding.top - padding.bottom;
        const maxValue = Math.max(
            ...points.flatMap((point) => [
                point.stockIn,
                point.stockOut,
            ]),
            1,
        );
        const scaledMax = maxValue * 1.12;

        const xFor = (index: number): number =>
            points.length <= 1
                ? padding.left + plotWidth / 2
                : padding.left +
                  (index / (points.length - 1)) *
                      plotWidth;

        const yFor = (value: number): number =>
            padding.top +
            plotHeight -
            (value / scaledMax) * plotHeight;

        const stockInPoints = points.map(
            (point, index) => ({
                x: xFor(index),
                y: yFor(point.stockIn),
            }),
        );

        const stockOutPoints = points.map(
            (point, index) => ({
                x: xFor(index),
                y: yFor(point.stockOut),
            }),
        );

        return {
            width,
            height,
            padding,
            plotWidth,
            plotHeight,
            scaledMax,
            stockInPoints,
            stockOutPoints,
            stockInPath:
                createSmoothPath(stockInPoints),
            stockOutPath:
                createSmoothPath(stockOutPoints),
            stockInArea:
                createAreaPath(
                    stockInPoints,
                    padding.top + plotHeight,
                ),
            stockOutArea:
                createAreaPath(
                    stockOutPoints,
                    padding.top + plotHeight,
                ),
        };
    }, [points]);

    const net =
        totals.stockIn - totals.stockOut;

    return (
        <div>
            <div className="grid gap-2 sm:grid-cols-3">
                <MovementSummary
                    label="Stock In"
                    value={formatQuantity(
                        totals.stockIn,
                    )}
                    tone="emerald"
                />

                <MovementSummary
                    label="Stock Out"
                    value={formatQuantity(
                        totals.stockOut,
                    )}
                    tone="cyan"
                />

                <MovementSummary
                    label="Net Movement"
                    value={`${net >= 0 ? '+' : ''}${formatQuantity(
                        net,
                    )}`}
                    tone={
                        net >= 0
                            ? 'emerald'
                            : 'amber'
                    }
                />
            </div>

            <div className="relative mt-3 overflow-hidden rounded-xl border border-border/50 bg-background/25">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent_55%)]" />

                <svg
                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                    className="relative h-[210px] w-full sm:h-[230px]"
                    role="img"
                    aria-label="Thirty-day stock movement trend"
                >
                    <defs>
                        <linearGradient
                            id={`stock-in-${id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="rgb(52 211 153)"
                                stopOpacity="0.22"
                            />
                            <stop
                                offset="100%"
                                stopColor="rgb(52 211 153)"
                                stopOpacity="0"
                            />
                        </linearGradient>

                        <linearGradient
                            id={`stock-out-${id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="rgb(34 211 238)"
                                stopOpacity="0.18"
                            />
                            <stop
                                offset="100%"
                                stopColor="rgb(34 211 238)"
                                stopOpacity="0"
                            />
                        </linearGradient>

                        <filter
                            id={`glow-${id}`}
                            x="-20%"
                            y="-20%"
                            width="140%"
                            height="140%"
                        >
                            <feGaussianBlur
                                stdDeviation="3"
                                result="blur"
                            />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {[0, 1, 2, 3, 4].map(
                        (line) => {
                            const y =
                                chart.padding.top +
                                (line / 4) *
                                    chart.plotHeight;
                            const value =
                                chart.scaledMax *
                                (1 - line / 4);

                            return (
                                <g key={line}>
                                    <line
                                        x1={
                                            chart.padding.left
                                        }
                                        x2={
                                            chart.width -
                                            chart.padding.right
                                        }
                                        y1={y}
                                        y2={y}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="4 7"
                                        className="text-border/55"
                                    />

                                    <text
                                        x={
                                            chart.padding.left -
                                            9
                                        }
                                        y={y + 3}
                                        textAnchor="end"
                                        fill="currentColor"
                                        className="text-[9px] text-muted-foreground"
                                    >
                                        {formatCompact(
                                            value,
                                        )}
                                    </text>
                                </g>
                            );
                        },
                    )}

                    {points.map((point, index) => {
                        const x =
                            points.length <= 1
                                ? chart.padding.left +
                                  chart.plotWidth /
                                      2
                                : chart.padding.left +
                                  (index /
                                      (points.length -
                                          1)) *
                                      chart.plotWidth;

                        return (
                            <text
                                key={`${point.label}-${index}`}
                                x={x}
                                y={chart.height - 12}
                                textAnchor="middle"
                                fill="currentColor"
                                className="text-[9px] font-medium text-muted-foreground"
                            >
                                {point.label}
                            </text>
                        );
                    })}

                    {hasData ? (
                        <>
                            <path
                                d={chart.stockOutArea}
                                fill={`url(#stock-out-${id})`}
                            />

                            <path
                                d={chart.stockInArea}
                                fill={`url(#stock-in-${id})`}
                            />

                            <path
                                d={chart.stockOutPath}
                                fill="none"
                                stroke="rgb(34 211 238)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <path
                                d={chart.stockInPath}
                                fill="none"
                                stroke="rgb(52 211 153)"
                                strokeWidth="2.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter={`url(#glow-${id})`}
                            />

                            {chart.stockInPoints.map(
                                (point, index) => (
                                    <circle
                                        key={`in-${index}`}
                                        cx={point.x}
                                        cy={point.y}
                                        r="4"
                                        fill="rgb(10 16 24)"
                                        stroke="rgb(52 211 153)"
                                        strokeWidth="2"
                                    >
                                        <title>
                                            {`${
                                                points[index]
                                                    .label
                                            }: ${formatQuantity(
                                                points[index]
                                                    .stockIn,
                                            )} stock in`}
                                        </title>
                                    </circle>
                                ),
                            )}

                            {chart.stockOutPoints.map(
                                (point, index) => (
                                    <circle
                                        key={`out-${index}`}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3.5"
                                        fill="rgb(10 16 24)"
                                        stroke="rgb(34 211 238)"
                                        strokeWidth="2"
                                    >
                                        <title>
                                            {`${
                                                points[index]
                                                    .label
                                            }: ${formatQuantity(
                                                points[index]
                                                    .stockOut,
                                            )} stock out`}
                                        </title>
                                    </circle>
                                ),
                            )}
                        </>
                    ) : (
                        <MovementReadyState
                            width={chart.width}
                            height={chart.height}
                            paddingLeft={
                                chart.padding.left
                            }
                            paddingRight={
                                chart.padding.right
                            }
                        />
                    )}
                </svg>

                <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[8px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        Stock In
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-cyan-400" />
                        Stock Out
                    </span>
                </div>
            </div>
        </div>
    );
}

function MovementSummary({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone:
        | 'emerald'
        | 'cyan'
        | 'amber';
}) {
    const toneClass = {
        emerald: 'text-emerald-400',
        cyan: 'text-cyan-400',
        amber: 'text-amber-400',
    }[tone];

    return (
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    'mt-1 text-sm font-semibold tabular-nums',
                    toneClass,
                ].join(' ')}
            >
                {value}
            </p>
        </div>
    );
}

function MovementReadyState({
    width,
    height,
    paddingLeft,
    paddingRight,
}: {
    width: number;
    height: number;
    paddingLeft: number;
    paddingRight: number;
}) {
    const baselineY = height - 58;
    const nodeCount = 6;
    const availableWidth =
        width - paddingLeft - paddingRight;

    return (
        <g>
            <path
                d={`M ${paddingLeft} ${baselineY} H ${
                    width - paddingRight
                }`}
                fill="none"
                stroke="rgb(52 211 153)"
                strokeWidth="1.5"
                strokeDasharray="5 8"
                opacity="0.35"
            />

            {Array.from({
                length: nodeCount,
            }).map((_, index) => {
                const x =
                    paddingLeft +
                    (index / (nodeCount - 1)) *
                        availableWidth;

                return (
                    <g key={index}>
                        <circle
                            cx={x}
                            cy={baselineY}
                            r="5"
                            fill="rgb(16 185 129)"
                            opacity="0.12"
                        />

                        <circle
                            cx={x}
                            cy={baselineY}
                            r="2"
                            fill="rgb(34 211 238)"
                            opacity="0.45"
                        />
                    </g>
                );
            })}

            <g
                transform={`translate(${
                    width / 2
                } ${height / 2 - 16})`}
            >
                <rect
                    x="-118"
                    y="-31"
                    width="236"
                    height="62"
                    rx="14"
                    fill="rgb(12 18 28)"
                    fillOpacity="0.88"
                    stroke="rgb(16 185 129)"
                    strokeOpacity="0.18"
                />

                <circle
                    cx="-84"
                    cy="0"
                    r="14"
                    fill="rgb(16 185 129)"
                    fillOpacity="0.12"
                />

                <path
                    d="M -91 3 L -86 -2 L -81 1 L -75 -7"
                    fill="none"
                    stroke="rgb(34 211 238)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <text
                    x="-58"
                    y="-3"
                    fill="rgb(226 232 240)"
                    fontSize="11"
                    fontWeight="600"
                >
                    Movement analytics ready
                </text>

                <text
                    x="-58"
                    y="13"
                    fill="rgb(148 163 184)"
                    fontSize="8.5"
                >
                    Stock activity will plot automatically
                </text>
            </g>
        </g>
    );
}

function WarehouseDistribution({
    warehouses,
}: {
    warehouses: WarehouseSummary[];
}) {
    if (warehouses.length === 0) {
        return <WarehouseReadyState />;
    }

    const maxValue = Math.max(
        ...warehouses.map(
            (warehouse) => warehouse.value,
        ),
        1,
    );
    const totalValue = warehouses.reduce(
        (sum, warehouse) =>
            sum + warehouse.value,
        0,
    );

    return (
        <div>
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
                <DistributionSummary
                    label="Network Value"
                    value={formatCurrency(totalValue)}
                    tone="emerald"
                />

                <DistributionSummary
                    label="Available Units"
                    value={formatQuantity(
                        warehouses.reduce(
                            (sum, warehouse) =>
                                sum +
                                warehouse.quantity,
                            0,
                        ),
                    )}
                    tone="cyan"
                />

                <DistributionSummary
                    label="Stock Positions"
                    value={formatNumber(
                        warehouses.reduce(
                            (sum, warehouse) =>
                                sum +
                                warehouse.positions,
                            0,
                        ),
                    )}
                    tone="violet"
                />
            </div>

            <div className="space-y-2">
                {warehouses.map((warehouse) => {
                    const healthTotal =
                        warehouse.healthy +
                        warehouse.lowStock +
                        warehouse.outOfStock;
                    const healthyPercentage =
                        healthTotal > 0
                            ? (warehouse.healthy /
                                  healthTotal) *
                              100
                            : 0;

                    return (
                        <article
                            key={warehouse.id}
                            className="grid gap-3 rounded-xl border border-border/50 bg-background/30 p-3 lg:grid-cols-[minmax(190px,0.8fr)_minmax(0,1fr)_196px]"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/15 bg-cyan-500/10 text-cyan-400">
                                    <Warehouse className="size-4" />
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
                                        {warehouse.branch}{' '}
                                        · {warehouse.code}
                                    </p>
                                </div>
                            </div>

                            <div className="min-w-0">
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
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                                        style={{
                                            width: `${
                                                warehouse.value >
                                                0
                                                    ? Math.max(
                                                          (warehouse.value /
                                                              maxValue) *
                                                              100,
                                                          3,
                                                      )
                                                    : 0
                                            }%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-[8px] text-muted-foreground">
                                        {formatQuantity(
                                            warehouse.quantity,
                                        )}{' '}
                                        units
                                    </span>

                                    <span className="text-[8px] font-medium text-emerald-400">
                                        {healthyPercentage.toFixed(
                                            0,
                                        )}
                                        % healthy
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                                <MiniCount
                                    label="Healthy"
                                    value={
                                        warehouse.healthy
                                    }
                                    tone="emerald"
                                />

                                <MiniCount
                                    label="Low"
                                    value={
                                        warehouse.lowStock
                                    }
                                    tone="amber"
                                />

                                <MiniCount
                                    label="Out"
                                    value={
                                        warehouse.outOfStock
                                    }
                                    tone="red"
                                />
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}

function DistributionSummary({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone:
        | 'emerald'
        | 'cyan'
        | 'violet';
}) {
    const valueClass = {
        emerald: 'text-emerald-400',
        cyan: 'text-cyan-400',
        violet: 'text-violet-400',
    }[tone];

    return (
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    'mt-1 truncate text-sm font-semibold tabular-nums',
                    valueClass,
                ].join(' ')}
            >
                {value}
            </p>
        </div>
    );
}

function WarehouseReadyState() {
    const steps = [
        {
            label: 'Create a branch',
            href: '/branches',
            icon: Building2,
        },
        {
            label: 'Add a warehouse',
            href: '/warehouses',
            icon: Warehouse,
        },
        {
            label: 'Assign tracked stock',
            href: '/inventory/stocks',
            icon: Boxes,
        },
    ];

    return (
        <div className="grid min-h-[260px] items-center gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1fr)]">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.025] p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(16,185,129,0.12),transparent_60%)]" />

                <div className="relative mx-auto grid max-w-[250px] grid-cols-3 gap-2">
                    {[0, 1, 2].map((index) => (
                        <div
                            key={index}
                            className="relative flex h-24 items-end justify-center overflow-hidden rounded-xl border border-border/50 bg-background/35 p-2"
                        >
                            <div
                                className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/20 to-cyan-400/45"
                                style={{
                                    height: `${
                                        42 +
                                        index * 19
                                    }%`,
                                }}
                            />

                            <span className="absolute left-2 top-2 text-[7px] font-semibold uppercase tracking-wider text-muted-foreground">
                                W{index + 1}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="relative mx-auto mt-3 flex max-w-[250px] items-center justify-between rounded-xl border border-border/50 bg-background/35 px-3 py-2">
                    <span className="inline-flex items-center gap-2 text-[9px] text-muted-foreground">
                        <Warehouse className="size-3.5 text-emerald-400" />
                        Warehouse network
                    </span>

                    <span className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 text-[8px] font-medium text-emerald-300">
                        Ready
                    </span>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold">
                    Warehouse intelligence is ready
                </p>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    The distribution board will
                    automatically compare stock value,
                    available units, and health across your
                    warehouse network.
                </p>

                <div className="mt-3 space-y-2">
                    {steps.map(
                        ({
                            label,
                            href,
                            icon: Icon,
                        }) => (
                            <Link
                                key={label}
                                href={href}
                                prefetch
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-[9px] text-muted-foreground transition hover:border-emerald-500/15 hover:bg-emerald-500/[0.04] hover:text-emerald-300"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Icon className="size-3.5 text-emerald-400" />
                                    {label}
                                </span>

                                <ArrowRight className="size-3" />
                            </Link>
                        ),
                    )}
                </div>
            </div>
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

function CategoryDistribution({
    categories,
}: {
    categories: CategorySummary[];
}) {
    if (categories.length === 0) {
        return <CategoryReadyState />;
    }

    const stops: string[] = [];
    let current = 0;

    categories.forEach((category, index) => {
        const next =
            index === categories.length - 1
                ? 100
                : current +
                  category.percentage;

        stops.push(
            `${categoryColors[
                index % categoryColors.length
            ]} ${current}% ${next}%`,
        );

        current = next;
    });

    const totalValue = categories.reduce(
        (sum, category) =>
            sum + category.value,
        0,
    );
    const totalPositions = categories.reduce(
        (sum, category) =>
            sum + category.positions,
        0,
    );

    return (
        <div className="grid items-center gap-5 sm:grid-cols-[154px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[154px_minmax(0,1fr)]">
            <div className="relative mx-auto size-[150px]">
                <div
                    className="absolute inset-0 rounded-full shadow-[0_0_26px_rgba(16,185,129,0.10)]"
                    style={{
                        background: `conic-gradient(${stops.join(
                            ', ',
                        )})`,
                    }}
                />

                <div className="absolute inset-[13px] rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-[23px] flex items-center justify-center rounded-full border border-dashed border-emerald-500/15">
                    <div className="max-w-[86px] text-center">
                        <p className="truncate text-sm font-semibold tabular-nums">
                            {formatCurrency(totalValue)}
                        </p>

                        <p className="mt-1 text-[7px] uppercase tracking-[0.13em] text-muted-foreground">
                            Stock Value
                        </p>

                        <p className="mt-1 text-[8px] font-medium text-emerald-400">
                            {formatNumber(
                                totalPositions,
                            )}{' '}
                            positions
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {categories.map(
                    (category, index) => (
                        <div
                            key={category.label}
                            className="rounded-lg border border-border/50 bg-background/30 px-3 py-2.5"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="inline-flex min-w-0 items-center gap-2">
                                    <span
                                        className={[
                                            'size-2.5 shrink-0 rounded-full',
                                            categoryDots[
                                                index %
                                                    categoryDots.length
                                            ],
                                        ].join(' ')}
                                    />

                                    <span className="truncate text-[10px] font-medium">
                                        {category.label}
                                    </span>
                                </span>

                                <span className="text-[10px] font-semibold tabular-nums">
                                    {category.percentage.toFixed(
                                        1,
                                    )}
                                    %
                                </span>
                            </div>

                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={[
                                        'h-full rounded-full',
                                        categoryDots[
                                            index %
                                                categoryDots.length
                                        ],
                                    ].join(' ')}
                                    style={{
                                        width: `${Math.max(
                                            category.percentage,
                                            2,
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

function CategoryReadyState() {
    const steps = [
        {
            label: 'Create categories',
            href: '/inventory/categories',
            icon: Layers3,
        },
        {
            label: 'Add products',
            href: '/inventory/products',
            icon: Boxes,
        },
        {
            label: 'Add inventory stock',
            href: '/inventory/stocks',
            icon: PackagePlus,
        },
    ];

    return (
        <div className="grid min-h-[245px] items-center gap-5 sm:grid-cols-[145px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[145px_minmax(0,1fr)]">
            <div className="relative mx-auto size-[142px]">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_220deg,rgba(16,185,129,0.52),rgba(34,211,238,0.13),rgba(96,165,250,0.26),rgba(16,185,129,0.52))] shadow-[0_0_28px_rgba(16,185,129,0.10)]" />
                <div className="absolute inset-[12px] rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-[23px] flex flex-col items-center justify-center rounded-full border border-dashed border-emerald-500/20 text-center">
                    <Layers3 className="size-5 text-emerald-400" />
                    <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Mix Ready
                    </p>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold">
                    Category mix is ready
                </p>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    Stock value will automatically form
                    this category distribution after
                    tracked inventory is added.
                </p>

                <div className="mt-3 space-y-2">
                    {steps.map(
                        ({
                            label,
                            href,
                            icon: Icon,
                        }) => (
                            <Link
                                key={label}
                                href={href}
                                prefetch
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-[9px] text-muted-foreground transition hover:border-emerald-500/15 hover:bg-emerald-500/[0.04] hover:text-emerald-300"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Icon className="size-3.5 text-emerald-400" />
                                    {label}
                                </span>

                                <ArrowRight className="size-3" />
                            </Link>
                        ),
                    )}
                </div>
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
    accent,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    actionLabel: string;
    accent: AccentTone;
    children: ReactNode;
}) {
    const styles = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-400',
            action: 'border-emerald-500/15 bg-emerald-500/[0.045] text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200',
            line: 'via-emerald-400/40',
        },
        cyan: {
            icon: 'border-cyan-500/15 bg-cyan-500/[0.055] text-cyan-400',
            action: 'border-cyan-500/15 bg-cyan-500/[0.045] text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200',
            line: 'via-cyan-400/40',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/[0.055] text-amber-400',
            action: 'border-amber-500/15 bg-amber-500/[0.045] text-amber-300 hover:bg-amber-500/10 hover:text-amber-200',
            line: 'via-amber-400/40',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/[0.055] text-violet-400',
            action: 'border-violet-500/15 bg-violet-500/[0.045] text-violet-300 hover:bg-violet-500/10 hover:text-violet-200',
            line: 'via-violet-400/40',
        },
    }[accent];

    return (
        <section className="relative min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div
                className={[
                    'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
                    styles.line,
                ].join(' ')}
            />

            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className={[
                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                            styles.icon,
                        ].join(' ')}
                    >
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
                    className={[
                        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-semibold transition',
                        styles.action,
                    ].join(' ')}
                >
                    {actionLabel}
                    <ArrowRight className="size-3" />
                </Link>
            </div>

            {children}
        </section>
    );
}

function OperationalEmptyState({
    icon: Icon,
    title,
    description,
    href,
    actionLabel,
    tone,
    pattern,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    actionLabel: string;
    tone:
        | 'emerald'
        | 'amber'
        | 'violet';
    pattern:
        | 'ranking'
        | 'threshold'
        | 'timeline';
}) {
    const styles = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400',
            button: 'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-300 hover:bg-emerald-500/10',
            accent: 'bg-emerald-400/40',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/[0.06] text-amber-400',
            button: 'border-amber-500/15 bg-amber-500/[0.055] text-amber-300 hover:bg-amber-500/10',
            accent: 'bg-amber-400/40',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/[0.06] text-violet-400',
            button: 'border-violet-500/15 bg-violet-500/[0.055] text-violet-300 hover:bg-violet-500/10',
            accent: 'bg-violet-400/40',
        },
    }[tone];

    return (
        <div className="relative min-h-[220px] overflow-hidden px-5 py-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(16,185,129,0.055),transparent_58%)]" />

            <div className="relative mx-auto max-w-md text-center">
                <span
                    className={[
                        'inline-flex size-11 items-center justify-center rounded-xl border shadow-sm',
                        styles.icon,
                    ].join(' ')}
                >
                    <Icon className="size-5" />
                </span>

                <p className="mt-3 text-sm font-semibold">
                    {title}
                </p>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    {description}
                </p>

                <Link
                    href={href}
                    prefetch
                    className={[
                        'mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[9px] font-semibold transition',
                        styles.button,
                    ].join(' ')}
                >
                    {actionLabel}
                    <ArrowRight className="size-3" />
                </Link>
            </div>

            <div className="relative mx-auto mt-5 max-w-lg">
                {pattern === 'ranking' && (
                    <div className="space-y-2">
                        {[72, 54, 36].map(
                            (width, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/20 px-3 py-2"
                                >
                                    <span className="w-5 text-[8px] font-semibold text-muted-foreground">
                                        {String(
                                            index + 1,
                                        ).padStart(
                                            2,
                                            '0',
                                        )}
                                    </span>

                                    <span
                                        className={[
                                            'h-1.5 rounded-full',
                                            styles.accent,
                                        ].join(' ')}
                                        style={{
                                            width: `${width}%`,
                                            opacity:
                                                0.45 -
                                                index * 0.08,
                                        }}
                                    />

                                    <span className="ml-auto h-1.5 w-12 rounded-full bg-muted/50" />
                                </div>
                            ),
                        )}
                    </div>
                )}

                {pattern === 'threshold' && (
                    <div className="flex h-14 items-end justify-center gap-2 rounded-xl border border-border/40 bg-background/20 px-4 py-2">
                        {[42, 64, 28, 72, 50, 84].map(
                            (height, index) => (
                                <span
                                    key={index}
                                    className={[
                                        'relative w-6 rounded-t-sm',
                                        styles.accent,
                                    ].join(' ')}
                                    style={{
                                        height: `${height}%`,
                                        opacity:
                                            0.18 +
                                            index * 0.035,
                                    }}
                                >
                                    <span className="absolute inset-x-0 bottom-[38%] h-px bg-amber-300/50" />
                                </span>
                            ),
                        )}
                    </div>
                )}

                {pattern === 'timeline' && (
                    <div className="space-y-2">
                        {[0, 1, 2].map((row) => (
                            <div
                                key={row}
                                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/20 px-3 py-2"
                            >
                                <span
                                    className={[
                                        'size-2 rounded-full',
                                        styles.accent,
                                    ].join(' ')}
                                />

                                <span className="h-1.5 flex-1 rounded-full bg-muted/70" />

                                <span className="h-1.5 w-12 rounded-full bg-muted/50" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
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

function createSmoothPath(
    points: Point[],
): string {
    if (points.length === 0) {
        return '';
    }

    if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (
        let index = 0;
        index < points.length - 1;
        index++
    ) {
        const previous =
            points[index - 1] ?? points[index];
        const current = points[index];
        const next = points[index + 1];
        const afterNext =
            points[index + 2] ?? next;

        const controlOneX =
            current.x +
            (next.x - previous.x) / 6;
        const controlOneY =
            current.y +
            (next.y - previous.y) / 6;
        const controlTwoX =
            next.x -
            (afterNext.x - current.x) / 6;
        const controlTwoY =
            next.y -
            (afterNext.y - current.y) / 6;

        path += ` C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${next.x} ${next.y}`;
    }

    return path;
}

function createAreaPath(
    points: Point[],
    baselineY: number,
): string {
    if (points.length === 0) {
        return '';
    }

    const linePath = createSmoothPath(points);
    const first = points[0];
    const last = points[points.length - 1];

    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
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

function formatCompact(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        notation: 'compact',
        maximumFractionDigits: 1,
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