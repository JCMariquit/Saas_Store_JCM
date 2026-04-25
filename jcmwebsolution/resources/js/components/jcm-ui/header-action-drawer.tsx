import { Bell, CheckCircle2, Clock, MessageCircle, Package, ShoppingCart, Trash2 } from 'lucide-react';

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

export function HeaderActionDrawer({ open, type, onOpenChange }: HeaderActionDrawerProps) {
    const drawerTitle =
        type === 'cart'
            ? 'Your Cart'
            : type === 'messages'
              ? 'Messages'
              : 'Notifications';

    const drawerDescription =
        type === 'cart'
            ? 'Review selected services before sending your order request.'
            : type === 'messages'
              ? 'View recent client and support messages.'
              : 'Stay updated with orders, services, and system alerts.';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-0 sm:max-w-md">
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
                    <SheetHeader className="space-y-1 text-left">
                        <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-slate-950">
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
                    {type === 'cart' && <CartDrawerContent />}
                    {type === 'messages' && <MessagesDrawerContent />}
                    {type === 'notifications' && <NotificationsDrawerContent />}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function CartDrawerContent() {
    const cartItems = [
        {
            title: 'Booking System',
            description: 'Online appointment and reservation system.',
            price: '₱15,000+',
        },
        {
            title: 'Admin Dashboard',
            description: 'Manage orders, clients, reports, and services.',
            price: 'Included',
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
                    <div
                        key={item.title}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="font-semibold text-slate-950">{item.title}</h4>
                                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                            </div>

                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Starting price
                            </span>
                            <span className="font-semibold text-blue-700">{item.price}</span>
                        </div>
                    </div>
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

function MessagesDrawerContent() {
    const messages = [
        {
            name: 'JCM Support',
            message: 'Your inquiry has been received. We will review your project details.',
            time: '2 min ago',
            unread: true,
        },
        {
            name: 'Project Team',
            message: 'Please prepare your preferred features so we can estimate the scope.',
            time: '1 hour ago',
            unread: true,
        },
        {
            name: 'System Notice',
            message: 'Your previous message was saved successfully.',
            time: 'Yesterday',
            unread: false,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-slate-950">Recent conversations</h3>
                <p className="mt-1 text-sm text-slate-500">
                    Keep track of your project inquiries and support messages.
                </p>
            </div>

            <div className="space-y-3">
                {messages.map((item) => (
                    <button
                        key={`${item.name}-${item.time}`}
                        type="button"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                <MessageCircle className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <h4 className="truncate font-semibold text-slate-950">{item.name}</h4>
                                    <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
                                </div>

                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.message}</p>
                            </div>

                            {item.unread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />}
                        </div>
                    </button>
                ))}
            </div>

            <Button variant="outline" className="h-11 w-full rounded-xl border-slate-200 bg-white font-semibold">
                View All Messages
            </Button>
        </div>
    );
}

function NotificationsDrawerContent() {
    const notifications = [
        {
            title: 'Order request ready',
            description: 'Your selected services are ready for review.',
            time: 'Just now',
            icon: Package,
        },
        {
            title: 'Message received',
            description: 'JCM Support sent a new project update.',
            time: '15 min ago',
            icon: MessageCircle,
        },
        {
            title: 'Request checked',
            description: 'Your inquiry was successfully recorded.',
            time: 'Today',
            icon: CheckCircle2,
        },
    ];

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
                            You have new activity related to your account and service requests.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {notifications.map((item) => (
                    <div
                        key={`${item.title}-${item.time}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                                <item.icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-slate-950">{item.title}</h4>
                                <p className="mt-1 text-sm text-slate-500">{item.description}</p>

                                <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    {item.time}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="outline" className="h-11 w-full rounded-xl border-slate-200 bg-white font-semibold">
                Mark All as Read
            </Button>
        </div>
    );
}