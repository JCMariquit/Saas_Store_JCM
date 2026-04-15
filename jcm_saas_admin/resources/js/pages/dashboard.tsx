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

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_20%),radial-gradient(circle_at_bottom_center,rgba(125,211,252,0.16),transparent_24%),linear-gradient(135deg,#e0f2fe,#f8fbff,#dbeafe)] p-4 md:p-6">
                {/* grid overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]" />

                {/* blobs */}
                <div className="pointer-events-none absolute -left-16 -top-16 h-[220px] w-[220px] rounded-full bg-sky-400/20 blur-[70px]" />
                <div className="pointer-events-none absolute -right-16 bottom-0 h-[260px] w-[260px] rounded-full bg-blue-500/15 blur-[80px]" />

                <div className="relative z-10 flex flex-col gap-5">
                    {/* HERO */}
                    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.10)] backdrop-blur-[20px]">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/15 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 sm:text-[13px]">
                                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 shadow-[0_0_0_6px_rgba(14,165,233,0.12)]" />
                                    JCM Web Solution
                                </div>

                                <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-slate-900 md:text-4xl">
                                    Admin
                                    <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                                        {' '}dashboard overview
                                    </span>
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                                    Centralized management for clients, orders, products, and future SaaS
                                    systems under JCM Web Solution.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                    <div className="text-2xl font-extrabold text-slate-900">12</div>
                                    <div className="mt-1 text-xs font-medium text-slate-500">Clients</div>
                                </div>
                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                    <div className="text-2xl font-extrabold text-slate-900">8</div>
                                    <div className="mt-1 text-xs font-medium text-slate-500">Orders</div>
                                </div>
                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                    <div className="text-2xl font-extrabold text-slate-900">5</div>
                                    <div className="mt-1 text-xs font-medium text-slate-500">Products</div>
                                </div>
                                <div className="rounded-2xl border border-blue-200/70 bg-white/80 px-4 py-4 text-center shadow-[0_10px_24px_rgba(14,165,233,0.06)]">
                                    <div className="text-2xl font-extrabold text-slate-900">3</div>
                                    <div className="mt-1 text-xs font-medium text-slate-500">Active</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TOP STATS */}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Clients</p>
                                    <h3 className="mt-2 text-3xl font-extrabold text-slate-900">12</h3>
                                    <p className="mt-2 text-xs text-slate-500">Managed company/client records</p>
                                </div>
                                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Orders</p>
                                    <h3 className="mt-2 text-3xl font-extrabold text-slate-900">8</h3>
                                    <p className="mt-2 text-xs text-slate-500">Current service and project orders</p>
                                </div>
                                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Products</p>
                                    <h3 className="mt-2 text-3xl font-extrabold text-slate-900">5</h3>
                                    <p className="mt-2 text-xs text-slate-500">System offerings and SaaS products</p>
                                </div>
                                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700">
                                    <Boxes className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Reports</p>
                                    <h3 className="mt-2 text-3xl font-extrabold text-slate-900">4</h3>
                                    <p className="mt-2 text-xs text-slate-500">Business and system summaries</p>
                                </div>
                                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700">
                                    <FileText className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                        <div className="rounded-[26px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">System activity overview</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Snapshot of platform progress and current internal operations.
                                    </p>
                                </div>
                                <div className="rounded-full bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-700">
                                    Internal
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4">
                                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 to-white p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">Client onboarding</span>
                                        <span className="text-sm font-bold text-slate-900">72%</span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 to-white p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">Order processing</span>
                                        <span className="text-sm font-bold text-slate-900">58%</span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                                        <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 to-white p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">Product setup</span>
                                        <span className="text-sm font-bold text-slate-900">84%</span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                                        <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 to-white p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">Admin readiness</span>
                                        <span className="text-sm font-bold text-slate-900">91%</span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                                        <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="rounded-[26px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900">Quick access</h2>
                                    <BriefcaseBusiness className="h-5 w-5 text-sky-700" />
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <div className="rounded-2xl border border-blue-100 bg-sky-50/70 px-4 py-3">
                                        <div className="text-sm font-semibold text-slate-800">Create Client</div>
                                        <div className="mt-1 text-xs text-slate-500">Add new business or customer record</div>
                                    </div>

                                    <div className="rounded-2xl border border-blue-100 bg-sky-50/70 px-4 py-3">
                                        <div className="text-sm font-semibold text-slate-800">Create Order</div>
                                        <div className="mt-1 text-xs text-slate-500">Register a new client order or request</div>
                                    </div>

                                    <div className="rounded-2xl border border-blue-100 bg-sky-50/70 px-4 py-3">
                                        <div className="text-sm font-semibold text-slate-800">Manage Products</div>
                                        <div className="mt-1 text-xs text-slate-500">Control system and SaaS listings</div>
                                    </div>

                                    <div className="rounded-2xl border border-blue-100 bg-sky-50/70 px-4 py-3">
                                        <div className="text-sm font-semibold text-slate-800">View Reports</div>
                                        <div className="mt-1 text-xs text-slate-500">Monitor summaries and status metrics</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-[20px]">
                                <h2 className="text-lg font-bold text-slate-900">Admin note</h2>
                                <p className="mt-3 text-sm leading-7 text-slate-500">
                                    This dashboard is designed to grow into a centralized control panel for
                                    multiple clients, products, and scalable SaaS systems under one admin
                                    environment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}