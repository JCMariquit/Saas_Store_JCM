import type {
    LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center',
                'justify-center px-6 py-14',
                'text-center',
                className,
            )}
        >
            <div
                className={cn(
                    'flex size-14 items-center',
                    'justify-center rounded-2xl',
                    'bg-muted text-muted-foreground',
                )}
            >
                <Icon className="size-7" />
            </div>

            <h3 className="mt-4 font-semibold">
                {title}
            </h3>

            {description && (
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
}