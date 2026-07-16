import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    CircleUserRound,
    Clock3,
    KeyRound,
    Mail,
    ShieldCheck,
    UserCog,
    Users,
    UserX,
    type LucideIcon,
} from 'lucide-react';
import { type ReactNode } from 'react';

type SignalTone = 'emerald' | 'blue' | 'violet' | 'amber';

type TeamOverviewProps = {
    context: {
        productName: string;
        productCode: string;
        productStatus: string;
        accountOwnerId: number;
    };
    summary: {
        total: number;
        active: number;
        inactive: number;
        managers: number;
        staff: number;
        verified: number;
        unverified: number;
        assignedToBranch: number;
        unassignedToBranch: number;
    };
    accessHealth: {
        operational: number;
        restricted: number;
        pending: number;
        total: number;
    };
    roleDistribution: RoleDistribution[];
    branchCoverage: BranchCoverage[];
    onboardingTrend: TrendPoint[];
    recentMembers: TeamMember[];
    signals: TeamSignal[];
};

type RoleDistribution = {
    key: string;
    label: string;
    count: number;
    percentage: number;
};

type BranchCoverage = {
    id: number;
    name: string;
    code: string;
    isMain: boolean;
    isActive: boolean;
    total: number;
    active: number;
    managers: number;
    staff: number;
};

type TrendPoint = {
    label: string;
    count: number;
};

type TeamMember = {
    id: number;
    accessId: number;
    name: string;
    email: string;
    roleCode: string;
    roleName: string;
    branch: {
        id: number;
        name: string;
        code: string;
        isMain: boolean;
        isActive: boolean;
    } | null;
    accessStatus: string;
    accountIsActive: boolean;
    isOperational: boolean;
    isVerified: boolean;
    joinedAt: string | null;
};

type TeamSignal = {
    key: string;
    label: string;
    description: string;
    tone: SignalTone;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Team Overview',
        href: '/team/overview',
    },
];

