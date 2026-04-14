import { Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function Navbar() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-r from-sky-500/80 via-blue-600/80 to-blue-700/80 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold text-white shadow-md ring-1 ring-white/20 backdrop-blur">
                        J
                    </div>

                    <div>
                        <h1 className="text-base font-extrabold uppercase tracking-[0.18em] text-white">
                            JCM Web Solution
                        </h1>
                        <p className="text-xs text-blue-100/90">
                            Web, system, and digital product solutions
                        </p>
                    </div>
                </div>

                <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <a
                        href="#products"
                        className="rounded-xl px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                        Products
                    </a>

                    <a
                        href="#services"
                        className="rounded-xl px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                        Services
                    </a>

                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md transition hover:scale-[1.02] hover:bg-blue-50"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}