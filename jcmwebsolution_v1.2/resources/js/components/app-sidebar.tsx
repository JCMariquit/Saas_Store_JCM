import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type AdminSidebarGroup, type AdminSidebarItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as Icons from 'lucide-react';
import { ChevronDown, Circle, Sparkles, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AppLogo from './app-logo';

const iconMap = Icons as unknown as Record<string, LucideIcon>;

function resolveIcon(key?: string | null): LucideIcon {
    return (key && iconMap[key]) || Circle;
}

function normalizeUrl(value: string): string {
    const clean = value.split('?')[0].replace(/\/+$/, '');

    return clean || '/';
}

function isActive(currentUrl: string, targetUrl: string): boolean {
    if (!targetUrl || targetUrl === '#') {
        return false;
    }

    const current = normalizeUrl(currentUrl);
    const target = normalizeUrl(targetUrl);

    return current === target || current.startsWith(`${target}/`);
}

function resolveActiveGroupKey(currentUrl: string, groups: AdminSidebarGroup[]): string | null {
    return groups.find((group) => group.collapsible && group.items.some((item) => isActive(currentUrl, item.url)))?.key ?? null;
}

function Badge({ value }: { value?: string | null }) {
    if (!value) {
        return null;
    }

    const normalized = value.trim().toLowerCase();
    const tone =
        {
            live: 'border-emerald-500/15 bg-emerald-500/[0.075] text-emerald-400',
            core: 'border-blue-500/15 bg-blue-500/[0.075] text-blue-400',
            dynamic: 'border-violet-500/15 bg-violet-500/[0.075] text-violet-400',
            new: 'border-emerald-500/15 bg-emerald-500/[0.075] text-emerald-400',
            dev: 'border-sky-500/15 bg-sky-500/[0.075] text-sky-400',
            beta: 'border-violet-500/15 bg-violet-500/[0.075] text-violet-400',
            test: 'border-amber-500/15 bg-amber-500/[0.075] text-amber-400',
        }[normalized] ?? 'border-slate-500/15 bg-slate-500/[0.07] text-slate-400';

    return (
        <span
            className={cn(
                'ml-auto inline-flex h-5 shrink-0 items-center rounded-full border px-1.5',
                'text-[8px] font-semibold tracking-[0.08em] uppercase',
                tone,
            )}
        >
            {value}
        </span>
    );
}

function DirectItem({ item, currentUrl, collapsed }: { item: AdminSidebarItem; currentUrl: string; collapsed: boolean }) {
    const ItemIcon = resolveIcon(item.icon);
    const active = isActive(currentUrl, item.url);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                    'group relative h-10 overflow-hidden rounded-xl border border-transparent',
                    'text-[13px] transition-all duration-200',
                    collapsed ? 'size-10 justify-center px-0' : 'w-full px-2.5',
                    active
                        ? 'border-primary/25 bg-primary/10 text-primary shadow-sm'
                        : 'text-sidebar-foreground/58 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground',
                )}
            >
                <Link href={item.url} className={cn('flex h-full w-full items-center', collapsed ? 'justify-center' : 'gap-2.5')}>
                    {active && <span aria-hidden="true" className="bg-primary absolute inset-y-2 left-0 w-0.5 rounded-r-full" />}

                    <span
                        className={cn(
                            'relative flex size-7 shrink-0 items-center justify-center rounded-lg border',
                            'transition-all duration-200',
                            active
                                ? 'border-primary/25 bg-primary/15 text-primary'
                                : 'text-sidebar-foreground/40 group-hover:border-primary/20 group-hover:bg-primary/[0.06] group-hover:text-primary border-transparent bg-transparent',
                        )}
                    >
                        <ItemIcon className="size-[15px]" />

                        {active && collapsed && (
                            <span aria-hidden="true" className="bg-primary ring-sidebar absolute -top-0.5 -right-0.5 size-1.5 rounded-full ring-2" />
                        )}
                    </span>

                    {!collapsed && (
                        <>
                            <span className={cn('min-w-0 flex-1 truncate text-left', active ? 'font-semibold' : 'font-medium')}>{item.title}</span>
                            <Badge value={item.badge} />
                        </>
                    )}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function GroupChild({ item, currentUrl }: { item: AdminSidebarItem; currentUrl: string }) {
    const ItemIcon = resolveIcon(item.icon);
    const active = isActive(currentUrl, item.url);

    return (
        <Link
            href={item.url}
            className={cn(
                'group relative flex h-9 w-full items-center gap-2 overflow-hidden rounded-lg',
                'border border-transparent px-2.5 text-left text-[12px] font-medium',
                'transition-all duration-200',
                active
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'text-sidebar-foreground/52 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground',
            )}
        >
            {active && <span aria-hidden="true" className="bg-primary absolute inset-y-2 left-0 w-0.5 rounded-r-full" />}

            <span
                className={cn(
                    'relative inline-flex size-6 shrink-0 items-center justify-center rounded-md',
                    'transition-colors duration-200',
                    active
                        ? 'border-primary/25 bg-primary/15 text-primary border'
                        : 'text-sidebar-foreground/35 group-hover:bg-background/50 group-hover:text-sidebar-foreground/65',
                )}
            >
                <ItemIcon className="size-[13px]" />
            </span>

            <span className="min-w-0 flex-1 truncate">{item.title}</span>
            <Badge value={item.badge} />
        </Link>
    );
}

