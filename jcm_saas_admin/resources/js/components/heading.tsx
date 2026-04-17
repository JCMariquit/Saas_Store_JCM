interface HeadingProps {
    title: string;
    description?: string;
    badge?: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
}

export default function Heading({
    title,
    description,
    badge,
    className = '',
    titleClassName = '',
    descriptionClassName = '',
}: HeadingProps) {
    return (
        <div className={`mb-8 space-y-2 ${className}`}>
            {badge && (
                <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
                    {badge}
                </div>
            )}

            <div className="space-y-1">
                <h2
                    className={`text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 ${titleClassName}`}
                >
                    {title}
                </h2>

                {description && (
                    <p
                        className={`max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 ${descriptionClassName}`}
                    >
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}