import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminIndex() {

    const logout = () => {
        router.post(route('logout'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">

                {/* Header */}
                <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Admin Dashboard 🚀
                        </h1>

                        <p className="mt-1 text-sm text-slate-600">
                            Manage your SaaS system here.
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>

                {/* Cards */}
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

                {/* Main Panel */}
                <div className="rounded-xl bg-white p-6 shadow-sm min-h-[300px]">
                    <p className="text-slate-600">
                        This is your admin control panel content area.
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}