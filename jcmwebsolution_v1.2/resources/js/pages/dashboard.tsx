import { Head, router, usePage } from '@inertiajs/react';
import { Boxes, MonitorSmartphone, Wrench } from 'lucide-react';

import HowItWorks from '@/components/jcm-ui/HowItWorks';
import StatsStrip from '@/components/jcm-ui/StatsStrip';
import StoreFooter from '@/components/jcm-ui/StoreFooter';
import StoreGridSection from '@/components/jcm-ui/StoreGridSection';
import StoreHero from '@/components/jcm-ui/StoreHero';
import type {
    ProductItem,
    ServiceItem,
    StoreCardItem,
} from '@/components/jcm-ui/types';
import WhyChooseUs from '@/components/jcm-ui/WhyChooseUs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type PageProps = {
    products: ProductItem[];
    services: ServiceItem[];
}; 

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'JCM Web Solution',
        href: '/dashboard',
    },
];

const banners = [
    '/images/banner/banner1.png',
    '/images/banner/banner2.png',
    '/images/banner/banner3.png',
];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { products = [], services = [] } = props;

    const productItems: StoreCardItem[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        label: product.starting_price_label ?? 'Plan Based',
        imageUrl: product.thumbnail_url ?? product.image_url ?? null,
        badge:
            product.pricing_type === 'plan'
                ? 'Plan Based'
                : product.pricing_type === 'custom'
                  ? 'Custom'
                  : product.pricing_type ?? 'Product',
    }));

    const serviceItems: StoreCardItem[] = services.map((service) => ({
        id: service.id,
        name: service.name,
        label: service.base_price_label ?? 'Custom Quote',
        imageUrl: service.thumbnail_url ?? service.image_url ?? null,
        badge:
            service.service_type === 'custom'
                ? 'Custom Service'
                : service.service_type ?? 'Service',
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth>
            <Head title="JCM Web Solution" />

            <main className="min-h-screen space-y-6 overflow-x-hidden bg-[#e8e9eb] pb-0 text-slate-900">
                <StoreHero banners={banners} />

                <StatsStrip />

                <HowItWorks />

                <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
                    <StoreGridSection
                        id="products-section"
                        eyebrow="Products"
                        title="Featured Products"
                        description="Explore digital solutions designed to help businesses operate better."
                        items={productItems}
                        emptyTitle="No products found"
                        emptyDescription="Products will appear here once available."
                        emptyIcon={<Boxes className="h-6 w-6 text-slate-500" />}
                        fallbackIcon={
                            <MonitorSmartphone className="h-10 w-10 text-slate-400" />
                        }
                        onItemClick={(item) => router.get(`/products/${item.id}`)}
                    />

                    <StoreGridSection
                        id="services-section"
                        eyebrow="Services"
                        title="Custom-Made Services"
                        description="Tailored solutions for businesses that need custom systems."
                        items={serviceItems}
                        emptyTitle="No services found"
                        emptyDescription="Services will appear here once available."
                        emptyIcon={<Wrench className="h-6 w-6 text-slate-500" />}
                        fallbackIcon={<Wrench className="h-10 w-10 text-slate-400" />}
                        onItemClick={(item) => router.get(`/services/${item.id}`)}
                    />
                </div>

                <WhyChooseUs />

                <StoreFooter />
            </main>
        </AppLayout>
    );
}