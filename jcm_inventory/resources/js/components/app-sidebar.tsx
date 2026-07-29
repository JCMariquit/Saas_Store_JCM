import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Beaker,
    Boxes,
    Building2,
    ChevronDown,
    Circle,
    ClipboardCheck,
    Clock3,
    Code2,
    FlaskConical,
    Crown,
    FileText,
    History,
    Image as ImageIcon,
    LayoutDashboard,
    LockKeyhole,
    MapPin,
    Package2,
    PackageCheck,
    PackageMinus,
    Settings,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Tags,
    Truck,
    UserCog,
    Users,
    Warehouse,
} from 'lucide-react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { SharedData } from '@/types';

import AppLogo from './app-logo';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

/*
|--------------------------------------------------------------------------
| Dynamic sidebar types
|--------------------------------------------------------------------------
*/

type IconComponent = React.ElementType;

type DynamicBadge = {
    code: string;
    name: string;
    iconKey: string | null;
    styleKey: string | null;
};

type RequiredPlan = {
    id: number;
    code: string;
    name: string;
    monthlyPrice: number;
    currency: string;
};

type SidebarLockReason =
    | 'plan'
    | 'subscription'
    | null;

type DynamicSidebarItem = {
    id: number;
    key: string;
    sectionKey: string;
    type: 'link' | 'group' | 'heading';
    title: string;
    url: string;
    iconKey: string | null;
    featureCode: string | null;
    disabled: boolean;
    planLocked: boolean;
    subscriptionLocked: boolean;
    lockReason: SidebarLockReason;
    requiredPlan: RequiredPlan | null;
    sortOrder: number;
    badge: DynamicBadge | null;
    children: DynamicSidebarItem[];
};

type DynamicSidebarSection = {
    key: string;
    label: string;
    sortOrder: number;
    items: DynamicSidebarItem[];
};

type SidebarPayload = {
    product: {
        id: number;
        code: string;
        name: string;
        slug: string;
        status: string;
    } | null;

    access: {
        roleCode: string;
        roleName: string;
        accountOwnerId: number;
    } | null;

    subscription: {
        id: number;
        planId: number;
        planCode: string;
        planName: string;
        monthlyPrice: number;
        currency: string;
        status: string;
        accessMode: 'full' | 'read_only' | 'blocked';
        isReadOnly: boolean;
        endDate: string | null;
    } | null;

    sections: DynamicSidebarSection[];
};

type SidebarPageProps =
    SharedData & {
        sidebar?: SidebarPayload;
    };

type NavigationToneStyle = {
    itemActive: string;
    iconActive: string;
    childActive: string;
    iconText: string;
    indicator: string;
    guideBorder: string;
};

/*
|--------------------------------------------------------------------------
| Icon registry
|--------------------------------------------------------------------------
*/

const iconMap: Record<string, IconComponent> = {
    BarChart3,
    Beaker,
    Boxes,
    Building2,
    ChevronDown,
    Circle,
    ClipboardCheck,
    Clock3,
    Code2,
    FlaskConical,
    Crown,
    FileText,
    History,
    Image: ImageIcon,
    LayoutDashboard,
    LockKeyhole,
    MapPin,
    Package2,
    PackageCheck,
    PackageMinus,
    Settings,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Tags,
    Truck,
    UserCog,
    Users,
    Warehouse,
};

function resolveIcon(iconKey: string | null): IconComponent {
    if (!iconKey) {
        return Circle;
    }

    return iconMap[iconKey] ?? Circle;
}

/*
|--------------------------------------------------------------------------
| Theme-driven navigation tone
|--------------------------------------------------------------------------
|
| All module navigation states now use the active theme's semantic primary
| color. The selected preset controls --primary, so the sidebar automatically
| follows JCM Dark, Ocean, Violet, Amber, or Slate without page-specific tones.
|
*/

const themeNavigationStyle: NavigationToneStyle = {
    itemActive:
        'border-primary/25 bg-primary/10 text-primary shadow-sm',
    iconActive:
        'border-primary/25 bg-primary/15 text-primary',
    childActive:
        'border-primary/20 bg-primary/10 text-primary',
    iconText: 'text-primary',
    indicator: 'bg-primary',
    guideBorder: 'border-primary/25',
};

/*
|--------------------------------------------------------------------------
| Active URL helpers
|--------------------------------------------------------------------------
*/

function normalizeUrl(url: string): string {
    const cleanUrl = url
        .split('?')[0]
        .replace(/\/+$/, '');

    return cleanUrl || '/';
}

function isUrlActive(
    currentUrl: string,
    itemUrl: string,
): boolean {
    if (!itemUrl || itemUrl === '#') {
        return false;
    }

    const cleanCurrentUrl = normalizeUrl(currentUrl);
    const cleanItemUrl = normalizeUrl(itemUrl);

    return (
        cleanCurrentUrl === cleanItemUrl ||
        cleanCurrentUrl.startsWith(
            `${cleanItemUrl}/`,
        )
    );
}

