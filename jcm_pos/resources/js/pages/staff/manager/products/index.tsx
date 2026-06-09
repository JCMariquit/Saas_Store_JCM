import { Head, router, useForm } from '@inertiajs/react';
import {
    Barcode,
    Boxes,
    ChevronDown,
    ChevronRight,
    Package2,
    PackageCheck,
    PackageX,
    Plus,
    RotateCcw,
    Search,
    Store,
    Tags,
    TrendingDown,
    X,
} from 'lucide-react';
import { FormEvent, Fragment, ReactNode, useMemo, useState } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const PRODUCTS_URL = '/staff/manager/products';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
        href: '/staff/manager/dashboard',
    },
    {
        title: 'Products',
        href: PRODUCTS_URL,
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
    slug?: string | null;
    sku?: string | null;
    barcode?: string | null;
    description?: string | null;
    unit?: string | null;
    quantity: number | string;
    reorder_level?: number | string | null;
    selling_price: string | number;
    cost_price?: string | number | null;
    wholesale_price?: string | number | null;
    compare_at_price?: string | number | null;
    product_type?: 'standard' | 'service' | string | null;
    status: 'active' | 'inactive' | 'draft';
    stock_tracking: 'tracked' | 'not_tracked';
    category?: Category | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    branch: Branch;
    categories: Category[];
    filters: {
        search?: string | null;
        category_id?: string | number | null;
        status?: string | null;
    };
};

function money(value?: string | number | null) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isNaN(amount) ? 0 : amount);
}

