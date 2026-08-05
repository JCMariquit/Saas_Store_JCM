import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, DatabaseZap, KeyRound, Palette, ScrollText, Settings2, UserRound, UserX, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

type SettingsNavItem = {
    title: string;
    description: string;
    url: string;
    icon: LucideIcon;
    danger?: boolean;
};

type SettingsNavSection = {
    label: string;
    items: SettingsNavItem[];
};

const sidebarSections: SettingsNavSection[] = [
    {
        label: 'Account',
        items: [
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
                title: 'Login Activity',
                description: 'Sign-ins and devices',
                url: '/settings/login-activity',
                icon: ScrollText,
            },
            {
                title: 'Appearance',
                description: 'Theme preferences',
                url: '/settings/appearance',
                icon: Palette,
            },
        ],
    },
    {
        label: 'Privacy',
        items: [
            {
                title: 'Data & Privacy',
                description: 'Account data controls',
                url: '/settings/data-privacy',
                icon: DatabaseZap,
            },
            {
                title: 'Account Removal',
                description: 'Permanent account action',
                url: '/settings/account-removal',
                icon: UserX,
                danger: true,
            },
        ],
    },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <div className="w-full min-w-0 px-4 py-5 md:px-5 md:py-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <Heading title="Settings" description="Manage your account, security, appearance, and privacy" />

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.055] px-3 py-1.5 text-[9px] font-semibold tracking-[0.11em] text-emerald-300 uppercase">
                    <Settings2 className="size-3.5" />
                    Account workspace
                </div>
            </div>

            <div className="grid w-full min-w-0 gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:gap-6">
                <aside className="w-full min-w-0">
                    <div className="border-border/70 bg-card/35 overflow-hidden rounded-2xl border lg:sticky lg:top-4">
                        <div className="border-border/60 border-b px-4 py-3.5">
                            <p className="text-[9px] font-semibold tracking-[0.12em] text-emerald-300 uppercase">Account settings</p>
                            <p className="text-muted-foreground mt-1 text-[10px] leading-4">Personal access and privacy controls.</p>
                        </div>

                        <div className="space-y-3 p-2">
                            {sidebarSections.map((section) => (
                                <div key={section.label}>
                                    <p className="text-muted-foreground/75 px-3 pt-1 pb-1.5 text-[8px] font-semibold tracking-[0.14em] uppercase">
                                        {section.label}
                                    </p>

                                    <nav className="space-y-1">
                                        {section.items.map((item) => {
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
                                                        item.danger
                                                            ? active
                                                                ? 'border border-red-500/20 bg-red-500/[0.08] text-red-300 hover:bg-red-500/[0.1] hover:text-red-200'
                                                                : 'text-muted-foreground border border-transparent hover:border-red-500/15 hover:bg-red-500/[0.05] hover:text-red-300'
                                                            : active
                                                              ? 'text-foreground border border-emerald-500/15 bg-emerald-500/[0.07] hover:bg-emerald-500/[0.09]'
                                                              : 'text-muted-foreground hover:border-border/70 hover:bg-muted/[0.04] hover:text-foreground border border-transparent',
                                                    )}
                                                >
                                                    <Link href={item.url} prefetch>
                                                        <span
                                                            className={cn(
                                                                'flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                                                                item.danger
                                                                    ? active
                                                                        ? 'border-red-500/25 bg-red-500/10 text-red-300'
                                                                        : 'border-border/70 bg-background/35 text-muted-foreground group-hover:border-red-500/20 group-hover:text-red-300'
                                                                    : active
                                                                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                                      : 'border-border/70 bg-background/35 text-muted-foreground group-hover:text-foreground',
                                                            )}
                                                        >
                                                            <Icon className="size-4" />
                                                        </span>

                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-[11px] font-semibold">{item.title}</span>
                                                            <span className="text-muted-foreground mt-0.5 block truncate text-[9px] font-normal">
                                                                {item.description}
                                                            </span>
                                                        </span>

                                                        <ChevronRight
                                                            className={cn(
                                                                'size-3.5 shrink-0 transition-transform',
                                                                item.danger
                                                                    ? active
                                                                        ? 'translate-x-0.5 text-red-300'
                                                                        : 'text-muted-foreground/60 group-hover:translate-x-0.5 group-hover:text-red-300'
                                                                    : active
                                                                      ? 'translate-x-0.5 text-emerald-400'
                                                                      : 'text-muted-foreground/60 group-hover:translate-x-0.5',
                                                            )}
                                                        />
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <Separator className="lg:hidden" />

                <main className="w-full min-w-0">
                    <section className="w-full min-w-0 space-y-5">{children}</section>
                </main>
            </div>
        </div>
    );
}
