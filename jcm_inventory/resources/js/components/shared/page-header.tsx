import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeaderVariant = 'default' | 'accent';

type PageHeaderProps = {
    title: string;
    description?: string;
    eyebrow?: string;
    eyebrowIcon?: ReactNode;
    actions?: ReactNode;
    variant?: PageHeaderVariant;
    className?: string;
};

const variantStyles: Record<PageHeaderVariant, string> = {
    default: 'bg-card/60',
    accent:
        'bg-gradient-to-br from-primary/10 via-card/70 to-card/50',
};

export function PageHeader({
    title,
    description,
    eyebrow,
    eyebrowIcon,
    actions,
    variant = 'default',
    className,
}: PageHeaderProps) {
    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-2xl',
                'border border-border/60 px-4 py-4',
                'shadow-[0_1px_0_rgba(255,255,255,0.03)]',
                'md:px-5 md:py-5',
                variantStyles[variant],
                className,
            )}
        >
            <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    {eyebrow && (
                        <div className="mb-2 flex items-center gap-2">
                            <span className="h-px w-4 bg-primary/70" />

                            {eyebrowIcon && (
                                <span className="text-primary [&_svg]:size-3.5">
                                    {eyebrowIcon}
                                </span>
                            )}

                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                                {eyebrow}
                            </p>
                        </div>
                    )}

                    <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground md:text-[30px]">
                        {title}
                    </h1>

                    {description && (
                        <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </section>
    );
}