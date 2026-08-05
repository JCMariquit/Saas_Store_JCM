import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    Bell,
    Boxes,
    CheckCircle2,
    ChevronDown,
    Clock3,
    CreditCard,
    Layers3,
    MessageCircle,
    PackageCheck,
    ReceiptText,
    ShieldCheck,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import React from 'react';

import { PageHero } from '@/components/admin-ui/page-hero';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';

type StatProps = {
    total_users: number;
    active_users: number;
    clients: number;
    total_products: number;
    active_products: number;
    total_services: number;
    active_services: number;
    total_plans: number;
    active_plans: number;
    total_orders: number;
    pending_orders: number;
    verified_orders: number;
    orders_today: number;
    total_revenue: number;
    monthly_revenue: number;
    pending_payment_amount: number;
    total_subscriptions: number;
    active_subscriptions: number;
    pending_subscriptions: number;
    expired_subscriptions: number;
    submitted_transactions: number;
    unread_messages: number;
    unread_notifications: number;
};

type BasicChartRow = {
    label: string;
    value: number;
};

type TrendRow = {
    label: string;
    revenue: number;
    pending_orders: number;
    verified_orders: number;
    rejected_orders: number;
    total_orders: number;
};

type TopItemRow = {
    label: string;
    revenue: number;
    sales: number;
};

type AnalyticsTableRow = {
    order_code: string;
    order_status: string;
    amount: number | string;
    created_at: string | null;
    user_name: string | null;
    item_name: string | null;
    payment_status: string;
    transaction_code: string;
};

type RecentOrder = {
    id: number;
    order_code: string;
    user_name: string | null;
    item_name: string | null;
    amount: number | string;
    status: string;
    created_at: string | null;
};

type RecentTransaction = {
    id: number;
    transaction_code: string;
    order_code: string | null;
    user_name: string | null;
    amount: number | string;
    status: string;
    payment_method: string;
    created_at: string | null;
};

type PageProps = {
    stats: StatProps;
    charts: {
        trend: TrendRow[];
        orders_by_status: BasicChartRow[];
        subscriptions_by_status: BasicChartRow[];
        sales_mix: BasicChartRow[];
        payment_status_mix: BasicChartRow[];
        top_items: TopItemRow[];
    };
    analyticsTable: AnalyticsTableRow[];
    recentOrders: RecentOrder[];
    recentTransactions: RecentTransaction[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Main Overview',
        href: '/admin/dashboard',
    },
];

function formatMoney(value: number | string | null | undefined) {
    const numeric = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number.isNaN(numeric) ? 0 : numeric);
}

function formatDate(value: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
}

function getStatusBadgeClass(status: string) {
    switch (status) {
        case 'verified':
        case 'active':
        case 'paid':
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
        case 'pending':
        case 'submitted':
            return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
        case 'rejected':
        case 'failed':
        case 'expired':
            return 'border-red-500/20 bg-red-500/10 text-red-300';
        case 'cancelled':
        case 'locked':
            return 'border-border bg-muted text-foreground';
        default:
            return 'border-primary/20 bg-primary/[0.06] text-primary';
    }
}

