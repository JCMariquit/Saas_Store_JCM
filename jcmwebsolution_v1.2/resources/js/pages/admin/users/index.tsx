import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, CircleUserRound, Hash, Mail, Pencil, ShieldCheck, Trash2, UserCheck, UserPlus, Users } from 'lucide-react';
import { type FormEventHandler, useEffect, useMemo, useState } from 'react';

import { ConfirmModal } from '@/components/admin-ui/confirm-modal';
import { DataTable } from '@/components/admin-ui/data-table';
import { FormModal } from '@/components/admin-ui/form-modal';
import { PageHero } from '@/components/admin-ui/page-hero';
import { RoleBadge } from '@/components/admin-ui/role-badge';
import { SearchInput } from '@/components/admin-ui/search-input';
import { SectionCard } from '@/components/admin-ui/section-card';
import { SideDrawer } from '@/components/admin-ui/side-drawer';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { TableActionButtons } from '@/components/admin-ui/table-action-buttons';
import { UserAvatarInitials } from '@/components/admin-ui/user-avatar-initials';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

type RoleCode = 'super_admin' | 'admin' | 'user';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: RoleCode;
    role_code: RoleCode;
    role_name: string;
    is_active: boolean;
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
    active_users: number;
    inactive_users: number;
    total_admins: number;
    total_clients: number;
};

type PageProps = {
    filters: { search: string };
    users: UsersPagination;
    stats: Stats;
    canManageSuperAdmins: boolean;
    flash?: { success?: string };
};

type UserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: RoleCode;
    is_active: boolean;
};

const userTableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Account' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Platform Role' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created' },
    { key: 'actions', label: 'Actions', align: 'center' as const },
];

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users & Accounts', href: '/admin/users' }];

function AccountStatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={
                active
                    ? 'inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400'
                    : 'inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400'
            }
        >
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

function RoleOptions({ canManageSuperAdmins }: { canManageSuperAdmins: boolean }) {
    return (
        <>
            <option value="user">Client / Platform User</option>
            <option value="admin">Administrator</option>
            <option value="super_admin" disabled={!canManageSuperAdmins}>
                Super Administrator
            </option>
        </>
    );
}

function ActiveAccountField({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <label className="border-border/70 bg-background/35 hover:border-primary/25 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="border-border accent-primary mt-0.5 size-4 rounded"
            />
            <span>
                <span className="text-foreground block text-xs font-semibold">Account is active</span>
                <span className="text-muted-foreground mt-1 block text-[10px] leading-4">
                    Inactive accounts cannot sign in, but their platform history remains available.
                </span>
            </span>
        </label>
    );
}

