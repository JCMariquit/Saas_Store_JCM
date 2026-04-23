import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

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
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
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
            <Head title="Admin Log in" />

            <div className="min-h-screen w-full overflow-hidden bg-white lg:grid lg:grid-cols-2">
                <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white lg:flex">
                    <img
                        src="/images/banner/banner2.png"
                        alt="JCM Admin"
                        className="absolute inset-0 h-full w-full object-cover opacity-20"
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-blue-950/90" />
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                JCM Admin Portal
                            </div>

                            <h1 className="mt-8 max-w-lg text-4xl font-bold leading-tight xl:text-5xl">
                                Manage your digital platform with confidence
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                                Access your admin workspace to manage products, services, plans,
                                orders, subscriptions, and business operations in one place.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                'Centralized product and service management',
                                'Secure admin-only workspace access',
                                'Built for scalable business operations',
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
                                Admin Access
                            </div>

                            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                                Log in to admin panel
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Continue to your control panel and manage your system with ease.
                            </p>
                        </div>

                        <form className="flex flex-col gap-5" onSubmit={submit}>
                            <div className="grid gap-5">
                                <div className="grid gap-2.5">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2.5">
                                    <div className="flex items-center">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={route('password.request')}
                                                className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-700"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>

                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            checked={data.remember}
                                            onCheckedChange={(checked) =>
                                                setData('remember', checked === true)
                                            }
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="cursor-pointer text-sm font-medium text-slate-600"
                                        >
                                            Remember me
                                        </Label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    <span>{processing ? 'Signing in...' : 'Log in'}</span>
                                    {!processing && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="pt-2 text-center text-sm text-slate-500">
                                Don&apos;t have an account?{' '}
                                <TextLink
                                    href={route('register')}
                                    tabIndex={5}
                                    className="font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        </form>

                        {status && (
                            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}