import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const logout = () => {
        router.post(route('logout'));
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="bg-[#263f47] text-white hover:bg-[#314d56] hover:text-white data-[state=open]:bg-[#314d56] data-[state=open]:text-white"
                        >
                            <Avatar className="h-8 w-8 rounded-full">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-full bg-[#9f0028] text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-white">
                                    {auth.user.name}
                                </span>
                                <span className="truncate text-xs text-slate-300">
                                    {auth.user.email}
                                </span>
                            </div>

                            <ChevronsUpDown className="ml-auto size-4 text-slate-300" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border border-white/10 bg-[#1f2f35] p-1 text-white shadow-xl"
                        align="end"
                        side="top"
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 rounded-lg bg-[#263f47] px-3 py-3 text-left text-sm">
                                <Avatar className="h-9 w-9 rounded-full">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="rounded-full bg-[#9f0028] text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-white">
                                        {auth.user.name}
                                    </span>
                                    <span className="truncate text-xs text-slate-300">
                                        {auth.user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator className="my-1 bg-white/10" />

                        <DropdownMenuItem
                            asChild
                            className="cursor-pointer rounded-lg text-white hover:bg-[#263f47] hover:text-white focus:bg-[#263f47] focus:text-white"
                        >
                            <Link href="/settings/profile">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 bg-white/10" />

                        <DropdownMenuItem
                            onClick={logout}
                            className="cursor-pointer rounded-lg text-white hover:bg-[#9f0028] hover:text-white focus:bg-[#9f0028] focus:text-white"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}