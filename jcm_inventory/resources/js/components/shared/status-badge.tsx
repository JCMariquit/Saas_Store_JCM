import {
    CheckCircle2,
    CircleAlert,
    CircleDashed,
    Clock3,
    Info,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusVariant =
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'pending'
    | 'neutral';

type StatusBadgeProps = {
    label: string;
    variant?: StatusVariant;
    icon?: LucideIcon;
    showIcon?: boolean;
    className?: string;
};

const badgeStyles: Record<
    StatusVariant,
    string
> = {
    success:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    danger:
        'border-red-500/20 bg-red-500/10 text-red-400',
    warning:
        'border-amber-500/20 bg-amber-500/10 text-amber-400',
    info:
        'border-blue-500/20 bg-blue-500/10 text-blue-400',
    pending:
        'border-violet-500/20 bg-violet-500/10 text-violet-400',
    neutral:
        'border-border/70 bg-muted/60 text-muted-foreground',
};

const iconWrapStyles: Record<
    StatusVariant,
    string
> = {
    success:
        'bg-emerald-500/15 text-emerald-400',
    danger: 'bg-red-500/15 text-red-400',
    warning:
        'bg-amber-500/15 text-amber-400',
    info: 'bg-blue-500/15 text-blue-400',
    pending:
        'bg-violet-500/15 text-violet-400',
    neutral:
        'bg-muted text-muted-foreground',
};

const defaultIcons: Record<
    StatusVariant,
    LucideIcon
> = {
    success: CheckCircle2,
    danger: XCircle,
    warning: CircleAlert,
    info: Info,
    pending: Clock3,
    neutral: CircleDashed,
};

export function StatusBadge({
    label,
    variant = 'neutral',
    icon,
    showIcon = true,
    className,
}: StatusBadgeProps) {
    const Icon = icon ?? defaultIcons[variant];

    return (
        <Badge
            variant="outline"
            className={cn(
                'h-6 gap-1.5 rounded-full px-2 py-0.5',
                'whitespace-nowrap border font-medium',
                'text-[10px] shadow-none',
                badgeStyles[variant],
                className,
            )}
        >
            {showIcon && (
                <span
                    className={cn(
                        'inline-flex size-4 items-center justify-center rounded-full',
                        iconWrapStyles[variant],
                    )}
                >
                    <Icon className="size-2.5" />
                </span>
            )}

            <span>{label}</span>
        </Badge>
    );
}