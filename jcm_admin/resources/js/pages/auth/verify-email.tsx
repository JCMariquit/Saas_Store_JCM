import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, MailCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email verification" />

            <div className="min-h-screen w-full overflow-hidden bg-white lg:grid lg:grid-cols-2">
                
                {/* LEFT PANEL */}
                <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white lg:flex">
                    <img
                        src="/images/banner/banner1.png"
                        alt="JCM Web Solution"
                        className="absolute inset-0 h-full w-full object-cover opacity-25"
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-blue-950/90" />
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                                <Sparkles className="h-3.5 w-3.5" />
                                JCM Web Solution
                            </div>

                            <h1 className="mt-8 max-w-lg text-4xl font-bold leading-tight xl:text-5xl">
                                Verify your email to activate your workspace
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                                Confirm your email address to unlock full access to your systems,
                                services, and business tools.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                'Secure account activation',
                                'Trusted email verification',
                                'Safe workspace access',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
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

                {/* RIGHT PANEL */}
                <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-slate-50 to-blue-50/50 px-6 py-10">
                    <div className="w-full max-w-md">

                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Email Verification
                            </div>

                            <h2 className="mt-5 text-3xl font-bold text-slate-900">
                                Verify your email
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Please check your inbox and click the verification link.
                            </p>
                        </div>

                        {/* SUCCESS MESSAGE */}
                        {status === 'verification-link-sent' && (
                            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                                A new verification link has been sent.
                            </div>
                        )}

                        {/* INFO CARD */}
                        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                                    <MailCheck className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">
                                        Check your inbox
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Click the link sent to your email to continue.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FORM */}
                        <form onSubmit={submit} className="space-y-4">
                            <Button
                                disabled={processing}
                                className="h-12 w-full rounded-2xl bg-slate-950 text-white font-semibold hover:bg-slate-800"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                {processing
                                    ? 'Sending...'
                                    : 'Resend verification email'}
                            </Button>

                            <div className="text-center text-sm text-slate-500">
                                Need another option?{' '}
                                <TextLink
                                    href={route('logout')}
                                    method="post"
                                    className="font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Log out
                                </TextLink>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}