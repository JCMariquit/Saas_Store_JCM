import { Head, router, usePage } from '@inertiajs/react';
import { BadgeCheck, Boxes, CheckCircle2, CreditCard, Headset, MonitorSmartphone, Rocket, Sparkles, Workflow, Wrench } from 'lucide-react';
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

const banners = ['/images/banner/banner1.png', '/images/banner/banner2.png', '/images/banner/banner3.png'];

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
        badge: product.pricing_type === 'plan' ? 'Plan Based' : product.pricing_type === 'custom' ? 'Custom' : (product.pricing_type ?? 'Product'),
    }));

    const serviceItems: StoreCardItem[] = services.map((service) => ({
        id: service.id,
        name: service.name,
        label: service.base_price_label ?? 'Custom Quote',
        imageUrl: service.thumbnail_url ?? service.image_url ?? null,
        badge: service.service_type === 'custom' ? 'Custom Service' : (service.service_type ?? 'Service'),
    }));

    return (
        <>
            <Head title="JCM Web Solution" />

            <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
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
                            emptyIcon={<Boxes className="text-muted-foreground h-6 w-6" />}
                            fallbackIcon={<MonitorSmartphone className="text-muted-foreground h-10 w-10" />}
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
                            emptyIcon={<Wrench className="text-muted-foreground h-6 w-6" />}
                            fallbackIcon={<Wrench className="text-muted-foreground h-10 w-10" />}
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
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" />
                        JCM Web Solution Store
                    </div>

                    <h1 className="mt-5 max-w-xl text-3xl leading-tight font-black text-white md:text-4xl xl:text-5xl">
                        Upgrade your business with modern digital systems
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base">
                        Explore ready-made SaaS products and custom-built services designed for bookings, orders, records, payments, and daily
                        business operations.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => scrollToSection('products-section')}
                            className="bg-card text-foreground hover:bg-muted rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-0.5"
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
                            <img key={index} src={banner} alt={`Banner ${index + 1}`} className="h-full w-full flex-shrink-0 object-cover" />
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
                                        currentBanner === index ? 'bg-card w-8' : 'w-2.5 bg-white/50 hover:bg-white/80'
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
                    <div key={item.label} className="bg-card rounded-xl border border-white p-5 text-center shadow-sm">
                        <p className="text-foreground text-2xl font-black">{item.value}</p>
                        <p className="text-muted-foreground mt-1 text-xs font-medium">{item.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="border-border bg-card rounded-2xl border px-6 py-5 shadow-sm">
                <SectionHeader eyebrow="Simple Process" title="How it works" />

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.title}
                                className="group border-border bg-card hover:border-primary/25 relative rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="text-muted-foreground/20 absolute top-3 right-3 text-3xl font-black">0{index + 1}</div>

                                <div className="bg-primary text-primary-foreground group-hover:bg-primary/80 flex h-9 w-9 items-center justify-center rounded-lg transition">
                                    <Icon className="h-4 w-4" />
                                </div>

                                <h3 className="text-foreground mt-3 text-sm font-bold">{step.title}</h3>
                                <p className="text-muted-foreground mt-1 text-[12px] leading-5">{step.desc}</p>
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
        <section id={id} className="border-border bg-card rounded-2xl border p-5 shadow-sm md:p-6">
            <SectionHeader eyebrow={eyebrow} title={title} description={description} />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {items.length > 0 ? (
                    items.map((item) => <StoreItemCard key={item.id} item={item} fallbackIcon={fallbackIcon} onClick={() => onItemClick?.(item)} />)
                ) : (
                    <div className="border-border bg-muted/30 col-span-full rounded-2xl border border-dashed px-6 py-16 text-center">
                        <div className="bg-card mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-sm">
                            {emptyIcon ?? <Boxes className="text-muted-foreground h-6 w-6" />}
                        </div>

                        <h3 className="text-foreground mt-4 text-lg font-black">{emptyTitle}</h3>
                        <p className="text-muted-foreground mt-2 text-sm">{emptyDescription}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

function StoreItemCard({ item, fallbackIcon, onClick }: { item: StoreCardItem; fallbackIcon?: React.ReactNode; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group border-border bg-card hover:border-primary/25 overflow-hidden rounded-2xl border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="bg-muted flex h-40 items-center justify-center">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                    (fallbackIcon ?? <MonitorSmartphone className="text-muted-foreground h-10 w-10" />)
                )}
            </div>

            <div className="p-4">
                {item.badge && (
                    <span className="bg-primary/[0.07] text-primary inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
                        {item.badge}
                    </span>
                )}

                <h3 className="text-foreground mt-3 line-clamp-2 text-sm font-black">{item.name}</h3>

                <p className="text-primary mt-2 text-sm font-bold">{item.label}</p>
            </div>
        </button>
    );
}

function WhyChooseUs() {
    return (
        <section className="bg-muted/20 relative right-1/2 left-1/2 mr-[-50vw] ml-[-50vw] w-screen py-10">
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
                            <div
                                key={item.title}
                                className="group border-border/70 bg-card/60 hover:border-primary/25 hover:bg-card relative rounded-xl border p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="text-muted-foreground/20 absolute top-3 right-3 text-3xl font-black">0{index + 1}</div>

                                <div className="bg-primary text-primary-foreground group-hover:bg-primary/80 flex h-10 w-10 items-center justify-center rounded-xl transition">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className="text-foreground mt-4 text-sm font-black">{item.title}</h3>
                                <p className="text-muted-foreground mt-2 text-[12px] leading-5">{item.desc}</p>
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
        <section className="relative right-1/2 left-1/2 mr-[-50vw] ml-[-50vw] w-screen overflow-x-hidden border-t border-slate-800 bg-gradient-to-r from-slate-950 to-slate-800 text-white">
            <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
                <p className="text-sm tracking-[0.18em] text-slate-300 uppercase">Start Your Digital System</p>

                <h2 className="mt-3 text-2xl font-black md:text-3xl">Upgrade your business with a modern system today</h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    Choose from ready-made products or request a custom-built system tailored to your business needs.
                </p>
            </div>

            <div className="border-t border-white/10" />

            <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2 md:px-8 lg:grid-cols-4">
                <FooterColumn
                    title="JCM Web Solution"
                    items={['Modern web systems designed to help businesses go digital.', 'Automation, reports, payments, and scalable workflows.']}
                />

                <FooterColumn title="Payment Methods" items={['GCash', 'Maya', 'Bank Transfer']} />

                <FooterColumn title="Customer Support" items={['System Setup Assistance', 'Technical Support', 'After-Sales Support']} />

                <FooterColumn title="Contact & Social" items={['Facebook Page', 'Instagram', 'Email: jcmwebsolution@gmail.com']} />
            </div>

            <div className="border-t border-white/10">
                <div className="text-muted-foreground mx-auto px-6 py-6 text-sm md:px-8">
                    © {new Date().getFullYear()} JCM Web Solution. All rights reserved.
                </div>
            </div>
        </section>
    );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase">{title}</h3>

            <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-sky-600 uppercase">{eyebrow}</p>

            <h2 className="text-foreground mt-1 text-2xl font-black">{title}</h2>

            {description && <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">{description}</p>}
        </div>
    );
}
