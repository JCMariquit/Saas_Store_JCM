import { CheckCircle2, CreditCard, Rocket } from 'lucide-react';

const steps = [
    {
        icon: CheckCircle2,
        title: 'Choose a Solution',
        desc: 'Select the product or service that fits your business needs.',
    },
    {
        icon: CreditCard,
        title: 'Place Your Order',
        desc: 'Send your order details and complete your preferred payment method.',
    },
    {
        icon: Rocket,
        title: 'Launch with Confidence',
        desc: 'We assist with setup and deployment so you can start smoothly.',
    },
];

export default function HowItWorks() {
    return (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600">
                        Simple Process
                    </p>

                    <h2 className="text-2xl font-black text-slate-950">
                        How it works
                    </h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.title}
                                className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                            >
                                <div className="absolute right-3 top-3 text-3xl font-black text-slate-100">
                                    0{index + 1}
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white transition group-hover:bg-sky-600">
                                    <Icon className="h-4 w-4" />
                                </div>

                                <h3 className="mt-3 text-sm font-bold text-slate-950">
                                    {step.title}
                                </h3>

                                <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                    {step.desc}
                                </p>

                                <div className="mt-3 h-1 w-8 rounded-full bg-sky-500 transition group-hover:w-14" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}