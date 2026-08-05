import { BadgeCheck, Headset, Workflow } from 'lucide-react';
import SectionHeader from './SectionHeader';

const reasons = [
    {
        icon: BadgeCheck,
        title: 'Simple and Clear Pricing',
        desc: 'Choose ready-made products or request custom-built systems based on your budget.',
    },
    {
        icon: Workflow,
        title: 'Built for Real Operations',
        desc: 'Designed for bookings, orders, records, payments, reports, and daily workflows.',
    },
    {
        icon: Headset,
        title: 'Reliable Setup and Support',
        desc: 'We guide you from onboarding, setup, deployment, and after-sales support.',
    },
];

export default function WhyChooseUs() {
    return (
        <section className="bg-muted/20 relative right-1/2 left-1/2 mr-[-50vw] ml-[-50vw] w-screen py-10">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                {/* HEADER ONLY (no card container) */}
                <SectionHeader
                    eyebrow="Why Businesses Choose JCM"
                    title="Modern systems built for real business needs"
                    description="Move from manual processes to smarter digital solutions with practical and scalable systems."
                />

                {/* GRID */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {reasons.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="group border-border/70 bg-card/60 hover:border-primary/25 hover:bg-card relative rounded-xl border p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                {/* step number */}
                                <div className="text-muted-foreground/20 absolute top-3 right-3 text-3xl font-black">0{index + 1}</div>

                                {/* icon */}
                                <div className="bg-primary text-primary-foreground group-hover:bg-primary/80 flex h-10 w-10 items-center justify-center rounded-xl transition">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className="text-foreground mt-4 text-sm font-black">{item.title}</h3>

                                <p className="text-muted-foreground mt-2 text-[12px] leading-5">{item.desc}</p>

                                <div className="mt-4 h-1 w-8 rounded-full bg-sky-500 transition group-hover:w-14" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
