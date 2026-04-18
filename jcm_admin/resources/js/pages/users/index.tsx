import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { Pencil, Search, Trash2, UserPlus, Users, ShieldCheck } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'client';
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type UsersPagination = {
    data: UserRow[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number | null;
    total: number;
};

type Stats = {
    total_users: number;
    total_admins: number;
    total_clients: number;
};

type PageProps = {
    filters: {
        search: string;
    };
    users: UsersPagination;
    stats: Stats;
    flash?: {
        success?: string;
    };
};

type CreateUserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'client';
};

type EditUserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'client';
};

export default function UsersIndex() {
    const { props } = usePage<PageProps>();
    const { users, filters, flash, stats } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

    const createForm = useForm<CreateUserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client',
    });

    const editForm = useForm<EditUserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('admin.users.index'),
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

    const resetSearch = () => {
        setSearch('');
        router.get(
            route('admin.users.index'),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        createForm.setData('role', 'client');
        setOpenCreateModal(true);
    };

    const closeCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setOpenCreateModal(false);
    };

    const openEdit = (user: UserRow) => {
        setSelectedUser(user);
        editForm.clearErrors();
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
        });
        setOpenEditModal(true);
    };

    const closeEdit = () => {
        setSelectedUser(null);
        editForm.reset();
        editForm.clearErrors();
        setOpenEditModal(false);
    };

    const openDelete = (user: UserRow) => {
        setSelectedUser(user);
        setOpenDeleteModal(true);
    };

    const closeDelete = () => {
        setSelectedUser(null);
        setOpenDeleteModal(false);
    };

    const submitCreateUser: FormEventHandler = (e) => {
        e.preventDefault();

        createForm.post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreate();
            },
        });
    };

    const submitEditUser: FormEventHandler = (e) => {
        e.preventDefault();

        if (!selectedUser) return;

        editForm.put(route('admin.users.update', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeEdit();
            },
        });
    };

    const confirmDeleteUser = () => {
        if (!selectedUser) return;

        router.delete(route('admin.users.destroy', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeDelete();
            },
        });
    };

    const resultsText = useMemo(() => {
        if (!users.total) return 'No users found.';
        return `Showing ${users.from ?? 0} to ${users.to ?? 0} of ${users.total} users`;
    }, [users.from, users.to, users.total]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manage Users',
            href: '/admin/users',
        },
    ];

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Manage Users
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Create, update, and manage administrator and client accounts.
                            </p>
                        </div>

                        <Button type="button" onClick={openCreate} className="rounded-md">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Users</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {stats.total_users}
                                </h3>
                            </div>
                            <div className="rounded-md bg-slate-100 p-3">
                                <Users className="h-5 w-5 text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Administrators</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {stats.total_admins}
                                </h3>
                            </div>
                            <div className="rounded-md bg-blue-50 p-3">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Clients</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {stats.total_clients}
                                </h3>
                            </div>
                            <div className="rounded-md bg-emerald-50 p-3">
                                <Users className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">User List</h2>
                                <p className="mt-1 text-sm text-slate-500">{resultsText}</p>
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Label htmlFor="user-search" className="sr-only">
                                    Search users
                                </Label>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="user-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, email, or role..."
                                    className="h-10 rounded-md pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Created At
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-4 text-sm text-slate-700">
                                                    {user.id}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-slate-900">
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-700">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                                                            user.role === 'admin'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-700">
                                                    {user.created_at ?? '-'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 rounded-md px-3"
                                                            title={`Edit ${user.name}`}
                                                            aria-label={`Edit ${user.name}`}
                                                            onClick={() => openEdit(user)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 rounded-md border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            title={`Delete ${user.name}`}
                                                            aria-label={`Delete ${user.name}`}
                                                            onClick={() => openDelete(user)}
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
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-sm text-slate-500"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-md"
                                title="Reset user search"
                                aria-label="Reset user search"
                                onClick={resetSearch}
                            >
                                Reset Search
                            </Button>

                            {users.links.length > 3 && (
                                <div className="flex flex-wrap gap-2">
                                    {users.links.map((link, index) => (
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
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {openCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Create User
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add a new user account.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeCreate}
                                title="Close create user modal"
                                aria-label="Close create user modal"
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitCreateUser} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create_name">Full Name</Label>
                                    <Input
                                        id="create_name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        className="rounded-md"
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_email">Email Address</Label>
                                    <Input
                                        id="create_email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className="rounded-md"
                                    />
                                    <InputError message={createForm.errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_password">Password</Label>
                                    <Input
                                        id="create_password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        placeholder="Enter password"
                                        className="rounded-md"
                                    />
                                    <InputError message={createForm.errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create_password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="create_password_confirmation"
                                        type="password"
                                        value={createForm.data.password_confirmation}
                                        onChange={(e) =>
                                            createForm.setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="Confirm password"
                                        className="rounded-md"
                                    />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="create_role">Role</Label>
                                    <select
                                        id="create_role"
                                        name="role"
                                        title="Select user role"
                                        value={createForm.data.role}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'role',
                                                e.target.value as 'admin' | 'client',
                                            )
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                    >
                                        <option value="client">Client</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <InputError message={createForm.errors.role} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeCreate}
                                    className="rounded-md"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="rounded-md"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openEditModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Edit User</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Update selected user details.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEdit}
                                title="Close edit user modal"
                                aria-label="Close edit user modal"
                                className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={submitEditUser} className="space-y-5 px-6 py-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_name">Full Name</Label>
                                    <Input
                                        id="edit_name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="rounded-md"
                                    />
                                    <InputError message={editForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_email">Email Address</Label>
                                    <Input
                                        id="edit_email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="rounded-md"
                                    />
                                    <InputError message={editForm.errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_password">New Password</Label>
                                    <Input
                                        id="edit_password"
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        placeholder="Leave blank to keep current password"
                                        className="rounded-md"
                                    />
                                    <InputError message={editForm.errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_password_confirmation">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="edit_password_confirmation"
                                        type="password"
                                        value={editForm.data.password_confirmation}
                                        onChange={(e) =>
                                            editForm.setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        className="rounded-md"
                                    />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="edit_role">Role</Label>
                                    <select
                                        id="edit_role"
                                        name="role"
                                        title="Select user role"
                                        value={editForm.data.role}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'role',
                                                e.target.value as 'admin' | 'client',
                                            )
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                    >
                                        <option value="client">Client</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <InputError message={editForm.errors.role} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEdit}
                                    className="rounded-md"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="rounded-md"
                                >
                                    {editForm.processing ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openDeleteModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-slate-900">Delete User</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                This action will permanently remove the selected user.
                            </p>
                        </div>

                        <div className="px-6 py-5">
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold">{selectedUser.name}</span>?
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeDelete}
                                    className="rounded-md"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmDeleteUser}
                                    className="rounded-md bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete User
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}