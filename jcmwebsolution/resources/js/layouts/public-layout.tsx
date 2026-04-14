import type { PropsWithChildren } from 'react';
import Navbar from '@/components/navbar';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-[#eef4fb] text-slate-900">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(102,191,255,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(140,180,255,0.22),_transparent_30%),linear-gradient(to_bottom,_#edf5fc,_#f6f9fd)]" />
            <Navbar />

            <main className="pb-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}