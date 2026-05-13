import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    CalendarClock,
    CalendarDays,
    ChevronRight,
    ClipboardList,
    Clock,
    CreditCard,
    FileBarChart,
    FileText,
    GalleryHorizontal,
    LayoutDashboard,
    MapPin,
    Palette,
    Settings,
    ShieldCheck,
    Sparkles,
    Store,
    Users,
    UserRound,
} from 'lucide-react';

import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes';
import AppLogo from './app-logo';

const menuGroups = [
    {
        label: 'Main',
        icon: LayoutDashboard,
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutDashboard,
                badge: 'Home',
            },
        ],
    },
    {
        label: 'Management',
        icon: CalendarDays,
        items: [
            { title: 'Public Booking Page', href: '#', icon: Store },
            { title: 'Appointments', href: '#', icon: CalendarDays, badge: 'New' },
            { title: 'Calendar View', href: '#', icon: CalendarClock },
            { title: 'Services', href: '#', icon: ClipboardList },
            { title: 'Customers', href: '#', icon: UserRound },
            { title: 'Inquiries', href: '#', icon: FileText },
        ],
    },
    {
        label: 'Availability',
        icon: Clock,
        items: [
            { title: 'Schedules', href: '#', icon: Clock },
            { title: 'Staff', href: '#', icon: Users },
            { title: 'Time Slots', href: '#', icon: CalendarClock },
            { title: 'Blocked Dates', href: '#', icon: ShieldCheck },
        ],
    },
    {
        label: 'Business Setup',
        icon: Store,
        items: [
            { title: 'Branches', href: '#', icon: MapPin },
            { title: 'Branding', href: '#', icon: Palette },
            { title: 'Gallery / Banners', href: '#', icon: GalleryHorizontal },
            { title: 'Notifications', href: '#', icon: Bell },
        ],
    },
    {
        label: 'Reports',
        icon: BarChart3,
        items: [
            { title: 'Analytics', href: '#', icon: BarChart3 },
            { title: 'Appointment Reports', href: '#', icon: FileBarChart },
            { title: 'Customer Reports', href: '#', icon: FileText },
            { title: 'Revenue Reports', href: '#', icon: CreditCard },
        ],
    },
    {
        label: 'System',
        icon: Settings,
        items: [
            { title: 'General Settings', href: '#', icon: Settings },
            { title: 'Booking Rules', href: '#', icon: ShieldCheck },
            { title: 'Payment Settings', href: '#', icon: CreditCard },
            { title: 'User Access', href: '#', icon: Users },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-11 rounded-xl transition hover:bg-muted/70"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div className="mt-3 rounded-2xl border px-3 py-3 shadow-sm group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl border bg-muted/40">
                            <Sparkles className="size-4 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                                Booking Admin
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                Manage appointments
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-3">
                {menuGroups.map((group) => {
                    const isMain = group.label === 'Main';
                    const GroupIcon = group.icon;

                    return (
                        <Collapsible
                            key={group.label}
                            defaultOpen={isMain}
                            className="group/collapsible"
                        >
                            <SidebarGroup className="px-0 py-0.5">
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-muted/70 hover:text-foreground">
                                        <span className="flex items-center gap-2">
                                            <GroupIcon className="size-4" />
                                            {group.label}
                                        </span>

                                        <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>

                                <CollapsibleContent className="pb-1">
                                    <SidebarMenuSub className="ml-5 border-l px-0 pl-3">
                                        {group.items.map((item) => {
                                            const isActive =
                                                item.title === 'Dashboard';

                                            return (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                            className={[
                                                                'group/item my-0.5 h-9 rounded-xl border-l-2 border-transparent px-3 text-sm font-medium transition-all duration-200',
                                                                'hover:border-primary hover:bg-primary/5 hover:pl-4 hover:text-primary',
                                                            isActive
                                                                ? 'border-l-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10'
                                                                : '',
                                                        ].join(' ')}
                                                    >
                                                        <Link
                                                            href={item.href}
                                                            prefetch={item.href !== '#'}
                                                            className="flex items-center gap-2.5"
                                                        >
                                                            <item.icon className="size-4 shrink-0" />

                                                            <span className="min-w-0 flex-1 truncate">
                                                                {item.title}
                                                            </span>

                                                            {item.badge && (
                                                                <span
                                                                    className={[
                                                                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                                        isActive
                                                                            ? 'bg-primary/15 text-primary'
                                                                            : 'border text-muted-foreground',
                                                                    ].join(' ')}
                                                                >
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    );
                })}
            </SidebarContent>

            <SidebarFooter className="border-t px-3 py-3">
                <div className="mb-3 rounded-2xl border px-3 py-2.5 shadow-sm group-data-[collapsible=icon]:hidden">
                    <p className="text-xs font-bold">System Status</p>
                    <p className="text-xs text-muted-foreground">
                        Booking system ready
                    </p>
                </div>

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}