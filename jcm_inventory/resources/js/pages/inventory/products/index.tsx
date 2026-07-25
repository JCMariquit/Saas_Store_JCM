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
    ChevronRight,
    FileSpreadsheet,
    FileText,
    Layers3,
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
    useMemo,
    useState,
} from 'react';

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

type BatchIssuePolicy = 'fifo' | 'fefo' | 'manual';

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
    stock_tracking: 'tracked' | 'not_tracked';
    batch_tracking_enabled: boolean;
    batch_issue_policy: BatchIssuePolicy;
    requires_expiration_date: boolean;
    expiry_warning_days: number | null;
    is_active: boolean;
    warehouse_stocks_count: number;
    stock_movements_count: number;
    stock_batches_count: number;
    available_stock_batches_count: number;
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
    batch_enabled: number;
    expiration_required: number;
};

type ProductFilters = {
    search: string;
    status: string;
    category_id: number | null;
    stock_tracking: string;
    batch_tracking: string;
};

type ProductFormData = {
    category_id: string;
    name: string;
    sku: string;
    barcode: string;
    description: string;
    unit: string;
    cost_price: string;
    stock_tracking: 'tracked' | 'not_tracked';
    batch_tracking_enabled: boolean;
    batch_issue_policy: BatchIssuePolicy;
    requires_expiration_date: boolean;
    expiry_warning_days: string;
    is_active: boolean;
};

type ProductPageProps = {
    products: PaginatedProducts;
    categories: CategoryOption[];
    summary: ProductSummary;
    filters: ProductFilters;
};

type CatalogDrawerView =
    | 'registered'
    | 'active'
    | 'tracked'
    | 'batch_enabled';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/inventory/overview' },
    { title: 'Products', href: '/inventory/products' },
];

