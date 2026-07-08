import {
    Bell,
    Menu,
    MessageSquare,
    Search,
} from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { toggleSidebar } = useSidebar();

    const actionButtonClass = [
        'group relative flex size-10 shrink-0 items-center justify-center',
        'rounded-[11px]',
        'text-muted-foreground',
        'transition-all duration-200',
        'hover:bg-accent/70',
        'hover:text-foreground',
        'hover:shadow-sm',
        'focus-visible:ring-2',
        'focus-visible:ring-primary/25',
    ].join(' ');

    const actionIconWrapClass = [
        'flex size-8 items-center justify-center',
        'rounded-[9px]',
        'border border-border/50',
        'bg-background/80',
        'shadow-[0_1px_5px_rgba(0,0,0,0.04)]',
        'transition-all duration-200',
        'group-hover:border-border',
        'group-hover:bg-background',
    ].join(' ');

    return (
        <header
            className={[
                'jcm-app-header',
                'sticky top-4 z-30',
                'mx-4 mt-4',
                'flex h-[68px] shrink-0 items-center justify-between gap-4',
                'rounded-[16px]',
                'border border-border/70',
                'bg-background/90',
                'px-4',
                'shadow-[0_10px_35px_rgba(15,23,42,0.05)]',
                'backdrop-blur-xl',
                'transition-all duration-300',
                'dark:bg-background/85',
                'dark:shadow-[0_10px_35px_rgba(0,0,0,0.18)]',
                'sm:px-5',
            ].join(' ')}
        >
            {/* Left section */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <TooltipProvider delayDuration={150}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                aria-label="Toggle sidebar"
                                className={actionButtonClass}
                            >
                                <span className={actionIconWrapClass}>
                                    <Menu className="size-[17px]" />
                                </span>
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Toggle sidebar
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="hidden h-8 w-px bg-border/70 sm:block" />

                <div className="min-w-0">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Center search */}
            <div className="hidden w-full max-w-[320px] lg:block">
                <div
                    className={[
                        'group/search flex h-10 items-center gap-2.5',
                        'rounded-[11px]',
                        'border border-border/60',
                        'bg-muted/35',
                        'px-3',
                        'transition-all duration-200',
                        'focus-within:border-primary/30',
                        'focus-within:bg-background',
                        'focus-within:ring-4',
                        'focus-within:ring-primary/5',
                    ].join(' ')}
                >
                    <Search className="size-4 shrink-0 text-muted-foreground/70 transition-colors group-focus-within/search:text-primary" />

                    <input
                        type="search"
                        placeholder="Search inventory..."
                        aria-label="Search inventory"
                        className={[
                            'min-w-0 flex-1 bg-transparent',
                            'text-sm text-foreground',
                            'outline-none',
                            'placeholder:text-muted-foreground/60',
                        ].join(' ')}
                    />

                    <span className="hidden rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:inline-flex">
                        /
                    </span>
                </div>
            </div>

            {/* Right section */}
            <div className="flex shrink-0 items-center gap-1">
                <TooltipProvider delayDuration={150}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Search"
                                className={`${actionButtonClass} lg:hidden`}
                            >
                                <span className={actionIconWrapClass}>
                                    <Search className="size-[16px] text-slate-500" />
                                </span>
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Search
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Messages"
                                className={actionButtonClass}
                            >
                                <span className={actionIconWrapClass}>
                                    <MessageSquare className="size-[16px] text-sky-500" />
                                </span>
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Messages
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Notifications"
                                className={actionButtonClass}
                            >
                                <span className={actionIconWrapClass}>
                                    <Bell className="size-[16px] text-amber-500" />
                                </span>

                                <span
                                    aria-hidden="true"
                                    className={[
                                        'absolute right-[7px] top-[7px]',
                                        'size-2.5 rounded-full',
                                        'border-2 border-background',
                                        'bg-amber-500',
                                        'shadow-[0_0_0_2px_rgba(245,158,11,0.10)]',
                                    ].join(' ')}
                                />
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Notifications
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="mx-1 hidden h-8 w-px bg-border/70 sm:block" />

                <div
                    className={[
                        'flex items-center justify-center',
                        'rounded-[13px]',
                        'border border-border/60',
                        'bg-background/80',
                        'p-0.5',
                        'shadow-[0_1px_6px_rgba(0,0,0,0.04)]',
                        'transition-all duration-200',
                        'hover:border-border',
                        'hover:shadow-sm',
                    ].join(' ')}
                >
                    <NavUser />
                </div>
            </div>
        </header>
    );
}