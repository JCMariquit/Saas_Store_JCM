import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    [
        'inline-flex items-center justify-center gap-2 whitespace-nowrap',
        'text-sm font-medium transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        "[&_svg:not([class*='size-'])]:size-4",
        'outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'active:scale-[0.98]',
    ].join(' '),
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',

                secondary:
                    'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',

                destructive:
                    'bg-destructive text-white shadow-xs hover:bg-destructive/90',

                outline:
                    'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',

                ghost:
                    'bg-transparent hover:bg-accent hover:text-accent-foreground',

                link:
                    'h-auto px-0 text-primary underline-offset-4 hover:underline active:scale-100',

                soft:
                    'bg-primary/10 text-primary hover:bg-primary/15',

                muted:
                    'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',

                minimal:
                    'bg-transparent text-foreground hover:bg-muted',

                success:
                    'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700',

                successSoft:
                    'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400',

                warning:
                    'bg-amber-500 text-white shadow-xs hover:bg-amber-600',

                warningSoft:
                    'bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400',

                info:
                    'bg-sky-600 text-white shadow-xs hover:bg-sky-700',

                infoSoft:
                    'bg-sky-500/10 text-sky-700 hover:bg-sky-500/15 dark:text-sky-400',

                dangerSoft:
                    'bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-400',

                dark:
                    'bg-zinc-950 text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',

                white:
                    'border border-zinc-200 bg-white text-zinc-900 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900',

                black:
                    'bg-black text-white shadow-xs hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85',

                premium:
                    'bg-zinc-950 text-white shadow-[0_12px_35px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',

                gradient:
                    'bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-sm hover:shadow-md',

                gradientBlue:
                    'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm hover:shadow-md',

                gradientPurple:
                    'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm hover:shadow-md',

                gradientGreen:
                    'bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow-sm hover:shadow-md',

                gradientOrange:
                    'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-sm hover:shadow-md',

                glass:
                    'border border-white/20 bg-white/10 text-foreground shadow-sm backdrop-blur hover:bg-white/20 dark:bg-white/5',

                glassDark:
                    'border border-zinc-800/30 bg-zinc-950/70 text-white shadow-sm backdrop-blur hover:bg-zinc-900/80',

                neon:
                    'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)] hover:shadow-[0_0_28px_hsl(var(--primary)/0.65)]',

                neonBlue:
                    'bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.45)] hover:shadow-[0_0_30px_rgba(37,99,235,0.65)]',

                neonGreen:
                    'bg-emerald-600 text-white shadow-[0_0_22px_rgba(5,150,105,0.45)] hover:shadow-[0_0_30px_rgba(5,150,105,0.65)]',

                dashed:
                    'border border-dashed border-input bg-background hover:bg-accent hover:text-accent-foreground',

                dotted:
                    'border border-dotted border-input bg-background hover:bg-accent hover:text-accent-foreground',

                pill:
                    'rounded-full bg-primary px-5 text-primary-foreground shadow-xs hover:bg-primary/90',

                enterprise:
                    'border border-zinc-200 bg-zinc-950 text-white shadow-sm hover:bg-zinc-800 dark:border-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',

                corporate:
                    'border border-slate-200 bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:border-slate-700',

                elevated:
                    'bg-background text-foreground shadow-md ring-1 ring-border hover:-translate-y-0.5 hover:shadow-lg',

                surface:
                    'border border-border bg-card text-card-foreground shadow-xs hover:bg-muted/50',

                clean:
                    'border border-transparent bg-muted/50 text-foreground hover:bg-muted',

                selected:
                    'bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/15',

                sidebar:
                    'justify-start bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',

                sidebarActive:
                    'justify-start bg-primary/10 text-primary ring-1 ring-primary/15',

                tab:
                    'rounded-none border-b-2 border-transparent bg-transparent px-1 shadow-none hover:border-primary hover:text-primary active:scale-100',

                tabActive:
                    'rounded-none border-b-2 border-primary bg-transparent px-1 text-primary shadow-none active:scale-100',

                iconGhost:
                    'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',

                iconSoft:
                    'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
            },

            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                xs: 'h-7 px-2.5 text-xs has-[>svg]:px-2',
                sm: 'h-8 px-3 text-xs has-[>svg]:px-2.5',
                md: 'h-9 px-4 py-2 has-[>svg]:px-3',
                lg: 'h-10 px-6 has-[>svg]:px-4',
                xl: 'h-12 px-8 text-base has-[>svg]:px-6',
                '2xl': 'h-14 px-10 text-base has-[>svg]:px-7',

                icon: 'size-9',
                iconXs: 'size-7',
                iconSm: 'size-8',
                iconMd: 'size-9',
                iconLg: 'size-10',
                iconXl: 'size-12',
            },

            radius: {
                default: 'rounded-md',
                none: 'rounded-none',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
                '2xl': 'rounded-2xl',
                full: 'rounded-full',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'default',
            radius: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    radius,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, radius, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };