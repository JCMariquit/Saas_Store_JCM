import { MessageSquare } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type MessageDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const messages = [
    {
        name: 'JCM System',
        message: 'Welcome to your starter kit workspace.',
        time: 'Just now',
    },
    {
        name: 'Booking Module',
        message: 'Appointment UI is ready for development.',
        time: '5 mins ago',
    },
    {
        name: 'POS Module',
        message: 'Cashier screen is marked as pending.',
        time: '12 mins ago',
    },
];

export function MessageDrawer({ open, onOpenChange }: MessageDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[380px] overflow-y-auto p-0 sm:max-w-[420px]">
                <SheetHeader className="border-b px-5 py-4 text-left">
                    <SheetTitle>Messages</SheetTitle>
                    <SheetDescription>Recent system and module messages.</SheetDescription>
                </SheetHeader>

                <div className="space-y-2 p-4">
                    {messages.map((item) => (
                        <div
                            key={`${item.name}-${item.time}`}
                            className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
                        >
                            <div className="flex gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                                    <MessageSquare className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                        <span className="shrink-0 text-[11px] text-muted-foreground">{item.time}</span>
                                    </div>

                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}