function resolveActiveChildId(
    currentUrl: string,
    items: DynamicSidebarItem[],
): number | null {
    const matchingItem = items
        .filter(
            (item) =>
                !item.disabled &&
                !item.planLocked &&
                !item.subscriptionLocked &&
                isUrlActive(
                    currentUrl,
                    item.url,
                ),
        )
        .sort(
            (
                firstItem,
                secondItem,
            ) =>
                normalizeUrl(
                    secondItem.url,
                ).length -
                normalizeUrl(
                    firstItem.url,
                ).length,
        )[0];

    return matchingItem?.id ?? null;
}

function resolveActiveGroupId(
    currentUrl: string,
    sections: DynamicSidebarSection[],
): number | null {
    for (const section of sections) {
        for (const item of section.items) {
            if (item.type !== 'group') {
                continue;
            }

            const activeChildId =
                resolveActiveChildId(
                    currentUrl,
                    item.children,
                );

            if (activeChildId !== null) {
                return item.id;
            }
        }
    }

    return null;
}

function visibleItemForCurrentPlan(
    item: DynamicSidebarItem,
): DynamicSidebarItem | null {
    /*
     * Premium-only items are intentionally hidden from Basic navigation.
     * Subscription-locked items remain visible because they belong to the
     * user's current plan and only require renewal.
     */
    if (item.planLocked) {
        return null;
    }

    if (item.type !== 'group') {
        return item;
    }

    const children = item.children
        .map(visibleItemForCurrentPlan)
        .filter(
            (
                child,
            ): child is DynamicSidebarItem =>
                child !== null,
        );

    if (children.length === 0) {
        return null;
    }

    return {
        ...item,
        planLocked: false,
        lockReason:
            item.subscriptionLocked
                ? 'subscription'
                : null,
        requiredPlan: null,
        children,
    };
}

function visibleSectionsForCurrentPlan(
    sections: DynamicSidebarSection[],
): DynamicSidebarSection[] {
    return sections
        .map((section) => ({
            ...section,
            items: section.items
                .map(
                    visibleItemForCurrentPlan,
                )
                .filter(
                    (
                        item,
                    ): item is DynamicSidebarItem =>
                        item !== null,
                ),
        }))
        .filter(
            (section) =>
                section.items.length > 0,
        );
}

function findUpgradePlan(
    sections: DynamicSidebarSection[],
): RequiredPlan | null {
    for (const section of sections) {
        for (const item of section.items) {
            if (
                item.planLocked &&
                item.requiredPlan
            ) {
                return item.requiredPlan;
            }

            for (const child of item.children) {
                if (
                    child.planLocked &&
                    child.requiredPlan
                ) {
                    return child.requiredPlan;
                }
            }
        }
    }

    return null;
}

/*
|--------------------------------------------------------------------------
| Badge
|--------------------------------------------------------------------------
*/

