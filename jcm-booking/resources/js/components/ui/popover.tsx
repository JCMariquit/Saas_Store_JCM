import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/lib/utils';

type PopoverVariant =
    | 'default'
    | 'enterprise'
    | 'glass'
    | 'minimal'
    | 'toolbar'
    | 'profile'
    | 'danger'
    | 'form';

type PopoverSize = 'sm' | 'md' | 'lg' | 'xl';

const PopoverContext = React.createContext<{
    variant: PopoverVariant;
    size: PopoverSize;
}>({
    variant: 'default',
    size: 'md',
});

function usePopover() {
    return React.useContext(PopoverContext);
}

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root> & {
    variant?: PopoverVariant;
    size?: PopoverSize;
};

function Popover({
    variant = 'default',
    size = 'md',
    children,
    ...props
}: PopoverProps) {
    return (
        <PopoverContext.Provider value={{ variant, size }}>
            <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
        </PopoverContext.Provider>
    );
}

function PopoverTrigger({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
    return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
    className,
    align = 'center',
    sideOffset = 8,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    const { variant, size } = usePopover();

    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 rounded-xl border bg-popover text-popover-foreground shadow-md outline-none',
                    'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',

                    size === 'sm' && 'w-64 p-3',
                    size === 'md' && 'w-80 p-4',
                    size === 'lg' && 'w-96 p-5',
                    size === 'xl' && 'w-[28rem] p-5',

                    variant === 'enterprise' &&
                        'rounded-2xl bg-card shadow-lg ring-1 ring-border/60',
                    variant === 'glass' &&
                        'rounded-2xl border-white/10 bg-background/80 shadow-lg backdrop-blur-xl',
                    variant === 'minimal' &&
                        'bg-background shadow-xs',
                    variant === 'toolbar' &&
                        'rounded-2xl bg-card shadow-lg',
                    variant === 'profile' &&
                        'w-80 rounded-2xl bg-card shadow-lg ring-1 ring-border/60',
                    variant === 'danger' &&
                        'rounded-2xl border-destructive/20 bg-card shadow-lg',
                    variant === 'form' &&
                        'rounded-2xl bg-card shadow-lg ring-1 ring-border/60',

                    className,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

function PopoverHeader({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="popover-header"
            className={cn('mb-4 space-y-1', className)}
            {...props}
        />
    );
}

function PopoverTitle({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="popover-title"
            className={cn('text-sm font-semibold tracking-tight', className)}
            {...props}
        />
    );
}

function PopoverDescription({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="popover-description"
            className={cn('text-xs leading-5 text-muted-foreground', className)}
            {...props}
        />
    );
}

function PopoverFooter({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="popover-footer"
            className={cn('mt-4 flex items-center justify-end gap-2', className)}
            {...props}
        />
    );
}

function PopoverClose({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
    return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export {
    Popover,
    PopoverAnchor,
    PopoverClose,
    PopoverContent,
    PopoverDescription,
    PopoverFooter,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
};

export type { PopoverSize, PopoverVariant };