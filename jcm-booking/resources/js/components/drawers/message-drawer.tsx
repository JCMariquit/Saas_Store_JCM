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
            {
                id: 1,
                from: 'contact',
                text: 'Welcome to your starter kit workspace.',
                time: '09:12 AM',
            },
            {
                id: 2,
                from: 'contact',
                text: 'Your dashboard modules are ready for configuration.',
                time: '09:13 AM',
            },
            {
                id: 3,
                from: 'user',
                text: 'Nice. I will check the modules today.',
                time: '09:15 AM',
            },
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
            {
                id: 1,
                from: 'contact',
                text: 'Appointment UI is ready for development.',
                time: '09:05 AM',
            },
            {
                id: 2,
                from: 'user',
                text: 'Okay, I will connect the booking workflow next.',
                time: '09:07 AM',
            },
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
            {
                id: 1,
                from: 'contact',
                text: 'Cashier screen is marked as pending.',
                time: '08:58 AM',
            },
            {
                id: 2,
                from: 'user',
                text: 'Got it. I will prioritize the booking module first.',
                time: '09:00 AM',
            },
        ],
    },
];

function statusClass(status: Person['status']) {
    if (status === 'online') return 'bg-emerald-500';
    if (status === 'away') return 'bg-amber-500';

    return 'bg-zinc-400';
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
                className="flex w-[390px] flex-col overflow-hidden p-0 sm:max-w-[440px]"
            >
                {!currentPerson ? (
                    <>
                        <SheetHeader className="border-b px-5 py-4 text-left">
                            <SheetTitle>Messages</SheetTitle>
                            <SheetDescription>
                                Recent system and module conversations.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="border-b p-4">
                            <div className="flex h-10 items-center gap-2 rounded-xl border bg-muted/30 px-3">
                                <Search className="size-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="space-y-2">
                                {people.map((person) => (
                                    <button
                                        key={person.id}
                                        type="button"
                                        onClick={() => setSelectedPerson(person)}
                                        className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-accent/40 hover:shadow-xs"
                                    >
                                        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full border bg-muted/40 text-sm font-semibold">
                                            {person.avatar}

                                            <span
                                                className={cn(
                                                    'absolute right-0 bottom-0 size-3 rounded-full border-2 border-background',
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

                                                <span className="shrink-0 text-[11px] text-muted-foreground">
                                                    {person.time}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center justify-between gap-3">
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {person.lastMessage}
                                                </p>

                                                {person.unread ? (
                                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
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
                        <div className="flex items-center gap-3 border-b px-4 py-3">
                            <button
                                type="button"
                                onClick={() => setSelectedPerson(null)}
                                className="flex size-9 items-center justify-center rounded-xl border bg-background transition-colors hover:bg-muted"
                            >
                                <ArrowLeft className="size-4" />
                            </button>

                            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted/40 text-sm font-semibold">
                                {currentPerson.avatar}

                                <span
                                    className={cn(
                                        'absolute right-0 bottom-0 size-3 rounded-full border-2 border-background',
                                        statusClass(currentPerson.status),
                                    )}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                    {currentPerson.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {currentPerson.role}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 p-4">
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
                                            'max-w-[78%] rounded-2xl px-4 py-2.5 shadow-xs',
                                            chat.from === 'user'
                                                ? 'rounded-br-md bg-primary text-primary-foreground'
                                                : 'rounded-bl-md border bg-card text-foreground',
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

                        <div className="border-t bg-background p-4">
                            <div className="flex items-end gap-2 rounded-2xl border bg-muted/20 p-2">
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    placeholder="Type a message..."
                                    rows={1}
                                    className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                                />

                                <button
                                    type="button"
                                    onClick={handleSend}
                                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
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