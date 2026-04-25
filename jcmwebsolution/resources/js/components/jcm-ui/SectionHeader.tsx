type SectionHeaderProps = {
    eyebrow: string;
    title: string;
    description?: string;
};

export default function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
    return (
        <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">
                {eyebrow}
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
                {title}
            </h2>

            {description && (
                <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
                    {description}
                </p>
            )}
        </div>
    );
}