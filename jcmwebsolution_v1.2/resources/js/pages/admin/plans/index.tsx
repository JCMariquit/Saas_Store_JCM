import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Layers3, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

import { ConfirmModal } from '@/components/admin-ui/confirm-modal';
import { DataTable } from '@/components/admin-ui/data-table';
import { FormModal } from '@/components/admin-ui/form-modal';
import { PageHero } from '@/components/admin-ui/page-hero';
import { SearchInput } from '@/components/admin-ui/search-input';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { TableActionButtons } from '@/components/admin-ui/table-action-buttons';

type ProductOption = {
    id: number;
    name: string;
};

type PlanStatus = 'active' | 'inactive' | 'archived';

type PlanRow = {
    id: number;
    product_id: number;
    product_name: string;
    plan_name: string;
    price: string | number;
    duration_days: number;
    billing_interval: 'monthly' | 'quarterly' | 'yearly' | 'custom';
    quarterly_price: string | number | null;
    yearly_price: string | number | null;
    trial_days: number;
    has_role_based_access: boolean;
    has_multi_branch: boolean;
    has_activity_logs: boolean;
    activity_log_retention_days: number | null;
    max_branches: number | null;
    max_warehouses: number | null;
    max_staff: number | null;
    sort_order: number;
    description: string | null;
    status: PlanStatus;
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
    quarterly_price: number | '';
    yearly_price: number | '';
    trial_days: number | '';
    has_role_based_access: boolean;
    has_multi_branch: boolean;
    has_activity_logs: boolean;
    activity_log_retention_days: number | '';
    max_branches: number | '';
    max_warehouses: number | '';
    max_staff: number | '';
    sort_order: number | '';
    description: string;
    status: PlanStatus;
};

const planTableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'product', label: 'Product' },
    { key: 'plan', label: 'Plan' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

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
        quarterly_price: '',
        yearly_price: '',
        trial_days: 0,
        has_role_based_access: false,
        has_multi_branch: false,
        has_activity_logs: false,
        activity_log_retention_days: '',
        max_branches: '',
        max_warehouses: '',
        max_staff: '',
        sort_order: 0,
        description: '',
        status: 'active',
    });

    const editForm = useForm<PlanForm>({
        product_id: '',
        plan_name: '',
        price: '',
        duration_days: '',
        quarterly_price: '',
        yearly_price: '',
        trial_days: 0,
        has_role_based_access: false,
        has_multi_branch: false,
        has_activity_logs: false,
        activity_log_retention_days: '',
        max_branches: '',
        max_warehouses: '',
        max_staff: '',
        sort_order: 0,
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
            quarterly_price: '',
            yearly_price: '',
            trial_days: 0,
            has_role_based_access: false,
            has_multi_branch: false,
            has_activity_logs: false,
            activity_log_retention_days: '',
            max_branches: '',
            max_warehouses: '',
            max_staff: '',
            sort_order: 0,
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
            quarterly_price: plan.quarterly_price === null ? '' : Number(plan.quarterly_price),
            yearly_price: plan.yearly_price === null ? '' : Number(plan.yearly_price),
            trial_days: plan.trial_days,
            has_role_based_access: plan.has_role_based_access,
            has_multi_branch: plan.has_multi_branch,
            has_activity_logs: plan.has_activity_logs,
            activity_log_retention_days: plan.activity_log_retention_days ?? '',
            max_branches: plan.max_branches ?? '',
            max_warehouses: plan.max_warehouses ?? '',
            max_staff: plan.max_staff ?? '',
            sort_order: plan.sort_order,
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

    const resetSearch = () => {
        setSearch('');
        router.get(
            route('admin.plans.index'),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const resultsText = useMemo(() => {
        if (!plans.total) return 'No plans found.';
        return `Showing ${plans.from ?? 0} to ${plans.to ?? 0} of ${plans.total} plans`;
    }, [plans.from, plans.to, plans.total]);

    const getStatusBadgeClass = (status: PlanRow['status']) => {
        if (status === 'active') {
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
        }

        return 'border-border bg-muted text-foreground';
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

            <div className="bg-background min-h-screen p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Plans"
                        description="Manage pricing tiers and duration for each product."
                        actionLabel="Create Plan"
                        actionIcon={<Plus className="h-4 w-4" />}
                        onAction={openCreate}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard
                            title="Total Plans"
                            value={stats.total_plans}
                            description="All plans currently available in the system."
                            icon={<Layers3 className="h-5 w-5" />}
                            tone="blue"
                        />

                        <StatsCard
                            title="Active Plans"
                            value={stats.active_plans}
                            description="Plans currently available for subscriptions and orders."
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            tone="emerald"
                        />

                        <StatsCard
                            title="Inactive Plans"
                            value={stats.inactive_plans}
                            description="Plans currently hidden or disabled from active use."
                            icon={<XCircle className="h-5 w-5" />}
                            tone="indigo"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard
                        title="Plan List"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput id="plan-search" value={search} onChange={setSearch} placeholder="Search plan or product..." />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetSearch}
                                    className="border-border bg-card text-foreground hover:border-primary/20 hover:bg-primary/[0.06] hover:text-primary h-11 rounded-xl px-4"
                                >
                                    Reset Search
                                </Button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={planTableColumns}
                            empty={plans.data.length === 0}
                            emptyMessage="No plans found."
                            colSpan={5}
                            striped
                            hoverable
                        >
                            {plans.data.map((plan) => (
                                <tr key={plan.id} className="cursor-pointer" onClick={() => openViewDrawer(plan)}>
                                    <td className="text-foreground px-4 py-4 text-sm">{plan.id}</td>

                                    <td className="text-foreground px-4 py-4 font-medium">{plan.product_name}</td>

                                    <td className="px-4 py-4">
                                        <div className="text-foreground font-medium">{plan.plan_name}</div>
                                        <div className="text-muted-foreground mt-1 max-w-[320px] truncate text-xs">
                                            {plan.description || 'No description'}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
                                                plan.status,
                                            )}`}
                                        >
                                            {plan.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                        <TableActionButtons name={plan.plan_name} onEdit={() => openEdit(plan)} onDelete={() => openDelete(plan)} />
                                    </td>
                                </tr>
                            ))}
                        </DataTable>

                        {plans.links.length > 3 && (
                            <div className="mt-5 flex flex-wrap gap-2">
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
                                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                            link.active
                                                ? 'border-primary from-primary to-primary/80 bg-gradient-to-r text-white shadow-md'
                                                : link.url
                                                  ? 'border-border bg-card text-foreground hover:border-primary/20 hover:bg-primary/[0.06] hover:text-primary'
                                                  : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
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
                open={openCreateModal}
                title="Create Plan"
                description="Add a new pricing plan for a product."
                onClose={closeCreate}
                tone="blue"
            >
                <form onSubmit={submitCreate} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="create_product_id">Product</Label>
                            <select
                                id="create_product_id"
                                name="product_id"
                                title="Select product"
                                value={createForm.data.product_id}
                                onChange={(e) => createForm.setData('product_id', e.target.value ? Number(e.target.value) : '')}
                                className="border-border bg-card text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
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
                                onChange={(e) => createForm.setData('plan_name', e.target.value)}
                                placeholder="Enter plan name"
                                className="rounded-xl"
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
                                onChange={(e) => createForm.setData('price', e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="0.00"
                                className="rounded-xl"
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
                                onChange={(e) => createForm.setData('duration_days', e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="30"
                                className="rounded-xl"
                            />
                            <InputError message={createForm.errors.duration_days} />
                        </div>

                        <div className="border-border/70 bg-muted/20 rounded-2xl border p-4 md:col-span-2">
                            <div className="mb-4">
                                <p className="text-foreground text-sm font-semibold">Billing Price Matrix</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    The base price above is the default interval. Add quarterly and yearly prices used by connected product checkout
                                    pages.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_quarterly_price">Quarterly price</Label>
                                    <Input
                                        id="create_quarterly_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.data.quarterly_price}
                                        onChange={(e) => createForm.setData('quarterly_price', e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Optional"
                                        className="rounded-xl"
                                    />
                                    <InputError message={createForm.errors.quarterly_price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create_yearly_price">Yearly price</Label>
                                    <Input
                                        id="create_yearly_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={createForm.data.yearly_price}
                                        onChange={(e) => createForm.setData('yearly_price', e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Optional"
                                        className="rounded-xl"
                                    />
                                    <InputError message={createForm.errors.yearly_price} />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="create_description">Description</Label>
                            <textarea
                                id="create_description"
                                name="description"
                                title="Plan description"
                                placeholder="Enter plan description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                className="border-border focus:border-primary min-h-[110px] rounded-xl border px-3 py-2 text-sm transition outline-none"
                            />
                            <InputError message={createForm.errors.description} />
                        </div>

                        <div className="border-border/70 bg-muted/20 rounded-2xl border p-4 md:col-span-2">
                            <div className="mb-4">
                                <p className="text-foreground text-sm font-semibold">Access & Limits</p>
                                <p className="text-muted-foreground mt-1 text-xs">Configure the capabilities enforced by connected JCM systems.</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    ['has_role_based_access', 'Role-based access'],
                                    ['has_multi_branch', 'Multi-branch'],
                                    ['has_activity_logs', 'Activity logs'],
                                ].map(([field, label]) => (
                                    <label
                                        key={field}
                                        className="border-border/70 bg-background/40 text-foreground flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={createForm.data[field as 'has_role_based_access' | 'has_multi_branch' | 'has_activity_logs']}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    field as 'has_role_based_access' | 'has_multi_branch' | 'has_activity_logs',
                                                    e.target.checked,
                                                )
                                            }
                                            className="border-border text-primary focus:ring-primary size-4 rounded"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    ['max_branches', 'Max branches'],
                                    ['max_warehouses', 'Max warehouses'],
                                    ['max_staff', 'Max team members'],
                                    ['trial_days', 'Trial days'],
                                    ['activity_log_retention_days', 'Log retention days'],
                                    ['sort_order', 'Sort order'],
                                ].map(([field, label]) => (
                                    <div key={field} className="grid gap-2">
                                        <Label htmlFor="create_{field}">{label}</Label>
                                        <Input
                                            id={`create_${field}`}
                                            type="number"
                                            min="0"
                                            value={
                                                createForm.data[
                                                    field as
                                                        | 'max_branches'
                                                        | 'max_warehouses'
                                                        | 'max_staff'
                                                        | 'trial_days'
                                                        | 'activity_log_retention_days'
                                                        | 'sort_order'
                                                ]
                                            }
                                            onChange={(e) =>
                                                createForm.setData(
                                                    field as
                                                        | 'max_branches'
                                                        | 'max_warehouses'
                                                        | 'max_staff'
                                                        | 'trial_days'
                                                        | 'activity_log_retention_days'
                                                        | 'sort_order',
                                                    e.target.value === '' ? '' : Number(e.target.value),
                                                )
                                            }
                                            className="rounded-xl"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="create_status">Status</Label>
                            <select
                                id="create_status"
                                name="status"
                                title="Select plan status"
                                value={createForm.data.status}
                                onChange={(e) => createForm.setData('status', e.target.value as PlanStatus)}
                                className="border-border bg-card text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                            <InputError message={createForm.errors.status} />
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closeCreate} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createForm.processing}
                            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl bg-gradient-to-r text-white"
                        >
                            {createForm.processing ? 'Creating...' : 'Create Plan'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={openEditModal && !!selectedPlan}
                title="Edit Plan"
                description="Update selected plan details."
                onClose={closeEdit}
                tone="indigo"
            >
                <form onSubmit={submitEdit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_product_id">Product</Label>
                            <select
                                id="edit_product_id"
                                name="product_id"
                                title="Select product"
                                value={editForm.data.product_id}
                                onChange={(e) => editForm.setData('product_id', e.target.value ? Number(e.target.value) : '')}
                                className="border-border bg-card text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
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
                                onChange={(e) => editForm.setData('plan_name', e.target.value)}
                                className="rounded-xl"
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
                                onChange={(e) => editForm.setData('price', e.target.value === '' ? '' : Number(e.target.value))}
                                className="rounded-xl"
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
                                onChange={(e) => editForm.setData('duration_days', e.target.value === '' ? '' : Number(e.target.value))}
                                className="rounded-xl"
                            />
                            <InputError message={editForm.errors.duration_days} />
                        </div>

                        <div className="border-border/70 bg-muted/20 rounded-2xl border p-4 md:col-span-2">
                            <div className="mb-4">
                                <p className="text-foreground text-sm font-semibold">Billing Price Matrix</p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Update the quarterly and yearly prices consumed by the storefront and subscription checkout.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_quarterly_price">Quarterly price</Label>
                                    <Input
                                        id="edit_quarterly_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editForm.data.quarterly_price}
                                        onChange={(e) => editForm.setData('quarterly_price', e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Optional"
                                        className="rounded-xl"
                                    />
                                    <InputError message={editForm.errors.quarterly_price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_yearly_price">Yearly price</Label>
                                    <Input
                                        id="edit_yearly_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editForm.data.yearly_price}
                                        onChange={(e) => editForm.setData('yearly_price', e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Optional"
                                        className="rounded-xl"
                                    />
                                    <InputError message={editForm.errors.yearly_price} />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor={`edit_description_${selectedPlan?.id ?? 'plan'}`}>Description</Label>
                            <textarea
                                id={`edit_description_${selectedPlan?.id ?? 'plan'}`}
                                name="description"
                                title="Plan description"
                                placeholder="Enter plan description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                className="border-border focus:border-primary min-h-[110px] rounded-xl border px-3 py-2 text-sm transition outline-none"
                            />
                            <InputError message={editForm.errors.description} />
                        </div>

                        <div className="border-border/70 bg-muted/20 rounded-2xl border p-4 md:col-span-2">
                            <div className="mb-4">
                                <p className="text-foreground text-sm font-semibold">Access & Limits</p>
                                <p className="text-muted-foreground mt-1 text-xs">Configure the capabilities enforced by connected JCM systems.</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    ['has_role_based_access', 'Role-based access'],
                                    ['has_multi_branch', 'Multi-branch'],
                                    ['has_activity_logs', 'Activity logs'],
                                ].map(([field, label]) => (
                                    <label
                                        key={field}
                                        className="border-border/70 bg-background/40 text-foreground flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={editForm.data[field as 'has_role_based_access' | 'has_multi_branch' | 'has_activity_logs']}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    field as 'has_role_based_access' | 'has_multi_branch' | 'has_activity_logs',
                                                    e.target.checked,
                                                )
                                            }
                                            className="border-border text-primary focus:ring-primary size-4 rounded"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    ['max_branches', 'Max branches'],
                                    ['max_warehouses', 'Max warehouses'],
                                    ['max_staff', 'Max team members'],
                                    ['trial_days', 'Trial days'],
                                    ['activity_log_retention_days', 'Log retention days'],
                                    ['sort_order', 'Sort order'],
                                ].map(([field, label]) => (
                                    <div key={field} className="grid gap-2">
                                        <Label htmlFor="edit_{field}">{label}</Label>
                                        <Input
                                            id={`edit_${field}`}
                                            type="number"
                                            min="0"
                                            value={
                                                editForm.data[
                                                    field as
                                                        | 'max_branches'
                                                        | 'max_warehouses'
                                                        | 'max_staff'
                                                        | 'trial_days'
                                                        | 'activity_log_retention_days'
                                                        | 'sort_order'
                                                ]
                                            }
                                            onChange={(e) =>
                                                editForm.setData(
                                                    field as
                                                        | 'max_branches'
                                                        | 'max_warehouses'
                                                        | 'max_staff'
                                                        | 'trial_days'
                                                        | 'activity_log_retention_days'
                                                        | 'sort_order',
                                                    e.target.value === '' ? '' : Number(e.target.value),
                                                )
                                            }
                                            className="rounded-xl"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="edit_status">Status</Label>
                            <select
                                id="edit_status"
                                name="status"
                                title="Select plan status"
                                value={editForm.data.status}
                                onChange={(e) => editForm.setData('status', e.target.value as PlanStatus)}
                                className="border-border bg-card text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                            <InputError message={editForm.errors.status} />
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closeEdit} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={editForm.processing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                        >
                            {editForm.processing ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmModal
                open={openDeleteModal && !!selectedPlan}
                title="Delete Plan"
                description="This action will permanently remove the selected plan."
                message={`Are you sure you want to delete ${selectedPlan?.plan_name ?? ''}?`}
                confirmLabel="Delete Plan"
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />

            {viewingPlan && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={closeViewDrawer} />

                    <div className="border-border bg-card absolute top-0 right-0 h-full w-full max-w-md border-l shadow-2xl">
                        <div className="border-border from-primary/[0.07] to-card flex items-center justify-between border-b bg-gradient-to-r px-6 py-4">
                            <div>
                                <h2 className="text-foreground text-lg font-bold">Plan Details</h2>
                                <p className="text-muted-foreground text-sm">View full plan information</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewDrawer}
                                className="border-border text-muted-foreground hover:bg-muted rounded-xl border px-3 py-2 text-sm"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-5 overflow-y-auto p-6">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">ID</p>
                                <p className="text-foreground mt-1 text-sm font-medium">{viewingPlan.id}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Product</p>
                                <p className="text-foreground mt-1 text-sm font-medium">{viewingPlan.product_name}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Plan Name</p>
                                <p className="text-foreground mt-1 text-sm font-medium">{viewingPlan.plan_name}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Description</p>
                                <p className="text-muted-foreground mt-1 text-sm leading-6">{viewingPlan.description || 'No description'}</p>
                            </div>

                            <div className="border-border/70 bg-muted/20 rounded-xl border p-4">
                                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Plan capabilities</p>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                    <span>
                                        Role access: <strong>{viewingPlan.has_role_based_access ? 'Yes' : 'No'}</strong>
                                    </span>
                                    <span>
                                        Multi-branch: <strong>{viewingPlan.has_multi_branch ? 'Yes' : 'No'}</strong>
                                    </span>
                                    <span>
                                        Branches: <strong>{viewingPlan.max_branches ?? 'Unlimited'}</strong>
                                    </span>
                                    <span>
                                        Warehouses: <strong>{viewingPlan.max_warehouses ?? 'Unlimited'}</strong>
                                    </span>
                                    <span>
                                        Team: <strong>{viewingPlan.max_staff ?? 'Unlimited'}</strong>
                                    </span>
                                    <span>
                                        Activity logs: <strong>{viewingPlan.has_activity_logs ? 'Enabled' : 'Disabled'}</strong>
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Price</p>
                                    <p className="text-foreground mt-1 text-sm">{formatPrice(viewingPlan.price)}</p>
                                    <p className="text-muted-foreground mt-1 text-[10px]">
                                        Quarterly:{' '}
                                        {viewingPlan.quarterly_price !== null ? formatPrice(viewingPlan.quarterly_price) : 'Not configured'}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-[10px]">
                                        Yearly: {viewingPlan.yearly_price !== null ? formatPrice(viewingPlan.yearly_price) : 'Not configured'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Duration</p>
                                    <p className="text-foreground mt-1 text-sm">{viewingPlan.duration_days} days</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Status</p>
                                    <p className="text-foreground mt-1 text-sm capitalize">{viewingPlan.status}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Created At</p>
                                    <p className="text-foreground mt-1 text-sm">{viewingPlan.created_at ?? '-'}</p>
                                </div>
                            </div>

                            <div className="border-border flex gap-3 border-t pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 rounded-xl"
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
                                    className="inline-flex items-center gap-2 rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-300"
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
