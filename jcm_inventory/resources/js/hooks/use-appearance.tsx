import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

export type ThemePreset =
    | 'jcm-dark'
    | 'ocean-enterprise'
    | 'violet-command'
    | 'amber-operations'
    | 'slate-minimal';

export type ThemePresetDefinition = {
    label: string;
    shortLabel: string;
    description: string;
};

export const DEFAULT_APPEARANCE: Appearance = 'dark';
export const DEFAULT_THEME_PRESET: ThemePreset = 'jcm-dark';

export const THEME_PRESETS: Record<ThemePreset, ThemePresetDefinition> = {
    'jcm-dark': {
        label: 'JCM Inventory Dark',
        shortLabel: 'JCM Dark',
        description: 'The default charcoal and emerald operations workspace.',
    },
    'ocean-enterprise': {
        label: 'Ocean Enterprise',
        shortLabel: 'Ocean',
        description: 'A formal navy and blue interface for business operations.',
    },
    'violet-command': {
        label: 'Violet Command',
        shortLabel: 'Violet',
        description: 'A premium violet workspace with controlled glass surfaces.',
    },
    'amber-operations': {
        label: 'Amber Operations',
        shortLabel: 'Amber',
        description: 'An industrial graphite and amber inventory workspace.',
    },
    'slate-minimal': {
        label: 'Slate Minimal',
        shortLabel: 'Slate',
        description: 'A restrained, neutral, compact, and formal interface.',
    },
};

const APPEARANCE_STORAGE_KEY = 'appearance';
const THEME_STORAGE_KEY = 'theme-preset';
const CHANGE_EVENT = 'jcm-theme-change';

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const isAppearance = (value: string | null): value is Appearance =>
    value === 'light' || value === 'dark' || value === 'system';

const isThemePreset = (value: string | null): value is ThemePreset =>
    value !== null && Object.prototype.hasOwnProperty.call(THEME_PRESETS, value);

const getStoredAppearance = (): Appearance => {
    if (!isBrowser()) {
        return DEFAULT_APPEARANCE;
    }

    const stored = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    return isAppearance(stored) ? stored : DEFAULT_APPEARANCE;
};

const getStoredThemePreset = (): ThemePreset => {
    if (!isBrowser()) {
        return DEFAULT_THEME_PRESET;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreset(stored) ? stored : DEFAULT_THEME_PRESET;
};

const prefersDark = (): boolean => {
    if (!isBrowser() || typeof window.matchMedia !== 'function') {
        return true;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyAppearance = (appearance: Appearance): void => {
    if (!isBrowser()) {
        return;
    }

    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    const root = document.documentElement;

    root.classList.toggle('dark', isDark);
    root.dataset.appearance = appearance;
    root.style.colorScheme = isDark ? 'dark' : 'light';
};

const applyThemePreset = (themePreset: ThemePreset): void => {
    if (!isBrowser()) {
        return;
    }

    document.documentElement.dataset.theme = themePreset;
};

const applyStoredPreferences = (): void => {
    applyThemePreset(getStoredThemePreset());
    applyAppearance(getStoredAppearance());
};

const broadcastThemeChange = (): void => {
    if (!isBrowser()) {
        return;
    }

    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

let initialized = false;
let systemMediaQuery: MediaQueryList | null = null;

const handleSystemThemeChange = (): void => {
    if (getStoredAppearance() === 'system') {
        applyAppearance('system');
        broadcastThemeChange();
    }
};

export function initializeTheme(): void {
    if (!isBrowser()) {
        return;
    }

    applyStoredPreferences();

    if (initialized || typeof window.matchMedia !== 'function') {
        return;
    }

    systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemMediaQuery.addEventListener('change', handleSystemThemeChange);
    initialized = true;
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(getStoredAppearance);
    const [themePreset, setThemePreset] = useState<ThemePreset>(getStoredThemePreset);

    const syncFromStorage = () => {
        const nextAppearance = getStoredAppearance();
        const nextThemePreset = getStoredThemePreset();

        setAppearance(nextAppearance);
        setThemePreset(nextThemePreset);
        applyThemePreset(nextThemePreset);
        applyAppearance(nextAppearance);
    };

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);

        if (isBrowser()) {
            window.localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
        }

        applyAppearance(mode);
        broadcastThemeChange();
    };

    const updateThemePreset = (preset: ThemePreset) => {
        setThemePreset(preset);

        if (isBrowser()) {
            window.localStorage.setItem(THEME_STORAGE_KEY, preset);
        }

        applyThemePreset(preset);
        broadcastThemeChange();
    };

    const resetAppearance = () => {
        if (isBrowser()) {
            window.localStorage.setItem(APPEARANCE_STORAGE_KEY, DEFAULT_APPEARANCE);
            window.localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME_PRESET);
        }

        setAppearance(DEFAULT_APPEARANCE);
        setThemePreset(DEFAULT_THEME_PRESET);
        applyThemePreset(DEFAULT_THEME_PRESET);
        applyAppearance(DEFAULT_APPEARANCE);
        broadcastThemeChange();
    };

    useEffect(() => {
        initializeTheme();
        syncFromStorage();

        const handleStorage = (event: StorageEvent) => {
            if (
                event.key === null ||
                event.key === APPEARANCE_STORAGE_KEY ||
                event.key === THEME_STORAGE_KEY
            ) {
                syncFromStorage();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(CHANGE_EVENT, syncFromStorage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener(CHANGE_EVENT, syncFromStorage);
        };
    }, []);

    return {
        appearance,
        themePreset,
        updateAppearance,
        updateThemePreset,
        resetAppearance,
    };
}
