import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import {
    AlertCircle,
    BarChart3,
    Bell,
    Boxes,
    CheckCircle2,
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
    ChevronDown,
} from 'lucide-react';

import { PageHero } from '@/components/admin-ui/page-hero';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { SectionCard } from '@/components/admin-ui/section-card';

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
        title: 'Admin Dashboard',
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
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'pending':
        case 'submitted':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'rejected':
        case 'failed':
        case 'expired':
            return 'border-red-200 bg-red-50 text-red-700';
        case 'cancelled':
        case 'locked':
            return 'border-slate-200 bg-slate-100 text-slate-700';
        default:
            return 'border-blue-200 bg-blue-50 text-blue-700';
    }
}

function AnalyticsTrendChart({
    rows,
    onOpen,
}: {
    rows: TrendRow[];
    onOpen: () => void;
}) {
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

    const linePath =
        points.length > 0
            ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
            : '';

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Revenue Mountain + Nested Orders</h2>
                    <p className="text-sm text-slate-500">
                        Mountain area shows verified revenue. Stacked bars show pending, verified, and rejected orders.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onOpen}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
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

                        return (
                            <line
                                key={line}
                                x1="20"
                                x2={width - 20}
                                y1={y}
                                y2={y}
                                stroke="#e2e8f0"
                                strokeDasharray="6 6"
                            />
                        );
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
                                <rect
                                    x={x}
                                    y={baseY - pendingHeight}
                                    width={barWidth}
                                    height={pendingHeight}
                                    rx="5"
                                    fill="#f59e0b"
                                />
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
                <span className="inline-flex items-center gap-2 text-blue-700">
                    <span className="h-3 w-3 rounded-full bg-blue-600" /> Revenue Mountain
                </span>
                <span className="inline-flex items-center gap-2 text-amber-700">
                    <span className="h-3 w-3 rounded-full bg-amber-500" /> Pending Orders
                </span>
                <span className="inline-flex items-center gap-2 text-emerald-700">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" /> Verified Orders
                </span>
                <span className="inline-flex items-center gap-2 text-red-700">
                    <span className="h-3 w-3 rounded-full bg-red-500" /> Rejected Orders
                </span>
            </div>
        </div>
    );
}

