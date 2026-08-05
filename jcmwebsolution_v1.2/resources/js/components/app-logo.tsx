import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="group/logo flex min-w-0 items-center gap-3">
            <div className="relative flex aspect-square size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_var(--theme-glow)] transition group-hover/logo:bg-primary/15">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.14),transparent_42%)]" />
                <AppLogoIcon className="relative size-5.5 fill-current" />
                <span className="absolute right-1 top-1 size-2 rounded-full border-2 border-sidebar bg-emerald-400" />
            </div>

            <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]/sidebar:hidden">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">
                        JCM Websolution
                    </span>
                    <span className="hidden shrink-0 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-primary xl:inline-flex">
                        Flagship
                    </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-400/90" />
                    <span className="truncate text-[9px] font-medium uppercase tracking-[0.11em] text-sidebar-foreground/45">
                        Central Control Platform
                    </span>
                </div>
            </div>
        </div>
    );
}
