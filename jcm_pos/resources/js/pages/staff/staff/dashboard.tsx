import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
    Clock3,
    Package2,
    PackagePlus,
    PackageX,
    Store,
    UserCheck,
} from 'lucide-react';
import { ElementType, ReactNode } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff Dashboard',
        href: '/staff/staff/dashboard',
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
    quantity: number | string;
    reorder_level?: number | string | null;
    selling_price?: number | string | null;
    status: string;
    stock_tracking?: 'tracked' | 'not_tracked';
    created_at?: string;
    category?: Category | null;
};

type Props = {
    staff: {
        id: number;
        name: string;
    };
    branch: Branch;
    summary: {
        total_products: number;
        products_added_by_me: number;
        added_today: number;
        low_stock_products: number;
        out_of_stock_products: number;
    };
    recent_products: Product[];
    low_stock_products: Product[];
};

function money(value?: string | number | null) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function formatNumber(value?: string | number | null) {
    return new Intl.NumberFormat('en-PH').format(Number(value ?? 0));
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

export default function StaffDashboardIndex({
    staff,
    branch,
    summary,
    recent_products,
    low_stock_products,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UserCheck className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Staff Dashboard</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Welcome back, {staff.name}. Here is your inventory activity summary.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>

                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>

                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}

                                    <span className="rounded-full border px-3 py-1">Staff Inventory Access</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/staff/staff/products"
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <PackagePlus className="size-4" />
                                Add Product
                            </Link>

                            <Link
                                href="/staff/staff/activity"
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                            >
                                <Clock3 className="size-4" />
                                My Activity
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Total Products"
                        value={formatNumber(summary.total_products)}
                        description="Products in your branch."
                        icon={Package2}
                    />

                    <SummaryCard
                        title="My Added Products"
                        value={formatNumber(summary.products_added_by_me)}
                        description="Products encoded by you."
                        icon={PackagePlus}
                        variant="success"
                    />

                    <SummaryCard
                        title="Added Today"
                        value={formatNumber(summary.added_today)}
                        description="Your product entries today."
                        icon={Clock3}
                        variant="success"
                    />

                    <SummaryCard
                        title="Low Stock"
                        value={formatNumber(summary.low_stock_products)}
                        description="Needs restocking soon."
                        icon={AlertTriangle}
                        variant={summary.low_stock_products > 0 ? 'warning' : 'default'}
                    />

                    <SummaryCard
                        title="Out of Stock"
                        value={formatNumber(summary.out_of_stock_products)}
                        description="No remaining quantity."
                        icon={PackageX}
                        variant={summary.out_of_stock_products > 0 ? 'danger' : 'default'}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                    <Panel
                        title="Recent Products I Added"
                        description="Latest products encoded under your account."
                        icon={PackagePlus}
                        className="xl:col-span-7"
                    >
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Product</th>
                                        <th className="px-4 py-3 text-left font-medium">Category</th>
                                        <th className="px-4 py-3 text-left font-medium">SKU</th>
                                        <th className="px-4 py-3 text-right font-medium">Price</th>
                                        <th className="px-4 py-3 text-left font-medium">Added</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recent_products.length > 0 ? (
                                        recent_products.map((product) => (
                                            <tr key={product.id} className="border-t transition hover:bg-muted/40">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Barcode: {product.barcode || 'N/A'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {product.category?.name ?? 'Uncategorized'}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{product.sku || 'N/A'}</td>

                                                <td className="px-4 py-3 text-right font-semibold">
                                                    {money(product.selling_price)}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDate(product.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No products added yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <Panel
                        title="Low Stock Watchlist"
                        description="Tracked products that need attention."
                        icon={AlertTriangle}
                        className="xl:col-span-5"
                    >
                        <div className="grid gap-3">
                            {low_stock_products.length > 0 ? (
                                low_stock_products.map((product) => (
                                    <div key={product.id} className="rounded-xl border bg-background p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold">{product.name}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {product.category?.name ?? 'Uncategorized'} • SKU: {product.sku || 'N/A'}
                                                </div>
                                            </div>

                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(product.status)}`}>
                                                {product.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <Info label="Current Qty" value={formatNumber(product.quantity)} />
                                            <Info label="Reorder Level" value={formatNumber(product.reorder_level)} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    No low stock products found.
                                </div>
                            )}
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <QuickLink
                        title="View Products"
                        description="Search, scan, and view product records."
                        href="/staff/staff/products"
                        icon={Boxes}
                    />

                    <QuickLink
                        title="Add Product"
                        description="Encode a new product for your branch."
                        href="/staff/staff/products"
                        icon={PackagePlus}
                    />

                    <QuickLink
                        title="My Activity"
                        description="Review the products you have added."
                        href="/staff/staff/activity"
                        icon={CheckCircle2}
                    />
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

function Panel({
    title,
    description,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    description: string;
    icon: ElementType;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border ${className}`}>
            <div className="flex items-start gap-3 border-b p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>

                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>

            <div className="p-4">{children}</div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold">{value}</div>
        </div>
    );
}

function QuickLink({
    title,
    description,
    href,
    icon: Icon,
}: {
    title: string;
    description: string;
    href: string;
    icon: ElementType;
}) {
    return (
        <Link
            href={href}
            className="group rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm transition hover:bg-muted/40 dark:border-sidebar-border"
        >
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                </div>

                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </Link>
    );
}