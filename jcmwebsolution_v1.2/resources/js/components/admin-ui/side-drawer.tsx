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
                className={`absolute right-0 top-0 h-full w-full ${width} bg-card border-l border-border shadow-xl`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition"
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