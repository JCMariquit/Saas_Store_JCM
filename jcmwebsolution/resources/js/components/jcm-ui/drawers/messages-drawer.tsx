import axios from 'axios';
import {
    CheckCheck,
    Loader2,
    MessageCircle,
    Send,
    ShieldCheck,
} from 'lucide-react';
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
    is_read?: number;
    read_at?: string | null;
    created_at?: string | null;
};

export function MessagesDrawer({ open, onOpenChange }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [markingRead, setMarkingRead] = useState(false);

    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (open) {
            void fetchMessages(true);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchMessages(markAsRead = false) {
        setFetching(true);

        try {
            const res = await axios.get('/messages');
            const fetchedMessages = res.data.messages ?? [];

            setMessages(fetchedMessages);

            if (markAsRead) {
                await markMessagesAsRead();
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setFetching(false);
        }
    }

    async function markMessagesAsRead() {
        setMarkingRead(true);

        try {
            await axios.post('/messages/read-all');

            setMessages((current) =>
                current.map((message) =>
                    message.sender_type === 'admin'
                        ? {
                              ...message,
                              is_read: 1,
                              read_at: message.read_at ?? new Date().toISOString(),
                          }
                        : message,
                ),
            );

            window.dispatchEvent(new Event('message:refresh'));
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        } finally {
            setMarkingRead(false);
        }
    }

    async function send() {
        if (!text.trim() || loading) return;

        setLoading(true);

        try {
            await axios.post('/messages', { message: text.trim() });

            setText('');
            resetTextareaHeight();

            await fetchMessages(false);
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

    function formatDate(date?: string | null) {
        if (!date) return '';

        return new Date(date).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    function resizeTextarea() {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }

    function resetTextareaHeight() {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = '40px';
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-[#f4f7fb] p-0 sm:max-w-md"
            >
                <div className="shrink-0 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
                    <div className="relative px-5 pb-5 pt-4">
                        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute bottom-0 left-10 h-16 w-16 rounded-full bg-blue-300/10 blur-xl" />

                        <SheetHeader className="relative m-0 space-y-0 p-0 text-left">
                            <SheetTitle className="flex items-center justify-between text-white">
                                <span className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                        <MessageCircle className="h-5 w-5" />
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

                        <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs text-blue-50 ring-1 ring-white/15">
                            <ShieldCheck className="h-4 w-4 text-blue-100" />
                            <span>Admin support conversation</span>

                            {markingRead && (
                                <span className="ml-auto flex items-center gap-1 text-blue-100">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Reading
                                </span>
                            )}

                            {!markingRead && (
                                <span className="ml-auto flex items-center gap-1 text-blue-100">
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Synced
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {fetching && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>

                            <p className="mt-3 text-sm font-medium text-slate-500">
                                Loading messages...
                            </p>
                        </div>
                    )}

                    {!fetching && messages.length === 0 && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                <MessageCircle className="h-7 w-7" />
                            </div>

                            <h4 className="mt-4 font-semibold text-slate-900">
                                No messages yet
                            </h4>

                            <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">
                                Start your conversation with the admin. Your messages will appear here.
                            </p>
                        </div>
                    )}

                    {!fetching && messages.length > 0 && (
                        <div className="space-y-4">
                            {messages.map((m, index) => {
                                const isAdmin = m.sender_type === 'admin';
                                const previous = messages[index - 1];
                                const showDate =
                                    !previous ||
                                    formatDate(previous.created_at) !== formatDate(m.created_at);

                                return (
                                    <div key={m.id}>
                                        {showDate && (
                                            <div className="my-4 flex items-center justify-center">
                                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-400 shadow-sm">
                                                    {formatDate(m.created_at) || 'Today'}
                                                </span>
                                            </div>
                                        )}

                                        <div
                                            className={`flex items-end gap-2 ${
                                                isAdmin ? 'justify-start' : 'justify-end'
                                            }`}
                                        >
                                            {isAdmin && (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                                    <ShieldCheck className="h-4 w-4" />
                                                </div>
                                            )}

                                            <div
                                                className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                                                    isAdmin
                                                        ? 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                                                        : 'rounded-br-md bg-blue-700 text-white'
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words leading-6">
                                                    {m.message}
                                                </p>

                                                <div
                                                    className={`mt-2 flex items-center gap-1 text-[11px] ${
                                                        isAdmin
                                                            ? 'text-slate-400'
                                                            : 'justify-end text-blue-100'
                                                    }`}
                                                >
                                                    <span>{isAdmin ? 'Admin' : 'You'}</span>

                                                    {m.created_at && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{formatTime(m.created_at)}</span>
                                                        </>
                                                    )}

                                                    {!isAdmin && (
                                                        <>
                                                            <span>•</span>
                                                            <CheckCheck className="h-3.5 w-3.5" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-14px_30px_rgba(15,23,42,0.08)]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    resizeTextarea();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        void send();
                                    }
                                }}
                                rows={1}
                                placeholder="Type your message..."
                                className="max-h-[120px] min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                            />

                            <Button
                                type="button"
                                onClick={() => void send()}
                                disabled={loading || !text.trim()}
                                className="h-11 w-11 shrink-0 rounded-2xl bg-blue-700 p-0 text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        <p className="px-3 pb-1 pt-1 text-[11px] text-slate-400">
                            Press Enter to send, Shift + Enter for new line.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}