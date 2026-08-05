import AppearanceToggleDropdown from '@/components/appearance-dropdown';
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
        <header className="border-border/70 bg-background/90 sticky top-0 z-50 border-b shadow-sm backdrop-blur">
            {/* 🔥 reduced padding */}
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5">
                        {/* 🔥 reduced logo size */}
                        <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold shadow-sm">
                            J
                        </div>

                        <div className="leading-tight">
                            <h1 className="text-foreground text-sm font-bold">JCM Web Solution</h1>
                            <p className="text-muted-foreground text-[11px]">Digital products & services</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden lg:flex">
                        {/* 🔥 slightly tighter badge */}
                        <div className="border-primary/20 bg-primary/[0.07] text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
                            <Sparkles className="h-3 w-3" />
                            Ready for your business
                        </div>
                    </div>

                    <AppearanceToggleDropdown />

                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link
                                href="/login"
                                className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 text-sm font-semibold transition"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold transition"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="border-border text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-lg border transition md:hidden"
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-border bg-card border-t md:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
                        <button
                            type="button"
                            onClick={() => scrollToSection('products-section')}
                            className="text-foreground hover:bg-muted rounded-lg px-4 py-2.5 text-left text-sm font-medium transition"
                        >
                            Products
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('services-section')}
                            className="text-foreground hover:bg-muted rounded-lg px-4 py-2.5 text-left text-sm font-medium transition"
                        >
                            Services
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('why-choose-jcm')}
                            className="text-foreground hover:bg-muted rounded-lg px-4 py-2.5 text-left text-sm font-medium transition"
                        >
                            Why Choose Us
                        </button>

                        {!auth.user && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <Link
                                    href="/login"
                                    className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2 text-center text-sm font-semibold transition"
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
