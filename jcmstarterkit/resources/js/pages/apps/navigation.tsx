import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Navigation() {
    return (
        <AppLayout>
            <Head title="Navigation" />

            <div className="space-y-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Apps
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold">Navigation</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Blank page for menu, sidebar, tabs, and breadcrumb patterns.
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-4">
                    <div className="h-28 rounded-2xl border bg-muted/20" />
                    <div className="h-28 rounded-2xl border bg-muted/20" />
                    <div className="h-28 rounded-2xl border bg-muted/20" />
                    <div className="h-28 rounded-2xl border bg-muted/20" />
                </div>

                <div className="h-[460px] rounded-2xl border bg-muted/20" />
            </div>
        </AppLayout>
    );
}