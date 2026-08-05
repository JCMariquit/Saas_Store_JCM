import { type ReactNode } from 'react';

type FormModalProps = {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    maxWidthClass?: string;
    tone?: 'blue' | 'indigo' | 'red';
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

    const headerTone = tone === 'red' ? 'from-red-500/10' : tone === 'indigo' ? 'from-indigo-500/10' : 'from-primary/10';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
            <div className={`app-scrollbar max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl ${maxWidthClass}`}>
                <div className={`border-b border-border bg-gradient-to-r ${headerTone} via-card to-card px-6 py-4`}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
                        </div>
                        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">Close</button>
                    </div>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
