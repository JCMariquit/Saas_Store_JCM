import * as React from 'react';
import { Link, usePage } from '@inertiajs/react';
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
    History,
    LayoutDashboard,
    Package2,
    PackageCheck,
    Settings,
    ShieldCheck,
    Sparkles,
    Tags,
    Truck,
    UserCog,
    Users,
    Warehouse,
} from 'lucide-react';

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

type DynamicSidebarItem = {
    id: number;
    key: string;
    sectionKey: string;
    type: 'link' | 'group' | 'heading';
    title: string;
    url: string;
    iconKey: string | null;
    disabled: boolean;
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
        status: string;
        endDate: string | null;
    } | null;

    sections: DynamicSidebarSection[];
};

type SidebarPageProps = {
    [key: string]: unknown;
    sidebar?: SidebarPayload;
};

type NavigationTone =
    | 'blue'
    | 'cyan'
    | 'emerald'
    | 'amber'
    | 'violet'
    | 'slate';

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
    History,
    LayoutDashboard,
    Package2,
    PackageCheck,
    Settings,
    ShieldCheck,
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
| Navigation tone
|--------------------------------------------------------------------------
*/

const navigationToneStyles: Record<
    NavigationTone,
    NavigationToneStyle
> = {
    blue: {
        itemActive:
            'border-blue-500/20 bg-blue-500/[0.075] text-blue-300 shadow-[0_0_22px_rgba(59,130,246,0.045)]',
        iconActive:
            'border-blue-500/20 bg-blue-500/10 text-blue-400',
        childActive:
            'border-blue-500/15 bg-blue-500/[0.07] text-blue-300',
        iconText: 'text-blue-400',
        indicator: 'bg-blue-400',
        guideBorder: 'border-blue-500/20',
    },

    cyan: {
        itemActive:
            'border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.04)]',
        iconActive:
            'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
        childActive:
            'border-cyan-500/15 bg-cyan-500/[0.065] text-cyan-300',
        iconText: 'text-cyan-400',
        indicator: 'bg-cyan-400',
        guideBorder: 'border-cyan-500/20',
    },

    emerald: {
        itemActive:
            'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.04)]',
        iconActive:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        childActive:
            'border-emerald-500/15 bg-emerald-500/[0.065] text-emerald-300',
        iconText: 'text-emerald-400',
        indicator: 'bg-emerald-400',
        guideBorder: 'border-emerald-500/20',
    },

    amber: {
        itemActive:
            'border-amber-500/20 bg-amber-500/[0.07] text-amber-300 shadow-[0_0_22px_rgba(245,158,11,0.04)]',
        iconActive:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',
        childActive:
            'border-amber-500/15 bg-amber-500/[0.065] text-amber-300',
        iconText: 'text-amber-400',
        indicator: 'bg-amber-400',
        guideBorder: 'border-amber-500/20',
    },

    violet: {
        itemActive:
            'border-violet-500/20 bg-violet-500/[0.075] text-violet-300 shadow-[0_0_22px_rgba(139,92,246,0.045)]',
        iconActive:
            'border-violet-500/20 bg-violet-500/10 text-violet-400',
        childActive:
            'border-violet-500/15 bg-violet-500/[0.07] text-violet-300',
        iconText: 'text-violet-400',
        indicator: 'bg-violet-400',
        guideBorder: 'border-violet-500/20',
    },

    slate: {
        itemActive:
            'border-border/70 bg-background/75 text-sidebar-foreground shadow-[0_1px_10px_rgba(0,0,0,0.08)]',
        iconActive:
            'border-border/70 bg-muted/60 text-sidebar-foreground',
        childActive:
            'border-border/70 bg-background/70 text-sidebar-foreground',
        iconText: 'text-sidebar-foreground',
        indicator: 'bg-sidebar-foreground/70',
        guideBorder: 'border-border/60',
    },
};