export default function TeamOverviewIndex({
    context,
    summary,
    accessHealth,
    roleDistribution,
    branchCoverage,
    onboardingTrend,
    recentMembers,
    signals,
}: TeamOverviewProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Overview" />

            <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 md:gap-4 md:p-4">
                <TeamOverviewHeader
                    context={context}
                    summary={summary}
                />

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Team Accounts"
                        value={summary.total}
                        description="Manager and staff access"
                        icon={Users}
                        tone="blue"
                        footnote={`${summary.assignedToBranch} branch assigned`}
                    />

                    <MetricCard
                        label="Operational Access"
                        value={summary.active}
                        description="Ready to use inventory"
                        icon={CheckCircle2}
                        tone="emerald"
                        footnote={`${summary.inactive} restricted`}
                    />

                    <MetricCard
                        label="Managers"
                        value={summary.managers}
                        description="Management-level users"
                        icon={UserCog}
                        tone="violet"
                        footnote={percentageLabel(
                            summary.managers,
                            summary.total,
                        )}
                    />

                    <MetricCard
                        label="Staff"
                        value={summary.staff}
                        description="Operational team users"
                        icon={CircleUserRound}
                        tone="amber"
                        footnote={percentageLabel(
                            summary.staff,
                            summary.total,
                        )}
                    />
                </section>

                <section className="grid min-w-0 gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <Panel
                        title="Access Readiness"
                        description="Combined account and product-access status."
                        icon={ShieldCheck}
                        badge={`${accessHealth.total} accounts`}
                    >
                        <AccessHealthDonut
                            health={accessHealth}
                        />
                    </Panel>

                    <Panel
                        title="Role Distribution"
                        description="Current workforce composition by operational role."
                        icon={Users}
                        badge={`${roleDistribution.length} roles`}
                    >
                        <RoleDistributionChart
                            roles={roleDistribution}
                        />
                    </Panel>
                </section>

                <section className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <Panel
                        title="Branch Coverage"
                        description="Team allocation and operational readiness by branch."
                        icon={Building2}
                        badge={`${branchCoverage.length} branches`}
                    >
                        <BranchCoverageList
                            branches={branchCoverage}
                        />
                    </Panel>

                    <Panel
                        title="Team Onboarding"
                        description="New team access created during the last six weeks."
                        icon={Clock3}
                        badge={`${onboardingTrend.reduce(
                            (sum, point) =>
                                sum + point.count,
                            0,
                        )} new`}
                    >
                        <OnboardingChart
                            points={onboardingTrend}
                        />
                    </Panel>
                </section>

                <section className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <DashboardPanel
                        title="Recent Team Members"
                        description="Latest manager and staff accounts added to inventory."
                        icon={Users}
                        href="/team/members"
                        actionLabel="Manage Team"
                    >
                        {recentMembers.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {recentMembers.map((member) => (
                                    <RecentMemberRow
                                        key={member.accessId}
                                        member={member}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={UserX}
                                title="No team members yet"
                                description="Create a manager or staff account to begin building the inventory team."
                            />
                        )}
                    </DashboardPanel>

                    <DashboardPanel
                        title="Governance Signals"
                        description="Immediate access, identity, and assignment checks."
                        icon={KeyRound}
                        href="/team/roles"
                        actionLabel="Review Roles"
                    >
                        <div className="space-y-2 p-3">
                            {signals.map((signal) => (
                                <SignalCard
                                    key={signal.key}
                                    signal={signal}
                                />
                            ))}
                        </div>
                    </DashboardPanel>
                </section>
            </main>
        </AppLayout>
    );
}

function TeamOverviewHeader({
    context,
    summary,
}: {
    context: TeamOverviewProps['context'];
    summary: TeamOverviewProps['summary'];
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/75 shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(139,92,246,0.09),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(59,130,246,0.07),transparent_26%)]" />

            <div className="relative flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-violet-400">
                        <Users className="size-5" />

                        <span className="absolute -right-1 -top-1 size-2 rounded-full border-2 border-card bg-emerald-400" />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-base font-semibold tracking-tight">
                                Team Operations Overview
                            </h1>

                            <span className="inline-flex h-5 items-center rounded-full border border-violet-500/15 bg-violet-500/[0.06] px-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-300">
                                Workforce Dashboard
                            </span>
                        </div>

                        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">
                            Monitor workforce readiness, role
                            composition, branch assignment, and
                            access health for {context.productName}.
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <HeaderPill
                                icon={Users}
                                label={`${summary.total} team accounts`}
                            />

                            <HeaderPill
                                icon={BadgeCheck}
                                label={`${summary.verified} verified`}
                            />

                            <HeaderPill
                                icon={Building2}
                                label={`${summary.assignedToBranch} assigned`}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/team/roles"
                        prefetch
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 bg-background/45 px-3 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <KeyRound className="size-3.5" />
                        Roles & Access
                    </Link>

                    <Link
                        href="/team/members"
                        prefetch
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-violet-500 px-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-violet-500/90"
                    >
                        <Users className="size-3.5" />
                        Team Members
                    </Link>
                </div>
            </div>
        </section>
    );
}

function HeaderPill({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/35 px-2 py-1 text-[9px] text-muted-foreground">
            <Icon className="size-3" />
            {label}
        </span>
    );
}

function MetricCard({
    label,
    value,
    description,
    icon: Icon,
    tone,
    footnote,
}: {
    label: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: SignalTone;
    footnote: string;
}) {
    const styles: Record<
        SignalTone,
        {
            icon: string;
            value: string;
        }
    > = {
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
        },
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
        },
    };

    const style = styles[tone];

    return (
        <article className="rounded-2xl border border-border/60 bg-card/70 p-3.5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {label}
                    </p>

                    <p
                        className={[
                            'mt-2 text-2xl font-semibold leading-none tabular-nums',
                            style.value,
                        ].join(' ')}
                    >
                        {formatNumber(value)}
                    </p>
                </div>

                <span
                    className={[
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                        style.icon,
                    ].join(' ')}
                >
                    <Icon className="size-4" />
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-[10px] text-muted-foreground">
                    {description}
                </p>

                <span className="shrink-0 rounded-full border border-border/60 bg-background/40 px-2 py-1 text-[8px] font-medium text-muted-foreground">
                    {footnote}
                </span>
            </div>
        </article>
    );
}

