import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavFooter({
    items,
    className = '',
}: {
    items: NavItem[];
    className?: string;
}) {
    return (
        <SidebarGroup className={`p-0 ${className}`}>
            <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className="h-10 rounded-2xl px-3 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                                >
                                    <Link href={item.url} className="flex items-center gap-3">
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