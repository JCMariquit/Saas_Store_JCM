import * as React from 'react';

import { cn } from '@/lib/utils';

type CardVariant =
    | 'default'
    | 'soft'
    | 'elevated'
    | 'enterprise'
    | 'metric'
    | 'glass'
    | 'outline'
    | 'ghost'
    | 'interactive'
    | 'status';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type CardContextValue = {
    variant: CardVariant;
    padding: CardPadding;
};

const CardContext = React.createContext<CardContextValue>({
    variant: 'default',
    padding: 'md',
});

function useCard() {
    return React.useContext(CardContext);
}

type CardProps = React.ComponentProps<'div'> & {
    variant?: CardVariant;
    padding?: CardPadding;
};

function Card({
    className,
    variant = 'default',
    padding = 'md',
    ...props
}: CardProps) {
    return (
        <CardContext.Provider value={{ variant, padding }}>
            <div
                data-slot="card"
                data-variant={variant}
                className={cn(
                    'bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl border transition-all duration-200',

                    variant === 'default' && 'shadow-xs',
                    variant === 'soft' && 'border-transparent bg-muted/30 shadow-none',
                    variant === 'elevated' && 'rounded-2xl shadow-sm hover:shadow-md',
                    variant === 'enterprise' &&
                        'rounded-2xl shadow-xs hover:border-primary/30 hover:ring-1 hover:ring-primary/10',
                    variant === 'metric' &&
                        'rounded-2xl bg-gradient-to-br from-card to-muted/20 shadow-xs',
                    variant === 'glass' &&
                        'border-white/10 bg-background/70 shadow-sm backdrop-blur-xl',
                    variant === 'outline' && 'bg-transparent shadow-none',
                    variant === 'ghost' && 'border-transparent bg-transparent shadow-none',
                    variant === 'interactive' &&
                        'cursor-pointer rounded-2xl shadow-xs hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
                    variant === 'status' &&
                        'rounded-2xl border-l-4 shadow-xs',

                    padding === 'sm' && 'gap-4 py-4',
                    padding === 'md' && 'gap-6 py-6',
                    padding === 'lg' && 'gap-7 py-7',
                    padding === 'none' && 'gap-0 py-0',

                    className,
                )}
                {...props}
            />
        </CardContext.Provider>
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    const { padding, variant } = useCard();

    return (
        <div
            data-slot="card-header"
            className={cn(
                'flex flex-col gap-1.5',
                padding === 'sm' && 'px-4',
                padding === 'md' && 'px-6',
                padding === 'lg' && 'px-7',
                padding === 'none' && 'px-0',
                variant === 'enterprise' && 'border-b bg-muted/15 pb-5',
                variant === 'metric' && 'gap-2',
                className,
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-title"
            className={cn('leading-none font-semibold tracking-tight', className)}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-description"
            className={cn('text-sm leading-5 text-muted-foreground', className)}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    const { padding } = useCard();

    return (
        <div
            data-slot="card-content"
            className={cn(
                padding === 'sm' && 'px-4',
                padding === 'md' && 'px-6',
                padding === 'lg' && 'px-7',
                padding === 'none' && 'px-0',
                className,
            )}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    const { padding } = useCard();

    return (
        <div
            data-slot="card-footer"
            className={cn(
                'flex items-center',
                padding === 'sm' && 'px-4',
                padding === 'md' && 'px-6',
                padding === 'lg' && 'px-7',
                padding === 'none' && 'px-0',
                className,
            )}
            {...props}
        />
    );
}

function CardIcon({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-icon"
            className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/35 text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

function CardBadge({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="card-badge"
            className={cn(
                'inline-flex items-center rounded-md border bg-muted/30 px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase',
                className,
            )}
            {...props}
        />
    );
}

export {
    Card,
    CardBadge,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardIcon,
    CardTitle,
};

export type { CardPadding, CardVariant };