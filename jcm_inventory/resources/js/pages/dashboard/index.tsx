import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Boxes,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    ClipboardList,
    Clock3,
    Database,
    Layers3,
    PackageCheck,
    PackagePlus,
    RefreshCw,
    ShoppingCart,
    Sparkles,
    Truck,
    Warehouse,
    type LucideIcon,
} from 'lucide-react';
import {
    type ReactNode,
    useId,
    useMemo,
} from 'react';

type RangeKey = '7d' | '30d' | '90d';
type Tone =
    | 'emerald'
    | 'blue'
    | 'violet'
    | 'amber'
    | 'red'
    | 'cyan';

type StatusTone =
    | 'neutral'
    | 'emerald'
    | 'blue'
    | 'amber'
    | 'red';

type DashboardProps = {
    filters: {
        range: RangeKey;
    };
    period: {
        label: string;
        start: string;
        end: string;
    };
    context: {
        scopeLabel: string;
        activeProducts: number;
        activeBranches: number;
        activeWarehouses: number;
    };
    summary: {
        receivedValue: number;
        receivedValueChange: number;
        inventoryValue: number;
        inventoryPositions: number;
        totalQuantity: number;
        purchaseOrders: number;
        purchaseOrdersChange: number;
        stockAlerts: number;
        criticalAlerts: number;
    };
    inventoryFlow: FlowPoint[];
    stockHealth: {
        healthy: number;
        lowStock: number;
        outOfStock: number;
        total: number;
    };
    categoryDistribution: CategorySlice[];
    procurementPipeline: PipelineStage[];
    lowStockAlerts: AlertItem[];
    recentMovements: MovementItem[];
};

type FlowPoint = {
    label: string;
    stockIn: number;
    stockOut: number;
};

type CategorySlice = {
    label: string;
    value: number;
    percentage: number;
};

type PipelineStage = {
    key: string;
    label: string;
    count: number;
};

type AlertItem = {
    id: number;
    product: string;
    sku: string | null;
    warehouse: string;
    quantity: number;
    reorderLevel: number;
    severity: 'low' | 'critical';
};

type MovementItem = {
    id: number;
    product: string;
    reference: string;
    warehouse: string;
    movementType: string;
    direction: 'in' | 'out' | 'neutral';
    quantity: number;
    occurredAt: string;
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
];

const categoryColors = [
    'rgb(96 165 250)',
    'rgb(34 211 238)',
    'rgb(167 139 250)',
    'rgb(251 191 36)',
];

const categoryDots = [
    'bg-blue-400',
    'bg-cyan-400',
    'bg-violet-400',
    'bg-amber-400',
];

