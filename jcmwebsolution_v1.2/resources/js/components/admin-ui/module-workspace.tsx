import { Button } from '@/components/ui/button';
import { X, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type HeaderProps = {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
};

export function ModulePageHeader({
    eyebrow,
    title,
    description,
    actions,
}: HeaderProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
                <p className="text-primary text-[10px] font-semibold tracking-[0.16em] uppercase">
                    {eyebrow}
                </p>
                <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight">
                    {title}
                </h1>
                <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
                    {description}
                </p>
            </div>

            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

type MetricProps = {
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
};

export function ModuleMetric({
    label,
    value,
    hint,
    icon: Icon,
}: MetricProps) {
    return (
        <div className="border-border/70 bg-card rounded-2xl border p-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
                        {label}
                    </p>
                    <p className="text-foreground mt-2 text-2xl font-bold tabular-nums">
                        {value}
                    </p>
                    {hint && (
                        <p className="text-muted-foreground mt-1 text-[11px]">
                            {hint}
                        </p>
                    )}
                </div>

                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-4.5" />
                </span>
            </div>
        </div>
    );
}

export function ModuleStatus({
    value,
}: {
    value?: string | null;
}) {
    const normalized = (value ?? 'unknown').toLowerCase();
    const positive = [
        'active',
        'enabled',
        'paid',
        'approved',
        'refunded',
        'resolved',
        'closed',
        'healthy',
        'issued',
    ].includes(normalized);
    const warning = [
        'pending',
        'requested',
        'processing',
        'open',
        'in_progress',
        'degraded',
        'draft',
        'overdue',
    ].includes(normalized);

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase ${
                positive
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'
                    : warning
                      ? 'border-amber-500/25 bg-amber-500/10 text-amber-500'
                      : 'border-rose-500/25 bg-rose-500/10 text-rose-500'
            }`}
        >
            {normalized.replaceAll('_', ' ')}
        </span>
    );
}

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    widthClassName?: string;
};

export function ModuleDrawer({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    widthClassName = 'max-w-xl',
}: DrawerProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[90] flex justify-end bg-black/80">
            <button
                type="button"
                aria-label="Close drawer"
                onClick={onClose}
                className="absolute inset-0 cursor-default"
            />

            <section
                className={`border-border bg-background relative flex h-full w-full flex-col border-l shadow-2xl ${widthClassName}`}
            >
                <header className="border-border bg-[var(--header-background,var(--card))] relative shrink-0 border-b px-5 py-4">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,var(--theme-soft),transparent_34%)]" />
                    <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-foreground text-base font-semibold">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-muted-foreground mt-1 text-xs leading-5">
                                    {description}
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            aria-label="Close"
                            className="size-8 shrink-0 rounded-lg"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                    {children}
                </div>

                {footer && (
                    <footer className="border-border bg-card shrink-0 border-t px-5 py-4">
                        {footer}
                    </footer>
                )}
            </section>
        </div>
    );
}

export function ModuleEmpty({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <Icon className="text-muted-foreground size-8" />
            <h3 className="text-foreground mt-4 text-sm font-semibold">
                {title}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-5">
                {description}
            </p>
        </div>
    );
}

export const inputClassName =
    'border-border/70 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/10 h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-4';

export const textareaClassName =
    'border-border/70 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/10 w-full resize-none rounded-xl border px-3 py-3 text-sm leading-6 outline-none transition focus:ring-4';

export const selectClassName =
    'border-border/70 bg-background text-foreground focus:border-primary/40 focus:ring-primary/10 h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-4';

export function FieldLabel({ children }: { children: ReactNode }) {
    return (
        <label className="text-foreground mb-1.5 block text-xs font-semibold">
            {children}
        </label>
    );
}
