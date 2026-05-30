import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArchiveRestore,
    Package2,
    PhilippinePeso,
    RotateCcw,
    Search,
    ShoppingBag,
    Undo2,
    X,
} from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

const RETURNS_URL = '/client/sales/returns';
const SEARCH_SALE_URL = '/client/sales/returns/search-sale';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Returns', href: RETURNS_URL }];

type Branch = {
    id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
};

type ReturnItem = {
    id: number;
    tenant_id: number;
    branch_id?: number | null;
    sale_id: number;
    sale_item_id: number;
    product_id: number;
    product_name?: string | null;
    sku?: string | null;
    return_no: string;
    quantity: string | number;
    unit_price: string | number;
    line_total: string | number;
    reason?: string | null;
    status: string;
    returned_at?: string | null;
    sale_no?: string | null;
    branch_name?: string | null;
    branch_code?: string | null;
};

type Sale = {
    id: number;
    sale_no: string;
    branch_id?: number | null;
    grand_total?: string | number;
    status?: string;
    sold_at?: string | null;
};

type SaleItem = {
    id: number;
    sale_id: number;
    product_id: number;
    product_name: string;
    sku?: string | null;
    quantity: string | number;
    unit_price: string | number;
    line_total: string | number;
};

type Paginated<T> = {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

type PageProps = {
    returns: Paginated<ReturnItem>;
    branches: Branch[];
    filters?: {
        search?: string | null;
        branch_id?: string | null;
    };
};

export default function ReturnsIndex({ returns, branches = [], filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [branchId, setBranchId] = useState(filters?.branch_id ?? '');
    const [isOpen, setIsOpen] = useState(false);

    const [saleNo, setSaleNo] = useState('');
    const [foundSale, setFoundSale] = useState<Sale | null>(null);
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [selectedSaleItemId, setSelectedSaleItemId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                RETURNS_URL,
                { search, branch_id: branchId },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, branchId]);

    const rows = useMemo(() => returns?.data ?? [], [returns]);

    const summary = useMemo(() => {
        const totalReturns = rows.length;
        const totalQty = rows.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
        const totalAmount = rows.reduce((sum, item) => sum + Number(item.line_total ?? 0), 0);
        const completed = rows.filter((item) => item.status === 'completed').length;

        return { totalReturns, totalQty, totalAmount, completed };
    }, [rows]);

    const selectedItem = saleItems.find((item) => String(item.id) === selectedSaleItemId);

    const maxReturnQty = Number(selectedItem?.quantity ?? 0);
    const returnQtyNumber = Number(quantity || 0);

    const quantityError =
        selectedItem && returnQtyNumber > maxReturnQty
            ? `Return quantity cannot exceed sold quantity (${maxReturnQty}).`
            : '';

    const isInvalidQuantity =
        !selectedItem ||
        !quantity ||
        returnQtyNumber <= 0 ||
        returnQtyNumber > maxReturnQty;

    const money = (value: string | number | null | undefined) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value ?? 0));

    const number = (value: string | number | null | undefined) =>
        new Intl.NumberFormat('en-PH', {
            maximumFractionDigits: 2,
        }).format(Number(value ?? 0));

    const formatDate = (date?: string | null) => {
        if (!date) return '—';

        return new Date(date).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const resetFilters = () => {
        setSearch('');
        setBranchId('');
        router.get(RETURNS_URL, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetReturnForm = () => {
        setSaleNo('');
        setFoundSale(null);
        setSaleItems([]);
        setSelectedSaleItemId('');
        setQuantity('');
        setReason('');
        setSearchMessage('');
    };

    const closeModal = () => {
        setIsOpen(false);
        resetReturnForm();
    };

    const searchSale = async () => {
        if (!saleNo.trim()) {
            setSearchMessage('Enter transaction number first.');
            return;
        }

        setIsSearching(true);
        setSearchMessage('');
        setFoundSale(null);
        setSaleItems([]);
        setSelectedSaleItemId('');
        setQuantity('');

        try {
            const response = await fetch(`${SEARCH_SALE_URL}?sale_no=${encodeURIComponent(saleNo)}`, {
                headers: { Accept: 'application/json' },
            });

            const data = await response.json();

            if (!data.sale) {
                setSearchMessage('No transaction found.');
                return;
            }

            setFoundSale(data.sale);
            setSaleItems(data.items ?? []);
        } catch {
            setSearchMessage('Unable to search transaction.');
        } finally {
            setIsSearching(false);
        }
    };

    const submitReturn = (e: FormEvent) => {
        e.preventDefault();

        if (isInvalidQuantity) return;

        router.post(
            RETURNS_URL,
            {
                sale_item_id: selectedSaleItemId,
                quantity,
                reason,
            },
            {
                preserveScroll: true,
                onSuccess: closeModal,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Returns" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Returns</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Process returned items by transaction number and restore returned stock.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                        <Undo2 className="size-4" />
                        New Return
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard title="Return Records" value={number(summary.totalReturns)} icon={<ArchiveRestore className="size-5" />} />
                    <SummaryCard title="Returned Qty" value={number(summary.totalQty)} icon={<Package2 className="size-5" />} variant="success" />
                    <SummaryCard title="Return Amount" value={money(summary.totalAmount)} icon={<PhilippinePeso className="size-5" />} />
                    <SummaryCard title="Completed" value={number(summary.completed)} icon={<ShoppingBag className="size-5" />} variant="success" />
                </div>

                <Card tone="topline" variant="default" className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b p-5">
                        <CardTitle className="text-xl">Return History</CardTitle>
                        <CardDescription className="mt-1">
                            Track returned products, receipt number, quantity, reason, and restored stock.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-md">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search return no, sale no, product, SKU..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All branches</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={String(branch.id)}>
                                            {branch.name}
                                            {branch.code ? ` (${branch.code})` : ''}
                                            {branch.is_main ? ' — Main' : ''}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-muted"
                                >
                                    <RotateCcw className="size-4" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Returned Product</th>
                                        <th className="px-4 py-3 font-medium">Return No</th>
                                        <th className="px-4 py-3 font-medium">Sale No</th>
                                        <th className="px-4 py-3 font-medium">Branch</th>
                                        <th className="px-4 py-3 text-right font-medium">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                                        <th className="px-4 py-3 font-medium">Reason</th>
                                        <th className="px-4 py-3 font-medium">Returned At</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.length > 0 ? (
                                        rows.map((item) => (
                                            <tr key={item.id} className="border-t border-sidebar-border/70 transition hover:bg-muted/30 dark:border-sidebar-border">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                            <Package2 className="size-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{item.product_name ?? 'Product'}</div>
                                                            <div className="mt-1 text-xs text-muted-foreground">SKU: {item.sku || '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 font-medium">{item.return_no}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.sale_no ?? '—'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {item.branch_name ?? 'No branch'}
                                                    {item.branch_code ? ` (${item.branch_code})` : ''}
                                                </td>
                                                <td className="px-4 py-3 text-right">{number(item.quantity)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{money(item.line_total)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.reason || '—'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.returned_at)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                                                        <ArchiveRestore className="size-5 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="font-medium">No returns found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Returned items will appear here after you process a return.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing <b>{returns?.from ?? 0}</b> to <b>{returns?.to ?? 0}</b> of <b>{returns?.total ?? 0}</b> returns
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(returns?.links ?? []).map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                        className={[
                                            'min-w-9 rounded-md border px-3 py-2 text-xs',
                                            link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                            !link.url ? 'cursor-not-allowed opacity-50' : '',
                                        ].join(' ')}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isOpen && (
                    <Modal>
                        <CardHeader className="flex flex-row items-center justify-between border-b p-5">
                            <div>
                                <CardTitle className="text-lg">New Return</CardTitle>
                                <CardDescription>
                                    Search transaction number, choose item, and input returned quantity.
                                </CardDescription>
                            </div>

                            <button onClick={closeModal} className="rounded-md p-2 hover:bg-muted">
                                <X className="size-4" />
                            </button>
                        </CardHeader>

                        <form onSubmit={submitReturn} className="space-y-5 p-5">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Transaction / Sale No</label>
                                <div className="flex gap-2">
                                    <input
                                        value={saleNo}
                                        onChange={(e) => setSaleNo(e.target.value)}
                                        placeholder="e.g. SALE-000001"
                                        className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />

                                    <button
                                        type="button"
                                        onClick={searchSale}
                                        disabled={isSearching}
                                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isSearching ? 'Searching...' : 'Search'}
                                    </button>
                                </div>

                                {searchMessage && <p className="mt-2 text-sm text-red-600">{searchMessage}</p>}
                            </div>

                            {foundSale && (
                                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                                    <div className="font-medium">Transaction Found: {foundSale.sale_no}</div>
                                    <div className="mt-1 text-muted-foreground">
                                        Status: {foundSale.status ?? '—'} • Total: {money(foundSale.grand_total)} • Sold at: {formatDate(foundSale.sold_at)}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Item to Return</label>
                                    <select
                                        value={selectedSaleItemId}
                                        onChange={(e) => {
                                            setSelectedSaleItemId(e.target.value);
                                            setQuantity('');
                                        }}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Select item</option>
                                        {saleItems.map((item) => (
                                            <option key={item.id} value={String(item.id)}>
                                                {item.product_name} — Qty {number(item.quantity)} — {money(item.unit_price)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Return Quantity</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max={maxReturnQty || undefined}
                                        step="0.01"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        className={[
                                            'h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2',
                                            quantityError ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-ring',
                                        ].join(' ')}
                                    />

                                    {quantityError && (
                                        <p className="mt-1 text-xs font-medium text-red-600">
                                            {quantityError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {selectedItem && (
                                <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                    Selected: <b>{selectedItem.product_name}</b> • Sold Qty: {number(selectedItem.quantity)} • Unit Price:{' '}
                                    {money(selectedItem.unit_price)}
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-sm font-medium">Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Optional reason, e.g. damaged item, wrong item, customer returned..."
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                After saving, returned quantity will be added back to product stock automatically.
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={isInvalidQuantity}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                >
                                    Save Return
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    variant = 'default',
}: {
    title: string;
    value: string;
    icon: ReactNode;
    variant?: 'default' | 'success' | 'neutral' | 'warning' | 'danger';
}) {
    return (
        <Card tone="topline" variant={variant} className="min-h-[120px] overflow-hidden shadow-sm">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5">
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
                </div>

                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto shadow-xl">{children}</Card>
        </div>
    );
}