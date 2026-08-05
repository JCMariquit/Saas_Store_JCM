import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordForm {
    email: string;
    [key: string]: string;
}

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<ForgotPasswordForm>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot password" />

            <div className="bg-card min-h-screen w-full overflow-hidden lg:grid lg:grid-cols-2">
                <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white lg:flex">
                    <img src="/images/banner/banner1.png" alt="JCM Web Solution" className="absolute inset-0 h-full w-full object-cover opacity-25" />

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-blue-950/90" />
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-slate-100 uppercase">
                                <Sparkles className="h-3.5 w-3.5" />
                                JCM Web Solution
                            </div>

                            <h1 className="mt-8 max-w-lg text-4xl leading-tight font-bold xl:text-5xl">Secure access for your workspace</h1>

                            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                                Recover your account and continue managing your ready-made products, custom web solutions, and business systems.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {['Secure account recovery', 'Protected workspace access', 'Clean, scalable, and business-ready systems'].map((item) => (
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

                <div className="from-background via-background to-primary/[0.035] relative flex min-h-screen items-center justify-center bg-gradient-to-b px-6 py-10 sm:px-8 lg:px-10 xl:px-14">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <div className="border-primary/20 bg-primary/[0.07] text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                                <Sparkles className="h-3.5 w-3.5" />
                                Account Recovery
                            </div>

                            <h2 className="text-foreground mt-5 text-3xl font-bold tracking-tight">Forgot password</h2>

                            <p className="text-muted-foreground mt-2 text-sm leading-6">Enter your email to receive a password reset link.</p>
                        </div>

                        {status && (
                            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <div className="grid gap-5">
                                <div className="grid gap-2.5">
                                    <Label htmlFor="email" className="text-foreground text-sm font-semibold">
                                        Email address
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        value={data.email}
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        className="border-border bg-card focus:border-primary focus:ring-primary h-12 rounded-2xl shadow-sm"
                                    />

                                    <InputError message={errors.email} />
                                </div>

                                <Button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-2xl text-sm font-semibold shadow-md transition"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            Sending reset link...
                                        </>
                                    ) : (
                                        <>
                                            Email password reset link
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="text-muted-foreground pt-2 text-center text-sm">
                                Or, return to{' '}
                                <TextLink href={route('login')} className="text-primary hover:text-primary font-semibold">
                                    log in
                                </TextLink>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
