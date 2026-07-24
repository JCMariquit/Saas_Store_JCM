import AppearanceTabs from '@/components/appearance-tabs';
import { Badge } from '@/components/ui/badge';
import { THEME_PRESETS, useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Layers3,
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

const appearanceLabels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
} as const;

export default function Appearance() {
    const { appearance, themePreset } = useAppearance();
    const activeTheme = THEME_PRESETS[themePreset];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <section className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.055] via-card/70 to-card/40">
                    <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <Palette className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">
                                    Theme control center
                                </p>
                                <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                                    Workspace appearance
                                </h1>
                                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                    Select a complete JCM interface theme and choose how it follows your display preference.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-primary/20 bg-primary/[0.07] px-2.5 text-[10px] font-semibold text-primary"
                            >
                                <Layers3 className="mr-1.5 size-3.5" />
                                {activeTheme.shortLabel}
                            </Badge>

                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-border/70 bg-background/45 px-2.5 text-[10px] font-medium text-muted-foreground"
                            >
                                <SunMoon className="mr-1.5 size-3.5" />
                                {appearanceLabels[appearance]} mode
                            </Badge>
                        </div>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[260px_minmax(0,1fr)]">
                        <aside className="border-b border-border/60 bg-background/18 p-5 xl:border-b-0 xl:border-r">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                    <MonitorCog className="size-4.5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        Active visual profile
                                    </p>
                                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                                        The selected preset controls the overall system identity while display mode controls brightness.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 overflow-hidden rounded-xl border border-primary/20 bg-[linear-gradient(145deg,var(--sidebar-background),var(--background))] p-3 shadow-[0_0_28px_var(--theme-glow)]">
                                <div className="rounded-lg border border-border/60 bg-background/75 p-2.5 backdrop-blur">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-primary" />
                                        <span className="h-1.5 w-20 rounded-full bg-muted" />
                                    </div>

                                    <div className="mt-3 grid grid-cols-[42px_minmax(0,1fr)] gap-2">
                                        <div className="h-16 rounded-md bg-sidebar" />
                                        <div className="space-y-2">
                                            <div className="h-5 rounded-md bg-primary/15" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="h-9 rounded-md bg-muted" />
                                                <div className="h-9 rounded-md bg-muted" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                        Live system preview
                                    </span>
                                    <span className="text-[10px] font-semibold text-primary">
                                        {activeTheme.shortLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 divide-y divide-border/60 border-y border-border/60">
                                <AppearanceFact
                                    icon={Layers3}
                                    label="Theme preset"
                                    value={activeTheme.label}
                                />
                                <AppearanceFact
                                    icon={Zap}
                                    label="Application"
                                    value="Applied instantly"
                                />
                                <AppearanceFact
                                    icon={CheckCircle2}
                                    label="Persistence"
                                    value="Saved in this browser"
                                />
                            </div>

                            <div className="mt-5 border-l-2 border-primary bg-primary/[0.035] px-3 py-3">
                                <p className="text-[9px] font-semibold text-primary">Visual preference only</p>
                                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                    Themes do not change permissions, inventory records, reports, or transactions.
                                </p>
                            </div>
                        </aside>

                        <div className="min-w-0 p-5 md:p-6">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Theme collection
                                    </p>
                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                        Start with the default JCM Inventory identity or switch to one of four additional professional presets.
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="h-7 w-fit rounded-full border-border/70 bg-background/40 px-2.5 text-[10px] font-medium text-muted-foreground"
                                >
                                    <Sparkles className="mr-1.5 size-3.5 text-primary" />
                                    Five complete themes
                                </Badge>
                            </div>

                            <AppearanceTabs />
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