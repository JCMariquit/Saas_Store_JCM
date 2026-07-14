import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    CircleUserRound,
    Edit3,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    Mail,
    Plus,
    Power,
    PowerOff,
    Search,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
    UserX,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useState,
} from 'react';

type TeamMemberRole = {
    id: number;
    code: string;
    name: string;
};

type TeamMemberBranch = {
    id: number;
    name: string;
    code: string;
    is_main: boolean;
    is_active: boolean;
};

type CreatedBy = {
    id: number | null;
    name: string | null;
};

type TeamMember = {
    id: number;
    access_id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    is_active: boolean;
    account_is_active: boolean;
    access_status: string;
    status_label: string;
    role: TeamMemberRole;
    branch: TeamMemberBranch | null;
    created_by: CreatedBy;
    joined_at: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type RoleOption = {
    id: number;
    code: string;
    name: string;
    description: string | null;
};

type BranchOption = {
    id: number;
    name: string;
    code: string;
    is_main: boolean;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedMembers = {
    current_page: number;
    data: TeamMember[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type TeamSummary = {
    total: number;
    active: number;
    inactive: number;
    managers: number;
    staff: number;
};

type TeamFilters = {
    search: string;
    status: string;
    product_user_type_id: string;
    branch_id: string;
};

type MemberFormData = {
    name: string;
    email: string;
    product_user_type_id: string;
    branch_id: string;
    password: string;
    password_confirmation: string;
};

type PasswordFormData = {
    password: string;
    password_confirmation: string;
};

type TeamMembersPageProps = {
    members: PaginatedMembers;
    summary: TeamSummary;
    roles: RoleOption[];
    branches: BranchOption[];
    filters: TeamFilters;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Team Management',
        href: '/team/members',
    },
    {
        title: 'Team Members',
        href: '/team/members',
    },
];

function emptyMemberForm(): MemberFormData {
    return {
        name: '',
        email: '',
        product_user_type_id: '',
        branch_id: '',
        password: '',
        password_confirmation: '',
    };
}

function emptyPasswordForm(): PasswordFormData {
    return {
        password: '',
        password_confirmation: '',
    };
}

export default function TeamMembersIndex({
    members,
    summary,
    roles,
    branches,
    filters,
}: TeamMembersPageProps) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [roleId, setRoleId] = useState(
        filters.product_user_type_id ?? '',
    );

    const [branchId, setBranchId] = useState(
        filters.branch_id ?? '',
    );

    const [isMemberModalOpen, setIsMemberModalOpen] =
        useState(false);

    const [editingMember, setEditingMember] =
        useState<TeamMember | null>(null);

    const [resettingMember, setResettingMember] =
        useState<TeamMember | null>(null);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const [showResetPassword, setShowResetPassword] =
        useState(false);

    const [
        showResetPasswordConfirmation,
        setShowResetPasswordConfirmation,
    ] = useState(false);

    const [processingMemberId, setProcessingMemberId] =
        useState<number | null>(null);

    const memberForm = useForm<MemberFormData>(
        emptyMemberForm(),
    );

    const passwordForm = useForm<PasswordFormData>(
        emptyPasswordForm(),
    );

    function openCreateModal(): void {
        setEditingMember(null);
        setShowPassword(false);
        setShowPasswordConfirmation(false);

        memberForm.clearErrors();
        memberForm.setData(emptyMemberForm());

        setIsMemberModalOpen(true);
    }

    function openEditModal(member: TeamMember): void {
        setEditingMember(member);
        setShowPassword(false);
        setShowPasswordConfirmation(false);

        memberForm.clearErrors();

        memberForm.setData({
            name: member.name,
            email: member.email,
            product_user_type_id: String(
                member.role.id,
            ),
            branch_id: member.branch
                ? String(member.branch.id)
                : '',
            password: '',
            password_confirmation: '',
        });

        setIsMemberModalOpen(true);
    }

    function closeMemberModal(): void {
        if (memberForm.processing) {
            return;
        }

        setIsMemberModalOpen(false);
        setEditingMember(null);
        setShowPassword(false);
        setShowPasswordConfirmation(false);

        memberForm.clearErrors();
        memberForm.setData(emptyMemberForm());
    }

    function submitMember(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (editingMember) {
            memberForm.put(
                `/team/members/${editingMember.id}`,
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        closeMemberModal();
                    },
                },
            );

            return;
        }

        memberForm.post('/team/members', {
            preserveScroll: true,

            onSuccess: () => {
                closeMemberModal();
            },
        });
    }

    function openResetPasswordModal(
        member: TeamMember,
    ): void {
        setResettingMember(member);
        setShowResetPassword(false);
        setShowResetPasswordConfirmation(false);

        passwordForm.clearErrors();
        passwordForm.setData(emptyPasswordForm());
    }

    function closeResetPasswordModal(): void {
        if (passwordForm.processing) {
            return;
        }

        setResettingMember(null);
        setShowResetPassword(false);
        setShowResetPasswordConfirmation(false);

        passwordForm.clearErrors();
        passwordForm.setData(emptyPasswordForm());
    }

    function submitResetPassword(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (!resettingMember) {
            return;
        }

        passwordForm.post(
            `/team/members/${resettingMember.id}/reset-password`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    closeResetPasswordModal();
                },
            },
        );
    }

    function updateMemberStatus(
        member: TeamMember,
    ): void {
        const nextStatus = !member.is_active;

        const confirmed = window.confirm(
            nextStatus
                ? `Activate ${member.name}'s account?`
                : `Deactivate ${member.name}'s account? They will no longer be able to access the inventory system.`,
        );

        if (!confirmed) {
            return;
        }

        setProcessingMemberId(member.id);

        router.patch(
            `/team/members/${member.id}/status`,
            {
                is_active: nextStatus,
            },
            {
                preserveScroll: true,

                onFinish: () => {
                    setProcessingMemberId(null);
                },
            },
        );
    }

    function removeMember(
        member: TeamMember,
    ): void {
        const confirmed = window.confirm(
            `Remove ${member.name} from Team Management? Their inventory access will be removed.`,
        );

        if (!confirmed) {
            return;
        }

        setProcessingMemberId(member.id);

        router.delete(
            `/team/members/${member.id}`,
            {
                preserveScroll: true,

                onFinish: () => {
                    setProcessingMemberId(null);
                },
            },
        );
    }

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/team/members',
            {
                search:
                    search.trim() || undefined,

                status:
                    status || undefined,

                product_user_type_id:
                    roleId || undefined,

                branch_id:
                    branchId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function resetFilters(): void {
        setSearch('');
        setStatus('');
        setRoleId('');
        setBranchId('');

        router.get(
            '/team/members',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Team Management
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Team Members
                        </h1>

                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Create and manage manager and staff
                            accounts, assign their branch, update
                            their role, reset passwords, and control
                            account access.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={
                            roles.length === 0 ||
                            branches.length === 0
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="size-4" />

                        Add Team Member
                    </button>
                </section>

                {(roles.length === 0 ||
                    branches.length === 0) && (
                    <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                            Team member creation is currently
                            unavailable.
                        </p>

                        <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                            {roles.length === 0
                                ? 'No assignable Manager or Staff role is configured.'
                                : 'Create at least one active branch before adding a team member.'}
                        </p>
                    </section>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Members"
                        value={summary.total}
                        description={`${summary.inactive} inactive`}
                        icon={
                            <Users className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Active Accounts"
                        value={summary.active}
                        description="Can access inventory"
                        icon={
                            <CheckCircle2 className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Managers"
                        value={summary.managers}
                        description="Management accounts"
                        icon={
                            <UserCog className="size-5" />
                        }
                    />

                    <SummaryCard
                        title="Staff"
                        value={summary.staff}
                        description="Staff accounts"
                        icon={
                            <CircleUserRound className="size-5" />
                        }
                    />
                </section>

                <section className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-card">
                    <form
                        onSubmit={applyFilters}
                        className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-[minmax(250px,1fr)_180px_200px_220px_auto_auto]"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search name, email, or role..."
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All statuses
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>

                        <select
                            value={roleId}
                            onChange={(event) =>
                                setRoleId(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All roles
                            </option>

                            {roles.map((role) => (
                                <option
                                    key={role.id}
                                    value={role.id}
                                >
                                    {role.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={branchId}
                            onChange={(event) =>
                                setBranchId(
                                    event.target.value,
                                )
                            }
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">
                                All branches
                            </option>

                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                    {branch.is_main
                                        ? ' — Main'
                                        : ''}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="h-10 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
                        >
                            Apply
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            Reset
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1150px] text-left">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3 font-medium">
                                        Team Member
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Role
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Assigned Branch
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Date Added
                                    </th>

                                    <th className="px-5 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {members.data.map((member) => {
                                    const isProcessing =
                                        processingMemberId ===
                                        member.id;

                                    return (
                                        <tr
                                            key={member.id}
                                            className="transition hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                                        {memberInitials(
                                                            member.name,
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {
                                                                member.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Mail className="size-3.5" />

                                                            {
                                                                member.email
                                                            }
                                                        </p>

                                                        {!member.email_verified_at && (
                                                            <p className="mt-1 text-xs text-amber-600">
                                                                Email not
                                                                verified
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <RoleBadge
                                                    role={
                                                        member.role
                                                    }
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                {member.branch ? (
                                                    <div>
                                                        <p className="flex items-center gap-2 text-sm font-medium">
                                                            <Building2 className="size-4 text-muted-foreground" />

                                                            {
                                                                member
                                                                    .branch
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {
                                                                member
                                                                    .branch
                                                                    .code
                                                            }

                                                            {member
                                                                .branch
                                                                .is_main
                                                                ? ' · Main branch'
                                                                : ''}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        Not assigned
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    active={
                                                        member.is_active
                                                    }
                                                />

                                                {member.access_status ===
                                                    'inactive' && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Inventory
                                                        access disabled
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm">
                                                    {formatDate(
                                                        member.joined_at ??
                                                            member.created_at,
                                                    )}
                                                </p>

                                                {member.created_by
                                                    .name && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Added by{' '}
                                                        {
                                                            member
                                                                .created_by
                                                                .name
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <ActionButton
                                                        title="Edit team member"
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() =>
                                                            openEditModal(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <Edit3 className="size-4" />
                                                    </ActionButton>

                                                    <ActionButton
                                                        title="Reset password"
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() =>
                                                            openResetPasswordModal(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <KeyRound className="size-4" />
                                                    </ActionButton>

                                                    <ActionButton
                                                        title={
                                                            member.is_active
                                                                ? 'Deactivate account'
                                                                : 'Activate account'
                                                        }
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        destructive={
                                                            member.is_active
                                                        }
                                                        onClick={() =>
                                                            updateMemberStatus(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        {isProcessing ? (
                                                            <LoaderCircle className="size-4 animate-spin" />
                                                        ) : member.is_active ? (
                                                            <PowerOff className="size-4" />
                                                        ) : (
                                                            <Power className="size-4" />
                                                        )}
                                                    </ActionButton>

                                                    <ActionButton
                                                        title="Remove team member"
                                                        destructive
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        onClick={() =>
                                                            removeMember(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </ActionButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {members.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-16 text-center"
                                        >
                                            <UserX className="mx-auto size-12 text-muted-foreground/30" />

                                            <h3 className="mt-3 font-medium">
                                                No team members
                                                found
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Add your manager or
                                                staff accounts to
                                                begin managing your
                                                team.
                                            </p>

                                            {roles.length > 0 &&
                                                branches.length >
                                                    0 && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            openCreateModal
                                                        }
                                                        className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                                                    >
                                                        <Plus className="size-4" />

                                                        Add Team
                                                        Member
                                                    </button>
                                                )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <MemberPagination members={members} />
                </section>
            </div>

            {isMemberModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeMemberModal();
                        }
                    }}
                >
                    <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingMember
                                        ? 'Edit Team Member'
                                        : 'Add Team Member'}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {editingMember
                                        ? 'Update the account information, assigned role, and branch.'
                                        : 'Create a manager or staff login account for your inventory system.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeMemberModal}
                                disabled={
                                    memberForm.processing
                                }
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitMember}
                            className="space-y-6 p-6"
                        >
                            <FormSection
                                title="Account Information"
                                description="Basic information used for signing in."
                                icon={
                                    <CircleUserRound className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label="Full Name"
                                        error={
                                            memberForm.errors
                                                .name
                                        }
                                        required
                                    >
                                        <input
                                            type="text"
                                            value={
                                                memberForm.data
                                                    .name
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                memberForm.setData(
                                                    'name',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Enter full name"
                                            autoComplete="name"
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Email Address"
                                        error={
                                            memberForm.errors
                                                .email
                                        }
                                        required
                                    >
                                        <input
                                            type="email"
                                            value={
                                                memberForm.data
                                                    .email
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                memberForm.setData(
                                                    'email',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="staff@example.com"
                                            autoComplete="email"
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                    </FormField>
                                </div>
                            </FormSection>

                            <FormSection
                                title="Assignment"
                                description="Assign the member's role and operating branch."
                                icon={
                                    <ShieldCheck className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label="Team Role"
                                        error={
                                            memberForm.errors
                                                .product_user_type_id
                                        }
                                        required
                                    >
                                        <select
                                            value={
                                                memberForm.data
                                                    .product_user_type_id
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                memberForm.setData(
                                                    'product_user_type_id',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        >
                                            <option value="">
                                                Select role
                                            </option>

                                            {roles.map(
                                                (role) => (
                                                    <option
                                                        key={
                                                            role.id
                                                        }
                                                        value={
                                                            role.id
                                                        }
                                                    >
                                                        {
                                                            role.name
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        {memberForm.data
                                            .product_user_type_id && (
                                            <RoleDescription
                                                role={roles.find(
                                                    (role) =>
                                                        String(
                                                            role.id,
                                                        ) ===
                                                        memberForm
                                                            .data
                                                            .product_user_type_id,
                                                )}
                                            />
                                        )}
                                    </FormField>

                                    <FormField
                                        label="Assigned Branch"
                                        error={
                                            memberForm.errors
                                                .branch_id
                                        }
                                        required
                                    >
                                        <select
                                            value={
                                                memberForm.data
                                                    .branch_id
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                memberForm.setData(
                                                    'branch_id',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        >
                                            <option value="">
                                                Select branch
                                            </option>

                                            {branches.map(
                                                (branch) => (
                                                    <option
                                                        key={
                                                            branch.id
                                                        }
                                                        value={
                                                            branch.id
                                                        }
                                                    >
                                                        {
                                                            branch.name
                                                        }{' '}
                                                        (
                                                        {
                                                            branch.code
                                                        }
                                                        )
                                                        {branch.is_main
                                                            ? ' — Main'
                                                            : ''}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </FormField>
                                </div>
                            </FormSection>

                            <FormSection
                                title={
                                    editingMember
                                        ? 'Change Password'
                                        : 'Temporary Password'
                                }
                                description={
                                    editingMember
                                        ? 'Leave both fields blank to keep the current password.'
                                        : 'Create the temporary password the team member will use to sign in.'
                                }
                                icon={
                                    <KeyRound className="size-4" />
                                }
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label={
                                            editingMember
                                                ? 'New Password'
                                                : 'Password'
                                        }
                                        error={
                                            memberForm.errors
                                                .password
                                        }
                                        required={
                                            !editingMember
                                        }
                                    >
                                        <PasswordInput
                                            value={
                                                memberForm.data
                                                    .password
                                            }
                                            show={
                                                showPassword
                                            }
                                            autoComplete={
                                                editingMember
                                                    ? 'new-password'
                                                    : 'new-password'
                                            }
                                            placeholder="Minimum 8 characters"
                                            onToggle={() =>
                                                setShowPassword(
                                                    (
                                                        current,
                                                    ) =>
                                                        !current,
                                                )
                                            }
                                            onChange={(
                                                value,
                                            ) =>
                                                memberForm.setData(
                                                    'password',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        label="Confirm Password"
                                        error={
                                            memberForm.errors
                                                .password_confirmation
                                        }
                                        required={
                                            !editingMember
                                        }
                                    >
                                        <PasswordInput
                                            value={
                                                memberForm.data
                                                    .password_confirmation
                                            }
                                            show={
                                                showPasswordConfirmation
                                            }
                                            autoComplete="new-password"
                                            placeholder="Repeat password"
                                            onToggle={() =>
                                                setShowPasswordConfirmation(
                                                    (
                                                        current,
                                                    ) =>
                                                        !current,
                                                )
                                            }
                                            onChange={(
                                                value,
                                            ) =>
                                                memberForm.setData(
                                                    'password_confirmation',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>
                                </div>
                            </FormSection>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeMemberModal}
                                    disabled={
                                        memberForm.processing
                                    }
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        memberForm.processing
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {memberForm.processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}

                                    {editingMember
                                        ? 'Save Changes'
                                        : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {resettingMember && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeResetPasswordModal();
                        }
                    }}
                >
                    <div className="w-full max-w-lg rounded-2xl border bg-background shadow-2xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Reset Password
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Set a new password for{' '}
                                    <span className="font-medium text-foreground">
                                        {resettingMember.name}
                                    </span>
                                    .
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeResetPasswordModal
                                }
                                disabled={
                                    passwordForm.processing
                                }
                                className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-muted disabled:opacity-50"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitResetPassword}
                            className="space-y-5 p-6"
                        >
                            <FormField
                                label="New Password"
                                error={
                                    passwordForm.errors
                                        .password
                                }
                                required
                            >
                                <PasswordInput
                                    value={
                                        passwordForm.data
                                            .password
                                    }
                                    show={
                                        showResetPassword
                                    }
                                    autoComplete="new-password"
                                    placeholder="Minimum 8 characters"
                                    onToggle={() =>
                                        setShowResetPassword(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    onChange={(value) =>
                                        passwordForm.setData(
                                            'password',
                                            value,
                                        )
                                    }
                                />
                            </FormField>

                            <FormField
                                label="Confirm New Password"
                                error={
                                    passwordForm.errors
                                        .password_confirmation
                                }
                                required
                            >
                                <PasswordInput
                                    value={
                                        passwordForm.data
                                            .password_confirmation
                                    }
                                    show={
                                        showResetPasswordConfirmation
                                    }
                                    autoComplete="new-password"
                                    placeholder="Repeat new password"
                                    onToggle={() =>
                                        setShowResetPasswordConfirmation(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    onChange={(value) =>
                                        passwordForm.setData(
                                            'password_confirmation',
                                            value,
                                        )
                                    }
                                />
                            </FormField>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={
                                        closeResetPasswordModal
                                    }
                                    disabled={
                                        passwordForm.processing
                                    }
                                    className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        passwordForm.processing
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {passwordForm.processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <KeyRound className="size-4" />
                                    )}

                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: ReactNode;
    description: string;
    icon: ReactNode;
}) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>

                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FormSection({
    title,
    description,
    icon,
    children,
}: {
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="space-y-5">
            <div className="flex items-start gap-3 border-b pb-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>

                <div>
                    <h3 className="text-sm font-semibold">
                        {title}
                    </h3>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    );
}

function FormField({
    label,
    error,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-destructive">
                        *
                    </span>
                )}
            </span>

            {children}

            {error && (
                <span className="block text-xs text-destructive">
                    {error}
                </span>
            )}
        </label>
    );
}

function PasswordInput({
    value,
    show,
    placeholder,
    autoComplete,
    onChange,
    onToggle,
}: {
    value: string;
    show: boolean;
    placeholder: string;
    autoComplete: string;
    onChange: (value: string) => void;
    onToggle: () => void;
}) {
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            <button
                type="button"
                onClick={onToggle}
                title={
                    show
                        ? 'Hide password'
                        : 'Show password'
                }
                className="absolute right-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
                {show ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
}

function RoleDescription({
    role,
}: {
    role: RoleOption | undefined;
}) {
    if (!role?.description) {
        return null;
    }

    return (
        <p className="mt-1 text-xs text-muted-foreground">
            {role.description}
        </p>
    );
}

function RoleBadge({
    role,
}: {
    role: TeamMemberRole;
}) {
    const isManager =
        role.code.toLowerCase() === 'manager';

    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                isManager
                    ? 'bg-violet-500/10 text-violet-600'
                    : 'bg-blue-500/10 text-blue-600',
            ].join(' ')}
        >
            {isManager ? (
                <UserCog className="size-3.5" />
            ) : (
                <CircleUserRound className="size-3.5" />
            )}

            {role.name}
        </span>
    );
}

function StatusBadge({
    active,
}: {
    active: boolean;
}) {
    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                active
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-red-500/10 text-red-600',
            ].join(' ')}
        >
            {active ? (
                <CheckCircle2 className="size-3.5" />
            ) : (
                <PowerOff className="size-3.5" />
            )}

            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

function ActionButton({
    title,
    destructive = false,
    disabled = false,
    onClick,
    children,
}: {
    title: string;
    destructive?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={[
                'inline-flex size-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50',
                destructive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'hover:bg-muted',
            ].join(' ')}
        >
            {children}
        </button>
    );
}

function MemberPagination({
    members,
}: {
    members: PaginatedMembers;
}) {
    if (members.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {members.from ?? 0} to{' '}
                {members.to ?? 0} of {members.total}{' '}
                team members
            </p>

            <div className="flex flex-wrap gap-1">
                {members.links.map((link, index) => (
                    <button
                        key={`${link.label}-${index}`}
                        type="button"
                        disabled={!link.url}
                        onClick={() => {
                            if (!link.url) {
                                return;
                            }

                            router.get(
                                link.url,
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                        className={[
                            'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted',
                            !link.url
                                ? 'cursor-not-allowed opacity-40'
                                : '',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function memberInitials(name: string): string {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return 'TM';
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(
    value: string | null,
): string {
    if (!value) {
        return 'Not available';
    }

    const date = new Date(
        value.includes('T')
            ? value
            : `${value}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date);
}