import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark';
export type AccentColor = 'emerald' | 'blue' | 'violet' | 'rose' | 'orange' | 'zinc' | 'sky' | 'amber' | 'red' | 'slate';
export type SidebarColor = 'default' | 'dark' | 'emerald' | 'blue' | 'violet' | 'slate' | 'zinc';
export type HeaderColor = 'default' | 'glass' | 'dark' | 'accent' | 'clean' | 'borderless';
export type ContentBg = 'default' | 'soft' | 'gray' | 'dark' | 'tinted' | 'plain';
export type RadiusStyle = 'none' | 'sm' | 'md' | 'xl' | 'full';
export type DensityStyle = 'compact' | 'comfortable' | 'spacious';
export type FontStyle = 'default' | 'modern' | 'classic';
export type ShadowStyle = 'none' | 'soft' | 'medium';

export type ThemePreset =
    | 'jcm-dark'
    | 'emerald-pro'
    | 'violet-glass'
    | 'blue-enterprise'
    | 'slate-minimal'
    | 'light-clean';

const defaults = {
    appearance: 'dark' as Appearance,
    accentColor: 'emerald' as AccentColor,
    sidebarColor: 'dark' as SidebarColor,
    headerColor: 'default' as HeaderColor,
    contentBg: 'default' as ContentBg,
    radiusStyle: 'md' as RadiusStyle,
    densityStyle: 'comfortable' as DensityStyle,
    fontStyle: 'default' as FontStyle,
    shadowStyle: 'soft' as ShadowStyle,
};

const accentColors: Record<AccentColor, string> = {
    emerald: 'hsl(160, 84%, 39%)',
    blue: 'hsl(221, 83%, 53%)',
    violet: 'hsl(262, 90%, 60%)',
    rose: 'hsl(346, 77%, 50%)',
    orange: 'hsl(24, 95%, 53%)',
    zinc: 'hsl(240, 5%, 26%)',
    sky: 'hsl(199, 89%, 48%)',
    amber: 'hsl(38, 92%, 50%)',
    red: 'hsl(0, 84%, 60%)',
    slate: 'hsl(215, 25%, 27%)',
};

const themePresets: Record<
    ThemePreset,
    {
        appearance: Appearance;
        accentColor: AccentColor;
        sidebarColor: SidebarColor;
        headerColor: HeaderColor;
        contentBg: ContentBg;
        radiusStyle: RadiusStyle;
        densityStyle: DensityStyle;
        fontStyle: FontStyle;
        shadowStyle: ShadowStyle;
    }
> = {
    'jcm-dark': {
        appearance: 'dark',
        accentColor: 'emerald',
        sidebarColor: 'dark',
        headerColor: 'default',
        contentBg: 'default',
        radiusStyle: 'md',
        densityStyle: 'comfortable',
        fontStyle: 'default',
        shadowStyle: 'soft',
    },
    'emerald-pro': {
        appearance: 'dark',
        accentColor: 'emerald',
        sidebarColor: 'emerald',
        headerColor: 'glass',
        contentBg: 'tinted',
        radiusStyle: 'xl',
        densityStyle: 'comfortable',
        fontStyle: 'modern',
        shadowStyle: 'soft',
    },
    'violet-glass': {
        appearance: 'dark',
        accentColor: 'violet',
        sidebarColor: 'violet',
        headerColor: 'glass',
        contentBg: 'soft',
        radiusStyle: 'xl',
        densityStyle: 'spacious',
        fontStyle: 'modern',
        shadowStyle: 'medium',
    },
    'blue-enterprise': {
        appearance: 'dark',
        accentColor: 'blue',
        sidebarColor: 'blue',
        headerColor: 'dark',
        contentBg: 'gray',
        radiusStyle: 'md',
        densityStyle: 'compact',
        fontStyle: 'default',
        shadowStyle: 'soft',
    },
    'slate-minimal': {
        appearance: 'dark',
        accentColor: 'slate',
        sidebarColor: 'slate',
        headerColor: 'clean',
        contentBg: 'plain',
        radiusStyle: 'sm',
        densityStyle: 'compact',
        fontStyle: 'classic',
        shadowStyle: 'none',
    },
    'light-clean': {
        appearance: 'light',
        accentColor: 'blue',
        sidebarColor: 'default',
        headerColor: 'borderless',
        contentBg: 'plain',
        radiusStyle: 'md',
        densityStyle: 'comfortable',
        fontStyle: 'default',
        shadowStyle: 'soft',
    },
};

const applyTheme = (appearance: Appearance) => {
    document.documentElement.classList.toggle('dark', appearance === 'dark');
};

