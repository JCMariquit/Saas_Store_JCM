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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    CreditCard,
    FileSpreadsheet,
    FileText,
    Layers3,
    LockKeyhole,
    Package2,
    Pencil,
    Plus,
    Tags,
    Trash2,
    XCircle,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

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
    stock_tracking: 'tracked' | 'not_tracked';
    batch_tracking_enabled: boolean;
    batch_issue_policy: 'fifo' | 'fefo' | 'manual';
    requires_expiration_date: boolean;
    expiry_warning_days: number | null;
    is_active: boolean;
    warehouse_stocks_count: number;
    stock_movements_count: number;
    total_stock: string | number | null;
    stock_batches_count: number;
    available_stock_batches_count: number;
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
    batch_issue_policy: 'fifo' | 'fefo' | 'manual';
    requires_expiration_date: boolean;
    expiry_warning_days: string;
    is_active: boolean;
};

type ProductCapabilities = {
    access_mode: 'full' | 'read_only' | 'blocked';
    is_read_only: boolean;
    can_write: boolean;
    can_export: boolean;
    message: string | null;
};

type ProductPageProps = {
    products: PaginatedProducts;
    categories: CategoryOption[];
    summary: ProductSummary;
    filters: ProductFilters;
    capabilities: ProductCapabilities;
};

type ProductCatalogDrawerView = 'all' | 'active' | 'inactive' | 'tracked' | 'not_tracked' | 'batch' | 'expiry' | 'categories';

type SubscriptionPrompt = {
    title: string;
    description: string;
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
    stock_tracking: 'tracked',
    batch_tracking_enabled: false,
    batch_issue_policy: 'fifo',
    requires_expiration_date: false,
    expiry_warning_days: '30',
    is_active: true,
};

const commonUnits = ['pcs', 'box', 'pack', 'bottle', 'can', 'sachet', 'bag', 'kg', 'gram', 'liter', 'ml', 'meter', 'set', 'pair'];

