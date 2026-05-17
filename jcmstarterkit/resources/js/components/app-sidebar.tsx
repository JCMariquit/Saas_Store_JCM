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
import { useEffect, useRef, useState } from 'react';

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
                    { title: 'Dashboard 1', href: '/dashboard', done: true },
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
                    { title: 'Contact Page', href: '/starter-page/contact' },
                    { title: 'About Page', href: '/starter-page/about' },
                ],
            },
        ],
    },
    {
        label: 'Foundation',
        items: [
            {
                title: 'Components',
                icon: Layers,
                children: [
                    { title: 'Buttons', href: '/components/buttons' },
                    { title: 'Accordions', href: '/components/accordions' },
                    { title: 'Cards', href: '/components/cards' },
                    { title: 'Badges', href: '/components/badges' },
                    { title: 'Alerts', href: '/components/alerts' },
                    { title: 'Avatars', href: '/components/avatars' },
                    { title: 'Tabs', href: '/components/tabs' },
                    { title: 'Tooltips', href: '/components/tooltips' },
                    { title: 'Dropdowns', href: '/components/dropdowns' },
                    { title: 'Popovers', href: '/components/popovers' },
                    { title: 'Modals', href: '/components/modals' },
                    { title: 'Drawers', href: '/components/drawers' },

                    { title: 'Checkboxes', href: '/components/checkboxes' },
                    { title: 'Collapsibles', href: '/components/collapsibles' },
                    { title: 'Dialogs', href: '/components/dialogs' },
                    { title: 'Icons', href: '/components/icons' },
                    { title: 'Input OTP', href: '/components/input-otp' },
                    { title: 'Inputs', href: '/components/inputs' },
                    { title: 'Labels', href: '/components/labels' },
                    { title: 'Navigation Menus', href: '/components/navigation-menus' },
                    { title: 'Placeholder Patterns', href: '/components/placeholder-patterns' },
                    { title: 'Selects', href: '/components/selects' },
                    { title: 'Separators', href: '/components/separators' },
                    { title: 'Sheets', href: '/components/sheets' },
                    { title: 'Sidebars', href: '/components/sidebars' },
                    { title: 'Skeletons', href: '/components/skeletons' },
                    { title: 'Spinners', href: '/components/spinners' },
                    { title: 'Toggle Groups', href: '/components/toggle-groups' },
                    { title: 'Toggles', href: '/components/toggles' },
                ],
            },
            {
                title: 'Forms',
                icon: TextCursorInput,
                children: [
                    { title: 'Inputs', href: '/forms/inputs' },
                    { title: 'Selects', href: '/forms/selects' },
                    { title: 'Checkboxes', href: '/forms/checkboxes' },
                    { title: 'Radio Groups', href: '/forms/radio-groups' },
                    { title: 'Switches', href: '/forms/switches' },
                    { title: 'Date Pickers', href: '/forms/date-pickers' },
                    { title: 'File Uploads', href: '/forms/file-uploads' },
                    { title: 'Form Layouts', href: '/forms/layouts' },
                    { title: 'Validation', href: '/forms/validation' },
                    { title: 'Multi Step Form', href: '/forms/multi-step' },
                ],
            },
        ],
    },
    {
        label: 'Content',
        items: [
            {
                title: 'Content Blocks',
                icon: Grid3X3,
                children: [
                    { title: 'Hero Sections', href: '/content/heroes' },
                    { title: 'Feature Sections', href: '/content/features' },
                    { title: 'CTA Sections', href: '/content/cta' },
                    { title: 'Pricing Sections', href: '/content/pricing' },
                    { title: 'FAQ Sections', href: '/content/faqs' },
                    { title: 'Team Sections', href: '/content/team' },
                    { title: 'Testimonials', href: '/content/testimonials' },
                    { title: 'Footer Sections', href: '/content/footers' },
                ],
            },
            {
                title: 'Pages',
                icon: PanelTop,
                children: [
                    { title: 'About', href: '/pages/about' },
                    { title: 'Contact', href: '/pages/contact' },
                    { title: 'FAQ', href: '/pages/faq' },
                    { title: 'Terms', href: '/pages/terms' },
                    { title: 'Privacy Policy', href: '/pages/privacy' },
                    { title: 'Maintenance', href: '/pages/maintenance' },
                    { title: 'Coming Soon', href: '/pages/coming-soon' },
                ],
            },
        ],
    },
    {
        label: 'Data',
        items: [
            {
                title: 'Data Display',
                icon: Table,
                children: [
                    { title: 'Tables', href: '/data/tables' },
                    { title: 'Data Tables', href: '/data/data-tables' },
                    { title: 'Lists', href: '/data/lists' },
                    { title: 'Timeline', href: '/data/timeline' },
                    { title: 'Kanban Board', href: '/data/kanban' },
                    { title: 'Calendar View', href: '/data/calendar' },
                    { title: 'Descriptions', href: '/data/descriptions' },
                    { title: 'Empty States', href: '/data/empty-states' },
                ],
            },
            {
                title: 'Analytics',
                icon: BarChart3,
                children: [
                    { title: 'Charts', href: '/analytics/charts' },
                    { title: 'KPI Widgets', href: '/analytics/kpi-widgets' },
                    { title: 'Reports', href: '/analytics/reports' },
                    { title: 'Heatmaps', href: '/analytics/heatmaps' },
                    { title: 'Statistics Cards', href: '/analytics/statistics' },
                    { title: 'Export Views', href: '/analytics/exports' },
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
                    { title: 'Navbar', href: '/navigation/navbar' },
                    { title: 'Sidebar', href: '/navigation/sidebar' },
                    { title: 'Tabs', href: '/navigation/tabs' },
                    { title: 'Breadcrumbs', href: '/navigation/breadcrumbs' },
                    { title: 'Pagination', href: '/navigation/pagination' },
                    { title: 'Menus', href: '/navigation/menus' },
                ],
            },
            {
                title: 'Flows',
                icon: SlidersHorizontal,
                children: [
                    { title: 'Stepper', href: '/flows/stepper' },
                    { title: 'Wizard', href: '/flows/wizard' },
                    { title: 'Checkout Flow', href: '/flows/checkout' },
                    { title: 'Setup Flow', href: '/flows/setup' },
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
                    { title: 'Grid Layouts', href: '/layouts/grids' },
                    { title: 'Split Layouts', href: '/layouts/splits' },
                    { title: 'Sidebar Layouts', href: '/layouts/sidebars' },
                    { title: 'Auth Layouts', href: '/layouts/auth' },
                    { title: 'Error Pages', href: '/layouts/errors' },
                ],
            },
        ],
    },
    {
        label: 'Apps',
        items: [
            {
                title: 'Business Apps',
                icon: Package,
                children: [
                    { title: 'Booking System', href: '/apps/booking' },
                    { title: 'POS System', href: '/apps/pos' },
                    { title: 'Inventory', href: '/apps/inventory' },
                    { title: 'Subscriptions', href: '/apps/subscriptions' },
                    { title: 'Project Manager', href: '/apps/projects' },
                    { title: 'CRM', href: '/apps/crm' },
                    { title: 'HRIS', href: '/apps/hris' },
                    { title: 'Accounting', href: '/apps/accounting' },
                ],
            },
            {
                title: 'Commerce',
                icon: ShoppingCart,
                children: [
                    { title: 'Products', href: '/commerce/products' },
                    { title: 'Categories', href: '/commerce/categories' },
                    { title: 'Orders', href: '/commerce/orders' },
                    { title: 'Customers', href: '/commerce/customers' },
                    { title: 'Invoices', href: '/commerce/invoices' },
                    { title: 'Payments', href: '/commerce/payments' },
                    { title: 'Coupons', href: '/commerce/coupons' },
                ],
            },
            {
                title: 'Communication',
                icon: Bell,
                children: [
                    { title: 'Inbox', href: '/communication/inbox' },
                    { title: 'Messages', href: '/communication/messages' },
                    { title: 'Notifications', href: '/communication/notifications' },
                    { title: 'Announcements', href: '/communication/announcements' },
                    { title: 'Chat UI', href: '/communication/chat' },
                ],
            },
        ],
    },
    {
        label: 'System',
        items: [
            {
                title: 'Authentication',
                icon: LockKeyhole,
                children: [
                    { title: 'Login', href: '/login', done: true },
                    { title: 'Register', href: '/register', done: true },
                    { title: 'Forgot Password', href: '/forgot-password', done: true },
                    { title: 'Reset Password', href: '/reset-password' },
                    { title: 'Verify Email', href: '/verify-email' },
                    { title: 'Two Factor Auth', href: '/two-factor-auth' },
                    { title: 'Lock Screen', href: '/auth/lock-screen' },
                ],
            },
            {
                title: 'Users & Access',
                icon: Users,
                children: [
                    { title: 'Users', href: '/users' },
                    { title: 'User Profile', href: '/users/profile' },
                    { title: 'Roles', href: '/roles' },
                    { title: 'Permissions', href: '/permissions' },
                    { title: 'Activity Logs', href: '/activity-logs' },
                    { title: 'Audit Trail', href: '/audit-trail' },
                ],
            },
            {
                title: 'Settings',
                icon: SlidersHorizontal,
                children: [
                    { title: 'Profile', href: '/settings/profile', done: true },
                    { title: 'Password', href: '/settings/password', done: true },
                    { title: 'Appearance', href: '/settings/appearance', done: true },
                    { title: 'General', href: '/settings/general' },
                    { title: 'Branding', href: '/settings/branding' },
                    { title: 'Notifications', href: '/settings/notifications' },
                    { title: 'Billing', href: '/settings/billing' },
                    { title: 'API Keys', href: '/settings/api-keys' },
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
    const sidebarContentRef = useRef<HTMLDivElement | null>(null);
    const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

    useEffect(() => {
        const sidebar = sidebarContentRef.current;
        if (!sidebar) return;

        const savedScroll = sessionStorage.getItem('jcm-sidebar-scroll');

        if (savedScroll) {
            requestAnimationFrame(() => {
                sidebar.scrollTop = Number(savedScroll);
            });
            return;
        }

        requestAnimationFrame(() => {
            const activeItem = sidebar.querySelector('[data-sidebar-active="true"]');

            if (activeItem instanceof HTMLElement) {
                activeItem.scrollIntoView({
                    block: 'center',
                    behavior: 'smooth',
                });
            }
        });
    }, [currentUrl]);

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

            <SidebarContent
                ref={sidebarContentRef}
                onScroll={(event) => {
                    sessionStorage.setItem(
                        'jcm-sidebar-scroll',
                        String(event.currentTarget.scrollTop),
                    );
                }}
                className="sidebar-scrollbar-hidden px-2.5 py-2 group-data-[collapsible=icon]:px-2"
            >
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
                                                                    <Link
                                                                        key={child.title}
                                                                        href={child.href}
                                                                        prefetch={child.href !== '#'}
                                                                        data-sidebar-active={childActive ? 'true' : undefined}
                                                                        onClick={() => {
                                                                            const sidebar = sidebarContentRef.current;

                                                                            if (sidebar) {
                                                                                sessionStorage.setItem(
                                                                                    'jcm-sidebar-scroll',
                                                                                    String(sidebar.scrollTop),
                                                                                );
                                                                            }
                                                                        }}
                                                                        className={`group/child flex h-7 items-center gap-2 rounded-md px-2 text-xs font-medium transition-all duration-200 text-muted-foreground hover:bg-accent/60 hover:text-foreground ${childActive ? 'bg-accent/70 text-foreground' : ''}`}
                                                                    >
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