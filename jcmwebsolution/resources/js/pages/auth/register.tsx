import { Form, Head } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Register" />

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
                                Create your workspace and start building smarter
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                                Join the platform and access ready-made products,
                                custom business solutions, and a cleaner way to manage digital systems.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                'Quick account setup',
                                'Modern business-ready workspace',
                                'Scalable systems for real operations',
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
                                Create Account
                            </div>

                            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Enter your details below to get started.
                            </p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            className="flex flex-col gap-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-5">
                                        <div className="grid gap-2.5">
                                            <Label
                                                htmlFor="name"
                                                className="text-sm font-semibold text-slate-700"
                                            >
                                                Full name
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                placeholder="Full name"
                                                className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                            />
                                            <InputError
                                                message={errors.name}
                                                className="mt-1"
                                            />
                                        </div>

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
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2.5">
                                            <Label
                                                htmlFor="password"
                                                className="text-sm font-semibold text-slate-700"
                                            >
                                                Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Create a password"
                                                className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2.5">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="text-sm font-semibold text-slate-700"
                                            >
                                                Confirm password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Confirm your password"
                                                className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-blue-400 focus:ring-blue-400"
                                            />
                                            <InputError
                                                message={errors.password_confirmation}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                                            tabIndex={5}
                                            data-test="register-user-button"
                                        >
                                            {processing && <Spinner />}
                                            <span>
                                                {processing
                                                    ? 'Creating account...'
                                                    : 'Create account'}
                                            </span>
                                            {!processing && (
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                    <div className="pt-2 text-center text-sm text-slate-500">
                                        Already have an account?{' '}
                                        <TextLink
                                            href={login()}
                                            tabIndex={6}
                                            className="font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            Log in
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