import axios from 'axios';
import {
    ArrowLeft,
    Bell,
    CheckCircle2,
    Clock,
    Loader2,
    Megaphone,
    Package,
    Plus,
    RefreshCw,
    Search,
    Send,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type NotificationItem = {
    id: number;
    user_id?: number;
    title: string;
    message: string;
    type?: string | null;
    is_read?: number;
    created_at?: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
};

type UserItem = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function NotificationIcon({
    type,
    className = 'size-4',
}: {
    type?: string | null;
    className?: string;
}) {
    if (type === 'order') {
        return <Package className={className} />;
    }

    if (type === 'announcement') {
        return <Megaphone className={className} />;
    }

    if (type === 'alert') {
        return <Bell className={className} />;
    }

    return <CheckCircle2 className={className} />;
}

function typeLabel(type?: string | null) {
    if (type === 'announcement') return 'Announcement';
    if (type === 'alert') return 'Alert';
    if (type === 'order') return 'Order';

    return 'System';
}

export function AdminNotificationDrawer({
    open,
    onOpenChange,
}: Props) {
    const [notifications, setNotifications] = useState<
        NotificationItem[]
    >([]);
    const [selectedNotification, setSelectedNotification] =
        useState<NotificationItem | null>(null);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [addOpen, setAddOpen] = useState(false);

    const [mode, setMode] = useState<'all' | 'single'>('all');
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('announcement');

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [sending, setSending] = useState(false);

    const [listError, setListError] = useState<string | null>(
        null,
    );
    const [detailError, setDetailError] = useState<
        string | null
    >(null);
    const [formError, setFormError] = useState<string | null>(
        null,
    );

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const filteredNotifications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return notifications.filter((item) => {
            const itemType = item.type ?? 'system';
            const matchesType =
                typeFilter === 'all' ||
                itemType === typeFilter;

            if (!matchesType) return false;
            if (!query) return true;

            return [
                item.title,
                item.message,
                item.user?.name,
                item.user?.email,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query),
                );
        });
    }, [notifications, search, typeFilter]);

    useEffect(() => {
        if (!open) return;

        void fetchNotifications(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!addOpen || mode !== 'single' || users.length > 0) {
            return;
        }

        void fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addOpen, mode]);

    async function fetchNotifications(
        nextPage = 1,
        append = false,
    ) {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setListError(null);
        }

        try {
            const response = await axios.get(
                `/admin/notifications?page=${nextPage}`,
            );

            const newNotifications: NotificationItem[] =
                response.data.notifications ?? [];

            setNotifications((current) => {
                if (!append) return newNotifications;

                const existingIds = new Set(
                    current.map((item) => item.id),
                );

                const uniqueNew = newNotifications.filter(
                    (item) => !existingIds.has(item.id),
                );

                return [...current, ...uniqueNew];
            });

            setPage(response.data.current_page ?? nextPage);
            setHasMore(response.data.has_more ?? false);
        } catch (error) {
            console.error(
                'Failed to fetch notifications:',
                error,
            );

            if (!append) {
                setListError(
                    'Unable to load notifications. Please try again.',
                );
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    async function fetchUsers() {
        setLoadingUsers(true);
        setFormError(null);

        try {
            const response = await axios.get(
                '/admin/notifications/users-list',
            );

            setUsers(response.data.users ?? []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setFormError('Unable to load the user list.');
        } finally {
            setLoadingUsers(false);
        }
    }

    async function openNotification(item: NotificationItem) {
        setSelectedNotification(item);
        setLoadingDetail(true);
        setDetailError(null);

        try {
            const response = await axios.get(
                `/admin/notifications/${item.id}`,
            );

            setSelectedNotification(
                response.data.notification ?? item,
            );
        } catch (error) {
            console.error(
                'Failed to fetch notification detail:',
                error,
            );
            setDetailError(
                'Unable to load the latest notification details.',
            );
        } finally {
            setLoadingDetail(false);
        }
    }

    async function sendNotification() {
        if (
            !title.trim() ||
            !message.trim() ||
            sending ||
            (mode === 'single' && !userId)
        ) {
            return;
        }

        setSending(true);
        setFormError(null);

        try {
            await axios.post('/admin/notifications/send', {
                mode,
                user_id: mode === 'single' ? userId : null,
                title: title.trim(),
                message: message.trim(),
                type,
            });

            resetForm();
            setAddOpen(false);

            await fetchNotifications(1, false);
        } catch (error) {
            console.error(
                'Failed to send notification:',
                error,
            );
            setFormError(
                'Notification was not published. Please try again.',
            );
        } finally {
            setSending(false);
        }
    }

    function resetForm() {
        setMode('all');
        setUserId('');
        setTitle('');
        setMessage('');
        setType('announcement');
        setFormError(null);
    }

    function closeAddPanel() {
        setAddOpen(false);
        resetForm();
    }

    function closeDrawer(value: boolean) {
        if (!value) {
            setAddOpen(false);
            setSelectedNotification(null);
            setNotifications([]);
            setPage(1);
            setHasMore(false);
            setSearch('');
            setTypeFilter('all');
            setListError(null);
            setDetailError(null);
            resetForm();
        }

        onOpenChange(value);
    }

    function formatTime(date?: string | null) {
        if (!date) return 'Recently';

        return new Date(date).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <Sheet open={open} onOpenChange={closeDrawer}>
            <SheetContent
                side="right"
                className="border-border/70 !bg-background z-[60] flex h-full w-full flex-col overflow-hidden border-l p-0 shadow-[-24px_0_64px_rgba(0,0,0,0.42)] backdrop-blur-none sm:max-w-[520px]"
            >
                <div className="border-border/70 bg-[var(--header-background,var(--card))] relative shrink-0 border-b px-5 py-4">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,var(--theme-soft),transparent_34%)]" />
                    <div className="bg-primary absolute inset-x-0 top-0 h-px" />

                    <SheetHeader className="relative m-0 space-y-0 p-0 text-left">
                        <div className="flex items-center gap-3">
                            {selectedNotification ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedNotification(null);
                                        setDetailError(null);
                                    }}
                                    aria-label="Back to notifications"
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground -ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg transition"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>
                            ) : (
                                <Bell className="text-primary size-5 shrink-0" />
                            )}

                            <div className="min-w-0 flex-1">
                                <SheetTitle className="text-foreground truncate text-sm font-semibold">
                                    {selectedNotification
                                        ? 'Notification Details'
                                        : 'Notifications'}
                                </SheetTitle>

                                <SheetDescription className="text-muted-foreground mt-0.5 truncate text-xs">
                                    {selectedNotification
                                        ? 'Review notification content and receiver'
                                        : 'Announcements, alerts, and order activity'}
                                </SheetDescription>
                            </div>

                            {!selectedNotification && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setAddOpen(true)}
                                    className="h-8 rounded-lg px-3 text-xs"
                                >
                                    <Plus className="mr-1.5 size-3.5" />
                                    New
                                </Button>
                            )}
                        </div>
                    </SheetHeader>

                    {!selectedNotification && (
                        <div className="relative mt-4 grid grid-cols-[minmax(0,1fr)_128px] gap-2">
                            <div className="relative">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search notifications..."
                                    className="border-border/70 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/10 h-10 w-full rounded-xl border pr-3 pl-9 text-sm outline-none transition focus:ring-4"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                                className="border-border/70 bg-card text-foreground focus:border-primary/40 focus:ring-primary/10 h-10 rounded-xl border px-3 text-xs outline-none transition focus:ring-4"
                            >
                                <option value="all">All types</option>
                                <option value="announcement">
                                    Announcement
                                </option>
                                <option value="alert">Alert</option>
                                <option value="order">Order</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                    )}
                </div>

                {selectedNotification ? (
                    <div className="bg-background min-h-0 flex-1 overflow-y-auto px-5 py-5">
                        {loadingDetail && (
                            <div className="border-border/70 bg-card animate-pulse rounded-2xl border p-5">
                                <div className="bg-muted size-11 rounded-xl" />
                                <div className="mt-4 space-y-3">
                                    <div className="bg-muted h-4 w-2/3 rounded" />
                                    <div className="bg-muted h-3 w-1/3 rounded" />
                                    <div className="bg-muted h-20 w-full rounded" />
                                </div>
                            </div>
                        )}

                        {!loadingDetail &&
                            selectedNotification && (
                                <article className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                                    <div className="border-border/70 border-b p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                                                <NotificationIcon
                                                    type={
                                                        selectedNotification.type
                                                    }
                                                    className="size-5"
                                                />
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <span className="text-primary text-[10px] font-semibold tracking-[0.1em] uppercase">
                                                    {typeLabel(
                                                        selectedNotification.type,
                                                    )}
                                                </span>

                                                <h3 className="text-foreground mt-1 text-lg leading-7 font-semibold">
                                                    {
                                                        selectedNotification.title
                                                    }
                                                </h3>

                                                <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                                                    <Clock className="size-3.5" />
                                                    {formatTime(
                                                        selectedNotification.created_at,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5 p-5">
                                        <section>
                                            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.1em] uppercase">
                                                Message
                                            </p>
                                            <p className="text-foreground mt-2 whitespace-pre-line text-sm leading-7">
                                                {
                                                    selectedNotification.message
                                                }
                                            </p>
                                        </section>

                                    </div>
                                </article>
                            )}

                        {detailError && (
                            <div className="border-destructive/20 bg-destructive/5 text-destructive mt-3 rounded-xl border px-4 py-3 text-xs">
                                {detailError}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-background min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        {loading &&
                            notifications.length === 0 && (
                                <div className="border-border/70 bg-card overflow-hidden rounded-2xl border">
                                    {[0, 1, 2, 3].map((row) => (
                                        <div
                                            key={row}
                                            className={`flex animate-pulse gap-3 px-4 py-4 ${
                                                row !== 3
                                                    ? 'border-border/70 border-b'
                                                    : ''
                                            }`}
                                        >
                                            <div className="bg-muted size-10 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <div className="bg-muted h-3 w-1/3 rounded" />
                                                <div className="bg-muted h-3 w-4/5 rounded" />
                                                <div className="bg-muted h-2.5 w-1/2 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        {!loading &&
                            listError &&
                            notifications.length === 0 && (
                                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                    <Bell className="text-muted-foreground size-8" />
                                    <h3 className="text-foreground mt-4 text-sm font-semibold">
                                        Notifications unavailable
                                    </h3>
                                    <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">
                                        {listError}
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            void fetchNotifications(
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

                        {!loading &&
                            !listError &&
                            notifications.length === 0 && (
                                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                                    <Bell className="text-muted-foreground size-8" />
                                    <h3 className="text-foreground mt-4 text-sm font-semibold">
                                        No notifications
                                    </h3>
                                    <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">
                                        Published announcements, alerts,
                                        and order activity will appear
                                        here.
                                    </p>
                                </div>
                            )}

                        {notifications.length > 0 &&
                            filteredNotifications.length === 0 && (
                                <div className="flex min-h-56 flex-col items-center justify-center text-center">
                                    <Search className="text-muted-foreground size-7" />
                                    <h3 className="text-foreground mt-4 text-sm font-semibold">
                                        No matching notifications
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Adjust your search or filter.
                                    </p>
                                </div>
                            )}

                        {filteredNotifications.length > 0 && (
                            <div className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                                {filteredNotifications.map(
                                    (item, index) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() =>
                                                void openNotification(
                                                    item,
                                                )
                                            }
                                            className={`hover:bg-primary/[0.035] flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                                                index !==
                                                filteredNotifications.length -
                                                    1
                                                    ? 'border-border/70 border-b'
                                                    : ''
                                            }`}
                                        >
                                            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                                <NotificationIcon
                                                    type={item.type}
                                                />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-start justify-between gap-3">
                                                    <span className="text-foreground line-clamp-1 text-sm font-semibold">
                                                        {item.title}
                                                    </span>

                                                    <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase">
                                                        {typeLabel(
                                                            item.type,
                                                        )}
                                                    </span>
                                                </span>

                                                <span className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                                                    {item.message}
                                                </span>

                                                <span className="text-muted-foreground mt-2 flex items-center gap-1.5 text-[10px]">
                                                    <Clock className="size-3" />
                                                    {formatTime(
                                                        item.created_at,
                                                    )}

                                                    {item.user && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate">
                                                                {
                                                                    item.user
                                                                        .name
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    ),
                                )}
                            </div>
                        )}

                        {!loading &&
                            hasMore &&
                            !search.trim() &&
                            typeFilter === 'all' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        void fetchNotifications(
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
                                        : 'Load more notifications'}
                                </Button>
                            )}
                    </div>
                )}

                {addOpen && (
                    <div className="absolute inset-0 z-[70] flex justify-end bg-black/80">
                        <div className="border-border/70 !bg-background flex h-full w-full max-w-[440px] flex-col border-l shadow-2xl">
                            <div className="border-border/70 bg-[var(--header-background,var(--card))] flex shrink-0 items-start justify-between border-b px-5 py-4">
                                <div>
                                    <h2 className="text-foreground text-sm font-semibold">
                                        New Notification
                                    </h2>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        Publish an announcement, alert,
                                        or order update.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeAddPanel}
                                    aria-label="Close notification form"
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-lg transition"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="bg-background min-h-0 flex-1 overflow-y-auto px-5 py-5">
                                <div className="border-border/70 bg-card space-y-5 rounded-2xl border p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                                    <div>
                                        <label className="text-foreground text-xs font-semibold">
                                            Recipient
                                        </label>

                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMode('all');
                                                    setUserId('');
                                                }}
                                                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                                                    mode === 'all'
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border/70 text-muted-foreground hover:bg-muted/35'
                                                }`}
                                            >
                                                All Users
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMode('single')
                                                }
                                                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                                                    mode === 'single'
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border/70 text-muted-foreground hover:bg-muted/35'
                                                }`}
                                            >
                                                One User
                                            </button>
                                        </div>

                                        {mode === 'single' && (
                                            <div className="mt-3">
                                                {loadingUsers ? (
                                                    <div className="border-border/70 bg-muted/25 text-muted-foreground flex h-11 items-center justify-center rounded-xl border text-xs">
                                                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                                                        Loading users...
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={userId}
                                                        onChange={(event) =>
                                                            setUserId(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="border-border/70 bg-background text-foreground focus:border-primary/40 focus:ring-primary/10 h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-4"
                                                    >
                                                        <option value="">
                                                            Select user
                                                        </option>

                                                        {users.map(
                                                            (user) => (
                                                                <option
                                                                    key={
                                                                        user.id
                                                                    }
                                                                    value={
                                                                        user.id
                                                                    }
                                                                >
                                                                    {
                                                                        user.name
                                                                    }{' '}
                                                                    —{' '}
                                                                    {
                                                                        user.email
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-foreground text-xs font-semibold">
                                            Type
                                        </label>

                                        <select
                                            value={type}
                                            onChange={(event) =>
                                                setType(
                                                    event.target.value,
                                                )
                                            }
                                            className="border-border/70 bg-background text-foreground focus:border-primary/40 focus:ring-primary/10 mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-4"
                                        >
                                            <option value="announcement">
                                                Announcement
                                            </option>
                                            <option value="alert">
                                                Alert
                                            </option>
                                            <option value="order">
                                                Order
                                            </option>
                                            <option value="system">
                                                System
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-foreground text-xs font-semibold">
                                            Title
                                        </label>

                                        <input
                                            value={title}
                                            onChange={(event) =>
                                                setTitle(
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={160}
                                            placeholder="Notification title"
                                            className="border-border/70 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/10 mt-2 h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-4"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-foreground text-xs font-semibold">
                                            Message
                                        </label>

                                        <textarea
                                            value={message}
                                            onChange={(event) =>
                                                setMessage(
                                                    event.target.value,
                                                )
                                            }
                                            rows={7}
                                            maxLength={3000}
                                            placeholder="Write the notification message..."
                                            className="border-border/70 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/10 mt-2 w-full resize-none rounded-xl border px-3.5 py-3 text-sm leading-6 outline-none transition focus:ring-4"
                                        />

                                        <div className="text-muted-foreground mt-1.5 text-right text-[10px]">
                                            {message.length}/3000
                                        </div>
                                    </div>

                                    {formError && (
                                        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-3 py-2.5 text-xs">
                                            {formError}
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        onClick={() =>
                                            void sendNotification()
                                        }
                                        disabled={
                                            sending ||
                                            !title.trim() ||
                                            !message.trim() ||
                                            (mode === 'single' &&
                                                !userId)
                                        }
                                        className="h-11 w-full rounded-xl"
                                    >
                                        {sending ? (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 size-4" />
                                        )}

                                        {sending
                                            ? 'Publishing...'
                                            : 'Publish Notification'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}