function MenuBadge({
    badge,
}: {
    badge: DynamicBadge | null;
}) {
    if (!badge) {
        return null;
    }

    const fallbackStyle =
        'border-slate-500/15 bg-slate-500/[0.07] text-slate-400';

    const styles: Record<string, string> = {
        live:
            'border-emerald-500/15 bg-emerald-500/[0.075] text-emerald-400',

        core:
            'border-blue-500/15 bg-blue-500/[0.075] text-blue-400',

        development:
            'border-sky-500/15 bg-sky-500/[0.075] text-sky-400',

        tuning:
            'border-orange-500/15 bg-orange-500/[0.075] text-orange-400',

        testing:
            'border-amber-500/15 bg-amber-500/[0.075] text-amber-400',

        new:
            'border-emerald-500/15 bg-emerald-500/[0.075] text-emerald-400',

        beta:
            'border-violet-500/15 bg-violet-500/[0.075] text-violet-400',

        soon: fallbackStyle,
        default: fallbackStyle,
    };

    const BadgeIcon = resolveIcon(
        badge.iconKey,
    );

    const style = badge.styleKey
        ? (
            styles[badge.styleKey] ??
            fallbackStyle
        )
        : fallbackStyle;

    return (
        <span
            title={badge.name}
            className={[
                'ml-auto inline-flex h-5 shrink-0 items-center gap-1',
                'rounded-full border px-1.5',
                'text-[8px] font-semibold uppercase tracking-[0.08em]',
                'transition-colors duration-200',
                style,
            ].join(' ')}
        >
            <BadgeIcon className="size-2.5" />

            {badge.code}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Subscription / plan lock helpers
|--------------------------------------------------------------------------
*/

function isItemLocked(
    item: DynamicSidebarItem,
): boolean {
    return (
        item.planLocked ||
        item.subscriptionLocked
    );
}

function formatPlanPrice(
    plan: RequiredPlan | null,
): string | null {
    if (
        !plan ||
        !Number.isFinite(plan.monthlyPrice)
    ) {
        return null;
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: plan.currency || 'PHP',
        maximumFractionDigits: 0,
    }).format(plan.monthlyPrice);
}

function PlanLockBadge({
    item,
}: {
    item: DynamicSidebarItem;
}) {
    if (!item.lockReason) {
        return null;
    }

    const isPlanLock =
        item.lockReason === 'plan';

    return (
        <span
            title={
                isPlanLock
                    ? `${
                          item.requiredPlan?.name ??
                          'Premium plan'
                      } required`
                    : 'Subscription renewal required'
            }
            className={[
                'ml-auto inline-flex h-5 shrink-0 items-center gap-1',
                'rounded-full border px-1.5',
                'text-[8px] font-semibold uppercase tracking-[0.08em]',
                isPlanLock
                    ? 'border-violet-500/20 bg-violet-500/[0.08] text-violet-300'
                    : 'border-amber-500/20 bg-amber-500/[0.08] text-amber-300',
            ].join(' ')}
        >
            {isPlanLock ? (
                <Crown className="size-2.5" />
            ) : (
                <LockKeyhole className="size-2.5" />
            )}

            {isPlanLock ? 'PRO' : 'RENEW'}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Direct item content
|--------------------------------------------------------------------------
*/

function DirectItemContent({
    item,
    active,
    collapsed,
}: {
    item: DynamicSidebarItem;
    active: boolean;
    collapsed: boolean;
}) {
    const Icon = resolveIcon(
        item.iconKey,
    );

    const locked =
        isItemLocked(item);

    const toneStyle =
        themeNavigationStyle;

    return (
        <>
            {active && (
                <span
                    aria-hidden="true"
                    className={[
                        'absolute inset-y-2 left-0 w-0.5 rounded-r-full',
                        toneStyle.indicator,
                    ].join(' ')}
                />
            )}

            <span
                className={[
                    'relative flex size-7 shrink-0 items-center justify-center',
                    'rounded-lg border',
                    'transition-all duration-200',
                    active
                        ? toneStyle.iconActive
                        : locked
                          ? 'border-amber-500/15 bg-amber-500/[0.05] text-sidebar-foreground/45 group-hover:border-amber-500/25 group-hover:text-amber-300'
                          : 'border-transparent bg-transparent text-sidebar-foreground/40 group-hover:border-primary/20 group-hover:bg-primary/[0.06] group-hover:text-primary',
                ].join(' ')}
            >
                <Icon className="size-[15px]" />

                {locked && (
                    <span
                        aria-hidden="true"
                        className={[
                            'absolute -right-1 -top-1 inline-flex size-3.5 items-center justify-center rounded-full',
                            'border border-sidebar bg-sidebar',
                            item.planLocked
                                ? 'text-violet-300'
                                : 'text-amber-300',
                        ].join(' ')}
                    >
                        <LockKeyhole className="size-2.5" />
                    </span>
                )}

                {active && collapsed && (
                    <span
                        aria-hidden="true"
                        className={[
                            'absolute -right-0.5 -top-0.5 size-1.5 rounded-full',
                            'ring-2 ring-sidebar',
                            toneStyle.indicator,
                        ].join(' ')}
                    />
                )}
            </span>

            {!collapsed && (
                <>
                    <span
                        className={[
                            'min-w-0 flex-1 truncate text-left',
                            active
                                ? 'font-semibold'
                                : 'font-medium',
                        ].join(' ')}
                    >
                        {item.title}
                    </span>

                    {locked ? (
                        <PlanLockBadge
                            item={item}
                        />
                    ) : (
                        <MenuBadge
                            badge={item.badge}
                        />
                    )}
                </>
            )}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Direct menu item
|--------------------------------------------------------------------------
*/

function DirectItem({
    item,
    onLockedItem,
}: {
    item: DynamicSidebarItem;
    onLockedItem: (
        item: DynamicSidebarItem,
    ) => void;
}) {
    const { url } = usePage();
    const { state } = useSidebar();

    const collapsed =
        state === 'collapsed';

    const locked =
        isItemLocked(item);

    const active =
        !item.disabled &&
        !locked &&
        isUrlActive(
            url,
            item.url,
        );

    const toneStyle =
        themeNavigationStyle;

    const baseClass = [
        'group relative h-10 overflow-hidden rounded-xl border border-transparent',
        'text-[13px]',
        'transition-all duration-200',
        collapsed
            ? 'size-10 justify-center px-0'
            : 'w-full px-2.5',
    ].join(' ');

    if (locked) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    type="button"
                    tooltip={
                        item.planLocked
                            ? `${
                                  item.requiredPlan
                                      ?.name ??
                                  'Premium plan'
                              } required`
                            : 'Subscription renewal required'
                    }
                    onClick={() =>
                        onLockedItem(item)
                    }
                    className={[
                        baseClass,
                        item.planLocked
                            ? 'text-sidebar-foreground/50 hover:border-violet-500/20 hover:bg-violet-500/[0.055] hover:text-violet-200'
                            : 'text-sidebar-foreground/50 hover:border-amber-500/20 hover:bg-amber-500/[0.055] hover:text-amber-200',
                    ].join(' ')}
                >
                    <div
                        className={[
                            'flex h-full w-full items-center',
                            collapsed
                                ? 'justify-center'
                                : 'gap-2.5',
                        ].join(' ')}
                    >
                        <DirectItemContent
                            item={item}
                            active={false}
                            collapsed={
                                collapsed
                            }
                        />
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    if (
        item.disabled ||
        item.url === '#'
    ) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    type="button"
                    tooltip={
                        `${item.title} — not yet available`
                    }
                    aria-disabled="true"
                    className={[
                        baseClass,
                        'cursor-not-allowed',
                        'text-sidebar-foreground/35',
                        'hover:border-border/30',
                        'hover:bg-sidebar-accent/30',
                        'hover:text-sidebar-foreground/45',
                    ].join(' ')}
                >
                    <div
                        className={[
                            'flex h-full w-full items-center',
                            collapsed
                                ? 'justify-center'
                                : 'gap-2.5',
                        ].join(' ')}
                    >
                        <DirectItemContent
                            item={item}
                            active={false}
                            collapsed={
                                collapsed
                            }
                        />
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={[
                    baseClass,
                    active
                        ? toneStyle.itemActive
                        : 'text-sidebar-foreground/58 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground',
                ].join(' ')}
            >
                <Link
                    href={item.url}
                    prefetch
                    className={[
                        'flex h-full w-full items-center',
                        collapsed
                            ? 'justify-center'
                            : 'gap-2.5',
                    ].join(' ')}
                >
                    <DirectItemContent
                        item={item}
                        active={active}
                        collapsed={
                            collapsed
                        }
                    />
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

/*
|--------------------------------------------------------------------------
| Dropdown child item
|--------------------------------------------------------------------------
*/

function DropdownItem({
    item,
    activeItemId,
    onLockedItem,
}: {
    item: DynamicSidebarItem;
    activeItemId: number | null;
    onLockedItem: (
        item: DynamicSidebarItem,
    ) => void;
}) {
    const Icon = resolveIcon(
        item.iconKey,
    );

    const locked =
        isItemLocked(item);

    const active =
        !item.disabled &&
        !locked &&
        item.id === activeItemId;

    const toneStyle =
        themeNavigationStyle;

    const itemClass = [
        'group relative flex h-9 w-full items-center gap-2',
        'overflow-hidden rounded-lg border border-transparent px-2.5',
        'text-left text-[12px] font-medium',
        'transition-all duration-200',
    ].join(' ');

    const content = (
        <>
            {active && (
                <span
                    aria-hidden="true"
                    className={[
                        'absolute inset-y-2 left-0 w-0.5 rounded-r-full',
                        toneStyle.indicator,
                    ].join(' ')}
                />
            )}

            <span
                className={[
                    'relative inline-flex size-6 shrink-0 items-center justify-center rounded-md',
                    'transition-colors duration-200',
                    active
                        ? toneStyle.iconActive
                        : locked
                          ? 'text-sidebar-foreground/40 group-hover:bg-background/50 group-hover:text-amber-300'
                          : 'text-sidebar-foreground/35 group-hover:bg-background/50 group-hover:text-sidebar-foreground/65',
                ].join(' ')}
            >
                <Icon className="size-[13px]" />

                {locked && (
                    <LockKeyhole
                        className={[
                            'absolute -right-1 -top-1 size-2.5',
                            item.planLocked
                                ? 'text-violet-300'
                                : 'text-amber-300',
                        ].join(' ')}
                    />
                )}
            </span>

            <span className="min-w-0 flex-1 truncate">
                {item.title}
            </span>

            {locked ? (
                <PlanLockBadge
                    item={item}
                />
            ) : (
                <MenuBadge
                    badge={item.badge}
                />
            )}
        </>
    );

    if (locked) {
        return (
            <button
                type="button"
                onClick={() =>
                    onLockedItem(item)
                }
                title={
                    item.planLocked
                        ? `${
                              item.requiredPlan
                                  ?.name ??
                              'Premium plan'
                          } required`
                        : 'Subscription renewal required'
                }
                className={[
                    itemClass,
                    item.planLocked
                        ? 'text-sidebar-foreground/48 hover:border-violet-500/15 hover:bg-violet-500/[0.05] hover:text-violet-200'
                        : 'text-sidebar-foreground/48 hover:border-amber-500/15 hover:bg-amber-500/[0.05] hover:text-amber-200',
                ].join(' ')}
            >
                {content}
            </button>
        );
    }

    if (
        item.disabled ||
        item.url === '#'
    ) {
        return (
            <button
                type="button"
                aria-disabled="true"
                title={
                    `${item.title} — not yet available`
                }
                className={[
                    itemClass,
                    'cursor-not-allowed',
                    'text-sidebar-foreground/35',
                    'hover:bg-sidebar-accent/25',
                    'hover:text-sidebar-foreground/45',
                ].join(' ')}
            >
                {content}
            </button>
        );
    }

    return (
        <Link
            href={item.url}
            prefetch
            className={[
                itemClass,
                active
                    ? toneStyle.childActive
                    : 'text-sidebar-foreground/52 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground',
            ].join(' ')}
        >
            {content}
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| Dropdown group
|--------------------------------------------------------------------------
*/

function SidebarDropdown({
    group,
    open,
    onOpenChange,
    onLockedItem,
}: {
    group: DynamicSidebarItem;
    open: boolean;
    onOpenChange: (
        groupId: number | null,
    ) => void;
    onLockedItem: (
        item: DynamicSidebarItem,
    ) => void;
}) {
    const { url } = usePage();

    const {
        state,
        toggleSidebar,
    } = useSidebar();

    const collapsed =
        state === 'collapsed';

    const GroupIcon = resolveIcon(
        group.iconKey,
    );

    const activeItemId =
        resolveActiveChildId(
            url,
            group.children,
        );

    const hasActiveItem =
        activeItemId !== null;

    const groupLocked =
        isItemLocked(group);

    const toneStyle =
        themeNavigationStyle;

    const toggleGroup = () => {
        onOpenChange(
            open
                ? null
                : group.id,
        );
    };

    if (collapsed) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    type="button"
                    tooltip={
                        groupLocked
                            ? `${group.title} — locked modules`
                            : group.title
                    }
                    onClick={() => {
                        onOpenChange(
                            group.id,
                        );

                        toggleSidebar();
                    }}
                    className={[
                        'group relative size-10 justify-center overflow-hidden',
                        'rounded-xl border px-0',
                        'transition-all duration-200',
                        hasActiveItem
                            ? toneStyle.itemActive
                            : groupLocked
                              ? 'border-amber-500/15 text-sidebar-foreground/45 hover:bg-amber-500/[0.05] hover:text-amber-200'
                              : 'border-transparent text-sidebar-foreground/42 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground',
                    ].join(' ')}
                >
                    {hasActiveItem && (
                        <span
                            aria-hidden="true"
                            className={[
                                'absolute inset-y-2 left-0 w-0.5 rounded-r-full',
                                toneStyle.indicator,
                            ].join(' ')}
                        />
                    )}

                    <span
                        className={[
                            'relative flex size-7 shrink-0 items-center justify-center',
                            'rounded-lg border transition-all duration-200',
                            hasActiveItem
                                ? toneStyle.iconActive
                                : 'border-transparent group-hover:border-primary/20 group-hover:bg-primary/[0.06] group-hover:text-primary',
                        ].join(' ')}
                    >
                        <GroupIcon className="size-[15px]" />

                        {groupLocked && (
                            <LockKeyhole className="absolute -right-1 -top-1 size-2.5 text-amber-300" />
                        )}

                        {hasActiveItem && (
                            <span
                                aria-hidden="true"
                                className={[
                                    'absolute -right-0.5 -top-0.5 size-1.5 rounded-full',
                                    'ring-2 ring-sidebar',
                                    toneStyle.indicator,
                                ].join(' ')}
                            />
                        )}
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={toggleGroup}
                aria-expanded={open}
                className={[
                    'group relative flex h-10 w-full items-center gap-2.5',
                    'overflow-hidden rounded-xl border px-2.5',
                    'text-[13px] transition-all duration-200',
                    hasActiveItem
                        ? toneStyle.itemActive
                        : groupLocked
                          ? 'border-amber-500/10 text-sidebar-foreground/55 hover:border-amber-500/20 hover:bg-amber-500/[0.04] hover:text-amber-100'
                          : 'border-transparent text-sidebar-foreground/58 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground',
                ].join(' ')}
            >
                {hasActiveItem && (
                    <span
                        aria-hidden="true"
                        className={[
                            'absolute inset-y-2 left-0 w-0.5 rounded-r-full',
                            toneStyle.indicator,
                        ].join(' ')}
                    />
                )}

                <span
                    className={[
                        'relative flex size-7 shrink-0 items-center justify-center',
                        'rounded-lg border transition-all duration-200',
                        hasActiveItem
                            ? toneStyle.iconActive
                            : 'border-transparent text-sidebar-foreground/40 group-hover:border-primary/20 group-hover:bg-primary/[0.06] group-hover:text-primary',
                    ].join(' ')}
                >
                    <GroupIcon className="size-[15px]" />

                    {groupLocked && (
                        <LockKeyhole className="absolute -right-1 -top-1 size-2.5 text-amber-300" />
                    )}
                </span>

                <span
                    className={[
                        'min-w-0 flex-1 truncate text-left',
                        hasActiveItem
                            ? 'font-semibold'
                            : 'font-medium',
                    ].join(' ')}
                >
                    {group.title}
                </span>

                {groupLocked ? (
                    <PlanLockBadge
                        item={group}
                    />
                ) : (
                    <MenuBadge
                        badge={group.badge}
                    />
                )}

                <span className="hidden text-[8px] tabular-nums text-sidebar-foreground/30 2xl:inline">
                    {group.children.length}
                </span>

                <ChevronDown
                    className={[
                        'size-3.5 shrink-0',
                        'text-sidebar-foreground/35',
                        'transition-transform duration-200',
                        open
                            ? 'rotate-180'
                            : '',
                    ].join(' ')}
                />
            </button>

            {open && (
                <div
                    className={[
                        'ml-[18px] space-y-0.5 border-l pl-3',
                        hasActiveItem
                            ? toneStyle.guideBorder
                            : groupLocked
                              ? 'border-amber-500/20'
                              : 'border-border/45',
                    ].join(' ')}
                >
                    {group.children.map(
                        (item) => (
                            <DropdownItem
                                key={item.id}
                                item={item}
                                activeItemId={
                                    activeItemId
                                }
                                onLockedItem={
                                    onLockedItem
                                }
                            />
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Section items
|--------------------------------------------------------------------------
*/

function SectionItems({
    items,
    collapsed,
    openGroupId,
    onOpenGroupChange,
    onLockedItem,
}: {
    items: DynamicSidebarItem[];
    collapsed: boolean;
    openGroupId: number | null;
    onOpenGroupChange: (
        groupId: number | null,
    ) => void;
    onLockedItem: (
        item: DynamicSidebarItem,
    ) => void;
}) {
    if (collapsed) {
        return (
            <SidebarMenu className="items-center space-y-1 px-0">
                {items.map(
                    (item) =>
                        item.type ===
                        'group' ? (
                            <SidebarDropdown
                                key={item.id}
                                group={item}
                                open={
                                    openGroupId ===
                                    item.id
                                }
                                onOpenChange={
                                    onOpenGroupChange
                                }
                                onLockedItem={
                                    onLockedItem
                                }
                            />
                        ) : (
                            <DirectItem
                                key={item.id}
                                item={item}
                                onLockedItem={
                                    onLockedItem
                                }
                            />
                        ),
                )}
            </SidebarMenu>
        );
    }

    return (
        <div className="space-y-1 px-3">
            {items.map(
                (item) =>
                    item.type ===
                    'group' ? (
                        <SidebarDropdown
                            key={item.id}
                            group={item}
                            open={
                                openGroupId ===
                                item.id
                            }
                            onOpenChange={
                                onOpenGroupChange
                            }
                            onLockedItem={
                                onLockedItem
                            }
                        />
                    ) : (
                        <SidebarMenu
                            key={item.id}
                            className="space-y-0.5"
                        >
                            <DirectItem
                                item={item}
                                onLockedItem={
                                    onLockedItem
                                }
                            />
                        </SidebarMenu>
                    ),
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Premium upgrade entry
|--------------------------------------------------------------------------
*/

function PremiumUpgradeEntry({
    plan,
    collapsed,
    onClick,
}: {
    plan: RequiredPlan;
    collapsed: boolean;
    onClick: () => void;
}) {
    if (collapsed) {
        return (
            <SidebarMenu className="items-center px-0">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        type="button"
                        tooltip={`Upgrade to ${plan.name}`}
                        onClick={onClick}
                        className={[
                            'group relative size-10 justify-center rounded-xl border px-0',
                            'border-violet-500/20 bg-violet-500/[0.055]',
                            'text-violet-300 transition-all duration-200',
                            'hover:border-violet-500/35 hover:bg-violet-500/[0.1]',
                        ].join(' ')}
                    >
                        <Crown className="size-[15px]" />

                        <span
                            aria-hidden="true"
                            className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-violet-400 ring-2 ring-sidebar"
                        />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'group mx-3 w-[calc(100%-1.5rem)] overflow-hidden rounded-xl border p-3 text-left',
                'border-violet-500/20 bg-violet-500/[0.045]',
                'transition-all duration-200',
                'hover:border-violet-500/35 hover:bg-violet-500/[0.075]',
            ].join(' ')}
        >
            <div className="flex items-start gap-2.5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/[0.09] text-violet-300">
                    <Crown className="size-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-[11px] font-semibold text-sidebar-foreground/85">
                            Upgrade to {plan.name}
                        </p>

                        <span className="ml-auto shrink-0 rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-violet-300">
                            PRO
                        </span>
                    </div>

                    <p className="mt-1 text-[9px] leading-4 text-sidebar-foreground/42">
                        Unlock locations, stock movement controls,
                        received-order history, and team access.
                    </p>
                </div>
            </div>
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| App sidebar
|--------------------------------------------------------------------------
*/

export function AppSidebar() {
    const { state } = useSidebar();

    const collapsed =
        state === 'collapsed';

    const page =
        usePage<SidebarPageProps>();

    const {
        sidebar,
        businessProfile,
    } = page.props;

    const allSections = React.useMemo(
        () => sidebar?.sections ?? [],
        [sidebar?.sections],
    );

    const sections = React.useMemo(
        () =>
            visibleSectionsForCurrentPlan(
                allSections,
            ),
        [allSections],
    );

    const upgradePlan = React.useMemo(
        () =>
            findUpgradePlan(
                allSections,
            ),
        [allSections],
    );

    const activeGroupId =
        React.useMemo(
            () =>
                resolveActiveGroupId(
                    page.url,
                    sections,
                ),
            [
                page.url,
                sections,
            ],
        );

    const [
        openGroupId,
        setOpenGroupId,
    ] = React.useState<
        number | null
    >(activeGroupId);

    const [
        lockedItem,
        setLockedItem,
    ] = React.useState<
        DynamicSidebarItem | null
    >(null);

    const [
        upgradeDialogOpen,
        setUpgradeDialogOpen,
    ] = React.useState(false);

    React.useEffect(() => {
        setOpenGroupId(
            activeGroupId,
        );
    }, [activeGroupId]);

    const handleOpenGroupChange =
        React.useCallback(
            (
                groupId:
                    | number
                    | null,
            ) => {
                setOpenGroupId(
                    groupId,
                );
            },
            [],
        );

    const upgradePlanPrice =
        formatPlanPrice(
            upgradePlan,
        );

    const upgradeDescription =
        upgradePlan
            ? `Upgrade to ${upgradePlan.name}${
                  upgradePlanPrice
                      ? ` starting at ${upgradePlanPrice} per month`
                      : ''
              } to unlock multiple branches and warehouses, stock movements and transfers, received-order history, and team management.`
            : '';

    const lockedPlanPrice =
        formatPlanPrice(
            lockedItem?.requiredPlan
                ?? null,
        );

    const lockedModalTitle =
        lockedItem?.lockReason === 'plan'
            ? `${
                  lockedItem.requiredPlan
                      ?.name ??
                  'Premium Inventory'
              } feature`
            : 'Subscription renewal required';

    const lockedModalDescription =
        lockedItem?.lockReason === 'plan'
            ? `${
                  lockedItem.title
              } is not included in ${
                  sidebar?.subscription
                      ?.planName ??
                  'your current plan'
              }. Upgrade to ${
                  lockedItem.requiredPlan
                      ?.name ??
                  'Premium Inventory'
              }${
                  lockedPlanPrice
                      ? ` starting at ${lockedPlanPrice} per month`
                      : ''
              } to unlock this module.`
            : `${
                  lockedItem?.title ??
                  'This module'
              } is unavailable while the subscription is read-only. Renew the owner subscription to restore access.`;

    const productName =
        sidebar?.product?.name ??
        'JCM Inventory';

    const businessName =
        businessProfile.businessName.trim()
        || productName;

    return (
        <>
            <style>{`
                .inventory-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--scrollbar-thumb) transparent;
                }

                .inventory-scrollbar::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }

                .inventory-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .inventory-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--scrollbar-thumb);
                    border: 2px solid transparent;
                    border-radius: 999px;
                    background-clip: padding-box;
                }

                .inventory-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--scrollbar-thumb-hover);
                    background-clip: padding-box;
                }
            `}</style>

            <Sidebar
                collapsible="icon"
                variant="sidebar"
                className={[
                    'h-screen overflow-hidden',
                    'border-r border-border/45',
                    'bg-sidebar/95',
                    'backdrop-blur-xl',
                ].join(' ')}
            >
                <SidebarHeader
                    className={[
                        'border-b border-border/35',
                        'pb-4 pt-4',
                        'transition-all duration-200',
                        collapsed
                            ? 'px-2'
                            : 'px-3',
                    ].join(' ')}
                >
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                tooltip={
                                    businessName
                                }
                                className={[
                                    'h-auto overflow-hidden rounded-2xl border',
                                    'app-theme-brand-card',
                                    'transition-all duration-200',
                                    collapsed
                                        ? 'size-11 justify-center p-0'
                                        : 'w-full p-2.5',
                                ].join(' ')}
                            >
                                <Link
                                    href="/dashboard"
                                    prefetch
                                    className={[
                                        'flex min-w-0 items-center',
                                        collapsed
                                            ? 'justify-center'
                                            : 'gap-3',
                                    ].join(' ')}
                                >
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent
                    className={[
                        'inventory-scrollbar overflow-x-hidden overflow-y-auto',
                        'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.008),transparent_22%)]',
                        'transition-all duration-200',
                        collapsed
                            ? 'gap-2 px-2 py-3'
                            : 'gap-5 px-0 py-4',
                    ].join(' ')}
                >
                    {sections.map(
                        (section) => (
                            <div
                                key={
                                    section.key
                                }
                                className={
                                    collapsed
                                        ? 'space-y-1'
                                        : 'space-y-2 pb-1'
                                }
                            >
                                {!collapsed && (
                                    <div className="flex items-center gap-2 px-5">
                                        <span className="size-1 rounded-full bg-primary/50" />

                                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                                            {
                                                section.label
                                            }
                                        </p>

                                        <span className="h-px min-w-0 flex-1 bg-primary/15" />
                                    </div>
                                )}

                                <SectionItems
                                    items={
                                        section.items
                                    }
                                    collapsed={
                                        collapsed
                                    }
                                    openGroupId={
                                        openGroupId
                                    }
                                    onOpenGroupChange={
                                        handleOpenGroupChange
                                    }
                                    onLockedItem={
                                        setLockedItem
                                    }
                                />
                            </div>
                        ),
                    )}

                    {upgradePlan && (
                        <div
                            className={
                                collapsed
                                    ? 'px-0'
                                    : 'pt-1'
                            }
                        >
                            {!collapsed && (
                                <div className="mb-2 flex items-center gap-2 px-5">
                                    <span className="size-1 rounded-full bg-violet-400/60" />

                                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                                        Upgrade
                                    </p>

                                    <span className="h-px min-w-0 flex-1 bg-violet-500/15" />
                                </div>
                            )}

                            <PremiumUpgradeEntry
                                plan={upgradePlan}
                                collapsed={
                                    collapsed
                                }
                                onClick={() =>
                                    setUpgradeDialogOpen(
                                        true,
                                    )
                                }
                            />
                        </div>
                    )}

                    {sections.length === 0 &&
                        !collapsed && (
                            <div className="mx-3 rounded-2xl border border-amber-500/12 bg-amber-500/[0.045] px-4 py-4">
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/15 bg-amber-500/10 text-amber-400">
                                        <ShieldCheck className="size-3.5" />
                                    </span>

                                    <div>
                                        <p className="text-xs font-semibold text-sidebar-foreground/75">
                                            No menu
                                            access
                                            assigned
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-sidebar-foreground/40">
                                            Check this
                                            account&apos;s
                                            product
                                            access,
                                            subscription,
                                            and role
                                            assignments.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {!collapsed && (
                        <div className="mx-3 mt-auto pb-3 pt-1">
                            <div className="app-theme-access-card relative overflow-hidden rounded-2xl border p-3">
                                <div className="pointer-events-none absolute -bottom-10 -right-8 size-24 rounded-full bg-primary/10 blur-3xl" />

                                <div className="relative flex items-center gap-2.5">
                                    <span className="app-theme-access-icon inline-flex size-8 shrink-0 items-center justify-center rounded-lg border">
                                        <Sparkles className="size-3.5" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-sidebar-foreground/35">
                                            Powered by
                                        </p>

                                        <p className="mt-0.5 truncate text-[11px] font-semibold text-sidebar-foreground/80">
                                            JCM Websolution
                                        </p>
                                    </div>

                                    <span className="inline-flex shrink-0 rounded-full border border-primary/15 bg-primary/[0.07] px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-primary">
                                        System
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </SidebarContent>

            </Sidebar>

            <ConfirmDialog
                open={upgradeDialogOpen}
                onOpenChange={
                    setUpgradeDialogOpen
                }
                title={
                    upgradePlan
                        ? `Unlock ${upgradePlan.name}`
                        : 'Unlock Premium Inventory'
                }
                description={
                    upgradeDescription
                }
                confirmText="View Premium Plan"
                processing={false}
                onConfirm={() => {
                    setUpgradeDialogOpen(false);

                    router.visit(
                        '/settings/subscription',
                    );
                }}
            />

            <ConfirmDialog
                open={lockedItem !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setLockedItem(null);
                    }
                }}
                title={lockedModalTitle}
                description={
                    lockedModalDescription
                }
                confirmText={
                    lockedItem?.lockReason
                        === 'plan'
                        ? 'View Premium Plan'
                        : 'View Subscription'
                }
                processing={false}
                onConfirm={() => {
                    setLockedItem(null);

                    router.visit(
                        '/settings/subscription',
                    );
                }}
            />
        </>
    );
}

export default AppSidebar;