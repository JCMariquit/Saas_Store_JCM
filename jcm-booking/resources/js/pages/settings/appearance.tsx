import { Head } from '@inertiajs/react';
import { MonitorCog, Palette, Sparkles } from 'lucide-react';

import AppearanceTabs from '@/components/appearance-tabs';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <section className="w-full overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm">
                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.04] via-background to-background px-8 py-8">
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                    <Palette className="size-6" />
                                </div>

                                <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                            Appearance Settings
                                        </h1>

                                        <div className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                            Personalized
                                        </div>
                                    </div>

                                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Customize how your workspace looks and
                                        feels across your account.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur xl:w-[240px]">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <MonitorCog className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Display Mode
                                        </p>

                                        <p className="text-sm font-semibold text-foreground">
                                            Customizable
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Theme Preferences
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Select the appearance that works best for
                                    your workflow.
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-muted/[0.15] p-5">
                                <AppearanceTabs />
                            </div>
                        </div>

                        <aside className="h-fit rounded-2xl border border-primary/10 bg-primary/[0.03] p-5">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Sparkles className="size-4" />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Appearance Tips
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            Choose a theme that fits your
                                            environment and improves readability.
                                        </p>
                                    </div>

                                    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                                        <li>• Use dark mode in low light</li>
                                        <li>• Use light mode in bright areas</li>
                                        <li>• Match system for consistency</li>
                                        <li>• Pick what feels comfortable</li>
                                    </ul>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </SettingsLayout>
        </AppLayout>
    );
}