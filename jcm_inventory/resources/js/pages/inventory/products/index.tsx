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
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { SectionCard } from '@/components/shared/section-card';
import { StatCard } from '@/components/shared/stat-card';
import { StatsGrid } from '@/components/shared/stats-grid';
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
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Barcode,
    Boxes,
    CheckCircle2,
    Package2,
    Pencil,
    Plus,
    Tags,
    Trash2,
    Warehouse,
    XCircle,
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

    const productColumns: DataTableColumn<Product>[] =
        [
            {
                key: 'product',
                header: 'Product',
                className: 'min-w-[270px]',
                cell: (product) => (
                    <EntityInfo
                        avatar={
                            <EntityAvatar
                                icon={Package2}
                                className="border-blue-500/15 bg-blue-500/10 text-blue-400 group-hover:border-blue-500/25 group-hover:bg-blue-500/15"
                            />
                        }
                        title={product.name}
                        subtitle={
                            <>
                                Unit:{' '}
                                <span className="font-semibold text-foreground/70">
                                    {product.unit}
                                </span>
                            </>
                        }
                        description={
                            product.description ??
                            undefined
                        }
                    />
                ),
            },
            {
                key: 'category',
                header: 'Category',
                className: 'min-w-[165px]',
                cell: (product) =>
                    product.category ? (
                        <Badge
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full border-blue-500/15 bg-blue-500/10 px-2.5 text-[10px] font-medium text-blue-300"
                        >
                            <span className="inline-flex size-4 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                                <Tags className="size-2.5" />
                            </span>

                            <span className="max-w-28 truncate">
                                {
                                    product.category
                                        .name
                                }
                            </span>
                        </Badge>
                    ) : (
                        <StatusBadge
                            label="Uncategorized"
                            variant="neutral"
                            showIcon={false}
                        />
                    ),
            },
            {
                key: 'identification',
                header: 'Identification',
                className: 'min-w-[180px]',
                cell: (product) => (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-12 text-muted-foreground">
                                SKU
                            </span>

                            <span className="font-mono font-medium text-foreground/80">
                                {product.sku ?? '—'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="flex w-12 items-center gap-1 text-muted-foreground">
                                <Barcode className="size-3" />
                                Code
                            </span>

                            <span className="font-mono text-foreground/70">
                                {product.barcode ??
                                    '—'}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'pricing',
                header: 'Pricing',
                className: 'min-w-[170px]',
                cell: (product) => (
                    <div className="space-y-1">
                        <p className="text-[13px] font-semibold tabular-nums text-emerald-400">
                            {formatCurrency(
                                product.selling_price,
                            )}
                        </p>

                        <p className="text-[10px] tabular-nums text-muted-foreground">
                            Cost:{' '}
                            <span className="text-foreground/70">
                                {formatCurrency(
                                    product.cost_price,
                                )}
                            </span>
                        </p>

                        {product.wholesale_price !==
                            null && (
                            <p className="text-[10px] tabular-nums text-muted-foreground">
                                Wholesale:{' '}
                                <span className="text-foreground/70">
                                    {formatCurrency(
                                        product.wholesale_price,
                                    )}
                                </span>
                            </p>
                        )}
                    </div>
                ),
            },
            {
                key: 'stock',
                header: 'Total Stock',
                className: 'min-w-[155px]',
                cell: (product) =>
                    product.stock_tracking ===
                    'tracked' ? (
                        <div className="space-y-1.5">
                            <Badge
                                variant="outline"
                                className="h-7 gap-1.5 rounded-full border-amber-500/15 bg-amber-500/10 px-2.5 text-[10px] font-medium text-amber-300"
                            >
                                <span className="inline-flex size-4 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                                    <Warehouse className="size-2.5" />
                                </span>

                                <span className="font-semibold tabular-nums">
                                    {formatQuantity(
                                        product.total_stock,
                                    )}
                                </span>

                                <span className="text-amber-300/70">
                                    {product.unit}
                                </span>
                            </Badge>

                            <p className="text-[10px] text-muted-foreground">
                                {
                                    product.warehouse_stocks_count
                                }{' '}
                                warehouse record
                                {product.warehouse_stocks_count ===
                                1
                                    ? ''
                                    : 's'}
                            </p>
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted-foreground">
                            Not stock tracked
                        </span>
                    ),
            },
            {
                key: 'tracking',
                header: 'Tracking',
                cell: (product) => (
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
                ),
            },
            {
                key: 'status',
                header: 'Status',
                cell: (product) => (
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
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                headerClassName:
                    'text-right',
                className: 'text-right',
                cell: (product) => (
                    <ActionGroup>
                        <IconButton
                            label="Edit product"
                            onClick={() =>
                                openEditDialog(
                                    product,
                                )
                            }
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
                                requestDelete(
                                    product,
                                )
                            }
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                            <Trash2 className="size-3.5" />
                        </IconButton>
                    </ActionGroup>
                ),
            },
        ];

    const deleteHasRelations = Boolean(
        deleteTarget &&
            (deleteTarget.warehouse_stocks_count >
                0 ||
                deleteTarget.stock_movements_count >
                    0),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <PageContainer>
                <PageHeader
                    eyebrow="Inventory Management"
                    title="Products"
                    description="Manage product information, pricing, categories, and stock tracking."
                    actions={
                        <Button
                            type="button"
                            onClick={
                                openCreateDialog
                            }
                            className="h-10 rounded-xl px-4 text-sm"
                        >
                            <Plus className="size-4" />
                            Add Product
                        </Button>
                    }
                />

                <StatsGrid>
                    <StatCard
                        title="Total Products"
                        value={summary.total}
                        icon={<Package2 />}
                        iconTone="blue"
                        description="All product records"
                    />

                    <StatCard
                        title="Active Products"
                        value={summary.active}
                        icon={<CheckCircle2 />}
                        iconTone="emerald"
                        description="Available for inventory"
                    />

                    <StatCard
                        title="Stock Tracked"
                        value={summary.tracked}
                        icon={<Boxes />}
                        iconTone="violet"
                        description="Quantity monitored"
                    />

                    <StatCard
                        title="Not Tracked"
                        value={summary.not_tracked}
                        icon={<XCircle />}
                        iconTone="amber"
                        description="Without stock quantity"
                    />
                </StatsGrid>

                <SectionCard>
                    <FilterBar
                        onSubmit={applyFilters}
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
                                    onClick={
                                        resetFilters
                                    }
                                    className="h-10 px-4 text-sm"
                                >
                                    Reset
                                </Button>
                            </>
                        }
                    >
                        <SearchInput
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value,
                                )
                            }
                            onClear={() =>
                                setSearch('')
                            }
                            placeholder="Search product name, SKU, or barcode..."
                            className="xl:min-w-[260px]"
                        />

                        <Select
                            value={
                                categoryId ||
                                ALL_VALUE
                            }
                            onValueChange={(
                                value,
                            ) =>
                                setCategoryId(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm xl:w-[190px]">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        ALL_VALUE
                                    }
                                >
                                    All categories
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

                        <Select
                            value={
                                stockTracking ||
                                ALL_VALUE
                            }
                            onValueChange={(
                                value,
                            ) =>
                                setStockTracking(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm xl:w-[170px]">
                                <SelectValue placeholder="All tracking" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        ALL_VALUE
                                    }
                                >
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
                            value={
                                status ||
                                ALL_VALUE
                            }
                            onValueChange={(
                                value,
                            ) =>
                                setStatus(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm xl:w-[145px]">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        ALL_VALUE
                                    }
                                >
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
                                onClick={
                                    openCreateDialog
                                }
                            >
                                <Plus className="size-4" />
                                Add Product
                            </Button>
                        }
                        minWidth="1280px"
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
                            <Barcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-blue-400" />

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