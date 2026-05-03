import { SidebarInset } from '@/components/ui/sidebar';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'div'> {
    variant?: 'header' | 'sidebar';
    fullWidth?: boolean;
}

export function AppContent({
    variant = 'header',
    fullWidth = false,
    children,
    className = '',
    ...props
}: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset className={className} {...props}>
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            className={
                fullWidth
                    ? `flex h-full w-full flex-1 flex-col ${className}`
                    : `mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl ${className}`
            }
            {...props}
        >
            {children}
        </main>
    );
}