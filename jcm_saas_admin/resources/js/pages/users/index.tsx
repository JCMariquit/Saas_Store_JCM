import DashboardHero from '@/components/jcm_components/dashboard-hero';
import DashboardShell from '@/components/jcm_components/dashboard-shell';
import SectionCard from '@/components/jcm_components/section-card';
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
        return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300';
    }

    if (value === 'client') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300';
    }

    return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
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

            <DashboardShell>
                <DashboardHero
                    title="User"
                    accentTitle="management"
                    description="View and manage administrator and client accounts inside the control panel."
                    stats={[
                        { label: 'Total Users', value: String(users.total) },
                        { label: 'Page', value: String(users.current_page) },
                        { label: 'Last Page', value: String(users.last_page) },
                    ]}
                />

                {flashSuccess && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {flashSuccess}
                    </div>
                )}

                <SectionCard className="p-4 md:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                                <UsersIcon className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 md:text-lg">
                                    Users List
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    All registered users in the system
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                            <form onSubmit={submitSearch} className="flex w-full max-w-md items-center gap-3">
                                <div className="relative w-full">
                                    <label htmlFor="user-search" className="sr-only">
                                        Search users
                                    </label>

                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="user-search"
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, email, or role..."
                                        className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="h-11 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700"
                                >
                                    Search
                                </button>
                            </form>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                                <Plus className="h-4 w-4" />
                                Add User
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/70">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                            ID
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                            Name
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                            Email
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                            Role
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                            Created
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white dark:bg-slate-900">
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-slate-100 dark:border-slate-800"
                                            >
                                                <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                    {user.id}
                                                </td>
                                                <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {user.name}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {user.email}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getRoleClasses(user.role)}`}
                                                    >
                                                        {user.role ?? 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    {user.created_at ?? '—'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {users.data.length}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {users.total}
                            </span>{' '}
                            users
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {users.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                            link.active
                                                ? 'bg-sky-600 text-white'
                                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                </SectionCard>

                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
                        <div
                            className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="add-user-title"
                            aria-describedby="add-user-description"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                                <div>
                                    <h3
                                        id="add-user-title"
                                        className="text-lg font-bold text-slate-900 dark:text-slate-100"
                                    >
                                        Add User
                                    </h3>
                                    <p
                                        id="add-user-description"
                                        className="mt-1 text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        Fill up the important fields to create a new user.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    aria-label="Close add user modal"
                                    title="Close"
                                    className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={submitCreateUser} className="px-6 py-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/50"
                                        />
                                        {createForm.errors.name && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {createForm.errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/50"
                                        />
                                        {createForm.errors.email && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {createForm.errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            placeholder="Enter password"
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/50"
                                        />
                                        {createForm.errors.password && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {createForm.errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password_confirmation"
                                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            Confirm Password
                                        </label>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            value={createForm.data.password_confirmation}
                                            onChange={(e) =>
                                                createForm.setData('password_confirmation', e.target.value)
                                            }
                                            placeholder="Confirm password"
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/50"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label
                                            htmlFor="role"
                                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={createForm.data.role}
                                            onChange={(e) => createForm.setData('role', e.target.value)}
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/50"
                                        >
                                            <option value="client">Client</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {createForm.errors.role && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {createForm.errors.role}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {createForm.processing ? 'Saving...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardShell>
        </AppLayout>
    );
}