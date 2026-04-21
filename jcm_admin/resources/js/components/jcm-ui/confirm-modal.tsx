import { Button } from '@/components/ui/button';

type ConfirmModalProps = {
    open: boolean;
    title: string;
    description?: string;
    message: string;
    confirmLabel?: string;
    onClose: () => void;
    onConfirm: () => void;
};

export function ConfirmModal({
    open,
    title,
    description,
    message,
    confirmLabel = 'Confirm',
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-200 bg-gradient-to-r from-red-50 via-white to-rose-50 px-6 py-4">
                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    )}
                </div>

                <div className="px-6 py-5">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {message}
                    </div>

                    <div className="mt-5 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}