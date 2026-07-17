import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    CircleUserRound,
    Clock3,
    Database,
    KeyRound,
    Mail,
    Network,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    UserCog,
    UserPlus,
    Users,
    UserX,
    type LucideIcon,
} from 'lucide-react';
import {
    type ReactNode,
    useId,
    useMemo,
} from 'react';

type SignalTone =
    | 'emerald'
    | 'blue'
    | 'violet'
    | 'amber';

type AccentTone =
    | 'violet'
    | 'blue'
    | 'emerald'
    | 'amber';

type StatusTone =
    | 'neutral'
    | 'violet'
    | 'blue'
    | 'emerald'
    | 'amber';

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

type Point = {
    x: number;
    y: number;
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
    const onboardingTotal = useMemo(
        () =>
            onboardingTrend.reduce(
                (sum, point) => sum + point.count,
                0,
            ),
        [onboardingTrend],
    );

    const hasTeamData =
        summary.total > 0 ||
        recentMembers.length > 0 ||
        roleDistribution.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Overview" />

            <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4 md:gap-4 md:p-4">
                <TeamOverviewHeader
                    context={context}
                    summary={summary}
                    hasTeamData={hasTeamData}
                />

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Team Accounts"
                        value={summary.total}
                        description="Manager and staff access"
                        icon={Users}
                        tone="blue"
                        statusLabel={
                            summary.total > 0
                                ? `${summary.assignedToBranch} branch assigned`
                                : 'Directory ready'
                        }
                        statusTone={
                            summary.total > 0
                                ? 'blue'
                                : 'neutral'
                        }
                        sparkValues={onboardingTrend.map(
                            (point) => point.count,
                        )}
                    />

                    <MetricCard
                        label="Operational Access"
                        value={summary.active}
                        description="Ready to use inventory"
                        icon={CheckCircle2}
                        tone="emerald"
                        statusLabel={
                            summary.total <= 0
                                ? 'Access checks ready'
                                : summary.inactive <= 0
                                  ? 'All operational'
                                  : `${summary.inactive} restricted`
                        }
                        statusTone={
                            summary.total <= 0
                                ? 'neutral'
                                : summary.inactive <= 0
                                  ? 'emerald'
                                  : 'amber'
                        }
                        sparkValues={[
                            summary.active,
                            summary.inactive,
                            summary.active,
                            summary.verified,
                            summary.active,
                        ]}
                    />

                    <MetricCard
                        label="Managers"
                        value={summary.managers}
                        description="Management-level users"
                        icon={UserCog}
                        tone="violet"
                        statusLabel={
                            summary.total > 0
                                ? percentageLabel(
                                      summary.managers,
                                      summary.total,
                                  )
                                : 'Role ready'
                        }
                        statusTone={
                            summary.managers > 0
                                ? 'violet'
                                : 'neutral'
                        }
                        sparkValues={roleDistribution.map(
                            (role) =>
                                role.key === 'manager'
                                    ? role.count
                                    : 0,
                        )}
                    />

                    <MetricCard
                        label="Staff"
                        value={summary.staff}
                        description="Operational team users"
                        icon={CircleUserRound}
                        tone="amber"
                        statusLabel={
                            summary.total > 0
                                ? percentageLabel(
                                      summary.staff,
                                      summary.total,
                                  )
                                : 'Role ready'
                        }
                        statusTone={
                            summary.staff > 0
                                ? 'amber'
                                : 'neutral'
                        }
                        sparkValues={roleDistribution.map(
                            (role) =>
                                role.key === 'staff'
                                    ? role.count
                                    : 0,
                        )}
                    />
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <OverviewPanel
                        title="Access Readiness"
                        description="Combined account, product-access, and identity status."
                        icon={ShieldCheck}
                        badge={
                            accessHealth.total > 0
                                ? `${accessHealth.total} accounts`
                                : 'Monitoring ready'
                        }
                        accent="violet"
                    >
                        <AccessHealthGauge
                            health={accessHealth}
                        />
                    </OverviewPanel>

                    <OverviewPanel
                        title="Role Distribution"
                        description="Workforce composition across configured operational roles."
                        icon={Users}
                        badge={
                            roleDistribution.length > 0
                                ? `${roleDistribution.length} roles`
                                : 'Composition ready'
                        }
                        accent="blue"
                    >
                        <RoleDistributionBoard
                            roles={roleDistribution}
                        />
                    </OverviewPanel>
                </section>

                <section className="grid min-w-0 items-start gap-3 md:gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <OverviewPanel
                        title="Branch Coverage"
                        description="Team allocation and operational readiness by branch."
                        icon={Building2}
                        badge={
                            branchCoverage.length > 0
                                ? `${branchCoverage.length} branches`
                                : 'Network ready'
                        }
                        accent="blue"
                    >
                        <BranchCoverageBoard
                            branches={branchCoverage}
                        />
                    </OverviewPanel>

                    <OverviewPanel
                        title="Team Onboarding"
                        description="New team access created during the last six weeks."
                        icon={Clock3}
                        badge={
                            onboardingTotal > 0
                                ? `${onboardingTotal} new`
                                : 'Trend ready'
                        }
                        accent="violet"
                    >
                        <OnboardingTrendChart
                            points={onboardingTrend}
                        />
                    </OverviewPanel>
                </section>

                <section className="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <DashboardPanel
                        title="Recent Team Members"
                        description="Latest manager and staff accounts added to inventory."
                        icon={Users}
                        href="/team/members"
                        actionLabel="Manage Team"
                        accent="violet"
                    >
                        {recentMembers.length > 0 ? (
                            <RecentMemberTable
                                members={recentMembers}
                            />
                        ) : (
                            <OperationalEmptyState
                                icon={UserPlus}
                                title="Team workspace is ready"
                                description="Create a manager or staff account to begin building the inventory operations team."
                                href="/team/members"
                                actionLabel="Add team member"
                                tone="violet"
                                pattern="people"
                            />
                        )}
                    </DashboardPanel>

                    <DashboardPanel
                        title="Governance Signals"
                        description="Immediate access, identity, and assignment checks."
                        icon={KeyRound}
                        href="/team/roles"
                        actionLabel="Review Roles"
                        accent="blue"
                    >
                        {signals.length > 0 ? (
                            <GovernanceSignalBoard
                                signals={signals}
                            />
                        ) : (
                            <OperationalEmptyState
                                icon={ShieldAlert}
                                title="Governance checks are ready"
                                description="Access, identity, and branch-assignment signals will appear automatically as the team grows."
                                href="/team/roles"
                                actionLabel="Configure access"
                                tone="blue"
                                pattern="signals"
                            />
                        )}
                    </DashboardPanel>
                </section>
            </main>
        </AppLayout>
    );
}

