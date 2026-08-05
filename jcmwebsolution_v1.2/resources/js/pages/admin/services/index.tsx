import AppLayout from '@/layouts/admin-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Pencil,
    Trash2,
    BriefcaseBusiness,
    CheckCircle2,
    XCircle,
    Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

import { StatsCard } from '@/components/admin-ui/stats-card';
import { SectionCard } from '@/components/admin-ui/section-card';
import { SearchInput } from '@/components/admin-ui/search-input';
import { DataTable } from '@/components/admin-ui/data-table';
import { PageHero } from '@/components/admin-ui/page-hero';
import { TableActionButtons } from '@/components/admin-ui/table-action-buttons';
import { FormModal } from '@/components/admin-ui/form-modal';
import { ConfirmModal } from '@/components/admin-ui/confirm-modal';

type ServiceItem = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    thumbnail?: string | null;
    service_type: string;
    pricing_type: string;
    base_price: number | null;
    base_price_label: string;
    status: string;
    sort_order: number;
    created_at: string | null;
};

type PageProps = {
    services: ServiceItem[];
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    filters: {
        search: string;
    };
    flash?: {
        success?: string;
    };
};

const breadcrumbs = [
    {
        title: 'Services',
        href: '/admin/services',
    },
];

const emptyForm = {
    code: '',
    name: '',
    description: '',
    service_type: 'custom',
    pricing_type: 'quote',
    base_price: '',
    status: 'active',
    sort_order: '0',
};

