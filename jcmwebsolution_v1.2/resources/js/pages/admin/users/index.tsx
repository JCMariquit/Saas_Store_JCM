import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, ShieldCheck, CircleUserRound, Pencil, Trash2, Mail, CalendarDays, Hash } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/admin-layout'; 
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/admin-ui/page-hero';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { SectionCard } from '@/components/admin-ui/section-card';
import { SearchInput } from '@/components/admin-ui/search-input';
import { RoleBadge } from '@/components/admin-ui/role-badge';
import { TableActionButtons } from '@/components/admin-ui/table-action-buttons';
import { UserAvatarInitials } from '@/components/admin-ui/user-avatar-initials';
import { FormModal } from '@/components/admin-ui/form-modal';
import { ConfirmModal } from '@/components/admin-ui/confirm-modal';
import { DataTable } from '@/components/admin-ui/data-table';
import { SideDrawer } from '@/components/admin-ui/side-drawer';

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

const userTableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'created_at', label: 'Created At' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

export default function UsersIndex() {
    const { props } = usePage<PageProps>();
    const { users, filters, flash, stats } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [viewingUser, setViewingUser] = useState<UserRow | null>(null);

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

    const openViewDrawer = (user: UserRow) => {
        setViewingUser(user);
    };

    const closeViewDrawer = () => {
        setViewingUser(null);
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

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Manage Users"
                        description="Create, update, and manage administrator and client accounts"
                        actionLabel="Create User"
                        onAction={openCreate}
                        actionIcon={<UserPlus className="h-4 w-4" />}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard
                            title="Total Users"
                            value={stats.total_users}
                            description="All registered accounts in the platform."
                            icon={<Users className="h-5 w-5" />}
                            tone="blue"
                        />

                        <StatsCard
                            title="Administrators"
                            value={stats.total_admins}
                            description="Users with full access and management privileges."
                            icon={<ShieldCheck className="h-5 w-5" />}
                            tone="indigo"
                        />

                        <StatsCard
                            title="Clients"
                            value={stats.total_clients}
                            description="Customer accounts currently using the system."
                            icon={<CircleUserRound className="h-5 w-5" />}
                            tone="emerald"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard
                        title="User List"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput
                                    id="user-search"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search by name, email, or role..."
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetSearch}
                                    className="h-11 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    Reset Search
                                </Button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={userTableColumns}
                            empty={users.data.length === 0}
                            emptyMessage="No users found."
                            colSpan={6}
                        >
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="cursor-pointer border-t border-slate-200 transition hover:bg-blue-50/40"
                                    onClick={() => openViewDrawer(user)}
                                >
                                    <td className="px-4 py-4 text-sm font-medium text-slate-600">
                                        #{user.id}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatarInitials name={user.name} />
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    User account profile
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">
                                        {user.email}
                                    </td>

                                    <td className="px-4 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">
                                        {user.created_at ?? '-'}
                                    </td>

                                    <td
                                        className="px-4 py-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <TableActionButtons
                                            name={user.name}
                                            onEdit={() => openEdit(user)}
                                            onDelete={() => openDelete(user)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </DataTable>

                        {users.links.length > 3 && (
                            <div className="mt-5 flex flex-wrap justify-end gap-2">
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
                                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                            link.active
                                                ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                : link.url
                                                  ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                                  : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
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
                title="Create User"
                description="Add a new user account to the platform."
                onClose={closeCreate}
                tone="blue"
            >
                <form onSubmit={submitCreateUser} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="create_name">Full Name</Label>
                            <input
                                id="create_name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Enter full name"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="create_email">Email Address</Label>
                            <input
                                id="create_email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="Enter email address"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            />
                            <InputError message={createForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="create_password">Password</Label>
                            <input
                                id="create_password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="Enter password"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            />
                            <InputError message={createForm.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="create_password_confirmation">
                                Confirm Password
                            </Label>
                            <input
                                id="create_password_confirmation"
                                type="password"
                                value={createForm.data.password_confirmation}
                                onChange={(e) =>
                                    createForm.setData('password_confirmation', e.target.value)
                                }
                                placeholder="Confirm password"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createForm.processing}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        >
                            {createForm.processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={openEditModal && !!selectedUser}
                title="Edit User"
                description="Update selected user details."
                onClose={closeEdit}
                tone="indigo"
            >
                <form onSubmit={submitEditUser} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Full Name</Label>
                            <input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_email">Email Address</Label>
                            <input
                                id="edit_email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            />
                            <InputError message={editForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_password">New Password</Label>
                            <input
                                id="edit_password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="Leave blank to keep current password"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                            />
                            <InputError message={editForm.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_password_confirmation">
                                Confirm New Password
                            </Label>
                            <input
                                id="edit_password_confirmation"
                                type="password"
                                value={editForm.data.password_confirmation}
                                onChange={(e) =>
                                    editForm.setData('password_confirmation', e.target.value)
                                }
                                placeholder="Confirm new password"
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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
                                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
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
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={editForm.processing}
                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700"
                        >
                            {editForm.processing ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmModal
                open={openDeleteModal && !!selectedUser}
                title="Delete User"
                description="This action will permanently remove the selected user."
                message={`Are you sure you want to delete ${selectedUser?.name ?? ''}?`}
                confirmLabel="Delete User"
                onClose={closeDelete}
                onConfirm={confirmDeleteUser}
            />

            <SideDrawer
                open={!!viewingUser}
                onClose={closeViewDrawer}
                title="User Details"
                description="View more information about this user account."
            >
                {viewingUser && (
                    <>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-4">
                                <UserAvatarInitials name={viewingUser.name} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {viewingUser.name}
                                        </h3>
                                        <RoleBadge role={viewingUser.role} />
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        User account overview
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                                        <Hash className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            User ID
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                            #{viewingUser.id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Email Address
                                        </p>
                                        <p className="mt-1 break-all text-sm font-medium text-slate-900">
                                            {viewingUser.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Account Role
                                        </p>
                                        <div className="mt-2">
                                            <RoleBadge role={viewingUser.role} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                                        <CalendarDays className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Created At
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-900">
                                            {viewingUser.created_at ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 -mx-6 border-t border-slate-200 bg-white px-6 py-4">
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 rounded-xl"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openEdit(viewingUser);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                    
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => {
                                        closeViewDrawer();
                                        openDelete(viewingUser);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SideDrawer>
        </AppLayout>
    );
}