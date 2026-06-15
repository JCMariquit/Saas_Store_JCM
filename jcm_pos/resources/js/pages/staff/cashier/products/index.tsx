import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Barcode,
    Boxes,
    CheckCircle2,
    ChevronDown,
    Eye,
    Package2,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { Fragment, useState } from 'react';

const PRODUCTS_URL = '/staff/cashier/products';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cashier', href: '/staff/cashier/dashboard' },
    { title: 'Products', href: PRODUCTS_URL },
];

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    category_id?: number | null;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    description?: string | null;
    unit?: string | null;
    cost_price?: string | number;
    selling_price: string | number;
    wholesale_price?: string | number | null;
    quantity: string | number;
    reorder_level?: string | number;
    max_stock_level?: string | number | null;
    stock_tracking: 'tracked' | 'not_tracked';
    low_stock_alert?: boolean;
    status: 'active' | 'inactive' | string;
    product_type?: string | null;
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
        active_products: number;
        low_stock: number;
        out_of_stock: number;
    };
    filters: {
        search?: string | null;
        category_id?: string | null;
        stock_status?: string | null;
        status?: string | null;
    };
};

export default function CashierProductsIndex({ products, categories, summary, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status ?? 'in_stock');
    const [status, setStatus] = useState(filters.status ?? '');
    const [openProductId, setOpenProductId] = useState<number | null>(null);

    const money = (value: number | string | null | undefined) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const applyFilters = () => {
        router.get(
            PRODUCTS_URL,
            {
                search,
                category_id: categoryId,
                stock_status: stockStatus,
                status,
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
        setCategoryId('');
        setStockStatus('in_stock');
        setStatus('');
        setOpenProductId(null);

        router.get(
            PRODUCTS_URL,
            {
                stock_status: 'in_stock',
            },
            { preserveState: true, preserveScroll: true, replace: true });
    };

    const getStockStatus = (product: Product) => {
        const qty = Number(product.quantity ?? 0);
        const reorder = Number(product.reorder_level ?? 0);

        if (product.stock_tracking === 'not_tracked') {
            return {
                label: 'Not Tracked',
                className: 'bg-muted text-muted-foreground',
            };
        }

        if (qty <= 0) {
            return {
                label: 'Out of Stock',
                className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
            };
        }

        if (qty <= reorder) {
            return {
                label: 'Low Stock',
                className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
            };
        }

        return {
            label: 'In Stock',
            className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cashier Products" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        title="Total Products"
                        value={summary.total_products.toString()}
                        icon={<Boxes className="size-5" />}
                    />
                    <SummaryCard
                        title="Active Products"
                        value={summary.active_products.toString()}
                        icon={<CheckCircle2 className="size-5" />}
                    />
                    <SummaryCard
                        title="Low Stock"
                        value={summary.low_stock.toString()}
                        icon={<AlertTriangle className="size-5" />}
                    />
                    <SummaryCard
                        title="Out of Stock"
                        value={summary.out_of_stock.toString()}
                        icon={<XCircle className="size-5" />}
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package2 className="size-5 text-primary" />
                                    Cashier Products
                                </CardTitle>
                                <CardDescription>
                                    View-only product list for your assigned branch inventory.
                                </CardDescription>
                            </div>

                            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                                Showing <span className="font-semibold">{products.from ?? 0}</span> -{' '}
                                <span className="font-semibold">{products.to ?? 0}</span> of{' '}
                                <span className="font-semibold">{products.total}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 p-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_160px_150px_auto_auto]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search product, SKU, barcode..."
                                    className="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={stockStatus}
                                onChange={(e) => setStockStatus(e.target.value)}
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Stock</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                            >
                                Filter
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/60 text-left">
                                        <tr>
                                            <th className="w-12 px-4 py-3"></th>
                                            <th className="px-4 py-3 font-medium">Product</th>
                                            <th className="px-4 py-3 font-medium">Category</th>
                                            <th className="px-4 py-3 text-right font-medium">Price</th>
                                            <th className="px-4 py-3 text-center font-medium">Stock</th>
                                            <th className="px-4 py-3 text-center font-medium">Status</th>
                                            <th className="px-4 py-3 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.data.length > 0 ? (
                                            products.data.map((product) => {
                                                const stock = getStockStatus(product);
                                                const isOpen = openProductId === product.id;

                                                return (
                                                    <Fragment key={product.id}>
                                                        <tr className="border-t hover:bg-muted/30">
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenProductId(isOpen ? null : product.id)}
                                                                    className="inline-flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
                                                                >
                                                                    <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                                </button>
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold">{product.name}</div>
                                                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Barcode className="size-3.5" />
                                                                    SKU: {product.sku || 'N/A'}
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                                                    {product.category?.name ?? 'No Category'}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-3 text-right font-bold">
                                                                {money(product.selling_price)}
                                                            </td>

                                                            <td className="px-4 py-3 text-center">
                                                                <div className="font-semibold">
                                                                    {product.stock_tracking === 'tracked'
                                                                        ? `${Number(product.quantity ?? 0)} ${product.unit ?? ''}`
                                                                        : '∞'}
                                                                </div>
                                                                <span className={`mt-1 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${stock.className}`}>
                                                                    {stock.label}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-3 text-center">
                                                                <span
                                                                    className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${
                                                                        product.status === 'active'
                                                                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                                            : 'bg-muted text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {product.status}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenProductId(isOpen ? null : product.id)}
                                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold hover:bg-muted"
                                                                >
                                                                    <Eye className="size-4" />
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>

                                                        {isOpen && (
                                                            <tr className="border-t bg-muted/20">
                                                                <td></td>
                                                                <td colSpan={6} className="px-4 py-4">
                                                                    <div className="grid gap-4 rounded-xl border bg-background p-4 md:grid-cols-4">
                                                                        <Info label="Product Name" value={product.name} />
                                                                        <Info label="SKU" value={product.sku || 'N/A'} />
                                                                        <Info label="Barcode" value={product.barcode || 'N/A'} />
                                                                        <Info label="Category" value={product.category?.name ?? 'No Category'} />
                                                                        <Info label="Unit" value={product.unit || 'N/A'} />
                                                                        <Info label="Selling Price" value={money(product.selling_price)} />
                                                                        <Info label="Wholesale Price" value={product.wholesale_price ? money(product.wholesale_price) : 'N/A'} />
                                                                        <Info label="Quantity" value={`${Number(product.quantity ?? 0)} ${product.unit ?? ''}`} />
                                                                        <Info label="Reorder Level" value={String(product.reorder_level ?? 0)} />
                                                                        <Info label="Max Stock" value={product.max_stock_level ? String(product.max_stock_level) : 'N/A'} />
                                                                        <Info label="Stock Tracking" value={product.stock_tracking.replace('_', ' ')} />
                                                                        <Info label="Product Type" value={product.product_type || 'N/A'} />
                                                                    </div>

                                                                    {product.description && (
                                                                        <div className="mt-3 rounded-xl border bg-background p-4">
                                                                            <div className="text-xs text-muted-foreground">Description</div>
                                                                            <div className="mt-1 text-sm">{product.description}</div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-16 text-center">
                                                    <Package2 className="mx-auto mb-3 size-10 text-muted-foreground" />
                                                    <h3 className="font-semibold">No products found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Try changing your search or filter options.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>

                <div>
                    <div className="text-sm text-muted-foreground">{title}</div>
                    <div className="text-xl font-bold">{value}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium capitalize">{value}</div>
        </div>
    );
}