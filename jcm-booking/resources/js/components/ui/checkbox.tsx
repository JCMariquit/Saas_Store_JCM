import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type CheckboxVariant =
    | 'default'
    | 'soft'
    | 'outline'
    | 'enterprise'
    | 'glass'
    | 'metric'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';

type CheckboxSize = 'sm' | 'md' | 'lg';

function getSize(size: CheckboxSize) {
    switch (size) {
        case 'sm':
            return {
                root: 'size-3.5 rounded-[3px]',
                icon: 'size-3',
            };
        case 'lg':
            return {
                root: 'size-5 rounded-md',
                icon: 'size-4',
            };
        case 'md':
        default:
            return {
                root: 'size-4 rounded-[4px]',
                icon: 'size-3.5',
            };
    }
}

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
    variant?: CheckboxVariant;
    size?: CheckboxSize;
    indeterminate?: boolean;
};

function Checkbox({
    className,
    variant = 'default',
    size = 'md',
    indeterminate = false,
    checked,
    ...props
}: CheckboxProps) {
    const sizes = getSize(size);

    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            checked={indeterminate ? 'indeterminate' : checked}
            className={cn(
                'peer shrink-0 border shadow-xs outline-none transition-all duration-200',
                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',

                sizes.root,

                variant === 'default' &&
                    'border-input bg-background data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',

                variant === 'soft' &&
                    'border-transparent bg-muted/50 text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=indeterminate]:bg-primary/10 data-[state=indeterminate]:text-primary',

                variant === 'outline' &&
                    'border-input bg-transparent text-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary',

                variant === 'enterprise' &&
                    'border-border/70 bg-card ring-1 ring-border/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',

                variant === 'glass' &&
                    'border-white/10 bg-background/60 backdrop-blur-xl data-[state=checked]:border-primary/40 data-[state=checked]:bg-primary/90 data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary/40 data-[state=indeterminate]:bg-primary/90 data-[state=indeterminate]:text-primary-foreground',

                variant === 'metric' &&
                    'border-border/70 bg-gradient-to-br from-card to-muted/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',

                variant === 'success' &&
                    'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=indeterminate]:bg-emerald-500 data-[state=indeterminate]:text-white dark:text-emerald-400',

                variant === 'warning' &&
                    'border-amber-500/25 bg-amber-500/10 text-amber-700 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white data-[state=indeterminate]:bg-amber-500 data-[state=indeterminate]:text-white dark:text-amber-400',

                variant === 'danger' &&
                    'border-red-500/25 bg-red-500/10 text-red-700 data-[state=checked]:bg-red-500 data-[state=checked]:text-white data-[state=indeterminate]:bg-red-500 data-[state=indeterminate]:text-white dark:text-red-400',

                variant === 'info' &&
                    'border-blue-500/25 bg-blue-500/10 text-blue-700 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=indeterminate]:bg-blue-500 data-[state=indeterminate]:text-white dark:text-blue-400',

                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current"
            >
                {indeterminate ? (
                    <MinusIcon className={sizes.icon} />
                ) : (
                    <CheckIcon className={sizes.icon} />
                )}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };

export type { CheckboxSize, CheckboxVariant };