import { Link, usePage } from '@inertiajs/react';
import { Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { SharedData } from '@/types';

export default function Navbar() {
    const { auth } = usePage<SharedData>().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setMobileOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
            {/* 🔥 reduced padding */}
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5">
                        {/* 🔥 reduced logo size */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm">
                            J
                        </div>

                        <div className="leading-tight">
                            <h1 className="text-sm font-bold text-slate-900">
                                JCM Web Solution
                            </h1>
                            <p className="text-[11px] text-slate-500">
                                Digital products & services
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    
                    <div className="hidden lg:flex">
                        {/* 🔥 slightly tighter badge */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700">
                            <Sparkles className="h-3 w-3" />
                            Ready for your business
                        </div>
                    </div>

                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t border-slate-200 bg-white md:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
                        <button
                            type="button"
                            onClick={() => scrollToSection('products-section')}
                            className="rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                            Products
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('services-section')}
                            className="rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                            Services
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('why-choose-jcm')}
                            className="rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                            Why Choose Us
                        </button>

                        {!auth.user && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <Link
                                    href="/login"
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className="rounded-lg bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {auth.user && (
                            <Link
                                href="/dashboard"
                                className="mt-2 rounded-lg bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                                onClick={() => setMobileOpen(false)}
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}