function TeamOverviewHeader({
    context,
    summary,
    hasTeamData,
}: {
    context: TeamOverviewProps['context'];
    summary: TeamOverviewProps['summary'];
    hasTeamData: boolean;
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-violet-500/15 bg-card/75 shadow-[0_12px_40px_rgba(139,92,246,0.06)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(139,92,246,0.13),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(59,130,246,0.08),transparent_28%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/55 to-transparent" />

            <div className="relative flex flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_48%)]" />
                        <Users className="relative size-5" />

                        <span
                            className={[
                                'absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-card',
                                hasTeamData
                                    ? 'bg-blue-400'
                                    : 'bg-violet-400',
                            ].join(' ')}
                        />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-base font-semibold tracking-tight">
                                Team Operations Overview
                            </h1>

                            <span
                                className={[
                                    'inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-[9px] font-semibold uppercase tracking-[0.12em]',
                                    hasTeamData
                                        ? 'border-blue-500/20 bg-blue-500/[0.07] text-blue-300'
                                        : 'border-violet-500/20 bg-violet-500/[0.07] text-violet-300',
                                ].join(' ')}
                            >
                                {hasTeamData ? (
                                    <Activity className="size-2.5" />
                                ) : (
                                    <Sparkles className="size-2.5" />
                                )}

                                {hasTeamData
                                    ? 'Live Workforce'
                                    : 'System Ready'}
                            </span>
                        </div>

                        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">
                            Monitor workforce readiness, role
                            composition, branch assignment, and
                            access health for{' '}
                            {context.productName}.
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
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.045] px-3 text-[10px] font-semibold text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200"
                    >
                        <KeyRound className="size-3.5" />
                        Roles & Access
                    </Link>

                    <Link
                        href="/team/members"
                        prefetch
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-violet-500 px-3 text-[10px] font-semibold text-white shadow-[0_7px_22px_rgba(139,92,246,0.20)] transition hover:bg-violet-500/90"
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/10 bg-violet-500/[0.035] px-2 py-1 text-[9px] text-muted-foreground">
            <Icon className="size-3 text-violet-400" />
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
    statusLabel,
    statusTone,
    sparkValues,
}: {
    label: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: AccentTone;
    statusLabel: string;
    statusTone: StatusTone;
    sparkValues: number[];
}) {
    const styles: Record<
        AccentTone,
        {
            icon: string;
            value: string;
            glow: string;
            line: string;
        }
    > = {
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
            value: 'text-violet-400',
            glow: 'from-violet-500/[0.075]',
            line: 'text-violet-400',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
            glow: 'from-blue-500/[0.075]',
            line: 'text-blue-400',
        },
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            glow: 'from-emerald-500/[0.075]',
            line: 'text-emerald-400',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            glow: 'from-amber-500/[0.075]',
            line: 'text-amber-400',
        },
    };

    const style = styles[tone];

    return (
        <article className="group relative min-h-[134px] overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-3.5 transition hover:border-violet-500/15 sm:p-4">
            <div
                className={[
                    'pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent opacity-80',
                    style.glow,
                ].join(' ')}
            />

            <div className="pointer-events-none absolute -bottom-2 right-2 h-12 w-[42%] opacity-60">
                <MetricSparkline
                    values={sparkValues}
                    toneClass={style.line}
                />
            </div>

            <div className="relative flex items-start justify-between gap-3">
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
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-sm',
                        style.icon,
                    ].join(' ')}
                >
                    <Icon className="size-4" />
                </span>
            </div>

            <div className="relative mt-4 flex items-end justify-between gap-3">
                <p className="truncate text-[10px] text-muted-foreground">
                    {description}
                </p>

                <StatusPill
                    label={statusLabel}
                    tone={statusTone}
                />
            </div>
        </article>
    );
}