const emptyProductForm: ProductFormData = {
    category_id: '',
    name: '',
    sku: '',
    barcode: '',
    description: '',
    unit: 'pcs',
    cost_price: '0.00',
    stock_tracking: 'tracked',
    batch_tracking_enabled: false,
    batch_issue_policy: 'fifo',
    requires_expiration_date: false,
    expiry_warning_days: '30',
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

export default function ProductIndex({
    products,
    categories,
    summary,
    filters,
}: ProductPageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
    const [catalogDrawerView, setCatalogDrawerView] =
        useState<CatalogDrawerView | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [statusProcessingId, setStatusProcessingId] =
        useState<number | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [categoryId, setCategoryId] = useState(
        filters.category_id ? String(filters.category_id) : '',
    );
    const [stockTracking, setStockTracking] = useState(
        filters.stock_tracking ?? '',
    );
    const [batchTracking, setBatchTracking] = useState(
        filters.batch_tracking ?? '',
    );

    const form = useForm<ProductFormData>({ ...emptyProductForm });

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
        setCategoryId(
            filters.category_id ? String(filters.category_id) : '',
        );
        setStockTracking(filters.stock_tracking ?? '');
        setBatchTracking(filters.batch_tracking ?? '');
    }, [
        filters.search,
        filters.status,
        filters.category_id,
        filters.stock_tracking,
        filters.batch_tracking,
    ]);

    function resetProductForm(): void {
        form.clearErrors();
        form.setData({ ...emptyProductForm });
    }

    function resetAndCloseDialog(): void {
        setIsDialogOpen(false);
        setEditingProduct(null);
        resetProductForm();
    }

    function handleDialogOpenChange(open: boolean): void {
        if (open) {
            setIsDialogOpen(true);
            return;
        }

        if (!form.processing) {
            resetAndCloseDialog();
        }
    }

    function openCreateDialog(): void {
        setEditingProduct(null);
        resetProductForm();
        setIsDialogOpen(true);
    }

    function openEditDialog(product: Product): void {
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
            stock_tracking: product.stock_tracking,
            batch_tracking_enabled: Boolean(product.batch_tracking_enabled),
            batch_issue_policy: product.batch_issue_policy ?? 'fifo',
            requires_expiration_date: Boolean(
                product.requires_expiration_date,
            ),
            expiry_warning_days:
                product.expiry_warning_days !== null
                    ? String(product.expiry_warning_days)
                    : '',
            is_active: product.is_active,
        });
        setIsDialogOpen(true);
    }

    function submitProduct(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (editingProduct) {
            form.put(`/inventory/products/${editingProduct.id}`, {
                preserveScroll: true,
                onSuccess: resetAndCloseDialog,
            });
            return;
        }

        form.post('/inventory/products', {
            preserveScroll: true,
            onSuccess: resetAndCloseDialog,
        });
    }

    function applyFilters(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        router.get(
            '/inventory/products',
            {
                search: search.trim() || undefined,
                status: status || undefined,
                category_id: categoryId || undefined,
                stock_tracking: stockTracking || undefined,
                batch_tracking: batchTracking || undefined,
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
        setBatchTracking('');

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

    function buildProductReportUrl(
        format: 'pdf' | 'excel-preview',
    ): string {
        const params = new URLSearchParams();

        if (filters.search?.trim()) {
            params.set('search', filters.search.trim());
        }
        if (filters.status) {
            params.set('status', filters.status);
        }
        if (filters.category_id) {
            params.set('category_id', String(filters.category_id));
        }
        if (filters.stock_tracking) {
            params.set('stock_tracking', filters.stock_tracking);
        }
        if (filters.batch_tracking) {
            params.set('batch_tracking', filters.batch_tracking);
        }

        const query = params.toString();
        const path = `/reports/inventory/products/${format}`;

        return query ? `${path}?${query}` : path;
    }

    function openReport(format: 'pdf' | 'excel-preview'): void {
        if (products.total === 0) {
            return;
        }

        const reportWindow = window.open(
            buildProductReportUrl(format),
            '_blank',
            'noopener,noreferrer',
        );

        if (reportWindow) {
            reportWindow.opener = null;
        }
    }

    function toggleStatus(product: Product): void {
        if (statusProcessingId === product.id) {
            return;
        }

        router.patch(
            `/inventory/products/${product.id}/status`,
            { is_active: !product.is_active },
            {
                preserveScroll: true,
                onStart: () => setStatusProcessingId(product.id),
                onFinish: () => setStatusProcessingId(null),
            },
        );
    }

    function deleteProduct(): void {
        if (!deleteTarget || deleteProcessing) {
            return;
        }

        router.delete(`/inventory/products/${deleteTarget.id}`, {
            preserveScroll: true,
            onStart: () => setDeleteProcessing(true),
            onSuccess: () => setDeleteTarget(null),
            onFinish: () => setDeleteProcessing(false),
        });
    }

    function openCatalogDirectory(view: CatalogDrawerView): void {
        const query: Record<string, string> = {};

        if (view === 'active') {
            query.status = 'active';
        }
        if (view === 'tracked') {
            query.stock_tracking = 'tracked';
        }
        if (view === 'batch_enabled') {
            query.batch_tracking = 'enabled';
        }

        setCatalogDrawerView(null);
        router.get('/inventory/products', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    const inactiveProducts = Math.max(0, summary.total - summary.active);
    const activePercentage =
        summary.total > 0
            ? Math.round((summary.active / summary.total) * 100)
            : 0;
    const batchPercentage =
        summary.tracked > 0
            ? Math.round((summary.batch_enabled / summary.tracked) * 100)
            : 0;
    const activeCategoryCount = categories.filter(
        (category) => category.is_active,
    ).length;
    const hasActiveFilters = Boolean(
        search ||
            status ||
            categoryId ||
            stockTracking ||
            batchTracking,
    );
    const selectedFormCategory = categories.find(
        (category) => String(category.id) === form.data.category_id,
    );
    const deleteHasRelations = Boolean(
        deleteTarget &&
            (deleteTarget.warehouse_stocks_count > 0 ||
                deleteTarget.stock_movements_count > 0 ||
                deleteTarget.stock_batches_count > 0),
    );

    const formBatchMode = form.data.batch_tracking_enabled
        ? formatPolicy(form.data.batch_issue_policy)
        : 'Disabled';

    function handleStockTrackingChange(value: string): void {
        const nextValue = value as ProductFormData['stock_tracking'];
        form.setData('stock_tracking', nextValue);

        if (nextValue === 'not_tracked') {
            form.setData('batch_tracking_enabled', false);
            form.setData('requires_expiration_date', false);
            form.setData('expiry_warning_days', '');
        }
    }

    function handleBatchTrackingChange(checked: boolean): void {
        form.setData('batch_tracking_enabled', checked);

        if (!checked) {
            form.setData('requires_expiration_date', false);
            form.setData('expiry_warning_days', '');
            form.setData('batch_issue_policy', 'fifo');
            return;
        }

        if (!form.data.expiry_warning_days) {
            form.setData('expiry_warning_days', '30');
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <PageContainer className="gap-4 md:gap-5">
                <section className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.055] via-primary/[0.018] to-transparent shadow-sm">
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
                                    Product identity, stock tracking, and batch-control readiness.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className={cn(
                                'h-6 w-fit rounded-full px-2.5 text-[9px] font-semibold',
                                inactiveProducts === 0
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                    : 'border-amber-500/20 bg-amber-500/10 text-amber-300',
                            )}
                        >
                            {inactiveProducts === 0 ? (
                                <CheckCircle2 className="mr-1 size-3" />
                            ) : (
                                <XCircle className="mr-1 size-3" />
                            )}
                            {inactiveProducts === 0
                                ? 'Catalog operational'
                                : `${inactiveProducts} inactive`}
                        </Badge>
                    </div>

                    <div className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                        <div className="p-4 md:p-5">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                                Catalog readiness
                            </p>
                            <div className="mt-3 flex items-end gap-3">
                                <p className="text-[36px] font-semibold leading-none tracking-[-0.045em] text-primary">
                                    {activePercentage}%
                                </p>
                                <div className="pb-0.5">
                                    <p className="text-[12px] font-semibold text-foreground">
                                        {summary.active} of {summary.total} products active
                                    </p>
                                    <p className="mt-1 text-[9px] text-muted-foreground">
                                        Active records may be used by inventory workflows.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCatalogDrawerView('active')}
                                className="group mt-3 block w-full rounded-lg py-1.5 text-left outline-none transition hover:bg-primary/[0.025] focus-visible:ring-2 focus-visible:ring-primary/35"
                            >
                                <span className="block h-1.5 overflow-hidden rounded-full bg-background/70 ring-1 ring-border/40">
                                    <span
                                        className="block h-full rounded-full bg-emerald-400 transition-all duration-500"
                                        style={{ width: `${activePercentage}%` }}
                                    />
                                </span>
                                <span className="mt-1.5 flex items-center justify-between text-[8px] text-muted-foreground">
                                    <span>Open active product records</span>
                                    <ChevronRight className="size-3" />
                                </span>
                            </button>

                            <div className="mt-5 grid border-t border-border/60 sm:grid-cols-3 sm:divide-x sm:divide-border/60">
                                <MetricCell
                                    label="Stock tracked"
                                    value={String(summary.tracked)}
                                    helper={`${summary.not_tracked} not tracked`}
                                />
                                <MetricCell
                                    label="Batch enabled"
                                    value={`${batchPercentage}%`}
                                    helper={`${summary.batch_enabled} batch-controlled products`}
                                />
                                <MetricCell
                                    label="Active categories"
                                    value={String(activeCategoryCount)}
                                    helper={`${categories.length} total categories`}
                                />
                            </div>
                        </div>

                        <div className="border-t border-border/60 bg-background/20 xl:border-l xl:border-t-0">
                            <div className="border-b border-border/60 px-4 py-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Catalog facts
                                </p>
                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    Click any row to inspect the current product set.
                                </p>
                            </div>
                            <dl className="divide-y divide-border/60">
                                <CatalogFactRow
                                    label="Registered products"
                                    description="Complete product master records"
                                    value={summary.total}
                                    icon={<Package2 className="size-3.5" />}
                                    onClick={() =>
                                        setCatalogDrawerView('registered')
                                    }
                                />
                                <CatalogFactRow
                                    label="Stock tracked"
                                    description="Warehouse quantities maintained"
                                    value={summary.tracked}
                                    icon={<Boxes className="size-3.5" />}
                                    onClick={() =>
                                        setCatalogDrawerView('tracked')
                                    }
                                />
                                <CatalogFactRow
                                    label="Batch controlled"
                                    description="FIFO, FEFO, or manual allocation"
                                    value={summary.batch_enabled}
                                    icon={<Layers3 className="size-3.5" />}
                                    onClick={() =>
                                        setCatalogDrawerView('batch_enabled')
                                    }
                                />
                            </dl>
                        </div>
                    </div>
                </section>

                <SectionCard
                    title="Product Directory"
                    description="Select a product row to review its complete catalog and batch configuration."
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
                                variant="outline"
                                disabled={products.total === 0}
                                onClick={() => openReport('pdf')}
                                className="h-9 rounded-lg px-3 text-xs"
                            >
                                <FileText className="size-3.5" />
                                PDF
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={products.total === 0}
                                onClick={() => openReport('excel-preview')}
                                className="h-9 rounded-lg px-3 text-xs"
                            >
                                <FileSpreadsheet className="size-3.5" />
                                Excel
                            </Button>
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
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_170px_170px_150px_150px]"
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
                            onChange={(event) => setSearch(event.target.value)}
                            onClear={() => setSearch('')}
                            placeholder="Search name, SKU, barcode, description..."
                        />

                        <Select
                            value={categoryId || ALL_VALUE}
                            onValueChange={(value) =>
                                setCategoryId(
                                    value === ALL_VALUE ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All categories
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                        {!category.is_active
                                            ? ' — Inactive'
                                            : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={status || ALL_VALUE}
                            onValueChange={(value) =>
                                setStatus(value === ALL_VALUE ? '' : value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All statuses
                                </SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={stockTracking || ALL_VALUE}
                            onValueChange={(value) =>
                                setStockTracking(
                                    value === ALL_VALUE ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Stock mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All stock modes
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
                            value={batchTracking || ALL_VALUE}
                            onValueChange={(value) =>
                                setBatchTracking(
                                    value === ALL_VALUE ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Batch mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All batch modes
                                </SelectItem>
                                <SelectItem value="enabled">
                                    Batch enabled
                                </SelectItem>
                                <SelectItem value="disabled">
                                    Batch disabled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <ProductDirectoryTable
                        products={products.data}
                        onSelect={setDetailsProduct}
                        onCreate={openCreateDialog}
                    />

                    <AppPagination
                        pagination={products}
                        itemLabel="products"
                    />
                </SectionCard>
            </PageContainer>

            <CatalogProductsDrawer
                view={catalogDrawerView}
                pagination={products}
                summary={summary}
                onClose={() => setCatalogDrawerView(null)}
                onSelect={(product) => {
                    setCatalogDrawerView(null);
                    setDetailsProduct(product);
                }}
                onOpenDirectory={openCatalogDirectory}
            />

            <ProductDetailsDrawer
                product={detailsProduct}
                statusProcessingId={statusProcessingId}
                onClose={() => setDetailsProduct(null)}
                onEdit={(product) => {
                    setDetailsProduct(null);
                    openEditDialog(product);
                }}
                onToggleStatus={(product) => {
                    setDetailsProduct(null);
                    toggleStatus(product);
                }}
                onDelete={(product) => {
                    setDetailsProduct(null);
                    setDeleteTarget(product);
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
                        ? `Maintain catalog and batch settings for ${editingProduct.name}.`
                        : 'Create a product master record for inventory and batch operations.'
                }
                onSubmit={submitProduct}
                processing={form.processing}
                submitText={
                    editingProduct ? 'Save Product Record' : 'Register Product'
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
                                    Define identity, reference cost, stock behavior, and batch controls.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                label={
                                    form.data.is_active ? 'Active' : 'Inactive'
                                }
                                variant={
                                    form.data.is_active ? 'success' : 'danger'
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
                            {form.data.batch_tracking_enabled && (
                                <StatusBadge
                                    label={`Batch · ${formatPolicy(form.data.batch_issue_policy)}`}
                                    variant="success"
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="min-w-0">
                            <section className="p-5">
                                <SectionHeading
                                    eyebrow="01 · Product identity"
                                    title="Catalog information"
                                    description="Define how this product is identified and grouped throughout inventory operations."
                                />

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
                                                value={form.data.name}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Enter product name"
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
                                            description="Scan or enter the product barcode."
                                            error={form.errors.barcode}
                                        >
                                            <div className="group relative">
                                                <Barcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" />
                                                <Input
                                                    id="barcode"
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
                                            description="Standard inventory unit."
                                            error={form.errors.unit}
                                            required
                                        >
                                            <Input
                                                id="unit"
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
                                <SectionHeading
                                    eyebrow="02 · Cost reference"
                                    title="Default unit cost"
                                    description="This is a reference/default cost only. Actual stock valuation uses receiving, opening-stock, adjustment, and batch transaction costs."
                                />

                                <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
                                    <FormField
                                        id="cost_price"
                                        label="Default Unit Cost"
                                        description="Suggested cost for new stock transactions."
                                        error={form.errors.cost_price}
                                        required
                                    >
                                        <MoneyInput
                                            id="cost_price"
                                            value={form.data.cost_price}
                                            disabled={form.processing}
                                            onValueChange={(value) =>
                                                form.setData(
                                                    'cost_price',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>

                                    <div className="rounded-xl border border-primary/15 bg-primary/[0.035] px-4 py-3">
                                        <p className="text-[10px] font-semibold text-foreground">
                                            Inventory valuation rule
                                        </p>
                                        <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                            Product master cost does not overwrite batch or movement cost. Weighted average and batch costs remain the authoritative inventory values.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="border-t border-border/70 p-5">
                                <SectionHeading
                                    eyebrow="03 · Batch configuration"
                                    title="Lot and expiry controls"
                                    description="Enable batch tracking only for products that require lot-level balances, expiry monitoring, or controlled issue allocation."
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <BooleanField
                                        id="batch_tracking_enabled"
                                        checked={
                                            form.data.batch_tracking_enabled
                                        }
                                        disabled={
                                            form.processing ||
                                            form.data.stock_tracking !==
                                                'tracked'
                                        }
                                        onCheckedChange={
                                            handleBatchTrackingChange
                                        }
                                        label="Enable Batch Tracking"
                                        description="Maintain batch codes, lot numbers, expiry dates, and batch-level warehouse balances."
                                        error={
                                            form.errors
                                                .batch_tracking_enabled
                                        }
                                    />

                                    <FormField
                                        id="batch_issue_policy"
                                        label="Batch Issue Policy"
                                        description="Controls the default batch allocation order during stock-out transactions."
                                        error={form.errors.batch_issue_policy}
                                        required
                                    >
                                        <Select
                                            value={
                                                form.data.batch_issue_policy
                                            }
                                            disabled={
                                                form.processing ||
                                                !form.data
                                                    .batch_tracking_enabled
                                            }
                                            onValueChange={(value) =>
                                                form.setData(
                                                    'batch_issue_policy',
                                                    value as BatchIssuePolicy,
                                                )
                                            }
                                        >
                                            <SelectTrigger id="batch_issue_policy">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fifo">
                                                    FIFO — oldest received first
                                                </SelectItem>
                                                <SelectItem value="fefo">
                                                    FEFO — earliest expiry first
                                                </SelectItem>
                                                <SelectItem value="manual">
                                                    Manual batch selection
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormField>

                                    <BooleanField
                                        id="requires_expiration_date"
                                        checked={
                                            form.data
                                                .requires_expiration_date
                                        }
                                        disabled={
                                            form.processing ||
                                            !form.data
                                                .batch_tracking_enabled
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'requires_expiration_date',
                                                checked,
                                            )
                                        }
                                        label="Require Expiration Date"
                                        description="Future receiving and stock-in transactions must provide an expiration date for each batch."
                                        error={
                                            form.errors
                                                .requires_expiration_date
                                        }
                                    />

                                    <FormField
                                        id="expiry_warning_days"
                                        label="Expiry Warning Days"
                                        description="Number of days before expiry to flag the batch. Leave blank to use the tenant default."
                                        error={
                                            form.errors.expiry_warning_days
                                        }
                                    >
                                        <Input
                                            id="expiry_warning_days"
                                            type="number"
                                            min={1}
                                            max={3650}
                                            step={1}
                                            value={
                                                form.data.expiry_warning_days
                                            }
                                            disabled={
                                                form.processing ||
                                                !form.data
                                                    .batch_tracking_enabled
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'expiry_warning_days',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Use tenant default"
                                        />
                                    </FormField>
                                </div>
                            </section>
                        </div>

                        <aside className="border-t border-border/70 bg-muted/[0.018] p-5 lg:border-l lg:border-t-0">
                            <SectionHeading
                                eyebrow="04 · Operations"
                                title="Inventory behavior"
                                description="Control quantity tracking and whether the product may be used by inventory transactions."
                            />

                            <div className="space-y-5">
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
                                        onValueChange={
                                            handleStockTrackingChange
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

                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Record preview
                            </p>
                            <dl className="mt-3 divide-y divide-border/60 border-y border-border/60 text-[10px]">
                                <PreviewRow
                                    label="Category"
                                    value={
                                        selectedFormCategory?.name ??
                                        'Uncategorized'
                                    }
                                />
                                <PreviewRow
                                    label="Default cost"
                                    value={formatCurrency(
                                        form.data.cost_price,
                                    )}
                                />
                                <PreviewRow
                                    label="Stock mode"
                                    value={
                                        form.data.stock_tracking === 'tracked'
                                            ? 'Warehouse tracked'
                                            : 'Quantity not tracked'
                                    }
                                />
                                <PreviewRow
                                    label="Batch mode"
                                    value={formBatchMode}
                                />
                                <PreviewRow
                                    label="Expiry rule"
                                    value={
                                        form.data.batch_tracking_enabled
                                            ? form.data
                                                  .requires_expiration_date
                                                ? 'Expiration required'
                                                : 'Expiration optional'
                                            : 'Not applicable'
                                    }
                                />
                                <PreviewRow
                                    label="Availability"
                                    value={
                                        form.data.is_active
                                            ? 'Available for use'
                                            : 'Inactive record'
                                    }
                                />
                            </dl>

                            <div className="mt-5 border-l-2 border-primary/30 pl-3">
                                <p className="text-[9px] font-semibold text-foreground/80">
                                    Stock-entry note
                                </p>
                                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                    Quantities and real batch records are created later through Stock Management, Receiving, Adjustment, or Transfer—not from the Product form.
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
                        ? `"${deleteTarget?.name}" has warehouse, movement, or batch history. The system will preserve related inventory records.`
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
        <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                    <thead className="border-b border-border/70 bg-muted/35">
                        <tr className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                            <th className="px-4 py-3 font-semibold">Product</th>
                            <th className="px-4 py-3 font-semibold">Category</th>
                            <th className="px-4 py-3 font-semibold">Default Cost</th>
                            <th className="px-4 py-3 font-semibold">Stock</th>
                            <th className="px-4 py-3 font-semibold">Batch Control</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center">
                                    <span className="mx-auto flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.045] text-primary">
                                        <Package2 className="size-5" />
                                    </span>
                                    <h3 className="mt-3 text-sm font-semibold text-foreground">
                                        No products found
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Change the filters or register your first product.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={onCreate}
                                        className="mt-4 h-9 rounded-lg px-4 text-xs"
                                    >
                                        <Plus className="size-4" />
                                        Add Product
                                    </Button>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr
                                    key={product.id}
                                    role="button"
                                    tabIndex={0}
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
                                                    className="border-primary/15 bg-primary/[0.07] text-primary"
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
                                        <div className="flex items-center gap-2">
                                            <Tags className="size-3.5 shrink-0 text-primary" />
                                            <div className="min-w-0">
                                                <p className="max-w-[155px] truncate text-[11px] font-semibold text-foreground/90">
                                                    {product.category?.name ??
                                                        'Uncategorized'}
                                                </p>
                                                <p className="mt-1 max-w-[160px] truncate font-mono text-[9px] text-muted-foreground">
                                                    {product.barcode ??
                                                        'No barcode'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <p className="text-[12px] font-semibold tabular-nums text-foreground">
                                            {formatCurrency(
                                                product.cost_price,
                                            )}
                                        </p>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            Reference cost only
                                        </p>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {product.stock_tracking === 'tracked' ? (
                                            <div>
                                                <p className="text-[13px] font-semibold tabular-nums text-foreground">
                                                    {formatQuantity(
                                                        product.total_stock,
                                                    )}{' '}
                                                    <span className="text-[9px] font-medium text-muted-foreground">
                                                        {product.unit}
                                                    </span>
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    {product.warehouse_stocks_count}{' '}
                                                    warehouse ·{' '}
                                                    {product.stock_movements_count}{' '}
                                                    movement
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] font-semibold text-muted-foreground">
                                                Quantity not tracked
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {product.batch_tracking_enabled ? (
                                            <div>
                                                <p className="text-[11px] font-semibold text-primary">
                                                    {formatPolicy(
                                                        product.batch_issue_policy,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    {product.available_stock_batches_count}{' '}
                                                    available /{' '}
                                                    {product.stock_batches_count}{' '}
                                                    recorded batches
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-[10px] font-semibold text-muted-foreground">
                                                    Batch disabled
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    Product-level balance only
                                                </p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-col items-start gap-1.5">
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
                                            <StatusBadge
                                                label={
                                                    product.batch_tracking_enabled
                                                        ? 'Batch tracked'
                                                        : product.stock_tracking ===
                                                            'tracked'
                                                          ? 'Quantity tracked'
                                                          : 'Not tracked'
                                                }
                                                variant={
                                                    product.batch_tracking_enabled
                                                        ? 'success'
                                                        : product.stock_tracking ===
                                                            'tracked'
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

function CatalogProductsDrawer({
    view,
    pagination,
    summary,
    onClose,
    onSelect,
    onOpenDirectory,
}: {
    view: CatalogDrawerView | null;
    pagination: PaginatedProducts;
    summary: ProductSummary;
    onClose: () => void;
    onSelect: (product: Product) => void;
    onOpenDirectory: (view: CatalogDrawerView) => void;
}) {
    const [drawerSearch, setDrawerSearch] = useState('');

    useEffect(() => {
        setDrawerSearch('');
    }, [view]);

    const activeView = view ?? 'registered';
    const config = {
        registered: {
            title: 'Registered Products',
            description: 'Product master records loaded in the directory.',
            total: summary.total,
        },
        active: {
            title: 'Active Products',
            description: 'Products available to inventory workflows.',
            total: summary.active,
        },
        tracked: {
            title: 'Stock-Tracked Products',
            description: 'Products maintaining warehouse quantities.',
            total: summary.tracked,
        },
        batch_enabled: {
            title: 'Batch-Controlled Products',
            description: 'Products configured for FIFO, FEFO, or manual batches.',
            total: summary.batch_enabled,
        },
    }[activeView];

    const normalizedSearch = drawerSearch.trim().toLowerCase();
    const visibleProducts = useMemo(() => {
        return pagination.data.filter((product) => {
            const matchesView =
                activeView === 'registered' ||
                (activeView === 'active' && product.is_active) ||
                (activeView === 'tracked' &&
                    product.stock_tracking === 'tracked') ||
                (activeView === 'batch_enabled' &&
                    product.batch_tracking_enabled);

            if (!matchesView) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            return [
                product.name,
                product.sku ?? '',
                product.barcode ?? '',
                product.category?.name ?? '',
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedSearch);
        });
    }, [activeView, normalizedSearch, pagination.data]);

    return (
        <AppDrawer
            open={view !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title={config.title}
            description={config.description}
            processing={false}
        >
            {view && (
                <div className="flex min-h-full flex-col bg-card">
                    <section className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                                    Product catalog
                                </p>
                                <h2 className="mt-1.5 text-lg font-semibold text-foreground">
                                    {config.title}
                                </h2>
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                    Select a record to open complete details.
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="rounded-full border-primary/15 bg-primary/[0.06] text-primary"
                            >
                                {formatNumber(config.total)} total
                            </Badge>
                        </div>
                    </section>

                    <div className="border-b border-border/60 px-5 py-4">
                        <SearchInput
                            value={drawerSearch}
                            onChange={(event) =>
                                setDrawerSearch(event.target.value)
                            }
                            onClear={() => setDrawerSearch('')}
                            placeholder="Search loaded products..."
                        />
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-5">
                        {visibleProducts.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/70 px-5 py-12 text-center">
                                <Package2 className="mx-auto size-6 text-muted-foreground" />
                                <h3 className="mt-3 text-sm font-semibold text-foreground">
                                    No matching products
                                </h3>
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                    Try another product name, SKU, barcode, or category.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-border/70">
                                <div className="divide-y divide-border/60">
                                    {visibleProducts.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => onSelect(product)}
                                            className="group flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition hover:bg-primary/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                                        >
                                            <EntityAvatar
                                                icon={
                                                    product.batch_tracking_enabled
                                                        ? Layers3
                                                        : product.stock_tracking ===
                                                            'tracked'
                                                          ? Boxes
                                                          : Package2
                                                }
                                                className="border-primary/15 bg-primary/[0.065] text-primary"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-[11px] font-semibold text-foreground">
                                                        {product.name}
                                                    </p>
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
                                                </div>
                                                <p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">
                                                    {product.sku ?? 'No SKU'} ·{' '}
                                                    {product.category?.name ??
                                                        'Uncategorized'}
                                                </p>
                                                <p className="mt-1 text-[9px] text-muted-foreground">
                                                    {product.batch_tracking_enabled
                                                        ? `${formatPolicy(product.batch_issue_policy)} · ${product.available_stock_batches_count} available batches`
                                                        : product.stock_tracking ===
                                                            'tracked'
                                                          ? `${formatQuantity(product.total_stock)} ${product.unit}`
                                                          : 'Quantity not tracked'}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[10px] font-semibold text-foreground">
                                                    {formatCurrency(
                                                        product.cost_price,
                                                    )}
                                                </p>
                                                <ChevronRight className="ml-auto mt-1 size-3.5 text-muted-foreground" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <footer className="flex items-center justify-between gap-3 border-t border-border/60 bg-background/35 px-5 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-9 rounded-lg text-xs"
                        >
                            Close
                        </Button>
                        <Button
                            type="button"
                            onClick={() => onOpenDirectory(activeView)}
                            className="h-9 rounded-lg text-xs"
                        >
                            Open Filtered Directory
                        </Button>
                    </footer>
                </div>
            )}
        </AppDrawer>
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

    return (
        <AppDrawer
            open={product !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title="Product Record"
            description="Review product identity, cost reference, inventory behavior, and batch configuration."
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
                                        <StatusBadge
                                            label={
                                                product.batch_tracking_enabled
                                                    ? 'Batch tracked'
                                                    : tracked
                                                      ? 'Quantity tracked'
                                                      : 'Not tracked'
                                            }
                                            variant={
                                                product.batch_tracking_enabled
                                                    ? 'success'
                                                    : tracked
                                                      ? 'info'
                                                      : 'neutral'
                                            }
                                        />
                                    </div>
                                    <h2 className="mt-2 break-words text-xl font-semibold tracking-[-0.025em] text-foreground">
                                        {product.name}
                                    </h2>
                                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                                        {product.sku ?? 'No SKU'} ·{' '}
                                        {product.barcode ?? 'No barcode'}
                                    </p>
                                    {product.description && (
                                        <p className="mt-3 max-w-2xl text-[10px] leading-5 text-muted-foreground">
                                            {product.description}
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-xl border border-primary/15 bg-primary/[0.045] px-4 py-3 text-right">
                                    <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        Default unit cost
                                    </p>
                                    <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
                                        {formatCurrency(product.cost_price)}
                                    </p>
                                    <p className="mt-1 text-[8px] text-muted-foreground">
                                        Reference only
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid border-y border-border/60 sm:grid-cols-4 sm:divide-x sm:divide-border/60">
                                <SummaryCell
                                    label="Total stock"
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
                                />
                                <SummaryCell
                                    label="Available batches"
                                    value={
                                        product.batch_tracking_enabled
                                            ? formatNumber(
                                                  product.available_stock_batches_count,
                                              )
                                            : '—'
                                    }
                                    helper={
                                        product.batch_tracking_enabled
                                            ? `${product.stock_batches_count} total batch records`
                                            : 'Batch tracking disabled'
                                    }
                                />
                                <SummaryCell
                                    label="Issue policy"
                                    value={
                                        product.batch_tracking_enabled
                                            ? formatPolicy(
                                                  product.batch_issue_policy,
                                              )
                                            : 'Not applicable'
                                    }
                                    helper="Stock-out allocation rule"
                                />
                                <SummaryCell
                                    label="Movements"
                                    value={formatNumber(
                                        product.stock_movements_count,
                                    )}
                                    helper="Inventory activity links"
                                />
                            </div>
                        </section>

                        <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                            <div className="min-w-0 divide-y divide-border/60 lg:border-r lg:border-border/60">
                                <DocumentSection
                                    title="Product Information"
                                    description="Core identity and catalog placement."
                                >
                                    <DetailRow
                                        label="Product ID"
                                        value={`#${product.id}`}
                                        mono
                                    />
                                    <DetailRow
                                        label="Product name"
                                        value={product.name}
                                    />
                                    <DetailRow
                                        label="Slug"
                                        value={product.slug}
                                        mono
                                    />
                                    <DetailRow
                                        label="SKU"
                                        value={product.sku ?? 'Not assigned'}
                                        mono
                                    />
                                    <DetailRow
                                        label="Barcode"
                                        value={
                                            product.barcode ?? 'Not assigned'
                                        }
                                        mono
                                    />
                                    <DetailRow
                                        label="Unit"
                                        value={product.unit}
                                    />
                                    <DetailRow
                                        label="Category"
                                        value={
                                            product.category?.name ??
                                            'Uncategorized'
                                        }
                                    />
                                </DocumentSection>

                                <DocumentSection
                                    title="Cost Reference"
                                    description="Default suggestion only; transaction and batch costs remain authoritative."
                                >
                                    <DetailRow
                                        label="Default unit cost"
                                        value={formatCurrency(
                                            product.cost_price,
                                        )}
                                        valueClassName="text-primary"
                                    />
                                    <DetailRow
                                        label="Valuation source"
                                        value="Warehouse average and batch movement costs"
                                    />
                                </DocumentSection>
                            </div>

                            <aside className="min-w-0 divide-y divide-border/60 bg-muted/[0.018]">
                                <DocumentSection
                                    title="Inventory and Batch Control"
                                    description="Quantity, lot, allocation, and expiry rules."
                                >
                                    <DetailRow
                                        label="Stock tracking"
                                        value={
                                            tracked
                                                ? 'Tracked inventory'
                                                : 'Not tracked'
                                        }
                                    />
                                    <DetailRow
                                        label="Batch tracking"
                                        value={
                                            product.batch_tracking_enabled
                                                ? 'Enabled'
                                                : 'Disabled'
                                        }
                                        valueClassName={
                                            product.batch_tracking_enabled
                                                ? 'text-emerald-400'
                                                : undefined
                                        }
                                    />
                                    <DetailRow
                                        label="Issue policy"
                                        value={
                                            product.batch_tracking_enabled
                                                ? formatPolicy(
                                                      product.batch_issue_policy,
                                                  )
                                                : 'Not applicable'
                                        }
                                    />
                                    <DetailRow
                                        label="Expiration date"
                                        value={
                                            product.batch_tracking_enabled
                                                ? product.requires_expiration_date
                                                    ? 'Required per batch'
                                                    : 'Optional per batch'
                                                : 'Not applicable'
                                        }
                                    />
                                    <DetailRow
                                        label="Expiry warning"
                                        value={
                                            product.batch_tracking_enabled
                                                ? product.expiry_warning_days
                                                    ? `${product.expiry_warning_days} days before expiry`
                                                    : 'Tenant default'
                                                : 'Not applicable'
                                        }
                                    />
                                    <DetailRow
                                        label="Recorded batches"
                                        value={formatNumber(
                                            product.stock_batches_count,
                                        )}
                                    />
                                    <DetailRow
                                        label="Available batches"
                                        value={formatNumber(
                                            product.available_stock_batches_count,
                                        )}
                                    />
                                </DocumentSection>

                                <DocumentSection
                                    title="Record Audit"
                                    description="System status and timestamps."
                                >
                                    <DetailRow
                                        label="Product status"
                                        value={
                                            product.is_active
                                                ? 'Active'
                                                : 'Inactive'
                                        }
                                        valueClassName={
                                            product.is_active
                                                ? 'text-emerald-400'
                                                : 'text-rose-400'
                                        }
                                    />
                                    <DetailRow
                                        label="Tenant ID"
                                        value={`#${product.tenant_id}`}
                                        mono
                                    />
                                    <DetailRow
                                        label="Created"
                                        value={formatDateTime(
                                            product.created_at,
                                        )}
                                    />
                                    <DetailRow
                                        label="Updated"
                                        value={formatDateTime(
                                            product.updated_at,
                                        )}
                                    />
                                </DocumentSection>
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
                                disabled={
                                    statusProcessingId === product.id
                                }
                                onClick={() => onToggleStatus(product)}
                                className={cn(
                                    'h-9 rounded-lg text-xs',
                                    product.is_active
                                        ? 'border-amber-500/20 text-amber-400'
                                        : 'border-emerald-500/20 text-emerald-400',
                                )}
                            >
                                {product.is_active
                                    ? 'Deactivate'
                                    : 'Activate'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onDelete(product)}
                                className="h-9 rounded-lg border-rose-500/20 text-xs text-rose-400"
                            >
                                <Trash2 className="size-3.5" />
                                Delete
                            </Button>
                            <Button
                                type="button"
                                onClick={() => onEdit(product)}
                                className="h-9 rounded-lg px-4 text-xs"
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

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                {eyebrow}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-foreground">
                {title}
            </h3>
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function MetricCell({
    label,
    value,
    helper,
}: {
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="py-3 sm:px-4 first:pl-0 last:pr-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-1.5 text-sm font-semibold tabular-nums text-primary">
                {value}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="max-w-[170px] text-right font-medium text-foreground/85">
                {value}
            </dd>
        </div>
    );
}

function SummaryCell({
    label,
    value,
    helper,
}: {
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="min-w-0 px-0 py-3 sm:px-3.5">
            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-1.5 truncate text-[11px] font-semibold tabular-nums text-foreground">
                {value}
            </p>
            <p className="mt-1 truncate text-[8px] text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}

function DocumentSection({
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

function DetailRow({
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
    onClick,
}: {
    label: string;
    description: string;
    value: number;
    icon: ReactNode;
    onClick: () => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            }}
            className="group flex cursor-pointer items-center gap-3 px-4 py-3.5 outline-none transition hover:bg-primary/[0.035] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
        >
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.055] text-primary">
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
            <div className="flex shrink-0 items-center gap-2">
                <span className="text-lg font-semibold tabular-nums text-primary">
                    {formatNumber(value)}
                </span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
            </div>
        </div>
    );
}

function formatPolicy(policy: BatchIssuePolicy): string {
    if (policy === 'fefo') {
        return 'FEFO';
    }
    if (policy === 'manual') {
        return 'Manual';
    }
    return 'FIFO';
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
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

function formatCurrency(value: string | number | null): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
}

function formatQuantity(value: string | number | null): string {
    const quantity = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(Number.isFinite(quantity) ? quantity : 0);
}