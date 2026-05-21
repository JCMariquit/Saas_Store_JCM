import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Package, Plus, Search, TrendingDown, AlertTriangle, Boxes, X } from 'lucide-react';

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
    const [stockStatus, setStockStatus] = useState(filters?.stock_status ?? '');
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
            return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Out</span>;
        }

        if (quantity <= reorderLevel) {
            return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">Low</span>;
        }

        return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Normal</span>;
    };

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            '/inventory/stocks',
            {
                search,
                category_id: categoryFilter,
                stock_status: stockStatus,
            },
            {
                preserveState: true,
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

            <div className="flex flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Products</p>
                                <h2 className="mt-1 text-2xl font-semibold">{summary.total_products}</h2>
                            </div>
                            <Package className="size-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Low Stock</p>
                                <h2 className="mt-1 text-2xl font-semibold">{summary.low_stock}</h2>
                            </div>
                            <AlertTriangle className="size-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Out of Stock</p>
                                <h2 className="mt-1 text-2xl font-semibold">{summary.out_of_stock}</h2>
                            </div>
                            <TrendingDown className="size-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-background p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Inventory Value</p>
                                <h2 className="mt-1 text-2xl font-semibold">{formatMoney(summary.inventory_value)}</h2>
                            </div>
                            <Boxes className="size-5 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <div className="border-b p-5">
                        <h1 className="text-xl font-semibold">Stock Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Monitor inventory levels and record stock movements.
                        </p>
                    </div>

                    <div className="p-5">
                        <form onSubmit={submitSearch} className="mb-4 grid gap-3 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search product..."
                                    className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-10 rounded-md border bg-background px-3 text-sm"
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
                                    value={stockStatus}
                                    onChange={(e) => setStockStatus(e.target.value)}
                                    className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">All Stock</option>
                                    <option value="normal">Normal</option>
                                    <option value="low">Low Stock</option>
                                    <option value="out">Out of Stock</option>
                                </select>

                                <button className="rounded-md border px-4 text-sm hover:bg-muted">Search</button>
                            </div>
                        </form>

                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Product</th>
                                        <th className="px-4 py-3 text-left font-medium">Category</th>
                                        <th className="px-4 py-3 text-left font-medium">Current Stock</th>
                                        <th className="px-4 py-3 text-left font-medium">Reorder Level</th>
                                        <th className="px-4 py-3 text-left font-medium">Value</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.data.length > 0 ? (
                                        products.data.map((product) => (
                                            <tr key={product.id} className="border-t">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground">SKU: {product.sku ?? 'N/A'}</div>
                                                </td>

                                                <td className="px-4 py-3">{product.category?.name ?? '-'}</td>

                                                <td className="px-4 py-3 font-medium">{Number(product.quantity ?? 0)}</td>

                                                <td className="px-4 py-3">{Number(product.reorder_level ?? 0)}</td>

                                                <td className="px-4 py-3">
                                                    {formatMoney(Number(product.quantity ?? 0) * Number(product.cost_price ?? 0))}
                                                </td>

                                                <td className="px-4 py-3">{stockBadge(product)}</td>

                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => openAdjustModal(product)}
                                                        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                                                    >
                                                        <Plus className="size-4" />
                                                        Adjust
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-muted-foreground">
                                                No stock records found.
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
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
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
                    </div>
                </div>

                {isOpen && selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-lg rounded-xl border bg-background shadow-xl">
                            <div className="flex items-center justify-between border-b p-5">
                                <div>
                                    <h2 className="text-lg font-semibold">Adjust Stock</h2>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.name}</p>
                                </div>

                                <button onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                    <X className="size-4" />
                                </button>
                            </div>

                            <form onSubmit={submitAdjustment} className="space-y-4 p-5">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Movement Type</label>
                                    <select
                                        value={form.data.movement_type}
                                        onChange={(e) => form.setData('movement_type', e.target.value)}
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    >
                                        <option value="stock_in">Stock In</option>
                                        <option value="adjustment_in">Adjustment In</option>
                                        <option value="adjustment_out">Adjustment Out</option>
                                        <option value="damage">Damage</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Quantity</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.quantity}
                                            onChange={(e) => form.setData('quantity', e.target.value)}
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        />
                                        {form.errors.quantity && <p className="mt-1 text-xs text-red-600">{form.errors.quantity}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Unit Cost</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.unit_cost}
                                            onChange={(e) => form.setData('unit_cost', e.target.value)}
                                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        />
                                    </div>
                                </div>

                                {form.data.movement_type === 'stock_in' && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium">Received Date</label>
                                            <input
                                                type="date"
                                                value={form.data.received_date}
                                                onChange={(e) => form.setData('received_date', e.target.value)}
                                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={form.data.expiry_date}
                                                onChange={(e) => form.setData('expiry_date', e.target.value)}
                                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Remarks</label>
                                    <textarea
                                        rows={3}
                                        value={form.data.remarks}
                                        onChange={(e) => form.setData('remarks', e.target.value)}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm">
                                        Cancel
                                    </button>

                                    <button disabled={form.processing} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                                        Save Movement
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}