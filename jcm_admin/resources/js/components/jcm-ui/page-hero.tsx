import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageHeroProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: ReactNode;
};

export function PageHero({
    eyebrow = 'SaaS Admin',
    title,
    description,
    actionLabel,
    onAction,
    actionIcon,
}: PageHeroProps) {
    return (
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-violet-500/30 p-[1px] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" />

                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="absolute right-24 top-10 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_28%)]" />

                <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            {eyebrow}
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
                            {title}
                        </h1>

                        {description && (
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
                                {description}
                            </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                                Clean UI
                            </span>
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                                Reusable Components
                            </span>
                            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">
                                SaaS Ready
                            </span>
                        </div>
                    </div>

                    {actionLabel && onAction && (
                        <div className="flex shrink-0 items-center">
                            <Button
                                type="button"
                                onClick={onAction}
                                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700"
                            >
                                {actionIcon ? (
                                    <span className="mr-2 flex items-center">{actionIcon}</span>
                                ) : null}
                                {actionLabel}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}