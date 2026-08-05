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

type AddToCartModalProps = {
    open: boolean;
    product: ProductDetail;
    selectedPlanId: number | null;
    notes: string;
    isSubmitting: boolean;
    onSelectPlan: (planId: number | null) => void;
    onChangeNotes: (notes: string) => void;
    onClose: () => void;
    onSubmit: () => void;
};

const cardClass = 'rounded-[10px] border border-border bg-card p-6 shadow-sm';

const fallbackProductDescription =
    'A practical and scalable digital solution designed to help your business work faster, stay organized, and serve customers better.';

const fallbackAboutDescription =
    'This solution helps your business move from manual processes to a more organized, secure, and professional digital system. It is built to improve workflow, reduce repetitive tasks, and make business management easier.';

function PlanDetailsModal({ open, plan, productId, onClose }: PlanDetailsModalProps) {
    if (!open || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 py-14 backdrop-blur-md md:items-center md:py-6">
            <div className="border-border bg-card relative w-full max-w-2xl overflow-hidden rounded-[14px] border shadow-2xl">
                <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
                <div className="absolute top-24 left-0 h-36 w-36 rounded-full bg-blue-500/15 blur-3xl" />

                <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 px-7 py-6 text-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.14em] text-sky-50 uppercase backdrop-blur">
                        <Crown className="h-4 w-4 text-yellow-300" />
                        Selected Package
                    </div>

                    <h2 className="mt-4 pr-10 text-3xl leading-tight font-black">{plan.name}</h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100">
                        {plan.description || 'A flexible package designed to help you start, improve, or scale your digital business system.'}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[10px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-sky-100 uppercase">
                                <WalletCards className="h-4 w-4" />
                                Package Price
                            </p>
                            <p className="mt-2 text-3xl font-black text-white">{plan.price_label}</p>
                        </div>

                        <div className="rounded-[10px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-sky-100 uppercase">
                                <Zap className="h-4 w-4" />
                                Payment Type
                            </p>
                            <p className="mt-2 text-lg font-black text-white capitalize">{plan.billing_cycle || 'One-time / custom setup'}</p>
                        </div>
                    </div>
                </div>

                <div className="relative px-7 py-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-[10px] bg-emerald-100 p-2.5 text-emerald-300">
                            <PackageCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="text-foreground text-base font-bold">What you’ll get</h3>
                            <p className="text-muted-foreground text-sm">Main inclusions prepared for this package.</p>
                        </div>
                    </div>

                    {plan.features.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {plan.features.map((feature, index) => (
                                <div
                                    key={`${plan.id}-modal-feature-${index}`}
                                    className="border-border bg-muted/30 text-foreground flex items-start gap-3 rounded-[10px] border p-3 text-sm"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-border bg-muted/30 text-muted-foreground rounded-[10px] border border-dashed p-5 text-sm">
                            Package inclusions will be finalized based on your business requirements.
                        </div>
                    )}

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-[10px] px-5">
                            Review More
                        </Button>

                        <Button
                            type="button"
                            onClick={() => router.get(`/orders/create?product_id=${productId}&plan_id=${plan.id}`)}
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

function AddToCartModal({ open, product, selectedPlanId, notes, isSubmitting, onSelectPlan, onChangeNotes, onClose, onSubmit }: AddToCartModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md">
            <div className="border-border bg-card relative w-full max-w-2xl overflow-hidden rounded-[14px] border shadow-2xl">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl" />
                <div className="absolute -bottom-10 left-0 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />

                <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 px-7 py-6 text-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.14em] text-sky-50 uppercase backdrop-blur">
                        <ShoppingCart className="h-4 w-4 text-sky-300" />
                        Add to Cart
                    </div>

                    <h2 className="mt-4 pr-10 text-2xl leading-tight font-black md:text-3xl">Choose package for {product.name}</h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100">
                        Select the package you want to add to your cart. You can also add notes for your preferred setup or requirements.
                    </p>
                </div>

                <div className="relative max-h-[70vh] overflow-y-auto px-7 py-6">
                    <div>
                        <label className="text-foreground text-sm font-bold">Select Plan</label>

                        <div className="mt-3 space-y-3">
                            {product.plans.length > 0 ? (
                                product.plans.map((plan) => {
                                    const isSelected = selectedPlanId === plan.id;

                                    return (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => onSelectPlan(plan.id)}
                                            className={`w-full rounded-[12px] border p-4 text-left transition ${
                                                isSelected
                                                    ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-100'
                                                    : 'border-border bg-card hover:border-primary/25 hover:bg-muted/30'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                                                isSelected ? 'border-sky-600 bg-sky-600' : 'border-border bg-card'
                                                            }`}
                                                        >
                                                            {isSelected && <span className="bg-card h-1.5 w-1.5 rounded-full" />}
                                                        </span>

                                                        <p className="text-foreground font-black">{plan.name}</p>
                                                    </div>

                                                    <p className="text-muted-foreground mt-1 pl-6 text-xs">
                                                        {plan.billing_cycle || 'Flexible project setup'}
                                                    </p>
                                                </div>

                                                <p className="text-primary shrink-0 text-sm font-black">{plan.price_label}</p>
                                            </div>

                                            {plan.description && (
                                                <p className="text-muted-foreground mt-3 pl-6 text-sm leading-6">{plan.description}</p>
                                            )}

                                            {plan.features.length > 0 && (
                                                <div className="mt-3 grid gap-2 pl-6 sm:grid-cols-2">
                                                    {plan.features.slice(0, 4).map((feature, index) => (
                                                        <div
                                                            key={`${plan.id}-cart-feature-${index}`}
                                                            className="text-muted-foreground flex items-start gap-2 text-xs"
                                                        >
                                                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onSelectPlan(null)}
                                    className="border-border bg-muted/30 w-full rounded-[12px] border p-4 text-left"
                                >
                                    <p className="text-foreground font-bold">Custom Request</p>
                                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                                        No fixed package available. This product will be added as a custom request.
                                    </p>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="text-foreground text-sm font-bold">Notes / Requirements</label>

                        <textarea
                            value={notes}
                            onChange={(event) => onChangeNotes(event.target.value)}
                            rows={4}
                            placeholder="Optional: Add preferred setup, target features, business requirements, or special instructions..."
                            className="border-border text-foreground placeholder:text-muted-foreground mt-2 w-full rounded-[10px] border px-4 py-3 text-sm transition outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                    </div>

                    <div className="border-primary/15 from-primary/[0.055] via-card to-card mt-6 rounded-[10px] border bg-gradient-to-br p-4">
                        <p className="text-primary text-xs font-bold tracking-wide uppercase">Cart Summary</p>
                        <p className="text-foreground mt-1 text-sm font-semibold">{product.name}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Your selected product and plan will be saved to your cart for review before checkout or project request.
                        </p>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-[10px]">
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            disabled={isSubmitting || (product.plans.length > 0 && !selectedPlanId)}
                            onClick={onSubmit}
                            className="rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:from-sky-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Adding...' : 'Confirm Add to Cart'}
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
    const [cartModalOpen, setCartModalOpen] = useState(false);
    const [cartPlanId, setCartPlanId] = useState<number | null>(product.plans?.[0]?.id ?? null);
    const [cartNotes, setCartNotes] = useState('');
    const [isAddingCart, setIsAddingCart] = useState(false);
    const [cartSuccessOpen, setCartSuccessOpen] = useState(false);

    const safeActiveIndex = activeIndex >= galleryImages.length ? 0 : activeIndex;
    const activeImage = galleryImages[safeActiveIndex]?.image_url ?? product.thumbnail_url ?? null;

    const openCartModal = () => {
        setCartPlanId(product.plans?.[0]?.id ?? null);
        setCartModalOpen(true);
    };

    const submitAddToCart = () => {
        setIsAddingCart(true);

        router.post(
            '/cart',
            {
                product_id: product.id,
                plan_id: cartPlanId,
                notes: cartNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCartModalOpen(false);
                    setCartNotes('');
                    setCartSuccessOpen(true);

                    setTimeout(() => {
                        setCartSuccessOpen(false);
                    }, 3000);
                },
                onFinish: () => setIsAddingCart(false),
            },
        );
    };

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
                return 'border-emerald-500/20 bg-emerald-100 text-emerald-300';
            case 'inactive':
                return 'border-red-500/20 bg-red-500/10 text-red-300';
            default:
                return 'border-border bg-muted text-foreground';
        }
    };

    const bestPlanId = product.plans?.[1]?.id ?? product.plans?.[0]?.id ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth>
            <Head title={product.name} />

            <div className="text-foreground min-h-screen bg-[#e8edf5] pb-10">
                <section
                    className="border-border relative right-1/2 left-1/2 mr-[-50vw] mb-8 ml-[-50vw] w-screen overflow-x-hidden border-b text-white"
                    style={{
                        backgroundImage: "url('/images/item-bg.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/78 to-sky-900/82" />
                    <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-7 md:py-10">
                        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
                            <div>
                                <div className="text-muted-foreground/20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase backdrop-blur">
                                    <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                                    Featured Solution
                                </div>

                                <h1 className="mt-5 max-w-3xl text-3xl leading-tight font-black md:text-4xl xl:text-5xl">{product.name}</h1>

                                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                                    {product.description || fallbackProductDescription}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <span className="text-primary inline-flex rounded-full border border-sky-200 bg-sky-100 px-3 py-1.5 text-xs font-semibold">
                                        {product.pricing_type === 'plan'
                                            ? 'Package-Based Solution'
                                            : product.pricing_type === 'custom'
                                              ? 'Custom Business Solution'
                                              : 'Fixed Project Pricing'}
                                    </span>

                                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                                        {product.plans.length > 0 ? 'Flexible Service Packages' : 'Custom Project Request'}
                                    </span>
                                </div>

                                <div className="mt-6">
                                    <p className="text-xs tracking-[0.18em] text-slate-300 uppercase">Starts at</p>
                                    <p className="mt-1 text-3xl font-extrabold text-white">{product.starting_price_label}</p>
                                    <p className="mt-2 max-w-md text-sm text-slate-300">
                                        Final pricing may depend on features, scope, setup, and support needs.
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {product.plans.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
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
                                            <ImageIcon className="text-muted-foreground h-10 w-10" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />

                                    {galleryImages.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={showPrevImage}
                                                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white transition hover:bg-slate-900"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={showNextImage}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white transition hover:bg-slate-900"
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
                                    className="border-border bg-card/70 overflow-hidden rounded-[10px] border shadow-sm backdrop-blur-md"
                                >
                                    <div className="flex flex-col gap-4 rounded-t-[10px] bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 p-6 text-white md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-sky-100 uppercase">
                                                <Star className="h-4 w-4 text-yellow-300" />
                                                Service Packages
                                            </p>

                                            <h2 className="mt-3 text-2xl font-black">Choose the right package for your business</h2>

                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100">
                                                Select a package that matches your goals, budget, and business requirements. Each package can be
                                                adjusted depending on the features you need.
                                            </p>
                                        </div>

                                        <div className="rounded-[10px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                                            <ShieldCheck className="h-7 w-7 text-emerald-300" />
                                            <p className="mt-2 text-sm font-bold">Reliable Setup</p>
                                            <p className="text-xs text-sky-100">Built for real business use</p>
                                        </div>
                                    </div>

                                    <div className="bg-background/35 grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                                        {product.plans.map((plan) => {
                                            const isBestPlan = plan.id === bestPlanId;

                                            return (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlan(plan)}
                                                    className={`group bg-card relative cursor-pointer overflow-hidden rounded-[14px] border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100 ${
                                                        isBestPlan ? 'border-sky-300 ring-2 ring-sky-100' : 'border-border'
                                                    }`}
                                                >
                                                    <div className="from-primary/10 via-card absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition group-hover:opacity-100" />
                                                    <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-sky-200/50 blur-2xl transition group-hover:bg-sky-300/60" />
                                                    <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-blue-200/30 blur-2xl" />

                                                    {isBestPlan && (
                                                        <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 px-3 py-1 text-[10px] font-black tracking-wide text-white uppercase shadow-lg shadow-blue-500/20">
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
                                                                    <h3 className="text-foreground text-lg font-black">{plan.name}</h3>
                                                                    <p className="text-muted-foreground mt-1 text-xs">
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

                                                        <p className="text-muted-foreground mt-4 min-h-[42px] text-sm leading-6">
                                                            {plan.description ||
                                                                'A flexible package for businesses that need a professional digital system with practical features.'}
                                                        </p>

                                                        <div className="border-primary/15 from-primary/[0.055] via-card to-card mt-5 rounded-[10px] border bg-gradient-to-br p-4">
                                                            <p className="text-primary flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase">
                                                                <WalletCards className="h-4 w-4" />
                                                                Package Price
                                                            </p>

                                                            <p className="text-foreground mt-2 text-3xl font-black">{plan.price_label}</p>

                                                            <p className="text-muted-foreground mt-1 text-xs font-medium">
                                                                {plan.billing_cycle || 'One-time / custom setup'}
                                                            </p>
                                                        </div>

                                                        {plan.features.length > 0 && (
                                                            <div className="mt-5 space-y-2.5">
                                                                {plan.features.slice(0, 4).map((feature, index) => (
                                                                    <div
                                                                        key={`${plan.id}-feature-${index}`}
                                                                        className="text-muted-foreground flex items-start gap-2.5 text-sm"
                                                                    >
                                                                        <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-300">
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
                                        <h2 className="text-foreground text-xl font-bold">Why choose this solution?</h2>
                                        <p className="text-muted-foreground text-sm">Designed to support your daily business operations.</p>
                                    </div>
                                </div>

                                <p className="text-muted-foreground mt-5 text-sm leading-7 md:text-[15px]">
                                    {product.description || fallbackAboutDescription}
                                </p>
                            </section>

                            <section className={cardClass}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary rounded-[10px] p-2.5 text-white">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-foreground text-xl font-bold">What this system can do</h2>
                                        <p className="text-muted-foreground text-sm">Key features that help improve your business workflow.</p>
                                    </div>
                                </div>

                                {product.features.length > 0 ? (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {product.features.map((feature) => (
                                            <div
                                                key={feature.id}
                                                className="border-border bg-muted/30 hover:border-primary/25 rounded-[10px] border p-4 transition hover:bg-sky-50/40"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                                                    <div>
                                                        <p className="text-foreground text-sm font-semibold">{feature.title}</p>
                                                        {feature.description && (
                                                            <p className="text-muted-foreground mt-1 text-xs leading-6">{feature.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-border bg-muted/30 text-muted-foreground mt-5 rounded-[10px] border border-dashed p-5 text-sm">
                                        Features can be customized based on your business process and required workflow.
                                    </div>
                                )}
                            </section>

                            {product.overviews.length > 0 && (
                                <section className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary text-primary-foreground rounded-[10px] p-2.5">
                                            <ScrollText className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-foreground text-xl font-bold">Solution overview</h2>
                                            <p className="text-muted-foreground text-sm">
                                                More details about how this system can support your business.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        {product.overviews.map((overview) => (
                                            <div key={overview.id} className="border-border bg-muted/30 rounded-[10px] border p-5">
                                                <h3 className="text-foreground text-lg font-bold">{overview.title}</h3>
                                                <p className="text-muted-foreground mt-2 text-sm leading-7 whitespace-pre-line">{overview.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <aside id="order-section" className="lg:sticky lg:top-6 lg:self-start">
                            <div className="border-border bg-card rounded-[14px] border p-6 shadow-sm">
                                <p className="text-primary text-sm font-semibold tracking-[0.18em] uppercase">Ready to get started?</p>

                                <h3 className="text-foreground mt-2 text-2xl font-bold">{product.name}</h3>

                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                    Start your project request and let us prepare the right solution for your business.
                                </p>

                                <div className="border-primary/15 from-primary/[0.055] via-card to-card mt-5 rounded-[10px] border bg-gradient-to-br p-4">
                                    <p className="text-muted-foreground text-xs tracking-wide uppercase">Starts at</p>
                                    <p className="text-primary mt-1 text-2xl font-extrabold">{product.starting_price_label}</p>
                                    <p className="text-muted-foreground mt-2 text-xs leading-5">
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
                                        onClick={openCartModal}
                                        className="border-primary/20 bg-primary/[0.07] text-primary inline-flex w-full items-center justify-center rounded-[10px] border px-5 py-3 text-sm font-bold transition hover:bg-sky-100"
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Add to Cart
                                    </button>
                                </div>

                                <div className="text-muted-foreground mt-5 space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
                                        <span>Flexible payment process available.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
                                        <span>Project requirements can be reviewed before final pricing.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
                                        <span>Recommended for businesses ready to go digital.</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className={cardClass}>
                        <div className="max-w-3xl">
                            <p className="text-primary text-sm font-semibold tracking-[0.18em] uppercase">Need a custom system?</p>

                            <h2 className="text-foreground mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                                Let’s build the right digital solution for your business
                            </h2>

                            <p className="text-muted-foreground mt-3 text-sm leading-7 md:text-base">
                                Every business has different needs. Send your project request and we’ll review your requirements, features, and
                                preferred setup before finalizing the package.
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

            <PlanDetailsModal open={!!selectedPlan} plan={selectedPlan} productId={product.id} onClose={() => setSelectedPlan(null)} />

            <AddToCartModal
                open={cartModalOpen}
                product={product}
                selectedPlanId={cartPlanId}
                notes={cartNotes}
                isSubmitting={isAddingCart}
                onSelectPlan={setCartPlanId}
                onChangeNotes={setCartNotes}
                onClose={() => setCartModalOpen(false)}
                onSubmit={submitAddToCart}
            />

            {cartSuccessOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-sm rounded-[14px] border border-emerald-500/20 p-6 text-center shadow-2xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-300">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>

                        <h2 className="text-foreground mt-4 text-xl font-black">Added to Cart</h2>

                        <p className="text-muted-foreground mt-2 text-sm leading-6">Product has been added to your cart successfully.</p>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
