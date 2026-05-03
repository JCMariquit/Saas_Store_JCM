import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    CreditCard,
    LayoutDashboard,
    Package,
    ReceiptText,
    Users,
} from 'lucide-react';

const cards = [
    {
        title: 'Products',
        description: 'Manage SaaS products and systems.',
        href: '#',
        icon: Package,
    },
    {
        title: 'Plans',
        description: 'Create pricing plans and durations.',
        href: '#',
        icon: Boxes,
    },
    {
        title: 'Orders',
        description: 'Review client orders and requests.',
        href: '#',
        icon: ReceiptText,
    },
    {
        title: 'Transactions',
        description: 'Verify manual payments and references.',
        href: '#',
        icon: CreditCard,
    },
];

export default function AdminDashboardIndex() {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-slate-100">
                <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    <LayoutDashboard className="h-4 w-4" />
                                    JCM Admin Panel
                                </div>

                                <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">
                                    Admin Dashboard
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Manage your storefront, products, plans, client orders,
                                    payment verification, and SaaS subscriptions in one place.
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                                View Storefront
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Users
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                        0
                                    </h2>
                                </div>
                                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Orders
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                        0
                                    </h2>
                                </div>
                                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                                    <ReceiptText className="h-6 w-6" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Monthly Revenue
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                        ₱0.00
                                    </h2>
                                </div>
                                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                >
                                    <div className="mb-4 inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600">
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900">
                                        {card.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {card.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}