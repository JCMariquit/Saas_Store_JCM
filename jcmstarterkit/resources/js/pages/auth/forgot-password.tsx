import { Form, Head } from '@inertiajs/react';
import {
    ArrowLeft,
    KeyRound,
    Mail,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({
    status,
}: {
    status?: string;
}) {
    return (
        <>
            <Head title="Forgot password" />

            <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-background to-background" />
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative grid min-h-screen lg:grid-cols-[1fr_520px]">
                    {/* Left Side */}
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
                                    Secure account recovery
                                </div>

                                <h1 className="text-5xl font-semibold tracking-tight xl:text-6xl">
                                    Recover your account securely.
                                </h1>

                                <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">
                                    Enter your email address and we’ll send you
                                    a secure password reset link to regain access
                                    to your JCM workspace.
                                </p>
                            </div>
                        </div>

                        <div className="grid max-w-3xl gap-4 xl:grid-cols-3">
                            {[
                                'Encrypted recovery flow',
                                'Secure email verification',
                                'Protected account access',
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

                    {/* Right Side */}
                    <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8">
                                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                    <KeyRound className="size-6" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl font-semibold tracking-tight">
                                            Forgot password
                                        </h2>

                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                            JCM
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-muted-foreground">
                                        Enter your email address to receive a
                                        secure password reset link.
                                    </p>
                                </div>
                            </div>

                            {status && (
                                <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
                                    {status}
                                </div>
                            )}

                            <Form
                                {...email.form()}
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
                                                        autoComplete="off"
                                                        autoFocus
                                                        placeholder="email@example.com"
                                                        className="h-12 rounded-xl border-border/60 pl-11 shadow-sm"
                                                    />
                                                </div>

                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <Button
                                                className="mt-2 h-12 w-full rounded-xl text-sm font-semibold shadow-sm"
                                                disabled={processing}
                                                data-test="email-password-reset-link-button"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Spinner />
                                                        Sending link...
                                                    </>
                                                ) : (
                                                    <>
                                                        Send reset link
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>

                            <div className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
                                <span>Remember your password? </span>

                                <TextLink
                                    href={login()}
                                    className="inline-flex items-center gap-1 font-semibold text-primary"
                                >
                                    <ArrowLeft className="size-3.5" />
                                    Back to login
                                </TextLink>
                            </div>

                            <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Sparkles className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Secure Password Recovery
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            Recovery links are securely generated
                                            and expire automatically for your
                                            account protection.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}