function NestedPieChart({
    title,
    description,
    rows,
    onOpen,
}: {
    title: string;
    description: string;
    rows: BasicChartRow[];
    onOpen: () => void;
}) {
    const total = rows.reduce((sum, row) => sum + Number(row.value), 0);
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    let cumulative = 0;

    return (
        <button
            type="button"
            onClick={onOpen}
            className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
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
                        <span className="text-xl font-bold text-slate-900">{total}</span>
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">Total</span>
                    </div>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                    {rows.length === 0 && (
                        <p className="text-sm text-slate-500">No data available.</p>
                    )}

                    {rows.map((row, index) => (
                        <div key={row.label} className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className="h-3 w-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="truncate text-sm font-medium text-slate-700">{row.label}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-blue-600">Click to view modal table</p>
        </button>
    );
}

function AnalyticsModal({
    open,
    title,
    rows,
    onClose,
}: {
    open: boolean;
    title: string;
    rows: AnalyticsTableRow[];
    onClose: () => void;
}) {
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
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-x-3 top-6 mx-auto max-h-[90vh] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                        <p className="text-sm text-slate-500">Accordion table view for dashboard analytics.</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-4">
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
                                        <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                                            No analytics records available.
                                        </td>
                                    </tr>
                                )}

                                {rows.map((row, index) => {
                                    const key = `${row.order_code}-${index}`;
                                    const isOpen = !!openRows[key];

                                    return (
                                        <React.Fragment key={key}>
                                            <tr className="bg-white hover:bg-slate-50">
                                                <td className="px-4 py-3 font-semibold text-slate-900">{row.order_code}</td>
                                                <td className="px-4 py-3 text-slate-700">{row.user_name ?? '-'}</td>
                                                <td className="px-4 py-3 text-slate-700">{row.item_name ?? '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(row.order_status)}`}>
                                                        {row.order_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(row.payment_status)}`}>
                                                        {row.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-900">{formatMoney(row.amount)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRow(key)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                    >
                                                        View
                                                        <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </td>
                                            </tr>

                                            {isOpen && (
                                                <tr className="bg-slate-50/80">
                                                    <td colSpan={7} className="px-4 py-4">
                                                        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">Transaction Code</p>
                                                                <p className="mt-1 font-semibold text-slate-900">{row.transaction_code}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">Created Date</p>
                                                                <p className="mt-1 font-semibold text-slate-900">{formatDate(row.created_at)}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">Order Status</p>
                                                                <p className="mt-1 font-semibold capitalize text-slate-900">{row.order_status}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">Payment Status</p>
                                                                <p className="mt-1 font-semibold capitalize text-slate-900">{row.payment_status}</p>
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
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Admin Dashboard"
                        description="Enterprise-style analytics overview for orders, revenue, payments, subscriptions, and customer activity."
                        actionLabel="View Orders"
                        onAction={() => router.visit(route('admin.orders.index'))}
                        actionIcon={<ShoppingCart className="h-4 w-4" />}
                    />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard title="Total Revenue" value={formatMoney(stats.total_revenue)} description="Verified transaction revenue." icon={<Wallet className="h-5 w-5" />} tone="emerald" />
                        <StatsCard title="Monthly Revenue" value={formatMoney(stats.monthly_revenue)} description="Verified revenue this month." icon={<TrendingUp className="h-5 w-5" />} tone="blue" />
                        <StatsCard title="Total Orders" value={stats.total_orders} description={`${stats.orders_today} order(s) created today.`} icon={<ReceiptText className="h-5 w-5" />} tone="indigo" />
                        <StatsCard title="Active Subscriptions" value={stats.active_subscriptions} description={`${stats.pending_subscriptions} pending subscription(s).`} icon={<ShieldCheck className="h-5 w-5" />} tone="emerald" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard title="Users" value={stats.total_users} description={`${stats.active_users} active account(s), ${stats.clients} client(s).`} icon={<Users className="h-5 w-5" />} tone="blue" />
                        <StatsCard title="Products" value={stats.total_products} description={`${stats.active_products} active product(s).`} icon={<Boxes className="h-5 w-5" />} tone="indigo" />
                        <StatsCard title="Services" value={stats.total_services} description={`${stats.active_services} active service(s).`} icon={<PackageCheck className="h-5 w-5" />} tone="emerald" />
                        <StatsCard title="Plans" value={stats.total_plans} description={`${stats.active_plans} active plan(s).`} icon={<Layers3 className="h-5 w-5" />} tone="amber" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <button type="button" onClick={() => router.visit(route('admin.orders.index'))} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-amber-700">Pending Orders</p>
                                    <h3 className="mt-2 text-3xl font-bold text-amber-900">{stats.pending_orders}</h3>
                                </div>
                                <Clock3 className="h-8 w-8 text-amber-600" />
                            </div>
                        </button>

                        <button type="button" onClick={() => router.visit(route('admin.transactions.index'))} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Submitted Payments</p>
                                    <h3 className="mt-2 text-3xl font-bold text-blue-900">{stats.submitted_transactions}</h3>
                                </div>
                                <CreditCard className="h-8 w-8 text-blue-600" />
                            </div>
                        </button>

                        <button type="button" onClick={() => router.visit(route('admin.messages.index'))} className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-indigo-700">Unread Messages</p>
                                    <h3 className="mt-2 text-3xl font-bold text-indigo-900">{stats.unread_messages}</h3>
                                </div>
                                <MessageCircle className="h-8 w-8 text-indigo-600" />
                            </div>
                        </button>

                        <button type="button" onClick={() => router.visit(route('admin.notifications.index'))} className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-rose-700">Unread Notifications</p>
                                    <h3 className="mt-2 text-3xl font-bold text-rose-900">{stats.unread_notifications}</h3>
                                </div>
                                <Bell className="h-8 w-8 text-rose-600" />
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
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                        No verified sales yet.
                                    </div>
                                )}

                                {charts.top_items.map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{item.label}</p>
                                                <p className="mt-1 text-xs text-slate-500">{item.sales} verified transaction(s)</p>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">{formatMoney(item.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="Recent Orders" description="Latest customer order activity.">
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">{order.order_code}</p>
                                                <p className="mt-1 truncate text-xs text-slate-500">{order.user_name ?? '-'} • {order.item_name ?? '-'}</p>
                                            </div>
                                            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-slate-500">{formatDate(order.created_at)}</span>
                                            <span className="font-bold text-slate-900">{formatMoney(order.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="Recent Transactions" description="Latest payment submissions and verifications.">
                            <div className="space-y-3">
                                {recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">{transaction.transaction_code}</p>
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {transaction.user_name ?? '-'} • {transaction.payment_method.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-slate-500">{formatDate(transaction.created_at)}</span>
                                            <span className="font-bold text-slate-900">{formatMoney(transaction.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Verified Orders</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats.verified_orders}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Pending Payment Amount</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{formatMoney(stats.pending_payment_amount)}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Subscriptions</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats.total_subscriptions}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnalyticsModal
                open={openModal}
                title={modalTitle}
                rows={analyticsTable}
                onClose={() => setOpenModal(false)}
            />
        </AdminLayout>
    );
}