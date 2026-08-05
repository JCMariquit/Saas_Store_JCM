import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, KeyRound, LockKeyhole, Save, ShieldCheck } from 'lucide-react';
import { type FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (event) => {
        event.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const passwordsMatch = data.password.length > 0 && data.password === data.password_confirmation;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <section className="border-primary/15 from-primary/[0.065] via-card/70 to-card/40 overflow-hidden rounded-2xl border bg-gradient-to-br">
                    <div className="border-border/60 flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className="border-primary/20 bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border">
                                <KeyRound className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-primary text-[10px] font-semibold tracking-[0.13em] uppercase">Security settings</p>
                                <h1 className="text-foreground mt-1 text-lg font-semibold tracking-tight">Update password</h1>
                                <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">Change your account password.</p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/[0.07] text-primary h-7 w-fit rounded-full px-2.5 text-[10px] font-semibold"
                        >
                            <ShieldCheck className="mr-1.5 size-3.5" />
                            Protected access
                        </Badge>
                    </div>

                    <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="border-border/60 bg-background/20 border-b p-5 lg:border-r lg:border-b-0">
                            <div className="flex items-start gap-3">
                                <span className="border-primary/20 bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border">
                                    <LockKeyhole className="size-4.5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-foreground text-sm font-semibold">Password security</p>
                                    <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                        Use a strong password that you do not use elsewhere.
                                    </p>
                                </div>
                            </div>
                            <div className="border-primary bg-primary/[0.04] mt-4 border-l-2 px-3 py-2.5">
                                <p className="text-primary text-[10px] font-semibold">Security reminder</p>
                                <p className="text-muted-foreground mt-1 text-[9px] leading-4">Avoid names, birthdays, and common passwords.</p>
                            </div>
                        </aside>

                        <div className="min-w-0 p-5 md:p-6">
                            <div className="mb-5">
                                <p className="text-foreground text-sm font-semibold">Change account password</p>
                                <p className="text-muted-foreground mt-1 text-xs leading-5">Enter your current password, then create a new one.</p>
                            </div>

                            <form onSubmit={updatePassword} className="max-w-4xl space-y-5">
                                <div className="max-w-2xl space-y-2">
                                    <Label htmlFor="current_password" className="text-xs font-semibold">
                                        Current password
                                    </Label>{' '}
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(event) => setData('current_password', event.target.value)}
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Enter current password"
                                        disabled={processing}
                                        className="h-10"
                                    />
                                    <InputError className="mt-1" message={errors.current_password} />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-xs font-semibold">
                                            New password
                                        </Label>{' '}
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            value={data.password}
                                            onChange={(event) => setData('password', event.target.value)}
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                            disabled={processing}
                                            className="h-10"
                                        />
                                        <InputError className="mt-1" message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                            Confirm new password
                                        </Label>{' '}
                                        <Input
                                            id="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(event) => setData('password_confirmation', event.target.value)}
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
                                            disabled={processing}
                                            className="h-10"
                                        />
                                        <InputError className="mt-1" message={errors.password_confirmation} />
                                    </div>
                                </div>

                                {data.password_confirmation.length > 0 && (
                                    <div
                                        className={
                                            passwordsMatch
                                                ? 'border-primary bg-primary/[0.04] border-l-2 px-3 py-2.5'
                                                : 'border-l-2 border-amber-400 bg-amber-500/[0.04] px-3 py-2.5'
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            {passwordsMatch ? (
                                                <CheckCircle2 className="text-primary size-3.5" />
                                            ) : (
                                                <KeyRound className="size-3.5 text-amber-400" />
                                            )}
                                            <p
                                                className={
                                                    passwordsMatch
                                                        ? 'text-primary text-[10px] font-semibold'
                                                        : 'text-[10px] font-semibold text-amber-300'
                                                }
                                            >
                                                {passwordsMatch ? 'Password confirmation matches' : 'Password confirmation does not match yet'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="border-border/60 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-h-5">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-primary inline-flex items-center gap-1.5 text-[10px] font-semibold">
                                                <CheckCircle2 className="size-3.5" />
                                                Password updated successfully
                                            </p>
                                        </Transition>
                                    </div>

                                    <Button type="submit" disabled={processing} className="h-10 min-w-40 rounded-lg px-4 text-xs">
                                        <Save className="size-3.5" />
                                        {processing ? 'Updating...' : 'Update password'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </SettingsLayout>
        </AppLayout>
    );
}
