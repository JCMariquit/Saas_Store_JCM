import { Head, router, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Boxes,
    CheckCircle2,
    CreditCard,
    Headset,
    MonitorSmartphone,
    Rocket,
    Sparkles,
    Workflow,
    Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import Navbar from '@/components/navbar';

type ProductItem = {
    id: number;
    name: string;
    pricing_type?: string;
    thumbnail_url?: string | null;
    image_url?: string | null;
    starting_price_label?: string | null;
};

type ServiceItem = {
    id: number;
    name: string;
    service_type?: string;
    pricing_type?: string;
    thumbnail_url?: string | null;
    image_url?: string | null;
    base_price_label?: string | null;
};

type StoreCardItem = {
    id: number;
    name: string;
    label: string;
    imageUrl?: string | null;
    badge?: string | null;
};

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

const steps = [
    {
        icon: CheckCircle2,
        title: 'Choose a Solution',
        desc: 'Select the product or service that fits your business needs.',
    },
    {
        icon: CreditCard,
        title: 'Place Your Order',
        desc: 'Send your order details and complete your preferred payment method.',
    },
    {
        icon: Rocket,
        title: 'Launch with Confidence',
        desc: 'We assist with setup and deployment so you can start smoothly.',
    },
];

const stats = [
    { label: 'Trusted Clients', value: '50+' },
    { label: 'Projects Completed', value: '120+' },
    { label: 'Years Experience', value: '3+' },
    { label: 'Support Availability', value: '24/7' },
];

const reasons = [
    {
        icon: BadgeCheck,
        title: 'Simple and Clear Pricing',
        desc: 'Choose ready-made products or request custom-built systems based on your budget.',
    },
    {
        icon: Workflow,
        title: 'Built for Real Operations',
        desc: 'Designed for bookings, orders, records, payments, reports, and daily workflows.',
    },
    {
        icon: Headset,
        title: 'Reliable Setup and Support',
        desc: 'We guide you from onboarding, setup, deployment, and after-sales support.',
    },
];

export default function Welcome() {
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
        badge: service.service_type === 'custom' ? 'Custom Service' : service.service_type ?? 'Service',
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

function StoreHero({ banners }: { banners: string[] }) {
    const [currentBanner, setCurrentBanner] = useState(0);
    const safeBanners = useMemo(() => banners.filter(Boolean), [banners]);

    useEffect(() => {
        if (safeBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % safeBanners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [safeBanners.length]);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            className="relative overflow-hidden"
            style={{
                backgroundImage: "url('/images/item-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="absolute inset-0 bg-slate-950/20" />

            <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-8 md:px-7 lg:min-h-[400px] lg:grid-cols-[1fr_1fr] lg:items-center lg:py-6">
                <div className="z-10 max-w-3xl py-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" />
                        JCM Web Solution Store
                    </div>

                    <h1 className="mt-5 max-w-xl text-3xl font-black leading-tight text-white md:text-4xl xl:text-5xl">
                        Upgrade your business with modern digital systems
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base">
                        Explore ready-made SaaS products and custom-built services designed for
                        bookings, orders, records, payments, and daily business operations.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => scrollToSection('products-section')}
                            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
                        >
                            Browse Products
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('services-section')}
                            className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                        >
                            View Services
                        </button>
                    </div>
                </div>

                <div className="relative h-[240px] overflow-hidden rounded-xl shadow-xl shadow-slate-950/20 lg:h-[360px]">
                    <div
                        className="flex h-full transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                    >
                        {safeBanners.map((banner, index) => (
                            <img
                                key={index}
                                src={banner}
                                alt={`Banner ${index + 1}`}
                                className="h-full w-full flex-shrink-0 object-cover"
                            />
                        ))}
                    </div>

                    {safeBanners.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                            {safeBanners.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setCurrentBanner(index)}
                                    className={`h-2.5 rounded-full transition-all ${
                                        currentBanner === index
                                            ? 'w-8 bg-white'
                                            : 'w-2.5 bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function StatsStrip() {
    return (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.label} className="rounded-xl border border-white bg-white p-5 text-center shadow-sm">
                        <p className="text-2xl font-black text-slate-950">{item.value}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <SectionHeader eyebrow="Simple Process" title="How it works" />

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <div key={step.title} className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
                                <div className="absolute right-3 top-3 text-3xl font-black text-slate-100">
                                    0{index + 1}
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white transition group-hover:bg-sky-600">
                                    <Icon className="h-4 w-4" />
                                </div>

                                <h3 className="mt-3 text-sm font-bold text-slate-950">{step.title}</h3>
                                <p className="mt-1 text-[12px] leading-5 text-slate-500">{step.desc}</p>
                                <div className="mt-3 h-1 w-8 rounded-full bg-sky-500 transition group-hover:w-14" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function StoreGridSection({
    id,
    eyebrow,
    title,
    description,
    items,
    emptyTitle,
    emptyDescription,
    emptyIcon,
    fallbackIcon,
    onItemClick,
}: {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    items: StoreCardItem[];
    emptyTitle: string;
    emptyDescription: string;
    emptyIcon?: React.ReactNode;
    fallbackIcon?: React.ReactNode;
    onItemClick?: (item: StoreCardItem) => void;
}) {
    return (
        <section id={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionHeader eyebrow={eyebrow} title={title} description={description} />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {items.length > 0 ? (
                    items.map((item) => (
                        <StoreItemCard
                            key={item.id}
                            item={item}
                            fallbackIcon={fallbackIcon}
                            onClick={() => onItemClick?.(item)}
                        />
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                            {emptyIcon ?? <Boxes className="h-6 w-6 text-slate-500" />}
                        </div>

                        <h3 className="mt-4 text-lg font-black text-slate-950">{emptyTitle}</h3>
                        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

function StoreItemCard({
    item,
    fallbackIcon,
    onClick,
}: {
    item: StoreCardItem;
    fallbackIcon?: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
        >
            <div className="flex h-40 items-center justify-center bg-slate-100">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                    fallbackIcon ?? <MonitorSmartphone className="h-10 w-10 text-slate-400" />
                )}
            </div>

            <div className="p-4">
                {item.badge && (
                    <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                        {item.badge}
                    </span>
                )}

                <h3 className="mt-3 line-clamp-2 text-sm font-black text-slate-950">
                    {item.name}
                </h3>

                <p className="mt-2 text-sm font-bold text-sky-700">{item.label}</p>
            </div>
        </button>
    );
}

function WhyChooseUs() {
    return (
        <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen bg-[#f6f8fb] py-10">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <SectionHeader
                    eyebrow="Why Businesses Choose JCM"
                    title="Modern systems built for real business needs"
                    description="Move from manual processes to smarter digital solutions with practical and scalable systems."
                />

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {reasons.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.title} className="group relative rounded-xl border border-slate-200/70 bg-white/60 p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white/80 hover:shadow-md">
                                <div className="absolute right-3 top-3 text-3xl font-black text-slate-100">
                                    0{index + 1}
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition group-hover:bg-sky-600">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className="mt-4 text-sm font-black text-slate-950">{item.title}</h3>
                                <p className="mt-2 text-[12px] leading-5 text-slate-500">{item.desc}</p>
                                <div className="mt-4 h-1 w-8 rounded-full bg-sky-500 transition group-hover:w-14" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function StoreFooter() {
    return (
        <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen overflow-x-hidden border-t border-slate-800 bg-gradient-to-r from-slate-950 to-slate-800 text-white">
            <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-300">
                    Start Your Digital System
                </p>

                <h2 className="mt-3 text-2xl font-black md:text-3xl">
                    Upgrade your business with a modern system today
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    Choose from ready-made products or request a custom-built system tailored
                    to your business needs.
                </p>
            </div>

            <div className="border-t border-white/10" />

            <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2 md:px-8 lg:grid-cols-4">
                <FooterColumn
                    title="JCM Web Solution"
                    items={[
                        'Modern web systems designed to help businesses go digital.',
                        'Automation, reports, payments, and scalable workflows.',
                    ]}
                />

                <FooterColumn title="Payment Methods" items={['GCash', 'Maya', 'Bank Transfer']} />

                <FooterColumn
                    title="Customer Support"
                    items={['System Setup Assistance', 'Technical Support', 'After-Sales Support']}
                />

                <FooterColumn
                    title="Contact & Social"
                    items={['Facebook Page', 'Instagram', 'Email: jcmwebsolution@gmail.com']}
                />
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto px-6 py-6 text-sm text-slate-400 md:px-8">
                    © {new Date().getFullYear()} JCM Web Solution. All rights reserved.
                </div>
            </div>
        </section>
    );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                {title}
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function SectionHeader({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description?: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600">
                {eyebrow}
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
                {title}
            </h2>

            {description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
}