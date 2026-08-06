import axios from 'axios';
import {
    ArrowLeft,
    CheckCheck,
    Loader2,
    MessageCircle,
    RefreshCw,
    Search,
    Send,
    UserRound,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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

function isCancelled(error: unknown) {
    return axios.isCancel(error) ||
        (error instanceof Error && error.name === 'CanceledError');
}

export function AdminMessageDrawer({
    open,
    onOpenChange,
}: Props) {
    const [threads, setThreads] = useState<UserThread[]>([]);
    const [selectedUser, setSelectedUser] =
        useState<UserThread | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [messageText, setMessageText] = useState('');
    const [search, setSearch] = useState('');

    const [loadingThreads, setLoadingThreads] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const [threadError, setThreadError] =
        useState<string | null>(null);
    const [conversationError, setConversationError] =
        useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const threadsAbortRef = useRef<AbortController | null>(null);
    const messagesAbortRef = useRef<AbortController | null>(null);
    const conversationCacheRef = useRef(
        new Map<number, MessageItem[]>(),
    );

    const filteredThreads = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return threads;

        return threads.filter((thread) =>
            [thread.name, thread.email, thread.last_message]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query),
                ),
        );
    }, [search, threads]);

    const unreadTotal = useMemo(
        () =>
            threads.reduce(
                (total, thread) =>
                    total + (thread.unread_count ?? 0),
                0,
            ),
        [threads],
    );

    const scrollToBottom = useCallback(
        (behavior: ScrollBehavior = 'auto') => {
            window.requestAnimationFrame(() => {
                bottomRef.current?.scrollIntoView({
                    behavior,
                    block: 'end',
                });
            });
        },
        [],
    );

    const fetchThreads = useCallback(
        async (nextPage = 1, append = false) => {
            threadsAbortRef.current?.abort();

            const controller = new AbortController();
            threadsAbortRef.current = controller;

            if (append) {
                setLoadingMore(true);
            } else {
                setLoadingThreads(true);
                setThreadError(null);
            }

            try {
                const response = await axios.get(
                    `/admin/messages?page=${nextPage}`,
                    { signal: controller.signal },
                );

                const newThreads: UserThread[] =
                    response.data.threads ?? [];

                setThreads((current) => {
                    if (!append) return newThreads;

                    const existingIds = new Set(
                        current.map((item) => item.id),
                    );

                    const uniqueNewThreads = newThreads.filter(
                        (item) => !existingIds.has(item.id),
                    );

                    return [...current, ...uniqueNewThreads];
                });

                setPage(
                    response.data.current_page ?? nextPage,
                );
                setHasMore(response.data.has_more ?? false);
            } catch (error) {
                if (isCancelled(error)) return;

                console.error(
                    'Failed to fetch message threads:',
                    error,
                );

                if (!append) {
                    setThreadError(
                        'Unable to load message threads.',
                    );
                }
            } finally {
                if (
                    threadsAbortRef.current === controller
                ) {
                    setLoadingThreads(false);
                    setLoadingMore(false);
                }
            }
        },
        [],
    );

    const fetchConversation = useCallback(
        async (
            user: UserThread,
            useCachedMessages = true,
        ) => {
            messagesAbortRef.current?.abort();

            const cached =
                conversationCacheRef.current.get(user.id);

            if (useCachedMessages && cached) {
                setMessages(cached);
                setLoadingMessages(false);
            } else {
                setLoadingMessages(true);
            }

            setConversationError(null);

            const controller = new AbortController();
            messagesAbortRef.current = controller;

            try {
                const response = await axios.get(
                    `/admin/messages/${user.id}`,
                    { signal: controller.signal },
                );

                const fetchedMessages: MessageItem[] =
                    response.data.messages ?? [];

                conversationCacheRef.current.set(
                    user.id,
                    fetchedMessages,
                );

                setMessages(fetchedMessages);

                setThreads((current) =>
                    current.map((thread) =>
                        thread.id === user.id
                            ? {
                                  ...thread,
                                  unread_count: 0,
                              }
                            : thread,
                    ),
                );
            } catch (error) {
                if (isCancelled(error)) return;

                console.error(
                    'Failed to fetch conversation:',
                    error,
                );

                setConversationError(
                    'Unable to load this conversation.',
                );
            } finally {
                if (
                    messagesAbortRef.current === controller
                ) {
                    setLoadingMessages(false);
                    scrollToBottom('auto');
                }
            }
        },
        [scrollToBottom],
    );

    useEffect(() => {
        if (!open) return;

        void fetchThreads(1, false);

        return () => {
            threadsAbortRef.current?.abort();
            messagesAbortRef.current?.abort();
        };
    }, [fetchThreads, open]);

    useEffect(() => {
        if (!selectedUser) return;

        scrollToBottom('auto');
    }, [messages, scrollToBottom, selectedUser]);

    const openThread = useCallback(
        (user: UserThread) => {
            setSelectedUser(user);
            setMessageText('');
            setConversationError(null);

            void fetchConversation(user, true);
        },
        [fetchConversation],
    );

    const closeConversation = useCallback(() => {
        messagesAbortRef.current?.abort();
        setSelectedUser(null);
        setMessages([]);
        setMessageText('');
        setConversationError(null);
        setTimeout(() => {
            document
                .querySelector<HTMLInputElement>(
                    '[data-message-search]',
                )
                ?.focus();
        }, 50);
    }, []);

    async function sendReply() {
        if (
            !selectedUser ||
            !messageText.trim() ||
            sending
        ) {
            return;
        }

        const text = messageText.trim();
        const optimisticId = -Date.now();
        const optimisticMessage: MessageItem = {
            id: optimisticId,
            user_id: selectedUser.id,
            sender_id: 0,
            receiver_id: selectedUser.id,
            message: text,
            sender_type: 'admin',
            is_read: 0,
            created_at: new Date().toISOString(),
        };

        setSending(true);
        setConversationError(null);
        setMessageText('');
        resetTextareaHeight();

        setMessages((current) => [
            ...current,
            optimisticMessage,
        ]);

        setThreads((current) =>
            current.map((thread) =>
                thread.id === selectedUser.id
                    ? {
                          ...thread,
                          last_message: text,
                          last_message_at:
                              optimisticMessage.created_at,
                      }
                    : thread,
            ),
        );

        scrollToBottom('smooth');

        try {
            await axios.post(
                `/admin/messages/${selectedUser.id}/reply`,
                { message: text },
            );

            await fetchConversation(selectedUser, false);
        } catch (error) {
            console.error('Failed to send reply:', error);

            setMessages((current) =>
                current.filter(
                    (message) =>
                        message.id !== optimisticId,
                ),
            );
            setMessageText(text);
            setConversationError(
                'Reply was not sent. Please try again.',
            );
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    }

    function closeDrawer(value: boolean) {
        if (!value) {
            threadsAbortRef.current?.abort();
            messagesAbortRef.current?.abort();

            setSelectedUser(null);
            setMessages([]);
            setMessageText('');
            setSearch('');
            setThreads([]);
            setPage(1);
            setHasMore(false);
            setThreadError(null);
            setConversationError(null);
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

    function formatMessageTime(date?: string | null) {
        if (!date) return '';

        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function resizeTextarea() {
        const textarea = textareaRef.current;

        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(
            textarea.scrollHeight,
            120,
        )}px`;
    }

    function resetTextareaHeight() {
        if (!textareaRef.current) return;

        textareaRef.current.style.height = '44px';
    }

    return (
        <Sheet open={open} onOpenChange={closeDrawer}>
            <SheetContent
                side="right"
                className="border-border/70 !bg-background flex h-full w-full flex-col overflow-hidden border-l p-0 shadow-[-24px_0_64px_rgba(0,0,0,0.42)] backdrop-blur-none sm:max-w-[500px]"
            >
                <div className="border-border/70 bg-[var(--header-background,var(--card))] relative shrink-0 border-b px-5 py-4">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,var(--theme-soft),transparent_34%)]" />
                    <div className="bg-primary absolute inset-x-0 top-0 h-px" />

                    <SheetHeader className="m-0 space-y-0 p-0 text-left">
                        <SheetTitle className="text-foreground flex items-center gap-3">
                            {selectedUser ? (
                                <button
                                    type="button"
                                    onClick={closeConversation}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground -ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg transition"
                                    aria-label="Back to message threads"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>
                            ) : (
                                <MessageCircle className="text-primary size-5 shrink-0" />
                            )}

                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold">
                                    {selectedUser
                                        ? selectedUser.name
                                        : 'User Messages'}
                                </span>

                                <span className="text-muted-foreground mt-0.5 block truncate text-xs font-normal">
                                    {selectedUser
                                        ? selectedUser.email
                                        : 'Admin support inbox'}
                                </span>
                            </span>

                            {!selectedUser && (
                                <span className="border-border bg-muted/50 text-muted-foreground rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums">
                                    {unreadTotal} unread
                                </span>
                            )}
                        </SheetTitle>

                        <SheetDescription className="sr-only">
                            Review user conversations and send
                            administrative replies.
                        </SheetDescription>
                    </SheetHeader>

                    {!selectedUser && (
                        <div className="relative mt-4">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                            <input
                                data-message-search
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search name, email, or message..."
                                className="border-border/70 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/10 h-10 w-full rounded-xl border pr-3 pl-9 text-sm outline-none transition focus:ring-4"
                            />
                        </div>
                    )}
                </div>

                {!selectedUser ? (
                    <div className="bg-background min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        {loadingThreads &&
                            threads.length === 0 && (
                                <div className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                                    {[0, 1, 2, 3].map(
                                        (row) => (
                                            <div
                                                key={row}
                                                className={`flex animate-pulse items-center gap-3 px-4 py-4 ${
                                                    row !== 3
                                                        ? 'border-border border-b'
                                                        : ''
                                                }`}
                                            >
                                                <div className="bg-muted size-10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="bg-muted h-3 w-1/3 rounded" />
                                                    <div className="bg-muted h-2.5 w-2/3 rounded" />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                        {!loadingThreads &&
                            threadError &&
                            threads.length === 0 && (
                                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                    <MessageCircle className="text-muted-foreground size-8" />
                                    <h3 className="text-foreground mt-4 text-sm font-semibold">
                                        Inbox unavailable
                                    </h3>
                                    <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">
                                        {threadError}
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            void fetchThreads(
                                                1,
                                                false,
                                            )
                                        }
                                        className="mt-4 rounded-lg"
                                    >
                                        <RefreshCw className="mr-2 size-3.5" />
                                        Try again
                                    </Button>
                                </div>
                            )}

                        {!loadingThreads &&
                            !threadError &&
                            threads.length === 0 && (
                                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                    <MessageCircle className="text-muted-foreground size-8" />
                                    <h3 className="text-foreground mt-4 text-sm font-semibold">
                                        No user messages
                                    </h3>
                                    <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">
                                        New user conversations will
                                        appear here automatically.
                                    </p>
                                </div>
                            )}

                        {threads.length > 0 &&
                            filteredThreads.length === 0 && (
                                <div className="flex min-h-56 flex-col items-center justify-center text-center">
                                    <Search className="text-muted-foreground size-7" />
                                    <h3 className="text-foreground mt-4 text-sm font-semibold">
                                        No matching conversations
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Try a different search term.
                                    </p>
                                </div>
                            )}

                        {filteredThreads.length > 0 && (
                            <div className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                                {filteredThreads.map(
                                    (user, index) => {
                                        const unread =
                                            (user.unread_count ??
                                                0) > 0;

                                        return (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() =>
                                                    openThread(user)
                                                }
                                                className={`hover:bg-muted/35 relative flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                                                    index !==
                                                    filteredThreads.length -
                                                        1
                                                        ? 'border-border border-b'
                                                        : ''
                                                } ${
                                                    unread
                                                        ? 'bg-primary/[0.035]'
                                                        : ''
                                                }`}
                                            >
                                                {unread && (
                                                    <span className="bg-primary absolute inset-y-3 left-0 w-0.5 rounded-r-full" />
                                                )}

                                                <span
                                                    className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold ${
                                                        unread
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {user.avatar ? (
                                                        <img
                                                            src={
                                                                user.avatar
                                                            }
                                                            alt=""
                                                            className="size-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        initials(
                                                            user.name,
                                                        )
                                                    )}
                                                </span>

                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-3">
                                                        <span
                                                            className={`truncate text-sm ${
                                                                unread
                                                                    ? 'text-foreground font-semibold'
                                                                    : 'text-foreground font-medium'
                                                            }`}
                                                        >
                                                            {
                                                                user.name
                                                            }
                                                        </span>

                                                        {user.last_message_at && (
                                                            <span className="text-muted-foreground shrink-0 text-[10px]">
                                                                {formatTime(
                                                                    user.last_message_at,
                                                                )}
                                                            </span>
                                                        )}
                                                    </span>

                                                    <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                                                        {
                                                            user.email
                                                        }
                                                    </span>

                                                    {user.last_message && (
                                                        <span className="text-muted-foreground mt-1 block truncate text-xs">
                                                            {
                                                                user.last_message
                                                            }
                                                        </span>
                                                    )}
                                                </span>

                                                {unread && (
                                                    <span className="bg-primary text-primary-foreground min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums">
                                                        {
                                                            user.unread_count
                                                        }
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        )}

                        {!loadingThreads &&
                            hasMore &&
                            !search.trim() && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        void fetchThreads(
                                            page + 1,
                                            true,
                                        )
                                    }
                                    disabled={loadingMore}
                                    className="mt-3 h-10 w-full rounded-xl"
                                >
                                    {loadingMore && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    {loadingMore
                                        ? 'Loading...'
                                        : 'Load more conversations'}
                                </Button>
                            )}
                    </div>
                ) : (
                    <div className="bg-background flex min-h-0 flex-1 flex-col">
                        <div className="border-border/70 bg-card flex shrink-0 items-center gap-3 border-b px-5 py-3">
                            <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                {initials(selectedUser.name)}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-sm font-semibold">
                                    {selectedUser.name}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                    {selectedUser.email}
                                </p>
                            </div>

                            <span className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Active conversation
                            </span>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
                            {loadingMessages &&
                                messages.length === 0 && (
                                    <div className="text-muted-foreground flex min-h-56 flex-col items-center justify-center text-center">
                                        <Loader2 className="text-primary size-5 animate-spin" />
                                        <p className="mt-3 text-sm font-medium">
                                            Loading conversation...
                                        </p>
                                    </div>
                                )}

                            {!loadingMessages &&
                                conversationError &&
                                messages.length === 0 && (
                                    <div className="flex min-h-56 flex-col items-center justify-center text-center">
                                        <UserRound className="text-muted-foreground size-8" />
                                        <h3 className="text-foreground mt-4 text-sm font-semibold">
                                            Conversation unavailable
                                        </h3>
                                        <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">
                                            {conversationError}
                                        </p>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                void fetchConversation(
                                                    selectedUser,
                                                    false,
                                                )
                                            }
                                            className="mt-4 rounded-lg"
                                        >
                                            <RefreshCw className="mr-2 size-3.5" />
                                            Try again
                                        </Button>
                                    </div>
                                )}

                            {!loadingMessages &&
                                !conversationError &&
                                messages.length === 0 && (
                                    <div className="text-muted-foreground flex min-h-56 flex-col items-center justify-center text-center">
                                        <MessageCircle className="size-8" />
                                        <h3 className="text-foreground mt-4 text-sm font-semibold">
                                            No conversation yet
                                        </h3>
                                        <p className="mt-1 text-xs">
                                            Send the first admin reply
                                            below.
                                        </p>
                                    </div>
                                )}

                            {messages.length > 0 && (
                                <div className="space-y-3">
                                    {messages.map((message) => {
                                        const isAdmin =
                                            message.sender_type ===
                                            'admin';
                                        const optimistic =
                                            message.id < 0;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    isAdmin
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                                                        isAdmin
                                                            ? 'bg-primary text-primary-foreground rounded-br-md shadow-[0_10px_24px_color-mix(in_oklab,var(--primary)_18%,transparent)]'
                                                            : 'border-border/70 bg-card text-foreground rounded-bl-md border'
                                                    } ${
                                                        optimistic
                                                            ? 'opacity-70'
                                                            : ''
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap break-words leading-5">
                                                        {
                                                            message.message
                                                        }
                                                    </p>

                                                    <div
                                                        className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                                                            isAdmin
                                                                ? 'text-primary-foreground/70 justify-end'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        <span>
                                                            {isAdmin
                                                                ? 'Admin'
                                                                : selectedUser.name}
                                                        </span>

                                                        {message.created_at && (
                                                            <>
                                                                <span>
                                                                    •
                                                                </span>
                                                                <span>
                                                                    {formatMessageTime(
                                                                        message.created_at,
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}

                                                        {isAdmin && (
                                                            <>
                                                                {optimistic ? (
                                                                    <Loader2 className="ml-0.5 size-3 animate-spin" />
                                                                ) : (
                                                                    <CheckCheck className="ml-0.5 size-3" />
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div ref={bottomRef} />
                                </div>
                            )}
                        </div>

                        <div className="border-border/70 bg-[var(--header-background,var(--card))] shrink-0 border-t px-4 py-4 sm:px-5">
                            {conversationError &&
                                messages.length > 0 && (
                                    <p className="text-destructive mb-2 text-xs">
                                        {conversationError}
                                    </p>
                                )}

                            <div className="border-border/70 bg-card focus-within:border-primary/40 focus-within:ring-primary/10 rounded-2xl border p-1.5 transition focus-within:ring-4">
                                <div className="flex items-end gap-1.5">
                                    <textarea
                                        ref={textareaRef}
                                        value={messageText}
                                        onChange={(event) => {
                                            setMessageText(
                                                event.target.value,
                                            );
                                            resizeTextarea();
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key ===
                                                    'Enter' &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();
                                                void sendReply();
                                            }
                                        }}
                                        rows={1}
                                        maxLength={2000}
                                        placeholder="Reply as admin..."
                                        className="text-foreground placeholder:text-muted-foreground max-h-[120px] min-h-11 flex-1 resize-none bg-transparent px-2.5 py-2.5 text-sm leading-5 outline-none"
                                    />

                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={() =>
                                            void sendReply()
                                        }
                                        disabled={
                                            sending ||
                                            !messageText.trim()
                                        }
                                        aria-label="Send reply"
                                        className="size-11 shrink-0 rounded-lg"
                                    >
                                        {sending ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Send className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="text-muted-foreground mt-2 flex justify-between gap-3 text-[10px]">
                                <span>
                                    Enter to send · Shift + Enter
                                    for new line
                                </span>
                                <span>
                                    {messageText.length}/2000
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}