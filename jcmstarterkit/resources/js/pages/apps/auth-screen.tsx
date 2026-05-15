import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function AuthScreen() {
    return (
        <AppLayout>
            <Head title="Auth Screens" />

            <div className="space-y-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Apps
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold">Auth Screens</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Blank page for login, register, forgot password, and verification layouts.
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="h-[560px] rounded-2xl border bg-muted/20" />
                    <div className="h-[560px] rounded-2xl border bg-muted/20" />
                </div>
            </div>
        </AppLayout>
    );
}