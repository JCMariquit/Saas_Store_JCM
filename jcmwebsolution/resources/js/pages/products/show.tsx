import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Boxes,
    CheckCircle2,
    ClipboardList,
    ImageIcon,
    ScrollText,
    ShoppingCart,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type PlanItem = {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    price_label: string;
    billing_cycle: string | null;
    status: string;
    features: string[];
};

type ProductImageItem = {
    id: number;
    image_path: string | null;
    image_url: string | null;
    alt_text: string | null;
    sort_order: number;
};

type ProductFeatureItem = {
    id: number;
    title: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
};

type ProductOverviewItem = {
    id: number;
    title: string;
    content: string;
    sort_order: number;
};

type ProductDetail = {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    thumbnail: string | null;
    thumbnail_url: string | null;
    pricing_type: string;
    pricing_type_label: string;
    status: string;
    status_label: string;
    starting_price: number | null;
    starting_price_label: string;
    images: ProductImageItem[];
    features: ProductFeatureItem[];
    overviews: ProductOverviewItem[];
    plans: PlanItem[];
};

type PageProps = {
    product: ProductDetail;
};

export default function Show({ product }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Store',
            href: '/dashboard',
        },
        {
            title: product.name,
            href: `/products/${product.id}`,
        },
    ];

    const galleryImages = useMemo(() => {
        const images = product.images?.filter((item) => item.image_url) ?? [];

        if (images.length > 0) {
            return images;
        }

        if (product.thumbnail_url) {
            return [
                {
                    id: 0,
                    image_path: product.thumbnail,
                    image_url: product.thumbnail_url,
                    alt_text: product.name,
                    sort_order: 0,
                },
            ];
        }

        return [];
    }, [product.images, product.thumbnail, product.thumbnail_url, product.name]);

    const [activeIndex, setActiveIndex] = useState(0);

    const safeActiveIndex = activeIndex >= galleryImages.length ? 0 : activeIndex;

    const activeImage =
        galleryImages[safeActiveIndex]?.image_url ?? product.thumbnail_url ?? null;

    const showPrevImage = () => {
        if (galleryImages.length <= 1) return;
        setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const showNextImage = () => {
        if (galleryImages.length <= 1) return;
        setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

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

    const planStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-green-200 bg-green-100 text-green-700';
            case 'inactive':
                return 'border-red-200 bg-red-100 text-red-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth>
            <Head title={product.name} />

            <div className="min-h-screen bg-[#f6f8fb] pb-10">
                <section className="relative mb-10 left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen overflow-x-hidden border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white">
                    <div className="mx-auto max-w-7xl px-2 py-4 md:px-3 md:py-5">
                        <div className="mt-6 mb-0 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
                            <div className="pt-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Product Details
                                </div>

                                <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
                                    {product.name}
                                </h1>

                                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                                    {product.description || 'No description available yet for this product.'}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${pricingTypeBadgeClass(
                                            product.pricing_type,
                                        )}`}
                                    >
                                        {product.pricing_type_label}
                                    </span>

                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusBadgeClass(
                                            product.status,
                                        )}`}
                                    >
                                        {product.status_label}
                                    </span>

                                    {product.code && (
                                        <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                                            Code: {product.code}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-6 flex flex-wrap items-center gap-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                            Starting Price
                                        </p>
                                        <p className="mt-1 text-3xl font-extrabold text-white">
                                            {product.starting_price_label}
                                        </p>
                                    </div>

                                    <div className="hidden h-10 w-px bg-white/10 md:block" />

                                    <div className="space-y-1 text-sm text-slate-300">
                                        <p>✔ Professional product presentation</p>
                                        <p>✔ Structured images, features, and overview content</p>
                                        <p>✔ Ready for SaaS-style ordering flow</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {product.plans.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const el = document.getElementById('plans-section');
                                                el?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
                                        >
                                            View Plans
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const el = document.getElementById('order-section');
                                            el?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                                    >
                                        Order Now
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm">
                                <div className="mt-4">
                                    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
                                        {activeImage ? (
                                            <img
                                                src={activeImage}
                                                alt={galleryImages[safeActiveIndex]?.alt_text || product.name}
                                                className="h-[360px] w-full object-cover md:h-[420px]"
                                            />
                                        ) : (
                                            <div className="flex h-[360px] items-center justify-center bg-gradient-to-br from-sky-500/20 via-blue-400/10 to-indigo-500/20 md:h-[420px]">
                                                <div className="text-center text-slate-300">
                                                    <ImageIcon className="mx-auto h-10 w-10 opacity-80" />
                                                    <p className="mt-3 text-sm">No product image available</p>
                                                </div>
                                            </div>
                                        )}

                                        {galleryImages.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={showPrevImage}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/70 p-2 text-white backdrop-blur transition hover:bg-slate-800"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={showNextImage}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/70 p-2 text-white backdrop-blur transition hover:bg-slate-800"
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
                                                        className={`shrink-0 overflow-hidden rounded-xl border transition ${
                                                            isActive
                                                                ? 'border-white ring-2 ring-white/25'
                                                                : 'border-white/10 opacity-75 hover:opacity-100'
                                                        }`}
                                                    >
                                                        <img
                                                            src={image.image_url ?? ''}
                                                            alt={image.alt_text || product.name}
                                                            className="h-12 w-12 object-cover md:h-14 md:w-14"
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
                    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-6">
                            {product.plans.length > 0 && (
                                <section
                                    id="plans-section"
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                                                Plans
                                            </p>
                                            <h2 className="mt-1 text-lg font-bold text-slate-900">
                                                Available pricing plans
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Choose a package before placing an order.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {product.plans.map((plan) => (
                                            <div
                                                key={plan.id}
                                                className="rounded-2xl border border-slate-200 bg-[#fdfefe] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-base font-bold text-slate-900">
                                                            {plan.name}
                                                        </h3>
                                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                                            {plan.description || 'No plan description yet.'}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${planStatusBadgeClass(
                                                            plan.status,
                                                        )}`}
                                                    >
                                                        {plan.status}
                                                    </span>
                                                </div>

                                                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                                                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                                        Price
                                                    </p>
                                                    <p className="mt-1 text-xl font-extrabold text-blue-600">
                                                        {plan.price_label}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {plan.billing_cycle || 'One-time / custom cycle'}
                                                    </p>
                                                </div>

                                                {plan.features.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {plan.features.slice(0, 4).map((feature, index) => (
                                                            <div
                                                                key={`${plan.id}-feature-${index}`}
                                                                className="flex items-start gap-2 text-sm text-slate-600"
                                                            >
                                                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                                                <span>{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.get(
                                                            `/orders/create?product_id=${product.id}&plan_id=${plan.id}`,
                                                        )
                                                    }
                                                    className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                >
                                                    Choose Plan
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-slate-900 p-2.5 text-white">
                                        <Boxes className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            About this product
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Quick overview and what clients can expect.
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-5 text-sm leading-7 text-slate-600 md:text-[15px]">
                                    {product.description ||
                                        'This product is designed to help businesses digitize operations with a practical and scalable web-based solution.'}
                                </p>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-blue-600 p-2.5 text-white">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Product features
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Main inclusions and highlights of this system.
                                        </p>
                                    </div>
                                </div>

                                {product.features.length > 0 ? (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {product.features.map((feature) => (
                                            <div
                                                key={feature.id}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
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
                                ) : (
                                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                                        No features added yet.
                                    </div>
                                )}
                            </section>

                            {product.overviews.length > 0 && (
                                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-indigo-600 p-2.5 text-white">
                                            <ScrollText className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Detailed overview
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Structured sections that explain the product in more detail.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-6">
                                        {product.overviews.map((overview) => (
                                            <div
                                                key={overview.id}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
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
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                                    Order Summary
                                </p>

                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {product.name}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Start with this product and connect it later to your real checkout or order
                                    form flow.
                                </p>

                                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                        Starting Price
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-blue-600">
                                        {product.starting_price_label}
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => router.get(`/orders/create?product_id=${product.id}`)}
                                        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Order Now
                                    </button>

                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Inquire First
                                    </button>
                                </div>

                                <div className="mt-5 space-y-2 text-sm text-slate-500">
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>Manual payment verification can be added next.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>Plan selection can feed directly into the order form.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>Good base for GCash / Maya reference flow later.</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                                Next Step
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                Connect this page to real ordering and payment flow
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
                                After this, the next best step is creating the order form page where the
                                selected product and selected plan are automatically passed into the order.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}