import { router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationData = {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

type AppPaginationProps = {
    pagination: PaginationData;
    itemLabel?: string;
    className?: string;
};

export function AppPagination({
    pagination,
    itemLabel = 'items',
    className,
}: AppPaginationProps) {
    if (pagination.last_page <= 1) {
        return (
            <div
                className={cn(
                    'flex items-center justify-between',
                    'border-t border-border/60',
                    'bg-muted/[0.015] px-4 py-3',
                    className,
                )}
            >
                <p className="text-xs text-muted-foreground">
                    {pagination.total}{' '}
                    {pagination.total === 1
                        ? itemLabel.replace(/s$/, '')
                        : itemLabel}{' '}
                    displayed
                </p>
            </div>
        );
    }

    function visitPage(url: string | null): void {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col gap-3',
                'border-t border-border/60',
                'bg-muted/[0.015] px-4 py-3',
                'sm:flex-row sm:items-center',
                'sm:justify-between',
                className,
            )}
        >
            <p className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {pagination.from ?? 0}
                </span>{' '}
                to{' '}
                <span className="font-medium text-foreground">
                    {pagination.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {pagination.total}
                </span>{' '}
                {itemLabel}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {pagination.links.map(
                    (link, index) => {
                        const isPrevious =
                            link.label.includes(
                                'Previous',
                            );

                        const isNext =
                            link.label.includes(
                                'Next',
                            );

                        return (
                            <Button
                                key={`${link.label}-${index}`}
                                type="button"
                                variant={
                                    link.active
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                disabled={!link.url}
                                onClick={() =>
                                    visitPage(
                                        link.url,
                                    )
                                }
                                className={cn(
                                    'min-w-8 rounded-md px-2.5',
                                    'text-xs',
                                    !link.url &&
                                        'cursor-not-allowed opacity-35',
                                )}
                            >
                                {isPrevious ? (
                                    <ChevronLeft className="size-4" />
                                ) : isNext ? (
                                    <ChevronRight className="size-4" />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        );
                    },
                )}
            </div>
        </div>
    );
}