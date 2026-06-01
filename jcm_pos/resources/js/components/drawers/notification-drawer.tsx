import {
    ArrowLeft,
    Bell,
    CheckCheck,
    Info,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import * as React from 'react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import { cn } from '@/lib/utils';

type NotificationDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Notification = {
    id: number;
    title: string;
    description: string;
    details: string;
    time: string;
    type: 'success' | 'info' | 'system' | 'security';
    unread?: boolean;
};

const notifications: Notification[] = [
    {
        id: 1,
        title: 'Starter Kit Initialized',
        description: 'Your JCM base layout is now active.',
        details:
            'The starter kit layout has been successfully initialized. Your sidebar, header, theme structure, and base workspace are now connected and ready for module development.',
        time: 'Today',
        type: 'success',
        unread: true,
    },
    {
        id: 2,
        title: 'Development Marker Enabled',
        description: 'Pending pages are marked with dev icons.',
        details:
            'Development markers are now enabled across pending pages. This helps identify unfinished sections while keeping the UI organized during active development.',
        time: 'Today',
        type: 'info',
        unread: true,
    },
    {
        id: 3,
        title: 'Sidebar Updated',
        description: 'Footer, hidden scrollbar, and accordion behavior added.',
        details:
            'The sidebar has been updated with footer content, cleaner scrolling behavior, submenu handling, and improved spacing for a more enterprise-level navigation experience.',
        time: 'Recently',
        type: 'system',
    },
    {
        id: 4,
        title: 'Security Layout Ready',
        description: 'Protected pages are now using verified route groups.',
        details:
            'Authenticated and verified routes are now grouped properly. This keeps dashboard and starter pages protected while maintaining cleaner Laravel route organization.',
        time: 'Recently',
        type: 'security',
    },
];

function getNotificationIcon(type: Notification['type']) {
    if (type === 'success') return CheckCheck;
    if (type === 'info') return Info;
    if (type === 'security') return ShieldCheck;

    return Sparkles;
}

function getNotificationStyle(type: Notification['type']) {
    if (type === 'success') {
        return 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }

    if (type === 'info') {
        return 'border-blue-500/15 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }

    if (type === 'security') {
        return 'border-violet-500/15 bg-violet-500/10 text-violet-600 dark:text-violet-400';
    }

    return 'border-amber-500/15 bg-amber-500/10 text-amber-600 dark:text-amber-400';
}

function getNotificationLabel(type: Notification['type']) {
    if (type === 'success') return 'Success';
    if (type === 'info') return 'Info';
    if (type === 'security') return 'Security';

    return 'System';
}

export function NotificationDrawer({
    open,
    onOpenChange,
}: NotificationDrawerProps) {
    const [selectedNotification, setSelectedNotification] =
        React.useState<Notification | null>(null);

    const currentNotification = selectedNotification;
    const unreadCount = notifications.filter((item) => item.unread).length;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-[430px] flex-col overflow-hidden border-l border-border/70 bg-sidebar p-0 shadow-2xl sm:max-w-[480px]"
            >
                {!currentNotification ? (
                    <>
                        <SheetHeader className="border-b border-border/60 px-5 py-5 text-left">
                            <div className="flex items-start justify-between gap-5">
                                <div className="min-w-0 flex-1">
                                    <SheetTitle className="text-base font-bold tracking-tight">
                                        Notifications
                                    </SheetTitle>
                                    <SheetDescription className="mt-1 text-xs leading-5">
                                        Recent activity.
                                    </SheetDescription>
                                </div>

                                <div className="flex items-center gap-2 rounded-[14px] border border-border/60 bg-background px-3 py-2 shadow-sm">
                                    <Bell className="size-4 text-amber-500" />
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {unreadCount} unread
                                    </span>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto px-4 py-5">
                            <div className="space-y-2">
                                {notifications.map((item) => {
                                    const Icon = getNotificationIcon(item.type);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedNotification(item)
                                            }
                                            className={cn(
                                                'group relative flex w-full gap-3 rounded-[16px] border border-transparent bg-transparent p-3 text-left transition-all duration-200',
                                                'hover:border-border/70 hover:bg-background hover:shadow-sm',
                                                item.unread &&
                                                    'before:absolute before:left-0 before:top-1/2 before:h-8 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-primary',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex size-11 shrink-0 items-center justify-center rounded-[14px] border shadow-sm',
                                                    getNotificationStyle(
                                                        item.type,
                                                    ),
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                            {item.title}
                                                        </p>
                                                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                                                            {getNotificationLabel(
                                                                item.type,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <span className="text-[10px] font-medium text-muted-foreground/70">
                                                            {item.time}
                                                        </span>

                                                        {item.unread ? (
                                                            <span className="size-2 rounded-full bg-primary" />
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 border-b border-border/60 bg-sidebar px-4 py-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedNotification(null)
                                }
                                className="flex size-10 items-center justify-center rounded-[12px] border border-border/60 bg-background text-muted-foreground shadow-sm transition-all hover:bg-sidebar-accent hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                            </button>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">
                                    Notification Details
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {currentNotification.time}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-background/55 px-5 py-5">
                            {(() => {
                                const Icon = getNotificationIcon(
                                    currentNotification.type,
                                );

                                return (
                                    <div className="space-y-5">
                                        <div className="rounded-[22px] border border-border/60 bg-sidebar p-5 shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={cn(
                                                        'flex size-12 shrink-0 items-center justify-center rounded-[16px] border shadow-sm',
                                                        getNotificationStyle(
                                                            currentNotification.type,
                                                        ),
                                                    )}
                                                >
                                                    <Icon className="size-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                                            {getNotificationLabel(
                                                                currentNotification.type,
                                                            )}
                                                        </span>

                                                        {currentNotification.unread ? (
                                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                                New
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <h3 className="mt-3 text-lg font-bold tracking-tight text-foreground">
                                                        {
                                                            currentNotification.title
                                                        }
                                                    </h3>

                                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                        {
                                                            currentNotification.description
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-[22px] border border-border/60 bg-sidebar p-5 shadow-sm">
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
                                                Details
                                            </p>

                                            <p className="mt-3 text-sm leading-6 text-foreground/85">
                                                {currentNotification.details}
                                            </p>
                                        </div>

                                        <div className="rounded-[18px] border border-border/60 bg-sidebar px-4 py-3 shadow-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-[11px] font-semibold text-muted-foreground">
                                                        Time
                                                    </p>
                                                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                                                        {
                                                            currentNotification.time
                                                        }
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm ring-1 ring-border/60">
                                                    <Bell className="size-3.5 text-amber-500" />
                                                    Activity log
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}