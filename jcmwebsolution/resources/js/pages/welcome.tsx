import { Head, router, usePage } from '@inertiajs/react';
import { Boxes, MonitorSmartphone, Wrench } from 'lucide-react';

import Navbar from '@/components/navbar';

import HowItWorks from '@/components/jcm-ui/HowItWorks';
import StatsStrip from '@/components/jcm-ui/StatsStrip';
import StoreFooter from '@/components/jcm-ui/StoreFooter';
import StoreGridSection from '@/components/jcm-ui/StoreGridSection';
import StoreHero from '@/components/jcm-ui/StoreHero';
import WhyChooseUs from '@/components/jcm-ui/WhyChooseUs';

import type { ProductItem, ServiceItem, StoreCardItem } from '@/components/jcm-ui/types';

type PageProps = {
    products: ProductItem[];
    services: ServiceItem[];
    canRegister?: boolean;
};

const banners = [
    '/images/banner/banner1.png',
    '/images/banner/banner2.png',
    '/images/banner/banner3.png',
];

export default function Welcome() {
    const { props } = usePage<PageProps>();
    const { products = [], services = [] } = props;

    const productItems: StoreCardItem[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        label: product.starting_price_label,
        imageUrl: product.thumbnail_url ?? product.image_url,
        badge:
            product.pricing_type === 'plan'
                ? 'Plan Based'
                : product.pricing_type === 'custom'
                  ? 'Custom'
                  : product.pricing_type,
    }));

    const serviceItems: StoreCardItem[] = services.map((service) => ({
        id: service.id,
        name: service.name,
        label: service.base_price_label,
        imageUrl: null,
        badge: service.service_type === 'custom' ? 'Custom Service' : service.service_type,
    }));

    return (
        <>
            <Head title="JCM Web Solution" />

            <div className="min-h-screen overflow-x-hidden bg-[#e8e9eb] text-slate-900">
                <Navbar />

                <main className="space-y-6 overflow-x-hidden pb-0">
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
                            fallbackIcon={<MonitorSmartphone className="h-10 w-10 text-slate-400" />}
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
                        />
                    </div>

                    <WhyChooseUs />

                    <StoreFooter />
                </main>
            </div>
        </>
    );
} 