import { Form, Head } from '@inertiajs/react';
import {
    ArrowRight,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-background to-background" />
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative grid min-h-screen lg:grid-cols-[1fr_520px]">
                    <section className="hidden border-r bg-muted/[0.08] px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                                    JCM
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        JCM Web Solution
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Smart business systems
                                    </p>
                                </div>
                            </div>

                            <div className="mt-24 max-w-2xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                                    <Sparkles className="size-4 text-primary" />
                                    Secure workspace access
                                </div>

                                <h1 className="text-5xl font-semibold tracking-tight xl:text-6xl">
                                    Manage your business system in one clean
                                    dashboard.
                                </h1>

                                <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">
                                    Access bookings, services, products,
                                    subscriptions, and business tools through a
                                    professional JCM workspace.
                                </p>
                            </div>
                        </div>

                        <div className="grid max-w-3xl gap-4 xl:grid-cols-3">
                            {[
                                'Secure login session',
                                'Scalable SaaS dashboard',
                                'Professional workspace',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border bg-background/70 p-4 shadow-sm backdrop-blur"
                                >
                                    <ShieldCheck className="mb-3 size-5 text-primary" />
                                    <p className="text-sm font-medium">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8">
                                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                    <LockKeyhole className="size-6" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl font-semibold tracking-tight">
                                            Welcome back
                                        </h2>

                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                            JCM
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Enter your credentials to continue to
                                        your account.
                                    </p>
                                </div>
                            </div>

                            {status && (
                                <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
                                    {status}
                                </div>
                            )}

                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="space-y-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email Address
                                                </Label>

                                                <div className="relative">
                                                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        required
                                                        autoFocus
                                                        tabIndex={1}
                                                        autoComplete="email"
                                                        placeholder="email@example.com"
                                                        className="h-12 rounded-xl border-border/60 pl-11 shadow-sm"
                                                    />
                                                </div>

                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password">
                                                        Password
                                                    </Label>

                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="ml-auto text-sm font-medium text-primary"
                                                            tabIndex={5}
                                                        >
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        required
                                                        tabIndex={2}
                                                        autoComplete="current-password"
                                                        placeholder="Enter your password"
                                                        className="h-12 rounded-xl border-border/60 pl-11 shadow-sm"
                                                    />
                                                </div>

                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id="remember"
                                                        name="remember"
                                                        tabIndex={3}
                                                    />

                                                    <Label
                                                        htmlFor="remember"
                                                        className="cursor-pointer text-sm font-medium"
                                                    >
                                                        Remember me
                                                    </Label>
                                                </div>

                                                <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                                                    <ShieldCheck className="size-3.5 text-primary" />
                                                    Secure login
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-2 h-12 w-full rounded-xl text-sm font-semibold shadow-sm"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Spinner />
                                                        Signing in...
                                                    </>
                                                ) : (
                                                    <>
                                                        Log in
                                                        <ArrowRight className="ml-2 size-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {canRegister && (
                                            <div className="border-t pt-5 text-center text-sm text-muted-foreground">
                                                Don&apos;t have an account?{' '}
                                                <TextLink
                                                    href={register()}
                                                    tabIndex={5}
                                                    className="font-semibold text-primary"
                                                >
                                                    Create account
                                                </TextLink>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Form>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}