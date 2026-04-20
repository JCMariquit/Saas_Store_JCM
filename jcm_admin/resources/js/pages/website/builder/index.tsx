import { Head, router, usePage } from '@inertiajs/react';
import { Boxes, ArrowRight, Globe, Layers3 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

type ProductRow = {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    pricing_type: 'plan' | 'custom' | string;
    status: string;
};

type PageProps = {
    products: ProductRow[];
};

export default function WebsiteBuilderIndex() {
    const { props } = usePage<PageProps>();
    const { products } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Website',
            href: '#',
        },
        {
            title: 'Website Builder',
            href: '/admin/website/builder',
        },
    ];

    const pricingTypeBadgeClass = (pricingType: string) => {
        switch (pricingType) {
            case 'plan':
                return 'border-blue-200 bg-blue-100 text-blue-700';
            case 'custom':
                return 'border-purple-200 bg-purple-100 text-purple-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Builder" />

            <div className="min-h-screen space-y-6 bg-slate-100 p-4 md:p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Website Builder
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Select a product to start building a client website experience.
                            </p>
                        </div>

                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                            First step: choose a product
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                        <Globe className="h-6 w-6 text-slate-700" />
                                    </div>

                                    <span
                                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${pricingTypeBadgeClass(
                                            product.pricing_type,
                                        )}`}
                                    >
                                        {product.pricing_type}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {product.name}
                                    </h2>
                                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                                        {product.description || 'No description available for this product yet.'}
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Status</span>
                                        <span className="font-medium capitalize text-slate-900">
                                            {product.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Product Type</span>
                                        <span className="font-medium text-slate-900">
                                            Website Product
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Builder Flow</span>
                                        <span className="font-medium text-slate-900">
                                            Ready
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Layers3 className="h-4 w-4" />
                                        <span>Use this as starter product</span>
                                    </div>

                                    <Button
                                        type="button"
                                        className="rounded-md"
                                        onClick={() =>
                                            router.get(route('admin.website.builder.show', product.id))
                                        }
                                    >
                                        Select
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                <Boxes className="h-6 w-6 text-slate-500" />
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-slate-900">
                                No active products found
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Add active products first in the Products module so they can appear in the Website Builder.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}