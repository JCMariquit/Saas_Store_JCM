import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    ChevronDown,
    CircleHelp,
    Code2,
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
    Users,
    WalletCards,
    X,
} from 'lucide-react';

import AppLogo from './app-logo';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

type SidebarBadge = 'DEV' | 'NEW' | 'BETA' | 'SOON';

type SidebarItem = {
    title: string;
    url: string;
    icon: React.ElementType;
    active?: boolean;
    paidOnly?: boolean;
    badge?: SidebarBadge;
};

type SidebarGroup = {
    title: string;
    icon: React.ElementType;
    badge?: SidebarBadge;
    items: SidebarItem[];
};

const directItems: SidebarItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
    { title: 'POS Terminal', url: '/pos', icon: ShoppingCart, paidOnly: true },
    { title: 'Transactions', url: '/sales/transactions', icon: Receipt, badge: 'DEV' },
];

const groupedItems: SidebarGroup[] = [
    {
        title: 'Inventory',
        icon: Boxes,
        badge: 'DEV',
        items: [
            { title: 'Products', url: '/inventory/products', icon: Package2, badge: 'DEV' },
            { title: 'Categories', url: '/inventory/categories', icon: Tags, badge: 'DEV' },
            { title: 'Stock Management', url: '/inventory/stocks', icon: Boxes, badge: 'DEV' },
        ],
    },
    {
        title: 'Sales',
        icon: Receipt,
        items: [
            { title: 'Returns', url: '/sales/returns', icon: RotateCcw, paidOnly: true, badge: 'SOON' },
            { title: 'Customers', url: '/customers', icon: Users, badge: 'BETA' },
        ],
    },
    {
        title: 'Reports',
        icon: BarChart3,
        items: [
            { title: 'Sales Reports', url: '/reports/sales', icon: BarChart3, badge: 'SOON' },
            { title: 'Inventory Reports', url: '/reports/inventory', icon: WalletCards, badge: 'SOON' },
        ],
    },
    {
        title: 'System',
        icon: Settings,
        items: [
            { title: 'Settings', url: '/settings/profile', icon: Settings },
            { title: 'Help', url: '#', icon: CircleHelp },
            { title: 'Logout', url: '#', icon: LogOut },
        ],
    },
];

function isUrlActive(currentUrl: string, itemUrl: string) {
    if (itemUrl === '#') return false;

    const cleanCurrentUrl = currentUrl.split('?')[0];
    const cleanItemUrl = itemUrl.split('?')[0];

    return cleanCurrentUrl === cleanItemUrl || cleanCurrentUrl.startsWith(`${cleanItemUrl}/`);
}

function MenuBadge({ badge }: { badge?: SidebarBadge }) {
    if (!badge) return null;

    const styles: Record<SidebarBadge, string> = {
        DEV: 'bg-sky-500/10 text-sky-600 ring-sky-500/15',
        NEW: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/15',
        BETA: 'bg-violet-500/10 text-violet-600 ring-violet-500/15',
        SOON: 'bg-slate-500/10 text-slate-500 ring-slate-500/15',
    };

    const Icon = badge === 'DEV' ? Code2 : Sparkles;

    return (
        <span
            className={[
                'ml-auto inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-bold tracking-wide ring-1',
                styles[badge],
            ].join(' ')}
        >
            <Icon className="size-3" />
            {badge}
        </span>
    );
}

function BillingLockModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
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

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    To use this feature, please settle your monthly bill. Adding, editing,
                    stock adjustments, and POS terminal actions are available only for active subscriptions.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/billing')}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Go to Billing
                    </button>
                </div>
            </div>
        </div>
    );
}

