import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Mail,
    ShieldAlert,
    User,
    UserCircle2,
} from 'lucide-react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const {
        data,
        setData,
        patch,
        errors,
        processing,
        recentlySuccessful,
    } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        {/* Main Profile Card */}
                        <section className="rounded-[24px] border border-border/70 bg-card p-6 shadow-sm">
                            <div className="mb-8 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-[18px] border border-border/70 bg-background text-primary shadow-sm">
                                        <UserCircle2 className="size-7" />
                                    </div>

                                    <div>
                                        <h1 className="text-lg font-bold tracking-tight text-foreground">
                                            Profile information
                                        </h1>

                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            Update your personal details and
                                            account email.
                                        </p>
                                    </div>
                                </div>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        <CheckCircle2 className="size-3.5" />
                                        Saved
                                    </div>
                                </Transition>
                            </div>

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <div className="space-y-2 lg:col-span-2">
                                        <Label htmlFor="name">
                                            Full name
                                        </Label>

                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />

                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                autoComplete="name"
                                                placeholder="Enter full name"
                                                className="h-11 rounded-[12px] border-border/70 bg-background pl-10 shadow-sm"
                                            />
                                        </div>

                                        <InputError
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="space-y-2 lg:col-span-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>

                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />

                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                                className="h-11 rounded-[12px] border-border/70 bg-background pl-10 shadow-sm"
                                            />
                                        </div>

                                        <InputError
                                            message={errors.email}
                                        />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at ===
                                        null && (
                                        <div className="rounded-[18px] border border-amber-500/20 bg-amber-500/10 p-4">
                                            <div className="flex gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-amber-600 shadow-sm">
                                                    <ShieldAlert className="size-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-amber-700">
                                                        Email not verified
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-amber-700/80">
                                                        Your email address
                                                        has not been
                                                        verified yet.
                                                    </p>

                                                    <Link
                                                        href={route(
                                                            'verification.send',
                                                        )}
                                                        method="post"
                                                        as="button"
                                                        className="mt-3 text-sm font-semibold text-amber-700 underline underline-offset-4 hover:text-amber-800"
                                                    >
                                                        Resend
                                                        verification
                                                        email
                                                    </Link>

                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <div className="mt-2 text-xs font-medium text-emerald-600">
                                                            Verification
                                                            email sent.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                <div className="flex justify-end border-t border-border/60 pt-5">
                                    <Button
                                        disabled={processing}
                                        className="h-11 rounded-[12px] px-6 font-semibold shadow-sm"
                                    >
                                        Save changes
                                    </Button>
                                </div>
                            </form>
                        </section>

                        {/* Right Info Panel */}
                        <aside className="rounded-[24px] border border-border/70 bg-card p-6 shadow-sm">
                            <div className="flex size-11 items-center justify-center rounded-[15px] border border-border/70 bg-background text-primary shadow-sm">
                                <UserCircle2 className="size-5" />
                            </div>

                            <h2 className="mt-5 text-base font-bold tracking-tight text-foreground">
                                Profile details
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Keep your personal information updated for
                                better account security and notifications.
                            </p>

                            <div className="mt-6 space-y-3">
                                <div className="rounded-[16px] border border-border/60 bg-background/70 p-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        Account owner
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {auth.user.name}
                                    </p>
                                </div>

                                <div className="rounded-[16px] border border-border/60 bg-background/70 p-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        Email status
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {auth.user.email_verified_at
                                            ? 'Verified'
                                            : 'Pending verification'}
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}