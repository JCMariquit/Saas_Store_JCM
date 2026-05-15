import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function ErrorPages() {
    return (
        <AppLayout>
            <Head title="Error Pages" />

            <div className="space-y-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Apps
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold">Error Pages</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Blank page for 403, 404, 419, 500, and maintenance screen patterns.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="h-64 rounded-2xl border bg-muted/20" />
                    <div className="h-64 rounded-2xl border bg-muted/20" />
                    <div className="h-64 rounded-2xl border bg-muted/20" />
                    <div className="h-64 rounded-2xl border bg-muted/20" />
                </div>

                <div className="h-[300px] rounded-2xl border bg-muted/20" />
            </div>
        </AppLayout>
    );
}