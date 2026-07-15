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
};

export function FilterBar({
    children,
    actions,
    onSubmit,
    className,
}: FilterBarProps) {
    return (
        <form
            onSubmit={onSubmit}
            className={cn(
                'flex flex-col gap-3 border-b p-4',
                'xl:flex-row xl:items-center',
                className,
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row">
                {children}
            </div>

            {actions && (
                <div className="flex shrink-0 flex-wrap gap-2">
                    {actions}
                </div>
            )}
        </form>
    );
}