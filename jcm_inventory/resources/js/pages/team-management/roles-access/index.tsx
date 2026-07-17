import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PageContainer } from '@/components/shared/page-container';
import { SearchInput } from '@/components/shared/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Boxes,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CircleUserRound,
    ClipboardCheck,
    History,
    Layers3,
    LayoutDashboard,
    LoaderCircle,
    LockKeyhole,
    Package2,
    PackageCheck,
    RotateCcw,
    Save,
    Search,
    ShieldCheck,
    Sparkles,
    SlidersHorizontal,
    Tags,
    Truck,
    UserCog,
    Users,
    Warehouse,
    type LucideIcon,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from 'react';

type PermissionItem = {
    id: number;
    parent_id: number | null;
    key: string;
    section_key: string;
    type: 'link' | 'group' | 'heading';
    label: string;
    route_name: string | null;
    url: string;
    icon_key: string | null;
    feature_code: string | null;
    description: string | null;
    required: boolean;
    assignable: boolean;
    children: PermissionItem[];
};

type PermissionSection = {
    key: string;
    label: string;
    items: PermissionItem[];
};

type ProductRole = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    members_count: number;
    assigned_item_ids: number[];
    enabled_count: number;
    available_count: number;
};

type RoleAccessSummary = {
    roles: number;
    available_modules: number;
    manager_access: number;
    staff_access: number;
};

type PlanInformation = {
    id: number;
    code: string;
    name: string;
    has_role_based_access: boolean;
};

type RoleAccessPageProps = {
    roles: ProductRole[];
    sections: PermissionSection[];
    summary: RoleAccessSummary;
    plan: PlanInformation;
};

type RoleAccessFormData = {
    sidebar_item_ids: number[];
};

type SelectionState = 'all' | 'partial' | 'none';

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
        title: 'Roles & Access',
        href: '/team/roles',
    },
];

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    AlertTriangle,
    BarChart3,
    Boxes,
    Building2,
    Warehouse,
    History,
    Tags,
    Package2,
    Truck,
    ClipboardCheck,
    PackageCheck,
    Users,
    UserCog,
};

