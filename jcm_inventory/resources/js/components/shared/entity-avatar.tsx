import type {
    LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type EntityAvatarProps = {
    icon: LucideIcon;
    size?: 'sm' | 'default' | 'lg';
    className?: string;
    iconClassName?: string;
};

const sizes = {
    sm: {
        container: 'size-8 rounded-md',
        icon: 'size-4',
    },
    default: {
        container: 'size-10 rounded-lg',
        icon: 'size-5',
    },
    lg: {
        container: 'size-12 rounded-xl',
        icon: 'size-6',
    },
};

export function EntityAvatar({
    icon: Icon,
    size = 'default',
    className,
    iconClassName,
}: EntityAvatarProps) {
    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center',
                'bg-primary/10 text-primary',
                sizes[size].container,
                className,
            )}
        >
            <Icon
                className={cn(
                    sizes[size].icon,
                    iconClassName,
                )}
            />
        </div>
    );
}