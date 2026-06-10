import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    ChevronDown,
    CircleHelp,
    Code2,
    HousePlus,
    LayoutGrid,
    Lock,
    LogOut,
    Package2,
    Receipt,
    RotateCcw,
    Settings,
    ShoppingCart,
    Sparkles,
    Tags,
    UserCheck,
    Users,
    WalletCards,
    X,
} from 'lucide-react';

import AppLogo from './app-logo';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

type UserRole = 'client' | 'cashier' | 'manager' | 'staff';

type SidebarBadge =
    | 'LIVE'
    | 'CORE'
    | 'OWNER'
    | 'STAFF'
    | 'DEV'
    | 'TUNE'
    | 'TEST'
    | 'NEW'
    | 'BETA'
    | 'SOON'
    | 'DISABLED';

type SidebarItem = {
    title: string;
    url: string;
    icon: React.ElementType;
    paidOnly?: boolean;
    badge?: SidebarBadge;
};

type SidebarGroup = {
    title: string;
    icon: React.ElementType;
    badge?: SidebarBadge;
    items: SidebarItem[];
};

/*
|--------------------------------------------------------------------------
| Client / Owner
|--------------------------------------------------------------------------
*/

const clientDirectItems: SidebarItem[] = [
    { title: 'Dashboard', url: '/client/dashboard', icon: LayoutGrid, badge: 'TUNE' },
    { title: 'POS Terminal', url: '/client/pos/terminal', icon: ShoppingCart, badge: 'TUNE' },
    { title: 'Transactions', url: '/client/sales/transactions', icon: Receipt, badge: 'TUNE' },
];

const clientGroupedItems: SidebarGroup[] = [
    {
        title: 'Management',
        icon: Users,
        badge: 'TUNE',
        items: [
            { title: 'Staff', url: '/client/management/staff', icon: Users, badge: 'TUNE' },
            { title: 'Store Profile', url: '/client/management/store-profile', icon: Settings, badge: 'TUNE' },
            { title: 'Branches', url: '/client/management/branches', icon: HousePlus, badge: 'TUNE' },
        ],
    },
    {
        title: 'Inventory',
        icon: Boxes,
        badge: 'TUNE',
        items: [
            { title: 'Products', url: '/client/inventory/products', icon: Package2, badge: 'TUNE' },
            { title: 'Categories', url: '/client/inventory/categories', icon: Tags, badge: 'TUNE' },
            { title: 'Stock Management', url: '/client/inventory/stocks', icon: Boxes, badge: 'TUNE' },
        ],
    },
    {
        title: 'Sales',
        icon: Receipt,
        badge: 'TUNE',
        items: [
            { title: 'Sold Items', url: '/client/sales/sold-items', icon: Package2, badge: 'TUNE' },
            { title: 'Returns', url: '/client/sales/returns', icon: RotateCcw, badge: 'TUNE' },
            { title: 'Discounts', url: '/client/sales/discounts', icon: Tags, badge: 'TUNE' },
            { title: 'Cash Drawer', url: '/client/sales/cash-drawer', icon: WalletCards, badge: 'TUNE' },
        ],
    },
    {
        title: 'Reports',
        icon: BarChart3,
        badge: 'TUNE',
        items: [
            { title: 'Sales Reports', url: '/client/reports/sales', icon: BarChart3, badge: 'TUNE' },
            { title: 'Inventory Reports', url: '/client/reports/inventory', icon: WalletCards, badge: 'TUNE' },
        ],
    },
];

/*
|--------------------------------------------------------------------------
| Cashier
|--------------------------------------------------------------------------
*/

const cashierDirectItems: SidebarItem[] = [
    { title: 'Dashboard', url: '/staff/cashier/dashboard', icon: LayoutGrid, badge: 'DEV' },
    { title: 'Cashier POS', url: '/staff/cashier/pos/terminal', icon: ShoppingCart, badge: 'DEV' },
];