function MetricSparkline({
    values,
    toneClass,
}: {
    values: number[];
    toneClass: string;
}) {
    const normalized =
        values.length >= 2
            ? values
            : [0, 0, 0, 0, 0];

    const hasValues = normalized.some(
        (value) => value > 0,
    );

    const max = Math.max(...normalized, 1);
    const points = normalized.map(
        (value, index) => ({
            x:
                normalized.length <= 1
                    ? 0
                    : (index /
                          (normalized.length -
                              1)) *
                      138,
            y: 38 - (value / max) * 30,
        }),
    );

    if (!hasValues) {
        return (
            <svg
                viewBox="0 0 140 40"
                className="size-full"
                aria-hidden="true"
            >
                <path
                    d="M 4 27 H 136"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeDasharray="4 5"
                    className="text-muted-foreground/25"
                />

                {[18, 52, 86, 120].map(
                    (x) => (
                        <circle
                            key={x}
                            cx={x}
                            cy="27"
                            r="2"
                            fill="currentColor"
                            className="text-violet-400/25"
                        />
                    ),
                )}
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 140 40"
            className={[
                'size-full',
                toneClass,
            ].join(' ')}
            aria-hidden="true"
        >
            <path
                d={createSmoothPath(points)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
            />

            <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="2.5"
                fill="currentColor"
                opacity="0.85"
            />
        </svg>
    );
}

function StatusPill({
    label,
    tone,
}: {
    label: string;
    tone: StatusTone;
}) {
    const toneClass: Record<
        StatusTone,
        string
    > = {
        neutral:
            'border-border/60 bg-background/45 text-muted-foreground',
        violet:
            'border-violet-500/15 bg-violet-500/10 text-violet-400',
        blue:
            'border-blue-500/15 bg-blue-500/10 text-blue-300',
        emerald:
            'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
        amber:
            'border-amber-500/15 bg-amber-500/10 text-amber-400',
    };

    return (
        <span
            className={[
                'inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[8px] font-semibold',
                toneClass[tone],
            ].join(' ')}
        >
            {label}
        </span>
    );
}

function OverviewPanel({
    title,
    description,
    icon: Icon,
    badge,
    accent,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    badge: string;
    accent: AccentTone;
    children: ReactNode;
}) {
    const styles = {
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/[0.06] text-violet-400',
            badge: 'border-violet-500/10 bg-violet-500/[0.035] text-violet-300/80',
            line: 'via-violet-400/45',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/[0.06] text-blue-400',
            badge: 'border-blue-500/10 bg-blue-500/[0.035] text-blue-300/80',
            line: 'via-blue-400/45',
        },
        emerald: {
            icon: 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400',
            badge: 'border-emerald-500/10 bg-emerald-500/[0.035] text-emerald-300/80',
            line: 'via-emerald-400/45',
        },
        amber: {
            icon: 'border-amber-500/15 bg-amber-500/[0.06] text-amber-400',
            badge: 'border-amber-500/10 bg-amber-500/[0.035] text-amber-300/80',
            line: 'via-amber-400/45',
        },
    }[accent];

    return (
        <section className="relative min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div
                className={[
                    'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
                    styles.line,
                ].join(' ')}
            />

            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className={[
                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                            styles.icon,
                        ].join(' ')}
                    >
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

                <span
                    className={[
                        'inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-[9px] font-medium',
                        styles.badge,
                    ].join(' ')}
                >
                    {badge}
                </span>
            </div>

            <div className="p-3.5 sm:p-4">
                {children}
            </div>
        </section>
    );
}

function AccessHealthGauge({
    health,
}: {
    health: TeamOverviewProps['accessHealth'];
}) {
    const total = Math.max(health.total, 1);
    const operational =
        (health.operational / total) * 100;
    const restricted =
        (health.restricted / total) * 100;
    const pending =
        (health.pending / total) * 100;
    const hasData = health.total > 0;

    const ringBackground = hasData
        ? `conic-gradient(
            rgb(52 211 153) 0% ${operational}%,
            rgb(251 191 36) ${operational}% ${
              operational + restricted
          }%,
            rgb(96 165 250) ${
                operational + restricted
            }% 100%
        )`
        : `conic-gradient(
            from 210deg,
            rgba(139,92,246,0.64),
            rgba(59,130,246,0.18),
            rgba(139,92,246,0.64)
        )`;

    return (
        <div className="flex min-h-[286px] flex-col justify-center">
            <div className="relative mx-auto size-[168px]">
                <div
                    className={[
                        'absolute inset-0 rounded-full',
                        hasData
                            ? 'shadow-[0_0_28px_rgba(139,92,246,0.10)]'
                            : 'shadow-[0_0_30px_rgba(139,92,246,0.13)]',
                    ].join(' ')}
                    style={{
                        background: ringBackground,
                    }}
                />

                <div className="absolute inset-[7px] rounded-full border border-dashed border-violet-500/10" />
                <div className="absolute inset-[11px] rounded-full border border-border/60 bg-card" />
                <div className="absolute inset-[20px] rounded-full border border-dashed border-violet-500/18" />
                <div className="absolute inset-[31px] rounded-full border border-dashed border-blue-500/10" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-3xl font-semibold tabular-nums">
                        {hasData
                            ? `${Math.round(
                                  operational,
                              )}%`
                            : '—'}
                    </p>

                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {hasData
                            ? 'Operational'
                            : 'Awaiting Team'}
                    </p>

                    <span
                        className={[
                            'mt-2 inline-flex rounded-full border px-2 py-1 text-[8px] font-medium',
                            hasData
                                ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
                                : 'border-violet-500/15 bg-violet-500/10 text-violet-300',
                        ].join(' ')}
                    >
                        {hasData
                            ? `${formatNumber(
                                  health.total,
                              )} team accounts`
                            : 'Access checks ready'}
                    </span>
                </div>
            </div>

            <div className="mt-4 grid gap-2">
                <AccessHealthRow
                    label="Operational"
                    value={health.operational}
                    description="Account and access active"
                    tone="emerald"
                />

                <AccessHealthRow
                    label="Restricted"
                    value={health.restricted}
                    description="Requires access review"
                    tone="amber"
                />

                <AccessHealthRow
                    label="Pending"
                    value={health.pending}
                    description="Awaiting activation"
                    tone="blue"
                />
            </div>
        </div>
    );
}

function AccessHealthRow({
    label,
    value,
    description,
    tone,
}: {
    label: string;
    value: number;
    description: string;
    tone: 'emerald' | 'amber' | 'blue';
}) {
    const styles = {
        emerald: {
            dot: 'bg-emerald-400',
            value: 'text-emerald-400',
        },
        amber: {
            dot: 'bg-amber-400',
            value: 'text-amber-400',
        },
        blue: {
            dot: 'bg-blue-400',
            value: 'text-blue-400',
        },
    }[tone];

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/30 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
                <span
                    className={[
                        'size-2.5 shrink-0 rounded-full shadow-sm',
                        styles.dot,
                    ].join(' ')}
                />

                <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium">
                        {label}
                    </p>

                    <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <span
                className={[
                    'text-xs font-semibold tabular-nums',
                    styles.value,
                ].join(' ')}
            >
                {formatNumber(value)}
            </span>
        </div>
    );
}

