import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type UserThread = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    last_message?: string | null;
    unread_count?: number;
    last_message_at?: string | null;
};

type MessageItem = {
    id: number;
    user_id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    sender_type: 'user' | 'admin';
    is_read: number;
    created_at?: string | null;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function AdminMessageDrawer({ open, onOpenChange }: Props) {
    const [threads, setThreads] = useState<UserThread[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserThread | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [messageText, setMessageText] = useState('');

    const [loadingThreads, setLoadingThreads] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (open) {
            fetchThreads(1, false);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchThreads(nextPage = 1, append = false) {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoadingThreads(true);
        }

        try {
            const response = await axios.get(`/admin/messages?page=${nextPage}`);
            const newThreads = response.data.threads ?? [];

            setThreads((current) => {
                if (!append) return newThreads;

                const existingIds = new Set(current.map((item) => item.id));
                const uniqueNewThreads = newThreads.filter((item: UserThread) => !existingIds.has(item.id));

                return [...current, ...uniqueNewThreads];
            });

            setPage(response.data.current_page ?? nextPage);
            setHasMore(response.data.has_more ?? false);
        } catch (error) {
            console.error('Failed to fetch message threads:', error);
        } finally {
            setLoadingThreads(false);
            setLoadingMore(false);
        }
    }

    async function refreshCurrentPageThreads() {
        await fetchThreads(1, false);
    }

    async function openThread(user: UserThread) {
        setSelectedUser(user);
        setLoadingMessages(true);

        try {
            const response = await axios.get(`/admin/messages/${user.id}`);
            setMessages(response.data.messages ?? []);
            await refreshCurrentPageThreads();
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
        } finally {
            setLoadingMessages(false);
        }
    }

    async function sendReply() {
        if (!selectedUser || !messageText.trim() || sending) return;

        setSending(true);

        try {
            await axios.post(`/admin/messages/${selectedUser.id}/reply`, {
                message: messageText,
            });

            setMessageText('');
            await openThread(selectedUser);
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSending(false);
        }
    }

    function closeDrawer(value: boolean) {
        if (!value) {
            setSelectedUser(null);
            setMessages([]);
            setMessageText('');
            setThreads([]);
            setPage(1);
            setHasMore(false);
        }

        onOpenChange(value);
    }

    function initials(name: string) {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }

    function formatTime(date?: string | null) {
        if (!date) return '';

        return new Date(date).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <Sheet open={open} onOpenChange={closeDrawer}>
            <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-0 sm:max-w-lg">
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
                    <SheetHeader className="space-y-1 text-left">
                        <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-slate-950">
                            {selectedUser && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setMessages([]);
                                        refreshCurrentPageThreads();
                                    }}
                                    className="mr-1 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                            )}

                            <MessageCircle className="h-5 w-5 text-blue-700" />
                            {selectedUser ? selectedUser.name : 'User Messages'}
                        </SheetTitle>

                        <SheetDescription>
                            {selectedUser
                                ? 'Admin replies appear on the right. User messages appear on the left.'
                                : 'Click a user to open the conversation.'}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="px-6 py-5">
                    {!selectedUser && (
                        <div className="space-y-3">
                            {loadingThreads && (
                                <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                                    Loading messages...
                                </p>
                            )}

                            {!loadingThreads && threads.length === 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                        <MessageCircle className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-3 font-semibold text-slate-950">No user messages yet</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        When users send a message, their name will appear here.
                                    </p>
                                </div>
                            )}

                            {!loadingThreads &&
                                threads.map((user) => {
                                    const unread = (user.unread_count ?? 0) > 0;

                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => openThread(user)}
                                            className={`w-full rounded-2xl border p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40 ${
                                                unread
                                                    ? 'border-blue-200 bg-blue-50/70'
                                                    : 'border-slate-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold ${
                                                        unread
                                                            ? 'bg-blue-700 text-white'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="h-11 w-11 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        initials(user.name)
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h4
                                                                className={`truncate text-sm text-slate-950 ${
                                                                    unread ? 'font-bold' : 'font-medium'
                                                                }`}
                                                            >
                                                                {user.name}
                                                            </h4>

                                                            <p
                                                                className={`truncate text-xs ${
                                                                    unread
                                                                        ? 'font-semibold text-slate-600'
                                                                        : 'font-normal text-slate-400'
                                                                }`}
                                                            >
                                                                {user.email}
                                                            </p>
                                                        </div>

                                                        <div className="flex shrink-0 items-center gap-2">
                                                            {user.last_message_at && (
                                                                <span
                                                                    className={`text-xs ${
                                                                        unread
                                                                            ? 'font-semibold text-blue-700'
                                                                            : 'text-slate-400'
                                                                    }`}
                                                                >
                                                                    {formatTime(user.last_message_at)}
                                                                </span>
                                                            )}

                                                            {unread && (
                                                                <span className="h-2.5 w-2.5 rounded-full bg-blue-700 ring-2 ring-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                            {!loadingThreads && hasMore && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fetchThreads(page + 1, true)}
                                    disabled={loadingMore}
                                    className="h-11 w-full rounded-xl border-slate-200 bg-white font-semibold"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </Button>
                            )}
                        </div>
                    )}

                    {selectedUser && (
                        <div className="flex min-h-[calc(100vh-160px)] flex-col">
                            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 font-semibold text-white">
                                        {initials(selectedUser.name)}
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold text-slate-950">{selectedUser.name}</h3>
                                        <p className="truncate text-sm text-slate-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                {loadingMessages && (
                                    <p className="py-8 text-center text-sm text-slate-400">
                                        Loading conversation...
                                    </p>
                                )}

                                {!loadingMessages && messages.length === 0 && (
                                    <p className="py-8 text-center text-sm text-slate-400">
                                        No conversation yet.
                                    </p>
                                )}

                                {!loadingMessages &&
                                    messages.map((msg) => {
                                        const isAdmin = msg.sender_type === 'admin';

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                                                        isAdmin
                                                            ? 'rounded-br-md bg-blue-700 text-white'
                                                            : 'rounded-bl-md bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {msg.message}

                                                    <p
                                                        className={`mt-1 text-[11px] ${
                                                            isAdmin
                                                                ? 'text-right text-blue-100'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {isAdmin ? 'Admin' : selectedUser.name}
                                                        {msg.created_at ? ` • ${formatTime(msg.created_at)}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                <div ref={bottomRef} />
                            </div>

                            <div className="sticky bottom-0 mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                <div className="flex items-end gap-2">
                                    <textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendReply();
                                            }
                                        }}
                                        rows={1}
                                        placeholder="Reply as admin..."
                                        className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    <Button
                                        type="button"
                                        onClick={sendReply}
                                        disabled={sending || !messageText.trim()}
                                        className="h-11 rounded-xl bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}