import axios from 'axios';
import { CheckCircle2, ImageIcon, ShoppingCart, Trash2 } from 'lucide-react';
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
    const [total, setTotal] = useState(0);

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
            const cartItems = res.data.items ?? [];

            setItems(cartItems);
            setTotal(Number(res.data.total ?? 0));

            setSelectedIds((current) =>
                current.filter((id) => cartItems.some((item: CartItem) => item.id === id)),
            );
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setItems([]);
            setTotal(0);
            setSelectedIds([]);
        } finally {
            setLoading(false);
        }
    }

    async function removeItem(id: number) {
        setRemovingId(id);

        try {
            await axios.delete(`/carts/${id}`);
            setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
            await fetchCart();
            window.dispatchEvent(new Event('cart:refresh'));
        } catch (error) {
            console.error('Failed to remove cart item:', error);
        } finally {
            setRemovingId(null);
        }
    }

    function toggleSelected(id: number) {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id],
        );
    }

    function toggleSelectAll() {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(items.map((item) => item.id));
    }

    function formatPeso(value?: number | string | null) {
        const amount = Number(value ?? 0);

        if (amount <= 0) return '0';

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
                className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-slate-50 p-0 sm:max-w-md"
            >
                <div className="shrink-0 border-b border-blue-900 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-4 py-1.5 text-white shadow-sm">
                    <SheetHeader className="space-y-0.5 text-left">
                        <SheetTitle className="flex items-center justify-between gap-3 text-base font-semibold text-white">
                            <span className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20">
                                    <ShoppingCart className="h-4 w-4" />
                                </span>
                                Your Cart
                            </span>

                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-50 ring-1 ring-white/15">
                                {items.length} item{items.length === 1 ? '' : 's'}
                            </span>
                        </SheetTitle>

                        <SheetDescription className="text-xs text-blue-100">
                            Choose items you want to include in your order request.
                        </SheetDescription>
                    </SheetHeader>
                </div>


                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <div className="space-y-3 pb-3">
                        {loading && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
                                Loading cart...
                            </div>
                        )}

                        {!loading && items.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>

                                <h4 className="mt-3 font-semibold text-slate-900">
                                    Your cart is empty
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    Products you add to cart will appear here.
                                </p>
                            </div>
                        )}

                        {!loading &&
                            items.map((item) => {
                                const selected = selectedIds.includes(item.id);
                                const imageSrc = item.thumbnail_url ?? item.product_image;

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-2xl border bg-white p-3 shadow-sm transition ${
                                            selected
                                                ? 'border-blue-300 ring-4 ring-blue-50'
                                                : 'border-slate-200 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleSelected(item.id)}
                                                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                    selected
                                                        ? 'border-blue-700 bg-blue-700 text-white'
                                                        : 'border-slate-300 bg-white text-transparent hover:border-blue-400'
                                                }`}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>

                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                                                {imageSrc ? (
                                                    <img
                                                        src={imageSrc}
                                                        alt={item.product_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="h-6 w-6 text-slate-400" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate font-semibold text-slate-950">
                                                            {item.product_name}
                                                        </h4>

                                                        <div className="mt-1 flex items-center justify-between gap-2">
                                                            <p className="truncate text-sm font-medium text-blue-700">
                                                                {item.plan_name ?? 'No plan'}
                                                            </p>

                                                            <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                                {formatPeso(item.plan_price)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={removingId === item.id}
                                                        onClick={() => void removeItem(item.id)}
                                                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                                                    {item.product_description ??
                                                        item.plan_description ??
                                                        'No description available.'}
                                                </p>

                                                <div className="mt-3 border-t border-slate-100 pt-2">
                                                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                        Qty: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 shadow-[0_-12px_24px_rgba(15,23,42,0.06)]">
                    {items.length > 0 && (
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="flex items-center gap-2 text-sm font-medium text-slate-700"
                            >
                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                                        selectedIds.length === items.length
                                            ? 'border-blue-700 bg-blue-700 text-white'
                                            : 'border-slate-300 bg-white text-transparent'
                                    }`}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                </span>
                                Select all
                            </button>

                            <span className="text-xs font-medium text-slate-500">
                                {selectedIds.length} of {items.length} selected
                            </span>
                        </div>
                    )}

                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Order Summary
                            </p>
                            <p className="text-sm text-slate-500">
                                {selectedIds.length} selected item{selectedIds.length === 1 ? '' : 's'}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-slate-400">Subtotal</p>
                            <p className="text-xl font-bold text-slate-950">
                                {formatPeso(selectedIds.length > 0 ? selectedTotal : 0)}
                            </p>
                        </div>
                    </div>

                    <Button
                        disabled={selectedIds.length === 0}
                        className="h-11 w-full rounded-xl bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Proceed to Order
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}