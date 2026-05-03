import axios from 'axios';
import {
    ArrowLeft,
    Bell,
    CheckCheck,
    CheckCircle2,
    Clock,
    Loader2,
    MessageCircle,
    Package,
} from 'lucide-react';
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
    const [selectedItem, setSelectedItem] = useState<Notification | null>(null);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    useEffect(() => {
        if (open) {
            void fetchNotifications(true);
        }

        if (!open) {
            setSelectedItem(null);
        }
    }, [open]);

    const unreadCount = items.filter((item) => item.is_read === 1).length;

    async function fetchNotifications(markAsRead = false) {
        setLoading(true);

        try {
            const res = await axios.get('/notifications');
            const data: Notification[] = res.data.notifications ?? [];

            setItems(data);

            if (markAsRead && data.some((item) => item.is_read === 1)) {
                await axios.post('/notifications/read-all');

                setItems((current) =>
                    current.map((item) => ({
                        ...item,
                        is_read: 0,
                        read_at: item.read_at ?? new Date().toISOString(),
                    })),
                );

                window.dispatchEvent(new Event('notification:refresh'));
            }
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

            const notification: Notification = res.data.notification ?? {
                ...item,
                is_read: 0,
                read_at: item.read_at ?? new Date().toISOString(),
            };

            setSelectedItem({
                ...notification,
                is_read: 0,
            });

            setItems((current) =>
                current.map((notif) =>
                    notif.id === item.id
                        ? {
                              ...notif,
                              is_read: 0,
                              read_at: notif.read_at ?? new Date().toISOString(),
                          }
                        : notif,
                ),
            );

            window.dispatchEvent(new Event('notification:refresh'));
        } catch (error) {
            console.error('Failed to open notification:', error);

            setSelectedItem({
                ...item,
                is_read: 0,
                read_at: item.read_at ?? new Date().toISOString(),
            });

            setItems((current) =>
                current.map((notif) =>
                    notif.id === item.id
                        ? {
                              ...notif,
                              is_read: 0,
                              read_at: notif.read_at ?? new Date().toISOString(),
                          }
                        : notif,
                ),
            );

            window.dispatchEvent(new Event('notification:refresh'));
        }
    }

    async function markAll() {
        setMarkingAll(true);

        try {
            await axios.post('/notifications/read-all');

            setItems((current) =>
                current.map((item) => ({
                    ...item,
                    is_read: 0,
                    read_at: item.read_at ?? new Date().toISOString(),
                })),
            );

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
            year: 'numeric',
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
                className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-[#f4f7fb] p-0 sm:max-w-md"
            >
                <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-10 h-20 w-20 rounded-full bg-blue-300/10 blur-xl" />

                    <div className="relative px-5 pb-5 pt-4">
                        <SheetHeader className="m-0 space-y-0 p-0 text-left">
                            <SheetTitle className="flex items-center justify-between text-white">
                                <span className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                        <Bell className="h-5 w-5" />
                                    </span>

                                    <span>
                                        <span className="block text-base font-semibold leading-tight">
                                            {selectedItem
                                                ? 'Notification Details'
                                                : 'Notifications'}
                                        </span>
                                        <span className="mt-0.5 block text-xs font-normal text-blue-100">
                                            {selectedItem
                                                ? 'Read the full announcement'
                                                : 'System updates and order alerts'}
                                        </span>
                                    </span>
                                </span>

                                {!selectedItem && (
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50 ring-1 ring-white/15">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </SheetTitle>

                            <SheetDescription className="sr-only">
                                View your recent notifications.
                            </SheetDescription>
                        </SheetHeader>

                        {!selectedItem && (
                            <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs text-blue-50 ring-1 ring-white/15">
                                <CheckCheck className="h-4 w-4 text-blue-100" />
                                <span>
                                    Opening this drawer marks notifications as read.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {selectedItem ? (
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                        <button
                            type="button"
                            onClick={() => setSelectedItem(null)}
                            className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to notifications
                        </button>

                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
                                        {getIcon(selectedItem.type)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-bold leading-6 text-slate-950">
                                            {selectedItem.title}
                                        </h3>

                                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatDate(selectedItem.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 p-5">
                                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                                    {selectedItem.message}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                            {loading && (
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>

                                    <p className="mt-3 text-sm font-medium text-slate-500">
                                        Loading notifications...
                                    </p>
                                </div>
                            )}

                            {!loading && items.length === 0 && (
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                        <Bell className="h-7 w-7" />
                                    </div>

                                    <h4 className="mt-4 font-semibold text-slate-900">
                                        No notifications
                                    </h4>

                                    <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">
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
                                                className={`w-full rounded-3xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${
                                                    unread
                                                        ? 'border-blue-200 ring-4 ring-blue-50'
                                                        : 'border-slate-200'
                                                }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
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
                                disabled={
                                    markingAll ||
                                    items.length === 0 ||
                                    unreadCount === 0
                                }
                                className="h-11 w-full rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {markingAll ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCheck className="mr-2 h-4 w-4" />
                                )}

                                {markingAll ? 'Marking...' : 'Mark all as read'}
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}