import { Head, usePage } from '@inertiajs/react';
import { ArrowRight, Globe, Layers3, CheckCircle2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/jcm-ui/page-hero';
import { SectionCard } from '@/components/jcm-ui/section-card';
import { StatsCard } from '@/components/jcm-ui/stats-card';

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
            <Head title={`${product.name} Builder`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/50 p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero
                        title={product.name}
                        description={product.description || 'This product is ready for the next builder step.'}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard
                            title="Builder Status"
                            value="Ready"
                            description="This product can move to the next builder step."
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            tone="blue"
                        />
                        <StatsCard
                            title="Pricing Type"
                            value={product.pricing_type}
                            description="Current pricing setup of the selected product."
                            icon={<Layers3 className="h-5 w-5" />}
                            tone="indigo"
                        />
                        <StatsCard
                            title="Product Status"
                            value={product.status}
                            description="Current availability state of this product."
                            icon={<Globe className="h-5 w-5" />}
                            tone="emerald"
                        />
                    </div>

                    <SectionCard
                        title="Product Builder Overview"
                        description="Review the selected website product before proceeding to the next builder module."
                    >
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm">
                                    <Globe className="h-7 w-7" />
                                </div>

                                <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                                    {product.name}
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                                    {product.description || 'This product is ready for the next builder step.'}
                                </p>

                                <div className="mt-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                                    Next page placeholder only for now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </div>

                            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Product Name
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {product.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Slug
                                    </p>
                                    <p className="mt-1 text-sm text-slate-900">
                                        {product.slug || '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Pricing Type
                                    </p>
                                    <div className="mt-2">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${pricingTypeBadgeClass(
                                                product.pricing_type,
                                            )}`}
                                        >
                                            {product.pricing_type}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Status
                                    </p>
                                    <div className="mt-2">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                                                product.status,
                                            )}`}
                                        >
                                            {product.status}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Builder Flow
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        Ready for next step
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}