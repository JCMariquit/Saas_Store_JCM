import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    CreditCard,
    Boxes,
    Layers3,
    FileBarChart2,
    ReceiptText,
    FolderKanban,
    ShoppingCart,
    BarChart3,
    MonitorSmartphone,
    Globe,
    Wallet,
    ChevronDown,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLogo from './app-logo';

type MenuItem = {
    title: string;
    url: string;
    icon: React.ElementType;
};

type MenuGroup = {
    title: string;
    icon: React.ElementType;
    items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
    {
        title: 'Overview',
        icon: LayoutGrid,
        items: [
            { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutGrid },
        ],
    },
    {
        title: 'Management',
        icon: FolderKanban,
        items: [
            { title: 'Users', url: '/admin/users', icon: Users },
            { title: 'Products', url: '/admin/products', icon: Boxes },
            { title: 'Services', url: '/admin/services', icon: Boxes },
            { title: 'Plans', url: '/admin/plans', icon: Layers3 },
            { title: 'Payment Methods', url: '/admin/payment-methods', icon: Wallet },
        ],
    },
    {
        title: 'Sales',
        icon: ShoppingCart,
        items: [
            { title: 'Orders', url: '/admin/orders', icon: ReceiptText },
            { title: 'Subscriptions', url: '/admin/subscriptions', icon: CreditCard },
            { title: 'Transactions', url: '/admin/transactions', icon: ReceiptText },
        ],
    },
    {
        title: 'System',
        icon: Globe,
        items: [
            { title: 'Website Builder', url: '/admin/website/builder', icon: Globe },
            { title: 'Websites', url: '/admin/websites', icon: MonitorSmartphone },
        ],
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        items: [
            { title: 'Reports', url: '/admin/reports', icon: FileBarChart2 },
        ],
    },
];

export function AppSidebar() {
    const { url } = usePage();

    const initialOpenState = useMemo(() => {
        const state: Record<string, boolean> = {};
        menuGroups.forEach(group => {
            state[group.title] = group.items.some(item => url.startsWith(item.url));
        });
        return state;
    }, [url]);

    const [openGroups, setOpenGroups] = useState(initialOpenState);

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <Sidebar className="!bg-[#1f2f35] !text-white border-r-0">
            <div className="flex h-full flex-col !bg-[#1f2f35]">

                {/* HEADER */}
                <SidebarHeader className="h-16 !bg-[#9f0028] p-0 border-b-0">
                    <SidebarMenu className="h-full">
                        <SidebarMenuItem className="h-full">
                            <SidebarMenuButton
                                asChild
                                className="h-full w-full px-5 !bg-[#9f0028] hover:!bg-[#8b0023] !text-white"
                            >
                                <Link href="/admin/dashboard">
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* CONTENT */}
                <SidebarContent className="!bg-[#1f2f35] px-2 py-4">

                    <div className="px-3 pb-2 text-xs uppercase text-slate-400">
                        Main Navigation
                    </div>

                    {menuGroups.map(group => {
                        const Icon = group.icon;
                        const isOpen = openGroups[group.title];

                        return (
                            <div key={group.title}>
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-[#263f47] rounded-md"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {group.title}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isOpen && (
                                    <div className="pl-2 mt-1 space-y-1">
                                        {group.items.map(item => {
                                            const ActiveIcon = item.icon;
                                            const active = url.startsWith(item.url);

                                            return (
                                                <Link
                                                    key={item.title}
                                                    href={item.url}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                                                        active
                                                            ? '!bg-[#0f1f24] !text-white border-l-4 border-[#9f0028]'
                                                            : 'text-slate-300 hover:bg-[#263f47] hover:text-white'
                                                    }`}
                                                >
                                                    <ActiveIcon className="h-4 w-4" />
                                                    {item.title}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </SidebarContent>
            </div>
        </Sidebar>
    );
}