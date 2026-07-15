import type {
    HTMLAttributes,
    ReactNode,
} from 'react';

import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: ReactNode;
    icon?: ReactNode;
    description?: ReactNode;
};

export function StatCard({
    title,
    value,
    icon,
    description,
    className,
    ...props
}: StatCardProps) {
    return (
        <Card
            className={cn(
                'shadow-none',
                className,
            )}
            {...props}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                            {title}
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                            {value}
                        </p>

                        {description && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                {description}
                            </div>
                        )}
                    </div>

                    {icon && (
                        <div
                            className={cn(
                                'flex size-11 shrink-0',
                                'items-center justify-center',
                                'rounded-xl bg-primary/10',
                                'text-primary',
                            )}
                        >
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}