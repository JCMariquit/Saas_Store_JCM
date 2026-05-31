import { Bell, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { MessageDrawer } from '@/components/drawers/message-drawer';
import { NotificationDrawer } from '@/components/drawers/notification-drawer';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { toggleSidebar } = useSidebar();

    const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
    const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

    const iconButtonClass =
        'group relative flex size-10 items-center justify-center rounded-[10px] text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent/70 hover:text-foreground';

    const iconWrapClass =
        'flex size-7 items-center justify-center rounded-[9px] bg-background/70 text-muted-foreground shadow-[0_1px_6px_rgba(0,0,0,0.04)] ring-1 ring-border/50 transition-colors group-hover:text-foreground';

    const iconClass = 'size-[16px]';

    return (
        <>
            <header className="jcm-app-header relative z-20 mx-4 mt-4 flex h-[68px] shrink-0 items-center justify-between rounded-[15px] border border-black/[0.08] dark:border-white/[0.10] bg-sidebar px-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.03] dark:ring-white/[0.04] backdrop-blur-md transition-all duration-300 group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 md:px-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="group size-10 rounded-[10px] text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent/70 hover:text-foreground"
                    >
                        <span className={iconWrapClass}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-current"
                            >
                                <path d="M4 6h16" />
                                <path d="M4 12h10" />
                                <path d="M4 18h16" />
                                <path d="M19 9l3 3-3 3" />
                            </svg>
                        </span>
                    </Button>

                    <div className="min-w-0">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMessageDrawerOpen(true)}
                                    className={iconButtonClass}
                                >
                                    <span className={iconWrapClass}>
                                        <MessageSquare className={`${iconClass} text-sky-500`} />
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Messages</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setNotificationDrawerOpen(true)}
                                    className={iconButtonClass}
                                >
                                    <span className={iconWrapClass}>
                                        <Bell className={`${iconClass} text-amber-500`} />
                                    </span>
                                    <span className="absolute right-[7px] top-[7px] size-2 rounded-full border-2 border-sidebar bg-amber-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Notifications</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div className="ml-1 rounded-[14px] bg-background/70 p-1 shadow-[0_1px_6px_rgba(0,0,0,0.04)] ring-1 ring-border/50">
                        <NavUser />
                    </div>
                </div>
            </header>

            <MessageDrawer
                open={messageDrawerOpen}
                onOpenChange={setMessageDrawerOpen}
            />

            <NotificationDrawer
                open={notificationDrawerOpen}
                onOpenChange={setNotificationDrawerOpen}
            />
        </>
    );
}