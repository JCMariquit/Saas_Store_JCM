import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import type { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />

            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(125,211,252,0.20),transparent_28%),linear-gradient(135deg,#e0f2fe,#f8fbff,#dbeafe)] text-slate-900">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]" />

                <div className="pointer-events-none absolute -left-20 -top-16 h-[280px] w-[280px] rounded-full bg-sky-500/25 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-[320px] w-[320px] rounded-full bg-blue-500/20 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite_1.8s]" />
                <div className="pointer-events-none absolute right-[12%] top-[20%] h-[220px] w-[220px] rounded-full bg-sky-300/25 blur-[70px] animate-[blobFloat_10s_ease-in-out_infinite_3.2s]" />

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
                    <div className="grid w-full max-w-6xl gap-6 overflow-hidden rounded-[30px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-[20px] md:grid-cols-[1.05fr_0.95fr] md:p-8 lg:p-9">
                        {/* LEFT PANEL */}
                        <div className="relative flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/15 bg-white/75 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 shadow-[0_8px_24px_rgba(14,165,233,0.08)] sm:text-[13px]">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 shadow-[0_0_0_6px_rgba(14,165,233,0.12)]" />
                                    JCM Web Solution
                                </div>

                                <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-[52px] lg:leading-[1.04]">
                                    Reset secure
                                    <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                                        {' '}administrator password
                                    </span>
                                </h1>

                                <p className="mt-4 max-w-[560px] text-base leading-7 text-slate-500 sm:text-lg">
                                    Create a new password to restore access to the internal JCM Web Solution
                                    administration panel. Use a strong password for better protection.
                                </p>

                                <div className="mt-7 flex flex-wrap gap-3">
                                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700">
                                        <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                                        Secure reset process
                                    </div>

                                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700">
                                        Admin credential protection
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-[24px] border border-white/60 bg-gradient-to-b from-white/80 to-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="h-[11px] w-[11px] rounded-full bg-red-400" />
                                    <span className="h-[11px] w-[11px] rounded-full bg-amber-400" />
                                    <span className="h-[11px] w-[11px] rounded-full bg-emerald-400" />
                                </div>

                                <div className="rounded-[20px] border border-blue-200/80 bg-gradient-to-br from-blue-50 to-white p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm font-bold text-slate-900">Reset Panel</div>
                                        <div className="rounded-full bg-sky-500/10 px-3 py-2 text-[12px] font-bold text-sky-700">
                                            Protected
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3">
                                        <div className="relative h-[14px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[70%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                        <div className="relative h-[14px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[58%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                        <div className="relative h-[14px] overflow-hidden rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/10 after:absolute after:inset-y-0 after:left-0 after:w-[84%] after:rounded-full after:bg-gradient-to-r after:from-sky-500 after:to-blue-600 after:opacity-80" />
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-[18px] border border-blue-200/70 bg-white/80 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                            <strong className="block text-[22px] text-slate-900">Access</strong>
                                            <span className="text-[13px] text-slate-500">
                                                Restore admin entry
                                            </span>
                                        </div>

                                        <div className="rounded-[18px] border border-blue-200/70 bg-white/80 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                            <strong className="block text-[22px] text-slate-900">Security</strong>
                                            <span className="text-[13px] text-slate-500">
                                                Strong password update
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
                                        <ShieldCheck className="h-4 w-4 text-sky-600" />
                                        Only authorized administrator accounts should complete this reset
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL / FORM */}
                        <div className="flex items-center">
                            <div className="w-full rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-[20px] sm:p-8">
                                <div className="mb-6 flex items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)]">
                                        <RefreshCw className="h-7 w-7" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Reset password
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Please enter your new administrator password below.
                                    </p>
                                </div>

                                <form onSubmit={submit} className="mt-6">
                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-slate-700">
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                autoComplete="email"
                                                value={data.email}
                                                readOnly
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-slate-900 shadow-sm focus:border-sky-400 focus:ring-sky-100"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password" className="text-slate-700">
                                                New password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                autoComplete="new-password"
                                                value={data.password}
                                                autoFocus
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter new password"
                                                className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-slate-900 shadow-sm focus:border-sky-400 focus:ring-sky-100"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation" className="text-slate-700">
                                                Confirm password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                value={data.password_confirmation}
                                                onChange={(e) =>
                                                    setData('password_confirmation', e.target.value)
                                                }
                                                placeholder="Confirm new password"
                                                className="h-12 rounded-2xl border-slate-200 bg-white/90 px-4 text-slate-900 shadow-sm focus:border-sky-400 focus:ring-sky-100"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-2 h-12 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-700"
                                            disabled={processing}
                                        >
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Reset password
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-6 text-center text-sm text-slate-500">
                                    Secure administrator credential reset.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes blobFloat {
                        0%, 100% {
                            transform: translateY(0px) translateX(0px) scale(1);
                        }
                        50% {
                            transform: translateY(-18px) translateX(10px) scale(1.04);
                        }
                    }
                `}</style>
            </div>
        </>
    );
}