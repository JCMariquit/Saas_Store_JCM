import { AdminMessageDrawer } from '@/components/admin-ui/admin-message-drawer';
import { AdminNotificationDrawer } from '@/components/admin-ui/admin-notification-drawer';
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
import { useState } from 'react';

type ActiveDrawer = 'messages' | 'notifications' | null;

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null);

    return (
        <>
            <header className="flex h-16 items-center justify-between bg-[#9f0028] px-4 text-white">
                <div className="flex min-w-0 items-center gap-3">
                    <SidebarTrigger className="text-white hover:bg-white/10 hover:text-white" />

                    <div className="min-w-0 text-white [&_*]:text-white">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setActiveDrawer('messages')}
                        className="relative rounded-md p-2 hover:bg-white/10"
                    >
                        <MessageCircle className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDrawer('notifications')}
                        className="relative rounded-md p-2 hover:bg-white/10"
                    >
                        <Bell className="h-5 w-5" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold hover:bg-white/30"
                            >
                                {auth.user.name?.charAt(0)}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <AdminMessageDrawer
                open={activeDrawer === 'messages'}
                onOpenChange={(open) => {
                    if (!open) setActiveDrawer(null);
                }}
            />

            <AdminNotificationDrawer
                open={activeDrawer === 'notifications'}
                onOpenChange={(open) => {
                    if (!open) setActiveDrawer(null);
                }}
            />
        </>
    );
}