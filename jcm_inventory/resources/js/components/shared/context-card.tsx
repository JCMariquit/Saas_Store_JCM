import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ContextMetric = {
    label: ReactNode;
    value: ReactNode;
};

type ContextCardProps = {
    icon?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    metrics?: ContextMetric[];
    className?: string;
};

export function ContextCard({
    icon,
    title,
    subtitle,
    metrics = [],
    className,
}: ContextCardProps) {
    return (
        <section
            className={cn(
                'rounded-xl border border-border/60',
                'bg-muted/[0.025] p-4',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10 text-blue-400 [&_svg]:size-5">
                        {icon}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                        {title}
                    </p>

                    {subtitle && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {metrics.length > 0 && (
                <div
                    className={cn(
                        'mt-4 grid gap-2',
                        metrics.length > 1 &&
                            'grid-cols-2',
                    )}
                >
                    {metrics.map(
                        (metric, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-border/50 bg-background/60 px-3 py-2.5"
                            >
                                <p className="text-[10px] text-muted-foreground">
                                    {metric.label}
                                </p>

                                <div className="mt-1 text-[12px] font-semibold">
                                    {metric.value}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </section>
    );
}