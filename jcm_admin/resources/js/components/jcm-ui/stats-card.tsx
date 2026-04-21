import { ReactNode } from 'react';

type StatsCardProps = {
    title: string;
    value: number | string;
    description?: string;
    icon: ReactNode;
    tone?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
};

const toneClasses = {
    blue: {
        card: 'border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/30',
        icon: 'bg-blue-600 text-white shadow-blue-600/30',
        border: 'border-l-4 border-blue-500',
        glow: 'group-hover:shadow-blue-500/20',
    },
    indigo: {
        card: 'border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-indigo-100/30',
        icon: 'bg-indigo-600 text-white shadow-indigo-600/30',
        border: 'border-l-4 border-indigo-500',
        glow: 'group-hover:shadow-indigo-500/20',
    },
    emerald: {
        card: 'border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30',
        icon: 'bg-emerald-600 text-white shadow-emerald-600/30',
        border: 'border-l-4 border-emerald-500',
        glow: 'group-hover:shadow-emerald-500/20',
    },
    amber: {
        card: 'border-amber-100 bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30',
        icon: 'bg-amber-600 text-white shadow-amber-600/30',
        border: 'border-l-4 border-amber-500',
        glow: 'group-hover:shadow-amber-500/20',
    },
    rose: {
        card: 'border-rose-100 bg-gradient-to-br from-white via-rose-50/40 to-rose-100/30',
        icon: 'bg-rose-600 text-white shadow-rose-600/30',
        border: 'border-l-4 border-rose-500',
        glow: 'group-hover:shadow-rose-500/20',
    },
};

export function StatsCard({
    title,
    value,
    description,
    icon,
    tone = 'blue',
}: StatsCardProps) {
    const styles = toneClasses[tone];

    return (
        <div
            className={`
                group relative overflow-hidden rounded-2xl border p-4
                shadow-sm transition-all duration-300
                hover:-translate-y-1 hover:shadow-lg
                ${styles.card} ${styles.border} ${styles.glow}
            `}
        >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/30 blur-2xl opacity-0 transition group-hover:opacity-100" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 tracking-wide">
                        {title}
                    </p>

                    <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={`
                        rounded-xl p-2.5 shadow-md transition-transform duration-300
                        group-hover:scale-105
                        ${styles.icon}
                    `}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}