export default function RolesAccessIndex({
    roles,
    sections,
    summary,
    plan,
}: RoleAccessPageProps) {
    const [selectedRoleId, setSelectedRoleId] =
        useState<number | null>(roles[0]?.id ?? null);

    const [pendingRoleId, setPendingRoleId] =
        useState<number | null>(null);

    const [search, setSearch] = useState('');

    const [expandedGroups, setExpandedGroups] =
        useState<number[]>(() => collectGroupIds(sections));

    const selectedRole = useMemo(() => {
        return (
            roles.find(
                (role) => role.id === selectedRoleId,
            ) ?? null
        );
    }, [roles, selectedRoleId]);

    const allAssignableItems = useMemo(() => {
        return flattenItems(
            sections.flatMap(
                (section) => section.items,
            ),
        ).filter((item) => item.assignable);
    }, [sections]);

    const requiredItemIds = useMemo(() => {
        return allAssignableItems
            .filter((item) => item.required)
            .map((item) => item.id);
    }, [allAssignableItems]);

    const filteredSections = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return sections;
        }

        return sections
            .map((section) => ({
                ...section,
                items: section.items
                    .map((item) =>
                        filterPermissionItem(
                            item,
                            keyword,
                        ),
                    )
                    .filter(
                        (
                            item,
                        ): item is PermissionItem =>
                            item !== null,
                    ),
            }))
            .filter(
                (section) =>
                    section.items.length > 0,
            );
    }, [search, sections]);

    const form = useForm<RoleAccessFormData>({
        sidebar_item_ids:
            selectedRole?.assigned_item_ids ?? [],
    });

    useEffect(() => {
        if (!selectedRole) {
            form.setData(
                'sidebar_item_ids',
                [],
            );

            return;
        }

        form.clearErrors();

        form.setData(
            'sidebar_item_ids',
            uniqueSortedIds([
                ...selectedRole.assigned_item_ids,
                ...requiredItemIds,
            ]),
        );
    }, [selectedRoleId]);

    const selectedIds = useMemo(() => {
        return new Set(
            form.data.sidebar_item_ids,
        );
    }, [form.data.sidebar_item_ids]);

    const currentEnabledCount = useMemo(() => {
        return allAssignableItems.filter(
            (item) => selectedIds.has(item.id),
        ).length;
    }, [allAssignableItems, selectedIds]);

    const accessPercentage =
        allAssignableItems.length > 0
            ? Math.round(
                  (currentEnabledCount /
                      allAssignableItems.length) *
                      100,
              )
            : 0;

    const hasChanges = useMemo(() => {
        if (!selectedRole) {
            return false;
        }

        const original = uniqueSortedIds([
            ...selectedRole.assigned_item_ids,
            ...requiredItemIds,
        ]);

        const current = uniqueSortedIds(
            form.data.sidebar_item_ids,
        );

        return (
            JSON.stringify(original) !==
            JSON.stringify(current)
        );
    }, [
        selectedRole,
        requiredItemIds,
        form.data.sidebar_item_ids,
    ]);

    function applyRoleSelection(roleId: number): void {
        setSelectedRoleId(roleId);
        setSearch('');
    }

    function selectRole(roleId: number): void {
        if (
            roleId === selectedRoleId ||
            form.processing
        ) {
            return;
        }

        if (hasChanges) {
            setPendingRoleId(roleId);
            return;
        }

        applyRoleSelection(roleId);
    }

    function togglePermission(
        item: PermissionItem,
    ): void {
        if (!item.assignable || item.required) {
            return;
        }

        const nextIds = new Set(
            form.data.sidebar_item_ids,
        );

        if (nextIds.has(item.id)) {
            nextIds.delete(item.id);
        } else {
            nextIds.add(item.id);
        }

        requiredItemIds.forEach((id) => {
            nextIds.add(id);
        });

        form.setData(
            'sidebar_item_ids',
            uniqueSortedIds(
                Array.from(nextIds),
            ),
        );
    }

    function toggleGroup(
        item: PermissionItem,
    ): void {
        const descendantIds =
            collectAssignableDescendantIds(
                item,
            ).filter(
                (id) =>
                    !requiredItemIds.includes(id),
            );

        if (descendantIds.length === 0) {
            return;
        }

        const nextIds = new Set(
            form.data.sidebar_item_ids,
        );

        const allSelected =
            descendantIds.every((id) =>
                nextIds.has(id),
            );

        descendantIds.forEach((id) => {
            if (allSelected) {
                nextIds.delete(id);
            } else {
                nextIds.add(id);
            }
        });

        requiredItemIds.forEach((id) => {
            nextIds.add(id);
        });

        form.setData(
            'sidebar_item_ids',
            uniqueSortedIds(
                Array.from(nextIds),
            ),
        );
    }

    function toggleSection(
        section: PermissionSection,
    ): void {
        const sectionIds = flattenItems(
            section.items,
        )
            .filter(
                (item) =>
                    item.assignable &&
                    !item.required,
            )
            .map((item) => item.id);

        if (sectionIds.length === 0) {
            return;
        }

        const nextIds = new Set(
            form.data.sidebar_item_ids,
        );

        const allSelected = sectionIds.every(
            (id) => nextIds.has(id),
        );

        sectionIds.forEach((id) => {
            if (allSelected) {
                nextIds.delete(id);
            } else {
                nextIds.add(id);
            }
        });

        requiredItemIds.forEach((id) => {
            nextIds.add(id);
        });

        form.setData(
            'sidebar_item_ids',
            uniqueSortedIds(
                Array.from(nextIds),
            ),
        );
    }

    function enableAll(): void {
        form.setData(
            'sidebar_item_ids',
            uniqueSortedIds(
                allAssignableItems.map(
                    (item) => item.id,
                ),
            ),
        );
    }

    function requiredOnly(): void {
        form.setData(
            'sidebar_item_ids',
            uniqueSortedIds(
                requiredItemIds,
            ),
        );
    }

    function resetChanges(): void {
        if (!selectedRole) {
            return;
        }

        form.clearErrors();

        form.setData(
            'sidebar_item_ids',
            uniqueSortedIds([
                ...selectedRole.assigned_item_ids,
                ...requiredItemIds,
            ]),
        );
    }

    function submitPermissions(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (!selectedRole) {
            return;
        }

        form.put(
            `/team/roles/${selectedRole.id}`,
            {
                preserveScroll: true,
            },
        );
    }

    function toggleExpandedGroup(
        groupId: number,
    ): void {
        setExpandedGroups((current) =>
            current.includes(groupId)
                ? current.filter(
                      (id) => id !== groupId,
                  )
                : [...current, groupId],
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Access" />

            <PageContainer className="gap-4 md:gap-5">
                <section className="relative min-w-0 overflow-hidden rounded-2xl border border-violet-500/15 bg-card/75 shadow-sm">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(139,92,246,0.10),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(59,130,246,0.08),transparent_27%),linear-gradient(to_bottom_right,rgba(255,255,255,0.018),transparent_55%)]" />

                    <div className="relative flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.09)]">
                                <ShieldCheck className="size-4.5" />
                                <span className="absolute -right-1 -top-1 size-2 rounded-full border-2 border-card bg-emerald-400" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-sm font-semibold tracking-tight">
                                        Team Access Control
                                    </h1>

                                    <Badge
                                        variant="outline"
                                        className="h-5 gap-1 rounded-full border-violet-500/15 bg-violet-500/[0.07] px-2 text-[9px] font-semibold text-violet-300"
                                    >
                                        <Sparkles className="size-2.5" />
                                        ROLE GOVERNANCE
                                    </Badge>
                                </div>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Configure which system areas are visible and usable for each operational role.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 gap-1.5 rounded-full border-blue-500/15 bg-blue-500/10 px-3 text-[10px] text-blue-300"
                            >
                                <Users className="size-3" />
                                {summary.roles} configurable roles
                            </Badge>

                            <Badge
                                variant="outline"
                                className="h-7 gap-1.5 rounded-full border-violet-500/15 bg-violet-500/10 px-3 text-[10px] text-violet-300"
                            >
                                <Layers3 className="size-3" />
                                {summary.available_modules} available modules
                            </Badge>

                            <Badge
                                variant="outline"
                                className={cn(
                                    'h-7 gap-1.5 rounded-full px-3 text-[10px]',
                                    plan.has_role_based_access
                                        ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-300'
                                        : 'border-amber-500/15 bg-amber-500/10 text-amber-300',
                                )}
                            >
                                {plan.has_role_based_access ? (
                                    <CheckCircle2 className="size-3" />
                                ) : (
                                    <AlertTriangle className="size-3" />
                                )}
                                {plan.name}
                            </Badge>
                        </div>
                    </div>

                    <div className="relative grid min-w-0 xl:grid-cols-[300px_minmax(0,1fr)]">
                        <div className="border-b border-border/60 p-4 xl:border-b-0 xl:border-r">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                        Active role profile
                                    </p>

                                    <p className="mt-2 truncate text-lg font-semibold">
                                        {selectedRole?.name ?? 'No role selected'}
                                    </p>

                                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                                        {selectedRole?.description ??
                                            'Select a role to configure its access policy.'}
                                    </p>
                                </div>

                                {selectedRole?.code.toLowerCase() === 'manager' ? (
                                    <UserCog className="size-5 shrink-0 text-violet-400" />
                                ) : (
                                    <CircleUserRound className="size-5 shrink-0 text-violet-400" />
                                )}
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between gap-3 text-[9px]">
                                    <span className="text-muted-foreground">
                                        Permission coverage
                                    </span>

                                    <span className="font-semibold tabular-nums text-violet-400">
                                        {accessPercentage}%
                                    </span>
                                </div>

                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-violet-400 transition-all duration-500"
                                        style={{ width: `${accessPercentage}%` }}
                                    />
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                                    <span className="text-[9px] text-muted-foreground">
                                        Accounts using this role
                                    </span>

                                    <span className="text-xs font-semibold tabular-nums">
                                        {selectedRole?.members_count ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <div className="border-b border-border/60 p-4">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                            Access distribution
                                        </p>

                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            Current policy coverage and protected access baseline.
                                        </p>
                                    </div>

                                    <p className="text-[10px] font-medium text-muted-foreground">
                                        {currentEnabledCount} of {allAssignableItems.length} enabled
                                    </p>
                                </div>

                                <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-4">
                                    <AccessStat
                                        label="Enabled access"
                                        value={`${currentEnabledCount}/${allAssignableItems.length}`}
                                        detail="Current role policy"
                                        icon={CheckCircle2}
                                        tone="emerald"
                                        className="border-b border-border/60 pb-3 sm:border-r sm:pr-4 xl:border-b-0 xl:pb-0"
                                    />

                                    <AccessStat
                                        label="Required access"
                                        value={String(requiredItemIds.length)}
                                        detail="Protected modules"
                                        icon={LockKeyhole}
                                        tone="amber"
                                        className="border-b border-border/60 py-3 sm:pl-4 xl:border-b-0 xl:border-r xl:py-0 xl:pr-4"
                                    />

                                    <AccessStat
                                        label="Manager access"
                                        value={String(summary.manager_access)}
                                        detail="Configured modules"
                                        icon={UserCog}
                                        tone="blue"
                                        className="border-b border-border/60 py-3 sm:border-r sm:pr-4 xl:border-b-0 xl:py-0 xl:pl-4"
                                    />

                                    <AccessStat
                                        label="Staff access"
                                        value={String(summary.staff_access)}
                                        detail="Configured modules"
                                        icon={CircleUserRound}
                                        tone="violet"
                                        className="pt-3 sm:pl-4 xl:pt-0"
                                    />
                                </div>
                            </div>

                            <div className="p-4">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                    Governance signals
                                </p>

                                <div className="mt-3 grid gap-2 md:grid-cols-3">
                                    <ControlSignal
                                        icon={LockKeyhole}
                                        title="Required baseline"
                                        description={`${requiredItemIds.length} access items cannot be disabled.`}
                                        tone="amber"
                                    />

                                    <ControlSignal
                                        icon={SlidersHorizontal}
                                        title={
                                            hasChanges
                                                ? 'Policy changed'
                                                : 'Policy synchronized'
                                        }
                                        description={
                                            hasChanges
                                                ? 'Review and save the current role changes.'
                                                : 'Saved access matches the active role policy.'
                                        }
                                        tone={hasChanges ? 'amber' : 'emerald'}
                                    />

                                    <ControlSignal
                                        icon={ShieldCheck}
                                        title="Plan control"
                                        description={
                                            plan.has_role_based_access
                                                ? 'Role-based access is enabled for this subscription.'
                                                : 'This plan may limit role-based access features.'
                                        }
                                        tone={
                                            plan.has_role_based_access
                                                ? 'blue'
                                                : 'amber'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {roles.length === 0 ? (
                    <section className="rounded-2xl border border-border/60 bg-card/70 px-6 py-16 text-center">
                        <ShieldCheck className="mx-auto size-12 text-muted-foreground/30" />
                        <h2 className="mt-4 font-semibold">
                            No configurable roles found
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manager and Staff roles must be configured first.
                        </p>
                    </section>
                ) : (
                    <form onSubmit={submitPermissions} className="min-w-0">
                        <div className="grid min-w-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                            <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70">
                                    <div className="border-b border-border/60 px-4 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h2 className="text-sm font-semibold">
                                                    Role Directory
                                                </h2>
                                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                    Select the policy to configure.
                                                </p>
                                            </div>

                                            <Badge
                                                variant="outline"
                                                className="h-6 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-2 text-[9px] text-blue-300"
                                            >
                                                {roles.length} roles
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2 p-3">
                                        {roles.map((role) => (
                                            <RoleRailCard
                                                key={role.id}
                                                role={role}
                                                selected={role.id === selectedRoleId}
                                                disabled={form.processing}
                                                onClick={() => selectRole(role.id)}
                                            />
                                        ))}
                                    </div>

                                    <div className="border-t border-border/60 p-3">
                                        <div className="rounded-xl border border-violet-500/10 bg-violet-500/[0.045] p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                                                    <ShieldCheck className="size-3.5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] text-muted-foreground">
                                                        Subscription plan
                                                    </p>
                                                    <p className="truncate text-xs font-semibold">
                                                        {plan.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </aside>

                            <div className="min-w-0 space-y-4">
                                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70">
                                    <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="truncate text-base font-semibold">
                                                    {selectedRole?.name} Access Workspace
                                                </h2>

                                                {hasChanges && (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-6 gap-1 rounded-full border-amber-500/20 bg-amber-500/10 px-2.5 text-[9px] font-semibold text-amber-300"
                                                    >
                                                        <SlidersHorizontal className="size-3" />
                                                        UNSAVED
                                                    </Badge>
                                                )}

                                                {form.recentlySuccessful && (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-6 gap-1 rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[9px] font-semibold text-emerald-300"
                                                    >
                                                        <CheckCircle2 className="size-3" />
                                                        SAVED
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                Enable only the modules required by this role's daily responsibilities.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <ToolbarButton
                                                onClick={enableAll}
                                                disabled={form.processing}
                                                icon={<Check className="size-3.5" />}
                                            >
                                                Enable All
                                            </ToolbarButton>

                                            <ToolbarButton
                                                onClick={requiredOnly}
                                                disabled={form.processing}
                                                icon={<LockKeyhole className="size-3.5" />}
                                            >
                                                Required Only
                                            </ToolbarButton>

                                            <ToolbarButton
                                                onClick={resetChanges}
                                                disabled={form.processing || !hasChanges}
                                                icon={<RotateCcw className="size-3.5" />}
                                            >
                                                Reset
                                            </ToolbarButton>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                                        <SearchInput
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            onClear={() => setSearch('')}
                                            placeholder="Search modules, groups, or pages..."
                                        />

                                        <div className="rounded-xl border border-border/60 bg-background/45 px-3 py-2.5">
                                            <div className="flex items-center justify-between gap-3 text-[9px]">
                                                <span className="text-muted-foreground">
                                                    Access coverage
                                                </span>
                                                <span className="font-semibold tabular-nums text-violet-400">
                                                    {currentEnabledCount} of {allAssignableItems.length}
                                                </span>
                                            </div>

                                            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-violet-400 transition-all duration-500"
                                                    style={{ width: `${accessPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {form.errors.sidebar_item_ids && (
                                        <p className="mx-4 mb-4 rounded-xl border border-destructive/15 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                            {form.errors.sidebar_item_ids}
                                        </p>
                                    )}
                                </section>

                                <div className="space-y-4">
                                    {filteredSections.map((section) => (
                                        <PermissionSectionCard
                                            key={section.key}
                                            section={section}
                                            selectedIds={selectedIds}
                                            expandedGroups={expandedGroups}
                                            processing={form.processing}
                                            onToggleSection={toggleSection}
                                            onToggleItem={togglePermission}
                                            onToggleGroup={toggleGroup}
                                            onToggleExpanded={toggleExpandedGroup}
                                        />
                                    ))}

                                    {filteredSections.length === 0 && (
                                        <section className="rounded-2xl border border-border/60 bg-card/70 px-6 py-14 text-center">
                                            <Search className="mx-auto size-10 text-muted-foreground/30" />
                                            <h3 className="mt-3 font-medium">
                                                No matching access items
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Try another module, group, or page name.
                                            </p>
                                        </section>
                                    )}
                                </div>

                                <section className="sticky bottom-4 z-30 overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-xl backdrop-blur">
                                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className={cn(
                                                    'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                                                    hasChanges
                                                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
                                                )}
                                            >
                                                {hasChanges ? (
                                                    <SlidersHorizontal className="size-4.5" />
                                                ) : (
                                                    <CheckCircle2 className="size-4.5" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">
                                                    {hasChanges
                                                        ? 'Review the unsaved access changes'
                                                        : 'Role policy is synchronized'}
                                                </p>
                                                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                                    {currentEnabledCount} modules enabled for {selectedRole?.name}.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={
                                                form.processing ||
                                                !selectedRole ||
                                                !hasChanges
                                            }
                                            className="h-10 rounded-xl px-5 text-sm"
                                        >
                                            {form.processing ? (
                                                <LoaderCircle className="size-4 animate-spin" />
                                            ) : (
                                                <Save className="size-4" />
                                            )}
                                            Save Access Policy
                                        </Button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </form>
                )}
            </PageContainer>

            <ConfirmDialog
                open={pendingRoleId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingRoleId(null);
                    }
                }}
                title="Discard Permission Changes?"
                description="You have unsaved access changes for the current role. Switching roles will discard those changes."
                confirmText="Discard and Switch"
                processing={false}
                onConfirm={() => {
                    if (pendingRoleId !== null) {
                        applyRoleSelection(pendingRoleId);
                    }

                    setPendingRoleId(null);
                }}
            />
        </AppLayout>
    );
}

function PermissionSectionCard({
    section,
    selectedIds,
    expandedGroups,
    processing,
    onToggleSection,
    onToggleItem,
    onToggleGroup,
    onToggleExpanded,
}: {
    section: PermissionSection;
    selectedIds: Set<number>;
    expandedGroups: number[];
    processing: boolean;
    onToggleSection: (section: PermissionSection) => void;
    onToggleItem: (item: PermissionItem) => void;
    onToggleGroup: (item: PermissionItem) => void;
    onToggleExpanded: (groupId: number) => void;
}) {
    const items = flattenItems(section.items).filter((item) => item.assignable);
    const enabledCount = items.filter((item) => selectedIds.has(item.id)).length;
    const state = getItemsSelectionState(section.items, selectedIds);
    const coverage = items.length > 0 ? Math.round((enabledCount / items.length) * 100) : 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div className="flex flex-col gap-4 border-b border-border/60 bg-muted/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10 text-blue-400">
                        <Layers3 className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold">
                                {section.label}
                            </h3>

                            <Badge
                                variant="outline"
                                className="h-5 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-2 text-[9px] text-blue-300"
                            >
                                {enabledCount}/{items.length} enabled
                            </Badge>
                        </div>

                        <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-blue-400 transition-all duration-500"
                                    style={{ width: `${coverage}%` }}
                                />
                            </div>
                            <span className="text-[9px] tabular-nums text-muted-foreground">
                                {coverage}% coverage
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onToggleSection(section)}
                    disabled={processing}
                    className={cn(
                        'inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-[10px] font-semibold transition disabled:opacity-50',
                        state === 'all'
                            ? 'border-blue-500/25 bg-blue-500/10 text-blue-300'
                            : state === 'partial'
                              ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                              : 'border-border/70 bg-background/60 hover:bg-muted',
                    )}
                >
                    <SelectionBox state={state} />
                    {state === 'all'
                        ? 'Disable Section'
                        : state === 'partial'
                          ? 'Complete Section'
                          : 'Enable Section'}
                </button>
            </div>

            <div className="space-y-3 p-3 md:p-4">
                {section.items.map((item) =>
                    item.type === 'group' ? (
                        <PermissionGroup
                            key={item.id}
                            item={item}
                            selectedIds={selectedIds}
                            expandedGroups={expandedGroups}
                            processing={processing}
                            onToggleItem={onToggleItem}
                            onToggleGroup={onToggleGroup}
                            onToggleExpanded={onToggleExpanded}
                        />
                    ) : (
                        <PermissionCard
                            key={item.id}
                            item={item}
                            selected={selectedIds.has(item.id)}
                            processing={processing}
                            onToggle={() => onToggleItem(item)}
                        />
                    ),
                )}
            </div>
        </section>
    );
}

function PermissionGroup({
    item,
    selectedIds,
    expandedGroups,
    processing,
    onToggleItem,
    onToggleGroup,
    onToggleExpanded,
}: {
    item: PermissionItem;
    selectedIds: Set<number>;
    expandedGroups: number[];
    processing: boolean;
    onToggleItem: (item: PermissionItem) => void;
    onToggleGroup: (item: PermissionItem) => void;
    onToggleExpanded: (groupId: number) => void;
}) {
    const expanded = expandedGroups.includes(item.id);
    const state = getItemSelectionState(item, selectedIds);
    const descendants = collectAssignableDescendantIds(item);
    const enabledCount = descendants.filter((id) => selectedIds.has(id)).length;
    const Icon = item.icon_key && iconMap[item.icon_key] ? iconMap[item.icon_key] : Boxes;

    return (
        <section className="overflow-hidden rounded-xl border border-border/60 bg-background/45">
            <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center">
                <button
                    type="button"
                    onClick={() => onToggleExpanded(item.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10 text-violet-400">
                        <Icon className="size-3.5" />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold">
                            {item.label}
                        </span>
                        <span className="mt-0.5 block text-[9px] text-muted-foreground">
                            {enabledCount} of {descendants.length} pages enabled
                        </span>
                    </span>

                    {expanded ? (
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => onToggleGroup(item)}
                    disabled={processing}
                    className={cn(
                        'inline-flex h-8 items-center justify-center gap-2 rounded-lg border px-2.5 text-[9px] font-semibold transition disabled:opacity-50',
                        state === 'all'
                            ? 'border-violet-500/25 bg-violet-500/10 text-violet-300'
                            : state === 'partial'
                              ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                              : 'border-border/70 hover:bg-muted',
                    )}
                >
                    <SelectionBox state={state} />
                    {state === 'all'
                        ? 'All Enabled'
                        : state === 'partial'
                          ? 'Partial'
                          : 'Enable Group'}
                </button>
            </div>

            {expanded && (
                <div className="grid gap-2 border-t border-border/60 bg-muted/[0.018] p-3 md:grid-cols-2">
                    {item.children.map((child) =>
                        child.type === 'group' ? (
                            <PermissionGroup
                                key={child.id}
                                item={child}
                                selectedIds={selectedIds}
                                expandedGroups={expandedGroups}
                                processing={processing}
                                onToggleItem={onToggleItem}
                                onToggleGroup={onToggleGroup}
                                onToggleExpanded={onToggleExpanded}
                            />
                        ) : (
                            <PermissionCard
                                key={child.id}
                                item={child}
                                selected={selectedIds.has(child.id)}
                                processing={processing}
                                onToggle={() => onToggleItem(child)}
                            />
                        ),
                    )}
                </div>
            )}
        </section>
    );
}

function PermissionCard({
    item,
    selected,
    processing,
    onToggle,
}: {
    item: PermissionItem;
    selected: boolean;
    processing: boolean;
    onToggle: () => void;
}) {
    const Icon = item.icon_key && iconMap[item.icon_key] ? iconMap[item.icon_key] : Layers3;

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={processing || item.required}
            className={cn(
                'group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition',
                selected
                    ? 'border-emerald-500/20 bg-emerald-500/[0.045]'
                    : 'border-border/60 bg-background/55 hover:border-violet-500/20 hover:bg-muted/[0.03]',
                item.required && 'cursor-default',
                processing && 'opacity-60',
            )}
        >
            <span
                className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition',
                    selected
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-border/60 bg-muted/40 text-muted-foreground group-hover:text-foreground',
                )}
            >
                <Icon className="size-3.5" />
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold">
                        {item.label}
                    </span>

                    {item.required && (
                        <Badge
                            variant="outline"
                            className="h-5 gap-1 rounded-full border-amber-500/20 bg-amber-500/10 px-2 text-[8px] font-semibold text-amber-300"
                        >
                            <LockKeyhole className="size-2.5" />
                            REQUIRED
                        </Badge>
                    )}
                </span>

                <span className="mt-1 line-clamp-2 block text-[9px] leading-4 text-muted-foreground">
                    {item.description ?? permissionDescription(item.key)}
                </span>
            </span>

            <span
                className={cn(
                    'mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition',
                    selected ? 'bg-emerald-500' : 'bg-muted-foreground/20',
                )}
            >
                <span
                    className={cn(
                        'flex size-4 items-center justify-center rounded-full bg-white shadow-sm transition',
                        selected ? 'translate-x-4' : 'translate-x-0',
                    )}
                >
                    {selected && <Check className="size-2.5 text-emerald-600" />}
                </span>
            </span>
        </button>
    );
}

function RoleRailCard({
    role,
    selected,
    disabled,
    onClick,
}: {
    role: ProductRole;
    selected: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    const isManager = role.code.toLowerCase() === 'manager';
    const percentage =
        role.available_count > 0
            ? Math.round((role.enabled_count / role.available_count) * 100)
            : 0;

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'group w-full rounded-xl border p-3 text-left transition disabled:opacity-50',
                selected
                    ? 'border-violet-500/25 bg-violet-500/[0.06] shadow-sm'
                    : 'border-border/60 bg-background/45 hover:border-violet-500/20 hover:bg-muted/[0.025]',
            )}
        >
            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border transition',
                        selected
                            ? 'border-violet-500/20 bg-violet-500/10 text-violet-400'
                            : 'border-border/60 bg-muted/35 text-muted-foreground group-hover:text-foreground',
                    )}
                >
                    {isManager ? (
                        <UserCog className="size-4" />
                    ) : (
                        <CircleUserRound className="size-4" />
                    )}
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[12px] font-semibold">
                            {role.name}
                        </p>

                        {selected && (
                            <Badge
                                variant="outline"
                                className="h-5 rounded-full border-violet-500/20 bg-violet-500/10 px-2 text-[8px] font-semibold text-violet-300"
                            >
                                ACTIVE
                            </Badge>
                        )}
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-muted-foreground">
                        {role.description ??
                            `Manage access available to ${role.name.toLowerCase()} accounts.`}
                    </p>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/50 bg-background/45 px-2.5 py-2">
                    <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                        Members
                    </p>
                    <p className="mt-1 text-xs font-semibold tabular-nums">
                        {role.members_count}
                    </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/45 px-2.5 py-2">
                    <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                        Access
                    </p>
                    <p className="mt-1 text-xs font-semibold tabular-nums">
                        {role.enabled_count}/{role.available_count}
                    </p>
                </div>
            </div>

            <div className="mt-3">
                <div className="flex items-center justify-between gap-2 text-[8px]">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-semibold tabular-nums text-violet-400">
                        {percentage}%
                    </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-violet-400"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </button>
    );
}

type AccessTone = 'blue' | 'violet' | 'emerald' | 'amber';

function AccessStat({
    label,
    value,
    detail,
    icon: Icon,
    tone,
    className,
}: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: AccessTone;
    className?: string;
}) {
    const styles: Record<
        AccessTone,
        {
            icon: string;
            value: string;
        }
    > = {
        blue: {
            icon: 'text-blue-400',
            value: 'text-blue-400',
        },
        violet: {
            icon: 'text-violet-400',
            value: 'text-violet-400',
        },
        emerald: {
            icon: 'text-emerald-400',
            value: 'text-emerald-400',
        },
        amber: {
            icon: 'text-amber-400',
            value: 'text-amber-400',
        },
    };

    const style = styles[tone];

    return (
        <div
            className={cn(
                'flex min-w-0 items-center justify-between gap-4',
                className,
            )}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <Icon
                    className={cn(
                        'size-4 shrink-0',
                        style.icon,
                    )}
                />

                <div className="min-w-0">
                    <p className="truncate text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-[9px] text-muted-foreground">
                        {detail}
                    </p>
                </div>
            </div>

            <p
                className={cn(
                    'shrink-0 text-xl font-semibold leading-none tabular-nums',
                    style.value,
                )}
            >
                {value}
            </p>
        </div>
    );
}

function ControlSignal({
    icon: Icon,
    title,
    description,
    tone,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    tone: AccessTone;
}) {
    const toneClass: Record<AccessTone, string> = {
        blue: 'border-blue-500/10 bg-blue-500/[0.05] text-blue-400',
        violet: 'border-violet-500/10 bg-violet-500/[0.05] text-violet-400',
        emerald: 'border-emerald-500/10 bg-emerald-500/[0.05] text-emerald-400',
        amber: 'border-amber-500/10 bg-amber-500/[0.05] text-amber-400',
    };

    return (
        <div className={cn('flex items-start gap-2.5 rounded-lg border px-3 py-2.5', toneClass[tone])}>
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-background/50">
                <Icon className="size-3" />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-foreground/90">
                    {title}
                </p>
                <p className="mt-0.5 text-[8px] leading-3.5 text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ToolbarButton({
    onClick,
    disabled,
    icon,
    children,
}: {
    onClick: () => void;
    disabled: boolean;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 text-[10px] font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
            {icon}
            {children}
        </button>
    );
}

function SelectionBox({ state }: { state: SelectionState }) {
    if (state === 'all') {
        return (
            <span className="flex size-4 items-center justify-center rounded bg-current text-background">
                <Check className="size-3" />
            </span>
        );
    }

    if (state === 'partial') {
        return (
            <span className="flex size-4 items-center justify-center rounded border border-current">
                <span className="h-0.5 w-2 rounded bg-current" />
            </span>
        );
    }

    return <span className="size-4 rounded border border-muted-foreground/40 bg-background" />;
}

function flattenItems(
    items: PermissionItem[],
): PermissionItem[] {
    return items.flatMap((item) => [
        item,
        ...flattenItems(item.children ?? []),
    ]);
}

function collectAssignableDescendantIds(
    item: PermissionItem,
): number[] {
    return flattenItems(item.children ?? [])
        .filter((child) => child.assignable)
        .map((child) => child.id);
}

function collectGroupIds(
    sections: PermissionSection[],
): number[] {
    return flattenItems(
        sections.flatMap(
            (section) => section.items,
        ),
    )
        .filter((item) => item.type === 'group')
        .map((item) => item.id);
}

function getItemSelectionState(
    item: PermissionItem,
    selectedIds: Set<number>,
): SelectionState {
    if (item.assignable) {
        return selectedIds.has(item.id)
            ? 'all'
            : 'none';
    }

    return getItemsSelectionState(
        item.children,
        selectedIds,
    );
}

function getItemsSelectionState(
    items: PermissionItem[],
    selectedIds: Set<number>,
): SelectionState {
    const assignableItems = flattenItems(
        items,
    ).filter((item) => item.assignable);

    if (assignableItems.length === 0) {
        return 'none';
    }

    const selectedCount =
        assignableItems.filter((item) =>
            selectedIds.has(item.id),
        ).length;

    if (selectedCount === 0) {
        return 'none';
    }

    if (
        selectedCount ===
        assignableItems.length
    ) {
        return 'all';
    }

    return 'partial';
}

function filterPermissionItem(
    item: PermissionItem,
    keyword: string,
): PermissionItem | null {
    const matches =
        item.label
            .toLowerCase()
            .includes(keyword) ||
        item.key.toLowerCase().includes(keyword) ||
        (item.description ?? '')
            .toLowerCase()
            .includes(keyword);

    const matchingChildren = item.children
        .map((child) =>
            filterPermissionItem(
                child,
                keyword,
            ),
        )
        .filter(
            (
                child,
            ): child is PermissionItem =>
                child !== null,
        );

    if (!matches && matchingChildren.length === 0) {
        return null;
    }

    return {
        ...item,
        children:
            matches && item.type === 'group'
                ? item.children
                : matchingChildren,
    };
}

function uniqueSortedIds(
    ids: number[],
): number[] {
    return Array.from(new Set(ids))
        .map(Number)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);
}

function permissionDescription(
    key: string,
): string {
    const descriptions: Record<
        string,
        string
    > = {
        dashboard:
            'View the main inventory dashboard and system summary.',

        'inventory-overview':
            'View inventory analytics, summaries, and stock indicators.',

        categories:
            'View and manage product categories.',

        products:
            'View and manage the product catalog.',

        'stock-management':
            'Manage stock levels, adjustments, and warehouse transfers.',

        branches:
            'View and manage business branches.',

        warehouses:
            'View and manage warehouse locations.',

        'stock-movements':
            'View stock-in, stock-out, adjustment, and transfer history.',

        suppliers:
            'View and manage supplier records.',

        'purchase-orders':
            'Create and manage supplier purchase orders.',

        receiving:
            'Receive approved orders and update warehouse inventory.',
    };

    return (
        descriptions[key] ??
        'Allow access to this inventory module.'
    );
}