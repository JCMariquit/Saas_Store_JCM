import { Link, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import type { SharedData } from '@/types';

export default function Navbar() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm">
                            J
                        </div>

                        <div className="leading-tight">
                            <h1 className="text-base font-bold text-slate-900">
                                JCM Web Solution
                            </h1>
                            <p className="text-xs text-slate-500">
                                Web, system, and digital solutions
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-2 md:flex">
                        <a
                            href="#products-section"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            Products
                        </a>

                        <a
                            href="#services-section"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            Services
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/login"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </Link>

                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}