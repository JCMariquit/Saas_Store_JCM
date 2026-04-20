import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { Box, CheckCircle2, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

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

type ProductForm = {
    name: string;
    description: string;
    price: number | '';
    pricing_type: 'plan' | 'custom';
    status: 'active' | 'inactive';
};

export default function ProductsIndex() {
    const { props } = usePage<PageProps>();
    const { products, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
    const [viewingProduct, setViewingProduct] = useState<ProductRow | null>(null);

    const createForm = useForm<ProductForm>({
        name: '',
        description: '',
        price: '',
        pricing_type: 'plan',
        status: 'active',
    });

    const editForm = useForm<ProductForm>({
        name: '',
        description: '',
        price: '',
        pricing_type: 'plan',
        status: 'active',
    });

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

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        createForm.setData({
            name: '',
            description: '',
            price: '',
            pricing_type: 'plan',
            status: 'active',
        });
        setOpenCreateModal(true);
    };

    const closeCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setOpenCreateModal(false);
    };

    const openEdit = (product: ProductRow) => {
        setSelectedProduct(product);
        editForm.clearErrors();
        editForm.setData({
            name: product.name,
            description: product.description ?? '',
            price: product.price === null ? '' : Number(product.price),
            pricing_type: product.pricing_type,
            status: product.status,
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

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();

        createForm.post(route('admin.products.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreate();
            },
        });
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
            return 'border-green-200 bg-green-100 text-green-700';
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

    const handleCreatePricingTypeChange = (value: 'plan' | 'custom') => {
        createForm.setData({
            ...createForm.data,
            pricing_type: value,
            price: value === 'plan' ? '' : createForm.data.price,
        });
    };

    const handleEditPricingTypeChange = (value: 'plan' | 'custom') => {
        editForm.setData({
            ...editForm.data,
            pricing_type: value,
            price: value === 'plan' ? '' : editForm.data.price,
        });
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

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Products
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your SaaS products before assigning plans and subscriptions.
                        </p>
                    </div>

                    <Button type="button" onClick={openCreate} className="rounded-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Product
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Products</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {stats.total_products}
                                </h3>
                            </div>
                            <div className="rounded-md bg-slate-100 p-3">
                                <Box className="h-5 w-5 text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Active Products</p>
                                <h3 className="mt-2 text-2xl font-bold text-green-600">
                                    {stats.active_products}
                                </h3>
                            </div>
                            <div className="rounded-md bg-green-50 p-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Inactive Products</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-600">
                                    {stats.inactive_products}
                                </h3>
                            </div>
                            <div className="rounded-md bg-slate-100 p-3">
                                <XCircle className="h-5 w-5 text-slate-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Product List</h2>
                                <p className="text-sm text-slate-500">{resultsText}</p>
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Label htmlFor="product-search" className="sr-only">
                                    Search products
                                </Label>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="product-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search product..."
                                    className="rounded-md pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Code</th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                                            onClick={() => openViewDrawer(product)}
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {product.product_code}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{product.name}</div>
                                                <div className="mt-1 max-w-[320px] truncate text-xs text-slate-500">
                                                    {product.description || 'No description'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                                                        product.status,
                                                    )}`}
                                                >
                                                    {product.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div
                                                    className="flex items-center justify-center gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-9 rounded-md px-3"
                                                        onClick={() => openViewDrawer(product)}
                                                    >
                                                        View
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-9 rounded-md px-3"
                                                        onClick={() => openEdit(product)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-9 rounded-md border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => openDelete(product)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {products.links.length > 3 && (
                        <div className="border-t border-slate-200 px-5 py-4">
                            <div className="flex flex-wrap gap-2">
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
                                        className={`rounded-md border px-3 py-2 text-sm transition ${
                                            link.active
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : link.url
                                                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                  : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {openCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Create Product
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add a new product to your SaaS catalog.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCreate}
                                aria-label="Close create product modal"
                                title="Close"
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_name">Product Name</Label>
                                    <Input
                                        id="create_name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Enter product name"
                                        className="rounded-md"
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_description">Description</Label>
                                    <textarea
                                        id="create_description"
                                        name="description"
                                        title="Product description"
                                        placeholder="Enter product description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        className="min-h-[110px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                                    />
                                    <InputError message={createForm.errors.description} />
                                </div>

                                <div className="grid gap-2 md:max-w-xs">
                                    <Label htmlFor="create_pricing_type">Pricing Type</Label>
                                    <select
                                        id="create_pricing_type"
                                        value={createForm.data.pricing_type}
                                        onChange={(e) =>
                                            handleCreatePricingTypeChange(
                                                e.target.value as 'plan' | 'custom',
                                            )
                                        }
                                        title="Select pricing type"
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                    >
                                        <option value="plan">Plan Based</option>
                                        <option value="custom">Custom Price</option>
                                    </select>
                                    <InputError message={createForm.errors.pricing_type} />
                                </div>

                                {createForm.data.pricing_type === 'custom' && (
                                    <div className="grid gap-2 md:max-w-xs">
                                        <Label htmlFor="create_price">Base Price</Label>
                                        <Input
                                            id="create_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={createForm.data.price}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'price',
                                                    e.target.value === '' ? '' : Number(e.target.value),
                                                )
                                            }
                                            placeholder="0.00"
                                            className="rounded-md"
                                        />
                                        <InputError message={createForm.errors.price} />
                                    </div>
                                )}

                                <div className="grid gap-2 md:max-w-xs">
                                    <Label htmlFor="create_status">Status</Label>
                                    <select
                                        id="create_status"
                                        value={createForm.data.status}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'status',
                                                e.target.value as 'active' | 'inactive',
                                            )
                                        }
                                        title="Select product status"
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <InputError message={createForm.errors.status} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <Button type="button" variant="outline" onClick={closeCreate}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? 'Creating...' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openEditModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Edit Product
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Update selected product information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEdit}
                                aria-label="Close edit product modal"
                                title="Close"
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_name">Product Name</Label>
                                    <Input
                                        id="edit_name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="rounded-md"
                                    />
                                    <InputError message={editForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`edit_description_${selectedProduct?.id ?? 'product'}`}>
                                        Description
                                    </Label>
                                    <textarea
                                        id={`edit_description_${selectedProduct?.id ?? 'product'}`}
                                        name="description"
                                        title="Product description"
                                        placeholder="Enter product description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        className="min-h-[110px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                                    />
                                    <InputError message={editForm.errors.description} />
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
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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
                                            className="rounded-md"
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
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <InputError message={editForm.errors.status} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <Button type="button" variant="outline" onClick={closeEdit}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openDeleteModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-slate-900">Delete Product</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                This action will permanently remove the selected product.
                            </p>
                        </div>

                        <div className="px-6 py-5">
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold">{selectedProduct.name}</span>?
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={closeDelete}>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete Product
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingProduct && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-950/40"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Product Details</h2>
                                <p className="text-sm text-slate-500">View full product information</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewDrawer}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
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
                                    className="inline-flex items-center gap-2"
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
                                    className="inline-flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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