const cashierGroupedItems: SidebarGroup[] = [
    {
        title: 'Sales',
        icon: Receipt,
        badge: 'DEV',
        items: [
            { title: 'Transactions', url: '/staff/cashier/transactions', icon: Receipt, badge: 'DEV' },
            { title: 'Returns', url: '/staff/cashier/returns', icon: RotateCcw, badge: 'DEV' },
            { title: 'Cash Drawer', url: '/staff/cashier/cash-drawer', icon: WalletCards, badge: 'DEV' },
        ],
    },
    {
        title: 'Inventory',
        icon: Boxes,
        badge: 'DEV',
        items: [
            { title: 'Products', url: '/staff/cashier/products', icon: Package2, badge: 'DEV' },
        ],
    },
];

/*
|--------------------------------------------------------------------------
| Manager
|--------------------------------------------------------------------------
*/

const managerDirectItems: SidebarItem[] = [
    { title: 'Dashboard', url: '/staff/manager/dashboard', icon: LayoutGrid, badge: 'TUNE' },
    { title: 'POS Monitor', url: '/staff/manager/pos/monitor', icon: ShoppingCart, badge: 'TUNE' },
    { title: 'Transactions', url: '/staff/manager/transactions', icon: Receipt, badge: 'TUNE' },
];

const managerGroupedItems: SidebarGroup[] = [
    {
        title: 'Inventory',
        icon: Boxes,
        badge: 'TUNE',
        items: [
            { title: 'Products', url: '/staff/manager/products', icon: Package2, badge: 'TUNE' },
            { title: 'Categories', url: '/staff/manager/categories', icon: Tags, badge: 'TUNE' },
            { title: 'Stock Management', url: '/staff/manager/stocks', icon: Boxes, badge: 'TUNE' },
        ],
    },
    {
        title: 'Sales',
        icon: Receipt,
        badge: 'TUNE',
        items: [
            { title: 'Sold Items', url: '/staff/manager/sold-items', icon: Package2, badge: 'TUNE' },
            { title: 'Returns', url: '/staff/manager/returns', icon: RotateCcw, badge: 'TUNE' },
            { title: 'Cash Drawer', url: '/staff/manager/cash-drawer', icon: WalletCards, badge: 'TUNE' },
        ],
    },
    {
        title: 'Employee',
        icon: UserCheck,
        badge: 'TUNE',
        items: [
            { title: 'Employees', url: '/staff/manager/employee', icon: Users, badge: 'TUNE' },
            { title: 'Staff Activity', url: '/staff/manager/staff-activity', icon: UserCheck, badge: 'TUNE' },
        ],
    },
    {
        title: 'Reports',
        icon: BarChart3,
        badge: 'TUNE',
        items: [
            { title: 'Sales Reports', url: '/staff/manager/reports/sales', icon: BarChart3, badge: 'TUNE' },
            { title: 'Inventory Reports', url: '/staff/manager/reports/inventory', icon: Boxes, badge: 'TUNE' },
        ],
    },
];

/*
|--------------------------------------------------------------------------
| General Staff
|--------------------------------------------------------------------------
*/

const staffDirectItems: SidebarItem[] = [
    { title: 'Dashboard', url: '/staff/staff/dashboard', icon: LayoutGrid, badge: 'DEV' },
];

const staffGroupedItems: SidebarGroup[] = [
    {
        title: 'Inventory',
        icon: Boxes,
        badge: 'DEV',
        items: [
            { title: 'Products', url: '/staff/staff/products', icon: Package2, badge: 'DEV' },
            { title: 'Stock Audit', url: '/staff/staff/stock-audit', icon: Boxes, badge: 'DEV' },
        ],
    },
    {
        title: 'Reports',
        icon: BarChart3,
        badge: 'DEV',
        items: [
            { title: 'Audit Reports', url: '/staff/staff/reports/audit', icon: BarChart3, badge: 'DEV' },
        ],
    },
    {
        title: 'System',
        icon: Settings,
        items: [
            { title: 'Help', url: '#', icon: CircleHelp },
            { title: 'Logout', url: '#', icon: LogOut },
        ],
    },
];