export default function Dashboard({
    filters,
    period,
    context,
    summary,
    inventoryFlow,
    stockHealth,
    categoryDistribution,
    procurementPipeline,
    lowStockAlerts,
    recentMovements,
}: DashboardProps) {
    const flowTotals = useMemo(
        () =>
            inventoryFlow.reduce(
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
        [inventoryFlow],
    );

    const hasFlowActivity =
        flowTotals.stockIn > 0 ||
        flowTotals.stockOut > 0;

    const hasOperationalData =
        summary.inventoryPositions > 0 ||
        summary.receivedValue > 0 ||
        summary.purchaseOrders > 0 ||
        hasFlowActivity ||
        recentMovements.length > 0;

    function changeRange(range: RangeKey): void {
        router.get(
            '/dashboard',
            { range },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'filters',
                    'period',
                    'summary',
                    'inventoryFlow',
                ],
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 md:gap-4 md:p-4">
                <DashboardHeader
                    range={filters.range}
                    periodLabel={period.label}
                    context={context}
                    hasOperationalData={
                        hasOperationalData
                    }
                    onRangeChange={changeRange}
                />

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Received Inventory"
                        value={formatCurrency(
                            summary.receivedValue,
                        )}
                        description="Posted receipt value"
                        icon={CircleDollarSign}
                        tone="cyan"
                        change={
                            summary.receivedValue > 0
                                ? summary.receivedValueChange
                                : null
                        }
                        statusLabel={
                            summary.receivedValue > 0
                                ? 'Current period'
                                : 'No receipts yet'
                        }
                        statusTone={
                            summary.receivedValue > 0
                                ? 'blue'
                                : 'neutral'
                        }
                        sparkValues={inventoryFlow.map(
                            (point) => point.stockIn,
                        )}
                    />

                    <MetricCard
                        label="Inventory Value"
                        value={formatCurrency(
                            summary.inventoryValue,
                        )}
                        description={`${formatQuantity(
                            summary.totalQuantity,
                        )} available units`}
                        icon={Boxes}
                        tone="blue"
                        change={null}
                        statusLabel={
                            summary.inventoryPositions > 0
                                ? `${formatNumber(
                                      summary.inventoryPositions,
                                  )} positions`
                                : 'Awaiting stock'
                        }
                        statusTone={
                            summary.inventoryPositions > 0
                                ? 'blue'
                                : 'neutral'
                        }
                        sparkValues={buildInventoryPulse(
                            inventoryFlow,
                        )}
                    />

                    <MetricCard
                        label="Purchase Orders"
                        value={formatNumber(
                            summary.purchaseOrders,
                        )}
                        description="Created in selected period"
                        icon={ClipboardList}
                        tone="violet"
                        change={
                            summary.purchaseOrders > 0
                                ? summary.purchaseOrdersChange
                                : null
                        }
                        statusLabel={
                            summary.purchaseOrders > 0
                                ? 'Procurement active'
                                : 'No orders yet'
                        }
                        statusTone={
                            summary.purchaseOrders > 0
                                ? 'blue'
                                : 'neutral'
                        }
                        sparkValues={procurementPipeline.map(
                            (stage) => stage.count,
                        )}
                    />

                    <MetricCard
                        label="Stock Alerts"
                        value={formatNumber(
                            summary.stockAlerts,
                        )}
                        description="Low and out-of-stock positions"
                        icon={AlertTriangle}
                        tone="amber"
                        change={null}
                        statusLabel={
                            summary.inventoryPositions <= 0
                                ? 'Awaiting stock'
                                : summary.stockAlerts <= 0
                                  ? 'All clear'
                                  : `${formatNumber(
                                        summary.criticalAlerts,
                                    )} critical`
                        }
                        statusTone={
                            summary.inventoryPositions <= 0
                                ? 'neutral'
                                : summary.stockAlerts <= 0
                                  ? 'emerald'
                                  : summary.criticalAlerts > 0
                                    ? 'red'
                                    : 'amber'
                        }
                        sparkValues={[
                            summary.stockAlerts,
                            summary.criticalAlerts,
                            summary.stockAlerts,
                            summary.criticalAlerts,
                            summary.stockAlerts,
                        ]}
                    />
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[minmax(0,1.68fr)_minmax(300px,0.72fr)]">
                    <ChartCard
                        title="Inventory Flow"
                        description="Movement volume and direction across the selected reporting period."
                        icon={BarChart3}
                        badge={
                            hasFlowActivity
                                ? `${formatQuantity(
                                      flowTotals.stockIn +
                                          flowTotals.stockOut,
                                  )} recorded units`
                                : 'Chart ready'
                        }
                        accent="blue"
                    >
                        <InventoryFlowChart
                            points={inventoryFlow}
                            totals={flowTotals}
                        />
                    </ChartCard>

                    <ChartCard
                        title="Stock Health"
                        description="Availability readiness across tracked inventory positions."
                        icon={Activity}
                        badge={
                            stockHealth.total > 0
                                ? `${formatNumber(
                                      stockHealth.total,
                                  )} positions`
                                : 'Awaiting stock'
                        }
                        accent="cyan"
                    >
                        <StockHealthGauge
                            health={stockHealth}
                        />
                    </ChartCard>
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.38fr)]">
                    <ChartCard
                        title="Inventory by Category"
                        description="Cost-value contribution of stocked product categories."
                        icon={Layers3}
                        badge={
                            categoryDistribution.length > 0
                                ? `${formatNumber(
                                      categoryDistribution.length,
                                  )} groups`
                                : 'Distribution ready'
                        }
                        accent="cyan"
                    >
                        <CategoryDistribution
                            slices={categoryDistribution}
                        />
                    </ChartCard>

                    <ChartCard
                        title="Procurement Pipeline"
                        description="Order progression from preparation through completed receiving."
                        icon={Truck}
                        badge={`${formatNumber(
                            procurementPipeline.reduce(
                                (sum, stage) =>
                                    sum + stage.count,
                                0,
                            ),
                        )} orders`}
                        accent="violet"
                    >
                        <ProcurementFlow
                            stages={procurementPipeline}
                        />
                    </ChartCard>
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-2">
                    <DashboardPanel
                        title="Low Stock Priorities"
                        description="Products requiring replenishment attention."
                        icon={AlertTriangle}
                        actionLabel="Open Stock Management"
                        href="/inventory/stocks"
                        accent="amber"
                    >
                        {lowStockAlerts.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {lowStockAlerts.map(
                                    (alert) => (
                                        <StockAlertRow
                                            key={alert.id}
                                            alert={alert}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <OperationalEmptyState
                                icon={
                                    summary.inventoryPositions > 0
                                        ? CheckCircle2
                                        : PackagePlus
                                }
                                title={
                                    summary.inventoryPositions > 0
                                        ? 'No replenishment issues'
                                        : 'Stock monitoring is ready'
                                }
                                description={
                                    summary.inventoryPositions > 0
                                        ? 'All tracked stock positions are currently above their reorder thresholds.'
                                        : 'Add tracked stock and reorder levels to activate automatic replenishment priorities.'
                                }
                                href="/inventory/stocks"
                                actionLabel={
                                    summary.inventoryPositions > 0
                                        ? 'Review stock'
                                        : 'Add inventory stock'
                                }
                                tone={
                                    summary.inventoryPositions > 0
                                        ? 'emerald'
                                        : 'blue'
                                }
                                pattern="bars"
                            />
                        )}
                    </DashboardPanel>

                    <DashboardPanel
                        title="Recent Stock Activity"
                        description="Latest receiving, release, transfer, and adjustment events."
                        icon={RefreshCw}
                        actionLabel="View Stock Movements"
                        href="/stock-movements"
                        accent="blue"
                    >
                        {recentMovements.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {recentMovements.map(
                                    (movement) => (
                                        <MovementRow
                                            key={movement.id}
                                            movement={movement}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <OperationalEmptyState
                                icon={Database}
                                title="Activity timeline is ready"
                                description="Receiving, adjustments, transfers, and releases will automatically appear here."
                                href="/inventory/stocks"
                                actionLabel="Record stock activity"
                                tone="blue"
                                pattern="timeline"
                            />
                        )}
                    </DashboardPanel>
                </section>
            </main>
        </AppLayout>
    );
}

function DashboardHeader({
    range,
    periodLabel,
    context,
    hasOperationalData,
    onRangeChange,
}: {
    range: RangeKey;
    periodLabel: string;
    context: DashboardProps['context'];
    hasOperationalData: boolean;
    onRangeChange: (range: RangeKey) => void;
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-card/75 shadow-[0_12px_40px_rgba(37,99,235,0.06)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(34,211,238,0.08),transparent_28%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/55 to-transparent" />

            <div className="relative flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_48%)]" />
                        <DashboardGlyph className="relative size-5" />

                        <span
                            className={[
                                'absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-card',
                                hasOperationalData
                                    ? 'bg-cyan-400'
                                    : 'bg-blue-400',
                            ].join(' ')}
                        />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-base font-semibold tracking-tight">
                                Inventory Operations Dashboard
                            </h1>

                            <span
                                className={[
                                    'inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-[9px] font-semibold uppercase tracking-[0.12em]',
                                    hasOperationalData
                                        ? 'border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-300'
                                        : 'border-blue-500/20 bg-blue-500/[0.07] text-blue-300',
                                ].join(' ')}
                            >
                                {hasOperationalData ? (
                                    <Activity className="size-2.5" />
                                ) : (
                                    <Sparkles className="size-2.5" />
                                )}

                                {hasOperationalData
                                    ? 'Live Operations'
                                    : 'System Ready'}
                            </span>
                        </div>

                        <p className="mt-1 hidden max-w-2xl text-[11px] leading-5 text-muted-foreground sm:block">
                            Monitor stock health, procurement,
                            warehouse flow, and operational
                            alerts for {context.scopeLabel}.
                        </p>

                        <div className="mt-2 hidden flex-wrap items-center gap-2 text-[9px] text-muted-foreground sm:flex">
                            <ContextPill
                                icon={Boxes}
                                label={`${context.activeProducts} active products`}
                            />
                            <ContextPill
                                icon={Building2}
                                label={`${context.activeBranches} active branches`}
                            />
                            <ContextPill
                                icon={Warehouse}
                                label={`${context.activeWarehouses} active warehouses`}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 rounded-xl border border-blue-500/10 bg-blue-500/[0.035] px-3 py-2">
                        <CalendarDays className="size-3.5 text-blue-400" />

                        <div>
                            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Reporting Period
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium">
                                {periodLabel}
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex rounded-xl border border-blue-500/10 bg-blue-500/[0.035] p-1">
                        {(
                            [
                                ['7d', '7D'],
                                ['30d', '30D'],
                                ['90d', '90D'],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() =>
                                    onRangeChange(value)
                                }
                                className={[
                                    'h-8 rounded-lg px-3 text-[10px] font-semibold transition',
                                    range === value
                                        ? 'bg-blue-500 text-white shadow-[0_6px_18px_rgba(59,130,246,0.22)]'
                                        : 'text-muted-foreground hover:bg-blue-500/[0.07] hover:text-blue-300',
                                ].join(' ')}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ContextPill({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/[0.035] px-2 py-1">
            <Icon className="size-3 text-blue-400" />
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
    change,
    statusLabel,
    statusTone,
    sparkValues,
}: {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    tone: Tone;
    change: number | null;
    statusLabel: string;
    statusTone: StatusTone;
    sparkValues: number[];
}) {
    const toneMap: Record<
        Tone,
        {
            icon: string;
            value: string;
            glow: string;
            line: string;
        }
    > = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            glow: 'from-emerald-500/[0.07]',
            line: 'text-emerald-400',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
            glow: 'from-blue-500/[0.075]',
            line: 'text-blue-400',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
            glow: 'from-violet-500/[0.075]',
            line: 'text-violet-400',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            glow: 'from-amber-500/[0.075]',
            line: 'text-amber-400',
        },
        red: {
            icon: 'border-red-500/15 bg-red-500/10 text-red-400',
            value: 'text-red-400',
            glow: 'from-red-500/[0.075]',
            line: 'text-red-400',
        },
        cyan: {
            icon: 'border-cyan-500/15 bg-cyan-500/10 text-cyan-400',
            value: 'text-cyan-400',
            glow: 'from-cyan-500/[0.075]',
            line: 'text-cyan-400',
        },
    };

    const styles = toneMap[tone];
    const positive = (change ?? 0) >= 0;

    return (
        <article className="group relative min-h-[134px] overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-3.5 transition hover:border-blue-500/15 sm:p-4">
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

                {change !== null ? (
                    <span
                        className={[
                            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold',
                            positive
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400',
                        ].join(' ')}
                    >
                        {positive ? (
                            <ArrowUpRight className="size-3" />
                        ) : (
                            <ArrowDownRight className="size-3" />
                        )}

                        {Math.abs(change).toFixed(1)}%
                    </span>
                ) : (
                    <StatusPill
                        label={statusLabel}
                        tone={statusTone}
                    />
                )}
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
    const normalized = values.length >= 2
        ? values
        : [0, 0, 0, 0, 0];

    const hasValues = normalized.some(
        (value) => value > 0,
    );

    const max = Math.max(...normalized, 1);
    const points = normalized.map((value, index) => ({
        x:
            normalized.length <= 1
                ? 0
                : (index / (normalized.length - 1)) *
                  138,
        y: 38 - (value / max) * 30,
    }));

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

                {[18, 52, 86, 120].map((x) => (
                    <circle
                        key={x}
                        cx={x}
                        cy="27"
                        r="2"
                        fill="currentColor"
                        className="text-blue-400/25"
                    />
                ))}
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
        blue:
            'border-blue-500/15 bg-blue-500/10 text-blue-300',
        amber:
            'border-amber-500/15 bg-amber-500/10 text-amber-400',
        red:
            'border-red-500/15 bg-red-500/10 text-red-400',
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

function ChartCard({
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
    accent: 'blue' | 'cyan' | 'violet';
    children: ReactNode;
}) {
    const accentMap = {
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/[0.06] text-blue-400',
            badge: 'border-blue-500/10 bg-blue-500/[0.035] text-blue-300/80',
            line: 'via-blue-400/45',
        },
        cyan: {
            icon: 'border-cyan-500/15 bg-cyan-500/[0.06] text-cyan-400',
            badge: 'border-cyan-500/10 bg-cyan-500/[0.035] text-cyan-300/80',
            line: 'via-cyan-400/45',
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
                    accentMap.line,
                ].join(' ')}
            />

            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className={[
                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                            accentMap.icon,
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
                        accentMap.badge,
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

function InventoryFlowChart({
    points,
    totals,
}: {
    points: FlowPoint[];
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
                <FlowSummary
                    label="Stock In"
                    value={formatQuantity(
                        totals.stockIn,
                    )}
                    tone="cyan"
                />

                <FlowSummary
                    label="Stock Out"
                    value={formatQuantity(
                        totals.stockOut,
                    )}
                    tone="blue"
                />

                <FlowSummary
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
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.08),transparent_55%)]" />

                <svg
                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                    className="relative h-[210px] w-full sm:h-[230px]"
                    role="img"
                    aria-label="Inventory stock-in and stock-out trend"
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
                                stopColor="rgb(34 211 238)"
                                stopOpacity="0.22"
                            />
                            <stop
                                offset="100%"
                                stopColor="rgb(34 211 238)"
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
                                stopColor="rgb(96 165 250)"
                                stopOpacity="0.18"
                            />
                            <stop
                                offset="100%"
                                stopColor="rgb(96 165 250)"
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
                                y={
                                    chart.height -
                                    12
                                }
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
                                stroke="rgb(96 165 250)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <path
                                d={chart.stockInPath}
                                fill="none"
                                stroke="rgb(34 211 238)"
                                strokeWidth="2.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter={`url(#glow-${id})`}
                            />

                            {chart.stockInPoints.map(
                                (point, index) => (
                                    <g
                                        key={`in-${index}`}
                                    >
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill="rgb(10 16 24)"
                                            stroke="rgb(34 211 238)"
                                            strokeWidth="2"
                                        >
                                            <title>
                                                {`${
                                                    points[index]
                                                        .label
                                                }: ${formatQuantity(
                                                    points[
                                                        index
                                                    ].stockIn,
                                                )} stock in`}
                                            </title>
                                        </circle>
                                    </g>
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
                                        stroke="rgb(96 165 250)"
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
                        <ChartReadyState
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
                        <span className="size-1.5 rounded-full bg-cyan-400" />
                        Stock In
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-blue-400" />
                        Stock Out
                    </span>
                </div>
            </div>
        </div>
    );
}

function FlowSummary({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone:
        | 'cyan'
        | 'blue'
        | 'emerald'
        | 'amber';
}) {
    const toneClass = {
        cyan: 'text-cyan-400',
        blue: 'text-blue-400',
        emerald: 'text-emerald-400',
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

function ChartReadyState({
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
                stroke="rgb(96 165 250)"
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
                            fill="rgb(59 130 246)"
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
                    stroke="rgb(59 130 246)"
                    strokeOpacity="0.18"
                />

                <circle
                    cx="-84"
                    cy="0"
                    r="14"
                    fill="rgb(59 130 246)"
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
                    Movement chart ready
                </text>

                <text
                    x="-58"
                    y="13"
                    fill="rgb(148 163 184)"
                    fontSize="8.5"
                >
                    Activity will plot automatically
                </text>
            </g>
        </g>
    );
}

function StockHealthGauge({
    health,
}: {
    health: DashboardProps['stockHealth'];
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
            rgba(59,130,246,0.62),
            rgba(34,211,238,0.20),
            rgba(59,130,246,0.62)
        )`;

    return (
        <div className="flex min-h-[286px] flex-col justify-center">
            <div className="relative mx-auto size-[168px]">
                <div
                    className={[
                        'absolute inset-0 rounded-full',
                        hasData
                            ? 'shadow-[0_0_28px_rgba(52,211,153,0.10)]'
                            : 'shadow-[0_0_30px_rgba(59,130,246,0.12)]',
                    ].join(' ')}
                    style={{
                        background: ringBackground,
                    }}
                />

                <div className="absolute inset-[11px] rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-[20px] rounded-full border border-dashed border-blue-500/15" />

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
                                : 'border-blue-500/15 bg-blue-500/10 text-blue-300',
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
    const toneMap = {
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
                        toneMap.dot,
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
                    toneMap.value,
                ].join(' ')}
            >
                {formatNumber(value)}
            </span>
        </div>
    );
}

function CategoryDistribution({
    slices,
}: {
    slices: CategorySlice[];
}) {
    if (slices.length === 0) {
        return <CategoryReadyState />;
    }

    const gradientStops: string[] = [];
    let currentStop = 0;

    slices.forEach((slice, index) => {
        const nextStop =
            index === slices.length - 1
                ? 100
                : currentStop +
                  slice.percentage;

        gradientStops.push(
            `${categoryColors[
                index % categoryColors.length
            ]} ${currentStop}% ${nextStop}%`,
        );

        currentStop = nextStop;
    });

    const totalValue = slices.reduce(
        (sum, slice) => sum + slice.value,
        0,
    );

    return (
        <div className="grid items-center gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
            <div className="relative mx-auto size-[154px]">
                <div
                    className="absolute inset-0 rounded-full shadow-[0_0_26px_rgba(59,130,246,0.10)]"
                    style={{
                        background: `conic-gradient(${gradientStops.join(
                            ', ',
                        )})`,
                    }}
                />

                <div className="absolute inset-[13px] rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-[23px] flex items-center justify-center rounded-full border border-dashed border-blue-500/15">
                    <div className="max-w-[86px] text-center">
                        <p className="truncate text-sm font-semibold tabular-nums">
                            {formatCurrency(
                                totalValue,
                            )}
                        </p>

                        <p className="mt-1 text-[7px] uppercase tracking-[0.13em] text-muted-foreground">
                            Stock Value
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {slices.map((slice, index) => (
                    <div
                        key={slice.label}
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
                                    {slice.label}
                                </span>
                            </span>

                            <span className="text-[10px] font-semibold tabular-nums">
                                {slice.percentage.toFixed(
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
                                        slice.percentage,
                                        2,
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
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
            label: 'Receive stock',
            href: '/suppliers/receiving',
            icon: PackagePlus,
        },
    ];

    return (
        <div className="grid min-h-[230px] items-center gap-5 sm:grid-cols-[150px_minmax(0,1fr)]">
            <div className="relative mx-auto size-[142px]">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_220deg,rgba(59,130,246,0.52),rgba(34,211,238,0.12),rgba(139,92,246,0.28),rgba(59,130,246,0.52))] shadow-[0_0_28px_rgba(59,130,246,0.10)]" />
                <div className="absolute inset-[12px] rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-[23px] flex flex-col items-center justify-center rounded-full border border-dashed border-blue-500/20 text-center">
                    <Layers3 className="size-5 text-blue-400" />
                    <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Mix Ready
                    </p>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold">
                    Category intelligence is ready
                </p>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    Stock value will automatically form
                    this distribution once inventory is
                    assigned to product categories.
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
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-[9px] text-muted-foreground transition hover:border-blue-500/15 hover:bg-blue-500/[0.04] hover:text-blue-300"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Icon className="size-3.5 text-blue-400" />
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

function ProcurementFlow({
    stages,
}: {
    stages: PipelineStage[];
}) {
    const total = stages.reduce(
        (sum, stage) => sum + stage.count,
        0,
    );
    const maxCount = Math.max(
        ...stages.map((stage) => stage.count),
        1,
    );

    const stageStyles: Record<
        string,
        {
            bar: string;
            shell: string;
            icon: LucideIcon;
            index: string;
        }
    > = {
        draft: {
            bar: 'bg-slate-400',
            shell: 'border-slate-500/15 bg-slate-500/[0.05] text-slate-300',
            icon: ClipboardList,
            index: '01',
        },
        pending: {
            bar: 'bg-amber-400',
            shell: 'border-amber-500/15 bg-amber-500/[0.05] text-amber-400',
            icon: Clock3,
            index: '02',
        },
        approved: {
            bar: 'bg-blue-400',
            shell: 'border-blue-500/15 bg-blue-500/[0.05] text-blue-400',
            icon: CheckCircle2,
            index: '03',
        },
        partially_received: {
            bar: 'bg-violet-400',
            shell: 'border-violet-500/15 bg-violet-500/[0.05] text-violet-400',
            icon: Truck,
            index: '04',
        },
        received: {
            bar: 'bg-emerald-400',
            shell: 'border-emerald-500/15 bg-emerald-500/[0.05] text-emerald-400',
            icon: PackageCheck,
            index: '05',
        },
        cancelled: {
            bar: 'bg-red-400',
            shell: 'border-red-500/15 bg-red-500/[0.05] text-red-400',
            icon: AlertTriangle,
            index: '06',
        },
    };

    return (
        <div>
            <div className="flex flex-col gap-3 rounded-xl border border-violet-500/10 bg-violet-500/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Current Pipeline
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                        {total > 0
                            ? `${formatNumber(
                                  total,
                              )} orders in progress`
                            : 'Procurement workflow ready'}
                    </p>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/15 bg-violet-500/[0.06] px-2.5 py-1 text-[9px] font-medium text-violet-300">
                    <Truck className="size-3" />
                    {total > 0
                        ? 'Live workload'
                        : 'No active orders'}
                </span>
            </div>

            <div className="relative mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                <div className="pointer-events-none absolute left-6 right-6 top-[28px] hidden h-px bg-gradient-to-r from-slate-400/20 via-violet-400/30 to-emerald-400/20 xl:block" />

                {stages.map((stage) => {
                    const style =
                        stageStyles[stage.key] ??
                        stageStyles.draft;
                    const Icon = style.icon;
                    const percentage =
                        total > 0
                            ? (stage.count / total) *
                              100
                            : 0;
                    const relativeWidth =
                        stage.count > 0
                            ? Math.max(
                                  (stage.count /
                                      maxCount) *
                                      100,
                                  6,
                              )
                            : 0;

                    return (
                        <article
                            key={stage.key}
                            className="relative overflow-hidden rounded-xl border border-border/50 bg-background/30 p-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span
                                    className={[
                                        'relative z-10 inline-flex size-9 items-center justify-center rounded-xl border',
                                        style.shell,
                                    ].join(' ')}
                                >
                                    <Icon className="size-4" />
                                </span>

                                <span className="font-mono text-[8px] text-muted-foreground/50">
                                    {style.index}
                                </span>
                            </div>

                            <div className="mt-3 flex items-end justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-[10px] font-medium">
                                        {stage.label}
                                    </p>

                                    <p className="mt-0.5 text-[8px] text-muted-foreground">
                                        {percentage.toFixed(
                                            0,
                                        )}
                                        % of pipeline
                                    </p>
                                </div>

                                <p className="text-xl font-semibold tabular-nums">
                                    {formatNumber(
                                        stage.count,
                                    )}
                                </p>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={[
                                        'h-full rounded-full transition-all duration-500',
                                        style.bar,
                                    ].join(' ')}
                                    style={{
                                        width: `${relativeWidth}%`,
                                    }}
                                />
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}

function DashboardPanel({
    title,
    description,
    icon: Icon,
    actionLabel,
    href,
    accent,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel: string;
    href: string;
    accent: 'blue' | 'amber';
    children: ReactNode;
}) {
    const accentMap = {
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/[0.055] text-blue-400',
            action: 'border-blue-500/15 bg-blue-500/[0.045] text-blue-300 hover:bg-blue-500/10 hover:text-blue-200',
            line: 'via-blue-400/40',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/[0.055] text-amber-400',
            action: 'border-amber-500/15 bg-amber-500/[0.045] text-amber-300 hover:bg-amber-500/10 hover:text-amber-200',
            line: 'via-amber-400/40',
        },
    }[accent];

    return (
        <section className="relative min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div
                className={[
                    'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
                    accentMap.line,
                ].join(' ')}
            />

            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className={[
                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                            accentMap.icon,
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
                        accentMap.action,
                    ].join(' ')}
                >
                    {actionLabel}
                    <ChevronRight className="size-3" />
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
    tone: 'blue' | 'emerald';
    pattern: 'bars' | 'timeline';
}) {
    const toneMap = {
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/[0.06] text-blue-400',
            button: 'border-blue-500/15 bg-blue-500/[0.055] text-blue-300 hover:bg-blue-500/10',
            accent: 'bg-blue-400/40',
        },
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400',
            button: 'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-300 hover:bg-emerald-500/10',
            accent: 'bg-emerald-400/40',
        },
    }[tone];

    return (
        <div className="relative min-h-[220px] overflow-hidden px-5 py-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(59,130,246,0.06),transparent_58%)]" />

            <div className="relative mx-auto max-w-md text-center">
                <span
                    className={[
                        'inline-flex size-11 items-center justify-center rounded-xl border shadow-sm',
                        toneMap.icon,
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
                        toneMap.button,
                    ].join(' ')}
                >
                    {actionLabel}
                    <ArrowRight className="size-3" />
                </Link>
            </div>

            <div className="relative mx-auto mt-5 max-w-lg">
                {pattern === 'bars' ? (
                    <div className="flex h-12 items-end justify-center gap-2 rounded-xl border border-border/40 bg-background/20 px-4 py-2">
                        {[22, 38, 30, 48, 36, 54, 42].map(
                            (height, index) => (
                                <span
                                    key={index}
                                    className={[
                                        'w-5 rounded-t-sm',
                                        toneMap.accent,
                                    ].join(' ')}
                                    style={{
                                        height: `${height}%`,
                                        opacity:
                                            0.18 +
                                            index * 0.035,
                                    }}
                                />
                            ),
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[0, 1, 2].map((row) => (
                            <div
                                key={row}
                                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/20 px-3 py-2"
                            >
                                <span
                                    className={[
                                        'size-2 rounded-full',
                                        toneMap.accent,
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

function StockAlertRow({
    alert,
}: {
    alert: AlertItem;
}) {
    const critical =
        alert.severity === 'critical';

    return (
        <article className="flex items-center gap-3 px-3.5 py-3 transition hover:bg-muted/[0.025] sm:px-4">
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
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[11px] font-semibold">
                        {alert.product}
                    </p>

                    <span
                        className={[
                            'rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider',
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
                    Reorder at{' '}
                    {formatQuantity(
                        alert.reorderLevel,
                    )}
                </p>
            </div>
        </article>
    );
}

function MovementRow({
    movement,
}: {
    movement: MovementItem;
}) {
    const isTransfer =
        movement.movementType === 'Transfer';
    const isAdjustment =
        movement.movementType === 'Adjustment';

    const Icon = isTransfer
        ? Truck
        : isAdjustment
          ? RefreshCw
          : movement.direction === 'in'
            ? PackageCheck
            : ShoppingCart;

    const shell = isTransfer
        ? 'border-violet-500/15 bg-violet-500/10 text-violet-400'
        : isAdjustment
          ? 'border-amber-500/15 bg-amber-500/10 text-amber-400'
          : movement.direction === 'in'
            ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
            : 'border-blue-500/15 bg-blue-500/10 text-blue-400';

    const quantityClass = isTransfer
        ? 'text-violet-400'
        : isAdjustment
          ? 'text-amber-400'
          : movement.direction === 'in'
            ? 'text-emerald-400'
            : 'text-blue-400';

    const prefix =
        movement.direction === 'in'
            ? '+'
            : movement.direction === 'out'
              ? '-'
              : '';

    return (
        <article className="flex items-center gap-3 px-3.5 py-3 transition hover:bg-muted/[0.025] sm:px-4">
            <span
                className={[
                    'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                    shell,
                ].join(' ')}
            >
                <Icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[11px] font-semibold">
                        {movement.product}
                    </p>

                    <span className="rounded-full border border-border/60 bg-background/45 px-2 py-0.5 text-[8px] font-medium text-muted-foreground">
                        {movement.movementType}
                    </span>
                </div>

                <p className="mt-1 truncate text-[9px] text-muted-foreground">
                    {movement.reference} ·{' '}
                    {movement.warehouse}
                </p>
            </div>

            <div className="shrink-0 text-right">
                <p
                    className={[
                        'text-sm font-semibold tabular-nums',
                        quantityClass,
                    ].join(' ')}
                >
                    {prefix}
                    {formatQuantity(
                        movement.quantity,
                    )}
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                    {formatRelativeDate(
                        movement.occurredAt,
                    )}
                </p>
            </div>
        </article>
    );
}

function DashboardGlyph({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <rect
                x="3"
                y="3"
                width="7"
                height="8"
                rx="2"
            />
            <rect
                x="14"
                y="3"
                width="7"
                height="5"
                rx="2"
            />
            <rect
                x="14"
                y="12"
                width="7"
                height="9"
                rx="2"
            />
            <rect
                x="3"
                y="15"
                width="7"
                height="6"
                rx="2"
            />
        </svg>
    );
}

function buildInventoryPulse(
    points: FlowPoint[],
): number[] {
    let running = 0;

    return points.map((point) => {
        running += point.stockIn - point.stockOut;

        return Math.max(running, 0);
    });
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

function formatRelativeDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const seconds = Math.round(
        (date.getTime() - Date.now()) / 1000,
    );

    const formatter =
        new Intl.RelativeTimeFormat('en', {
            numeric: 'auto',
        });

    const divisions: Array<{
        amount: number;
        unit: Intl.RelativeTimeFormatUnit;
    }> = [
        {
            amount: 60,
            unit: 'second',
        },
        {
            amount: 60,
            unit: 'minute',
        },
        {
            amount: 24,
            unit: 'hour',
        },
        {
            amount: 7,
            unit: 'day',
        },
        {
            amount: 4.34524,
            unit: 'week',
        },
        {
            amount: 12,
            unit: 'month',
        },
        {
            amount: Number.POSITIVE_INFINITY,
            unit: 'year',
        },
    ];

    let duration = seconds;

    for (const division of divisions) {
        if (
            Math.abs(duration) <
            division.amount
        ) {
            return formatter.format(
                Math.round(duration),
                division.unit,
            );
        }

        duration /= division.amount;
    }

    return value;
}