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

            <AppContent variant="sidebar" className="overflow-hidden bg-slate-50 p-0">
                <div className="relative h-16 bg-[#9f0028] text-white [&_*]:text-white">
                    <div className="absolute -left-10 top-0 h-16 w-10 bg-[#9f0028]" />
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                </div>

                <div className="p-4">{children}</div>
            </AppContent>
        </AppShell>
    );
}