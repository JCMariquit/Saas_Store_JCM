import { type ReactNode } from 'react';

type SectionCardProps = {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function SectionCard({ title, description, actions, children }: SectionCardProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:shadow-[0_14px_34px_rgba(0,0,0,0.20)]">
            {(title || description || actions) && (
                <div className="border-b border-border/60 bg-gradient-to-r from-primary/[0.045] via-card to-card px-5 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            {title && <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>}
                            {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
                        </div>
                        {actions && <div>{actions}</div>}
                    </div>
                </div>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}
