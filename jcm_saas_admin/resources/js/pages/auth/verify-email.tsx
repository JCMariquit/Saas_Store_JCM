import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, MailCheck, ShieldCheck } from 'lucide-react';
import type { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verify Email" />

            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(125,211,252,0.20),transparent_28%),linear-gradient(135deg,#e0f2fe,#f8fbff,#dbeafe)] text-slate-900">
                
                {/* grid */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]" />

                {/* blobs */}
                <div className="pointer-events-none absolute -left-20 -top-16 h-[280px] w-[280px] rounded-full bg-sky-500/25 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-[320px] w-[320px] rounded-full bg-blue-500/20 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite_1.8s]" />
                <div className="pointer-events-none absolute right-[12%] top-[20%] h-[220px] w-[220px] rounded-full bg-sky-300/25 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite_3.2s]" />

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6">
                    <div className="grid w-full max-w-5xl gap-6 rounded-[30px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-[20px] md:grid-cols-[1fr_1fr]">

                        {/* LEFT */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-sky-700">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-500 to-blue-600" />
                                    JCM Web Solution
                                </div>

                                <h1 className="mt-6 text-4xl font-extrabold text-slate-900">
                                    Verify your
                                    <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                                        admin email
                                    </span>
                                </h1>

                                <p className="mt-4 text-slate-500">
                                    Please verify your email address before accessing the admin panel.
                                    A verification link has been sent to your registered email.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="px-4 py-2 rounded-full bg-white border text-sm">
                                        Secure verification
                                    </div>
                                    <div className="px-4 py-2 rounded-full bg-white border text-sm">
                                        Admin protected
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-sm text-slate-500 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-sky-600" />
                                Only authorized admins should proceed
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="flex items-center">
                            <div className="w-full rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">

                                <div className="mb-6 flex justify-center">
                                    <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                                        <MailCheck className="h-7 w-7" />
                                    </div>
                                </div>

                                <h2 className="text-center text-2xl font-bold text-slate-900">
                                    Email verification required
                                </h2>

                                <p className="text-center text-sm text-slate-500 mt-2">
                                    Check your inbox and click the verification link.
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-6 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm p-3 text-center">
                                        A new verification link has been sent.
                                    </div>
                                )}

                                <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                                    <Button
                                        type="submit"
                                        className="h-12 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold"
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Resend verification email
                                    </Button>

                                    <TextLink
                                        href={route('logout')}
                                        method="post"
                                        className="text-center text-sm text-slate-500 hover:text-sky-600"
                                    >
                                        Log out
                                    </TextLink>
                                </form>

                            </div>
                        </div>

                    </div>
                </div>

                <style>{`
                    @keyframes blobFloat {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-15px);
                        }
                    }
                `}</style>
            </div>
        </>
    );
}