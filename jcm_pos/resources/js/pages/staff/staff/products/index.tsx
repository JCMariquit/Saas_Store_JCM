import { Head, router, useForm } from '@inertiajs/react';
import {
    Boxes,
    ChevronDown,
    ChevronRight,
    Package2,
    PackageCheck,
    PackagePlus,
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

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const PRODUCTS_URL = '/staff/staff/products';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff',
        href: '/staff/staff/dashboard',
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
    category_id?: number | null;
    name: string;
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

type Summary = {
    total_products: number;
    active_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
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
    summary: Summary;
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

export default function StaffProductsIndex({ products, branch, categories, summary, filters }: Props) {
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
            <Head title="Staff Products" />

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
                                    Add new products, scan product records, and view stock levels for your assigned branch.
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
                    <SummaryCard title="Total Products" value={summary.total_products} description="All products under this branch." icon={Package2} />
                    <SummaryCard title="Active Products" value={summary.active_products} description="Visible active product records." icon={PackageCheck} variant="success" />
                    <SummaryCard title="Low Stock" value={summary.low_stock_products} description="Tracked items at reorder level." icon={TrendingDown} variant={summary.low_stock_products > 0 ? 'warning' : 'default'} />
                    <SummaryCard title="Out of Stock" value={summary.out_of_stock_products} description="Tracked items with zero quantity." icon={PackageX} variant={summary.out_of_stock_products > 0 ? 'danger' : 'default'} />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="relative xl:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Search / Scan</label>
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
                                                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(product.status)}`}>
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
                                                        <td></td>
                                                        <td colSpan={5} className="px-4 py-4">
                                                            <div className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-4">
                                                                <Info label="Product Name" value={product.name} />
                                                                <Info label="SKU" value={product.sku || 'N/A'} />
                                                                <Info label="Barcode" value={product.barcode || 'N/A'} />
                                                                <Info label="Type" value={product.product_type || 'standard'} />
                                                                <Info label="Unit" value={product.unit || 'pcs'} />
                                                                <Info label="Stock Tracking" value={product.stock_tracking.replace('_', ' ')} />
                                                                <Info label="Reorder Level" value={product.reorder_level ?? 0} />
                                                                <Info label="Description" value={product.description || 'No description'} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No products found.
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

            {isOpen && (
                <Modal title="Add Product" onClose={closeModal}>
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Product Name" error={form.errors.name} required>
                                <input
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Example: Coke 1.5L"
                                />
                            </Field>

                            <Field label="Category" error={form.errors.category_id}>
                                <select
                                    value={form.data.category_id}
                                    onChange={(event) => form.setData('category_id', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">No Category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="SKU" error={form.errors.sku}>
                                <input
                                    value={form.data.sku}
                                    onChange={(event) => form.setData('sku', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="SKU"
                                />
                            </Field>

                            <Field label="Barcode" error={form.errors.barcode}>
                                <input
                                    value={form.data.barcode}
                                    onChange={(event) => form.setData('barcode', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Scan or type barcode"
                                />
                            </Field>
                        </div>

                        <Field label="Description" error={form.errors.description}>
                            <textarea
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Optional product notes"
                            />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Unit" error={form.errors.unit}>
                                <input
                                    value={form.data.unit}
                                    onChange={(event) => form.setData('unit', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="pcs"
                                />
                            </Field>

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
                                    <option value="draft">Draft</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <Field label="Cost Price" error={form.errors.cost_price}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.cost_price}
                                    onChange={(event) => form.setData('cost_price', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </Field>

                            <Field label="Selling Price" error={form.errors.selling_price} required>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.selling_price}
                                    onChange={(event) => form.setData('selling_price', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </Field>

                            <Field label="Wholesale Price" error={form.errors.wholesale_price}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.wholesale_price}
                                    onChange={(event) => form.setData('wholesale_price', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </Field>

                            <Field label="Compare Price" error={form.errors.compare_at_price}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.compare_at_price}
                                    onChange={(event) => form.setData('compare_at_price', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
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

                            <Field label="Initial Quantity" error={form.errors.quantity}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.quantity}
                                    onChange={(event) => form.setData('quantity', event.target.value)}
                                    disabled={form.data.stock_tracking === 'not_tracked'}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </Field>

                            <Field label="Reorder Level" error={form.errors.reorder_level}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.reorder_level}
                                    onChange={(event) => form.setData('reorder_level', event.target.value)}
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </Field>
                        </div>

                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
                            Staff can add products only. Editing, deleting, and stock adjustment are controlled by the manager or owner.
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <button type="button" onClick={closeModal} className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                            >
                                <PackagePlus className="size-4" />
                                {form.processing ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
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

function Info({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold capitalize">{value}</div>
        </div>
    );
}

function Field({
    label,
    error,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>

            {children}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-background shadow-xl">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">{title}</h2>

                    <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto p-4">{children}</div>
            </div>
        </div>
    );
}