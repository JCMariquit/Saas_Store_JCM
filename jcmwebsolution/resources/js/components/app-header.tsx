import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Bell, ChevronLeft, Menu, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { HeaderActionDrawer, type HeaderDrawerType } from '@/components/jcm-ui/header-action-drawer';
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

const headerActionItems: {
    key: HeaderDrawerType;
    title: string;
    icon: typeof ShoppingCart;
}[] = [
    {
        key: 'cart',
        title: 'Cart',
        icon: ShoppingCart,
    },
    {
        key: 'messages',
        title: 'Messages',
        icon: MessageCircle,
    },
    {
        key: 'notifications',
        title: 'Notifications',
        icon: Bell,
    },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    const [activeDrawer, setActiveDrawer] = useState<HeaderDrawerType | null>(null);

    const previousBreadcrumb =
        breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

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
                                                        const isLast = index === breadcrumbs.length - 1;

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
                                        {headerActionItems.map((item) => (
                                            <button
                                                key={item.title}
                                                type="button"
                                                onClick={() => setActiveDrawer(item.key)}
                                                className="flex items-center space-x-2 rounded-xl px-3 py-2 text-left font-medium transition hover:bg-accent"
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.title}</span>
                                            </button>
                                        ))}
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
                        {breadcrumbs.length > 1 ? (
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
                        ) : null}
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="hidden lg:flex">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Ready for your business
                            </div>
                        </div>

                        <div className="hidden items-center gap-1 lg:flex">
                            {headerActionItems.map((item) => (
                                <TooltipProvider key={item.title} delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => setActiveDrawer(item.key)}
                                                className="group relative inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                            >
                                                <span className="sr-only">{item.title}</span>
                                                <item.icon className="size-5 opacity-80 group-hover:opacity-100" />

                                                {item.key !== 'cart' && (
                                                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                                                )}

                                                {item.key === 'cart' && (
                                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                                                        2
                                                    </span>
                                                )}
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
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

            <HeaderActionDrawer
                open={activeDrawer !== null}
                type={activeDrawer}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveDrawer(null);
                    }
                }}
            />
        </>
    );
}