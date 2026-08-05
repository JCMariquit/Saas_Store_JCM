import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

type LayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    fullWidth?: boolean;
};

export default function AppLayout({
    children,
    breadcrumbs = [],
    fullWidth = false,
}: LayoutProps) {
    const { auth } = usePage<SharedData>().props;

    if (auth.isAdmin) {
        return <AppSidebarLayout breadcrumbs={breadcrumbs}>{children}</AppSidebarLayout>;
    }

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs} fullWidth={fullWidth}>
            {children}
        </AppHeaderLayout>
    );
}
