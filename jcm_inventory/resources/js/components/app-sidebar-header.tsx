import {
    Bell,
    Boxes,
    Building2,
    LayoutDashboard,
    Menu,
    MessageSquare,
    Search,
    Settings,
    Truck,
    Users,
    Warehouse,
    type LucideIcon,
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

type HeaderContext = {
    label: string;
    icon: LucideIcon;
    iconClassName: string;
    glowClassName: string;
    badgeClassName: string;
};

const headerContexts: Array<{
    keywords: string[];
    context: HeaderContext;
}> = [
    {
        keywords: ['team management', 'team members', 'roles & access'],
        context: {
            label: 'Team Management',
            icon: Users,
            iconClassName:
                'border-violet-500/20 bg-violet-500/10 text-violet-400',
            glowClassName:
                'bg-[radial-gradient(circle_at_12%_30%,rgba(139,92,246,0.08),transparent_28%)]',
            badgeClassName:
                'border-violet-500/15 bg-violet-500/[0.07] text-violet-300',
        },
    },
    {
        keywords: ['suppliers', 'purchase orders', 'receiving'],
        context: {
            label: 'Supplier Management',
            icon: Truck,
            iconClassName:
                'border-amber-500/20 bg-amber-500/10 text-amber-400',
            glowClassName:
                'bg-[radial-gradient(circle_at_12%_30%,rgba(245,158,11,0.075),transparent_28%)]',
            badgeClassName:
                'border-amber-500/15 bg-amber-500/[0.07] text-amber-300',
        },
    },
    {
        keywords: ['warehouse', 'warehouses'],
        context: {
            label: 'Warehouse Operations',
            icon: Warehouse,
            iconClassName:
                'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
            glowClassName:
                'bg-[radial-gradient(circle_at_12%_30%,rgba(34,211,238,0.075),transparent_28%)]',
            badgeClassName:
                'border-cyan-500/15 bg-cyan-500/[0.07] text-cyan-300',
        },
    },
    {
        keywords: ['branches', 'branch'],
        context: {
            label: 'Branch Network',
            icon: Building2,
            iconClassName:
                'border-blue-500/20 bg-blue-500/10 text-blue-400',
            glowClassName:
                'bg-[radial-gradient(circle_at_12%_30%,rgba(59,130,246,0.075),transparent_28%)]',
            badgeClassName:
                'border-blue-500/15 bg-blue-500/[0.07] text-blue-300',
        },
    },
    {
        keywords: [
            'inventory',
            'categories',
            'products',
            'stocks',
            'stock management',
            'stock movements',
        ],
        context: {
            label: 'Inventory Management',
            icon: Boxes,
            iconClassName:
                'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
            glowClassName:
                'bg-[radial-gradient(circle_at_12%_30%,rgba(16,185,129,0.075),transparent_28%)]',
            badgeClassName:
                'border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-300',
        },
    },
    {
        keywords: ['settings'],
        context: {
            label: 'System Settings',
            icon: Settings,
            iconClassName:
                'border-slate-500/20 bg-slate-500/10 text-slate-300',
            glowClassName:
                'bg-[radial-gradient(circle_at_12%_30%,rgba(148,163,184,0.06),transparent_28%)]',
            badgeClassName:
                'border-slate-500/15 bg-slate-500/[0.07] text-slate-300',
        },
    },
];

const defaultContext: HeaderContext = {
    label: 'JCM Inventory',
    icon: LayoutDashboard,
    iconClassName: 'border-primary/20 bg-primary/10 text-primary',
    glowClassName:
        'bg-[radial-gradient(circle_at_12%_30%,rgba(59,130,246,0.07),transparent_28%)]',
    badgeClassName: 'border-primary/15 bg-primary/[0.07] text-primary',
};

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { toggleSidebar } = useSidebar();

    const activePage =
        breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';
    const parentPage =
        breadcrumbs.length > 1
            ? breadcrumbs[breadcrumbs.length - 2]?.title ?? defaultContext.label
            : defaultContext.label;

    const context = resolveHeaderContext(breadcrumbs);
    const ContextIcon = context.icon;

    const actionButtonClass = [
        'group relative flex size-9 shrink-0 items-center justify-center',
        'rounded-lg',
        'text-muted-foreground',
        'transition-all duration-200',
        'hover:bg-muted/70',
        'hover:text-foreground',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary/25',
        'disabled:pointer-events-none disabled:opacity-50',
    ].join(' ');

    const actionIconWrapClass = [
        'flex size-8 items-center justify-center',
        'rounded-lg',
        'border border-border/60',
        'bg-background/55',
        'transition-all duration-200',
        'group-hover:border-border',
        'group-hover:bg-background/80',
    ].join(' ');

    return (
        <TooltipProvider delayDuration={150}>
            <header
                className={[
                    'jcm-app-header',
                    'relative sticky top-4 z-30',
                    'mx-4 mt-4',
                    'flex min-h-[68px] shrink-0 items-center justify-between gap-3',
                    'overflow-visible rounded-2xl',
                    'border border-border/60',
                    'bg-card/80',
                    'px-3 py-2.5',
                    'shadow-[0_12px_38px_rgba(15,23,42,0.07)]',
                    'backdrop-blur-xl',
                    'transition-all duration-300',
                    'dark:shadow-[0_14px_42px_rgba(0,0,0,0.24)]',
                    'sm:px-4',
                ].join(' ')}
            >
                <div
                    aria-hidden="true"
                    className={[
                        'pointer-events-none absolute inset-0 overflow-hidden rounded-2xl',
                        context.glowClassName,
                    ].join(' ')}
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
                />

                {/* Left: sidebar toggle + module identity */}
                <div className="relative flex min-w-0 flex-1 items-center gap-2.5">
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
                                    <Menu className="size-[16px]" />
                                </span>
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Toggle sidebar
                        </TooltipContent>
                    </Tooltip>

                    <div className="hidden h-8 w-px bg-border/60 sm:block" />

                    <div className="flex min-w-0 items-center gap-2.5">
                        <span
                            className={[
                                'hidden size-9 shrink-0 items-center justify-center rounded-xl border shadow-sm sm:inline-flex',
                                context.iconClassName,
                            ].join(' ')}
                        >
                            <ContextIcon className="size-4" />
                        </span>

                        <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    {context.label}
                                </p>

                                <span
                                    className={[
                                        'hidden h-5 items-center rounded-full border px-2 text-[8px] font-semibold uppercase tracking-[0.09em] xl:inline-flex',
                                        context.badgeClassName,
                                    ].join(' ')}
                                >
                                    Workspace
                                </span>
                            </div>

                            <p className="mt-0.5 max-w-[190px] truncate text-xs font-semibold text-foreground sm:max-w-[240px]">
                                {activePage}
                            </p>
                        </div>
                    </div>

                    <div className="mx-1 hidden h-8 w-px bg-border/60 2xl:block" />

                    <div className="hidden min-w-0 2xl:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Center: global search */}
                <div className="relative hidden w-full max-w-[350px] lg:block xl:max-w-[390px]">
                    <div
                        className={[
                            'group/search flex h-10 items-center gap-2.5',
                            'rounded-xl',
                            'border border-border/60',
                            'bg-background/40',
                            'px-3',
                            'shadow-inner shadow-black/[0.015]',
                            'transition-all duration-200',
                            'focus-within:border-primary/25',
                            'focus-within:bg-background/70',
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
                                'text-xs text-foreground',
                                'outline-none',
                                'placeholder:text-muted-foreground/60',
                            ].join(' ')}
                        />

                        <span className="hidden h-6 min-w-6 items-center justify-center rounded-md border border-border/60 bg-card/80 px-1.5 text-[9px] font-medium text-muted-foreground xl:inline-flex">
                            /
                        </span>
                    </div>
                </div>

                {/* Right: utility controls */}
                <div className="relative flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-background/35 p-1 shadow-sm">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Search"
                                    className={`${actionButtonClass} lg:hidden`}
                                >
                                    <Search className="size-[15px]" />
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
                                    <MessageSquare className="size-[15px] text-sky-400" />
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
                                    <Bell className="size-[15px] text-amber-400" />

                                    <span
                                        aria-hidden="true"
                                        className="absolute right-[7px] top-[6px] size-2 rounded-full border-2 border-card bg-amber-400 shadow-[0_0_0_2px_rgba(245,158,11,0.10)]"
                                    />
                                </Button>
                            </TooltipTrigger>

                            <TooltipContent side="bottom">
                                Notifications
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="hidden h-8 w-px bg-border/60 sm:block" />

                    <div
                        className={[
                            'flex min-h-10 items-center justify-center',
                            'rounded-xl',
                            'border border-border/60',
                            'bg-background/45',
                            'p-0.5',
                            'shadow-sm',
                            'transition-all duration-200',
                            'hover:border-border',
                            'hover:bg-background/65',
                        ].join(' ')}
                    >
                        <NavUser />
                    </div>
                </div>

                <span className="sr-only">
                    Current section: {parentPage}. Current page: {activePage}.
                </span>
            </header>
        </TooltipProvider>
    );
}

function resolveHeaderContext(
    breadcrumbs: BreadcrumbItemType[],
): HeaderContext {
    const breadcrumbText = breadcrumbs
        .map((breadcrumb) => breadcrumb.title)
        .join(' ')
        .toLowerCase();

    const matchedContext = headerContexts.find(({ keywords }) =>
        keywords.some((keyword) => breadcrumbText.includes(keyword)),
    );

    return matchedContext?.context ?? defaultContext;
}