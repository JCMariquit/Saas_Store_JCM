import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    LoaderCircle,
    Mail,
    Rocket,
    ShieldCheck,
} from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ForgotPasswordForm = {
    email: string;
    [key: string]: string;
};

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } =
        useForm<ForgotPasswordForm>({
            email: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot password" />

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

                            <div className="absolute right-[-58px] top-[-42px] z-40 size-[138px] rounded-full bg-white/45" />
                            <div className="absolute right-[-36px] top-[44px] z-40 size-[102px] rounded-full bg-white/45" />
                            <div className="absolute right-[-58px] top-[116px] z-40 size-[138px] rounded-full bg-white/45" />
                            <div className="absolute right-[-36px] top-[204px] z-40 size-[106px] rounded-full bg-white/45" />
                            <div className="absolute right-[-60px] top-[278px] z-40 size-[142px] rounded-full bg-white/45" />
                            <div className="absolute right-[-36px] top-[370px] z-40 size-[106px] rounded-full bg-white/45" />
                            <div className="absolute right-[-62px] top-[444px] z-40 size-[146px] rounded-full bg-white/45" />

                            <div className="absolute right-[-34px] top-[-34px] z-30 size-[126px] rounded-full bg-white/25" />
                            <div className="absolute right-[-16px] top-[52px] z-30 size-[92px] rounded-full bg-white/25" />
                            <div className="absolute right-[-34px] top-[126px] z-30 size-[126px] rounded-full bg-white/25" />
                            <div className="absolute right-[-16px] top-[214px] z-30 size-[96px] rounded-full bg-white/25" />
                            <div className="absolute right-[-36px] top-[290px] z-30 size-[130px] rounded-full bg-white/25" />
                            <div className="absolute right-[-16px] top-[382px] z-30 size-[96px] rounded-full bg-white/25" />
                            <div className="absolute right-[-38px] top-[456px] z-30 size-[134px] rounded-full bg-white/25" />

                            <div className="absolute right-[-10px] top-[-24px] z-20 size-[108px] rounded-full bg-white/14" />
                            <div className="absolute right-[4px] top-[64px] z-20 size-[78px] rounded-full bg-white/14" />
                            <div className="absolute right-[-10px] top-[140px] z-20 size-[108px] rounded-full bg-white/14" />
                            <div className="absolute right-[4px] top-[228px] z-20 size-[82px] rounded-full bg-white/14" />
                            <div className="absolute right-[-12px] top-[306px] z-20 size-[112px] rounded-full bg-white/14" />
                            <div className="absolute right-[4px] top-[396px] z-20 size-[82px] rounded-full bg-white/14" />
                            <div className="absolute right-[-14px] top-[470px] z-20 size-[116px] rounded-full bg-white/14" />

                            <div className="absolute right-[14px] top-[-18px] z-10 size-[96px] rounded-full bg-white/8" />
                            <div className="absolute right-[24px] top-[76px] z-10 size-[68px] rounded-full bg-white/8" />
                            <div className="absolute right-[14px] top-[154px] z-10 size-[96px] rounded-full bg-white/8" />
                            <div className="absolute right-[24px] top-[242px] z-10 size-[72px] rounded-full bg-white/8" />
                            <div className="absolute right-[12px] top-[322px] z-10 size-[100px] rounded-full bg-white/8" />
                            <div className="absolute right-[24px] top-[410px] z-10 size-[72px] rounded-full bg-white/8" />
                            <div className="absolute right-[12px] top-[486px] z-10 size-[104px] rounded-full bg-white/8" />
                        </div>

                        <div className="relative z-20 flex h-full flex-col">
                            <p className="text-sm font-medium text-white/85">
                                Account recovery
                            </p>

                            <div className="mt-16 flex flex-col items-center text-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl">
                                    <Rocket className="size-8" />
                                </div>

                                <h1 className="mt-5 text-2xl font-bold">
                                    Recover access
                                </h1>

                                <p className="mt-4 max-w-[300px] text-sm leading-6 text-white/80">
                                    Reset your password and continue using your
                                    JCM workspace securely.
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
                        <div className="mx-auto w-full max-w-[360px]">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Forgot password?
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Enter your JCM account email and we&apos;ll
                                    send a reset link.
                                </p>
                            </div>

                            {status && (
                                <div className="mb-5 rounded-[14px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700">
                                    {status}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            value={data.email}
                                            autoFocus
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            className="h-11 rounded-[10px] border-slate-200 pl-10 shadow-sm"
                                        />
                                    </div>

                                    <InputError message={errors.email} />
                                </div>

                                <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="flex gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-blue-600 shadow-sm">
                                            <ShieldCheck className="size-4" />
                                        </div>

                                        <p className="text-xs leading-5 text-slate-500">
                                            Password reset links are sent only
                                            to verified JCM account emails.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 w-full rounded-[999px] bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    {processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}
                                    Send reset link
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-slate-500">
                                <TextLink
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    <ArrowLeft className="size-4" />
                                    Back to login
                                </TextLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}