import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
    Building2,
    Eye,
    FolderTree,
    MoreHorizontal,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Store,
    Trash2,
    X,
} from 'lucide-react';

const CATEGORIES_URL = '/client/inventory/categories';

const breadcrumbs: BreadcrumbItem[] = [
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

type ParentCategory = {
    id: number;
    name: string;
};

type Category = {
    id: number;
    branch_id?: number | null;
    parent_id?: number | null;
    name: string;
    slug: string;
    description?: string | null;
    sort_order: number;
    status: 'active' | 'inactive';
    branch?: Branch | null;
    parent?: ParentCategory | null;
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
    parentCategories?: ParentCategory[];
    branches?: Branch[];
    selectedBranchId?: number | string | null;
    filters: {
        branch_id?: string | number | null;
        search?: string | null;
    };
};

export default function CategoriesIndex({
    categories,
    parentCategories = [],
    branches = [],
    selectedBranchId,
    filters,
}: CategoriesPageProps) {
    const initialBranchId = String(filters?.branch_id ?? selectedBranchId ?? '');

    const [selectedBranch, setSelectedBranch] = useState(initialBranchId);
    const [showBranchPicker, setShowBranchPicker] = useState(!initialBranchId && branches.length > 0);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const form = useForm({
        branch_id: initialBranchId,
        parent_id: '',
        name: '',
        description: '',
        sort_order: 0,
        status: 'active',
    });

    const activeBranch = useMemo(() => {
        return branches.find((branch) => String(branch.id) === String(selectedBranch)) ?? null;
    }, [branches, selectedBranch]);

    useEffect(() => {
        if (!selectedBranch) return;

        const timeout = setTimeout(() => {
            router.get(
                CATEGORIES_URL,
                {
                    branch_id: selectedBranch,
                    search,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [selectedBranch, search]);

    const summary = useMemo(() => {
        return {
            total: categories.total ?? 0,
            active: categories.data.filter((category) => category.status === 'active').length,
            inactive: categories.data.filter((category) => category.status === 'inactive').length,
        };
    }, [categories]);

    const selectBranch = (branchId: number) => {
        const id = String(branchId);

        setSelectedBranch(id);
        form.setData('branch_id', id);
        setShowBranchPicker(false);

        router.get(
            CATEGORIES_URL,
            {
                branch_id: id,
                search,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetForm = () => {
        form.setData({
            branch_id: selectedBranch,
            parent_id: '',
            name: '',
            description: '',
            sort_order: 0,
            status: 'active',
        });
        form.clearErrors();
    };

    const openCreateModal = () => {
        if (!selectedBranch) {
            setShowBranchPicker(true);
            return;
        }

        setEditingCategory(null);
        resetForm();
        setIsOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);

        form.setData({
            branch_id: String(category.branch_id ?? selectedBranch),
            parent_id: category.parent_id ? String(category.parent_id) : '',
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

        form.setData('branch_id', selectedBranch);

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
            {
                branch_id: selectedBranch,
            },
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
                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
                                    <Store className="size-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-xl">
                                            {activeBranch ? activeBranch.name : 'Select Branch'}
                                        </CardTitle>

                                        {activeBranch?.is_main && (
                                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                Main
                                            </span>
                                        )}

                                        {activeBranch && (
                                            <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <CardDescription className="mt-1">
                                        {activeBranch
                                            ? `Branch code: ${activeBranch.code || 'No code'}`
                                            : 'Choose a branch to display and manage categories.'}
                                    </CardDescription>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowBranchPicker(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
                            >
                                <Building2 className="size-4" />
                                {activeBranch ? 'Change Branch' : 'Select Branch'}
                            </button>
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
                                        <th className="px-4 py-3 font-medium">Parent</th>
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

                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {category.parent?.name ?? '-'}
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
                                            <td colSpan={6} className="px-4 py-14 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <FolderTree className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="font-medium">
                                                        {selectedBranch ? 'No categories found' : 'Select a branch first'}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {selectedBranch
                                                            ? 'Create your first category for this branch.'
                                                            : 'Choose a branch to display and manage categories.'}
                                                    </p>

                                                    <button
                                                        onClick={selectedBranch ? openCreateModal : () => setShowBranchPicker(true)}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                                    >
                                                        <Plus className="size-4" />
                                                        {selectedBranch ? 'Add Category' : 'Select Branch'}
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

            {showBranchPicker && (
                <Modal size="lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                        <div>
                            <CardTitle className="text-lg">Choose Branch</CardTitle>
                            <CardDescription>Select which branch categories you want to manage.</CardDescription>
                        </div>

                        {selectedBranch && (
                            <button onClick={() => setShowBranchPicker(false)} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        )}
                    </CardHeader>

                    <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
                        {branches.map((branch) => (
                            <button
                                type="button"
                                key={branch.id}
                                onClick={() => selectBranch(branch.id)}
                                className={`group overflow-hidden rounded-xl border text-left transition hover:border-primary/60 hover:bg-muted/40 ${
                                    String(selectedBranch) === String(branch.id)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-sidebar-border/70 dark:border-sidebar-border'
                                }`}
                            >
                                <div className="flex items-start justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-full border bg-background">
                                            <Store className="size-5 text-muted-foreground" />
                                        </div>

                                        <div>
                                            <div className="font-semibold">{branch.name}</div>
                                            <div className="text-xs uppercase text-muted-foreground">
                                                {branch.code || 'NO CODE'}
                                            </div>
                                        </div>
                                    </div>

                                    <MoreHorizontal className="size-4 text-muted-foreground" />
                                </div>

                                <div className="flex gap-2 border-t px-4 py-3">
                                    {branch.is_main && (
                                        <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                                            Main
                                        </span>
                                    )}

                                    <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-medium text-white">
                                        Active
                                    </span>
                                </div>

                                <div className="border-t px-4 py-4 text-sm text-muted-foreground">
                                    Click this branch to display and manage its categories.
                                </div>
                            </button>
                        ))}
                    </div>
                </Modal>
            )}

            {isOpen && (
                <Modal>
                    <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                        <div>
                            <CardTitle className="text-lg">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </CardTitle>
                            <CardDescription>
                                {activeBranch
                                    ? `Branch: ${activeBranch.name}`
                                    : editingCategory
                                      ? 'Update category details.'
                                      : 'Create a new product category.'}
                            </CardDescription>
                        </div>

                        <button onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                            <X className="size-4" />
                        </button>
                    </CardHeader>

                    <form onSubmit={submit} className="space-y-4 p-5">
                        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                            This category will be saved under <b>{activeBranch?.name ?? 'selected branch'}</b>.
                        </div>

                        <Field label="Parent Category" error={form.errors.parent_id}>
                            <select
                                value={form.data.parent_id}
                                onChange={(e) => form.setData('parent_id', e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">No Parent</option>
                                {parentCategories
                                    .filter((parent) => !editingCategory || parent.id !== editingCategory.id)
                                    .map((parent) => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </option>
                                    ))}
                            </select>
                        </Field>

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
                                disabled={form.processing || !selectedBranch}
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
                        <DetailRow label="Branch" value={viewingCategory.branch?.name ?? activeBranch?.name ?? '-'} />
                        <DetailRow label="Parent" value={viewingCategory.parent?.name ?? 'No parent'} />
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
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

function Modal({ children, size = 'default' }: { children: ReactNode; size?: 'default' | 'lg' }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className={`w-full shadow-xl ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'}`}>
                {children}
            </Card>
        </div>
    );
}