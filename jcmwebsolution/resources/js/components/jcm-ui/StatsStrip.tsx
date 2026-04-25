const stats = [
    { label: 'Trusted Clients', value: '50+' },
    { label: 'Projects Completed', value: '120+' },
    { label: 'Years Experience', value: '3+' },
    { label: 'Support Availability', value: '24/7' },
];

export default function StatsStrip() {
    return (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-white bg-white p-5 text-center shadow-sm"
                    >
                        <p className="text-2xl font-black text-slate-950">{item.value}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}