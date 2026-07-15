import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type EntityInfoProps = {
    title: ReactNode;
    subtitle?: ReactNode;
    description?: ReactNode;
    avatar?: ReactNode;
    badges?: ReactNode;
    trailing?: ReactNode;
    className?: string;
};

export function EntityInfo({
    title,
    subtitle,
    description,
    avatar,
    badges,
    trailing,
    className,
}: EntityInfoProps) {
    return (
        <div
            className={cn(
                'flex min-w-0 items-start gap-3',
                className,
            )}
        >
            {avatar}

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-0 truncate font-semibold tracking-[-0.01em] text-foreground">
                        {title}
                    </div>

                    {badges}
                </div>

                {subtitle && (
                    <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                        {subtitle}
                    </div>
                )}

                {description && (
                    <div className="mt-1.5 max-w-md truncate text-xs leading-5 text-muted-foreground/80">
                        {description}
                    </div>
                )}
            </div>

            {trailing && (
                <div className="shrink-0">
                    {trailing}
                </div>
            )}
        </div>
    );
}