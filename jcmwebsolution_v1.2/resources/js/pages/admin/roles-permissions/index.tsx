import {
    FieldLabel,
    inputClassName,
    ModuleDrawer,
    ModuleEmpty,
    ModuleMetric,
    ModulePageHeader,
    ModuleStatus,
    selectClassName,
    textareaClassName,
} from '@/components/admin-ui/module-workspace';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    KeyRound,
    Plus,
    ShieldCheck,
    Shield,
    Trash2,
    UserCog,
    UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Role = {
    id: number;
    role_code: string;
    name: string;
    description?: string | null;
    is_system_role: boolean;
    sort_order: number;
    status: string;
    permission_ids: number[];
    user_count: number;
};

type Permission = {
    id: number;
    permission_code: string;
    name: string;
    module: string;
    description?: string | null;
    status: string;
};

type Assignment = {
    id: number;
    user_id: number;
    platform_role_id: number;
    is_primary: boolean;
    status: string;
    assigned_at: string;
    user_name: string;
    user_email: string;
    role_name: string;
    role_code: string;
    assigned_by_name?: string | null;
};

type User = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
};

type Props = {
    roles: Role[];
    permissions: Permission[];
    assignments: Assignment[];
    users: User[];
    stats: {
        roles: number;
        permissions: number;
        assignments: number;
        admins: number;
    };
};


type RoleFormData = {
    name: string;
    role_code: string;
    description: string;
    status: string;
};

type PermissionFormData = {
    permission_code: string;
    name: string;
    module: string;
    description: string;
    status: string;
};

type AssignmentFormData = {
    user_id: string;
    platform_role_id: string;
    is_primary: boolean;
    status: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounts', href: '/admin/users' },
    {
        title: 'Roles & Permissions',
        href: '/admin/roles-permissions',
    },
];