function RoleDistributionBoard({
    roles,
}: {
    roles: RoleDistribution[];
}) {
    if (roles.length === 0) {
        return <RoleDistributionReadyState />;
    }

    const total = roles.reduce(
        (sum, role) => sum + role.count,
        0,
    );
    const maxCount = Math.max(
        ...roles.map((role) => role.count),
        1,
    );

    const roleStyles: Record<
        string,
        {
            icon: LucideIcon;
            shell: string;
            bar: string;
            value: string;
        }
    > = {
        manager: {
            icon: UserCog,
            shell: 'border-violet-500/15 bg-violet-500/[0.055] text-violet-400',
            bar: 'from-violet-400 to-blue-400',
            value: 'text-violet-400',
        },
        staff: {
            icon: CircleUserRound,
            shell: 'border-blue-500/15 bg-blue-500/[0.055] text-blue-400',
            bar: 'from-blue-400 to-cyan-400',
            value: 'text-blue-400',
        },
    };

    return (
        <div>
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
                <RoleSummary
                    label="Configured Roles"
                    value={formatNumber(
                        roles.length,
                    )}
                    tone="violet"
                />

                <RoleSummary
                    label="Team Accounts"
                    value={formatNumber(total)}
                    tone="blue"
                />

                <RoleSummary
                    label="Largest Group"
                    value={
                        roles[0]?.label ?? '—'
                    }
                    tone="emerald"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-border/50 bg-background/25">
                <div className="hidden grid-cols-[minmax(180px,0.8fr)_minmax(0,1.4fr)_90px] items-center gap-4 border-b border-border/60 bg-background/45 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground sm:grid">
                    <span>Role</span>

                    <div className="grid grid-cols-4 text-center">
                        <span>0</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>

                    <span className="text-right">
                        Accounts
                    </span>
                </div>

                <div className="divide-y divide-border/60">
                    {roles.map((role) => {
                        const style =
                            roleStyles[role.key] ?? {
                                icon: Users,
                                shell: 'border-emerald-500/15 bg-emerald-500/[0.055] text-emerald-400',
                                bar: 'from-emerald-400 to-cyan-400',
                                value: 'text-emerald-400',
                            };
                        const Icon = style.icon;
                        const relativeWidth =
                            role.count > 0
                                ? Math.max(
                                      (role.count /
                                          maxCount) *
                                          100,
                                      5,
                                  )
                                : 0;

                        return (
                            <article
                                key={role.key}
                                className="grid gap-3 px-3 py-3 transition hover:bg-violet-500/[0.025] sm:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.4fr)_90px] sm:items-center sm:gap-4"
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span
                                        className={[
                                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                                            style.shell,
                                        ].join(' ')}
                                    >
                                        <Icon className="size-4" />
                                    </span>

                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] font-semibold">
                                            {role.label}
                                        </p>

                                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                                            {role.percentage.toFixed(
                                                1,
                                            )}
                                            % of workforce
                                        </p>
                                    </div>
                                </div>

                                <div className="relative h-8">
                                    <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full border border-border/40 bg-muted/75">
                                        <div
                                            className={[
                                                'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                                                style.bar,
                                            ].join(' ')}
                                            style={{
                                                width: `${relativeWidth}%`,
                                            }}
                                        />
                                    </div>

                                </div>

                                <div className="flex items-center justify-between border-t border-border/50 pt-2 sm:block sm:border-0 sm:pt-0 sm:text-right">
                                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
                                        Accounts
                                    </span>

                                    <div>
                                        <p
                                            className={[
                                                'text-xl font-semibold tabular-nums',
                                                style.value,
                                            ].join(' ')}
                                        >
                                            {formatNumber(
                                                role.count,
                                            )}
                                        </p>

                                        <p className="mt-0.5 hidden text-[8px] text-muted-foreground sm:block">
                                            accounts
                                        </p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function RoleSummary({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: 'violet' | 'blue' | 'emerald';
}) {
    const valueClass = {
        violet: 'text-violet-400',
        blue: 'text-blue-400',
        emerald: 'text-emerald-400',
    }[tone];

    return (
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    'mt-1 truncate text-sm font-semibold tabular-nums',
                    valueClass,
                ].join(' ')}
            >
                {value}
            </p>
        </div>
    );
}

function RoleDistributionReadyState() {
    const steps = [
        {
            label: 'Configure role access',
            href: '/team/roles',
            icon: KeyRound,
        },
        {
            label: 'Add a manager',
            href: '/team/members',
            icon: UserCog,
        },
        {
            label: 'Add operational staff',
            href: '/team/members',
            icon: CircleUserRound,
        },
    ];

    return (
        <div className="grid min-h-[250px] items-center gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/10 bg-violet-500/[0.025] p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(139,92,246,0.13),transparent_60%)]" />

                <div className="relative mx-auto flex max-w-[180px] items-end justify-center gap-3">
                    {[52, 82, 66].map(
                        (height, index) => (
                            <div
                                key={index}
                                className="relative flex h-32 flex-1 items-end overflow-hidden rounded-xl border border-border/50 bg-background/35 p-2"
                            >
                                <div
                                    className="w-full rounded-t-md bg-gradient-to-t from-violet-500/20 to-blue-400/50"
                                    style={{
                                        height: `${height}%`,
                                    }}
                                />

                                <span className="absolute left-2 top-2 text-[7px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    R{index + 1}
                                </span>
                            </div>
                        ),
                    )}
                </div>

                <div className="relative mx-auto mt-3 flex max-w-[180px] items-center justify-between rounded-xl border border-border/50 bg-background/35 px-3 py-2">
                    <span className="inline-flex items-center gap-2 text-[9px] text-muted-foreground">
                        <Users className="size-3.5 text-violet-400" />
                        Role composition
                    </span>

                    <span className="rounded-full border border-violet-500/15 bg-violet-500/10 px-2 py-1 text-[8px] font-medium text-violet-300">
                        Ready
                    </span>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold">
                    Workforce composition is ready
                </p>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    Manager and staff groups will
                    automatically form this role
                    distribution after team accounts are
                    created.
                </p>

                <div className="mt-3 space-y-2">
                    {steps.map(
                        ({
                            label,
                            href,
                            icon: Icon,
                        }) => (
                            <Link
                                key={label}
                                href={href}
                                prefetch
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-[9px] text-muted-foreground transition hover:border-violet-500/15 hover:bg-violet-500/[0.04] hover:text-violet-300"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Icon className="size-3.5 text-violet-400" />
                                    {label}
                                </span>

                                <ArrowRight className="size-3" />
                            </Link>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}

function BranchCoverageBoard({
    branches,
}: {
    branches: BranchCoverage[];
}) {
    if (branches.length === 0) {
        return <BranchCoverageReadyState />;
    }

    const totalAssigned = branches.reduce(
        (sum, branch) => sum + branch.total,
        0,
    );
    const activeAssigned = branches.reduce(
        (sum, branch) => sum + branch.active,
        0,
    );

    return (
        <div>
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
                <RoleSummary
                    label="Branch Network"
                    value={formatNumber(
                        branches.length,
                    )}
                    tone="blue"
                />

                <RoleSummary
                    label="Assigned Accounts"
                    value={formatNumber(
                        totalAssigned,
                    )}
                    tone="violet"
                />

                <RoleSummary
                    label="Operational"
                    value={formatNumber(
                        activeAssigned,
                    )}
                    tone="emerald"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-border/50 bg-background/25">
                <div className="hidden grid-cols-[minmax(190px,1.35fr)_110px_90px_90px_110px] items-center gap-3 border-b border-border/50 bg-background/45 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground md:grid">
                    <span>Branch</span>
                    <span>Status</span>
                    <span className="text-center">
                        Managers
                    </span>
                    <span className="text-center">
                        Staff
                    </span>
                    <span className="text-right">
                        Operational
                    </span>
                </div>

                <div className="divide-y divide-border/45">
                    {branches.map((branch) => {
                        const activePercentage =
                            branch.total > 0
                                ? (branch.active /
                                      branch.total) *
                                  100
                                : 0;

                        return (
                            <article
                                key={branch.id}
                                className="grid gap-3 px-3 py-3 transition hover:bg-violet-500/[0.025] md:grid-cols-[minmax(190px,1.35fr)_110px_90px_90px_110px] md:items-center"
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10 text-blue-400">
                                        <Building2 className="size-4" />
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

                                <div className="flex items-center justify-between gap-2 md:block">
                                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                                        Status
                                    </span>

                                    <span
                                        className={[
                                            'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-medium',
                                            branch.isActive
                                                ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
                                                : 'border-amber-500/15 bg-amber-500/10 text-amber-400',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'size-1.5 rounded-full',
                                                branch.isActive
                                                    ? 'bg-emerald-400'
                                                    : 'bg-amber-400',
                                            ].join(' ')}
                                        />

                                        {branch.isActive
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </div>

                                <TableCount
                                    label="Managers"
                                    value={branch.managers}
                                    tone="violet"
                                />

                                <TableCount
                                    label="Staff"
                                    value={branch.staff}
                                    tone="blue"
                                />

                                <div className="min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                                            Operational
                                        </span>

                                        <span className="ml-auto text-[10px] font-semibold tabular-nums text-emerald-400">
                                            {activePercentage.toFixed(
                                                0,
                                            )}
                                            %
                                        </span>
                                    </div>

                                    <div className="relative mt-1.5 h-3">
                                        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400"
                                                style={{
                                                    width: `${activePercentage}%`,
                                                }}
                                            />
                                        </div>

                                        {[25, 50, 75].map(
                                            (mark) => (
                                                <span
                                                    key={mark}
                                                    aria-hidden="true"
                                                    className="absolute bottom-0 top-0 border-l border-dashed border-border/70"
                                                    style={{
                                                        left: `${mark}%`,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function TableCount({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'violet' | 'blue';
}) {
    const valueClass = {
        violet: 'text-violet-400',
        blue: 'text-blue-400',
    }[tone];

    return (
        <div className="flex items-center justify-between gap-2 md:justify-center">
            <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                {label}
            </span>

            <span
                className={[
                    'text-[11px] font-semibold tabular-nums',
                    valueClass,
                ].join(' ')}
            >
                {formatNumber(value)}
            </span>
        </div>
    );
}

function BranchMiniCount({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'emerald' | 'violet' | 'blue';
}) {
    const valueClass = {
        emerald: 'text-emerald-400',
        violet: 'text-violet-400',
        blue: 'text-blue-400',
    }[tone];

    return (
        <div className="rounded-lg border border-border/50 bg-card px-2 py-1.5 text-center">
            <p className="text-[7px] uppercase tracking-wider text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    'mt-0.5 text-[10px] font-semibold tabular-nums',
                    valueClass,
                ].join(' ')}
            >
                {value}
            </p>
        </div>
    );
}

function BranchCoverageReadyState() {
    const steps = [
        {
            label: 'Create an inventory branch',
            href: '/branches',
            icon: Building2,
        },
        {
            label: 'Add team members',
            href: '/team/members',
            icon: Users,
        },
        {
            label: 'Assign branch access',
            href: '/team/members',
            icon: Network,
        },
    ];

    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)]">
            <div className="overflow-hidden rounded-xl border border-blue-500/10 bg-blue-500/[0.02]">
                <div className="grid grid-cols-[minmax(130px,1fr)_72px_58px_58px] items-center gap-2 border-b border-border/50 bg-background/45 px-3 py-2 text-[7px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <span>Branch</span>
                    <span>Status</span>
                    <span className="text-center">
                        Mgr
                    </span>
                    <span className="text-center">
                        Staff
                    </span>
                </div>

                <div className="divide-y divide-border/45">
                    {[
                        'Main Branch',
                        'Branch 02',
                        'Branch 03',
                    ].map((label, index) => (
                        <div
                            key={label}
                            className="grid grid-cols-[minmax(130px,1fr)_72px_58px_58px] items-center gap-2 px-3 py-2.5"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/[0.06] text-blue-400">
                                    <Building2 className="size-3.5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate text-[9px] font-medium text-muted-foreground">
                                        {label}
                                    </p>

                                    <p className="mt-0.5 text-[7px] text-muted-foreground/60">
                                        Awaiting assignment
                                    </p>
                                </div>
                            </div>

                            <span className="inline-flex justify-center rounded-full border border-violet-500/10 bg-violet-500/[0.04] px-1.5 py-1 text-[7px] font-medium text-violet-300/70">
                                Ready
                            </span>

                            <span className="text-center text-[9px] font-semibold tabular-nums text-violet-400/45">
                                —
                            </span>

                            <span className="text-center text-[9px] font-semibold tabular-nums text-blue-400/45">
                                —
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-border/50 px-3 py-2">
                    <div className="relative h-3">
                        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted/70" />

                        {[25, 50, 75].map((mark) => (
                            <span
                                key={mark}
                                aria-hidden="true"
                                className="absolute bottom-0 top-0 border-l border-dashed border-blue-500/20"
                                style={{
                                    left: `${mark}%`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center">
                <div className="flex items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.06] text-blue-400">
                        <Network className="size-4" />
                    </span>

                    <div>
                        <p className="text-sm font-semibold">
                            Branch coverage is ready
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                            The table will show manager,
                            staff, status, and operational
                            coverage after branches and team
                            accounts are connected.
                        </p>
                    </div>
                </div>

                <div className="mt-3 space-y-2">
                    {steps.map(
                        ({
                            label,
                            href,
                            icon: Icon,
                        }) => (
                            <Link
                                key={label}
                                href={href}
                                prefetch
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-[9px] text-muted-foreground transition hover:border-blue-500/15 hover:bg-blue-500/[0.04] hover:text-blue-300"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Icon className="size-3.5 text-blue-400" />
                                    {label}
                                </span>

                                <ArrowRight className="size-3" />
                            </Link>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}

function OnboardingTrendChart({
    points,
}: {
    points: TrendPoint[];
}) {
    const rawId = useId();
    const id = rawId.replace(/:/g, '');
    const total = points.reduce(
        (sum, point) => sum + point.count,
        0,
    );

    const chart = useMemo(() => {
        const width = 480;
        const height = 228;
        const padding = {
            top: 22,
            right: 18,
            bottom: 38,
            left: 34,
        };
        const plotWidth =
            width - padding.left - padding.right;
        const plotHeight =
            height - padding.top - padding.bottom;
        const maxValue = Math.max(
            ...points.map((point) => point.count),
            1,
        );
        const scaledMax = maxValue * 1.18;

        const plotPoints = points.map(
            (point, index) => ({
                x:
                    points.length <= 1
                        ? padding.left +
                          plotWidth / 2
                        : padding.left +
                          (index /
                              (points.length - 1)) *
                              plotWidth,
                y:
                    padding.top +
                    plotHeight -
                    (point.count /
                        scaledMax) *
                        plotHeight,
            }),
        );

        return {
            width,
            height,
            padding,
            plotWidth,
            plotHeight,
            scaledMax,
            plotPoints,
            linePath:
                createSmoothPath(plotPoints),
            areaPath:
                createAreaPath(
                    plotPoints,
                    padding.top + plotHeight,
                ),
        };
    }, [points]);

    return (
        <div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <OnboardingSummary
                    label="Six-Week Intake"
                    value={formatNumber(total)}
                    tone="violet"
                />

                <OnboardingSummary
                    label="Latest Week"
                    value={formatNumber(
                        points[
                            points.length - 1
                        ]?.count ?? 0,
                    )}
                    tone="blue"
                />
            </div>

            <div className="relative mt-3 overflow-hidden rounded-xl border border-border/50 bg-background/25">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,0.10),transparent_58%)]" />

                <svg
                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                    className="relative h-[220px] w-full"
                    role="img"
                    aria-label="Six-week team onboarding trend"
                >
                    <defs>
                        <linearGradient
                            id={`onboarding-${id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="rgb(167 139 250)"
                                stopOpacity="0.28"
                            />
                            <stop
                                offset="100%"
                                stopColor="rgb(167 139 250)"
                                stopOpacity="0"
                            />
                        </linearGradient>

                        <filter
                            id={`onboarding-glow-${id}`}
                            x="-20%"
                            y="-20%"
                            width="140%"
                            height="140%"
                        >
                            <feGaussianBlur
                                stdDeviation="3"
                                result="blur"
                            />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {[0, 1, 2, 3].map(
                        (line) => {
                            const y =
                                chart.padding.top +
                                (line / 3) *
                                    chart.plotHeight;
                            const value =
                                chart.scaledMax *
                                (1 - line / 3);

                            return (
                                <g key={line}>
                                    <line
                                        x1={
                                            chart.padding.left
                                        }
                                        x2={
                                            chart.width -
                                            chart.padding.right
                                        }
                                        y1={y}
                                        y2={y}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="5 7"
                                        className="text-border/70"
                                    />

                                    <text
                                        x={
                                            chart.padding.left -
                                            8
                                        }
                                        y={y + 3}
                                        textAnchor="end"
                                        fill="currentColor"
                                        className="text-[8px] text-muted-foreground"
                                    >
                                        {Math.round(
                                            value,
                                        )}
                                    </text>
                                </g>
                            );
                        },
                    )}

                    {points.map((point, index) => {
                        const x =
                            points.length <= 1
                                ? chart.padding.left +
                                  chart.plotWidth /
                                      2
                                : chart.padding.left +
                                  (index /
                                      (points.length -
                                          1)) *
                                      chart.plotWidth;

                        return (
                            <g key={`${point.label}-${index}`}>
                                <line
                                    x1={x}
                                    x2={x}
                                    y1={chart.padding.top}
                                    y2={
                                        chart.padding.top +
                                        chart.plotHeight
                                    }
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeDasharray="3 8"
                                    className="text-violet-500/15"
                                />

                                <text
                                    x={x}
                                    y={chart.height - 13}
                                    textAnchor="middle"
                                    fill="currentColor"
                                    className="text-[8px] font-medium text-muted-foreground"
                                >
                                    {point.label}
                                </text>
                            </g>
                        );
                    })}

                    <line
                        x1={chart.padding.left}
                        x2={chart.padding.left}
                        y1={chart.padding.top}
                        y2={
                            chart.padding.top +
                            chart.plotHeight
                        }
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="2 5"
                        className="text-border/80"
                    />

                    <line
                        x1={chart.padding.left}
                        x2={
                            chart.width -
                            chart.padding.right
                        }
                        y1={
                            chart.padding.top +
                            chart.plotHeight
                        }
                        y2={
                            chart.padding.top +
                            chart.plotHeight
                        }
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        className="text-border/80"
                    />

                    {total > 0 ? (
                        <>
                            <path
                                d={chart.areaPath}
                                fill={`url(#onboarding-${id})`}
                            />

                            <path
                                d={chart.linePath}
                                fill="none"
                                stroke="rgb(167 139 250)"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter={`url(#onboarding-glow-${id})`}
                            />

                            {chart.plotPoints.map(
                                (point, index) => (
                                    <circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y}
                                        r="4"
                                        fill="rgb(10 16 24)"
                                        stroke="rgb(167 139 250)"
                                        strokeWidth="2"
                                    >
                                        <title>
                                            {`${
                                                points[index]
                                                    .label
                                            }: ${
                                                points[index]
                                                    .count
                                            } new accounts`}
                                        </title>
                                    </circle>
                                ),
                            )}
                        </>
                    ) : (
                        <OnboardingReadyState
                            width={chart.width}
                            height={chart.height}
                            paddingLeft={
                                chart.padding.left
                            }
                            paddingRight={
                                chart.padding.right
                            }
                        />
                    )}
                </svg>
            </div>
        </div>
    );
}

function OnboardingSummary({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: 'violet' | 'blue';
}) {
    const valueClass = {
        violet: 'text-violet-400',
        blue: 'text-blue-400',
    }[tone];

    return (
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    'mt-1 text-sm font-semibold tabular-nums',
                    valueClass,
                ].join(' ')}
            >
                {value}
            </p>
        </div>
    );
}

function OnboardingReadyState({
    width,
    height,
    paddingLeft,
    paddingRight,
}: {
    width: number;
    height: number;
    paddingLeft: number;
    paddingRight: number;
}) {
    const baselineY = height - 60;
    const availableWidth =
        width - paddingLeft - paddingRight;

    return (
        <g>
            <path
                d={`M ${paddingLeft} ${baselineY} H ${
                    width - paddingRight
                }`}
                fill="none"
                stroke="rgb(167 139 250)"
                strokeWidth="1.5"
                strokeDasharray="5 8"
                opacity="0.34"
            />

            {Array.from({
                length: 6,
            }).map((_, index) => {
                const x =
                    paddingLeft +
                    (index / 5) *
                        availableWidth;

                return (
                    <g key={index}>
                        <circle
                            cx={x}
                            cy={baselineY}
                            r="5"
                            fill="rgb(139 92 246)"
                            opacity="0.12"
                        />

                        <circle
                            cx={x}
                            cy={baselineY}
                            r="2"
                            fill="rgb(96 165 250)"
                            opacity="0.45"
                        />
                    </g>
                );
            })}

            <g
                transform={`translate(${
                    width / 2
                } ${height / 2 - 13})`}
            >
                <rect
                    x="-112"
                    y="-31"
                    width="224"
                    height="62"
                    rx="14"
                    fill="rgb(12 18 28)"
                    fillOpacity="0.88"
                    stroke="rgb(139 92 246)"
                    strokeOpacity="0.18"
                />

                <circle
                    cx="-78"
                    cy="0"
                    r="14"
                    fill="rgb(139 92 246)"
                    fillOpacity="0.12"
                />

                <path
                    d="M -85 4 C -81 -4, -76 5, -70 -7"
                    fill="none"
                    stroke="rgb(167 139 250)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                <text
                    x="-52"
                    y="-3"
                    fill="rgb(226 232 240)"
                    fontSize="11"
                    fontWeight="600"
                >
                    Onboarding trend ready
                </text>

                <text
                    x="-52"
                    y="13"
                    fill="rgb(148 163 184)"
                    fontSize="8.5"
                >
                    New accounts will plot automatically
                </text>
            </g>
        </g>
    );
}

function DashboardPanel({
    title,
    description,
    icon: Icon,
    href,
    actionLabel,
    accent,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    actionLabel: string;
    accent: 'violet' | 'blue';
    children: ReactNode;
}) {
    const styles = {
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/[0.055] text-violet-400',
            action: 'border-violet-500/15 bg-violet-500/[0.045] text-violet-300 hover:bg-violet-500/10 hover:text-violet-200',
            line: 'via-violet-400/40',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/[0.055] text-blue-400',
            action: 'border-blue-500/15 bg-blue-500/[0.045] text-blue-300 hover:bg-blue-500/10 hover:text-blue-200',
            line: 'via-blue-400/40',
        },
    }[accent];

    return (
        <section className="relative min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
            <div
                className={[
                    'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
                    styles.line,
                ].join(' ')}
            />

            <div className="flex flex-col gap-2.5 border-b border-border/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        className={[
                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                            styles.icon,
                        ].join(' ')}
                    >
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
                    className={[
                        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-semibold transition',
                        styles.action,
                    ].join(' ')}
                >
                    {actionLabel}
                    <ArrowRight className="size-3" />
                </Link>
            </div>

            {children}
        </section>
    );
}

function RecentMemberTable({
    members,
}: {
    members: TeamMember[];
}) {
    return (
        <div className="overflow-hidden">
            <div className="hidden grid-cols-[minmax(210px,1.45fr)_100px_minmax(120px,0.75fr)_100px_86px] items-center gap-3 border-b border-border/65 bg-background/45 px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground md:grid">
                <span>Member</span>
                <span>Role</span>
                <span>Branch</span>
                <span>Joined</span>
                <span className="text-right">
                    Status
                </span>
            </div>

            <div className="divide-y divide-border/65">
                {members.map((member) => (
                    <RecentMemberRow
                        key={member.accessId}
                        member={member}
                    />
                ))}
            </div>
        </div>
    );
}

function RecentMemberRow({
    member,
}: {
    member: TeamMember;
}) {
    const statusLabel = member.isOperational
        ? 'Operational'
        : member.accessStatus === 'pending'
          ? 'Pending'
          : 'Restricted';

    const statusClass = member.isOperational
        ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
        : member.accessStatus === 'pending'
          ? 'border-blue-500/15 bg-blue-500/10 text-blue-400'
          : 'border-amber-500/15 bg-amber-500/10 text-amber-400';

    const statusDot = member.isOperational
        ? 'bg-emerald-400'
        : member.accessStatus === 'pending'
          ? 'bg-blue-400'
          : 'bg-amber-400';

    return (
        <article className="grid gap-3 px-4 py-3 transition hover:bg-violet-500/[0.025] md:grid-cols-[minmax(210px,1.45fr)_100px_minmax(120px,0.75fr)_100px_86px] md:items-center">
            <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-[10px] font-semibold text-violet-300">
                    {memberInitials(member.name)}
                </span>

                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="truncate text-[11px] font-semibold">
                            {member.name}
                        </p>

                        {member.isVerified && (
                            <BadgeCheck className="size-3 shrink-0 text-emerald-400" />
                        )}
                    </div>

                    <p className="mt-1 flex max-w-full items-center gap-1.5 truncate text-[9px] text-muted-foreground">
                        <Mail className="size-3 shrink-0" />
                        {member.email}
                    </p>
                </div>
            </div>

            <TableCell
                label="Role"
                value={member.roleName}
                tone={
                    member.roleCode === 'manager'
                        ? 'violet'
                        : 'blue'
                }
            />

            <div className="flex items-center justify-between gap-2 md:block">
                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                    Branch
                </span>

                <div className="min-w-0 text-right md:text-left">
                    <p className="truncate text-[9px] font-medium">
                        {member.branch?.name ??
                            'Unassigned'}
                    </p>

                    <p className="mt-0.5 font-mono text-[7px] text-muted-foreground">
                        {member.branch?.code ??
                            'NO-BRANCH'}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 md:block">
                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                    Joined
                </span>

                <p className="text-right text-[8px] text-muted-foreground md:text-left">
                    {formatDate(member.joinedAt)}
                </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2 md:block md:border-0 md:pt-0 md:text-right">
                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                    Status
                </span>

                <span
                    className={[
                        'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-medium',
                        statusClass,
                    ].join(' ')}
                >
                    <span
                        className={[
                            'size-1.5 rounded-full',
                            statusDot,
                        ].join(' ')}
                    />

                    {statusLabel}
                </span>
            </div>
        </article>
    );
}

function TableCell({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: 'violet' | 'blue';
}) {
    const toneClass = {
        violet:
            'border-violet-500/15 bg-violet-500/[0.055] text-violet-300',
        blue:
            'border-blue-500/15 bg-blue-500/[0.055] text-blue-300',
    }[tone];

    return (
        <div className="flex items-center justify-between gap-2 md:block">
            <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                {label}
            </span>

            <span
                className={[
                    'inline-flex rounded-full border px-2 py-1 text-[8px] font-medium',
                    toneClass,
                ].join(' ')}
            >
                {value}
            </span>
        </div>
    );
}

function GovernanceSignalBoard({
    signals,
}: {
    signals: TeamSignal[];
}) {
    const healthySignals = signals.filter(
        (signal) =>
            signal.tone === 'emerald' ||
            signal.tone === 'blue' ||
            signal.tone === 'violet',
    ).length;
    const warningSignals = signals.filter(
        (signal) => signal.tone === 'amber',
    ).length;

    return (
        <div className="p-3">
            <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.035] px-3 py-2">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                        Healthy Checks
                    </p>

                    <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-400">
                        {healthySignals}
                    </p>
                </div>

                <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.035] px-3 py-2">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                        Needs Review
                    </p>

                    <p className="mt-1 text-sm font-semibold tabular-nums text-amber-400">
                        {warningSignals}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {signals.map((signal) => (
                    <SignalCard
                        key={signal.key}
                        signal={signal}
                    />
                ))}
            </div>
        </div>
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
            indicator: string;
        }
    > = {
        emerald: {
            shell: 'border-emerald-500/15 bg-emerald-500/[0.045]',
            icon: 'bg-emerald-500/10 text-emerald-400',
            component: CheckCircle2,
            indicator: 'bg-emerald-400',
        },
        blue: {
            shell: 'border-blue-500/15 bg-blue-500/[0.045]',
            icon: 'bg-blue-500/10 text-blue-400',
            component: BadgeCheck,
            indicator: 'bg-blue-400',
        },
        violet: {
            shell: 'border-violet-500/15 bg-violet-500/[0.045]',
            icon: 'bg-violet-500/10 text-violet-400',
            component: Building2,
            indicator: 'bg-violet-400',
        },
        amber: {
            shell: 'border-amber-500/15 bg-amber-500/[0.045]',
            icon: 'bg-amber-500/10 text-amber-400',
            component: AlertTriangle,
            indicator: 'bg-amber-400',
        },
    };

    const style = styles[signal.tone];
    const Icon = style.component;

    return (
        <div
            className={[
                'relative overflow-hidden rounded-xl border px-3 py-2.5',
                style.shell,
            ].join(' ')}
        >
            <span
                className={[
                    'absolute inset-y-0 left-0 w-0.5',
                    style.indicator,
                ].join(' ')}
            />

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

function OperationalEmptyState({
    icon: Icon,
    title,
    description,
    href,
    actionLabel,
    tone,
    pattern,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    actionLabel: string;
    tone: 'violet' | 'blue';
    pattern: 'people' | 'signals';
}) {
    const styles = {
        violet: {
            icon: 'border-violet-500/15 bg-violet-500/[0.06] text-violet-400',
            button: 'border-violet-500/15 bg-violet-500/[0.055] text-violet-300 hover:bg-violet-500/10',
            accent: 'bg-violet-400/40',
        },
        blue: {
            icon: 'border-blue-500/15 bg-blue-500/[0.06] text-blue-400',
            button: 'border-blue-500/15 bg-blue-500/[0.055] text-blue-300 hover:bg-blue-500/10',
            accent: 'bg-blue-400/40',
        },
    }[tone];

    return (
        <div className="relative min-h-[230px] overflow-hidden px-5 py-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(139,92,246,0.06),transparent_58%)]" />

            <div className="relative mx-auto max-w-md text-center">
                <span
                    className={[
                        'inline-flex size-11 items-center justify-center rounded-xl border shadow-sm',
                        styles.icon,
                    ].join(' ')}
                >
                    <Icon className="size-5" />
                </span>

                <p className="mt-3 text-sm font-semibold">
                    {title}
                </p>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                    {description}
                </p>

                <Link
                    href={href}
                    prefetch
                    className={[
                        'mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[9px] font-semibold transition',
                        styles.button,
                    ].join(' ')}
                >
                    {actionLabel}
                    <ArrowRight className="size-3" />
                </Link>
            </div>

            <div className="relative mx-auto mt-5 max-w-lg">
                {pattern === 'people' ? (
                    <div className="flex items-center justify-center gap-3 rounded-xl border border-border/40 bg-background/20 px-4 py-4">
                        {[0, 1, 2, 3].map(
                            (index) => (
                                <div
                                    key={index}
                                    className="relative flex size-10 items-center justify-center rounded-xl border border-border/50 bg-background/35"
                                >
                                    <CircleUserRound
                                        className={[
                                            'size-4',
                                            index % 2 === 0
                                                ? 'text-violet-400/55'
                                                : 'text-blue-400/55',
                                        ].join(' ')}
                                    />

                                    <span
                                        className={[
                                            'absolute -right-1 -top-1 size-2 rounded-full',
                                            styles.accent,
                                        ].join(' ')}
                                    />
                                </div>
                            ),
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[0, 1, 2].map((row) => (
                            <div
                                key={row}
                                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/20 px-3 py-2"
                            >
                                <span
                                    className={[
                                        'size-2 rounded-full',
                                        styles.accent,
                                    ].join(' ')}
                                />

                                <span className="h-1.5 flex-1 rounded-full bg-muted/70" />

                                <span className="h-1.5 w-12 rounded-full bg-muted/50" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return `${parts[0][0]}${
        parts[parts.length - 1][0]
    }`.toUpperCase();
}

function createSmoothPath(
    points: Point[],
): string {
    if (points.length === 0) {
        return '';
    }

    if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (
        let index = 0;
        index < points.length - 1;
        index++
    ) {
        const previous =
            points[index - 1] ?? points[index];
        const current = points[index];
        const next = points[index + 1];
        const afterNext =
            points[index + 2] ?? next;

        const controlOneX =
            current.x +
            (next.x - previous.x) / 6;
        const controlOneY =
            current.y +
            (next.y - previous.y) / 6;
        const controlTwoX =
            next.x -
            (afterNext.x - current.x) / 6;
        const controlTwoY =
            next.y -
            (afterNext.y - current.y) / 6;

        path += ` C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${next.x} ${next.y}`;
    }

    return path;
}

function createAreaPath(
    points: Point[],
    baselineY: number,
): string {
    if (points.length === 0) {
        return '';
    }

    const linePath = createSmoothPath(points);
    const first = points[0];
    const last = points[points.length - 1];

    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
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