import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type StatsGridProps = HTMLAttributes<HTMLElement>;

export function StatsGrid({
    className,
    ...props
}: StatsGridProps) {
    return (
        <section
            className={cn(
                'grid gap-3',
                'sm:grid-cols-2',
                'xl:grid-cols-4',
                className,
            )}
            {...props}
        />
    );
}