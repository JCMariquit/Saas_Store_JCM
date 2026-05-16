import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    CalendarDays,
    ChevronRight,
    Code2,
    CreditCard,
    FolderKanban,
    Grid3X3,
    Heart,
    Home,
    Layers,
    LayoutDashboard,
    LayoutGrid,
    ListCollapse,
    LockKeyhole,
    MousePointerClick,
    Package,
    PanelRightOpen,
    PanelTop,
    ShoppingCart,
    SlidersHorizontal,
    Table,
    TextCursorInput,
    Users,
} from 'lucide-react';

import type { ElementType } from 'react';
import { useState } from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import AppLogo from './app-logo';

type SidebarHref = string;

type SidebarChild = {
    title: string;
    href: SidebarHref;
    done?: boolean;
};

type SidebarItem = {
    title: string;
    icon: ElementType;
    href?: SidebarHref;
    badge?: string;
    done?: boolean;
    children?: SidebarChild[];
};

type SidebarSection = {
    label: string;
    items: SidebarItem[];
};

const menuSections: SidebarSection[] = [
    {
        label: 'Template',
        items: [
            {
                title: 'Dashboards',
                icon: LayoutDashboard,
                badge: '4',
                children: [
                    { title: 'Dashboard 1', href: '/dashboard', done: false },
                    { title: 'Dashboard 2', href: '/dashboard/dashboard-2' },
                    { title: 'Dashboard 3', href: '/dashboard/dashboard-3' },
                    { title: 'Dashboard 4', href: '/dashboard/dashboard-4' },
                ],
            },
            {
                title: 'Starter Pages',
                icon: Home,
                children: [
                    { title: 'Blank Page', href: '/starter-page/blank', done: true },
                    { title: 'Landing Page', href: '/starter-page/landing' },
                    { title: 'Pricing Page', href: '/starter-page/pricing' },
                    { title: 'Profile Page', href: '/starter-page/profile' },
                    { title: 'Settings Page', href: '/starter-page/settings-page' },
                ],
            },
        ],
    },
    {
        label: 'UI Kit',
        items: [
            {
                title: 'Buttons',
                icon: MousePointerClick,
                children: [
                    { title: 'Button Group', href: '/buttons/button-group' },
                    { title: 'Button Variants', href: '/buttons/button-variants' },
                    { title: 'Icon Buttons', href: '/buttons/icon-buttons' },
                    { title: 'Loading Buttons', href: '/buttons/loading-buttons' },
                    { title: 'Split Buttons', href: '/buttons/split-buttons' },
                    { title: 'Dropdown Buttons', href: '/buttons/dropdown-buttons' },
                    { title: 'Floating Actions', href: '/buttons/floating-buttons' },
                ],
            },
            {
                title: 'Accordions',
                icon: ListCollapse,
                children: [
                    { title: 'Basic Accordion', href: '/accordions/basic-accordion' },
                    { title: 'Borderless Accordion', href: '/accordions/borderless-accordion' },
                    { title: 'Nested Accordion', href: '/accordions/nested-accordion' },
                    { title: 'FAQ Accordion', href: '/accordions/faq-accordion' },
                    { title: 'Card Accordion', href: '/accordions/card-accordion' },
                    { title: 'Settings Accordion', href: '/accordions/setting-accordion' },
                ],
            },
            {
                title: 'Cards',
                icon: Layers,
                children: [
                    { title: 'Basic Cards', href: '/cards/basic-cards' },
                    { title: 'Stats Cards', href: '/cards/stat-cards' },
                    { title: 'Profile Cards', href: '/cards/profile-cards' },
                    { title: 'Pricing Cards', href: '/cards/pricing-cards' },
                    { title: 'Feature Cards', href: '/cards/feature-cards' },
                    { title: 'Action Cards', href: '/cards/action-cards' },
                    { title: 'Kanban Cards', href: '/cards/kanban-cards' },
                ],
            },
            {
                title: 'Forms',
                icon: TextCursorInput,
                children: [
                    { title: 'Input Fields', href: '#' },
                    { title: 'Select Menus', href: '#' },
                    { title: 'Checkboxes', href: '#' },
                    { title: 'Radio Groups', href: '#' },
                    { title: 'Switches', href: '#' },
                    { title: 'Date Pickers', href: '#' },
                    { title: 'File Uploads', href: '#' },
                    { title: 'Form Layouts', href: '#' },
                    { title: 'Validation States', href: '#' },
                ],
            },
            {
                title: 'Overlays',
                icon: PanelRightOpen,
                children: [
                    { title: 'Modal', href: '#' },
                    { title: 'Drawer', href: '#' },
                    { title: 'Dropdown', href: '#' },
                    { title: 'Popover', href: '#' },
                    { title: 'Tooltip', href: '#' },
                    { title: 'Command Menu', href: '#' },
                    { title: 'Confirm Dialog', href: '#' },
                ],
            },
            {
                title: 'Feedback',
                icon: Bell,
                children: [
                    { title: 'Alerts', href: '#' },
                    { title: 'Badges', href: '#' },
                    { title: 'Toasts', href: '#' },
                    { title: 'Progress Bars', href: '#' },
                    { title: 'Skeleton Loaders', href: '#' },
                    { title: 'Empty States', href: '#' },
                    { title: 'Error States', href: '#' },
                ],
            },
        ],
    },
    {
        label: 'Data Display',
        items: [
            {
                title: 'Tables',
                icon: Table,
                children: [
                    { title: 'Basic Table', href: '#' },
                    { title: 'Data Table', href: '#' },
                    { title: 'Selectable Rows', href: '#' },
                    { title: 'With Filters', href: '#' },
                    { title: 'With Pagination', href: '#' },
                    { title: 'Export Table', href: '#' },
                    { title: 'Expandable Rows', href: '#' },
                ],
            },
            {
                title: 'Charts',
                icon: BarChart3,
                children: [
                    { title: 'Overview Charts', href: '#' },
                    { title: 'Line Chart', href: '#' },
                    { title: 'Bar Chart', href: '#' },
                    { title: 'Area Chart', href: '#' },
                    { title: 'Pie Chart', href: '#' },
                    { title: 'Donut Chart', href: '#' },
                    { title: 'Radar Chart', href: '#' },
                    { title: 'Heatmap', href: '#' },
                    { title: 'KPI Widgets', href: '#' },
                ],
            },
            {
                title: 'Lists',
                icon: LayoutGrid,
                children: [
                    { title: 'Simple List', href: '#' },
                    { title: 'Activity List', href: '#' },
                    { title: 'Notification List', href: '#' },
                    { title: 'Timeline List', href: '#' },
                    { title: 'User List', href: '#' },
                    { title: 'File List', href: '#' },
                ],
            },
        ],
    },
    {
        label: 'Navigation',
        items: [
            {
                title: 'Navigation UI',
                icon: PanelTop,
                children: [
                    { title: 'Navbar', href: '#' },
                    { title: 'Sidebar', href: '#' },
                    { title: 'Tabs', href: '#' },
                    { title: 'Breadcrumbs', href: '#' },
                    { title: 'Pagination', href: '#' },
                    { title: 'Stepper', href: '#' },
                    { title: 'Mega Menu', href: '#' },
                ],
            },
            {
                title: 'Wizards',
                icon: SlidersHorizontal,
                children: [
                    { title: 'Basic Wizard', href: '#' },
                    { title: 'Form Wizard', href: '#' },
                    { title: 'Checkout Wizard', href: '#' },
                    { title: 'Setup Wizard', href: '#' },
                    { title: 'Vertical Stepper', href: '#' },
                ],
            },
        ],
    },
    {
        label: 'Layouts',
        items: [
            {
                title: 'Page Layouts',
                icon: LayoutGrid,
                children: [
                    { title: 'App Shell', href: '/apps/app-shell' },
                    { title: 'Layouts', href: '/apps/layouts' },
                    { title: 'Navigation', href: '/apps/navigation' },
                    { title: 'Auth Screens', href: '/apps/auth-screens' },
                    { title: 'Error Pages', href: '/apps/error-pages' },
                    { title: 'Split Layout', href: '#' },
                    { title: 'Grid Layout', href: '#' },
                    { title: 'Sidebar Layout', href: '#' },
                ],
            },
            {
                title: 'Sections',
                icon: Grid3X3,
                children: [
                    { title: 'Hero Sections', href: '#' },
                    { title: 'Feature Sections', href: '#' },
                    { title: 'CTA Sections', href: '#' },
                    { title: 'Pricing Sections', href: '#' },
                    { title: 'FAQ Sections', href: '#' },
                    { title: 'Footer Sections', href: '#' },
                ],
            },
        ],
    },
    {
        label: 'Apps',
        items: [
            {
                title: 'Project Manager',
                icon: FolderKanban,
                children: [
                    { title: 'Projects', href: '#' },
                    { title: 'Tasks', href: '#' },
                    { title: 'Kanban Board', href: '#' },
                    { title: 'Team', href: '#' },
                    { title: 'Calendar', href: '#' },
                ],
            },
            {
                title: 'Booking System',
                icon: CalendarDays,
                badge: 'Main',
                children: [
                    { title: 'Appointments', href: '#' },
                    { title: 'Calendar View', href: '#' },
                    { title: 'Services', href: '#' },
                    { title: 'Customers', href: '#' },
                    { title: 'Staff Schedules', href: '#' },
                ],
            },
            {
                title: 'POS System',
                icon: ShoppingCart,
                children: [
                    { title: 'Sales', href: '#' },
                    { title: 'Products', href: '#' },
                    { title: 'Categories', href: '#' },
                    { title: 'Receipts', href: '#' },
                    { title: 'Cashier Screen', href: '#' },
                ],
            },
            {
                title: 'Inventory',
                icon: Package,
                children: [
                    { title: 'Stock List', href: '#' },
                    { title: 'Stock In', href: '#' },
                    { title: 'Stock Out', href: '#' },
                    { title: 'Suppliers', href: '#' },
                    { title: 'Purchase Orders', href: '#' },
                ],
            },
            {
                title: 'Subscriptions',
                icon: CreditCard,
                children: [
                    { title: 'Products', href: '#' },
                    { title: 'Plans', href: '#' },
                    { title: 'Orders', href: '#' },
                    { title: 'Transactions', href: '#' },
                    { title: 'Invoices', href: '#' },
                ],
            },
        ],
    },
    {
        label: 'Auth & System',
        items: [
            {
                title: 'Authentication',
                icon: LockKeyhole,
                children: [
                    { title: 'Login', href: '/login' },
                    { title: 'Register', href: '/register' },
                    { title: 'Forgot Password', href: '/forgot-password' },
                    { title: 'Reset Password', href: '#' },
                    { title: 'Verify Email', href: '#' },
                    { title: 'Two Factor Auth', href: '#' },
                ],
            },
            {
                title: 'Users',
                icon: Users,
                children: [
                    { title: 'User List', href: '#' },
                    { title: 'User Profile', href: '#' },
                    { title: 'Roles', href: '#' },
                    { title: 'Permissions', href: '#' },
                    { title: 'Activity Logs', href: '#' },
                ],
            },
            {
                title: 'Settings',
                icon: SlidersHorizontal,
                children: [
                    { title: 'Profile', href: '/settings/profile' },
                    { title: 'Password', href: '/settings/password' },
                    { title: 'Appearance', href: '/settings/appearance' },
                    { title: 'General Settings', href: '#' },
                    { title: 'Branding', href: '#' },
                    { title: 'Notifications', href: '#' },
                    { title: 'Payments', href: '#' },
                ],
            },
        ],
    },
];

