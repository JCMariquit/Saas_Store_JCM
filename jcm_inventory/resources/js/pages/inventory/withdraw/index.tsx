import { FormField } from '@/components/shared/form-field';
import { PageContainer } from '@/components/shared/page-container';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Barcode,
    Boxes,
    Building2,
    CalendarDays,
    CheckCircle2,
    FileText,
    Filter,
    Minus,
    PackageMinus,
    Plus,
    RotateCcw,
    Search,
    ShoppingCart,
    Trash2,
    UserRound,
    Warehouse,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    type KeyboardEvent,
    type RefObject,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

const TERMINAL_URL = '/inventory/withdraw';
const ALL_CATEGORIES = 'all';
const QUANTITY_STEP = 0.001;
const DESKTOP_REVIEW_QUERY = '(min-width: 1360px)';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/inventory/overview' },
    { title: 'Withdraw Stock', href: TERMINAL_URL },
];

type WarehouseOption = {
    id: number;
    branch_id: number;
    code: string | null;
    name: string;
    is_main: boolean;
    branch: {
        id: number;
        code: string | null;
        name: string;
    };
};

type ProductStock = {
    stock_id: number;
    warehouse_id: number;
    branch_id: number;
    product_id: number;
    name: string;
    sku: string | null;
    barcode: string | null;
    unit: string;
    category: {
        id: number | null;
        name: string | null;
    };
    warehouse: {
        id: number;
        code: string | null;
        name: string;
    };
    branch: {
        id: number;
        code: string | null;
        name: string;
    };
    available_quantity: number;
    reorder_level: number;
    average_cost: number;
};

type ReasonOption = {
    value: string;
    label: string;
};

type TerminalSummary = {
    warehouses: number;
    available_stock_lines: number;
    available_quantity: number;
    issued_today: number;
    quantity_issued_today: number;
};

type CartItem = {
    product_id: number;
    quantity_issued: string;
    notes: string;
};

type WithdrawalFormData = {
    warehouse_id: string;
    issuance_date: string;
    reason: string;
    issued_to: string;
    department: string;
    purpose: string;
    reference_no: string;
    notes: string;
    items: CartItem[];
};

type TextField = Exclude<keyof WithdrawalFormData, 'items'>;

type CartEntry = {
    item: CartItem;
    product: ProductStock;
    index: number;
};

type CategoryOption = {
    value: string;
    label: string;
};

type PageProps = {
    warehouses: WarehouseOption[];
    products: ProductStock[];
    reasons: ReasonOption[];
    summary: TerminalSummary;
};

type FormErrors = Partial<Record<keyof WithdrawalFormData, string>>;

function todayLocal(): string {
    const currentDate = new Date();
    const timezoneOffset = currentDate.getTimezoneOffset();

    return new Date(currentDate.getTime() - timezoneOffset * 60_000)
        .toISOString()
        .slice(0, 10);
}

function formatNumber(value: number, maximumFractionDigits = 3): string {
    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(Number(value || 0));
}

function formatMoney(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function normalizeCategory(value: string): string {
    return value.trim().toLowerCase();
}

function getInitialWarehouseId(warehouses: WarehouseOption[]): string {
    const mainWarehouse = warehouses.find((warehouse) => warehouse.is_main);

    return String(mainWarehouse?.id ?? warehouses[0]?.id ?? '');
}

function getEmptyWithdrawalForm(
    warehouses: WarehouseOption[],
    reasons: ReasonOption[],
): WithdrawalFormData {
    return {
        warehouse_id: getInitialWarehouseId(warehouses),
        issuance_date: todayLocal(),
        reason: reasons[0]?.value ?? 'used_consumed',
        issued_to: '',
        department: '',
        purpose: '',
        reference_no: '',
        notes: '',
        items: [],
    };
}

function getNestedError(
    errors: FormErrors,
    key: string,
): string | undefined {
    return (errors as Record<string, string | undefined>)[key];
}

function getStockState(product: ProductStock): {
    label: string;
    variant: 'success' | 'warning' | 'danger';
} {
    if (product.available_quantity <= 0) {
        return { label: 'Out of stock', variant: 'danger' };
    }

    if (
        product.reorder_level > 0 &&
        product.available_quantity <= product.reorder_level
    ) {
        return { label: 'Low stock', variant: 'warning' };
    }

    return { label: 'Available', variant: 'success' };
}

function clampQuantity(value: number, maximum: number): number {
    return Math.min(maximum, Math.max(QUANTITY_STEP, value));
}

function InlineError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-4 text-rose-500">
            <AlertTriangle className="mt-0.5 size-3 shrink-0" />
            <span>{message}</span>
        </p>
    );
}

