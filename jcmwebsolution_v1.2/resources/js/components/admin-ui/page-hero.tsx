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
    eyebrow = 'JCM Admin',
    title,
    description,
    actionLabel,
    onAction,
    actionIcon,
}: PageHeroProps) {
    return (
        <div className="group relative overflow-hidden rounded-[6px] border border-blue-300/80 bg-gradient-to-br from-white via-blue-50 to-blue-100/80 shadow-[0_12px_34px_rgba(37,99,235,0.12)] transition-all duration-300 hover:shadow-[0_16px_42px_rgba(37,99,235,0.16)]">
            {/* heavy left accent */}
            <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-blue-700 via-blue-500 to-cyan-400" />

            {/* outer soft glow */}
            <div className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-inset ring-blue-400/40" />

            {/* top glow */}
            <div className="pointer-events-none absolute -top-24 right-[-30px] h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-90px] left-[90px] h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute top-10 left-1/3 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl" />

            {/* subtle mesh overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_24%)]" />

            {/* wave layers */}
            <div className="pointer-events-none absolute bottom-0 left-0 w-full opacity-80">
                <svg viewBox="0 0 1440 320" className="h-[110px] w-full" preserveAspectRatio="none">
                    <path
                        fill="rgba(59,130,246,0.14)"
                        d="M0,192L60,186.7C120,181,240,171,360,154.7C480,139,600,117,720,122.7C840,128,960,160,1080,170.7C1200,181,1320,171,1380,165.3L1440,160L1440,320L0,320Z"
                    />
                </svg>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 w-full opacity-70">
                <svg viewBox="0 0 1440 320" className="h-[95px] w-full" preserveAspectRatio="none">
                    <path
                        fill="rgba(96,165,250,0.18)"
                        d="M0,224L80,208C160,192,320,160,480,154.7C640,149,800,171,960,176C1120,181,1280,171,1360,165.3L1440,160L1440,320L0,320Z"
                    />
                </svg>
            </div>

            <div className="relative flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
                <div className="max-w-2xl">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-300/70 bg-white/75 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        {eyebrow}
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                        {title}
                    </h1>

                    {description && (
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 md:text-[15px]">
                            {description}
                        </p>
                    )}
                </div>

                {actionLabel && onAction && (
                    <div className="flex shrink-0 items-center">
                        <Button
                            type="button"
                            onClick={onAction}
                            className="h-10 rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-5 text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 hover:shadow-[0_14px_26px_rgba(37,99,235,0.32)]"
                        >
                            {actionIcon ? (
                                <span className="mr-2 flex items-center">
                                    {actionIcon}
                                </span>
                            ) : null}
                            {actionLabel}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}