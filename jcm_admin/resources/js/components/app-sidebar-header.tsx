import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, MessageCircle } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { AdminMessageDrawer } from './jcm-ui/admin-message-drawer';
import { AdminNotificationDrawer } from './jcm-ui/admin-notification-drawer';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [messageOpen, setMessageOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        fetchCounts();

        const interval = setInterval(fetchCounts, 5000);
        return () => clearInterval(interval);
    }, []);

    async function fetchCounts() {
        try {
            const [msgRes, notifRes] = await Promise.all([
                axios.get('/admin/messages'),
                axios.get('/admin/notifications'),
            ]);

            const threads = msgRes.data.threads ?? [];
            const notifications = notifRes.data.notifications ?? [];

            // unread messages = may unread_count sa threads
            const totalUnreadMsg = threads.reduce(
                (sum: number, item: any) => sum + (item.unread_count ?? 0),
                0,
            );

            const totalUnreadNotif = notifications.filter((n: any) => n.is_read === 1).length;

            setUnreadMessages(totalUnreadMsg);
            setUnreadNotifications(totalUnreadNotif);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 bg-[#0f1115] px-6 text-white md:px-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1 text-white hover:bg-white/10" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="flex items-center gap-3">
                    {/* MESSAGE ICON */}
                    <button
                        onClick={() => setMessageOpen(true)}
                        className="relative rounded-full p-2 hover:bg-white/10"
                    >
                        <MessageCircle className="h-5 w-5 text-white" />

                        {unreadMessages > 0 && (
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#0f1115]" />
                        )}
                    </button>

                    {/* NOTIFICATION ICON */}
                    <button
                        onClick={() => setNotificationOpen(true)}
                        className="relative rounded-full p-2 hover:bg-white/10"
                    >
                        <Bell className="h-5 w-5 text-white" />

                        {unreadNotifications > 0 && (
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#0f1115]" />
                        )}
                    </button>
                </div>
            </header>

            <AdminMessageDrawer open={messageOpen} onOpenChange={setMessageOpen} />
            <AdminNotificationDrawer open={notificationOpen} onOpenChange={setNotificationOpen} />
        </>
    );
}