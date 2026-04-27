import axios from 'axios';
import { Bell, CheckCheck, CheckCircle2, Clock, MessageCircle, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

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

type Notification = {
    id: number;
    title: string;
    message: string;
    type?: string | null;
    is_read: number;
    read_at?: string | null;
    created_at?: string | null;
};

export function NotificationsDrawer({ open, onOpenChange }: Props) {
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    useEffect(() => {
        if (open) void fetchNotifications();
    }, [open]);

    const unreadCount = items.filter((item) => item.is_read === 1).length;

    async function fetchNotifications() {
        setLoading(true);

        try {
            const res = await axios.get('/notifications');
            setItems(res.data.notifications ?? []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    async function openNotification(item: Notification) {
        try {
            const res = await axios.get(`/notifications/${item.id}`);
            const notification = res.data.notification ?? {
                ...item,
                is_read: 0,
                read_at: new Date().toISOString(),
            };

            setItems((current) =>
                current.map((notif) =>
                    notif.id === item.id
                        ? { ...notif, is_read: 0, read_at: notification.read_at }
                        : notif,
                ),
            );

            window.dispatchEvent(new Event('notification:refresh'));
        } catch (error) {
            console.error('Failed to open notification:', error);
        }
    }

    async function markAll() {
        setMarkingAll(true);

        try {
            await axios.post('/notifications/read-all');
            await fetchNotifications();
            window.dispatchEvent(new Event('notification:refresh'));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setMarkingAll(false);
        }
    }

    function formatDate(date?: string | null) {
        if (!date) return 'Recently';

        return new Date(date).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getIcon(type?: string | null) {
        if (type === 'message') return <MessageCircle className="h-4 w-4" />;
        if (type === 'order') return <Package className="h-4 w-4" />;

        return <CheckCircle2 className="h-4 w-4" />;
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
                                    <Bell className="h-4.5 w-4.5" />
                                </span>

                                <span>
                                    <span className="block text-base font-semibold leading-tight">
                                        Notifications
                                    </span>
                                    <span className="mt-0.5 block text-xs font-normal text-blue-100">
                                        System updates and order alerts
                                    </span>
                                </span>
                            </span>

                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50 ring-1 ring-white/15">
                                {unreadCount} unread
                            </span>
                        </SheetTitle>

                        <SheetDescription className="sr-only">
                            View your recent notifications.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
                            Loading notifications...
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                <Bell className="h-6 w-6" />
                            </div>

                            <h4 className="mt-3 font-semibold text-slate-900">
                                No notifications
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                You have no system updates yet.
                            </p>
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div className="space-y-3">
                            {items.map((item) => {
                                const unread = item.is_read === 1;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => void openNotification(item)}
                                        className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md ${
                                            unread
                                                ? 'border-blue-200 ring-4 ring-blue-50'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                    unread
                                                        ? 'bg-blue-700 text-white'
                                                        : 'bg-slate-100 text-blue-700'
                                                }`}
                                            >
                                                {getIcon(item.type)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="line-clamp-1 font-semibold text-slate-950">
                                                        {item.title}
                                                    </h4>

                                                    {unread && (
                                                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-700" />
                                                    )}
                                                </div>

                                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                                                    {item.message}
                                                </p>

                                                <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDate(item.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-14px_30px_rgba(15,23,42,0.08)]">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void markAll()}
                        disabled={markingAll || items.length === 0 || unreadCount === 0}
                        className="h-11 w-full rounded-xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        {markingAll ? 'Marking...' : 'Mark all as read'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}