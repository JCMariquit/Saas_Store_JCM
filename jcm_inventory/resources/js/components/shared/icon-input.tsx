import type {
    ComponentProps,
} from 'react';
import type { LucideIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type IconInputProps = ComponentProps<typeof Input> & {
    icon: LucideIcon;
    iconClassName?: string;
};

export function IconInput({
    icon: Icon,
    className,
    iconClassName,
    ...props
}: IconInputProps) {
    return (
        <div className="group relative">
            <Icon
                className={cn(
                    'pointer-events-none absolute',
                    'left-3 top-1/2 size-4',
                    '-translate-y-1/2',
                    'text-muted-foreground',
                    'transition-colors',
                    'group-focus-within:text-blue-400',
                    iconClassName,
                )}
            />

            <Input
                className={cn(
                    'pl-9',
                    className,
                )}
                {...props}
            />
        </div>
    );
}