import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-white">
                Platform
            </SidebarGroupLabel>

            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        size="lg"
                        asChild
                        className="hover:bg-transparent focus:bg-transparent active:bg-transparent data-[active]:bg-transparent text-white hover:text-white focus:text-white active:text-white"
                    >
                        <Link href="/dashboard" className="text-white hover:text-white focus:text-white active:text-white">
                            
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}