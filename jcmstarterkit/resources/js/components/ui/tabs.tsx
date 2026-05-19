import * as React from 'react';

import { cn } from '@/lib/utils';

type TabsVariant =
    | 'default'
    | 'pills'
    | 'underline'
    | 'enterprise'
    | 'sidebar'
    | 'segmented'
    | 'cards'
    | 'minimal';

type TabsSize = 'sm' | 'md' | 'lg';

type TabsContextValue = {
    value: string;
    setValue: (value: string) => void;
    variant: TabsVariant;
    size: TabsSize;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
    const context = React.useContext(TabsContext);

    if (!context) {
        throw new Error('Tabs components must be used inside <Tabs>.');
    }

    return context;
}

type TabsProps = {
    value?: string;
    defaultValue: string;
    onValueChange?: (value: string) => void;
    variant?: TabsVariant;
    size?: TabsSize;
    className?: string;
    children: React.ReactNode;
};

function Tabs({
    value,
    defaultValue,
    onValueChange,
    variant = 'default',
    size = 'md',
    className,
    children,
}: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const activeValue = value ?? internalValue;

    const setValue = React.useCallback(
        (nextValue: string) => {
            if (value === undefined) {
                setInternalValue(nextValue);
            }

            onValueChange?.(nextValue);
        },
        [onValueChange, value],
    );

    return (
        <TabsContext.Provider
            value={{
                value: activeValue,
                setValue,
                variant,
                size,
            }}
        >
            <div
                data-slot="tabs"
                data-variant={variant}
                className={cn('w-full', className)}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
}

type TabsListProps = React.ComponentProps<'div'>;

function TabsList({ className, ...props }: TabsListProps) {
    const { variant } = useTabs();

    return (
        <div
            data-slot="tabs-list"
            role="tablist"
            className={cn(
                'flex items-center',

                variant === 'default' &&
                    'inline-flex rounded-xl border bg-muted/30 p-1',

                variant === 'pills' &&
                    'flex-wrap gap-2',

                variant === 'underline' &&
                    'gap-6 border-b',

                variant === 'enterprise' &&
                    'inline-flex rounded-2xl border bg-card p-1 shadow-xs',

                variant === 'sidebar' &&
                    'flex-col items-stretch gap-1 rounded-2xl border bg-card p-2 shadow-xs',

                variant === 'segmented' &&
                    'inline-grid overflow-hidden rounded-xl border bg-muted/30 p-1',

                variant === 'cards' &&
                    'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',

                variant === 'minimal' &&
                    'gap-2',

                className,
            )}
            {...props}
        />
    );
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    subtitle?: React.ReactNode;
};

function TabsTrigger({
    value,
    icon,
    badge,
    subtitle,
    className,
    children,
    ...props
}: TabsTriggerProps) {
    const { value: activeValue, setValue, variant, size } = useTabs();
    const isActive = activeValue === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? 'active' : 'inactive'}
            data-slot="tabs-trigger"
            onClick={() => setValue(value)}
            className={cn(
                'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium outline-none transition-all duration-200',
                'focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
                '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',

                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',

                variant === 'default' &&
                    cn(
                        'rounded-lg text-muted-foreground hover:text-foreground',
                        size === 'sm' && 'h-8 px-3',
                        size === 'md' && 'h-9 px-4',
                        size === 'lg' && 'h-10 px-5',
                        isActive && 'bg-background text-foreground shadow-xs',
                    ),

                variant === 'pills' &&
                    cn(
                        'rounded-full border bg-background text-muted-foreground hover:text-foreground',
                        size === 'sm' && 'h-8 px-3',
                        size === 'md' && 'h-9 px-4',
                        size === 'lg' && 'h-10 px-5',
                        isActive &&
                            'border-primary/30 bg-primary text-primary-foreground shadow-xs',
                    ),

                variant === 'underline' &&
                    cn(
                        'relative -mb-px border-b-2 border-transparent px-0 pb-3 text-muted-foreground hover:text-foreground',
                        isActive && 'border-foreground text-foreground',
                    ),

                variant === 'enterprise' &&
                    cn(
                        'rounded-xl text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                        size === 'sm' && 'h-8 px-3',
                        size === 'md' && 'h-10 px-4',
                        size === 'lg' && 'h-11 px-5',
                        isActive &&
                            'bg-background text-foreground shadow-xs ring-1 ring-border/70',
                    ),

                variant === 'sidebar' &&
                    cn(
                        'w-full justify-start rounded-xl px-3 py-3 text-left text-muted-foreground hover:bg-muted/35 hover:text-foreground',
                        isActive &&
                            'bg-muted/45 text-foreground ring-1 ring-border/70',
                    ),

                variant === 'segmented' &&
                    cn(
                        'rounded-lg text-muted-foreground hover:text-foreground',
                        size === 'sm' && 'h-8 px-3',
                        size === 'md' && 'h-9 px-4',
                        size === 'lg' && 'h-10 px-5',
                        isActive && 'bg-background text-foreground shadow-xs',
                    ),

                variant === 'cards' &&
                    cn(
                        'justify-start rounded-2xl border bg-card p-4 text-left shadow-xs hover:border-primary/30',
                        isActive &&
                            'border-primary/40 ring-1 ring-primary/15',
                    ),

                variant === 'minimal' &&
                    cn(
                        'rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted/35 hover:text-foreground',
                        isActive && 'bg-muted text-foreground',
                    ),

                className,
            )}
            {...props}
        >
            {icon && (
                <span
                    className={cn(
                        'flex shrink-0 items-center justify-center',
                        variant === 'cards' &&
                            'size-10 rounded-xl border bg-muted/30 text-muted-foreground',
                    )}
                >
                    {icon}
                </span>
            )}

            <span className={cn('min-w-0', variant === 'cards' && 'flex-1')}>
                <span className="block truncate">{children}</span>
                {subtitle && (
                    <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                        {subtitle}
                    </span>
                )}
            </span>

            {badge && (
                <span className="ml-auto shrink-0 rounded-md border bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {badge}
                </span>
            )}
        </button>
    );
}

type TabsContentProps = React.ComponentProps<'div'> & {
    value: string;
};

function TabsContent({
    value,
    className,
    children,
    ...props
}: TabsContentProps) {
    const { value: activeValue } = useTabs();

    if (activeValue !== value) {
        return null;
    }

    return (
        <div
            data-slot="tabs-content"
            role="tabpanel"
            className={cn(
                'mt-5 outline-none animate-in fade-in-0 zoom-in-95 duration-200',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
};

export type {
    TabsSize,
    TabsVariant,
};