export default function RolesPermissions({
    roles,
    permissions,
    assignments,
    users,
    stats,
}: Props) {
    const [tab, setTab] = useState<'matrix' | 'assignments'>(
        'matrix',
    );
    const [roleOpen, setRoleOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [assignmentOpen, setAssignmentOpen] = useState(false);

    const roleForm = useForm<RoleFormData>({
        name: '',
        role_code: '',
        description: '',
        status: 'active',
    });

    const permissionForm = useForm<PermissionFormData>({
        permission_code: '',
        name: '',
        module: '',
        description: '',
        status: 'active',
    });

    const assignmentForm = useForm<AssignmentFormData>({
        user_id: '',
        platform_role_id: '',
        is_primary: true,
        status: 'active',
    });

    const permissionGroups = useMemo(() => {
        return permissions.reduce<Record<string, Permission[]>>(
            (groups, permission) => {
                const module = permission.module || 'General';
                groups[module] ??= [];
                groups[module].push(permission);
                return groups;
            },
            {},
        );
    }, [permissions]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />

            <div className="space-y-5">
                <ModulePageHeader
                    eyebrow="Identity Governance"
                    title="Roles & Permissions"
                    description="Control platform roles, granular permissions, and canonical role assignments for administrative accounts."
                    actions={
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPermissionOpen(true)}
                                className="rounded-xl"
                            >
                                <KeyRound className="size-4" />
                                New permission
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setRoleOpen(true)}
                                className="rounded-xl"
                            >
                                <Plus className="size-4" />
                                New role
                            </Button>
                        </>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ModuleMetric
                        label="Platform roles"
                        value={stats.roles}
                        hint="Reusable access profiles"
                        icon={Shield}
                    />
                    <ModuleMetric
                        label="Permissions"
                        value={stats.permissions}
                        hint="Granular capabilities"
                        icon={KeyRound}
                    />
                    <ModuleMetric
                        label="Assignments"
                        value={stats.assignments}
                        hint="Active user-role links"
                        icon={UserCog}
                    />
                    <ModuleMetric
                        label="Administrators"
                        value={stats.admins}
                        hint="Admin and super admin"
                        icon={ShieldCheck}
                    />
                </div>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setTab('matrix')}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                    tab === 'matrix'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                            >
                                Permission matrix
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('assignments')}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                    tab === 'assignments'
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                            >
                                User assignments
                            </button>
                        </div>

                        {tab === 'assignments' && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setAssignmentOpen(true)}
                                className="rounded-lg"
                            >
                                <Plus className="size-3.5" />
                                Assign role
                            </Button>
                        )}
                    </div>

                    {tab === 'matrix' ? (
                        permissions.length === 0 || roles.length === 0 ? (
                            <ModuleEmpty
                                icon={Shield}
                                title="Permission matrix is empty"
                                description="Create platform roles and permissions to start defining access."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left text-xs">
                                    <thead>
                                        <tr className="border-border/70 text-muted-foreground border-b">
                                            <th className="sticky left-0 bg-card px-4 py-3 font-semibold">
                                                Permission
                                            </th>
                                            {roles.map((role) => (
                                                <th
                                                    key={role.id}
                                                    className="px-4 py-3 text-center font-semibold"
                                                >
                                                    <p className="text-foreground">
                                                        {role.name}
                                                    </p>
                                                    <p className="mt-1 font-mono text-[9px] font-normal">
                                                        {role.role_code}
                                                    </p>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(
                                            permissionGroups,
                                        ).map(
                                            ([module, modulePermissions]) => (
                                                <PermissionRows
                                                    key={module}
                                                    module={module}
                                                    permissions={
                                                        modulePermissions
                                                    }
                                                    roles={roles}
                                                />
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : assignments.length === 0 ? (
                        <ModuleEmpty
                            icon={UsersRound}
                            title="No role assignments"
                            description="Assign a platform role to an active account."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-xs">
                                <thead>
                                    <tr className="border-border/70 text-muted-foreground border-b">
                                        <th className="px-4 py-3 font-semibold">
                                            Account
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Primary
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Assigned
                                        </th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((assignment) => (
                                        <tr
                                            key={assignment.id}
                                            className="border-border/60 border-b last:border-b-0"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-semibold">
                                                    {assignment.user_name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {assignment.user_email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-medium">
                                                    {assignment.role_name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                                                    {assignment.role_code}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                {assignment.is_primary
                                                    ? 'Yes'
                                                    : 'No'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <ModuleStatus
                                                    value={assignment.status}
                                                />
                                            </td>
                                            <td className="text-muted-foreground px-4 py-4 text-[10px]">
                                                {new Date(
                                                    assignment.assigned_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                'Remove this role assignment?',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/admin/roles-permissions/assignments/${assignment.id}`,
                                                                {
                                                                    preserveScroll:
                                                                        true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    {roles.map((role) => (
                        <article
                            key={role.id}
                            className="border-border/70 bg-card rounded-2xl border p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-primary text-[10px] font-semibold tracking-widest uppercase">
                                        {role.role_code}
                                    </p>
                                    <h3 className="text-foreground mt-1 text-sm font-semibold">
                                        {role.name}
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                                        {role.description ||
                                            'No role description.'}
                                    </p>
                                </div>
                                <ModuleStatus value={role.status} />
                            </div>
                            <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
                                <span>
                                    {role.permission_ids.length}{' '}
                                    permissions
                                </span>
                                <span>{role.user_count} users</span>
                            </div>
                        </article>
                    ))}
                </section>
            </div>

            <ModuleDrawer
                open={roleOpen}
                onClose={() => setRoleOpen(false)}
                title="Create platform role"
                description="Add a reusable administrative access profile."
                footer={
                    <Button
                        type="button"
                        className="w-full rounded-xl"
                        disabled={roleForm.processing}
                        onClick={() =>
                            roleForm.post('/admin/roles-permissions/roles', {
                                onSuccess: () => {
                                    roleForm.reset();
                                    setRoleOpen(false);
                                },
                            })
                        }
                    >
                        Create role
                    </Button>
                }
            >
                <div className="space-y-4">
                    <FormField
                        label="Role name"
                        value={roleForm.data.name}
                        onChange={(value) =>
                            roleForm.setData('name', value)
                        }
                        error={roleForm.errors.name}
                        placeholder="Support Manager"
                    />
                    <FormField
                        label="Role code"
                        value={roleForm.data.role_code}
                        onChange={(value) =>
                            roleForm.setData('role_code', value)
                        }
                        error={roleForm.errors.role_code}
                        placeholder="support_manager"
                    />
                    <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea
                            value={roleForm.data.description}
                            onChange={(event) =>
                                roleForm.setData(
                                    'description',
                                    event.target.value,
                                )
                            }
                            rows={4}
                            className={textareaClassName}
                        />
                    </div>
                    <div>
                        <FieldLabel>Status</FieldLabel>
                        <select
                            value={roleForm.data.status}
                            onChange={(event) =>
                                roleForm.setData(
                                    'status',
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </ModuleDrawer>

            <ModuleDrawer
                open={permissionOpen}
                onClose={() => setPermissionOpen(false)}
                title="Create permission"
                description="Define a granular platform capability for the role matrix."
                footer={
                    <Button
                        type="button"
                        className="w-full rounded-xl"
                        disabled={permissionForm.processing}
                        onClick={() =>
                            permissionForm.post(
                                '/admin/roles-permissions/permissions',
                                {
                                    onSuccess: () => {
                                        permissionForm.reset();
                                        setPermissionOpen(false);
                                    },
                                },
                            )
                        }
                    >
                        Create permission
                    </Button>
                }
            >
                <div className="space-y-4">
                    <FormField
                        label="Permission code"
                        value={permissionForm.data.permission_code}
                        onChange={(value) =>
                            permissionForm.setData(
                                'permission_code',
                                value,
                            )
                        }
                        error={permissionForm.errors.permission_code}
                        placeholder="support.manage"
                    />
                    <FormField
                        label="Name"
                        value={permissionForm.data.name}
                        onChange={(value) =>
                            permissionForm.setData('name', value)
                        }
                        error={permissionForm.errors.name}
                        placeholder="Manage support tickets"
                    />
                    <FormField
                        label="Module"
                        value={permissionForm.data.module}
                        onChange={(value) =>
                            permissionForm.setData('module', value)
                        }
                        error={permissionForm.errors.module}
                        placeholder="Support"
                    />
                    <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea
                            value={permissionForm.data.description}
                            onChange={(event) =>
                                permissionForm.setData(
                                    'description',
                                    event.target.value,
                                )
                            }
                            rows={4}
                            className={textareaClassName}
                        />
                    </div>
                </div>
            </ModuleDrawer>

            <ModuleDrawer
                open={assignmentOpen}
                onClose={() => setAssignmentOpen(false)}
                title="Assign platform role"
                description="Link an active account to a canonical platform role."
                footer={
                    <Button
                        type="button"
                        className="w-full rounded-xl"
                        disabled={assignmentForm.processing}
                        onClick={() =>
                            assignmentForm.post(
                                '/admin/roles-permissions/assignments',
                                {
                                    onSuccess: () => {
                                        assignmentForm.reset();
                                        setAssignmentOpen(false);
                                    },
                                },
                            )
                        }
                    >
                        Save assignment
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Account</FieldLabel>
                        <select
                            value={assignmentForm.data.user_id}
                            onChange={(event) =>
                                assignmentForm.setData(
                                    'user_id',
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="">Select account</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} — {user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <FieldLabel>Role</FieldLabel>
                        <select
                            value={
                                assignmentForm.data.platform_role_id
                            }
                            onChange={(event) =>
                                assignmentForm.setData(
                                    'platform_role_id',
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="">Select role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <label className="border-border/70 bg-card flex items-center gap-3 rounded-xl border p-3 text-xs">
                        <input
                            type="checkbox"
                            checked={assignmentForm.data.is_primary}
                            onChange={(event) =>
                                assignmentForm.setData(
                                    'is_primary',
                                    event.target.checked,
                                )
                            }
                            className="accent-primary"
                        />
                        Make this the primary platform role
                    </label>
                </div>
            </ModuleDrawer>
        </AppLayout>
    );
}

function PermissionRows({
    module,
    permissions,
    roles,
}: {
    module: string;
    permissions: Permission[];
    roles: Role[];
}) {
    return (
        <>
            <tr className="bg-muted/20 border-border/70 border-b">
                <td
                    colSpan={roles.length + 1}
                    className="text-primary px-4 py-2 text-[10px] font-semibold tracking-widest uppercase"
                >
                    {module}
                </td>
            </tr>
            {permissions.map((permission) => (
                <tr
                    key={permission.id}
                    className="border-border/60 border-b"
                >
                    <td className="sticky left-0 bg-card px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-foreground font-semibold">
                                    {permission.name}
                                </p>
                                <p className="text-muted-foreground mt-1 font-mono text-[9px]">
                                    {permission.permission_code}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        confirm(
                                            'Delete this permission?',
                                        )
                                    ) {
                                        router.delete(
                                            `/admin/roles-permissions/permissions/${permission.id}`,
                                            { preserveScroll: true },
                                        );
                                    }
                                }}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>
                    </td>
                    {roles.map((role) => {
                        const enabled = role.permission_ids.includes(
                            permission.id,
                        );
                        return (
                            <td
                                key={role.id}
                                className="px-4 py-3 text-center"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            '/admin/roles-permissions/toggle',
                                            {
                                                platform_role_id: role.id,
                                                permission_id:
                                                    permission.id,
                                                is_allowed: !enabled,
                                            },
                                            { preserveScroll: true },
                                        )
                                    }
                                    className={`inline-flex min-w-20 justify-center rounded-full border px-3 py-1 text-[9px] font-semibold uppercase ${
                                        enabled
                                            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'
                                            : 'border-border text-muted-foreground'
                                    }`}
                                >
                                    {enabled ? 'Allowed' : 'Denied'}
                                </button>
                            </td>
                        );
                    })}
                </tr>
            ))}
        </>
    );
}

function FormField({
    label,
    value,
    onChange,
    error,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
}) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={inputClassName}
                placeholder={placeholder}
            />
            {error && (
                <p className="text-destructive mt-1 text-xs">
                    {error}
                </p>
            )}
        </div>
    );
}
