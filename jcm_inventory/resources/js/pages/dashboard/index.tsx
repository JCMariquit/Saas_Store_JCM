import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
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
    Layers3,
    PackageCheck,
    RefreshCw,
    ShoppingCart,
    Truck,
    Warehouse,
    type LucideIcon,
} from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

type RangeKey = '7d' | '30d' | '90d';
type Tone = 'emerald' | 'blue' | 'violet' | 'amber' | 'red' | 'cyan';

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
    const maxFlow = useMemo(() => {
        return Math.max(
            ...inventoryFlow.flatMap((item) => [
                item.stockIn,
                item.stockOut,
            ]),
            1,
        );
    }, [inventoryFlow]);

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
                    onRangeChange={changeRange}
                />

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Received Inventory"
                        value={formatCurrency(summary.receivedValue)}
                        change={summary.receivedValueChange}
                        description="Posted receipt value"
                        icon={CircleDollarSign}
                        tone="cyan"
                    />

                    <MetricCard
                        label="Inventory Value"
                        value={formatCurrency(summary.inventoryValue)}
                        change={null}
                        neutralLabel={`${formatNumber(
                            summary.inventoryPositions,
                        )} positions`}
                        description={`${formatQuantity(
                            summary.totalQuantity,
                        )} available units`}
                        icon={Boxes}
                        tone="blue"
                    />

                    <MetricCard
                        label="Purchase Orders"
                        value={formatNumber(summary.purchaseOrders)}
                        change={summary.purchaseOrdersChange}
                        description="Created in selected period"
                        icon={ClipboardList}
                        tone="violet"
                    />

                    <MetricCard
                        label="Stock Alerts"
                        value={formatNumber(summary.stockAlerts)}
                        change={null}
                        neutralLabel={`${formatNumber(
                            summary.criticalAlerts,
                        )} critical`}
                        description="Low and out-of-stock positions"
                        icon={AlertTriangle}
                        tone="amber"
                    />
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
                    <ChartCard
                        title="Inventory Flow"
                        description="Stock received versus stock released across the selected period."
                        icon={BarChart3}
                        badge={`${formatQuantity(
                            inventoryFlow.reduce(
                                (sum, point) =>
                                    sum +
                                    point.stockIn +
                                    point.stockOut,
                                0,
                            ),
                        )} recorded units`}
                    >
                        <InventoryFlowChart
                            points={inventoryFlow}
                            maxValue={maxFlow}
                        />
                    </ChartCard>

                    <ChartCard
                        title="Stock Health"
                        description="Availability profile across tracked inventory positions."
                        icon={Activity}
                        badge={`${formatNumber(
                            stockHealth.total,
                        )} positions`}
                    >
                        <StockHealthDonut health={stockHealth} />
                    </ChartCard>
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.35fr)]">
                    <ChartCard
                        title="Inventory by Category"
                        description="Distribution of current inventory value."
                        icon={Layers3}
                        badge={`${formatNumber(
                            categoryDistribution.length,
                        )} groups`}
                    >
                        <CategoryPieChart
                            slices={categoryDistribution}
                        />
                    </ChartCard>

                    <ChartCard
                        title="Procurement Pipeline"
                        description="Current purchase-order workload from draft to completion."
                        icon={Truck}
                        badge={`${formatNumber(
                            procurementPipeline.reduce(
                                (sum, stage) =>
                                    sum + stage.count,
                                0,
                            ),
                        )} orders`}
                    >
                        <ProcurementPipeline
                            stages={procurementPipeline}
                        />
                    </ChartCard>
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-2">
                    <DashboardPanel
                        title="Low Stock Alerts"
                        description="Products that have reached or fallen below their reorder level."
                        icon={AlertTriangle}
                        actionLabel="Open Stock Management"
                        href="/inventory/stocks"
                    >
                        {lowStockAlerts.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {lowStockAlerts.map((alert) => (
                                    <StockAlertRow
                                        key={alert.id}
                                        alert={alert}
                                    />
                                ))}
                            </div>
                        ) : (
                            <PanelEmptyState
                                icon={CheckCircle2}
                                title="Stock levels are healthy"
                                description="No tracked inventory position is currently at or below its reorder level."
                            />
                        )}
                    </DashboardPanel>

                    <DashboardPanel
                        title="Recent Stock Activity"
                        description="Latest receiving, release, transfer, and adjustment events."
                        icon={RefreshCw}
                        actionLabel="View Stock Movements"
                        href="/stock-movements"
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
                            <PanelEmptyState
                                icon={RefreshCw}
                                title="No stock activity yet"
                                description="Receiving, adjustments, transfers, and other movements will appear here."
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
    onRangeChange,
}: {
    range: RangeKey;
    periodLabel: string;
    context: DashboardProps['context'];
    onRangeChange: (range: RangeKey) => void;
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-card/75 shadow-[0_10px_35px_rgba(37,99,235,0.06)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(59,130,246,0.11),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(34,211,238,0.075),transparent_28%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            <div className="relative flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        <DashboardGlyph className="size-5" />

                        <span className="absolute -right-1 -top-1 size-2 rounded-full border-2 border-card bg-cyan-400" />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-base font-semibold tracking-tight">
                                Inventory Operations Dashboard
                            </h1>

                            <span className="inline-flex h-5 items-center rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-blue-300">
                                Live Data
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
                    <div className="flex items-center gap-2 rounded-xl border border-blue-500/10 bg-blue-500/[0.03] px-3 py-2">
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

                    <div className="inline-flex rounded-xl border border-blue-500/10 bg-blue-500/[0.03] p-1">
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
    change,
    neutralLabel,
    description,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    change: number | null;
    neutralLabel?: string;
    description: string;
    icon: LucideIcon;
    tone: Tone;
}) {
    const toneMap: Record<
        Tone,
        {
            icon: string;
            value: string;
            surface: string;
        }
    > = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            surface: 'hover:border-emerald-500/15',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
            surface: 'hover:border-blue-500/15',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
            surface: 'hover:border-violet-500/15',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            surface: 'hover:border-amber-500/15',
        },
        red: {
            icon: 'border-red-500/15 bg-red-500/10 text-red-400',
            value: 'text-red-400',
            surface: 'hover:border-red-500/15',
        },
        cyan: {
            icon: 'border-cyan-500/15 bg-cyan-500/10 text-cyan-400',
            value: 'text-cyan-400',
            surface: 'hover:border-cyan-500/15',
        },
    };

    const styles = toneMap[tone];
    const positive = (change ?? 0) >= 0;

    return (
        <article
            className={[
                'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-3.5 transition sm:p-4',
                styles.surface,
            ].join(' ')}
        >
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

            <div className="mt-4 flex items-end justify-between gap-3">
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
                    <span className="inline-flex shrink-0 rounded-full border border-border/60 bg-background/45 px-2 py-1 text-[9px] font-semibold text-muted-foreground">
                        {neutralLabel ?? 'Live total'}
                    </span>
                )}
            </div>
        </article>
    );
}

