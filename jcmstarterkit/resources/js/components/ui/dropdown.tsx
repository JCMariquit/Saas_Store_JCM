import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type DropdownVariant =
    | 'default'
    | 'enterprise'
    | 'glass'
    | 'minimal'
    | 'toolbar'
    | 'profile'
    | 'danger';

type DropdownSize = 'sm' | 'md' | 'lg';

const DropdownContext = React.createContext<{
    variant: DropdownVariant;
    size: DropdownSize;
}>({
    variant: 'default',
    size: 'md',
});

function useDropdown() {
    return React.useContext(DropdownContext);
}

type DropdownProps = React.ComponentProps<typeof DropdownMenuPrimitive.Root> & {
    variant?: DropdownVariant;
    size?: DropdownSize;
};

function Dropdown({
    variant = 'default',
    size = 'md',
    children,
    ...props
}: DropdownProps) {
    return (
        <DropdownContext.Provider value={{ variant, size }}>
            <DropdownMenuPrimitive.Root {...props}>
                {children}
            </DropdownMenuPrimitive.Root>
        </DropdownContext.Provider>
    );
}

function DropdownTrigger({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
    return <DropdownMenuPrimitive.Trigger data-slot="dropdown-trigger" {...props} />;
}

function DropdownPortal({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
    return <DropdownMenuPrimitive.Portal data-slot="dropdown-portal" {...props} />;
}

function DropdownContent({
    className,
    sideOffset = 8,
    align = 'end',
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
    const { variant, size } = useDropdown();

    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                data-slot="dropdown-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 min-w-56 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-md',
                    'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',

                    size === 'sm' && 'min-w-48 text-xs',
                    size === 'md' && 'min-w-56 text-sm',
                    size === 'lg' && 'min-w-72 text-sm',

                    variant === 'enterprise' &&
                        'rounded-2xl bg-card p-2 shadow-lg ring-1 ring-border/60',
                    variant === 'glass' &&
                        'rounded-2xl border-white/10 bg-background/80 p-2 shadow-lg backdrop-blur-xl',
                    variant === 'minimal' &&
                        'rounded-xl border bg-background shadow-xs',
                    variant === 'toolbar' &&
                        'rounded-2xl bg-card p-2 shadow-lg',
                    variant === 'profile' &&
                        'min-w-72 rounded-2xl bg-card p-2 shadow-lg ring-1 ring-border/60',
                    variant === 'danger' &&
                        'rounded-2xl border-destructive/20 bg-card p-2 shadow-lg',

                    className,
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

function DropdownLabel({
    className,
    inset,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
}) {
    return (
        <DropdownMenuPrimitive.Label
            data-slot="dropdown-label"
            className={cn(
                'px-2 py-1.5 text-xs font-semibold text-muted-foreground',
                inset && 'pl-8',
                className,
            )}
            {...props}
        />
    );
}

function DropdownItem({
    className,
    inset,
    variant = 'default',
    icon,
    shortcut,
    description,
    badge,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'default' | 'destructive' | 'success' | 'warning';
    icon?: React.ReactNode;
    shortcut?: React.ReactNode;
    description?: React.ReactNode;
    badge?: React.ReactNode;
}) {
    const { size } = useDropdown();

    return (
        <DropdownMenuPrimitive.Item
            data-slot="dropdown-item"
            className={cn(
                'relative flex cursor-default select-none items-center gap-3 rounded-lg outline-none transition-colors',
                'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                inset && 'pl-8',

                size === 'sm' && 'px-2 py-1.5 text-xs',
                size === 'md' && 'px-2.5 py-2 text-sm',
                size === 'lg' && 'px-3 py-3 text-sm',

                variant === 'destructive' &&
                    'text-destructive focus:bg-destructive/10 focus:text-destructive',
                variant === 'success' &&
                    'text-emerald-700 focus:bg-emerald-500/10 dark:text-emerald-400',
                variant === 'warning' &&
                    'text-amber-700 focus:bg-amber-500/10 dark:text-amber-400',

                className,
            )}
            {...props}
        >
            {icon && (
                <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                    {icon}
                </span>
            )}

            <span className="min-w-0 flex-1">
                <span className="block truncate">{props.children}</span>
                {description && (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {description}
                    </span>
                )}
            </span>

            {badge && (
                <span className="rounded-md border bg-muted/30 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {badge}
                </span>
            )}

            {shortcut && (
                <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                    {shortcut}
                </span>
            )}
        </DropdownMenuPrimitive.Item>
    );
}

function DropdownCheckboxItem({
    className,
    children,
    checked,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            data-slot="dropdown-checkbox-item"
            checked={checked}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-lg py-2 pr-2 pl-8 text-sm outline-none transition-colors',
                'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Check className="size-4" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    );
}

function DropdownRadioGroup({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
    return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-radio-group" {...props} />;
}

function DropdownRadioItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
    return (
        <DropdownMenuPrimitive.RadioItem
            data-slot="dropdown-radio-item"
            className={cn(
                'relative flex cursor-default select-none items-center rounded-lg py-2 pr-2 pl-8 text-sm outline-none transition-colors',
                'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Circle className="size-2 fill-current" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    );
}

function DropdownSeparator({
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
    return (
        <DropdownMenuPrimitive.Separator
            data-slot="dropdown-separator"
            className={cn('-mx-1 my-1 h-px bg-border', className)}
            {...props}
        />
    );
}

function DropdownShortcut({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="dropdown-shortcut"
            className={cn(
                'ml-auto text-xs tracking-widest text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

function DropdownGroup({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
    return <DropdownMenuPrimitive.Group data-slot="dropdown-group" {...props} />;
}

function DropdownSub({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
    return <DropdownMenuPrimitive.Sub data-slot="dropdown-sub" {...props} />;
}

function DropdownSubTrigger({
    className,
    inset,
    children,
    icon,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
    icon?: React.ReactNode;
}) {
    return (
        <DropdownMenuPrimitive.SubTrigger
            data-slot="dropdown-sub-trigger"
            className={cn(
                'flex cursor-default select-none items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors',
                'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent',
                inset && 'pl-8',
                className,
            )}
            {...props}
        >
            {icon && (
                <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                    {icon}
                </span>
            )}
            <span className="flex-1">{children}</span>
            <ChevronRight className="ml-auto size-4" />
        </DropdownMenuPrimitive.SubTrigger>
    );
}

function DropdownSubContent({
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
    return (
        <DropdownMenuPrimitive.SubContent
            data-slot="dropdown-sub-content"
            className={cn(
                'z-50 min-w-48 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg',
                'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                className,
            )}
            {...props}
        />
    );
}

export {
    Dropdown,
    DropdownCheckboxItem,
    DropdownContent,
    DropdownGroup,
    DropdownItem,
    DropdownLabel,
    DropdownPortal,
    DropdownRadioGroup,
    DropdownRadioItem,
    DropdownSeparator,
    DropdownShortcut,
    DropdownSub,
    DropdownSubContent,
    DropdownSubTrigger,
    DropdownTrigger,
};

export type { DropdownSize, DropdownVariant };