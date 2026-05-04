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
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    LayoutGrid,
    MessageCircle,
    Package,
    ReceiptText,
    Settings,
    ShoppingBag,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const adminNavItems = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutGrid },
    { title: 'Messages', url: '/admin/messages', icon: MessageCircle },
    { title: 'Notifications', url: '/admin/notifications', icon: Bell },
    { title: 'Orders', url: '/admin/orders', icon: ShoppingBag },
    { title: 'Products', url: '/admin/products', icon: Package },
    { title: 'Users', url: '/admin/users', icon: Users },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
    { title: 'Transactions', url: '/admin/transactions', icon: ReceiptText },
];

export function AppSidebar() {
    const { url } = usePage();

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r-0 bg-[#1f2f35] text-white"
        >
            <SidebarHeader className="h-16 border-b-0 bg-[#9f0028] p-0 text-white">
                <SidebarMenu className="h-full">
                    <SidebarMenuItem className="h-full">
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-full w-full rounded-none bg-[#9f0028] px-5 text-white hover:bg-[#8b0023] hover:text-white"
                        >
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-[#1f2f35] px-2 py-4">
                <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Main Navigation
                </div>

                <SidebarMenu>
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = url.startsWith(item.url);

                        return (
                            <SidebarMenuItem key={item.url}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
className={`mb-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
    active
        ? '!bg-[#0f1f24] !text-white border-l-4 border-[#9f0028]'
        : 'text-slate-100 hover:bg-[#263f47] hover:text-white'
}`}
                                >
                                    <Link href={item.url} prefetch>
                                        <Icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 bg-[#1f2f35] p-2 text-white [&_*]:text-white">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}