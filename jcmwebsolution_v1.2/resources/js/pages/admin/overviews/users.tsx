import { PageHero } from '@/components/admin-ui/page-hero';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, Building2, KeyRound, ShieldCheck, UserPlus, UserRoundCheck, UserRoundX, UsersRound } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users Overview', href: '/admin/overviews/users' }];

type Props = {
    stats: {
        total_users: number;
        active_users: number;
        inactive_users: number;
        administrators: number;
        clients: number;
        new_this_month: number;
        account_owners: number;
        active_product_access: number;
    };
    trend: { label: string; users: number }[];
    roleDistribution: { label: string; total: number }[];
    accessByProduct: { label: string; users: number; active_access: number }[];
    recentUsers: {
        id: number;
        name: string;
        email: string;
        is_active: number | boolean;
        email_verified_at?: string | null;
        created_at: string;
        role_name: string;
    }[];
};

function date(value: string) {
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value));
}

export default function UsersOverview({ stats, trend, roleDistribution, accessByProduct, recentUsers }: Props) {
    const maxTrend = Math.max(...trend.map((row) => row.users), 1);
    const maxRole = Math.max(...roleDistribution.map((row) => row.total), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Overview" />

            <div className="space-y-5">
                <PageHero
                    eyebrow="Accounts & Access"
                    title="Users Overview"
                    description="Monitor administrators, subscribers, account owners, user growth, and product-access assignments across the JCM platform."
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                    <StatsCard title="Total users" value={stats.total_users} icon={<UsersRound className="size-5" />} />
                    <StatsCard title="Active" value={stats.active_users} icon={<UserRoundCheck className="size-5" />} tone="emerald" />
                    <StatsCard title="Inactive" value={stats.inactive_users} icon={<UserRoundX className="size-5" />} tone="rose" />
                    <StatsCard title="Administrators" value={stats.administrators} icon={<ShieldCheck className="size-5" />} tone="indigo" />
                    <StatsCard title="Clients" value={stats.clients} icon={<Building2 className="size-5" />} tone="amber" />
                    <StatsCard title="New this month" value={stats.new_this_month} icon={<UserPlus className="size-5" />} tone="emerald" />
                    <StatsCard title="Account owners" value={stats.account_owners} icon={<BadgeCheck className="size-5" />} />
                    <StatsCard title="Active access" value={stats.active_product_access} icon={<KeyRound className="size-5" />} tone="amber" />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                    <SectionCard
                        title="12-month account growth"
                        description="New JCM platform accounts created each month."
                        actions={
                            <Button asChild size="sm">
                                <Link href="/admin/users">Manage users</Link>
                            </Button>
                        }
                    >
                        <div className="border-border/60 bg-background/30 flex h-64 items-end gap-3 overflow-x-auto rounded-2xl border p-4">
                            {trend.map((row) => (
                                <div key={row.label} className="flex min-w-12 flex-1 flex-col items-center gap-2">
                                    <span className="text-foreground text-[9px] font-semibold">{row.users}</span>
                                    <div className="bg-muted/45 flex h-44 w-full items-end rounded-lg px-1.5 pt-2">
                                        <div
                                            className="from-primary to-primary/50 w-full rounded-t-md bg-gradient-to-t"
                                            style={{ height: `${Math.max((row.users / maxTrend) * 100, 3)}%` }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground text-[8px] whitespace-nowrap">{row.label}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Platform roles" description="Primary active platform-role distribution.">
                        <div className="space-y-4">
                            {roleDistribution.map((role) => (
                                <div key={role.label}>
                                    <div className="mb-1.5 flex items-center justify-between text-xs">
                                        <span className="text-foreground font-semibold">{role.label}</span>
                                        <span className="text-muted-foreground">{role.total}</span>
                                    </div>
                                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{ width: `${Math.max((role.total / maxRole) * 100, 4)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                    <SectionCard title="Product access" description="Assigned users and currently active access per JCM system.">
                        <div className="space-y-3">
                            {accessByProduct.map((product) => (
                                <div key={product.label} className="border-border/60 bg-background/35 rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-foreground text-xs font-semibold">{product.label}</p>
                                        <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2 py-1 text-[8px] font-semibold">
                                            {product.active_access} active
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground mt-2 text-[9px]">{product.users} unique assigned user(s)</p>
                                </div>
                            ))}
                            {accessByProduct.length === 0 && <p className="text-muted-foreground text-xs">No product-access records yet.</p>}
                        </div>
                    </SectionCard>

                    <SectionCard title="Recent accounts" description="Newest users registered or provisioned on the platform.">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-xs">
                                <thead className="border-border/60 text-muted-foreground border-b text-[9px] tracking-wider uppercase">
                                    <tr>
                                        <th className="px-3 py-2.5">User</th>
                                        <th className="px-3 py-2.5">Role</th>
                                        <th className="px-3 py-2.5">Email</th>
                                        <th className="px-3 py-2.5">Account</th>
                                        <th className="px-3 py-2.5">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border/50 divide-y">
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/25">
                                            <td className="text-foreground px-3 py-3 font-semibold">{user.name}</td>
                                            <td className="text-muted-foreground px-3 py-3">{user.role_name}</td>
                                            <td className="text-muted-foreground px-3 py-3">{user.email}</td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`rounded-full border px-2 py-1 text-[8px] font-semibold uppercase ${user.is_active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-rose-500/20 bg-rose-500/10 text-rose-500'}`}
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground px-3 py-3 text-[9px]">{date(user.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}
