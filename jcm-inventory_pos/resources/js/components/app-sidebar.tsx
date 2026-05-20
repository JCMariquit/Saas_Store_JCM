import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    CheckSquare,
    CircleHelp,
    LayoutGrid,
    LogOut,
    Settings,
    Users,
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

type SidebarItem = {
    title: string;
    url: string;
    icon: React.ElementType;
    active?: boolean;
    badge?: string;
};

const menuItems: SidebarItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid, active: true },
    { title: 'Tasks', url: '#', icon: CheckSquare, badge: '12+' },
    { title: 'Calendar', url: '#', icon: Calendar },
    { title: 'Analytics', url: '#', icon: BarChart3 },
    { title: 'Team', url: '#', icon: Users },
];

const generalItems: SidebarItem[] = [
    { title: 'Settings', url: '/settings/profile', icon: Settings },
    { title: 'Help', url: '#', icon: CircleHelp },
    { title: 'Logout', url: '#', icon: LogOut },
];

function SidebarSection({
    label,
    items,
}: {
    label: string;
    items: SidebarItem[];
}) {
    return (
        <div className="space-y-2">
            <p className="px-5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/35 uppercase transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                {label}
            </p>

            <SidebarMenu className="space-y-0.5 px-3 group-data-[collapsible=icon]/sidebar:px-2">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={[
                                    'group relative h-10 rounded-[10px] px-3 text-[14px] font-medium transition-all duration-200',
                                    'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                                    'group-data-[collapsible=icon]/sidebar:size-10 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0',
                                    item.active
                                        ? 'bg-background text-sidebar-foreground shadow-[0_1px_8px_rgba(0,0,0,0.05)] ring-1 ring-border/60'
                                        : '',
                                ].join(' ')}
                            >
                                <Link
                                    href={item.url}
                                    prefetch
                                    className="flex w-full items-center gap-3 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0"
                                >
                                    <span
                                        className={[
                                            'flex size-7 items-center justify-center rounded-[9px] transition-colors',
                                            item.active
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-sidebar-foreground/40 group-hover:bg-background/70 group-hover:text-sidebar-foreground/70',
                                        ].join(' ')}
                                    >
                                        <Icon className="size-[16px]" />
                                    </span>

                                    <span className="truncate transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                                        {item.title}
                                    </span>

                                    {item.badge && (
                                        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold leading-none text-primary-foreground group-data-[collapsible=icon]/sidebar:hidden">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </div>
    );
}

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="h-[calc(100vh-2rem)] border-0 bg-sidebar"
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
                                        JCM Starter Kit
                                    </span>
                                    <span className="mt-0.5 block truncate text-[11px] font-medium text-sidebar-foreground/45">
                                        Enterprise UI System
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-7 px-0 group-data-[collapsible=icon]/sidebar:gap-5">
                <SidebarSection label="Menu" items={menuItems} />
                <SidebarSection label="General" items={generalItems} />
            </SidebarContent>

            <SidebarFooter className="mt-auto px-4 pb-5 transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                <div className="rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold text-sidebar-foreground/70">
                        by JCM
                    </p>
                    <p className="mt-0.5 text-[10px] text-sidebar-foreground/40">
                        Development build
                    </p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}