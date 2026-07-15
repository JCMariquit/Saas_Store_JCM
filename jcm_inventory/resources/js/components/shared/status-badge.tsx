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

const variantStyles: Record<
    StatusVariant,
    string
> = {
    success:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    danger:
        'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
    warning:
        'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    info:
        'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    pending:
        'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    neutral:
        'border-border bg-muted text-muted-foreground',
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
                'gap-1.5 whitespace-nowrap font-medium',
                variantStyles[variant],
                className,
            )}
        >
            {showIcon && (
                <Icon className="size-3.5" />
            )}

            {label}
        </Badge>
    );
}