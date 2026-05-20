import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="JCM" />

            <div className="flex min-h-screen flex-col bg-[#eef1f6] text-slate-950">
                <header className="flex w-full items-center justify-between px-6 py-5">
                    <div>
                        <p className="text-sm font-bold tracking-tight">
                            JCM Web Solution
                        </p>
                    </div>

                    <nav>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Log in
                            </Link>
                        )}
                    </nav>
                </header>

                <main className="flex flex-1 items-center justify-center px-6 py-16">
                    <section className="mx-auto max-w-2xl text-center">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                            Coming soon
                        </p>

                        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                            JCM Web Solution
                        </h1>

                        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
                            A simple landing page placeholder for the JCM
                            platform. Full content and product sections will be
                            added later.
                        </p>

                        <div className="mt-8">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex h-11 items-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    Go to dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex h-11 items-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    Continue to login
                                </Link>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}