import { ArrowLeft, Bell, CheckCheck, Info, ShieldCheck, Sparkles } from 'lucide-react';
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

export function NotificationDrawer({
    open,
    onOpenChange,
}: NotificationDrawerProps) {
    const [selectedNotification, setSelectedNotification] =
        React.useState<Notification | null>(null);

    const currentNotification = selectedNotification;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-[380px] flex-col overflow-hidden p-0 sm:max-w-[420px]"
            >
                {!currentNotification ? (
                    <>
                        <SheetHeader className="border-b px-5 py-4 text-left">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <SheetTitle>Notifications</SheetTitle>
                                    <SheetDescription>
                                        Latest updates from your starter kit.
                                    </SheetDescription>
                                </div>

                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
                                    <Bell className="size-4" />
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {notifications.map((item) => {
                                    const Icon = getNotificationIcon(item.type);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedNotification(item)}
                                            className="group flex w-full gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-accent/40 hover:shadow-xs"
                                        >
                                            <div
                                                className={cn(
                                                    'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                                                    getNotificationStyle(item.type),
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {item.title}
                                                    </p>

                                                    <span className="shrink-0 text-[11px] text-muted-foreground">
                                                        {item.time}
                                                    </span>
                                                </div>

                                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {item.unread ? (
                                                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 border-b px-4 py-3">
                            <button
                                type="button"
                                onClick={() => setSelectedNotification(null)}
                                className="flex size-9 items-center justify-center rounded-xl border bg-background transition-colors hover:bg-muted"
                            >
                                <ArrowLeft className="size-4" />
                            </button>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                    Notification Details
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {currentNotification.time}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {(() => {
                                const Icon = getNotificationIcon(currentNotification.type);

                                return (
                                    <div className="space-y-5">
                                        <div
                                            className={cn(
                                                'flex size-12 items-center justify-center rounded-2xl border',
                                                getNotificationStyle(currentNotification.type),
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold tracking-tight">
                                                {currentNotification.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                {currentNotification.description}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-muted/20 p-4">
                                            <p className="text-sm leading-6 text-foreground">
                                                {currentNotification.details}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-card p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Time
                                            </p>
                                            <p className="mt-1 text-sm font-medium">
                                                {currentNotification.time}
                                            </p>
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