import { AppPagination, type PaginationData } from '@/components/shared/app-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock3, Laptop, LogIn, LogOut, MapPin, ScrollText, ShieldCheck, type LucideIcon } from 'lucide-react';

type LoginEvent = 'login_success' | 'login_failed' | 'logout';

type LoginActivityRecord = {
    id: number;
    event_type: LoginEvent;
    ip_address: string | null;
    browser: string | null;
    platform: string | null;
    device_type: string | null;
    session_id: string | null;
    occurred_at: string | null;
};

type LoginActivityProps = {
    activities: PaginationData & {
        data: LoginActivityRecord[];
    };
    filters: {
        event: string;
    };
    summary: {
        total: number;
        successful: number;
        failed: number;
        logouts: number;
    };
    currentSessionId: string;
    tableReady: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Login activity',
        href: '/settings/login-activity',
    },
];

const filters = [
    { value: '', label: 'All activity' },
    { value: 'login_success', label: 'Successful' },
    { value: 'login_failed', label: 'Failed' },
    { value: 'logout', label: 'Logouts' },
] as const;

function formatDate(value: string | null): string {
    if (!value) return 'Date unavailable';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
}

function eventDetails(event: LoginEvent) {
    if (event === 'login_success') {
        return {
            label: 'Successful login',
            icon: LogIn,
            classes: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
        };
    }

    if (event === 'login_failed') {
        return {
            label: 'Failed login',
            icon: AlertTriangle,
            classes: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
        };
    }

    return {
        label: 'Logged out',
        icon: LogOut,
        classes: 'border-border/70 bg-background/45 text-muted-foreground',
    };
}

export default function LoginActivity({ activities, filters: activeFilters, summary, currentSessionId, tableReady }: LoginActivityProps) {
    const changeFilter = (event: string) => {
        router.get(route('login-activity.index'), event ? { event } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Login activity" />

            <SettingsLayout>
                <section className="border-primary/15 from-primary/[0.055] via-card/70 to-card/40 overflow-hidden rounded-2xl border bg-gradient-to-br">
                    <div className="border-border/60 flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className="border-primary/20 bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl border">
                                <ScrollText className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-primary text-[10px] font-semibold tracking-[0.13em] uppercase">Account security</p>
                                <h1 className="text-foreground mt-1 text-lg font-semibold tracking-tight">Login activity</h1>
                                <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                                    Review sign-ins, failed attempts, and logouts linked to your account.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/[0.07] text-primary h-7 w-fit rounded-full px-2.5 text-[10px] font-semibold"
                        >
                            <ShieldCheck className="mr-1.5 size-3.5" />
                            Security history
                        </Badge>
                    </div>

                    {!tableReady ? (
                        <div className="m-5 border-l-2 border-amber-400 bg-amber-500/[0.045] px-4 py-3">
                            <p className="text-xs font-semibold text-amber-300">Login history table not installed</p>
                            <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                Import database/sql/create_login_activities_table.sql into jcm_saas_db, then sign in again.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="border-border/60 grid gap-3 border-b p-5 sm:grid-cols-2 xl:grid-cols-4">
                                <SummaryCard label="Total records" value={summary.total} icon={Clock3} />
                                <SummaryCard label="Successful" value={summary.successful} icon={CheckCircle2} />
                                <SummaryCard label="Failed" value={summary.failed} icon={AlertTriangle} />
                                <SummaryCard label="Logouts" value={summary.logouts} icon={LogOut} />
                            </div>

                            <div className="border-border/60 border-b px-5 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {filters.map((filter) => (
                                        <Button
                                            key={filter.value || 'all'}
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => changeFilter(filter.value)}
                                            className={cn(
                                                'h-8 rounded-lg px-3 text-[10px]',
                                                activeFilters.event === filter.value
                                                    ? 'border-primary/35 bg-primary/[0.08] text-primary'
                                                    : 'border-border/70 bg-background/35 text-muted-foreground',
                                            )}
                                        >
                                            {filter.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="divide-border/60 divide-y">
                                {activities.data.length === 0 ? (
                                    <div className="px-5 py-12 text-center">
                                        <ScrollText className="text-muted-foreground/50 mx-auto size-8" />
                                        <p className="text-foreground mt-3 text-sm font-semibold">No login activity found</p>
                                        <p className="text-muted-foreground mt-1 text-xs">New sign-ins and logouts will appear here.</p>
                                    </div>
                                ) : (
                                    activities.data.map((activity) => {
                                        const details = eventDetails(activity.event_type);
                                        const Icon = details.icon;
                                        const isCurrentSession =
                                            activity.session_id !== null &&
                                            activity.session_id === currentSessionId &&
                                            activity.event_type === 'login_success';

                                        return (
                                            <article
                                                key={activity.id}
                                                className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                                            >
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <span
                                                        className={cn(
                                                            'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                                                            details.classes,
                                                        )}
                                                    >
                                                        <Icon className="size-4" />
                                                    </span>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-foreground text-xs font-semibold">{details.label}</p>
                                                            {isCurrentSession && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="h-5 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-2 text-[8px] font-semibold text-emerald-300"
                                                                >
                                                                    Current session
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Laptop className="size-3" />
                                                                {[activity.browser, activity.platform, activity.device_type]
                                                                    .filter(Boolean)
                                                                    .join(' · ') || 'Unknown device'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <MapPin className="size-3" />
                                                                {activity.ip_address || 'IP unavailable'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-muted-foreground shrink-0 text-[10px] font-medium">
                                                    {formatDate(activity.occurred_at)}
                                                </p>
                                            </article>
                                        );
                                    })
                                )}
                            </div>

                            <AppPagination pagination={activities} itemLabel="activity records" />
                        </>
                    )}
                </section>
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
