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
    CheckCircle2,
    Folder,
    FolderTree,
    Layers3,
    Package2,
    Pencil,
    Plus,
    Tags,
    Trash2,
    XCircle,
} from 'lucide-react';
import {
    type FormEvent,
    useEffect,
    useState,
} from 'react';

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

    const availableParentCategories =
        parentCategories.filter(
            (category) =>
                category.id !==
                editingCategory?.id,
        );

    const categoryColumns: DataTableColumn<Category>[] =
        [
            {
                key: 'category',
                header: 'Category',
                className: 'min-w-[290px]',
                cell: (category) => (
                    <EntityInfo
                        avatar={
                            <EntityAvatar
                                icon={
                                    category.parent_id
                                        ? Folder
                                        : FolderTree
                                }
                            />
                        }
                        title={category.name}
                        badges={
                            !category.parent_id ? (
                                <Badge
                                    variant="outline"
                                    className="h-5 rounded-full border-blue-500/20 bg-blue-500/10 px-2 text-[9px] font-semibold text-blue-400"
                                >
                                    ROOT
                                </Badge>
                            ) : undefined
                        }
                        subtitle={
                            <>
                                Slug:{' '}
                                <span className="font-medium text-foreground/70">
                                    {category.slug}
                                </span>
                            </>
                        }
                        description={
                            category.description ??
                            undefined
                        }
                    />
                ),
            },
            {
                key: 'parent',
                header: 'Parent Category',
                className: 'min-w-[170px]',
                cell: (category) =>
                    category.parent ? (
                        <div className="flex items-center gap-2 text-[13px]">
                            <Folder className="size-3.5 shrink-0 text-muted-foreground" />

                            <span className="truncate">
                                {
                                    category
                                        .parent
                                        .name
                                }
                            </span>
                        </div>
                    ) : (
                        <span className="text-[13px] text-muted-foreground">
                            No parent
                        </span>
                    ),
            },
            {
                key: 'products',
                header: 'Products',
                cell: (category) => (
                    <Badge
                        variant="outline"
                        className="h-7 gap-1.5 rounded-full border-amber-500/15 bg-amber-500/10 px-2.5 text-[10px] font-medium text-amber-300"
                    >
                        <span className="inline-flex size-4 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                            <Package2 className="size-2.5" />
                        </span>
                        {category.products_count}
                    </Badge>
                ),
            },
            {
                key: 'subcategories',
                header: 'Subcategories',
                cell: (category) => (
                    <Badge
                        variant="outline"
                        className="h-7 gap-1.5 rounded-full border-violet-500/15 bg-violet-500/10 px-2.5 text-[10px] font-medium text-violet-300"
                    >
                        <span className="inline-flex size-4 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
                            <Layers3 className="size-2.5" />
                        </span>
                        {category.children_count}
                    </Badge>
                ),
            },
            {
                key: 'sort-order',
                header: 'Sort Order',
                cell: (category) => (
                    <Badge
                        variant="outline"
                        className="h-6 min-w-8 justify-center rounded-full border-border/70 bg-muted/30 px-2 text-[10px] font-medium text-foreground"
                    >
                        {category.sort_order}
                    </Badge>
                ),
            },
            {
                key: 'status',
                header: 'Status',
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
                            toggleStatus(
                                category,
                            )
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
                                    : 'neutral'
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
                cell: (category) => (
                    <ActionGroup>
                        <IconButton
                            label="Edit category"
                            onClick={() =>
                                openEditDialog(
                                    category,
                                )
                            }
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

    const deleteHasRelations =
        Boolean(
            deleteTarget &&
                (deleteTarget.products_count > 0 ||
                    deleteTarget.children_count >
                        0),
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <PageContainer>
                <PageHeader
                    eyebrow="Inventory Management"
                    title="Categories"
                    description="Organize products using main categories and subcategories."
                    actions={
                        <Button
                            type="button"
                            onClick={
                                openCreateDialog
                            }
                            className="h-10 rounded-xl px-4 text-sm"
                        >
                            <Plus className="size-4" />
                            Add Category
                        </Button>
                    }
                />

                <StatsGrid>
                    <StatCard
                        title="Total Categories"
                        value={summary.total}
                        icon={<Tags />}
                        iconTone="blue"
                        description="All category records"
                    />

                    <StatCard
                        title="Active Categories"
                        value={summary.active}
                        icon={<CheckCircle2 />}
                        iconTone="emerald"
                        description="Available for products"
                    />

                    <StatCard
                        title="Root Categories"
                        value={summary.root}
                        icon={<FolderTree />}
                        iconTone="violet"
                        description="Main category groups"
                    />

                    <StatCard
                        title="Inactive Categories"
                        value={summary.inactive}
                        icon={<XCircle />}
                        iconTone="red"
                        description="Currently unavailable"
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
                            placeholder="Search category name, slug, or description..."
                            className="xl:min-w-[280px]"
                        />

                        <Select
                            value={
                                parentFilter ||
                                ALL_VALUE
                            }
                            onValueChange={(
                                value,
                            ) =>
                                setParentFilter(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm xl:w-[210px]">
                                <SelectValue placeholder="All category levels" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={
                                        ALL_VALUE
                                    }
                                >
                                    All category levels
                                </SelectItem>

                                <SelectItem
                                    value={
                                        ROOT_VALUE
                                    }
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
                                            Subcategories
                                            of{' '}
                                            {
                                                category.name
                                            }
                                        </SelectItem>
                                    ),
                                )}
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
                            <SelectTrigger className="h-10 w-full text-sm xl:w-[160px]">
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
                        data={categories.data}
                        columns={categoryColumns}
                        getRowKey={(category) =>
                            category.id
                        }
                        emptyIcon={Tags}
                        emptyTitle="No categories found"
                        emptyDescription="Try adjusting your filters or create your first product category."
                        emptyAction={
                            <Button
                                type="button"
                                onClick={
                                    openCreateDialog
                                }
                            >
                                <Plus />
                                Add Category
                            </Button>
                        }
                        minWidth="1020px"
                    />

                    <AppPagination
                        pagination={categories}
                        itemLabel="categories"
                    />
                </SectionCard>
            </PageContainer>

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
                        ? `Update the information for ${editingCategory.name}.`
                        : 'Enter the category information below.'
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
                <FormField
                    id="parent_id"
                    label="Parent Category"
                    description="Leave this as a root category when it does not belong under another category."
                    error={
                        form.errors.parent_id
                    }
                >
                    <Select
                        value={
                            form.data.parent_id ||
                            ROOT_VALUE
                        }
                        disabled={form.processing}
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
                                value={ROOT_VALUE}
                            >
                                No parent — root
                                category
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

                <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                        id="name"
                        label="Category Name"
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
                            placeholder="Beverages"
                            autoComplete="off"
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        id="sort_order"
                        label="Sort Order"
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

                <FormField
                    id="description"
                    label="Description"
                    description="Optional internal description for this category."
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
                        placeholder="Optional category description"
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
                    label="Active Category"
                    description="Active categories can be assigned to products."
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