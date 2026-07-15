import type {
    HTMLAttributes,
    ReactNode,
} from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SectionCardProps =
    HTMLAttributes<HTMLDivElement> & {
        title?: ReactNode;
        description?: ReactNode;
        actions?: ReactNode;
        contentClassName?: string;
        headerClassName?: string;
    };

export function SectionCard({
    title,
    description,
    actions,
    children,
    className,
    contentClassName,
    headerClassName,
    ...props
}: SectionCardProps) {
    const hasHeader =
        Boolean(title) ||
        Boolean(description) ||
        Boolean(actions);

    return (
        <Card
            className={cn(
                'overflow-hidden shadow-none',
                className,
            )}
            {...props}
        >
            {hasHeader && (
                <CardHeader
                    className={cn(
                        'flex-row items-start justify-between',
                        'gap-4 space-y-0 border-b p-5',
                        headerClassName,
                    )}
                >
                    <div className="min-w-0 space-y-1">
                        {title && (
                            <CardTitle className="text-base">
                                {title}
                            </CardTitle>
                        )}

                        {description && (
                            <CardDescription>
                                {description}
                            </CardDescription>
                        )}
                    </div>

                    {actions && (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {actions}
                        </div>
                    )}
                </CardHeader>
            )}

            <CardContent
                className={cn(
                    'p-0',
                    contentClassName,
                )}
            >
                {children}
            </CardContent>
        </Card>
    );
}