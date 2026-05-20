import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    LoaderCircle,
    LogOut,
    MailCheck,
    Rocket,
    ShieldCheck,
} from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({
    status,
}: {
    status?: string;
}) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email verification" />

            <div className="flex min-h-screen items-center justify-center bg-[#eef1f6] px-4 py-10">
                <div className="grid w-full max-w-[940px] overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] md:grid-cols-[1fr_1.05fr]">
                    <div className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 px-10 py-10 text-white md:block">
                        {/* 5-layer cloud divider */}
                        <div className="pointer-events-none absolute inset-y-0 right-[-1px] w-[210px] overflow-hidden">
                            <div className="absolute right-0 top-0 z-0 h-full w-[16px] bg-white" />

                            <div className="absolute right-[-86px] top-[-48px] z-50 size-[150px] rounded-full bg-white" />
                            <div className="absolute right-[-62px] top-[38px] z-50 size-[112px] rounded-full bg-white" />
                            <div className="absolute right-[-86px] top-[108px] z-50 size-[150px] rounded-full bg-white" />
                            <div className="absolute right-[-62px] top-[196px] z-50 size-[116px] rounded-full bg-white" />
                            <div className="absolute right-[-88px] top-[268px] z-50 size-[154px] rounded-full bg-white" />
                            <div className="absolute right-[-62px] top-[362px] z-50 size-[116px] rounded-full bg-white" />
                            <div className="absolute right-[-90px] top-[434px] z-50 size-[160px] rounded-full bg-white" />
                            <div className="absolute right-[-78px] bottom-[-52px] z-50 size-[150px] rounded-full bg-white" />
                        </div>

                        <div className="relative z-20 flex h-full flex-col">
                            <p className="text-sm font-medium text-white/85">
                                Account verification
                            </p>

                            <div className="mt-16 flex flex-col items-center text-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl">
                                    <Rocket className="size-8" />
                                </div>

                                <h1 className="mt-5 text-2xl font-bold">
                                    Verify your email
                                </h1>

                                <p className="mt-4 max-w-[300px] text-sm leading-6 text-white/80">
                                    Confirm your email address to securely
                                    access your JCM workspace.
                                </p>
                            </div>

                            <div className="mt-auto flex items-center gap-3 text-[11px] text-white/70">
                                <span>JCM Web Solution</span>
                                <span className="h-1 w-1 rounded-full bg-white/45" />
                                <span>Enterprise SaaS</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-[560px] flex-col justify-center px-7 py-10 sm:px-12">
                        <div className="mx-auto w-full max-w-[360px] text-center">
                            <div className="mb-8 flex flex-col items-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                                    <MailCheck className="size-8" />
                                </div>

                                <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                                    Verify your email
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    We sent a verification link to your email.
                                    Please click the link to continue to your
                                    workspace.
                                </p>
                            </div>

                            {status === 'verification-link-sent' && (
                                <div className="mb-6 rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-left">
                                    <div className="flex gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-emerald-600 shadow-sm">
                                            <CheckCircle2 className="size-4" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-emerald-700">
                                                Verification email sent
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-emerald-600/80">
                                                A new verification link has been
                                                sent to your registered email.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >
                                <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4">
                                    <div className="flex gap-3 text-left">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-blue-600 shadow-sm">
                                            <ShieldCheck className="size-4" />
                                        </div>

                                        <p className="text-xs leading-5 text-slate-500">
                                            Verification emails are sent only
                                            to secure and verified JCM
                                            workspace accounts.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    disabled={processing}
                                    className="h-11 w-full rounded-[999px] bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    {processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}
                                    Resend verification email
                                </Button>
                            </form>

                            <div className="mt-6">
                                <TextLink
                                    href={route('logout')}
                                    method="post"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                                >
                                    <LogOut className="size-4" />
                                    Log out
                                </TextLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}