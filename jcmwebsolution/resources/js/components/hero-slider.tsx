import { useEffect, useState } from 'react';

const slides = [
    {
        title: 'Online Shop Ready',
        subtitle: 'Professional storefront layout for products and services.',
        badge: 'Storefront',
    },
    {
        title: 'System Solutions',
        subtitle: 'Built for real business workflows with practical admin tools.',
        badge: 'Business System',
    },
    {
        title: 'Custom Web Projects',
        subtitle: 'Clean UI and scalable structure tailored to your brand.',
        badge: 'Custom Build',
    },
];

export default function HeroSlider() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % slides.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const activeSlide = slides[activeIndex];

    const goToPrev = () => {
        setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
    };

    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(58,95,145,0.08)]">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goToPrev}
                        aria-label="Previous slide"
                        title="Previous slide"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <span aria-hidden="true">←</span>
                    </button>

                    <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Next slide"
                        title="Next slide"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>

            <div className="rounded-[24px] border border-sky-100 bg-[#f8fbff] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                            {activeSlide.badge}
                        </span>

                        <h3 className="mt-3 text-2xl font-extrabold text-slate-900">
                            {activeSlide.title}
                        </h3>

                        <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                            {activeSlide.subtitle}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-right shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                            Starting at
                        </p>
                        <p className="mt-1 text-lg font-bold text-blue-600">₱15,000+</p>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <div className="h-3 w-[76%] rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
                    <div className="h-3 w-[88%] rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
                    <div className="h-3 w-[64%] rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-[20px] border border-sky-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 h-20 rounded-[18px] bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100" />
                        <h4 className="text-xl font-bold text-slate-900">Web</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Professional website solutions
                        </p>
                    </div>

                    <div className="rounded-[20px] border border-sky-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 h-20 rounded-[18px] bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100" />
                        <h4 className="text-xl font-bold text-slate-900">System</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Custom business workflows
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {slides.map((slide, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                                title={`Go to slide ${index + 1}`}
                                className={`rounded-full transition-all ${
                                    activeIndex === index
                                        ? 'h-2.5 w-9 bg-blue-600'
                                        : 'h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400'
                                }`}
                            >
                                <span className="sr-only">
                                    Go to slide {index + 1}: {slide.title}
                                </span>
                            </button>
                        ))}
                    </div>

                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                    </p>
                </div>
            </div>
        </div>
    );
}