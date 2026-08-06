import {
    ModuleEmpty,
    ModuleMetric,
    ModulePageHeader,
    ModuleStatus,
} from '@/components/admin-ui/module-workspace';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock3,
    Database,
    Gauge,
    HeartPulse,
    RefreshCw,
    ServerCrash,
    TriangleAlert,
} from 'lucide-react';

type Check = {
    key: string;
    label: string;
    status: string;
    message: string;
    value?: number | string | null;
    unit?: string | null;
};

type Snapshot = {
    id?: number;
    overall_status: string;
    checks: Check[];
    response_time_ms: number;
    created_at: string;
    checked_by_name?: string | null;
};

type History = {
    id: number;
    overall_status: string;
    response_time_ms: number;
    created_at: string;
    checked_by_name?: string | null;
};

type Props = {
    latest: Snapshot;
    history: History[];
    stats: {
        healthy: number;
        degraded: number;
        critical: number;
        last_response_ms: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operations', href: '/admin/system-health' },
    { title: 'System Health', href: '/admin/system-health' },
];

function iconForCheck(key: string) {
    if (key === 'database') return Database;
    if (key === 'storage') return ServerCrash;
    if (key === 'queue' || key === 'failed_jobs') return Activity;
    if (key === 'subscriptions') return CheckCircle2;
    return Gauge;
}

export default function SystemHealth({ latest, history, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Health" />

            <div className="space-y-5">
                <ModulePageHeader
                    eyebrow="Operational Reliability"
                    title="System Health"
                    description="Run platform diagnostics for database availability, required tables, storage permissions, queue backlog, failed jobs, subscriptions, and pending payments."
                    actions={
                        <Button
                            type="button"
                            onClick={() =>
                                router.post('/admin/system-health/run')
                            }
                            className="rounded-xl"
                        >
                            <RefreshCw className="size-4" />
                            Run health check
                        </Button>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ModuleMetric
                        label="Current status"
                        value={latest.overall_status.toUpperCase()}
                        hint="Latest diagnostic result"
                        icon={HeartPulse}
                    />
                    <ModuleMetric
                        label="Response time"
                        value={`${latest.response_time_ms ?? stats.last_response_ms} ms`}
                        hint="Complete health scan"
                        icon={Clock3}
                    />
                    <ModuleMetric
                        label="Degraded runs"
                        value={stats.degraded}
                        hint="Historical warnings"
                        icon={TriangleAlert}
                    />
                    <ModuleMetric
                        label="Critical runs"
                        value={stats.critical}
                        hint="Historical failures"
                        icon={ServerCrash}
                    />
                </div>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4">
                        <div>
                            <h2 className="text-foreground text-sm font-semibold">
                                Latest diagnostic checks
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {latest.created_at
                                    ? `Checked ${new Date(latest.created_at).toLocaleString()}`
                                    : 'Live, unsaved diagnostic preview'}
                                {latest.checked_by_name
                                    ? ` by ${latest.checked_by_name}`
                                    : ''}
                            </p>
                        </div>
                        <ModuleStatus value={latest.overall_status} />
                    </div>

                    {!latest.checks || latest.checks.length === 0 ? (
                        <ModuleEmpty
                            icon={HeartPulse}
                            title="No health checks available"
                            description="Run the first platform health check to create a diagnostic snapshot."
                        />
                    ) : (
                        <div className="grid gap-3 p-4 lg:grid-cols-2">
                            {latest.checks.map((check) => {
                                const Icon = iconForCheck(check.key);
                                return (
                                    <article
                                        key={check.key}
                                        className="border-border/70 bg-background rounded-2xl border p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                                <Icon className="size-4" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <h3 className="text-foreground text-sm font-semibold">
                                                        {check.label}
                                                    </h3>
                                                    <ModuleStatus
                                                        value={check.status}
                                                    />
                                                </div>
                                                <p className="text-muted-foreground mt-2 text-xs leading-5">
                                                    {check.message}
                                                </p>
                                                {check.value !== null &&
                                                    check.value !== undefined && (
                                                        <p className="text-primary mt-3 text-xs font-semibold tabular-nums">
                                                            {check.value}{' '}
                                                            {check.unit ?? ''}
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 border-b px-4 py-4">
                        <h2 className="text-foreground text-sm font-semibold">
                            Health check history
                        </h2>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Last 30 saved diagnostic runs.
                        </p>
                    </div>

                    {history.length === 0 ? (
                        <ModuleEmpty
                            icon={Activity}
                            title="No saved health history"
                            description="Run a health check to begin recording platform status."
                        />
                    ) : (
                        <div className="divide-border/60 divide-y">
                            {history.map((snapshot) => (
                                <div
                                    key={snapshot.id}
                                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <ModuleStatus
                                                value={snapshot.overall_status}
                                            />
                                            <span className="text-foreground text-xs font-semibold">
                                                {snapshot.response_time_ms} ms
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground mt-2 text-[10px]">
                                            {new Date(
                                                snapshot.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground text-xs">
                                        {snapshot.checked_by_name ??
                                            'System administrator'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
