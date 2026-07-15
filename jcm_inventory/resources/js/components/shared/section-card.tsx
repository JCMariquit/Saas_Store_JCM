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
                'min-w-0 max-w-full overflow-hidden',
                'border-border/60 bg-card/60',
                'shadow-[0_1px_0_rgba(255,255,255,0.025)]',
                className,
            )}
            {...props}
        >
            {hasHeader && (
                <CardHeader
                    className={cn(
                        'flex-row items-start justify-between',
                        'gap-4 space-y-0',
                        'border-b border-border/60',
                        'bg-muted/10 px-4 py-3.5',
                        headerClassName,
                    )}
                >
                    <div className="min-w-0 space-y-1">
                        {title && (
                            <CardTitle className="text-[15px] font-semibold tracking-tight">
                                {title}
                            </CardTitle>
                        )}

                        {description && (
                            <CardDescription className="text-xs leading-5">
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
                    'min-h-[150px] min-w-0 max-w-full p-0',
                    contentClassName,
                )}
            >
                {children}
            </CardContent>
        </Card>
    );
}