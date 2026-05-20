import * as React from 'react';
import { Head } from '@inertiajs/react';
import {
    Check,
    Layers,
    Moon,
    Palette,
    RotateCcw,
    Settings2,
    Sparkles,
    Sun,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import {
    type AccentColor,
    type Appearance,
    type ContentBg,
    type DensityStyle,
    type FontStyle,
    type HeaderColor,
    type RadiusStyle,
    type ShadowStyle,
    type SidebarColor,
    type ThemePreset,
    useAppearance,
} from '@/hooks/use-appearance';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

type TabKey = 'presets' | 'colors' | 'layout' | 'advanced';

const tabs: {
    key: TabKey;
    label: string;
    icon: React.ElementType;
}[] = [
    { key: 'presets', label: 'Presets', icon: Sparkles },
    { key: 'colors', label: 'Colors', icon: Palette },
    { key: 'layout', label: 'Layout', icon: Layers },
    { key: 'advanced', label: 'Advanced', icon: Settings2 },
];

const presetOptions: {
    value: ThemePreset;
    label: string;
    description: string;
    swatches: string[];
}[] = [
    {
        value: 'jcm-dark',
        label: 'JCM Dark',
        description: 'Default premium dark system.',
        swatches: ['bg-zinc-950', 'bg-emerald-600', 'bg-zinc-800'],
    },
    {
        value: 'emerald-pro',
        label: 'Emerald Pro',
        description: 'Corporate green workspace.',
        swatches: ['bg-emerald-950', 'bg-emerald-600', 'bg-teal-400'],
    },
    {
        value: 'violet-glass',
        label: 'Violet Glass',
        description: 'Modern glassy violet interface.',
        swatches: ['bg-violet-950', 'bg-violet-600', 'bg-fuchsia-400'],
    },
    {
        value: 'blue-enterprise',
        label: 'Blue Enterprise',
        description: 'Clean blue admin dashboard look.',
        swatches: ['bg-blue-950', 'bg-blue-600', 'bg-sky-400'],
    },
    {
        value: 'slate-minimal',
        label: 'Slate Minimal',
        description: 'Neutral, compact, and professional.',
        swatches: ['bg-slate-950', 'bg-slate-600', 'bg-zinc-400'],
    },
    {
        value: 'light-clean',
        label: 'Light Clean',
        description: 'Bright clean starter kit style.',
        swatches: ['bg-white', 'bg-blue-600', 'bg-zinc-200'],
    },
];

const appearanceOptions: {
    value: Appearance;
    label: string;
    icon: React.ElementType;
}[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
];

const accentOptions: {
    value: AccentColor;
    label: string;
    preview: string;
}[] = [
    { value: 'emerald', label: 'Emerald', preview: 'bg-emerald-600' },
    { value: 'blue', label: 'Blue', preview: 'bg-blue-600' },
    { value: 'violet', label: 'Violet', preview: 'bg-violet-600' },
    { value: 'rose', label: 'Rose', preview: 'bg-rose-600' },
    { value: 'orange', label: 'Orange', preview: 'bg-orange-500' },
    { value: 'zinc', label: 'Zinc', preview: 'bg-zinc-700' },
    { value: 'sky', label: 'Sky', preview: 'bg-sky-500' },
    { value: 'amber', label: 'Amber', preview: 'bg-amber-500' },
    { value: 'red', label: 'Red', preview: 'bg-red-500' },
    { value: 'slate', label: 'Slate', preview: 'bg-slate-700' },
];

const sidebarOptions: {
    value: SidebarColor;
    label: string;
    preview: string;
}[] = [
    { value: 'default', label: 'Default', preview: 'bg-background' },
    { value: 'dark', label: 'Dark', preview: 'bg-zinc-950' },
    { value: 'emerald', label: 'Emerald', preview: 'bg-emerald-950' },
    { value: 'blue', label: 'Blue', preview: 'bg-blue-950' },
    { value: 'violet', label: 'Violet', preview: 'bg-violet-950' },
    { value: 'slate', label: 'Slate', preview: 'bg-slate-950' },
    { value: 'zinc', label: 'Zinc', preview: 'bg-zinc-900' },
];

const headerOptions: {
    value: HeaderColor;
    label: string;
    description: string;
}[] = [
    { value: 'default', label: 'Default', description: 'Standard header surface' },
    { value: 'glass', label: 'Glass', description: 'Transparent blur header' },
    { value: 'dark', label: 'Dark', description: 'Dark header surface' },
    { value: 'accent', label: 'Accent', description: 'Use selected accent color' },
    { value: 'clean', label: 'Clean', description: 'Flat clean header' },
    { value: 'borderless', label: 'Borderless', description: 'Minimal header without border' },
];

const contentOptions: {
    value: ContentBg;
    label: string;
    description: string;
}[] = [
    { value: 'default', label: 'Default', description: 'Standard workspace' },
    { value: 'soft', label: 'Soft', description: 'Soft tinted workspace' },
    { value: 'gray', label: 'Gray', description: 'Neutral gray workspace' },
    { value: 'dark', label: 'Dark', description: 'Dark app workspace' },
    { value: 'tinted', label: 'Tinted', description: 'Accent tinted workspace' },
    { value: 'plain', label: 'Plain', description: 'Simple plain workspace' },
];

const radiusOptions: {
    value: RadiusStyle;
    label: string;
    description: string;
}[] = [
    { value: 'none', label: 'None', description: 'Sharp UI' },
    { value: 'sm', label: 'Small', description: 'Minimal corners' },
    { value: 'md', label: 'Medium', description: 'Balanced corners' },
    { value: 'xl', label: 'Large', description: 'Soft rounded UI' },
    { value: 'full', label: 'Full', description: 'Pill style controls' },
];

const densityOptions: {
    value: DensityStyle;
    label: string;
    description: string;
}[] = [
    { value: 'compact', label: 'Compact', description: 'Tighter spacing' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
    { value: 'spacious', label: 'Spacious', description: 'More breathing room' },
];

const fontOptions: {
    value: FontStyle;
    label: string;
    description: string;
}[] = [
    { value: 'default', label: 'Default', description: 'Starter kit default' },
    { value: 'modern', label: 'Modern', description: 'Cleaner modern feel' },
    { value: 'classic', label: 'Classic', description: 'More traditional admin look' },
];

const shadowOptions: {
    value: ShadowStyle;
    label: string;
    description: string;
}[] = [
    { value: 'none', label: 'None', description: 'Flat interface' },
    { value: 'soft', label: 'Soft', description: 'Subtle depth' },
    { value: 'medium', label: 'Medium', description: 'More visible elevation' },
];

function OptionCard({
    active,
    title,
    description,
    children,
    onClick,
}: {
    active: boolean;
    title: string;
    description?: string;
    children?: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'group flex min-h-[58px] w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                active
                    ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50',
            ].join(' ')}
        >
            <div className="flex min-w-0 items-center gap-3">
                {children}

                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{title}</div>

                    {description && (
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {description}
                        </div>
                    )}
                </div>
            </div>

            {active && <Check className="ml-3 size-4 shrink-0 text-primary" />}
        </button>
    );
}

function SectionHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

export default function Appearance() {
    const [activeTab, setActiveTab] = React.useState<TabKey>('presets');

    const {
        appearance,
        accentColor,
        sidebarColor,
        headerColor,
        contentBg,
        radiusStyle,
        densityStyle,
        fontStyle,
        shadowStyle,
        updateAppearance,
        updateAccentColor,
        updateSidebarColor,
        updateHeaderColor,
        updateContentBg,
        updateRadiusStyle,
        updateDensityStyle,
        updateFontStyle,
        updateShadowStyle,
        applyPreset,
        resetAppearance,
    } = useAppearance();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="max-w-5xl space-y-6">
                    <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Appearance settings</h2>
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Customize presets, colors, layout, density, radius, and professional app styling.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={resetAppearance}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            <RotateCcw className="size-4" />
                            Reset
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={[
                                        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                                        active
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    ].join(' ')}
                                >
                                    <Icon className="size-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {activeTab === 'presets' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Combo themes"
                                description="Apply complete ready-made theme combinations with one click."
                            />

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {presetOptions.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => applyPreset(preset.value)}
                                        className="group rounded-2xl border bg-card p-5 text-left transition hover:border-primary/50 hover:bg-muted/40"
                                    >
                                        <div className="mb-5 flex items-center gap-2">
                                            {preset.swatches.map((swatch) => (
                                                <span
                                                    key={swatch}
                                                    className={`size-7 rounded-full border shadow-sm ${swatch}`}
                                                />
                                            ))}
                                        </div>

                                        <h3 className="text-sm font-semibold">{preset.label}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {preset.description}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-2xl border bg-card p-5">
                                <SectionHeader
                                    title="Theme mode"
                                    description="Choose light or dark mode. Default system theme is dark."
                                />

                                <div className="mt-4 inline-flex rounded-xl bg-muted p-1">
                                    {appearanceOptions.map((option) => {
                                        const Icon = option.icon;
                                        const active = appearance === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => updateAppearance(option.value)}
                                                className={[
                                                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition',
                                                    active
                                                        ? 'bg-background text-foreground shadow-sm'
                                                        : 'text-muted-foreground hover:text-foreground',
                                                ].join(' ')}
                                            >
                                                <Icon className="size-4" />
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'colors' && (
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <SectionHeader
                                    title="Accent color"
                                    description="Main color for active states, buttons, rings, and highlights."
                                />

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {accentOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={accentColor === item.value}
                                            title={item.label}
                                            onClick={() => updateAccentColor(item.value)}
                                        >
                                            <span className={`size-5 rounded-full ${item.preview}`} />
                                        </OptionCard>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <SectionHeader
                                    title="Sidebar color"
                                    description="Change the sidebar surface color."
                                />

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {sidebarOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={sidebarColor === item.value}
                                            title={item.label}
                                            onClick={() => updateSidebarColor(item.value)}
                                        >
                                            <span className={`size-5 rounded-full border ${item.preview}`} />
                                        </OptionCard>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'layout' && (
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <SectionHeader
                                    title="Header style"
                                    description="Customize the top header surface."
                                />

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {headerOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={headerColor === item.value}
                                            title={item.label}
                                            description={item.description}
                                            onClick={() => updateHeaderColor(item.value)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <SectionHeader
                                    title="Workspace background"
                                    description="Change the main content background."
                                />

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {contentOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={contentBg === item.value}
                                            title={item.label}
                                            description={item.description}
                                            onClick={() => updateContentBg(item.value)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <SectionHeader
                                    title="Radius style"
                                    description="Adjust how rounded the system feels."
                                />

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {radiusOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={radiusStyle === item.value}
                                            title={item.label}
                                            description={item.description}
                                            onClick={() => updateRadiusStyle(item.value)}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <SectionHeader
                                    title="Density"
                                    description="Control spacing across the interface."
                                />

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {densityOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={densityStyle === item.value}
                                            title={item.label}
                                            description={item.description}
                                            onClick={() => updateDensityStyle(item.value)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <SectionHeader
                                    title="Font style"
                                    description="Choose the personality of the admin interface."
                                />

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {fontOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={fontStyle === item.value}
                                            title={item.label}
                                            description={item.description}
                                            onClick={() => updateFontStyle(item.value)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <SectionHeader
                                    title="Shadow style"
                                    description="Control how much elevation the UI uses."
                                />

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {shadowOptions.map((item) => (
                                        <OptionCard
                                            key={item.value}
                                            active={shadowStyle === item.value}
                                            title={item.label}
                                            description={item.description}
                                            onClick={() => updateShadowStyle(item.value)}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}