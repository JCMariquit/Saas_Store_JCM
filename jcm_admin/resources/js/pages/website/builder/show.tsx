import { Head, usePage } from '@inertiajs/react';
import { ArrowRight, Globe } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

type ProductRow = {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    pricing_type: string;
    status: string;
};

type PageProps = {
    product: ProductRow;
};

export default function WebsiteBuilderShow() {
    const { props } = usePage<PageProps>();
    const { product } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Website',
            href: '#',
        },
        {
            title: 'Website Builder',
            href: '/admin/website/builder',
        },
        {
            title: product.name,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${product.name} Builder`} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <Globe className="h-7 w-7 text-slate-700" />
                    </div>

                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                        {product.name}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        {product.description || 'This product is ready for the next builder step.'}
                    </p>

                    <div className="mt-6 inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        Next page placeholder only for now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}