import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap shrink-0 gap-1.5 font-medium transition-all duration-200 overflow-hidden select-none [&>svg]:pointer-events-none',
    {
        variants: {
            variant: {
                default:
                    'rounded-md border border-transparent bg-primary px-2 py-0.5 text-xs text-primary-foreground shadow-xs hover:opacity-90',

                secondary:
                    'rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs text-secondary-foreground',

                destructive:
                    'rounded-md border border-destructive/20 bg-destructive px-2 py-0.5 text-xs text-white shadow-xs',

                outline:
                    'rounded-md border bg-transparent px-2 py-0.5 text-xs text-foreground hover:bg-muted/40',

                soft:
                    'rounded-md border-transparent bg-muted px-2 py-0.5 text-xs text-muted-foreground',

                success:
                    'rounded-md border border-emerald-500/15 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400',

                warning:
                    'rounded-md border border-amber-500/15 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400',

                danger:
                    'rounded-md border border-red-500/15 bg-red-500/10 px-2 py-0.5 text-xs text-red-700 dark:text-red-400',

                info:
                    'rounded-md border border-blue-500/15 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400',

                purple:
                    'rounded-md border border-violet-500/15 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-700 dark:text-violet-400',

                enterprise:
                    'rounded-lg border bg-card px-2.5 py-1 text-[11px] font-semibold shadow-xs',

                glass:
                    'rounded-lg border border-white/10 bg-background/60 px-2.5 py-1 text-[11px] backdrop-blur-xl',

                metric:
                    'rounded-lg border bg-gradient-to-br from-card to-muted/20 px-2.5 py-1 text-[11px] font-semibold shadow-xs',

                status:
                    'rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-xs',

                dot:
                    'rounded-full border px-2.5 py-1 text-[11px] font-medium',
            },

            size: {
                sm: 'h-5 px-2 text-[10px]',
                md: 'h-6 px-2.5 text-xs',
                lg: 'h-7 px-3 text-sm',
            },

            clickable: {
                true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    },
);

function Badge({
    className,
    variant,
    size,
    clickable,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp
            data-slot="badge"
            className={cn(
                badgeVariants({
                    variant,
                    size,
                    clickable,
                }),
                className,
            )}
            {...props}
        />
    );
}

export { Badge, badgeVariants };