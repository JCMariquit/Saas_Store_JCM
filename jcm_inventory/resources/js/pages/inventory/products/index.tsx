import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Barcode,
    Boxes,
    CheckCircle2,
    CircleDollarSign,
    LoaderCircle,
    Package2,
    Pencil,
    Plus,
    Search,
    Tags,
    Trash2,
    Warehouse,
    X,
    XCircle,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type CategoryOption = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    is_active: boolean;
};

type ProductCategory = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
};

type Product = {
    id: number;
    tenant_id: number;
    category_id: number | null;
    name: string;
    slug: string;
    sku: string | null;
    barcode: string | null;
    description: string | null;
    image_path: string | null;
    unit: string;
    cost_price: string | number;
    selling_price: string | number;
    wholesale_price: string | number | null;
    stock_tracking: 'tracked' | 'not_tracked';
    is_active: boolean;
    warehouse_stocks_count: number;
    stock_movements_count: number;
    total_stock: string | number | null;
    category: ProductCategory | null;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedProducts = {
    current_page: number;
    data: Product[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type ProductSummary = {
    total: number;
    active: number;
    tracked: number;
    not_tracked: number;
};

type ProductFilters = {
    search: string;
    status: string;
    category_id: number | null;
    stock_tracking: string;
};

type ProductFormData = {
    category_id: string;
    name: string;
    sku: string;
    barcode: string;
    description: string;
    unit: string;
    cost_price: string;
    selling_price: string;
    wholesale_price: string;
    stock_tracking: 'tracked' | 'not_tracked';
    is_active: boolean;
};

type ProductPageProps = {
    products: PaginatedProducts;
    categories: CategoryOption[];
    summary: ProductSummary;
    filters: ProductFilters;
};

/*
|--------------------------------------------------------------------------
| Page Configuration
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Inventory',
        href: '/inventory/overview',
    },
    {
        title: 'Products',
        href: '/inventory/products',
    },
];

const emptyProductForm: ProductFormData = {
    category_id: '',
    name: '',
    sku: '',
    barcode: '',
    description: '',
    unit: 'pcs',
    cost_price: '0.00',
    selling_price: '0.00',
    wholesale_price: '',
    stock_tracking: 'tracked',
    is_active: true,
};

const commonUnits = [
    'pcs',
    'box',
    'pack',
    'bottle',
    'can',
    'sachet',
    'bag',
    'kg',
    'gram',
    'liter',
    'ml',
    'meter',
    'set',
    'pair',
];

/*
|--------------------------------------------------------------------------
| Product Page
|--------------------------------------------------------------------------
*/

export default function ProductIndex({
    products,
    categories,
    summary,
    filters,
}: ProductPageProps) {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [categoryId, setCategoryId] = useState(
        filters.category_id
            ? String(filters.category_id)
            : '',
    );

    const [stockTracking, setStockTracking] =
        useState(filters.stock_tracking ?? '');

    const form = useForm<ProductFormData>({
        ...emptyProductForm,
    });

    /*
    |--------------------------------------------------------------------------
    | Modal Actions
    |--------------------------------------------------------------------------
    */

    function resetAndCloseModal(): void {
        setIsModalOpen(false);
        setEditingProduct(null);

        form.clearErrors();

        form.setData({
            ...emptyProductForm,
        });
    }

    function closeModal(): void {
        if (form.processing) {
            return;
        }

        resetAndCloseModal();
    }

    function openCreateModal(): void {
        setEditingProduct(null);

        form.clearErrors();

        form.setData({
            ...emptyProductForm,
        });

        setIsModalOpen(true);
    }

    function openEditModal(product: Product): void {
        setEditingProduct(product);

        form.clearErrors();

        form.setData({
            category_id: product.category_id
                ? String(product.category_id)
                : '',
            name: product.name,
            sku: product.sku ?? '',
            barcode: product.barcode ?? '',
            description: product.description ?? '',
            unit: product.unit,
            cost_price: String(product.cost_price ?? '0.00'),
            selling_price: String(
                product.selling_price ?? '0.00',
            ),
            wholesale_price:
                product.wholesale_price !== null
                    ? String(product.wholesale_price)
                    : '',
            stock_tracking: product.stock_tracking,
            is_active: product.is_active,
        });

        setIsModalOpen(true);
    }

    /*
    |--------------------------------------------------------------------------
    | Create and Update
    |--------------------------------------------------------------------------
    */

    function submitProduct(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingProduct) {
            form.put(
                `/inventory/products/${editingProduct.id}`,
                {
                    preserveScroll: true,
                    onSuccess: resetAndCloseModal,
                },
            );

            return;
        }

        form.post('/inventory/products', {
            preserveScroll: true,
            onSuccess: resetAndCloseModal,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/inventory/products',
            {
                search: search.trim() || undefined,
                status: status || undefined,
                category_id: categoryId || undefined,
                stock_tracking:
                    stockTracking || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function resetFilters(): void {
        setSearch('');
        setStatus('');
        setCategoryId('');
        setStockTracking('');

        router.get(
            '/inventory/products',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Status and Delete
    |--------------------------------------------------------------------------
    */

    function toggleStatus(product: Product): void {
        router.patch(
            `/inventory/products/${product.id}/status`,
            {
                is_active: !product.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function deleteProduct(product: Product): void {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/inventory/products/${product.id}`,
            {
                preserveScroll: true,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Management" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Inventory Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Products
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage product information, pricing,
                            categories, and stock tracking.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Plus className="size-4" />
                        Add Product
                    </button>
                </section>

                {/* Summary Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Products"
                        value={summary.total}
                        icon={
                            <Package2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Active Products"
                        value={summary.active}
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Stock Tracked"
                        value={summary.tracked}
                        icon={<Boxes className="size-5" />}
                    />

                    <SummaryCard
                        title="Not Tracked"
                        value={summary.not_tracked}
                        icon={<XCircle className="size-5" />}
                    />
                </section>

                {/* Product Table Card */}
                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
                    {/* Filters */}
                    <form
                        onSubmit={applyFilters}
                        className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search product name, SKU, barcode..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={categoryId}
                            onChange={(event) =>
                                setCategoryId(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.parent_id
                                        ? '— '
                                        : ''}
                                    {category.name}

                                    {!category.is_active
                                        ? ' - Inactive'
                                        : ''}
                                </option>
                            ))}
                        </select>

                        <select
                            value={stockTracking}
                            onChange={(event) =>
                                setStockTracking(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All tracking types
                            </option>

                            <option value="tracked">
                                Stock tracked
                            </option>

                            <option value="not_tracked">
                                Not tracked
                            </option>
                        </select>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All statuses
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>

                        <button
                            type="submit"
                            className="h-10 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
                        >
                            Apply
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            Reset
                        </button>
                    </form>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Product
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Category
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Identification
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Pricing
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Total Stock
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Tracking
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="transition hover:bg-muted/30"
                                    >
                                        {/* Product */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Package2 className="size-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-medium">
                                                        {product.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Unit:{' '}
                                                        {product.unit}
                                                    </p>

                                                    {product.description && (
                                                        <p className="mt-1 max-w-[250px] truncate text-xs text-muted-foreground">
                                                            {
                                                                product.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-5 py-4">
                                            {product.category ? (
                                                <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                                                    <Tags className="size-4 text-muted-foreground" />

                                                    {
                                                        product.category
                                                            .name
                                                    }
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Uncategorized
                                                </span>
                                            )}
                                        </td>

                                        {/* Identification */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-1 text-sm">
                                                <p>
                                                    <span className="text-muted-foreground">
                                                        SKU:
                                                    </span>{' '}
                                                    {product.sku ?? '—'}
                                                </p>

                                                <p className="flex items-center gap-1.5">
                                                    <Barcode className="size-3.5 text-muted-foreground" />

                                                    {product.barcode ??
                                                        'No barcode'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Pricing */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-1 text-sm">
                                                <p className="font-medium">
                                                    {formatCurrency(
                                                        product.selling_price,
                                                    )}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    Cost:{' '}
                                                    {formatCurrency(
                                                        product.cost_price,
                                                    )}
                                                </p>

                                                {product.wholesale_price !==
                                                    null && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Wholesale:{' '}
                                                        {formatCurrency(
                                                            product.wholesale_price,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Stock */}
                                        <td className="px-5 py-4">
                                            {product.stock_tracking ===
                                            'tracked' ? (
                                                <div>
                                                    <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                                                        <Warehouse className="size-4 text-muted-foreground" />

                                                        <span className="font-medium">
                                                            {formatQuantity(
                                                                product.total_stock,
                                                            )}
                                                        </span>

                                                        <span className="text-muted-foreground">
                                                            {product.unit}
                                                        </span>
                                                    </span>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {
                                                            product.warehouse_stocks_count
                                                        }{' '}
                                                        warehouse record(s)
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Not tracked
                                                </span>
                                            )}
                                        </td>

                                        {/* Tracking */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={[
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                                                    product.stock_tracking ===
                                                    'tracked'
                                                        ? 'bg-blue-500/10 text-blue-600'
                                                        : 'bg-slate-500/10 text-slate-500',
                                                ].join(' ')}
                                            >
                                                <Boxes className="size-3.5" />

                                                {product.stock_tracking ===
                                                'tracked'
                                                    ? 'Tracked'
                                                    : 'Not tracked'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleStatus(
                                                        product,
                                                    )
                                                }
                                                className={[
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                                                    product.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                                        : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
                                                ].join(' ')}
                                            >
                                                {product.is_active ? (
                                                    <CheckCircle2 className="size-3.5" />
                                                ) : (
                                                    <XCircle className="size-3.5" />
                                                )}

                                                {product.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            product,
                                                        )
                                                    }
                                                    title="Edit product"
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteProduct(
                                                            product,
                                                        )
                                                    }
                                                    title={
                                                        product.warehouse_stocks_count >
                                                            0 ||
                                                        product.stock_movements_count >
                                                            0
                                                            ? 'Product has stock records or movement history'
                                                            : 'Delete product'
                                                    }
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border text-destructive transition hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Empty State */}
                                {products.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center"
                                        >
                                            <Package2 className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No products found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Add your first
                                                product to begin
                                                managing inventory.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    openCreateModal
                                                }
                                                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                            >
                                                <Plus className="size-4" />
                                                Add Product
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <ProductPagination
                        products={products}
                    />
                </section>
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingProduct
                                        ? 'Edit Product'
                                        : 'Add Product'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Enter the product information
                                    below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={form.processing}
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Product Form */}
                        <form
                            onSubmit={submitProduct}
                            className="space-y-5 p-6"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    label="Product Name"
                                    error={form.errors.name}
                                    required
                                >
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Product name"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Category"
                                    error={
                                        form.errors.category_id
                                    }
                                >
                                    <select
                                        value={
                                            form.data.category_id
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'category_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    >
                                        <option value="">
                                            No category
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {category.parent_id
                                                        ? '— '
                                                        : ''}
                                                    {
                                                        category.name
                                                    }

                                                    {!category.is_active
                                                        ? ' - Inactive'
                                                        : ''}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </FormField>

                                <FormField
                                    label="SKU"
                                    error={form.errors.sku}
                                >
                                    <input
                                        type="text"
                                        value={form.data.sku}
                                        onChange={(event) =>
                                            form.setData(
                                                'sku',
                                                event.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="PROD-001"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Barcode"
                                    error={
                                        form.errors.barcode
                                    }
                                >
                                    <input
                                        type="text"
                                        value={
                                            form.data.barcode
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'barcode',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Scan or enter barcode"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Unit"
                                    error={form.errors.unit}
                                    required
                                >
                                    <input
                                        type="text"
                                        list="product-units"
                                        value={form.data.unit}
                                        onChange={(event) =>
                                            form.setData(
                                                'unit',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="pcs"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />

                                    <datalist id="product-units">
                                        {commonUnits.map(
                                            (unit) => (
                                                <option
                                                    key={unit}
                                                    value={unit}
                                                />
                                            ),
                                        )}
                                    </datalist>
                                </FormField>

                                <FormField
                                    label="Stock Tracking"
                                    error={
                                        form.errors
                                            .stock_tracking
                                    }
                                    required
                                >
                                    <select
                                        value={
                                            form.data
                                                .stock_tracking
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'stock_tracking',
                                                event.target
                                                    .value as ProductFormData['stock_tracking'],
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    >
                                        <option value="tracked">
                                            Tracked
                                        </option>

                                        <option value="not_tracked">
                                            Not tracked
                                        </option>
                                    </select>
                                </FormField>
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">
                                <FormField
                                    label="Cost Price"
                                    error={
                                        form.errors.cost_price
                                    }
                                    required
                                >
                                    <PriceInput
                                        value={
                                            form.data.cost_price
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'cost_price',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>

                                <FormField
                                    label="Selling Price"
                                    error={
                                        form.errors
                                            .selling_price
                                    }
                                    required
                                >
                                    <PriceInput
                                        value={
                                            form.data
                                                .selling_price
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'selling_price',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>

                                <FormField
                                    label="Wholesale Price"
                                    error={
                                        form.errors
                                            .wholesale_price
                                    }
                                >
                                    <PriceInput
                                        value={
                                            form.data
                                                .wholesale_price
                                        }
                                        onChange={(value) =>
                                            form.setData(
                                                'wholesale_price',
                                                value,
                                            )
                                        }
                                        allowEmpty
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Description"
                                error={
                                    form.errors.description
                                }
                            >
                                <textarea
                                    rows={4}
                                    value={
                                        form.data.description
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Optional product description"
                                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </FormField>

                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-4">
                                <input
                                    type="checkbox"
                                    checked={
                                        form.data.is_active
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'is_active',
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-1 size-4 rounded border"
                                />

                                <span>
                                    <span className="block text-sm font-medium">
                                        Active Product
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                        Allow this product to be
                                        used in inventory
                                        transactions.
                                    </span>
                                </span>
                            </label>

                            {form.errors.is_active && (
                                <p className="text-sm text-destructive">
                                    {form.errors.is_active}
                                </p>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={form.processing}
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {form.processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}

                                    {editingProduct
                                        ? 'Save Changes'
                                        : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: ReactNode;
}) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                        {value}
                    </p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Form Field
|--------------------------------------------------------------------------
*/

function FormField({
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
        <label className="block space-y-2">
            <span className="text-sm font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-destructive">
                        *
                    </span>
                )}
            </span>

            {children}

            {error && (
                <span className="block text-xs text-destructive">
                    {error}
                </span>
            )}
        </label>
    );
}

/*
|--------------------------------------------------------------------------
| Price Input
|--------------------------------------------------------------------------
*/

function PriceInput({
    value,
    onChange,
    allowEmpty = false,
}: {
    value: string;
    onChange: (value: string) => void;
    allowEmpty?: boolean;
}) {
    return (
        <div className="relative">
            <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) => {
                    const nextValue = event.target.value;

                    if (
                        nextValue === '' &&
                        !allowEmpty
                    ) {
                        onChange('');

                        return;
                    }

                    onChange(nextValue);
                }}
                placeholder={allowEmpty ? 'Optional' : '0.00'}
                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

function ProductPagination({
    products,
}: {
    products: PaginatedProducts;
}) {
    if (products.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {products.from ?? 0} to{' '}
                {products.to ?? 0} of {products.total}{' '}
                products
            </p>

            <div className="flex flex-wrap gap-1">
                {products.links.map((link, index) => (
                    <button
                        key={`${link.label}-${index}`}
                        type="button"
                        disabled={!link.url}
                        onClick={() => {
                            if (!link.url) {
                                return;
                            }

                            router.get(
                                link.url,
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                        className={[
                            'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted',
                            !link.url
                                ? 'cursor-not-allowed opacity-40'
                                : '',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Formatting Helpers
|--------------------------------------------------------------------------
*/

function formatCurrency(
    value: string | number | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
}

function formatQuantity(
    value: string | number | null,
): string {
    const quantity = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(
        Number.isFinite(quantity)
            ? quantity
            : 0,
    );
}