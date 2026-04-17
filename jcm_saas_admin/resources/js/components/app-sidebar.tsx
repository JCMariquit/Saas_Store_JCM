import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        url: '/users',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
<Sidebar
    collapsible="icon"
    className="border-r border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
>
            <SidebarHeader className="flex h-[74px] items-center border-b border-slate-800 px-3 dark:border-slate-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-auto rounded-2xl px-3 py-3 transition hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                            <Link href="/dashboard" prefetch className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sky-600 dark:border-slate-800 dark:bg-slate-900 dark:text-sky-400">
                                    <AppLogo className="h-6 w-6" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        JCM Admin
                                    </div>
                                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                        Control Panel
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Platform
                </div>

                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 px-3 py-4 dark:border-slate-800">
                <NavFooter items={footerNavItems} className="mt-auto" />

                <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}