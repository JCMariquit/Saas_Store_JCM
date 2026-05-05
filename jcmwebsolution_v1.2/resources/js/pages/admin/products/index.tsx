import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { Box, CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/admin-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/admin-ui/page-hero';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { SectionCard } from '@/components/admin-ui/section-card';
import { SearchInput } from '@/components/admin-ui/search-input';
import { TableActionButtons } from '@/components/admin-ui/table-action-buttons';
import { FormModal } from '@/components/admin-ui/form-modal';
import { ConfirmModal } from '@/components/admin-ui/confirm-modal';
import { DataTable } from '@/components/admin-ui/data-table';

type ProductRow = {
    id: number;
    product_code: string;
    name: string;
    description: string | null;
    price: string | number | null;
    pricing_type: 'plan' | 'custom';
    status: 'active' | 'inactive';
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ProductsPagination = {
    data: ProductRow[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number | null;
    total: number;
};

type PageProps = {
    filters: {
        search: string;
    };
    products: ProductsPagination;
    stats: {
        total_products: number;
        active_products: number;
        inactive_products: number;
    };
    flash?: {
        success?: string;
    };
};

type ProductFeatureForm = {
    title: string;
};

type ProductOverviewForm = {
    title: string;
    content: string;
};

type ProductForm = {
    name: string;
    description: string;
    price: number | '';
    pricing_type: 'plan' | 'custom';
    status: 'active' | 'inactive';
    features: ProductFeatureForm[];
    overviews: ProductOverviewForm[];
};

const emptyProductForm: ProductForm = {
    name: '',
    description: '',
    price: '',
    pricing_type: 'plan',
    status: 'active',
    features: [],
    overviews: [],
};

const productTableColumns = [
    { key: 'code', label: 'Code' },
    { key: 'product', label: 'Product' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

export default function ProductsIndex() {
    const { props } = usePage<PageProps>();
    const { products, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
    const [viewingProduct, setViewingProduct] = useState<ProductRow | null>(null);

    const editForm = useForm<ProductForm>(emptyProductForm);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('admin.products.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

    const openEdit = (product: ProductRow) => {
        setSelectedProduct(product);
        editForm.clearErrors();
        editForm.setData({
            name: product.name,
            description: product.description ?? '',
            price: product.price === null ? '' : Number(product.price),
            pricing_type: product.pricing_type,
            status: product.status,
            features: [],
            overviews: [],
        });
        setOpenEditModal(true);
    };

    const closeEdit = () => {
        setSelectedProduct(null);
        editForm.reset();
        editForm.clearErrors();
        setOpenEditModal(false);
    };

    const openDelete = (product: ProductRow) => {
        setSelectedProduct(product);
        setOpenDeleteModal(true);
    };

    const closeDelete = () => {
        setSelectedProduct(null);
        setOpenDeleteModal(false);
    };

    const openViewDrawer = (product: ProductRow) => {
        setViewingProduct(product);
    };

    const closeViewDrawer = () => {
        setViewingProduct(null);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!selectedProduct) return;

        editForm.put(route('admin.products.update', selectedProduct.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeEdit();
            },
        });
    };

    const confirmDelete = () => {
        if (!selectedProduct) return;

        router.delete(route('admin.products.destroy', selectedProduct.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeDelete();
            },
        });
    };

    const resultsText = useMemo(() => {
        if (!products.total) return 'No products found.';
        return `Showing ${products.from ?? 0} to ${products.to ?? 0} of ${products.total} products`;
    }, [products.from, products.to, products.total]);

    const getStatusBadgeClass = (status: ProductRow['status']) => {
        if (status === 'active') {
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        }

        return 'border-slate-200 bg-slate-100 text-slate-700';
    };

    const formatPrice = (value: string | number | null) => {
        if (value === null || value === '') return '-';

        const numeric = Number(value);

        if (Number.isNaN(numeric)) return '-';

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(numeric);
    };

    const getPaginationAriaLabel = (label: string) => {
        const cleaned = label
            .replace(/&laquo;/g, '')
            .replace(/&raquo;/g, '')
            .replace(/&amp;laquo;/g, '')
            .replace(/&amp;raquo;/g, '')
            .trim();

        if (label.includes('laquo')) return 'Previous page';
        if (label.includes('raquo')) return 'Next page';
        if (cleaned) return `Go to page ${cleaned}`;

        return 'Pagination link';
    };

    const handleEditPricingTypeChange = (value: 'plan' | 'custom') => {
        editForm.setData({
            ...editForm.data,
            pricing_type: value,
            price: value === 'plan' ? '' : editForm.data.price,
        });
    };

    const addEditFeature = () => {
        editForm.setData('features', [...editForm.data.features, { title: '' }]);
    };

    const removeEditFeature = (index: number) => {
        const updated = [...editForm.data.features];
        updated.splice(index, 1);
        editForm.setData('features', updated);
    };

    const updateEditFeature = (index: number, value: string) => {
        const updated = [...editForm.data.features];
        updated[index] = { ...updated[index], title: value };
        editForm.setData('features', updated);
    };

    const addEditOverview = () => {
        editForm.setData('overviews', [
            ...editForm.data.overviews,
            { title: '', content: '' },
        ]);
    };

    const removeEditOverview = (index: number) => {
        const updated = [...editForm.data.overviews];
        updated.splice(index, 1);
        editForm.setData('overviews', updated);
    };

    const updateEditOverview = (
        index: number,
        field: keyof ProductOverviewForm,
        value: string,
    ) => {
        const updated = [...editForm.data.overviews];
        updated[index] = { ...updated[index], [field]: value };
        editForm.setData('overviews', updated);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Products',
            href: '/admin/products',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Products"
                        description="Manage your SaaS products before assigning plans and subscriptions."
                        actionLabel="Create Product"
                        onAction={() => router.visit(route('admin.products.create'))}
                        actionIcon={<Plus className="h-4 w-4" />}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard
                            title="Total Products"
                            value={stats.total_products}
                            description="All products currently listed in your SaaS catalog."
                            icon={<Box className="h-5 w-5" />}
                            tone="blue"
                        />

                        <StatsCard
                            title="Active Products"
                            value={stats.active_products}
                            description="Products available for plans, subscriptions, and orders."
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            tone="emerald"
                        />

                        <StatsCard
                            title="Inactive Products"
                            value={stats.inactive_products}
                            description="Products currently hidden or disabled from active use."
                            icon={<XCircle className="h-5 w-5" />}
                            tone="indigo"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard
                        title="Product List"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput
                                    id="product-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search product..."
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSearch('')}
                                    className="h-11 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    Reset Search
                                </Button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={productTableColumns}
                            empty={products.data.length === 0}
                            emptyMessage="No products found."
                            colSpan={4}
                            striped
                            hoverable
                        >
                            {products.data.map((product) => (
                                <tr
                                    key={product.id}
                                    className="cursor-pointer"
                                    onClick={() => openViewDrawer(product)}
                                >
                                    <td className="px-4 py-4 font-medium text-slate-900">
                                        {product.product_code}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="font-medium text-slate-900">{product.name}</div>
                                        <div className="mt-1 max-w-[320px] truncate text-xs text-slate-500">
                                            {product.description || 'No description'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
                                                product.status,
                                            )}`}
                                        >
                                            {product.status}
                                        </span>
                                    </td>

                                    <td
                                        className="px-4 py-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <TableActionButtons
                                            name={product.name}
                                            onEdit={() => openEdit(product)}
                                            onDelete={() => openDelete(product)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </DataTable>

                        {products.links.length > 3 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {products.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        aria-label={getPaginationAriaLabel(link.label)}
                                        title={getPaginationAriaLabel(link.label)}
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                });
                                            }
                                        }}
                                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                            link.active
                                                ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                : link.url
                                                  ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                                  : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>

            <FormModal
                open={openEditModal && !!selectedProduct}
                title="Edit Product"
                description="Update selected product information."
                onClose={closeEdit}
                tone="indigo"
            >
                <form onSubmit={submitEdit} className="space-y-5">
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Product Name</Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="rounded-xl"
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`edit_description_${selectedProduct?.id ?? 'product'}`}>
                                Short Description
                            </Label>
                            <textarea
                                id={`edit_description_${selectedProduct?.id ?? 'product'}`}
                                name="description"
                                title="Product description"
                                placeholder="Enter short product description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                className="min-h-[110px] rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                            />
                            <InputError message={editForm.errors.description} />
                        </div>

                        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Product Features</h3>
                                    <p className="text-xs text-slate-500">
                                        Manage short feature highlights for this product.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEditFeature}
                                    className="rounded-xl"
                                >
                                    Add Feature
                                </Button>
                            </div>

                            {editForm.data.features.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                                    No features added yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {editForm.data.features.map((feature, index) => (
                                        <div
                                            key={`edit-feature-${index}`}
                                            className="rounded-xl border border-slate-200 bg-white p-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <Input
                                                        value={feature.title}
                                                        onChange={(e) =>
                                                            updateEditFeature(index, e.target.value)
                                                        }
                                                        placeholder={`Feature ${index + 1}`}
                                                        className="rounded-xl"
                                                    />
                                                    <InputError
                                                        message={
                                                            (editForm.errors as Record<string, string>)[
                                                                `features.${index}.title`
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => removeEditFeature(index)}
                                                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Product Overview</h3>
                                    <p className="text-xs text-slate-500">
                                        Manage long-form sections for this product.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEditOverview}
                                    className="rounded-xl"
                                >
                                    Add Section
                                </Button>
                            </div>

                            {editForm.data.overviews.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                                    No overview sections added yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {editForm.data.overviews.map((overview, index) => (
                                        <div
                                            key={`edit-overview-${index}`}
                                            className="rounded-xl border border-slate-200 bg-white p-4"
                                        >
                                            <div className="space-y-3">
                                                <div className="grid gap-2">
                                                    <Label>Section Title</Label>
                                                    <Input
                                                        value={overview.title}
                                                        onChange={(e) =>
                                                            updateEditOverview(
                                                                index,
                                                                'title',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. About this product"
                                                        className="rounded-xl"
                                                    />
                                                    <InputError
                                                        message={
                                                            (editForm.errors as Record<string, string>)[
                                                                `overviews.${index}.title`
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Content</Label>
                                                    <textarea
                                                        value={overview.content}
                                                        onChange={(e) =>
                                                            updateEditOverview(
                                                                index,
                                                                'content',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Write the full section content here..."
                                                        className="min-h-[140px] rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                                                    />
                                                    <InputError
                                                        message={
                                                            (editForm.errors as Record<string, string>)[
                                                                `overviews.${index}.content`
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => removeEditOverview(index)}
                                                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        Remove Section
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2 md:max-w-xs">
                            <Label htmlFor="edit_pricing_type">Pricing Type</Label>
                            <select
                                id="edit_pricing_type"
                                value={editForm.data.pricing_type}
                                onChange={(e) =>
                                    handleEditPricingTypeChange(
                                        e.target.value as 'plan' | 'custom',
                                    )
                                }
                                title="Select pricing type"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            >
                                <option value="plan">Plan Based</option>
                                <option value="custom">Custom Price</option>
                            </select>
                            <InputError message={editForm.errors.pricing_type} />
                        </div>

                        {editForm.data.pricing_type === 'custom' && (
                            <div className="grid gap-2 md:max-w-xs">
                                <Label htmlFor="edit_price">Base Price</Label>
                                <Input
                                    id="edit_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.price}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'price',
                                            e.target.value === '' ? '' : Number(e.target.value),
                                        )
                                    }
                                    className="rounded-xl"
                                />
                                <InputError message={editForm.errors.price} />
                            </div>
                        )}

                        <div className="grid gap-2 md:max-w-xs">
                            <Label htmlFor="edit_status">Status</Label>
                            <select
                                id="edit_status"
                                value={editForm.data.status}
                                onChange={(e) =>
                                    editForm.setData(
                                        'status',
                                        e.target.value as 'active' | 'inactive',
                                    )
                                }
                                title="Select product status"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <InputError message={editForm.errors.status} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeEdit}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={editForm.processing}
                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700"
                        >
                            {editForm.processing ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmModal
                open={openDeleteModal && !!selectedProduct}
                title="Delete Product"
                description="This action will permanently remove the selected product."
                message={`Are you sure you want to delete ${selectedProduct?.name ?? ''}?`}
                confirmLabel="Delete Product"
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />

            {viewingProduct && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Product Details</h2>
                                <p className="text-sm text-slate-500">View full product information</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewDrawer}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-5 overflow-y-auto p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Code</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {viewingProduct.product_code}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {viewingProduct.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {viewingProduct.description || 'No description'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pricing Type</p>
                                    <p className="mt-1 text-sm capitalize text-slate-900">
                                        {viewingProduct.pricing_type}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                                    <p className="mt-1 text-sm capitalize text-slate-900">
                                        {viewingProduct.status}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Base Price</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {viewingProduct.pricing_type === 'plan'
                                            ? 'See plans'
                                            : formatPrice(viewingProduct.price)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created At</p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {viewingProduct.created_at ?? '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-slate-200 pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 rounded-xl"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openEdit(viewingProduct);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openDelete(viewingProduct);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}