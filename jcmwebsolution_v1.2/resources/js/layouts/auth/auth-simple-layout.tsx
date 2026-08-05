import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[var(--workspace-background,var(--background))] p-5 md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,var(--theme-glow),transparent_28%),radial-gradient(circle_at_86%_84%,var(--theme-soft),transparent_30%)]" />

            <div className="border-border/70 bg-card/80 relative w-full max-w-md overflow-hidden rounded-3xl border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.13)] backdrop-blur-xl md:p-8 dark:shadow-[0_26px_90px_rgba(0,0,0,0.38)]">
                <div className="flex flex-col gap-7">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link href={route('home')} className="group flex flex-col items-center gap-3 font-medium">
                            <div className="border-primary/25 bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl border shadow-[0_0_30px_var(--theme-glow)] transition group-hover:scale-[1.03]">
                                <AppLogoIcon className="size-7 fill-current" />
                            </div>
                            <div>
                                <p className="text-primary text-[9px] font-semibold tracking-[0.16em] uppercase">JCM Websolution</p>
                                <p className="text-foreground mt-1 text-xs font-semibold">Flagship Administration</p>
                            </div>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-foreground text-xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-muted-foreground text-center text-xs leading-5">{description}</p>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
