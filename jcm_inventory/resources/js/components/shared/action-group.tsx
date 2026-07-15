import type {
    HTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

type ActionGroupProps =
    HTMLAttributes<HTMLDivElement>;

export function ActionGroup({
    className,
    ...props
}: ActionGroupProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-2',
                className,
            )}
            {...props}
        />
    );
}