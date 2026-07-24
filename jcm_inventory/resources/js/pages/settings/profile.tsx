import DeleteUser from '@/components/delete-user';
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
import {
    BadgeCheck,
    CheckCircle2,
    CircleUserRound,
    Mail,
    Save,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
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

export default function Profile({
    mustVerifyEmail,
    status,
}: ProfileProps) {
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
                    <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/70 to-card/40">
                        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                                    <CircleUserRound className="size-5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">
                                        Account settings
                                    </p>
                                    <h1 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                                        Profile information
                                    </h1>
                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                        Maintain the account identity used across JCM Inventory operations.
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
                                {emailVerified ? (
                                    <BadgeCheck className="mr-1.5 size-3.5" />
                                ) : (
                                    <Mail className="mr-1.5 size-3.5" />
                                )}
                                {emailVerified
                                    ? 'Email verified'
                                    : 'Verification required'}
                            </Badge>
                        </div>

                        <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                            <aside className="border-b border-border/60 bg-background/20 p-5 lg:border-b-0 lg:border-r">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-sm font-semibold text-primary">
                                        {initials || 'U'}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {auth.user.name}
                                        </p>
                                        <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                            {auth.user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 divide-y divide-border/60 border-y border-border/60">
                                    <ProfileFact
                                        icon={UserRound}
                                        label="Account name"
                                        value={auth.user.name}
                                    />
                                    <ProfileFact
                                        icon={Mail}
                                        label="Email status"
                                        value={
                                            emailVerified
                                                ? 'Verified'
                                                : 'Pending verification'
                                        }
                                        valueClassName={
                                            emailVerified
                                                ? 'text-emerald-400'
                                                : 'text-amber-400'
                                        }
                                    />
                                    <ProfileFact
                                        icon={ShieldCheck}
                                        label="Access"
                                        value="Authenticated account"
                                    />
                                </div>

                                <p className="mt-4 text-[10px] leading-5 text-muted-foreground">
                                    Changes to your name and email will be reflected in account activity and operational records.
                                </p>
                            </aside>

                            <div className="min-w-0 p-5 md:p-6">
                                <div className="mb-5">
                                    <p className="text-sm font-semibold text-foreground">
                                        Account identity
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Keep your official account name and primary email address accurate.
                                    </p>
                                </div>

                                <form
                                    onSubmit={submit}
                                    className="max-w-3xl space-y-5"
                                >
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-xs font-semibold"
                                            >
                                                Full name
                                            </Label>
                                            <p className="min-h-4 text-[10px] text-muted-foreground">
                                                Used in system records and account activity.
                                            </p>

                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(event) =>
                                                    setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                                disabled={processing}
                                                className="h-10"
                                            />

                                            <InputError
                                                className="mt-1"
                                                message={errors.name}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-xs font-semibold"
                                            >
                                                Email address
                                            </Label>
                                            <p className="min-h-4 text-[10px] text-muted-foreground">
                                                Used for login, recovery, and account notices.
                                            </p>

                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                                disabled={processing}
                                                className="h-10"
                                            />

                                            <InputError
                                                className="mt-1"
                                                message={errors.email}
                                            />
                                        </div>
                                    </div>

                                    {mustVerifyEmail && !emailVerified && (
                                        <div className="border-l-2 border-amber-400 bg-amber-500/[0.045] px-4 py-3">
                                            <div className="flex items-start gap-3">
                                                <Mail className="mt-0.5 size-4 shrink-0 text-amber-400" />

                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-amber-300">
                                                        Email verification pending
                                                    </p>
                                                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                                                        Verify your email address to keep account recovery and security notices available.
                                                    </p>

                                                    <Link
                                                        href={route(
                                                            'verification.send',
                                                        )}
                                                        method="post"
                                                        as="button"
                                                        className="mt-2 inline-flex text-[10px] font-semibold text-amber-300 underline underline-offset-4 transition-colors hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                                    >
                                                        Re-send verification email
                                                    </Link>

                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                                                            <CheckCircle2 className="size-3.5" />
                                                            A new verification link has been sent.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-[10px] leading-5 text-muted-foreground">
                                            Review the information above before saving account changes.
                                        </p>

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

                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-10 rounded-lg px-4 text-xs"
                                            >
                                                <Save className="size-3.5" />
                                                {processing
                                                    ? 'Saving...'
                                                    : 'Save changes'}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-red-500/15 bg-card/30">
                        <div className="border-b border-border/60 px-5 py-4">
                            <p className="text-sm font-semibold text-foreground">
                                Account removal
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Permanent account actions are isolated from normal profile maintenance.
                            </p>
                        </div>

                        <div className="p-5">
                            <DeleteUser />
                        </div>
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function ProfileFact({
    icon: Icon,
    label,
    value,
    valueClassName = 'text-foreground/80',
}: {
    icon: typeof UserRound;
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-center gap-3 py-3">
            <Icon className="size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    {label}
                </p>
                <p
                    className={`mt-1 truncate text-[10px] font-semibold ${valueClassName}`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}