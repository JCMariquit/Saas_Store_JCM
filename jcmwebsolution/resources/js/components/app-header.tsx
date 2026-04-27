import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Bell, ChevronLeft, Menu, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { CartDrawer } from '@/components/jcm-ui/drawers/cart-drawer';
import { MessagesDrawer } from '@/components/jcm-ui/drawers/messages-drawer';
import { NotificationsDrawer } from '@/components/jcm-ui/drawers/notifications-drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem, SharedData } from '@/types';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

type HeaderDrawerType = 'cart' | 'messages' | 'notifications';

type HeaderMessage = {
    is_read: number;
    sender_type: 'user' | 'admin';
};

type HeaderNotification = {
    is_read: number;
};

const headerActionItems: {
    key: HeaderDrawerType;
    title: string;
    icon: typeof ShoppingCart;
}[] = [
    { key: 'cart', title: 'Cart', icon: ShoppingCart },
    { key: 'messages', title: 'Messages', icon: MessageCircle },
    { key: 'notifications', title: 'Notifications', icon: Bell },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    const [activeDrawer, setActiveDrawer] = useState<HeaderDrawerType | null>(null);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    const previousBreadcrumb =
        breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

    const fetchHeaderCounts = useCallback(async () => {
        try {
            const [messageResponse, notificationResponse, cartResponse] = await Promise.all([
                axios.get('/messages'),
                axios.get('/notifications'),
                axios.get('/carts'),
            ]);

            const messages: HeaderMessage[] = messageResponse.data.messages ?? [];
            const notifications: HeaderNotification[] =
                notificationResponse.data.notifications ?? [];

            setUnreadMessages(
                messages.filter(
                    (item) => item.is_read === 1 && item.sender_type === 'admin',
                ).length,
            );

            setUnreadNotifications(
                notifications.filter((item) => item.is_read === 1).length,
            );

            setCartCount(Number(cartResponse.data.count ?? 0));
        } catch (error) {
            console.error('Failed to fetch header counts:', error);
        }
    }, []);

    useEffect(() => {
        void fetchHeaderCounts();

        const interval = window.setInterval(() => {
            void fetchHeaderCounts();
        }, 5000);

        const refreshHeaderCounts = () => {
            void fetchHeaderCounts();
        };

        window.addEventListener('cart:refresh', refreshHeaderCounts);
        window.addEventListener('message:refresh', refreshHeaderCounts);
        window.addEventListener('notification:refresh', refreshHeaderCounts);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener('cart:refresh', refreshHeaderCounts);
            window.removeEventListener('message:refresh', refreshHeaderCounts);
            window.removeEventListener('notification:refresh', refreshHeaderCounts);
        };
    }, [fetchHeaderCounts]);

    function getBadgeCount(itemKey: HeaderDrawerType) {
        if (itemKey === 'cart') return cartCount;
        if (itemKey === 'messages') return unreadMessages;
        if (itemKey === 'notifications') return unreadNotifications;

        return 0;
    }

    function openDrawer(itemKey: HeaderDrawerType) {
        setActiveDrawer(itemKey);
        void fetchHeaderCounts();

        if (itemKey === 'cart') {
            window.dispatchEvent(new Event('cart:refresh'));
        }

        if (itemKey === 'messages') {
            window.dispatchEvent(new Event('message:refresh'));
        }

        if (itemKey === 'notifications') {
            window.dispatchEvent(new Event('notification:refresh'));
        }
    }

    function closeDrawer(open: boolean) {
        if (!open) {
            setActiveDrawer(null);
            void fetchHeaderCounts();
        }
    }

    return (
        <>
            <div className="border-b border-sidebar-border/80 bg-white">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>

                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>

                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex flex-col space-y-3 text-sm">
                                        {breadcrumbs.length > 0 && (
                                            <div className="rounded-xl border border-sidebar-border/70 px-3 py-3">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                                                    Current Path
                                                </p>

                                                <div className="space-y-2">
                                                    {breadcrumbs.map((item, index) => {
                                                        const isLast =
                                                            index === breadcrumbs.length - 1;

                                                        return isLast ? (
                                                            <div
                                                                key={`${item.title}-${index}`}
                                                                className="font-medium text-foreground"
                                                            >
                                                                {item.title}
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                key={`${item.title}-${index}`}
                                                                href={item.href}
                                                                className="block text-neutral-600 transition hover:text-foreground"
                                                            >
                                                                {item.title}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto flex flex-col space-y-2 text-sm">
                                        {headerActionItems.map((item) => {
                                            const badgeCount = getBadgeCount(item.key);

                                            return (
                                                <button
                                                    key={item.title}
                                                    type="button"
                                                    onClick={() => openDrawer(item.key)}
                                                    className="relative flex items-center space-x-2 rounded-xl px-3 py-2 text-left font-medium transition hover:bg-accent"
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                    <span>{item.title}</span>

                                                    {badgeCount > 0 && (
                                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 text-[10px] font-bold text-white">
                                                            {badgeCount > 99
                                                                ? '99+'
                                                                : badgeCount}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={breadcrumbs[0]?.href || '/dashboard'}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    <div className="ml-4 hidden min-w-0 flex-1 items-center lg:flex">
                        {breadcrumbs.length > 1 && (
                            <div className="flex min-w-0 items-center gap-3">
                                {previousBreadcrumb && (
                                    <Link
                                        href={previousBreadcrumb.href}
                                        className="inline-flex items-center gap-1 rounded-md border border-sidebar-border/70 px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-accent hover:text-foreground"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </Link>
                                )}

                                <div className="min-w-0">
                                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="hidden lg:flex">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Ready for your business
                            </div>
                        </div>

                        <div className="hidden items-center gap-1 lg:flex">
                            {headerActionItems.map((item) => {
                                const badgeCount = getBadgeCount(item.key);

                                return (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => openDrawer(item.key)}
                                                    className="group relative inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                >
                                                    <span className="sr-only">{item.title}</span>
                                                    <item.icon className="size-5 opacity-80 group-hover:opacity-100" />

                                                    {badgeCount > 0 && (
                                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                                                            {badgeCount > 99
                                                                ? '99+'
                                                                : badgeCount}
                                                        </span>
                                                    )}
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <CartDrawer
                open={activeDrawer === 'cart'}
                onOpenChange={closeDrawer}
            />

            <MessagesDrawer
                open={activeDrawer === 'messages'}
                onOpenChange={closeDrawer}
            />

            <NotificationsDrawer
                open={activeDrawer === 'notifications'}
                onOpenChange={closeDrawer}
            />
        </>
    );
}