function CollapsibleGroup({
    group,
    currentUrl,
    collapsed,
    open,
    onOpenChange,
}: {
    group: AdminSidebarGroup;
    currentUrl: string;
    collapsed: boolean;
    open: boolean;
    onOpenChange: (groupKey: string | null) => void;
}) {
    const { toggleSidebar } = useSidebar();
    const GroupIcon = resolveIcon(group.icon);
    const activeGroup = group.items.some((item) => isActive(currentUrl, item.url));

    if (collapsed) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    type="button"
                    tooltip={group.title}
                    onClick={() => {
                        onOpenChange(group.key);
                        toggleSidebar();
                    }}
                    className={cn(
                        'group relative size-10 justify-center overflow-hidden rounded-xl border px-0',
                        'transition-all duration-200',
                        activeGroup
                            ? 'border-primary/25 bg-primary/10 text-primary shadow-sm'
                            : 'text-sidebar-foreground/42 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground border-transparent',
                    )}
                >
                    {activeGroup && <span aria-hidden="true" className="bg-primary absolute inset-y-2 left-0 w-0.5 rounded-r-full" />}

                    <span
                        className={cn(
                            'relative flex size-7 shrink-0 items-center justify-center rounded-lg border',
                            'transition-all duration-200',
                            activeGroup
                                ? 'border-primary/25 bg-primary/15 text-primary'
                                : 'text-sidebar-foreground/40 group-hover:border-primary/20 group-hover:bg-primary/[0.06] group-hover:text-primary border-transparent',
                        )}
                    >
                        <GroupIcon className="size-[15px]" />

                        {activeGroup && (
                            <span aria-hidden="true" className="bg-primary ring-sidebar absolute -top-0.5 -right-0.5 size-1.5 rounded-full ring-2" />
                        )}
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={() => onOpenChange(open ? null : group.key)}
                aria-expanded={open}
                className={cn(
                    'group relative flex h-10 w-full items-center gap-2.5 overflow-hidden',
                    'rounded-xl border px-2.5 text-[13px] transition-all duration-200',
                    activeGroup
                        ? 'border-primary/25 bg-primary/10 text-primary shadow-sm'
                        : 'text-sidebar-foreground/58 hover:border-primary/15 hover:bg-primary/[0.05] hover:text-sidebar-foreground border-transparent',
                )}
            >
                {activeGroup && <span aria-hidden="true" className="bg-primary absolute inset-y-2 left-0 w-0.5 rounded-r-full" />}

                <span
                    className={cn(
                        'relative flex size-7 shrink-0 items-center justify-center rounded-lg border',
                        'transition-all duration-200',
                        activeGroup
                            ? 'border-primary/25 bg-primary/15 text-primary'
                            : 'text-sidebar-foreground/40 group-hover:border-primary/20 group-hover:bg-primary/[0.06] group-hover:text-primary border-transparent',
                    )}
                >
                    <GroupIcon className="size-[15px]" />
                </span>

                <span className={cn('min-w-0 flex-1 truncate text-left', activeGroup ? 'font-semibold' : 'font-medium')}>{group.title}</span>

                <span className="text-sidebar-foreground/30 hidden text-[8px] tabular-nums 2xl:inline">{group.items.length}</span>

                <ChevronDown
                    className={cn('text-sidebar-foreground/35 size-3.5 shrink-0', 'transition-transform duration-200', open && 'rotate-180')}
                />
            </button>

            {open && (
                <div className={cn('ml-[18px] space-y-0.5 border-l pl-3', activeGroup ? 'border-primary/25' : 'border-border/45')}>
                    {group.items.map((item) => (
                        <GroupChild key={item.key} item={item} currentUrl={currentUrl} />
                    ))}
                </div>
            )}
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-2 px-5">
            <span className="bg-primary/50 size-1 rounded-full" />
            <p className="text-sidebar-foreground/35 text-[9px] font-semibold tracking-[0.16em] uppercase">{title}</p>
            <span className="bg-primary/15 h-px min-w-0 flex-1" />
        </div>
    );
}

