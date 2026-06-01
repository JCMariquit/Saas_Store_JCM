import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
} from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

type PasswordForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
    [key: string]: string;
};

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm<PasswordForm>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="w-full max-w-none">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <section className="rounded-[24px] border border-border/70 bg-card p-6 shadow-sm">
                            <div className="mb-7 flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-[14px] border border-border/70 bg-background text-primary shadow-sm">
                                            <LockKeyhole className="size-4" />
                                        </div>

                                        <div>
                                            <h1 className="text-lg font-bold tracking-tight text-foreground">
                                                Update password
                                            </h1>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                Keep your JCM workspace secure
                                                with a strong password.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        <CheckCircle2 className="size-3.5" />
                                        Saved
                                    </div>
                                </Transition>
                            </div>

                            <form onSubmit={updatePassword} className="space-y-5">
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <div className="space-y-2 lg:col-span-2">
                                        <Label htmlFor="current_password">
                                            Current password
                                        </Label>

                                        <div className="relative">
                                            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />

                                            <Input
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                value={data.current_password}
                                                onChange={(e) =>
                                                    setData(
                                                        'current_password',
                                                        e.target.value,
                                                    )
                                                }
                                                type={
                                                    showCurrentPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className="h-11 rounded-[12px] border-border/70 bg-background pl-10 pr-10 shadow-sm"
                                                autoComplete="current-password"
                                                placeholder="Enter current password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        (value) => !value,
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>

                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            New password
                                        </Label>

                                        <div className="relative">
                                            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />

                                            <Input
                                                id="password"
                                                ref={passwordInput}
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                type={
                                                    showNewPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className="h-11 rounded-[12px] border-border/70 bg-background pl-10 pr-10 shadow-sm"
                                                autoComplete="new-password"
                                                placeholder="Enter new password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        (value) => !value,
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm password
                                        </Label>

                                        <div className="relative">
                                            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />

                                            <Input
                                                id="password_confirmation"
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    )
                                                }
                                                type={
                                                    showConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                className="h-11 rounded-[12px] border-border/70 bg-background pl-10 pr-10 shadow-sm"
                                                autoComplete="new-password"
                                                placeholder="Confirm new password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (value) => !value,
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>

                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end border-t border-border/60 pt-5">
                                    <Button
                                        disabled={processing}
                                        className="h-11 rounded-[12px] px-6 font-semibold shadow-sm"
                                    >
                                        {processing && (
                                            <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        )}
                                        Save password
                                    </Button>
                                </div>
                            </form>
                        </section>

                        <aside className="rounded-[24px] border border-border/70 bg-card p-6 shadow-sm">
                            <div className="flex size-11 items-center justify-center rounded-[15px] border border-border/70 bg-background text-primary shadow-sm">
                                <ShieldCheck className="size-5" />
                            </div>

                            <h2 className="mt-5 text-base font-bold tracking-tight text-foreground">
                                Password security
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Use a unique password that you do not use on
                                other websites or applications.
                            </p>

                            <div className="mt-6 space-y-3">
                                <div className="rounded-[16px] border border-border/60 bg-background/70 p-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        Recommended
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        At least 8 characters with uppercase,
                                        lowercase, numbers, and symbols.
                                    </p>
                                </div>

                                <div className="rounded-[16px] border border-border/60 bg-background/70 p-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        Keep it private
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Never share your password with anyone,
                                        including support or administrators.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}