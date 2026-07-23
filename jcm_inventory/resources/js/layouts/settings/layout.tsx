import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    KeyRound,
    Palette,
    Settings2,
    UserRound,
    type LucideIcon,
} from 'lucide-react';
import { type ReactNode } from 'react';

type SettingsNavItem = {
    title: string;
    description: string;
    url: string;
    icon: LucideIcon;
};

const sidebarNavItems: SettingsNavItem[] = [
    {
        title: 'Profile',
        description: 'Identity and email',
        url: '/settings/profile',
        icon: UserRound,
    },
    {
        title: 'Password',
        description: 'Account security',
        url: '/settings/password',
        icon: KeyRound,
    },
    {
        title: 'Appearance',
        description: 'Theme preferences',
        url: '/settings/appearance',
        icon: Palette,
    },
];

export default function SettingsLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <div className="w-full min-w-0 px-4 py-5 md:px-5 md:py-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <Heading
                    title="Settings"
                    description="Manage your profile and account settings"
                />

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.055] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-emerald-300">
                    <Settings2 className="size-3.5" />
                    Account workspace
                </div>
            </div>

            <div className="grid w-full min-w-0 gap-5 lg:grid-cols-[210px_minmax(0,1fr)] xl:gap-6">
                <aside className="w-full min-w-0">
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/35 lg:sticky lg:top-4">
                        <div className="border-b border-border/60 px-4 py-3.5">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                                Account settings
                            </p>
                            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                Configure your personal access and interface preferences.
                            </p>
                        </div>

                        <nav className="space-y-1 p-2">
                            {sidebarNavItems.map((item) => {
                                const Icon = item.icon;
                                const active = currentPath === item.url;

                                return (
                                    <Button
                                        key={item.url}
                                        type="button"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'group h-auto w-full justify-start rounded-xl px-3 py-2.5 text-left',
                                            active
                                                ? 'border border-emerald-500/15 bg-emerald-500/[0.07] text-foreground hover:bg-emerald-500/[0.09]'
                                                : 'border border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/[0.04] hover:text-foreground',
                                        )}
                                    >
                                        <Link href={item.url} prefetch>
                                            <span
                                                className={cn(
                                                    'flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                                                    active
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-border/70 bg-background/35 text-muted-foreground group-hover:text-foreground',
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[11px] font-semibold">
                                                    {item.title}
                                                </span>
                                                <span className="mt-0.5 block truncate text-[9px] font-normal text-muted-foreground">
                                                    {item.description}
                                                </span>
                                            </span>

                                            <ChevronRight
                                                className={cn(
                                                    'size-3.5 shrink-0 transition-transform',
                                                    active
                                                        ? 'translate-x-0.5 text-emerald-400'
                                                        : 'text-muted-foreground/60 group-hover:translate-x-0.5',
                                                )}
                                            />
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>

                        <div className="border-t border-border/60 px-4 py-3">
                            <p className="text-[9px] leading-4 text-muted-foreground">
                                Settings apply to your authenticated JCM Inventory account.
                            </p>
                        </div>
                    </div>
                </aside>

                <Separator className="lg:hidden" />

                <main className="w-full min-w-0">
                    <section className="w-full min-w-0 space-y-5">
                        {children}
                    </section>
                </main>
            </div>
        </div>
    );
}