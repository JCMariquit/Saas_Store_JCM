import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
}

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            tooltip={user.name}
                            aria-label="Open user menu"
                            className={[
                                'size-10 rounded-[10px] p-1',
                                'text-sidebar-accent-foreground',
                                'transition-all duration-200',
                                'hover:bg-sidebar-accent/70',
                                'data-[state=open]:bg-sidebar-accent',
                            ].join(' ')}
                        >
                            <Avatar className="size-8 rounded-[9px]">
                                <AvatarImage
                                    src={user.avatar ?? undefined}
                                    alt={user.name}
                                />

                                <AvatarFallback className="rounded-[9px] bg-primary/10 text-xs font-semibold text-primary">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>

                            <span className="sr-only">
                                Open user menu
                            </span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="min-w-64 rounded-xl p-1.5"
                        align="end"
                        side="bottom"
                        sideOffset={8}
                    >
                        <UserMenuContent user={user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}