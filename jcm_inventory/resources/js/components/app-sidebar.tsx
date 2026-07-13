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

/*
|--------------------------------------------------------------------------
| Icon registry
|--------------------------------------------------------------------------
|
| The database stores icon names such as "Boxes" or "Users".
| React maps those names to the matching Lucide icon component.
|
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
| Active URL helper
|--------------------------------------------------------------------------
*/

function isUrlActive(
    currentUrl: string,
    itemUrl: string,
): boolean {
    if (!itemUrl || itemUrl === '#') {
        return false;
    }

    const cleanCurrentUrl = currentUrl.split('?')[0];
    const cleanItemUrl = itemUrl.split('?')[0];

    return (
        cleanCurrentUrl === cleanItemUrl ||
        cleanCurrentUrl.startsWith(`${cleanItemUrl}/`)
    );
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
        'bg-slate-500/10 text-slate-500 ring-slate-500/15';

    const styles: Record<string, string> = {
        live: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15',
        core: 'bg-blue-500/10 text-blue-600 ring-blue-500/15',
        development:
            'bg-sky-500/10 text-sky-600 ring-sky-500/15',
        tuning:
            'bg-orange-500/10 text-orange-600 ring-orange-500/15',
        testing:
            'bg-amber-500/10 text-amber-600 ring-amber-500/15',
        new: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15',
        beta: 'bg-violet-500/10 text-violet-600 ring-violet-500/15',
        soon: fallbackStyle,
        default: fallbackStyle,
    };

    const BadgeIcon = resolveIcon(badge.iconKey);

    const style = badge.styleKey
        ? (styles[badge.styleKey] ?? fallbackStyle)
        : fallbackStyle;

    return (
        <span
            title={badge.name}
            className={[
                'ml-auto inline-flex h-5 shrink-0 items-center gap-1',
                'rounded-md px-1.5',
                'text-[9px] font-bold tracking-wide',
                'ring-1',
                style,
            ].join(' ')}
        >
            <BadgeIcon className="size-3" />
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
    const Icon = resolveIcon(item.iconKey);

    return (
        <>
            <span
                className={[
                    'flex size-7 shrink-0 items-center justify-center',
                    'rounded-[9px]',
                    'transition-colors duration-200',
                    active
                        ? 'bg-primary/10 text-primary'
                        : 'text-sidebar-foreground/40 group-hover:bg-background/70 group-hover:text-sidebar-foreground/70',
                ].join(' ')}
            >
                <Icon className="size-[16px]" />
            </span>

            {!collapsed && (
                <>
                    <span className="min-w-0 flex-1 truncate text-left">
                        {item.title}
                    </span>

                    <MenuBadge badge={item.badge} />
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

    const collapsed = state === 'collapsed';

    const active =
        !item.disabled &&
        isUrlActive(url, item.url);

    const baseClass = [
        'group h-10 overflow-hidden rounded-[10px]',
        'text-[14px] font-medium',
        'transition-all duration-200',
        collapsed
            ? 'size-10 justify-center px-0'
            : 'w-full px-3',
    ].join(' ');

    if (item.disabled || item.url === '#') {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    type="button"
                    tooltip={`${item.title} — not yet available`}
                    aria-disabled="true"
                    className={[
                        baseClass,
                        'cursor-not-allowed',
                        'text-sidebar-foreground/40',
                        'hover:bg-sidebar-accent/40',
                        'hover:text-sidebar-foreground/50',
                    ].join(' ')}
                >
                    <div
                        className={[
                            'flex h-full w-full items-center',
                            collapsed
                                ? 'justify-center'
                                : 'gap-3',
                        ].join(' ')}
                    >
                        <DirectItemContent
                            item={item}
                            active={false}
                            collapsed={collapsed}
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
                        ? 'bg-background text-sidebar-foreground shadow-[0_1px_8px_rgba(0,0,0,0.05)] ring-1 ring-border/60'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                ].join(' ')}
            >
                <Link
                    href={item.url}
                    prefetch
                    className={[
                        'flex h-full w-full items-center',
                        collapsed
                            ? 'justify-center'
                            : 'gap-3',
                    ].join(' ')}
                >
                    <DirectItemContent
                        item={item}
                        active={active}
                        collapsed={collapsed}
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
    currentUrl,
}: {
    item: DynamicSidebarItem;
    currentUrl: string;
}) {
    const Icon = resolveIcon(item.iconKey);

    const active =
        !item.disabled &&
        isUrlActive(currentUrl, item.url);

    const itemClass = [
        'group flex h-9 w-full items-center gap-2',
        'overflow-hidden rounded-[9px] px-3',
        'text-left text-[13px] font-medium',
        'transition-all duration-200',
    ].join(' ');

    const content = (
        <>
            <Icon
                className={[
                    'size-[14px] shrink-0',
                    active
                        ? 'text-primary'
                        : 'text-sidebar-foreground/35 group-hover:text-sidebar-foreground/65',
                ].join(' ')}
            />

            <span className="min-w-0 flex-1 truncate">
                {item.title}
            </span>

            <MenuBadge badge={item.badge} />
        </>
    );

    if (item.disabled || item.url === '#') {
        return (
            <button
                type="button"
                aria-disabled="true"
                title={`${item.title} — not yet available`}
                className={[
                    itemClass,
                    'cursor-not-allowed',
                    'text-sidebar-foreground/40',
                    'hover:bg-sidebar-accent/35',
                    'hover:text-sidebar-foreground/50',
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
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
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
}: {
    group: DynamicSidebarItem;
}) {
    const { url } = usePage();
    const { state, toggleSidebar } = useSidebar();

    const collapsed = state === 'collapsed';
    const GroupIcon = resolveIcon(group.iconKey);

    const hasActiveItem = group.children.some(
        (item) =>
            !item.disabled &&
            isUrlActive(url, item.url),
    );

    const [open, setOpen] =
        React.useState(hasActiveItem);

    React.useEffect(() => {
        if (hasActiveItem) {
            setOpen(true);
        }
    }, [hasActiveItem]);

    if (collapsed) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    type="button"
                    tooltip={group.title}
                    onClick={() => {
                        setOpen(true);
                        toggleSidebar();
                    }}
                    className={[
                        'group size-10 justify-center overflow-hidden',
                        'rounded-[10px] px-0',
                        'transition-all duration-200',
                        hasActiveItem
                            ? 'bg-background text-primary shadow-[0_1px_8px_rgba(0,0,0,0.05)] ring-1 ring-border/60'
                            : 'text-sidebar-foreground/45 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                    ].join(' ')}
                >
                    <span
                        className={[
                            'flex size-7 shrink-0 items-center justify-center',
                            'rounded-[9px]',
                            'transition-colors duration-200',
                            hasActiveItem
                                ? 'bg-primary/10 text-primary'
                                : 'group-hover:bg-background/70',
                        ].join(' ')}
                    >
                        <GroupIcon className="size-[16px]" />
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={() =>
                    setOpen((value) => !value)
                }
                className={[
                    'group flex h-10 w-full items-center gap-3',
                    'overflow-hidden rounded-[10px] px-3',
                    'text-[14px] font-medium',
                    'transition-all duration-200',
                    hasActiveItem
                        ? 'bg-background text-sidebar-foreground shadow-[0_1px_8px_rgba(0,0,0,0.05)] ring-1 ring-border/60'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                ].join(' ')}
            >
                <span
                    className={[
                        'flex size-7 shrink-0 items-center justify-center',
                        'rounded-[9px]',
                        'transition-colors duration-200',
                        hasActiveItem
                            ? 'bg-primary/10 text-primary'
                            : 'text-sidebar-foreground/40 group-hover:bg-background/70 group-hover:text-sidebar-foreground/70',
                    ].join(' ')}
                >
                    <GroupIcon className="size-[16px]" />
                </span>

                <span className="min-w-0 flex-1 truncate text-left">
                    {group.title}
                </span>

                <MenuBadge badge={group.badge} />

                <ChevronDown
                    className={[
                        'size-4 shrink-0',
                        'text-sidebar-foreground/35',
                        'transition-transform duration-200',
                        open ? 'rotate-180' : '',
                    ].join(' ')}
                />
            </button>

            {open && (
                <div className="ml-5 space-y-0.5 border-l border-border/60 pl-3">
                    {group.children.map((item) => (
                        <DropdownItem
                            key={item.id}
                            item={item}
                            currentUrl={url}
                        />
                    ))}
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
}: {
    items: DynamicSidebarItem[];
    collapsed: boolean;
}) {
    if (collapsed) {
        return (
            <SidebarMenu className="items-center space-y-1 px-0">
                {items.map((item) =>
                    item.type === 'group' ? (
                        <SidebarDropdown
                            key={item.id}
                            group={item}
                        />
                    ) : (
                        <DirectItem
                            key={item.id}
                            item={item}
                        />
                    ),
                )}
            </SidebarMenu>
        );
    }

    return (
        <div className="space-y-1 px-3">
            {items.map((item) =>
                item.type === 'group' ? (
                    <SidebarDropdown
                        key={item.id}
                        group={item}
                    />
                ) : (
                    <SidebarMenu
                        key={item.id}
                        className="space-y-0.5"
                    >
                        <DirectItem item={item} />
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
    const collapsed = state === 'collapsed';

    const { sidebar } =
        usePage<SidebarPageProps>().props;

    const sections = sidebar?.sections ?? [];

    const productName =
        sidebar?.product?.name ?? 'JCM Inventory';

    return (
        <>
            <style>{`
                .inventory-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(120, 120, 120, 0.25) transparent;
                }

                .inventory-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .inventory-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .inventory-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(140, 140, 140, 0.18);
                    border: 2px solid transparent;
                    border-radius: 999px;
                    background-clip: padding-box;
                }

                .inventory-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(160, 160, 160, 0.35);
                    background-clip: padding-box;
                }
            `}</style>

            <Sidebar
                collapsible="icon"
                variant="sidebar"
                className="h-screen overflow-hidden border-0 bg-sidebar"
            >
                <SidebarHeader
                    className={[
                        'pb-5 pt-6',
                        'transition-all duration-200',
                        collapsed ? 'px-2' : 'px-4',
                    ].join(' ')}
                >
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                tooltip={productName}
                                className={[
                                    'h-auto overflow-hidden rounded-[16px]',
                                    'transition-all duration-200',
                                    'hover:bg-sidebar-accent/60',
                                    collapsed
                                        ? 'size-10 justify-center p-0'
                                        : 'w-full p-2',
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
                        'transition-all duration-200',
                        collapsed
                            ? 'gap-2 px-2'
                            : 'gap-5 px-0',
                    ].join(' ')}
                >
                    {sections.map((section) => (
                        <div
                            key={section.key}
                            className={
                                collapsed
                                    ? 'space-y-1'
                                    : 'space-y-2 pb-2'
                            }
                        >
                            {!collapsed && (
                                <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                                    {section.label}
                                </p>
                            )}

                            <SectionItems
                                items={section.items}
                                collapsed={collapsed}
                            />
                        </div>
                    ))}

                    {sections.length === 0 &&
                        !collapsed && (
                            <div className="px-5 py-4">
                                <p className="text-xs font-medium text-sidebar-foreground/50">
                                    No menu access assigned.
                                </p>

                                <p className="mt-1 text-[11px] leading-4 text-sidebar-foreground/35">
                                    Check the user product
                                    access, subscription and
                                    sidebar assignments.
                                </p>
                            </div>
                        )}
                </SidebarContent>
            </Sidebar>
        </>
    );
}

export default AppSidebar;