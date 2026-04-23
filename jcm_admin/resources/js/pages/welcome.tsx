import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const adminPasscode = useMemo(() => 'jcm', []);
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

            <div className="min-h-screen w-full overflow-hidden bg-white lg:grid lg:grid-cols-2">
                <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white lg:flex">
                    <img
                        src="/images/banner/banner2.png"
                        alt="JCM Admin Portal"
                        className="absolute inset-0 h-full w-full object-cover opacity-20"
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-slate-900/86 to-blue-950/92" />
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                JCM Admin Portal
                            </div>

                            <h1 className="mt-8 max-w-xl text-4xl font-bold leading-tight xl:text-5xl">
                                Internal control panel for secure business operations
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                                Centralized access for managing clients, products, services,
                                subscriptions, and core system operations inside your admin workspace.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                'Private internal environment',
                                'Centralized admin operations',
                                'Scalable system management',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                        <ShieldCheck className="h-5 w-5 text-sky-300" />
                                    </div>
                                    <p className="text-sm text-slate-200">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-slate-50 to-blue-50/50 px-6 py-10 sm:px-8 lg:px-10 xl:px-14">
                    <div className="w-full max-w-xl">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Restricted Admin Access
                            </div>

                            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                                Admin workspace overview
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Authorized access only. This environment is intended for internal
                                JCM Web Solution management and operations.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-4 text-white">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                                            Admin Overview
                                        </p>
                                        <h3 className="mt-1 text-lg font-bold">
                                            Centralized control panel
                                        </h3>
                                    </div>

                                    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-100">
                                        Internal
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 bg-gradient-to-b from-white to-blue-50/40 p-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            Clients
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            Records
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Manage client accounts and related data.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            Products
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            Services
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Organize products, services, and plans.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-slate-900">
                                            System activity
                                        </p>
                                        <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                                            Live overview
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                            <div className="h-full w-[56%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {auth.user ? (
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                                        >
                                            Login
                                        </Link>
                                    )}

                                    <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
                                        Authorized access only
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showAccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
                        <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-5 text-white">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-100">
                                    <LockKeyhole className="h-3.5 w-3.5" />
                                    Restricted Access
                                </div>

                                <h2 className="mt-4 text-2xl font-bold">
                                    Enter admin access code
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    This area is for internal JCM Web Solution administration only.
                                </p>
                            </div>

                            <div className="bg-gradient-to-b from-white to-blue-50/40 px-6 py-6">
                                <form onSubmit={handleAccess} className="space-y-4">
                                    <div className="grid gap-2.5">
                                        <label className="text-sm font-semibold text-slate-700">
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
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
                                        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                                    >
                                        Continue
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}