function getMenuByRole(role: UserRole) {
    if (role === 'client') {
        return {
            directItems: clientDirectItems,
            groupedItems: clientGroupedItems,
            portalLabel: 'Store Owner Portal',
            mainSectionLabel: 'Owner',
            groupSectionLabel: 'Management',
        };
    }

    if (role === 'cashier') {
        return {
            directItems: cashierDirectItems,
            groupedItems: cashierGroupedItems,
            portalLabel: 'Cashier Portal',
            mainSectionLabel: 'Cashier',
            groupSectionLabel: 'Cashier Tools',
        };
    }

    if (role === 'manager') {
        return {
            directItems: managerDirectItems,
            groupedItems: managerGroupedItems,
            portalLabel: 'Manager Portal',
            mainSectionLabel: 'Manager',
            groupSectionLabel: 'Manager Tools',
        };
    }

    return {
        directItems: staffDirectItems,
        groupedItems: staffGroupedItems,
        portalLabel: 'Staff Portal',
        mainSectionLabel: 'Staff',
        groupSectionLabel: 'Staff Tools',
    };
}

function isUrlActive(currentUrl: string, itemUrl: string) {
    if (itemUrl === '#') return false;

    const cleanCurrentUrl = currentUrl.split('?')[0];
    const cleanItemUrl = itemUrl.split('?')[0];

    return cleanCurrentUrl === cleanItemUrl || cleanCurrentUrl.startsWith(`${cleanItemUrl}/`);
}

function MenuBadge({ badge }: { badge?: SidebarBadge }) {
    if (!badge || badge === 'DISABLED') return null;

    const styles: Record<SidebarBadge, string> = {
        LIVE: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15',
        CORE: 'bg-blue-500/10 text-blue-600 ring-blue-500/15',
        OWNER: 'bg-amber-500/10 text-amber-600 ring-amber-500/15',
        STAFF: 'bg-cyan-500/10 text-cyan-600 ring-cyan-500/15',
        DEV: 'bg-sky-500/10 text-sky-600 ring-sky-500/15',
        TUNE: 'bg-orange-500/10 text-orange-600 ring-orange-500/15',
        TEST: 'bg-amber-500/10 text-amber-600 ring-amber-500/15',
        NEW: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15',
        BETA: 'bg-violet-500/10 text-violet-600 ring-violet-500/15',
        SOON: 'bg-slate-500/10 text-slate-500 ring-slate-500/15',
        DISABLED: '',
    };

    const Icon =
    badge === 'DEV'
        ? Code2
        : badge === 'TUNE'
          ? Settings
          : Sparkles;

    return (
        <span className={['ml-auto inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-bold tracking-wide ring-1', styles[badge]].join(' ')}>
            <Icon className="size-3" />
            {badge}
        </span>
    );
}

function BillingLockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-background p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                            <Lock className="size-5" />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold">Feature Locked</h2>
                            <p className="text-sm text-muted-foreground">Read-only mode is active.</p>
                        </div>
                    </div>

                    <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X className="size-4" />
                    </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    To use this feature, please settle your monthly bill. Adding, editing, stock adjustments, and POS terminal actions are available only for active subscriptions.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/client/billing')}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Go to Billing
                    </button>
                </div>
            </div>
        </div>
    );
}

