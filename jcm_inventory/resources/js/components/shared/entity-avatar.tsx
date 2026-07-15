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
        container: 'size-8 rounded-lg',
        icon: 'size-4',
    },
    default: {
        container: 'size-10 rounded-xl',
        icon: 'size-[18px]',
    },
    lg: {
        container: 'size-12 rounded-2xl',
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
                'relative flex shrink-0',
                'items-center justify-center',
                'border border-primary/10',
                'bg-primary/10 text-primary',
                'shadow-inner',
                'transition-all duration-200',
                'group-hover:border-primary/20',
                'group-hover:bg-primary/15',
                sizes[size].container,
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/[0.05] to-transparent" />

            <Icon
                className={cn(
                    'relative',
                    sizes[size].icon,
                    iconClassName,
                )}
            />
        </div>
    );
}