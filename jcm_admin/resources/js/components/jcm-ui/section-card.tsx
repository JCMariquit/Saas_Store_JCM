import { ReactNode } from 'react';

type SectionCardProps = {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function SectionCard({
    title,
    description,
    actions,
    children,
}: SectionCardProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            {(title || description || actions) && (
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            {title && (
                                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-slate-500">{description}</p>
                            )}
                        </div>

                        {actions && <div>{actions}</div>}
                    </div>
                </div>
            )}

            <div className="p-5">{children}</div>
        </div>
    );
}