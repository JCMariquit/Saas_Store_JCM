import { ArrowLeft, Search, Send } from 'lucide-react';
import * as React from 'react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import { cn } from '@/lib/utils';

type MessageDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Message = {
    id: number;
    from: 'user' | 'contact';
    text: string;
    time: string;
};

type Person = {
    id: number;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'away' | 'offline';
    lastMessage: string;
    time: string;
    unread?: number;
    messages: Message[];
};

const people: Person[] = [
    {
        id: 1,
        name: 'JCM System',
        role: 'System Bot',
        avatar: 'JS',
        status: 'online',
        lastMessage: 'Welcome to your starter kit workspace.',
        time: 'Just now',
        unread: 2,
        messages: [
            { id: 1, from: 'contact', text: 'Welcome to your starter kit workspace.', time: '09:12 AM' },
            { id: 2, from: 'contact', text: 'Your dashboard modules are ready for configuration.', time: '09:13 AM' },
            { id: 3, from: 'user', text: 'Nice. I will check the modules today.', time: '09:15 AM' },
        ],
    },
    {
        id: 2,
        name: 'Booking Module',
        role: 'Product Module',
        avatar: 'BM',
        status: 'away',
        lastMessage: 'Appointment UI is ready for development.',
        time: '5 mins ago',
        messages: [
            { id: 1, from: 'contact', text: 'Appointment UI is ready for development.', time: '09:05 AM' },
            { id: 2, from: 'user', text: 'Okay, I will connect the booking workflow next.', time: '09:07 AM' },
        ],
    },
    {
        id: 3,
        name: 'POS Module',
        role: 'Product Module',
        avatar: 'PM',
        status: 'offline',
        lastMessage: 'Cashier screen is marked as pending.',
        time: '12 mins ago',
        unread: 1,
        messages: [
            { id: 1, from: 'contact', text: 'Cashier screen is marked as pending.', time: '08:58 AM' },
            { id: 2, from: 'user', text: 'Got it. I will prioritize the booking module first.', time: '09:00 AM' },
        ],
    },
];

function statusClass(status: Person['status']) {
    if (status === 'online') return 'bg-emerald-500';
    if (status === 'away') return 'bg-amber-500';

    return 'bg-zinc-400';
}

function statusLabel(status: Person['status']) {
    if (status === 'online') return 'Online';
    if (status === 'away') return 'Away';

    return 'Offline';
}

export function MessageDrawer({ open, onOpenChange }: MessageDrawerProps) {
    const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null);
    const [message, setMessage] = React.useState('');

    const currentPerson = selectedPerson;

    function handleSend() {
        if (!message.trim()) return;
        setMessage('');
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-[430px] flex-col overflow-hidden border-l border-border/70 bg-sidebar p-0 shadow-2xl sm:max-w-[480px]"
            >
                {!currentPerson ? (
                    <>
                        <SheetHeader className="border-b border-border/60 px-5 py-5 text-left">
                            <div className="flex items-start justify-between gap-5">
                                <div className="min-w-0 flex-1 pt-1">
                                    <SheetTitle className="text-base font-bold tracking-tight">
                                        Messages
                                    </SheetTitle>
                                    <SheetDescription className="mt-1 max-w-[190px] text-xs leading-5">
                                        Recent conversations.
                                    </SheetDescription>
                                </div>

                                <div className="flex h-10 w-[205px] shrink-0 items-center gap-2 rounded-[14px] border border-border/60 bg-background px-3 shadow-sm">
                                    <Search className="size-4 shrink-0 text-muted-foreground/70" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/65"
                                    />
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto px-4 py-5">
                            <div className="space-y-2">
                                {people.map((person) => (
                                    <button
                                        key={person.id}
                                        type="button"
                                        onClick={() => setSelectedPerson(person)}
                                        className="group flex w-full items-center gap-3 rounded-[16px] border border-transparent bg-transparent p-3 text-left transition-all duration-200 hover:border-border/70 hover:bg-background hover:shadow-sm"
                                    >
                                        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-border/60 bg-background text-xs font-bold text-foreground shadow-sm">
                                            {person.avatar}

                                            <span
                                                className={cn(
                                                    'absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-sidebar',
                                                    statusClass(person.status),
                                                )}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {person.name}
                                                    </p>
                                                    <p className="truncate text-[11px] text-muted-foreground">
                                                        {person.role}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-[10px] font-medium text-muted-foreground/70">
                                                    {person.time}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center justify-between gap-3">
                                                <p className="truncate text-[13px] leading-5 text-muted-foreground">
                                                    {person.lastMessage}
                                                </p>

                                                {person.unread ? (
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                                                        {person.unread}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 border-b border-border/60 bg-sidebar px-4 py-4">
                            <button
                                type="button"
                                onClick={() => setSelectedPerson(null)}
                                className="flex size-10 items-center justify-center rounded-[12px] border border-border/60 bg-background text-muted-foreground shadow-sm transition-all hover:bg-sidebar-accent hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                            </button>

                            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-border/60 bg-background text-xs font-bold shadow-sm">
                                {currentPerson.avatar}

                                <span
                                    className={cn(
                                        'absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-sidebar',
                                        statusClass(currentPerson.status),
                                    )}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">
                                    {currentPerson.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                    <span
                                        className={cn(
                                            'size-1.5 rounded-full',
                                            statusClass(currentPerson.status),
                                        )}
                                    />
                                    <p className="truncate text-xs text-muted-foreground">
                                        {currentPerson.role} · {statusLabel(currentPerson.status)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto bg-background/55 px-4 py-5">
                            {currentPerson.messages.map((chat) => (
                                <div
                                    key={chat.id}
                                    className={cn(
                                        'flex',
                                        chat.from === 'user' ? 'justify-end' : 'justify-start',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[78%] rounded-[18px] px-4 py-2.5 shadow-sm',
                                            chat.from === 'user'
                                                ? 'rounded-br-[6px] bg-primary text-primary-foreground'
                                                : 'rounded-bl-[6px] border border-border/60 bg-sidebar text-foreground',
                                        )}
                                    >
                                        <p className="text-sm leading-5">{chat.text}</p>
                                        <p
                                            className={cn(
                                                'mt-1 text-[10px]',
                                                chat.from === 'user'
                                                    ? 'text-primary-foreground/70'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {chat.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border/60 bg-sidebar p-4">
                            <div className="flex items-end gap-2 rounded-[18px] border border-border/60 bg-background p-2 shadow-sm">
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    placeholder="Type a message..."
                                    rows={1}
                                    className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/65"
                                />

                                <button
                                    type="button"
                                    onClick={handleSend}
                                    className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                                >
                                    <Send className="size-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}