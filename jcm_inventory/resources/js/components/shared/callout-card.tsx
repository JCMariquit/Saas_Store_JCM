import type {
    LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CalloutTone =
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral';

type CalloutCardProps = {
    icon: LucideIcon;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    tone?: CalloutTone;
    className?: string;
};

const toneStyles: Record<
    CalloutTone,
    {
        container: string;
        icon: string;
    }
> = {
    info: {
        container:
            'border-blue-500/20 bg-blue-500/[0.05]',
        icon:
            'bg-blue-500/10 text-blue-400',
    },
    success: {
        container:
            'border-emerald-500/20 bg-emerald-500/[0.05]',
        icon:
            'bg-emerald-500/10 text-emerald-400',
    },
    warning: {
        container:
            'border-amber-500/20 bg-amber-500/[0.05]',
        icon:
            'bg-amber-500/10 text-amber-400',
    },
    danger: {
        container:
            'border-red-500/20 bg-red-500/[0.05]',
        icon: 'bg-red-500/10 text-red-400',
    },
    neutral: {
        container:
            'border-border/60 bg-muted/[0.03]',
        icon:
            'bg-muted text-muted-foreground',
    },
};

export function CalloutCard({
    icon: Icon,
    title,
    description,
    actions,
    tone = 'neutral',
    className,
}: CalloutCardProps) {
    const styles = toneStyles[tone];

    return (
        <section
            className={cn(
                'rounded-xl border p-4',
                styles.container,
                className,
            )}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div
                        className={cn(
                            'flex size-9 shrink-0',
                            'items-center justify-center',
                            'rounded-lg',
                            styles.icon,
                        )}
                    >
                        <Icon className="size-4.5" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold">
                            {title}
                        </p>

                        {description && (
                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </section>
    );
}