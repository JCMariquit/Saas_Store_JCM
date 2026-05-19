import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Mail,
    ShieldCheck,
    Sparkles,
    UserRound,
} from 'lucide-react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
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

    const initials = auth.user.name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <section className="w-full overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm">
                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.04] via-background to-background px-8 py-8">
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary ring-1 ring-primary/15">
                                    {initials}
                                </div>

                                <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                                            {auth.user.name}
                                        </h1>

                                        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                                            Active
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="size-4" />
                                        <span className="truncate">
                                            {auth.user.email}
                                        </span>
                                    </div>

                                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Manage your personal information and keep
                                        your account details updated.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur xl:w-[240px]">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <ShieldCheck className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Account Status
                                        </p>

                                        <p className="text-sm font-semibold text-foreground">
                                            Verified Account
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="px-8 py-8"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                                <div className="space-y-8">
                                    <div className="space-y-1">
                                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                            Personal Information
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Update your profile information
                                            below.
                                        </p>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-sm font-medium"
                                            >
                                                Full Name
                                            </Label>

                                            <div className="relative">
                                                <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue={auth.user.name}
                                                    required
                                                    autoComplete="name"
                                                    placeholder="Full name"
                                                    className="h-12 rounded-xl border-border/60 pl-11 shadow-sm transition-all focus-visible:ring-2"
                                                />
                                            </div>

                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm font-medium"
                                            >
                                                Email Address
                                            </Label>

                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    defaultValue={
                                                        auth.user.email
                                                    }
                                                    required
                                                    autoComplete="username"
                                                    placeholder="Email address"
                                                    className="h-12 rounded-xl border-border/60 pl-11 shadow-sm transition-all focus-visible:ring-2"
                                                />
                                            </div>

                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at === null && (
                                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                                                <div className="flex gap-3">
                                                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-500" />

                                                    <div>
                                                        <p className="font-medium text-amber-700 dark:text-amber-300">
                                                            Your email address is
                                                            not verified.
                                                        </p>

                                                        <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">
                                                            Verify your email
                                                            address to fully
                                                            secure your account.
                                                        </p>

                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
                                                        >
                                                            Resend verification
                                                            email
                                                        </Link>

                                                        {status ===
                                                            'verification-link-sent' && (
                                                            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
                                                                A new verification
                                                                link has been sent.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Profile changes are saved
                                                instantly.
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Your account information will
                                                update immediately after saving.
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
                                                    Profile updated
                                                </div>
                                            </Transition>

                                            <Button
                                                disabled={processing}
                                                size="lg"
                                                className="h-11 rounded-xl px-6 shadow-sm"
                                                data-test="update-profile-button"
                                            >
                                                {processing
                                                    ? 'Saving...'
                                                    : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <aside className="h-fit rounded-2xl border border-primary/10 bg-primary/[0.03] p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Sparkles className="size-4" />
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    Profile Tips
                                                </h3>

                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    Keep your information accurate
                                                    for better account security
                                                    and communication.
                                                </p>
                                            </div>

                                            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                                                <li>• Use your real full name</li>
                                                <li>• Keep your email updated</li>
                                                <li>• Verify your email address</li>
                                                <li>• Review account security regularly</li>
                                            </ul>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        )}
                    </Form>

                    <div className="border-t px-8 py-8">
                        <DeleteUser />
                    </div>
                </section>
            </SettingsLayout>
        </AppLayout>
    );
}