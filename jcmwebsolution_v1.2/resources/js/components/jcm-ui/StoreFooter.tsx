export default function StoreFooter() {
    return (
        <section className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen overflow-x-hidden border-t border-slate-800 bg-gradient-to-r from-slate-950 to-slate-800 text-white">
            <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm uppercase tracking-[0.18em] text-slate-300">
                            Start Your Digital System
                        </p>

                        <h2 className="mt-3 text-2xl font-black md:text-3xl">
                            Upgrade your business with a modern system today
                        </h2>

                        <p className="mt-2 text-sm leading-7 text-slate-300">
                            Choose from ready-made products or request a custom-built system tailored
                            to your business needs.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2 md:px-8 lg:grid-cols-4">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                        JCM Web Solution
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        Modern web systems designed to help businesses go digital, automate
                        processes, and scale efficiently.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                        Payment Methods
                    </h3>

                    <ul className="mt-3 space-y-2 text-sm text-slate-400">
                        <li>GCash</li>
                        <li>Maya</li>
                        <li>Bank Transfer</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                        Customer Support
                    </h3>

                    <ul className="mt-3 space-y-2 text-sm text-slate-400">
                        <li>System Setup Assistance</li>
                        <li>Technical Support</li>
                        <li>After-Sales Support</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                        Contact & Social
                    </h3>

                    <ul className="mt-3 space-y-2 text-sm text-slate-400">
                        <li>Facebook Page</li>
                        <li>Instagram</li>
                        <li>Email: jcmwebsolution@gmail.com</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-8">
                    <p>© {new Date().getFullYear()} JCM Web Solution. All rights reserved.</p>
                </div>
            </div>
        </section>
    );
}