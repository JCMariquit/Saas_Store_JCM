import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { Layers3, Plus, Pencil, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

type ProductOption = {
    id: number;
    name: string;
};

type PlanRow = {
    id: number;
    product_id: number;
    product_name: string;
    plan_name: string;
    price: string | number;
    duration_days: number;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PlansPagination = {
    data: PlanRow[];
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
    plans: PlansPagination;
    products: ProductOption[];
    stats: {
        total_plans: number;
        active_plans: number;
        inactive_plans: number;
    };
    flash?: {
        success?: string;
    };
};

type PlanForm = {
    product_id: number | '';
    plan_name: string;
    price: number | '';
    duration_days: number | '';
    description: string;
    status: 'active' | 'inactive';
};

export default function PlansIndex() {
    const { props } = usePage<PageProps>();
    const { plans, products, filters, stats, flash } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanRow | null>(null);
    const [viewingPlan, setViewingPlan] = useState<PlanRow | null>(null);

    const createForm = useForm<PlanForm>({
        product_id: '',
        plan_name: '',
        price: '',
        duration_days: '',
        description: '',
        status: 'active',
    });

    const editForm = useForm<PlanForm>({
        product_id: '',
        plan_name: '',
        price: '',
        duration_days: '',
        description: '',
        status: 'active',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('admin.plans.index'),
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
            product_id: '',
            plan_name: '',
            price: '',
            duration_days: '',
            description: '',
            status: 'active',
        });
        setOpenCreateModal(true);
    };

    const closeCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setOpenCreateModal(false);
    };

    const openEdit = (plan: PlanRow) => {
        setSelectedPlan(plan);
        editForm.clearErrors();
        editForm.setData({
            product_id: plan.product_id,
            plan_name: plan.plan_name,
            price: Number(plan.price),
            duration_days: plan.duration_days,
            description: plan.description ?? '',
            status: plan.status,
        });
        setOpenEditModal(true);
    };

    const closeEdit = () => {
        setSelectedPlan(null);
        editForm.reset();
        editForm.clearErrors();
        setOpenEditModal(false);
    };

    const openDelete = (plan: PlanRow) => {
        setSelectedPlan(plan);
        setOpenDeleteModal(true);
    };

    const closeDelete = () => {
        setSelectedPlan(null);
        setOpenDeleteModal(false);
    };

    const openViewDrawer = (plan: PlanRow) => {
        setViewingPlan(plan);
    };

    const closeViewDrawer = () => {
        setViewingPlan(null);
    };

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();

        createForm.post(route('admin.plans.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreate();
            },
        });
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!selectedPlan) return;

        editForm.put(route('admin.plans.update', selectedPlan.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeEdit();
            },
        });
    };

    const confirmDelete = () => {
        if (!selectedPlan) return;

        router.delete(route('admin.plans.destroy', selectedPlan.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeDelete();
            },
        });
    };

    const resultsText = useMemo(() => {
        if (!plans.total) return 'No plans found.';
        return `Showing ${plans.from ?? 0} to ${plans.to ?? 0} of ${plans.total} plans`;
    }, [plans.from, plans.to, plans.total]);

    const getStatusBadgeClass = (status: PlanRow['status']) => {
        if (status === 'active') {
            return 'border-green-200 bg-green-100 text-green-700';
        }

        return 'border-slate-200 bg-slate-100 text-slate-700';
    };

    const formatPrice = (value: string | number) => {
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

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Plans',
            href: '/admin/plans',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plans" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Plans
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage pricing tiers and duration for each product.
                        </p>
                    </div>

                    <Button type="button" onClick={openCreate} className="rounded-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Plan
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Plans</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {stats.total_plans}
                                </h3>
                            </div>
                            <div className="rounded-md bg-slate-100 p-3">
                                <Layers3 className="h-5 w-5 text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Active Plans</p>
                                <h3 className="mt-2 text-2xl font-bold text-green-600">
                                    {stats.active_plans}
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
                                <p className="text-sm text-slate-500">Inactive Plans</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-600">
                                    {stats.inactive_plans}
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
                                <h2 className="text-lg font-semibold text-slate-900">Plan List</h2>
                                <p className="mt-1 text-sm text-slate-500">{resultsText}</p>
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Label htmlFor="plan-search" className="sr-only">
                                    Search plans
                                </Label>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="plan-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search plan or product..."
                                    className="rounded-md pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">ID</th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Plan</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {plans.data.length > 0 ? (
                                    plans.data.map((plan) => (
                                        <tr
                                            key={plan.id}
                                            className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                                            onClick={() => openViewDrawer(plan)}
                                        >
                                            <td className="px-4 py-3 text-slate-700">{plan.id}</td>

                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {plan.product_name}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{plan.plan_name}</div>
                                                <div className="mt-1 max-w-[320px] truncate text-xs text-slate-500">
                                                    {plan.description || 'No description'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                                                        plan.status,
                                                    )}`}
                                                >
                                                    {plan.status}
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
                                                        onClick={() => openViewDrawer(plan)}
                                                    >
                                                        View
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-9 rounded-md px-3"
                                                        title={`Edit ${plan.plan_name}`}
                                                        aria-label={`Edit ${plan.plan_name}`}
                                                        onClick={() => openEdit(plan)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-9 rounded-md border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        title={`Delete ${plan.plan_name}`}
                                                        aria-label={`Delete ${plan.plan_name}`}
                                                        onClick={() => openDelete(plan)}
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
                                            colSpan={5}
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            No plans found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {plans.links.length > 3 && (
                        <div className="border-t border-slate-200 px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                                {plans.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        title={getPaginationAriaLabel(link.label)}
                                        aria-label={getPaginationAriaLabel(link.label)}
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
                                    Create Plan
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add a new pricing plan for a product.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCreate}
                                title="Close create plan modal"
                                aria-label="Close create plan modal"
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_product_id">Product</Label>
                                    <select
                                        id="create_product_id"
                                        name="product_id"
                                        title="Select product"
                                        value={createForm.data.product_id}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'product_id',
                                                e.target.value ? Number(e.target.value) : '',
                                            )
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                    >
                                        <option value="">Select product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={createForm.errors.product_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_plan_name">Plan Name</Label>
                                    <Input
                                        id="create_plan_name"
                                        value={createForm.data.plan_name}
                                        onChange={(e) =>
                                            createForm.setData('plan_name', e.target.value)
                                        }
                                        placeholder="Enter plan name"
                                        className="rounded-md"
                                    />
                                    <InputError message={createForm.errors.plan_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_price">Price</Label>
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

                                <div className="grid gap-2">
                                    <Label htmlFor="create_duration_days">Duration (days)</Label>
                                    <Input
                                        id="create_duration_days"
                                        type="number"
                                        min="1"
                                        value={createForm.data.duration_days}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'duration_days',
                                                e.target.value === '' ? '' : Number(e.target.value),
                                            )
                                        }
                                        placeholder="30"
                                        className="rounded-md"
                                    />
                                    <InputError message={createForm.errors.duration_days} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="create_description">Description</Label>
                                    <textarea
                                        id="create_description"
                                        name="description"
                                        title="Plan description"
                                        placeholder="Enter plan description"
                                        value={createForm.data.description}
                                        onChange={(e) =>
                                            createForm.setData('description', e.target.value)
                                        }
                                        className="min-h-[110px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                                    />
                                    <InputError message={createForm.errors.description} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="create_status">Status</Label>
                                    <select
                                        id="create_status"
                                        name="status"
                                        title="Select plan status"
                                        value={createForm.data.status}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'status',
                                                e.target.value as 'active' | 'inactive',
                                            )
                                        }
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
                                    {createForm.processing ? 'Creating...' : 'Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openEditModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Edit Plan
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Update selected plan details.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEdit}
                                title="Close edit plan modal"
                                aria-label="Close edit plan modal"
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_product_id">Product</Label>
                                    <select
                                        id="edit_product_id"
                                        name="product_id"
                                        title="Select product"
                                        value={editForm.data.product_id}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'product_id',
                                                e.target.value ? Number(e.target.value) : '',
                                            )
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                    >
                                        <option value="">Select product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={editForm.errors.product_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_plan_name">Plan Name</Label>
                                    <Input
                                        id="edit_plan_name"
                                        value={editForm.data.plan_name}
                                        onChange={(e) =>
                                            editForm.setData('plan_name', e.target.value)
                                        }
                                        className="rounded-md"
                                    />
                                    <InputError message={editForm.errors.plan_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_price">Price</Label>
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

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_duration_days">Duration (days)</Label>
                                    <Input
                                        id="edit_duration_days"
                                        type="number"
                                        min="1"
                                        value={editForm.data.duration_days}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'duration_days',
                                                e.target.value === '' ? '' : Number(e.target.value),
                                            )
                                        }
                                        className="rounded-md"
                                    />
                                    <InputError message={editForm.errors.duration_days} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor={`edit_description_${selectedPlan.id}`}>
                                        Description
                                    </Label>
                                    <textarea
                                        id={`edit_description_${selectedPlan.id}`}
                                        name="description"
                                        title="Plan description"
                                        placeholder="Enter plan description"
                                        value={editForm.data.description}
                                        onChange={(e) =>
                                            editForm.setData('description', e.target.value)
                                        }
                                        className="min-h-[110px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                                    />
                                    <InputError message={editForm.errors.description} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="edit_status">Status</Label>
                                    <select
                                        id="edit_status"
                                        name="status"
                                        title="Select plan status"
                                        value={editForm.data.status}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'status',
                                                e.target.value as 'active' | 'inactive',
                                            )
                                        }
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

            {openDeleteModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-slate-900">Delete Plan</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                This action will permanently remove the selected plan.
                            </p>
                        </div>

                        <div className="px-6 py-5">
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold">{selectedPlan.plan_name}</span>?
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={closeDelete}>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="rounded-md bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete Plan
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingPlan && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-slate-950/40"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Plan Details</h2>
                                <p className="text-sm text-slate-500">View full plan information</p>
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
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ID</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{viewingPlan.id}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Product</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{viewingPlan.product_name}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Plan Name</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{viewingPlan.plan_name}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {viewingPlan.description || 'No description'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Price</p>
                                    <p className="mt-1 text-sm text-slate-900">{formatPrice(viewingPlan.price)}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingPlan.duration_days} days</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                                    <p className="mt-1 text-sm capitalize text-slate-900">{viewingPlan.status}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created At</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingPlan.created_at ?? '-'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-slate-200 pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openEdit(viewingPlan);
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
                                        openDelete(viewingPlan);
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