import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

type TooltipVariant =
    | 'default'
    | 'dark'
    | 'light'
    | 'enterprise'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'glass';

type TooltipSize = 'sm' | 'md' | 'lg';

type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider>;

function TooltipProvider({
    delayDuration = 120,
    skipDelayDuration = 80,
    ...props
}: TooltipProviderProps) {
    return (
        <TooltipPrimitive.Provider
            delayDuration={delayDuration}
            skipDelayDuration={skipDelayDuration}
            {...props}
        />
    );
}

function Tooltip({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
    return (
        <TooltipPrimitive.Trigger
            data-slot="tooltip-trigger"
            {...props}
        />
    );
}

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & {
    variant?: TooltipVariant;
    size?: TooltipSize;
    showArrow?: boolean;
};

function TooltipContent({
    className,
    sideOffset = 8,
    variant = 'default',
    size = 'md',
    showArrow = true,
    children,
    ...props
}: TooltipContentProps) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    'z-50 max-w-xs overflow-hidden rounded-lg border px-3 py-1.5 text-xs font-medium shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',

                    size === 'sm' && 'px-2 py-1 text-[11px]',
                    size === 'md' && 'px-3 py-1.5 text-xs',
                    size === 'lg' && 'px-4 py-2 text-sm',

                    variant === 'default' &&
                        'bg-popover text-popover-foreground',
                    variant === 'dark' &&
                        'border-zinc-900 bg-zinc-950 text-white',
                    variant === 'light' &&
                        'bg-white text-zinc-950',
                    variant === 'enterprise' &&
                        'rounded-xl bg-card text-card-foreground ring-1 ring-border/70',
                    variant === 'success' &&
                        'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                    variant === 'warning' &&
                        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                    variant === 'danger' &&
                        'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
                    variant === 'info' &&
                        'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300',
                    variant === 'glass' &&
                        'border-white/10 bg-background/75 text-foreground backdrop-blur-xl',

                    className,
                )}
                {...props}
            >
                {children}

                {showArrow && (
                    <TooltipPrimitive.Arrow
                        className={cn(
                            'fill-current',
                            variant === 'default' && 'text-popover',
                            variant === 'dark' && 'text-zinc-950',
                            variant === 'light' && 'text-white',
                            variant === 'enterprise' && 'text-card',
                            variant === 'glass' && 'text-background/75',
                        )}
                    />
                )}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}

export {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
};

export type {
    TooltipSize,
    TooltipVariant,
};