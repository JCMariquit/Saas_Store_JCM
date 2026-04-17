import { ReactNode } from 'react';

interface SectionCardProps {
    children: ReactNode;
    className?: string;
}

export default function SectionCard({ children, className = '' }: SectionCardProps) {
    return (
        <div
            className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
        >
            {children}
        </div>
    );
}