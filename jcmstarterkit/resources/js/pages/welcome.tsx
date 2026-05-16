import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

import { login, register } from '@/routes';
import type { SharedData } from '@/types';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="JCM Web Solution" />

            <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-background to-background" />
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-8">
                    <header className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                                JCM
                            </div>

                            <div>
                                <p className="text-sm font-semibold leading-none">
                                    JCM Web Solution
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Smart business systems
                                </p>
                            </div>
                        </Link>
                    </header>

                    <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-20">
                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                                <Sparkles className="size-4 text-primary" />
                                Built for modern business workflows
                            </div>

                            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                Build smarter systems with{' '}
                                <span className="text-primary">
                                    JCM Web Solution
                                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                                A clean and scalable platform for managing
                                bookings, services, products, subscriptions, and
                                business operations in one professional system.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                                            >
                                                Create Account
                                                <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        )}

                                        <Link
                                            href={login()}
                                            className="inline-flex h-12 items-center justify-center rounded-2xl border bg-background/70 px-7 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-muted"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    Booking ready
                                </div>

                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    SaaS scalable
                                </div>

                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    Secure access
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border bg-background/75 p-4 shadow-2xl shadow-primary/5 backdrop-blur">
                            <div className="overflow-hidden rounded-[1.5rem] border bg-card">
                                <div className="border-b px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                JCM Control Center
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Business system preview
                                            </p>
                                        </div>

                                        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                                            Online
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Bookings</p>
                                            <p className="mt-2 text-2xl font-semibold">128</p>
                                        </div>

                                        <div className="rounded-2xl border bg-muted/30 p-4">
                                            <p className="text-xs text-muted-foreground">Services</p>
                                            <p className="mt-2 text-2xl font-semibold">24</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}