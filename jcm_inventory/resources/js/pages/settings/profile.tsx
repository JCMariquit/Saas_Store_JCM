import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, CircleUserRound, Mail, Save } from 'lucide-react';
import { type FormEventHandler, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileProps = {
    mustVerifyEmail: boolean;
    status?: string;
};

export default function Profile({ mustVerifyEmail, status }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const initials = useMemo(() => {
        return auth.user.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('');
    }, [auth.user.name]);

    const emailVerified = auth.user.email_verified_at !== null;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="min-w-0 space-y-5">
                    <section className="border-primary/20 from-primary/[0.08] via-card/70 to-card/40 overflow-hidden rounded-2xl border bg-gradient-to-br">
                        <div className="border-border/60 flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <span className="border-primary/25 bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border">
                                    <CircleUserRound className="size-5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-primary text-[10px] font-semibold tracking-[0.13em] uppercase">Account settings</p>
                                    <h1 className="text-foreground mt-1 text-lg font-semibold tracking-tight">Profile information</h1>
                                    <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                                        Update your account name and email address.
                                    </p>
                                </div>
                            </div>

                            <Badge
                                variant="outline"
                                className={
                                    emailVerified
                                        ? 'h-7 w-fit rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 text-[10px] font-semibold text-emerald-300'
                                        : 'h-7 w-fit rounded-full border-amber-500/20 bg-amber-500/[0.07] px-2.5 text-[10px] font-semibold text-amber-300'
                                }
                            >
                                {emailVerified ? <BadgeCheck className="mr-1.5 size-3.5" /> : <Mail className="mr-1.5 size-3.5" />}
                                {emailVerified ? 'Email verified' : 'Verification required'}
                            </Badge>
                        </div>

                        <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                            <aside className="border-border/60 bg-background/20 border-b p-5 lg:border-r lg:border-b-0">
                                <div className="flex items-center gap-3">
                                    <div className="border-primary/25 bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold">
                                        {initials || 'U'}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-foreground truncate text-sm font-semibold">{auth.user.name}</p>
                                        <p className="text-muted-foreground mt-1 truncate text-[10px]">{auth.user.email}</p>
                                    </div>
                                </div>
                            </aside>

                            <div className="min-w-0 p-5 md:p-6">
                                <div className="mb-5">
                                    <p className="text-foreground text-sm font-semibold">Account identity</p>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">Edit the details linked to your account.</p>
                                </div>

                                <form onSubmit={submit} className="max-w-3xl space-y-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-semibold">
                                                Full name
                                            </Label>{' '}
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(event) => setData('name', event.target.value)}
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                                disabled={processing}
                                                className="h-10"
                                            />
                                            <InputError className="mt-1" message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-semibold">
                                                Email address
                                            </Label>{' '}
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(event) => setData('email', event.target.value)}
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                                disabled={processing}
                                                className="h-10"
                                            />
                                            <InputError className="mt-1" message={errors.email} />
                                        </div>
                                    </div>

                                    {mustVerifyEmail && !emailVerified && (
                                        <div className="border-l-2 border-amber-400 bg-amber-500/[0.045] px-4 py-3">
                                            <div className="flex items-start gap-3">
                                                <Mail className="mt-0.5 size-4 shrink-0 text-amber-400" />

                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-amber-300">Email verification pending</p>
                                                    <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                                        Verify your email address to keep account recovery and security notices available.
                                                    </p>

                                                    <Link
                                                        href={route('verification.send')}
                                                        method="post"
                                                        as="button"
                                                        className="mt-2 inline-flex text-[10px] font-semibold text-amber-300 underline underline-offset-4 transition-colors hover:text-amber-200 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                                                    >
                                                        Re-send verification email
                                                    </Link>

                                                    {status === 'verification-link-sent' && (
                                                        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                                                            <CheckCircle2 className="size-3.5" />A new verification link has been sent.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-border/60 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        {' '}
                                        <div className="flex items-center gap-3">
                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out duration-200"
                                                enterFrom="opacity-0 -translate-y-1"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in-out duration-150"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                                                    <CheckCircle2 className="size-3.5" />
                                                    Changes saved
                                                </p>
                                            </Transition>

                                            <Button type="submit" disabled={processing} className="h-10 rounded-lg px-4 text-xs">
                                                <Save className="size-3.5" />
                                                {processing ? 'Saving...' : 'Save changes'}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
