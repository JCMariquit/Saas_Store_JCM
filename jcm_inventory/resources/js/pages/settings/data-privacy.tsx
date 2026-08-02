import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Database,
    Download,
    EyeOff,
    FileJson,
    Fingerprint,
    KeyRound,
    Layers3,
    LockKeyhole,
    ScrollText,
    ShieldCheck,
    UserRound,
    type LucideIcon,
} from 'lucide-react';

type DataPrivacyProps = {
    account: {
        name: string;
        email: string;
        email_verified: boolean;
        created_at: string | null;
        updated_at: string | null;
    };
    summary: {
        product_accesses: number;
        access_scopes: number;
        login_activities: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data & privacy',
        href: '/settings/data-privacy',
    },
];

function formatDate(value: string | null): string {
    if (!value) return 'Not available';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export default function DataPrivacy({ account, summary }: DataPrivacyProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data & privacy" />

            <SettingsLayout>
                <div className="space-y-5">
                    <section className="border-primary/15 from-primary/[0.055] via-card/70 to-card/40 overflow-hidden rounded-2xl border bg-gradient-to-br">
                        <div className="border-border/60 flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <span className="border-primary/20 bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border">
                                    <Fingerprint className="size-5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-primary text-[10px] font-semibold tracking-[0.13em] uppercase">Privacy controls</p>
                                    <h1 className="text-foreground mt-1 text-lg font-semibold tracking-tight">Data & privacy</h1>
                                    <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                                        Review the account data stored for authentication and product access.
                                    </p>
                                </div>
                            </div>

                            <Badge
                                variant="outline"
                                className="border-primary/20 bg-primary/[0.07] text-primary h-7 w-fit rounded-full px-2.5 text-[10px] font-semibold"
                            >
                                <ShieldCheck className="mr-1.5 size-3.5" />
                                Private account data
                            </Badge>
                        </div>

                        <div className="grid gap-3 p-5 sm:grid-cols-3">
                            <SummaryCard label="Product access" value={summary.product_accesses} icon={Layers3} />
                            <SummaryCard label="Access scopes" value={summary.access_scopes} icon={LockKeyhole} />
                            <SummaryCard label="Login records" value={summary.login_activities} icon={ScrollText} />
                        </div>
                    </section>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <section className="border-border/70 bg-card/35 overflow-hidden rounded-2xl border">
                            <div className="border-border/60 border-b px-5 py-4">
                                <p className="text-foreground text-sm font-semibold">Data connected to your account</p>
                            </div>

                            <div className="divide-border/60 divide-y">
                                <DataCategory
                                    icon={UserRound}
                                    title="Identity"
                                    description="Name, email address, verification status, and account timestamps."
                                />
                                <DataCategory
                                    icon={Layers3}
                                    title="Product access"
                                    description="Assigned products, account owner context, user type, role, and branch or warehouse scopes."
                                />
                                <DataCategory
                                    icon={KeyRound}
                                    title="Security activity"
                                    description="Login events, device details, browser, IP address, and event time."
                                />
                                <DataCategory
                                    icon={Database}
                                    title="Operational references"
                                    description="Inventory transactions may retain your user ID as an actor or creator for audit integrity."
                                />
                            </div>
                        </section>

                        <div className="space-y-5">
                            <section className="border-border/70 bg-card/35 rounded-2xl border p-5">
                                <div className="flex items-start gap-3">
                                    <span className="border-primary/20 bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border">
                                        <FileJson className="size-4.5" />
                                    </span>
                                    <div>
                                        <p className="text-foreground text-sm font-semibold">Download account data</p>
                                        <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                            Export your profile, product access, scopes, preferences, and login activity as JSON.
                                        </p>
                                    </div>
                                </div>

                                <Button asChild className="mt-4 h-10 w-full rounded-lg text-xs">
                                    <a href={route('data-privacy.export')}>
                                        <Download className="size-3.5" />
                                        Download JSON export
                                    </a>
                                </Button>
                            </section>

                            <section className="border-border/70 bg-card/35 rounded-2xl border p-5">
                                <p className="text-foreground text-sm font-semibold">Account record</p>
                                <div className="divide-border/60 border-border/60 mt-3 divide-y border-y">
                                    <AccountFact label="Name" value={account.name} />
                                    <AccountFact label="Email" value={account.email} />
                                    <AccountFact label="Verification" value={account.email_verified ? 'Verified' : 'Not verified'} />
                                    <AccountFact label="Created" value={formatDate(account.created_at)} />
                                    <AccountFact label="Updated" value={formatDate(account.updated_at)} />
                                </div>
                            </section>
                        </div>
                    </div>

                    <section className="border-border/70 bg-card/35 rounded-2xl border p-5">
                        <div className="flex items-start gap-3">
                            <EyeOff className="text-primary mt-0.5 size-4 shrink-0" />
                            <div>
                                <p className="text-foreground text-xs font-semibold">Sensitive authentication values are excluded</p>
                                <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                    Password hashes, remember tokens, two-factor secrets, recovery codes, and session payloads are never included in
                                    the export.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
    return (
        <div className="border-border/70 bg-background/35 rounded-xl border p-3.5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.1em] uppercase">{label}</p>
                <Icon className="text-primary size-3.5" />
            </div>
            <p className="text-foreground mt-2 text-lg font-semibold">{value}</p>
        </div>
    );
}

function DataCategory({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
    return (
        <div className="flex items-start gap-3 px-5 py-4">
            <span className="border-border/70 bg-background/35 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border">
                <Icon className="size-4" />
            </span>
            <div>
                <p className="text-foreground text-xs font-semibold">{title}</p>
                <p className="text-muted-foreground mt-1 text-[10px] leading-5">{description}</p>
            </div>
        </div>
    );
}

function AccountFact({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <p className="text-muted-foreground text-[9px] font-medium tracking-[0.1em] uppercase">{label}</p>
            <p className="text-foreground/85 max-w-[190px] text-right text-[10px] font-semibold break-words">{value}</p>
        </div>
    );
}
