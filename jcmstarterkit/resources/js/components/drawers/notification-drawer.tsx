import { CheckCheck } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type NotificationDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const notifications = [
    {
        title: 'Starter Kit Initialized',
        description: 'Your JCM base layout is now active.',
        time: 'Today',
    },
    {
        title: 'Development Marker Enabled',
        description: 'Pending pages are marked with dev icons.',
        time: 'Today',
    },
    {
        title: 'Sidebar Updated',
        description: 'Footer, hidden scrollbar, and accordion behavior added.',
        time: 'Recently',
    },
];

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[380px] overflow-y-auto p-0 sm:max-w-[420px]">
                <SheetHeader className="border-b px-5 py-4 text-left">
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription>Latest updates from your starter kit.</SheetDescription>
                </SheetHeader>

                <div className="space-y-2 p-4">
                    {notifications.map((item) => (
                        <div
                            key={`${item.title}-${item.time}`}
                            className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
                        >
                            <div className="flex gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                    <CheckCheck className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                        <span className="shrink-0 text-[11px] text-muted-foreground">{item.time}</span>
                                    </div>

                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}