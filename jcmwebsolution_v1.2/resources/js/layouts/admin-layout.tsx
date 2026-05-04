import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

type AdminLayoutProps = PropsWithChildren<{
    breadcrumbs?: BreadcrumbItem[];
}>;

export default function AdminLayout({
    children,
    breadcrumbs = [],
}: AdminLayoutProps) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            {children}
        </AppSidebarLayout>
    );
}