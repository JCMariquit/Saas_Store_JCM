import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type HighlightStatTone =
    | 'primary'
    | 'blue'
    | 'emerald'
    | 'violet'
    | 'amber'
    | 'red';

type HighlightStatCardProps = {
    title: string;
    value: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    badge?: ReactNode;
    tone?: HighlightStatTone;
    className?: string;
};

const toneStyles: Record<
    HighlightStatTone,
    {
        container: string;
        icon: string;
        line: string;
        glow: string;
    }
> = {
    primary: {
        container:
            'border-primary/20 from-primary/20 via-primary/5 to-card',
        icon:
            'border-primary/20 bg-primary/15 text-primary',
        line: 'bg-primary',
        glow: 'bg-primary/15',
    },
    blue: {
        container:
            'border-blue-500/20 from-blue-500/20 via-blue-500/5 to-card',
        icon:
            'border-blue-500/20 bg-blue-500/15 text-blue-400',
        line: 'bg-blue-400',
        glow: 'bg-blue-500/15',
    },
    emerald: {
        container:
            'border-emerald-500/20 from-emerald-500/20 via-emerald-500/5 to-card',
        icon:
            'border-emerald-500/20 bg-emerald-500/15 text-emerald-400',
        line: 'bg-emerald-400',
        glow: 'bg-emerald-500/15',
    },
    violet: {
        container:
            'border-violet-500/20 from-violet-500/20 via-violet-500/5 to-card',
        icon:
            'border-violet-500/20 bg-violet-500/15 text-violet-400',
        line: 'bg-violet-400',
        glow: 'bg-violet-500/15',
    },
    amber: {
        container:
            'border-amber-500/20 from-amber-500/20 via-amber-500/5 to-card',
        icon:
            'border-amber-500/20 bg-amber-500/15 text-amber-400',
        line: 'bg-amber-400',
        glow: 'bg-amber-500/15',
    },
    red: {
        container:
            'border-red-500/20 from-red-500/20 via-red-500/5 to-card',
        icon:
            'border-red-500/20 bg-red-500/15 text-red-400',
        line: 'bg-red-400',
        glow: 'bg-red-500/15',
    },
};

export function HighlightStatCard({
    title,
    value,
    description,
    icon,
    badge,
    tone = 'primary',
    className,
}: HighlightStatCardProps) {
    const styles = toneStyles[tone];

    return (
        <section
            className={cn(
                'group relative overflow-hidden',
                'rounded-2xl border bg-gradient-to-br',
                'p-5',
                styles.container,
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute',
                    '-right-14 -top-16 size-48',
                    'rounded-full blur-3xl',
                    styles.glow,
                )}
            />

            <div className="relative">
                <div className="flex items-start justify-between gap-4">
                    {icon && (
                        <div
                            className={cn(
                                'flex size-10 items-center',
                                'justify-center rounded-xl border',
                                '[&_svg]:size-5',
                                styles.icon,
                            )}
                        >
                            {icon}
                        </div>
                    )}

                    {badge && (
                        <div className="shrink-0">
                            {badge}
                        </div>
                    )}
                </div>

                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {title}
                </p>

                <p className="mt-2 text-[30px] font-semibold tracking-[-0.04em]">
                    {value}
                </p>

                {description && (
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                        {description}
                    </p>
                )}

                <div className="mt-5 h-1 overflow-hidden rounded-full bg-background/30">
                    <div
                        className={cn(
                            'h-full w-14 rounded-full',
                            styles.line,
                        )}
                    />
                </div>
            </div>
        </section>
    );
}