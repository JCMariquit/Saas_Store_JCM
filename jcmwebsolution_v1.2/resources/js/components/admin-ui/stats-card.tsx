import { type ReactNode } from 'react';

type StatsCardProps = {
    title: string;
    value: number | string;
    description?: string;
    icon: ReactNode;
    tone?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
};

const toneClasses = {
    blue: 'border-primary/20 bg-primary/10 text-primary',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-500',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-500',
};

export function StatsCard({ title, value, description, icon, tone = 'blue' }: StatsCardProps) {
    return (
        <div className="group border-border/70 bg-card/75 hover:border-primary/20 relative overflow-hidden rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_var(--theme-glow)]">
            <div className="bg-primary/[0.055] pointer-events-none absolute top-[-28px] right-[-24px] size-24 rounded-full blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">{title}</p>
                    <p className="text-foreground mt-2 text-2xl font-bold tracking-tight">{value}</p>
                    {description && <p className="text-muted-foreground mt-1 text-[9px] leading-4">{description}</p>}
                </div>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${toneClasses[tone]}`}>{icon}</span>
            </div>
        </div>
    );
}
