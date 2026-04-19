import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

type HeaderLayoutProps = AppLayoutProps & {
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