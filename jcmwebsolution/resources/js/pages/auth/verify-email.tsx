import { Form, Head } from '@inertiajs/react';
import { MailCheck, ShieldCheck, Sparkles } from 'lucide-react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            <div className="min-h-screen w-full overflow-hidden bg-white lg:grid lg:grid-cols-2">
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
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                JCM Web Solution
                            </div>

                            <h1 className="mt-8 max-w-lg text-4xl font-bold leading-tight xl:text-5xl">
                                Verify your email to activate your workspace
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                                Confirm your email address to secure your account and continue
                                accessing your digital systems and business tools.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                'Secure account activation',
                                'Trusted email verification',
                                'Safe access to your workspace',
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
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Email Verification
                            </div>

                            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                                Verify your email
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Please verify your email address by clicking the link we sent to
                                your inbox.
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                                A new verification link has been sent to the email address you
                                provided during registration.
                            </div>
                        )}

                        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                                    <MailCheck className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">
                                        Check your inbox
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Open your email and click the verification link to continue
                                        using your account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Form {...send.form()} className="space-y-4">
                            {({ processing }) => (
                                <>
                                    <Button
                                        disabled={processing}
                                        className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                                    >
                                        {processing && <Spinner />}
                                        {processing
                                            ? 'Sending verification link...'
                                            : 'Resend verification email'}
                                    </Button>

                                    <div className="text-center text-sm text-slate-500">
                                        Need a different action?{' '}
                                        <TextLink
                                            href={logout()}
                                            className="font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            Log out
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}