function resolveNavigationTone(
    item: DynamicSidebarItem,
): NavigationTone {
    const identity = [
        item.sectionKey,
        item.key,
        item.title,
        item.url,
    ]
        .join(' ')
        .toLowerCase();

    if (
        identity.includes('team') ||
        identity.includes('member') ||
        identity.includes('role') ||
        identity.includes('access')
    ) {
        return 'violet';
    }

    if (
        identity.includes('supplier') ||
        identity.includes('purchase') ||
        identity.includes('receiv') ||
        identity.includes('procurement')
    ) {
        return 'amber';
    }

    if (
        identity.includes('branch') ||
        identity.includes('location')
    ) {
        return 'blue';
    }

    if (
        identity.includes('warehouse') ||
        identity.includes('movement') ||
        identity.includes('audit')
    ) {
        return 'cyan';
    }

    if (
        identity.includes('inventory') ||
        identity.includes('categor') ||
        identity.includes('product') ||
        identity.includes('stock') ||
        identity.includes('withdraw')
    ) {
        return 'emerald';
    }

    if (
        identity.includes('dashboard') ||
        identity.includes('overview') ||
        identity.includes('analytic') ||
        identity.includes('report')
    ) {
        return 'blue';
    }

    return 'slate';
}

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

    const tone =
        resolveNavigationTone(item);

    const toneStyle =
        navigationToneStyles[tone];

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
                        : 'border-transparent bg-transparent text-sidebar-foreground/40 group-hover:border-border/50 group-hover:bg-background/55 group-hover:text-sidebar-foreground/75',
                ].join(' ')}
            >
                <Icon className="size-[15px]" />

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

                    <MenuBadge
                        badge={item.badge}
                    />
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
}: {
    item: DynamicSidebarItem;
}) {
    const { url } = usePage();
    const { state } = useSidebar();

    const collapsed =
        state === 'collapsed';

    const active =
        !item.disabled &&
        isUrlActive(
            url,
            item.url,
        );

    const tone =
        resolveNavigationTone(item);

    const toneStyle =
        navigationToneStyles[tone];

    const baseClass = [
        'group relative h-10 overflow-hidden rounded-xl border border-transparent',
        'text-[13px]',
        'transition-all duration-200',
        collapsed
            ? 'size-10 justify-center px-0'
            : 'w-full px-2.5',
    ].join(' ');

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
                        : 'text-sidebar-foreground/58 hover:border-border/45 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground',
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
}: {
    item: DynamicSidebarItem;
    activeItemId: number | null;
}) {
    const Icon = resolveIcon(
        item.iconKey,
    );

    const active =
        !item.disabled &&
        item.id === activeItemId;

    const tone =
        resolveNavigationTone(item);

    const toneStyle =
        navigationToneStyles[tone];

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
                    'inline-flex size-6 shrink-0 items-center justify-center rounded-md',
                    'transition-colors duration-200',
                    active
                        ? toneStyle.iconActive
                        : 'text-sidebar-foreground/35 group-hover:bg-background/50 group-hover:text-sidebar-foreground/65',
                ].join(' ')}
            >
                <Icon className="size-[13px]" />
            </span>

            <span className="min-w-0 flex-1 truncate">
                {item.title}
            </span>

            <MenuBadge
                badge={item.badge}
            />
        </>
    );

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
                    : 'text-sidebar-foreground/52 hover:border-border/35 hover:bg-sidebar-accent/35 hover:text-sidebar-foreground',
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
}: {
    group: DynamicSidebarItem;
    open: boolean;
    onOpenChange: (
        groupId: number | null,
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

    const tone =
        resolveNavigationTone(group);

    const toneStyle =
        navigationToneStyles[tone];

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
                    tooltip={group.title}
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
                            : 'border-transparent text-sidebar-foreground/42 hover:border-border/40 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground',
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
                                : 'border-transparent group-hover:border-border/50 group-hover:bg-background/55',
                        ].join(' ')}
                    >
                        <GroupIcon className="size-[15px]" />

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
                        : 'border-transparent text-sidebar-foreground/58 hover:border-border/45 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground',
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
                        'flex size-7 shrink-0 items-center justify-center',
                        'rounded-lg border transition-all duration-200',
                        hasActiveItem
                            ? toneStyle.iconActive
                            : 'border-transparent text-sidebar-foreground/40 group-hover:border-border/50 group-hover:bg-background/55 group-hover:text-sidebar-foreground/75',
                    ].join(' ')}
                >
                    <GroupIcon className="size-[15px]" />
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

                <MenuBadge
                    badge={group.badge}
                />

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
                            : 'border-border/45',
                    ].join(' ')}
                >
                    {group.children.map(
                        (item) => (
                            <DropdownItem
                                key={
                                    item.id
                                }
                                item={
                                    item
                                }
                                activeItemId={
                                    activeItemId
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
}: {
    items: DynamicSidebarItem[];
    collapsed: boolean;
    openGroupId: number | null;
    onOpenGroupChange: (
        groupId: number | null,
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
                                key={
                                    item.id
                                }
                                group={
                                    item
                                }
                                open={
                                    openGroupId ===
                                    item.id
                                }
                                onOpenChange={
                                    onOpenGroupChange
                                }
                            />
                        ) : (
                            <DirectItem
                                key={
                                    item.id
                                }
                                item={
                                    item
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
                            key={
                                item.id
                            }
                            group={
                                item
                            }
                            open={
                                openGroupId ===
                                item.id
                            }
                            onOpenChange={
                                onOpenGroupChange
                            }
                        />
                    ) : (
                        <SidebarMenu
                            key={item.id}
                            className="space-y-0.5"
                        >
                            <DirectItem
                                item={item}
                            />
                        </SidebarMenu>
                    ),
            )}
        </div>
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

    const { sidebar } = page.props;

    const sections = React.useMemo(
        () => sidebar?.sections ?? [],
        [sidebar?.sections],
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

    const productName =
        sidebar?.product?.name ??
        'JCM Inventory';

    const roleName =
        sidebar?.access?.roleName ??
        'Inventory User';

    const subscriptionStatus =
        sidebar?.subscription?.status
            ? sidebar.subscription.status
                  .replaceAll(
                      '_',
                      ' ',
                  )
                  .replace(
                      /\b\w/g,
                      (character) =>
                          character.toUpperCase(),
                  )
            : 'No subscription';

    const subscriptionHealthy = [
        'active',
        'trialing',
        'trial',
    ].includes(
        sidebar?.subscription?.status
            ?.toLowerCase() ?? '',
    );

    return (
        <>
            <style>{`
                .inventory-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(120, 120, 120, 0.22) transparent;
                }

                .inventory-scrollbar::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }

                .inventory-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .inventory-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(140, 140, 140, 0.16);
                    border: 2px solid transparent;
                    border-radius: 999px;
                    background-clip: padding-box;
                }

                .inventory-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(160, 160, 160, 0.32);
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
                                    productName
                                }
                                className={[
                                    'h-auto overflow-hidden rounded-2xl border',
                                    'border-border/40 bg-background/20',
                                    'transition-all duration-200',
                                    'hover:border-emerald-500/15',
                                    'hover:bg-background/38',
                                    'hover:shadow-[0_0_24px_rgba(16,185,129,0.035)]',
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
                                        <span className="size-1 rounded-full bg-sidebar-foreground/25" />

                                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                                            {
                                                section.label
                                            }
                                        </p>

                                        <span className="h-px min-w-0 flex-1 bg-border/25" />
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
                                />
                            </div>
                        ),
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

                    {!collapsed &&
                        sidebar?.access && (
                            <div className="mx-3 mt-auto pb-3 pt-1">
                                <div className="relative overflow-hidden rounded-2xl border border-violet-500/10 bg-background/28 p-3">
                                    <div className="pointer-events-none absolute -bottom-10 -right-8 size-24 rounded-full bg-violet-500/8 blur-3xl" />

                                    <div className="relative flex items-center gap-2.5">
                                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10 text-violet-400">
                                            <ShieldCheck className="size-3.5" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-sidebar-foreground/35">
                                                Access
                                                profile
                                            </p>

                                            <p className="mt-0.5 truncate text-[11px] font-semibold text-sidebar-foreground/80">
                                                {
                                                    roleName
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={[
                                                'inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-1',
                                                'text-[7px] font-semibold uppercase tracking-[0.08em]',
                                                subscriptionHealthy
                                                    ? 'border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-400'
                                                    : 'border-amber-500/15 bg-amber-500/[0.07] text-amber-400',
                                            ].join(
                                                ' ',
                                            )}
                                        >
                                            <span
                                                className={[
                                                    'size-1.5 rounded-full',
                                                    subscriptionHealthy
                                                        ? 'bg-emerald-400'
                                                        : 'bg-amber-400',
                                                ].join(
                                                    ' ',
                                                )}
                                            />

                                            {
                                                subscriptionStatus
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                </SidebarContent>
            </Sidebar>
        </>
    );
}

export default AppSidebar;