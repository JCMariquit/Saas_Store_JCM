import { Head, router, useForm } from '@inertiajs/react';
import {
    Boxes,
    ChevronDown,
    ChevronRight,
    History,
    PackageCheck,
    PackageX,
    Plus,
    RotateCcw,
    Search,
    Store,
    TrendingDown,
    X,
} from 'lucide-react';
import { FormEvent, Fragment, ReactNode, useMemo, useState } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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

function shortDateTime(value?: string | null) {
    if (!value) return '—';

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

function getStockState(product: Product) {
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

function movementClass(type: string) {
    if (type === 'stock_in' || type === 'initial_stock') {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    if (type === 'stock_out') {
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
    }

    return 'bg-primary/10 text-primary';
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

export default function ManagerStocksIndex({ products, branch, movements, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [stockStatus, setStockStatus] = useState(filters?.stock_status ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [openProductId, setOpenProductId] = useState<number | null>(null);
    const [openMovementId, setOpenMovementId] = useState<number | null>(null);

    const form = useForm({
        product_id: '',
        movement_type: 'stock_in',
        quantity: '',
        unit_cost: '',
        remarks: '',
    });

    const summary = useMemo(() => {
        const total = products.total ?? 0;
        const inStock = products.data.filter((product) => getStockState(product).label === 'In Stock').length;
        const lowStock = products.data.filter((product) => getStockState(product).label === 'Low Stock').length;
        const outStock = products.data.filter((product) => getStockState(product).label === 'Out of Stock').length;

        return { total, inStock, lowStock, outStock };
    }, [products]);

    const applyFilters = () => {
        router.get(
            STOCKS_URL,
            {
                search: search || undefined,
                stock_status: stockStatus || undefined,
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
        setOpenProductId(null);

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

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post(STOCK_ADJUST_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Stock Management" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Boxes className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Stock Management</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Monitor tracked products, adjust inventory, and review recent stock movements.
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

                        <div className="rounded-xl border bg-muted/30 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Current Result</p>
                            <p className="mt-1 text-sm font-semibold">
                                Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} tracked products
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Tracked Products" value={summary.total} description="Products with stock tracking." icon={Boxes} />
                    <SummaryCard title="In Stock" value={summary.inStock} description="Current page healthy stock." icon={PackageCheck} variant="success" />
                    <SummaryCard title="Low Stock" value={summary.lowStock} description="Items at reorder level." icon={TrendingDown} variant={summary.lowStock > 0 ? 'warning' : 'default'} />
                    <SummaryCard title="Out of Stock" value={summary.outStock} description="Items with zero quantity." icon={PackageX} variant={summary.outStock > 0 ? 'danger' : 'default'} />
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
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Stock Status</label>
                            <select
                                value={stockStatus}
                                onChange={(event) => setStockStatus(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Stock</option>
                                <option value="in_stock">In Stock</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
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
                            <h2 className="font-semibold">Tracked Product Stocks</h2>
                            <p className="text-sm text-muted-foreground">
                                Click a product row to view stock details and adjustment action.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            <Boxes className="size-3" />
                            Stock priority view
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Category</th>
                                    <th className="px-4 py-3 text-left font-medium">Current Stock</th>
                                    <th className="px-4 py-3 text-left font-medium">Reorder</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => {
                                        const isOpen = openProductId === product.id;
                                        const quantity = numberValue(product.quantity);
                                        const reorderLevel = numberValue(product.reorder_level);
                                        const stockState = getStockState(product);
                                        const stockPercent = Math.min(
                                            100,
                                            Math.max(5, reorderLevel > 0 ? (quantity / Math.max(reorderLevel * 2, 1)) * 100 : quantity > 0 ? 100 : 5),
                                        );

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
                                                        <div className="font-semibold">
                                                            {quantity} {product.unit ?? 'pcs'}
                                                        </div>
                                                        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                                                            <div className="h-full rounded-full bg-primary" style={{ width: `${stockPercent}%` }} />
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {reorderLevel} {product.unit ?? 'pcs'}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stockState.className}`}>
                                                            {stockState.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => openStockModal(product)}
                                                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                                            >
                                                                <Plus className="size-4" />
                                                                Adjust
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td colSpan={7} className="px-4 py-4">
                                                            <div className="space-y-4 rounded-xl border bg-card p-4">
                                                                <div className="grid gap-3 md:grid-cols-4">
                                                                    <Detail label="Product ID" value={`#${product.id}`} />
                                                                    <Detail label="SKU" value={product.sku || 'N/A'} />
                                                                    <Detail label="Barcode" value={product.barcode || 'N/A'} />
                                                                    <Detail label="Category" value={product.category?.name ?? 'Uncategorized'} />
                                                                    <Detail label="Current Quantity" value={`${quantity} ${product.unit ?? 'pcs'}`} />
                                                                    <Detail label="Reorder Level" value={`${reorderLevel} ${product.unit ?? 'pcs'}`} />
                                                                    <Detail label="Unit Cost" value={money(product.cost_price)} />
                                                                    <Detail label="Selling Price" value={money(product.selling_price)} />
                                                                    <Detail label="Stock Tracking" value={product.stock_tracking.replaceAll('_', ' ')} />
                                                                    <Detail label="Stock Status" value={stockState.label} />
                                                                </div>

                                                                <div className="flex justify-end">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openStockModal(product)}
                                                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                                                    >
                                                                        <Plus className="size-4" />
                                                                        Adjust This Product
                                                                    </button>
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
                                        <td colSpan={7} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
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

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex items-center justify-between gap-4 border-b p-4">
                        <div className="flex items-center gap-3">
                            <History className="size-5 text-muted-foreground" />
                            <div>
                                <h2 className="font-semibold">Recent Stock Movements</h2>
                                <p className="text-sm text-muted-foreground">Latest stock activity in your branch.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Quantity</th>
                                    <th className="px-4 py-3 text-left font-medium">Before</th>
                                    <th className="px-4 py-3 text-left font-medium">After</th>
                                    <th className="px-4 py-3 text-left font-medium">Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {movements.length > 0 ? (
                                    movements.map((movement) => {
                                        const isOpen = openMovementId === movement.id;

                                        return (
                                            <Fragment key={movement.id}>
                                                <tr
                                                    onClick={() => setOpenMovementId(isOpen ? null : movement.id)}
                                                    className="cursor-pointer border-t transition hover:bg-muted/40"
                                                >
                                                    <td className="px-4 py-3">
                                                        {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{movement.product?.name ?? 'Unknown product'}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            SKU: {movement.product?.sku ?? 'N/A'} · Barcode: {movement.product?.barcode ?? 'N/A'}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${movementClass(movement.movement_type)}`}>
                                                            {movement.movement_type.replaceAll('_', ' ')}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 font-medium">{numberValue(movement.quantity)}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{numberValue(movement.quantity_before)}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{numberValue(movement.quantity_after)}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{shortDateTime(movement.movement_date)}</td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td colSpan={7} className="px-4 py-4">
                                                            <div className="rounded-xl border bg-card p-4">
                                                                <div className="grid gap-3 md:grid-cols-4">
                                                                    <Detail label="Movement ID" value={`#${movement.id}`} />
                                                                    <Detail label="Product" value={movement.product?.name ?? 'Unknown product'} />
                                                                    <Detail label="Movement Type" value={movement.movement_type.replaceAll('_', ' ')} />
                                                                    <Detail label="Quantity" value={numberValue(movement.quantity)} />
                                                                    <Detail label="Quantity Before" value={numberValue(movement.quantity_before)} />
                                                                    <Detail label="Quantity After" value={numberValue(movement.quantity_after)} />
                                                                    <Detail label="Movement Date" value={shortDateTime(movement.movement_date)} />
                                                                </div>

                                                                <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                                                                    <p className="text-xs text-muted-foreground">Remarks</p>
                                                                    <p className="mt-1 text-sm">{movement.remarks ?? 'No remarks provided.'}</p>
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
                                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                            No stock movements yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isOpen && selectedProduct && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">Adjust Stock</CardTitle>
                                <CardDescription>
                                    {selectedProduct.name} · Current: {numberValue(selectedProduct.quantity)} {selectedProduct.unit ?? 'pcs'}
                                </CardDescription>
                            </div>

                            <button type="button" onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submit} className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
                            <Section title="Selected Product" description="Stock movement will be recorded under this product and branch.">
                                <div className="grid gap-3 md:grid-cols-4">
                                    <Detail label="Product" value={selectedProduct.name} />
                                    <Detail label="SKU" value={selectedProduct.sku || 'N/A'} />
                                    <Detail label="Current Stock" value={`${numberValue(selectedProduct.quantity)} ${selectedProduct.unit ?? 'pcs'}`} />
                                    <Detail label="Unit Cost" value={money(selectedProduct.cost_price)} />
                                </div>
                            </Section>

                            <Section title="Movement Details" description="Choose whether to add, remove, or set the actual stock quantity.">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Movement Type" error={form.errors.movement_type}>
                                        <select
                                            value={form.data.movement_type}
                                            onChange={(event) => form.setData('movement_type', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
                                            onChange={(event) => form.setData('quantity', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Unit Cost" error={form.errors.unit_cost}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.data.unit_cost}
                                            onChange={(event) => form.setData('unit_cost', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>
                                </div>

                                <Field label="Remarks" error={form.errors.remarks}>
                                    <textarea
                                        rows={3}
                                        value={form.data.remarks}
                                        onChange={(event) => form.setData('remarks', event.target.value)}
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Optional notes..."
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