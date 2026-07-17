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
import { FormSection } from '@/components/shared/form-section';
import { IconButton } from '@/components/shared/icon-button';
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
    CheckCircle2,
    CircleGauge,
    Folder,
    FolderTree,
    Layers3,
    Package2,
    Pencil,
    Plus,
    RefreshCw,
    Tags,
    Trash2,
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

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/inventory/categories',
            {
                search:
                    search.trim() || undefined,
                status: status || undefined,
                parent_id:
                    parentFilter || undefined,
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
        setParentFilter('');

        router.get(
            '/inventory/categories',
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
    | Status and delete actions
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

    const hasActiveFilters = Boolean(
        search || status || parentFilter,
    );

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
    | Table columns
    |--------------------------------------------------------------------------
    */

    const categoryColumns: DataTableColumn<Category>[] =
        [
            {
                key: 'category',
                header: 'Category',
                className: 'min-w-[300px]',
                cell: (category) => (
                    <EntityInfo
                        avatar={
                            <EntityAvatar
                                icon={
                                    category.parent_id
                                        ? Folder
                                        : FolderTree
                                }
                                className={
                                    category.parent_id
                                        ? 'border-teal-500/15 bg-teal-500/10 text-teal-400 group-hover:border-teal-500/25 group-hover:bg-teal-500/15'
                                        : 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/25 group-hover:bg-emerald-500/15'
                                }
                            />
                        }
                        title={category.name}
                        badges={
                            <Badge
                                variant="outline"
                                className={cn(
                                    'h-5 rounded-full px-2 text-[9px] font-semibold',
                                    category.parent_id
                                        ? 'border-teal-500/15 bg-teal-500/[0.06] text-teal-400'
                                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
                                )}
                            >
                                {category.parent_id
                                    ? 'CHILD'
                                    : 'ROOT'}
                            </Badge>
                        }
                        subtitle={
                            <>
                                Slug:{' '}
                                <span className="font-mono font-semibold text-foreground/75">
                                    {category.slug}
                                </span>
                            </>
                        }
                        description={
                            category.description ??
                            'No category description'
                        }
                    />
                ),
            },
            {
                key: 'hierarchy',
                header: 'Catalog Hierarchy',
                className: 'min-w-[230px]',
                cell: (category) =>
                    category.parent ? (
                        <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/15 bg-teal-500/10 text-teal-400">
                                <Layers3 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                    Nested under
                                </p>

                                <p className="mt-1 max-w-[175px] truncate text-[12px] font-semibold text-foreground/85">
                                    {category.parent.name}
                                </p>

                                <p className="mt-1 max-w-[175px] truncate font-mono text-[9px] text-teal-400/80">
                                    {category.parent.slug}
                                    {' / '}
                                    {category.slug}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                                <FolderTree className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                    Top-level group
                                </p>

                                <p className="mt-1 text-[12px] font-semibold text-foreground/85">
                                    Root category
                                </p>

                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    No parent assignment
                                </p>
                            </div>
                        </div>
                    ),
            },
            {
                key: 'catalog-usage',
                header: 'Catalog Usage',
                className: 'min-w-[190px]',
                cell: (category) => (
                    <CategoryUsage
                        products={
                            category.products_count
                        }
                        children={
                            category.children_count
                        }
                    />
                ),
            },
            {
                key: 'sort-order',
                header: 'Display Order',
                className: 'min-w-[120px]',
                cell: (category) => (
                    <div className="space-y-1.5">
                        <Badge
                            variant="outline"
                            className="h-7 min-w-10 justify-center rounded-full border-border/70 bg-muted/25 px-2.5 font-mono text-[11px] font-semibold text-foreground"
                        >
                            #{category.sort_order}
                        </Badge>

                        <p className="text-[9px] text-muted-foreground">
                            Lower displays first
                        </p>
                    </div>
                ),
            },
            {
                key: 'status',
                header: 'Availability',
                className: 'min-w-[120px]',
                cell: (category) => (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={
                            statusProcessingId ===
                            category.id
                        }
                        onClick={() =>
                            toggleStatus(category)
                        }
                        className="h-auto rounded-full p-0 disabled:opacity-60"
                    >
                        <StatusBadge
                            label={
                                category.is_active
                                    ? 'Active'
                                    : 'Inactive'
                            }
                            variant={
                                category.is_active
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
                headerClassName: 'text-right',
                className: 'text-right',
                cell: (category) => (
                    <ActionGroup>
                        <IconButton
                            label="Edit category"
                            onClick={() =>
                                openEditDialog(
                                    category,
                                )
                            }
                            className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                        >
                            <Pencil className="size-3.5" />
                        </IconButton>

                        <IconButton
                            label={
                                category.products_count >
                                    0 ||
                                category.children_count >
                                    0
                                    ? 'Category has linked records'
                                    : 'Delete category'
                            }
                            variant="ghost"
                            onClick={() =>
                                requestDelete(
                                    category,
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

                <section className="min-w-0 overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.075] via-card/70 to-card/40">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
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

                        <div className="relative overflow-hidden border-b border-border/60 p-4 xl:border-b-0 xl:border-r md:p-5">
                            <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-emerald-500/10 blur-3xl" />
                            <FolderTree className="pointer-events-none absolute -bottom-8 -right-5 size-32 text-emerald-400 opacity-[0.022]" />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-emerald-300">
                                            Active catalog coverage
                                        </p>

                                        <div className="mt-3 flex items-center gap-3">
                                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
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
                        </div>

                        {/* Structure snapshots and distribution */}

                        <div className="min-w-0">
                            <div className="grid min-w-0 sm:grid-cols-3">
                                <CategorySnapshot
                                    title="Total Categories"
                                    value={summary.total}
                                    description="Registered catalog groups"
                                    icon={Tags}
                                    tone="emerald"
                                    className="border-b border-border/60 sm:border-r"
                                />

                                <CategorySnapshot
                                    title="Root Groups"
                                    value={summary.root}
                                    description="Top-level categories"
                                    icon={FolderTree}
                                    tone="teal"
                                    className="border-b border-border/60 sm:border-r"
                                />

                                <CategorySnapshot
                                    title="Subcategories"
                                    value={nestedCategories}
                                    description="Nested catalog groups"
                                    icon={Layers3}
                                    tone="lime"
                                    className="border-b border-border/60"
                                />
                            </div>

                            <div className="grid min-w-0 md:grid-cols-2">
                                <div className="border-b border-border/60 p-4 md:border-b-0 md:border-r">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                                Structure distribution
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                Root groups versus nested categories
                                            </p>
                                        </div>

                                        <span className="text-sm font-semibold tabular-nums text-teal-400">
                                            {summary.root}/{summary.total}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-teal-400 transition-all duration-500"
                                            style={{
                                                width: `${rootPercentage}%`,
                                            }}
                                        />

                                        <div
                                            className="h-full bg-lime-400 transition-all duration-500"
                                            style={{
                                                width: `${nestedPercentage}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px]">
                                        <span className="inline-flex items-center gap-1.5 text-teal-400">
                                            <span className="size-1.5 rounded-full bg-teal-400" />
                                            {summary.root} root
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-lime-400">
                                            <span className="size-1.5 rounded-full bg-lime-400" />
                                            {nestedCategories} nested
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                                Hierarchy readiness
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                Catalog organization at a glance
                                            </p>
                                        </div>

                                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                                            <FolderTree className="size-4" />
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.035] px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category directory */}

                <SectionCard
                    title="Category Directory"
                    description="Manage catalog groups, parent relationships, product usage, display order, and availability."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 text-[10px] font-medium text-emerald-300"
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
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_230px_170px]"
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

                    <DataTable
                        data={categories.data}
                        columns={categoryColumns}
                        getRowKey={(category) =>
                            category.id
                        }
                        emptyIcon={Tags}
                        emptyTitle="No categories found"
                        emptyDescription="Adjust the current filters or create the first category in your product catalog."
                        emptyAction={
                            <Button
                                type="button"
                                onClick={openCreateDialog}
                            >
                                <Plus className="size-4" />
                                Add Category
                            </Button>
                        }
                        minWidth="1060px"
                    />

                    <AppPagination
                        pagination={categories}
                        itemLabel="categories"
                    />
                </SectionCard>
            </PageContainer>

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
                        className="border-emerald-500/15 bg-emerald-500/[0.035]"
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

function CategorySnapshot({
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
    tone: CategoryMetricTone;
    className?: string;
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
    };

    const styles = toneStyles[tone];

    return (
        <div
            className={cn(
                'group relative min-w-0 overflow-hidden px-4 py-3.5 transition-colors hover:bg-muted/[0.025]',
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
        </div>
    );
}

function CategoryUsage({
    products,
    children,
}: {
    products: number;
    children: number;
}) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0 rounded-lg border border-amber-500/15 bg-amber-500/[0.045] px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                    <Package2 className="size-3 text-amber-400" />

                    <span className="text-[12px] font-semibold tabular-nums text-foreground">
                        {products}
                    </span>
                </div>

                <p className="mt-1 truncate text-[8px] text-muted-foreground">
                    Products
                </p>
            </div>

            <div className="min-w-0 rounded-lg border border-teal-500/15 bg-teal-500/[0.045] px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                    <Layers3 className="size-3 text-teal-400" />

                    <span className="text-[12px] font-semibold tabular-nums text-foreground">
                        {children}
                    </span>
                </div>

                <p className="mt-1 truncate text-[8px] text-muted-foreground">
                    Children
                </p>
            </div>
        </div>
    );
}