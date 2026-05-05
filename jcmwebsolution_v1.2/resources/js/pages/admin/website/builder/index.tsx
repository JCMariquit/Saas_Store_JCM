import { Head, router, usePage } from '@inertiajs/react';
import { Boxes, ArrowRight, Globe, Layers3 } from 'lucide-react';

import AppLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/admin-ui/page-hero';
import { SectionCard } from '@/components/admin-ui/section-card';

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
                return 'border-blue-200 bg-blue-50 text-blue-700';
            case 'custom':
                return 'border-indigo-200 bg-indigo-50 text-indigo-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700';
            case 'inactive':
                return 'border-red-200 bg-red-50 text-red-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Builder" />

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title="Website Builder"
                        description="Select a product to start building a client website experience."
                    />

                    <SectionCard
                        title="Builder Products"
                        description={`${products.length} product${products.length !== 1 ? 's' : ''} available for website builder setup.`}
                        actions={
                            <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                                First step: choose a product
                            </div>
                        }
                    >
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="absolute inset-y-0 left-0 w-[4px] rounded-l-2xl bg-gradient-to-b from-blue-600 to-indigo-500" />

                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm">
                                                <Globe className="h-6 w-6" />
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${pricingTypeBadgeClass(
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

                                        <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Status</span>
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                                                        product.status,
                                                    )}`}
                                                >
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

                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Layers3 className="h-4 w-4" />
                                                <span>Use this as starter product</span>
                                            </div>

                                            <Button
                                                type="button"
                                                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
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
                                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
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
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}