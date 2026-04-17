interface QuickLinkCardProps {
    title: string;
    description: string;
}

export default function QuickLinkCard({ title, description }: QuickLinkCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {title}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {description}
            </div>
        </div>
    );
}