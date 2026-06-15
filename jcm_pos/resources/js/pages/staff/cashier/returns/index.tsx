import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Package,
    Receipt,
    RotateCcw,
    Search,
    Undo2,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

const RETURNS_URL = '/staff/cashier/returns';
const SEARCH_SALE_URL = '/staff/cashier/returns/search-sale';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cashier', href: '/staff/cashier/dashboard' },
    { title: 'Returns', href: RETURNS_URL },
];

type ReturnRow = {
    id: number;
    return_no: string;
    sale_id: number;
    sale_item_id: number;
    product_id: number;
    sale_no: string;
    product_name: string;
    sku?: string | null;
    quantity: string | number;
    unit_price: string | number;
    line_total: string | number;
    reason?: string | null;
    status: string;
    returned_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type SaleSearchItem = {
    id: number;
    sale_id: number;
    product_id: number;
    product_name: string;
    sku?: string | null;
    quantity: string | number;
    unit_price: string | number;
    line_total: string | number;
};

type SaleSearchResult = {
    sale: {
        id: number;
        sale_no: string;
        grand_total: string | number;
        sold_at: string;
    } | null;
    items: SaleSearchItem[];
};

type PageProps = {
    returns: {
        data: ReturnRow[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search?: string | null;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
};

export default function CashierReturnsIndex({ returns, filters, flash, errors }: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [saleNo, setSaleNo] = useState('');
    const [saleResult, setSaleResult] = useState<SaleSearchResult | null>(null);
    const [searchingSale, setSearchingSale] = useState(false);

    const form = useForm({
        sale_item_id: '',
        quantity: '',
        reason: '',
    });

    const money = (value: number | string | null | undefined) =>
        `₱${Number(value ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (value?: string | null) => {
        if (!value) return '—';

        return new Date(value).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const applyFilters = () => {
        router.get(
            RETURNS_URL,
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        router.get(RETURNS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const searchSale = async (event: FormEvent) => {
        event.preventDefault();

        if (!saleNo.trim()) {
            setSaleResult(null);
            return;
        }

        setSearchingSale(true);

        try {
            const response = await fetch(`${SEARCH_SALE_URL}?sale_no=${encodeURIComponent(saleNo.trim())}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = (await response.json()) as SaleSearchResult;

            setSaleResult(data);
            form.setData({
                sale_item_id: '',
                quantity: '',
                reason: '',
            });
        } finally {
            setSearchingSale(false);
        }
    };

    const submitReturn = (event: FormEvent) => {
        event.preventDefault();

        form.post(RETURNS_URL, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setSaleNo('');
                setSaleResult(null);
            },
        });
    };

    const selectedItem = saleResult?.items.find((item) => String(item.id) === String(form.data.sale_item_id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cashier Returns" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="size-4" />
                        {flash.success}
                    </div>
                )}

                {(flash?.error || Object.keys(errors ?? {}).length > 0) && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        <AlertCircle className="size-4" />
                        {flash?.error || Object.values(errors ?? {})[0]}
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
                    <Card tone="topline" variant="default" className="h-fit overflow-hidden">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Undo2 className="size-5 text-primary" />
                                Create Return
                            </CardTitle>
                            <CardDescription>
                                Search a sale number and return an item from your own cashier transactions.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 p-4">
                            <form onSubmit={searchSale} className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Sale No.</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={saleNo}
                                            onChange={(e) => setSaleNo(e.target.value)}
                                            placeholder="SALE-20260615-00001"
                                            className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        />

                                        <button
                                            type="submit"
                                            disabled={searchingSale}
                                            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                        >
                                            {searchingSale ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {saleResult && !saleResult.sale && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                                    Sale not found, or this sale does not belong to your cashier account.
                                </div>
                            )}

                            {saleResult?.sale && (
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Found Sale</div>
                                            <div className="font-bold">{saleResult.sale.sale_no}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {formatDate(saleResult.sale.sold_at)}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Current Total</div>
                                            <div className="font-bold">{money(saleResult.sale.grand_total)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {saleResult?.items && saleResult.items.length > 0 && (
                                <form onSubmit={submitReturn} className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Item to Return</label>
                                        <select
                                            value={form.data.sale_item_id}
                                            onChange={(e) => form.setData('sale_item_id', e.target.value)}
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">Select item</option>
                                            {saleResult.items.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.product_name} — Qty left: {Number(item.quantity)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedItem && (
                                        <div className="rounded-xl border bg-background p-3 text-sm">
                                            <div className="font-semibold">{selectedItem.product_name}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                SKU: {selectedItem.sku || 'N/A'} · Unit Price: {money(selectedItem.unit_price)}
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                Available return quantity:{' '}
                                                <span className="font-semibold text-foreground">{Number(selectedItem.quantity)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Return Quantity</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={selectedItem ? Number(selectedItem.quantity) : undefined}
                                            value={form.data.quantity}
                                            onChange={(e) => form.setData('quantity', e.target.value)}
                                            placeholder="0.00"
                                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Reason</label>
                                        <textarea
                                            rows={3}
                                            value={form.data.reason}
                                            onChange={(e) => form.setData('reason', e.target.value)}
                                            placeholder="Damaged item, wrong item, customer return..."
                                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>

                                    <div className="rounded-lg bg-muted p-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Estimated Refund</span>
                                            <span className="font-bold">
                                                {money(Number(form.data.quantity || 0) * Number(selectedItem?.unit_price ?? 0))}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={form.processing || !form.data.sale_item_id || !form.data.quantity}
                                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {form.processing ? 'Saving Return...' : 'Save Return'}
                                    </button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="border-b">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Receipt className="size-5 text-primary" />
                                        Return History
                                    </CardTitle>
                                    <CardDescription>
                                        Returns created by your cashier account.
                                    </CardDescription>
                                </div>

                                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                                    Showing <span className="font-semibold">{returns.from ?? 0}</span> -{' '}
                                    <span className="font-semibold">{returns.to ?? 0}</span> of{' '}
                                    <span className="font-semibold">{returns.total}</span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 p-4">
                            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search return no, sale no, product, SKU..."
                                        className="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                                >
                                    Filter
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold hover:bg-muted"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-xl border">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/60 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Return No</th>
                                                <th className="px-4 py-3 font-medium">Sale No</th>
                                                <th className="px-4 py-3 font-medium">Product</th>
                                                <th className="px-4 py-3 text-center font-medium">Qty</th>
                                                <th className="px-4 py-3 text-right font-medium">Amount</th>
                                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium">Date</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {returns.data.length > 0 ? (
                                                returns.data.map((item) => (
                                                    <tr key={item.id} className="border-t hover:bg-muted/30">
                                                        <td className="px-4 py-3">
                                                            <div className="font-semibold">{item.return_no}</div>
                                                            {item.reason && (
                                                                <div className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">
                                                                    {item.reason}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 text-muted-foreground">{item.sale_no}</td>

                                                        <td className="px-4 py-3">
                                                            <div className="font-medium">{item.product_name}</div>
                                                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Package className="size-3.5" />
                                                                SKU: {item.sku || 'N/A'}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 text-center font-semibold">
                                                            {Number(item.quantity)}
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-bold">
                                                            {money(item.line_total)}
                                                        </td>

                                                        <td className="px-4 py-3 text-center">
                                                            <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold capitalize text-green-700 dark:bg-green-950 dark:text-green-300">
                                                                {item.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {formatDate(item.returned_at)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-16 text-center">
                                                        <Undo2 className="mx-auto mb-3 size-10 text-muted-foreground" />
                                                        <h3 className="font-semibold">No returns found</h3>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            Returns created by this cashier will appear here.
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {returns.links.map((link, index) => (
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}