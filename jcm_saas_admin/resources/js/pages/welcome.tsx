import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="JCM Web Solution" />

            <div className="relative min-h-screen bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 flex items-center justify-center px-4">

                {/* subtle background glow */}
                <div className="absolute inset-0 -z-10 opacity-30 blur-3xl bg-[radial-gradient(circle_at_30%_20%,#38bdf8,transparent_40%),radial-gradient(circle_at_70%_80%,#2563eb,transparent_40%)]" />

                {/* CARD */}
                <div className="w-full max-w-md rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-xl p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.25)]">

                    {/* LOGO */}
                    <div className="mb-6 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold shadow-lg">
                            J
                        </div>
                    </div>

                    {/* TITLE */}
                    <h1 className="text-center text-2xl font-extrabold tracking-wide">
                        JCM Web Solution
                    </h1>

                    <p className="mt-2 text-center text-sm text-blue-100">
                        Your SaaS platform for systems & digital solutions
                    </p>

                    {/* ACTIONS */}
                    <div className="mt-8 flex flex-col gap-3">

                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="w-full rounded-2xl bg-white text-blue-600 py-3 font-semibold shadow-md transition hover:scale-[1.03]"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="w-full rounded-2xl border border-white/40 py-3 text-center font-semibold transition hover:bg-white/10"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className="w-full rounded-2xl bg-white text-blue-600 py-3 text-center font-semibold shadow-md transition hover:scale-[1.03]"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}

                    </div>

                </div>
            </div>
        </>
    );
}