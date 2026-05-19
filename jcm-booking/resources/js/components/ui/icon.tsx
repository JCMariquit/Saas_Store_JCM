import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type IconVariant =
    | 'default'
    | 'soft'
    | 'outline'
    | 'enterprise'
    | 'glass'
    | 'metric'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'ghost';

type IconSize =
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl';

type IconShape =
    | 'square'
    | 'soft'
    | 'circle';

interface IconProps {
    iconNode?: LucideIcon | null;
    className?: string;

    variant?: IconVariant;
    size?: IconSize;
    shape?: IconShape;

    clickable?: boolean;
    bordered?: boolean;
    badge?: boolean;

    iconClassName?: string;
}

function getSize(size: IconSize) {
    switch (size) {
        case 'xs':
            return {
                wrapper: 'size-6',
                icon: 'size-3',
            };

        case 'sm':
            return {
                wrapper: 'size-8',
                icon: 'size-4',
            };

        case 'lg':
            return {
                wrapper: 'size-11',
                icon: 'size-5',
            };

        case 'xl':
            return {
                wrapper: 'size-14',
                icon: 'size-6',
            };

        case '2xl':
            return {
                wrapper: 'size-16',
                icon: 'size-7',
            };

        case 'md':
        default:
            return {
                wrapper: 'size-10',
                icon: 'size-4.5',
            };
    }
}

export function Icon({
    iconNode: IconComponent,
    className,

    variant = 'default',
    size = 'md',
    shape = 'soft',

    clickable = false,
    bordered = false,
    badge = false,

    iconClassName,
}: IconProps) {
    if (!IconComponent) {
        return null;
    }

    const sizes = getSize(size);

    return (
        <div
            data-slot="icon"
            className={cn(
                'relative inline-flex shrink-0 items-center justify-center transition-all duration-200 select-none',

                sizes.wrapper,

                shape === 'square' &&
                    'rounded-md',

                shape === 'soft' &&
                    'rounded-xl',

                shape === 'circle' &&
                    'rounded-full',

                bordered &&
                    'border',

                clickable &&
                    'cursor-pointer hover:scale-[1.03] active:scale-[0.97]',

                variant === 'default' &&
                    'bg-muted text-foreground',

                variant === 'soft' &&
                    'bg-muted/40 text-muted-foreground',

                variant === 'outline' &&
                    'border bg-background text-foreground',

                variant === 'enterprise' &&
                    'border bg-card shadow-xs ring-1 ring-border/50 text-foreground',

                variant === 'glass' &&
                    'border border-white/10 bg-background/60 backdrop-blur-xl text-foreground',

                variant === 'metric' &&
                    'bg-gradient-to-br from-card to-muted/20 shadow-xs text-foreground',

                variant === 'success' &&
                    'border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',

                variant === 'warning' &&
                    'border border-amber-500/15 bg-amber-500/10 text-amber-600 dark:text-amber-400',

                variant === 'danger' &&
                    'border border-red-500/15 bg-red-500/10 text-red-600 dark:text-red-400',

                variant === 'info' &&
                    'border border-blue-500/15 bg-blue-500/10 text-blue-600 dark:text-blue-400',

                variant === 'ghost' &&
                    'bg-transparent text-muted-foreground hover:bg-muted/40',

                className,
            )}
        >
            <IconComponent
                className={cn(
                    'shrink-0',
                    sizes.icon,
                    iconClassName,
                )}
            />

            {badge && (
                <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500 ring-2 ring-background" />
            )}
        </div>
    );
}

export type {
    IconProps,
    IconShape,
    IconSize,
    IconVariant,
};