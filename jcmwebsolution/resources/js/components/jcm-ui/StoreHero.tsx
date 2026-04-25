import { Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type StoreHeroProps = {
    banners: string[];
};

export default function StoreHero({ banners }: StoreHeroProps) {
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

                <div className="relative h-[240px] overflow-hidden rounded-xl shadow-xl shadow-slate-950/20 lg:mr-0 lg:h-[360px] lg:min-h-0 lg:rounded-xl">
                    <div
                        className="flex h-full transition-transform duration-700 ease-in-out"
                        style={{
                            transform: `translateX(-${currentBanner * 100}%)`,
                        }}
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

                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 via-transparent to-transparent" />

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
                                    aria-label={`Show banner ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}