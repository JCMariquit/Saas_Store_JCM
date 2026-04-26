import axios from 'axios';
import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, Clock, Megaphone, Package, Plus, Send, X } from 'lucide-react';

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

export function AdminNotificationDrawer({ open, onOpenChange }: Props) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [addOpen, setAddOpen] = useState(false);

    const [mode, setMode] = useState<'all' | 'single'>('all');
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('announcement');

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [sending, setSending] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        if (open) {
            fetchNotifications(1, false);
            fetchUsers();
        }
    }, [open]);

    async function fetchNotifications(nextPage = 1, append = false) {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await axios.get(`/admin/notifications?page=${nextPage}`);
            const newNotifications = response.data.notifications ?? [];

            setNotifications((current) => {
                if (!append) return newNotifications;

                const existingIds = new Set(current.map((item) => item.id));
                const uniqueNew = newNotifications.filter(
                    (item: NotificationItem) => !existingIds.has(item.id),
                );

                return [...current, ...uniqueNew];
            });

            setPage(response.data.current_page ?? nextPage);
            setHasMore(response.data.has_more ?? false);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    async function fetchUsers() {
        try {
            const response = await axios.get('/admin/notifications/users-list');
            setUsers(response.data.users ?? []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }

    async function openNotification(item: NotificationItem) {
        setSelectedNotification(item);
        setLoadingDetail(true);

        try {
            const response = await axios.get(`/admin/notifications/${item.id}`);
            setSelectedNotification(response.data.notification ?? item);
        } catch (error) {
            console.error('Failed to fetch notification detail:', error);
        } finally {
            setLoadingDetail(false);
        }
    }

    async function sendNotification() {
        if (!title.trim() || !message.trim() || sending) return;

        setSending(true);

        try {
            await axios.post('/admin/notifications/send', {
                mode,
                user_id: mode === 'single' ? userId : null,
                title,
                message,
                type,
            });

            setMode('all');
            setUserId('');
            setTitle('');
            setMessage('');
            setType('announcement');
            setAddOpen(false);

            await fetchNotifications(1, false);
        } catch (error) {
            console.error('Failed to send notification:', error);
        } finally {
            setSending(false);
        }
    }

    function closeDrawer(value: boolean) {
        if (!value) {
            setAddOpen(false);
            setSelectedNotification(null);
            setNotifications([]);
            setPage(1);
            setHasMore(false);
            setMode('all');
            setUserId('');
            setTitle('');
            setMessage('');
            setType('announcement');
        }

        onOpenChange(value);
    }

    function iconByType(notifType?: string | null) {
        if (notifType === 'order') return <Package className="h-5 w-5" />;
        if (notifType === 'announcement') return <Megaphone className="h-5 w-5" />;
        if (notifType === 'alert') return <Bell className="h-5 w-5" />;

        return <CheckCircle2 className="h-5 w-5" />;
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
            <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-0 sm:max-w-lg">
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
                    <SheetHeader className="space-y-1 text-left">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-slate-950">
                                    {selectedNotification && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedNotification(null)}
                                            className="mr-1 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}

                                    <Bell className="h-5 w-5 text-blue-700" />
                                    {selectedNotification ? 'Notification Details' : 'Notifications'}
                                </SheetTitle>

                                <SheetDescription>
                                    {selectedNotification
                                        ? 'Full announcement or notification detail.'
                                        : 'Display all alerts, announcements, and order notifications.'}
                                </SheetDescription>
                            </div>

                            {!selectedNotification && (
                                <Button
                                    type="button"
                                    onClick={() => setAddOpen(true)}
                                    className="h-9 rounded-xl bg-blue-700 px-3 text-white hover:bg-blue-800"
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </SheetHeader>
                </div>

                <div className="px-6 py-5">
                    {!selectedNotification && (
                        <div className="space-y-3">
                            {loading && (
                                <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
                                    Loading notifications...
                                </p>
                            )}

                            {!loading && notifications.length === 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-3 font-semibold text-slate-950">No notifications yet</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Orders, alerts, and announcements will appear here.
                                    </p>
                                </div>
                            )}

                            {!loading &&
                                notifications.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => openNotification(item)}
                                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                                {iconByType(item.type)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="line-clamp-1 font-semibold text-slate-950">
                                                        {item.title}
                                                    </h4>

                                                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase text-slate-500">
                                                        {item.type ?? 'system'}
                                                    </span>
                                                </div>

                                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                                    {item.message}
                                                </p>

                                                <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatTime(item.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}

                            {!loading && hasMore && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fetchNotifications(page + 1, true)}
                                    disabled={loadingMore}
                                    className="h-11 w-full rounded-xl border-slate-200 bg-white font-semibold"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </Button>
                            )}
                        </div>
                    )}

                    {selectedNotification && (
                        <div className="space-y-4">
                            {loadingDetail && (
                                <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
                                    Loading details...
                                </p>
                            )}

                            {!loadingDetail && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                        {iconByType(selectedNotification.type)}
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase text-blue-700">
                                            {selectedNotification.type ?? 'system'}
                                        </span>

                                        <span className="text-xs text-slate-400">
                                            {formatTime(selectedNotification.created_at)}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                                        {selectedNotification.title}
                                    </h3>

                                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Full message
                                        </p>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                            {selectedNotification.message}
                                        </p>
                                    </div>

                                    <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Receiver
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-700">
                                            {selectedNotification.user
                                                ? `${selectedNotification.user.name} — ${selectedNotification.user.email}`
                                                : 'All users / system generated'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {addOpen && (
                    <div className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm">
                        <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-950">Add Notification</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Create announcement or alert for users.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setAddOpen(false)}
                                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-5 px-6 py-5">
                                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white">
                                            <Megaphone className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-slate-950">
                                                Notification Announcement
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                This will appear in the user notification drawer.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <label className="text-sm font-medium text-slate-700">Send to</label>

                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setMode('all')}
                                            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                                                mode === 'all'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            All Users
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMode('single')}
                                            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                                                mode === 'single'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            One User
                                        </button>
                                    </div>

                                    {mode === 'single' && (
                                        <select
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        >
                                            <option value="">Select user</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} — {user.email}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <label className="text-sm font-medium text-slate-700">Type</label>

                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    >
                                        <option value="announcement">Announcement</option>
                                        <option value="alert">Alert</option>
                                        <option value="order">Order</option>
                                        <option value="system">System</option>
                                    </select>

                                    <label className="mt-4 block text-sm font-medium text-slate-700">
                                        Title
                                    </label>

                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Notification title"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    <label className="mt-4 block text-sm font-medium text-slate-700">
                                        Message
                                    </label>

                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={6}
                                        placeholder="Notification message..."
                                        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    <Button
                                        type="button"
                                        onClick={sendNotification}
                                        disabled={
                                            sending ||
                                            !title.trim() ||
                                            !message.trim() ||
                                            (mode === 'single' && !userId)
                                        }
                                        className="mt-4 h-11 w-full rounded-xl bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {sending ? 'Sending...' : 'Publish Notification'}
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