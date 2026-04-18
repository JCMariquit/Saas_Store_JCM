
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
    LayoutGrid,
    Users,
    CreditCard,
    Boxes,
    Layers3,
    FileBarChart2,
    ReceiptText,
    LifeBuoy,
    ChevronDown,
    FolderKanban,
    ShoppingCart,
    BarChart3,
    MonitorSmartphone,
    Globe,
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
            {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Management',
        icon: FolderKanban,
        items: [
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
        ],
    },
    {
        title: 'Sales',
        icon: ShoppingCart,
        items: [
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
        ],
    },
    {
        title: 'Website/System',
        icon: Globe,
        items: [
            {
                title: 'Website Builder',
                url: '#',
                icon: Globe,
            },
            {
                title: 'Manage Websites',
                url: '#',
                icon: MonitorSmartphone,
            },
        ],
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        items: [
            {
                title: 'Reports',
                url: '#',
                icon: FileBarChart2,
            },
        ],
    },
];

const footerNavItems = [
    {
        title: 'Support',
        url: '#',
        icon: LifeBuoy,
    },
];

export function AppSidebar() {
    const { url } = usePage();

    const initialOpenState = useMemo(() => {
        const state: Record<string, boolean> = {};

        menuGroups.forEach((group) => {
            state[group.title] = group.items.some((item) => url.startsWith(item.url));
        });

        return state;
    }, [url]);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenState);

    const toggleGroup = (groupTitle: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [groupTitle]: !prev[groupTitle],
        }));
    };

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

                <div className="space-y-2 px-2 py-2">
                    {menuGroups.map((group) => {
                        const GroupIcon = group.icon;
                        const isOpen = openGroups[group.title];

                        return (
                            <div key={group.title} className="rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(group.title)}
                                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <GroupIcon className="h-4 w-4 text-slate-500" />
                                        <span>{group.title}</span>
                                    </div>

                                    <ChevronDown
                                        className={`h-4 w-4 text-slate-400 transition-transform ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="mt-1 space-y-1 pl-2">
                                        {group.items.map((item) => {
                                            const ItemIcon = item.icon;
                                            const isActive =
                                                item.url !== '#'
                                                    ? url.startsWith(item.url)
                                                    : false;

                                            return (
                                                <Link
                                                    key={item.title}
                                                    href={item.url}
                                                    prefetch
                                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                                        isActive
                                                            ? 'bg-slate-900 text-white'
                                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                    }`}
                                                >
                                                    <ItemIcon
                                                        className={`h-4 w-4 ${
                                                            isActive ? 'text-white' : 'text-slate-500'
                                                        }`}
                                                    />
                                                    <span>{item.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </SidebarContent>

            <SidebarFooter>
                <div className="space-y-1 px-2 pb-2">
                    {footerNavItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.title}
                                href={item.url}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                <Icon className="h-4 w-4 text-slate-500" />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}