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
import {
    CheckCircle2,
    KeyRound,
    LockKeyhole,
    Save,
    ShieldCheck,
} from 'lucide-react';
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

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
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

    const passwordsMatch =
        data.password.length > 0 &&
        data.password === data.password_confirmation;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <section className="overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.065] via-card/70 to-card/40">
                    <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                <KeyRound className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-emerald-300">
                                    Security settings
                                </p>
                                <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                                    Update password
                                </h1>
                                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                    Replace your current password while keeping your account access protected.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="h-7 w-fit rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 text-[10px] font-semibold text-emerald-300"
                        >
                            <ShieldCheck className="mr-1.5 size-3.5" />
                            Protected access
                        </Badge>
                    </div>

                    <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="border-b border-border/60 bg-background/20 p-5 lg:border-b-0 lg:border-r">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                    <LockKeyhole className="size-4.5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        Password security
                                    </p>
                                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                                        Use a password that is difficult to guess and not reused on other accounts.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 divide-y divide-border/60 border-y border-border/60">
                                <SecurityFact
                                    label="Current credential"
                                    value="Required for confirmation"
                                />
                                <SecurityFact
                                    label="New credential"
                                    value="Validated by the system"
                                />
                                <SecurityFact
                                    label="Confirmation"
                                    value="Must match the new password"
                                />
                            </div>

                            <div className="mt-4 border-l-2 border-emerald-400 bg-emerald-500/[0.04] px-3 py-2.5">
                                <p className="text-[10px] font-semibold text-emerald-300">
                                    Security reminder
                                </p>
                                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                    Avoid names, birthdays, common phrases, and passwords already used elsewhere.
                                </p>
                            </div>
                        </aside>

                        <div className="min-w-0 p-5 md:p-6">
                            <div className="mb-5">
                                <p className="text-sm font-semibold text-foreground">
                                    Change account password
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Confirm your existing password before registering a replacement.
                                </p>
                            </div>

                            <form
                                onSubmit={updatePassword}
                                className="max-w-4xl space-y-5"
                            >
                                <div className="max-w-2xl space-y-2">
                                    <Label
                                        htmlFor="current_password"
                                        className="text-xs font-semibold"
                                    >
                                        Current password
                                    </Label>
                                    <p className="min-h-4 text-[10px] text-muted-foreground">
                                        Used to verify that you are authorized to change this credential.
                                    </p>

                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(event) =>
                                            setData(
                                                'current_password',
                                                event.target.value,
                                            )
                                        }
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Enter current password"
                                        disabled={processing}
                                        className="h-10"
                                    />

                                    <InputError
                                        className="mt-1"
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-semibold"
                                        >
                                            New password
                                        </Label>
                                        <p className="min-h-4 text-[10px] text-muted-foreground">
                                            Choose a new password that is unique to this account.
                                        </p>

                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            value={data.password}
                                            onChange={(event) =>
                                                setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                            disabled={processing}
                                            className="h-10"
                                        />

                                        <InputError
                                            className="mt-1"
                                            message={errors.password}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-xs font-semibold"
                                        >
                                            Confirm new password
                                        </Label>
                                        <p className="min-h-4 text-[10px] text-muted-foreground">
                                            Re-enter the new password exactly as provided.
                                        </p>

                                        <Input
                                            id="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(event) =>
                                                setData(
                                                    'password_confirmation',
                                                    event.target.value,
                                                )
                                            }
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
                                            disabled={processing}
                                            className="h-10"
                                        />

                                        <InputError
                                            className="mt-1"
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                </div>

                                {data.password_confirmation.length > 0 && (
                                    <div
                                        className={
                                            passwordsMatch
                                                ? 'border-l-2 border-emerald-400 bg-emerald-500/[0.04] px-3 py-2.5'
                                                : 'border-l-2 border-amber-400 bg-amber-500/[0.04] px-3 py-2.5'
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            {passwordsMatch ? (
                                                <CheckCircle2 className="size-3.5 text-emerald-400" />
                                            ) : (
                                                <KeyRound className="size-3.5 text-amber-400" />
                                            )}
                                            <p
                                                className={
                                                    passwordsMatch
                                                        ? 'text-[10px] font-semibold text-emerald-300'
                                                        : 'text-[10px] font-semibold text-amber-300'
                                                }
                                            >
                                                {passwordsMatch
                                                    ? 'Password confirmation matches'
                                                    : 'Password confirmation does not match yet'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-h-5">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                                                <CheckCircle2 className="size-3.5" />
                                                Password updated successfully
                                            </p>
                                        </Transition>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-10 min-w-40 rounded-lg px-4 text-xs"
                                    >
                                        <Save className="size-3.5" />
                                        {processing
                                            ? 'Updating...'
                                            : 'Update password'}
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

function SecurityFact({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-[10px] font-medium text-foreground/85">
                {value}
            </p>
        </div>
    );
}