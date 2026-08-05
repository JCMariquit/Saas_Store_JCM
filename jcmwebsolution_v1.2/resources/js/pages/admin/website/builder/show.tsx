import { Head, usePage } from '@inertiajs/react';
import { ArrowRight, Globe, Layers3, CheckCircle2 } from 'lucide-react';

import AppLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

import { PageHero } from '@/components/admin-ui/page-hero';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';

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
                return 'border-primary/20 bg-primary/[0.06] text-primary';
            case 'custom':
                return 'border-primary/20 bg-primary/10 text-primary';
            default:
                return 'border-border bg-muted text-foreground';
        }
    };

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
            case 'inactive':
                return 'border-red-500/20 bg-red-500/10 text-red-300';
            default:
                return 'border-border bg-muted text-foreground';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${product.name} Builder`} />

            <div className="min-h-screen bg-background p-4 md:p-6">
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
                            <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.06] text-primary shadow-sm">
                                    <Globe className="h-7 w-7" />
                                </div>

                                <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
                                    {product.name}
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {product.description || 'This product is ready for the next builder step.'}
                                </p>

                                <div className="mt-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-2 text-sm font-medium text-primary">
                                    Next page placeholder only for now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </div>

                            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Product Name
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-foreground">
                                        {product.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Slug
                                    </p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {product.slug || '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Builder Flow
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-foreground">
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