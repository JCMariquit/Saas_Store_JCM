import DashboardHero from '@/components/jcm_components/dashboard-hero';
import DashboardShell from '@/components/jcm_components/dashboard-shell';
import ProgressCard from '@/components/jcm_components/progress-card';
import QuickLinkCard from '@/components/jcm_components/quick-link-card';
import SectionCard from '@/components/jcm_components/section-card';
import StatCard from '@/components/jcm_components/stat-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Boxes, BriefcaseBusiness, FileText, ShoppingCart, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const stats = [
    {
        title: 'Total Clients',
        value: '12',
        description: 'Managed company/client records',
        icon: Users,
    },
    {
        title: 'Orders',
        value: '8',
        description: 'Current service and project orders',
        icon: ShoppingCart,
    },
    {
        title: 'Products',
        value: '5',
        description: 'System offerings and SaaS products',
        icon: Boxes,
    },
    {
        title: 'Reports',
        value: '4',
        description: 'Business and system summaries',
        icon: FileText,
    },
];

const progressItems = [
    { label: 'Client onboarding', value: 72 },
    { label: 'Order processing', value: 58 },
    { label: 'Product setup', value: 84 },
    { label: 'Admin readiness', value: 91 },
];

const quickLinks = [
    {
        title: 'Create Client',
        description: 'Add new business or customer record',
    },
    {
        title: 'Create Order',
        description: 'Register a new client order or request',
    },
    {
        title: 'Manage Products',
        description: 'Control system and SaaS listings',
    },
    {
        title: 'View Reports',
        description: 'Monitor summaries and status metrics',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <DashboardShell>
                <DashboardHero
                    title="Admin"
                    accentTitle="dashboard overview"
                    description="Centralized management for clients, orders, products, and future SaaS systems under JCM Web Solution."
                    stats={[
                        { label: 'Clients', value: '12' },
                        { label: 'Orders', value: '8' },
                        { label: 'Products', value: '5' },
                        { label: 'Active', value: '3' },
                    ]}
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <StatCard
                            key={item.title}
                            title={item.title}
                            value={item.value}
                            description={item.description}
                            icon={item.icon}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                    <SectionCard>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    System activity overview
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Snapshot of platform progress and current internal operations.
                                </p>
                            </div>

                            <div className="rounded-full bg-sky-100 px-3 py-2 text-xs font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                                Internal
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4">
                            {progressItems.map((item) => (
                                <ProgressCard
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                />
                            ))}
                        </div>
                    </SectionCard>

                    <div className="flex flex-col gap-4">
                        <SectionCard>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    Quick access
                                </h2>
                                <BriefcaseBusiness className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                            </div>

                            <div className="mt-5 grid gap-3">
                                {quickLinks.map((item) => (
                                    <QuickLinkCard
                                        key={item.title}
                                        title={item.title}
                                        description={item.description}
                                    />
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                Admin note
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                                This dashboard is designed to grow into a centralized control panel for
                                multiple clients, products, and scalable SaaS systems under one admin
                                environment.
                            </p>
                        </SectionCard>
                    </div>
                </div>
            </DashboardShell>
        </AppLayout>
    );
}