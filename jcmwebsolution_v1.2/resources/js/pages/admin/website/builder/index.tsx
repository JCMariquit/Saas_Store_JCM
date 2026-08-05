import { Head, router, usePage } from '@inertiajs/react';
import { ArrowRight, Boxes, Globe, Layers3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/admin-layout';
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
            <Head title="Website Builder" />

            <div className="bg-background min-h-screen p-4 md:p-6">
                <div className="space-y-6">
                    <PageHero title="Website Builder" description="Select a product to start building a client website experience." />

                    <SectionCard
                        title="Builder Products"
                        description={`${products.length} product${products.length !== 1 ? 's' : ''} available for website builder setup.`}
                        actions={
                            <div className="border-primary/20 bg-primary/[0.06] text-primary rounded-full border px-3 py-2 text-sm font-medium">
                                First step: choose a product
                            </div>
                        }
                    >
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group border-primary/20 bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="from-primary absolute inset-y-0 left-0 w-[4px] rounded-l-2xl bg-gradient-to-b to-indigo-500" />

                                        <div className="flex items-start justify-between gap-4">
                                            <div className="bg-primary/[0.06] text-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm">
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
                                            <h2 className="text-foreground text-lg font-semibold">{product.name}</h2>
                                            <p className="text-muted-foreground mt-2 min-h-[48px] text-sm leading-6">
                                                {product.description || 'No description available for this product yet.'}
                                            </p>
                                        </div>

                                        <div className="border-border bg-muted/30 mt-5 space-y-3 rounded-2xl border p-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Status</span>
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                                                        product.status,
                                                    )}`}
                                                >
                                                    {product.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Product Type</span>
                                                <span className="text-foreground font-medium">Website Product</span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Builder Flow</span>
                                                <span className="text-foreground font-medium">Ready</span>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                                <Layers3 className="h-4 w-4" />
                                                <span>Use this as starter product</span>
                                            </div>

                                            <Button
                                                type="button"
                                                className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl bg-gradient-to-r text-white"
                                                onClick={() => router.get(route('admin.website.builder.show', product.id))}
                                            >
                                                Select
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="border-border bg-card col-span-full rounded-2xl border border-dashed px-6 py-14 text-center">
                                    <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                                        <Boxes className="text-muted-foreground h-6 w-6" />
                                    </div>
                                    <h2 className="text-foreground mt-4 text-lg font-semibold">No active products found</h2>
                                    <p className="text-muted-foreground mt-2 text-sm">
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
