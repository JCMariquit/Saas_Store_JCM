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
                className="min-w-0 overflow-x-hidden bg-slate-50 p-0"
            >
                <div className="fixed top-0 right-0 left-0 z-50 h-16 bg-[#9f0028] text-white shadow-sm md:left-[var(--sidebar-width)] [&_*]:text-white">
                    <div className="hidden md:block absolute -left-10 top-0 h-16 w-10 bg-[#9f0028]" />

                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                </div>

                <main className="min-w-0 pt-16">
                    <div className="p-4">
                        {children}
                    </div>
                </main>
            </AppContent>
        </AppShell>
    );
}