export default function UsersIndex() {
    const { props } = usePage<PageProps>();
    const { users, filters, flash, stats, canManageSuperAdmins } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [viewingUser, setViewingUser] = useState<UserRow | null>(null);

    const createForm = useForm<UserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        is_active: true,
    });

    const editForm = useForm<UserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        is_active: true,
    });

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            router.get(
                route('admin.users.index'),
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const resultsText = useMemo(() => {
        if (!users.total) return 'No accounts found.';
        return `Showing ${users.from ?? 0} to ${users.to ?? 0} of ${users.total} accounts`;
    }, [users.from, users.to, users.total]);

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        createForm.setData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user',
            is_active: true,
        });
        setCreateOpen(true);
    };

    const closeCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setCreateOpen(false);
    };

    const openEdit = (user: UserRow) => {
        setSelectedUser(user);
        editForm.clearErrors();
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role_code,
            is_active: user.is_active,
        });
        setEditOpen(true);
    };

    const closeEdit = () => {
        setSelectedUser(null);
        editForm.reset();
        editForm.clearErrors();
        setEditOpen(false);
    };

    const openDelete = (user: UserRow) => {
        setSelectedUser(user);
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        setSelectedUser(null);
        setDeleteOpen(false);
    };

    const submitCreate: FormEventHandler = (event) => {
        event.preventDefault();
        createForm.post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: closeCreate,
        });
    };

    const submitEdit: FormEventHandler = (event) => {
        event.preventDefault();
        if (!selectedUser) return;

        editForm.put(route('admin.users.update', selectedUser.id), {
            preserveScroll: true,
            onSuccess: closeEdit,
        });
    };

    const confirmDelete = () => {
        if (!selectedUser) return;

        router.delete(route('admin.users.destroy', selectedUser.id), {
            preserveScroll: true,
            onSuccess: closeDelete,
        });
    };

    const resetSearch = () => {
        setSearch('');
        router.get(
            route('admin.users.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users & Accounts" />

            <div className="bg-background min-h-screen p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Users & Accounts"
                        description="Manage platform administrators, account owners, and client access across every JCM product."
                        actionLabel="Create Account"
                        onAction={openCreate}
                        actionIcon={<UserPlus className="size-4" />}
                    />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard
                            title="Total Accounts"
                            value={stats.total_users}
                            description="All identities registered in the JCM platform."
                            icon={<Users className="size-5" />}
                            tone="blue"
                        />
                        <StatsCard
                            title="Active Accounts"
                            value={stats.active_users}
                            description={`${stats.inactive_users} inactive account${stats.inactive_users === 1 ? '' : 's'}.`}
                            icon={<UserCheck className="size-5" />}
                            tone="emerald"
                        />
                        <StatsCard
                            title="Administrators"
                            value={stats.total_admins}
                            description="Active super administrators and administrators."
                            icon={<ShieldCheck className="size-5" />}
                            tone="indigo"
                        />
                        <StatsCard
                            title="Clients"
                            value={stats.total_clients}
                            description="Account owners and platform users without admin access."
                            icon={<CircleUserRound className="size-5" />}
                            tone="amber"
                        />
                    </div>

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-400">
                            {flash.success}
                        </div>
                    )}

                    <SectionCard
                        title="Platform Accounts"
                        description={resultsText}
                        actions={
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                                <SearchInput id="user-search" value={search} onChange={setSearch} placeholder="Search name, email, or role..." />
                                <Button type="button" variant="outline" onClick={resetSearch} className="h-11 rounded-xl">
                                    Reset
                                </Button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={userTableColumns}
                            empty={users.data.length === 0}
                            emptyMessage="No matching platform accounts were found."
                            colSpan={7}
                        >
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-border/70 hover:bg-primary/[0.035] cursor-pointer border-t transition"
                                    onClick={() => setViewingUser(user)}
                                >
                                    <td className="text-muted-foreground px-4 py-4 text-xs font-medium">#{user.id}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatarInitials name={user.name} />
                                            <div className="min-w-0">
                                                <p className="text-foreground truncate text-sm font-semibold">{user.name}</p>
                                                <p className="text-muted-foreground mt-0.5 text-[10px]">{user.role_name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-foreground px-4 py-4 text-xs">{user.email}</td>
                                    <td className="px-4 py-4">
                                        <RoleBadge role={user.role_code} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <AccountStatusBadge active={user.is_active} />
                                    </td>
                                    <td className="text-muted-foreground px-4 py-4 text-xs">{user.created_at ?? '—'}</td>
                                    <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                                        <TableActionButtons name={user.name} onEdit={() => openEdit(user)} onDelete={() => openDelete(user)} />
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
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                });
                                            }
                                        }}
                                        className={
                                            link.active
                                                ? 'border-primary bg-primary text-primary-foreground rounded-lg border px-3 py-2 text-xs font-semibold'
                                                : link.url
                                                  ? 'border-border bg-card text-foreground hover:border-primary/25 hover:bg-primary/[0.05] rounded-lg border px-3 py-2 text-xs font-medium transition'
                                                  : 'border-border bg-muted/30 text-muted-foreground cursor-not-allowed rounded-lg border px-3 py-2 text-xs'
                                        }
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>

            <FormModal
                open={createOpen}
                title="Create Platform Account"
                description="Register a user and assign their platform-level access."
                onClose={closeCreate}
                maxWidthClass="max-w-3xl"
            >
                <form onSubmit={submitCreate} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="create_name">Full Name</Label>
                            <input
                                id="create_name"
                                value={createForm.data.name}
                                onChange={(event) => createForm.setData('name', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                                placeholder="Enter full name"
                            />
                            <InputError message={createForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create_email">Email Address</Label>
                            <input
                                id="create_email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(event) => createForm.setData('email', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                                placeholder="name@example.com"
                            />
                            <InputError message={createForm.errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create_password">Password</Label>
                            <input
                                id="create_password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(event) => createForm.setData('password', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                                placeholder="At least 8 characters"
                            />
                            <InputError message={createForm.errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create_password_confirmation">Confirm Password</Label>
                            <input
                                id="create_password_confirmation"
                                type="password"
                                value={createForm.data.password_confirmation}
                                onChange={(event) => createForm.setData('password_confirmation', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                                placeholder="Re-enter password"
                            />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="create_role">Platform Role</Label>
                            <select
                                id="create_role"
                                value={createForm.data.role}
                                onChange={(event) => createForm.setData('role', event.target.value as RoleCode)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                            >
                                <RoleOptions canManageSuperAdmins={canManageSuperAdmins} />
                            </select>
                            <InputError message={createForm.errors.role} />
                        </div>
                        <div className="md:col-span-2">
                            <ActiveAccountField
                                checked={createForm.data.is_active}
                                onChange={(checked) => createForm.setData('is_active', checked)}
                            />
                            <InputError message={createForm.errors.is_active} />
                        </div>
                    </div>
                    <div className="border-border flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closeCreate}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createForm.processing}>
                            {createForm.processing ? 'Creating...' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={editOpen && !!selectedUser}
                title="Edit Platform Account"
                description="Update account identity, role, status, or password."
                onClose={closeEdit}
                maxWidthClass="max-w-3xl"
                tone="indigo"
            >
                <form onSubmit={submitEdit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Full Name</Label>
                            <input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(event) => editForm.setData('name', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                            />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_email">Email Address</Label>
                            <input
                                id="edit_email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(event) => editForm.setData('email', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                            />
                            <InputError message={editForm.errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_password">New Password</Label>
                            <input
                                id="edit_password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(event) => editForm.setData('password', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                                placeholder="Leave blank to keep current password"
                            />
                            <InputError message={editForm.errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_password_confirmation">Confirm New Password</Label>
                            <input
                                id="edit_password_confirmation"
                                type="password"
                                value={editForm.data.password_confirmation}
                                onChange={(event) => editForm.setData('password_confirmation', event.target.value)}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none"
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="edit_role">Platform Role</Label>
                            <select
                                id="edit_role"
                                value={editForm.data.role}
                                onChange={(event) => editForm.setData('role', event.target.value as RoleCode)}
                                disabled={selectedUser?.role_code === 'super_admin' && !canManageSuperAdmins}
                                className="border-border bg-background text-foreground focus:border-primary h-11 rounded-xl border px-3 text-sm transition outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RoleOptions canManageSuperAdmins={canManageSuperAdmins} />
                            </select>
                            <InputError message={editForm.errors.role} />
                        </div>
                        <div className="md:col-span-2">
                            <ActiveAccountField checked={editForm.data.is_active} onChange={(checked) => editForm.setData('is_active', checked)} />
                            <InputError message={editForm.errors.is_active} />
                        </div>
                    </div>
                    <div className="border-border flex justify-end gap-3 border-t pt-4">
                        <Button type="button" variant="outline" onClick={closeEdit}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={editForm.processing}>
                            {editForm.processing ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </FormModal>

            <ConfirmModal
                open={deleteOpen && !!selectedUser}
                title="Remove Platform Account"
                description="Accounts with platform history are safely deactivated instead of deleted."
                message={`Remove ${selectedUser?.name ?? 'this account'}? Historical orders, subscriptions, transactions, and access records will be preserved.`}
                confirmLabel="Remove Account"
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />

            <SideDrawer
                open={!!viewingUser}
                onClose={() => setViewingUser(null)}
                title="Account Details"
                description="Platform identity and access status."
            >
                {viewingUser && (
                    <>
                        <div className="border-border bg-card rounded-2xl border p-4">
                            <div className="flex items-start gap-4">
                                <UserAvatarInitials name={viewingUser.name} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-foreground truncate text-lg font-bold">{viewingUser.name}</h3>
                                        <RoleBadge role={viewingUser.role_code} />
                                        <AccountStatusBadge active={viewingUser.is_active} />
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs break-all">{viewingUser.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {[
                                { icon: Hash, label: 'User ID', value: `#${viewingUser.id}` },
                                { icon: Mail, label: 'Email Address', value: viewingUser.email },
                                {
                                    icon: ShieldCheck,
                                    label: 'Platform Role',
                                    value: viewingUser.role_name,
                                },
                                {
                                    icon: CalendarDays,
                                    label: 'Created At',
                                    value: viewingUser.created_at ?? '—',
                                },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="border-border/70 bg-card rounded-xl border p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="border-primary/15 bg-primary/[0.06] text-primary flex size-9 shrink-0 items-center justify-center rounded-lg border">
                                            <Icon className="size-4" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">{label}</p>
                                            <p className="text-foreground mt-1 text-xs font-medium break-all">{value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-border flex gap-3 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const user = viewingUser;
                                    setViewingUser(null);
                                    openEdit(user);
                                }}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                onClick={() => {
                                    const user = viewingUser;
                                    setViewingUser(null);
                                    openDelete(user);
                                }}
                            >
                                <Trash2 className="size-4" />
                                Remove
                            </Button>
                        </div>
                    </>
                )}
            </SideDrawer>
        </AppLayout>
    );
}
