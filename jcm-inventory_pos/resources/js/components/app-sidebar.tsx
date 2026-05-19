import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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
    BarChart3,
    Boxes,
    Folder,
    LayoutDashboard,
    Package,
    ReceiptText,
    Settings,
    ShoppingCart,
    Users,
    Warehouse,
} from 'lucide-react';

import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'POS Terminal',
        url: '/pos',
        icon: ShoppingCart,
    },
    {
        title: 'Inventory',
        url: '#',
        icon: Warehouse,
        items: [
            { title: 'Products', url: '/products' },
            { title: 'Categories', url: '/categories' },
            { title: 'Stock In', url: '/stock-in' },
            { title: 'Stock Movements', url: '/stock-movements' },
            { title: 'Low Stock', url: '/low-stock' },
        ],
    },
    {
        title: 'Sales',
        url: '#',
        icon: ReceiptText,
        items: [
            { title: 'Sales History', url: '/sales' },
            { title: 'Receipts', url: '/receipts' },
            { title: 'Returns', url: '/returns' },
            { title: 'Discounts', url: '/discounts' },
        ],
    },
    {
        title: 'Customers',
        url: '/customers',
        icon: Users,
    },
    {
        title: 'Reports',
        url: '#',
        icon: BarChart3,
        items: [
            { title: 'Sales Report', url: '/reports/sales' },
            { title: 'Inventory Report', url: '/reports/inventory' },
            { title: 'Stock Movement Report', url: '/reports/stock-movements' },
            { title: 'Daily Summary', url: '/reports/daily-summary' },
        ],
    },
    {
        title: 'Management',
        url: '#',
        icon: Boxes,
        items: [
            { title: 'Suppliers', url: '/suppliers' },
            { title: 'Units', url: '/units' },
            { title: 'Branches', url: '/branches' },
        ],
    },
    {
        title: 'Settings',
        url: '#',
        icon: Settings,
        items: [
            { title: 'General Settings', url: '/settings/general' },
            { title: 'POS Settings', url: '/settings/pos' },
            { title: 'Receipt Settings', url: '/settings/receipt' },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'JCM Web Solution',
        url: '#',
        icon: Folder,
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}