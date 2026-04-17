import { LucideIcon } from 'lucide-react';
import SectionCard from './section-card';

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
}

export default function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
    return (
        <SectionCard>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                        {value}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </SectionCard>
    );
}