function Panel({
    title,
    description,
    icon: Icon,
    badge,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    badge: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-muted-foreground">
                        <Icon className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                <span className="inline-flex h-6 shrink-0 items-center rounded-full border border-border/60 bg-background/40 px-2.5 text-[9px] font-medium text-muted-foreground">
                    {badge}
                </span>
            </div>

            <div className="p-4">{children}</div>
        </section>
    );
}

function AccessHealthDonut({
    health,
}: {
    health: TeamOverviewProps['accessHealth'];
}) {
    const total = Math.max(health.total, 1);
    const operational =
        (health.operational / total) * 100;
    const restricted =
        (health.restricted / total) * 100;
    const pending = (health.pending / total) * 100;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const operationalLength =
        (operational / 100) * circumference;
    const restrictedLength =
        (restricted / 100) * circumference;
    const pendingLength =
        (pending / 100) * circumference;

    return (
        <div className="grid items-center gap-4 sm:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-1">
            <div className="relative mx-auto size-[145px]">
                <svg
                    viewBox="0 0 140 140"
                    className="size-full -rotate-90"
                    aria-label="Team access readiness donut chart"
                >
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="13"
                        className="text-muted/70"
                    />

                    {health.total > 0 && (
                        <>
                            <circle
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="13"
                                strokeLinecap="round"
                                strokeDasharray={`${operationalLength} ${
                                    circumference -
                                    operationalLength
                                }`}
                                className="text-emerald-400"
                            />

                            <circle
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="13"
                                strokeLinecap="round"
                                strokeDasharray={`${restrictedLength} ${
                                    circumference -
                                    restrictedLength
                                }`}
                                strokeDashoffset={
                                    -operationalLength
                                }
                                className="text-amber-400"
                            />

                            <circle
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="13"
                                strokeLinecap="round"
                                strokeDasharray={`${pendingLength} ${
                                    circumference -
                                    pendingLength
                                }`}
                                strokeDashoffset={
                                    -(
                                        operationalLength +
                                        restrictedLength
                                    )
                                }
                                className="text-blue-400"
                            />
                        </>
                    )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-semibold tabular-nums">
                        {health.total > 0
                            ? `${Math.round(
                                  operational,
                              )}%`
                            : '0%'}
                    </p>

                    <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                        Operational
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <LegendRow
                    label="Operational"
                    value={health.operational}
                    dotClassName="bg-emerald-400"
                />

                <LegendRow
                    label="Restricted"
                    value={health.restricted}
                    dotClassName="bg-amber-400"
                />

                <LegendRow
                    label="Pending"
                    value={health.pending}
                    dotClassName="bg-blue-400"
                />
            </div>
        </div>
    );
}

function LegendRow({
    label,
    value,
    dotClassName,
}: {
    label: string;
    value: number;
    dotClassName: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/35 px-3 py-2">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium">
                <span
                    className={[
                        'size-2.5 rounded-full',
                        dotClassName,
                    ].join(' ')}
                />
                {label}
            </span>

            <span className="text-xs font-semibold tabular-nums">
                {formatNumber(value)}
            </span>
        </div>
    );
}

function RoleDistributionChart({
    roles,
}: {
    roles: RoleDistribution[];
}) {
    if (roles.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title="No role distribution yet"
                description="Role composition will appear after manager or staff accounts are created."
            />
        );
    }

    const colors: Record<string, string> = {
        manager: 'bg-violet-400',
        staff: 'bg-blue-400',
    };

    return (
        <div className="space-y-3">
            {roles.map((role) => (
                <div
                    key={role.key}
                    className="rounded-xl border border-border/50 bg-background/35 p-3"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
                                {role.key === 'manager' ? (
                                    <UserCog className="size-3.5" />
                                ) : (
                                    <CircleUserRound className="size-3.5" />
                                )}
                            </span>

                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold">
                                    {role.label}
                                </p>

                                <p className="mt-0.5 text-[8px] text-muted-foreground">
                                    {role.percentage.toFixed(1)}
                                    % of team
                                </p>
                            </div>
                        </div>

                        <span className="text-lg font-semibold tabular-nums">
                            {formatNumber(role.count)}
                        </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className={[
                                'h-full rounded-full transition-all duration-500',
                                colors[role.key] ??
                                    'bg-emerald-400',
                            ].join(' ')}
                            style={{
                                width: `${role.percentage}%`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function BranchCoverageList({
    branches,
}: {
    branches: BranchCoverage[];
}) {
    if (branches.length === 0) {
        return (
            <EmptyState
                icon={Building2}
                title="No branches available"
                description="Create an inventory branch before assigning manager and staff accounts."
            />
        );
    }

    const maxMembers = Math.max(
        ...branches.map((branch) => branch.total),
        1,
    );

    return (
        <div className="space-y-2">
            {branches.map((branch) => (
                <div
                    key={branch.id}
                    className="grid gap-3 rounded-xl border border-border/50 bg-background/35 p-3 sm:grid-cols-[minmax(170px,0.8fr)_minmax(0,1fr)_150px]"
                >
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/10 text-blue-400">
                            <Building2 className="size-3.5" />
                        </span>

                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="truncate text-[11px] font-semibold">
                                    {branch.name}
                                </p>

                                {branch.isMain && (
                                    <span className="rounded-full border border-blue-500/15 bg-blue-500/[0.06] px-1.5 py-0.5 text-[7px] font-semibold text-blue-300">
                                        MAIN
                                    </span>
                                )}
                            </div>

                            <p className="mt-0.5 font-mono text-[8px] text-muted-foreground">
                                {branch.code}
                            </p>
                        </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-violet-400"
                                style={{
                                    width: `${
                                        (branch.total /
                                            maxMembers) *
                                        100
                                    }%`,
                                }}
                            />
                        </div>

                        <span className="w-7 text-right text-xs font-semibold tabular-nums">
                            {branch.total}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        <MiniCount
                            label="Active"
                            value={branch.active}
                        />
                        <MiniCount
                            label="Mgr"
                            value={branch.managers}
                        />
                        <MiniCount
                            label="Staff"
                            value={branch.staff}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function MiniCount({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-lg border border-border/50 bg-card px-2 py-1.5 text-center">
            <p className="text-[7px] uppercase tracking-wider text-muted-foreground">
                {label}
            </p>

            <p className="mt-0.5 text-[10px] font-semibold tabular-nums">
                {value}
            </p>
        </div>
    );
}

function OnboardingChart({
    points,
}: {
    points: TrendPoint[];
}) {
    const max = Math.max(
        ...points.map((point) => point.count),
        1,
    );

    return (
        <div className="flex h-[170px] items-end gap-2">
            {points.map((point) => {
                const height =
                    point.count > 0
                        ? Math.max(
                              (point.count / max) * 100,
                              8,
                          )
                        : 0;

                return (
                    <div
                        key={point.label}
                        className="flex min-w-0 flex-1 flex-col items-center justify-end"
                    >
                        <span className="mb-1 text-[9px] font-semibold tabular-nums">
                            {point.count}
                        </span>

                        <div className="flex h-[120px] w-full items-end justify-center rounded-lg bg-background/25 px-1.5">
                            <div
                                title={`${point.count} new accounts`}
                                className="w-full max-w-7 rounded-t-md bg-violet-400/85 transition-all duration-500"
                                style={{
                                    height: `${height}%`,
                                }}
                            />
                        </div>

                        <p className="mt-2 truncate text-center text-[8px] text-muted-foreground">
                            {point.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

function DashboardPanel({
    title,
    description,
    icon: Icon,
    href,
    actionLabel,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    actionLabel: string;
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-muted-foreground">
                        <Icon className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold">
                            {title}
                        </h2>

                        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                <Link
                    href={href}
                    prefetch
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/40 px-2.5 text-[9px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                    {actionLabel}
                    <ArrowRight className="size-3" />
                </Link>
            </div>

            {children}
        </section>
    );
}

function RecentMemberRow({
    member,
}: {
    member: TeamMember;
}) {
    return (
        <article className="flex items-center gap-3 px-4 py-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-[10px] font-semibold text-violet-300">
                {memberInitials(member.name)}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-[11px] font-semibold">
                        {member.name}
                    </p>

                    {member.isVerified && (
                        <BadgeCheck className="size-3 text-emerald-400" />
                    )}

                    <span className="rounded-full border border-border/60 bg-background/40 px-1.5 py-0.5 text-[7px] font-medium text-muted-foreground">
                        {member.roleName}
                    </span>
                </div>

                <p className="mt-1 flex max-w-full items-center gap-1.5 truncate text-[9px] text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    {member.email}
                </p>
            </div>

            <div className="hidden min-w-[125px] sm:block">
                <p className="truncate text-right text-[9px] font-medium">
                    {member.branch?.name ?? 'Unassigned'}
                </p>

                <p className="mt-1 text-right text-[8px] text-muted-foreground">
                    {formatDate(member.joinedAt)}
                </p>
            </div>

            <span
                className={[
                    'size-2.5 shrink-0 rounded-full',
                    member.isOperational
                        ? 'bg-emerald-400'
                        : member.accessStatus ===
                            'pending'
                          ? 'bg-blue-400'
                          : 'bg-amber-400',
                ].join(' ')}
                title={
                    member.isOperational
                        ? 'Operational'
                        : member.accessStatus
                }
            />
        </article>
    );
}

function SignalCard({
    signal,
}: {
    signal: TeamSignal;
}) {
    const styles: Record<
        SignalTone,
        {
            shell: string;
            icon: string;
            component: LucideIcon;
        }
    > = {
        emerald: {
            shell: 'border-emerald-500/15 bg-emerald-500/[0.045]',
            icon: 'bg-emerald-500/10 text-emerald-400',
            component: CheckCircle2,
        },
        blue: {
            shell: 'border-blue-500/15 bg-blue-500/[0.045]',
            icon: 'bg-blue-500/10 text-blue-400',
            component: BadgeCheck,
        },
        violet: {
            shell: 'border-violet-500/15 bg-violet-500/[0.045]',
            icon: 'bg-violet-500/10 text-violet-400',
            component: Building2,
        },
        amber: {
            shell: 'border-amber-500/15 bg-amber-500/[0.045]',
            icon: 'bg-amber-500/10 text-amber-400',
            component: AlertTriangle,
        },
    };

    const style = styles[signal.tone];
    const Icon = style.component;

    return (
        <div
            className={[
                'rounded-xl border px-3 py-2.5',
                style.shell,
            ].join(' ')}
        >
            <div className="flex items-start gap-2.5">
                <span
                    className={[
                        'inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                        style.icon,
                    ].join(' ')}
                >
                    <Icon className="size-3.5" />
                </span>

                <div className="min-w-0">
                    <p className="text-[10px] font-semibold">
                        {signal.label}
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground">
                        {signal.description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[150px] flex-col items-center justify-center px-6 py-8 text-center">
            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-muted-foreground">
                <Icon className="size-4.5" />
            </span>

            <p className="mt-3 text-sm font-semibold">
                {title}
            </p>

            <p className="mt-1 max-w-sm text-[10px] leading-5 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function percentageLabel(
    value: number,
    total: number,
): string {
    if (total <= 0) {
        return '0% of team';
    }

    return `${Math.round(
        (value / total) * 100,
    )}% of team`;
}

function memberInitials(name: string): string {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return 'TM';
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${
        parts[parts.length - 1][0]
    }`.toUpperCase();
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Date unavailable';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}