type SectionTitleProps = {
    badge: string;
    title: string;
    subtitle: string;
};

export default function SectionTitle({
    badge,
    title,
    subtitle,
}: SectionTitleProps) {
    return (
        <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                {badge}
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
                {title}
            </h2>

            <p className="mt-3 text-base leading-8 text-slate-500">{subtitle}</p>
        </div>
    );
}