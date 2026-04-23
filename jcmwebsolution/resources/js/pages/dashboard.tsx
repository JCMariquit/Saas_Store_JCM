import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    Layers3,
    MonitorSmartphone,
    Sparkles,
    Wrench,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ProductItem = {
    id: number;
    name: string;
    description: string | null;
    pricing_type: string;
    status: string;
    starting_price: number | null;
    starting_price_label: string;
};

type ServiceItem = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    service_type: string;
    pricing_type: string;
    base_price: number | null;
    base_price_label: string;
    status: string;
};

type PageProps = {
    products: ProductItem[];
    services: ServiceItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Store',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const { products, services } = props;

    const banners = [
        '/images/banner/banner1.png',
        '/images/banner/banner2.png',
        '/images/banner/banner3.png',
        '/images/banner/banner4.png',
    ];

    const [currentBanner, setCurrentBanner] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    const pricingTypeBadgeClass = (pricingType: string) => {
        switch (pricingType) {
            case 'plan':
                return 'border-blue-200 bg-blue-100 text-blue-700';
            case 'custom':
                return 'border-purple-200 bg-purple-100 text-purple-700';
            case 'fixed':
                return 'border-emerald-200 bg-emerald-100 text-emerald-700';
            case 'quote':
                return 'border-amber-200 bg-amber-100 text-amber-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-green-200 bg-green-100 text-green-700';
            case 'inactive':
                return 'border-red-200 bg-red-100 text-red-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    const serviceTypeBadgeClass = (serviceType: string) => {
        switch (serviceType) {
            case 'custom':
                return 'border-purple-200 bg-purple-100 text-purple-700';
            case 'maintenance':
                return 'border-amber-200 bg-amber-100 text-amber-700';
            case 'support':
                return 'border-sky-200 bg-sky-100 text-sky-700';
            case 'consulting':
                return 'border-indigo-200 bg-indigo-100 text-indigo-700';
            case 'implementation':
                return 'border-emerald-200 bg-emerald-100 text-emerald-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth>
            <Head title="Store" />

            <div className="space-y-6 overflow-x-hidden bg-[#e8e9eb]">
                <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen overflow-x-hidden border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="mx-auto max-w-7xl px-5 py-6 md:px-7 md:py-8 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-6">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                JCM Web Solution Store
                            </div>

                            <h1 className="mt-4 max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl xl:text-4xl">
                                Upgrade your business with ready-made and custom digital solutions
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-[15px]">
                                Explore ready-made SaaS products and custom-built digital solutions
                                designed for real businesses. Find the right system to help your
                                operations become more organized, efficient, and scalable.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const el = document.getElementById('products-section');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
                                >
                                    Browse Products
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const el = document.getElementById('services-section');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    View Services
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3 text-[13px] text-slate-300">
                                <span>✔ Ready products</span>
                                <span>✔ Custom-built services</span>
                                <span>✔ Scalable business solutions</span>
                            </div>
                        </div>

                        <div className="relative mt-6 lg:mt-0">
                            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                            Featured Solution
                                        </p>
                                        <h3 className="mt-1.5 text-lg font-bold text-white">
                                            Professional systems built for growing businesses
                                        </h3>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-2.5">
                                        <MonitorSmartphone className="h-5 w-5 text-white" />
                                    </div>
                                </div>

                                <div className="relative mt-4 overflow-hidden rounded-[20px] border border-white/10">
                                    <img
                                        src={banners[currentBanner]}
                                        alt={`Banner ${currentBanner + 1}`}
                                        className="h-[350px] w-full object-cover transition-all duration-700"
                                    />

                                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
                                        {banners.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setCurrentBanner(index)}
                                                className={`h-2.5 rounded-full transition-all ${
                                                    currentBanner === index
                                                        ? 'w-8 bg-white'
                                                        : 'w-2.5 bg-white/50 hover:bg-white/80'
                                                }`}
                                                aria-label={`Go to banner ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { label: 'Active Products', value: products.length },
                            { label: 'Active Services', value: services.length },
                            { label: 'Systems Built', value: '20+' },
                            { label: 'Support', value: '24/7' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
                            >
                                <p className="text-xl font-bold text-slate-900">{item.value}</p>
                                <p className="text-xs text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900">How it works</h2>

                        <div className="mt-6 grid gap-6 md:grid-cols-3">
                            {[
                                {
                                    title: 'Choose a Solution',
                                    desc: 'Browse available products and services based on what your business needs most.',
                                },
                                {
                                    title: 'Place Your Order',
                                    desc: 'Submit your order details and follow the payment process to get started.',
                                },
                                {
                                    title: 'Launch with Confidence',
                                    desc: 'We help you move forward with a system built for real operations and growth.',
                                },
                            ].map((step, i) => (
                                <div key={i} className="text-center">
                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                                        {i + 1}
                                    </div>
                                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
                    <section
                        id="products-section"
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                                    Products
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    Featured Products
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Plan-based and packaged digital products loaded from your database.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group rounded-2xl border border-white/70 bg-[#fdfefe] p-4 shadow-[0_14px_36px_rgba(58,95,145,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(58,95,145,0.12)]"
                                    >
                                        <div className="h-[120px] rounded-[18px] bg-gradient-to-br from-sky-50 to-blue-100" />

                                        <div className="mt-4 flex items-center justify-between gap-2">
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${pricingTypeBadgeClass(
                                                    product.pricing_type,
                                                )}`}
                                            >
                                                {product.pricing_type}
                                            </span>

                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusBadgeClass(
                                                    product.status,
                                                )}`}
                                            >
                                                {product.status}
                                            </span>
                                        </div>

                                        <div className="mt-3">
                                            <h3 className="text-[20px] leading-tight font-bold text-slate-900">
                                                {product.name}
                                            </h3>
                                            <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-500">
                                                {product.description || 'No description available yet.'}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex items-end justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                                    Starting Price
                                                </p>
                                                <p className="mt-1 text-[18px] font-extrabold text-blue-600">
                                                    {product.starting_price_label}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                onClick={() => router.get(`/products/${product.id}`)}
                                            >
                                                View
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                                            <Layers3 className="h-3.5 w-3.5" />
                                            <span>Explore product details and available options</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                        <Boxes className="h-6 w-6 text-slate-500" />
                                    </div>

                                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                                        No products found
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Add active products first so they can appear in your store.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section
                        id="services-section"
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                                    Services
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    Custom-Made Services
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Tailored services for clients who need custom development and
                                    project-based solutions.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="rounded-2xl border border-white/70 bg-[#fdfefe] p-5 shadow-[0_14px_36px_rgba(58,95,145,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(58,95,145,0.12)]"
                                    >
                                        <div className="h-[120px] rounded-[18px] bg-gradient-to-br from-sky-50 to-blue-100" />

                                        <div className="mt-4 flex items-center justify-between gap-2">
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${serviceTypeBadgeClass(
                                                    service.service_type,
                                                )}`}
                                            >
                                                {service.service_type}
                                            </span>

                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${pricingTypeBadgeClass(
                                                    service.pricing_type,
                                                )}`}
                                            >
                                                {service.pricing_type}
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <h3 className="text-[20px] leading-tight font-bold text-slate-900">
                                                {service.name}
                                            </h3>

                                            <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-500">
                                                {service.description || 'No description available yet.'}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-blue-600">
                                                {service.base_price_label}
                                            </p>

                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                Inquire
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                        <Wrench className="h-6 w-6 text-slate-500" />
                                    </div>

                                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                                        No services found
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Add active services first so they can appear in your public store.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen bg-[#f6f8fb] py-12">
                    <div className="mx-auto max-w-7xl px-4 md:px-6">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                                Why Businesses Choose JCM
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                Modern systems built for real business needs
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
                                We help businesses move from manual processes to smarter digital
                                solutions with systems that are practical, scalable, and ready for
                                daily operations.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {[
                                {
                                    title: 'Simple and Clear Pricing',
                                    desc: 'Choose from ready-made products or request custom-built systems based on your business needs and budget.',
                                },
                                {
                                    title: 'Built for Actual Operations',
                                    desc: 'Our systems are designed to support real workflows such as bookings, orders, records, payments, and daily business management.',
                                },
                                {
                                    title: 'Reliable Support and Setup',
                                    desc: 'From onboarding to system setup and after-sales support, we help you start smoothly and use your system with confidence.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="mb-4 h-1.5 w-12 rounded-full bg-slate-900" />

                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen overflow-x-hidden border-t border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-sm uppercase tracking-[0.18em] text-slate-300">
                                    Start Your Digital System
                                </p>

                                <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                                    Upgrade your business with a modern system today
                                </h2>

                                <p className="mt-2 text-sm leading-7 text-slate-300">
                                    Choose from ready-made products or request a custom-built
                                    system tailored to your business needs. Simple, scalable, and
                                    built for real operations.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
                            >
                                Get Started Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-white/10" />

                    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:px-8 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                JCM Web Solution
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                We provide modern web systems solutions designed to help businesses
                                go digital, automate processes, and scale efficiently.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                Payment Methods
                            </h3>

                            <ul className="mt-3 space-y-2 text-sm text-slate-400">
                                <li>GCash</li>
                                <li>Maya</li>
                                <li>Bank Transfer (Coming Soon)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                Customer Support
                            </h3>

                            <ul className="mt-3 space-y-2 text-sm text-slate-400">
                                <li>System Setup Assistance</li>
                                <li>Technical Support</li>
                                <li>After-Sales Support</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                                Contact & Social
                            </h3>

                            <ul className="mt-3 space-y-2 text-sm text-slate-400">
                                <li>Facebook Page</li>
                                <li>Instagram</li>
                                <li>Email: jcmwebsolution@gmail.com</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10">
                        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-8">
                            <p>© {new Date().getFullYear()} JCM Web Solution. All rights reserved.</p>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}