function AnalyticsTrendChart({ rows, onOpen }: { rows: TrendRow[]; onOpen: () => void }) {
    const maxRevenue = Math.max(...rows.map((row) => Number(row.revenue)), 1);
    const maxOrders = Math.max(...rows.map((row) => Number(row.total_orders)), 1);

    const width = 900;
    const height = 280;
    const chartTop = 35;
    const chartBottom = 220;
    const chartHeight = chartBottom - chartTop;
    const gap = width / Math.max(rows.length, 1);

    const points = rows.map((row, index) => {
        const x = gap * index + gap / 2;
        const y = chartBottom - (Number(row.revenue) / maxRevenue) * chartHeight;

        return { x, y };
    });

    const areaPath =
        points.length > 0
            ? `M ${points[0].x} ${chartBottom} ` +
              points.map((point) => `L ${point.x} ${point.y}`).join(' ') +
              ` L ${points[points.length - 1].x} ${chartBottom} Z`
            : '';

    const linePath = points.length > 0 ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ') : '';

    return (
        <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-foreground text-lg font-bold">Revenue Mountain + Nested Orders</h2>
                    <p className="text-muted-foreground text-sm">
                        Mountain area shows verified revenue. Stacked bars show pending, verified, and rejected orders.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onOpen}
                    className="border-primary/20 bg-primary/[0.06] text-primary hover:bg-primary/10 rounded-xl border px-4 py-2 text-sm font-semibold"
                >
                    View Data Table
                </button>
            </div>

            <div className="mt-5 overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[760px]">
                    <defs>
                        <linearGradient id="revenueMountain" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
                        </linearGradient>
                    </defs>

                    {[0, 1, 2, 3].map((line) => {
                        const y = chartTop + (chartHeight / 3) * line;

                        return <line key={line} x1="20" x2={width - 20} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="6 6" />;
                    })}

                    {areaPath && <path d={areaPath} fill="url(#revenueMountain)" />}
                    {linePath && <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" />}

                    {points.map((point, index) => (
                        <circle key={index} cx={point.x} cy={point.y} r="4" fill="#2563eb" />
                    ))}

                    {rows.map((row, index) => {
                        const centerX = gap * index + gap / 2;
                        const barWidth = Math.min(42, gap * 0.45);
                        const totalHeight = (Number(row.total_orders) / maxOrders) * 130;
                        const pendingHeight = row.total_orders ? (row.pending_orders / row.total_orders) * totalHeight : 0;
                        const verifiedHeight = row.total_orders ? (row.verified_orders / row.total_orders) * totalHeight : 0;
                        const rejectedHeight = row.total_orders ? (row.rejected_orders / row.total_orders) * totalHeight : 0;

                        const baseY = chartBottom;
                        const x = centerX - barWidth / 2;

                        return (
                            <g key={row.label}>
                                <rect x={x} y={baseY - pendingHeight} width={barWidth} height={pendingHeight} rx="5" fill="#f59e0b" />
                                <rect
                                    x={x}
                                    y={baseY - pendingHeight - verifiedHeight}
                                    width={barWidth}
                                    height={verifiedHeight}
                                    rx="5"
                                    fill="#10b981"
                                />
                                <rect
                                    x={x}
                                    y={baseY - pendingHeight - verifiedHeight - rejectedHeight}
                                    width={barWidth}
                                    height={rejectedHeight}
                                    rx="5"
                                    fill="#ef4444"
                                />

                                <text x={centerX} y="252" textAnchor="middle" fontSize="12" fill="#475569">
                                    {row.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium">
                <span className="text-primary inline-flex items-center gap-2">
                    <span className="bg-primary h-3 w-3 rounded-full" /> Revenue Mountain
                </span>
                <span className="inline-flex items-center gap-2 text-amber-300">
                    <span className="h-3 w-3 rounded-full bg-amber-500" /> Pending Orders
                </span>
                <span className="inline-flex items-center gap-2 text-emerald-300">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" /> Verified Orders
                </span>
                <span className="inline-flex items-center gap-2 text-red-300">
                    <span className="h-3 w-3 rounded-full bg-red-500" /> Rejected Orders
                </span>
            </div>
        </div>
    );
}

function NestedPieChart({ title, description, rows, onOpen }: { title: string; description: string; rows: BasicChartRow[]; onOpen: () => void }) {
    const total = rows.reduce((sum, row) => sum + Number(row.value), 0);
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    let cumulative = 0;

    return (
        <button
            type="button"
            onClick={onOpen}
            className="border-border bg-card rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div>
                <h3 className="text-foreground text-base font-bold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            </div>

            <div className="mt-5 flex items-center gap-5">
                <div className="relative h-32 w-32 shrink-0">
                    <svg viewBox="0 0 42 42" className="h-32 w-32 -rotate-90">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="7" />

                        {total > 0 &&
                            rows.map((row, index) => {
                                const value = Number(row.value);
                                const percentage = (value / total) * 100;
                                const dashArray = `${percentage} ${100 - percentage}`;
                                const dashOffset = -cumulative;
                                cumulative += percentage;

                                return (
                                    <circle
                                        key={row.label}
                                        cx="21"
                                        cy="21"
                                        r="15.915"
                                        fill="transparent"
                                        stroke={colors[index % colors.length]}
                                        strokeWidth="7"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={dashOffset}
                                    />
                                );
                            })}

                        <circle cx="21" cy="21" r="8.8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-foreground text-xl font-bold">{total}</span>
                        <span className="text-muted-foreground text-[10px] tracking-wide uppercase">Total</span>
                    </div>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                    {rows.length === 0 && <p className="text-muted-foreground text-sm">No data available.</p>}

                    {rows.map((row, index) => (
                        <div key={row.label} className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                <span className="text-foreground truncate text-sm font-medium">{row.label}</span>
                            </div>
                            <span className="text-foreground text-sm font-bold">{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-primary mt-4 text-xs font-semibold">Click to view modal table</p>
        </button>
    );
}

function AnalyticsModal({ open, title, rows, onClose }: { open: boolean; title: string; rows: AnalyticsTableRow[]; onClose: () => void }) {
    const [openRows, setOpenRows] = React.useState<Record<string, boolean>>({});

    if (!open) return null;

    const toggleRow = (key: string) => {
        setOpenRows((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className="fixed inset-0 z-[999]">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-card absolute inset-x-3 top-6 mx-auto max-h-[90vh] max-w-6xl overflow-hidden rounded-3xl shadow-2xl">
                <div className="border-border from-primary/[0.06] to-card flex items-center justify-between border-b bg-gradient-to-r px-5 py-4">
                    <div>
                        <h2 className="text-foreground text-lg font-bold">{title}</h2>
                        <p className="text-muted-foreground text-sm">Accordion table view for dashboard analytics.</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="border-border bg-card text-muted-foreground hover:bg-muted rounded-xl border p-2"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-4">
                    <div className="border-border overflow-hidden rounded-2xl border">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-muted/30 text-muted-foreground text-xs tracking-wide uppercase">
                                <tr>
                                    <th className="px-4 py-3">Order</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3">Order Status</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-center">Details</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-muted-foreground px-4 py-10 text-center">
                                            No analytics records available.
                                        </td>
                                    </tr>
                                )}

                                {rows.map((row, index) => {
                                    const key = `${row.order_code}-${index}`;
                                    const isOpen = !!openRows[key];

                                    return (
                                        <React.Fragment key={key}>
                                            <tr className="bg-card hover:bg-muted/30">
                                                <td className="text-foreground px-4 py-3 font-semibold">{row.order_code}</td>
                                                <td className="text-foreground px-4 py-3">{row.user_name ?? '-'}</td>
                                                <td className="text-foreground px-4 py-3">{row.item_name ?? '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(row.order_status)}`}
                                                    >
                                                        {row.order_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(row.payment_status)}`}
                                                    >
                                                        {row.payment_status}
                                                    </span>
                                                </td>
                                                <td className="text-foreground px-4 py-3 text-right font-bold">{formatMoney(row.amount)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRow(key)}
                                                        className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold"
                                                    >
                                                        View
                                                        <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </td>
                                            </tr>

                                            {isOpen && (
                                                <tr className="bg-muted/30">
                                                    <td colSpan={7} className="px-4 py-4">
                                                        <div className="border-border bg-card grid gap-4 rounded-2xl border p-4 md:grid-cols-4">
                                                            <div>
                                                                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                                                                    Transaction Code
                                                                </p>
                                                                <p className="text-foreground mt-1 font-semibold">{row.transaction_code}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-muted-foreground text-xs tracking-wide uppercase">Created Date</p>
                                                                <p className="text-foreground mt-1 font-semibold">{formatDate(row.created_at)}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-muted-foreground text-xs tracking-wide uppercase">Order Status</p>
                                                                <p className="text-foreground mt-1 font-semibold capitalize">{row.order_status}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                                                                    Payment Status
                                                                </p>
                                                                <p className="text-foreground mt-1 font-semibold capitalize">{row.payment_status}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminIndex() {
    const { props } = usePage<PageProps>();
    const { stats, charts, analyticsTable, recentOrders, recentTransactions } = props;
    const [modalTitle, setModalTitle] = React.useState('Analytics Data');
    const [openModal, setOpenModal] = React.useState(false);

    const openAnalyticsModal = (title: string) => {
        setModalTitle(title);
        setOpenModal(true);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Main Overview" />

            <div className="bg-background min-h-screen p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        eyebrow="Platform-wide Summary"
                        title="Main Overview"
                        description="A platform-wide summary of systems, accounts, commerce, payments, subscriptions, and operational activity."
                        actionLabel="View Orders"
                        onAction={() => router.visit(route('admin.orders.index'))}
                        actionIcon={<ShoppingCart className="h-4 w-4" />}
                    />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard
                            title="Total Revenue"
                            value={formatMoney(stats.total_revenue)}
                            description="Verified transaction revenue."
                            icon={<Wallet className="h-5 w-5" />}
                            tone="emerald"
                        />
                        <StatsCard
                            title="Monthly Revenue"
                            value={formatMoney(stats.monthly_revenue)}
                            description="Verified revenue this month."
                            icon={<TrendingUp className="h-5 w-5" />}
                            tone="blue"
                        />
                        <StatsCard
                            title="Total Orders"
                            value={stats.total_orders}
                            description={`${stats.orders_today} order(s) created today.`}
                            icon={<ReceiptText className="h-5 w-5" />}
                            tone="indigo"
                        />
                        <StatsCard
                            title="Active Subscriptions"
                            value={stats.active_subscriptions}
                            description={`${stats.pending_subscriptions} pending subscription(s).`}
                            icon={<ShieldCheck className="h-5 w-5" />}
                            tone="emerald"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard
                            title="Users"
                            value={stats.total_users}
                            description={`${stats.active_users} active account(s), ${stats.clients} client(s).`}
                            icon={<Users className="h-5 w-5" />}
                            tone="blue"
                        />
                        <StatsCard
                            title="Products"
                            value={stats.total_products}
                            description={`${stats.active_products} active product(s).`}
                            icon={<Boxes className="h-5 w-5" />}
                            tone="indigo"
                        />
                        <StatsCard
                            title="Services"
                            value={stats.total_services}
                            description={`${stats.active_services} active service(s).`}
                            icon={<PackageCheck className="h-5 w-5" />}
                            tone="emerald"
                        />
                        <StatsCard
                            title="Plans"
                            value={stats.total_plans}
                            description={`${stats.active_plans} active plan(s).`}
                            icon={<Layers3 className="h-5 w-5" />}
                            tone="amber"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <button
                            type="button"
                            onClick={() => router.visit(route('admin.orders.index'))}
                            className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-amber-300">Pending Orders</p>
                                    <h3 className="text-foreground mt-2 text-3xl font-bold">{stats.pending_orders}</h3>
                                </div>
                                <Clock3 className="h-8 w-8 text-amber-600" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.visit(route('admin.transactions.index'))}
                            className="border-primary/20 bg-primary/[0.06] rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-primary text-sm font-medium">Submitted Payments</p>
                                    <h3 className="text-foreground mt-2 text-3xl font-bold">{stats.submitted_transactions}</h3>
                                </div>
                                <CreditCard className="text-primary h-8 w-8" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('admin-drawer-open', { detail: 'messages' }))}
                            className="border-primary/20 bg-primary/10 rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-primary text-sm font-medium">Unread Messages</p>
                                    <h3 className="text-foreground mt-2 text-3xl font-bold">{stats.unread_messages}</h3>
                                </div>
                                <MessageCircle className="text-primary h-8 w-8" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('admin-drawer-open', { detail: 'notifications' }))}
                            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-red-300">Unread Notifications</p>
                                    <h3 className="text-foreground mt-2 text-3xl font-bold">{stats.unread_notifications}</h3>
                                </div>
                                <Bell className="h-8 w-8 text-red-400" />
                            </div>
                        </button>
                    </div>

                    <AnalyticsTrendChart rows={charts.trend} onOpen={() => openAnalyticsModal('Revenue Trend Data')} />

                    <div className="grid gap-6 xl:grid-cols-4">
                        <NestedPieChart
                            title="Orders by Status"
                            description="Nested status distribution of all orders."
                            rows={charts.orders_by_status}
                            onOpen={() => openAnalyticsModal('Orders by Status Data')}
                        />

                        <NestedPieChart
                            title="Subscriptions by Status"
                            description="Lifecycle distribution of subscriptions."
                            rows={charts.subscriptions_by_status}
                            onOpen={() => openAnalyticsModal('Subscriptions by Status Data')}
                        />

                        <NestedPieChart
                            title="Sales Mix"
                            description="Product, service, and unassigned order mix."
                            rows={charts.sales_mix}
                            onOpen={() => openAnalyticsModal('Sales Mix Data')}
                        />

                        <NestedPieChart
                            title="Payment Status"
                            description="Payment verification and submission mix."
                            rows={charts.payment_status_mix}
                            onOpen={() => openAnalyticsModal('Payment Status Data')}
                        />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-3">
                        <SectionCard title="Top Revenue Items" description="Best-performing products or services based on verified transactions.">
                            <div className="space-y-4">
                                {charts.top_items.length === 0 && (
                                    <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">
                                        No verified sales yet.
                                    </div>
                                )}

                                {charts.top_items.map((item) => (
                                    <div key={item.label} className="border-border bg-muted/30 rounded-2xl border p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-foreground font-semibold">{item.label}</p>
                                                <p className="text-muted-foreground mt-1 text-xs">{item.sales} verified transaction(s)</p>
                                            </div>
                                            <p className="text-foreground text-sm font-bold">{formatMoney(item.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="Recent Orders" description="Latest customer order activity.">
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="border-border bg-card rounded-2xl border p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-foreground truncate font-semibold">{order.order_code}</p>
                                                <p className="text-muted-foreground mt-1 truncate text-xs">
                                                    {order.user_name ?? '-'} • {order.item_name ?? '-'}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(order.status)}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{formatDate(order.created_at)}</span>
                                            <span className="text-foreground font-bold">{formatMoney(order.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="Recent Transactions" description="Latest payment submissions and verifications.">
                            <div className="space-y-3">
                                {recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="border-border bg-card rounded-2xl border p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-foreground truncate font-semibold">{transaction.transaction_code}</p>
                                                <p className="text-muted-foreground mt-1 truncate text-xs">
                                                    {transaction.user_name ?? '-'} • {transaction.payment_method.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(transaction.status)}`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{formatDate(transaction.created_at)}</span>
                                            <span className="text-foreground font-bold">{formatMoney(transaction.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Verified Orders</p>
                                    <h3 className="text-foreground text-2xl font-bold">{stats.verified_orders}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Pending Payment Amount</p>
                                    <h3 className="text-foreground text-2xl font-bold">{formatMoney(stats.pending_payment_amount)}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 text-primary rounded-xl p-3">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Subscriptions</p>
                                    <h3 className="text-foreground text-2xl font-bold">{stats.total_subscriptions}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnalyticsModal open={openModal} title={modalTitle} rows={analyticsTable} onClose={() => setOpenModal(false)} />
        </AdminLayout>
    );
}
