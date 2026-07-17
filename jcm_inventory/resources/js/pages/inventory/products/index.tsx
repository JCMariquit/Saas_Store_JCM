import { ActionGroup } from '@/components/shared/action-group';
import { AppPagination } from '@/components/shared/app-pagination';
import { BooleanField } from '@/components/shared/boolean-field';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
    DataTable,
    type DataTableColumn,
} from '@/components/shared/data-table';
import { EntityAvatar } from '@/components/shared/entity-avatar';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { FormDialog } from '@/components/shared/form-dialog';
import { FormField } from '@/components/shared/form-field';
import { IconButton } from '@/components/shared/icon-button';
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
    Activity,
    Barcode,
    Boxes,
    CheckCircle2,
    Package2,
    Pencil,
    Plus,
    RefreshCw,
    Tags,
    Trash2,
    Warehouse,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import {
    type FormEvent,
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

type ProductMetricTone =
    | 'emerald'
    | 'teal'
    | 'lime'
    | 'amber';

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
    | Table
    |--------------------------------------------------------------------------
    */

    const productColumns: DataTableColumn<Product>[] = [
        {
            key: 'product',
            header: 'Product',
            className: 'min-w-[285px]',
            cell: (product) => (
                <EntityInfo
                    avatar={
                        <EntityAvatar
                            icon={Package2}
                            className="border-emerald-500/15 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/25 group-hover:bg-emerald-500/15"
                        />
                    }
                    title={product.name}
                    badges={
                        product.stock_tracking === 'tracked' ? (
                            <Badge
                                variant="outline"
                                className="h-5 gap-1 rounded-full border-teal-500/15 bg-teal-500/[0.06] px-2 text-[9px] font-semibold text-teal-300"
                            >
                                <Boxes className="size-2.5" />
                                TRACKED
                            </Badge>
                        ) : undefined
                    }
                    subtitle={
                        <>
                            Unit:{' '}
                            <span className="font-mono font-semibold text-foreground/75">
                                {product.unit}
                            </span>
                        </>
                    }
                    description={
                        product.description ??
                        'No product description provided'
                    }
                />
            ),
        },
        {
            key: 'catalog',
            header: 'Catalog Placement',
            className: 'min-w-[190px]',
            cell: (product) =>
                product.category ? (
                    <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/15 bg-teal-500/10 text-teal-400">
                            <Tags className="size-4" />
                        </span>

                        <div className="min-w-0">
                            <p className="max-w-[145px] truncate text-[12px] font-semibold text-foreground/85">
                                {product.category.name}
                            </p>

                            <p className="mt-1 max-w-[145px] truncate font-mono text-[9px] text-teal-400/80">
                                {product.category.slug}
                            </p>

                            <p
                                className={cn(
                                    'mt-1.5 text-[9px] font-medium',
                                    product.category.is_active
                                        ? 'text-emerald-400'
                                        : 'text-amber-400',
                                )}
                            >
                                {product.category.is_active
                                    ? 'Available category'
                                    : 'Inactive category'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-500/15 bg-slate-500/[0.06] text-slate-400">
                            <Tags className="size-4" />
                        </span>

                        <div>
                            <p className="text-[11px] font-semibold text-slate-300">
                                Uncategorized
                            </p>
                            <p className="mt-1 text-[9px] text-muted-foreground">
                                No catalog group assigned
                            </p>
                        </div>
                    </div>
                ),
        },
        {
            key: 'identification',
            header: 'Identification',
            className: 'min-w-[210px]',
            cell: (product) => (
                <div className="space-y-2">
                    <ProductIdentifier
                        label="SKU"
                        value={product.sku}
                        icon={Package2}
                        tone="emerald"
                    />

                    <ProductIdentifier
                        label="Barcode"
                        value={product.barcode}
                        icon={Barcode}
                        tone="lime"
                    />
                </div>
            ),
        },
        {
            key: 'pricing',
            header: 'Commercial Profile',
            className: 'min-w-[190px]',
            cell: (product) => (
                <div className="space-y-2">
                    <div>
                        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Selling price
                        </p>
                        <p className="mt-1 text-[14px] font-semibold tabular-nums text-emerald-400">
                            {formatCurrency(
                                product.selling_price,
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border/60 bg-background/35 px-2.5 py-2">
                            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                                Cost
                            </p>
                            <p className="mt-1 truncate text-[10px] font-semibold tabular-nums text-foreground/80">
                                {formatCurrency(
                                    product.cost_price,
                                )}
                            </p>
                        </div>

                        <div className="rounded-lg border border-border/60 bg-background/35 px-2.5 py-2">
                            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                                Wholesale
                            </p>
                            <p className="mt-1 truncate text-[10px] font-semibold tabular-nums text-foreground/80">
                                {product.wholesale_price !==
                                null
                                    ? formatCurrency(
                                          product.wholesale_price,
                                      )
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'inventory',
            header: 'Inventory Position',
            className: 'min-w-[190px]',
            cell: (product) =>
                product.stock_tracking === 'tracked' ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/15 bg-amber-500/10 text-amber-400">
                                <Warehouse className="size-4" />
                            </span>

                            <div>
                                <p className="text-[14px] font-semibold tabular-nums text-amber-400">
                                    {formatQuantity(
                                        product.total_stock,
                                    )}{' '}
                                    <span className="text-[9px] font-medium text-amber-300/70">
                                        {product.unit}
                                    </span>
                                </p>
                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    Total available stock
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="h-6 rounded-full border-emerald-500/15 bg-emerald-500/[0.055] px-2.5 text-[9px] font-medium text-emerald-300"
                        >
                            <Warehouse className="mr-1 size-3" />
                            {product.warehouse_stocks_count}{' '}
                            warehouse record
                            {product.warehouse_stocks_count === 1
                                ? ''
                                : 's'}
                        </Badge>
                    </div>
                ) : (
                    <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <Boxes className="size-3.5 text-amber-400" />
                            <p className="text-[10px] font-semibold text-amber-300">
                                Quantity not tracked
                            </p>
                        </div>
                        <p className="mt-1.5 text-[9px] leading-4 text-muted-foreground">
                            Product is excluded from warehouse balances.
                        </p>
                    </div>
                ),
        },
        {
            key: 'configuration',
            header: 'Configuration',
            className: 'min-w-[145px]',
            cell: (product) => (
                <div className="space-y-2">
                    <StatusBadge
                        label={
                            product.stock_tracking ===
                            'tracked'
                                ? 'Tracked'
                                : 'Not tracked'
                        }
                        variant={
                            product.stock_tracking ===
                            'tracked'
                                ? 'info'
                                : 'neutral'
                        }
                        icon={Boxes}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={
                            statusProcessingId ===
                            product.id
                        }
                        onClick={() =>
                            toggleStatus(product)
                        }
                        className="h-auto rounded-full p-0 disabled:opacity-60"
                    >
                        <StatusBadge
                            label={
                                product.is_active
                                    ? 'Active'
                                    : 'Inactive'
                            }
                            variant={
                                product.is_active
                                    ? 'success'
                                    : 'danger'
                            }
                        />
                    </Button>
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (product) => (
                <ActionGroup>
                    <IconButton
                        label="Edit product"
                        onClick={() =>
                            openEditDialog(product)
                        }
                        className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                        <Pencil className="size-3.5" />
                    </IconButton>

                    <IconButton
                        label={
                            product.warehouse_stocks_count >
                                0 ||
                            product.stock_movements_count >
                                0
                                ? 'Product has stock history'
                                : 'Delete product'
                        }
                        onClick={() =>
                            requestDelete(product)
                        }
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <Trash2 className="size-3.5" />
                    </IconButton>
                </ActionGroup>
            ),
        },
    ];

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

    const notTrackedPercentage =
        summary.total > 0
            ? Math.max(0, 100 - trackedPercentage)
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

                <section className="min-w-0 overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.075] via-card/70 to-card/40">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                <Package2 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-foreground">
                                    Product Catalog Control Board
                                </p>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Catalog availability, stock-tracking coverage, and product configuration readiness.
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

                    <div className="grid min-w-0 xl:grid-cols-[minmax(340px,1.15fr)_minmax(0,1.85fr)]">
                        <div className="relative overflow-hidden border-b border-border/60 p-4 xl:border-b-0 xl:border-r md:p-5">
                            <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-emerald-500/10 blur-3xl" />
                            <Package2 className="pointer-events-none absolute -bottom-8 -right-5 size-32 text-emerald-400 opacity-[0.022]" />

                            <div className="relative">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-emerald-300">
                                            Active Catalog Coverage
                                        </p>

                                        <div className="mt-2 flex items-center gap-2.5">
                                            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                                <CheckCircle2 className="size-4.5" />
                                            </span>

                                            <div>
                                                <p className="text-[27px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                                                    {summary.active}
                                                    <span className="mx-1.5 text-base font-medium text-muted-foreground">
                                                        /
                                                    </span>
                                                    {summary.total}
                                                </p>

                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    Products available for inventory operations
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-xl font-semibold tabular-nums text-emerald-400">
                                            {activePercentage}%
                                        </p>
                                        <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                                            Active
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/60">
                                    <div
                                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                                        style={{
                                            width: `${activePercentage}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-4 rounded-xl border border-border/60 bg-background/35 px-3 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                                                <Activity className="size-4" />
                                            </span>

                                            <div>
                                                <p className="text-[10px] font-semibold text-foreground/85">
                                                    Stock-tracking coverage
                                                </p>
                                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                    Quantity monitoring across the catalog
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-sm font-semibold tabular-nums text-teal-400">
                                            {trackedPercentage}%
                                        </span>
                                    </div>

                                    <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-teal-400 transition-all duration-500"
                                            style={{
                                                width: `${trackedPercentage}%`,
                                            }}
                                        />
                                        <div
                                            className="h-full bg-amber-400 transition-all duration-500"
                                            style={{
                                                width: `${notTrackedPercentage}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px]">
                                        <span className="inline-flex items-center gap-1.5 text-teal-400">
                                            <span className="size-1.5 rounded-full bg-teal-400" />
                                            {summary.tracked} tracked
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-amber-400">
                                            <span className="size-1.5 rounded-full bg-amber-400" />
                                            {summary.not_tracked} not tracked
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 sm:grid-cols-2">
                            <ProductSnapshot
                                title="Total Products"
                                value={summary.total}
                                description="Registered catalog items"
                                icon={Package2}
                                tone="teal"
                                className="border-b border-r border-border/60"
                            />

                            <ProductSnapshot
                                title="Category Options"
                                value={categories.length}
                                description={`${activeCategoryCount} active group${activeCategoryCount === 1 ? '' : 's'}`}
                                icon={Tags}
                                tone="lime"
                                className="border-b border-border/60"
                            />

                            <ProductSnapshot
                                title="Stock Tracked"
                                value={summary.tracked}
                                description="Warehouse quantity monitored"
                                icon={Boxes}
                                tone="emerald"
                                className="border-r border-border/60"
                            />

                            <ProductSnapshot
                                title="Not Tracked"
                                value={summary.not_tracked}
                                description="Excluded from stock balances"
                                icon={XCircle}
                                tone="amber"
                            />
                        </div>
                    </div>
                </section>

                {/* Product directory */}

                <SectionCard
                    title="Product Directory"
                    description="Browse product identity, catalog placement, pricing, stock position, and operational configuration."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 text-[10px] font-medium text-emerald-300"
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

                    <DataTable
                        data={products.data}
                        columns={productColumns}
                        getRowKey={(product) =>
                            product.id
                        }
                        emptyIcon={Package2}
                        emptyTitle="No products found"
                        emptyDescription="Try changing your filters or add your first inventory product."
                        emptyAction={
                            <Button
                                type="button"
                                onClick={openCreateDialog}
                            >
                                <Plus className="size-4" />
                                Add Product
                            </Button>
                        }
                        minWidth="1320px"
                    />

                    <AppPagination
                        pagination={products}
                        itemLabel="products"
                    />
                </SectionCard>
            </PageContainer>

            <FormDialog
                open={isDialogOpen}
                onOpenChange={
                    handleDialogOpenChange
                }
                title={
                    editingProduct
                        ? 'Edit Product'
                        : 'Add Product'
                }
                description={
                    editingProduct
                        ? `Update the information for ${editingProduct.name}.`
                        : 'Enter the product information below.'
                }
                onSubmit={submitProduct}
                processing={form.processing}
                submitText={
                    editingProduct
                        ? 'Save Changes'
                        : 'Create Product'
                }
                processingText={
                    editingProduct
                        ? 'Saving Changes...'
                        : 'Creating Product...'
                }
                maxWidth="max-w-4xl"
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                        id="name"
                        label="Product Name"
                        error={
                            form.errors.name
                        }
                        required
                    >
                        <Input
                            id="name"
                            type="text"
                            value={form.data.name}
                            disabled={
                                form.processing
                            }
                            onChange={(event) =>
                                form.setData(
                                    'name',
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Product name"
                            autoComplete="off"
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        id="category_id"
                        label="Category"
                        error={
                            form.errors
                                .category_id
                        }
                    >
                        <Select
                            value={
                                form.data
                                    .category_id ||
                                NO_CATEGORY_VALUE
                            }
                            disabled={
                                form.processing
                            }
                            onValueChange={(
                                value,
                            ) =>
                                form.setData(
                                    'category_id',
                                    value ===
                                        NO_CATEGORY_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger id="category_id">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        NO_CATEGORY_VALUE
                                    }
                                >
                                    No category
                                </SelectItem>

                                {categories.map(
                                    (category) => (
                                        <SelectItem
                                            key={
                                                category.id
                                            }
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
                    </FormField>

                    <FormField
                        id="sku"
                        label="SKU"
                        description="Optional internal stock code."
                        error={
                            form.errors.sku
                        }
                    >
                        <Input
                            id="sku"
                            type="text"
                            value={form.data.sku}
                            disabled={
                                form.processing
                            }
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

                    <FormField
                        id="barcode"
                        label="Barcode"
                        description="Scan or manually enter the barcode."
                        error={
                            form.errors.barcode
                        }
                    >
                        <div className="group relative">
                            <Barcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-400" />

                            <Input
                                id="barcode"
                                type="text"
                                value={
                                    form.data.barcode
                                }
                                disabled={
                                    form.processing
                                }
                                onChange={(
                                    event,
                                ) =>
                                    form.setData(
                                        'barcode',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Scan or enter barcode"
                                className="pl-9 font-mono"
                                autoComplete="off"
                            />
                        </div>
                    </FormField>

                    <FormField
                        id="unit"
                        label="Unit"
                        error={
                            form.errors.unit
                        }
                        required
                    >
                        <Input
                            id="unit"
                            type="text"
                            list="product-units"
                            value={form.data.unit}
                            disabled={
                                form.processing
                            }
                            onChange={(event) =>
                                form.setData(
                                    'unit',
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="pcs"
                            autoComplete="off"
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
                        id="stock_tracking"
                        label="Stock Tracking"
                        description="Tracked products maintain warehouse quantities."
                        error={
                            form.errors
                                .stock_tracking
                        }
                        required
                    >
                        <Select
                            value={
                                form.data
                                    .stock_tracking
                            }
                            disabled={
                                form.processing
                            }
                            onValueChange={(
                                value,
                            ) =>
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
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/[0.025] p-4">
                    <div className="mb-4">
                        <p className="text-sm font-semibold">
                            Product Pricing
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Enter the cost and selling
                            prices for this product.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        <FormField
                            id="cost_price"
                            label="Cost Price"
                            error={
                                form.errors
                                    .cost_price
                            }
                            required
                        >
                            <MoneyInput
                                id="cost_price"
                                value={
                                    form.data
                                        .cost_price
                                }
                                disabled={
                                    form.processing
                                }
                                onValueChange={(
                                    value,
                                ) =>
                                    form.setData(
                                        'cost_price',
                                        value,
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            id="selling_price"
                            label="Selling Price"
                            error={
                                form.errors
                                    .selling_price
                            }
                            required
                        >
                            <MoneyInput
                                id="selling_price"
                                value={
                                    form.data
                                        .selling_price
                                }
                                disabled={
                                    form.processing
                                }
                                onValueChange={(
                                    value,
                                ) =>
                                    form.setData(
                                        'selling_price',
                                        value,
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            id="wholesale_price"
                            label="Wholesale Price"
                            description="Optional"
                            error={
                                form.errors
                                    .wholesale_price
                            }
                        >
                            <MoneyInput
                                id="wholesale_price"
                                value={
                                    form.data
                                        .wholesale_price
                                }
                                disabled={
                                    form.processing
                                }
                                onValueChange={(
                                    value,
                                ) =>
                                    form.setData(
                                        'wholesale_price',
                                        value,
                                    )
                                }
                                placeholder="Optional"
                            />
                        </FormField>
                    </div>
                </div>

                <FormField
                    id="description"
                    label="Description"
                    description="Optional internal product description."
                    error={
                        form.errors.description
                    }
                >
                    <Textarea
                        id="description"
                        rows={4}
                        value={
                            form.data.description
                        }
                        disabled={form.processing}
                        onChange={(event) =>
                            form.setData(
                                'description',
                                event.target.value,
                            )
                        }
                        placeholder="Optional product description"
                        className="resize-none"
                    />
                </FormField>

                <BooleanField
                    id="is_active"
                    checked={
                        form.data.is_active
                    }
                    disabled={form.processing}
                    onCheckedChange={(
                        checked,
                    ) =>
                        form.setData(
                            'is_active',
                            checked,
                        )
                    }
                    label="Active Product"
                    description="Active products can be used in inventory transactions."
                    error={
                        form.errors.is_active
                    }
                />
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
| Local presentation helpers
|--------------------------------------------------------------------------
*/

function ProductSnapshot({
    title,
    value,
    description,
    icon: Icon,
    tone,
    className,
}: {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: ProductMetricTone;
    className?: string;
}) {
    const toneStyles: Record<
        ProductMetricTone,
        {
            icon: string;
            value: string;
            glow: string;
        }
    > = {
        emerald: {
            icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            glow: 'bg-emerald-500/10',
        },
        lime: {
            icon: 'border-lime-500/20 bg-lime-500/10 text-lime-400',
            value: 'text-lime-400',
            glow: 'bg-lime-500/10',
        },
        teal: {
            icon: 'border-teal-500/20 bg-teal-500/10 text-teal-400',
            value: 'text-teal-400',
            glow: 'bg-teal-500/10',
        },
        amber: {
            icon: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            glow: 'bg-amber-500/10',
        },
    };

    const styles = toneStyles[tone];

    return (
        <div
            className={cn(
                'group relative min-w-0 overflow-hidden p-4 transition-colors hover:bg-muted/[0.025]',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute -bottom-12 -right-12 size-28 rounded-full blur-3xl',
                    styles.glow,
                )}
            />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                        {title}
                    </p>

                    <p
                        className={cn(
                            'mt-2 text-xl font-semibold leading-none tabular-nums',
                            styles.value,
                        )}
                    >
                        {value}
                    </p>

                    <p className="mt-2 truncate text-[9px] text-muted-foreground">
                        {description}
                    </p>
                </div>

                <span
                    className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border',
                        styles.icon,
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>
        </div>
    );
}

function ProductIdentifier({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string | null;
    icon: LucideIcon;
    tone: 'emerald' | 'lime';
}) {
    const style =
        tone === 'emerald'
            ? 'border-emerald-500/15 bg-emerald-500/[0.045] text-emerald-400'
            : 'border-lime-500/15 bg-lime-500/[0.045] text-lime-400';

    return (
        <div
            className={cn(
                'flex min-w-0 items-center gap-2.5 rounded-lg border px-2.5 py-2',
                style,
            )}
        >
            <Icon className="size-3.5 shrink-0" />

            <div className="min-w-0">
                <p className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="mt-0.5 truncate font-mono text-[10px] font-semibold text-foreground/80">
                    {value ?? 'Not assigned'}
                </p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Formatting
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