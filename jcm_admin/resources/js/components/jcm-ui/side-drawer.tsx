import { ReactNode } from 'react';
import { X } from 'lucide-react';

type SideDrawerProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    width?: string;
};

export function SideDrawer({
    open,
    onClose,
    title,
    description,
    children,
    width = 'max-w-md',
}: SideDrawerProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`absolute right-0 top-0 h-full w-full ${width} bg-white border-l border-slate-200 shadow-xl`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="h-full overflow-y-auto px-6 py-5 space-y-5">
                    {children}
                </div>
            </div>
        </div>
    );
}