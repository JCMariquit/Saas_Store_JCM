import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
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

    function selectRole(roleId: number): void {
        if (
            roleId === selectedRoleId ||
            form.processing
        ) {
            return;
        }

        if (
            hasChanges &&
            !window.confirm(
                'May unsaved permission changes. Lumipat ng role nang hindi sine-save?',
            )
        ) {
            return;
        }

        setSelectedRoleId(roleId);
        setSearch('');
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="relative overflow-hidden rounded-2xl border bg-card">
                    <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-primary/10 to-transparent lg:block" />

                    <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <ShieldCheck className="size-5" />
                                </span>

                                <p className="text-sm font-semibold text-primary">
                                    Team Management
                                </p>
                            </div>

                            <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                                Roles & Access
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Piliin kung anong pages at
                                inventory modules ang puwedeng
                                gamitin ng Manager at Staff.
                                Ang changes ay mag-a-apply sa
                                lahat ng accounts na may
                                napiling role.
                            </p>
                        </div>

                        <div className="grid min-w-[280px] grid-cols-2 gap-3">
                            <HeaderStat
                                label="Current Plan"
                                value={plan.name}
                            />

                            <HeaderStat
                                label="Available"
                                value={`${summary.available_modules} modules`}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Select a Role
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Configure permissions for
                                each team role.
                            </p>
                        </div>

                        <span className="hidden rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
                            {roles.length} configurable
                            roles
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {roles.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                selected={
                                    role.id ===
                                    selectedRoleId
                                }
                                disabled={
                                    form.processing
                                }
                                onClick={() =>
                                    selectRole(role.id)
                                }
                            />
                        ))}
                    </div>
                </section>

                {selectedRole && (
                    <section className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            label="Team Members"
                            value={
                                selectedRole.members_count
                            }
                            description={`Accounts assigned as ${selectedRole.name}`}
                            icon={
                                selectedRole.code ===
                                'manager' ? (
                                    <UserCog className="size-5" />
                                ) : (
                                    <CircleUserRound className="size-5" />
                                )
                            }
                        />

                        <StatCard
                            label="Enabled Access"
                            value={`${currentEnabledCount}/${allAssignableItems.length}`}
                            description={`${accessPercentage}% of available modules`}
                            icon={
                                <CheckCircle2 className="size-5" />
                            }
                        />

                        <StatCard
                            label="Required Access"
                            value={requiredItemIds.length}
                            description="Cannot be disabled"
                            icon={
                                <LockKeyhole className="size-5" />
                            }
                        />
                    </section>
                )}

                {roles.length === 0 ? (
                    <section className="rounded-2xl border bg-card px-6 py-16 text-center">
                        <ShieldCheck className="mx-auto size-12 text-muted-foreground/30" />

                        <h2 className="mt-4 font-semibold">
                            No configurable roles found
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manager and Staff roles must
                            be configured first.
                        </p>
                    </section>
                ) : (
                    <form
                        onSubmit={submitPermissions}
                        className="space-y-5"
                    >
                        <section className="rounded-2xl border bg-card p-4 md:p-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold">
                                            {selectedRole?.name}{' '}
                                            Permissions
                                        </h2>

                                        {hasChanges && (
                                            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
                                                Unsaved changes
                                            </span>
                                        )}

                                        {form.recentlySuccessful && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                                                <CheckCircle2 className="size-3.5" />

                                                Saved
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Enable or disable
                                        access to each module.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <ToolbarButton
                                        onClick={enableAll}
                                        disabled={
                                            form.processing
                                        }
                                        icon={
                                            <Check className="size-4" />
                                        }
                                    >
                                        Enable All
                                    </ToolbarButton>

                                    <ToolbarButton
                                        onClick={
                                            requiredOnly
                                        }
                                        disabled={
                                            form.processing
                                        }
                                        icon={
                                            <LockKeyhole className="size-4" />
                                        }
                                    >
                                        Required Only
                                    </ToolbarButton>

                                    <ToolbarButton
                                        onClick={
                                            resetChanges
                                        }
                                        disabled={
                                            form.processing ||
                                            !hasChanges
                                        }
                                        icon={
                                            <RotateCcw className="size-4" />
                                        }
                                    >
                                        Reset
                                    </ToolbarButton>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 border-t pt-5 md:flex-row md:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(
                                            event,
                                        ) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Search modules or pages..."
                                        className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>

                                <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm">
                                    <SlidersHorizontal className="size-4 text-muted-foreground" />

                                    <span className="text-muted-foreground">
                                        Access:
                                    </span>

                                    <span className="font-semibold">
                                        {currentEnabledCount}
                                    </span>

                                    <span className="text-muted-foreground">
                                        of
                                    </span>

                                    <span className="font-semibold">
                                        {
                                            allAssignableItems.length
                                        }
                                    </span>
                                </div>
                            </div>

                            {form.errors
                                .sidebar_item_ids && (
                                <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {
                                        form.errors
                                            .sidebar_item_ids
                                    }
                                </p>
                            )}
                        </section>

                        <div className="space-y-5">
                            {filteredSections.map(
                                (section) => (
                                    <PermissionSectionCard
                                        key={section.key}
                                        section={section}
                                        selectedIds={
                                            selectedIds
                                        }
                                        expandedGroups={
                                            expandedGroups
                                        }
                                        processing={
                                            form.processing
                                        }
                                        onToggleSection={
                                            toggleSection
                                        }
                                        onToggleItem={
                                            togglePermission
                                        }
                                        onToggleGroup={
                                            toggleGroup
                                        }
                                        onToggleExpanded={
                                            toggleExpandedGroup
                                        }
                                    />
                                ),
                            )}

                            {filteredSections.length ===
                                0 && (
                                <section className="rounded-2xl border bg-card px-6 py-14 text-center">
                                    <Search className="mx-auto size-10 text-muted-foreground/30" />

                                    <h3 className="mt-3 font-medium">
                                        No matching modules
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try another search
                                        keyword.
                                    </p>
                                </section>
                            )}
                        </div>

                        <section className="sticky bottom-4 z-30 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={[
                                            'flex size-10 items-center justify-center rounded-xl',
                                            hasChanges
                                                ? 'bg-amber-500/10 text-amber-600'
                                                : 'bg-emerald-500/10 text-emerald-600',
                                        ].join(' ')}
                                    >
                                        {hasChanges ? (
                                            <SlidersHorizontal className="size-5" />
                                        ) : (
                                            <CheckCircle2 className="size-5" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            {hasChanges
                                                ? 'You have unsaved changes'
                                                : 'Permissions are up to date'}
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {
                                                currentEnabledCount
                                            }{' '}
                                            modules enabled for{' '}
                                            {
                                                selectedRole?.name
                                            }
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !selectedRole ||
                                        !hasChanges
                                    }
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {form.processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <Save className="size-4" />
                                    )}

                                    Save Permissions
                                </button>
                            </div>
                        </section>
                    </form>
                )}
            </div>
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
    onToggleSection: (
        section: PermissionSection,
    ) => void;
    onToggleItem: (
        item: PermissionItem,
    ) => void;
    onToggleGroup: (
        item: PermissionItem,
    ) => void;
    onToggleExpanded: (
        groupId: number,
    ) => void;
}) {
    const items = flattenItems(section.items).filter(
        (item) => item.assignable,
    );

    const enabledCount = items.filter((item) =>
        selectedIds.has(item.id),
    ).length;

    const state = getItemsSelectionState(
        section.items,
        selectedIds,
    );

    return (
        <section className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex flex-col gap-4 border-b bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Layers3 className="size-4" />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                {section.label}
                            </h3>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {enabledCount} of{' '}
                                {items.length} enabled
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        onToggleSection(section)
                    }
                    disabled={processing}
                    className={[
                        'inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50',
                        state === 'all'
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : 'bg-background hover:bg-muted',
                    ].join(' ')}
                >
                    <SelectionBox state={state} />

                    {state === 'all'
                        ? 'Disable Section'
                        : 'Enable Section'}
                </button>
            </div>

            <div className="space-y-4 p-4 md:p-5">
                {section.items.map((item) =>
                    item.type === 'group' ? (
                        <PermissionGroup
                            key={item.id}
                            item={item}
                            selectedIds={selectedIds}
                            expandedGroups={
                                expandedGroups
                            }
                            processing={processing}
                            onToggleItem={
                                onToggleItem
                            }
                            onToggleGroup={
                                onToggleGroup
                            }
                            onToggleExpanded={
                                onToggleExpanded
                            }
                        />
                    ) : (
                        <PermissionCard
                            key={item.id}
                            item={item}
                            selected={selectedIds.has(
                                item.id,
                            )}
                            processing={processing}
                            onToggle={() =>
                                onToggleItem(item)
                            }
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
    onToggleItem: (
        item: PermissionItem,
    ) => void;
    onToggleGroup: (
        item: PermissionItem,
    ) => void;
    onToggleExpanded: (
        groupId: number,
    ) => void;
}) {
    const expanded =
        expandedGroups.includes(item.id);

    const state = getItemSelectionState(
        item,
        selectedIds,
    );

    const descendants =
        collectAssignableDescendantIds(item);

    const enabledCount = descendants.filter((id) =>
        selectedIds.has(id),
    ).length;

    const Icon =
        item.icon_key &&
        iconMap[item.icon_key]
            ? iconMap[item.icon_key]
            : Boxes;

    return (
        <section className="overflow-hidden rounded-2xl border bg-background">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <button
                    type="button"
                    onClick={() =>
                        onToggleExpanded(item.id)
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block font-semibold">
                            {item.label}
                        </span>

                        <span className="mt-0.5 block text-xs text-muted-foreground">
                            {enabledCount} of{' '}
                            {descendants.length} pages
                            enabled
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
                    onClick={() =>
                        onToggleGroup(item)
                    }
                    disabled={processing}
                    className={[
                        'inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50',
                        state === 'all'
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : state === 'partial'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                              : 'hover:bg-muted',
                    ].join(' ')}
                >
                    <SelectionBox state={state} />

                    {state === 'all'
                        ? 'All Enabled'
                        : state === 'partial'
                          ? 'Partial Access'
                          : 'Enable Group'}
                </button>
            </div>

            {expanded && (
                <div className="grid gap-3 border-t bg-muted/10 p-4 md:grid-cols-2">
                    {item.children.map((child) =>
                        child.type === 'group' ? (
                            <PermissionGroup
                                key={child.id}
                                item={child}
                                selectedIds={
                                    selectedIds
                                }
                                expandedGroups={
                                    expandedGroups
                                }
                                processing={
                                    processing
                                }
                                onToggleItem={
                                    onToggleItem
                                }
                                onToggleGroup={
                                    onToggleGroup
                                }
                                onToggleExpanded={
                                    onToggleExpanded
                                }
                            />
                        ) : (
                            <PermissionCard
                                key={child.id}
                                item={child}
                                selected={selectedIds.has(
                                    child.id,
                                )}
                                processing={
                                    processing
                                }
                                onToggle={() =>
                                    onToggleItem(child)
                                }
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
    const Icon =
        item.icon_key &&
        iconMap[item.icon_key]
            ? iconMap[item.icon_key]
            : Layers3;

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={
                processing || item.required
            }
            className={[
                'group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition',
                selected
                    ? 'border-primary/40 bg-primary/[0.04]'
                    : 'bg-background hover:border-primary/20 hover:bg-muted/30',
                item.required
                    ? 'cursor-default'
                    : '',
                processing
                    ? 'opacity-60'
                    : '',
            ].join(' ')}
        >
            <span
                className={[
                    'flex size-10 shrink-0 items-center justify-center rounded-xl transition',
                    selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:text-foreground',
                ].join(' ')}
            >
                <Icon className="size-4" />
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                        {item.label}
                    </span>

                    {item.required && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                            <LockKeyhole className="size-3" />

                            Required
                        </span>
                    )}
                </span>

                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {item.description ??
                        permissionDescription(
                            item.key,
                        )}
                </span>
            </span>

            <span
                className={[
                    'mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition',
                    selected
                        ? 'bg-primary'
                        : 'bg-muted-foreground/20',
                ].join(' ')}
            >
                <span
                    className={[
                        'flex size-5 items-center justify-center rounded-full bg-white shadow-sm transition',
                        selected
                            ? 'translate-x-5'
                            : 'translate-x-0',
                    ].join(' ')}
                >
                    {selected && (
                        <Check className="size-3 text-primary" />
                    )}
                </span>
            </span>
        </button>
    );
}

function RoleCard({
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
    const isManager =
        role.code.toLowerCase() === 'manager';

    const percentage =
        role.available_count > 0
            ? Math.round(
                  (role.enabled_count /
                      role.available_count) *
                      100,
              )
            : 0;

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={[
                'relative overflow-hidden rounded-2xl border p-5 text-left transition disabled:opacity-50',
                selected
                    ? 'border-primary bg-primary/[0.04] shadow-sm ring-1 ring-primary/20'
                    : 'bg-card hover:border-primary/30 hover:shadow-sm',
            ].join(' ')}
        >
            {selected && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                    <Check className="size-3" />

                    Selected
                </span>
            )}

            <div className="flex items-start gap-4">
                <span
                    className={[
                        'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                        selected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                >
                    {isManager ? (
                        <UserCog className="size-6" />
                    ) : (
                        <CircleUserRound className="size-6" />
                    )}
                </span>

                <div className="min-w-0 flex-1 pr-16">
                    <h3 className="text-base font-semibold">
                        {role.name}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {role.description ??
                            `Manage the access available to ${role.name.toLowerCase()} accounts.`}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/50 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">
                        Members
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                        {role.members_count}
                    </p>
                </div>

                <div className="rounded-xl bg-muted/50 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">
                        Access
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                        {role.enabled_count}/
                        {role.available_count}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        Permission coverage
                    </span>

                    <span className="font-semibold">
                        {percentage}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                            width: `${percentage}%`,
                        }}
                    />
                </div>
            </div>
        </button>
    );
}

function StatCard({
    label,
    value,
    description,
    icon,
}: {
    label: string;
    value: ReactNode;
    description: string;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </span>

                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                        {label}
                    </p>

                    <p className="mt-0.5 text-xl font-semibold">
                        {value}
                    </p>
                </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function HeaderStat({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border bg-background/80 p-3 backdrop-blur">
            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-semibold">
                {value}
            </p>
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
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-background px-3 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
            {icon}

            {children}
        </button>
    );
}

function SelectionBox({
    state,
}: {
    state: SelectionState;
}) {
    if (state === 'all') {
        return (
            <span className="flex size-4 items-center justify-center rounded bg-primary text-primary-foreground">
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

    return (
        <span className="size-4 rounded border border-muted-foreground/40 bg-background" />
    );
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