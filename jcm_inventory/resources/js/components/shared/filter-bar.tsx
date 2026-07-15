import type {
    FormEventHandler,
    ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type FilterBarProps = {
    children: ReactNode;
    actions?: ReactNode;
    onSubmit?: FormEventHandler<HTMLFormElement>;
    className?: string;
    contentClassName?: string;
    actionsClassName?: string;
};

export function FilterBar({
    children,
    actions,
    onSubmit,
    className,
    contentClassName,
    actionsClassName,
}: FilterBarProps) {
    return (
        <form
            onSubmit={onSubmit}
            className={cn(
                'grid min-w-0 max-w-full gap-3',
                'border-b border-border/60',
                'bg-muted/[0.025] p-3',
                '2xl:grid-cols-[minmax(0,1fr)_auto]',
                '2xl:items-center',
                className,
            )}
        >
            <div
                className={cn(
                    'flex min-w-0 max-w-full',
                    'flex-1 flex-col gap-2.5',
                    'md:flex-row md:flex-wrap',
                    'md:items-center',
                    '[&>*]:min-w-0',
                    contentClassName,
                )}
            >
                {children}
            </div>

            {actions && (
                <div
                    className={cn(
                        'flex min-w-0 flex-wrap',
                        'items-center gap-2',
                        '2xl:border-l',
                        '2xl:border-border/60',
                        '2xl:pl-3',
                        actionsClassName,
                    )}
                >
                    {actions}
                </div>
            )}
        </form>
    );
}