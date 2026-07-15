import type {
    HTMLAttributes,
    ReactNode,
} from 'react';

import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardTone =
    | 'primary'
    | 'blue'
    | 'emerald'
    | 'violet'
    | 'red'
    | 'amber'
    | 'slate';

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: ReactNode;
    icon?: ReactNode;
    description?: ReactNode;
    iconTone?: StatCardTone;
};

const iconToneStyles: Record<
    StatCardTone,
    string
> = {
    primary:
        'border-primary/15 bg-primary/10 text-primary group-hover:bg-primary/15',
    blue:
        'border-blue-500/15 bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/15',
    emerald:
        'border-emerald-500/15 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/15',
    violet:
        'border-violet-500/15 bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/15',
    red:
        'border-red-500/15 bg-red-500/10 text-red-400 group-hover:bg-red-500/15',
    amber:
        'border-amber-500/15 bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/15',
    slate:
        'border-white/10 bg-white/5 text-slate-300 group-hover:bg-white/10',
};

const barToneStyles: Record<
    StatCardTone,
    string
> = {
    primary: 'bg-primary/60',
    blue: 'bg-blue-400/70',
    emerald: 'bg-emerald-400/70',
    violet: 'bg-violet-400/70',
    red: 'bg-red-400/70',
    amber: 'bg-amber-400/70',
    slate: 'bg-slate-300/60',
};

export function StatCard({
    title,
    value,
    icon,
    description,
    iconTone = 'primary',
    className,
    ...props
}: StatCardProps) {
    return (
        <Card
            className={cn(
                'group relative overflow-hidden',
                'border-border/60 bg-card/70',
                'shadow-[0_1px_0_rgba(255,255,255,0.025)]',
                'transition-all duration-200',
                'hover:-translate-y-0.5',
                'hover:border-primary/20',
                'hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]',
                className,
            )}
            {...props}
        >
            <div className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />

            <CardContent className="relative p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {title}
                        </p>

                        <p className="mt-2.5 text-[34px] font-semibold leading-none tracking-[-0.05em] text-foreground">
                            {value}
                        </p>

                        {description && (
                            <div className="mt-2 text-[11px] text-muted-foreground">
                                {description}
                            </div>
                        )}
                    </div>

                    {icon && (
                        <div
                            className={cn(
                                'flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-inner transition-all duration-200 group-hover:scale-105 [&_svg]:size-4.5',
                                iconToneStyles[
                                    iconTone
                                ],
                            )}
                        >
                            {icon}
                        </div>
                    )}
                </div>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn(
                            'h-full w-7 rounded-full transition-all duration-300 group-hover:w-12',
                            barToneStyles[
                                iconTone
                            ],
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}