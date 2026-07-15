import { router } from '@inertiajs/react';

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
        return null;
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
                'flex flex-col gap-3 border-t',
                'px-4 py-4',
                'sm:flex-row sm:items-center',
                'sm:justify-between',
                className,
            )}
        >
            <p className="text-sm text-muted-foreground">
                Showing {pagination.from ?? 0} to{' '}
                {pagination.to ?? 0} of{' '}
                {pagination.total} {itemLabel}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {pagination.links.map(
                    (link, index) => (
                        <Button
                            key={`${link.label}-${index}`}
                            type="button"
                            variant={
                                link.active
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            disabled={!link.url}
                            onClick={() =>
                                visitPage(link.url)
                            }
                            className={cn(
                                'min-w-9 px-3',
                                !link.url &&
                                    'cursor-not-allowed',
                            )}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}