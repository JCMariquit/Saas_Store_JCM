import { Head, Link, usePage } from '@inertiajs/react';

import HeroSlider from '@/components/hero-slider';
import Navbar from '@/components/navbar';
import ProductCardSkeleton from '@/components/product-card-skeleton';
import SectionTitle from '@/components/section-title';

type ProductItem = {
    id: number;
    name: string;
    description: string | null;
    pricing_type: string;
    status: string;
    starting_price: number | null;
    starting_price_label: string;
};

type PageProps = {
    products: ProductItem[];
};

export default function Welcome() {
    const { props } = usePage<PageProps>();
    const { products } = props;

    return (
        <>
            <Head title="JCM Web Solution" />

            <div className="min-h-screen bg-[#eef4fb] text-slate-900">
                <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,_#edf5fc,_#f6f9fd)]" />

                <Navbar />

                <main>
                    <section className="relative min-h-[520px] overflow-hidden">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: "url('/images/hero-bg.png')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />

                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />

                        <div className="relative z-10 grid w-full grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-12">
                            <div className="mx-auto w-full max-w-3xl space-y-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                                    JCM Web Solution
                                </div>

                                <div className="space-y-4">
                                    <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
                                        Build your next{' '}
                                        <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                                            digital solution
                                        </span>{' '}
                                        with a modern online store feel.
                                    </h1>

                                    <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                                        Explore custom systems, websites, booking platforms,
                                        and business tools designed for real-world use.
                                        This public page is your storefront for services,
                                        systems, and ready-to-launch digital products.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <span className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                                        Online shop style
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                                        Custom web &amp; system development
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-1">
                                    <a
                                        href="#products"
                                        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
                                    >
                                        Browse Products
                                    </a>

                                    <a
                                        href="#services"
                                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    >
                                        View Services
                                    </a>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-slate-500">
                                    <span>✔ Custom-built systems</span>
                                    <span>✔ Responsive design</span>
                                    <span>✔ Built for real businesses</span>
                                </div>
                            </div>

                            <div className="mx-auto w-full max-w-2xl">
                                <HeroSlider />
                            </div>

                            <br />
                        </div>
                    </section>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <section id="products" className="mt-14">
                            <SectionTitle
                                badge="Shop Preview"
                                title="Featured products"
                                subtitle="Available products are now loaded from your database."
                            />

                            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <ProductCardSkeleton
                                            key={product.id}
                                            title={product.name}
                                            description={
                                                product.description || 'No description available yet.'
                                            }
                                            price={product.starting_price_label}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full rounded-[28px] border border-white/70 bg-white p-8 text-center shadow-[0_18px_50px_rgba(58,95,145,0.10)]">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            No active products found
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Add active products from the admin side first.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section id="services" className="mt-16">
                            <SectionTitle
                                badge="What We Offer"
                                title="Services"
                                subtitle="Professional solutions for businesses."
                            />

                            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                                {[
                                    'Website Development',
                                    'System Development',
                                    'Booking Platforms',
                                    'Business Automation',
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(58,95,145,0.10)]"
                                    >
                                        <div className="mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100" />
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {item}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Clean UI and scalable system for real use.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="mt-16 overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
                                    Ready to start?
                                </p>
                                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                                    Launch your system with JCM
                                </h2>
                                <p className="mt-3 text-blue-50">
                                    Start simple, scale into a full online shop, booking
                                    system, or business platform later.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/login"
                                    className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-md"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}