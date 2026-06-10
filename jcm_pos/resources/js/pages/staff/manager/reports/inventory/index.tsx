import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Database,
    Layers3,
    Package,
    PackageCheck,
    PackageMinus,
    PackagePlus,
    RotateCcw,
    Search,
    Store,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { ReactNode, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const INVENTORY_REPORT_URL = '/staff/manager/reports/inventory';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manager', href: '/staff/manager/dashboard' },
    { title: 'Inventory Reports', href: INVENTORY_REPORT_URL },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type Category = {
    id: number;
    name: string;
};

type CategoryBreakdown = {
    category_name: string;
    product_count: number;
    total_quantity: number;
    cost_value: number;
};

type LowStockProduct = {
    id: number;
    name: string;
    sku?: string | null;
    quantity: number;
    reorder_level: number;
    cost_price: number;
    selling_price: number;
    category_name: string;
};

type RecentMovement = {
    id: number;
    product_id: number | null;
    product_name: string;
    sku?: string | null;
    movement_type: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    quantity_before: number;
    quantity_after: number;
    reference_type?: string | null;
    reference_id?: number | null;
    remarks?: string | null;
    movement_date: string;
};

type Product = {
    id: number;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    unit?: string | null;
    quantity: number;
    reorder_level: number;
    max_stock_level?: number | null;
    cost_price: number;
    selling_price: number;
    status: string;
    category_name: string;
    cost_value: number;
    retail_value: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TableTab = 'movements' | 'valuation';

type Props = {
    branch: Branch;
    summary: {
        total_products: number;
        total_quantity: number;
        inventory_cost_value: number;
        inventory_retail_value: number;
        potential_profit: number;
        in_stock: number;
        low_stock: number;
        out_of_stock: number;
        total_movements: number;
        stock_in_qty: number;
        stock_out_qty: number;
        adjustment_qty: number;
        total_movement_value: number;
    };
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    categoryBreakdown: CategoryBreakdown[];
    lowStockProducts: LowStockProduct[];
    recentMovements: RecentMovement[];
    categories: Category[];
    movementTypes: string[];
    filters: {
        search?: string | null;
        category_id?: string | number | null;
        stock_status?: string | null;
        movement_type?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
};

function money(value: number | string | null | undefined) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function numberFormat(value: number | string | null | undefined) {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function formatDateTime(value: string) {
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

function pretty(value?: string | null) {
    if (!value) return '—';

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function stockStatus(product: Product | LowStockProduct) {
    const quantity = Number(product.quantity ?? 0);
    const reorder = Number(product.reorder_level ?? 0);

    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= reorder) return 'Low Stock';

    return 'In Stock';
}

function stockStatusClass(status: string) {
    if (status === 'In Stock') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (status === 'Low Stock') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    if (status === 'Out of Stock') return 'bg-red-500/10 text-red-700 dark:text-red-400';

    return 'bg-muted text-muted-foreground';
}

function movementClass(type?: string | null) {
    if (type === 'stock_in') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (type === 'stock_out') return 'bg-red-500/10 text-red-700 dark:text-red-400';
    if (type === 'adjustment') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';

    return 'bg-primary/10 text-primary';
}

export default function ManagerInventoryReportsIndex({
    branch,
    summary,
    products,
    categoryBreakdown,
    lowStockProducts,
    recentMovements,
    categories,
    movementTypes,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryId, setCategoryId] = useState(filters?.category_id ? String(filters.category_id) : '');
    const [stockStatusValue, setStockStatusValue] = useState(filters?.stock_status ?? '');
    const [movementType, setMovementType] = useState(filters?.movement_type ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');
    const [activeTableTab, setActiveTableTab] = useState<TableTab>('movements');

    const maxCategoryValue = Math.max(...categoryBreakdown.map((item) => Number(item.cost_value || 0)), 1);

    const applyFilters = () => {
        router.get(
            INVENTORY_REPORT_URL,
            {
                search: search || undefined,
                category_id: categoryId || undefined,
                stock_status: stockStatusValue || undefined,
                movement_type: movementType || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setStockStatusValue('');
        setMovementType('');
        setDateFrom('');
        setDateTo('');

        router.get(INVENTORY_REPORT_URL, {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Inventory Reports" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Boxes className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Inventory Reports</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Review branch stock health, inventory valuation, low stock alerts, and movement audit.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>

                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>

                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                    {branch.is_active && <span className="rounded-full border px-3 py-1">Active</span>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-muted/30 px-4 py-3">
                            <p className="text-xs text-muted-foreground">Current Result</p>
                            <p className="mt-1 text-sm font-semibold">
                                Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} products
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <SummaryCard
                        title="Total Products"
                        value={numberFormat(summary.total_products)}
                        description="Products in this branch."
                        icon={<Package className="size-5" />}
                    />

                    <SummaryCard
                        title="Total Stock Qty"
                        value={numberFormat(summary.total_quantity)}
                        description="Overall stock quantity."
                        icon={<Boxes className="size-5" />}
                        variant="success"
                    />

                    <SummaryCard
                        title="Cost Value"
                        value={money(summary.inventory_cost_value)}
                        description="Inventory value by cost."
                        icon={<Wallet className="size-5" />}
                        variant="warning"
                    />

                    <SummaryCard
                        title="Retail Value"
                        value={money(summary.inventory_retail_value)}
                        description="Potential sales value."
                        icon={<TrendingUp className="size-5" />}
                    />

                    <SummaryCard
                        title="Potential Profit"
                        value={money(summary.potential_profit)}
                        description="Retail less cost value."
                        icon={<Database className="size-5" />}
                        variant="success"
                    />

                    <SummaryCard
                        title="Movements"
                        value={numberFormat(summary.total_movements)}
                        description="Stock movements in range."
                        icon={<ClipboardList className="size-5" />}
                        variant="danger"
                    />
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <HealthCard title="In Stock" value={summary.in_stock} icon={<PackageCheck className="size-5" />} variant="success" />
                    <HealthCard title="Low Stock" value={summary.low_stock} icon={<AlertTriangle className="size-5" />} variant="warning" />
                    <HealthCard title="Out of Stock" value={summary.out_of_stock} icon={<PackageMinus className="size-5" />} variant="danger" />
                    <HealthCard title="Stock In Qty" value={summary.stock_in_qty} icon={<PackagePlus className="size-5" />} variant="success" />
                    <HealthCard title="Stock Out Qty" value={summary.stock_out_qty} icon={<PackageMinus className="size-5" />} variant="danger" />
                    <HealthCard title="Adjustments" value={summary.adjustment_qty} icon={<RotateCcw className="size-5" />} />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-8">
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

                        <FilterSelect label="Category" value={categoryId} onChange={setCategoryId}>
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect label="Stock Status" value={stockStatusValue} onChange={setStockStatusValue}>
                            <option value="">All Status</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </FilterSelect>

                        <FilterSelect label="Movement Type" value={movementType} onChange={setMovementType}>
                            <option value="">All Movements</option>
                            {movementTypes.map((item) => (
                                <option key={item} value={item}>
                                    {pretty(item)}
                                </option>
                            ))}
                        </FilterSelect>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => setDateFrom(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 w-[120px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Search className="size-4" />
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Category Breakdown</h2>
                            <p className="text-sm text-muted-foreground">Inventory value and quantity grouped by category.</p>
                        </div>

                        <div className="space-y-4 p-4">
                            {categoryBreakdown.length > 0 ? (
                                categoryBreakdown.map((item) => {
                                    const width = (Number(item.cost_value || 0) / maxCategoryValue) * 100;

                                    return (
                                        <div key={item.category_name}>
                                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">{item.category_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {numberFormat(item.product_count)} product(s) • Qty: {numberFormat(item.total_quantity)}
                                                    </p>
                                                </div>

                                                <p className="whitespace-nowrap font-semibold">{money(item.cost_value)}</p>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState
                                    icon={<Layers3 className="size-5 text-muted-foreground" />}
                                    title="No category breakdown"
                                    description="Inventory category summary will appear here."
                                />
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Low Stock Alerts</h2>
                            <p className="text-sm text-muted-foreground">Products that need restocking soon.</p>
                        </div>

                        <div className="divide-y">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{item.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {item.category_name} • SKU: {item.sku || 'No SKU'}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stockStatusClass(stockStatus(item))}`}>
                                                {stockStatus(item)}
                                            </span>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Qty: {numberFormat(item.quantity)} / Reorder: {numberFormat(item.reorder_level)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8">
                                    <EmptyState
                                        icon={<PackageCheck className="size-5 text-muted-foreground" />}
                                        title="No low stock products"
                                        description="All products are above reorder level."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold">Inventory Details</h2>
                            <p className="text-sm text-muted-foreground">Switch between stock movements and inventory valuation.</p>
                        </div>

                        <div className="inline-flex rounded-lg border bg-muted/30 p-1">
                            <button
                                type="button"
                                onClick={() => setActiveTableTab('movements')}
                                className={[
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                    activeTableTab === 'movements' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
                                ].join(' ')}
                            >
                                Recent Stock Movements
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTableTab('valuation')}
                                className={[
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                    activeTableTab === 'valuation' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
                                ].join(' ')}
                            >
                                Inventory Valuation
                            </button>
                        </div>
                    </div>

                    {activeTableTab === 'movements' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Date / Time</th>
                                        <th className="px-4 py-3 text-left font-medium">Product</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-right font-medium">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium">Before</th>
                                        <th className="px-4 py-3 text-right font-medium">After</th>
                                        <th className="px-4 py-3 text-right font-medium">Value</th>
                                        <th className="px-4 py-3 text-left font-medium">Reference</th>
                                        <th className="px-4 py-3 text-left font-medium">Remarks</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentMovements.length > 0 ? (
                                        recentMovements.map((item) => (
                                            <tr key={item.id} className="border-t transition hover:bg-muted/40">
                                                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{formatDateTime(item.movement_date)}</td>

                                                <td className="min-w-[220px] px-4 py-4">
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">SKU: {item.sku || 'No SKU'}</p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${movementClass(item.movement_type)}`}>
                                                        {pretty(item.movement_type)}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-right font-medium">{numberFormat(item.quantity)}</td>
                                                <td className="whitespace-nowrap px-4 py-4 text-right text-muted-foreground">{numberFormat(item.quantity_before)}</td>
                                                <td className="whitespace-nowrap px-4 py-4 text-right text-muted-foreground">{numberFormat(item.quantity_after)}</td>
                                                <td className="whitespace-nowrap px-4 py-4 text-right">{money(item.total_cost)}</td>

                                                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                                                    {item.reference_type ? `${pretty(item.reference_type)} #${item.reference_id ?? '—'}` : '—'}
                                                </td>

                                                <td className="min-w-[220px] px-4 py-4 text-muted-foreground">{item.remarks || '—'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-14">
                                                <EmptyState
                                                    icon={<ClipboardList className="size-5 text-muted-foreground" />}
                                                    title="No stock movements found"
                                                    description="Stock movement history will appear here once recorded."
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Product</th>
                                            <th className="px-4 py-3 text-left font-medium">Category</th>
                                            <th className="px-4 py-3 text-left font-medium">SKU</th>
                                            <th className="px-4 py-3 text-right font-medium">Qty</th>
                                            <th className="px-4 py-3 text-right font-medium">Reorder</th>
                                            <th className="px-4 py-3 text-right font-medium">Cost</th>
                                            <th className="px-4 py-3 text-right font-medium">Selling</th>
                                            <th className="px-4 py-3 text-right font-medium">Cost Value</th>
                                            <th className="px-4 py-3 text-right font-medium">Retail Value</th>
                                            <th className="px-4 py-3 text-left font-medium">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.data.length > 0 ? (
                                            products.data.map((item) => {
                                                const status = stockStatus(item);

                                                return (
                                                    <tr key={item.id} className="border-t transition hover:bg-muted/40">
                                                        <td className="min-w-[240px] px-4 py-4">
                                                            <p className="font-medium">{item.name}</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                Barcode: {item.barcode || 'No barcode'} • Unit: {item.unit || 'pcs'}
                                                            </p>
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{item.category_name}</td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{item.sku || '—'}</td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-right font-medium">{numberFormat(item.quantity)}</td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-right text-muted-foreground">{numberFormat(item.reorder_level)}</td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-right">{money(item.cost_price)}</td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-right">{money(item.selling_price)}</td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-right">{money(item.cost_value)}</td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">{money(item.retail_value)}</td>

                                                        <td className="px-4 py-4">
                                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stockStatusClass(status)}`}>
                                                                {status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="px-4 py-14">
                                                    <EmptyState
                                                        icon={<Package className="size-5 text-muted-foreground" />}
                                                        title="No products found"
                                                        description="Try changing your filters or add products first."
                                                    />
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
                                                    if (link.url) {
                                                        router.visit(link.url, {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }
                                                }}
                                                className={[
                                                    'inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition',
                                                    link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                                    !link.url ? 'cursor-not-allowed opacity-50' : '',
                                                ].join(' ')}
                                            >
                                                {link.label.includes('Previous') ? <ChevronLeft className="size-4" /> : null}
                                                {link.label.includes('Next') ? <ChevronRight className="size-4" /> : cleanLabel(link.label)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
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
    icon,
    variant = 'default',
}: {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
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
                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 truncate text-xl font-bold tracking-tight xl:text-2xl">{value}</h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>{icon}</div>
            </div>
        </div>
    );
}

function HealthCard({
    title,
    value,
    icon,
    variant = 'default',
}: {
    title: string;
    value: number;
    icon: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const variantClass = {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
    }[variant];

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 truncate text-xl font-bold tracking-tight">{numberFormat(value)}</p>
                </div>

                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>{icon}</div>
            </div>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
                {children}
            </select>
        </div>
    );
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">{icon}</div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}