import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const adminPasscode = useMemo(() => '#jcm*!admin2026@', []);
    const [showAccessModal, setShowAccessModal] = useState(true);
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');

    const handleAccess = (e: React.FormEvent) => {
        e.preventDefault();

        if (passcode === adminPasscode) {
            setError('');
            setShowAccessModal(false);
            return;
        }

        setError('Invalid admin access code.');
    };

    return (
        <>
            <Head title="JCM Web Solution | Admin" />

            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(125,211,252,0.20),transparent_28%),linear-gradient(135deg,#e0f2fe,#f8fbff,#dbeafe)] text-slate-900">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]" />

                <div className="pointer-events-none absolute -left-20 -top-16 h-[280px] w-[280px] rounded-full bg-sky-500/25 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-[320px] w-[320px] rounded-full bg-blue-500/20 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite_1.8s]" />
                <div className="pointer-events-none absolute right-[12%] top-[20%] h-[220px] w-[220px] rounded-full bg-sky-300/25 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite_3.2s]" />

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
                    <main className="w-full max-w-7xl">
                        <section className="grid gap-6 rounded-[30px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-[20px] md:grid-cols-[1.1fr_0.9fr] md:p-8 lg:p-9">
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/15 bg-white/75 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 shadow-[0_8px_24px_rgba(14,165,233,0.08)] sm:text-[13px]">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 shadow-[0_0_0_6px_rgba(14,165,233,0.12)]" />
                                    JCM Web Solution
                                </div>

                                <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-[54px] lg:leading-[1.04]">
                                    Internal admin
                                    <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                                        {' '}control panel
                                    </span>
                                </h1>

                                <p className="mt-4 max-w-[580px] text-base leading-7 text-slate-500 sm:text-lg">
                                    Centralized access for JCM Web Solution internal management,
                                    systems control, client operations, and product administration.
                                </p>

                                <div className="mt-7 flex flex-wrap gap-3">
                                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700">
                                        <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                                        Private admin environment
                                    </div>

                                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700">
                                        Client, orders, and product management
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {auth.user ? (
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex min-w-[170px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="inline-flex min-w-[170px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5"
                                        >
                                            Login
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-4 text-sm text-slate-500">
                                    Authorized access only.
                                </div>
                            </div>

                            <div className="relative flex items-stretch">
                                <div className="flex w-full flex-col justify-between rounded-[24px] border border-white/60 bg-gradient-to-b from-white/80 to-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className="h-[11px] w-[11px] rounded-full bg-red-400" />
                                        <span className="h-[11px] w-[11px] rounded-full bg-amber-400" />
                                        <span className="h-[11px] w-[11px] rounded-full bg-emerald-400" />
                                    </div>

                                    <div className="flex min-h-[290px] flex-col gap-4 rounded-[20px] border border-blue-200/80 bg-gradient-to-br from-blue-50 to-white p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-bold text-slate-900">
                                                Admin Overview
                                            </div>
                                            <div className="rounded-full bg-sky-500/10 px-3 py-2 text-[12px] font-bold text-sky-700">
                                                Internal
                                            </div>
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="relative h-[14px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[62%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                            <div className="relative h-[14px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[80%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                            <div className="relative h-[14px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[48%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[18px] border border-blue-200/70 bg-white/80 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                                <strong className="block text-[22px] text-slate-900">Clients</strong>
                                                <span className="text-[13px] text-slate-500">
                                                    Centralized client records
                                                </span>
                                            </div>

                                            <div className="rounded-[18px] border border-blue-200/70 bg-white/80 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                                <strong className="block text-[22px] text-slate-900">Products</strong>
                                                <span className="text-[13px] text-slate-500">
                                                    Manage systems and services
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="relative h-[10px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[72%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                            <div className="relative h-[10px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[56%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                            <div className="relative h-[10px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[84%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                        </div>
                                    </div>

                                    <div className="mt-4 text-[13px] text-slate-500">
                                        Built for{' '}
                                        <strong className="text-slate-900">
                                            admin operations, system control, and scalable SaaS management
                                        </strong>
                                        .
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>

                {showAccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.20)] backdrop-blur-[20px]">
                            <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/15 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">
                                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-500 to-blue-600" />
                                Restricted Access
                            </div>

                            <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
                                Enter admin access code
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                This area is for internal JCM Web Solution administration only.
                            </p>

                            <form onSubmit={handleAccess} className="mt-6 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Access Code
                                    </label>
                                    <input
                                        type="password"
                                        value={passcode}
                                        onChange={(e) => {
                                            setPasscode(e.target.value);
                                            if (error) setError('');
                                        }}
                                        placeholder="Enter admin code"
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5"
                                >
                                    Continue
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes blobFloat {
                        0%, 100% {
                            transform: translateY(0px) translateX(0px) scale(1);
                        }
                        50% {
                            transform: translateY(-18px) translateX(10px) scale(1.04);
                        }
                    }
                `}</style>
            </div>
        </>
    );
}