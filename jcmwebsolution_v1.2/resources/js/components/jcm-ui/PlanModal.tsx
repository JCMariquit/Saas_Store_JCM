import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

type PlanDetailsModalProps = {
    open: boolean;
    title: string;
    description?: string;
    price: string;
    billing?: string | null;
    features: string[];
    onClose: () => void;
};

export function PlanDetailsModal({
    open,
    title,
    description,
    price,
    billing,
    features,
    onClose,
}: PlanDetailsModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                
                {/* HEADER */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-6 py-4">
                    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    )}
                </div>

                {/* BODY */}
                <div className="px-6 py-5">
                    
                    {/* PRICE */}
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Price
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-sky-700">
                            {price}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {billing || 'One-time / custom'}
                        </p>
                    </div>

                    {/* FEATURES */}
                    {features.length > 0 && (
                        <div className="mt-5">
                            <h3 className="text-sm font-semibold text-slate-900">
                                What’s included
                            </h3>

                            <div className="mt-3 space-y-2">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2 text-sm text-slate-600"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ACTION */}
                    <div className="mt-6 flex justify-end">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}