import { Head, useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Mail,
    Rocket,
    ShieldCheck,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } =
        useForm<LoginForm>({
            email: '',
            password: '',
            remember: false,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="flex min-h-screen items-center justify-center bg-[#eef1f6] px-4 py-10">
                <div className="grid w-full max-w-[940px] overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] md:grid-cols-[1fr_1.05fr]">
                    <div className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 px-10 py-10 text-white md:block">
                        {/* 5-layer cloud divider */}
                        <div className="pointer-events-none absolute inset-y-0 right-[-1px] w-[210px] overflow-hidden">
                            {/* thin cover only para walang straight line */}
                            <div className="absolute right-0 top-0 z-0 h-full w-[16px] bg-white" />

                            {/* layer 1 - main white cloud */}
                            <div className="absolute right-[-86px] top-[-48px] z-50 size-[150px] rounded-full bg-white" />
                            <div className="absolute right-[-62px] top-[38px] z-50 size-[112px] rounded-full bg-white" />
                            <div className="absolute right-[-86px] top-[108px] z-50 size-[150px] rounded-full bg-white" />
                            <div className="absolute right-[-62px] top-[196px] z-50 size-[116px] rounded-full bg-white" />
                            <div className="absolute right-[-88px] top-[268px] z-50 size-[154px] rounded-full bg-white" />
                            <div className="absolute right-[-62px] top-[362px] z-50 size-[116px] rounded-full bg-white" />
                            <div className="absolute right-[-90px] top-[434px] z-50 size-[160px] rounded-full bg-white" />
                            <div className="absolute right-[-78px] bottom-[-52px] z-50 size-[150px] rounded-full bg-white" />

                            {/* layer 2 */}
                            <div className="absolute right-[-58px] top-[-42px] z-40 size-[138px] rounded-full bg-white/45" />
                            <div className="absolute right-[-36px] top-[44px] z-40 size-[102px] rounded-full bg-white/45" />
                            <div className="absolute right-[-58px] top-[116px] z-40 size-[138px] rounded-full bg-white/45" />
                            <div className="absolute right-[-36px] top-[204px] z-40 size-[106px] rounded-full bg-white/45" />
                            <div className="absolute right-[-60px] top-[278px] z-40 size-[142px] rounded-full bg-white/45" />
                            <div className="absolute right-[-36px] top-[370px] z-40 size-[106px] rounded-full bg-white/45" />
                            <div className="absolute right-[-62px] top-[444px] z-40 size-[146px] rounded-full bg-white/45" />

                            {/* layer 3 */}
                            <div className="absolute right-[-34px] top-[-34px] z-30 size-[126px] rounded-full bg-white/25" />
                            <div className="absolute right-[-16px] top-[52px] z-30 size-[92px] rounded-full bg-white/25" />
                            <div className="absolute right-[-34px] top-[126px] z-30 size-[126px] rounded-full bg-white/25" />
                            <div className="absolute right-[-16px] top-[214px] z-30 size-[96px] rounded-full bg-white/25" />
                            <div className="absolute right-[-36px] top-[290px] z-30 size-[130px] rounded-full bg-white/25" />
                            <div className="absolute right-[-16px] top-[382px] z-30 size-[96px] rounded-full bg-white/25" />
                            <div className="absolute right-[-38px] top-[456px] z-30 size-[134px] rounded-full bg-white/25" />

                            {/* layer 4 */}
                            <div className="absolute right-[-10px] top-[-24px] z-20 size-[108px] rounded-full bg-white/14" />
                            <div className="absolute right-[4px] top-[64px] z-20 size-[78px] rounded-full bg-white/14" />
                            <div className="absolute right-[-10px] top-[140px] z-20 size-[108px] rounded-full bg-white/14" />
                            <div className="absolute right-[4px] top-[228px] z-20 size-[82px] rounded-full bg-white/14" />
                            <div className="absolute right-[-12px] top-[306px] z-20 size-[112px] rounded-full bg-white/14" />
                            <div className="absolute right-[4px] top-[396px] z-20 size-[82px] rounded-full bg-white/14" />
                            <div className="absolute right-[-14px] top-[470px] z-20 size-[116px] rounded-full bg-white/14" />

                            {/* layer 5 - very soft outer glow */}
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
                                Welcome to
                            </p>

                            <div className="mt-16 flex flex-col items-center text-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl">
                                    <Rocket className="size-8" />
                                </div>

                                <h1 className="mt-5 text-2xl font-bold">
                                    JCM Workspace
                                </h1>

                                <p className="mt-4 max-w-[300px] text-sm leading-6 text-white/80">
                                    Secure access for clients, administrators,
                                    and product workspaces.
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
                                    Sign in to your account
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Continue to your JCM workspace.
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
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            className="h-11 rounded-[10px] border-slate-200 pl-10 shadow-sm"
                                        />
                                    </div>

                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>

                                        {canResetPassword && (
                                            <TextLink
                                                href={route('password.request')}
                                                className="text-sm font-medium"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter your password"
                                            className="h-11 rounded-[10px] border-slate-200 pl-10 pr-10 shadow-sm"
                                        />

                                        <button
                                            type="button"
                                            tabIndex={3}
                                            onClick={() =>
                                                setShowPassword(
                                                    (value) => !value,
                                                )
                                            }
                                            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>

                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="remember"
                                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-500"
                                    >
                                        <Checkbox
                                            id="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'remember',
                                                    Boolean(checked),
                                                )
                                            }
                                            tabIndex={4}
                                        />

                                        Remember me
                                    </label>
                                </div>

                                <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="flex gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-blue-600 shadow-sm">
                                            <ShieldCheck className="size-4" />
                                        </div>

                                        <p className="text-xs leading-5 text-slate-500">
                                            Access is limited to verified client
                                            and administrator accounts.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    tabIndex={5}
                                    className="h-11 w-full rounded-[999px] bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    {processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}
                                    Sign in
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}