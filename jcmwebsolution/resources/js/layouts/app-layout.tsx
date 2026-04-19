import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import type { AppLayoutProps } from '@/types';

type LayoutProps = AppLayoutProps & {
    fullWidth?: boolean;
};

export default function AppLayout({
    children,
    breadcrumbs,
    fullWidth = false,
    ...props
}: LayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} fullWidth={fullWidth} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}