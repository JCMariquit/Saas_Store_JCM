import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Bell, MessageCircle } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="flex h-16 items-center justify-between bg-[#9f0028] px-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="text-white hover:bg-white/10 hover:text-white" />

                <div className="min-w-0 text-white [&_*]:text-white">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button type="button" className="relative hover:opacity-80">
                    <MessageCircle className="h-5 w-5" />
                </button>

                <button type="button" className="relative hover:opacity-80">
                    <Bell className="h-5 w-5" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2 hover:opacity-80"
                        >
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/20 text-xs font-bold">
                                {auth.user.name?.charAt(0)}
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}