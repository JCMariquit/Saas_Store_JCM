import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Users as UsersIcon, X } from 'lucide-react';
import { useState } from 'react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string | null;
    created_at: string | null;
}

interface PaginatedUsers {
    data: UserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PageProps {
    filters: {
        search?: string;
    };
    users: PaginatedUsers;
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Users',
        href: '/users',
    },
];

function getRoleClasses(role: string | null) {
    const value = (role ?? '').toLowerCase();

    if (value === 'admin') {
        return 'border-sky-200 bg-sky-100 text-sky-700';
    }

    if (value === 'client') {
        return 'border-emerald-200 bg-emerald-100 text-emerald-700';
    }

    return 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function UsersIndex({ filters, users, flash }: PageProps) {
    const flashSuccess = flash?.success;

    const [search, setSearch] = useState(filters.search ?? '');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client',
    });

    const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.get(
            route('users.index'),
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        createForm.setData('role', 'client');
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setShowCreateModal(false);
    };

    const submitCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        createForm.post(route('users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_20%),radial-gradient(circle_at_bottom_center,rgba(125,211,252,0.16),transparent_24%),linear-gradient(135deg,#e0f2fe,#f8fbff,#dbeafe)] p-4 md:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]" />
                <div className="pointer-events-none absolute -left-16 -top-16 h-[220px] w-[220px] rounded-full bg-sky-400/20 blur-[70px]" />
                <div className="pointer-events-none absolute -right-16 bottom-0 h-[260px] w-[260px] rounded-full bg-blue-500/15 blur-[80px]" />

                <div className="relative z-10 flex flex-col gap-5">
                    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.10)] backdrop-blur-[20px]">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/15 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 sm:text-[13px]">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 shadow-[0_0_0_6px_rgba(14,165,233,0.12)]" />
                                    JCM Web Solution
                                </div>

                                <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-slate-900 md:text-4xl">
                                    User
                                    <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                                        {' '}management
                                    </span>
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                                    View and manage administrator and client accounts inside the control panel.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                    <div className="text-2xl font-extrabold text-slate-900">{users.total}</div>
                                    <div className="mt-1 text-xs font-medium text-slate-500">Total Users</div>
                                </div>
                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                    <div className="text-2xl font-extrabold text-slate-900">{users.current_page}</div>
                                    <div className="mt-1 text-xs font-medium text-slate-500">Page</div>
                                </div>
                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                    <div className="text-2xl font-extrabold text-slate-900">{users.last_page}</div>
                                    <div className="mt-1 text-xs font-medium text-slate-500">Last Page</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {flashSuccess && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                            {flashSuccess}
                        </div>
                    )}

                    <div className="rounded-[26px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700">
                                    <UsersIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Users List</h2>
                                    <p className="text-sm text-slate-500">All registered users in the system</p>
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                                <form onSubmit={submitSearch} className="flex w-full max-w-md items-center gap-3">
                                    <div className="relative w-full">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search name, email, or role..."
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5"
                                    >
                                        Search
                                    </button>
                                </form>

                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add 
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-[24px] border border-blue-100 bg-white/80">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-sky-50/70">
                                        <tr>
                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">ID</th>
                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Name</th>
                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Email</th>
                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Role</th>
                                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Created</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.data.length > 0 ? (
                                            users.data.map((user) => (
                                                <tr key={user.id} className="border-t border-slate-100">
                                                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                                                        {user.id}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                                        {user.name}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getRoleClasses(user.role)}`}>
                                                            {user.role ?? 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-500">
                                                        {user.created_at ?? '—'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-800">{users.data.length}</span> of{' '}
                                <span className="font-semibold text-slate-800">{users.total}</span> users
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {users.links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                                link.active
                                                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]'
                                                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-sky-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-[28px] border border-white/60 bg-white/85 shadow-[0_25px_60px_rgba(15,23,42,0.18)] backdrop-blur-[20px]">
                            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-5">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">Add User</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Fill up the important fields to create a new user.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={submitCreateUser} className="px-6 py-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        />
                                        {createForm.errors.name && (
                                            <p className="mt-2 text-sm text-red-600">{createForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        />
                                        {createForm.errors.email && (
                                            <p className="mt-2 text-sm text-red-600">{createForm.errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            placeholder="Enter password"
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        />
                                        {createForm.errors.password && (
                                            <p className="mt-2 text-sm text-red-600">{createForm.errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={createForm.data.password_confirmation}
                                            onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm password"
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Role
                                        </label>
                                        <select
                                            value={createForm.data.role}
                                            onChange={(e) => createForm.setData('role', e.target.value)}
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        >
                                            <option value="client">Client</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {createForm.errors.role && (
                                            <p className="mt-2 text-sm text-red-600">{createForm.errors.role}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {createForm.processing ? 'Saving...' : 'Create User'}
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