const applyAccentColor = (color: AccentColor) => {
    const value = accentColors[color] ?? accentColors.emerald;

    document.documentElement.style.setProperty('--primary', value);
    document.documentElement.style.setProperty('--ring', value);
    document.documentElement.style.setProperty('--sidebar-primary', value);
};

const applyThemeParts = ({
    sidebarColor,
    headerColor,
    contentBg,
    radiusStyle,
    densityStyle,
    fontStyle,
    shadowStyle,
}: {
    sidebarColor: SidebarColor;
    headerColor: HeaderColor;
    contentBg: ContentBg;
    radiusStyle: RadiusStyle;
    densityStyle: DensityStyle;
    fontStyle: FontStyle;
    shadowStyle: ShadowStyle;
}) => {
    document.documentElement.dataset.sidebarColor = sidebarColor;
    document.documentElement.dataset.headerColor = headerColor;
    document.documentElement.dataset.contentBg = contentBg;
    document.documentElement.dataset.radiusStyle = radiusStyle;
    document.documentElement.dataset.densityStyle = densityStyle;
    document.documentElement.dataset.fontStyle = fontStyle;
    document.documentElement.dataset.shadowStyle = shadowStyle;
};

export function initializeTheme() {
    const appearance = (localStorage.getItem('appearance') as Appearance | null) || defaults.appearance;
    const accentColor = (localStorage.getItem('accent-color') as AccentColor | null) || defaults.accentColor;
    const sidebarColor = (localStorage.getItem('sidebar-color') as SidebarColor | null) || defaults.sidebarColor;
    const headerColor = (localStorage.getItem('header-color') as HeaderColor | null) || defaults.headerColor;
    const contentBg = (localStorage.getItem('content-bg') as ContentBg | null) || defaults.contentBg;
    const radiusStyle = (localStorage.getItem('radius-style') as RadiusStyle | null) || defaults.radiusStyle;
    const densityStyle = (localStorage.getItem('density-style') as DensityStyle | null) || defaults.densityStyle;
    const fontStyle = (localStorage.getItem('font-style') as FontStyle | null) || defaults.fontStyle;
    const shadowStyle = (localStorage.getItem('shadow-style') as ShadowStyle | null) || defaults.shadowStyle;

    applyTheme(appearance);
    applyAccentColor(accentColor);
    applyThemeParts({
        sidebarColor,
        headerColor,
        contentBg,
        radiusStyle,
        densityStyle,
        fontStyle,
        shadowStyle,
    });
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(defaults.appearance);
    const [accentColor, setAccentColor] = useState<AccentColor>(defaults.accentColor);
    const [sidebarColor, setSidebarColor] = useState<SidebarColor>(defaults.sidebarColor);
    const [headerColor, setHeaderColor] = useState<HeaderColor>(defaults.headerColor);
    const [contentBg, setContentBg] = useState<ContentBg>(defaults.contentBg);
    const [radiusStyle, setRadiusStyle] = useState<RadiusStyle>(defaults.radiusStyle);
    const [densityStyle, setDensityStyle] = useState<DensityStyle>(defaults.densityStyle);
    const [fontStyle, setFontStyle] = useState<FontStyle>(defaults.fontStyle);
    const [shadowStyle, setShadowStyle] = useState<ShadowStyle>(defaults.shadowStyle);

    const syncParts = (next?: Partial<typeof defaults>) => {
        applyThemeParts({
            sidebarColor: next?.sidebarColor ?? sidebarColor,
            headerColor: next?.headerColor ?? headerColor,
            contentBg: next?.contentBg ?? contentBg,
            radiusStyle: next?.radiusStyle ?? radiusStyle,
            densityStyle: next?.densityStyle ?? densityStyle,
            fontStyle: next?.fontStyle ?? fontStyle,
            shadowStyle: next?.shadowStyle ?? shadowStyle,
        });
    };

    const updateAppearance = (value: Appearance) => {
        setAppearance(value);
        localStorage.setItem('appearance', value);
        applyTheme(value);
    };

    const updateAccentColor = (value: AccentColor) => {
        setAccentColor(value);
        localStorage.setItem('accent-color', value);
        applyAccentColor(value);
    };

    const updateSidebarColor = (value: SidebarColor) => {
        setSidebarColor(value);
        localStorage.setItem('sidebar-color', value);
        syncParts({ sidebarColor: value });
    };

    const updateHeaderColor = (value: HeaderColor) => {
        setHeaderColor(value);
        localStorage.setItem('header-color', value);
        syncParts({ headerColor: value });
    };

    const updateContentBg = (value: ContentBg) => {
        setContentBg(value);
        localStorage.setItem('content-bg', value);
        syncParts({ contentBg: value });
    };

    const updateRadiusStyle = (value: RadiusStyle) => {
        setRadiusStyle(value);
        localStorage.setItem('radius-style', value);
        syncParts({ radiusStyle: value });
    };

    const updateDensityStyle = (value: DensityStyle) => {
        setDensityStyle(value);
        localStorage.setItem('density-style', value);
        syncParts({ densityStyle: value });
    };

    const updateFontStyle = (value: FontStyle) => {
        setFontStyle(value);
        localStorage.setItem('font-style', value);
        syncParts({ fontStyle: value });
    };

    const updateShadowStyle = (value: ShadowStyle) => {
        setShadowStyle(value);
        localStorage.setItem('shadow-style', value);
        syncParts({ shadowStyle: value });
    };

    const applyPreset = (preset: ThemePreset) => {
        const selected = themePresets[preset];

        setAppearance(selected.appearance);
        setAccentColor(selected.accentColor);
        setSidebarColor(selected.sidebarColor);
        setHeaderColor(selected.headerColor);
        setContentBg(selected.contentBg);
        setRadiusStyle(selected.radiusStyle);
        setDensityStyle(selected.densityStyle);
        setFontStyle(selected.fontStyle);
        setShadowStyle(selected.shadowStyle);

        localStorage.setItem('appearance', selected.appearance);
        localStorage.setItem('accent-color', selected.accentColor);
        localStorage.setItem('sidebar-color', selected.sidebarColor);
        localStorage.setItem('header-color', selected.headerColor);
        localStorage.setItem('content-bg', selected.contentBg);
        localStorage.setItem('radius-style', selected.radiusStyle);
        localStorage.setItem('density-style', selected.densityStyle);
        localStorage.setItem('font-style', selected.fontStyle);
        localStorage.setItem('shadow-style', selected.shadowStyle);

        applyTheme(selected.appearance);
        applyAccentColor(selected.accentColor);
        applyThemeParts(selected);
    };

    const resetAppearance = () => {
        updateAppearance(defaults.appearance);
        updateAccentColor(defaults.accentColor);
        updateSidebarColor(defaults.sidebarColor);
        updateHeaderColor(defaults.headerColor);
        updateContentBg(defaults.contentBg);
        updateRadiusStyle(defaults.radiusStyle);
        updateDensityStyle(defaults.densityStyle);
        updateFontStyle(defaults.fontStyle);
        updateShadowStyle(defaults.shadowStyle);
    };

    useEffect(() => {
        const savedAppearance = (localStorage.getItem('appearance') as Appearance | null) || defaults.appearance;
        const savedAccentColor = (localStorage.getItem('accent-color') as AccentColor | null) || defaults.accentColor;
        const savedSidebarColor = (localStorage.getItem('sidebar-color') as SidebarColor | null) || defaults.sidebarColor;
        const savedHeaderColor = (localStorage.getItem('header-color') as HeaderColor | null) || defaults.headerColor;
        const savedContentBg = (localStorage.getItem('content-bg') as ContentBg | null) || defaults.contentBg;
        const savedRadiusStyle = (localStorage.getItem('radius-style') as RadiusStyle | null) || defaults.radiusStyle;
        const savedDensityStyle = (localStorage.getItem('density-style') as DensityStyle | null) || defaults.densityStyle;
        const savedFontStyle = (localStorage.getItem('font-style') as FontStyle | null) || defaults.fontStyle;
        const savedShadowStyle = (localStorage.getItem('shadow-style') as ShadowStyle | null) || defaults.shadowStyle;

        setAppearance(savedAppearance);
        setAccentColor(savedAccentColor);
        setSidebarColor(savedSidebarColor);
        setHeaderColor(savedHeaderColor);
        setContentBg(savedContentBg);
        setRadiusStyle(savedRadiusStyle);
        setDensityStyle(savedDensityStyle);
        setFontStyle(savedFontStyle);
        setShadowStyle(savedShadowStyle);

        applyTheme(savedAppearance);
        applyAccentColor(savedAccentColor);
        applyThemeParts({
            sidebarColor: savedSidebarColor,
            headerColor: savedHeaderColor,
            contentBg: savedContentBg,
            radiusStyle: savedRadiusStyle,
            densityStyle: savedDensityStyle,
            fontStyle: savedFontStyle,
            shadowStyle: savedShadowStyle,
        });
    }, []);

    return {
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
    };
}