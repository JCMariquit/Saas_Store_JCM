import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowLeft,
    Bell,
    CheckCircle2,
    Clock,
    MessageCircle,
    Package,
    ShoppingCart,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

export type HeaderDrawerType = 'cart' | 'messages' | 'notifications';

type HeaderActionDrawerProps = {
    open: boolean;
    type: HeaderDrawerType | null;
    onOpenChange: (open: boolean) => void;
};

type CartItem = {
    title: string;
    description: string;
    price: string;
    details: string;
};

type NotificationItem = {
    id: number;
    user_id?: number;
    title: string;
    message: string;
    type?: string | null;
    is_read: number;
    read_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type MessageItem = {
    id: number;
    user_id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    sender_type: 'user' | 'admin';
    is_read: number;
    read_at?: string | null;
    created_at?: string | null;
};

export function HeaderActionDrawer({ open, type, onOpenChange }: HeaderActionDrawerProps) {
    const [selectedCart, setSelectedCart] = useState<CartItem | null>(null);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

    const drawerTitle =
        type === 'cart'
            ? selectedCart
                ? 'Cart Details'
                : 'Your Cart'
            : type === 'messages'
              ? 'Message Admin'
              : selectedNotification
                ? 'Notification Details'
                : 'Notifications';

    const drawerDescription =
        type === 'cart'
            ? selectedCart
                ? 'View more information about this selected service.'
                : 'Review selected services before sending your order request.'
            : type === 'messages'
              ? 'Send your inquiry directly to the admin.'
              : selectedNotification
                ? 'Full details of your selected notification.'
                : 'Stay updated with orders, services, and system alerts.';

    function handleOpenChange(value: boolean) {
        if (!value) {
            setSelectedCart(null);
            setSelectedNotification(null);
        }

        onOpenChange(value);
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-0 sm:max-w-md"
            >
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
                    <SheetHeader className="space-y-1 text-left">
                        <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-slate-950">
                            {(selectedCart || selectedNotification) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCart(null);
                                        setSelectedNotification(null);
                                    }}
                                    className="mr-1 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                            )}

                            {type === 'cart' && <ShoppingCart className="h-5 w-5 text-blue-700" />}
                            {type === 'messages' && <MessageCircle className="h-5 w-5 text-blue-700" />}
                            {type === 'notifications' && <Bell className="h-5 w-5 text-blue-700" />}

                            {drawerTitle}
                        </SheetTitle>

                        <SheetDescription className="text-sm text-slate-500">
                            {drawerDescription}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="px-6 py-5">
                    {type === 'cart' && selectedCart && <CartDetail item={selectedCart} />}
                    {type === 'cart' && !selectedCart && <CartDrawerContent onSelectItem={setSelectedCart} />}

                    {type === 'messages' && <MessagesDrawerContent />}

                    {type === 'notifications' && selectedNotification && (
                        <NotificationDetail item={selectedNotification} />
                    )}

                    {type === 'notifications' && !selectedNotification && (
                        <NotificationsDrawerContent onSelectItem={setSelectedNotification} />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function CartDrawerContent({ onSelectItem }: { onSelectItem: (item: CartItem) => void }) {
    const cartItems: CartItem[] = [
        {
            title: 'Booking System',
            description: 'Online appointment and reservation system.',
            price: '₱15,000+',
            details: 'A simple booking system where clients can submit appointment requests, select services, and wait for admin confirmation.',
        },
        {
            title: 'Admin Dashboard',
            description: 'Manage orders, clients, reports, and services.',
            price: 'Included',
            details: 'A clean admin panel for managing service requests, clients, booking records, and basic reports.',
        },
    ];

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-950 to-blue-800 p-5 text-white shadow-sm">
                <p className="text-sm text-blue-100">Selected package</p>
                <h3 className="mt-1 text-2xl font-semibold">Starter Service Request</h3>
                <p className="mt-2 text-sm text-blue-100">
                    Your selected services are ready for review before submission.
                </p>
            </div>

            <div className="space-y-3">
                {cartItems.map((item) => (
                    <button
                        key={item.title}
                        type="button"
                        onClick={() => onSelectItem(item)}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="font-semibold text-slate-950">{item.title}</h4>
                                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Starting price
                            </span>
                            <span className="font-semibold text-blue-700">{item.price}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Estimated total</span>
                    <span className="text-lg font-bold text-slate-950">₱15,000+</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    Final pricing may change depending on required features and scope.
                </p>
            </div>

            <Button className="h-11 w-full rounded-xl bg-blue-700 font-semibold text-white hover:bg-blue-800">
                Proceed to Order Request
            </Button>
        </div>
    );
}

function CartDetail({ item }: { item: CartItem }) {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <ShoppingCart className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        More details
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.details}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm text-slate-500">Starting price</span>
                    <span className="font-bold text-blue-700">{item.price}</span>
                </div>
            </div>

            <Button className="h-11 w-full rounded-xl bg-blue-700 font-semibold text-white hover:bg-blue-800">
                Continue Order Request
            </Button>
        </div>
    );
}

function MessagesDrawerContent() {
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchMessages() {
        setFetching(true);

        try {
            const response = await axios.get('/messages');
            setMessages(response.data.messages ?? []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setFetching(false);
        }
    }

    async function sendMessage() {
        if (!text.trim() || loading) return;

        setLoading(true);

        try {
            await axios.post('/messages', {
                message: text,
            });

            setText('');
            await fetchMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatMessageTime(date?: string | null) {
        if (!date) return '';

        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className="flex min-h-[calc(100vh-140px)] flex-col">
            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-white">
                        <MessageCircle className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-950">Admin Support</h3>
                        <p className="text-sm text-slate-500">Direct conversation with admin</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {fetching && (
                    <p className="py-8 text-center text-sm text-slate-400">
                        Loading messages...
                    </p>
                )}

                {!fetching && messages.length === 0 && (
                    <div className="py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <h4 className="mt-3 font-semibold text-slate-900">No messages yet</h4>
                        <p className="mt-1 text-sm text-slate-500">
                            Start your conversation with the admin.
                        </p>
                    </div>
                )}

                {!fetching &&
                    messages.map((msg) => {
                        const isAdmin = msg.sender_type === 'admin';

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                                        isAdmin
                                            ? 'rounded-bl-md bg-slate-100 text-slate-700'
                                            : 'rounded-br-md bg-blue-700 text-white'
                                    }`}
                                >
                                    {msg.message}

                                    <p
                                        className={`mt-1 text-[11px] ${
                                            isAdmin ? 'text-slate-400' : 'text-right text-blue-100'
                                        }`}
                                    >
                                        {isAdmin ? 'Admin' : 'You'}
                                        {msg.created_at ? ` • ${formatMessageTime(msg.created_at)}` : ''}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                <div ref={chatEndRef} />
            </div>

            <div className="sticky bottom-0 mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-end gap-2">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        rows={1}
                        placeholder="Type your message..."
                        className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <Button
                        type="button"
                        onClick={sendMessage}
                        disabled={loading || !text.trim()}
                        className="h-11 rounded-xl bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function NotificationsDrawerContent({
    onSelectItem,
}: {
    onSelectItem: (item: NotificationItem) => void;
}) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        setLoading(true);

        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications ?? []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    async function openNotification(item: NotificationItem) {
        try {
            const response = await axios.get(`/notifications/${item.id}`);
            const notification = response.data.notification ?? {
                ...item,
                is_read: 0,
                read_at: new Date().toISOString(),
            };

            setNotifications((current) =>
                current.map((notif) =>
                    notif.id === item.id ? { ...notif, is_read: 0, read_at: notification.read_at } : notif,
                ),
            );

            onSelectItem(notification);
        } catch (error) {
            console.error('Failed to open notification:', error);
            onSelectItem(item);
        }
    }

    async function markAllAsRead() {
        setMarkingAll(true);

        try {
            await axios.post('/notifications/read-all');

            setNotifications((current) =>
                current.map((notif) => ({
                    ...notif,
                    is_read: 0,
                    read_at: notif.read_at ?? new Date().toISOString(),
                })),
            );
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        } finally {
            setMarkingAll(false);
        }
    }

    function formatNotificationTime(date?: string | null) {
        if (!date) return 'Recently';

        return new Date(date).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white">
                        <Bell className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-950">System updates</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Click a notification to view more details.
                        </p>
                    </div>
                </div>
            </div>

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
                        <h4 className="mt-3 font-semibold text-slate-900">No notifications</h4>
                        <p className="mt-1 text-sm text-slate-500">
                            You have no system updates yet.
                        </p>
                    </div>
                )}

                {!loading &&
                    notifications.map((item) => {
                        const isUnread = item.is_read === 1;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => openNotification(item)}
                                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40 ${
                                    isUnread
                                        ? 'border-blue-200 bg-blue-50/70'
                                        : 'border-slate-200 bg-white'
                                }`}
                            >
                                <div className="flex gap-3">
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                            isUnread
                                                ? 'bg-blue-700 text-white'
                                                : 'bg-slate-100 text-blue-700'
                                        }`}
                                    >
                                        {item.type === 'message' ? (
                                            <MessageCircle className="h-5 w-5" />
                                        ) : item.type === 'order' ? (
                                            <Package className="h-5 w-5" />
                                        ) : (
                                            <CheckCircle2 className="h-5 w-5" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-slate-950">
                                                {item.title}
                                            </h4>

                                            {isUnread && (
                                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-700" />
                                            )}
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                            {item.message}
                                        </p>

                                        <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatNotificationTime(item.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={markAllAsRead}
                disabled={markingAll || notifications.length === 0}
                className="h-11 w-full rounded-xl border-slate-200 bg-white font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
                {markingAll ? 'Marking...' : 'Mark All as Read'}
            </Button>
        </div>
    );
}

function NotificationDetail({ item }: { item: NotificationItem }) {
    function formatNotificationTime(date?: string | null) {
        if (!date) return 'Recently';

        return new Date(date).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    {item.type === 'message' ? (
                        <MessageCircle className="h-6 w-6" />
                    ) : item.type === 'order' ? (
                        <Package className="h-6 w-6" />
                    ) : (
                        <CheckCircle2 className="h-6 w-6" />
                    )}
                </div>

                <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h3>

                <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatNotificationTime(item.created_at)}
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Details
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p>
                </div>

                <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Status
                    </p>
                    <p className="mt-2 text-sm font-medium text-green-700">Read</p>
                </div>
            </div>
        </div>
    );
}