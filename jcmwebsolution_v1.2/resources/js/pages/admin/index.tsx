import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminIndex() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Admin Dashboard 🚀
                    </h1>

                    <p className="mt-1 text-sm text-slate-600">
                        Manage your SaaS system here.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Users</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-800">0</h2>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Orders</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-800">0</h2>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Revenue</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-800">₱0.00</h2>
                    </div>
                </div>

                <div className="min-h-[300px] rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-slate-600">
                        This is your admin control panel content area.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}