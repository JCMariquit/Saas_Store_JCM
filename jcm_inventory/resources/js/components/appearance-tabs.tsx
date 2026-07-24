import {
    type Appearance,
    type ThemePreset,
    THEME_PRESETS,
    useAppearance,
} from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import {
    Check,
    Layers3,
    Monitor,
    Moon,
    RotateCcw,
    Sun,
    type LucideIcon,
} from 'lucide-react';
import { type HTMLAttributes } from 'react';

const modeOptions: {
    value: Appearance;
    icon: LucideIcon;
    label: string;
    description: string;
}[] = [
    {
        value: 'light',
        icon: Sun,
        label: 'Light',
        description: 'Bright surfaces for well-lit workspaces.',
    },
    {
        value: 'dark',
        icon: Moon,
        label: 'Dark',
        description: 'Reduced glare and focused operations.',
    },
    {
        value: 'system',
        icon: Monitor,
        label: 'System',
        description: 'Follow the current device preference.',
    },
];

const presetOptions: {
    value: ThemePreset;
    eyebrow: string;
    swatches: string[];
    preview: {
        shell: string;
        sidebar: string;
        header: string;
        primary: string;
        surface: string;
        border: string;
    };
}[] = [
    {
        value: 'jcm-dark',
        eyebrow: 'Default inventory identity',
        swatches: ['bg-zinc-950', 'bg-emerald-500', 'bg-zinc-800'],
        preview: {
            shell: 'bg-zinc-950',
            sidebar: 'bg-[#07110d]',
            header: 'bg-zinc-900',
            primary: 'bg-emerald-500',
            surface: 'bg-zinc-800',
            border: 'border-zinc-700',
        },
    },
    {
        value: 'ocean-enterprise',
        eyebrow: 'Corporate operations',
        swatches: ['bg-slate-950', 'bg-blue-500', 'bg-cyan-400'],
        preview: {
            shell: 'bg-slate-950',
            sidebar: 'bg-[#07152f]',
            header: 'bg-slate-900',
            primary: 'bg-blue-500',
            surface: 'bg-slate-800',
            border: 'border-blue-950',
        },
    },
    {
        value: 'violet-command',
        eyebrow: 'Premium command center',
        swatches: ['bg-[#180b2b]', 'bg-violet-500', 'bg-fuchsia-400'],
        preview: {
            shell: 'bg-[#130a20]',
            sidebar: 'bg-[#1c0b33]',
            header: 'bg-[#211130]',
            primary: 'bg-violet-500',
            surface: 'bg-[#2a1738]',
            border: 'border-violet-950',
        },
    },
    {
        value: 'amber-operations',
        eyebrow: 'Industrial warehouse',
        swatches: ['bg-stone-950', 'bg-amber-500', 'bg-orange-500'],
        preview: {
            shell: 'bg-stone-950',
            sidebar: 'bg-[#1c1408]',
            header: 'bg-stone-900',
            primary: 'bg-amber-500',
            surface: 'bg-stone-800',
            border: 'border-amber-950',
        },
    },
    {
        value: 'slate-minimal',
        eyebrow: 'Neutral professional',
        swatches: ['bg-slate-950', 'bg-slate-500', 'bg-slate-300'],
        preview: {
            shell: 'bg-slate-950',
            sidebar: 'bg-[#111827]',
            header: 'bg-slate-900',
            primary: 'bg-slate-500',
            surface: 'bg-slate-800',
            border: 'border-slate-700',
        },
    },
];

