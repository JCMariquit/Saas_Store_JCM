import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

interface AppContentProps
    extends ComponentPropsWithoutRef<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({
    variant = 'header',
    children,
    className,
    ...props
}: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset
                className={cn(
                    'w-full min-w-0 max-w-full',
                    'overflow-x-hidden',
                    className,
                )}
                {...props}
            >
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            className={cn(
                'mx-auto flex h-full w-full min-w-0',
                'max-w-7xl flex-1 flex-col gap-4',
                'overflow-x-hidden rounded-xl',
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
}