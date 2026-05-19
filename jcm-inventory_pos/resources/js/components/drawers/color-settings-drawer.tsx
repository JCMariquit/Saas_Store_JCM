import { Check, Palette, RotateCcw } from 'lucide-react';
import * as React from 'react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import { cn } from '@/lib/utils';

type ColorSettingsDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type ColorTarget = 'header' | 'sidebar' | 'body';

const STORAGE_KEY = 'jcm-color-settings';

const defaultColors: Record<ColorTarget, string> = {
    header: '#09090b',
    sidebar: '#09090b',
    body: '#ffffff',
};

const presets = [
    { name: 'Default', header: '#09090b', sidebar: '#09090b', body: '#ffffff' },
    { name: 'Light', header: '#ffffff', sidebar: '#ffffff', body: '#f8fafc' },
    { name: 'Slate', header: '#0f172a', sidebar: '#111827', body: '#f8fafc' },
    { name: 'Blue', header: '#0f172a', sidebar: '#172554', body: '#eff6ff' },
    { name: 'Emerald', header: '#052e16', sidebar: '#064e3b', body: '#ecfdf5' },
    { name: 'Violet', header: '#2e1065', sidebar: '#1e1b4b', body: '#f5f3ff' },
];

function getContrastColor(hex: string) {
    const cleanHex = hex.replace('#', '');

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 150 ? '#111827' : '#ffffff';
}

function getMutedColor(hex: string) {
    return getContrastColor(hex) === '#ffffff'
        ? 'rgba(255,255,255,0.68)'
        : 'rgba(17,24,39,0.68)';
}

function getHoverColor(hex: string) {
    return getContrastColor(hex) === '#ffffff'
        ? 'rgba(255,255,255,0.10)'
        : 'rgba(17,24,39,0.08)';
}

function applyColors(colors: Record<ColorTarget, string>) {
    const root = document.documentElement;

    root.style.setProperty('--jcm-header-bg', colors.header);
    root.style.setProperty('--jcm-sidebar-bg', colors.sidebar);
    root.style.setProperty('--jcm-body-bg', colors.body);

    root.style.setProperty('--jcm-header-fg', getContrastColor(colors.header));
    root.style.setProperty('--jcm-sidebar-fg', getContrastColor(colors.sidebar));
    root.style.setProperty('--jcm-sidebar-muted', getMutedColor(colors.sidebar));
    root.style.setProperty('--jcm-sidebar-hover', getHoverColor(colors.sidebar));
}

export function ColorSettingsDrawer({
    open,
    onOpenChange,
}: ColorSettingsDrawerProps) {
    const [colors, setColors] = React.useState<Record<ColorTarget, string>>(defaultColors);

    React.useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const parsed = JSON.parse(saved) as Record<ColorTarget, string>;
            setColors(parsed);
            applyColors(parsed);
            return;
        }

        applyColors(defaultColors);
    }, []);

    function updateColor(target: ColorTarget, value: string) {
        const next = { ...colors, [target]: value };

        setColors(next);
        applyColors(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    function applyPreset(preset: Record<ColorTarget, string>) {
        setColors(preset);
        applyColors(preset);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
    }

    function resetColors() {
        setColors(defaultColors);
        applyColors(defaultColors);
        localStorage.removeItem(STORAGE_KEY);
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-[390px] flex-col overflow-hidden p-0 sm:max-w-[430px]">
                <SheetHeader className="border-b px-5 py-4 text-left">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
                            <Palette className="size-4" />
                        </div>

                        <div>
                            <SheetTitle>Color Settings</SheetTitle>
                            <SheetDescription>Customize header, sidebar, and body colors.</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    <div className="grid grid-cols-2 gap-3">
                        {presets.map((preset) => {
                            const active =
                                colors.header === preset.header &&
                                colors.sidebar === preset.sidebar &&
                                colors.body === preset.body;

                            return (
                                <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className={cn(
                                        'rounded-2xl border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-xs',
                                        active && 'border-primary ring-2 ring-primary/15',
                                    )}
                                >
                                    <div className="flex overflow-hidden rounded-xl border">
                                        <div className="h-8 flex-1" style={{ backgroundColor: preset.header }} />
                                        <div className="h-8 flex-1" style={{ backgroundColor: preset.sidebar }} />
                                        <div className="h-8 flex-1" style={{ backgroundColor: preset.body }} />
                                    </div>

                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold">{preset.name}</span>
                                        {active && <Check className="size-4 text-primary" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <ColorControl label="Header" value={colors.header} onChange={(value) => updateColor('header', value)} />
                    <ColorControl label="Sidebar" value={colors.sidebar} onChange={(value) => updateColor('sidebar', value)} />
                    <ColorControl label="Body" value={colors.body} onChange={(value) => updateColor('body', value)} />
                </div>

                <div className="border-t p-4">
                    <button
                        type="button"
                        onClick={resetColors}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border bg-background text-sm font-medium transition-colors hover:bg-muted"
                    >
                        <RotateCcw className="size-4" />
                        Reset colors
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function ColorControl({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="rounded-2xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{value}</p>
                </div>

                <div className="size-9 rounded-xl border shadow-xs" style={{ backgroundColor: value }} />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border bg-transparent p-1"
                />

                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                />
            </div>
        </div>
    );
}