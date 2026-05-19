import { Form, Head } from '@inertiajs/react';
import {
    LockKeyhole,
    ShieldBan,
    ShieldCheck,
    ShieldQuestion,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable, show } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();

    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />

            <SettingsLayout>
                <section className="w-full overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm">
                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.04] via-background to-background px-8 py-8">
                        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                    <LockKeyhole className="size-6" />
                                </div>

                                <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                            Two-Factor Authentication
                                        </h1>

                                        {twoFactorEnabled ? (
                                            <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                                                Enabled
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="destructive"
                                                className="border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/10"
                                            >
                                                Disabled
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Add an extra layer of protection to your
                                        account by requiring a secure code during
                                        sign in.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur xl:w-[240px]">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        {twoFactorEnabled ? (
                                            <ShieldCheck className="size-5" />
                                        ) : (
                                            <ShieldQuestion className="size-5" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            2FA Status
                                        </p>

                                        <p className="text-sm font-semibold text-foreground">
                                            {twoFactorEnabled
                                                ? 'Strong Protection'
                                                : 'Not Enabled'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Security Verification
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Manage your account login verification.
                                </p>
                            </div>

                            {twoFactorEnabled ? (
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                                <ShieldCheck className="size-5" />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    Two-factor authentication is
                                                    enabled
                                                </h3>

                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    You will be prompted for a
                                                    secure, random code during
                                                    login using your
                                                    TOTP-supported
                                                    authentication app.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border bg-muted/[0.15] p-5">
                                        <TwoFactorRecoveryCodes
                                            recoveryCodesList={
                                                recoveryCodesList
                                            }
                                            fetchRecoveryCodes={
                                                fetchRecoveryCodes
                                            }
                                            errors={errors}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Disable two-factor authentication
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Your account will no longer ask
                                                for a secure code during login.
                                            </p>
                                        </div>

                                        <Form {...disable.form()}>
                                            {({ processing }) => (
                                                <Button
                                                    variant="destructive"
                                                    type="submit"
                                                    disabled={processing}
                                                    size="lg"
                                                    className="h-11 rounded-xl px-6 shadow-sm"
                                                >
                                                    <ShieldBan className="size-4" />
                                                    {processing
                                                        ? 'Disabling...'
                                                        : 'Disable 2FA'}
                                                </Button>
                                            )}
                                        </Form>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                                                <ShieldQuestion className="size-5" />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    Two-factor authentication is
                                                    disabled
                                                </h3>

                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    Enable 2FA to require a
                                                    secure code during login.
                                                    This code can be retrieved
                                                    from a TOTP-supported
                                                    application on your phone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Enable two-factor authentication
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Set up your authenticator app and
                                                recovery codes.
                                            </p>
                                        </div>

                                        <div>
                                            {hasSetupData ? (
                                                <Button
                                                    onClick={() =>
                                                        setShowSetupModal(true)
                                                    }
                                                    size="lg"
                                                    className="h-11 rounded-xl px-6 shadow-sm"
                                                >
                                                    <ShieldCheck className="size-4" />
                                                    Continue Setup
                                                </Button>
                                            ) : (
                                                <Form
                                                    {...enable.form()}
                                                    onSuccess={() =>
                                                        setShowSetupModal(true)
                                                    }
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                processing
                                                            }
                                                            size="lg"
                                                            className="h-11 rounded-xl px-6 shadow-sm"
                                                        >
                                                            <ShieldCheck className="size-4" />
                                                            {processing
                                                                ? 'Enabling...'
                                                                : 'Enable 2FA'}
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="h-fit rounded-2xl border border-primary/10 bg-primary/[0.03] p-5">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Sparkles className="size-4" />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            2FA Tips
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            Two-factor authentication helps
                                            protect your account even if your
                                            password is compromised.
                                        </p>
                                    </div>

                                    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                                        <li>• Use an authenticator app</li>
                                        <li>• Save your recovery codes</li>
                                        <li>• Do not share login codes</li>
                                        <li>• Keep backup access secure</li>
                                    </ul>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>

                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />
            </SettingsLayout>
        </AppLayout>
    );
}