const serviceTableColumns = [
    { key: 'code', label: 'Code' },
    { key: 'service', label: 'Service' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

export default function ServicesIndex() {
    const { props } = usePage<PageProps>();
    const { services, stats, filters, flash } = props;

    const [search, setSearch] = useState(filters.search || '');
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
    const [viewingService, setViewingService] = useState<ServiceItem | null>(null);

    const { data, setData, processing, reset, errors } = useForm({
        ...emptyForm,
    });

    const filteredServices = useMemo(() => {
        if (!search.trim()) return services;

        const keyword = search.toLowerCase();

        return services.filter((service) =>
            [
                service.code,
                service.name,
                service.description ?? '',
                service.service_type,
                service.pricing_type,
                service.status,
            ].some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [services, search]);

    const openEditServiceModal = (service: ServiceItem) => {
        setEditingService(service);
        setData({
            code: service.code ?? '',
            name: service.name ?? '',
            description: service.description ?? '',
            service_type: service.service_type ?? 'custom',
            pricing_type: service.pricing_type ?? 'quote',
            base_price: service.base_price !== null ? String(service.base_price) : '',
            status: service.status ?? 'active',
            sort_order: String(service.sort_order ?? 0),
        });
        setOpenEditModal(true);
    };

    const closeEditModal = () => {
        setOpenEditModal(false);
        setEditingService(null);
        reset();
    };

    const openDelete = (service: ServiceItem) => {
        setSelectedService(service);
        setOpenDeleteModal(true);
    };

    const closeDelete = () => {
        setSelectedService(null);
        setOpenDeleteModal(false);
    };

    const openViewDrawer = (service: ServiceItem) => {
        setViewingService(service);
    };

    const closeViewDrawer = () => {
        setViewingService(null);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingService) return;

        const payload = {
            ...data,
            base_price: data.pricing_type === 'quote' ? null : data.base_price,
        };

        router.put(route('admin.services.update', editingService.id), payload, {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const confirmDelete = () => {
        if (!selectedService) return;

        router.delete(route('admin.services.destroy', selectedService.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeDelete();
            },
        });
    };

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
            case 'inactive':
                return 'border-red-500/20 bg-red-500/10 text-red-300';
            case 'archived':
                return 'border-border bg-muted text-muted-foreground';
            default:
                return 'border-border bg-muted text-foreground';
        }
    };

    const resultsText = useMemo(() => {
        return `Showing ${filteredServices.length} of ${services.length} services`;
    }, [filteredServices.length, services.length]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />

            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        eyebrow="JCM Admin"
                        title="Services"
                        description="Manage your business services before publishing them to your public page."
                        actionLabel="Create Service"
                        onAction={() => router.visit(route('admin.services.create'))}
                        actionIcon={<Plus className="h-4 w-4" />}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard
                            title="Total Services"
                            value={stats.total}
                            description="All service offerings currently available in your catalog."
                            icon={<BriefcaseBusiness className="h-5 w-5" />}
                            tone="blue"
                        />

                        <StatsCard
                            title="Active Services"
                            value={stats.active}
                            description="Services that are available for public listing or client use."
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            tone="emerald"
                        />

                        <StatsCard
                            title="Inactive Services"
                            value={stats.inactive}
                            description="Services currently hidden or disabled from active use."
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
                        title="Service List"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput
                                    id="service-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search service..."
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSearch('')}
                                    className="h-11 rounded-xl border-border bg-card px-4 text-foreground hover:border-primary/20 hover:bg-primary/[0.06] hover:text-primary"
                                >
                                    Reset Search
                                </Button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={serviceTableColumns}
                            empty={filteredServices.length === 0}
                            emptyMessage="No services found."
                            colSpan={4}
                            striped
                            hoverable
                        >
                            {filteredServices.map((service) => (
                                <tr
                                    key={service.id}
                                    className="cursor-pointer"
                                    onClick={() => openViewDrawer(service)}
                                >
                                    <td className="px-5 py-4 font-medium text-foreground">
                                        {service.code}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="font-medium text-foreground">{service.name}</div>
                                        <div className="mt-1 max-w-[320px] truncate text-xs text-muted-foreground">
                                            {service.description || 'No description'}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                                                service.status,
                                            )}`}
                                        >
                                            {service.status}
                                        </span>
                                    </td>

                                    <td
                                        className="px-5 py-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <TableActionButtons
                                            name={service.name}
                                            onEdit={() => openEditServiceModal(service)}
                                            onDelete={() => openDelete(service)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    </SectionCard>
                </div>
            </div>

            <FormModal
                open={openEditModal}
                title="Edit Service"
                description="Update the service details below."
                onClose={closeEditModal}
                tone="indigo"
            >
                <form onSubmit={submitEdit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="rounded-xl"
                                placeholder="SRV-WEB-001"
                            />
                            <InputError message={errors.code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="rounded-xl"
                                placeholder="Custom Web Development"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_type">Service Type</Label>
                            <select
                                id="service_type"
                                value={data.service_type}
                                onChange={(e) => setData('service_type', e.target.value)}
                                className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary"
                            >
                                <option value="custom">Custom</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="support">Support</option>
                                <option value="consulting">Consulting</option>
                                <option value="implementation">Implementation</option>
                                <option value="other">Other</option>
                            </select>
                            <InputError message={errors.service_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="pricing_type">Pricing Type</Label>
                            <select
                                id="pricing_type"
                                value={data.pricing_type}
                                onChange={(e) => setData('pricing_type', e.target.value)}
                                className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary"
                            >
                                <option value="quote">Quote</option>
                                <option value="fixed">Fixed</option>
                            </select>
                            <InputError message={errors.pricing_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="base_price">Base Price</Label>
                            <Input
                                id="base_price"
                                type="number"
                                step="0.01"
                                value={data.base_price}
                                onChange={(e) => setData('base_price', e.target.value)}
                                disabled={data.pricing_type === 'quote'}
                                className="rounded-xl disabled:bg-muted"
                                placeholder="0.00"
                            />
                            <InputError message={errors.base_price} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-primary"
                                placeholder="Describe the service..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', e.target.value)}
                                className="rounded-xl"
                                placeholder="0"
                            />
                            <InputError message={errors.sort_order} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeEditModal}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 disabled:opacity-70"
                        >
                            {processing ? 'Saving...' : 'Update Service'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmModal
                open={openDeleteModal && !!selectedService}
                title="Delete Service"
                description="This action will permanently remove the selected service."
                message={`Are you sure you want to delete ${selectedService?.name ?? ''}?`}
                confirmLabel="Delete Service"
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />

            {viewingService && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
                        onClick={closeViewDrawer}
                    />

                    <div className="absolute top-0 right-0 h-full w-full max-w-md border-l border-border bg-card shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/[0.06] to-card px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Service Details</h2>
                                <p className="text-sm text-muted-foreground">View full service information</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewDrawer}
                                className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-5 overflow-y-auto p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{viewingService.code}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{viewingService.name}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {viewingService.description || 'No description'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service Type</p>
                                    <p className="mt-1 text-sm capitalize text-foreground">{viewingService.service_type}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pricing Type</p>
                                    <p className="mt-1 text-sm capitalize text-foreground">{viewingService.pricing_type}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Base Price</p>
                                    <p className="mt-1 text-sm text-foreground">{viewingService.base_price_label}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                                    <p className="mt-1 text-sm capitalize text-foreground">{viewingService.status}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort Order</p>
                                <p className="mt-1 text-sm text-foreground">{viewingService.sort_order}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created At</p>
                                <p className="mt-1 text-sm text-foreground">{viewingService.created_at || '-'}</p>
                            </div>

                            <div className="flex gap-3 border-t border-border pt-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openEditServiceModal(viewingService);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border-red-500/20 text-red-600 hover:bg-red-500/10"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openDelete(viewingService);
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