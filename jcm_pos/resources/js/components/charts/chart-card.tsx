import { type LucideIcon, BarChart3 } from 'lucide-react';

type Props = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
};

export default function ChartCard({
    title,
    description,
    icon: Icon = BarChart3,
    children,
    className = '',
}: Props) {
    return (
        <div className={`rounded-xl border bg-card p-5 shadow-sm ${className}`}>
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>

                <div className="rounded-xl bg-primary/10 p-3">
                    <Icon className="size-5 text-primary" />
                </div>
            </div>

            {children}
        </div>
    );
}