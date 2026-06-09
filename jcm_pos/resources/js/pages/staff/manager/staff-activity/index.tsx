import { Head, router } from '@inertiajs/react';
import {
    Activity,
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Database,
    RotateCcw,
    Search,
    ShieldCheck,
    Store,
    UserCheck,
    Wallet,
} from 'lucide-react';
import { ReactNode, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const ACTIVITY_URL = '/staff/manager/staff-activity';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Staff Activity', href: ACTIVITY_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type ActivityLog = {
    id: number;
    tenant_id: number | null;
    branch_id: number | null;
    user_id: number | null;
    role: string | null;
    module: string;
    action: string;
    description: string;
    subject_type?: string | null;
    subject_id?: number | null;
    properties?: Record<string, unknown> | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    branch: Branch;
    logs: {
        data: ActivityLog[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    summary: {
        total_logs: number;
        today_logs: number;
        cash_drawer_logs: number;
        employee_logs: number;
        category_logs: number;
    };
    filters: {
        search?: string | null;
        module?: string | null;
        action?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
    modules: string[];
    actions: string[];
};

function formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function pretty(value?: string | null) {
    if (!value) return '—';

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function moduleClass(module: string) {
    if (module === 'cash_drawer') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    if (module === 'employee') return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
    if (module === 'categories') return 'bg-violet-500/10 text-violet-700 dark:text-violet-300';

    return 'bg-primary/10 text-primary';
}

export default function ManagerStaffActivityIndex({ branch, logs, summary, filters, modules, actions }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [module, setModule] = useState(filters?.module ?? '');
    const [action, setAction] = useState(filters?.action ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');

    const applyFilters = () => {
        router.get(
            ACTIVITY_URL,
            {
                search: search || undefined,
                module: module || undefined,
                action: action || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setModule('');
        setAction('');
        setDateFrom('');
        setDateTo('');

        router.get(ACTIVITY_URL, {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Staff Activity" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UserCheck className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Staff Activity</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Monitor important staff actions, cash drawer movements, and branch activity logs.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>
                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>
                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                    {branch.is_active && <span className="rounded-full border px-3 py-1">Active</span>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-muted/30 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Current Result</p>
                            <p className="mt-1 text-sm font-semibold">
                                Showing {logs.from ?? 0} to {logs.to ?? 0} of {logs.total} logs
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard title="Total Logs" value={summary.total_logs} description="All branch activity logs." icon={<ClipboardList className="size-5" />} />
                    <SummaryCard title="Today" value={summary.today_logs} description="Activities recorded today." icon={<CalendarClock className="size-5" />} variant="success" />
                    <SummaryCard title="Cash Drawer" value={summary.cash_drawer_logs} description="Cash movement logs." icon={<Wallet className="size-5" />} variant="warning" />
                    <SummaryCard title="Employee" value={summary.employee_logs} description="Staff control actions." icon={<ShieldCheck className="size-5" />} />
                    <SummaryCard title="Categories" value={summary.category_logs} description="Category changes." icon={<Database className="size-5" />} variant="danger" />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                        <div className="relative xl:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
                            <Search className="absolute left-3 top-[34px] size-4 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') applyFilters();
                                }}
                                placeholder="Search description, module, action..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <FilterSelect label="Module" value={module} onChange={setModule}>
                            <option value="">All Modules</option>
                            {modules.map((item) => (
                                <option key={item} value={item}>
                                    {pretty(item)}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect label="Action" value={action} onChange={setAction}>
                            <option value="">All Actions</option>
                            {actions.map((item) => (
                                <option key={item} value={item}>
                                    {pretty(item)}
                                </option>
                            ))}
                        </FilterSelect>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => setDateFrom(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 w-[120px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Search className="size-4" />
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Activity Records</h2>
                        <p className="text-sm text-muted-foreground">Latest important actions recorded for this branch.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Date / Time</th>
                                    <th className="px-4 py-3 text-left font-medium">Module</th>
                                    <th className="px-4 py-3 text-left font-medium">Action</th>
                                    <th className="px-4 py-3 text-left font-medium">Role</th>
                                    <th className="px-4 py-3 text-left font-medium">Description</th>
                                    <th className="px-4 py-3 text-left font-medium">IP</th>
                                </tr>
                            </thead>

                            <tbody>
                                {logs.data.length > 0 ? (
                                    logs.data.map((item) => (
                                        <tr key={item.id} className="border-t transition hover:bg-muted/40">
                                            <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatDateTime(item.created_at)}</td>

                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${moduleClass(item.module)}`}>
                                                    {pretty(item.module)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                    {pretty(item.action)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 capitalize text-muted-foreground">{item.role || '—'}</td>

                                            <td className="min-w-[320px] px-4 py-4">
                                                <div className="font-medium">{item.description}</div>
                                                {item.subject_id && (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Subject ID: #{item.subject_id}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{item.ip_address || '—'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <Activity className="size-5 text-muted-foreground" />
                                                </div>

                                                <h3 className="font-medium">No activity logs found</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Important staff activities will appear here once recorded.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.links.length > 0 && (
                        <div className="flex flex-col gap-3 border-t p-4 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {logs.from ?? 0} to {logs.to ?? 0} of {logs.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {logs.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                        className={[
                                            'inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition',
                                            link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                            !link.url ? 'cursor-not-allowed opacity-50' : '',
                                        ].join(' ')}
                                    >
                                        {link.label.includes('Previous') ? <ChevronLeft className="size-4" /> : null}
                                        {link.label.includes('Next') ? <ChevronRight className="size-4" /> : cleanLabel(link.label)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon,
    variant = 'default',
}: {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const variantClass = {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
    }[variant];

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>{icon}</div>
            </div>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
                {children}
            </select>
        </div>
    );
}