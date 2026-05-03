import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

type LayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    fullWidth?: boolean;
};

export default function AppLayout({
    children,
    breadcrumbs,
    fullWidth = false,
}: LayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} fullWidth={fullWidth}>
            {children}
        </AppLayoutTemplate>
    );
}