function DirectItem({
    item,
    isPaid,
    onLocked,
}: {
    item: SidebarItem;
    isPaid: boolean;
    onLocked: () => void;
}) {
    const { url } = usePage();
    const Icon = item.icon;
    const locked = item.paidOnly && !isPaid;
    const active = isUrlActive(url, item.url);

    const innerContent = (
        <>
            <span
                className={[
                    'flex size-7 items-center justify-center rounded-[9px] transition-colors',
                    active
                        ? 'bg-primary/10 text-primary'
                        : 'text-sidebar-foreground/40 group-hover:bg-background/70 group-hover:text-sidebar-foreground/70',
                ].join(' ')}
            >
                <Icon className="size-[16px]" />
            </span>

            <span className="truncate transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                {item.title}
            </span>

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
                    active
                        ? 'bg-background text-sidebar-foreground shadow-[0_1px_8px_rgba(0,0,0,0.05)] ring-1 ring-border/60'
                        : '',
                    'group-data-[collapsible=icon]/sidebar:size-10 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0',
                ].join(' ')}
            >
                {locked ? (
                    <div className="flex w-full items-center gap-3 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0">
                        {innerContent}
                    </div>
                ) : (
                    <Link
                        href={item.url}
                        prefetch
                        className="flex w-full items-center gap-3 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0"
                    >
                        {innerContent}
                    </Link>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function SidebarDropdown({
    group,
    isPaid,
    onLocked,
}: {
    group: SidebarGroup;
    isPaid: boolean;
    onLocked: () => void;
}) {
    const { url } = usePage();
    const GroupIcon = group.icon;

    const hasActiveItem = group.items.some((item) => isUrlActive(url, item.url));

    const [open, setOpen] = React.useState(hasActiveItem);

    React.useEffect(() => {
        if (hasActiveItem) {
            setOpen(true);
        }
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
                        hasActiveItem
                            ? 'bg-primary/10 text-primary'
                            : 'text-sidebar-foreground/40 group-hover:bg-background/70 group-hover:text-sidebar-foreground/70',
                    ].join(' ')}
                >
                    <GroupIcon className="size-[16px]" />
                </span>

                <span className="truncate transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                    {group.title}
                </span>

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

                        return (
                            <Link
                                key={item.title}
                                href={item.url}
                                prefetch
                                className={[
                                    'group flex h-9 items-center gap-2 rounded-[9px] px-3 text-[13px] font-medium transition-all',
                                    active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                                ].join(' ')}
                            >
                                <Icon
                                    className={[
                                        'size-[14px]',
                                        active
                                            ? 'text-primary'
                                            : 'text-sidebar-foreground/35 group-hover:text-sidebar-foreground/65',
                                    ].join(' ')}
                                />

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

    const isPaid = false;

    return (
        <>
            <BillingLockModal
                open={billingModalOpen}
                onClose={() => setBillingModalOpen(false)}
            />

            <Sidebar
                collapsible="icon"
                variant="sidebar"
                className="h-screen border-0 bg-sidebar"
            >
                <SidebarHeader className="px-4 pb-5 pt-6 group-data-[collapsible=icon]/sidebar:px-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="h-auto rounded-[16px] p-2 hover:bg-sidebar-accent/60 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:p-0"
                            >
                                <Link
                                    href="/dashboard"
                                    prefetch
                                    className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0"
                                >
                                    <AppLogo />

                                    <div className="min-w-0 leading-tight transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                                        <span className="block truncate text-sm font-bold text-sidebar-foreground">
                                            JCM POS
                                        </span>
                                        <span className="mt-0.5 block truncate text-[11px] font-medium text-sidebar-foreground/45">
                                            Inventory & Sales
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="gap-5 px-0 group-data-[collapsible=icon]/sidebar:gap-5">
                    <div className="space-y-2">
                        <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35 transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                            Main
                        </p>

                        <SidebarMenu className="space-y-0.5 px-3 group-data-[collapsible=icon]/sidebar:px-2">
                            {directItems.map((item) => (
                                <DirectItem
                                    key={item.title}
                                    item={item}
                                    isPaid={isPaid}
                                    onLocked={() => setBillingModalOpen(true)}
                                />
                            ))}
                        </SidebarMenu>
                    </div>

                    <div className="space-y-2">
                        <p className="px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35 transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                            Modules
                        </p>

                        <div className="space-y-1 px-3 group-data-[collapsible=icon]/sidebar:px-2">
                            {groupedItems.map((group) => (
                                <SidebarDropdown
                                    key={group.title}
                                    group={group}
                                    isPaid={isPaid}
                                    onLocked={() => setBillingModalOpen(true)}
                                />
                            ))}
                        </div>
                    </div>
                </SidebarContent>

                <SidebarFooter className="mt-auto px-4 pb-2 transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                    <div className="rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-semibold text-sidebar-foreground/70">
                            by JCM
                        </p>
                        <p className="mt-0.5 text-[10px] text-sidebar-foreground/40">
                            POS development build
                        </p>
                    </div>
                </SidebarFooter>
            </Sidebar>
        </>
    );
}

export { AppSidebar };
export default AppSidebar;