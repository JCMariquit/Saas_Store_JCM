import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    Package,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/inventory/products',
    },
];

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    sku?: string | null;
    barcode?: string | null;
    quantity: number;
    selling_price: string;
    cost_price: string;
    status: string;
    stock_tracking: string;
    category?: Category | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ProductsPageProps = {
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        status?: string;
    };
};

export default function ProductsIndex({
    products,
    categories,
    filters,
}: ProductsPageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category_id ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const form = useForm({
        category_id: '',
        name: '',
        sku: '',
        barcode: '',
        description: '',
        unit: 'pcs',
        cost_price: '',
        selling_price: '',
        quantity: '',
        reorder_level: '0',
        product_type: 'standard',
        stock_tracking: 'tracked',
        status: 'active',
    });

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            '/inventory/products',
            {
                search,
                category_id: categoryFilter,
                status: statusFilter,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const openCreateModal = () => {
        setEditingProduct(null);

        form.reset();

        form.setData({
            category_id: '',
            name: '',
            sku: '',
            barcode: '',
            description: '',
            unit: 'pcs',
            cost_price: '',
            selling_price: '',
            quantity: '',
            reorder_level: '0',
            product_type: 'standard',
            stock_tracking: 'tracked',
            status: 'active',
        });

        setIsOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);

        form.setData({
            category_id: product.category?.id?.toString() ?? '',
            name: product.name ?? '',
            sku: product.sku ?? '',
            barcode: product.barcode ?? '',
            description: '',
            unit: 'pcs',
            cost_price: product.cost_price ?? '',
            selling_price: product.selling_price ?? '',
            quantity: product.quantity?.toString() ?? '',
            reorder_level: '0',
            product_type: 'standard',
            stock_tracking: product.stock_tracking ?? 'tracked',
            status: product.status ?? 'active',
        });

        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingProduct(null);
        form.clearErrors();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            form.put(`/inventory/products/${editingProduct.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post('/inventory/products', {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const deleteProduct = (product: Product) => {
        if (!confirm(`Delete "${product.name}"?`)) return;

        router.delete(`/inventory/products/${product.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex flex-col gap-4 p-4">
                <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">
                                Products
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage POS inventory products.
                            </p>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            <Plus className="size-4" />
                            Add Product
                        </button>
                    </div>

                    <div className="p-5">
                        <form
                            onSubmit={submitSearch}
                            className="mb-4 grid gap-3 md:grid-cols-4"
                        >
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search product..."
                                    className="h-10 w-full rounded-md border pl-10 pr-3 text-sm"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                                className="h-10 rounded-md border px-3 text-sm"
                            >
                                <option value="">
                                    All Categories
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 flex-1 rounded-md border px-3 text-sm"
                                >
                                    <option value="">
                                        All Status
                                    </option>
                                    <option value="active">
                                        Active
                                    </option>
                                    <option value="inactive">
                                        Inactive
                                    </option>
                                    <option value="draft">
                                        Draft
                                    </option>
                                </select>

                                <button className="rounded-md border px-4 text-sm">
                                    Search
                                </button>
                            </div>
                        </form>

                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.data.length > 0 ? (
                                        products.data.map(
                                            (product) => (
                                                <tr
                                                    key={
                                                        product.id
                                                    }
                                                    className="border-t"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                                                <Package className="size-4" />
                                                            </div>

                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </div>

                                                                <div className="text-xs text-muted-foreground">
                                                                    SKU:{' '}
                                                                    {product.sku ??
                                                                        'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {product
                                                            .category
                                                            ?.name ??
                                                            '-'}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            product.quantity
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3 font-medium">
                                                        ₱
                                                        {Number(
                                                            product.selling_price,
                                                        ).toLocaleString()}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                            {
                                                                product.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        product,
                                                                    )
                                                                }
                                                                className="inline-flex size-8 items-center justify-center rounded-md border"
                                                            >
                                                                <Pencil className="size-4" />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    deleteProduct(
                                                                        product,
                                                                    )
                                                                }
                                                                className="inline-flex size-8 items-center justify-center rounded-md border text-red-600"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-2xl rounded-xl bg-background shadow-xl">
                            <div className="border-b p-5">
                                <h2 className="text-lg font-semibold">
                                    {editingProduct
                                        ? 'Edit Product'
                                        : 'Add Product'}
                                </h2>
                            </div>

                            <form
                                onSubmit={submit}
                                className="space-y-4 p-5"
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Product Name
                                        </label>

                                        <input
                                            value={
                                                form.data.name
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'name',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border px-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Category
                                        </label>

                                        <select
                                            value={
                                                form.data
                                                    .category_id
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'category_id',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border px-3"
                                        >
                                            <option value="">
                                                Select Category
                                            </option>

                                            {categories.map(
                                                (
                                                    category,
                                                ) => (
                                                    <option
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.id
                                                        }
                                                    >
                                                        {
                                                            category.name
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            SKU
                                        </label>

                                        <input
                                            value={
                                                form.data.sku
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'sku',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border px-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Barcode
                                        </label>

                                        <input
                                            value={
                                                form.data
                                                    .barcode
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'barcode',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border px-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Selling Price
                                        </label>

                                        <input
                                            type="number"
                                            value={
                                                form.data
                                                    .selling_price
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'selling_price',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border px-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Quantity
                                        </label>

                                        <input
                                            type="number"
                                            value={
                                                form.data
                                                    .quantity
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'quantity',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-md border px-3"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={
                                            closeModal
                                        }
                                        className="rounded-md border px-4 py-2"
                                    >
                                        Cancel
                                    </button>

                                    <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
                                        {editingProduct
                                            ? 'Update'
                                            : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}