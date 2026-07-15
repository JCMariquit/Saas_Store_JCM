import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export function PageContainer({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'flex h-full flex-1 flex-col',
                'gap-5 rounded-xl p-4',
                'md:gap-6 md:p-6',
                className,
            )}
            {...props}
        />
    );
}