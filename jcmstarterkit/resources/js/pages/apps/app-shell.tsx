import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function AppShell() {
    return (
        <AppLayout>
            <Head title="App Shell" />

            <div className="space-y-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Apps
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold">App Shell</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Blank workspace for testing app shell layouts.
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="h-52 rounded-2xl border bg-muted/20" />
                    <div className="h-52 rounded-2xl border bg-muted/20" />
                    <div className="h-52 rounded-2xl border bg-muted/20" />
                </div>

                <div className="h-[420px] rounded-2xl border bg-muted/20" />
            </div>
        </AppLayout>
    );
}