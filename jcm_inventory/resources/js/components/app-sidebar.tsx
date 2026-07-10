import * as React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    Building2,
    ChevronDown,
    ClipboardCheck,
    Code2,
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
| Types
|--------------------------------------------------------------------------
*/

type SidebarBadge =
    | 'LIVE'
    | 'CORE'
    | 'DEV'
    | 'TUNE'
    | 'TEST'
    | 'NEW'
    | 'BETA'
    | 'SOON';

type SidebarItem = {
    title: string;
    url: string;
    icon: React.ElementType;
    badge?: SidebarBadge;
    disabled?: boolean;
};

type SidebarGroup = {
    title: string;
    icon: React.ElementType;
    badge?: SidebarBadge;
    items: SidebarItem[];
};

/*
|--------------------------------------------------------------------------
| Overview
|--------------------------------------------------------------------------
*/

const overviewItems: SidebarItem[] = [
    {
        title: 'Main Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        badge: 'DEV',
    },
    {
        title: 'Stock Overview',
        url: '/inventory/overview',
        icon: BarChart3,
        badge: 'SOON',
        disabled: true,
    },
    {
        title: 'Team Overview',
        url: '/team/overview',
        icon: Users,
        badge: 'SOON',
        disabled: true,
    },
];

/*
|--------------------------------------------------------------------------
| Inventory
|--------------------------------------------------------------------------
*/

const inventoryGroup: SidebarGroup = {
    title: 'Inventory',
    icon: Boxes,
    badge: 'DEV',
    items: [
        {
            title: 'Categories',
            url: '/inventory/categories',
            icon: Tags,
            badge: 'DEV',
        },
        {
            title: 'Products',
            url: '/inventory/products',
            icon: Package2,
            badge: 'DEV',
        },
        {
            title: 'Stock Management',
            url: '/inventory/stocks',
            icon: Boxes,
            badge: 'DEV',
        },
    ],
};

/*
|--------------------------------------------------------------------------
| Direct Management Pages
|--------------------------------------------------------------------------
*/

const managementItems: SidebarItem[] = [
    {
        title: 'Branches',
        url: '/inventory/branches',
        icon: Building2,
        badge: 'DEV',
    },
    {
        title: 'Warehouse',
        url: '/inventory/warehouses',
        icon: Warehouse,
        badge: 'DEV',
    },
    {
        title: 'Stock Movements',
        url: '/inventory/movements',
        icon: History,
        badge: 'SOON',
        disabled: true,
    },
];

/*
|--------------------------------------------------------------------------
| Management Groups
|--------------------------------------------------------------------------
*/

const managementGroups: SidebarGroup[] = [
    {
        title: 'Suppliers',
        icon: Truck,
        badge: 'SOON',
        items: [
            {
                title: 'Supplier List',
                url: '/suppliers',
                icon: Truck,
                badge: 'SOON',
                disabled: true,
            },
            {
                title: 'Purchase Orders',
                url: '/suppliers/purchase-orders',
                icon: ClipboardCheck,
                badge: 'SOON',
                disabled: true,
            },
            {
                title: 'Receiving',
                url: '/suppliers/receiving',
                icon: PackageCheck,
                badge: 'SOON',
                disabled: true,
            },
        ],
    },
    {
        title: 'Team Management',
        icon: Users,
        badge: 'SOON',
        items: [
            {
                title: 'Staff Accounts',
                url: '/team/staff',
                icon: Users,
                badge: 'SOON',
                disabled: true,
            },
            {
                title: 'Roles & Access',
                url: '/team/roles',
                icon: UserCog,
                badge: 'SOON',
                disabled: true,
            },
        ],
    },
];

/*
|--------------------------------------------------------------------------
| Active URL Helper
|--------------------------------------------------------------------------
*/

