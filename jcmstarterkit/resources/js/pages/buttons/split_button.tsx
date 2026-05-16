import { Head } from '@inertiajs/react';
import { Code2, Layers, PackageCheck, Sparkles } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const pageTitle = 'Button Split';
const pageDescription =
    'Development placeholder page for JCM Starter Kit modules, UI previews, and future components.';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: pageTitle,
        href: '#',
    },
];

export default function Buttons() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex h-full min-h-[360px] items-center justify-center rounded-xl border border-dashed bg-muted/20">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border bg-background">
                            <Code2 className="size-5 text-muted-foreground" />
                        </div>

                        <h2 className="text-base font-semibold">
                            Build content here
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                            Replace this area with your real component preview, table, form, chart, or starter kit layout.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}