export function AppSidebar() {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';
    const { url, props } = usePage<SharedData>();
    const menuGroups = useMemo<AdminSidebarGroup[]>(() => props.adminSidebar ?? [], [props.adminSidebar]);
    const activeGroupKey = useMemo(() => resolveActiveGroupKey(url, menuGroups), [menuGroups, url]);
    const [openGroupKey, setOpenGroupKey] = useState<string | null>(activeGroupKey);
    const overviewGroups = useMemo(() => menuGroups.filter((group) => !group.collapsible), [menuGroups]);
    const managementGroups = useMemo(() => menuGroups.filter((group) => group.collapsible), [menuGroups]);

    useEffect(() => {
        if (activeGroupKey) {
            setOpenGroupKey(activeGroupKey);
        }
    }, [activeGroupKey]);

    const settingsItem: AdminSidebarItem = {
        key: 'platform-settings',
        title: 'Platform Settings',
        url: '/settings/profile',
        icon: 'Settings',
        badge: null,
    };

    return (
        <>
            <style>{`
                .flagship-sidebar-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--scrollbar-thumb) transparent;
                }

                .flagship-sidebar-scrollbar::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }

                .flagship-sidebar-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .flagship-sidebar-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--scrollbar-thumb);
                    border: 2px solid transparent;
                    border-radius: 999px;
                    background-clip: padding-box;
                }

                .flagship-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--scrollbar-thumb-hover);
                    background-clip: padding-box;
                }
            `}</style>

            <Sidebar
                collapsible="icon"
                variant="sidebar"
                className="border-border/45 bg-sidebar/95 text-sidebar-foreground h-screen overflow-hidden border-r backdrop-blur-xl"
            >
                <SidebarHeader className={cn('border-border/35 border-b pt-4 pb-4 transition-all duration-200', collapsed ? 'px-2' : 'px-3')}>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                tooltip="JCM Websolution Flagship"
                                className={cn(
                                    'app-theme-brand-card h-auto overflow-hidden rounded-2xl border',
                                    'transition-all duration-200',
                                    collapsed ? 'size-11 justify-center p-0' : 'w-full p-2.5',
                                )}
                            >
                                <Link href="/admin/dashboard" className={cn('flex min-w-0 items-center', collapsed ? 'justify-center' : 'gap-3')}>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent
                    className={cn(
                        'flagship-sidebar-scrollbar overflow-x-hidden overflow-y-auto',
                        'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.008),transparent_22%)]',
                        'transition-all duration-200',
                        collapsed ? 'gap-2 px-2 py-3' : 'gap-5 px-0 py-4',
                    )}
                >
                    {overviewGroups.map((group) => (
                        <section key={group.key} className={collapsed ? 'space-y-1' : 'space-y-2 pb-1'}>
                            {!collapsed && <SectionHeader title={group.title} />}

                            <SidebarMenu className={cn(collapsed ? 'items-center space-y-1 px-0' : 'space-y-0.5 px-3')}>
                                {group.items.map((item) => (
                                    <DirectItem key={item.key} item={item} currentUrl={url} collapsed={collapsed} />
                                ))}
                            </SidebarMenu>
                        </section>
                    ))}

                    <section className={collapsed ? 'space-y-1' : 'space-y-2 pb-1'}>
                        {!collapsed && <SectionHeader title="Management" />}

                        {collapsed ? (
                            <SidebarMenu className="items-center space-y-1 px-0">
                                {managementGroups.map((group) => (
                                    <CollapsibleGroup
                                        key={group.key}
                                        group={group}
                                        currentUrl={url}
                                        collapsed
                                        open={openGroupKey === group.key}
                                        onOpenChange={setOpenGroupKey}
                                    />
                                ))}

                                <DirectItem item={settingsItem} currentUrl={url} collapsed />
                            </SidebarMenu>
                        ) : (
                            <div className="space-y-1 px-3">
                                {managementGroups.map((group) => (
                                    <CollapsibleGroup
                                        key={group.key}
                                        group={group}
                                        currentUrl={url}
                                        collapsed={false}
                                        open={openGroupKey === group.key}
                                        onOpenChange={setOpenGroupKey}
                                    />
                                ))}

                                <SidebarMenu className="space-y-0.5 pt-1">
                                    <DirectItem item={settingsItem} currentUrl={url} collapsed={false} />
                                </SidebarMenu>
                            </div>
                        )}
                    </section>
                </SidebarContent>

                <SidebarFooter className={cn('border-border/35 border-t transition-all duration-200', collapsed ? 'p-2' : 'px-3 py-2.5')}>
                    <Link
                        href="/admin/dashboard"
                        aria-label="Central Platform"
                        className={cn(
                            'app-theme-access-card group relative flex overflow-hidden rounded-2xl border',
                            'hover:border-primary/25 hover:bg-primary/[0.04] transition-all duration-200',
                            collapsed ? 'size-10 items-center justify-center p-0' : 'w-full items-center gap-2.5 p-3',
                        )}
                    >
                        <div className="bg-primary/10 pointer-events-none absolute -right-8 -bottom-10 size-24 rounded-full blur-3xl" />

                        <span className="app-theme-access-icon relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-105">
                            <Sparkles className="size-3.5" />
                        </span>

                        {!collapsed && (
                            <>
                                <div className="relative min-w-0 flex-1">
                                    <p className="text-sidebar-foreground/35 text-[8px] font-semibold tracking-[0.13em] uppercase">
                                        Central platform
                                    </p>
                                    <p className="text-sidebar-foreground/80 mt-0.5 truncate text-[11px] font-semibold">JCM Websolution</p>
                                </div>

                                <span className="border-primary/15 bg-primary/[0.07] text-primary relative inline-flex shrink-0 rounded-full border px-1.5 py-1 text-[7px] font-semibold tracking-[0.08em] uppercase">
                                    Admin
                                </span>
                            </>
                        )}
                    </Link>
                </SidebarFooter>
            </Sidebar>
        </>
    );
}

export default AppSidebar;
