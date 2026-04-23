import { Form, Head } from '@inertiajs/react';
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

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
                                Confirm your password to continue securely
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                                This protected area requires password confirmation before you can
                                continue with sensitive actions inside your workspace.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                'Secure access confirmation',
                                'Protected sensitive actions',
                                'Safer account management',
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
                                Secure Confirmation
                            </div>

                            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                                Confirm your password
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                This is a secure area of the application. Please confirm your
                                password before continuing.
                            </p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2.5">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Password
                                        </Label>

                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                autoFocus
                                                className="h-12 rounded-2xl border-slate-200 bg-white pr-4 pl-11 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                            />
                                        </div>

                                        <InputError message={errors.password} />
                                    </div>

                                    <Button
                                        className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                                        disabled={processing}
                                        data-test="confirm-password-button"
                                    >
                                        {processing && <Spinner />}
                                        <span>
                                            {processing
                                                ? 'Confirming...'
                                                : 'Confirm password'}
                                        </span>
                                        {!processing && (
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}