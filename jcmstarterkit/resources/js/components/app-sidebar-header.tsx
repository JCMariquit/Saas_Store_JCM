import { Bell, MessageSquare, Palette } from 'lucide-react';
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
        'relative flex size-10 items-center justify-center rounded-[6px] transition-colors duration-200 hover:bg-accent/50';

    const iconClass = 'size-[18px]';

    return (
        <>
            <header className="flex h-16 shrink-0 items-center justify-between px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div className="flex min-w-0 items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="-ml-1 size-9 rounded-[6px] text-muted-foreground transition-colors duration-200 hover:bg-accent/50 hover:text-foreground"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-foreground"
                        >
                            <path d="M4 6h16" />
                            <path d="M4 12h10" />
                            <path d="M4 18h16" />
                            <path d="M19 9l3 3-3 3" />
                        </svg>
                    </Button>

                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="flex items-center gap-1">
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
                                    <MessageSquare className={`${iconClass} text-sky-500`} />
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
                                    <Bell className={`${iconClass} text-amber-500`} />
                                    <span className="absolute right-[10px] top-[10px] size-1.5 rounded-full bg-amber-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Notifications</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className={iconButtonClass}>
                                    <Palette className={`${iconClass} text-violet-500`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Theme Settings</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div className="ml-1">
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