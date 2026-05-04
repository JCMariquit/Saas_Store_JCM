import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Boxes,
    CheckCircle2,
    ClipboardList,
    MonitorSmartphone,
    ScrollText,
    Send,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ServiceFeatureItem = {
    id: number;
    title: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
};

type ServiceImageItem = {
    id: number;
    image_path: string | null;
    image_url: string | null;
    alt_text: string | null;
    sort_order: number;
};

type ServiceOverviewItem = {
    id: number;
    title: string;
    content: string;
    sort_order: number;
};

type ServiceDetail = {
    id: number;
    code: string | null;
    name: string;
    description: string | null;
    thumbnail: string | null;
    thumbnail_url: string | null;
    service_type: string;
    pricing_type: string;
    base_price: number | null;
    base_price_label: string;
    status: string;
    sort_order: number;
    features: ServiceFeatureItem[];
    images: ServiceImageItem[];
    overviews: ServiceOverviewItem[];
};

type PageProps = {
    service: ServiceDetail;
};

const cardClass = 'rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm';

export default function Show({ service }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Store',
            href: '/dashboard',
        },
        {
            title: service.name,
            href: `/services/${service.id}`,
        },
    ];

    const galleryImages = useMemo(() => {
        const images = service.images?.filter((item) => item.image_url) ?? [];

        if (images.length > 0) return images;

        if (service.thumbnail_url) {
            return [
                {
                    id: 0,
                    image_path: service.thumbnail,
                    image_url: service.thumbnail_url,
                    alt_text: service.name,
                    sort_order: 0,
                },
            ];
        }

        return [];
    }, [service.images, service.thumbnail, service.thumbnail_url, service.name]);

    const [activeIndex, setActiveIndex] = useState(0);

    const safeActiveIndex = activeIndex >= galleryImages.length ? 0 : activeIndex;
    const activeImage = galleryImages[safeActiveIndex]?.image_url ?? service.thumbnail_url ?? null;

    const requestService = () => {
        router.get(`/orders/create?service_id=${service.id}`);
    };

    const showPrevImage = () => {
        if (galleryImages.length <= 1) return;

        setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const showNextImage = () => {
        if (galleryImages.length <= 1) return;

        setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth>
            <Head title={service.name} />

            <div className="min-h-screen bg-[#e8edf5] pb-10 text-slate-900">
                <section
                    className="relative left-1/2 right-1/2 mb-8 ml-[-50vw] mr-[-50vw] w-screen overflow-x-hidden border-b border-slate-200 text-white"
                    style={{
                        backgroundImage: "url('/images/item-bg.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/78 to-sky-900/82" />
                    <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-7 md:py-10">
                        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100 backdrop-blur">
                                    <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                                    Custom Service
                                </div>

                                <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight md:text-4xl xl:text-5xl">
                                    {service.name}
                                </h1>

                                {service.description && (
                                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                                        {service.description}
                                    </p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <span className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-3 py-1.5 text-xs font-semibold capitalize text-sky-700">
                                        {service.service_type}
                                    </span>

                                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-700">
                                        {service.status}
                                    </span>

                                    {service.code && (
                                        <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                                            {service.code}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                                        Base Price
                                    </p>
                                    <p className="mt-1 text-3xl font-extrabold text-white">
                                        {service.base_price_label}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            document
                                                .getElementById('service-details')
                                                ?.scrollIntoView({ behavior: 'smooth' })
                                        }
                                        className="rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:scale-[1.03] hover:from-sky-700 hover:to-blue-800"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="relative overflow-hidden rounded-[14px] border border-white/15 bg-white/10 shadow-2xl shadow-slate-950/30 backdrop-blur">
                                    {activeImage ? (
                                        <img
                                            src={activeImage}
                                            alt={galleryImages[safeActiveIndex]?.alt_text || service.name}
                                            className="h-[260px] w-full object-cover md:h-[330px] lg:h-[360px]"
                                        />
                                    ) : (
                                        <div className="flex h-[260px] items-center justify-center bg-slate-800 md:h-[330px] lg:h-[360px]">
                                            <MonitorSmartphone className="h-10 w-10 text-slate-400" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />

                                    {galleryImages.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={showPrevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white transition hover:bg-slate-900"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={showNextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white transition hover:bg-slate-900"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {galleryImages.length > 1 && (
                                    <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto pb-1">
                                        {galleryImages.map((image, index) => {
                                            const isActive = index === safeActiveIndex;

                                            return (
                                                <button
                                                    key={image.id}
                                                    type="button"
                                                    onClick={() => setActiveIndex(index)}
                                                    className={`overflow-hidden rounded-[10px] border transition ${
                                                        isActive
                                                            ? 'border-white ring-2 ring-white/25'
                                                            : 'border-white/10 opacity-75 hover:opacity-100'
                                                    }`}
                                                >
                                                    <img
                                                        src={image.image_url ?? ''}
                                                        alt={image.alt_text || service.name}
                                                        className="h-12 w-16 object-cover md:h-14 md:w-20"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div id="service-details" className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
                    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-6">
                            {service.description && (
                                <section className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-[10px] bg-slate-900 p-2.5 text-white">
                                            <Boxes className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Why choose this service?
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                {service.name}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-sm leading-7 text-slate-600 md:text-[15px]">
                                        {service.description}
                                    </p>
                                </section>
                            )}

                            {service.features.length > 0 && (
                                <section className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-[10px] bg-blue-600 p-2.5 text-white">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                What this service includes
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Service details and included work.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {service.features.map((feature) => (
                                            <div
                                                key={feature.id}
                                                className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50/40"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {feature.title}
                                                        </p>

                                                        {feature.description && (
                                                            <p className="mt-1 text-xs leading-6 text-slate-500">
                                                                {feature.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {service.overviews.length > 0 && (
                                <section className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-[10px] bg-indigo-600 p-2.5 text-white">
                                            <ScrollText className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Service overview
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                More details about this service.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        {service.overviews.map((overview) => (
                                            <div
                                                key={overview.id}
                                                className="rounded-[10px] border border-slate-200 bg-slate-50 p-5"
                                            >
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {overview.title}
                                                </h3>

                                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                                                    {overview.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <aside id="order-section" className="lg:sticky lg:top-6 lg:self-start">
                            <div className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                                    Ready to get started?
                                </p>

                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {service.name}
                                </h3>

                                {service.description && (
                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                        {service.description}
                                    </p>
                                )}

                                <div className="mt-5 rounded-[10px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                        Base Price
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-blue-700">
                                        {service.base_price_label}
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Pricing may change depending on project scope and requirements.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <button
                                        type="button"
                                        onClick={requestService}
                                        className="inline-flex w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-sky-700 hover:to-blue-800"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Request Service
                                    </button>
                                </div>

                                <div className="mt-5 space-y-2 text-sm text-slate-500">
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span className="capitalize">{service.status}</span>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span className="capitalize">{service.service_type}</span>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span className="capitalize">{service.pricing_type}</span>
                                    </div>

                                    {service.code && (
                                        <div className="flex items-start gap-2">
                                            <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                            <span>{service.code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className={cardClass}>
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                                Need a custom service?
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                Let’s prepare the right service for your business
                            </h2>

                            {service.description && (
                                <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
                                    {service.description}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}