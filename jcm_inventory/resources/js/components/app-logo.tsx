import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="group/logo flex min-w-0 items-center gap-3">
            <div
                className={[
                    'relative flex aspect-square size-10 shrink-0 items-center justify-center',
                    'overflow-hidden rounded-xl',
                    'border border-emerald-500/15',
                    'bg-[linear-gradient(145deg,rgba(16,185,129,0.14),rgba(59,130,246,0.07))]',
                    'text-emerald-400',
                    'shadow-[0_0_22px_rgba(16,185,129,0.07)]',
                    'transition-all duration-200',
                    'group-hover/logo:border-emerald-500/25',
                    'group-hover/logo:shadow-[0_0_26px_rgba(16,185,129,0.11)]',
                ].join(' ')}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.10),transparent_42%)]" />

                <AppLogoIcon className="relative size-5.5 fill-current" />

                <span
                    aria-hidden="true"
                    className={[
                        'absolute right-1 top-1 size-2 rounded-full',
                        'border-2 border-sidebar',
                        'bg-emerald-400',
                        'shadow-[0_0_0_2px_rgba(52,211,153,0.10)]',
                    ].join(' ')}
                />
            </div>

            <div className="min-w-0 flex-1 text-left transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">
                        JCM Inventory
                    </span>

                    <span
                        className={[
                            'hidden shrink-0 rounded-full',
                            'border border-emerald-500/15',
                            'bg-emerald-500/[0.07]',
                            'px-1.5 py-0.5',
                            'text-[7px] font-semibold uppercase tracking-[0.12em]',
                            'text-emerald-400',
                            'xl:inline-flex',
                        ].join(' ')}
                    >
                        System
                    </span>
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-400/80" />

                    <span className="truncate text-[9px] font-medium uppercase tracking-[0.11em] text-sidebar-foreground/40">
                        Inventory Operations
                    </span>
                </div>
            </div>
        </div>
    );
}