function numberValue(value?: string | number | null) {
    const amount = Number(value ?? 0);

    return Number.isNaN(amount) ? 0 : amount;
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function statusClass(status?: string | null) {
    if (!status) return 'bg-muted text-muted-foreground';

    if (status === 'active') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (status === 'draft') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    if (status === 'inactive') return 'bg-red-500/10 text-red-700 dark:text-red-400';

    return 'bg-muted text-muted-foreground';
}

function getStockState(product: Product) {
    if (product.stock_tracking === 'not_tracked') {
        return {
            label: 'Not Tracked',
            className: 'bg-muted text-muted-foreground',
        };
    }

    const quantity = numberValue(product.quantity);
    const reorderLevel = numberValue(product.reorder_level);

    if (quantity <= 0) {
        return {
            label: 'Out of Stock',
            className: 'bg-red-500/10 text-red-700 dark:text-red-400',
        };
    }

    if (quantity <= reorderLevel) {
        return {
            label: 'Low Stock',
            className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        };
    }

    return {
        label: 'In Stock',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    };
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
    icon: React.ElementType;
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

export default function ManagerProductsIndex({ products, branch, categories, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(String(filters?.category_id ?? ''));
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [stockFilter, setStockFilter] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [openProductId, setOpenProductId] = useState<number | null>(null);

    const form = useForm({
        category_id: '',
        name: '',
        sku: '',
        barcode: '',
        description: '',
        unit: 'pcs',
        cost_price: '',
        selling_price: '',
        wholesale_price: '',
        compare_at_price: '',
        quantity: '',
        reorder_level: '0',
        product_type: 'standard',
        stock_tracking: 'tracked',
        status: 'active',
        received_date: '',
        expiry_date: '',
        remarks: '',
    });

    const visibleProducts = useMemo(() => {
        if (!stockFilter) return products.data;

        return products.data.filter((product) => {
            const stockState = getStockState(product).label;

            if (stockFilter === 'in_stock') return stockState === 'In Stock';
            if (stockFilter === 'low_stock') return stockState === 'Low Stock';
            if (stockFilter === 'out_of_stock') return stockState === 'Out of Stock';
            if (stockFilter === 'not_tracked') return stockState === 'Not Tracked';

            return true;
        });
    }, [products.data, stockFilter]);

    const summary = useMemo(() => {
        const total = products.total ?? 0;
        const active = products.data.filter((product) => product.status === 'active').length;
        const lowStock = products.data.filter((product) => getStockState(product).label === 'Low Stock').length;
        const outOfStock = products.data.filter((product) => getStockState(product).label === 'Out of Stock').length;

        return { total, active, lowStock, outOfStock };
    }, [products]);

    const applyFilters = () => {
        router.get(
            PRODUCTS_URL,
            {
                search: search || undefined,
                category_id: categoryFilter || undefined,
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
        setCategoryFilter('');
        setStatusFilter('');
        setStockFilter('');
        setOpenProductId(null);

        router.get(PRODUCTS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetForm = () => {
        form.setData({
            category_id: '',
            name: '',
            sku: '',
            barcode: '',
            description: '',
            unit: 'pcs',
            cost_price: '',
            selling_price: '',
            wholesale_price: '',
            compare_at_price: '',
            quantity: '',
            reorder_level: '0',
            product_type: 'standard',
            stock_tracking: 'tracked',
            status: 'active',
            received_date: '',
            expiry_date: '',
            remarks: '',
        });

        form.clearErrors();
    };

    const openCreateModal = () => {
        resetForm();
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        form.clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post(PRODUCTS_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Products" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Boxes className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Products</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage branch products, pricing, barcode details, and stock tracking setup.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>
                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>
                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="size-4" />
                            Add Product
                        </button>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Total Products" value={summary.total} description="All products under this branch." icon={Package2} />
                    <SummaryCard title="Active Products" value={summary.active} description="Active products on current page." icon={PackageCheck} variant="success" />
                    <SummaryCard title="Low Stock" value={summary.lowStock} description="Tracked items at reorder level." icon={TrendingDown} variant={summary.lowStock > 0 ? 'warning' : 'default'} />
                    <SummaryCard title="Out of Stock" value={summary.outOfStock} description="Tracked items with zero stock." icon={PackageX} variant={summary.outOfStock > 0 ? 'danger' : 'default'} />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
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
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(event) => setCategoryFilter(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
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
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Stock View</label>
                            <select
                                value={stockFilter}
                                onChange={(event) => setStockFilter(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Stock</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                                <option value="not_tracked">Not Tracked</option>
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
                            <h2 className="font-semibold">Product Records</h2>
                            <p className="text-sm text-muted-foreground">
                                Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} products.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            <Tags className="size-3" />
                            {categories.length} active categories
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Category</th>
                                    <th className="px-4 py-3 text-left font-medium">Stock</th>
                                    <th className="px-4 py-3 text-left font-medium">Price</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleProducts.length > 0 ? (
                                    visibleProducts.map((product) => {
                                        const isOpen = openProductId === product.id;
                                        const stockState = getStockState(product);
                                        const quantity = numberValue(product.quantity);
                                        const reorderLevel = numberValue(product.reorder_level);
                                        const stockPercent =
                                            product.stock_tracking === 'tracked'
                                                ? Math.min(100, Math.max(5, reorderLevel > 0 ? (quantity / Math.max(reorderLevel * 2, 1)) * 100 : quantity > 0 ? 100 : 5))
                                                : 100;

                                        return (
                                            <Fragment key={product.id}>
                                                <tr
                                                    onClick={() => setOpenProductId(isOpen ? null : product.id)}
                                                    className="cursor-pointer border-t transition hover:bg-muted/40"
                                                >
                                                    <td className="px-4 py-3">
                                                        {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                                                <Boxes className="size-4 text-muted-foreground" />
                                                            </div>

                                                            <div>
                                                                <div className="font-medium">{product.name}</div>
                                                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                                    <span>SKU: {product.sku || 'N/A'}</span>
                                                                    <span>•</span>
                                                                    <span>Barcode: {product.barcode || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? 'Uncategorized'}</td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {product.stock_tracking === 'tracked' ? `${quantity} ${product.unit ?? 'pcs'}` : 'Untracked'}
                                                        </div>
                                                        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                                                            <div className="h-full rounded-full bg-primary" style={{ width: `${stockPercent}%` }} />
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold">{money(product.selling_price)}</div>
                                                        <div className="text-xs text-muted-foreground">Cost: {money(product.cost_price)}</div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(product.status)}`}>
                                                                {product.status}
                                                            </span>
                                                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${stockState.className}`}>
                                                                {stockState.label}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td colSpan={6} className="px-4 py-4">
                                                            <div className="space-y-4 rounded-xl border bg-card p-4">
                                                                <div className="grid gap-3 md:grid-cols-4">
                                                                    <Detail label="Product ID" value={`#${product.id}`} />
                                                                    <Detail label="Slug" value={product.slug || '—'} />
                                                                    <Detail label="Product Type" value={product.product_type || 'standard'} />
                                                                    <Detail label="Unit" value={product.unit || 'pcs'} />
                                                                    <Detail label="SKU" value={product.sku || 'N/A'} />
                                                                    <Detail label="Barcode" value={product.barcode || 'N/A'} />
                                                                    <Detail label="Category" value={product.category?.name ?? 'Uncategorized'} />
                                                                    <Detail label="Stock Tracking" value={product.stock_tracking?.replaceAll('_', ' ') || 'Unknown'} />
                                                                    <Detail label="Quantity" value={product.stock_tracking === 'tracked' ? `${quantity} ${product.unit ?? 'pcs'}` : 'Untracked'} />
                                                                    <Detail label="Reorder Level" value={product.stock_tracking === 'tracked' ? `${reorderLevel} ${product.unit ?? 'pcs'}` : 'N/A'} />
                                                                    <Detail label="Cost Price" value={money(product.cost_price)} />
                                                                    <Detail label="Selling Price" value={money(product.selling_price)} />
                                                                    <Detail label="Wholesale Price" value={money(product.wholesale_price)} />
                                                                    <Detail label="Compare At Price" value={money(product.compare_at_price)} />
                                                                    <Detail label="Status" value={product.status} />
                                                                    <Detail label="Stock Health" value={stockState.label} />
                                                                </div>

                                                                <div className="rounded-xl border bg-muted/30 p-3">
                                                                    <p className="text-xs text-muted-foreground">Description</p>
                                                                    <p className="mt-1 text-sm">{product.description || 'No description provided.'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <Package2 className="size-5 text-muted-foreground" />
                                                </div>

                                                <h3 className="font-medium">No products found</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">Create your first product or adjust your filters.</p>

                                                <button
                                                    type="button"
                                                    onClick={openCreateModal}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                                >
                                                    <Plus className="size-4" />
                                                    Add Product
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {products.links.length > 0 && (
                        <div className="flex flex-col gap-3 border-t p-4 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {products.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) router.visit(link.url, { preserveState: true, preserveScroll: true });
                                        }}
                                        className={[
                                            'h-9 rounded-lg border px-3 text-sm font-medium transition',
                                            link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                            !link.url ? 'cursor-not-allowed opacity-50' : '',
                                        ].join(' ')}
                                    >
                                        {cleanLabel(link.label)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isOpen && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">Add Product</CardTitle>
                                <CardDescription>Branch: {branch.name}</CardDescription>
                            </div>

                            <button type="button" onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submit} className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
                            <Section title="Basic Information" description="Product identity, category, SKU, and barcode.">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Product Name" error={form.errors.name}>
                                        <input
                                            value={form.data.name}
                                            onChange={(event) => form.setData('name', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Category" error={form.errors.category_id}>
                                        <select
                                            value={form.data.category_id}
                                            onChange={(event) => form.setData('category_id', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="SKU" error={form.errors.sku}>
                                        <input
                                            value={form.data.sku}
                                            onChange={(event) => form.setData('sku', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Barcode" error={form.errors.barcode}>
                                        <div className="relative">
                                            <Barcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                value={form.data.barcode}
                                                onChange={(event) => form.setData('barcode', event.target.value)}
                                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </Field>
                                </div>

                                <Field label="Description" error={form.errors.description}>
                                    <textarea
                                        rows={3}
                                        value={form.data.description}
                                        onChange={(event) => form.setData('description', event.target.value)}
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </Field>
                            </Section>

                            <Section title="Pricing" description="Cost, selling price, and optional comparison prices.">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Cost Price" error={form.errors.cost_price}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.data.cost_price}
                                            onChange={(event) => form.setData('cost_price', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Selling Price" error={form.errors.selling_price}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.data.selling_price}
                                            onChange={(event) => form.setData('selling_price', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Wholesale Price" error={form.errors.wholesale_price}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.data.wholesale_price}
                                            onChange={(event) => form.setData('wholesale_price', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Compare At Price" error={form.errors.compare_at_price}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.data.compare_at_price}
                                            onChange={(event) => form.setData('compare_at_price', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>
                                </div>
                            </Section>

                            <Section title="Inventory Setup" description="Stock tracking, quantity, reorder level, and product unit.">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Stock Tracking" error={form.errors.stock_tracking}>
                                        <select
                                            value={form.data.stock_tracking}
                                            onChange={(event) => form.setData('stock_tracking', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="tracked">Tracked</option>
                                            <option value="not_tracked">Not Tracked</option>
                                        </select>
                                    </Field>

                                    <Field label="Unit" error={form.errors.unit}>
                                        <input
                                            value={form.data.unit}
                                            onChange={(event) => form.setData('unit', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Initial Quantity" error={form.errors.quantity}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.data.quantity}
                                            onChange={(event) => form.setData('quantity', event.target.value)}
                                            disabled={form.data.stock_tracking === 'not_tracked'}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                                        />
                                    </Field>

                                    <Field label="Reorder Level" error={form.errors.reorder_level}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.data.reorder_level}
                                            onChange={(event) => form.setData('reorder_level', event.target.value)}
                                            disabled={form.data.stock_tracking === 'not_tracked'}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                                        />
                                    </Field>
                                </div>
                            </Section>

                            <Section title="Settings" description="Product type, status, and initial stock remarks.">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Product Type" error={form.errors.product_type}>
                                        <select
                                            value={form.data.product_type}
                                            onChange={(event) => form.setData('product_type', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="service">Service</option>
                                        </select>
                                    </Field>

                                    <Field label="Status" error={form.errors.status}>
                                        <select
                                            value={form.data.status}
                                            onChange={(event) => form.setData('status', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </Field>

                                    <Field label="Received Date" error={form.errors.received_date}>
                                        <input
                                            type="date"
                                            value={form.data.received_date}
                                            onChange={(event) => form.setData('received_date', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Expiry Date" error={form.errors.expiry_date}>
                                        <input
                                            type="date"
                                            value={form.data.expiry_date}
                                            onChange={(event) => form.setData('expiry_date', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>
                                </div>

                                <Field label="Remarks" error={form.errors.remarks}>
                                    <textarea
                                        rows={3}
                                        value={form.data.remarks}
                                        onChange={(event) => form.setData('remarks', event.target.value)}
                                        placeholder="Optional initial stock notes..."
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </Field>
                            </Section>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                                    Cancel
                                </button>

                                <button
                                    disabled={form.processing}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {form.processing ? 'Saving...' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}

function Detail({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium capitalize">{value}</p>
        </div>
    );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <div className="space-y-4 rounded-xl border p-4">
            <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>

            {children}
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-4xl overflow-hidden shadow-xl">{children}</Card>
        </div>
    );
}