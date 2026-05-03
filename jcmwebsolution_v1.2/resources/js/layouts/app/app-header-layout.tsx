import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

type HeaderLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    fullWidth?: boolean;
};

export default function AppHeaderLayout({
    children,
    breadcrumbs,
    fullWidth = false,
}: HeaderLayoutProps) {
    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent fullWidth={fullWidth}>{children}</AppContent>
        </AppShell>
    );
}