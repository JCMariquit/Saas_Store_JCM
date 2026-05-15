import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function LayoutPage() {
    return (
        <AppLayout>
            <Head title="Layouts" />

            <div className="space-y-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Apps
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold">Layouts</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Blank page for reusable layout experiments.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                    <div className="h-[520px] rounded-2xl border bg-muted/20" />
                    <div className="h-[520px] rounded-2xl border bg-muted/20" />
                </div>
            </div>
        </AppLayout>
    );
}