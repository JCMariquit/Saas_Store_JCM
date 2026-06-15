import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    Barcode,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    Minus,
    Package,
    Plus,
    Printer,
    Receipt,
    RotateCcw,
    Search,
    ShoppingCart,
    Tag,
    Trash2,
    Wallet,
    X,
} from 'lucide-react';
import { Fragment, type ReactNode, useEffect, useMemo, useState } from 'react';

const POS_TERMINAL_URL = '/staff/cashier/pos/terminal';
const POS_CHECKOUT_URL = '/staff/cashier/pos/checkout';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cashier POS', href: POS_TERMINAL_URL }];

type Category = {
    id: number;
    name: string;
};

type Discount = {
    id: number;
    branch_id?: number | null;
    name: string;
    code?: string | null;
    type: 'percent' | 'fixed';
    value: string | number;
    min_purchase: string | number;
    max_discount?: string | number | null;
};

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
    discounts?: Discount[];
    selected_branch_id?: number | string | null;
    filters: {
        search?: string | null;
        category_id?: string | null;
        stock_status?: string | null;
        branch_id?: string | number | null;
    };
    cashier?: {
        id: number;
        name: string;
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

type LastSale = {
    items: CartItem[];
    subtotal: number;
    discountTotal: number;
    grandTotal: number;
    discountName?: string | null;
    amountPaid: number;
    change: number;
    paymentMethod: string;
    referenceNo?: string | null;
    remarks?: string | null;
    date: string;
    cashierName: string;
};

export default function CashierPosTerminalIndex({
    products,
    categories,
    discounts = [],
    filters,
    cashier,
}: PageProps) {
    const cashierName = cashier?.name ?? 'Cashier';

    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category_id ?? '');
    const [stockStatus, setStockStatus] = useState(filters?.stock_status ?? '');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [openProductId, setOpenProductId] = useState<number | null>(null);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [lastSale, setLastSale] = useState<LastSale | null>(null);

    const checkoutForm = useForm({
        discount_id: '',
        payment_method: 'cash',
        amount_paid: '',
        reference_no: '',
        remarks: '',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                POS_TERMINAL_URL,
                {
                    search,
                    category_id: categoryFilter,
                    stock_status: stockStatus,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, categoryFilter, stockStatus]);

    const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

    const selectedDiscount = useMemo(() => {
        return discounts.find((discount) => String(discount.id) === String(checkoutForm.data.discount_id)) ?? null;
    }, [discounts, checkoutForm.data.discount_id]);

    const discountTotal = useMemo(() => {
        if (!selectedDiscount || subtotal <= 0) return 0;

        const minPurchase = Number(selectedDiscount.min_purchase ?? 0);

        if (subtotal < minPurchase) return 0;

        let computed = 0;

        if (selectedDiscount.type === 'percent') {
            computed = subtotal * (Number(selectedDiscount.value ?? 0) / 100);

            if (selectedDiscount.max_discount !== null && selectedDiscount.max_discount !== undefined) {
                computed = Math.min(computed, Number(selectedDiscount.max_discount ?? 0));
            }
        } else {
            computed = Number(selectedDiscount.value ?? 0);
        }

        return Math.min(Number(computed.toFixed(2)), subtotal);
    }, [selectedDiscount, subtotal]);

    const grandTotal = Math.max(Number((subtotal - discountTotal).toFixed(2)), 0);
    const amountPaid = Number(checkoutForm.data.amount_paid || 0);
    const changeAmount = amountPaid - grandTotal;
    const canCheckout = cart.length > 0 && amountPaid >= grandTotal && !checkoutForm.processing;

    const money = (value: number | string) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const clearCart = () => {
        setCart([]);
        checkoutForm.setData({
            discount_id: '',
            payment_method: 'cash',
            amount_paid: '',
            reference_no: '',
            remarks: '',
        });
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setStockStatus('');
        setOpenProductId(null);

        router.get(POS_TERMINAL_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
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

                return current.map((item) => (item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
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
            current.map((item) => (item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item)).filter((item) => item.quantity > 0),
        );
    };

    const removeItem = (productId: number) => {
        setCart((current) => current.filter((item) => item.product_id !== productId));
    };

    const quickCash = (amount: number) => {
        checkoutForm.setData('amount_paid', String(amount));
    };

    const closeReceiptModalAndStartNewSale = () => {
        setReceiptModalOpen(false);
        setLastSale(null);
        clearCart();
    };

    const printReceipt = () => {
        window.print();
    };

    const checkout = () => {
        if (cart.length === 0) {
            alert('Cart is empty.');
            return;
        }

        if (amountPaid < grandTotal) {
            alert('Amount paid is less than total.');
            return;
        }

        router.post(
            POS_CHECKOUT_URL,
            {
                items: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
                discount_id: checkoutForm.data.discount_id || null,
                payment_method: checkoutForm.data.payment_method,
                amount_paid: checkoutForm.data.amount_paid,
                reference_no: checkoutForm.data.reference_no,
                remarks: checkoutForm.data.remarks,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLastSale({
                        items: cart,
                        subtotal,
                        discountTotal,
                        grandTotal,
                        discountName: selectedDiscount?.name ?? null,
                        amountPaid,
                        change: Math.max(changeAmount, 0),
                        paymentMethod: checkoutForm.data.payment_method,
                        referenceNo: checkoutForm.data.reference_no,
                        remarks: checkoutForm.data.remarks,
                        date: new Date().toLocaleString(),
                        cashierName,
                    });

                    setReceiptModalOpen(true);
                },
                onError: (errors) => {
                    console.log(errors);
                    alert('Checkout failed. Check stock, payment, or discount.');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cashier POS Terminal" />

            <style>{`
                .pos-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(120, 120, 120, 0.25) transparent;
                }
                .pos-scrollbar::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                .pos-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .pos-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(140, 140, 140, 0.18);
                    border-radius: 999px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .pos-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(160, 160, 160, 0.35);
                    background-clip: padding-box;
                }

                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    #pos-receipt-print,
                    #pos-receipt-print * {
                        visibility: visible !important;
                    }

                    #pos-receipt-print {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 24px !important;
                        background: white !important;
                        color: black !important;
                    }

                    .pos-no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="grid h-[calc(100vh-5rem)] min-h-0 gap-4 overflow-hidden p-4 xl:grid-cols-[minmax(0,1fr)_430px]">
                <div className="pos-scrollbar flex min-w-0 flex-col gap-4 overflow-y-auto pr-1">
                    <Card tone="topline" variant="default" className="shrink-0 overflow-hidden">
                        <CardHeader className="border-b p-0">
                            <div className="flex flex-col gap-4 p-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Receipt className="size-5" />
                                            </span>
                                            Cashier POS Terminal
                                        </CardTitle>

                                        <CardDescription className="mt-1 max-w-xl">
                                            Process sales in your assigned branch. Branch is locked by your cashier account.
                                        </CardDescription>
                                    </div>

                                    <div className="flex h-10 items-center overflow-hidden rounded-lg border bg-muted/30 text-sm">
                                        <div className="flex h-full items-center gap-2 px-3">
                                            <Package className="size-4 text-muted-foreground" />
                                            <span className="font-semibold">{products.total}</span>
                                            <span className="text-muted-foreground">items available</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-[minmax(260px,1fr)_220px_42px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search product, SKU, or barcode..."
                                            className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="h-11 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                                        className="inline-flex h-11 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
                                        title="Reset filters"
                                    >
                                        <RotateCcw className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="shrink-0 overflow-hidden">
                        <CardHeader className="border-b p-0">
                            <div className="flex flex-col gap-3 p-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="size-4 text-primary" />
                                    Product List
                                </CardTitle>

                                <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
                                    {[
                                        { label: 'All Products', value: '' },
                                        { label: 'In Stock', value: 'in_stock' },
                                        { label: 'Out of Stock', value: 'out_of_stock' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.value}
                                            type="button"
                                            onClick={() => setStockStatus(tab.value)}
                                            className={`h-9 rounded-md px-4 text-sm font-medium transition ${
                                                stockStatus === tab.value
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/60 text-left">
                                        <tr>
                                            <th className="w-12 px-4 py-3"></th>
                                            <th className="px-4 py-3 font-medium">Product</th>
                                            <th className="px-4 py-3 font-medium">Category</th>
                                            <th className="px-4 py-3 text-right font-medium">Price</th>
                                            <th className="px-4 py-3 text-center font-medium">Stock</th>
                                            <th className="px-4 py-3 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.data.length > 0 ? (
                                            products.data.map((product) => {
                                                const stock = Number(product.quantity ?? 0);
                                                const isOut = product.stock_tracking === 'tracked' && stock <= 0;
                                                const isLow = product.stock_tracking === 'tracked' && stock > 0 && stock <= 5;
                                                const inCart = cart.find((item) => item.product_id === product.id);
                                                const isOpen = openProductId === product.id;

                                                return (
                                                    <Fragment key={product.id}>
                                                        <tr className="border-t transition hover:bg-muted/30">
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenProductId(isOpen ? null : product.id)}
                                                                    className="inline-flex size-8 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
                                                                >
                                                                    <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                                </button>
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold">{product.name}</div>
                                                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Barcode className="size-3.5" />
                                                                    SKU: {product.sku || 'N/A'}
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                                                    {product.category?.name ?? 'No Category'}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-3 text-right font-bold">{money(product.selling_price)}</td>

                                                            <td className="px-4 py-3 text-center">
                                                                <span
                                                                    className={`inline-flex min-w-8 justify-center rounded-md px-2 py-1 text-xs font-semibold ${
                                                                        isOut
                                                                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                                            : isLow
                                                                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                                                              : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                                    }`}
                                                                >
                                                                    {product.stock_tracking === 'tracked' ? stock : '∞'}
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    disabled={isOut}
                                                                    onClick={() => addToCart(product)}
                                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <Plus className="size-4" />
                                                                    {inCart ? 'Add More' : 'Add'}
                                                                </button>
                                                            </td>
                                                        </tr>

                                                        {isOpen && (
                                                            <tr className="border-t bg-muted/20">
                                                                <td></td>
                                                                <td colSpan={5} className="px-4 py-4">
                                                                    <div className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-4">
                                                                        <Info label="Product Name" value={product.name} />
                                                                        <Info label="SKU" value={product.sku || 'N/A'} />
                                                                        <Info label="Barcode" value={product.barcode || 'N/A'} />
                                                                        <Info label="Stock Tracking" value={product.stock_tracking.replace('_', ' ')} />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-16 text-center">
                                                    <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
                                                    <h3 className="font-semibold">No active products found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">Try changing your search or category filter.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex shrink-0 flex-wrap gap-1 pb-2">
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

                <Card tone="topline" variant="success" className="sticky top-0 flex h-full min-h-0 flex-col overflow-hidden">
                    <CardHeader className="shrink-0 border-b p-4">
                        <CardTitle className="flex items-center justify-between text-xl">
                            <span className="flex items-center gap-2">
                                <ShoppingCart className="size-5" />
                                Current Sale
                            </span>

                            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                                {cartCount} item{cartCount === 1 ? '' : 's'}
                            </span>
                        </CardTitle>

                        <div className="mt-2 rounded-lg border bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
                            Cashier: <span className="font-semibold text-foreground">{cashierName}</span>
                        </div>
                    </CardHeader>

                    <CardContent className="pos-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                        <div className="pos-scrollbar max-h-[190px] space-y-3 overflow-y-auto pr-1">
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <div key={item.product_id} className="rounded-lg border bg-card p-3 shadow-xs">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{money(item.price)} each</div>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.product_id)}
                                                className="rounded-md p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center overflow-hidden rounded-md border">
                                                <button onClick={() => decrementQty(item.product_id)} className="flex size-8 items-center justify-center hover:bg-muted">
                                                    <Minus className="size-4" />
                                                </button>

                                                <div className="w-11 text-center text-sm font-semibold">{item.quantity}</div>

                                                <button onClick={() => incrementQty(item.product_id)} className="flex size-8 items-center justify-center hover:bg-muted">
                                                    <Plus className="size-4" />
                                                </button>
                                            </div>

                                            <div className="font-semibold">{money(item.price * item.quantity)}</div>
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
                            <SummaryLine
                                label={selectedDiscount ? `Discount (${selectedDiscount.name})` : 'Discount'}
                                value={`-${money(discountTotal)}`}
                                muted={!selectedDiscount}
                            />
                            <SummaryLine label="Tax" value={money(0)} muted />

                            <div className="flex justify-between border-t pt-3 text-xl font-bold">
                                <span>Total</span>
                                <span>{money(grandTotal)}</span>
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div>
                                <label className="mb-1 flex items-center gap-2 text-sm font-medium">
                                    <Tag className="size-4" />
                                    Discount
                                </label>
                                <select
                                    value={checkoutForm.data.discount_id}
                                    onChange={(e) => checkoutForm.setData('discount_id', e.target.value)}
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">No Discount</option>
                                    {discounts.map((discount) => (
                                        <option key={discount.id} value={String(discount.id)}>
                                            {discount.name}
                                            {discount.code ? ` (${discount.code})` : ''} —{' '}
                                            {discount.type === 'percent' ? `${Number(discount.value)}%` : money(discount.value)}
                                        </option>
                                    ))}
                                </select>

                                {selectedDiscount && Number(selectedDiscount.min_purchase ?? 0) > subtotal && (
                                    <p className="mt-1 text-xs text-amber-600">Minimum purchase required: {money(selectedDiscount.min_purchase)}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <PaymentButton active={checkoutForm.data.payment_method === 'cash'} icon={<Banknote className="size-4" />} label="Cash" onClick={() => checkoutForm.setData('payment_method', 'cash')} />
                                    <PaymentButton active={checkoutForm.data.payment_method === 'gcash'} icon={<Wallet className="size-4" />} label="GCash" onClick={() => checkoutForm.setData('payment_method', 'gcash')} />
                                    <PaymentButton active={checkoutForm.data.payment_method === 'card'} icon={<CreditCard className="size-4" />} label="Card" onClick={() => checkoutForm.setData('payment_method', 'card')} />
                                    <PaymentButton active={checkoutForm.data.payment_method === 'bank_transfer'} icon={<Wallet className="size-4" />} label="Bank" onClick={() => checkoutForm.setData('payment_method', 'bank_transfer')} />
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
                                {[grandTotal, 100, 500, 1000].map((amount) => (
                                    <button key={amount} type="button" onClick={() => quickCash(Math.ceil(Number(amount)))} className="rounded-md border px-2 py-2 text-xs hover:bg-muted">
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
                            <button type="button" onClick={clearCart} className="rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted">
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

            {receiptModalOpen && lastSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-2xl">
                        <div className="pos-no-print flex items-start justify-between gap-4 border-b p-5">
                            <div className="flex gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    <CheckCircle2 className="size-6" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold">Sale completed successfully</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Processed by {lastSale.cashierName}. Print receipt or start a new sale.
                                    </p>
                                </div>
                            </div>

                            <button type="button" onClick={closeReceiptModalAndStartNewSale} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div id="pos-receipt-print" className="mx-auto bg-white p-5 text-black">
                            <div className="mx-auto w-[280px] font-mono text-[11px] leading-tight">
                                <div className="text-center">
                                    <div className="text-sm font-bold tracking-wide">JCM WEB SOLUTION</div>
                                    <div className="mt-1 text-[10px]">POS RECEIPT</div>
                                    <div className="text-[10px]">Marinduque, Philippines</div>
                                </div>

                                <div className="my-3 border-t border-dashed border-black"></div>

                                <div className="space-y-1 text-[10px]">
                                    <div className="flex justify-between">
                                        <span>DATE</span>
                                        <span>{lastSale.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>CASHIER</span>
                                        <span className="font-bold">{lastSale.cashierName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>PAYMENT</span>
                                        <span>{lastSale.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="my-3 border-t border-dashed border-black"></div>

                                <div className="grid grid-cols-[32px_1fr_60px] gap-1 text-[10px] font-bold">
                                    <span>QTY</span>
                                    <span>DESC</span>
                                    <span className="text-right">AMT</span>
                                </div>

                                <div className="my-1 border-t border-dashed border-black"></div>

                                <div className="space-y-2">
                                    {lastSale.items.map((item) => (
                                        <div key={item.product_id} className="grid grid-cols-[32px_1fr_60px] gap-1 text-[10px]">
                                            <span>{item.quantity}</span>
                                            <span>
                                                <span className="block font-semibold">{item.name}</span>
                                                <span className="block text-[9px]">
                                                    {item.quantity} x {money(item.price)}
                                                </span>
                                            </span>
                                            <span className="text-right font-semibold">{money(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="my-3 border-t border-dashed border-black"></div>

                                <div className="space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span>SUBTOTAL</span>
                                        <span>{money(lastSale.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>TAX</span>
                                        <span>{money(0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>DISCOUNT</span>
                                        <span>-{money(lastSale.discountTotal)}</span>
                                    </div>
                                    {lastSale.discountName && (
                                        <div className="flex justify-between text-[10px]">
                                            <span>DISC NAME</span>
                                            <span>{lastSale.discountName}</span>
                                        </div>
                                    )}
                                    <div className="mt-2 flex justify-between text-sm font-bold">
                                        <span>AMT</span>
                                        <span>{money(lastSale.grandTotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>PAID</span>
                                        <span>{money(lastSale.amountPaid)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>CHANGE</span>
                                        <span>{money(lastSale.change)}</span>
                                    </div>
                                </div>

                                {lastSale.referenceNo && (
                                    <>
                                        <div className="my-3 border-t border-dashed border-black"></div>
                                        <div className="text-[10px]">
                                            REF: <span className="font-bold">{lastSale.referenceNo}</span>
                                        </div>
                                    </>
                                )}

                                {lastSale.remarks && (
                                    <>
                                        <div className="my-3 border-t border-dashed border-black"></div>
                                        <div className="text-[10px]">REMARKS: {lastSale.remarks}</div>
                                    </>
                                )}

                                <div className="my-3 border-t border-dashed border-black"></div>

                                <div className="text-center text-[10px]">
                                    <div>THANK YOU FOR YOUR PURCHASE</div>
                                    <div className="mt-2 text-[9px]">Powered by JCM Web Solution</div>
                                </div>
                            </div>
                        </div>

                        <div className="pos-no-print grid grid-cols-1 gap-2 border-t p-5 sm:grid-cols-2">
                            <button type="button" onClick={closeReceiptModalAndStartNewSale} className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                                No, Start New Sale
                            </button>

                            <button type="button" onClick={printReceipt} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                                <Printer className="size-4" />
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium capitalize">{value}</div>
        </div>
    );
}

function SummaryLine({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
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
    icon: ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}