import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-hidden bg-[var(--workspace-background,var(--background))]"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="min-w-0 px-4 pb-6 pt-4 md:px-5">{children}</main>
            </AppContent>
        </AppShell>
    );
}
