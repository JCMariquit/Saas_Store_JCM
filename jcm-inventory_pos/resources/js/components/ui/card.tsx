import * as React from 'react';

import { cn } from '@/lib/utils';

type CardVariant =
    | 'plain'
    | 'default'
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'neutral'
    | 'purple'
    | 'pink'
    | 'teal'
    | 'cyan'
    | 'slate';

type CardTone = 'soft' | 'solid' | 'outline' | 'topline' | 'leftline' | 'glass';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: CardVariant;
    tone?: CardTone;
    interactive?: boolean;
};


const toneClasses: Record<CardTone, Record<CardVariant, string>> = {
    soft: {
        plain: '',
        default: 'border-blue-200/70 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/10',
        primary: 'border-blue-200/70 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/10',
        success: 'border-green-200/70 bg-green-50/40 dark:border-green-900/50 dark:bg-green-950/10',
        danger: 'border-red-200/70 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/10',
        warning: 'border-orange-200/70 bg-orange-50/40 dark:border-orange-900/50 dark:bg-orange-950/10',
        info: 'border-sky-200/70 bg-sky-50/40 dark:border-sky-900/50 dark:bg-sky-950/10',
        neutral: 'border-zinc-200/70 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/20',
        purple: 'border-purple-200/70 bg-purple-50/40 dark:border-purple-900/50 dark:bg-purple-950/10',
        pink: 'border-pink-200/70 bg-pink-50/40 dark:border-pink-900/50 dark:bg-pink-950/10',
        teal: 'border-teal-200/70 bg-teal-50/40 dark:border-teal-900/50 dark:bg-teal-950/10',
        cyan: 'border-cyan-200/70 bg-cyan-50/40 dark:border-cyan-900/50 dark:bg-cyan-950/10',
        slate: 'border-slate-200/70 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/20',
    },

    solid: {
        plain: '',
        default: 'border-blue-600 bg-blue-600 text-white',
        primary: 'border-blue-600 bg-blue-600 text-white',
        success: 'border-green-600 bg-green-600 text-white',
        danger: 'border-red-600 bg-red-600 text-white',
        warning: 'border-orange-500 bg-orange-500 text-white',
        info: 'border-sky-600 bg-sky-600 text-white',
        neutral: 'border-zinc-700 bg-zinc-800 text-white',
        purple: 'border-purple-600 bg-purple-600 text-white',
        pink: 'border-pink-600 bg-pink-600 text-white',
        teal: 'border-teal-600 bg-teal-600 text-white',
        cyan: 'border-cyan-600 bg-cyan-600 text-white',
        slate: 'border-slate-700 bg-slate-800 text-white',
    },

    outline: {
        plain: '',
        default: 'border-blue-300 dark:border-blue-800',
        primary: 'border-blue-300 dark:border-blue-800',
        success: 'border-green-300 dark:border-green-800',
        danger: 'border-red-300 dark:border-red-800',
        warning: 'border-orange-300 dark:border-orange-800',
        info: 'border-sky-300 dark:border-sky-800',
        neutral: 'border-zinc-300 dark:border-zinc-700',
        purple: 'border-purple-300 dark:border-purple-800',
        pink: 'border-pink-300 dark:border-pink-800',
        teal: 'border-teal-300 dark:border-teal-800',
        cyan: 'border-cyan-300 dark:border-cyan-800',
        slate: 'border-slate-300 dark:border-slate-700',
    },

    topline: {
        plain: '',
        default: 'border-t-4 border-t-blue-500',
        primary: 'border-t-4 border-t-blue-500',
        success: 'border-t-4 border-t-green-500',
        danger: 'border-t-4 border-t-red-500',
        warning: 'border-t-4 border-t-orange-500',
        info: 'border-t-4 border-t-sky-500',
        neutral: 'border-t-4 border-t-zinc-400',
        purple: 'border-t-4 border-t-purple-500',
        pink: 'border-t-4 border-t-pink-500',
        teal: 'border-t-4 border-t-teal-500',
        cyan: 'border-t-4 border-t-cyan-500',
        slate: 'border-t-4 border-t-slate-500',
    },

    leftline: {
        plain: '',
        default: 'border-l-4 border-l-blue-500',
        primary: 'border-l-4 border-l-blue-500',
        success: 'border-l-4 border-l-green-500',
        danger: 'border-l-4 border-l-red-500',
        warning: 'border-l-4 border-l-orange-500',
        info: 'border-l-4 border-l-sky-500',
        neutral: 'border-l-4 border-l-zinc-400',
        purple: 'border-l-4 border-l-purple-500',
        pink: 'border-l-4 border-l-pink-500',
        teal: 'border-l-4 border-l-teal-500',
        cyan: 'border-l-4 border-l-cyan-500',
        slate: 'border-l-4 border-l-slate-500',
    },

    glass: {
        plain: 'bg-card/80 backdrop-blur-xl',
        default: 'border-blue-200/60 bg-blue-50/30 backdrop-blur-xl dark:border-blue-900/40 dark:bg-blue-950/10',
        primary: 'border-blue-200/60 bg-blue-50/30 backdrop-blur-xl dark:border-blue-900/40 dark:bg-blue-950/10',
        success: 'border-green-200/60 bg-green-50/30 backdrop-blur-xl dark:border-green-900/40 dark:bg-green-950/10',
        danger: 'border-red-200/60 bg-red-50/30 backdrop-blur-xl dark:border-red-900/40 dark:bg-red-950/10',
        warning: 'border-orange-200/60 bg-orange-50/30 backdrop-blur-xl dark:border-orange-900/40 dark:bg-orange-950/10',
        info: 'border-sky-200/60 bg-sky-50/30 backdrop-blur-xl dark:border-sky-900/40 dark:bg-sky-950/10',
        neutral: 'border-zinc-200/60 bg-zinc-50/30 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/20',
        purple: 'border-purple-200/60 bg-purple-50/30 backdrop-blur-xl dark:border-purple-900/40 dark:bg-purple-950/10',
        pink: 'border-pink-200/60 bg-pink-50/30 backdrop-blur-xl dark:border-pink-900/40 dark:bg-pink-950/10',
        teal: 'border-teal-200/60 bg-teal-50/30 backdrop-blur-xl dark:border-teal-900/40 dark:bg-teal-950/10',
        cyan: 'border-cyan-200/60 bg-cyan-50/30 backdrop-blur-xl dark:border-cyan-900/40 dark:bg-cyan-950/10',
        slate: 'border-slate-200/60 bg-slate-50/30 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/20',
    },
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'plain', tone = 'plain' as CardTone, interactive = false, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm',
                'transition-all duration-200 ease-out',
                'dark:border-border/60 dark:bg-card/95',
                toneClasses[tone]?.[variant],
                interactive && 'cursor-pointer hover:-translate-y-0.5 hover:border-border hover:shadow-md',
                !interactive && 'hover:border-border hover:shadow-md',
                className,
            )}
            {...props}
        />
    ),
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
    ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('text-xl font-semibold leading-tight tracking-tight', className)} {...props} />
    ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />
    ),
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
    ),
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center gap-2 p-5 pt-0', className)} {...props} />
    ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
export type { CardProps, CardTone, CardVariant };