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
import {
    LayoutGrid,
    Users,
    CreditCard,
    Boxes,
    Layers3,
    FileBarChart2,
    ReceiptText,
    Settings,
    LifeBuoy,
    ShieldCheck,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'User Management',
        url: '/admin/users',
        icon: Users,
    },
    {
        title: 'Products',
        url: '/admin/products',
        icon: Boxes,
    },
    {
        title: 'Plans',
        url: '/admin/plans',
        icon: Layers3,
    },
   {
        title: 'Orders',
        url: '/admin/orders',
        icon: ReceiptText,
    },
    {
        title: 'Subscriptions',
        url: '/admin/subscriptions',
        icon: CreditCard,
    },
    {
        title: 'Transactions',
        url: '/admin/transactions',
        icon: ReceiptText,
    },
    {
        title: 'Reports',
        url: '#',
        icon: FileBarChart2,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Security',
        url: '#',
        icon: ShieldCheck,
    },
    {
        title: 'Support',
        url: '#',
        icon: LifeBuoy,
    },
    {
        title: 'Settings',
        url: '#',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-2 pt-2">
                    <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Platform
                    </p>
                </div>

                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}