import { AppDrawer } from '@/components/shared/app-drawer';
import { AppPagination } from '@/components/shared/app-pagination';
import { BooleanField } from '@/components/shared/boolean-field';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EntityAvatar } from '@/components/shared/entity-avatar';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { FormDialog } from '@/components/shared/form-dialog';
import { FormField } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
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
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleGauge,
    Folder,
    FolderTree,
    Layers3,
    Package2,
    Pencil,
    Plus,
    Search,
    Tags,
    Trash2,
    XCircle,
    type LucideIcon,
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

type ParentCategory = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    is_active: boolean;
    sort_order: number;
};

type Category = {
    id: number;
    tenant_id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    products_count: number;
    children_count: number;
    parent: {
        id: number;
        name: string;
        slug: string;
    } | null;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedCategories = {
    current_page: number;
    data: Category[];
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

type CategorySummary = {
    total: number;
    active: number;
    inactive: number;
    root: number;
};

type CategoryFilters = {
    search: string;
    status: string;
    parent_id: string;
};

type CategoryFormData = {
    parent_id: string;
    name: string;
    description: string;
    sort_order: string;
    is_active: boolean;
};

type CategoryPageProps = {
    categories: PaginatedCategories;
    parentCategories: ParentCategory[];
    summary: CategorySummary;
    filters: CategoryFilters;
};

type CategoryMetricTone =
    | 'emerald'
    | 'teal'
    | 'lime';

type CategoryDrawerView =
    | 'all'
    | 'active'
    | 'inactive'
    | 'root'
    | 'nested';

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
        title: 'Categories',
        href: '/inventory/categories',
    },
];

const emptyCategoryForm: CategoryFormData = {
    parent_id: '',
    name: '',
    description: '',
    sort_order: '0',
    is_active: true,
};