const ALL_VALUE = 'all';
const NO_CATEGORY_VALUE = 'none';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ProductIndex({ products, categories, summary, filters, capabilities }: ProductPageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);

    const [catalogDrawerView, setCatalogDrawerView] = useState<ProductCatalogDrawerView | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const [subscriptionPrompt, setSubscriptionPrompt] = useState<SubscriptionPrompt | null>(null);

    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const [statusProcessingId, setStatusProcessingId] = useState<number | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');

    const [status, setStatus] = useState(filters.status ?? '');

    const [categoryId, setCategoryId] = useState(filters.category_id ? String(filters.category_id) : '');

    const [stockTracking, setStockTracking] = useState(filters.stock_tracking ?? '');

    const [batchTracking, setBatchTracking] = useState(filters.batch_tracking ?? '');

    const form = useForm<ProductFormData>({
        ...emptyProductForm,
    });

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');

        setCategoryId(filters.category_id ? String(filters.category_id) : '');

        setStockTracking(filters.stock_tracking ?? '');
        setBatchTracking(filters.batch_tracking ?? '');
    }, [filters.search, filters.status, filters.category_id, filters.stock_tracking, filters.batch_tracking]);

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (
            normalizedSearch === (filters.search ?? '').trim() &&
            status === (filters.status ?? '') &&
            categoryId === (filters.category_id ? String(filters.category_id) : '') &&
            stockTracking === (filters.stock_tracking ?? '') &&
            batchTracking === (filters.batch_tracking ?? '')
        ) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            router.get(
                '/inventory/products',
                {
                    search: normalizedSearch || undefined,
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
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [
        search,
        status,
        categoryId,
        stockTracking,
        batchTracking,
        filters.search,
        filters.status,
        filters.category_id,
        filters.stock_tracking,
        filters.batch_tracking,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Dialog
    |--------------------------------------------------------------------------
    */

    function requestSubscriptionRenewal(action: string): void {
        setSubscriptionPrompt({
            title: 'Subscription renewal required',
            description:
                `Your JCM Inventory subscription is currently read-only. ` +
                `Renew the owner plan to ${action}. Existing product records ` +
                `will remain available while the subscription is expired.`,
        });
    }

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

    function handleDialogOpenChange(open: boolean): void {
        if (open) {
            setIsDialogOpen(true);
            return;
        }

        requestCloseDialog();
    }

    function openCreateDialog(): void {
        if (!capabilities.can_write) {
            requestSubscriptionRenewal('add new product records');
            return;
        }

        setEditingProduct(null);
        resetProductForm();
        setIsDialogOpen(true);
    }

    function openDetailsDrawer(product: Product): void {
        setDetailsProduct(product);
    }

    function closeDetailsDrawer(): void {
        setDetailsProduct(null);
    }

    function openCatalogDrawer(view: ProductCatalogDrawerView): void {
        setCatalogDrawerView(view);
    }

    function closeCatalogDrawer(): void {
        setCatalogDrawerView(null);
    }

    function openEditDialog(product: Product): void {
        if (!capabilities.can_write) {
            requestSubscriptionRenewal(`edit "${product.name}"`);
            return;
        }

        setEditingProduct(product);
        form.clearErrors();

        form.setData({
            category_id: product.category_id ? String(product.category_id) : '',
            name: product.name,
            sku: product.sku ?? '',
            barcode: product.barcode ?? '',
            description: product.description ?? '',
            unit: product.unit,
            cost_price: String(product.cost_price ?? '0.00'),
            stock_tracking: product.stock_tracking,
            batch_tracking_enabled: product.batch_tracking_enabled,
            batch_issue_policy: product.batch_issue_policy,
            requires_expiration_date: product.requires_expiration_date,
            expiry_warning_days: product.expiry_warning_days !== null ? String(product.expiry_warning_days) : '',
            is_active: product.is_active,
        });

        setIsDialogOpen(true);
    }

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    function submitProduct(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!capabilities.can_write) {
            return;
        }

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

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    function buildProductReportUrl(format: 'pdf' | 'excel-preview'): string {
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

    function openProductReport(format: 'pdf' | 'excel-preview'): void {
        if (products.total === 0) {
            return;
        }

        if (!capabilities.can_export) {
            requestSubscriptionRenewal(format === 'pdf' ? 'export the Product Directory as PDF' : 'export the Product Directory to Excel');
            return;
        }

        const reportWindow = window.open(buildProductReportUrl(format), '_blank', 'noopener,noreferrer');

        if (reportWindow) {
            reportWindow.opener = null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Status and delete
    |--------------------------------------------------------------------------
    */

    function toggleStatus(product: Product): void {
        if (!capabilities.can_write) {
            requestSubscriptionRenewal(`${product.is_active ? 'deactivate' : 'activate'} "${product.name}"`);
            return;
        }

        if (statusProcessingId === product.id) {
            return;
        }

        router.patch(
            `/inventory/products/${product.id}/status`,
            {
                is_active: !product.is_active,
            },
            {
                preserveScroll: true,
                onStart: () => setStatusProcessingId(product.id),
                onFinish: () => setStatusProcessingId(null),
            },
        );
    }

    function requestDelete(product: Product): void {
        if (!capabilities.can_write) {
            requestSubscriptionRenewal(`delete "${product.name}"`);
            return;
        }

        setDeleteTarget(product);
    }

    function deleteProduct(): void {
        if (!capabilities.can_write || !deleteTarget || deleteProcessing) {
            return;
        }

        router.delete(`/inventory/products/${deleteTarget.id}`, {
            preserveScroll: true,
            onStart: () => setDeleteProcessing(true),
            onSuccess: () => setDeleteTarget(null),
            onFinish: () => setDeleteProcessing(false),
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Derived values
    |--------------------------------------------------------------------------
    */

    const deleteHasRelations = Boolean(
        deleteTarget && (deleteTarget.warehouse_stocks_count > 0 || deleteTarget.stock_movements_count > 0 || deleteTarget.stock_batches_count > 0),
    );

    const inactiveProducts = Math.max(0, summary.total - summary.active);

    const activePercentage = summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0;

    const trackedPercentage = summary.total > 0 ? Math.round((summary.tracked / summary.total) * 100) : 0;

    const activeCategoryCount = categories.filter((category) => category.is_active).length;

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

    const selectedFormCategory = categories.find((category) => String(category.id) === form.data.category_id);

    const rawFormCostPrice = Number(form.data.cost_price || 0);
    const formCostPrice = Number.isFinite(rawFormCostPrice) ? rawFormCostPrice : 0;

    const batchConfigurationEnabled = form.data.stock_tracking === 'tracked' && form.data.batch_tracking_enabled;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <PageContainer className="gap-4 md:gap-5">
                {capabilities.is_read_only && (
                    <section className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300">
                                <LockKeyhole className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-amber-100">Product catalog is read-only</p>
                                <p className="mt-1 text-[10px] leading-4 text-amber-100/65">
                                    {capabilities.message ??
                                        'Renew the owner subscription to add, edit, delete, change status, or export product records.'}
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('subscription.index', undefined, false))}
                            className="h-9 shrink-0 rounded-lg border-amber-400/25 bg-amber-400/[0.06] px-3 text-xs text-amber-100 hover:bg-amber-400/10 hover:text-amber-50"
                        >
                            <CreditCard className="size-3.5" />
                            Renew Plan
                        </Button>
                    </section>
                )}

                {/* Product catalog control board */}

                <section className="border-primary/15 from-primary/[0.055] via-primary/[0.018] min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent shadow-sm">
                    <div className="border-primary/10 bg-background/25 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="border-primary/20 bg-primary/[0.075] text-primary flex size-9 shrink-0 items-center justify-center rounded-xl border">
                                <Package2 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-foreground text-[11px] font-semibold">Product Catalog Overview</p>

                                <p className="text-muted-foreground mt-0.5 text-[9px] leading-4">
                                    Select an overview segment to inspect its matching catalog records.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className={cn('h-6 w-fit shrink-0 gap-1.5 rounded-full px-2.5 text-[9px] font-semibold', catalogHealthClass)}
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

                    <div className="grid min-w-0 xl:grid-cols-[minmax(340px,1.08fr)_minmax(0,1.92fr)]">
                        <button
                            type="button"
                            onClick={() => openCatalogDrawer('active')}
                            className="border-border/60 hover:bg-primary/[0.025] focus-visible:ring-primary/35 relative min-w-0 overflow-hidden border-b p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset md:p-5 xl:border-r xl:border-b-0"
                        >
                            <div className="bg-primary/[0.08] pointer-events-none absolute -top-24 -left-20 size-60 rounded-full blur-3xl" />
                            <Package2 className="text-primary pointer-events-none absolute -right-6 -bottom-10 size-36 opacity-[0.018]" />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-primary text-[9px] font-semibold tracking-[0.14em] uppercase">Catalog readiness</p>

                                        <div className="mt-3 flex items-end gap-3">
                                            <p className="text-primary shrink-0 text-[34px] leading-none font-semibold tracking-[-0.045em] tabular-nums sm:text-[38px]">
                                                {activePercentage}%
                                            </p>

                                            <div className="min-w-0 pb-0.5">
                                                <p className="text-foreground text-[12px] font-semibold">
                                                    {summary.active} of {summary.total} products active
                                                </p>

                                                <p className="text-muted-foreground mt-1 max-w-xl text-[9px] leading-4">
                                                    Active products are available for stock setup, movement recording, and inventory transactions.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="h-7 w-fit shrink-0 rounded-full border-emerald-500/15 bg-emerald-500/[0.055] px-2.5 text-[9px] font-semibold text-emerald-300"
                                    >
                                        Open active records
                                    </Badge>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center justify-between gap-3 text-[9px] font-medium">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                            <span className="size-1.5 rounded-full bg-emerald-400" />
                                            {summary.active} active
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-amber-400">
                                            {inactiveProducts} inactive
                                            <span className="size-1.5 rounded-full bg-amber-400" />
                                        </span>
                                    </div>

                                    <div className="bg-muted mt-2 flex h-2.5 overflow-hidden rounded-full">
                                        <div
                                            className="h-full bg-emerald-400 transition-all duration-500"
                                            style={{ width: `${activePercentage}%` }}
                                        />
                                        <div
                                            className="h-full bg-amber-400 transition-all duration-500"
                                            style={{ width: `${Math.max(0, 100 - activePercentage)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="border-border/60 bg-background/40 mt-4 rounded-xl border px-3 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={cn(
                                                'inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                                                inactiveProducts === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400',
                                            )}
                                        >
                                            {inactiveProducts === 0 ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="text-foreground/85 text-[10px] font-semibold">
                                                {inactiveProducts === 0 ? 'All products are operational' : 'Catalog availability needs review'}
                                            </p>
                                            <p className="text-muted-foreground mt-0.5 text-[9px]">
                                                Select this panel to inspect active product records.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>

                        <div className="min-w-0">
                            <div className="grid min-w-0 sm:grid-cols-3">
                                <ProductOverviewSnapshot
                                    title="Tracking Coverage"
                                    value={`${trackedPercentage}%`}
                                    description={`${summary.tracked} tracked products`}
                                    icon={Boxes}
                                    tone="primary"
                                    onClick={() => openCatalogDrawer('tracked')}
                                    className="border-border/60 border-b sm:border-r"
                                />

                                <ProductOverviewSnapshot
                                    title="Active Categories"
                                    value={formatNumber(activeCategoryCount)}
                                    description={`${categories.length} category records`}
                                    icon={Tags}
                                    tone="teal"
                                    onClick={() => openCatalogDrawer('categories')}
                                    className="border-border/60 border-b sm:border-r"
                                />

                                <ProductOverviewSnapshot
                                    title="Needs Attention"
                                    value={formatNumber(inactiveProducts)}
                                    description="Inactive product records"
                                    icon={XCircle}
                                    tone={inactiveProducts > 0 ? 'amber' : 'emerald'}
                                    onClick={() => openCatalogDrawer('inactive')}
                                    className="border-border/60 border-b"
                                />
                            </div>

                            <div className="border-border/60 bg-background/20 border-b px-4 py-3">
                                <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.12em] uppercase">Catalog facts</p>
                                <p className="text-muted-foreground mt-1 text-[9px]">Each fact opens its own filtered drawer.</p>
                            </div>

                            <div className="grid min-w-0 sm:grid-cols-2">
                                <CatalogFactRow
                                    label="Registered products"
                                    description="Complete catalog records"
                                    value={summary.total}
                                    icon={<Package2 className="size-3.5" />}
                                    tone="emerald"
                                    onClick={() => openCatalogDrawer('all')}
                                    className="border-border/60 border-b sm:border-r"
                                />

                                <CatalogFactRow
                                    label="Not tracked"
                                    description="Excluded from quantity balances"
                                    value={summary.not_tracked}
                                    icon={<XCircle className="size-3.5" />}
                                    tone="amber"
                                    onClick={() => openCatalogDrawer('not_tracked')}
                                    className="border-border/60 border-b"
                                />

                                <CatalogFactRow
                                    label="Batch enabled"
                                    description="Lot and cost-layer tracking"
                                    value={summary.batch_enabled}
                                    icon={<Layers3 className="size-3.5" />}
                                    tone="teal"
                                    onClick={() => openCatalogDrawer('batch')}
                                    className="sm:border-r"
                                />

                                <CatalogFactRow
                                    label="Expiry required"
                                    description="Expiration-controlled products"
                                    value={summary.expiration_required}
                                    icon={<Barcode className="size-3.5" />}
                                    tone="lime"
                                    onClick={() => openCatalogDrawer('expiry')}
                                />
                            </div>
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
                                className="border-primary/15 bg-primary/[0.06] text-primary h-7 rounded-full px-2.5 text-[10px] font-medium"
                            >
                                <Package2 className="mr-1 size-3" />
                                {products.total} item
                                {products.total === 1 ? '' : 's'}
                            </Badge>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={products.total === 0}
                                title={!capabilities.can_export ? 'Select to review subscription renewal options.' : undefined}
                                onClick={() => openProductReport('pdf')}
                                className="h-9 rounded-lg px-3 text-xs disabled:cursor-not-allowed"
                            >
                                {capabilities.can_export ? <FileText className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
                                PDF
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={products.total === 0}
                                title={!capabilities.can_export ? 'Select to review subscription renewal options.' : undefined}
                                onClick={() => openProductReport('excel-preview')}
                                className="h-9 rounded-lg px-3 text-xs disabled:cursor-not-allowed"
                            >
                                {capabilities.can_export ? <FileSpreadsheet className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
                                Excel
                            </Button>

                            <Button
                                type="button"
                                title={!capabilities.can_write ? 'Select to review subscription renewal options.' : undefined}
                                onClick={openCreateDialog}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                {capabilities.can_write ? <Plus className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
                                Add Product
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={(event) => event.preventDefault()}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_155px_155px_140px]"
                    >
                        <SearchInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onClear={() => setSearch('')}
                            placeholder="Search product name, SKU, or barcode..."
                            className="sm:col-span-2 xl:col-span-1"
                        />

                        <Select value={categoryId || ALL_VALUE} onValueChange={(value) => setCategoryId(value === ALL_VALUE ? '' : value)}>
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>All categories</SelectItem>

                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.parent_id ? '— ' : ''}
                                        {category.name}
                                        {!category.is_active ? ' — Inactive' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={stockTracking || ALL_VALUE} onValueChange={(value) => setStockTracking(value === ALL_VALUE ? '' : value)}>
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All tracking" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>All tracking types</SelectItem>
                                <SelectItem value="tracked">Stock tracked</SelectItem>
                                <SelectItem value="not_tracked">Not tracked</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={batchTracking || ALL_VALUE} onValueChange={(value) => setBatchTracking(value === ALL_VALUE ? '' : value)}>
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All batch modes" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>All batch modes</SelectItem>
                                <SelectItem value="enabled">Batch enabled</SelectItem>
                                <SelectItem value="disabled">Batch disabled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={status || ALL_VALUE} onValueChange={(value) => setStatus(value === ALL_VALUE ? '' : value)}>
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <ProductDirectoryTable
                        products={products.data}
                        canCreate={capabilities.can_write}
                        lockedReason={capabilities.message}
                        onSelect={openDetailsDrawer}
                        onCreate={openCreateDialog}
                    />

                    <AppPagination pagination={products} itemLabel="products" />
                </SectionCard>
            </PageContainer>

            <ProductCatalogDrawer
                view={catalogDrawerView}
                pagination={products}
                categories={categories}
                summary={summary}
                onClose={closeCatalogDrawer}
                onSelect={(product) => {
                    closeCatalogDrawer();
                    openDetailsDrawer(product);
                }}
            />

            <ProductDetailsDrawer
                product={detailsProduct}
                canWrite={capabilities.can_write}
                lockedReason={capabilities.message}
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
                title={editingProduct ? 'Edit Product Record' : 'Register Product'}
                description={
                    editingProduct
                        ? `Maintain the catalog, pricing, and inventory settings for ${editingProduct.name}.`
                        : 'Create a complete product record for catalog and inventory operations.'
                }
                onSubmit={submitProduct}
                processing={form.processing}
                submitText={editingProduct ? 'Save Product Record' : 'Register Product'}
                processingText={editingProduct ? 'Saving Product Record...' : 'Registering Product...'}
                maxWidth="max-w-5xl"
            >
                <div className="border-border/70 bg-card overflow-hidden rounded-xl border">
                    <div className="border-primary/10 from-primary/[0.045] flex flex-col gap-3 border-b bg-gradient-to-r to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="border-primary/15 bg-primary/[0.06] text-primary flex size-9 shrink-0 items-center justify-center rounded-lg border">
                                <Package2 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-primary text-[9px] font-semibold tracking-[0.13em] uppercase">
                                    {editingProduct ? 'Catalog maintenance' : 'New catalog record'}
                                </p>

                                <p className="text-muted-foreground mt-0.5 text-[10px] leading-4">
                                    Complete the product identity first, then confirm pricing and inventory behavior.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge label={form.data.is_active ? 'Active' : 'Inactive'} variant={form.data.is_active ? 'success' : 'danger'} />

                            <StatusBadge
                                label={form.data.stock_tracking === 'tracked' ? 'Stock tracked' : 'Not tracked'}
                                variant={form.data.stock_tracking === 'tracked' ? 'info' : 'neutral'}
                            />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0">
                            <section className="p-5">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-primary text-[9px] font-semibold tracking-[0.12em] uppercase">01 · Product identity</p>

                                        <h3 className="text-foreground mt-1 text-sm font-semibold">Catalog information</h3>

                                        <p className="text-muted-foreground mt-1 text-[10px] leading-4">
                                            Define how this product is identified and grouped throughout inventory operations.
                                        </p>
                                    </div>

                                    <span className="text-muted-foreground hidden text-[9px] font-medium sm:block">
                                        <span className="text-rose-400">*</span> Required fields
                                    </span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-12">
                                    <div className="md:col-span-8">
                                        <FormField id="name" label="Product Name" error={form.errors.name} required>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={form.data.name}
                                                disabled={form.processing}
                                                onChange={(event) => form.setData('name', event.target.value)}
                                                placeholder="Enter the product name"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                        </FormField>
                                    </div>

                                    <div className="md:col-span-4">
                                        <FormField id="category_id" label="Category" error={form.errors.category_id}>
                                            <Select
                                                value={form.data.category_id || NO_CATEGORY_VALUE}
                                                disabled={form.processing}
                                                onValueChange={(value) => form.setData('category_id', value === NO_CATEGORY_VALUE ? '' : value)}
                                            >
                                                <SelectTrigger id="category_id">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value={NO_CATEGORY_VALUE}>No category</SelectItem>

                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={String(category.id)}>
                                                            {category.parent_id ? '— ' : ''}
                                                            {category.name}
                                                            {!category.is_active ? ' — Inactive' : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                    </div>

                                    <div className="md:col-span-4">
                                        <FormField id="sku" label="SKU" description="Optional internal stock code." error={form.errors.sku}>
                                            <Input
                                                id="sku"
                                                type="text"
                                                value={form.data.sku}
                                                disabled={form.processing}
                                                onChange={(event) => form.setData('sku', event.target.value.toUpperCase())}
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
                                                <Barcode className="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 transition-colors" />

                                                <Input
                                                    id="barcode"
                                                    type="text"
                                                    value={form.data.barcode}
                                                    disabled={form.processing}
                                                    onChange={(event) => form.setData('barcode', event.target.value)}
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
                                                onChange={(event) => form.setData('unit', event.target.value)}
                                                placeholder="pcs"
                                                autoComplete="off"
                                            />

                                            <datalist id="product-units">
                                                {commonUnits.map((unit) => (
                                                    <option key={unit} value={unit} />
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
                                                onChange={(event) => form.setData('description', event.target.value)}
                                                placeholder="Add a concise product description..."
                                                className="resize-none"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            </section>

                            <section className="border-border/70 border-t p-5">
                                <div className="mb-5">
                                    <p className="text-primary text-[9px] font-semibold tracking-[0.12em] uppercase">02 · Inventory configuration</p>

                                    <h3 className="text-foreground mt-1 text-sm font-semibold">Cost and batch controls</h3>

                                    <p className="text-muted-foreground mt-1 text-[10px] leading-4">
                                        Configure acquisition cost, stock tracking, issue policy, and expiration requirements.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        id="cost_price"
                                        label="Reference Cost"
                                        description="Default acquisition cost used when a transaction does not provide a more specific batch cost."
                                        error={form.errors.cost_price}
                                        required
                                    >
                                        <MoneyInput
                                            id="cost_price"
                                            value={form.data.cost_price}
                                            disabled={form.processing}
                                            onValueChange={(value) => form.setData('cost_price', value)}
                                        />
                                    </FormField>

                                    <FormField id="stock_tracking" label="Stock Tracking" error={form.errors.stock_tracking} required>
                                        <Select
                                            value={form.data.stock_tracking}
                                            disabled={form.processing}
                                            onValueChange={(value) => {
                                                const tracking = value as ProductFormData['stock_tracking'];
                                                form.setData({
                                                    ...form.data,
                                                    stock_tracking: tracking,
                                                    batch_tracking_enabled: tracking === 'tracked' ? form.data.batch_tracking_enabled : false,
                                                    requires_expiration_date: tracking === 'tracked' ? form.data.requires_expiration_date : false,
                                                });
                                            }}
                                        >
                                            <SelectTrigger id="stock_tracking">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tracked">Tracked inventory</SelectItem>
                                                <SelectItem value="not_tracked">Not quantity tracked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                </div>

                                <div className="border-primary/15 bg-primary/[0.025] mt-5 rounded-xl border p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Layers3 className="text-primary size-4" />
                                                <p className="text-[11px] font-semibold">Batch tracking</p>
                                            </div>
                                            <p className="text-muted-foreground mt-1 max-w-2xl text-[9px] leading-4">
                                                Track exact lot identity, expiration, remaining quantity, and actual cost layers per warehouse.
                                            </p>
                                        </div>

                                        <BooleanField
                                            id="batch_tracking_enabled"
                                            label="Enable batches"
                                            checked={form.data.batch_tracking_enabled}
                                            disabled={form.processing || form.data.stock_tracking !== 'tracked'}
                                            onCheckedChange={(checked) =>
                                                form.setData({
                                                    ...form.data,
                                                    batch_tracking_enabled: checked,
                                                    requires_expiration_date: checked ? form.data.requires_expiration_date : false,
                                                })
                                            }
                                        />
                                    </div>

                                    {form.errors.batch_tracking_enabled && (
                                        <p className="text-destructive mt-2 text-[10px]">{form.errors.batch_tracking_enabled}</p>
                                    )}

                                    {batchConfigurationEnabled && (
                                        <div className="border-border/60 mt-4 grid gap-4 border-t pt-4 md:grid-cols-3">
                                            <FormField
                                                id="batch_issue_policy"
                                                label="Issue Policy"
                                                description="FIFO uses oldest received; FEFO uses earliest expiration; manual requires user selection."
                                                error={form.errors.batch_issue_policy}
                                                required
                                            >
                                                <Select
                                                    value={form.data.batch_issue_policy}
                                                    disabled={form.processing}
                                                    onValueChange={(value) =>
                                                        form.setData('batch_issue_policy', value as ProductFormData['batch_issue_policy'])
                                                    }
                                                >
                                                    <SelectTrigger id="batch_issue_policy">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="fifo">FIFO — oldest received first</SelectItem>
                                                        <SelectItem value="fefo">FEFO — earliest expiry first</SelectItem>
                                                        <SelectItem value="manual">Manual batch selection</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormField>

                                            <FormField id="expiry_warning_days" label="Expiry Warning Days" error={form.errors.expiry_warning_days}>
                                                <Input
                                                    id="expiry_warning_days"
                                                    type="number"
                                                    min="1"
                                                    max="3650"
                                                    value={form.data.expiry_warning_days}
                                                    disabled={form.processing}
                                                    onChange={(event) => form.setData('expiry_warning_days', event.target.value)}
                                                    placeholder="30"
                                                />
                                            </FormField>

                                            <div className="border-border/60 bg-background/35 rounded-lg border p-3">
                                                <BooleanField
                                                    id="requires_expiration_date"
                                                    label="Require expiration date"
                                                    checked={form.data.requires_expiration_date}
                                                    disabled={form.processing}
                                                    onCheckedChange={(checked) => form.setData('requires_expiration_date', checked)}
                                                />
                                                {form.errors.requires_expiration_date && (
                                                    <p className="text-destructive mt-2 text-[10px]">{form.errors.requires_expiration_date}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-border/60 bg-background/20 mt-5 grid border-y sm:grid-cols-3">
                                    <ProductFormSummaryCell
                                        label="Reference cost"
                                        value={formatCurrency(formCostPrice)}
                                        helper={`Per ${form.data.unit || 'unit'}`}
                                        valueClassName="text-primary"
                                        className="border-border/60 border-b sm:border-r sm:border-b-0"
                                    />

                                    <ProductFormSummaryCell
                                        label="Inventory mode"
                                        value={form.data.stock_tracking === 'tracked' ? 'Quantity tracked' : 'Reference only'}
                                        helper="Warehouse balance behavior"
                                        className="border-border/60 border-b sm:border-r sm:border-b-0"
                                    />

                                    <ProductFormSummaryCell
                                        label="Batch policy"
                                        value={batchConfigurationEnabled ? form.data.batch_issue_policy.toUpperCase() : 'Disabled'}
                                        helper={
                                            batchConfigurationEnabled && form.data.requires_expiration_date
                                                ? 'Expiration required'
                                                : 'Expiration optional'
                                        }
                                        valueClassName={batchConfigurationEnabled ? 'text-cyan-300' : undefined}
                                    />
                                </div>
                            </section>
                        </div>

                        <aside className="border-border/70 bg-muted/[0.018] border-t p-5 lg:border-t-0 lg:border-l">
                            <div>
                                <p className="text-primary text-[9px] font-semibold tracking-[0.12em] uppercase">03 · Operations</p>

                                <h3 className="text-foreground mt-1 text-sm font-semibold">Inventory behavior</h3>

                                <p className="text-muted-foreground mt-1 text-[10px] leading-4">
                                    Control quantity tracking and whether the product can be used in transactions.
                                </p>
                            </div>

                            <div className="mt-5 space-y-5">
                                <div className="border-border/60 bg-background/35 rounded-xl border p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="border-primary/15 bg-primary/10 text-primary inline-flex size-8 shrink-0 items-center justify-center rounded-lg border">
                                            <Boxes className="size-4" />
                                        </span>
                                        <div>
                                            <p className="text-[10px] font-semibold">
                                                {form.data.stock_tracking === 'tracked' ? 'Warehouse inventory enabled' : 'Reference product only'}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-[9px] leading-4">
                                                {form.data.stock_tracking === 'tracked'
                                                    ? 'This product can hold warehouse balances and movement history.'
                                                    : 'No warehouse quantity will be maintained for this product.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <BooleanField
                                    id="is_active"
                                    checked={form.data.is_active}
                                    disabled={form.processing}
                                    onCheckedChange={(checked) => form.setData('is_active', checked)}
                                    label="Active Product"
                                    description="Active products can be used in inventory transactions."
                                    error={form.errors.is_active}
                                />
                            </div>

                            <div className="bg-border/70 my-5 h-px" />

                            <div>
                                <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.12em] uppercase">Record preview</p>

                                <dl className="divide-border/60 border-border/60 mt-3 divide-y border-y text-[10px]">
                                    <ProductFormPreviewRow
                                        label="Category"
                                        value={selectedFormCategory ? selectedFormCategory.name : 'Uncategorized'}
                                    />

                                    <ProductFormPreviewRow label="Unit" value={form.data.unit || 'Not set'} />

                                    <ProductFormPreviewRow
                                        label="Stock mode"
                                        value={form.data.stock_tracking === 'tracked' ? 'Warehouse tracked' : 'Quantity not tracked'}
                                    />

                                    <ProductFormPreviewRow
                                        label="Availability"
                                        value={form.data.is_active ? 'Available for use' : 'Inactive record'}
                                    />
                                </dl>
                            </div>

                            <div className="border-primary/30 mt-5 border-l-2 pl-3">
                                <p className="text-foreground/80 text-[9px] font-semibold">Inventory note</p>

                                <p className="text-muted-foreground mt-1 text-[9px] leading-4">
                                    Opening quantities are maintained separately in Stock Management after a tracked product is registered.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </FormDialog>

            <ConfirmDialog
                open={subscriptionPrompt !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSubscriptionPrompt(null);
                    }
                }}
                title={subscriptionPrompt?.title ?? 'Subscription renewal required'}
                description={subscriptionPrompt?.description ?? 'Renew the owner subscription to continue.'}
                confirmText="View Subscription"
                processing={false}
                onConfirm={() => {
                    setSubscriptionPrompt(null);

                    router.visit(route('subscription.index', undefined, false));
                }}
            />

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
    canCreate,
    lockedReason,
    onSelect,
    onCreate,
}: {
    products: Product[];
    canCreate: boolean;
    lockedReason: string | null;
    onSelect: (product: Product) => void;
    onCreate: () => void;
}) {
    return (
        <div className="border-border/70 bg-background/20 overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] table-fixed border-collapse">
                    <thead className="border-primary/10 bg-primary/[0.025] border-b">
                        <tr>
                            <th className="text-muted-foreground min-w-[280px] px-4 py-3 text-left text-[9px] font-semibold tracking-[0.11em] uppercase">
                                Product
                            </th>
                            <th className="text-muted-foreground min-w-[175px] px-4 py-3 text-left text-[9px] font-semibold tracking-[0.11em] uppercase">
                                Category
                            </th>
                            <th className="text-muted-foreground min-w-[145px] px-4 py-3 text-left text-[9px] font-semibold tracking-[0.11em] uppercase">
                                Cost & Batch
                            </th>
                            <th className="text-muted-foreground min-w-[185px] px-4 py-3 text-left text-[9px] font-semibold tracking-[0.11em] uppercase">
                                Inventory
                            </th>
                            <th className="text-muted-foreground w-[220px] px-4 py-3 text-left text-[9px] font-semibold tracking-[0.11em] uppercase">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-border/60 divide-y">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14">
                                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                        <span className="border-primary/15 bg-primary/[0.045] text-primary flex size-11 items-center justify-center rounded-xl border">
                                            <Package2 className="size-5" />
                                        </span>
                                        <h3 className="text-foreground mt-3 text-sm font-semibold">No products found</h3>
                                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                                            Try changing the filters or add your first inventory product.
                                        </p>
                                        <Button
                                            type="button"
                                            title={!canCreate ? (lockedReason ?? 'Select to review subscription renewal options.') : undefined}
                                            onClick={onCreate}
                                            className="mt-4 h-9 rounded-lg px-4 text-xs"
                                        >
                                            {canCreate ? <Plus className="size-4" /> : <LockKeyhole className="size-4" />}
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
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            onSelect(product);
                                        }
                                    }}
                                    className="group bg-card/55 hover:bg-primary/[0.035] focus-visible:ring-primary/35 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                                >
                                    <td className="px-4 py-2.5">
                                        <EntityInfo
                                            avatar={
                                                <EntityAvatar
                                                    icon={Package2}
                                                    className="border-primary/15 bg-primary/[0.07] text-primary group-hover:border-primary/25 group-hover:bg-primary/10 transition-colors"
                                                />
                                            }
                                            title={product.name}
                                            subtitle={<span className="font-mono text-[10px]">{product.sku ?? 'No SKU'}</span>}
                                        />
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Tags className="text-primary size-3.5 shrink-0" />
                                                <p className="text-foreground/90 max-w-[145px] truncate text-[11px] font-semibold">
                                                    {product.category?.name ?? 'Uncategorized'}
                                                </p>
                                            </div>
                                            <p className="text-muted-foreground mt-1 max-w-[160px] truncate font-mono text-[9px]">
                                                {product.category?.slug ?? 'No category assigned'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <p className="text-primary text-[13px] font-semibold tabular-nums">{formatCurrency(product.cost_price)}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                            {product.batch_tracking_enabled ? (
                                                <>
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 border-cyan-500/25 bg-cyan-500/10 px-1.5 text-[8px] text-cyan-300"
                                                    >
                                                        <Layers3 className="mr-1 size-2.5" />
                                                        {product.batch_issue_policy.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-muted-foreground text-[8px]">
                                                        {product.available_stock_batches_count} active layer
                                                        {product.available_stock_batches_count === 1 ? '' : 's'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground text-[9px]">Standard stock</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2.5">
                                        {product.stock_tracking === 'tracked' ? (
                                            <div>
                                                <p className="text-foreground text-[13px] font-semibold tabular-nums">
                                                    {formatQuantity(product.total_stock)}{' '}
                                                    <span className="text-muted-foreground text-[9px] font-medium">{product.unit}</span>
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[9px]">
                                                    {product.warehouse_stocks_count} warehouse record
                                                    {product.warehouse_stocks_count === 1 ? '' : 's'} · {product.stock_movements_count} movement
                                                    {product.stock_movements_count === 1 ? '' : 's'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-muted-foreground text-[10px] font-semibold">Quantity not tracked</p>
                                                <p className="text-muted-foreground mt-1 text-[9px]">Excluded from warehouse balances</p>
                                            </div>
                                        )}
                                    </td>

                                    <td className="w-[220px] px-4 py-2.5 align-middle">
                                        <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                                            <StatusBadge
                                                label={product.is_active ? 'Active' : 'Inactive'}
                                                variant={product.is_active ? 'success' : 'danger'}
                                            />

                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'h-5 max-w-[125px] min-w-0 shrink px-1.5 text-[8px] font-medium',
                                                    product.stock_tracking === 'tracked'
                                                        ? 'border-blue-500/25 bg-blue-500/10 text-blue-300'
                                                        : 'border-slate-500/25 bg-slate-500/10 text-slate-300',
                                                )}
                                                title={
                                                    product.stock_tracking !== 'tracked'
                                                        ? 'Quantity is not tracked'
                                                        : product.batch_tracking_enabled
                                                          ? product.requires_expiration_date
                                                              ? 'Stock tracked, batch tracked, expiration required'
                                                              : 'Stock tracked and batch tracked'
                                                          : 'Stock tracked without batch tracking'
                                                }
                                            >
                                                <span className="truncate">
                                                    {product.stock_tracking !== 'tracked'
                                                        ? 'Not tracked'
                                                        : product.batch_tracking_enabled
                                                          ? product.requires_expiration_date
                                                              ? 'Tracked · Expiry'
                                                              : 'Tracked · Batch'
                                                          : 'Tracked'}
                                                </span>
                                            </Badge>
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
            <p className="text-muted-foreground text-[8px] font-semibold tracking-[0.11em] uppercase">{label}</p>

            <p className={cn('text-foreground mt-1.5 truncate text-[12px] font-semibold tabular-nums', valueClassName)}>{value}</p>

            <p className="text-muted-foreground mt-1 truncate text-[8px]">{helper}</p>
        </div>
    );
}

function ProductFormPreviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-foreground/85 max-w-[160px] text-right font-medium">{value}</dd>
        </div>
    );
}

function ProductCatalogDrawer({
    view,
    pagination,
    categories,
    summary,
    onClose,
    onSelect,
}: {
    view: ProductCatalogDrawerView | null;
    pagination: PaginatedProducts;
    categories: CategoryOption[];
    summary: ProductSummary;
    onClose: () => void;
    onSelect: (product: Product) => void;
}) {
    const [drawerSearch, setDrawerSearch] = useState('');

    useEffect(() => {
        setDrawerSearch('');
    }, [view]);

    const activeView = view ?? 'all';
    const inactiveTotal = Math.max(0, summary.total - summary.active);

    const configs: Record<
        ProductCatalogDrawerView,
        {
            title: string;
            eyebrow: string;
            description: string;
            total: number;
            emptyLabel: string;
        }
    > = {
        all: {
            title: 'Registered Products',
            eyebrow: 'Complete catalog',
            description: 'Review product records loaded on the current page and open any item for its complete catalog and inventory details.',
            total: summary.total,
            emptyLabel: 'No products are loaded on this page.',
        },
        active: {
            title: 'Active Products',
            eyebrow: 'Catalog readiness',
            description: 'Active products are available for warehouse setup and inventory transactions.',
            total: summary.active,
            emptyLabel: 'No active products are loaded on this page.',
        },
        inactive: {
            title: 'Inactive Products',
            eyebrow: 'Needs attention',
            description: 'Inactive products remain in the catalog but are unavailable for normal inventory operations.',
            total: inactiveTotal,
            emptyLabel: 'No inactive products are loaded on this page.',
        },
        tracked: {
            title: 'Stock-Tracked Products',
            eyebrow: 'Tracking coverage',
            description: 'These products maintain warehouse balances and stock movement history.',
            total: summary.tracked,
            emptyLabel: 'No stock-tracked products are loaded on this page.',
        },
        not_tracked: {
            title: 'Not-Tracked Products',
            eyebrow: 'Reference-only catalog',
            description: 'These products are excluded from warehouse quantity balances.',
            total: summary.not_tracked,
            emptyLabel: 'No not-tracked products are loaded on this page.',
        },
        batch: {
            title: 'Batch-Enabled Products',
            eyebrow: 'Lot and cost layers',
            description: 'These products maintain exact batch identity, remaining quantity, and issue-policy settings.',
            total: summary.batch_enabled,
            emptyLabel: 'No batch-enabled products are loaded on this page.',
        },
        expiry: {
            title: 'Expiration-Controlled Products',
            eyebrow: 'Expiry requirements',
            description: 'These products require expiration dates when batch inventory is received.',
            total: summary.expiration_required,
            emptyLabel: 'No expiration-controlled products are loaded on this page.',
        },
        categories: {
            title: 'Catalog Categories',
            eyebrow: 'Product organization',
            description: 'Review the category records currently available for product assignment.',
            total: categories.length,
            emptyLabel: 'No categories are available.',
        },
    };

    const config = configs[activeView];
    const normalizedSearch = drawerSearch.trim().toLowerCase();

    const matchingProducts = pagination.data.filter((product) => {
        if (activeView === 'active') {
            return product.is_active;
        }
        if (activeView === 'inactive') {
            return !product.is_active;
        }
        if (activeView === 'tracked') {
            return product.stock_tracking === 'tracked';
        }
        if (activeView === 'not_tracked') {
            return product.stock_tracking === 'not_tracked';
        }
        if (activeView === 'batch') {
            return product.batch_tracking_enabled;
        }
        if (activeView === 'expiry') {
            return product.requires_expiration_date;
        }
        return true;
    });

    const visibleProducts =
        activeView === 'categories'
            ? []
            : normalizedSearch
              ? matchingProducts.filter((product) =>
                    [product.name, product.sku, product.barcode, product.category?.name]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                        .includes(normalizedSearch),
                )
              : matchingProducts;

    const visibleCategories = normalizedSearch
        ? categories.filter((category) =>
              [category.name, category.slug, category.parent_id ? 'subcategory' : 'root', category.is_active ? 'active' : 'inactive']
                  .join(' ')
                  .toLowerCase()
                  .includes(normalizedSearch),
          )
        : categories;

    const loadedRange = pagination.from !== null && pagination.to !== null ? `${pagination.from}-${pagination.to}` : '0';

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
            <div className="bg-card flex min-h-full flex-col">
                <div className="border-primary/10 from-primary/[0.055] via-primary/[0.012] border-b bg-gradient-to-br to-transparent px-5 py-5">
                    <p className="text-primary text-[9px] font-semibold tracking-[0.14em] uppercase">{config.eyebrow}</p>

                    <div className="mt-2 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-primary text-3xl leading-none font-semibold tabular-nums">{formatNumber(config.total)}</p>
                            <p className="text-muted-foreground mt-1 text-[9px]">Total matching catalog records</p>
                        </div>

                        <Badge variant="outline" className="border-primary/15 bg-primary/[0.055] text-primary h-7 rounded-full px-2.5 text-[9px]">
                            {activeView === 'categories' ? `${categories.length} available` : `Loaded ${loadedRange}`}
                        </Badge>
                    </div>
                </div>

                <div className="border-border/60 border-b p-4">
                    <SearchInput
                        value={drawerSearch}
                        onChange={(event) => setDrawerSearch(event.target.value)}
                        onClear={() => setDrawerSearch('')}
                        placeholder={activeView === 'categories' ? 'Search loaded categories...' : 'Search loaded products...'}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {activeView === 'categories' ? (
                        visibleCategories.length === 0 ? (
                            <ProductCatalogDrawerEmpty icon={Tags} description={config.emptyLabel} />
                        ) : (
                            <div className="space-y-2">
                                {visibleCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="border-border/60 bg-background/25 flex items-center gap-3 rounded-xl border p-3"
                                    >
                                        <span className="border-primary/15 bg-primary/[0.07] text-primary flex size-9 shrink-0 items-center justify-center rounded-lg border">
                                            <Tags className="size-4" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <p className="truncate text-[11px] font-semibold">{category.name}</p>
                                                <StatusBadge
                                                    label={category.is_active ? 'Active' : 'Inactive'}
                                                    variant={category.is_active ? 'success' : 'danger'}
                                                />
                                            </div>

                                            <p className="text-muted-foreground mt-1 truncate font-mono text-[9px]">
                                                {category.parent_id ? 'Subcategory' : 'Root category'} · {category.slug}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : visibleProducts.length === 0 ? (
                        <ProductCatalogDrawerEmpty icon={Package2} description={config.emptyLabel} />
                    ) : (
                        <div className="space-y-2">
                            {visibleProducts.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => onSelect(product)}
                                    className="border-border/60 bg-background/25 hover:border-primary/20 hover:bg-primary/[0.035] focus-visible:ring-primary/35 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2"
                                >
                                    <EntityAvatar icon={Package2} className="border-primary/15 bg-primary/[0.07] text-primary" />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="truncate text-[11px] font-semibold">{product.name}</p>
                                            <StatusBadge
                                                label={product.is_active ? 'Active' : 'Inactive'}
                                                variant={product.is_active ? 'success' : 'danger'}
                                            />
                                        </div>

                                        <p className="text-muted-foreground mt-1 truncate font-mono text-[9px]">
                                            {product.sku ?? 'No SKU'} · {product.category?.name ?? 'Uncategorized'}
                                        </p>

                                        <p className="text-muted-foreground mt-1 text-[8px]">
                                            {product.stock_tracking === 'tracked'
                                                ? `${formatQuantity(product.total_stock)} ${product.unit} · ${product.available_stock_batches_count} active batches`
                                                : 'Quantity not tracked'}
                                        </p>
                                    </div>

                                    <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppDrawer>
    );
}

function ProductCatalogDrawerEmpty({ icon: Icon, description }: { icon: typeof Package2; description: string }) {
    return (
        <div className="border-border/70 bg-background/20 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
            <Icon className="text-muted-foreground size-6" />
            <p className="mt-3 text-sm font-semibold">No loaded matches</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-[10px] leading-5">{description}</p>
        </div>
    );
}

function ProductOverviewSnapshot({
    title,
    value,
    description,
    icon: Icon,
    tone,
    onClick,
    className,
}: {
    title: string;
    value: string;
    description: string;
    icon: typeof Package2;
    tone: 'primary' | 'teal' | 'emerald' | 'amber';
    onClick: () => void;
    className?: string;
}) {
    const toneStyles = {
        primary: 'border-primary/15 bg-primary/[0.055] text-primary',
        teal: 'border-cyan-500/15 bg-cyan-500/[0.055] text-cyan-300',
        emerald: 'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-400',
        amber: 'border-amber-500/15 bg-amber-500/[0.055] text-amber-400',
    } as const;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group hover:bg-primary/[0.025] focus-visible:ring-primary/35 min-w-0 p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.11em] uppercase">{title}</p>
                    <p className="mt-2 text-xl leading-none font-semibold tabular-nums">{value}</p>
                    <p className="text-muted-foreground mt-1.5 truncate text-[9px]">{description}</p>
                </div>

                <span
                    className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105',
                        toneStyles[tone],
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>
        </button>
    );
}

function ProductDetailsDrawer({
    product,
    canWrite,
    lockedReason,
    statusProcessingId,
    onClose,
    onEdit,
    onToggleStatus,
    onDelete,
}: {
    product: Product | null;
    canWrite: boolean;
    lockedReason: string | null;
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
            description="Review catalog identity, inventory configuration, batch policy, and activity."
            processing={false}
        >
            {product && (
                <div className="bg-card flex min-h-full flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <section className="border-primary/10 from-primary/[0.055] via-primary/[0.012] border-b bg-gradient-to-br to-transparent px-5 py-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-primary text-[9px] font-semibold tracking-[0.14em] uppercase">Inventory product</p>
                                        <StatusBadge
                                            label={product.is_active ? 'Active' : 'Inactive'}
                                            variant={product.is_active ? 'success' : 'danger'}
                                        />
                                        <StatusBadge label={tracked ? 'Stock tracked' : 'Not tracked'} variant={tracked ? 'info' : 'neutral'} />
                                        {product.batch_tracking_enabled && (
                                            <StatusBadge label={`${product.batch_issue_policy.toUpperCase()} batches`} variant="info" />
                                        )}
                                    </div>

                                    <h2 className="text-foreground mt-2 text-lg font-semibold tracking-[-0.025em]">{product.name}</h2>

                                    <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                                        {product.sku ?? 'No SKU'}
                                        {product.barcode ? ` · ${product.barcode}` : ' · No barcode'}
                                    </p>

                                    <p className="text-muted-foreground mt-2 max-w-xl text-[10px] leading-5">
                                        {product.description ?? 'No internal product description was provided.'}
                                    </p>
                                </div>

                                <div className="shrink-0 text-left sm:text-right">
                                    <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.12em] uppercase">Reference cost</p>
                                    <p className="text-primary mt-1 text-2xl leading-none font-semibold tabular-nums">
                                        {formatCurrency(product.cost_price)}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-[9px]">per {product.unit}</p>
                                </div>
                            </div>

                            <div className="border-border/60 mt-5 grid border-y sm:grid-cols-4">
                                <ProductSummaryCell
                                    label="Available stock"
                                    value={tracked ? `${formatQuantity(product.total_stock)} ${product.unit}` : 'Not tracked'}
                                    helper={tracked ? `${product.warehouse_stocks_count} warehouse records` : 'No quantity balance'}
                                    className="border-border/60 border-b sm:border-r sm:border-b-0"
                                />
                                <ProductSummaryCell
                                    label="Active batches"
                                    value={formatNumber(product.available_stock_batches_count)}
                                    helper={`${formatNumber(product.stock_batches_count)} total batch records`}
                                    valueClassName={product.batch_tracking_enabled ? 'text-cyan-300' : undefined}
                                    className="border-border/60 border-b sm:border-r sm:border-b-0"
                                />
                                <ProductSummaryCell
                                    label="Issue policy"
                                    value={product.batch_tracking_enabled ? product.batch_issue_policy.toUpperCase() : 'Standard'}
                                    helper={product.requires_expiration_date ? 'Expiration required' : 'Expiration optional'}
                                    className="border-border/60 border-b sm:border-r sm:border-b-0"
                                />
                                <ProductSummaryCell
                                    label="Movement records"
                                    value={formatNumber(product.stock_movements_count)}
                                    helper="Inventory activity links"
                                />
                            </div>
                        </section>

                        <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(270px,0.85fr)]">
                            <div className="divide-border/60 lg:border-border/60 min-w-0 divide-y lg:border-r">
                                <ProductDocumentSection title="Product Information" description="Core identity and catalog placement.">
                                    <ProductDetailRow label="Product ID" value={`#${product.id}`} mono />
                                    <ProductDetailRow label="Product name" value={product.name} />
                                    <ProductDetailRow label="Slug" value={product.slug} mono />
                                    <ProductDetailRow label="SKU" value={product.sku ?? 'Not assigned'} mono />
                                    <ProductDetailRow label="Barcode" value={product.barcode ?? 'Not assigned'} mono />
                                    <ProductDetailRow label="Unit" value={product.unit} />
                                    <ProductDetailRow
                                        label="Reference cost"
                                        value={formatCurrency(product.cost_price)}
                                        valueClassName="text-primary"
                                    />
                                </ProductDocumentSection>

                                <ProductDocumentSection
                                    title="Batch Configuration"
                                    description="Exact layer identity, issue policy, and expiration controls."
                                >
                                    <ProductDetailRow
                                        label="Batch tracking"
                                        value={product.batch_tracking_enabled ? 'Enabled' : 'Disabled'}
                                        valueClassName={product.batch_tracking_enabled ? 'text-cyan-300' : undefined}
                                    />
                                    <ProductDetailRow
                                        label="Issue policy"
                                        value={product.batch_tracking_enabled ? product.batch_issue_policy.toUpperCase() : 'Not applicable'}
                                    />
                                    <ProductDetailRow
                                        label="Expiration date"
                                        value={product.requires_expiration_date ? 'Required on incoming batches' : 'Optional'}
                                    />
                                    <ProductDetailRow
                                        label="Warning window"
                                        value={product.expiry_warning_days !== null ? `${product.expiry_warning_days} days` : 'System default'}
                                    />
                                    <ProductDetailRow label="Batch records" value={formatNumber(product.stock_batches_count)} />
                                    <ProductDetailRow label="Available layers" value={formatNumber(product.available_stock_batches_count)} />
                                </ProductDocumentSection>
                            </div>

                            <aside className="divide-border/60 bg-muted/[0.018] min-w-0 divide-y">
                                <ProductDocumentSection title="Catalog and Inventory" description="Category and warehouse configuration.">
                                    <ProductDetailRow label="Category" value={product.category?.name ?? 'Uncategorized'} />
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
                                    <ProductDetailRow label="Stock tracking" value={tracked ? 'Tracked inventory' : 'Not tracked'} />
                                    <ProductDetailRow
                                        label="Total stock"
                                        value={tracked ? `${formatQuantity(product.total_stock)} ${product.unit}` : 'Not maintained'}
                                    />
                                    <ProductDetailRow label="Warehouse records" value={formatNumber(product.warehouse_stocks_count)} />
                                    <ProductDetailRow label="Movement records" value={formatNumber(product.stock_movements_count)} />
                                </ProductDocumentSection>

                                <ProductDocumentSection title="Record Audit" description="System status and timestamps.">
                                    <ProductDetailRow
                                        label="Product status"
                                        value={product.is_active ? 'Active' : 'Inactive'}
                                        valueClassName={product.is_active ? 'text-emerald-400' : 'text-rose-400'}
                                    />
                                    <ProductDetailRow label="Tenant ID" value={`#${product.tenant_id}`} mono />
                                    <ProductDetailRow label="Created" value={formatDateTime(product.created_at)} />
                                    <ProductDetailRow label="Updated" value={formatDateTime(product.updated_at)} />
                                </ProductDocumentSection>
                            </aside>
                        </div>
                    </div>

                    <footer className="border-border/60 bg-background/35 flex shrink-0 flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button type="button" variant="outline" onClick={onClose} className="h-9 rounded-lg text-xs">
                            Close
                        </Button>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={statusProcessingId === product.id}
                                title={!canWrite ? (lockedReason ?? 'Select to review subscription renewal options.') : undefined}
                                onClick={() => onToggleStatus(product)}
                                className={cn(
                                    'h-9 rounded-lg text-xs',
                                    product.is_active
                                        ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/[0.07] hover:text-amber-300'
                                        : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/[0.07] hover:text-emerald-300',
                                )}
                            >
                                {!canWrite && <LockKeyhole className="size-3.5" />}
                                {product.is_active ? 'Deactivate' : 'Activate'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                title={!canWrite ? (lockedReason ?? 'Select to review subscription renewal options.') : undefined}
                                onClick={() => onDelete(product)}
                                className="h-9 rounded-lg border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/[0.07] hover:text-rose-300"
                            >
                                {canWrite ? <Trash2 className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
                                Delete
                            </Button>

                            <Button
                                type="button"
                                title={!canWrite ? (lockedReason ?? 'Select to review subscription renewal options.') : undefined}
                                onClick={() => onEdit(product)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-lg px-4 text-xs"
                            >
                                {canWrite ? <Pencil className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
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
            <p className="text-muted-foreground text-[8px] font-semibold tracking-[0.12em] uppercase">{label}</p>
            <p className={cn('text-foreground mt-1.5 truncate text-[11px] font-semibold tabular-nums', valueClassName)} title={value}>
                {value}
            </p>
            <p className="text-muted-foreground mt-1 truncate text-[8px]">{helper}</p>
        </div>
    );
}

function ProductDocumentSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <section className="px-5 py-5">
            <div className="mb-3">
                <h3 className="text-foreground text-[11px] font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-[9px] leading-4">{description}</p>
            </div>
            <dl className="divide-border/55 border-border/55 divide-y border-y">{children}</dl>
        </section>
    );
}

function ProductDetailRow({ label, value, mono = false, valueClassName }: { label: string; value: string; mono?: boolean; valueClassName?: string }) {
    return (
        <div className="grid min-w-0 gap-1 py-2.5 sm:grid-cols-[125px_minmax(0,1fr)] sm:items-start sm:gap-4">
            <dt className="text-muted-foreground text-[9px]">{label}</dt>
            <dd className={cn('text-foreground/90 min-w-0 text-[10px] font-semibold break-words sm:text-right', mono && 'font-mono', valueClassName)}>
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
    onClick,
    className,
}: {
    label: string;
    description: string;
    value: number;
    icon: ReactNode;
    tone: 'emerald' | 'lime' | 'teal' | 'amber';
    onClick: () => void;
    className?: string;
}) {
    const toneStyles = {
        emerald: {
            icon: 'border-primary/15 bg-primary/[0.055] text-primary',
            value: 'text-primary',
        },
        lime: {
            icon: 'border-lime-500/15 bg-lime-500/[0.055] text-lime-300',
            value: 'text-lime-300',
        },
        teal: {
            icon: 'border-cyan-500/15 bg-cyan-500/[0.055] text-cyan-300',
            value: 'text-cyan-300',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/[0.055] text-amber-400',
            value: 'text-amber-400',
        },
    } as const;

    const styles = toneStyles[tone];

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group hover:bg-primary/[0.025] focus-visible:ring-primary/35 flex min-w-0 items-center gap-3 px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                className,
            )}
        >
            <span
                className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105',
                    styles.icon,
                )}
            >
                {icon}
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-foreground/90 text-[10px] font-semibold">{label}</p>
                <p className="text-muted-foreground mt-0.5 truncate text-[9px]">{description}</p>
            </div>

            <span className={cn('shrink-0 text-lg font-semibold tabular-nums', styles.value)}>{formatNumber(value)}</span>
        </button>
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
