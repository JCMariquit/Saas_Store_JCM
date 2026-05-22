import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    Barcode,
    CreditCard,
    Minus,
    Package,
    Plus,
    Receipt,
    RotateCcw,
    Search,
    ShoppingCart,
    Trash2,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'POS Terminal', href: '/pos/terminal' },
];

type Category = { id: number; name: string };

type Product = {
    id: number;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    quantity: number | string;
    selling_price: number | string;
    stock_tracking: 'tracked' | 'not_tracked';
    category?: Category | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PageProps = {
    products: {
        data: Product[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    categories: Category[];
    filters: {
        search?: string | null;
        category_id?: string | null;
    };
};

type CartItem = {
    product_id: number;
    name: string;
    sku?: string | null;
    price: number;
    quantity: number;
    stock: number;
    stock_tracking: 'tracked' | 'not_tracked';
};

export default function PosTerminalIndex({ products, categories, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category_id ?? '');
    const [cart, setCart] = useState<CartItem[]>([]);

    const checkoutForm = useForm({
        payment_method: 'cash',
        amount_paid: '',
        reference_no: '',
        remarks: '',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/pos/terminal',
                {
                    search,
                    category_id: categoryFilter,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, categoryFilter]);

    const subtotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const amountPaid = Number(checkoutForm.data.amount_paid || 0);
    const changeAmount = amountPaid - subtotal;
    const canCheckout = cart.length > 0 && amountPaid >= subtotal && !checkoutForm.processing;

    const money = (value: number | string) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const resetFilters = () => {
        setSearch('');
        setCategoryFilter('');

        router.get('/pos/terminal', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const addToCart = (product: Product) => {
        const stock = Number(product.quantity ?? 0);

        if (product.stock_tracking === 'tracked' && stock <= 0) {
            alert('Product is out of stock.');
            return;
        }

        setCart((current) => {
            const existing = current.find((item) => item.product_id === product.id);

            if (existing) {
                if (existing.stock_tracking === 'tracked' && existing.quantity + 1 > existing.stock) {
                    alert('Insufficient stock.');
                    return current;
                }

                return current.map((item) =>
                    item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
                );
            }

            return [
                ...current,
                {
                    product_id: product.id,
                    name: product.name,
                    sku: product.sku,
                    price: Number(product.selling_price ?? 0),
                    quantity: 1,
                    stock,
                    stock_tracking: product.stock_tracking,
                },
            ];
        });
    };

    const incrementQty = (productId: number) => {
        setCart((current) =>
            current.map((item) => {
                if (item.product_id !== productId) return item;

                if (item.stock_tracking === 'tracked' && item.quantity + 1 > item.stock) {
                    alert('Insufficient stock.');
                    return item;
                }

                return { ...item, quantity: item.quantity + 1 };
            }),
        );
    };

    const decrementQty = (productId: number) => {
        setCart((current) =>
            current
                .map((item) =>
                    item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const removeItem = (productId: number) => {
        setCart((current) => current.filter((item) => item.product_id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        checkoutForm.setData({
            payment_method: 'cash',
            amount_paid: '',
            reference_no: '',
            remarks: '',
        });
    };

    const quickCash = (amount: number) => {
        checkoutForm.setData('amount_paid', String(amount));
    };

    const checkout = () => {
        if (cart.length === 0) {
            alert('Cart is empty.');
            return;
        }

        if (amountPaid < subtotal) {
            alert('Amount paid is less than total.');
            return;
        }

        router.post(
            '/pos/checkout',
            {
                items: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
                payment_method: checkoutForm.data.payment_method,
                amount_paid: checkoutForm.data.amount_paid,
                reference_no: checkoutForm.data.reference_no,
                remarks: checkoutForm.data.remarks,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    clearCart();
                    alert('Sale completed successfully.');
                },
                onError: (errors) => {
                    console.log(errors);
                    alert('Checkout failed. Check stock/payment.');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="POS Terminal" />

            <div className="grid h-full gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_430px]">
                <div className="flex min-w-0 flex-col gap-4">
                    <Card tone="topline" variant="default" className="overflow-hidden">
                        <CardHeader className="border-b p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Receipt className="size-5" />
                                        POS Terminal
                                    </CardTitle>
                                    <CardDescription>
                                        Search products, add items to cart, and complete checkout.
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                                    <Package className="size-4 text-muted-foreground" />
                                    <span className="font-medium">{products.total}</span>
                                    <span className="text-muted-foreground">items available</span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-5">
                            <div className="grid gap-3 md:grid-cols-[1fr_240px_44px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Auto search product, SKU, barcode..."
                                        className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-11 items-center justify-center rounded-md border hover:bg-muted"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {products.data.map((product) => {
                            const stock = Number(product.quantity ?? 0);
                            const isOut = product.stock_tracking === 'tracked' && stock <= 0;
                            const isLow = product.stock_tracking === 'tracked' && stock > 0 && stock <= 5;
                            const inCart = cart.find((item) => item.product_id === product.id);

                            return (
                                <Card
                                    key={product.id}
                                    interactive
                                    tone="topline"
                                    variant={isOut ? 'danger' : isLow ? 'warning' : 'default'}
                                    className="overflow-hidden"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex min-h-[185px] flex-col justify-between gap-4">
                                            <div>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Barcode className="size-3.5" />
                                                            <span>SKU: {product.sku || 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs">
                                                        {product.category?.name ?? 'No Category'}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid grid-cols-2 gap-3">
                                                    <div className="rounded-lg bg-muted/60 p-3">
                                                        <p className="text-xs text-muted-foreground">Price</p>
                                                        <p className="mt-1 text-xl font-bold">{money(product.selling_price)}</p>
                                                    </div>

                                                    <div className="rounded-lg bg-muted/60 p-3 text-right">
                                                        <p className="text-xs text-muted-foreground">Stock</p>
                                                        <p className={`mt-1 font-bold ${isOut ? 'text-red-600' : isLow ? 'text-orange-600' : ''}`}>
                                                            {product.stock_tracking === 'tracked' ? stock : '∞'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {inCart && (
                                                    <div className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                                                        In cart: {inCart.quantity}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                disabled={isOut}
                                                onClick={() => addToCart(product)}
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Plus className="size-4" />
                                                {inCart ? 'Add More' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {products.data.length === 0 && (
                            <Card className="sm:col-span-2 lg:col-span-3">
                                <CardContent className="p-12 text-center">
                                    <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
                                    <h3 className="font-semibold">No active products found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try changing your search or category filter.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {products.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                className={`rounded-md border px-3 py-1.5 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>

                <Card
                    tone="topline"
                    variant="success"
                    className="
                        sticky top-4
                        flex h-[calc(100vh-2rem)]
                        min-h-0 flex-col
                        overflow-hidden
                    "
                >
                    <CardHeader className="border-b p-5">
                        <CardTitle className="flex items-center justify-between text-xl">
                            <span className="flex items-center gap-2">
                                <ShoppingCart className="size-5" />
                                Current Sale
                            </span>

                            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                                {cartCount} item{cartCount === 1 ? '' : 's'}
                            </span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 p-5">
                        <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <div key={item.product_id} className="rounded-lg border bg-card p-3 shadow-xs">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {money(item.price)} each
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.product_id)}
                                                className="rounded-md p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                title="Remove"
                                            >
                                                <Trash2 className="size-4" /> 
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center overflow-hidden rounded-md border">
                                                <button
                                                    onClick={() => decrementQty(item.product_id)}
                                                    className="flex size-8 items-center justify-center hover:bg-muted"
                                                >
                                                    <Minus className="size-4" />
                                                </button>

                                                <div className="w-11 text-center text-sm font-semibold">
                                                    {item.quantity}
                                                </div>

                                                <button
                                                    onClick={() => incrementQty(item.product_id)}
                                                    className="flex size-8 items-center justify-center hover:bg-muted"
                                                >
                                                    <Plus className="size-4" />
                                                </button>
                                            </div>

                                            <div className="font-semibold">
                                                {money(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    <ShoppingCart className="mx-auto mb-2 size-8" />
                                    Cart is empty.
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <SummaryLine label="Subtotal" value={money(subtotal)} />
                            <SummaryLine label="Discount" value={money(0)} muted />
                            <SummaryLine label="Tax" value={money(0)} muted />

                            <div className="flex justify-between border-t pt-3 text-xl font-bold">
                                <span>Total</span>
                                <span>{money(subtotal)}</span>
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <PaymentButton
                                        active={checkoutForm.data.payment_method === 'cash'}
                                        icon={<Banknote className="size-4" />}
                                        label="Cash"
                                        onClick={() => checkoutForm.setData('payment_method', 'cash')}
                                    />
                                    <PaymentButton
                                        active={checkoutForm.data.payment_method === 'gcash'}
                                        icon={<Wallet className="size-4" />}
                                        label="GCash"
                                        onClick={() => checkoutForm.setData('payment_method', 'gcash')}
                                    />
                                    <PaymentButton
                                        active={checkoutForm.data.payment_method === 'card'}
                                        icon={<CreditCard className="size-4" />}
                                        label="Card"
                                        onClick={() => checkoutForm.setData('payment_method', 'card')}
                                    />
                                    <PaymentButton
                                        active={checkoutForm.data.payment_method === 'bank_transfer'}
                                        icon={<Wallet className="size-4" />}
                                        label="Bank"
                                        onClick={() => checkoutForm.setData('payment_method', 'bank_transfer')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Amount Paid</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={checkoutForm.data.amount_paid}
                                    onChange={(e) => checkoutForm.setData('amount_paid', e.target.value)}
                                    className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[subtotal, 100, 500, 1000].map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => quickCash(Math.ceil(Number(amount)))}
                                        className="rounded-md border px-2 py-2 text-xs hover:bg-muted"
                                    >
                                        {money(Math.ceil(Number(amount)))}
                                    </button>
                                ))}
                            </div>

                            {checkoutForm.data.payment_method !== 'cash' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Reference No.</label>
                                    <input
                                        value={checkoutForm.data.reference_no}
                                        onChange={(e) => checkoutForm.setData('reference_no', e.target.value)}
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                        placeholder="Transaction reference"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-sm font-medium">Remarks</label>
                                <textarea
                                    rows={2}
                                    value={checkoutForm.data.remarks}
                                    onChange={(e) => checkoutForm.setData('remarks', e.target.value)}
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    placeholder="Optional notes"
                                />
                            </div>

                            <div className="flex justify-between rounded-lg bg-muted p-3 text-sm">
                                <span>Change</span>
                                <span className={changeAmount < 0 ? 'font-semibold text-red-600' : 'font-semibold'}>
                                    {money(Math.max(changeAmount, 0))}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={clearCart}
                                className="rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                disabled={!canCheckout}
                                onClick={checkout}
                                className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {checkoutForm.processing ? 'Processing...' : 'Checkout'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function SummaryLine({
    label,
    value,
    muted = false,
}: {
    label: string;
    value: string;
    muted?: boolean;
}) {
    return (
        <div className={`flex justify-between text-sm ${muted ? 'text-muted-foreground' : ''}`}>
            <span>{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function PaymentButton({
    active,
    icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}