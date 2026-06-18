import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    PackagePlus,
    RotateCcw,
    Search,
    Store,
    Tags,
} from 'lucide-react';
import { ElementType, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const ACTIVITY_URL = '/staff/staff/activity';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff',
        href: '/staff/staff/dashboard',
    },
    {
        title: 'My Activity',
        href: ACTIVITY_URL,
    },
];

type Category = {
    id: number;
    name: string;
};

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type Product = {
    id: number;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    status: 'active' | 'inactive' | 'draft';
    quantity: number | string;
    selling_price: number | string;
    created_at: string;
    category?: Category | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    branch: Branch;
    staff: {
        id: number;
        name: string;
    };
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    summary: {
        total_added: number;
        today_added: number;
        this_month_added: number;
        active_added: number;
    };
    filters: {
        search?: string | null;
        status?: string | null;
    };
};

function money(value?: string | number | null) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function formatDate(value?: string | null) {
    if (!value) return '—';

    return new Date(value).toLocaleString('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusClass(status?: string | null) {
    if (status === 'active') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (status === 'draft') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    if (status === 'inactive') return 'bg-red-500/10 text-red-700 dark:text-red-400';

    return 'bg-muted text-muted-foreground';
}

export default function StaffActivityIndex({ branch, staff, products, summary, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    const applyFilters = () => {
        router.get(
            ACTIVITY_URL,
            {
                search: search || undefined,
                status: statusFilter || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');

        router.get(ACTIVITY_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Activity" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <PackagePlus className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">My Activity</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Products added by {staff.name} in the assigned branch.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>

                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>

                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}

                                    <span className="rounded-full border px-3 py-1">Staff: {staff.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Total Added" value={summary.total_added} description="All products you encoded." icon={PackagePlus} />
                    <SummaryCard title="Added Today" value={summary.today_added} description="Products encoded today." icon={Clock3} variant="success" />
                    <SummaryCard title="This Month" value={summary.this_month_added} description="Products encoded this month." icon={CalendarDays} />
                    <SummaryCard title="Active Added" value={summary.active_added} description="Your active product records." icon={CheckCircle2} variant="success" />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="relative xl:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
                            <Search className="absolute left-3 top-[34px] size-4 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') applyFilters();
                                }}
                                placeholder="Search product, SKU, barcode..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Search className="size-4" />
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
                                title="Reset filters"
                            >
                                <RotateCcw className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold">Added Products History</h2>
                            <p className="text-sm text-muted-foreground">
                                Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} product activities.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            <Tags className="size-3" />
                            Add product activity
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Activity</th>
                                    <th className="px-4 py-3 text-left font-medium">Category</th>
                                    <th className="px-4 py-3 text-left font-medium">SKU / Barcode</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Price</th>
                                    <th className="px-4 py-3 text-left font-medium">Date Added</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="border-t transition hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">Added Product</div>
                                                <div className="mt-1 text-sm text-muted-foreground">{product.name}</div>
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {product.category?.name ?? 'Uncategorized'}
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                <div>SKU: {product.sku || 'N/A'}</div>
                                                <div className="mt-1 text-xs">Barcode: {product.barcode || 'N/A'}</div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(product.status)}`}>
                                                    {product.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold">{money(product.selling_price)}</td>

                                            <td className="px-4 py-3 text-muted-foreground">{formatDate(product.created_at)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No activity found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {products.links.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {products.from ?? 0} to {products.to ?? 0} of {products.total}
                            </p>

                            <div className="flex flex-wrap gap-1">
                                {products.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                        className={`min-w-9 rounded-lg border px-3 py-2 text-sm transition ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }}
                                    />
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
    icon: Icon,
    variant = 'default',
}: {
    title: string;
    value: number | string;
    description: string;
    icon: ElementType;
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

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}