function WorkspaceHeader({
    selectedWarehouse,
    availableQuantity,
    selectedCount,
    totalQuantity,
    summary,
    processing,
    onReset,
}: {
    selectedWarehouse: WarehouseOption | null;
    availableQuantity: number;
    selectedCount: number;
    totalQuantity: number;
    summary: TerminalSummary;
    processing: boolean;
    onReset: () => void;
}) {
    return (
        <header>
            <section className="relative overflow-hidden rounded-[20px] border border-primary/15 bg-gradient-to-br from-primary/[0.085] via-primary/[0.025] to-transparent shadow-sm">
                <div className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-primary/[0.07] blur-3xl" />
                <PackageMinus className="pointer-events-none absolute -bottom-9 -right-7 size-36 text-primary opacity-[0.025]" />

                <div className="relative flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-6">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
                            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--theme-glow)]" />
                            Inventory operation
                        </div>

                        <div className="mt-3 flex items-center gap-3.5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                                <PackageMinus className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-xl font-semibold tracking-[-0.03em] text-foreground md:text-2xl">
                                        Create stock withdrawal
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className="h-5 rounded-full border-emerald-500/15 bg-emerald-500/[0.055] px-2 text-[8px] font-semibold tracking-[0.08em] text-emerald-400"
                                    >
                                        STOCK OUT
                                    </Badge>
                                </div>

                                <p className="mt-1.5 max-w-2xl text-[10px] leading-4 text-muted-foreground md:text-[11px]">
                                    Build a release request, select inventory, then post it from the review panel.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onReset}
                        disabled={processing}
                        className="h-9 self-start rounded-xl border-primary/15 bg-primary/[0.035] px-3 text-[10px] text-primary hover:border-primary/25 hover:bg-primary/[0.075] hover:text-primary sm:self-auto"
                    >
                        <RotateCcw className="size-3.5" />
                        Start over
                    </Button>
                </div>

                <div className="relative h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

                <div className="relative grid bg-background/15 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="min-w-0 border-b border-primary/10 px-4 py-3.5 sm:border-r xl:border-b-0">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Warehouse
                        </p>
                        <p className="mt-1 truncate text-[11px] font-semibold text-foreground">
                            {selectedWarehouse?.name ?? 'Not selected'}
                        </p>
                        <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
                            {selectedWarehouse?.code ?? selectedWarehouse?.branch.name ?? 'Choose a source'}
                        </p>
                    </div>

                    <div className="min-w-0 border-b border-primary/10 px-4 py-3.5 xl:border-b-0 xl:border-r">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Available quantity
                        </p>
                        <p className="mt-1 text-[14px] font-semibold tabular-nums text-primary">
                            {formatNumber(availableQuantity)}
                        </p>
                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                            Across active stock lines
                        </p>
                    </div>

                    <div className="min-w-0 border-b border-primary/10 px-4 py-3.5 sm:border-r sm:border-b-0">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Current request
                        </p>
                        <p className="mt-1 text-[14px] font-semibold tabular-nums text-foreground">
                            {selectedCount} item{selectedCount === 1 ? '' : 's'}
                        </p>
                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                            {formatNumber(totalQuantity)} total quantity
                        </p>
                    </div>

                    <div className="min-w-0 px-4 py-3.5">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Posted today
                        </p>
                        <p className="mt-1 text-[14px] font-semibold tabular-nums text-foreground">
                            {formatNumber(summary.quantity_issued_today)}
                        </p>
                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                            {summary.issued_today} transaction{summary.issued_today === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>
            </section>
        </header>
    );
}

