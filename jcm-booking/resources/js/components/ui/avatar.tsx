import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '@/lib/utils';

type AvatarVariant =
    | 'default'
    | 'soft'
    | 'outline'
    | 'enterprise'
    | 'glass'
    | 'status'
    | 'metric';

type AvatarSize =
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl';

type AvatarStatus =
    | 'online'
    | 'offline'
    | 'busy'
    | 'away'
    | 'none';

type AvatarContextValue = {
    size: AvatarSize;
    variant: AvatarVariant;
};

const AvatarContext = React.createContext<AvatarContextValue>({
    size: 'md',
    variant: 'default',
});

function useAvatar() {
    return React.useContext(AvatarContext);
}

function getSize(size: AvatarSize) {
    switch (size) {
        case 'xs':
            return 'size-6 text-[10px]';
        case 'sm':
            return 'size-8 text-xs';
        case 'md':
            return 'size-10 text-sm';
        case 'lg':
            return 'size-12 text-base';
        case 'xl':
            return 'size-14 text-lg';
        case '2xl':
            return 'size-16 text-xl';
        case '3xl':
            return 'size-20 text-2xl';
        default:
            return 'size-10 text-sm';
    }
}

type AvatarProps = React.ComponentProps<
    typeof AvatarPrimitive.Root
> & {
    variant?: AvatarVariant;
    size?: AvatarSize;
    status?: AvatarStatus;
};

function Avatar({
    className,
    variant = 'default',
    size = 'md',
    status = 'none',
    children,
    ...props
}: AvatarProps) {
    return (
        <AvatarContext.Provider
            value={{
                size,
                variant,
            }}
        >
            <AvatarPrimitive.Root
                data-slot="avatar"
                className={cn(
                    'relative flex shrink-0 overflow-hidden rounded-full transition-all duration-200',

                    getSize(size),

                    variant === 'default' &&
                        'bg-muted',

                    variant === 'soft' &&
                        'bg-muted/40',

                    variant === 'outline' &&
                        'border bg-background',

                    variant === 'enterprise' &&
                        'border bg-card shadow-xs ring-1 ring-border/60',

                    variant === 'glass' &&
                        'border border-white/10 bg-background/60 backdrop-blur-xl',

                    variant === 'status' &&
                        'border shadow-xs',

                    variant === 'metric' &&
                        'bg-gradient-to-br from-card to-muted/20 shadow-sm border',

                    className,
                )}
                {...props}
            >
                {children}

                {status !== 'none' && (
                    <span
                        className={cn(
                            'absolute bottom-0 right-0 rounded-full border-2 border-background',

                            size === 'xs' && 'size-2',
                            size === 'sm' && 'size-2.5',
                            size === 'md' && 'size-3',
                            size === 'lg' && 'size-3.5',
                            size === 'xl' && 'size-4',
                            size === '2xl' && 'size-4.5',
                            size === '3xl' && 'size-5',

                            status === 'online' &&
                                'bg-emerald-500',

                            status === 'offline' &&
                                'bg-zinc-400',

                            status === 'busy' &&
                                'bg-red-500',

                            status === 'away' &&
                                'bg-amber-500',
                        )}
                    />
                )}
            </AvatarPrimitive.Root>
        </AvatarContext.Provider>
    );
}

function AvatarImage({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn(
                'aspect-square size-full object-cover',
                className,
            )}
            {...props}
        />
    );
}

function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    const { variant } = useAvatar();

    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                'flex size-full items-center justify-center rounded-full font-semibold uppercase',

                variant === 'default' &&
                    'bg-muted text-muted-foreground',

                variant === 'soft' &&
                    'bg-muted/40 text-muted-foreground',

                variant === 'outline' &&
                    'bg-background text-foreground',

                variant === 'enterprise' &&
                    'bg-muted/20 text-foreground',

                variant === 'glass' &&
                    'bg-background/40 text-foreground',

                variant === 'status' &&
                    'bg-card text-foreground',

                variant === 'metric' &&
                    'bg-gradient-to-br from-muted/20 to-muted text-foreground',

                className,
            )}
            {...props}
        />
    );
}

type AvatarGroupProps = React.ComponentProps<'div'> & {
    limit?: number;
};

function AvatarGroup({
    className,
    children,
    limit,
    ...props
}: AvatarGroupProps) {
    const items = React.Children.toArray(children);

    const visibleItems = limit
        ? items.slice(0, limit)
        : items;

    const extraCount = limit
        ? items.length - limit
        : 0;

    return (
        <div
            data-slot="avatar-group"
            className={cn(
                'flex -space-x-3',
                className,
            )}
            {...props}
        >
            {visibleItems}

            {extraCount > 0 && (
                <div className="flex size-10 items-center justify-center rounded-full border bg-muted text-xs font-semibold shadow-xs">
                    +{extraCount}
                </div>
            )}
        </div>
    );
}

export {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarImage,
};

export type {
    AvatarSize,
    AvatarStatus,
    AvatarVariant,
};