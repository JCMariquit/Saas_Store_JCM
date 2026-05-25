import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Boxes, Package, Plus, RotateCcw, Search, TrendingDown, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stocks',
        href: '/inventory/stocks',
    },
];

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    quantity: string | number;
    reorder_level: string | number;
    cost_price: string | number;
    selling_price: string | number;
    category?: Category | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PageProps = {
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    categories: Category[];
    summary: {
        total_products: number;
        low_stock: number;
        out_of_stock: number;
        inventory_value: string | number;
    };
    filters: {
        search?: string | null;
        category_id?: string | null;
        stock_status?: string | null;
    };
};

export default function StocksIndex({ products, categories, summary, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category_id ?? '');
    const [activeStockTab, setActiveStockTab] = useState<'on_stock' | 'out_of_stock'>('on_stock');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const form = useForm({
        product_id: '',
        movement_type: 'stock_in',
        quantity: '',
        unit_cost: '',
        remarks: '',
        received_date: '',
        expiry_date: '',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/inventory/stocks',
                {
                    search,
                    category_id: categoryFilter,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, categoryFilter]);

    const visibleProducts = useMemo(() => {
        return products.data.filter((product) => {
            const quantity = Number(product.quantity ?? 0);

            if (activeStockTab === 'out_of_stock') {
                return quantity <= 0;
            }

            return quantity > 0;
        });
    }, [products.data, activeStockTab]);

    const visibleInventoryValue = useMemo(() => {
        return visibleProducts.reduce((total, product) => {
            return total + Number(product.quantity ?? 0) * Number(product.cost_price ?? 0);
        }, 0);
    }, [visibleProducts]);

    const formatMoney = (value: string | number) => {
        return `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const stockBadge = (product: Product) => {
        const quantity = Number(product.quantity ?? 0);
        const reorderLevel = Number(product.reorder_level ?? 0);

        if (quantity <= 0) {
            return (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                    Out
                </span>
            );
        }

        if (quantity <= reorderLevel) {
            return (
                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                    Low
                </span>
            );
        }

        return (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                Normal
            </span>
        );
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setActiveStockTab('on_stock');

        router.get(
            '/inventory/stocks',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const openAdjustModal = (product: Product) => {
        setSelectedProduct(product);

        form.setData({
            product_id: String(product.id),
            movement_type: 'stock_in',
            quantity: '',
            unit_cost: String(product.cost_price ?? ''),
            remarks: '',
            received_date: '',
            expiry_date: '',
        });

        form.clearErrors();
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedProduct(null);
        form.clearErrors();
    };

    const submitAdjustment = (e: FormEvent) => {
        e.preventDefault();

        form.post('/inventory/stocks/adjust', {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stocks Management" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        title="Total Products"
                        value={summary.total_products}
                        icon={<Package className="size-5 text-muted-foreground" />}
                        variant="default"
                    />

                    <SummaryCard
                        title="Low Stock"
                        value={summary.low_stock}
                        icon={<AlertTriangle className="size-5 text-muted-foreground" />}
                        variant="warning"
                    />

                    <SummaryCard
                        title="Out of Stock"
                        value={summary.out_of_stock}
                        icon={<TrendingDown className="size-5 text-muted-foreground" />}
                        variant="danger"
                    />

                    <SummaryCard
                        title={activeStockTab === 'out_of_stock' ? 'Out of Stock Value' : 'On Stock Value'}
                        value={formatMoney(activeStockTab === 'out_of_stock' ? 0 : visibleInventoryValue)}
                        icon={<Boxes className="size-5 text-muted-foreground" />}
                        variant="success"
                    />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <CardTitle className="text-xl">Stock Management</CardTitle>
                        <CardDescription className="mt-1">
                            Monitor inventory levels and record stock movements.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 flex flex-col gap-4">
                            <div className="inline-flex w-fit rounded-md border border-input bg-muted/40 p-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveStockTab('on_stock')}
                                    className={`rounded px-4 py-1.5 text-sm font-medium transition ${
                                        activeStockTab === 'on_stock'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    On Stock
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveStockTab('out_of_stock')}
                                    className={`rounded px-4 py-1.5 text-sm font-medium transition ${
                                        activeStockTab === 'out_of_stock'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Out of Stock
                                </button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-4">
                                <div className="relative md:col-span-2">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Auto search product, SKU, barcode..."
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

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    <RotateCcw className="size-4" />
                                    Reset
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
                                        <th className="px-4 py-3 font-medium">Reorder Level</th>
                                        <th className="px-4 py-3 font-medium">Value</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {visibleProducts.length > 0 ? (
                                        visibleProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-t border-sidebar-border/70 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                                            <Package className="size-4 text-muted-foreground" />
                                                        </div>

                                                        <div>
                                                            <div className="font-medium">{product.name}</div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                SKU: {product.sku ?? 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {product.category?.name ?? '-'}
                                                </td>

                                                <td className="px-4 py-3 font-medium">
                                                    {Number(product.quantity ?? 0)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {Number(product.reorder_level ?? 0)}
                                                </td>

                                                <td className="px-4 py-3 font-medium">
                                                    {formatMoney(
                                                        Number(product.quantity ?? 0) *
                                                            Number(product.cost_price ?? 0),
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">{stockBadge(product)}</td>

                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => openAdjustModal(product)}
                                                        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                                                    >
                                                        <Plus className="size-4" />
                                                        Adjust
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-14 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <Boxes className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">
                                                        {activeStockTab === 'out_of_stock'
                                                            ? 'No out of stock products found'
                                                            : 'No on stock products found'}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {activeStockTab === 'out_of_stock'
                                                            ? 'Products with zero quantity will appear here.'
                                                            : 'Products with available quantity will appear here.'}
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
                                Showing {visibleProducts.length} of {products.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {products.links.map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url &&
                                            router.get(link.url, {}, { preserveState: true, preserveScroll: true })
                                        }
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

                {isOpen && selectedProduct && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">Adjust Stock</CardTitle>
                                <CardDescription>{selectedProduct.name}</CardDescription>
                            </div>

                            <button onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submitAdjustment} className="space-y-4 p-5">
                            <Field label="Movement Type" error={form.errors.movement_type}>
                                <select
                                    value={form.data.movement_type}
                                    onChange={(e) => form.setData('movement_type', e.target.value)}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="stock_in">Stock In</option>
                                    <option value="adjustment_in">Adjustment In</option>
                                    <option value="adjustment_out">Adjustment Out</option>
                                    <option value="damage">Damage</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Quantity" error={form.errors.quantity}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.quantity}
                                        onChange={(e) => form.setData('quantity', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Unit Cost" error={form.errors.unit_cost}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.unit_cost}
                                        onChange={(e) => form.setData('unit_cost', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>
                            </div>

                            {form.data.movement_type === 'stock_in' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Received Date" error={form.errors.received_date}>
                                        <input
                                            type="date"
                                            value={form.data.received_date}
                                            onChange={(e) => form.setData('received_date', e.target.value)}
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </Field>

                                    <Field label="Expiry Date" error={form.errors.expiry_date}>
                                        <input
                                            type="date"
                                            value={form.data.expiry_date}
                                            onChange={(e) => form.setData('expiry_date', e.target.value)}
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </Field>
                                </div>
                            )}

                            <Field label="Remarks" error={form.errors.remarks}>
                                <textarea
                                    rows={3}
                                    value={form.data.remarks}
                                    onChange={(e) => form.setData('remarks', e.target.value)}
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
                                    Save Movement
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
    icon,
    variant = 'default',
}: {
    title: string;
    value: string | number;
    icon: ReactNode;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <CardDescription>{title}</CardDescription>
                    {icon}
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-0">
                <CardTitle>{value}</CardTitle>
            </CardContent>
        </Card>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
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
            <Card className="w-full max-w-lg overflow-hidden shadow-xl">{children}</Card>
        </div>
    );
}