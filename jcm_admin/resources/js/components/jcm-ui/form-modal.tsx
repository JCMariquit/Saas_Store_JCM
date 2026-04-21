import { ReactNode } from 'react';

type FormModalProps = {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    maxWidthClass?: string;
    tone?: 'blue' | 'indigo' | 'red';
};

const toneHeaderClasses = {
    blue: 'from-blue-50 via-white to-violet-50',
    indigo: 'from-indigo-50 via-white to-blue-50',
    red: 'from-red-50 via-white to-rose-50',
};

export function FormModal({
    open,
    title,
    description,
    onClose,
    children,
    maxWidthClass = 'max-w-2xl',
    tone = 'blue',
}: FormModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm">
            <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${maxWidthClass}`}>
                <div className={`border-b border-slate-200 bg-gradient-to-r px-6 py-4 ${toneHeaderClasses[tone]}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                            {description && (
                                <p className="mt-1 text-sm text-slate-500">{description}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}