import { AdminMessageDrawer } from '@/components/admin-ui/admin-message-drawer';
import { AdminNotificationDrawer } from '@/components/admin-ui/admin-notification-drawer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import {
    Bell,
    Boxes,
    CreditCard,
    LayoutDashboard,
    Menu,
    MessageSquare,
    Settings,
    ShoppingCart,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type ActiveDrawer = 'messages' | 'notifications' | null;

type HeaderContext = {
    label: string;
    icon: LucideIcon;
};

function resolveContext(breadcrumbs: BreadcrumbItemType[]): HeaderContext {
    const text = breadcrumbs.map((item) => item.title.toLowerCase()).join(' ');

    if (
        text.includes('subscription') ||
        text.includes('transaction') ||
        text.includes('order')
    ) {
        return { label: 'Commerce Control', icon: CreditCard };
    }

    if (text.includes('user')) {
        return { label: 'Account Management', icon: Users };
    }

    if (
        text.includes('product') ||
        text.includes('service') ||
        text.includes('plan')
    ) {
        return { label: 'Product Platform', icon: Boxes };
    }

    if (
        text.includes('setting') ||
        text.includes('appearance') ||
        text.includes('privacy')
    ) {
        return { label: 'Platform Settings', icon: Settings };
    }

    if (text.includes('payment')) {
        return { label: 'Payment Operations', icon: ShoppingCart };
    }

    return { label: 'JCM Flagship', icon: LayoutDashboard };
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { toggleSidebar } = useSidebar();
    const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null);

    useEffect(() => {
        const handleOpenDrawer = (event: Event) => {
            const drawer = (event as CustomEvent<ActiveDrawer>).detail;

            if (drawer === 'messages' || drawer === 'notifications') {
                setActiveDrawer(drawer);
            }
        };

        window.addEventListener('admin-drawer-open', handleOpenDrawer);

        return () =>
            window.removeEventListener(
                'admin-drawer-open',
                handleOpenDrawer,
            );
    }, []);

    const context = resolveContext(breadcrumbs);
    const ContextIcon = context.icon;
    const activePage =
        breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';

    const messageButtonClass =
        activeDrawer === 'messages'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground';

    const notificationButtonClass =
        activeDrawer === 'notifications'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground';

    return (
        <>
            <header className="border-border/60 sticky top-4 z-30 mx-4 mt-4 flex min-h-[68px] items-center justify-between gap-3 rounded-2xl border bg-[var(--header-background,var(--card))] px-3 py-2.5 shadow-[0_12px_38px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:px-4 dark:shadow-[0_14px_42px_rgba(0,0,0,0.24)]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_12%_30%,var(--theme-soft),transparent_30%)]" />

                <div className="relative flex min-w-0 flex-1 items-center gap-2.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                        className="text-muted-foreground hover:bg-muted/70 hover:text-foreground size-9 rounded-lg"
                    >
                        <Menu className="size-4" />
                    </Button>

                    <div className="bg-border/60 hidden h-8 w-px sm:block" />

                    <span className="border-primary/20 bg-primary/10 text-primary hidden size-9 shrink-0 items-center justify-center rounded-xl border sm:inline-flex">
                        <ContextIcon className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-muted-foreground truncate text-[9px] font-semibold tracking-[0.12em] uppercase">
                                {context.label}
                            </p>

                            <span className="border-primary/15 bg-primary/[0.07] text-primary hidden rounded-full border px-2 py-0.5 text-[7px] font-semibold tracking-[0.1em] uppercase xl:inline-flex">
                                Admin Workspace
                            </span>
                        </div>

                        <p className="text-foreground mt-0.5 truncate text-xs font-semibold">
                            {activePage}
                        </p>
                    </div>

                    <div className="bg-border/60 mx-2 hidden h-8 w-px 2xl:block" />

                    <div className="hidden min-w-0 2xl:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <div className="relative ml-auto flex shrink-0 items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            setActiveDrawer((current) =>
                                current === 'messages'
                                    ? null
                                    : 'messages',
                            )
                        }
                        className={`relative size-9 rounded-lg transition-colors duration-200 ${messageButtonClass}`}
                        aria-label="Messages"
                        aria-pressed={activeDrawer === 'messages'}
                    >
                        <MessageSquare className="size-4" />

                        <span
                            aria-hidden="true"
                            className="bg-primary ring-[var(--header-background,var(--card))] absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2"
                        />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            setActiveDrawer((current) =>
                                current === 'notifications'
                                    ? null
                                    : 'notifications',
                            )
                        }
                        className={`relative size-9 rounded-lg transition-colors duration-200 ${notificationButtonClass}`}
                        aria-label="Notifications"
                        aria-pressed={activeDrawer === 'notifications'}
                    >
                        <Bell className="size-4" />

                        <span
                            aria-hidden="true"
                            className="bg-primary ring-[var(--header-background,var(--card))] absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2"
                        />
                    </Button>

                    <div className="hidden sm:block">
                        <NavUser />
                    </div>
                </div>
            </header>

            <AdminMessageDrawer
                open={activeDrawer === 'messages'}
                onOpenChange={(open) =>
                    !open && setActiveDrawer(null)
                }
            />

            <AdminNotificationDrawer
                open={activeDrawer === 'notifications'}
                onOpenChange={(open) =>
                    !open && setActiveDrawer(null)
                }
            />
        </>
    );
}