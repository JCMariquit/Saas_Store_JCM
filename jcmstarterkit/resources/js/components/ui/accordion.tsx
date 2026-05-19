import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    Minus,
    Plus,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type AccordionType = 'single' | 'multiple';

type AccordionVariant =
    | 'default'
    | 'borderless'
    | 'card'
    | 'elevated'
    | 'enterprise'
    | 'compact'
    | 'sidebar'
    | 'timeline'
    | 'status'
    | 'ghost';

type AccordionChevron = 'chevron' | 'plus' | 'arrow' | 'none';

type AccordionContextValue = {
    type: AccordionType;
    variant: AccordionVariant;
    chevron: AccordionChevron;
    openItems: string[];
    toggleItem: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion() {
    const context = React.useContext(AccordionContext);

    if (!context) {
        throw new Error('Accordion components must be used inside <Accordion>.');
    }

    return context;
}

type AccordionProps = {
    type?: AccordionType;
    variant?: AccordionVariant;
    chevron?: AccordionChevron;
    defaultValue?: string | string[];
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    className?: string;
    children: React.ReactNode;
};

function Accordion({
    type = 'single',
    variant = 'default',
    chevron = 'chevron',
    defaultValue,
    value,
    onValueChange,
    className,
    children,
}: AccordionProps) {
    const defaultItems = React.useMemo(() => {
        if (!defaultValue) return [];
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }, [defaultValue]);

    const controlledItems = React.useMemo(() => {
        if (!value) return undefined;
        return Array.isArray(value) ? value : [value];
    }, [value]);

    const [internalOpenItems, setInternalOpenItems] =
        React.useState<string[]>(defaultItems);

    const openItems = controlledItems ?? internalOpenItems;

    const updateItems = React.useCallback(
        (nextItems: string[]) => {
            if (!controlledItems) setInternalOpenItems(nextItems);
            onValueChange?.(type === 'single' ? (nextItems[0] ?? '') : nextItems);
        },
        [controlledItems, onValueChange, type],
    );

    const toggleItem = React.useCallback(
        (itemValue: string) => {
            const isOpen = openItems.includes(itemValue);

            if (type === 'single') {
                updateItems(isOpen ? [] : [itemValue]);
                return;
            }

            updateItems(
                isOpen
                    ? openItems.filter((item) => item !== itemValue)
                    : [...openItems, itemValue],
            );
        },
        [openItems, type, updateItems],
    );

    return (
        <AccordionContext.Provider
            value={{ type, variant, chevron, openItems, toggleItem }}
        >
            <div
                data-variant={variant}
                className={cn(
                    'w-full',
                    variant === 'card' && 'space-y-3',
                    variant === 'elevated' && 'space-y-3',
                    variant === 'enterprise' && 'space-y-3',
                    variant === 'compact' && 'rounded-lg border',
                    variant === 'sidebar' && 'space-y-1',
                    variant === 'timeline' && 'relative space-y-3',
                    variant === 'timeline' &&
                        'before:absolute before:bottom-5 before:left-[18px] before:top-5 before:w-px before:bg-border',
                    variant === 'status' && 'space-y-3',
                    className,
                )}
            >
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

type AccordionItemContextValue = {
    value: string;
    isOpen: boolean;
};

const AccordionItemContext =
    React.createContext<AccordionItemContextValue | null>(null);

function useAccordionItem() {
    const context = React.useContext(AccordionItemContext);

    if (!context) {
        throw new Error('Accordion item components must be used inside <AccordionItem>.');
    }

    return context;
}

type AccordionItemProps = {
    value: string;
    className?: string;
    children: React.ReactNode;
};

function AccordionItem({ value, className, children }: AccordionItemProps) {
    const { variant } = useAccordion();
    const { openItems } = useAccordion();
    const isOpen = openItems.includes(value);

    return (
        <AccordionItemContext.Provider value={{ value, isOpen }}>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                data-variant={variant}
                className={cn(
                    'group/accordion-item transition-all duration-200',

                    variant === 'default' &&
                        'border-b border-border/70 last:border-b-0',

                    variant === 'borderless' &&
                        'rounded-lg border-0 bg-transparent px-1',

                    variant === 'card' &&
                        'overflow-hidden rounded-xl border bg-card shadow-xs data-[state=open]:shadow-sm',

                    variant === 'elevated' &&
                        'overflow-hidden rounded-2xl border bg-card shadow-sm data-[state=open]:shadow-md',

                    variant === 'enterprise' &&
                        'overflow-hidden rounded-xl border bg-card shadow-xs data-[state=open]:border-primary/30 data-[state=open]:ring-1 data-[state=open]:ring-primary/10',

                    variant === 'compact' &&
                        'border-b border-border/70 px-4 last:border-b-0',

                    variant === 'sidebar' &&
                        'rounded-lg border border-transparent data-[state=open]:border-border data-[state=open]:bg-muted/35',

                    variant === 'timeline' &&
                        'relative border-0 pl-11',

                    variant === 'status' &&
                        'overflow-hidden rounded-xl border bg-card shadow-xs',

                    variant === 'ghost' &&
                        'rounded-lg border border-transparent data-[state=open]:bg-muted/30',

                    className,
                )}
            >
                {variant === 'timeline' && (
                    <span className="absolute left-0 top-3 z-10 flex size-9 items-center justify-center rounded-full border bg-background shadow-xs">
                        {isOpen ? (
                            <CheckCircle2 className="size-4 text-primary" />
                        ) : (
                            <Circle className="size-3 text-muted-foreground" />
                        )}
                    </span>
                )}

                {children}
            </div>
        </AccordionItemContext.Provider>
    );
}

type AccordionTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode;
    meta?: React.ReactNode;
    subtitle?: React.ReactNode;
};

function AccordionTrigger({
    className,
    children,
    icon,
    meta,
    subtitle,
    ...props
}: AccordionTriggerProps) {
    const { variant, toggleItem } = useAccordion();
    const { value, isOpen } = useAccordionItem();

    return (
        <button
            type="button"
            data-state={isOpen ? 'open' : 'closed'}
            data-variant={variant}
            onClick={() => toggleItem(value)}
            className={cn(
                'flex w-full items-center justify-between gap-4 text-left text-sm font-medium outline-none transition-all duration-200',
                'focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',

                variant === 'default' && 'py-4 hover:text-foreground',

                variant === 'borderless' &&
                    'rounded-lg px-3 py-3 hover:bg-muted/40',

                variant === 'card' &&
                    'px-4 py-4 hover:bg-muted/30 data-[state=open]:bg-muted/25',

                variant === 'elevated' &&
                    'px-5 py-5 hover:bg-muted/25 data-[state=open]:bg-muted/25',

                variant === 'enterprise' &&
                    'px-4 py-4 hover:bg-muted/30 data-[state=open]:bg-muted/25',

                variant === 'compact' &&
                    'py-3 text-xs font-semibold tracking-[0.12em] uppercase',

                variant === 'sidebar' &&
                    'rounded-lg px-3 py-2.5 text-sm hover:bg-muted/40',

                variant === 'timeline' &&
                    'rounded-xl border bg-background px-4 py-4 shadow-xs hover:bg-muted/25',

                variant === 'status' &&
                    'px-4 py-4 hover:bg-muted/25 data-[state=open]:bg-muted/20',

                variant === 'ghost' &&
                    'rounded-lg px-3 py-3 hover:bg-muted/35',

                className,
            )}
            {...props}
        >
            <span className="flex min-w-0 flex-1 items-center gap-3">
                {icon && (
                    <span
                        className={cn(
                            'flex shrink-0 items-center justify-center text-muted-foreground transition-colors',

                            variant === 'default' &&
                                'size-8 rounded-md border bg-muted/40',

                            variant === 'borderless' &&
                                'size-8 rounded-md bg-muted/40',

                            variant === 'card' &&
                                'size-10 rounded-lg border bg-muted/35',

                            variant === 'elevated' &&
                                'size-11 rounded-xl border bg-background shadow-xs',

                            variant === 'enterprise' &&
                                'size-10 rounded-lg border bg-background shadow-xs group-data-[state=open]/accordion-item:text-primary',

                            variant === 'compact' &&
                                'size-7 rounded-md border bg-muted/30',

                            variant === 'sidebar' &&
                                'size-7 rounded-md bg-muted/40',

                            variant === 'timeline' &&
                                'hidden',

                            variant === 'status' &&
                                'size-10 rounded-lg border bg-background',

                            variant === 'ghost' &&
                                'size-8 rounded-md bg-muted/30',
                        )}
                    >
                        {icon}
                    </span>
                )}

                <span className="min-w-0">
                    <span className="block truncate">{children}</span>
                    {subtitle && (
                        <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                            {subtitle}
                        </span>
                    )}
                </span>
            </span>

            <span className="flex shrink-0 items-center gap-3">
                {meta && (
                    <span className="hidden rounded-md border bg-muted/30 px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase sm:inline-flex">
                        {meta}
                    </span>
                )}

                <AccordionIndicator />
            </span>
        </button>
    );
}

function AccordionIndicator() {
    const { chevron } = useAccordion();
    const { isOpen } = useAccordionItem();

    if (chevron === 'none') return null;

    if (chevron === 'plus') {
        return (
            <span className="flex size-7 items-center justify-center rounded-md border bg-background text-muted-foreground">
                {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
            </span>
        );
    }

    if (chevron === 'arrow') {
        return (
            <ChevronRight
                className={cn(
                    'size-4 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-90',
                )}
            />
        );
    }

    return (
        <ChevronDown
            className={cn(
                'size-4 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180',
            )}
        />
    );
}

type AccordionContentProps = {
    className?: string;
    innerClassName?: string;
    children: React.ReactNode;
};

function AccordionContent({
    className,
    innerClassName,
    children,
}: AccordionContentProps) {
    const { variant } = useAccordion();
    const { isOpen } = useAccordionItem();

    return (
        <div
            data-state={isOpen ? 'open' : 'closed'}
            data-variant={variant}
            className={cn(
                'grid overflow-hidden text-sm text-muted-foreground transition-all duration-300 ease-in-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                className,
            )}
        >
            <div className="min-h-0">
                <div
                    className={cn(
                        'leading-6',

                        variant === 'default' && 'pb-4',

                        variant === 'borderless' && 'px-3 pb-3',

                        variant === 'card' &&
                            'border-t bg-muted/10 px-4 py-4',

                        variant === 'elevated' &&
                            'border-t bg-muted/10 px-5 py-5',

                        variant === 'enterprise' &&
                            'border-t bg-muted/10 px-4 py-4',

                        variant === 'compact' && 'pb-3 text-xs',

                        variant === 'sidebar' && 'px-3 pb-3 text-xs',

                        variant === 'timeline' &&
                            'ml-0 mt-2 rounded-xl border bg-muted/15 px-4 py-4',

                        variant === 'status' &&
                            'border-t bg-muted/10 px-4 py-4',

                        variant === 'ghost' && 'px-3 pb-3',

                        innerClassName,
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
};

export type {
    AccordionChevron,
    AccordionType,
    AccordionVariant,
};