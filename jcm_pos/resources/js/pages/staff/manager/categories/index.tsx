import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { FolderTree, Pencil, Plus, RotateCcw, Search, Store, Tags, Trash2, X } from 'lucide-react';

const CATEGORIES_URL = '/staff/manager/categories';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manager',
        href: '/staff/manager/dashboard',
    },
    {
        title: 'Categories',
        href: CATEGORIES_URL,
    },
];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main?: boolean;
    is_active?: boolean;
};

type Category = {
    id: number;
    name: string;
    slug?: string | null;
    description?: string | null;
    status: 'active' | 'inactive';
    sort_order?: number | string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    categories: {
        data: Category[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    branch: Branch;
    filters: {
        search?: string | null;
        status?: string | null;
    };
};

export default function ManagerCategoriesIndex({ categories, branch, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const form = useForm({
        name: '',
        description: '',
        status: 'active',
        sort_order: '0',
    });

    const summary = useMemo(() => {
        const total = categories.total ?? 0;
        const active = categories.data.filter((category) => category.status === 'active').length;
        const inactive = categories.data.filter((category) => category.status === 'inactive').length;

        return { total, active, inactive };
    }, [categories]);

    const statusBadge = (status: Category['status']) => {
        const classes = {
            active: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
            inactive: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        };

        return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes[status]}`}>{status}</span>;
    };

    const applyFilters = () => {
        router.get(
            CATEGORIES_URL,
            {
                search,
                status: statusFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');

        router.get(CATEGORIES_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetForm = () => {
        form.setData({
            name: '',
            description: '',
            status: 'active',
            sort_order: '0',
        });

        form.clearErrors();
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        resetForm();
        setIsOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);

        form.setData({
            name: category.name ?? '',
            description: category.description ?? '',
            status: category.status ?? 'active',
            sort_order: String(category.sort_order ?? '0'),
        });

        form.clearErrors();
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingCategory(null);
        form.clearErrors();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            form.put(`${CATEGORIES_URL}/${editingCategory.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post(CATEGORIES_URL, {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const deleteCategory = (category: Category) => {
        if (!confirm(`Delete "${category.name}"?`)) return;

        router.delete(`${CATEGORIES_URL}/${category.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manager Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                <Store className="size-5 text-muted-foreground" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="text-xl">{branch.name}</CardTitle>

                                    {branch.is_main && (
                                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            Main
                                        </span>
                                    )}

                                    <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                        Active
                                    </span>
                                </div>

                                <CardDescription className="mt-1">
                                    Branch code: {branch.code || 'No code'} · Manager branch categories only.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard title="Total Categories" value={summary.total} variant="default" />
                    <SummaryCard title="Active Categories" value={summary.active} variant="success" />
                    <SummaryCard title="Inactive Categories" value={summary.inactive} variant="neutral" />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-xl">Categories</CardTitle>
                            <CardDescription className="mt-1">
                                Manage product categories for your assigned branch.
                            </CardDescription>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Add Category
                        </button>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 grid gap-3 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    placeholder="Search category name, slug, description..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    Filter
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-input px-3 text-sm hover:bg-muted"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Category</th>
                                        <th className="px-4 py-3 font-medium">Slug</th>
                                        <th className="px-4 py-3 font-medium">Sort Order</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.data.length > 0 ? (
                                        categories.data.map((category) => (
                                            <tr key={category.id} className="border-t border-sidebar-border/70 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                                            <Tags className="size-4 text-muted-foreground" />
                                                        </div>

                                                        <div>
                                                            <div className="font-medium">{category.name}</div>
                                                            <div className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                                                {category.description || 'No description'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{category.slug ?? '-'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{category.sort_order ?? 0}</td>
                                                <td className="px-4 py-3">{statusBadge(category.status)}</td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(category)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input hover:bg-muted"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => deleteCategory(category)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-14 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <FolderTree className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">No categories found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Create your first category for this branch.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={openCreateModal}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                                    >
                                                        <Plus className="size-4" />
                                                        Add Category
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {categories.from ?? 0} to {categories.to ?? 0} of {categories.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {categories.links.map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isOpen && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">{editingCategory ? 'Edit Category' : 'Add Category'}</CardTitle>
                                <CardDescription>Branch: {branch.name}</CardDescription>
                            </div>

                            <button type="button" onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submit} className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                This category will be saved under <b>{branch.name}</b>.
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Category Name" error={form.errors.name}>
                                    <input
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>

                                <Field label="Status" error={form.errors.status}>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>

                                <Field label="Sort Order" error={form.errors.sort_order}>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData('sort_order', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </Field>
                            </div>

                            <Field label="Description" error={form.errors.description}>
                                <textarea
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </Field>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={form.processing}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Saving...'
                                        : editingCategory
                                          ? 'Update Category'
                                          : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    variant = 'default',
}: {
    title: string;
    value: number;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-2">
                <CardDescription>{title}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
                <CardTitle>{value}</CardTitle>
            </CardContent>
        </Card>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-hidden shadow-xl">{children}</Card>
        </div>
    );
}