function DevMarker({ done }: { done?: boolean }) {
    if (done) return null;

    return (
        <span
            title="For development"
            className="flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/25 dark:text-amber-400"
        >
            <Code2 className="size-2.5" />
        </span>
    );
}

export function AppSidebar() {
    const page = usePage();
    const currentUrl = page.url;
    const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

    const isHrefActive = (href: string) => {
        if (href === '#') return false;
        if (href === '/') return currentUrl === '/';

        return currentUrl === href || currentUrl.startsWith(`${href}/`);
    };

    const getMenuKey = (sectionLabel: string, itemTitle: string) =>
        `${sectionLabel}-${itemTitle}`;

    const activeMenuKeys = new Set<string>();

    menuSections.forEach((section) => {
        section.items.forEach((item) => {
            const itemActive = item.href ? isHrefActive(item.href) : false;
            const childActive = item.children?.some((child) =>
                isHrefActive(child.href),
            );

            if (itemActive || childActive) {
                activeMenuKeys.add(getMenuKey(section.label, item.title));
            }
        });
    });

    const toggleMenu = (menuKey: string) => {
        if (activeMenuKeys.has(menuKey)) return;

        setOpenMenuKey((current) => (current === menuKey ? null : menuKey));
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-0 bg-sidebar/95 backdrop-blur-xl">
            <SidebarHeader className="px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-11 rounded-xl border-0 bg-transparent shadow-none transition-all duration-200 hover:bg-accent/40 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="sidebar-scrollbar-hidden px-2.5 py-2 group-data-[collapsible=icon]:px-2">
                <TooltipProvider delayDuration={150}>
                    <div className="space-y-4 group-data-[collapsible=icon]:hidden">
                        {menuSections.map((section) => (
                            <SidebarGroup key={section.label} className="px-0 py-0">
                                <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80">
                                    {section.label}
                                </SidebarGroupLabel>

                                <SidebarMenu className="gap-1">
                                    {section.items.map((item) => {
                                        const ItemIcon = item.icon;
                                        const menuKey = getMenuKey(section.label, item.title);
                                        const hasChildren = Boolean(item.children?.length);
                                        const itemActive = item.href ? isHrefActive(item.href) : false;
                                        const childActive = item.children?.some((child) => isHrefActive(child.href));
                                        const isActive = Boolean(itemActive || childActive);
                                        const isOpen = activeMenuKeys.has(menuKey) || openMenuKey === menuKey;

                                        if (!hasChildren) {
                                            return (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton asChild className={`group/item relative h-9 overflow-hidden rounded-lg px-3 text-sm font-semibold transition-all duration-200 text-muted-foreground hover:bg-accent/70 hover:text-foreground ${isActive ? 'bg-accent/70 text-foreground shadow-sm ring-1 ring-border/60' : ''}`}>
                                                        <Link href={item.href ?? '#'} prefetch={(item.href ?? '#') !== '#'} className="relative z-10 flex w-full items-center gap-2.5">
                                                            <ItemIcon className="size-4 shrink-0" />
                                                            <span className="min-w-0 flex-1 truncate">{item.title}</span>
                                                            {item.badge && <span className="shrink-0 rounded-md bg-background px-1.5 py-0.5 text-[10px] font-bold leading-none text-foreground ring-1 ring-border/60">{item.badge}</span>}
                                                            <DevMarker done={item.done} />
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        }

                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <Collapsible open={isOpen} className="group/collapsible">
                                                    <CollapsibleTrigger type="button" onClick={() => toggleMenu(menuKey)} className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-sm font-semibold tracking-normal transition-all duration-200 text-muted-foreground hover:bg-accent/70 hover:text-foreground ${isActive ? 'bg-accent/60 text-foreground' : ''}`}>
                                                        <span className="flex min-w-0 items-center gap-2.5">
                                                            <ItemIcon className="size-4 shrink-0" />
                                                            <span className="truncate">{item.title}</span>
                                                        </span>

                                                        <span className="flex shrink-0 items-center gap-1.5">
                                                            {item.badge && <span className="rounded-md bg-background px-1.5 py-0.5 text-[10px] font-bold leading-none text-foreground ring-1 ring-border/60">{item.badge}</span>}
                                                            <DevMarker done={item.done} />
                                                            <ChevronRight className="size-3.5 transition-transform duration-300 ease-out group-data-[state=open]/collapsible:rotate-90" />
                                                        </span>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent className="overflow-hidden pt-1 pb-1 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                                        <div className="ml-6 space-y-0.5 border-l border-border/60 pl-3">
                                                            {item.children?.map((child) => {
                                                                const childActive = isHrefActive(child.href);

                                                                return (
                                                                    <Link key={child.title} href={child.href} prefetch={child.href !== '#'} className={`group/child flex h-7 items-center gap-2 rounded-md px-2 text-xs font-medium transition-all duration-200 text-muted-foreground hover:bg-accent/60 hover:text-foreground ${childActive ? 'bg-accent/70 text-foreground' : ''}`}>
                                                                        <span className="h-px w-2 shrink-0 rounded-full bg-current opacity-60" />
                                                                        <span className="min-w-0 flex-1 truncate">{child.title}</span>
                                                                        <DevMarker done={child.done} />
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroup>
                        ))}
                    </div>

                    <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
                        {menuSections.flatMap((section) =>
                            section.items.map((item) => {
                                const ItemIcon = item.icon;
                                const menuKey = getMenuKey(section.label, item.title);
                                const isActive = activeMenuKeys.has(menuKey);

                                return (
                                    <DropdownMenu key={menuKey}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DropdownMenuTrigger asChild>
                                                    <button type="button" className={`flex size-9 items-center justify-center rounded-lg transition-colors duration-200 text-muted-foreground hover:bg-accent/70 hover:text-foreground ${isActive ? 'bg-accent/70 text-foreground ring-1 ring-border/60' : ''}`}>
                                                        <ItemIcon className="size-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">{item.title}</TooltipContent>
                                        </Tooltip>

                                        <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-56 rounded-lg border border-border/60 bg-popover p-1.5 shadow-lg">
                                            <div className="px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                                                {item.title}
                                            </div>

                                            {item.children?.map((child) => (
                                                <Link key={child.title} href={child.href} prefetch={child.href !== '#'} className={`flex h-8 items-center gap-2 rounded-md px-2.5 text-xs font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground ${isHrefActive(child.href) ? 'bg-accent text-foreground' : ''}`}>
                                                    <span className="h-px w-2 shrink-0 rounded-full bg-current opacity-60" />
                                                    <span className="min-w-0 flex-1 truncate">{child.title}</span>
                                                    <DevMarker done={child.done} />
                                                </Link>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                );
                            }),
                        )}
                    </div>
                </TooltipProvider>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 px-4 py-3 group-data-[collapsible=icon]:hidden">
                <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-foreground">Just Create More</p>
                    <p className="text-[10px] leading-4 text-muted-foreground">© 2026 All Rights Reserved</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Made with</span>
                        <Heart className="size-3 fill-current text-red-500" />
                        <span>by JCM WebSolution</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}