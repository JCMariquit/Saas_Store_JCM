import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    CheckCircle2,
    ImageIcon,
    Loader2,
    PackageCheck,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type CartItem = {
    id: number;
    user_id?: number;
    product_id: number;
    plan_id?: number | null;
    product_name: string;
    product_description?: string | null;
    product_image?: string | null;
    thumbnail_url?: string | null;
    plan_name?: string | null;
    plan_price?: number | string | null;
    plan_description?: string | null;
    quantity: number;
    notes?: string | null;
};

export function CartDrawer({ open, onOpenChange }: Props) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [proceeding, setProceeding] = useState(false);

    useEffect(() => {
        if (open) void fetchCart();

    }, [open]);

    useEffect(() => {
        const refreshCart = () => void fetchCart();

        window.addEventListener('cart:refresh', refreshCart);

        return () => {
            window.removeEventListener('cart:refresh', refreshCart);
        };

    }, []);

    const selectedItems = useMemo(
        () => items.filter((item) => selectedIds.includes(item.id)),
        [items, selectedIds],
    );

    const selectedTotal = useMemo(() => {
        return selectedItems.reduce((sum, item) => {
            return sum + Number(item.plan_price ?? 0) * Number(item.quantity ?? 1);
        }, 0);
    }, [selectedItems]);

    async function fetchCart() {
        setLoading(true);

        try {
            const res = await axios.get('/carts');
            const cartItems: CartItem[] = res.data.items ?? [];

            setItems(cartItems);

            setSelectedIds((current) =>
                current.filter((id) => cartItems.some((item) => item.id === id)),
            );
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setItems([]);
            setSelectedIds([]);
        } finally {
            setLoading(false);
        }
    }

    async function removeItem(id: number) {
        setRemovingId(id);

        try {
            await axios.delete(`/carts/${id}`);

            setItems((current) => current.filter((item) => item.id !== id));
            setSelectedIds((current) =>
                current.filter((selectedId) => selectedId !== id),
            );

            window.dispatchEvent(new Event('cart:refresh'));
        } catch (error) {
            console.error('Failed to remove cart item:', error);
        } finally {
            setRemovingId(null);
        }
    }

    function toggleSelected(id: number) {
        setSelectedIds((current) => {
            if (current.includes(id)) {
                return current.filter((selectedId) => selectedId !== id);
            }

            return [id];
        });
    }

    function proceedToOrder() {
        if (selectedItems.length !== 1 || proceeding) return;

        const item = selectedItems[0];

        setProceeding(true);
        onOpenChange(false);

        router.visit(
            `/orders/create?product_id=${item.product_id}${
                item.plan_id ? `&plan_id=${item.plan_id}` : ''
            }&cart_id=${item.id}`,
        );
    }

    function formatPeso(value?: number | string | null) {
        const amount = Number(value ?? 0);

        if (amount <= 0) return 'Contact us';

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
        }).format(amount);
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-[#f4f7fb] p-0 sm:max-w-md"
            >
                <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-10 h-20 w-20 rounded-full bg-blue-300/10 blur-xl" />

                    <div className="relative px-5 pb-5 pt-4">
                        <SheetHeader className="m-0 space-y-0 p-0 text-left">
                            <SheetTitle className="flex items-center justify-between text-white">
                                <span className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                        <ShoppingCart className="h-5 w-5" />
                                    </span>

                                    <span>
                                        <span className="block text-base font-semibold leading-tight">
                                            Your Cart
                                        </span>
                                        <span className="mt-0.5 block text-xs font-normal text-blue-100">
                                            Select one product to order
                                        </span>
                                    </span>
                                </span>

                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50 ring-1 ring-white/15">
                                    {items.length} item{items.length === 1 ? '' : 's'}
                                </span>
                            </SheetTitle>

                            <SheetDescription className="sr-only">
                                Choose item you want to include in your order request.
                            </SheetDescription>
                        </SheetHeader>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {loading && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>

                            <p className="mt-3 text-sm font-medium text-slate-500">
                                Loading cart...
                            </p>
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                <ShoppingCart className="h-7 w-7" />
                            </div>

                            <h4 className="mt-4 font-semibold text-slate-900">
                                Your cart is empty
                            </h4>

                            <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">
                                Products you add to cart will appear here.
                            </p>
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div className="space-y-3 pb-3">
                            {items.map((item) => {
                                const selected = selectedIds.includes(item.id);
                                const imageSrc = item.thumbnail_url ?? item.product_image;

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-3xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                                            selected
                                                ? 'border-blue-300 ring-4 ring-blue-50'
                                                : 'border-slate-200 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleSelected(item.id)}
                                                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                                                    selected
                                                        ? 'border-blue-700 bg-blue-700 text-white'
                                                        : 'border-slate-300 bg-white text-transparent hover:border-blue-400'
                                                }`}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>

                                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                                                {imageSrc ? (
                                                    <img
                                                        src={imageSrc}
                                                        alt={item.product_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="h-7 w-7 text-slate-400" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="line-clamp-1 font-semibold text-slate-950">
                                                            {item.product_name}
                                                        </h4>

                                                        <p className="mt-1 line-clamp-1 text-sm font-medium text-blue-700">
                                                            {item.plan_name ?? 'Custom plan'}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={removingId === item.id}
                                                        onClick={() => void removeItem(item.id)}
                                                        className="h-8 w-8 shrink-0 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        {removingId === item.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                                                    {item.product_description ??
                                                        item.plan_description ??
                                                        'No description available.'}
                                                </p>

                                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                        Qty {item.quantity}
                                                    </span>

                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                                        {formatPeso(item.plan_price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-14px_30px_rgba(15,23,42,0.08)]">
                    {items.length > 0 && (
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <p className="text-sm font-semibold text-slate-700">
                                Select one item to proceed
                            </p>

                            <span className="text-xs font-medium text-slate-500">
                                {selectedIds.length} selected
                            </span>
                        </div>
                    )}

                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Order Summary
                            </p>
                            <p className="line-clamp-1 text-sm text-slate-500">
                                {selectedIds.length === 1
                                    ? selectedItems[0]?.product_name
                                    : 'No selected product'}
                            </p>
                        </div>

                        <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-400">Subtotal</p>
                            <p className="text-xl font-bold text-slate-950">
                                {formatPeso(selectedIds.length > 0 ? selectedTotal : 0)}
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={proceedToOrder}
                        disabled={selectedIds.length !== 1 || proceeding}
                        className="h-11 w-full rounded-2xl bg-blue-700 font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {proceeding ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <PackageCheck className="mr-2 h-4 w-4" />
                        )}
                        {proceeding ? 'Redirecting...' : 'Proceed to Order'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}