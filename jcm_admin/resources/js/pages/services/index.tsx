import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    BriefcaseBusiness,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ServiceItem = {
    id: number;
    code: string;
    name: string;
    description: string | null;
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

export default function ServicesIndex() {
    const { props } = usePage<PageProps>();
    const { services, stats, filters } = props;

    const [search, setSearch] = useState(filters.search || '');
    const [openModal, setOpenModal] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);
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

    const openCreateModal = () => {
        setEditingService(null);
        reset();
        setData({ ...emptyForm });
        setOpenModal(true);
    };

    const openEditModal = (service: ServiceItem) => {
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
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditingService(null);
        reset();
    };

    const openViewDrawer = (service: ServiceItem) => {
        setViewingService(service);
    };

    const closeViewDrawer = () => {
        setViewingService(null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...data,
            base_price: data.pricing_type === 'quote' ? null : data.base_price,
        };

        if (editingService) {
            router.put(route('admin.services.update', editingService.id), payload, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
            return;
        }

        router.post(route('admin.services.store'), payload, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const deleteService = (service: ServiceItem) => {
        if (!confirm(`Delete service "${service.name}"?`)) return;

        router.delete(route('admin.services.destroy', service.id), {
            preserveScroll: true,
        });
    };

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-green-200 bg-green-100 text-green-700';
            case 'inactive':
                return 'border-red-200 bg-red-100 text-red-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />

            <div className="space-y-6 p-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Services</h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Manage your business services before publishing them to your public page.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Plus className="h-4 w-4" />
                            Create Service
                        </button>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Services</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
                            </div>
                            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                                <BriefcaseBusiness className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Active Services</p>
                                <p className="mt-2 text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="rounded-xl bg-green-100 p-3 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Inactive Services</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.inactive}</p>
                            </div>
                            <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
                                <XCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-1xl font-bold text-slate-900">Service List</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Showing {filteredServices.length} of {services.length} services
                            </p>
                        </div>

                        <div className="relative w-full md:w-[360px]">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search service..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left text-slate-600">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Code</th>
                                    <th className="px-5 py-4 font-semibold">Service</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.length > 0 ? (
                                    filteredServices.map((service) => (
                                        <tr
                                            key={service.id}
                                            className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                                            onClick={() => openViewDrawer(service)}
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-900">
                                                {service.code}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-900">{service.name}</div>
                                                <div className="mt-1 max-w-[320px] truncate text-xs text-slate-500">
                                                    {service.description || 'No description'}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(service.status)}`}
                                                >
                                                    {service.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div
                                                    className="flex items-center justify-center gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => openViewDrawer(service)}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Edit service"
                                                        aria-label="Edit service"
                                                        onClick={() => openEditModal(service)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete service"
                                                        aria-label="Delete service"
                                                        onClick={() => deleteService(service)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                                            No services found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {openModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingService ? 'Edit Service' : 'Create Service'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Fill out the service details below.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-5 p-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="code"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Code
                                        </label>
                                        <input
                                            id="code"
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                            placeholder="SRV-WEB-001"
                                        />
                                        {errors.code && (
                                            <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                            placeholder="Custom Web Development"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="service_type"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Service Type
                                        </label>
                                        <select
                                            id="service_type"
                                            value={data.service_type}
                                            onChange={(e) => setData('service_type', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                        >
                                            <option value="custom">Custom</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="support">Support</option>
                                            <option value="consulting">Consulting</option>
                                            <option value="implementation">Implementation</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.service_type && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.service_type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="pricing_type"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Pricing Type
                                        </label>
                                        <select
                                            id="pricing_type"
                                            value={data.pricing_type}
                                            onChange={(e) => setData('pricing_type', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                        >
                                            <option value="quote">Quote</option>
                                            <option value="fixed">Fixed</option>
                                        </select>
                                        {errors.pricing_type && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.pricing_type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="base_price"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Base Price
                                        </label>
                                        <input
                                            id="base_price"
                                            type="number"
                                            step="0.01"
                                            value={data.base_price}
                                            onChange={(e) => setData('base_price', e.target.value)}
                                            disabled={data.pricing_type === 'quote'}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-100"
                                            placeholder="0.00"
                                        />
                                        {errors.base_price && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.base_price}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="status"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && (
                                            <p className="mt-1 text-xs text-red-500">{errors.status}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label
                                            htmlFor="description"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                            placeholder="Describe the service..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="sort_order"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Sort Order
                                        </label>
                                        <input
                                            id="sort_order"
                                            type="number"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                            placeholder="0"
                                        />
                                        {errors.sort_order && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.sort_order}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : editingService
                                              ? 'Update Service'
                                              : 'Create Service'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {viewingService && (
                    <div className="fixed inset-0 z-50">
                        <div
                            className="absolute inset-0 bg-slate-950/40"
                            onClick={closeViewDrawer}
                        />

                        <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Service Details</h2>
                                    <p className="text-sm text-slate-500">View full service information</p>
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
                                    <p className="mt-1 text-sm font-medium text-slate-900">{viewingService.code}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{viewingService.name}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {viewingService.description || 'No description'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Service Type</p>
                                        <p className="mt-1 text-sm text-slate-900 capitalize">{viewingService.service_type}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pricing Type</p>
                                        <p className="mt-1 text-sm text-slate-900 capitalize">{viewingService.pricing_type}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Base Price</p>
                                        <p className="mt-1 text-sm text-slate-900">{viewingService.base_price_label}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                                        <p className="mt-1 text-sm text-slate-900 capitalize">{viewingService.status}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sort Order</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingService.sort_order}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created At</p>
                                    <p className="mt-1 text-sm text-slate-900">{viewingService.created_at || '-'}</p>
                                </div>

                                <div className="flex gap-3 border-t border-slate-200 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeViewDrawer();
                                            openEditModal(viewingService);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeViewDrawer();
                                            deleteService(viewingService);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}