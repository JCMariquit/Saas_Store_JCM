import AppearanceTabs from '@/components/appearance-tabs';
import { Badge } from '@/components/ui/badge';
import { THEME_PRESETS, useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Layers3, MonitorCog, Palette, Sparkles, SunMoon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

const appearanceLabels = {
    light: 'Light',
    dark: 'Dark',
} as const;

export default function Appearance() {
    const { appearance, themePreset } = useAppearance();
    const activeTheme = THEME_PRESETS[themePreset];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <section className="border-primary/15 from-primary/[0.055] via-card/70 to-card/40 overflow-hidden rounded-2xl border bg-gradient-to-br">
                    <div className="border-border/60 flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className="border-primary/20 bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border">
                                <Palette className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-primary text-[10px] font-semibold tracking-[0.13em] uppercase">Theme control center</p>
                                <h1 className="text-foreground mt-1 text-lg font-semibold tracking-tight">Workspace appearance</h1>
                                <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                                    Choose a theme and display mode for JCM Inventory.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-primary/20 bg-primary/[0.07] text-primary h-7 rounded-full px-2.5 text-[10px] font-semibold"
                            >
                                <Layers3 className="mr-1.5 size-3.5" />
                                {activeTheme.shortLabel}
                            </Badge>

                            <Badge
                                variant="outline"
                                className="border-border/70 bg-background/45 text-muted-foreground h-7 rounded-full px-2.5 text-[10px] font-medium"
                            >
                                <SunMoon className="mr-1.5 size-3.5" />
                                {appearanceLabels[appearance]} mode
                            </Badge>
                        </div>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[260px_minmax(0,1fr)]">
                        <aside className="border-border/60 bg-background/18 border-b p-5 xl:border-r xl:border-b-0">
                            <div className="flex items-start gap-3">
                                <span className="border-primary/20 bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border">
                                    <MonitorCog className="size-4.5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-foreground text-sm font-semibold">Active visual profile</p>
                                    <p className="text-muted-foreground mt-1 text-[10px] leading-5">Preview the active theme and display mode.</p>
                                </div>
                            </div>

                            <div className="border-primary/20 mt-5 overflow-hidden rounded-xl border bg-[linear-gradient(145deg,var(--sidebar-background),var(--background))] p-3 shadow-[0_0_28px_var(--theme-glow)]">
                                <div className="border-border/60 bg-background/75 rounded-lg border p-2.5 backdrop-blur">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary size-2 rounded-full" />
                                        <span className="bg-muted h-1.5 w-20 rounded-full" />
                                    </div>

                                    <div className="mt-3 grid grid-cols-[42px_minmax(0,1fr)] gap-2">
                                        <div className="bg-sidebar h-16 rounded-md" />
                                        <div className="space-y-2">
                                            <div className="bg-primary/15 h-5 rounded-md" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-muted h-9 rounded-md" />
                                                <div className="bg-muted h-9 rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">
                                        Live theme preview
                                    </span>
                                    <span className="text-primary text-[10px] font-semibold">{activeTheme.shortLabel}</span>
                                </div>
                            </div>
                        </aside>

                        <div className="min-w-0 p-5 md:p-6">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-foreground text-sm font-semibold">Theme collection</p>
                                    <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">Choose the theme you want to use.</p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="border-border/70 bg-background/40 text-muted-foreground h-7 w-fit rounded-full px-2.5 text-[10px] font-medium"
                                >
                                    <Sparkles className="text-primary mr-1.5 size-3.5" />5 themes
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
