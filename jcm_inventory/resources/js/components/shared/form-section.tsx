import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type FormSectionProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
};

export function FormSection({
    title,
    description,
    icon,
    actions,
    children,
    className,
    contentClassName,
}: FormSectionProps) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-xl',
                'border border-border/60 bg-card/40',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3 border-b border-border/50 bg-muted/[0.025] px-4 py-3.5">
                <div className="flex min-w-0 items-start gap-3">
                    {icon && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
                            {icon}
                        </div>
                    )}

                    <div className="min-w-0">
                        <h3 className="text-[13px] font-semibold">
                            {title}
                        </h3>

                        {description && (
                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="shrink-0">
                        {actions}
                    </div>
                )}
            </div>

            <div
                className={cn(
                    'space-y-4 p-4',
                    contentClassName,
                )}
            >
                {children}
            </div>
        </section>
    );
}