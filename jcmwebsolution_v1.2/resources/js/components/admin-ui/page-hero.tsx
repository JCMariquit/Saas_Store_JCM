import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { type ReactNode } from 'react';

type PageHeroProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: ReactNode;
};

export function PageHero({ eyebrow = 'JCM Flagship', title, description, actionLabel, onAction, actionIcon }: PageHeroProps) {
    return (
        <section className="group border-primary/20 from-primary/[0.08] via-card/90 to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-[0_14px_40px_var(--theme-glow)]">
            <div className="bg-primary absolute inset-y-0 left-0 w-1.5" />
            <div className="bg-primary/15 pointer-events-none absolute -top-20 -right-16 size-56 rounded-full blur-3xl" />
            <div className="bg-primary/10 pointer-events-none absolute bottom-[-80px] left-[18%] size-44 rounded-full blur-3xl" />

            <div className="relative flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                <div className="max-w-3xl">
                    <div className="border-primary/20 bg-primary/[0.07] text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-semibold tracking-[0.15em] uppercase">
                        <Sparkles className="size-3.5" />
                        {eyebrow}
                    </div>
                    <h1 className="text-foreground mt-3 text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
                    {description && <p className="text-muted-foreground mt-2 max-w-2xl text-xs leading-6 md:text-sm">{description}</p>}
                </div>

                {actionLabel && onAction && (
                    <Button type="button" onClick={onAction} className="h-10 shrink-0 rounded-xl px-4 text-xs shadow-[0_10px_24px_var(--theme-glow)]">
                        {actionIcon}
                        {actionLabel}
                    </Button>
                )}
            </div>
        </section>
    );
}
