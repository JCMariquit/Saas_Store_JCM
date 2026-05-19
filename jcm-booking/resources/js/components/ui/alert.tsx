import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
    [
        'relative w-full overflow-hidden border text-sm transition-all duration-200',
        'grid items-start gap-y-1',
        'has-[>svg]:grid-cols-[auto_1fr] grid-cols-[0_1fr]',
        'has-[>svg]:gap-x-3',
        '[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    ].join(' '),
    {
        variants: {
            variant: {
                default:
                    'rounded-xl bg-background px-4 py-3 text-foreground shadow-xs',

                info:
                    'rounded-xl border-blue-500/20 bg-blue-500/10 px-4 py-3 text-blue-800 dark:text-blue-300',

                success:
                    'rounded-xl border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-800 dark:text-emerald-300',

                warning:
                    'rounded-xl border-amber-500/25 bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-300',

                destructive:
                    'rounded-xl border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive',

                purple:
                    'rounded-xl border-violet-500/20 bg-violet-500/10 px-4 py-3 text-violet-800 dark:text-violet-300',

                enterprise:
                    'rounded-2xl bg-card px-5 py-4 text-card-foreground shadow-xs ring-1 ring-border/70',

                elevated:
                    'rounded-2xl bg-card px-5 py-4 text-card-foreground shadow-sm',

                soft:
                    'rounded-xl border-transparent bg-muted/35 px-4 py-3 text-foreground',

                outline:
                    'rounded-xl bg-transparent px-4 py-3 text-foreground',

                glass:
                    'rounded-2xl border-white/10 bg-background/70 px-5 py-4 text-foreground shadow-sm backdrop-blur-xl',

                status:
                    'rounded-2xl border-l-4 bg-card px-5 py-4 text-card-foreground shadow-xs',
            },

            size: {
                sm: 'px-3 py-2 text-xs',
                md: '',
                lg: 'px-5 py-5 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    },
);

function Alert({
    className,
    variant,
    size,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({ variant, size }), className)}
            {...props}
        />
    );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-title"
            className={cn(
                'col-start-2 min-h-4 font-semibold leading-none tracking-tight text-current',
                className,
            )}
            {...props}
        />
    );
}

function AlertDescription({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'col-start-2 grid justify-items-start gap-1 text-sm leading-6 text-current/75 [&_p]:leading-relaxed',
                className,
            )}
            {...props}
        />
    );
}

function AlertActions({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-actions"
            className={cn(
                'col-start-2 mt-3 flex flex-wrap items-center gap-2',
                className,
            )}
            {...props}
        />
    );
}

export { Alert, AlertActions, AlertDescription, AlertTitle, alertVariants };