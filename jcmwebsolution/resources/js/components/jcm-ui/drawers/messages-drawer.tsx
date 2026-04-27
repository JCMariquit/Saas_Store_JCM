import axios from 'axios';
import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Message = {
    id: number;
    message: string;
    sender_type: 'user' | 'admin';
    created_at?: string | null;
};

export function MessagesDrawer({ open, onOpenChange }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (open) void fetchMessages();
    }, [open]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchMessages() {
        setFetching(true);

        try {
            const res = await axios.get('/messages');
            setMessages(res.data.messages ?? []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setFetching(false);
        }
    }

    async function send() {
        if (!text.trim() || loading) return;

        setLoading(true);

        try {
            await axios.post('/messages', { message: text });
            setText('');
            await fetchMessages();
            window.dispatchEvent(new Event('message:refresh'));
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatTime(date?: string | null) {
        if (!date) return '';

        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-[#f6f8fb] p-0 sm:max-w-md"
            >
                <div className="shrink-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-5 pb-3 pt-4 text-white">
                    <SheetHeader className="m-0 space-y-0 p-0 text-left">
                        <SheetTitle className="flex items-center justify-between text-white">
                            <span className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                                    <MessageCircle className="h-4.5 w-4.5" />
                                </span>

                                <span>
                                    <span className="block text-base font-semibold leading-tight">
                                        Messages
                                    </span>
                                    <span className="mt-0.5 block text-xs font-normal text-blue-100">
                                        Direct conversation with admin
                                    </span>
                                </span>
                            </span>

                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50 ring-1 ring-white/15">
                                {messages.length}
                            </span>
                        </SheetTitle>

                        <SheetDescription className="sr-only">
                            Send your inquiry directly to the admin.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {fetching && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
                            Loading messages...
                        </div>
                    )}

                    {!fetching && messages.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                <MessageCircle className="h-6 w-6" />
                            </div>

                            <h4 className="mt-3 font-semibold text-slate-900">
                                No messages yet
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Start your conversation with the admin.
                            </p>
                        </div>
                    )}

                    {!fetching && messages.length > 0 && (
                        <div className="space-y-3">
                            {messages.map((m) => {
                                const isAdmin = m.sender_type === 'admin';

                                return (
                                    <div
                                        key={m.id}
                                        className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                                isAdmin
                                                    ? 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                                                    : 'rounded-br-md bg-blue-700 text-white'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words leading-6">
                                                {m.message}
                                            </p>

                                            <p
                                                className={`mt-1 text-[11px] ${
                                                    isAdmin
                                                        ? 'text-slate-400'
                                                        : 'text-right text-blue-100'
                                                }`}
                                            >
                                                {isAdmin ? 'Admin' : 'You'}
                                                {m.created_at ? ` • ${formatTime(m.created_at)}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-14px_30px_rgba(15,23,42,0.08)]">
                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    void send();
                                }
                            }}
                            rows={1}
                            placeholder="Type your message..."
                            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />

                        <Button
                            type="button"
                            onClick={() => void send()}
                            disabled={loading || !text.trim()}
                            className="h-10 w-10 shrink-0 rounded-xl bg-blue-700 p-0 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}