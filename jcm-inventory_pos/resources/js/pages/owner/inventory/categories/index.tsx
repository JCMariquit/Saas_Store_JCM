import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Eye, FolderTree, Pencil, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';

const CATEGORIES_URL = '/client/inventory/categories';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: CATEGORIES_URL,
    },
];

type Category = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    sort_order: number;
    status: 'active' | 'inactive';
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type CategoriesPageProps = {
    categories: {
        data: Category[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search?: string | null;
    };
};

export default function CategoriesIndex({ categories, filters }: CategoriesPageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const form = useForm({
        parent_id: '',
        name: '',
        description: '',
        sort_order: 0,
        status: 'active',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                CATEGORIES_URL,
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const summary = useMemo(() => {
        return {
            total: categories.total ?? 0,
            active: categories.data.filter((category) => category.status === 'active').length,
            inactive: categories.data.filter((category) => category.status === 'inactive').length,
        };
    }, [categories]);

    const resetForm = () => {
        form.setData({
            parent_id: '',
            name: '',
            description: '',
            sort_order: 0,
            status: 'active',
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
            parent_id: '',
            name: category.name,
            description: category.description ?? '',
            sort_order: category.sort_order ?? 0,
            status: category.status,
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
        if (!confirm(`Delete category "${category.name}"?`)) return;

        router.delete(`${CATEGORIES_URL}/${category.id}`, {
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearch('');

        router.get(
            CATEGORIES_URL,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                        <CardHeader className="p-5 pb-2">
                            <CardDescription>Total Categories</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <CardTitle>{summary.total}</CardTitle>
                        </CardContent>
                    </Card>

                    <Card tone="topline" variant="success" className="overflow-hidden shadow-sm">
                        <CardHeader className="p-5 pb-2">
                            <CardDescription>Active Categories</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <CardTitle>{summary.active}</CardTitle>
                        </CardContent>
                    </Card>

                    <Card tone="topline" variant="neutral" className="overflow-hidden shadow-sm">
                        <CardHeader className="p-5 pb-2">
                            <CardDescription>Inactive Categories</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <CardTitle>{summary.inactive}</CardTitle>
                        </CardContent>
                    </Card>
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-xl">Categories</CardTitle>
                            <CardDescription className="mt-1">
                                Organize products by category for faster inventory and POS navigation.
                            </CardDescription>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Add Category
                        </button>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Auto search category name, slug, or description..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Category</th>
                                        <th className="px-4 py-3 font-medium">Slug</th>
                                        <th className="px-4 py-3 font-medium">Sort</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.data.length > 0 ? (
                                        categories.data.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="border-t border-sidebar-border/70 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                                            <FolderTree className="size-4 text-muted-foreground" />
                                                        </div>

                                                        <div>
                                                            <div className="font-medium">{category.name}</div>
                                                            <div className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                                                {category.description || 'No description'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                                                <td className="px-4 py-3">{category.sort_order}</td>

                                                <td className="px-4 py-3">
                                                    <StatusBadge status={category.status} />
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setViewingCategory(category)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input hover:bg-muted"
                                                            title="View"
                                                        >
                                                            <Eye className="size-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => openEditModal(category)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input hover:bg-muted"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>

                                                        <button
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
                                                        Create your first category to organize your POS products.
                                                    </p>

                                                    <button
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
                                        onClick={() =>
                                            link.url &&
                                            router.get(link.url, {}, { preserveState: true, preserveScroll: true })
                                        }
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
            </div>

            {isOpen && (
                <Modal>
                    <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                        <div>
                            <CardTitle className="text-lg">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </CardTitle>
                            <CardDescription>
                                {editingCategory ? 'Update category details.' : 'Create a new product category.'}
                            </CardDescription>
                        </div>

                        <button onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                            <X className="size-4" />
                        </button>
                    </CardHeader>

                    <form onSubmit={submit} className="space-y-4 p-5">
                        <Field label="Name" error={form.errors.name}>
                            <input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </Field>

                        <Field label="Description" error={form.errors.description}>
                            <textarea
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Sort Order" error={form.errors.sort_order}>
                                <input
                                    type="number"
                                    value={form.data.sort_order}
                                    onChange={(e) => form.setData('sort_order', Number(e.target.value))}
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
                        </div>

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
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {viewingCategory && (
                <Modal>
                    <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                        <div>
                            <CardTitle className="text-lg">Category Details</CardTitle>
                            <CardDescription>View selected category information.</CardDescription>
                        </div>

                        <button onClick={() => setViewingCategory(null)} className="rounded-md p-2 hover:bg-muted">
                            <X className="size-4" />
                        </button>
                    </CardHeader>

                    <CardContent className="space-y-4 p-5 text-sm">
                        <DetailRow label="Name" value={viewingCategory.name} />
                        <DetailRow label="Slug" value={viewingCategory.slug} />
                        <DetailRow label="Description" value={viewingCategory.description || 'No description'} />
                        <DetailRow label="Sort Order" value={String(viewingCategory.sort_order)} />

                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-muted-foreground">Status</span>
                            <StatusBadge status={viewingCategory.status} />
                        </div>
                    </CardContent>
                </Modal>
            )}
        </AppLayout>
    );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
        >
            {status}
        </span>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="max-w-sm text-right font-medium">{value}</span>
        </div>
    );
}

function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg shadow-xl">
                {children}
            </Card>
        </div>
    );
}