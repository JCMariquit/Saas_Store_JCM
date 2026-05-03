import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
    return (
        <>
            <Head title="403 Unauthorized" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6">
                <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                        <ShieldAlert className="h-10 w-10" />
                    </div>

                    <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-red-300">
                        403 Forbidden
                    </p>

                    <h1 className="mt-3 text-3xl font-bold text-white">
                        Unauthorized Admin Access
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-slate-300">
                        You do not have permission to access this admin page.
                        This area is restricted to authorized administrators only.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/store/dashboard"
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Go to Store Dashboard
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}