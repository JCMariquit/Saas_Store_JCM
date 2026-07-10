import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Folder,
    FolderTree,
    Layers3,
    LoaderCircle,
    Package2,
    Pencil,
    Plus,
    Search,
    Tags,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
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

export default function CategoryIndex({
    categories,
    parentCategories,
    summary,
    filters,
}: CategoryPageProps) {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

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

    function resetAndCloseModal(): void {
        setIsModalOpen(false);
        setEditingCategory(null);

        form.clearErrors();

        form.setData({
            ...emptyCategoryForm,
        });
    }

    function closeModal(): void {
        if (form.processing) {
            return;
        }

        resetAndCloseModal();
    }

    function openCreateModal(): void {
        setEditingCategory(null);

        form.clearErrors();

        form.setData({
            ...emptyCategoryForm,
        });

        setIsModalOpen(true);
    }

    function openEditModal(category: Category): void {
        setEditingCategory(category);

        form.clearErrors();

        form.setData({
            parent_id: category.parent_id
                ? String(category.parent_id)
                : '',
            name: category.name,
            description: category.description ?? '',
            sort_order: String(category.sort_order),
            is_active: category.is_active,
        });

        setIsModalOpen(true);
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
                    onSuccess: resetAndCloseModal,
                },
            );

            return;
        }

        form.post('/inventory/categories', {
            preserveScroll: true,
            onSuccess: resetAndCloseModal,
        });
    }

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/inventory/categories',
            {
                search: search.trim() || undefined,
                status: status || undefined,
                parent_id: parentFilter || undefined,
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

    function toggleStatus(category: Category): void {
        router.patch(
            `/inventory/categories/${category.id}/status`,
            {
                is_active: !category.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function deleteCategory(category: Category): void {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/inventory/categories/${category.id}`,
            {
                preserveScroll: true,
            },
        );
    }

    const availableParentCategories =
        parentCategories.filter(
            (category) =>
                category.id !== editingCategory?.id,
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Management" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Inventory Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Categories
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Organize products using main
                            categories and subcategories.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                        <Plus className="size-4" />
                        Add Category
                    </button>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Categories"
                        value={summary.total}
                        icon={<Tags className="size-5" />}
                    />

                    <SummaryCard
                        title="Active Categories"
                        value={summary.active}
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Root Categories"
                        value={summary.root}
                        icon={
                            <FolderTree className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Inactive Categories"
                        value={summary.inactive}
                        icon={<XCircle className="size-5" />}
                    />
                </section>

                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
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
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search category name, slug, or description..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={parentFilter}
                            onChange={(event) =>
                                setParentFilter(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All category levels
                            </option>

                            <option value="root">
                                Root categories only
                            </option>

                            {parentCategories.map(
                                (category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        Subcategories of{' '}
                                        {category.name}
                                    </option>
                                ),
                            )}
                        </select>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value,
                                )
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
                            Apply Filters
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            Reset
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Category
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Parent Category
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Products
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Subcategories
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Sort Order
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
                                {categories.data.map(
                                    (category) => (
                                        <tr
                                            key={category.id}
                                            className="transition hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        {category.parent_id ? (
                                                            <Folder className="size-5" />
                                                        ) : (
                                                            <FolderTree className="size-5" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium">
                                                                {
                                                                    category.name
                                                                }
                                                            </p>

                                                            {!category.parent_id && (
                                                                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                                                    ROOT
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Slug:{' '}
                                                            {
                                                                category.slug
                                                            }
                                                        </p>

                                                        {category.description && (
                                                            <p className="mt-1 max-w-[280px] truncate text-xs text-muted-foreground">
                                                                {
                                                                    category.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {category.parent ? (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Folder className="size-4 text-muted-foreground" />

                                                        <span>
                                                            {
                                                                category
                                                                    .parent
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        No parent
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                                                    <Package2 className="size-4 text-muted-foreground" />

                                                    <span className="font-medium">
                                                        {
                                                            category.products_count
                                                        }
                                                    </span>
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                                                    <Layers3 className="size-4 text-muted-foreground" />

                                                    <span className="font-medium">
                                                        {
                                                            category.children_count
                                                        }
                                                    </span>
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex min-w-10 justify-center rounded-lg border px-2.5 py-1 text-sm font-medium">
                                                    {
                                                        category.sort_order
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleStatus(
                                                            category,
                                                        )
                                                    }
                                                    className={[
                                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                                                        category.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                                            : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
                                                    ].join(
                                                        ' ',
                                                    )}
                                                >
                                                    {category.is_active ? (
                                                        <CheckCircle2 className="size-3.5" />
                                                    ) : (
                                                        <XCircle className="size-3.5" />
                                                    )}

                                                    {category.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </button>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                category,
                                                            )
                                                        }
                                                        title="Edit category"
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteCategory(
                                                                category,
                                                            )
                                                        }
                                                        title={
                                                            category.products_count >
                                                                0 ||
                                                            category.children_count >
                                                                0
                                                                ? 'Category has products or subcategories'
                                                                : 'Delete category'
                                                        }
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border text-destructive transition hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {categories.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-16 text-center"
                                        >
                                            <Tags className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No categories found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Create a category
                                                before adding
                                                products.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    openCreateModal
                                                }
                                                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                            >
                                                <Plus className="size-4" />
                                                Add Category
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <CategoryPagination
                        categories={categories}
                    />
                </section>
            </div>

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
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingCategory
                                        ? 'Edit Category'
                                        : 'Add Category'}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Enter the category
                                    information below.
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

                        <form
                            onSubmit={submitCategory}
                            className="space-y-5 p-6"
                        >
                            <FormField
                                label="Parent Category"
                                error={form.errors.parent_id}
                            >
                                <select
                                    value={form.data.parent_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'parent_id',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    <option value="">
                                        No parent — root category
                                    </option>

                                    {availableParentCategories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {category.name}
                                                {!category.is_active
                                                    ? ' - Inactive'
                                                    : ''}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </FormField>

                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    label="Category Name"
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
                                        placeholder="Beverages"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </FormField>

                                <FormField
                                    label="Sort Order"
                                    error={
                                        form.errors.sort_order
                                    }
                                    required
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.data.sort_order
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'sort_order',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="0"
                                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                                    placeholder="Optional category description"
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
                                        Active Category
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                        Allow products to use this
                                        category.
                                    </span>
                                </span>
                            </label>

                            {form.errors.is_active && (
                                <p className="text-sm text-destructive">
                                    {form.errors.is_active}
                                </p>
                            )}

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

                                    {editingCategory
                                        ? 'Save Changes'
                                        : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

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

function CategoryPagination({
    categories,
}: {
    categories: PaginatedCategories;
}) {
    if (categories.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {categories.from ?? 0} to{' '}
                {categories.to ?? 0} of {categories.total}{' '}
                categories
            </p>

            <div className="flex flex-wrap gap-1">
                {categories.links.map((link, index) => (
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