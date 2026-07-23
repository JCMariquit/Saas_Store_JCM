import AppearanceTabs from '@/components/appearance-tabs';
import { Badge } from '@/components/ui/badge';
import { useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Laptop,
    MonitorCog,
    Palette,
    Sparkles,
    SunMoon,
    Zap,
    type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { appearance } = useAppearance();

    const currentMode = getAppearanceLabel(appearance);
    const isDark = appearance === 'dark';
    const isLight = appearance === 'light';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <section className="overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.065] via-card/70 to-card/40">
                    <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                <Palette className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-emerald-300">
                                    Display settings
                                </p>
                                <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                                    Workspace appearance
                                </h1>
                                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                    Choose how JCM Inventory is displayed on this browser and device.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="h-7 w-fit rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 text-[10px] font-semibold text-emerald-300"
                        >
                            <SunMoon className="mr-1.5 size-3.5" />
                            {currentMode} mode
                        </Badge>
                    </div>

                    <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="border-b border-border/60 bg-background/20 p-5 lg:border-b-0 lg:border-r">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                    <MonitorCog className="size-4.5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        Current workspace
                                    </p>
                                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                                        Appearance changes are applied immediately without affecting inventory records.
                                    </p>
                                </div>
                            </div>

                            <div
                                className={cn(
                                    'relative mt-5 overflow-hidden rounded-xl border p-3 shadow-sm',
                                    isLight
                                        ? 'border-slate-200 bg-slate-100'
                                        : isDark
                                          ? 'border-zinc-800 bg-zinc-950'
                                          : 'border-border/70 bg-gradient-to-br from-slate-100 to-zinc-950',
                                )}
                            >
                                <div
                                    className={cn(
                                        'rounded-lg border p-2.5',
                                        isLight
                                            ? 'border-slate-200 bg-white'
                                            : isDark
                                              ? 'border-zinc-800 bg-zinc-900'
                                              : 'border-white/15 bg-background/90',
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-emerald-400" />
                                        <span
                                            className={cn(
                                                'h-1.5 w-16 rounded-full',
                                                isLight
                                                    ? 'bg-slate-300'
                                                    : 'bg-zinc-700',
                                            )}
                                        />
                                    </div>

                                    <div className="mt-3 grid grid-cols-[42px_minmax(0,1fr)] gap-2">
                                        <div
                                            className={cn(
                                                'h-16 rounded-md',
                                                isLight
                                                    ? 'bg-slate-100'
                                                    : 'bg-zinc-950',
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <div className="h-5 rounded-md bg-emerald-500/15" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <div
                                                    className={cn(
                                                        'h-9 rounded-md',
                                                        isLight
                                                            ? 'bg-slate-100'
                                                            : 'bg-zinc-800',
                                                    )}
                                                />
                                                <div
                                                    className={cn(
                                                        'h-9 rounded-md',
                                                        isLight
                                                            ? 'bg-slate-100'
                                                            : 'bg-zinc-800',
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span
                                        className={cn(
                                            'text-[9px] font-semibold uppercase tracking-[0.1em]',
                                            isLight
                                                ? 'text-slate-600'
                                                : 'text-zinc-300',
                                        )}
                                    >
                                        Live preview
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-400">
                                        {currentMode}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 divide-y divide-border/60 border-y border-border/60">
                                <AppearanceFact
                                    icon={Laptop}
                                    label="Preference scope"
                                    value="This browser and device"
                                />
                                <AppearanceFact
                                    icon={Zap}
                                    label="Application"
                                    value="Applied immediately"
                                />
                                <AppearanceFact
                                    icon={CheckCircle2}
                                    label="Persistence"
                                    value="Saved automatically"
                                />
                            </div>
                        </aside>

                        <div className="min-w-0 p-5 md:p-6">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Theme preference
                                    </p>
                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                        Select the visual mode that provides the best readability for your workspace.
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="h-7 w-fit rounded-full border-border/70 bg-background/40 px-2.5 text-[10px] font-medium text-muted-foreground"
                                >
                                    <Sparkles className="mr-1.5 size-3.5 text-emerald-400" />
                                    Personal preference
                                </Badge>
                            </div>

                            <div className="border-y border-border/60 py-5">
                                <AppearanceTabs />
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                <AppearanceNote
                                    title="Light mode"
                                    description="Uses brighter surfaces for well-lit environments."
                                />
                                <AppearanceNote
                                    title="Dark mode"
                                    description="Uses darker surfaces for reduced glare and focused work."
                                />
                                <AppearanceNote
                                    title="System mode"
                                    description="Follows the current appearance preference of your device."
                                />
                            </div>

                            <div className="mt-5 border-l-2 border-emerald-400 bg-emerald-500/[0.04] px-4 py-3">
                                <p className="text-[10px] font-semibold text-emerald-300">
                                    Appearance only
                                </p>
                                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                    Changing the theme does not modify account permissions, inventory data, reports, or transaction history.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </SettingsLayout>
        </AppLayout>
    );
}

function AppearanceFact({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 py-3">
            <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <p className="text-[8px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-foreground/85">
                    {value}
                </p>
            </div>
        </div>
    );
}

function AppearanceNote({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="min-w-0 border-l border-border/70 pl-3 first:border-l-0 first:pl-0 md:first:border-l md:first:pl-3">
            <p className="text-[10px] font-semibold text-foreground/85">
                {title}
            </p>
            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function getAppearanceLabel(appearance: string): string {
    if (appearance === 'light') {
        return 'Light';
    }

    if (appearance === 'dark') {
        return 'Dark';
    }

    return 'System';
}