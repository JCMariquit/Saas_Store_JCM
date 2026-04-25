import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Boxes,
    CheckCircle2,
    ClipboardList,
    Crown,
    ImageIcon,
    PackageCheck,
    Rocket,
    ScrollText,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Star,
    WalletCards,
    X,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
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

type PlanDetailsModalProps = {
    open: boolean;
    plan: PlanItem | null;
    productId: number;
    onClose: () => void;
};

const cardClass = 'rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm';

const fallbackProductDescription =
    'A practical and scalable digital solution designed to help your business work faster, stay organized, and serve customers better.';

const fallbackAboutDescription =
    'This solution helps your business move from manual processes to a more organized, secure, and professional digital system. It is built to improve workflow, reduce repetitive tasks, and make business management easier.';

function PlanDetailsModal({ open, plan, productId, onClose }: PlanDetailsModalProps) {
    if (!open || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-2xl">
                <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
                <div className="absolute left-0 top-24 h-36 w-36 rounded-full bg-blue-500/15 blur-3xl" />

                <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 px-7 py-6 text-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-50 backdrop-blur">
                        <Crown className="h-4 w-4 text-yellow-300" />
                        Selected Package
                    </div>

                    <h2 className="mt-4 pr-10 text-3xl font-black leading-tight">
                        {plan.name}
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100">
                        {plan.description ||
                            'A flexible package designed to help you start, improve, or scale your digital business system.'}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[10px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-100">
                                <WalletCards className="h-4 w-4" />
                                Package Price
                            </p>
                            <p className="mt-2 text-3xl font-black text-white">
                                {plan.price_label}
                            </p>
                        </div>

                        <div className="rounded-[10px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-100">
                                <Zap className="h-4 w-4" />
                                Payment Type
                            </p>
                            <p className="mt-2 text-lg font-black capitalize text-white">
                                {plan.billing_cycle || 'One-time / custom setup'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative px-7 py-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-[10px] bg-emerald-100 p-2.5 text-emerald-700">
                            <PackageCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                What you’ll get
                            </h3>
                            <p className="text-sm text-slate-500">
                                Main inclusions prepared for this package.
                            </p>
                        </div>
                    </div>

                    {plan.features.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {plan.features.map((feature, index) => (
                                <div
                                    key={`${plan.id}-modal-feature-${index}`}
                                    className="flex items-start gap-3 rounded-[10px] border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                            Package inclusions will be finalized based on your business requirements.
                        </div>
                    )}

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="rounded-[10px] px-5"
                        >
                            Review More
                        </Button>

                        <Button
                            type="button"
                            onClick={() =>
                                router.get(`/orders/create?product_id=${productId}&plan_id=${plan.id}`)
                            }
                            className="rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 px-5 text-white shadow-lg shadow-blue-500/20 hover:from-sky-700 hover:to-blue-800"
                        >
                            Start Project
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

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

        if (images.length > 0) return images;

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
    const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);

    const safeActiveIndex = activeIndex >= galleryImages.length ? 0 : activeIndex;
    const activeImage = galleryImages[safeActiveIndex]?.image_url ?? product.thumbnail_url ?? null;

    const showPrevImage = () => {
        if (galleryImages.length <= 1) return;
        setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const showNextImage = () => {
        if (galleryImages.length <= 1) return;
        setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const planStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-emerald-200 bg-emerald-100 text-emerald-700';
            case 'inactive':
                return 'border-red-200 bg-red-100 text-red-700';
            default:
                return 'border-slate-200 bg-slate-100 text-slate-700';
        }
    };

    const bestPlanId = product.plans?.[1]?.id ?? product.plans?.[0]?.id ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth>
            <Head title={product.name} />

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
                                    Featured Solution
                                </div>

                                <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight md:text-4xl xl:text-5xl">
                                    {product.name}
                                </h1>

                                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                                    {product.description || fallbackProductDescription}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <span className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700">
                                        {product.pricing_type === 'plan'
                                            ? 'Package-Based Solution'
                                            : product.pricing_type === 'custom'
                                              ? 'Custom Business Solution'
                                              : 'Fixed Project Pricing'}
                                    </span>

                                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        {product.plans.length > 0
                                            ? 'Flexible Service Packages'
                                            : 'Custom Project Request'}
                                    </span>
                                </div>

                                <div className="mt-6">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                                        Starts at
                                    </p>
                                    <p className="mt-1 text-3xl font-extrabold text-white">
                                        {product.starting_price_label}
                                    </p>
                                    <p className="mt-2 max-w-md text-sm text-slate-300">
                                        Final pricing may depend on features, scope, setup, and support needs.
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {product.plans.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                document
                                                    .getElementById('plans-section')
                                                    ?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:scale-[1.03] hover:from-sky-700 hover:to-blue-800"
                                        >
                                            View Packages
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => router.get(`/orders/create?product_id=${product.id}`)}
                                        className="rounded-[10px] border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                                    >
                                        Start Project
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="relative overflow-hidden rounded-[14px] border border-white/15 bg-white/10 shadow-2xl shadow-slate-950/30 backdrop-blur">
                                    {activeImage ? (
                                        <img
                                            src={activeImage}
                                            alt={galleryImages[safeActiveIndex]?.alt_text || product.name}
                                            className="h-[260px] w-full object-cover md:h-[330px] lg:h-[360px]"
                                        />
                                    ) : (
                                        <div className="flex h-[260px] items-center justify-center bg-slate-800 md:h-[330px] lg:h-[360px]">
                                            <ImageIcon className="h-10 w-10 text-slate-400" />
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
                                                        alt={image.alt_text || product.name}
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

                <div className="mx-auto max-w-7xl space-y-6 px-4 md:px-6">
                    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-6">
                            {product.plans.length > 0 && (
                                <section
                                    id="plans-section"
                                    className="overflow-hidden rounded-[10px] border border-slate-200 bg-white/70 shadow-sm backdrop-blur-md"
                                >
                                    <div className="flex flex-col gap-4 rounded-t-[10px] bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 p-6 text-white md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-100">
                                                <Star className="h-4 w-4 text-yellow-300" />
                                                Service Packages
                                            </p>

                                            <h2 className="mt-3 text-2xl font-black">
                                                Choose the right package for your business
                                            </h2>

                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100">
                                                Select a package that matches your goals, budget, and business requirements.
                                                Each package can be adjusted depending on the features you need.
                                            </p>
                                        </div>

                                        <div className="rounded-[10px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                                            <ShieldCheck className="h-7 w-7 text-emerald-300" />
                                            <p className="mt-2 text-sm font-bold">Reliable Setup</p>
                                            <p className="text-xs text-sky-100">Built for real business use</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 bg-white/35 p-5 md:grid-cols-2 xl:grid-cols-3">
                                        {product.plans.map((plan) => {
                                            const isBestPlan = plan.id === bestPlanId;

                                            return (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlan(plan)}
                                                    className={`group relative cursor-pointer overflow-hidden rounded-[14px] border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100 ${
                                                        isBestPlan
                                                            ? 'border-sky-300 ring-2 ring-sky-100'
                                                            : 'border-slate-200'
                                                    }`}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-100/60 via-white to-transparent opacity-0 transition group-hover:opacity-100" />
                                                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-sky-200/50 blur-2xl transition group-hover:bg-sky-300/60" />
                                                    <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-blue-200/30 blur-2xl" />

                                                    {isBestPlan && (
                                                        <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-blue-500/20">
                                                            Recommended
                                                        </div>
                                                    )}

                                                    <div className="relative">
                                                        <div className="mb-5 flex items-start justify-between gap-3 pr-24">
                                                            <div className="flex items-center gap-3">
                                                                <div className="rounded-[10px] bg-gradient-to-br from-sky-500 to-blue-700 p-3 text-white shadow-lg shadow-blue-500/20">
                                                                    <Rocket className="h-5 w-5" />
                                                                </div>

                                                                <div>
                                                                    <h3 className="text-lg font-black text-slate-900">
                                                                        {plan.name}
                                                                    </h3>
                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        {plan.billing_cycle || 'Flexible project setup'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${planStatusBadgeClass(
                                                                plan.status,
                                                            )}`}
                                                        >
                                                            {plan.status}
                                                        </span>

                                                        <p className="mt-4 min-h-[42px] text-sm leading-6 text-slate-500">
                                                            {plan.description ||
                                                                'A flexible package for businesses that need a professional digital system with practical features.'}
                                                        </p>

                                                        <div className="mt-5 rounded-[10px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
                                                            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                                                                <WalletCards className="h-4 w-4" />
                                                                Package Price
                                                            </p>

                                                            <p className="mt-2 text-3xl font-black text-slate-950">
                                                                {plan.price_label}
                                                            </p>

                                                            <p className="mt-1 text-xs font-medium text-slate-500">
                                                                {plan.billing_cycle || 'One-time / custom setup'}
                                                            </p>
                                                        </div>

                                                        {plan.features.length > 0 && (
                                                            <div className="mt-5 space-y-2.5">
                                                                {plan.features.slice(0, 4).map((feature, index) => (
                                                                    <div
                                                                        key={`${plan.id}-feature-${index}`}
                                                                        className="flex items-start gap-2.5 text-sm text-slate-600"
                                                                    >
                                                                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700">
                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        </div>
                                                                        <span>{feature}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <Button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setSelectedPlan(plan);
                                                            }}
                                                            className="mt-5 w-full rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 font-bold text-white shadow-lg shadow-blue-500/20 hover:from-sky-700 hover:to-blue-800"
                                                        >
                                                            View Package
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            <section className={cardClass}>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-[10px] bg-slate-900 p-2.5 text-white">
                                        <Boxes className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Why choose this solution?
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Designed to support your daily business operations.
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-5 text-sm leading-7 text-slate-600 md:text-[15px]">
                                    {product.description || fallbackAboutDescription}
                                </p>
                            </section>

                            <section className={cardClass}>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-[10px] bg-blue-600 p-2.5 text-white">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            What this system can do
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Key features that help improve your business workflow.
                                        </p>
                                    </div>
                                </div>

                                {product.features.length > 0 ? (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {product.features.map((feature) => (
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
                                ) : (
                                    <div className="mt-5 rounded-[10px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                                        Features can be customized based on your business process and required workflow.
                                    </div>
                                )}
                            </section>

                            {product.overviews.length > 0 && (
                                <section className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-[10px] bg-indigo-600 p-2.5 text-white">
                                            <ScrollText className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Solution overview
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                More details about how this system can support your business.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        {product.overviews.map((overview) => (
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
                                    {product.name}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Start your project request and let us prepare the right solution for your business.
                                </p>

                                <div className="mt-5 rounded-[10px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                        Starts at
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-blue-700">
                                        {product.starting_price_label}
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Pricing may change depending on features and project scope.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => router.get(`/orders/create?product_id=${product.id}`)}
                                        className="inline-flex w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-sky-700 hover:to-blue-800"
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Start Project
                                    </button>

                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center rounded-[10px] border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Ask First
                                    </button>
                                </div>

                                <div className="mt-5 space-y-2 text-sm text-slate-500">
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>Flexible payment process available.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>Project requirements can be reviewed before final pricing.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>Recommended for businesses ready to go digital.</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className={cardClass}>
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                                Need a custom system?
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                Let’s build the right digital solution for your business
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
                                Every business has different needs. Send your project request and we’ll review your
                                requirements, features, and preferred setup before finalizing the package.
                            </p>

                            <div className="mt-5">
                                <button
                                    type="button"
                                    onClick={() => router.get(`/orders/create?product_id=${product.id}`)}
                                    className="rounded-[10px] bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800"
                                >
                                    Request a Custom Solution
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <PlanDetailsModal
                open={!!selectedPlan}
                plan={selectedPlan}
                productId={product.id}
                onClose={() => setSelectedPlan(null)}
            />
        </AppLayout>
    );
}