export default function AppearanceTabs({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const {
        appearance,
        themePreset,
        updateAppearance,
        updateThemePreset,
        resetAppearance,
    } = useAppearance();

    return (
        <div className={cn('space-y-8', className)} {...props}>
            <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Layers3 className="size-4 text-primary" />
                            <h2 className="text-sm font-semibold text-foreground">
                                Theme preset
                            </h2>
                        </div>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                            Apply a complete visual identity across the workspace, header,
                            sidebar, cards, controls, and charts.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={resetAppearance}
                        className="inline-flex h-8 w-fit items-center gap-2 rounded-lg border border-border/70 bg-background/55 px-3 text-[10px] font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/[0.06] hover:text-foreground"
                    >
                        <RotateCcw className="size-3.5" />
                        Reset to JCM Dark
                    </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {presetOptions.map((preset) => {
                        const details = THEME_PRESETS[preset.value];
                        const active = themePreset === preset.value;

                        return (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => updateThemePreset(preset.value)}
                                aria-pressed={active}
                                className={cn(
                                    'group overflow-hidden rounded-2xl border text-left transition duration-200',
                                    active
                                        ? 'border-primary/45 bg-primary/[0.055] shadow-[0_0_28px_var(--theme-glow)]'
                                        : 'border-border/70 bg-card/55 hover:border-primary/25 hover:bg-card',
                                )}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                {preset.eyebrow}
                                            </p>
                                            <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
                                                {details.label}
                                            </h3>
                                        </div>

                                        <span
                                            className={cn(
                                                'flex size-6 shrink-0 items-center justify-center rounded-full border transition',
                                                active
                                                    ? 'border-primary/35 bg-primary/15 text-primary'
                                                    : 'border-border/70 bg-background/50 text-transparent group-hover:text-muted-foreground/40',
                                            )}
                                        >
                                            <Check className="size-3.5" />
                                        </span>
                                    </div>

                                    <p className="mt-2 min-h-10 text-[10px] leading-5 text-muted-foreground">
                                        {details.description}
                                    </p>

                                    <div
                                        className={cn(
                                            'mt-4 overflow-hidden rounded-xl border p-2.5',
                                            preset.preview.shell,
                                            preset.preview.border,
                                        )}
                                    >
                                        <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-2">
                                            <div
                                                className={cn(
                                                    'rounded-lg border border-white/5 p-1.5',
                                                    preset.preview.sidebar,
                                                )}
                                            >
                                                <div className={cn('h-2 rounded-sm', preset.preview.primary)} />
                                                <div className="mt-2 space-y-1.5">
                                                    <div className="h-1 rounded-full bg-white/18" />
                                                    <div className="h-1 rounded-full bg-white/10" />
                                                    <div className="h-1 rounded-full bg-white/10" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div
                                                    className={cn(
                                                        'flex h-5 items-center justify-between rounded-md px-2',
                                                        preset.preview.header,
                                                    )}
                                                >
                                                    <div className="h-1 w-10 rounded-full bg-white/16" />
                                                    <div className={cn('size-2 rounded-full', preset.preview.primary)} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className={cn('h-8 rounded-md', preset.preview.surface)} />
                                                    <div className={cn('h-8 rounded-md', preset.preview.surface)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center -space-x-1">
                                            {preset.swatches.map((swatch) => (
                                                <span
                                                    key={swatch}
                                                    className={cn(
                                                        'size-4 rounded-full border-2 border-card',
                                                        swatch,
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        <span
                                            className={cn(
                                                'text-[9px] font-semibold uppercase tracking-[0.1em]',
                                                active ? 'text-primary' : 'text-muted-foreground',
                                            )}
                                        >
                                            {active ? 'Active theme' : 'Apply theme'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="border-t border-border/60 pt-6">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Display mode</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Use the selected theme in light mode, dark mode, or follow the
                        operating system setting.
                    </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {modeOptions.map(({ value, icon: Icon, label, description }) => {
                        const active = appearance === value;

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => updateAppearance(value)}
                                aria-pressed={active}
                                className={cn(
                                    'flex min-h-20 items-start gap-3 rounded-xl border px-4 py-3 text-left transition',
                                    active
                                        ? 'border-primary/40 bg-primary/[0.07] shadow-sm'
                                        : 'border-border/70 bg-background/35 hover:border-primary/25 hover:bg-muted/40',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                                        active
                                            ? 'border-primary/30 bg-primary/15 text-primary'
                                            : 'border-border/70 bg-card text-muted-foreground',
                                    )}
                                >
                                    <Icon className="size-4" />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-foreground">
                                            {label}
                                        </span>
                                        {active && <Check className="size-3.5 text-primary" />}
                                    </span>
                                    <span className="mt-1 block text-[9px] leading-4 text-muted-foreground">
                                        {description}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
