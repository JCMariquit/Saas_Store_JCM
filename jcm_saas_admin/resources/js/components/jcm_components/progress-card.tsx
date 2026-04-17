interface ProgressCardProps {
    label: string;
    value: number;
}

export default function ProgressCard({ label, value }: ProgressCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {value}%
                </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                    className="h-full rounded-full bg-sky-500 dark:bg-sky-400"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}