function isUrlActive(currentUrl: string, itemUrl: string): boolean {
    if (itemUrl === '#') {
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
| Menu Badge
|--------------------------------------------------------------------------
*/

function MenuBadge({ badge }: { badge?: SidebarBadge }) {
    if (!badge) {
        return null;
    }

    const styles: Record<SidebarBadge, string> = {
        LIVE: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15',
        CORE: 'bg-blue-500/10 text-blue-600 ring-blue-500/15',
        DEV: 'bg-sky-500/10 text-sky-600 ring-sky-500/15',
        TUNE: 'bg-orange-500/10 text-orange-600 ring-orange-500/15',
        TEST: 'bg-amber-500/10 text-amber-600 ring-amber-500/15',
        NEW: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15',
        BETA: 'bg-violet-500/10 text-violet-600 ring-violet-500/15',
        SOON: 'bg-slate-500/10 text-slate-500 ring-slate-500/15',
    };

    const Icon =
        badge === 'DEV'
            ? Code2
            : badge === 'TUNE'
              ? Settings
              : Sparkles;

    return (
        <span
            className={[
                'ml-auto inline-flex h-5 shrink-0 items-center gap-1',
                'rounded-md px-1.5',
                'text-[9px] font-bold tracking-wide',
                'ring-1',
                styles[badge],
            ].join(' ')}
        >
            <Icon className="size-3" />
            {badge}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Direct Item Content
|--------------------------------------------------------------------------
*/

function DirectItemContent({
    item,
    active,
    collapsed,
}: {
    item: SidebarItem;
    active: boolean;
    collapsed: boolean;
}) {
    const Icon = item.icon;

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
| Direct Menu Item
|--------------------------------------------------------------------------
*/

function DirectItem({ item }: { item: SidebarItem }) {
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

    if (item.disabled) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    type="button"
                    tooltip={`${item.title} — coming soon`}
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
                            collapsed ? 'justify-center' : 'gap-3',
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
                        collapsed ? 'justify-center' : 'gap-3',
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
| Dropdown Item
|--------------------------------------------------------------------------
*/

function DropdownItem({
    item,
    currentUrl,
}: {
    item: SidebarItem;
    currentUrl: string;
}) {
    const Icon = item.icon;

    const active =
        !item.disabled &&
        isUrlActive(currentUrl, item.url);

    const itemClass = [
        'group flex h-9 w-full items-center gap-2',
        'overflow-hidden rounded-[9px] px-3',
        'text-left text-[13px] font-medium',
        'transition-all duration-200',
    ].join(' ');

    const itemContent = (
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
                title={`${item.title} — coming soon`}
                className={[
                    itemClass,
                    'cursor-not-allowed',
                    'text-sidebar-foreground/40',
                    'hover:bg-sidebar-accent/35',
                    'hover:text-sidebar-foreground/50',
                ].join(' ')}
            >
                {itemContent}
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
            {itemContent}
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| Dropdown Group
|--------------------------------------------------------------------------
*/

function SidebarDropdown({ group }: { group: SidebarGroup }) {
    const { url } = usePage();
    const { state, toggleSidebar } = useSidebar();

    const collapsed = state === 'collapsed';
    const GroupIcon = group.icon;

    const hasActiveItem = group.items.some(
        (item) =>
            !item.disabled &&
            isUrlActive(url, item.url),
    );

    const [open, setOpen] = React.useState(hasActiveItem);

    React.useEffect(() => {
        if (hasActiveItem) {
            setOpen(true);
        }
    }, [hasActiveItem]);

    /*
    |--------------------------------------------------------------------------
    | Collapsed State
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Expanded State
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
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
                    {group.items.map((item) => (
                        <DropdownItem
                            key={item.title}
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
| App Sidebar
|--------------------------------------------------------------------------
*/

export function AppSidebar() {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

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
                                tooltip="JCM Inventory"
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
                        collapsed ? 'gap-2 px-2' : 'gap-5 px-0',
                    ].join(' ')}
                >
                    {/* Overview */}
                    <div className={collapsed ? 'space-y-1' : 'space-y-2'}>
                        {!collapsed && (
                            <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                                Overview
                            </p>
                        )}

                        <SidebarMenu
                            className={
                                collapsed
                                    ? 'items-center space-y-1 px-0'
                                    : 'space-y-0.5 px-3'
                            }
                        >
                            {overviewItems.map((item) => (
                                <DirectItem
                                    key={item.title}
                                    item={item}
                                />
                            ))}
                        </SidebarMenu>
                    </div>

                    {/* Management */}
                    <div
                        className={
                            collapsed
                                ? 'space-y-1'
                                : 'space-y-2 pb-5'
                        }
                    >
                        {!collapsed && (
                            <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                                Management
                            </p>
                        )}

                        {collapsed ? (
                            <SidebarMenu className="items-center space-y-1 px-0">
                                <SidebarDropdown group={inventoryGroup} />

                                {managementItems.map((item) => (
                                    <DirectItem
                                        key={item.title}
                                        item={item}
                                    />
                                ))}

                                {managementGroups.map((group) => (
                                    <SidebarDropdown
                                        key={group.title}
                                        group={group}
                                    />
                                ))}
                            </SidebarMenu>
                        ) : (
                            <div className="space-y-1 px-3">
                                <SidebarDropdown group={inventoryGroup} />

                                <SidebarMenu className="space-y-0.5 py-0.5">
                                    {managementItems.map((item) => (
                                        <DirectItem
                                            key={item.title}
                                            item={item}
                                        />
                                    ))}
                                </SidebarMenu>

                                {managementGroups.map((group) => (
                                    <SidebarDropdown
                                        key={group.title}
                                        group={group}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </SidebarContent>
            </Sidebar>
        </>
    );
}

export default AppSidebar;