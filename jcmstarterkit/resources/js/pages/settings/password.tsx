import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import {
    CheckCircle2,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useRef } from 'react';

import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <section className="overflow-hidden rounded-3xl border  bg-background shadow-sm">
                    {/* Hero Header */}
                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.04] via-background to-background px-8 py-8">
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

                        <div className="relative flex items-start justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                    <LockKeyhole className="size-6" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                            Password & Security
                                        </h1>

                                        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                                            Protected
                                        </div>
                                    </div>

                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                                        Keep your account secure with a strong password.
                                        We recommend using a unique password that you
                                        don’t use elsewhere.
                                    </p>
                                </div>
                            </div>

                            <div className="hidden lg:flex">
                                <div className="rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <ShieldCheck className="size-5" />
                                        </div>

                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Security Status
                                            </p>

                                            <p className="text-sm font-semibold text-foreground">
                                                Strong Protection
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <Form
                        {...PasswordController.update.form()}
                        options={{ preserveScroll: true }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="px-8 py-8"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <div className="space-y-8">
                                {/* Section Title */}
                                <div className="space-y-1">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                        Change Password
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        Update your credentials below.
                                    </p>
                                </div>

                                {/* Current Password */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="current_password"
                                        className="text-sm font-medium"
                                    >
                                        Current Password
                                    </Label>

                                    <div className="relative">
                                        <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type="password"
                                            autoComplete="current-password"
                                            placeholder="Enter current password"
                                            className="h-12 rounded-xl border-border/60 pl-11 shadow-sm transition-all focus-visible:ring-2"
                                        />
                                    </div>

                                    <InputError message={errors.current_password} />
                                </div>

                                {/* New Password Grid */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium"
                                        >
                                            New Password
                                        </Label>

                                        <div className="relative">
                                            <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Input
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="Enter new password"
                                                className="h-12 rounded-xl border-border/60 pl-11 shadow-sm transition-all focus-visible:ring-2"
                                            />
                                        </div>

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-sm font-medium"
                                        >
                                            Confirm Password
                                        </Label>

                                        <div className="relative">
                                            <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                                className="h-12 rounded-xl border-border/60 pl-11 shadow-sm transition-all focus-visible:ring-2"
                                            />
                                        </div>

                                        <InputError
                                            message={errors.password_confirmation}
                                        />
                                    </div>
                                </div>

                                {/* Security Tips */}
                                <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Sparkles className="size-4" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Password Tips
                                            </h3>

                                            <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
                                                <li>
                                                    • Use at least 8 characters
                                                </li>
                                                <li>
                                                    • Include uppercase and numbers
                                                </li>
                                                <li>
                                                    • Avoid reusing old passwords
                                                </li>
                                                <li>
                                                    • Use a unique password for this account
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Security changes are applied instantly.
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Your sessions remain active after changing
                                            your password.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition-all duration-200"
                                            enterFrom="opacity-0 translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition-all duration-150"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-600">
                                                <CheckCircle2 className="size-4" />
                                                Password updated
                                            </div>
                                        </Transition>

                                        <Button
                                            disabled={processing}
                                            size="lg"
                                            className="h-11 rounded-xl px-6 shadow-sm"
                                            data-test="update-password-button"
                                        >
                                            {processing
                                                ? 'Updating...'
                                                : 'Update Password'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Form>
                </section>
            </SettingsLayout>
        </AppLayout>
    );
}