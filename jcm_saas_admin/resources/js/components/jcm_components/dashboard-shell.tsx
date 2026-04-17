import { ReactNode } from 'react';

interface DashboardShellProps {
    children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-6">
            {children}
        </div>
    );
}