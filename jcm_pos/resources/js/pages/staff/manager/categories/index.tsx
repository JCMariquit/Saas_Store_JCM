import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    FolderTree,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Store,
    Tags,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { FormEvent, Fragment, ReactNode, useMemo, useState } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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

function cleanLabel(label: string) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function numberValue(value?: number | string | null) {
    const amount = Number(value ?? 0);

    return Number.isNaN(amount) ? 0 : amount;
}

function statusClass(status?: string | null) {
    if (status === 'active') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (status === 'inactive') return 'bg-red-500/10 text-red-700 dark:text-red-400';

    return 'bg-muted text-muted-foreground';
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    variant = 'default',
}: {
    title: string;
    value: number | string;
    description: string;
    icon: React.ElementType;
    variant?: 'default' | 'success' | 'danger';
}) {
    const variantClass = {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        danger: 'bg-red-500/10 text-red-700 dark:text-red-400',
    }[variant];

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClass}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

export default function ManagerCategoriesIndex({ categories, branch, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

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
        const sortedFirst = [...categories.data].sort((a, b) => numberValue(a.sort_order) - numberValue(b.sort_order))[0];

        return {
            total,
            active,
            inactive,
            topCategory: sortedFirst?.name ?? '—',
        };
    }, [categories]);

    const applyFilters = () => {
        router.get(
            CATEGORIES_URL,
            {
                search: search || undefined,
                status: statusFilter || undefined,
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
        setOpenCategoryId(null);

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

    const submit = (event: FormEvent) => {
        event.preventDefault();

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

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Tags className="size-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage product category groups for your assigned branch.
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
                                        <Store className="size-3" />
                                        Branch: {branch.name}
                                    </span>

                                    <span className="rounded-full border px-3 py-1">Code: {branch.code || 'No code'}</span>
                                    {branch.is_main && <span className="rounded-full border px-3 py-1">Main Branch</span>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="size-4" />
                            Add Category
                        </button>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Total Categories" value={summary.total} description="All categories under this branch." icon={FolderTree} />
                    <SummaryCard title="Active" value={summary.active} description="Active categories on current page." icon={CheckCircle2} variant="success" />
                    <SummaryCard title="Inactive" value={summary.inactive} description="Inactive categories on current page." icon={XCircle} variant={summary.inactive > 0 ? 'danger' : 'default'} />
                    <SummaryCard title="Top Sort" value={summary.topCategory} description="First category by sort order." icon={Tags} />
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="relative xl:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
                            <Search className="absolute left-3 top-[34px] size-4 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') applyFilters();
                                }}
                                placeholder="Search name, slug, description..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Search className="size-4" />
                                Apply
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium hover:bg-muted"
                                title="Reset filters"
                            >
                                <RotateCcw className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold">Category Records</h2>
                            <p className="text-sm text-muted-foreground">
                                Showing {categories.from ?? 0} to {categories.to ?? 0} of {categories.total} categories.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            <FolderTree className="size-3" />
                            Branch category list
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-10 px-4 py-3"></th>
                                    <th className="px-4 py-3 text-left font-medium">Category</th>
                                    <th className="px-4 py-3 text-left font-medium">Slug</th>
                                    <th className="px-4 py-3 text-left font-medium">Sort</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => {
                                        const isOpen = openCategoryId === category.id;

                                        return (
                                            <Fragment key={category.id}>
                                                <tr
                                                    onClick={() => setOpenCategoryId(isOpen ? null : category.id)}
                                                    className="cursor-pointer border-t transition hover:bg-muted/40"
                                                >
                                                    <td className="px-4 py-3">
                                                        {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
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

                                                    <td className="px-4 py-3 text-muted-foreground">{category.slug ?? '—'}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{category.sort_order ?? 0}</td>

                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(category.status)}`}>
                                                            {category.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(category)}
                                                                className="inline-flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="size-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => deleteCategory(category)}
                                                                className="inline-flex size-8 items-center justify-center rounded-lg border text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isOpen && (
                                                    <tr className="border-t bg-muted/20">
                                                        <td colSpan={6} className="px-4 py-4">
                                                            <div className="space-y-4 rounded-xl border bg-card p-4">
                                                                <div className="grid gap-3 md:grid-cols-4">
                                                                    <Detail label="Category ID" value={`#${category.id}`} />
                                                                    <Detail label="Name" value={category.name} />
                                                                    <Detail label="Slug" value={category.slug || '—'} />
                                                                    <Detail label="Sort Order" value={category.sort_order ?? 0} />
                                                                    <Detail label="Status" value={category.status} />
                                                                    <Detail label="Branch" value={branch.name} />
                                                                </div>

                                                                <div className="rounded-xl border bg-muted/30 p-3">
                                                                    <p className="text-xs text-muted-foreground">Description</p>
                                                                    <p className="mt-1 text-sm">{category.description || 'No description provided.'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-14">
                                            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <FolderTree className="size-5 text-muted-foreground" />
                                                </div>

                                                <h3 className="font-medium">No categories found</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">Create your first category or adjust your filters.</p>

                                                <button
                                                    type="button"
                                                    onClick={openCreateModal}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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

                    {categories.links.length > 0 && (
                        <div className="flex flex-col gap-3 border-t p-4 text-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-muted-foreground">
                                Showing {categories.from ?? 0} to {categories.to ?? 0} of {categories.total} results
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {categories.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) router.visit(link.url, { preserveState: true, preserveScroll: true });
                                        }}
                                        className={[
                                            'h-9 rounded-lg border px-3 text-sm font-medium transition',
                                            link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                            !link.url ? 'cursor-not-allowed opacity-50' : '',
                                        ].join(' ')}
                                    >
                                        {cleanLabel(link.label)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

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
                            <Section title="Category Information" description="Basic category details used to group branch products.">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Category Name" error={form.errors.name}>
                                        <input
                                            value={form.data.name}
                                            onChange={(event) => form.setData('name', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>

                                    <Field label="Status" error={form.errors.status}>
                                        <select
                                            value={form.data.status}
                                            onChange={(event) => form.setData('status', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
                                            onChange={(event) => form.setData('sort_order', event.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </Field>
                                </div>

                                <Field label="Description" error={form.errors.description}>
                                    <textarea
                                        rows={4}
                                        value={form.data.description}
                                        onChange={(event) => form.setData('description', event.target.value)}
                                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </Field>
                            </Section>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                                    Cancel
                                </button>

                                <button
                                    disabled={form.processing}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {form.processing ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}

function Detail({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium capitalize">{value}</p>
        </div>
    );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <div className="space-y-4 rounded-xl border p-4">
            <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>

            {children}
        </div>
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