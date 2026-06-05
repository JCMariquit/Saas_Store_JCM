import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Barcode, Boxes, Package2, Plus, RotateCcw, Search, X } from 'lucide-react';

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
    slug?: string;
    sku?: string | null;
    barcode?: string | null;
    description?: string | null;
    unit?: string | null;
    quantity: number | string;
    reorder_level?: number | string | null;
    selling_price: string | number;
    cost_price?: string | number;
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

export default function ManagerProductsIndex({ products, branch, categories, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(String(filters?.category_id ?? ''));
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        category_id: '',
        name: '',
        sku: '',
        barcode: '',
        description: '',
        unit: 'pcs',
        cost_price: '',
        selling_price: '',
        quantity: '',
        reorder_level: '0',
        product_type: 'standard',
        stock_tracking: 'tracked',
        status: 'active',
    });

    const summary = useMemo(() => {
        const total = products.total ?? 0;
        const active = products.data.filter((p) => p.status === 'active').length;
        const lowStock = products.data.filter(
            (p) => Number(p.quantity ?? 0) <= Number(p.reorder_level ?? 0) && Number(p.quantity ?? 0) > 0,
        ).length;
        const outStock = products.data.filter((p) => Number(p.quantity ?? 0) <= 0).length;

        return { total, active, lowStock, outStock };
    }, [products]);

    const money = (value: string | number | null | undefined) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const statusBadge = (status: Product['status']) => {
        const classes = {
            active: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
            inactive: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
        };

        return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes[status]}`}>{status}</span>;
    };

    const stockBadge = (product: Product) => {
        if (product.stock_tracking === 'not_tracked') {
            return <span className="text-muted-foreground">Not tracked</span>;
        }

        const qty = Number(product.quantity ?? 0);
        const reorder = Number(product.reorder_level ?? 0);

        if (qty <= 0) return <span className="text-red-600">Out of stock</span>;
        if (qty <= reorder) return <span className="text-yellow-600">Low stock</span>;

        return <span className="text-green-600">In stock</span>;
    };

    const applyFilters = () => {
        router.get(
            PRODUCTS_URL,
            {
                search,
                category_id: categoryFilter,
                status: statusFilter,
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

    const submit = (e: FormEvent) => {
        e.preventDefault();

        form.post(PRODUCTS_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Products" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Total Products" value={summary.total} variant="default" />
                    <SummaryCard title="Active Products" value={summary.active} variant="success" />
                    <SummaryCard title="Low Stock" value={summary.lowStock} variant="warning" />
                    <SummaryCard title="Out of Stock" value={summary.outStock} variant="danger" />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-xl">Products</CardTitle>
                            <CardDescription className="mt-1">
                                Manage products for your assigned branch.
                            </CardDescription>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Add Product
                        </button>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 grid gap-3 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    placeholder="Search product, SKU, barcode..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    Filter
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Category</th>
                                        <th className="px-4 py-3 font-medium">Stock</th>
                                        <th className="px-4 py-3 font-medium">Cost</th>
                                        <th className="px-4 py-3 font-medium">Price</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.data.length > 0 ? (
                                        products.data.map((product) => (
                                            <tr key={product.id} className="border-t border-sidebar-border/70 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
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

                                                <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? '-'}</td>

                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {Number(product.quantity ?? 0)} {product.unit ?? 'pcs'}
                                                    </div>
                                                    <div className="text-xs">{stockBadge(product)}</div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{money(product.cost_price)}</td>
                                                <td className="px-4 py-3 font-medium">{money(product.selling_price)}</td>
                                                <td className="px-4 py-3">{statusBadge(product.status)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-14 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <Package2 className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">No products found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Create your first product for this branch.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={openCreateModal}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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

                        <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {products.links.map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                This product will be saved under <b>{branch.name}</b>.
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Product Name" error={form.errors.name}>
                                    <input
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Category" error={form.errors.category_id}>
                                    <select
                                        value={form.data.category_id}
                                        onChange={(e) => form.setData('category_id', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                                        onChange={(e) => form.setData('sku', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Barcode" error={form.errors.barcode}>
                                    <div className="relative">
                                        <Barcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            value={form.data.barcode}
                                            onChange={(e) => form.setData('barcode', e.target.value)}
                                            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                </Field>

                                <Field label="Cost Price" error={form.errors.cost_price}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.cost_price}
                                        onChange={(e) => form.setData('cost_price', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Selling Price" error={form.errors.selling_price}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.selling_price}
                                        onChange={(e) => form.setData('selling_price', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Quantity" error={form.errors.quantity}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.quantity}
                                        onChange={(e) => form.setData('quantity', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Reorder Level" error={form.errors.reorder_level}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.reorder_level}
                                        onChange={(e) => form.setData('reorder_level', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Unit" error={form.errors.unit}>
                                    <input
                                        value={form.data.unit}
                                        onChange={(e) => form.setData('unit', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Status" error={form.errors.status}>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </Field>

                                <Field label="Stock Tracking" error={form.errors.stock_tracking}>
                                    <select
                                        value={form.data.stock_tracking}
                                        onChange={(e) => form.setData('stock_tracking', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="tracked">Tracked</option>
                                        <option value="not_tracked">Not Tracked</option>
                                    </select>
                                </Field>

                                <Field label="Product Type" error={form.errors.product_type}>
                                    <select
                                        value={form.data.product_type}
                                        onChange={(e) => form.setData('product_type', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="service">Service</option>
                                    </select>
                                </Field>
                            </div>

                            <Field label="Description" error={form.errors.description}>
                                <textarea
                                    rows={3}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={form.processing}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
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

function SummaryCard({
    title,
    value,
    variant = 'default',
}: {
    title: string;
    value: number;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-2">
                <CardDescription>{title}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
                <CardTitle>{value}</CardTitle>
            </CardContent>
        </Card>
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
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-hidden shadow-xl">{children}</Card>
        </div>
    );
}