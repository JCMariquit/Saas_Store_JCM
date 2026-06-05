import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Boxes, History, PackageCheck, PackageX, Plus, RotateCcw, Search, Store, TrendingDown, X } from 'lucide-react';

const STOCKS_URL = '/staff/manager/stocks';
const STOCK_ADJUST_URL = '/staff/manager/stocks/adjust';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Stock Management', href: STOCKS_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
};

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    unit?: string | null;
    quantity: number | string;
    reorder_level?: number | string | null;
    cost_price?: number | string | null;
    selling_price?: number | string | null;
    stock_tracking: 'tracked' | 'not_tracked';
    category?: Category | null;
};

type Movement = {
    id: number;
    movement_type: 'stock_in' | 'stock_out' | 'adjustment' | string;
    quantity: number | string;
    quantity_before: number | string;
    quantity_after: number | string;
    remarks?: string | null;
    movement_date?: string | null;
    product?: {
        id: number;
        name: string;
        sku?: string | null;
        barcode?: string | null;
    } | null;
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
    movements: Movement[];
    filters: {
        search?: string | null;
        stock_status?: string | null;
    };
};

export default function ManagerStocksIndex({ products, branch, movements, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [stockStatus, setStockStatus] = useState(filters?.stock_status ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const form = useForm({
        product_id: '',
        movement_type: 'stock_in',
        quantity: '',
        unit_cost: '',
        remarks: '',
    });

    const summary = useMemo(() => {
        const total = products.total ?? 0;
        const inStock = products.data.filter((p) => Number(p.quantity ?? 0) > 0).length;
        const lowStock = products.data.filter(
            (p) => Number(p.quantity ?? 0) <= Number(p.reorder_level ?? 0) && Number(p.quantity ?? 0) > 0,
        ).length;
        const outStock = products.data.filter((p) => Number(p.quantity ?? 0) <= 0).length;

        return { total, inStock, lowStock, outStock };
    }, [products]);

    const money = (value: string | number | null | undefined) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const stockBadge = (product: Product) => {
        const qty = Number(product.quantity ?? 0);
        const reorder = Number(product.reorder_level ?? 0);

        if (qty <= 0) {
            return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">Out of stock</span>;
        }

        if (qty <= reorder) {
            return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">Low stock</span>;
        }

        return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">In stock</span>;
    };

    const movementBadge = (type: string) => {
        const label = type.replaceAll('_', ' ');

        if (type === 'stock_in') {
            return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium capitalize text-green-700 dark:bg-green-950 dark:text-green-300">{label}</span>;
        }

        if (type === 'stock_out') {
            return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium capitalize text-red-700 dark:bg-red-950 dark:text-red-300">{label}</span>;
        }

        return <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium capitalize text-blue-700 dark:bg-blue-950 dark:text-blue-300">{label}</span>;
    };

    const applyFilters = () => {
        router.get(
            STOCKS_URL,
            {
                search,
                stock_status: stockStatus,
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
        setStockStatus('');

        router.get(STOCKS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openStockModal = (product: Product) => {
        setSelectedProduct(product);

        form.setData({
            product_id: String(product.id),
            movement_type: 'stock_in',
            quantity: '',
            unit_cost: String(product.cost_price ?? ''),
            remarks: '',
        });

        form.clearErrors();
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedProduct(null);
        form.clearErrors();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        form.post(STOCK_ADJUST_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Stock Management" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                <Store className="size-5 text-muted-foreground" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="text-xl">{branch.name}</CardTitle>

                                    {branch.is_main && (
                                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            Main
                                        </span>
                                    )}

                                    <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                        Active
                                    </span>
                                </div>

                                <CardDescription className="mt-1">
                                    Branch code: {branch.code || 'No code'} · Manager branch stock only.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Tracked Products" value={summary.total} variant="default" />
                    <SummaryCard title="In Stock" value={summary.inStock} variant="success" />
                    <SummaryCard title="Low Stock" value={summary.lowStock} variant="warning" />
                    <SummaryCard title="Out of Stock" value={summary.outStock} variant="danger" />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-xl">Stock Management</CardTitle>
                                <CardDescription className="mt-1">
                                    Manage stock in, stock out, and stock adjustment for your assigned branch.
                                </CardDescription>
                            </div>
                        </div>
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
                                value={stockStatus}
                                onChange={(e) => setStockStatus(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Stock</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    Filter
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
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
                                        <th className="px-4 py-3 font-medium">Current Stock</th>
                                        <th className="px-4 py-3 font-medium">Reorder</th>
                                        <th className="px-4 py-3 font-medium">Cost</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
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
                                                    <div className="font-semibold">
                                                        {Number(product.quantity ?? 0)} {product.unit ?? 'pcs'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {Number(product.reorder_level ?? 0)} {product.unit ?? 'pcs'}
                                                </td>

                                                <td className="px-4 py-3">{money(product.cost_price)}</td>

                                                <td className="px-4 py-3">{stockBadge(product)}</td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => openStockModal(product)}
                                                            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                                                        >
                                                            <Plus className="size-4" />
                                                            Adjust
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-14 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <PackageX className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">No tracked products found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Only products with stock tracking enabled will appear here.
                                                    </p>
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

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <div className="flex items-center gap-3">
                            <History className="size-5 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-xl">Recent Stock Movements</CardTitle>
                                <CardDescription className="mt-1">Latest stock activity in your branch.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Qty</th>
                                        <th className="px-4 py-3 font-medium">Before</th>
                                        <th className="px-4 py-3 font-medium">After</th>
                                        <th className="px-4 py-3 font-medium">Remarks</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {movements.length > 0 ? (
                                        movements.map((movement) => (
                                            <tr key={movement.id} className="border-t border-sidebar-border/70 dark:border-sidebar-border">
                                                <td className="px-4 py-3 font-medium">{movement.product?.name ?? 'Unknown product'}</td>
                                                <td className="px-4 py-3">{movementBadge(movement.movement_type)}</td>
                                                <td className="px-4 py-3">{Number(movement.quantity ?? 0)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{Number(movement.quantity_before ?? 0)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{Number(movement.quantity_after ?? 0)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{movement.remarks ?? '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                                No stock movements yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {isOpen && selectedProduct && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">Adjust Stock</CardTitle>
                                <CardDescription>
                                    {selectedProduct.name} · Current: {Number(selectedProduct.quantity ?? 0)} {selectedProduct.unit ?? 'pcs'}
                                </CardDescription>
                            </div>

                            <button type="button" onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submit} className="space-y-5 p-5">
                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                This stock movement will be saved under <b>{branch.name}</b>.
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Movement Type" error={form.errors.movement_type}>
                                    <select
                                        value={form.data.movement_type}
                                        onChange={(e) => form.setData('movement_type', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="stock_in">Stock In</option>
                                        <option value="stock_out">Stock Out</option>
                                        <option value="adjustment">Set Actual Quantity</option>
                                    </select>
                                </Field>

                                <Field label={form.data.movement_type === 'adjustment' ? 'Actual Quantity' : 'Quantity'} error={form.errors.quantity}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={form.data.quantity}
                                        onChange={(e) => form.setData('quantity', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Unit Cost" error={form.errors.unit_cost}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.unit_cost}
                                        onChange={(e) => form.setData('unit_cost', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>
                            </div>

                            <Field label="Remarks" error={form.errors.remarks}>
                                <textarea
                                    rows={3}
                                    value={form.data.remarks}
                                    onChange={(e) => form.setData('remarks', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Optional notes..."
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
                                    {form.processing ? 'Saving...' : 'Save Movement'}
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
    const icons = {
        default: Boxes,
        success: PackageCheck,
        neutral: Boxes,
        warning: TrendingDown,
        danger: PackageX,
    };

    const Icon = icons[variant];

    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
                <CardDescription>{title}</CardDescription>
                <Icon className="size-4 text-muted-foreground" />
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