function ChartCard({
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
            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:px-4 sm:py-3 sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.055] text-blue-400">
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

                <span className="inline-flex h-6 shrink-0 items-center rounded-full border border-blue-500/10 bg-blue-500/[0.035] px-2.5 text-[9px] font-medium text-blue-300/80">
                    {badge}
                </span>
            </div>

            <div className="p-3.5 sm:p-4">{children}</div>
        </section>
    );
}

function InventoryFlowChart({
    points,
    maxValue,
}: {
    points: FlowPoint[];
    maxValue: number;
}) {
    return (
        <div>
            <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-cyan-400" />
                    Stock In
                </span>

                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-400" />
                    Stock Out
                </span>
            </div>

            <div className="mt-4 grid h-[190px] grid-cols-[34px_minmax(0,1fr)] gap-2.5 sm:h-[210px] sm:grid-cols-[38px_minmax(0,1fr)] sm:gap-3">
                <div className="flex flex-col justify-between pb-6 text-right text-[8px] tabular-nums text-muted-foreground">
                    <span>{formatCompact(maxValue)}</span>
                    <span>{formatCompact(maxValue * 0.75)}</span>
                    <span>{formatCompact(maxValue * 0.5)}</span>
                    <span>{formatCompact(maxValue * 0.25)}</span>
                    <span>0</span>
                </div>

                <div className="relative min-w-0">
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[164px] flex-col justify-between sm:h-[184px]">
                        {[0, 1, 2, 3, 4].map((line) => (
                            <span
                                key={line}
                                className="block border-t border-dashed border-border/50"
                            />
                        ))}
                    </div>

                    <div
                        className="relative grid h-full items-end gap-3"
                        style={{
                            gridTemplateColumns: `repeat(${Math.max(
                                points.length,
                                1,
                            )}, minmax(0, 1fr))`,
                        }}
                    >
                        {points.map((point) => (
                            <div
                                key={point.label}
                                className="flex h-full min-w-0 flex-col justify-end"
                            >
                                <div className="flex h-[164px] items-end justify-center gap-1 sm:h-[184px] sm:gap-1.5">
                                    <Bar
                                        value={point.stockIn}
                                        maxValue={maxValue}
                                        className="bg-cyan-400/85"
                                        label={`Stock in ${formatQuantity(
                                            point.stockIn,
                                        )}`}
                                    />

                                    <Bar
                                        value={point.stockOut}
                                        maxValue={maxValue}
                                        className="bg-blue-400/80"
                                        label={`Stock out ${formatQuantity(
                                            point.stockOut,
                                        )}`}
                                    />
                                </div>

                                <p className="mt-2 truncate text-center text-[9px] font-medium text-muted-foreground">
                                    {point.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Bar({
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
            : Math.max((value / maxValue) * 100, 3);

    return (
        <div
            title={label}
            className={[
                'w-full max-w-5 rounded-t-md transition-all duration-500 hover:opacity-100',
                className,
            ].join(' ')}
            style={{ height: `${height}%` }}
        />
    );
}

function StockHealthDonut({
    health,
}: {
    health: DashboardProps['stockHealth'];
}) {
    const total = Math.max(health.total, 1);
    const healthyPercentage = (health.healthy / total) * 100;
    const lowPercentage = (health.lowStock / total) * 100;
    const outPercentage = (health.outOfStock / total) * 100;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const healthyLength =
        (healthyPercentage / 100) * circumference;
    const lowLength =
        (lowPercentage / 100) * circumference;
    const outLength =
        (outPercentage / 100) * circumference;

    return (
        <div className="grid items-center gap-4 sm:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[150px_minmax(0,1fr)]">
            <div className="relative mx-auto size-[145px] sm:size-[150px]">
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
                        strokeWidth="14"
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
                                strokeWidth="14"
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
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeDasharray={`${lowLength} ${
                                    circumference - lowLength
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
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeDasharray={`${outLength} ${
                                    circumference - outLength
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
                            ? `${Math.round(
                                  healthyPercentage,
                              )}%`
                            : '0%'}
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                        Healthy
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <LegendRow
                    label="Healthy Stock"
                    value={formatNumber(health.healthy)}
                    description="Above reorder level"
                    dotClassName="bg-emerald-400"
                />

                <LegendRow
                    label="Low Stock"
                    value={formatNumber(health.lowStock)}
                    description="At or below threshold"
                    dotClassName="bg-amber-400"
                />

                <LegendRow
                    label="Out of Stock"
                    value={formatNumber(
                        health.outOfStock,
                    )}
                    description="No available quantity"
                    dotClassName="bg-red-400"
                />
            </div>
        </div>
    );
}

function CategoryPieChart({
    slices,
}: {
    slices: CategorySlice[];
}) {
    if (slices.length === 0) {
        return (
            <PanelEmptyState
                icon={Layers3}
                title="No category value yet"
                description="Inventory value distribution will appear after stock is added to tracked products."
            />
        );
    }

    const gradientStops: string[] = [];
    let currentStop = 0;

    slices.forEach((slice, index) => {
        const nextStop =
            index === slices.length - 1
                ? 100
                : currentStop + slice.percentage;

        gradientStops.push(
            `${categoryColors[index % categoryColors.length]} ${currentStop}% ${nextStop}%`,
        );

        currentStop = nextStop;
    });

    return (
        <div className="grid items-center gap-4 sm:grid-cols-[145px_minmax(0,1fr)]">
            <div className="relative mx-auto size-[140px] sm:size-[145px]">
                <div
                    className="size-full rounded-full"
                    style={{
                        background: `conic-gradient(${gradientStops.join(
                            ', ',
                        )})`,
                    }}
                />

                <div className="absolute inset-[26%] flex items-center justify-center rounded-full border border-border/60 bg-card">
                    <div className="text-center">
                        <p className="text-lg font-semibold tabular-nums">
                            {formatCurrency(
                                slices.reduce(
                                    (sum, slice) =>
                                        sum + slice.value,
                                    0,
                                ),
                            )}
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                            Total Value
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2.5">
                {slices.map((slice, index) => (
                    <div
                        key={slice.label}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/35 px-3 py-2.5"
                    >
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
                            {slice.percentage.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProcurementPipeline({
    stages,
}: {
    stages: PipelineStage[];
}) {
    const maxCount = Math.max(
        ...stages.map((stage) => stage.count),
        1,
    );

    const stageStyles: Record<
        string,
        {
            bar: string;
            icon: LucideIcon;
        }
    > = {
        draft: {
            bar: 'bg-slate-400',
            icon: ClipboardList,
        },
        pending: {
            bar: 'bg-amber-400',
            icon: Clock3,
        },
        approved: {
            bar: 'bg-blue-400',
            icon: CheckCircle2,
        },
        partially_received: {
            bar: 'bg-violet-400',
            icon: Truck,
        },
        received: {
            bar: 'bg-emerald-400',
            icon: PackageCheck,
        },
        cancelled: {
            bar: 'bg-red-400',
            icon: AlertTriangle,
        },
    };

    return (
        <div className="space-y-3">
            {stages.map((stage) => {
                const style =
                    stageStyles[stage.key] ??
                    stageStyles.draft;
                const Icon = style.icon;
                const width =
                    stage.count > 0
                        ? Math.max(
                              (stage.count / maxCount) * 100,
                              5,
                          )
                        : 0;

                return (
                    <div
                        key={stage.key}
                        className="grid items-center gap-2.5 rounded-xl border border-border/50 bg-background/35 px-3 py-2.5 sm:grid-cols-[140px_minmax(0,1fr)_40px]"
                    >
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
                                <Icon className="size-3.5" />
                            </span>

                            <span className="truncate text-[10px] font-medium">
                                {stage.label}
                            </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                                className={[
                                    'h-full rounded-full transition-all duration-500',
                                    style.bar,
                                ].join(' ')}
                                style={{
                                    width: `${width}%`,
                                }}
                            />
                        </div>

                        <span className="text-right text-xs font-semibold tabular-nums">
                            {formatNumber(stage.count)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function DashboardPanel({
    title,
    description,
    icon: Icon,
    actionLabel,
    href,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel: string;
    href: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:px-4 sm:py-3 sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.055] text-blue-400">
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
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-blue-500/15 bg-blue-500/[0.045] px-2.5 text-[9px] font-semibold text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200"
                >
                    {actionLabel}
                    <ChevronRight className="size-3" />
                </Link>
            </div>

            {children}
        </section>
    );
}

function StockAlertRow({
    alert,
}: {
    alert: AlertItem;
}) {
    const critical = alert.severity === 'critical';

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
                        {critical ? 'Critical' : 'Low'}
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
                    {formatQuantity(alert.reorderLevel)}
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
                    {formatQuantity(movement.quantity)}
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

function LegendRow({
    label,
    value,
    description,
    dotClassName,
}: {
    label: string;
    value: string;
    description: string;
    dotClassName: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/35 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
                <span
                    className={[
                        'size-2.5 shrink-0 rounded-full',
                        dotClassName,
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

            <span className="text-xs font-semibold tabular-nums">
                {value}
            </span>
        </div>
    );
}

function PanelEmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[160px] flex-col items-center justify-center px-5 py-8 text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.05] text-blue-400">
                <Icon className="size-5" />
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
            <rect x="3" y="3" width="7" height="8" rx="2" />
            <rect x="14" y="3" width="7" height="5" rx="2" />
            <rect x="14" y="12" width="7" height="9" rx="2" />
            <rect x="3" y="15" width="7" height="6" rx="2" />
        </svg>
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

    const formatter = new Intl.RelativeTimeFormat(
        'en',
        {
            numeric: 'auto',
        },
    );

    const divisions: Array<{
        amount: number;
        unit: Intl.RelativeTimeFormatUnit;
    }> = [
        { amount: 60, unit: 'second' },
        { amount: 60, unit: 'minute' },
        { amount: 24, unit: 'hour' },
        { amount: 7, unit: 'day' },
        { amount: 4.34524, unit: 'week' },
        { amount: 12, unit: 'month' },
        { amount: Number.POSITIVE_INFINITY, unit: 'year' },
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