function RequestDetails({
    warehouses,
    reasons,
    data,
    errors,
    processing,
    onWarehouseChange,
    onFieldChange,
}: {
    warehouses: WarehouseOption[];
    reasons: ReasonOption[];
    data: WithdrawalFormData;
    errors: FormErrors;
    processing: boolean;
    onWarehouseChange: (warehouseId: string) => void;
    onFieldChange: (field: TextField, value: string) => void;
}) {
    return (
        <section className="overflow-hidden rounded-[18px] border border-border/70 bg-card/70 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5 md:px-5">
                <div>
                    <p className="text-xs font-semibold text-foreground">Release request</p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                        Define the source, destination, and supporting record.
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="h-5 rounded-md border-border/70 bg-background/35 px-2 text-[8px] font-semibold text-muted-foreground"
                >
                    REQUIRED DETAILS
                </Badge>
            </div>

            <div className="grid xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="border-b border-border/60 bg-muted/[0.035] p-4 md:p-5 xl:border-b-0 xl:border-r">
                    <div className="mb-4 flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary">
                            <Warehouse className="size-4" />
                        </span>
                        <div>
                            <p className="text-[10px] font-semibold text-foreground">Release context</p>
                            <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                                These fields control which inventory pool will be deducted.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FormField id="warehouse_id" label="Source warehouse" error={errors.warehouse_id} required>
                            <Select value={data.warehouse_id} disabled={processing} onValueChange={onWarehouseChange}>
                                <SelectTrigger id="warehouse_id" className="h-10 rounded-lg bg-background/55">
                                    <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                            {warehouse.code ? `${warehouse.code} — ${warehouse.name}` : warehouse.name}
                                            {warehouse.is_main ? ' — Main' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField id="issuance_date" label="Withdrawal date" error={errors.issuance_date} required>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="issuance_date"
                                    type="date"
                                    max={todayLocal()}
                                    value={data.issuance_date}
                                    disabled={processing}
                                    onChange={(event) => onFieldChange('issuance_date', event.target.value)}
                                    className="h-10 rounded-lg bg-background/55 pl-9"
                                />
                            </div>
                        </FormField>

                        <FormField id="reason" label="Reason" error={errors.reason} required>
                            <Select value={data.reason} disabled={processing} onValueChange={(value) => onFieldChange('reason', value)}>
                                <SelectTrigger id="reason" className="h-10 rounded-lg bg-background/55">
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reasons.map((reason) => (
                                        <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                </div>

                <div className="min-w-0 p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary">
                            <UserRound className="size-4" />
                        </span>
                        <div>
                            <p className="text-[10px] font-semibold text-foreground">Destination and accountability</p>
                            <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                                Identify who receives the stock and the intended use.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <FormField
                            id="issued_to"
                            label="Issued to"
                            error={errors.issued_to}
                            required={data.reason === 'employee_issuance'}
                        >
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="issued_to"
                                    value={data.issued_to}
                                    disabled={processing}
                                    onChange={(event) => onFieldChange('issued_to', event.target.value)}
                                    placeholder="Employee, custodian, or recipient"
                                    className="h-10 rounded-lg bg-background/35 pl-9"
                                />
                            </div>
                        </FormField>

                        <FormField
                            id="department"
                            label="Department / office"
                            error={errors.department}
                            required={data.reason === 'department_issuance'}
                        >
                            <div className="relative">
                                <Building2 className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="department"
                                    value={data.department}
                                    disabled={processing}
                                    onChange={(event) => onFieldChange('department', event.target.value)}
                                    placeholder="Receiving unit or office"
                                    className="h-10 rounded-lg bg-background/35 pl-9"
                                />
                            </div>
                        </FormField>

                        <div className="md:col-span-2">
                            <FormField
                                id="purpose"
                                label="Purpose / justification"
                                error={errors.purpose}
                                required={data.reason === 'other'}
                            >
                                <Input
                                    id="purpose"
                                    value={data.purpose}
                                    disabled={processing}
                                    onChange={(event) => onFieldChange('purpose', event.target.value)}
                                    placeholder="Describe how the withdrawn items will be used"
                                    className="h-10 rounded-lg bg-background/35"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="my-5 h-px bg-border/60" />

                    <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary">
                            <FileText className="size-4" />
                        </span>
                        <div>
                            <p className="text-[10px] font-semibold text-foreground">Supporting record</p>
                            <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                                Optional information for audit and document matching.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,.7fr)_minmax(0,1.3fr)]">
                        <FormField id="reference_no" label="Reference number" error={errors.reference_no}>
                            <div className="relative">
                                <FileText className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="reference_no"
                                    value={data.reference_no}
                                    disabled={processing}
                                    onChange={(event) => onFieldChange('reference_no', event.target.value)}
                                    placeholder="RIS, memo, or request no."
                                    className="h-10 rounded-lg bg-background/35 pl-9"
                                />
                            </div>
                        </FormField>

                        <FormField id="notes" label="Transaction notes" error={errors.notes}>
                            <Textarea
                                id="notes"
                                rows={3}
                                value={data.notes}
                                disabled={processing}
                                onChange={(event) => onFieldChange('notes', event.target.value)}
                                placeholder="Additional instructions, context, or audit remarks"
                                className="min-h-[86px] resize-none rounded-lg bg-background/35"
                            />
                        </FormField>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProductBrowser({
    searchInputRef,
    search,
    category,
    categoryOptions,
    products,
    warehouseProductCount,
    selectedQuantities,
    processing,
    onSearchChange,
    onSearchKeyDown,
    onCategoryChange,
    onAddProduct,
}: {
    searchInputRef: RefObject<HTMLInputElement | null>;
    search: string;
    category: string;
    categoryOptions: CategoryOption[];
    products: ProductStock[];
    warehouseProductCount: number;
    selectedQuantities: Map<number, number>;
    processing: boolean;
    onSearchChange: (value: string) => void;
    onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onCategoryChange: (value: string) => void;
    onAddProduct: (product: ProductStock) => void;
}) {
    return (
        <section className="overflow-hidden rounded-[18px] border border-border/70 bg-card/70 shadow-sm">
            <div className="grid gap-3 border-b border-border/60 p-4 lg:grid-cols-[minmax(220px,.7fr)_minmax(0,1.3fr)_210px] lg:items-center md:p-5">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                        <Boxes className="size-4" />
                    </span>
                    <div>
                        <h2 className="text-xs font-semibold text-foreground">Inventory catalog</h2>
                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                            {products.length} shown · {warehouseProductCount} available lines
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        value={search}
                        disabled={processing}
                        onChange={(event) => onSearchChange(event.target.value)}
                        onKeyDown={onSearchKeyDown}
                        placeholder="Find product, SKU, or scan barcode"
                        className="h-10 rounded-lg bg-background/45 pl-9 pr-9"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Clear product search"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <Select value={category} disabled={processing} onValueChange={onCategoryChange}>
                    <SelectTrigger className="h-10 rounded-lg bg-background/45">
                        <span className="flex items-center gap-2">
                            <Filter className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="All categories" />
                        </span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                        {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/[0.02] px-4 py-2 text-[8px] text-muted-foreground md:px-5">
                <Barcode className="size-3" />
                Exact SKU or barcode + Enter adds the item immediately.
            </div>

            {products.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
                    <span className="flex size-11 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                        <Search className="size-5" />
                    </span>
                    <h3 className="mt-3 text-xs font-semibold text-foreground">No inventory found</h3>
                    <p className="mt-1 max-w-sm text-[9px] leading-4 text-muted-foreground">
                        Try another keyword, category, or source warehouse.
                    </p>
                </div>
            ) : (
                <div>
                    <div className="hidden grid-cols-[minmax(250px,1.5fr)_130px_120px_120px] items-center gap-4 border-b border-border/60 bg-background/20 px-5 py-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid">
                        <span>Item</span>
                        <span>On hand</span>
                        <span>After</span>
                        <span className="text-right">Select</span>
                    </div>
                    <div className="divide-y divide-border/60">
                        {products.map((product) => (
                            <ProductRow
                                key={product.stock_id}
                                product={product}
                                selectedQuantity={selectedQuantities.get(product.product_id) ?? 0}
                                processing={processing}
                                onAdd={onAddProduct}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function ProductRow({
    product,
    selectedQuantity,
    processing,
    onAdd,
}: {
    product: ProductStock;
    selectedQuantity: number;
    processing: boolean;
    onAdd: (product: ProductStock) => void;
}) {
    const selected = selectedQuantity > 0;
    const remaining = Math.max(0, product.available_quantity - selectedQuantity);
    const stockState = getStockState(product);

    return (
        <article
            className={cn(
                'group grid gap-3 px-4 py-3.5 transition-colors hover:bg-muted/[0.025] lg:grid-cols-[minmax(250px,1.5fr)_130px_120px_120px] lg:items-center lg:gap-4 md:px-5',
                selected && 'bg-primary/[0.025]',
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <span
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        selected
                            ? 'border-primary/20 bg-primary/[0.07] text-primary'
                            : 'border-border/60 bg-background/35 text-muted-foreground group-hover:text-foreground',
                    )}
                >
                    <Boxes className="size-4" />
                </span>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[11px] font-semibold text-foreground">{product.name}</p>
                        <StatusBadge label={stockState.label} variant={stockState.variant} />
                    </div>
                    <p className="mt-1 truncate font-mono text-[8px] text-muted-foreground">
                        {product.sku ?? 'No SKU'}{product.barcode ? ` · ${product.barcode}` : ''}
                    </p>
                    <p className="mt-1 truncate text-[8px] text-muted-foreground">
                        {product.category.name ?? 'Uncategorized'} · {formatMoney(product.average_cost)} average cost
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 lg:block">
                <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground lg:hidden">On hand</span>
                <p className="text-[12px] font-semibold tabular-nums text-foreground">
                    {formatNumber(product.available_quantity)} <span className="text-[8px] font-normal text-muted-foreground">{product.unit}</span>
                </p>
            </div>

            <div className="flex items-center justify-between gap-3 lg:block">
                <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground lg:hidden">After</span>
                <p className={cn('text-[12px] font-semibold tabular-nums', selected ? 'text-amber-400' : 'text-muted-foreground')}>
                    {formatNumber(remaining)}
                </p>
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    variant={selected ? 'secondary' : 'outline'}
                    disabled={processing || remaining <= 0}
                    onClick={() => onAdd(product)}
                    className={cn(
                        'h-9 min-w-[108px] rounded-lg px-3 text-[9px] font-semibold',
                        !selected && 'border-foreground/15 bg-foreground text-background hover:bg-foreground/90 hover:text-background',
                    )}
                >
                    <Plus className="size-3.5" />
                    {selected ? 'Add one' : 'Select'}
                </Button>
            </div>
        </article>
    );
}

function QuantityControl({
    value,
    maximum,
    disabled,
    onStep,
    onInput,
}: {
    value: string;
    maximum: number;
    disabled: boolean;
    onStep: (value: number) => void;
    onInput: (value: string) => void;
}) {
    const numericValue = Number(value) || 0;

    return (
        <div className="grid grid-cols-[32px_minmax(0,1fr)_32px] overflow-hidden rounded-lg border border-border/70 bg-background/40">
            <button
                type="button"
                onClick={() => onStep(numericValue - 1)}
                disabled={disabled}
                className="flex h-8 items-center justify-center border-r border-border/60 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
                aria-label="Decrease withdrawal quantity"
            >
                <Minus className="size-3" />
            </button>
            <Input
                type="number"
                min={QUANTITY_STEP}
                step={QUANTITY_STEP}
                max={maximum}
                value={value}
                disabled={disabled}
                onChange={(event) => onInput(event.target.value)}
                className="h-8 rounded-none border-0 bg-transparent px-1 text-center text-[10px] font-semibold tabular-nums shadow-none focus-visible:ring-0"
            />
            <button
                type="button"
                onClick={() => onStep(numericValue + 1)}
                disabled={disabled || numericValue >= maximum}
                className="flex h-8 items-center justify-center border-l border-border/60 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
                aria-label="Increase withdrawal quantity"
            >
                <Plus className="size-3" />
            </button>
        </div>
    );
}

function ReviewPanel({
    desktop,
    open,
    entries,
    errors,
    processing,
    warehouseSelected,
    totalQuantity,
    estimatedCost,
    onClose,
    onClear,
    onRemove,
    onQuantityStep,
    onQuantityInput,
    onNoteChange,
}: {
    desktop: boolean;
    open: boolean;
    entries: CartEntry[];
    errors: FormErrors;
    processing: boolean;
    warehouseSelected: boolean;
    totalQuantity: number;
    estimatedCost: number;
    onClose: () => void;
    onClear: () => void;
    onRemove: (index: number) => void;
    onQuantityStep: (index: number, product: ProductStock, value: number) => void;
    onQuantityInput: (index: number, value: string) => void;
    onNoteChange: (index: number, value: string) => void;
}) {
    const visible = desktop || open;
    const canSubmit = warehouseSelected && entries.length > 0 && !processing;

    return (
        <>
            {!desktop && (
                <button
                    type="button"
                    aria-label="Close withdrawal review"
                    onClick={onClose}
                    className={cn(
                        'fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200',
                        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
                    )}
                />
            )}

            <aside
                aria-hidden={!visible}
                className={cn(
                    'flex w-full flex-col overflow-hidden bg-card bg-gradient-to-b from-primary/[0.055] via-primary/[0.016] to-transparent',
                    desktop
                        ? 'sticky top-0 self-start h-[calc(100vh-2rem)] min-h-[600px] rounded-[20px] border border-primary/15 shadow-sm'
                        : 'fixed inset-y-0 right-0 z-50 max-w-[430px] border-l border-primary/15 shadow-2xl transition-transform duration-300 ease-out',
                    !desktop && (open ? 'translate-x-0' : 'translate-x-full'),
                )}
            >
                <div className="relative overflow-hidden border-b border-primary/10 px-4 py-4">
                    <div className="pointer-events-none absolute -right-10 -top-12 size-28 rounded-full bg-primary/[0.055] blur-3xl" />
                    <ShoppingCart className="pointer-events-none absolute -bottom-5 -right-3 size-20 text-primary opacity-[0.025]" />

                    <div className="relative flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                                <ShoppingCart className="size-4.5" />
                            </span>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.13em] text-primary">
                                    <span className="size-1 rounded-full bg-primary" />
                                    Inventory review
                                </div>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
                                        Withdrawal ticket
                                    </h2>
                                    <Badge
                                        variant="outline"
                                        className="h-5 rounded-full border-emerald-500/15 bg-emerald-500/[0.055] px-2 text-[8px] font-semibold text-emerald-400"
                                    >
                                        {entries.length}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                                    Review quantities and post the inventory release.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {entries.length > 0 && (
                                <button
                                    type="button"
                                    onClick={onClear}
                                    disabled={processing}
                                    className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[8px] font-medium text-rose-400 hover:bg-rose-500/[0.07] disabled:opacity-40"
                                >
                                    <Trash2 className="size-3" />
                                    Clear
                                </button>
                            )}
                            {!desktop && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label="Close review panel"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {entries.length === 0 ? (
                        <div className="flex h-full min-h-72 flex-col items-center justify-center px-8 py-12 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full border border-dashed border-primary/20 bg-primary/[0.035] text-primary">
                                <ShoppingCart className="size-5" />
                            </span>
                            <h3 className="mt-4 text-xs font-semibold text-foreground">Ticket is empty</h3>
                            <p className="mt-1 max-w-[230px] text-[9px] leading-4 text-muted-foreground">
                                Select inventory items from the catalog. They will appear here for final review.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {entries.map(({ item, product, index }) => {
                                const quantity = Number(item.quantity_issued) || 0;
                                const remaining = Math.max(0, product.available_quantity - quantity);

                                return (
                                    <div key={product.stock_id} className="px-4 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-[10px] font-semibold leading-4 text-foreground">{product.name}</p>
                                                <p className="mt-1 truncate font-mono text-[8px] text-muted-foreground">
                                                    {product.sku ?? 'No SKU'} · {product.unit}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onRemove(index)}
                                                disabled={processing}
                                                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-rose-500/[0.07] hover:text-rose-400 disabled:opacity-40"
                                                aria-label={`Remove ${product.name}`}
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>

                                        <div className="mt-3 rounded-xl border border-primary/10 bg-primary/[0.025] p-3">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Quantity</span>
                                                <span className={cn('text-[8px] font-medium', remaining <= product.reorder_level ? 'text-amber-400' : 'text-emerald-400')}>
                                                    {formatNumber(remaining)} remaining
                                                </span>
                                            </div>
                                            <QuantityControl
                                                value={item.quantity_issued}
                                                maximum={product.available_quantity}
                                                disabled={processing}
                                                onStep={(value) => onQuantityStep(index, product, value)}
                                                onInput={(value) => onQuantityInput(index, value)}
                                            />
                                            <InlineError message={getNestedError(errors, `items.${index}.quantity_issued`)} />
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-[8px] text-muted-foreground">
                                            <span>Estimated value</span>
                                            <span className="font-semibold tabular-nums text-foreground">{formatMoney(quantity * product.average_cost)}</span>
                                        </div>

                                        <Input
                                            value={item.notes}
                                            disabled={processing}
                                            onChange={(event) => onNoteChange(index, event.target.value)}
                                            placeholder="Optional item note"
                                            className="mt-3 h-8 rounded-lg bg-background/35 text-[9px]"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-primary/10 bg-primary/[0.018] p-4">
                    <div className="rounded-xl border border-primary/10 bg-primary/[0.025] p-3.5">
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                            <span>Products</span>
                            <span className="font-semibold text-foreground">{entries.length}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
                            <span>Total quantity</span>
                            <span className="font-semibold tabular-nums text-foreground">{formatNumber(totalQuantity)}</span>
                        </div>
                        <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
                            <div>
                                <p className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">Stock value</p>
                                <p className="mt-1 text-[9px] text-muted-foreground">Estimated at average cost</p>
                            </div>
                            <p className="text-base font-semibold tabular-nums text-primary">{formatMoney(estimatedCost)}</p>
                        </div>
                    </div>

                    <InlineError message={errors.items} />
                    <InlineError message={getNestedError(errors, 'issuance')} />

                    <Button
                        type="submit"
                        disabled={!canSubmit}
                        className="mt-3 h-11 w-full rounded-xl bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                        {processing ? 'Posting withdrawal...' : (
                            <>
                                <CheckCircle2 className="size-3.5" />
                                Post withdrawal
                            </>
                        )}
                    </Button>

                    <p className="mt-2.5 flex items-start gap-1.5 text-[8px] leading-4 text-muted-foreground">
                        <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-400" />
                        Posting deducts stock immediately and creates the movement record.
                    </p>
                </div>
            </aside>
        </>
    );
}

function MobileReviewButton({
    count,
    totalQuantity,
    onOpen,
}: {
    count: number;
    totalQuantity: number;
    onOpen: () => void;
}) {
    return (
        <div className="fixed inset-x-3 bottom-3 z-30 min-[1360px]:hidden">
            <Button
                type="button"
                onClick={onOpen}
                className="h-12 w-full rounded-xl border border-primary/20 bg-primary text-xs font-semibold text-primary-foreground shadow-2xl hover:bg-primary/90"
            >
                <ShoppingCart className="size-4" />
                Open withdrawal ticket
                <span className="ml-auto rounded-md bg-background/15 px-2 py-0.5 text-[9px] tabular-nums">
                    {count} item{count === 1 ? '' : 's'} · {formatNumber(totalQuantity)} qty
                </span>
            </Button>
        </div>
    );
}

export default function StockWithdrawalIndex({
    warehouses,
    products,
    reasons,
    summary,
}: PageProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(ALL_CATEGORIES);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [desktopReview, setDesktopReview] = useState(false);

    const form = useForm<WithdrawalFormData>(
        getEmptyWithdrawalForm(warehouses, reasons),
    );

    useEffect(() => {
        const desktopQuery = window.matchMedia(DESKTOP_REVIEW_QUERY);

        const syncDesktopReview = (): void => {
            setDesktopReview(desktopQuery.matches);

            if (desktopQuery.matches) {
                setReviewOpen(false);
            }
        };

        syncDesktopReview();
        desktopQuery.addEventListener('change', syncDesktopReview);

        return () => {
            desktopQuery.removeEventListener('change', syncDesktopReview);
        };
    }, []);

    useEffect(() => {
        if (desktopReview || !reviewOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [desktopReview, reviewOpen]);

    const selectedWarehouseId = Number(form.data.warehouse_id || 0);

    const selectedWarehouse = useMemo(
        () =>
            warehouses.find(
                (warehouse) => warehouse.id === selectedWarehouseId,
            ) ?? null,
        [warehouses, selectedWarehouseId],
    );

    const warehouseProducts = useMemo(
        () =>
            products.filter(
                (product) =>
                    product.warehouse_id === selectedWarehouseId &&
                    product.available_quantity > 0,
            ),
        [products, selectedWarehouseId],
    );

    const warehouseProductMap = useMemo(() => {
        const productMap = new Map<number, ProductStock>();

        warehouseProducts.forEach((product) => {
            productMap.set(product.product_id, product);
        });

        return productMap;
    }, [warehouseProducts]);

    const categoryOptions = useMemo<CategoryOption[]>(() => {
        const categories = new Map<string, string>();

        warehouseProducts.forEach((product) => {
            const label = product.category.name?.trim();

            if (label) {
                categories.set(normalizeCategory(label), label);
            }
        });

        return Array.from(categories, ([value, label]) => ({ value, label })).sort(
            (first, second) => first.label.localeCompare(second.label),
        );
    }, [warehouseProducts]);

    const visibleProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return warehouseProducts.filter((product) => {
            const productCategory = product.category.name
                ? normalizeCategory(product.category.name)
                : '';
            const matchesCategory =
                category === ALL_CATEGORIES || productCategory === category;

            if (!matchesCategory) {
                return false;
            }

            if (!query) {
                return true;
            }

            return [
                product.name,
                product.sku,
                product.barcode,
                product.category.name,
                product.unit,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [category, search, warehouseProducts]);

    const cartEntries = useMemo<CartEntry[]>(
        () =>
            form.data.items.flatMap((item, index) => {
                const product = warehouseProductMap.get(item.product_id);

                return product ? [{ item, product, index }] : [];
            }),
        [form.data.items, warehouseProductMap],
    );

    const selectedQuantities = useMemo(() => {
        const quantities = new Map<number, number>();

        form.data.items.forEach((item) => {
            quantities.set(item.product_id, Number(item.quantity_issued) || 0);
        });

        return quantities;
    }, [form.data.items]);

    const totalQuantity = useMemo(
        () =>
            cartEntries.reduce(
                (total, entry) =>
                    total + Math.max(0, Number(entry.item.quantity_issued) || 0),
                0,
            ),
        [cartEntries],
    );

    const estimatedCost = useMemo(
        () =>
            cartEntries.reduce((total, entry) => {
                const quantity = Math.max(
                    0,
                    Number(entry.item.quantity_issued) || 0,
                );

                return total + quantity * Number(entry.product.average_cost || 0);
            }, 0),
        [cartEntries],
    );

    const warehouseAvailableQuantity = useMemo(
        () =>
            warehouseProducts.reduce(
                (total, product) =>
                    total + Number(product.available_quantity || 0),
                0,
            ),
        [warehouseProducts],
    );

    function focusProductSearch(): void {
        window.setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    function resetWithdrawal(): void {
        form.setData(getEmptyWithdrawalForm(warehouses, reasons));
        form.clearErrors();
        setSearch('');
        setCategory(ALL_CATEGORIES);
        setReviewOpen(false);
        focusProductSearch();
    }

    function changeWarehouse(warehouseId: string): void {
        if (warehouseId === form.data.warehouse_id) {
            return;
        }

        if (
            form.data.items.length > 0 &&
            !window.confirm(
                'Changing the warehouse will clear the current withdrawal list. Continue?',
            )
        ) {
            return;
        }

        form.setData({
            ...form.data,
            warehouse_id: warehouseId,
            items: [],
        });
        form.clearErrors();
        setSearch('');
        setCategory(ALL_CATEGORIES);
        setReviewOpen(false);
        focusProductSearch();
    }

    function changeTextField(field: TextField, value: string): void {
        form.setData(field, value);
    }

    function updateCartItem(
        index: number,
        field: 'quantity_issued' | 'notes',
        value: string,
    ): void {
        form.setData(
            'items',
            form.data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item,
            ),
        );
    }

    function addProduct(product: ProductStock): void {
        if (product.warehouse_id !== selectedWarehouseId) {
            return;
        }

        const existingIndex = form.data.items.findIndex(
            (item) => item.product_id === product.product_id,
        );

        if (existingIndex >= 0) {
            const currentQuantity =
                Number(form.data.items[existingIndex].quantity_issued) || 0;
            const nextQuantity = Math.min(
                product.available_quantity,
                currentQuantity + 1,
            );

            updateCartItem(
                existingIndex,
                'quantity_issued',
                String(Number(nextQuantity.toFixed(3))),
            );
            return;
        }

        form.setData('items', [
            ...form.data.items,
            {
                product_id: product.product_id,
                quantity_issued: '1',
                notes: '',
            },
        ]);
        form.clearErrors('items');
    }

    function removeProduct(index: number): void {
        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    function changeQuantity(
        index: number,
        product: ProductStock,
        value: number,
    ): void {
        const safeValue = clampQuantity(value, product.available_quantity);

        updateCartItem(
            index,
            'quantity_issued',
            String(Number(safeValue.toFixed(3))),
        );
    }

    function handleSearchKeyDown(
        event: KeyboardEvent<HTMLInputElement>,
    ): void {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();

        const query = search.trim().toLowerCase();

        if (!query) {
            return;
        }

        const exactProduct = warehouseProducts.find(
            (product) =>
                product.barcode?.toLowerCase() === query ||
                product.sku?.toLowerCase() === query,
        );

        if (!exactProduct) {
            return;
        }

        addProduct(exactProduct);
        setSearch('');
        focusProductSearch();
    }

    function submitWithdrawal(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (form.data.items.length === 0) {
            form.setError(
                'items',
                'Add at least one stock item before confirming the withdrawal.',
            );
            setReviewOpen(true);
            return;
        }

        const invalidEntry = cartEntries.find(({ item, product }) => {
            const quantity = Number(item.quantity_issued);

            return (
                !Number.isFinite(quantity) ||
                quantity <= 0 ||
                quantity > product.available_quantity
            );
        });

        if (invalidEntry) {
            form.setError(
                'items',
                `Check the withdrawal quantity for ${invalidEntry.product.name}.`,
            );
            setReviewOpen(true);
            return;
        }

        form.clearErrors('items');
        form.post(TERMINAL_URL, {
            preserveScroll: true,
            onSuccess: resetWithdrawal,
            onError: () => setReviewOpen(true),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Withdraw Stock" />

            <PageContainer className="pb-24 min-[1360px]:pb-5">
                <form
                    onSubmit={submitWithdrawal}
                    className="min-w-0 min-[1360px]:grid min-[1360px]:grid-cols-[minmax(0,1fr)_390px] min-[1360px]:items-start min-[1360px]:gap-5 min-[1660px]:grid-cols-[minmax(0,1fr)_420px] min-[1660px]:gap-6"
                >
                    <div className="min-w-0 space-y-6">
                        <WorkspaceHeader
                            selectedWarehouse={selectedWarehouse}
                            availableQuantity={warehouseAvailableQuantity}
                            selectedCount={form.data.items.length}
                            totalQuantity={totalQuantity}
                            summary={summary}
                            processing={form.processing}
                            onReset={resetWithdrawal}
                        />

                        <RequestDetails
                            warehouses={warehouses}
                            reasons={reasons}
                            data={form.data}
                            errors={form.errors}
                            processing={form.processing}
                            onWarehouseChange={changeWarehouse}
                            onFieldChange={changeTextField}
                        />

                        <ProductBrowser
                            searchInputRef={searchInputRef}
                            search={search}
                            category={category}
                            categoryOptions={categoryOptions}
                            products={visibleProducts}
                            warehouseProductCount={warehouseProducts.length}
                            selectedQuantities={selectedQuantities}
                            processing={form.processing}
                            onSearchChange={setSearch}
                            onSearchKeyDown={handleSearchKeyDown}
                            onCategoryChange={setCategory}
                            onAddProduct={addProduct}
                        />
                    </div>

                    <div className="min-w-0 self-start min-[1360px]:h-full">
                        <ReviewPanel
                            desktop={desktopReview}
                            open={reviewOpen}
                            entries={cartEntries}
                            errors={form.errors}
                            processing={form.processing}
                            warehouseSelected={Boolean(form.data.warehouse_id)}
                            totalQuantity={totalQuantity}
                            estimatedCost={estimatedCost}
                            onClose={() => setReviewOpen(false)}
                            onClear={() => form.setData('items', [])}
                            onRemove={removeProduct}
                            onQuantityStep={changeQuantity}
                            onQuantityInput={(index, value) =>
                                updateCartItem(index, 'quantity_issued', value)
                            }
                            onNoteChange={(index, value) =>
                                updateCartItem(index, 'notes', value)
                            }
                        />
                    </div>
                </form>

                {!desktopReview && (
                    <MobileReviewButton
                        count={form.data.items.length}
                        totalQuantity={totalQuantity}
                        onOpen={() => setReviewOpen(true)}
                    />
                )}
            </PageContainer>
        </AppLayout>
    );
}