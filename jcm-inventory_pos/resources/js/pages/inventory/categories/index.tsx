import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/inventory/categories',
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
    const [search, setSearch] = useState(filters.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const form = useForm({
        parent_id: '',
        name: '',
        description: '',
        sort_order: 0,
        status: 'active',
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        form.reset();
        form.setData({
            parent_id: '',
            name: '',
            description: '',
            sort_order: 0,
            status: 'active',
        });
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
            form.put(`/inventory/categories/${editingCategory.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post('/inventory/categories', {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const deleteCategory = (category: Category) => {
        if (!confirm(`Delete category "${category.name}"?`)) return;

        router.delete(`/inventory/categories/${category.id}`, {
            preserveScroll: true,
        });
    };

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            '/inventory/categories',
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 border-b border-sidebar-border/70 p-5 md:flex-row md:items-center md:justify-between dark:border-sidebar-border">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage POS product categories.
                            </p>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Add Category
                        </button>
                    </div>

                    <div className="p-5">
                        <form onSubmit={submitSearch} className="mb-4 flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search category..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <button className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
                                Search
                            </button>
                        </form>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Slug</th>
                                        <th className="px-4 py-3 font-medium">Sort</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.data.length > 0 ? (
                                        categories.data.map((category) => (
                                            <tr key={category.id} className="border-t border-sidebar-border/70 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{category.name}</div>
                                                    {category.description && (
                                                        <div className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                                            {category.description}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                                                <td className="px-4 py-3">{category.sort_order}</td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            category.status === 'active'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                                        }`}
                                                    >
                                                        {category.status}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(category)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input hover:bg-muted"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => deleteCategory(category)}
                                                            className="inline-flex size-8 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                                No categories found.
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
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
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
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-xl border bg-background shadow-xl">
                        <div className="flex items-center justify-between border-b p-5">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingCategory ? 'Edit Category' : 'Add Category'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {editingCategory ? 'Update category details.' : 'Create a new product category.'}
                                </p>
                            </div>

                            <button onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Name</label>
                                <input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                                {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Description</label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                                {form.errors.description && <p className="mt-1 text-xs text-red-600">{form.errors.description}</p>}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    {form.errors.sort_order && <p className="mt-1 text-xs text-red-600">{form.errors.sort_order}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Status</label>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {form.errors.status && <p className="mt-1 text-xs text-red-600">{form.errors.status}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
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
                    </div>
                </div>
            )}
        </AppLayout>
    );
}