function DirectItem({ item, isPaid, onLocked }: { item: SidebarItem; isPaid: boolean; onLocked: () => void }) {
    const { url } = usePage();
    const Icon = item.icon;
    const locked = item.paidOnly && !isPaid;
    const active = isUrlActive(url, item.url);

    const innerContent = (
        <>
            <span
                className={[
                    'flex size-7 items-center justify-center rounded-[9px] transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/40 group-hover:bg-background/70 group-hover:text-sidebar-foreground/70',
                ].join(' ')}
            >
                <Icon className="size-[16px]" />
            </span>

            <span className="truncate transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">{item.title}</span>

            <span className="ml-auto group-data-[collapsible=icon]/sidebar:hidden">
                {locked ? <Lock className="size-3.5 text-amber-500" /> : <MenuBadge badge={item.badge} />}
            </span>
        </>
    );

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild={!locked}
                tooltip={item.title}
                onClick={locked ? onLocked : undefined}
                className={[
                    'group relative h-10 rounded-[10px] px-3 text-[14px] font-medium transition-all duration-200',
                    locked
                        ? 'cursor-pointer text-sidebar-foreground/45 hover:bg-amber-500/10 hover:text-sidebar-foreground'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                    active ? 'bg-background text-sidebar-foreground shadow-[0_1px_8px_rgba(0,0,0,0.05)] ring-1 ring-border/60' : '',
                    'group-data-[collapsible=icon]/sidebar:size-10 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0',
                ].join(' ')}
            >
                {locked ? (
                    <div className="flex w-full items-center gap-3 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0">
                        {innerContent}
                    </div>
                ) : (
                    <Link href={item.url} prefetch className="flex w-full items-center gap-3 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0">
                        {innerContent}
                    </Link>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function SidebarDropdown({ group, isPaid, onLocked }: { group: SidebarGroup; isPaid: boolean; onLocked: () => void }) {
    const { url } = usePage();
    const GroupIcon = group.icon;
    const hasActiveItem = group.items.some((item) => isUrlActive(url, item.url));
    const [open, setOpen] = React.useState(hasActiveItem);

    React.useEffect(() => {
        if (hasActiveItem) setOpen(true);
    }, [hasActiveItem]);

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className={[
                    'group flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-[14px] font-medium transition-all duration-200',
                    hasActiveItem
                        ? 'bg-background text-sidebar-foreground shadow-[0_1px_8px_rgba(0,0,0,0.05)] ring-1 ring-border/60'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                    'group-data-[collapsible=icon]/sidebar:size-10 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0',
                ].join(' ')}
            >
                <span
                    className={[
                        'flex size-7 items-center justify-center rounded-[9px] transition-colors',
                        hasActiveItem ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/40 group-hover:bg-background/70 group-hover:text-sidebar-foreground/70',
                    ].join(' ')}
                >
                    <GroupIcon className="size-[16px]" />
                </span>

                <span className="truncate transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">{group.title}</span>

                <span className="group-data-[collapsible=icon]/sidebar:hidden">
                    <MenuBadge badge={group.badge} />
                </span>

                <ChevronDown
                    className={[
                        'size-4 text-sidebar-foreground/35 transition-transform duration-200 group-data-[collapsible=icon]/sidebar:hidden',
                        group.badge ? 'ml-1' : 'ml-auto',
                        open ? 'rotate-180' : '',
                    ].join(' ')}
                />
            </button>

            {open && (
                <div className="ml-5 space-y-0.5 border-l border-border/60 pl-3 group-data-[collapsible=icon]/sidebar:hidden">
                    {group.items.map((item) => {
                        const Icon = item.icon;
                        const locked = item.paidOnly && !isPaid;
                        const active = isUrlActive(url, item.url);

                        if (locked) {
                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={onLocked}
                                    className="group flex h-9 w-full items-center gap-2 rounded-[9px] px-3 text-left text-[13px] font-medium text-sidebar-foreground/45 transition-all hover:bg-amber-500/10 hover:text-sidebar-foreground"
                                >
                                    <Icon className="size-[14px] text-sidebar-foreground/30 group-hover:text-sidebar-foreground/65" />
                                    <span className="truncate">{item.title}</span>
                                    <Lock className="ml-auto size-3.5 text-amber-500" />
                                </button>
                            );
                        }

                        if (item.title === 'Logout') {
                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={() => router.post('/logout')}
                                    className="group flex h-9 w-full items-center gap-2 rounded-[9px] px-3 text-left text-[13px] font-medium text-sidebar-foreground/55 transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                                >
                                    <Icon className="size-[14px] text-sidebar-foreground/35 group-hover:text-sidebar-foreground/65" />
                                    <span className="truncate">{item.title}</span>
                                </button>
                            );
                        }

                        if (item.url === '#') {
                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    className="group flex h-9 w-full items-center gap-2 rounded-[9px] px-3 text-left text-[13px] font-medium text-sidebar-foreground/55 transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                                >
                                    <Icon className="size-[14px] text-sidebar-foreground/35 group-hover:text-sidebar-foreground/65" />
                                    <span className="truncate">{item.title}</span>
                                    <MenuBadge badge={item.badge} />
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.title}
                                href={item.url}
                                prefetch
                                className={[
                                    'group flex h-9 items-center gap-2 rounded-[9px] px-3 text-[13px] font-medium transition-all',
                                    active ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                                ].join(' ')}
                            >
                                <Icon className={['size-[14px]', active ? 'text-primary' : 'text-sidebar-foreground/35 group-hover:text-sidebar-foreground/65'].join(' ')} />
                                <span className="truncate">{item.title}</span>
                                <MenuBadge badge={item.badge} />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AppSidebar() {
    const [billingModalOpen, setBillingModalOpen] = React.useState(false);

    const page = usePage<{
        auth?: {
            user?: {
                role?: UserRole;
            };
        };
    }>();

    const role = page.props.auth?.user?.role ?? 'staff';
    const menu = getMenuByRole(role);
    const isPaid = true;

    return (
        <>
            <style>{`
                .pos-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(120, 120, 120, 0.25) transparent;
                }

                .pos-scrollbar::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }

                .pos-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .pos-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(140, 140, 140, 0.18);
                    border-radius: 999px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }

                .pos-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(160, 160, 160, 0.35);
                    background-clip: padding-box;
                }
            `}</style>

            <BillingLockModal open={billingModalOpen} onClose={() => setBillingModalOpen(false)} />

            <Sidebar collapsible="icon" variant="sidebar" className="h-screen border-0 bg-sidebar">
                <SidebarHeader className="px-4 pb-5 pt-6 group-data-[collapsible=icon]/sidebar:px-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="h-auto rounded-[16px] p-2 hover:bg-sidebar-accent/60 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:p-0"
                            >
                                <Link href="/dashboard" prefetch className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0">
                                    <AppLogo />

                                    <div className="min-w-0 leading-tight transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                                        <span className="block truncate text-sm font-bold text-sidebar-foreground">JCM POS</span>
                                        <span className="mt-0.5 block truncate text-[11px] font-medium text-sidebar-foreground/45">
                                            {menu.portalLabel}
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="pos-scrollbar gap-5 overflow-y-auto px-0 group-data-[collapsible=icon]/sidebar:gap-5">
                    {menu.directItems.length > 0 && (
                        <div className="space-y-2">
                            <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35 transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                                {menu.mainSectionLabel}
                            </p>

                            <SidebarMenu className="space-y-0.5 px-3 group-data-[collapsible=icon]/sidebar:px-2">
                                {menu.directItems.map((item) => (
                                    <DirectItem key={item.title} item={item} isPaid={isPaid} onLocked={() => setBillingModalOpen(true)} />
                                ))}
                            </SidebarMenu>
                        </div>
                    )}

                    {menu.groupedItems.length > 0 && (
                        <div className="space-y-2 pb-4">
                            <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35 transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                                {menu.groupSectionLabel}
                            </p>

                            <div className="space-y-1 px-3 group-data-[collapsible=icon]/sidebar:px-2">
                                {menu.groupedItems.map((group) => (
                                    <SidebarDropdown key={group.title} group={group} isPaid={isPaid} onLocked={() => setBillingModalOpen(true)} />
                                ))}
                            </div>
                        </div>
                    )} 
                </SidebarContent>
            </Sidebar>
        </>
    );
}

export { AppSidebar };
export default AppSidebar;