const ALL_VALUE = 'all';
const ROOT_VALUE = 'root';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CategoryIndex({
    categories,
    parentCategories,
    summary,
    filters,
}: CategoryPageProps) {
    const [isDialogOpen, setIsDialogOpen] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const [detailsCategory, setDetailsCategory] =
        useState<Category | null>(null);

    const [catalogDrawerView, setCatalogDrawerView] =
        useState<CategoryDrawerView | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Category | null>(null);

    const [deleteProcessing, setDeleteProcessing] =
        useState(false);

    const [statusProcessingId, setStatusProcessingId] =
        useState<number | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [parentFilter, setParentFilter] =
        useState(filters.parent_id ?? '');

    const form = useForm<CategoryFormData>({
        ...emptyCategoryForm,
    });

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
        setParentFilter(filters.parent_id ?? '');
    }, [
        filters.search,
        filters.status,
        filters.parent_id,
    ]);

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (
            normalizedSearch === (filters.search ?? '').trim() &&
            status === (filters.status ?? '') &&
            parentFilter === (filters.parent_id ?? '')
        ) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            router.get(
                '/inventory/categories',
                {
                        search: normalizedSearch || undefined,
                        status: status || undefined,
                        parent_id: parentFilter || undefined,
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
        parentFilter,
        filters.search,
        filters.status,
        filters.parent_id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Form dialog
    |--------------------------------------------------------------------------
    */

    function resetCategoryForm(): void {
        form.clearErrors();
        form.setData({
            ...emptyCategoryForm,
        });
    }

    function closeCategoryDialog(): void {
        if (form.processing) {
            return;
        }

        setIsDialogOpen(false);
        setEditingCategory(null);
        resetCategoryForm();
    }

    function handleDialogOpenChange(
        open: boolean,
    ): void {
        if (open) {
            setIsDialogOpen(true);
            return;
        }

        closeCategoryDialog();
    }

    function openCreateDialog(): void {
        setEditingCategory(null);
        resetCategoryForm();
        setIsDialogOpen(true);
    }

    function openEditDialog(
        category: Category,
    ): void {
        setEditingCategory(category);
        form.clearErrors();

        form.setData({
            parent_id: category.parent_id
                ? String(category.parent_id)
                : '',
            name: category.name,
            description:
                category.description ?? '',
            sort_order: String(
                category.sort_order,
            ),
            is_active: category.is_active,
        });

        setIsDialogOpen(true);
    }

    function openDetailsDrawer(
        category: Category,
    ): void {
        setDetailsCategory(category);
    }

    function closeDetailsDrawer(): void {
        setDetailsCategory(null);
    }

    function openCatalogDrawer(
        view: CategoryDrawerView,
    ): void {
        setCatalogDrawerView(view);
    }

    function closeCatalogDrawer(): void {
        setCatalogDrawerView(null);
    }

    function submitCategory(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingCategory) {
            form.put(
                `/inventory/categories/${editingCategory.id}`,
                {
                    preserveScroll: true,
                    onSuccess:
                        closeCategoryDialog,
                },
            );

            return;
        }

        form.post('/inventory/categories', {
            preserveScroll: true,
            onSuccess: closeCategoryDialog,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */


    function toggleStatus(
        category: Category,
    ): void {
        if (
            statusProcessingId === category.id
        ) {
            return;
        }

        router.patch(
            `/inventory/categories/${category.id}/status`,
            {
                is_active:
                    !category.is_active,
            },
            {
                preserveScroll: true,
                onStart: () =>
                    setStatusProcessingId(
                        category.id,
                    ),
                onFinish: () =>
                    setStatusProcessingId(null),
            },
        );
    }

    function requestDelete(
        category: Category,
    ): void {
        setDeleteTarget(category);
    }

    function deleteCategory(): void {
        if (
            !deleteTarget ||
            deleteProcessing
        ) {
            return;
        }

        router.delete(
            `/inventory/categories/${deleteTarget.id}`,
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

    const availableParentCategories =
        parentCategories.filter(
            (category) =>
                category.id !==
                editingCategory?.id,
        );

    const nestedCategories = Math.max(
        0,
        summary.total - summary.root,
    );

    const activePercentage =
        summary.total > 0
            ? Math.round(
                  (summary.active /
                      summary.total) *
                      100,
              )
            : 0;

    const inactivePercentage =
        summary.total > 0
            ? Math.max(
                  0,
                  100 - activePercentage,
              )
            : 0;

    const rootPercentage =
        summary.total > 0
            ? Math.round(
                  (summary.root /
                      summary.total) *
                      100,
              )
            : 0;

    const nestedPercentage =
        summary.total > 0
            ? Math.max(
                  0,
                  100 - rootPercentage,
              )
            : 0;

    const deleteHasRelations = Boolean(
        deleteTarget &&
            (deleteTarget.products_count > 0 ||
                deleteTarget.children_count > 0),
    );

    const catalogHealthLabel =
        summary.total === 0
            ? 'Catalog structure empty'
            : summary.inactive === 0
              ? 'Catalog structure healthy'
              : `${summary.inactive} categor${
                    summary.inactive === 1
                        ? 'y'
                        : 'ies'
                } inactive`;

    const catalogHealthClass =
        summary.total === 0
            ? 'border-slate-500/20 bg-slate-500/10 text-slate-300'
            : summary.inactive === 0
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-300';

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <PageContainer className="gap-4 md:gap-5">
                {/* Catalog structure board */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.075] via-card/70 to-card/40">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <FolderTree className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-foreground">
                                    Catalog Structure Board
                                </p>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Category availability, hierarchy balance, and product-group organization.
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
                                <Tags className="size-3" />
                            ) : summary.inactive === 0 ? (
                                <CheckCircle2 className="size-3" />
                            ) : (
                                <XCircle className="size-3" />
                            )}

                            {catalogHealthLabel}
                        </Badge>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[minmax(320px,1.05fr)_minmax(0,1.95fr)]">
                        {/* Primary catalog coverage */}

                        <button
                            type="button"
                            onClick={() => openCatalogDrawer('active')}
                            className="relative overflow-hidden border-b border-border/60 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 xl:border-b-0 xl:border-r md:p-5"
                        >
                            <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-primary/10 blur-3xl" />
                            <FolderTree className="pointer-events-none absolute -bottom-8 -right-5 size-32 text-primary opacity-[0.022]" />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-primary">
                                            Active catalog coverage
                                        </p>

                                        <div className="mt-3 flex items-center gap-3">
                                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                                <CircleGauge className="size-5" />
                                            </span>

                                            <div>
                                                <p className="text-[28px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                                                    {summary.active}

                                                    <span className="mx-1.5 text-base font-medium text-muted-foreground">
                                                        /
                                                    </span>

                                                    {summary.total}
                                                </p>

                                                <p className="mt-1.5 text-[9px] text-muted-foreground">
                                                    Categories ready for product assignment
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-semibold tabular-nums text-emerald-400">
                                            {activePercentage}%
                                        </p>

                                        <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                                            Available
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center justify-between gap-3 text-[9px] font-medium">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                            <span className="size-1.5 rounded-full bg-emerald-400" />
                                            {summary.active} active
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-red-400">
                                            {summary.inactive} inactive
                                            <span className="size-1.5 rounded-full bg-red-400" />
                                        </span>
                                    </div>

                                    <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-emerald-400 transition-all duration-500"
                                            style={{
                                                width: `${activePercentage}%`,
                                            }}
                                        />

                                        <div
                                            className="h-full bg-red-400 transition-all duration-500"
                                            style={{
                                                width: `${inactivePercentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={cn(
                                                'inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                                                summary.total === 0
                                                    ? 'bg-slate-500/10 text-slate-400'
                                                    : summary.inactive === 0
                                                      ? 'bg-emerald-500/10 text-emerald-400'
                                                      : 'bg-amber-500/10 text-amber-400',
                                            )}
                                        >
                                            {summary.total === 0 ? (
                                                <Tags className="size-3.5" />
                                            ) : summary.inactive === 0 ? (
                                                <CheckCircle2 className="size-3.5" />
                                            ) : (
                                                <XCircle className="size-3.5" />
                                            )}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="text-[10px] font-semibold text-foreground/85">
                                                {summary.total === 0
                                                    ? 'Create the first catalog group'
                                                    : summary.inactive === 0
                                                      ? 'All category groups are available'
                                                      : 'Catalog availability needs review'}
                                            </p>

                                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                {summary.total === 0
                                                    ? 'Root categories establish the main product organization.'
                                                    : summary.inactive === 0
                                                      ? 'Products can use every registered category.'
                                                      : `${summary.inactive} inactive categor${
                                                            summary.inactive === 1
                                                                ? 'y is'
                                                                : 'ies are'
                                                        } unavailable for assignment.`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Structure snapshots and distribution */}

                        <div className="min-w-0">
                            <div className="grid min-w-0 sm:grid-cols-3">
                                <CategorySnapshot
                                    title="Total Categories"
                                    onClick={() => openCatalogDrawer('all')}
                                    value={summary.total}
                                    description="Registered catalog groups"
                                    icon={Tags}
                                    tone="emerald"
                                    className="border-b border-border/60 sm:border-r"
                                />

                                <CategorySnapshot
                                    title="Root Groups"
                                    onClick={() => openCatalogDrawer('root')}
                                    value={summary.root}
                                    description="Top-level categories"
                                    icon={FolderTree}
                                    tone="teal"
                                    className="border-b border-border/60 sm:border-r"
                                />

                                <CategorySnapshot
                                    title="Subcategories"
                                    onClick={() => openCatalogDrawer('nested')}
                                    value={nestedCategories}
                                    description="Nested catalog groups"
                                    icon={Layers3}
                                    tone="lime"
                                    className="border-b border-border/60"
                                />
                            </div>

                            <div className="grid min-w-0 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => openCatalogDrawer('root')}
                                    className="border-b border-border/60 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 md:border-b-0 md:border-r"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                                Structure distribution
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                Root groups versus nested categories
                                            </p>
                                        </div>

                                        <span className="text-sm font-semibold tabular-nums text-primary">
                                            {summary.root}/{summary.total}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{
                                                width: `${rootPercentage}%`,
                                            }}
                                        />

                                        <div
                                            className="h-full bg-primary/45 transition-all duration-500"
                                            style={{
                                                width: `${nestedPercentage}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px]">
                                        <span className="inline-flex items-center gap-1.5 text-primary">
                                            <span className="size-1.5 rounded-full bg-primary" />
                                            {summary.root} root
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-primary/70">
                                            <span className="size-1.5 rounded-full bg-primary/45" />
                                            {nestedCategories} nested
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openCatalogDrawer('nested')}
                                    className="p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                                Hierarchy readiness
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                Catalog organization at a glance
                                            </p>
                                        </div>

                                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                                            <FolderTree className="size-4" />
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-primary/10 bg-primary/[0.035] px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Layers3 className="size-4" />
                                            </span>

                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold text-foreground/85">
                                                    {summary.total === 0
                                                        ? 'No category hierarchy yet'
                                                        : nestedCategories === 0
                                                          ? 'Flat catalog structure'
                                                          : 'Nested catalog structure active'}
                                                </p>

                                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                    {summary.total === 0
                                                        ? 'Add a root category to begin organizing products.'
                                                        : nestedCategories === 0
                                                          ? 'All categories currently sit at the root level.'
                                                          : `${nestedCategories} subcategor${
                                                                nestedCategories === 1
                                                                    ? 'y is'
                                                                    : 'ies are'
                                                            } grouped under parent categories.`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category directory */}

                <SectionCard
                    title="Category Directory"
                    description="Select any category row to open its hierarchy, usage, availability, and catalog record."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-primary/15 bg-primary/[0.06] px-2.5 text-[10px] font-medium text-primary"
                            >
                                <Tags className="mr-1 size-3" />
                                {categories.total}{' '}
                                categor{categories.total === 1
                                    ? 'y'
                                    : 'ies'}
                            </Badge>

                            <Button
                                type="button"
                                onClick={openCreateDialog}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Add Category
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={(event) => event.preventDefault()}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_230px_170px]"
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
                            placeholder="Search category name, slug, or description..."
                            className="sm:col-span-2 xl:col-span-1"
                        />

                        <Select
                            value={
                                parentFilter ||
                                ALL_VALUE
                            }
                            onValueChange={(value) =>
                                setParentFilter(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All category levels" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={ALL_VALUE}
                                >
                                    All category levels
                                </SelectItem>

                                <SelectItem
                                    value={ROOT_VALUE}
                                >
                                    Root categories only
                                </SelectItem>

                                {parentCategories.map(
                                    (category) => (
                                        <SelectItem
                                            key={
                                                category.id
                                            }
                                            value={String(
                                                category.id,
                                            )}
                                        >
                                            Children of{' '}
                                            {category.name}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                status || ALL_VALUE
                            }
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
                                <SelectItem
                                    value={ALL_VALUE}
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

                    <CategoryDirectoryTable
                        categories={categories.data}
                        onSelect={openDetailsDrawer}
                        onCreate={openCreateDialog}
                    />

                    <AppPagination
                        pagination={categories}
                        itemLabel="categories"
                    />
                </SectionCard>
            </PageContainer>

            <CategoryCatalogDrawer
                view={catalogDrawerView}
                pagination={categories}
                summary={summary}
                onClose={closeCatalogDrawer}
                onSelect={(category) => {
                    closeCatalogDrawer();
                    openDetailsDrawer(category);
                }}
            />

            <CategoryDetailsDrawer
                category={detailsCategory}
                statusProcessingId={statusProcessingId}
                onClose={closeDetailsDrawer}
                onEdit={(category) => {
                    closeDetailsDrawer();
                    openEditDialog(category);
                }}
                onToggleStatus={(category) => {
                    closeDetailsDrawer();
                    toggleStatus(category);
                }}
                onDelete={(category) => {
                    closeDetailsDrawer();
                    requestDelete(category);
                }}
            />

            {/* Create and edit form */}

            <FormDialog
                open={isDialogOpen}
                onOpenChange={
                    handleDialogOpenChange
                }
                title={
                    editingCategory
                        ? 'Edit Category'
                        : 'Add Category'
                }
                description={
                    editingCategory
                        ? `Update the catalog structure and availability for ${editingCategory.name}.`
                        : 'Create a root category or place a new category under an existing catalog group.'
                }
                onSubmit={submitCategory}
                processing={form.processing}
                submitText={
                    editingCategory
                        ? 'Save Changes'
                        : 'Create Category'
                }
                processingText={
                    editingCategory
                        ? 'Saving Changes...'
                        : 'Creating Category...'
                }
                maxWidth="max-w-2xl"
            >
                <FormSection
                    title="Catalog Placement"
                    description="Choose where this category belongs and control its display priority."
                    icon={<FolderTree />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="parent_id"
                            label="Parent Category"
                            description="Leave this as root when it is a main catalog group."
                            error={
                                form.errors.parent_id
                            }
                        >
                            <Select
                                value={
                                    form.data
                                        .parent_id ||
                                    ROOT_VALUE
                                }
                                disabled={
                                    form.processing
                                }
                                onValueChange={(value) =>
                                    form.setData(
                                        'parent_id',
                                        value ===
                                            ROOT_VALUE
                                            ? ''
                                            : value,
                                    )
                                }
                            >
                                <SelectTrigger id="parent_id">
                                    <SelectValue placeholder="Select a parent category" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem
                                        value={
                                            ROOT_VALUE
                                        }
                                    >
                                        No parent — root category
                                    </SelectItem>

                                    {availableParentCategories.map(
                                        (category) => (
                                            <SelectItem
                                                key={
                                                    category.id
                                                }
                                                value={String(
                                                    category.id,
                                                )}
                                            >
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
                            id="sort_order"
                            label="Display Order"
                            description="Lower numbers appear first."
                            error={
                                form.errors
                                    .sort_order
                            }
                            required
                        >
                            <Input
                                id="sort_order"
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    form.data
                                        .sort_order
                                }
                                disabled={
                                    form.processing
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'sort_order',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="0"
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormSection
                    title="Category Identity"
                    description="Enter the name and optional internal description for this catalog group."
                    icon={<Tags />}
                >
                    <FormField
                        id="name"
                        label="Category Name"
                        error={form.errors.name}
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
                                    event.target.value,
                                )
                            }
                            placeholder="Beverages"
                            autoComplete="off"
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        id="description"
                        label="Description"
                        description="Optional description used to explain the purpose of this category."
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
                            disabled={
                                form.processing
                            }
                            onChange={(event) =>
                                form.setData(
                                    'description',
                                    event.target.value,
                                )
                            }
                            placeholder="Optional category description"
                            className="resize-none"
                        />
                    </FormField>
                </FormSection>

                <FormSection
                    title="Catalog Availability"
                    description="Control whether products may use this category."
                    icon={<CheckCircle2 />}
                >
                    <BooleanField
                        id="is_active"
                        checked={
                            form.data.is_active
                        }
                        disabled={
                            form.processing
                        }
                        onCheckedChange={(
                            checked,
                        ) =>
                            form.setData(
                                'is_active',
                                checked,
                            )
                        }
                        label="Active Category"
                        description="Active categories are available when assigning or updating products."
                        error={
                            form.errors.is_active
                        }
                        className="border-primary/15 bg-primary/[0.035]"
                    />
                </FormSection>
            </FormDialog>

            {/* Delete confirmation */}

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (
                        !open &&
                        !deleteProcessing
                    ) {
                        setDeleteTarget(null);
                    }
                }}
                title="Delete Category"
                description={
                    deleteHasRelations
                        ? `"${deleteTarget?.name}" has linked products or subcategories. The system may prevent deletion until those records are reassigned.`
                        : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
                }
                confirmText="Delete Category"
                processing={deleteProcessing}
                destructive
                onConfirm={deleteCategory}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Local presentation helpers
|--------------------------------------------------------------------------
*/


function CategoryDirectoryTable({
    categories,
    onSelect,
    onCreate,
}: {
    categories: Category[];
    onSelect: (category: Category) => void;
    onCreate: () => void;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] table-fixed border-collapse">
                    <thead className="border-b border-primary/10 bg-primary/[0.025]">
                        <tr>
                            <th className="w-[290px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Category
                            </th>
                            <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Hierarchy
                            </th>
                            <th className="w-[185px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Catalog Usage
                            </th>
                            <th className="w-[120px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Order
                            </th>
                            <th className="w-[125px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border/60">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14">
                                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                        <span className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.045] text-primary">
                                            <Tags className="size-5" />
                                        </span>
                                        <h3 className="mt-3 text-sm font-semibold text-foreground">
                                            No categories found
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Adjust the filters or create the first category in the product catalog.
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={onCreate}
                                            className="mt-4 h-9 rounded-lg px-4 text-xs"
                                        >
                                            <Plus className="size-4" />
                                            Add Category
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr
                                    key={category.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View details for ${category.name}`}
                                    onClick={() => onSelect(category)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' ||
                                            event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            onSelect(category);
                                        }
                                    }}
                                    className="group cursor-pointer bg-card/55 transition-colors hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                                >
                                    <td className="px-4 py-2.5">
                                        <EntityInfo
                                            avatar={
                                                <EntityAvatar
                                                    icon={category.parent_id ? Folder : FolderTree}
                                                    className="border-primary/15 bg-primary/[0.07] text-primary transition-colors group-hover:border-primary/25 group-hover:bg-primary/10"
                                                />
                                            }
                                            title={category.name}
                                            subtitle={
                                                <span className="font-mono text-[10px]">
                                                    {category.slug}
                                                </span>
                                            }
                                        />
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <div className="min-w-0">
                                            <p className="truncate text-[11px] font-semibold text-foreground/90">
                                                {category.parent?.name ?? 'Root category'}
                                            </p>
                                            <p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">
                                                {category.parent
                                                    ? `${category.parent.slug} / ${category.slug}`
                                                    : 'Top-level catalog group'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <CategoryUsageCompact
                                            products={category.products_count}
                                            children={category.children_count}
                                        />
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <Badge
                                            variant="outline"
                                            className="h-6 rounded-full border-border/70 bg-muted/25 px-2.5 font-mono text-[10px] font-semibold text-foreground"
                                        >
                                            #{category.sort_order}
                                        </Badge>
                                    </td>

                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            <StatusBadge
                                                label={category.is_active ? 'Active' : 'Inactive'}
                                                variant={category.is_active ? 'success' : 'danger'}
                                            />
                                            <Badge
                                                variant="outline"
                                                className="h-5 rounded-full border-primary/15 bg-primary/[0.055] px-1.5 text-[8px] text-primary/80"
                                            >
                                                {category.parent_id ? 'Child' : 'Root'}
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

function CategoryUsageCompact({
    products,
    children,
}: {
    products: number;
    children: number;
}) {
    return (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Badge
                variant="outline"
                className="h-5 border-primary/15 bg-primary/[0.045] px-1.5 text-[8px] text-primary"
            >
                <Package2 className="mr-1 size-2.5" />
                {products} product{products === 1 ? '' : 's'}
            </Badge>
            <Badge
                variant="outline"
                className="h-5 border-primary/10 bg-primary/[0.025] px-1.5 text-[8px] text-primary/75"
            >
                <Layers3 className="mr-1 size-2.5" />
                {children} child{children === 1 ? '' : 'ren'}
            </Badge>
        </div>
    );
}

function CategoryCatalogDrawer({
    view,
    pagination,
    summary,
    onClose,
    onSelect,
}: {
    view: CategoryDrawerView | null;
    pagination: PaginatedCategories;
    summary: CategorySummary;
    onClose: () => void;
    onSelect: (category: Category) => void;
}) {
    const [drawerSearch, setDrawerSearch] = useState('');

    useEffect(() => {
        setDrawerSearch('');
    }, [view]);

    const activeView = view ?? 'all';

    const configs: Record<
        CategoryDrawerView,
        {
            title: string;
            eyebrow: string;
            description: string;
            total: number;
            emptyLabel: string;
        }
    > = {
        all: {
            title: 'Registered Categories',
            eyebrow: 'Complete catalog structure',
            description:
                'Review category records loaded on the current page and open any row for its complete hierarchy and usage details.',
            total: summary.total,
            emptyLabel: 'No category records are loaded on this page.',
        },
        active: {
            title: 'Active Categories',
            eyebrow: 'Available for assignment',
            description:
                'Active categories can be assigned to products and used throughout inventory catalog operations.',
            total: summary.active,
            emptyLabel: 'No active categories are loaded on this page.',
        },
        inactive: {
            title: 'Inactive Categories',
            eyebrow: 'Needs catalog review',
            description:
                'Inactive categories remain in history but are unavailable for new product assignment.',
            total: summary.inactive,
            emptyLabel: 'No inactive categories are loaded on this page.',
        },
        root: {
            title: 'Root Category Groups',
            eyebrow: 'Top-level hierarchy',
            description:
                'Root groups establish the primary product organization and may contain nested categories.',
            total: summary.root,
            emptyLabel: 'No root categories are loaded on this page.',
        },
        nested: {
            title: 'Subcategories',
            eyebrow: 'Nested hierarchy',
            description:
                'Subcategories inherit a parent group and provide more specific product organization.',
            total: Math.max(0, summary.total - summary.root),
            emptyLabel: 'No subcategories are loaded on this page.',
        },
    };

    const config = configs[activeView];

    const matchingCategories = pagination.data.filter((category) => {
        if (activeView === 'active') {
            return category.is_active;
        }
        if (activeView === 'inactive') {
            return !category.is_active;
        }
        if (activeView === 'root') {
            return category.parent_id === null;
        }
        if (activeView === 'nested') {
            return category.parent_id !== null;
        }
        return true;
    });

    const normalizedSearch = drawerSearch.trim().toLowerCase();

    const visibleCategories = normalizedSearch
        ? matchingCategories.filter((category) =>
              [
                  category.name,
                  category.slug,
                  category.description,
                  category.parent?.name,
                  category.parent?.slug,
              ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(normalizedSearch),
          )
        : matchingCategories;

    const loadedRange =
        pagination.from !== null && pagination.to !== null
            ? `${pagination.from}-${pagination.to}`
            : '0';

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
            <div className="flex min-h-full flex-col bg-card">
                <div className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                        {config.eyebrow}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-3xl font-semibold leading-none tabular-nums text-primary">
                                {config.total}
                            </p>
                            <p className="mt-1 text-[9px] text-muted-foreground">
                                Total matching catalog records
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="h-7 rounded-full border-primary/15 bg-primary/[0.055] px-2.5 text-[9px] text-primary"
                        >
                            Loaded {loadedRange}
                        </Badge>
                    </div>
                </div>

                <div className="border-b border-border/60 p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={drawerSearch}
                            onChange={(event) => setDrawerSearch(event.target.value)}
                            placeholder="Search loaded categories..."
                            className="h-10 pl-9 text-sm"
                        />
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {visibleCategories.length === 0 ? (
                        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center">
                            <Tags className="size-6 text-muted-foreground" />
                            <p className="mt-3 text-sm font-semibold">
                                No loaded matches
                            </p>
                            <p className="mt-1 max-w-sm text-[10px] leading-5 text-muted-foreground">
                                {config.emptyLabel}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {visibleCategories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => onSelect(category)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/25 p-3 text-left transition hover:border-primary/20 hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.07] text-primary">
                                        {category.parent_id ? (
                                            <Folder className="size-4" />
                                        ) : (
                                            <FolderTree className="size-4" />
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="truncate text-[11px] font-semibold">
                                                {category.name}
                                            </p>
                                            <StatusBadge
                                                label={category.is_active ? 'Active' : 'Inactive'}
                                                variant={category.is_active ? 'success' : 'danger'}
                                            />
                                        </div>
                                        <p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">
                                            {category.parent
                                                ? `${category.parent.name} / ${category.slug}`
                                                : category.slug}
                                        </p>
                                        <p className="mt-1 text-[8px] text-muted-foreground">
                                            {category.products_count} products · {category.children_count} children
                                        </p>
                                    </div>
                                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppDrawer>
    );
}

function CategoryDetailsDrawer({
    category,
    statusProcessingId,
    onClose,
    onEdit,
    onToggleStatus,
    onDelete,
}: {
    category: Category | null;
    statusProcessingId: number | null;
    onClose: () => void;
    onEdit: (category: Category) => void;
    onToggleStatus: (category: Category) => void;
    onDelete: (category: Category) => void;
}) {
    return (
        <AppDrawer
            open={category !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title="Category Record"
            description="Review catalog identity, hierarchy, usage, ordering, and availability."
            processing={false}
        >
            {category && (
                <div className="flex min-h-full flex-col bg-card">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <section className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
                            <div className="flex items-start gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                    {category.parent_id ? (
                                        <Folder className="size-5" />
                                    ) : (
                                        <FolderTree className="size-5" />
                                    )}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                                            Inventory category
                                        </p>
                                        <StatusBadge
                                            label={category.is_active ? 'Active' : 'Inactive'}
                                            variant={category.is_active ? 'success' : 'danger'}
                                        />
                                        <Badge
                                            variant="outline"
                                            className="h-5 rounded-full border-primary/15 bg-primary/[0.055] px-2 text-[8px] text-primary/80"
                                        >
                                            {category.parent_id ? 'CHILD' : 'ROOT'}
                                        </Badge>
                                    </div>
                                    <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-foreground">
                                        {category.name}
                                    </h2>
                                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                                        {category.slug}
                                    </p>
                                    <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                                        {category.description ??
                                            'No internal category description was provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 border-y border-border/60">
                                <CategoryDetailStat
                                    label="Products"
                                    value={category.products_count}
                                    helper="Assigned records"
                                    className="border-r border-border/60"
                                />
                                <CategoryDetailStat
                                    label="Children"
                                    value={category.children_count}
                                    helper="Nested groups"
                                    className="border-r border-border/60"
                                />
                                <CategoryDetailStat
                                    label="Order"
                                    value={category.sort_order}
                                    helper="Display priority"
                                />
                            </div>
                        </section>

                        <div className="space-y-5 p-5">
                            <CategoryDetailSection
                                title="Catalog hierarchy"
                                description="Parent relationship and complete category path."
                                icon={FolderTree}
                            >
                                <dl className="divide-y divide-border/60">
                                    <CategoryDetailRow
                                        label="Category level"
                                        value={category.parent_id ? 'Subcategory' : 'Root category'}
                                    />
                                    <CategoryDetailRow
                                        label="Parent category"
                                        value={category.parent?.name ?? 'No parent'}
                                    />
                                    <CategoryDetailRow
                                        label="Catalog path"
                                        value={
                                            category.parent
                                                ? `${category.parent.slug} / ${category.slug}`
                                                : category.slug
                                        }
                                        mono
                                    />
                                </dl>
                            </CategoryDetailSection>

                            <CategoryDetailSection
                                title="Catalog usage"
                                description="Linked products and direct subcategory records."
                                icon={Package2}
                            >
                                <div className="grid grid-cols-2 gap-3 p-4">
                                    <div className="rounded-xl border border-primary/15 bg-primary/[0.045] p-3">
                                        <p className="text-2xl font-semibold tabular-nums text-primary">
                                            {category.products_count}
                                        </p>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            Products assigned
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-primary/10 bg-primary/[0.025] p-3">
                                        <p className="text-2xl font-semibold tabular-nums text-primary/80">
                                            {category.children_count}
                                        </p>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            Direct child groups
                                        </p>
                                    </div>
                                </div>
                            </CategoryDetailSection>

                            <CategoryDetailSection
                                title="Record activity"
                                description="Creation and latest update timestamps."
                                icon={CalendarDays}
                            >
                                <dl className="divide-y divide-border/60">
                                    <CategoryDetailRow
                                        label="Created"
                                        value={formatCategoryDate(category.created_at)}
                                    />
                                    <CategoryDetailRow
                                        label="Last updated"
                                        value={formatCategoryDate(category.updated_at)}
                                    />
                                    <CategoryDetailRow
                                        label="Availability"
                                        value={
                                            category.is_active
                                                ? 'Available for product assignment'
                                                : 'Unavailable for new assignment'
                                        }
                                    />
                                </dl>
                            </CategoryDetailSection>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/70 bg-background/35 px-5 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onEdit(category)}
                            className="h-9 rounded-lg px-3 text-xs"
                        >
                            <Pencil className="size-3.5" />
                            Edit
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={statusProcessingId === category.id}
                            onClick={() => onToggleStatus(category)}
                            className="h-9 rounded-lg px-3 text-xs"
                        >
                            {category.is_active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onDelete(category)}
                            className="h-9 rounded-lg border-red-500/20 px-3 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                            <Trash2 className="size-3.5" />
                            Delete
                        </Button>
                    </div>
                </div>
            )}
        </AppDrawer>
    );
}

function CategoryDetailStat({
    label,
    value,
    helper,
    className,
}: {
    label: string;
    value: number;
    helper: string;
    className?: string;
}) {
    return (
        <div className={cn('min-w-0 px-3 py-3', className)}>
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-1.5 text-lg font-semibold tabular-nums text-primary">
                {value}
            </p>
            <p className="mt-1 truncate text-[8px] text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}

function CategoryDetailSection({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
            <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06] text-primary">
                    <Icon className="size-4" />
                </span>
                <div>
                    <h3 className="text-[11px] font-semibold">{title}</h3>
                    <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

function CategoryDetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 px-4 py-3 text-[10px]">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
                className={cn(
                    'max-w-[240px] text-right font-medium text-foreground/85',
                    mono && 'font-mono',
                )}
            >
                {value}
            </dd>
        </div>
    );
}

function formatCategoryDate(value: string | null): string {
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

function CategorySnapshot({
    title,
    value,
    description,
    icon: Icon,
    tone,
    className,
    onClick,
}: {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: CategoryMetricTone;
    className?: string;
    onClick: () => void;
}) {
    const toneStyles: Record<
        CategoryMetricTone,
        {
            icon: string;
            value: string;
            glow: string;
        }
    > = {
        emerald: {
            icon: 'border-primary/20 bg-primary/10 text-primary',
            value: 'text-primary',
            glow: 'bg-primary/10',
        },
        lime: {
            icon: 'border-primary/15 bg-primary/[0.05] text-primary/70',
            value: 'text-primary/70',
            glow: 'bg-primary/[0.05]',
        },
        teal: {
            icon: 'border-primary/15 bg-primary/[0.075] text-primary/85',
            value: 'text-primary/85',
            glow: 'bg-primary/[0.075]',
        },
    };

    const styles = toneStyles[tone];

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group relative min-w-0 overflow-hidden px-4 py-3.5 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute -right-10 -top-10 size-24 rounded-full blur-2xl',
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

                    <p className="mt-1.5 truncate text-[9px] text-muted-foreground">
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
        </button>
    );
}