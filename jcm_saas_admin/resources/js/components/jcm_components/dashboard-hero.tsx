interface DashboardHeroProps {
    title: string;
    accentTitle: string;
    description: string;
    badge?: string;
    stats: {
        label: string;
        value: string;
    }[];
}

export default function DashboardHero({
    title,
    accentTitle,
    description,
    badge = 'JCM Web Solution',
    stats,
}: DashboardHeroProps) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300 sm:text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                        {badge}
                    </div>

                    <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-slate-100 md:text-3xl">
                        {title}{' '}
                        <span className="text-sky-600 dark:text-sky-400">{accentTitle}</span>
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[360px]">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-800 dark:bg-slate-800/70"
                        >
                            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                                {item.value}
                            </div>
                            <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}