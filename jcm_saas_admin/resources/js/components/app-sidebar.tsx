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
            variant="inset"
            className="border-r border-white/50 bg-white/70 backdrop-blur-[20px] shadow-[0_10px_40px_rgba(15,23,42,0.08)]"
        >
            {/* HEADER */}
            <SidebarHeader className="border-b border-white/40">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-sky-50/70 transition"
                        >
                            <Link href="/dashboard" prefetch>
                                <div className="flex items-center gap-3">
                                    {/* LOGO WRAPPER */}
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
                                        J
                                    </div>

                                    {/* TEXT */}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 leading-none">
                                            JCM Admin
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Control Panel
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent className="px-2 py-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="border-t border-white/40">
                <NavFooter items={footerNavItems} className="mt-auto" />

                <div className="mt-3 border-t border-slate-200/60 pt-3">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}