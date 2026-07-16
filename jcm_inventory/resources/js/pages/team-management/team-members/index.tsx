import { ActionGroup } from '@/components/shared/action-group';
import { AppPagination } from '@/components/shared/app-pagination';
import { CalloutCard } from '@/components/shared/callout-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
    DataTable,
    type DataTableColumn,
} from '@/components/shared/data-table';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { FormDialog } from '@/components/shared/form-dialog';
import { FormField } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
import { IconButton } from '@/components/shared/icon-button';
import { PageContainer } from '@/components/shared/page-container';
import { SearchInput } from '@/components/shared/search-input';
import { SectionCard } from '@/components/shared/section-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    BadgeCheck,
    Building2,
    CheckCircle2,
    CircleUserRound,
    Edit3,
    Eye,
    EyeOff,
    KeyRound,
    Mail,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserCog,
    Users,
    UserX,
    type LucideIcon,
} from 'lucide-react';
import {
    type FormEvent,
    useEffect,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

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

type MemberAction = 'activate' | 'deactivate' | 'remove';

type MemberActionTarget = {
    member: TeamMember;
    action: MemberAction;
};

type TeamMetricTone = 'emerald' | 'violet' | 'blue' | 'amber';

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

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

const ALL_VALUE = 'all';
const NONE_VALUE = 'none';

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

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

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

    const [isMemberDialogOpen, setIsMemberDialogOpen] =
        useState(false);

    const [editingMember, setEditingMember] =
        useState<TeamMember | null>(null);

    const [resettingMember, setResettingMember] =
        useState<TeamMember | null>(null);

    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showPasswordConfirmation,
        setShowPasswordConfirmation,
    ] = useState(false);

    const [showResetPassword, setShowResetPassword] =
        useState(false);

    const [
        showResetPasswordConfirmation,
        setShowResetPasswordConfirmation,
    ] = useState(false);

    const [processingMemberId, setProcessingMemberId] =
        useState<number | null>(null);

    const [actionTarget, setActionTarget] =
        useState<MemberActionTarget | null>(null);

    const memberForm = useForm<MemberFormData>(
        emptyMemberForm(),
    );

    const passwordForm = useForm<PasswordFormData>(
        emptyPasswordForm(),
    );

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
        setRoleId(
            filters.product_user_type_id ?? '',
        );
        setBranchId(filters.branch_id ?? '');
    }, [
        filters.search,
        filters.status,
        filters.product_user_type_id,
        filters.branch_id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Member dialog
    |--------------------------------------------------------------------------
    */

    function resetMemberDialog(): void {
        setIsMemberDialogOpen(false);
        setEditingMember(null);
        setShowPassword(false);
        setShowPasswordConfirmation(false);

        memberForm.clearErrors();
        memberForm.setData(emptyMemberForm());
    }

    function openCreateDialog(): void {
        setEditingMember(null);
        setShowPassword(false);
        setShowPasswordConfirmation(false);

        memberForm.clearErrors();
        memberForm.setData(emptyMemberForm());

        setIsMemberDialogOpen(true);
    }

    function openEditDialog(
        member: TeamMember,
    ): void {
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

        setIsMemberDialogOpen(true);
    }

    function closeMemberDialog(): void {
        if (memberForm.processing) {
            return;
        }

        resetMemberDialog();
    }

    function handleMemberDialogChange(
        open: boolean,
    ): void {
        if (open) {
            setIsMemberDialogOpen(true);
            return;
        }

        closeMemberDialog();
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
                    onSuccess: resetMemberDialog,
                },
            );

            return;
        }

        memberForm.post('/team/members', {
            preserveScroll: true,
            onSuccess: resetMemberDialog,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Reset password
    |--------------------------------------------------------------------------
    */

    function openResetPasswordDialog(
        member: TeamMember,
    ): void {
        setResettingMember(member);
        setShowResetPassword(false);
        setShowResetPasswordConfirmation(false);

        passwordForm.clearErrors();
        passwordForm.setData(emptyPasswordForm());
    }

    function closeResetPasswordDialog(): void {
        if (passwordForm.processing) {
            return;
        }

        setResettingMember(null);
        setShowResetPassword(false);
        setShowResetPasswordConfirmation(false);

        passwordForm.clearErrors();
        passwordForm.setData(emptyPasswordForm());
    }

    function handleResetPasswordDialogChange(
        open: boolean,
    ): void {
        if (open) {
            return;
        }

        closeResetPasswordDialog();
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
                onSuccess: closeResetPasswordDialog,
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Member actions
    |--------------------------------------------------------------------------
    */

    function requestStatusAction(
        member: TeamMember,
    ): void {
        setActionTarget({
            member,
            action: member.is_active
                ? 'deactivate'
                : 'activate',
        });
    }

    function requestRemoveMember(
        member: TeamMember,
    ): void {
        setActionTarget({
            member,
            action: 'remove',
        });
    }

    function executeMemberAction(): void {
        if (
            !actionTarget ||
            processingMemberId !== null
        ) {
            return;
        }

        const { member, action } = actionTarget;

        setProcessingMemberId(member.id);

        const options = {
            preserveScroll: true,
            onSuccess: () =>
                setActionTarget(null),
            onFinish: () =>
                setProcessingMemberId(null),
        };

        if (action === 'remove') {
            router.delete(
                `/team/members/${member.id}`,
                options,
            );

            return;
        }

        router.patch(
            `/team/members/${member.id}/status`,
            {
                is_active: action === 'activate',
            },
            options,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/team/members',
            {
                search:
                    search.trim() || undefined,
                status: status || undefined,
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

    /*
    |--------------------------------------------------------------------------
    | Derived values
    |--------------------------------------------------------------------------
    */

    const setupReady =
        roles.length > 0 &&
        branches.length > 0;

    const activePercentage =
        summary.total > 0
            ? Math.round(
                  (summary.active /
                      summary.total) *
                      100,
              )
            : 0;

    const inactivePercentage =
        summary.total > 0
            ? Math.round(
                  (summary.inactive /
                      summary.total) *
                      100,
              )
            : 0;

    const managerShare =
        summary.total > 0
            ? Math.round(
                  (summary.managers /
                      summary.total) *
                      100,
              )
            : 0;

    const hasActiveFilters = Boolean(
        search.trim() ||
            status ||
            roleId ||
            branchId,
    );

    const workforceStatusLabel =
        summary.total === 0
            ? 'No team accounts'
            : summary.inactive === 0
              ? 'All accounts active'
              : `${summary.inactive} access restriction${
                    summary.inactive === 1
                        ? ''
                        : 's'
                }`;

    const actionDialog =
        getMemberActionDialog(actionTarget);

    /*
    |--------------------------------------------------------------------------
    | Table columns
    |--------------------------------------------------------------------------
    */

    const columns: DataTableColumn<TeamMember>[] =
        [
            {
                key: 'member',
                header: 'Team Member',
                className: 'min-w-[260px]',
                cell: (member) => (
                    <EntityInfo
                        avatar={
                            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-[11px] font-semibold text-violet-300">
                                {memberInitials(
                                    member.name,
                                )}
                            </span>
                        }
                        title={member.name}
                        badges={
                            member.email_verified_at ? (
                                <Badge
                                    variant="outline"
                                    className="h-5 gap-1 rounded-full border-emerald-500/15 bg-emerald-500/[0.06] px-1.5 text-[8px] font-semibold text-emerald-300"
                                >
                                    <BadgeCheck className="size-2.5" />
                                    VERIFIED
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="h-5 rounded-full border-amber-500/15 bg-amber-500/[0.06] px-1.5 text-[8px] font-semibold text-amber-300"
                                >
                                    UNVERIFIED
                                </Badge>
                            )
                        }
                        subtitle={
                            <span className="inline-flex max-w-[210px] items-center gap-1.5 truncate">
                                <Mail className="size-3 text-blue-400" />
                                {member.email}
                            </span>
                        }
                        description={
                            member.created_by.name
                                ? `Added by ${member.created_by.name}`
                                : 'Creator not recorded'
                        }
                    />
                ),
            },
            {
                key: 'role',
                header: 'Role Profile',
                className: 'min-w-[170px]',
                cell: (member) => (
                    <div className="space-y-2">
                        <MemberRoleBadge
                            role={member.role}
                        />

                        <p className="text-[9px] text-muted-foreground">
                            {member.role.code.toLowerCase() ===
                            'manager'
                                ? 'Management-level operations'
                                : 'Assigned operational access'}
                        </p>
                    </div>
                ),
            },
            {
                key: 'branch',
                header: 'Branch Assignment',
                className: 'min-w-[215px]',
                cell: (member) =>
                    member.branch ? (
                        <div className="flex items-start gap-2.5">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/10 text-blue-400">
                                <Building2 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <p className="max-w-[150px] truncate text-[12px] font-semibold">
                                        {member.branch.name}
                                    </p>

                                    {member.branch.is_main && (
                                        <Badge
                                            variant="outline"
                                            className="h-5 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-1.5 text-[8px] text-blue-300"
                                        >
                                            MAIN
                                        </Badge>
                                    )}
                                </div>

                                <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                                    {member.branch.code}
                                </p>

                                {!member.branch.is_active && (
                                    <p className="mt-1 text-[9px] text-amber-400">
                                        Branch is inactive
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted-foreground">
                            Not assigned
                        </span>
                    ),
            },
            {
                key: 'health',
                header: 'Account Health',
                className: 'min-w-[180px]',
                cell: (member) => (
                    <div className="space-y-2">
                        <StatusBadge
                            label={
                                member.is_active
                                    ? 'Active'
                                    : 'Inactive'
                            }
                            variant={
                                member.is_active
                                    ? 'success'
                                    : 'danger'
                            }
                        />

                        <div className="space-y-1 text-[9px] text-muted-foreground">
                            <p>
                                {member.account_is_active
                                    ? 'Login account enabled'
                                    : 'Login account disabled'}
                            </p>

                            <p>
                                {member.email_verified_at
                                    ? 'Email identity verified'
                                    : 'Email verification pending'}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                key: 'joined',
                header: 'Date Added',
                className: 'min-w-[150px]',
                cell: (member) => (
                    <div>
                        <p className="text-[11px] font-medium">
                            {formatDate(
                                member.joined_at ??
                                    member.created_at,
                            )}
                        </p>

                        <p className="mt-1 text-[9px] text-muted-foreground">
                            Team onboarding
                        </p>
                    </div>
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                headerClassName:
                    'text-right',
                className: 'text-right',
                cell: (member) => {
                    const isProcessing =
                        processingMemberId ===
                        member.id;

                    return (
                        <ActionGroup>
                            <IconButton
                                label="Edit team member"
                                disabled={isProcessing}
                                onClick={() =>
                                    openEditDialog(
                                        member,
                                    )
                                }
                                className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-400"
                            >
                                <Edit3 className="size-3.5" />
                            </IconButton>

                            <IconButton
                                label="Reset password"
                                disabled={isProcessing}
                                onClick={() =>
                                    openResetPasswordDialog(
                                        member,
                                    )
                                }
                                className="text-violet-400 hover:bg-violet-500/10 hover:text-violet-400"
                            >
                                <KeyRound className="size-3.5" />
                            </IconButton>

                            <IconButton
                                label={
                                    member.is_active
                                        ? 'Deactivate account'
                                        : 'Activate account'
                                }
                                disabled={isProcessing}
                                onClick={() =>
                                    requestStatusAction(
                                        member,
                                    )
                                }
                                className={cn(
                                    member.is_active
                                        ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-400'
                                        : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400',
                                )}
                            >
                                {isProcessing ? (
                                    <RefreshCw className="size-3.5 animate-spin" />
                                ) : member.is_active ? (
                                    <PowerOff className="size-3.5" />
                                ) : (
                                    <Power className="size-3.5" />
                                )}
                            </IconButton>

                            <IconButton
                                label="Remove team member"
                                disabled={isProcessing}
                                onClick={() =>
                                    requestRemoveMember(
                                        member,
                                    )
                                }
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                            >
                                <Trash2 className="size-3.5" />
                            </IconButton>
                        </ActionGroup>
                    );
                },
            },
        ];

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />

            <PageContainer className="gap-4 md:gap-5">
                {/* Team operations board */}

                <section className="relative min-w-0 overflow-hidden rounded-2xl border border-violet-500/15 bg-card/75 shadow-sm">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(139,92,246,0.10),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(59,130,246,0.08),transparent_27%),linear-gradient(to_bottom_right,rgba(255,255,255,0.018),transparent_55%)]" />

                    <div className="relative flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.09)]">
                                <Users className="size-4.5" />

                                <span className="absolute -right-1 -top-1 size-2 rounded-full border-2 border-card bg-emerald-400" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-sm font-semibold tracking-tight">
                                        Team Operations Control
                                    </h1>

                                    <Badge
                                        variant="outline"
                                        className="h-5 gap-1 rounded-full border-violet-500/15 bg-violet-500/[0.07] px-2 text-[9px] font-semibold text-violet-300"
                                    >
                                        <Sparkles className="size-2.5" />
                                        WORKFORCE GOVERNANCE
                                    </Badge>
                                </div>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Manage account readiness, role assignments, branch coverage, and team access.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 gap-1.5 rounded-full border-blue-500/15 bg-blue-500/10 px-3 text-[10px] text-blue-300"
                            >
                                <Users className="size-3" />
                                {summary.total} account
                                {summary.total === 1
                                    ? ''
                                    : 's'}
                            </Badge>

                            <Badge
                                variant="outline"
                                className="h-7 gap-1.5 rounded-full border-violet-500/15 bg-violet-500/10 px-3 text-[10px] text-violet-300"
                            >
                                <ShieldCheck className="size-3" />
                                {roles.length} role
                                {roles.length === 1
                                    ? ''
                                    : 's'}
                            </Badge>

                            <Badge
                                variant="outline"
                                className={cn(
                                    'h-7 gap-1.5 rounded-full px-3 text-[10px]',
                                    setupReady
                                        ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-300'
                                        : 'border-amber-500/15 bg-amber-500/10 text-amber-300',
                                )}
                            >
                                {setupReady ? (
                                    <CheckCircle2 className="size-3" />
                                ) : (
                                    <AlertTriangle className="size-3" />
                                )}

                                {setupReady
                                    ? `${branches.length} active branch${
                                          branches.length ===
                                          1
                                              ? ''
                                              : 'es'
                                      }`
                                    : 'Setup required'}
                            </Badge>
                        </div>
                    </div>

                    <div className="relative grid min-w-0 xl:grid-cols-[280px_400px_minmax(0,1fr)]">
                        <div className="border-b border-border/60 p-4 xl:border-b-0 xl:border-r">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                        Workforce profile
                                    </p>

                                    <p className="mt-2 text-lg font-semibold">
                                        {summary.active}{' '}
                                        active accounts
                                    </p>

                                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                                        Manager and staff accounts currently available for inventory operations.
                                    </p>
                                </div>

                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-violet-400">
                                    <Users className="size-4" />
                                </span>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between gap-3 text-[9px]">
                                    <span className="text-muted-foreground">
                                        Account availability
                                    </span>

                                    <span className="font-semibold tabular-nums text-violet-400">
                                        {activePercentage}%
                                    </span>
                                </div>

                                <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full bg-emerald-400 transition-all duration-500"
                                        style={{
                                            width: `${activePercentage}%`,
                                        }}
                                    />

                                    <div
                                        className="h-full bg-red-400 transition-all duration-500"
                                        style={{
                                            width: `${inactivePercentage}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-3 flex items-center justify-between rounded-lg border border-border/60 bg-background/35 px-3 py-2">
                                    <span className="text-[9px] text-muted-foreground">
                                        Restricted accounts
                                    </span>

                                    <span className="text-xs font-semibold tabular-nums">
                                        {summary.inactive}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 grid-rows-2 gap-px border-b border-border/60 bg-border/60 p-px xl:border-b-0 xl:border-r">
                            <TeamMetric
                                label="Active accounts"
                                value={String(
                                    summary.active,
                                )}
                                detail="Operational access"
                                icon={CheckCircle2}
                                tone="emerald"
                            />

                            <TeamMetric
                                label="Managers"
                                value={String(
                                    summary.managers,
                                )}
                                detail={`${managerShare}% of team`}
                                icon={UserCog}
                                tone="violet"
                            />

                            <TeamMetric
                                label="Staff"
                                value={String(
                                    summary.staff,
                                )}
                                detail="Operational users"
                                icon={CircleUserRound}
                                tone="blue"
                            />

                            <TeamMetric
                                label="Branches"
                                value={String(
                                    branches.length,
                                )}
                                detail="Assignment options"
                                icon={Building2}
                                tone="amber"
                            />
                        </div>

                        <div className="p-4">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                Workforce signals
                            </p>

                            <div className="mt-3 space-y-2">
                                <TeamSignal
                                    icon={ShieldCheck}
                                    title={
                                        summary.inactive ===
                                        0
                                            ? 'Access synchronized'
                                            : 'Access restrictions'
                                    }
                                    description={
                                        summary.inactive ===
                                        0
                                            ? 'All registered team accounts are available.'
                                            : `${summary.inactive} account${
                                                  summary.inactive ===
                                                  1
                                                      ? ''
                                                      : 's'
                                              } currently cannot access inventory.`
                                    }
                                    tone={
                                        summary.inactive ===
                                        0
                                            ? 'emerald'
                                            : 'amber'
                                    }
                                />

                                <TeamSignal
                                    icon={UserCog}
                                    title="Role composition"
                                    description={`${summary.managers} manager and ${summary.staff} staff account${
                                        summary.staff === 1
                                            ? ''
                                            : 's'
                                    } configured.`}
                                    tone="violet"
                                />

                                <TeamSignal
                                    icon={
                                        setupReady
                                            ? CheckCircle2
                                            : AlertTriangle
                                    }
                                    title={
                                        setupReady
                                            ? 'Creation ready'
                                            : 'Setup incomplete'
                                    }
                                    description={
                                        setupReady
                                            ? 'Roles and branches are available for new accounts.'
                                            : roles.length ===
                                                0
                                              ? 'Configure Manager or Staff roles first.'
                                              : 'Create an active branch before adding members.'
                                    }
                                    tone={
                                        setupReady
                                            ? 'blue'
                                            : 'amber'
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {!setupReady && (
                    <CalloutCard
                        tone="warning"
                        icon={AlertTriangle}
                        title="Team member creation is unavailable"
                        description={
                            roles.length === 0
                                ? 'No assignable Manager or Staff role is configured.'
                                : 'Create at least one active branch before adding a team member.'
                        }
                    />
                )}

                {/* Team directory */}

                <SectionCard
                    title="Team Member Directory"
                    description="Manage account identity, assigned roles, branch coverage, credentials, and operational access."
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'h-7 rounded-full px-2.5 text-[10px] font-medium',
                                    summary.inactive === 0
                                        ? 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-300'
                                        : 'border-amber-500/15 bg-amber-500/[0.06] text-amber-300',
                                )}
                            >
                                <Users className="mr-1 size-3" />

                                {workforceStatusLabel}
                            </Badge>

                            <Button
                                type="button"
                                disabled={!setupReady}
                                onClick={openCreateDialog}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Add Team Member
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_160px_190px_210px]"
                        actions={
                            <>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="h-10 px-4 text-sm"
                                >
                                    Apply Filters
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        !hasActiveFilters
                                    }
                                    onClick={resetFilters}
                                    className="h-10 px-3 text-sm"
                                >
                                    <RefreshCw className="size-3.5" />
                                    Reset
                                </Button>
                            </>
                        }
                    >
                        <SearchInput
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            onClear={() =>
                                setSearch('')
                            }
                            placeholder="Search name, email, or role..."
                            className="sm:col-span-2 xl:col-span-1"
                        />

                        <Select
                            value={
                                status || ALL_VALUE
                            }
                            onValueChange={(value) =>
                                setStatus(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={ALL_VALUE}
                                >
                                    All statuses
                                </SelectItem>

                                <SelectItem value="active">
                                    Active
                                </SelectItem>

                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                roleId || ALL_VALUE
                            }
                            onValueChange={(value) =>
                                setRoleId(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All roles" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={ALL_VALUE}
                                >
                                    All roles
                                </SelectItem>

                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.id}
                                        value={String(
                                            role.id,
                                        )}
                                    >
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={
                                branchId ||
                                ALL_VALUE
                            }
                            onValueChange={(value) =>
                                setBranchId(
                                    value ===
                                        ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All branches" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem
                                    value={ALL_VALUE}
                                >
                                    All branches
                                </SelectItem>

                                {branches.map(
                                    (branch) => (
                                        <SelectItem
                                            key={
                                                branch.id
                                            }
                                            value={String(
                                                branch.id,
                                            )}
                                        >
                                            {branch.name}
                                            {branch.is_main
                                                ? ' — Main'
                                                : ''}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <DataTable
                        data={members.data}
                        columns={columns}
                        getRowKey={(member) =>
                            member.id
                        }
                        emptyIcon={UserX}
                        emptyTitle="No team members found"
                        emptyDescription="No team accounts matched the current filters. Reset the filters or add a new member."
                        emptyAction={
                            <div className="flex flex-wrap justify-center gap-2">
                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={
                                            resetFilters
                                        }
                                    >
                                        <RefreshCw className="size-4" />
                                        Reset Filters
                                    </Button>
                                )}

                                {setupReady && (
                                    <Button
                                        type="button"
                                        onClick={
                                            openCreateDialog
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add Team Member
                                    </Button>
                                )}
                            </div>
                        }
                        minWidth="1180px"
                    />

                    <AppPagination
                        pagination={members}
                        itemLabel="team members"
                    />
                </SectionCard>
            </PageContainer>

            {/* Create or edit member */}

            <FormDialog
                open={isMemberDialogOpen}
                onOpenChange={
                    handleMemberDialogChange
                }
                title={
                    editingMember
                        ? 'Edit Team Member'
                        : 'Add Team Member'
                }
                description={
                    editingMember
                        ? `Update the account, role, and branch assignment for ${editingMember.name}.`
                        : 'Create a Manager or Staff login account for inventory operations.'
                }
                onSubmit={submitMember}
                processing={
                    memberForm.processing
                }
                submitText={
                    editingMember
                        ? 'Save Changes'
                        : 'Create Account'
                }
                processingText={
                    editingMember
                        ? 'Saving Changes...'
                        : 'Creating Account...'
                }
                maxWidth="max-w-3xl"
            >
                <FormSection
                    title="Account Identity"
                    description="Enter the member name and login email address."
                    icon={<CircleUserRound />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="member_name"
                            label="Full Name"
                            error={
                                memberForm.errors.name
                            }
                            required
                        >
                            <Input
                                id="member_name"
                                type="text"
                                value={
                                    memberForm.data.name
                                }
                                disabled={
                                    memberForm.processing
                                }
                                onChange={(event) =>
                                    memberForm.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                                placeholder="Enter full name"
                                autoComplete="name"
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            id="member_email"
                            label="Email Address"
                            error={
                                memberForm.errors
                                    .email
                            }
                            required
                        >
                            <Input
                                id="member_email"
                                type="email"
                                value={
                                    memberForm.data.email
                                }
                                disabled={
                                    memberForm.processing
                                }
                                onChange={(event) =>
                                    memberForm.setData(
                                        'email',
                                        event.target.value,
                                    )
                                }
                                placeholder="staff@example.com"
                                autoComplete="email"
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormSection
                    title="Operational Assignment"
                    description="Assign the role policy and branch where this account will operate."
                    icon={<ShieldCheck />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="product_user_type_id"
                            label="Team Role"
                            error={
                                memberForm.errors
                                    .product_user_type_id
                            }
                            required
                        >
                            <Select
                                value={
                                    memberForm.data
                                        .product_user_type_id ||
                                    NONE_VALUE
                                }
                                disabled={
                                    memberForm.processing
                                }
                                onValueChange={(value) =>
                                    memberForm.setData(
                                        'product_user_type_id',
                                        value ===
                                            NONE_VALUE
                                            ? ''
                                            : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="product_user_type_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem
                                        value={NONE_VALUE}
                                    >
                                        Select role
                                    </SelectItem>

                                    {roles.map(
                                        (role) => (
                                            <SelectItem
                                                key={
                                                    role.id
                                                }
                                                value={String(
                                                    role.id,
                                                )}
                                            >
                                                {
                                                    role.name
                                                }
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>

                            <RoleDescription
                                role={roles.find(
                                    (role) =>
                                        String(
                                            role.id,
                                        ) ===
                                        memberForm.data
                                            .product_user_type_id,
                                )}
                            />
                        </FormField>

                        <FormField
                            id="branch_id"
                            label="Assigned Branch"
                            error={
                                memberForm.errors
                                    .branch_id
                            }
                            required
                        >
                            <Select
                                value={
                                    memberForm.data
                                        .branch_id ||
                                    NONE_VALUE
                                }
                                disabled={
                                    memberForm.processing
                                }
                                onValueChange={(value) =>
                                    memberForm.setData(
                                        'branch_id',
                                        value ===
                                            NONE_VALUE
                                            ? ''
                                            : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="branch_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem
                                        value={NONE_VALUE}
                                    >
                                        Select branch
                                    </SelectItem>

                                    {branches.map(
                                        (branch) => (
                                            <SelectItem
                                                key={
                                                    branch.id
                                                }
                                                value={String(
                                                    branch.id,
                                                )}
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
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                </FormSection>

                <FormSection
                    title={
                        editingMember
                            ? 'Credential Update'
                            : 'Temporary Credentials'
                    }
                    description={
                        editingMember
                            ? 'Leave both password fields blank to retain the current password.'
                            : 'Create the temporary password the member will use to sign in.'
                    }
                    icon={<KeyRound />}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            id="member_password"
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
                            <PasswordField
                                id="member_password"
                                value={
                                    memberForm.data
                                        .password
                                }
                                show={showPassword}
                                disabled={
                                    memberForm.processing
                                }
                                placeholder="Minimum 8 characters"
                                autoComplete="new-password"
                                onToggle={() =>
                                    setShowPassword(
                                        (current) =>
                                            !current,
                                    )
                                }
                                onChange={(value) =>
                                    memberForm.setData(
                                        'password',
                                        value,
                                    )
                                }
                            />
                        </FormField>

                        <FormField
                            id="member_password_confirmation"
                            label="Confirm Password"
                            error={
                                memberForm.errors
                                    .password_confirmation
                            }
                            required={
                                !editingMember
                            }
                        >
                            <PasswordField
                                id="member_password_confirmation"
                                value={
                                    memberForm.data
                                        .password_confirmation
                                }
                                show={
                                    showPasswordConfirmation
                                }
                                disabled={
                                    memberForm.processing
                                }
                                placeholder="Repeat password"
                                autoComplete="new-password"
                                onToggle={() =>
                                    setShowPasswordConfirmation(
                                        (current) =>
                                            !current,
                                    )
                                }
                                onChange={(value) =>
                                    memberForm.setData(
                                        'password_confirmation',
                                        value,
                                    )
                                }
                            />
                        </FormField>
                    </div>
                </FormSection>
            </FormDialog>

            {/* Reset password */}

            <FormDialog
                open={resettingMember !== null}
                onOpenChange={
                    handleResetPasswordDialogChange
                }
                title="Reset Password"
                description={`Set a new password for ${resettingMember?.name ?? 'this team member'}.`}
                onSubmit={
                    submitResetPassword
                }
                processing={
                    passwordForm.processing
                }
                submitText="Reset Password"
                processingText="Resetting Password..."
                maxWidth="max-w-lg"
            >
                {resettingMember && (
                    <section className="rounded-xl border border-violet-500/10 bg-violet-500/[0.045] p-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-[11px] font-semibold text-violet-300">
                                {memberInitials(
                                    resettingMember.name,
                                )}
                            </span>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {
                                        resettingMember.name
                                    }
                                </p>

                                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                    {
                                        resettingMember.email
                                    }
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <FormSection
                    title="New Credentials"
                    description="The new password becomes active immediately after saving."
                    icon={<KeyRound />}
                >
                    <div className="grid gap-4">
                        <FormField
                            id="reset_password"
                            label="New Password"
                            error={
                                passwordForm.errors
                                    .password
                            }
                            required
                        >
                            <PasswordField
                                id="reset_password"
                                value={
                                    passwordForm.data
                                        .password
                                }
                                show={
                                    showResetPassword
                                }
                                disabled={
                                    passwordForm.processing
                                }
                                placeholder="Minimum 8 characters"
                                autoComplete="new-password"
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
                            id="reset_password_confirmation"
                            label="Confirm New Password"
                            error={
                                passwordForm.errors
                                    .password_confirmation
                            }
                            required
                        >
                            <PasswordField
                                id="reset_password_confirmation"
                                value={
                                    passwordForm.data
                                        .password_confirmation
                                }
                                show={
                                    showResetPasswordConfirmation
                                }
                                disabled={
                                    passwordForm.processing
                                }
                                placeholder="Repeat new password"
                                autoComplete="new-password"
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
                    </div>
                </FormSection>
            </FormDialog>

            {/* Status or remove confirmation */}

            <ConfirmDialog
                open={actionTarget !== null}
                onOpenChange={(open) => {
                    if (
                        !open &&
                        processingMemberId ===
                            null
                    ) {
                        setActionTarget(null);
                    }
                }}
                title={actionDialog.title}
                description={
                    actionDialog.description
                }
                confirmText={
                    actionDialog.confirmText
                }
                processing={
                    processingMemberId !== null
                }
                destructive={
                    actionDialog.destructive
                }
                onConfirm={executeMemberAction}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Team overview helpers
|--------------------------------------------------------------------------
*/

function TeamMetric({
    label,
    value,
    detail,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: TeamMetricTone;
}) {
    const toneMap: Record<
        TeamMetricTone,
        {
            shell: string;
            icon: string;
            value: string;
        }
    > = {
        emerald: {
            shell: 'bg-emerald-500/[0.025]',
            icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
        },
        violet: {
            shell: 'bg-violet-500/[0.025]',
            icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
        },
        blue: {
            shell: 'bg-blue-500/[0.025]',
            icon: 'border-blue-500/15 bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
        },
        amber: {
            shell: 'bg-amber-500/[0.025]',
            icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
        },
    };

    const styles = toneMap[tone];

    return (
        <div
            className={cn(
                'relative flex min-h-[92px] min-w-0 items-center justify-between gap-4 overflow-hidden p-4',
                styles.shell,
            )}
        >
            <Icon className="pointer-events-none absolute -bottom-4 -right-3 size-20 opacity-[0.035]" />

            <div className="relative flex min-w-0 items-center gap-3">
                <span
                    className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border',
                        styles.icon,
                    )}
                >
                    <Icon className="size-3.5" />
                </span>

                <div className="min-w-0">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-[8px] text-muted-foreground">
                        {detail}
                    </p>
                </div>
            </div>

            <p
                className={cn(
                    'relative shrink-0 text-2xl font-semibold leading-none tabular-nums',
                    styles.value,
                )}
            >
                {value}
            </p>
        </div>
    );
}

function TeamSignal({
    icon: Icon,
    title,
    description,
    tone,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    tone: TeamMetricTone;
}) {
    const toneMap: Record<
        TeamMetricTone,
        {
            shell: string;
            icon: string;
        }
    > = {
        emerald: {
            shell: 'border-emerald-500/15 bg-emerald-500/[0.055]',
            icon: 'bg-emerald-500/10 text-emerald-400',
        },
        violet: {
            shell: 'border-violet-500/15 bg-violet-500/[0.055]',
            icon: 'bg-violet-500/10 text-violet-400',
        },
        blue: {
            shell: 'border-blue-500/15 bg-blue-500/[0.055]',
            icon: 'bg-blue-500/10 text-blue-400',
        },
        amber: {
            shell: 'border-amber-500/15 bg-amber-500/[0.055]',
            icon: 'bg-amber-500/10 text-amber-400',
        },
    };

    const styles = toneMap[tone];

    return (
        <div
            className={cn(
                'rounded-lg border px-3 py-2.5',
                styles.shell,
            )}
        >
            <div className="flex items-start gap-2.5">
                <span
                    className={cn(
                        'inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                        styles.icon,
                    )}
                >
                    <Icon className="size-3.5" />
                </span>

                <div className="min-w-0">
                    <p className="text-[10px] font-semibold">
                        {title}
                    </p>

                    <p className="mt-0.5 line-clamp-2 text-[8px] leading-3.5 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Member helpers
|--------------------------------------------------------------------------
*/

function MemberRoleBadge({
    role,
}: {
    role: TeamMemberRole;
}) {
    const isManager =
        role.code.toLowerCase() === 'manager';

    return (
        <Badge
            variant="outline"
            className={cn(
                'h-6 gap-1.5 rounded-full px-2.5 text-[9px] font-medium',
                isManager
                    ? 'border-violet-500/15 bg-violet-500/10 text-violet-300'
                    : 'border-blue-500/15 bg-blue-500/10 text-blue-300',
            )}
        >
            {isManager ? (
                <UserCog className="size-3" />
            ) : (
                <CircleUserRound className="size-3" />
            )}

            {role.name}
        </Badge>
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
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {role.description}
        </p>
    );
}

function PasswordField({
    id,
    value,
    show,
    disabled,
    placeholder,
    autoComplete,
    onChange,
    onToggle,
}: {
    id: string;
    value: string;
    show: boolean;
    disabled: boolean;
    placeholder: string;
    autoComplete: string;
    onChange: (value: string) => void;
    onToggle: () => void;
}) {
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                disabled={disabled}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="pr-10"
            />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={onToggle}
                title={
                    show
                        ? 'Hide password'
                        : 'Show password'
                }
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
                {show ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </Button>
        </div>
    );
}

function getMemberActionDialog(
    target: MemberActionTarget | null,
): {
    title: string;
    description: string;
    confirmText: string;
    destructive: boolean;
} {
    if (!target) {
        return {
            title: 'Update Team Member',
            description:
                'Confirm the requested account action.',
            confirmText: 'Continue',
            destructive: false,
        };
    }

    const { member, action } = target;

    if (action === 'activate') {
        return {
            title: 'Activate Team Member',
            description: `Activate ${member.name}'s inventory access? The account will be allowed to sign in based on its assigned role and branch.`,
            confirmText: 'Activate Account',
            destructive: false,
        };
    }

    if (action === 'deactivate') {
        return {
            title: 'Deactivate Team Member',
            description: `Deactivate ${member.name}'s inventory access? The account will no longer be able to use the inventory system until reactivated.`,
            confirmText: 'Deactivate Account',
            destructive: true,
        };
    }

    return {
        title: 'Remove Team Member',
        description: `Remove ${member.name} from Team Management? Their inventory product access will be removed. The server may prevent removal when related operational records must be retained.`,
        confirmText: 'Remove Member',
        destructive: true,
    };
}

function memberInitials(
    name: string,
): string {
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

    return `${parts[0][0]}${
        parts[parts.length - 1][0]
    }`.toUpperCase();
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