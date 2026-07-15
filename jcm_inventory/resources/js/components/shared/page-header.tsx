import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    description?: string;
    eyebrow?: string;
    actions?: ReactNode;
    className?: string;
};

export function PageHeader({
    title,
    description,
    eyebrow,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <section
            className={cn(
                'flex flex-col gap-4',
                'md:flex-row md:items-center',
                'md:justify-between',
                className,
            )}
        >
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-sm font-medium text-primary">
                        {eyebrow}
                    </p>
                )}

                <h1
                    className={cn(
                        'text-2xl font-semibold',
                        'tracking-tight',
                        eyebrow && 'mt-1',
                    )}
                >
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </section>
    );
}