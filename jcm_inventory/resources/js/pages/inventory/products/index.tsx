import { AppDrawer } from '@/components/shared/app-drawer';
import { AppPagination } from '@/components/shared/app-pagination';
import { BooleanField } from '@/components/shared/boolean-field';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EntityAvatar } from '@/components/shared/entity-avatar';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { FormDialog } from '@/components/shared/form-dialog';
import { FormField } from '@/components/shared/form-field';
import { MoneyInput } from '@/components/shared/money-input';
import { PageContainer } from '@/components/shared/page-container';
import { SearchInput } from '@/components/shared/search-input';
import { SectionCard } from '@/components/shared/section-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Barcode,
    Boxes,
    CheckCircle2,
    Package2,
    Pencil,
    Plus,
    RefreshCw,
    Tags,
    Trash2,
    XCircle,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useEffect,
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
| Configuration
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

const ALL_VALUE = 'all';
const NO_CATEGORY_VALUE = 'none';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ProductIndex({
    products,
    categories,
    summary,
    filters,
}: ProductPageProps) {
    const [isDialogOpen, setIsDialogOpen] =
        useState(false);

    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [detailsProduct, setDetailsProduct] =
        useState<Product | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Product | null>(null);

    const [deleteProcessing, setDeleteProcessing] =
        useState(false);

    const [
        statusProcessingId,
        setStatusProcessingId,
    ] = useState<number | null>(null);

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

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');

        setCategoryId(
            filters.category_id
                ? String(filters.category_id)
                : '',
        );

        setStockTracking(
            filters.stock_tracking ?? '',
        );
    }, [
        filters.search,
        filters.status,
        filters.category_id,
        filters.stock_tracking,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Dialog
    |--------------------------------------------------------------------------
    */

    function resetProductForm(): void {
        form.clearErrors();

        form.setData({
            ...emptyProductForm,
        });
    }

    function resetAndCloseDialog(): void {
        setIsDialogOpen(false);
        setEditingProduct(null);
        resetProductForm();
    }

    function requestCloseDialog(): void {
        if (form.processing) {
            return;
        }

        resetAndCloseDialog();
    }

    function handleDialogOpenChange(
        open: boolean,
    ): void {
        if (open) {
            setIsDialogOpen(true);
            return;
        }

        requestCloseDialog();
    }

    function openCreateDialog(): void {
        setEditingProduct(null);
        resetProductForm();
        setIsDialogOpen(true);
    }

    function openDetailsDrawer(
        product: Product,
    ): void {
        setDetailsProduct(product);
    }

    function closeDetailsDrawer(): void {
        setDetailsProduct(null);
    }

    function openEditDialog(
        product: Product,
    ): void {
        setEditingProduct(product);
        form.clearErrors();

        form.setData({
            category_id: product.category_id
                ? String(product.category_id)
                : '',
            name: product.name,
            sku: product.sku ?? '',
            barcode: product.barcode ?? '',
            description:
                product.description ?? '',
            unit: product.unit,
            cost_price: String(
                product.cost_price ?? '0.00',
            ),
            selling_price: String(
                product.selling_price ?? '0.00',
            ),
            wholesale_price:
                product.wholesale_price !== null
                    ? String(
                          product.wholesale_price,
                      )
                    : '',
            stock_tracking:
                product.stock_tracking,
            is_active: product.is_active,
        });

        setIsDialogOpen(true);
    }

    /*
    |--------------------------------------------------------------------------
    | Submit
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
                    onSuccess:
                        resetAndCloseDialog,
                },
            );

            return;
        }

        form.post('/inventory/products', {
            preserveScroll: true,
            onSuccess: resetAndCloseDialog,
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
                search:
                    search.trim() || undefined,
                status: status || undefined,
                category_id:
                    categoryId || undefined,
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
    | Status and delete
    |--------------------------------------------------------------------------
    */

    function toggleStatus(
        product: Product,
    ): void {
        if (
            statusProcessingId === product.id
        ) {
            return;
        }

        router.patch(
            `/inventory/products/${product.id}/status`,
            {
                is_active:
                    !product.is_active,
            },
            {
                preserveScroll: true,
                onStart: () =>
                    setStatusProcessingId(
                        product.id,
                    ),
                onFinish: () =>
                    setStatusProcessingId(null),
            },
        );
    }

    function requestDelete(
        product: Product,
    ): void {
        setDeleteTarget(product);
    }

    function deleteProduct(): void {
        if (
            !deleteTarget ||
            deleteProcessing
        ) {
            return;
        }

        router.delete(
            `/inventory/products/${deleteTarget.id}`,
            {
                preserveScroll: true,
                onStart: () =>
                    setDeleteProcessing(true),
                onSuccess: () =>
                    setDeleteTarget(null),
                onFinish: () =>
                    setDeleteProcessing(false),
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Derived values
    |--------------------------------------------------------------------------
    */

    const deleteHasRelations = Boolean(
        deleteTarget &&
            (deleteTarget.warehouse_stocks_count >
                0 ||
                deleteTarget.stock_movements_count >
                    0),
    );

    const inactiveProducts = Math.max(
        0,
        summary.total - summary.active,
    );

    const activePercentage =
        summary.total > 0
            ? Math.round(
                  (summary.active / summary.total) *
                      100,
              )
            : 0;

    const trackedPercentage =
        summary.total > 0
            ? Math.round(
                  (summary.tracked / summary.total) *
                      100,
              )
            : 0;

    const activeCategoryCount = categories.filter(
        (category) => category.is_active,
    ).length;

    const hasActiveFilters = Boolean(
        search ||
            status ||
            categoryId ||
            stockTracking,
    );

    const catalogHealthLabel =
        summary.total === 0
            ? 'No products configured'
            : inactiveProducts === 0
              ? 'Catalog operational'
              : `${inactiveProducts} inactive product${inactiveProducts === 1 ? '' : 's'}`;

    const catalogHealthClass =
        summary.total === 0
            ? 'border-slate-500/20 bg-slate-500/10 text-slate-300'
            : inactiveProducts === 0
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-300';

    const selectedFormCategory = categories.find(
        (category) =>
            String(category.id) === form.data.category_id,
    );

    const rawFormCostPrice = Number(form.data.cost_price || 0);
    const rawFormSellingPrice = Number(form.data.selling_price || 0);
    const rawFormWholesalePrice = Number(form.data.wholesale_price || 0);

    const formCostPrice = Number.isFinite(rawFormCostPrice)
        ? rawFormCostPrice
        : 0;

    const formSellingPrice = Number.isFinite(rawFormSellingPrice)
        ? rawFormSellingPrice
        : 0;

    const formWholesalePrice = Number.isFinite(rawFormWholesalePrice)
        ? rawFormWholesalePrice
        : 0;

    const formMargin = formSellingPrice - formCostPrice;
    const formMarginPercentage =
        formSellingPrice > 0
            ? (formMargin / formSellingPrice) * 100
            : 0;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <PageContainer className="gap-4 md:gap-5">
                {/* Product catalog control board */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.055] via-primary/[0.018] to-transparent shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-primary/10 bg-background/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.075] text-primary">
                                <Package2 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-foreground">
                                    Product Catalog Overview
                                </p>

                                <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground">
                                    A concise view of catalog readiness, tracking coverage, and configuration health.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className={cn(
                                'h-6 w-fit shrink-0 gap-1.5 rounded-full px-2.5 text-[9px] font-semibold',
                                catalogHealthClass,
                            )}
                        >
                            {summary.total === 0 ? (
                                <Package2 className="size-3" />
                            ) : inactiveProducts === 0 ? (
                                <CheckCircle2 className="size-3" />
                            ) : (
                                <XCircle className="size-3" />
                            )}

                            {catalogHealthLabel}
                        </Badge>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                        <div className="relative min-w-0 overflow-hidden p-4 md:p-5">
                            <div className="pointer-events-none absolute -left-20 -top-24 size-60 rounded-full bg-primary/[0.08] blur-3xl" />
                            <Package2 className="pointer-events-none absolute -bottom-10 -right-6 size-36 text-primary opacity-[0.018]" />

                            <div className="relative">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                                    Catalog readiness
                                </p>

                                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex min-w-0 items-end gap-3">
                                        <p className="shrink-0 text-[34px] font-semibold leading-none tracking-[-0.045em] tabular-nums text-primary sm:text-[38px]">
                                            {activePercentage}%
                                        </p>

                                        <div className="min-w-0 pb-0.5">
                                            <p className="text-[12px] font-semibold text-foreground">
                                                {summary.active} of {summary.total} products active
                                            </p>

                                            <p className="mt-1 max-w-xl text-[9px] leading-4 text-muted-foreground">
                                                Active products are available for stock setup, movement recording, and other inventory transactions.
                                            </p>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="h-7 w-fit shrink-0 rounded-full border-emerald-500/15 bg-emerald-500/[0.055] px-2.5 text-[9px] font-semibold text-emerald-300"
                                    >
                                        {summary.active} active record{summary.active === 1 ? '' : 's'}
                                    </Badge>
                                </div>

                                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background/70">
                                    <div
                                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                                        style={{
                                            width: `${activePercentage}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-5 grid border-t border-border/60 sm:grid-cols-3 sm:divide-x sm:divide-border/60">
                                    <div className="border-b border-border/60 py-3 sm:border-b-0 sm:pr-4">
                                        <div className="flex items-center justify-between gap-3 sm:block">
                                            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Tracking coverage
                                            </p>
                                            <p className="text-sm font-semibold tabular-nums text-primary/85 sm:mt-1.5">
                                                {trackedPercentage}%
                                            </p>
                                        </div>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            {summary.tracked} tracked · {summary.not_tracked} not tracked
                                        </p>
                                    </div>

                                    <div className="border-b border-border/60 py-3 sm:border-b-0 sm:px-4">
                                        <div className="flex items-center justify-between gap-3 sm:block">
                                            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Active categories
                                            </p>
                                            <p className="text-sm font-semibold tabular-nums text-primary sm:mt-1.5">
                                                {activeCategoryCount}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            From {categories.length} available categor{categories.length === 1 ? 'y' : 'ies'}
                                        </p>
                                    </div>

                                    <div className="py-3 sm:pl-4">
                                        <div className="flex items-center justify-between gap-3 sm:block">
                                            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Needs attention
                                            </p>
                                            <p
                                                className={cn(
                                                    'text-sm font-semibold tabular-nums sm:mt-1.5',
                                                    inactiveProducts > 0
                                                        ? 'text-amber-400'
                                                        : 'text-emerald-400',
                                                )}
                                            >
                                                {inactiveProducts}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            Inactive product record{inactiveProducts === 1 ? '' : 's'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0 border-t border-border/60 bg-background/20 xl:border-l xl:border-t-0">
                            <div className="border-b border-border/60 px-4 py-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Catalog facts
                                </p>
                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    Current configuration totals across the product directory.
                                </p>
                            </div>

                            <dl className="divide-y divide-border/60">
                                <CatalogFactRow
                                    label="Registered products"
                                    description="Complete catalog records"
                                    value={summary.total}
                                    icon={<Package2 className="size-3.5" />}
                                    tone="emerald"
                                />

                                <CatalogFactRow
                                    label="Stock tracked"
                                    description="Warehouse balances monitored"
                                    value={summary.tracked}
                                    icon={<Boxes className="size-3.5" />}
                                    tone="teal"
                                />

                                <CatalogFactRow
                                    label="Not tracked"
                                    description="Excluded from quantity balances"
                                    value={summary.not_tracked}
                                    icon={<XCircle className="size-3.5" />}
                                    tone="amber"
                                />
                            </dl>
                        </div>
                    </div>
                </section>

                {/* Product directory */}

                <SectionCard
                    title="Product Directory"
                    description="Select any product row to open its complete catalog and inventory record."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-primary/15 bg-primary/[0.06] px-2.5 text-[10px] font-medium text-primary"
                            >
                                <Package2 className="mr-1 size-3" />
                                {products.total} item
                                {products.total === 1 ? '' : 's'}
                            </Badge>

                            <Button
                                type="button"
                                onClick={openCreateDialog}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Add Product
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_170px_150px]"
                        actions={
                            <>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="h-10 px-4 text-sm"
                                >
                                    Apply Filters
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilters}
                                    disabled={!hasActiveFilters}
                                    className="h-10 px-3 text-sm"
                                >
                                    <RefreshCw className="size-3.5" />
                                    Reset
                                </Button>
                            </>
                        }
                    >
                        <SearchInput
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            onClear={() =>
                                setSearch('')
                            }
                            placeholder="Search product name, SKU, or barcode..."
                            className="sm:col-span-2 xl:col-span-1"
                        />

                        <Select
                            value={
                                categoryId || ALL_VALUE
                            }
                            onValueChange={(value) =>
                                setCategoryId(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All categories
                                </SelectItem>

                                {categories.map(
                                    (category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(
                                                category.id,
                                            )}
                                        >
                                            {category.parent_id
                                                ? '— '
                                                : ''}
                                            {category.name}
                                            {!category.is_active
                                                ? ' — Inactive'
                                                : ''}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                stockTracking ||
                                ALL_VALUE
                            }
                            onValueChange={(value) =>
                                setStockTracking(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All tracking" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All tracking types
                                </SelectItem>
                                <SelectItem value="tracked">
                                    Stock tracked
                                </SelectItem>
                                <SelectItem value="not_tracked">
                                    Not tracked
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={status || ALL_VALUE}
                            onValueChange={(value) =>
                                setStatus(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All statuses
                                </SelectItem>
                                <SelectItem value="active">
                                    Active
                                </SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <ProductDirectoryTable
                        products={products.data}
                        onSelect={openDetailsDrawer}
                        onCreate={openCreateDialog}
                    />

                    <AppPagination
                        pagination={products}
                        itemLabel="products"
                    />
                </SectionCard>
            </PageContainer>


            <ProductDetailsDrawer
                product={detailsProduct}
                statusProcessingId={statusProcessingId}
                onClose={closeDetailsDrawer}
                onEdit={(product) => {
                    closeDetailsDrawer();
                    openEditDialog(product);
                }}
                onToggleStatus={(product) => {
                    closeDetailsDrawer();
                    toggleStatus(product);
                }}
                onDelete={(product) => {
                    closeDetailsDrawer();
                    requestDelete(product);
                }}
            />

            <FormDialog
                open={isDialogOpen}
                onOpenChange={handleDialogOpenChange}
                title={
                    editingProduct
                        ? 'Edit Product Record'
                        : 'Register Product'
                }
                description={
                    editingProduct
                        ? `Maintain the catalog, pricing, and inventory settings for ${editingProduct.name}.`
                        : 'Create a complete product record for catalog and inventory operations.'
                }
                onSubmit={submitProduct}
                processing={form.processing}
                submitText={
                    editingProduct
                        ? 'Save Product Record'
                        : 'Register Product'
                }
                processingText={
                    editingProduct
                        ? 'Saving Product Record...'
                        : 'Registering Product...'
                }
                maxWidth="max-w-5xl"
            >
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                    <div className="flex flex-col gap-3 border-b border-primary/10 bg-gradient-to-r from-primary/[0.045] to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06] text-primary">
                                <Package2 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-primary">
                                    {editingProduct
                                        ? 'Catalog maintenance'
                                        : 'New catalog record'}
                                </p>

                                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                                    Complete the product identity first, then confirm pricing and inventory behavior.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                label={
                                    form.data.is_active
                                        ? 'Active'
                                        : 'Inactive'
                                }
                                variant={
                                    form.data.is_active
                                        ? 'success'
                                        : 'danger'
                                }
                            />

                            <StatusBadge
                                label={
                                    form.data.stock_tracking === 'tracked'
                                        ? 'Stock tracked'
                                        : 'Not tracked'
                                }
                                variant={
                                    form.data.stock_tracking === 'tracked'
                                        ? 'info'
                                        : 'neutral'
                                }
                            />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0">
                            <section className="p-5">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                                            01 · Product identity
                                        </p>

                                        <h3 className="mt-1 text-sm font-semibold text-foreground">
                                            Catalog information
                                        </h3>

                                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                            Define how this product is identified and grouped throughout inventory operations.
                                        </p>
                                    </div>

                                    <span className="hidden text-[9px] font-medium text-muted-foreground sm:block">
                                        <span className="text-rose-400">*</span> Required fields
                                    </span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-12">
                                    <div className="md:col-span-8">
                                        <FormField
                                            id="name"
                                            label="Product Name"
                                            error={form.errors.name}
                                            required
                                        >
                                            <Input
                                                id="name"
                                                type="text"
                                                value={form.data.name}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Enter the product name"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                        </FormField>
                                    </div>

                                    <div className="md:col-span-4">
                                        <FormField
                                            id="category_id"
                                            label="Category"
                                            error={form.errors.category_id}
                                        >
                                            <Select
                                                value={
                                                    form.data.category_id ||
                                                    NO_CATEGORY_VALUE
                                                }
                                                disabled={form.processing}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'category_id',
                                                        value === NO_CATEGORY_VALUE
                                                            ? ''
                                                            : value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="category_id">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value={NO_CATEGORY_VALUE}>
                                                        No category
                                                    </SelectItem>

                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={String(category.id)}
                                                        >
                                                            {category.parent_id ? '— ' : ''}
                                                            {category.name}
                                                            {!category.is_active
                                                                ? ' — Inactive'
                                                                : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                    </div>

                                    <div className="md:col-span-4">
                                        <FormField
                                            id="sku"
                                            label="SKU"
                                            description="Optional internal stock code."
                                            error={form.errors.sku}
                                        >
                                            <Input
                                                id="sku"
                                                type="text"
                                                value={form.data.sku}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'sku',
                                                        event.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="PROD-001"
                                                className="font-mono uppercase"
                                                autoComplete="off"
                                            />
                                        </FormField>
                                    </div>

                                    <div className="md:col-span-5">
                                        <FormField
                                            id="barcode"
                                            label="Barcode"
                                            description="Scan or enter the retail barcode."
                                            error={form.errors.barcode}
                                        >
                                            <div className="group relative">
                                                <Barcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />

                                                <Input
                                                    id="barcode"
                                                    type="text"
                                                    value={form.data.barcode}
                                                    disabled={form.processing}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'barcode',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Scan or enter barcode"
                                                    className="pl-9 font-mono"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </FormField>
                                    </div>

                                    <div className="md:col-span-3">
                                        <FormField
                                            id="unit"
                                            label="Unit of Measure"
                                            description="Standard inventory and selling unit."
                                            error={form.errors.unit}
                                            required
                                        >
                                            <Input
                                                id="unit"
                                                type="text"
                                                list="product-units"
                                                value={form.data.unit}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'unit',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="pcs"
                                                autoComplete="off"
                                            />

                                            <datalist id="product-units">
                                                {commonUnits.map((unit) => (
                                                    <option
                                                        key={unit}
                                                        value={unit}
                                                    />
                                                ))}
                                            </datalist>
                                        </FormField>
                                    </div>

                                    <div className="md:col-span-12">
                                        <FormField
                                            id="description"
                                            label="Internal Description"
                                            description="Optional notes used to distinguish this item from similar products."
                                            error={form.errors.description}
                                        >
                                            <Textarea
                                                id="description"
                                                rows={3}
                                                value={form.data.description}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'description',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Add a concise product description..."
                                                className="resize-none"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            </section>

                            <section className="border-t border-border/70 p-5">
                                <div className="mb-5">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                                        02 · Commercial profile
                                    </p>

                                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                                        Product pricing
                                    </h3>

                                    <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                        Store the standard acquisition, selling, and optional wholesale prices.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <FormField
                                        id="cost_price"
                                        label="Cost Price"
                                        error={form.errors.cost_price}
                                        required
                                    >
                                        <MoneyInput
                                            id="cost_price"
                                            value={form.data.cost_price}
                                            disabled={form.processing}
                                            onValueChange={(value) =>
                                                form.setData('cost_price', value)
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        id="selling_price"
                                        label="Selling Price"
                                        error={form.errors.selling_price}
                                        required
                                    >
                                        <MoneyInput
                                            id="selling_price"
                                            value={form.data.selling_price}
                                            disabled={form.processing}
                                            onValueChange={(value) =>
                                                form.setData('selling_price', value)
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        id="wholesale_price"
                                        label="Wholesale Price"
                                        error={form.errors.wholesale_price}
                                    >
                                        <MoneyInput
                                            id="wholesale_price"
                                            value={form.data.wholesale_price}
                                            disabled={form.processing}
                                            onValueChange={(value) =>
                                                form.setData('wholesale_price', value)
                                            }
                                            placeholder="Optional"
                                        />
                                    </FormField>
                                </div>

                                <div className="mt-5 grid border-y border-border/60 bg-background/20 sm:grid-cols-3">
                                    <ProductFormSummaryCell
                                        label="Gross margin"
                                        value={formatCurrency(formMargin)}
                                        helper={`${formatDecimal(formMarginPercentage)}% of selling price`}
                                        valueClassName={
                                            formMargin >= 0
                                                ? 'text-emerald-400'
                                                : 'text-rose-400'
                                        }
                                        className="border-b border-border/60 sm:border-b-0 sm:border-r"
                                    />

                                    <ProductFormSummaryCell
                                        label="Wholesale"
                                        value={
                                            form.data.wholesale_price
                                                ? formatCurrency(formWholesalePrice)
                                                : 'Not set'
                                        }
                                        helper="Optional alternate price"
                                        className="border-b border-border/60 sm:border-b-0 sm:border-r"
                                    />

                                    <ProductFormSummaryCell
                                        label="Pricing status"
                                        value={
                                            formSellingPrice >= formCostPrice
                                                ? 'Review complete'
                                                : 'Below cost'
                                        }
                                        helper={
                                            formSellingPrice >= formCostPrice
                                                ? 'Selling price covers cost'
                                                : 'Confirm the intended margin'
                                        }
                                        valueClassName={
                                            formSellingPrice >= formCostPrice
                                                ? 'text-emerald-400'
                                                : 'text-amber-400'
                                        }
                                    />
                                </div>
                            </section>
                        </div>

                        <aside className="border-t border-border/70 bg-muted/[0.018] p-5 lg:border-l lg:border-t-0">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                                    03 · Operations
                                </p>

                                <h3 className="mt-1 text-sm font-semibold text-foreground">
                                    Inventory behavior
                                </h3>

                                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                    Control quantity tracking and whether the product can be used in transactions.
                                </p>
                            </div>

                            <div className="mt-5 space-y-5">
                                <FormField
                                    id="stock_tracking"
                                    label="Stock Tracking"
                                    description="Tracked products maintain warehouse balances and movement history."
                                    error={form.errors.stock_tracking}
                                    required
                                >
                                    <Select
                                        value={form.data.stock_tracking}
                                        disabled={form.processing}
                                        onValueChange={(value) =>
                                            form.setData(
                                                'stock_tracking',
                                                value as ProductFormData['stock_tracking'],
                                            )
                                        }
                                    >
                                        <SelectTrigger id="stock_tracking">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="tracked">
                                                Stock tracked
                                            </SelectItem>

                                            <SelectItem value="not_tracked">
                                                Not tracked
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <BooleanField
                                    id="is_active"
                                    checked={form.data.is_active}
                                    disabled={form.processing}
                                    onCheckedChange={(checked) =>
                                        form.setData('is_active', checked)
                                    }
                                    label="Active Product"
                                    description="Active products can be used in inventory transactions."
                                    error={form.errors.is_active}
                                />
                            </div>

                            <div className="my-5 h-px bg-border/70" />

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Record preview
                                </p>

                                <dl className="mt-3 divide-y divide-border/60 border-y border-border/60 text-[10px]">
                                    <ProductFormPreviewRow
                                        label="Category"
                                        value={
                                            selectedFormCategory
                                                ? selectedFormCategory.name
                                                : 'Uncategorized'
                                        }
                                    />

                                    <ProductFormPreviewRow
                                        label="Unit"
                                        value={form.data.unit || 'Not set'}
                                    />

                                    <ProductFormPreviewRow
                                        label="Stock mode"
                                        value={
                                            form.data.stock_tracking === 'tracked'
                                                ? 'Warehouse tracked'
                                                : 'Quantity not tracked'
                                        }
                                    />

                                    <ProductFormPreviewRow
                                        label="Availability"
                                        value={
                                            form.data.is_active
                                                ? 'Available for use'
                                                : 'Inactive record'
                                        }
                                    />
                                </dl>
                            </div>

                            <div className="mt-5 border-l-2 border-primary/30 pl-3">
                                <p className="text-[9px] font-semibold text-foreground/80">
                                    Inventory note
                                </p>

                                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                    Opening quantities are maintained separately in Stock Management after a tracked product is registered.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </FormDialog>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
                title="Delete Product"
                description={
                    deleteHasRelations
                        ? `"${deleteTarget?.name}" has warehouse stock records or movement history. The system may prevent deletion to preserve inventory records.`
                        : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
                }
                confirmText="Delete Product"
                processing={deleteProcessing}
                destructive
                onConfirm={deleteProduct}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Clickable product directory
|--------------------------------------------------------------------------
*/

function ProductDirectoryTable({
    products,
    onSelect,
    onCreate,
}: {
    products: Product[];
    onSelect: (product: Product) => void;
    onCreate: () => void;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse">
                    <thead className="border-b border-primary/10 bg-primary/[0.025]">
                        <tr>
                            <th className="min-w-[280px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Product
                            </th>
                            <th className="min-w-[175px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Category
                            </th>
                            <th className="min-w-[145px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Selling Price
                            </th>
                            <th className="min-w-[185px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Inventory
                            </th>
                            <th className="min-w-[135px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border/60">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14">
                                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                        <span className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.045] text-primary">
                                            <Package2 className="size-5" />
                                        </span>
                                        <h3 className="mt-3 text-sm font-semibold text-foreground">
                                            No products found
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Try changing the filters or add your first inventory product.
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={onCreate}
                                            className="mt-4 h-9 rounded-lg px-4 text-xs"
                                        >
                                            <Plus className="size-4" />
                                            Add Product
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr
                                    key={product.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View details for ${product.name}`}
                                    onClick={() => onSelect(product)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' ||
                                            event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            onSelect(product);
                                        }
                                    }}
                                    className="group cursor-pointer bg-card/55 transition-colors hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                                >
                                    <td className="px-4 py-2.5">
                                        <EntityInfo
                                            avatar={
                                                <EntityAvatar
                                                    icon={Package2}
                                                    className="border-primary/15 bg-primary/[0.07] text-primary transition-colors group-hover:border-primary/25 group-hover:bg-primary/10"
                                                />
                                            }
                                            title={product.name}
                                            subtitle={
                                                <span className="font-mono text-[10px]">
                                                    {product.sku ?? 'No SKU'}
                                                </span>
                                            }
                                        />
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Tags className="size-3.5 shrink-0 text-primary" />
                                                <p className="max-w-[145px] truncate text-[11px] font-semibold text-foreground/90">
                                                    {product.category?.name ?? 'Uncategorized'}
                                                </p>
                                            </div>
                                            <p className="mt-1 max-w-[160px] truncate font-mono text-[9px] text-muted-foreground">
                                                {product.category?.slug ?? 'No category assigned'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <p className="text-[13px] font-semibold tabular-nums text-primary">
                                            {formatCurrency(product.selling_price)}
                                        </p>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            Cost {formatCurrency(product.cost_price)}
                                        </p>
                                    </td>

                                    <td className="px-4 py-2.5">
                                        {product.stock_tracking === 'tracked' ? (
                                            <div>
                                                <p className="text-[13px] font-semibold tabular-nums text-foreground">
                                                    {formatQuantity(product.total_stock)}{' '}
                                                    <span className="text-[9px] font-medium text-muted-foreground">
                                                        {product.unit}
                                                    </span>
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    {product.warehouse_stocks_count} warehouse record
                                                    {product.warehouse_stocks_count === 1 ? '' : 's'} ·{' '}
                                                    {product.stock_movements_count} movement
                                                    {product.stock_movements_count === 1 ? '' : 's'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-[10px] font-semibold text-muted-foreground">
                                                    Quantity not tracked
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    Excluded from warehouse balances
                                                </p>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-col items-start gap-1.5">
                                            <StatusBadge
                                                label={product.is_active ? 'Active' : 'Inactive'}
                                                variant={product.is_active ? 'success' : 'danger'}
                                            />
                                            <StatusBadge
                                                label={
                                                    product.stock_tracking === 'tracked'
                                                        ? 'Tracked'
                                                        : 'Not tracked'
                                                }
                                                variant={
                                                    product.stock_tracking === 'tracked'
                                                        ? 'info'
                                                        : 'neutral'
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Local presentation helpers
|--------------------------------------------------------------------------
*/


function ProductFormSummaryCell({
    label,
    value,
    helper,
    valueClassName,
    className,
}: {
    label: string;
    value: string;
    helper: string;
    valueClassName?: string;
    className?: string;
}) {
    return (
        <div className={cn('min-w-0 px-3.5 py-3', className)}>
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>

            <p
                className={cn(
                    'mt-1.5 truncate text-[12px] font-semibold tabular-nums text-foreground',
                    valueClassName,
                )}
            >
                {value}
            </p>

            <p className="mt-1 truncate text-[8px] text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}

function ProductFormPreviewRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="max-w-[160px] text-right font-medium text-foreground/85">
                {value}
            </dd>
        </div>
    );
}

function ProductDetailsDrawer({
    product,
    statusProcessingId,
    onClose,
    onEdit,
    onToggleStatus,
    onDelete,
}: {
    product: Product | null;
    statusProcessingId: number | null;
    onClose: () => void;
    onEdit: (product: Product) => void;
    onToggleStatus: (product: Product) => void;
    onDelete: (product: Product) => void;
}) {
    const tracked = product?.stock_tracking === 'tracked';
    const costPrice = Number(product?.cost_price ?? 0);
    const sellingPrice = Number(product?.selling_price ?? 0);
    const margin = sellingPrice - costPrice;
    const marginPercentage =
        sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;

    return (
        <AppDrawer
            open={product !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title="Product Record"
            description="Review catalog identity, pricing, inventory configuration, and product activity."
            processing={false}
        >
            {product && (
                <div className="flex min-h-full flex-col bg-card">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <section className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                                            Catalog product
                                        </p>
                                        <StatusBadge
                                            label={product.is_active ? 'Active' : 'Inactive'}
                                            variant={product.is_active ? 'success' : 'danger'}
                                        />
                                        <StatusBadge
                                            label={tracked ? 'Stock tracked' : 'Not tracked'}
                                            variant={tracked ? 'info' : 'neutral'}
                                        />
                                    </div>

                                    <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-foreground">
                                        {product.name}
                                    </h2>

                                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                                        {product.sku ?? 'No SKU'}
                                        {product.barcode
                                            ? ` · ${product.barcode}`
                                            : ' · No barcode'}
                                    </p>

                                    <p className="mt-2 max-w-xl text-[10px] leading-5 text-muted-foreground">
                                        {product.description ??
                                            'No internal product description was provided.'}
                                    </p>
                                </div>

                                <div className="shrink-0 text-left sm:text-right">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        Selling price
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold leading-none tabular-nums text-primary">
                                        {formatCurrency(product.selling_price)}
                                    </p>
                                    <p className="mt-1 text-[9px] text-muted-foreground">
                                        per {product.unit}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid border-y border-border/60 sm:grid-cols-4">
                                <ProductSummaryCell
                                    label="Cost price"
                                    value={formatCurrency(product.cost_price)}
                                    helper="Standard unit cost"
                                    className="border-b border-border/60 sm:border-b-0 sm:border-r"
                                />
                                <ProductSummaryCell
                                    label="Gross margin"
                                    value={formatCurrency(margin)}
                                    helper={`${formatDecimal(marginPercentage)}% of selling price`}
                                    valueClassName={
                                        margin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }
                                    className="border-b border-border/60 sm:border-b-0 sm:border-r"
                                />
                                <ProductSummaryCell
                                    label="Available stock"
                                    value={
                                        tracked
                                            ? `${formatQuantity(product.total_stock)} ${product.unit}`
                                            : 'Not tracked'
                                    }
                                    helper={
                                        tracked
                                            ? `${product.warehouse_stocks_count} warehouse records`
                                            : 'No quantity balance'
                                    }
                                    className="border-b border-border/60 sm:border-b-0 sm:border-r"
                                />
                                <ProductSummaryCell
                                    label="Movement records"
                                    value={formatNumber(product.stock_movements_count)}
                                    helper="Inventory activity links"
                                />
                            </div>
                        </section>

                        <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(270px,0.85fr)]">
                            <div className="min-w-0 divide-y divide-border/60 lg:border-r lg:border-border/60">
                                <ProductDocumentSection
                                    title="Product Information"
                                    description="Core identity and catalog placement."
                                >
                                    <ProductDetailRow
                                        label="Product ID"
                                        value={`#${product.id}`}
                                        mono
                                    />
                                    <ProductDetailRow
                                        label="Product name"
                                        value={product.name}
                                    />
                                    <ProductDetailRow
                                        label="Slug"
                                        value={product.slug}
                                        mono
                                    />
                                    <ProductDetailRow
                                        label="SKU"
                                        value={product.sku ?? 'Not assigned'}
                                        mono
                                    />
                                    <ProductDetailRow
                                        label="Barcode"
                                        value={product.barcode ?? 'Not assigned'}
                                        mono
                                    />
                                    <ProductDetailRow
                                        label="Unit"
                                        value={product.unit}
                                    />
                                </ProductDocumentSection>

                                <ProductDocumentSection
                                    title="Commercial Profile"
                                    description="Standard prices used for purchasing and selling."
                                >
                                    <ProductDetailRow
                                        label="Cost price"
                                        value={formatCurrency(product.cost_price)}
                                    />
                                    <ProductDetailRow
                                        label="Selling price"
                                        value={formatCurrency(product.selling_price)}
                                        valueClassName="text-primary"
                                    />
                                    <ProductDetailRow
                                        label="Wholesale price"
                                        value={
                                            product.wholesale_price !== null
                                                ? formatCurrency(product.wholesale_price)
                                                : 'Not set'
                                        }
                                    />
                                    <ProductDetailRow
                                        label="Gross margin"
                                        value={`${formatCurrency(margin)} · ${formatDecimal(
                                            marginPercentage,
                                        )}%`}
                                        valueClassName={
                                            margin >= 0
                                                ? 'text-emerald-400'
                                                : 'text-rose-400'
                                        }
                                    />
                                </ProductDocumentSection>
                            </div>

                            <aside className="min-w-0 divide-y divide-border/60 bg-muted/[0.018]">
                                <ProductDocumentSection
                                    title="Catalog and Inventory"
                                    description="Category and warehouse configuration."
                                >
                                    <ProductDetailRow
                                        label="Category"
                                        value={product.category?.name ?? 'Uncategorized'}
                                    />
                                    <ProductDetailRow
                                        label="Category status"
                                        value={
                                            product.category
                                                ? product.category.is_active
                                                    ? 'Active category'
                                                    : 'Inactive category'
                                                : 'Not applicable'
                                        }
                                    />
                                    <ProductDetailRow
                                        label="Stock tracking"
                                        value={tracked ? 'Tracked inventory' : 'Not tracked'}
                                    />
                                    <ProductDetailRow
                                        label="Total stock"
                                        value={
                                            tracked
                                                ? `${formatQuantity(product.total_stock)} ${product.unit}`
                                                : 'Not maintained'
                                        }
                                    />
                                    <ProductDetailRow
                                        label="Warehouse records"
                                        value={formatNumber(product.warehouse_stocks_count)}
                                    />
                                    <ProductDetailRow
                                        label="Movement records"
                                        value={formatNumber(product.stock_movements_count)}
                                    />
                                </ProductDocumentSection>

                                <ProductDocumentSection
                                    title="Record Audit"
                                    description="System status and timestamps."
                                >
                                    <ProductDetailRow
                                        label="Product status"
                                        value={product.is_active ? 'Active' : 'Inactive'}
                                        valueClassName={
                                            product.is_active
                                                ? 'text-emerald-400'
                                                : 'text-rose-400'
                                        }
                                    />
                                    <ProductDetailRow
                                        label="Tenant ID"
                                        value={`#${product.tenant_id}`}
                                        mono
                                    />
                                    <ProductDetailRow
                                        label="Created"
                                        value={formatDateTime(product.created_at)}
                                    />
                                    <ProductDetailRow
                                        label="Updated"
                                        value={formatDateTime(product.updated_at)}
                                    />
                                </ProductDocumentSection>
                            </aside>
                        </div>
                    </div>

                    <footer className="flex shrink-0 flex-col gap-2 border-t border-border/60 bg-background/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-9 rounded-lg text-xs"
                        >
                            Close
                        </Button>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={statusProcessingId === product.id}
                                onClick={() => onToggleStatus(product)}
                                className={cn(
                                    'h-9 rounded-lg text-xs',
                                    product.is_active
                                        ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/[0.07] hover:text-amber-300'
                                        : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/[0.07] hover:text-emerald-300',
                                )}
                            >
                                {product.is_active ? 'Deactivate' : 'Activate'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onDelete(product)}
                                className="h-9 rounded-lg border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/[0.07] hover:text-rose-300"
                            >
                                <Trash2 className="size-3.5" />
                                Delete
                            </Button>

                            <Button
                                type="button"
                                onClick={() => onEdit(product)}
                                className="h-9 rounded-lg bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90"
                            >
                                <Pencil className="size-3.5" />
                                Edit Product
                            </Button>
                        </div>
                    </footer>
                </div>
            )}
        </AppDrawer>
    );
}

function ProductSummaryCell({
    label,
    value,
    helper,
    className,
    valueClassName,
}: {
    label: string;
    value: string;
    helper: string;
    className?: string;
    valueClassName?: string;
}) {
    return (
        <div className={cn('min-w-0 px-0 py-3 sm:px-3.5', className)}>
            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </p>
            <p
                className={cn(
                    'mt-1.5 truncate text-[11px] font-semibold tabular-nums text-foreground',
                    valueClassName,
                )}
                title={value}
            >
                {value}
            </p>
            <p className="mt-1 truncate text-[8px] text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}

function ProductDocumentSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="px-5 py-5">
            <div className="mb-3">
                <h3 className="text-[11px] font-semibold text-foreground">
                    {title}
                </h3>
                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                    {description}
                </p>
            </div>
            <dl className="divide-y divide-border/55 border-y border-border/55">
                {children}
            </dl>
        </section>
    );
}

function ProductDetailRow({
    label,
    value,
    mono = false,
    valueClassName,
}: {
    label: string;
    value: string;
    mono?: boolean;
    valueClassName?: string;
}) {
    return (
        <div className="grid min-w-0 gap-1 py-2.5 sm:grid-cols-[125px_minmax(0,1fr)] sm:items-start sm:gap-4">
            <dt className="text-[9px] text-muted-foreground">{label}</dt>
            <dd
                className={cn(
                    'min-w-0 break-words text-[10px] font-semibold text-foreground/90 sm:text-right',
                    mono && 'font-mono',
                    valueClassName,
                )}
            >
                {value}
            </dd>
        </div>
    );
}

function CatalogFactRow({
    label,
    description,
    value,
    icon,
    tone,
}: {
    label: string;
    description: string;
    value: number;
    icon: ReactNode;
    tone: 'emerald' | 'lime' | 'teal' | 'amber';
}) {
    const toneStyles = {
        emerald: {
            icon: 'border-primary/15 bg-primary/[0.055] text-primary',
            value: 'text-primary',
        },
        lime: {
            icon: 'border-primary/15 bg-primary/[0.055] text-primary',
            value: 'text-primary',
        },
        teal: {
            icon: 'border-primary/15 bg-primary/[0.055] text-primary',
            value: 'text-primary',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/[0.055] text-amber-400',
            value: 'text-amber-400',
        },
    } as const;

    const styles = toneStyles[tone];

    return (
        <div className="flex items-center gap-3 px-4 py-3.5">
            <span
                className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border',
                    styles.icon,
                )}
            >
                {icon}
            </span>

            <div className="min-w-0 flex-1">
                <dt className="text-[10px] font-semibold text-foreground/90">
                    {label}
                </dt>
                <dd className="mt-0.5 truncate text-[9px] text-muted-foreground">
                    {description}
                </dd>
            </div>

            <span
                className={cn(
                    'shrink-0 text-lg font-semibold tabular-nums',
                    styles.value,
                )}
            >
                {formatNumber(value)}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/


function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function formatDecimal(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(Number.isFinite(value) ? value : 0);
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatCurrency(
    value: string | number | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(
        Number.isFinite(amount)
            ? amount
            : 0,
    );
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