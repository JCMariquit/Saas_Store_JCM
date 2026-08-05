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

export function PlanDetailsModal({ open, title, description, price, billing, features, onClose }: PlanDetailsModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm">
            <div className="border-border bg-card w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl">
                {/* HEADER */}
                <div className="border-border from-primary/[0.07] via-card to-card border-b bg-gradient-to-r px-6 py-4">
                    <h2 className="text-foreground text-xl font-semibold">{title}</h2>
                    {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
                </div>

                {/* BODY */}
                <div className="px-6 py-5">
                    {/* PRICE */}
                    <div className="border-primary/20 bg-primary/[0.07] rounded-2xl border p-4">
                        <p className="text-muted-foreground text-xs tracking-wide uppercase">Price</p>

                        <p className="text-primary mt-1 text-2xl font-extrabold">{price}</p>

                        <p className="text-muted-foreground mt-1 text-sm">{billing || 'One-time / custom'}</p>
                    </div>

                    {/* FEATURES */}
                    {features.length > 0 && (
                        <div className="mt-5">
                            <h3 className="text-foreground text-sm font-semibold">What’s included</h3>

                            <div className="mt-3 space-y-2">
                                {features.map((feature, index) => (
                                    <div key={index} className="text-muted-foreground flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ACTION */}
                    <div className="mt-6 flex justify-end">
                        <Button type="button" onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
