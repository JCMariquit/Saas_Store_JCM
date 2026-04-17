import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup className="p-0">
            <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    {items.map((item) => {
                        const isActive =
                            page.url === item.url || page.url.startsWith(`${item.url}/`);
                        const Icon = item.icon;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: item.title }}
                                    className={`h-11 rounded-2xl px-3 transition ${
                                        isActive
                                            ? 'bg-sky-50 text-sky-700 shadow-sm dark:bg-sky-950/40 dark:text-sky-300'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                                    }`}
                                >
                                    <Link href={item.url} prefetch className="flex items-center gap-3">
                                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                        <span className="truncate text-sm font-medium">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}