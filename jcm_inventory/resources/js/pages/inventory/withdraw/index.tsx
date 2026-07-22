import { FormField } from '@/components/shared/form-field';
import { PageContainer } from '@/components/shared/page-container';
import { SectionCard } from '@/components/shared/section-card';
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
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Barcode,
    Boxes,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileText,
    History,
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
    type LucideIcon,
} from 'lucide-react';
import {
    type FormEvent,
    type KeyboardEvent,
    type RefObject,
    useMemo,
    useRef,
    useState,
} from 'react';

const TERMINAL_URL = '/stock-issuance/terminal';
const HISTORY_URL = '/stock-issuance/history';
const ALL_CATEGORIES = 'all';
const QUANTITY_STEP = 0.001;

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

type UserReference = {
    id: number;
    name: string;
    email: string | null;
};

type RecentIssuance = {
    id: number;
    issuance_number: string;
    issuance_date: string;
    reason: string;
    reason_label: string;
    issued_to: string | null;
    department: string | null;
    status: string;
    total_quantity: number;
    total_cost: number;
    warehouse: {
        code: string | null;
        name: string;
    };
    branch: {
        code: string | null;
        name: string;
    };
    issued_by: UserReference | null;
    created_at: string | null;
};

type TerminalSummary = {
    warehouses: number;
    available_stock_lines: number;
    available_quantity: number;
    issued_today: number;
    quantity_issued_today: number;
};

type TerminalPermissions = {
    can_void: boolean;
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
    recent_issuances: RecentIssuance[];
    summary: TerminalSummary;
    permissions: TerminalPermissions;
};

type FormErrors = Partial<Record<keyof WithdrawalFormData, string>>;

type SummaryTone = 'default' | 'emerald' | 'blue' | 'rose';

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

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
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

function getWarehouseDescription(warehouse: WarehouseOption | null): string {
    if (!warehouse) {
        return 'Select a source warehouse';
    }

    const code = warehouse.code ? ` • ${warehouse.code}` : '';

    return `${warehouse.branch.name}${code}`;
}

function getRecipientLabel(withdrawal: RecentIssuance): string {
    return (
        withdrawal.issued_to ??
        withdrawal.department ??
        'Internal withdrawal'
    );
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

function SummaryItem({
    label,
    value,
    helper,
    icon: Icon,
    tone = 'default',
}: {
    label: string;
    value: string;
    helper: string;
    icon: LucideIcon;
    tone?: SummaryTone;
}) {
    const toneClasses: Record<SummaryTone, string> = {
        default: 'bg-muted/40 text-muted-foreground',
        emerald: 'bg-emerald-500/10 text-emerald-500',
        blue: 'bg-blue-500/10 text-blue-500',
        rose: 'bg-rose-500/10 text-rose-500',
    };

    return (
        <div className="flex min-w-0 items-start gap-3 p-4">
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    toneClasses[tone],
                )}
            >
                <Icon className="size-4" />
            </span>

            <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 truncate text-lg font-semibold leading-none tabular-nums text-foreground">
                    {value}
                </p>
                <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
                    {helper}
                </p>
            </div>
        </div>
    );
}

function PageHeader({
    selectedWarehouse,
    warehouseProductCount,
    warehouseAvailableQuantity,
    selectedProducts,
    withdrawalQuantity,
    summary,
    processing,
    onReset,
    onOpenHistory,
}: {
    selectedWarehouse: WarehouseOption | null;
    warehouseProductCount: number;
    warehouseAvailableQuantity: number;
    selectedProducts: number;
    withdrawalQuantity: number;
    summary: TerminalSummary;
    processing: boolean;
    onReset: () => void;
    onOpenHistory: () => void;
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                        <PackageMinus className="size-5" />
                    </span>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-base font-semibold tracking-tight">
                                Stock Withdrawal
                            </h1>
                            <Badge
                                variant="outline"
                                className="h-5 rounded-full border-rose-500/20 bg-rose-500/5 px-2 text-[9px] font-semibold text-rose-500"
                            >
                                STOCK OUT
                            </Badge>
                        </div>
                        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">
                            Record the withdrawal details, select available items,
                            then review and confirm the transaction.
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onReset}
                        disabled={processing}
                        className="h-9 rounded-lg px-3 text-xs"
                    >
                        <RotateCcw className="size-3.5" />
                        Reset
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onOpenHistory}
                        className="h-9 rounded-lg px-3 text-xs"
                    >
                        <History className="size-3.5" />
                        History
                        <ArrowRight className="size-3" />
                    </Button>
                </div>
            </div>

            <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                <SummaryItem
                    label="Source warehouse"
                    value={selectedWarehouse?.name ?? 'Not selected'}
                    helper={getWarehouseDescription(selectedWarehouse)}
                    icon={Warehouse}
                    tone="emerald"
                />
                <SummaryItem
                    label="Available stock"
                    value={formatNumber(warehouseAvailableQuantity)}
                    helper={`${warehouseProductCount} stock line${warehouseProductCount === 1 ? '' : 's'}`}
                    icon={Boxes}
                />
                <SummaryItem
                    label="Selected items"
                    value={formatNumber(selectedProducts)}
                    helper={`${formatNumber(withdrawalQuantity)} total quantity`}
                    icon={ShoppingCart}
                    tone="blue"
                />
                <SummaryItem
                    label="Withdrawn today"
                    value={formatNumber(summary.quantity_issued_today)}
                    helper={`${summary.issued_today} transaction${summary.issued_today === 1 ? '' : 's'} posted`}
                    icon={History}
                    tone="rose"
                />
            </div>
        </section>
    );
}

function WithdrawalDetailsCard({
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
        <SectionCard
            title="Withdrawal Details"
            description="Enter the source, recipient, and supporting reference for this transaction."
            actions={
                <Badge variant="outline" className="h-6 rounded-full px-2.5 text-[10px]">
                    <ClipboardList className="mr-1 size-3" />
                    Step 1
                </Badge>
            }
        >
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                <FormField
                    id="warehouse_id"
                    label="Source Warehouse"
                    error={errors.warehouse_id}
                    required
                >
                    <Select
                        value={data.warehouse_id}
                        disabled={processing}
                        onValueChange={onWarehouseChange}
                    >
                        <SelectTrigger id="warehouse_id">
                            <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses.map((warehouse) => (
                                <SelectItem
                                    key={warehouse.id}
                                    value={String(warehouse.id)}
                                >
                                    {warehouse.code
                                        ? `${warehouse.code} — ${warehouse.name}`
                                        : warehouse.name}
                                    {warehouse.is_main ? ' — Main' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    id="issuance_date"
                    label="Withdrawal Date"
                    error={errors.issuance_date}
                    required
                >
                    <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="issuance_date"
                            type="date"
                            max={todayLocal()}
                            value={data.issuance_date}
                            disabled={processing}
                            onChange={(event) =>
                                onFieldChange('issuance_date', event.target.value)
                            }
                            className="pl-9"
                        />
                    </div>
                </FormField>

                <FormField
                    id="reason"
                    label="Withdrawal Reason"
                    error={errors.reason}
                    required
                >
                    <Select
                        value={data.reason}
                        disabled={processing}
                        onValueChange={(value) => onFieldChange('reason', value)}
                    >
                        <SelectTrigger id="reason">
                            <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                            {reasons.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                    {reason.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    id="issued_to"
                    label="Issued To"
                    error={errors.issued_to}
                    required={data.reason === 'employee_issuance'}
                >
                    <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="issued_to"
                            value={data.issued_to}
                            disabled={processing}
                            onChange={(event) =>
                                onFieldChange('issued_to', event.target.value)
                            }
                            placeholder="Employee or recipient"
                            className="pl-9"
                        />
                    </div>
                </FormField>

                <FormField
                    id="department"
                    label="Department / Office"
                    error={errors.department}
                    required={data.reason === 'department_issuance'}
                >
                    <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="department"
                            value={data.department}
                            disabled={processing}
                            onChange={(event) =>
                                onFieldChange('department', event.target.value)
                            }
                            placeholder="Office or department"
                            className="pl-9"
                        />
                    </div>
                </FormField>

                <FormField
                    id="reference_no"
                    label="Reference Number"
                    description="Optional memo, RIS, or request number."
                    error={errors.reference_no}
                >
                    <div className="relative">
                        <FileText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="reference_no"
                            value={data.reference_no}
                            disabled={processing}
                            onChange={(event) =>
                                onFieldChange('reference_no', event.target.value)
                            }
                            placeholder="REQ-0001 / RIS-0001"
                            className="pl-9"
                        />
                    </div>
                </FormField>

                <FormField
                    id="purpose"
                    label="Purpose / Justification"
                    error={errors.purpose}
                    required={data.reason === 'other'}
                >
                    <Input
                        id="purpose"
                        value={data.purpose}
                        disabled={processing}
                        onChange={(event) =>
                            onFieldChange('purpose', event.target.value)
                        }
                        placeholder="Reason the items are being withdrawn"
                    />
                </FormField>

                <div className="md:col-span-2">
                    <FormField
                        id="notes"
                        label="Transaction Notes"
                        description="Optional audit or supporting information."
                        error={errors.notes}
                    >
                        <Textarea
                            id="notes"
                            rows={3}
                            value={data.notes}
                            disabled={processing}
                            onChange={(event) =>
                                onFieldChange('notes', event.target.value)
                            }
                            placeholder="Additional instructions or remarks..."
                            className="resize-none"
                        />
                    </FormField>
                </div>
            </div>
        </SectionCard>
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
    const remaining = Math.max(
        0,
        product.available_quantity - selectedQuantity,
    );
    const selected = selectedQuantity > 0;
    const stockState = getStockState(product);

    return (
        <article className="grid min-w-0 gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0 hover:bg-muted/[0.04] md:grid-cols-[minmax(0,1fr)_110px_110px_150px] md:items-center">
            <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Boxes className="size-4" />
                </span>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[12px] font-semibold text-foreground">
                            {product.name}
                        </p>
                        <StatusBadge
                            label={stockState.label}
                            variant={stockState.variant}
                        />
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                        {product.sku ?? 'No SKU'}
                        {product.barcode ? ` • ${product.barcode}` : ''}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-muted-foreground">
                        {product.category.name ?? 'Uncategorized'}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between md:block md:text-right">
                <span className="text-[10px] text-muted-foreground md:hidden">
                    Available
                </span>
                <p className="text-[12px] font-semibold tabular-nums text-emerald-500">
                    {formatNumber(product.available_quantity)}{' '}
                    <span className="text-[9px] font-normal text-muted-foreground">
                        {product.unit}
                    </span>
                </p>
            </div>

            <div className="flex items-center justify-between md:block md:text-right">
                <span className="text-[10px] text-muted-foreground md:hidden">
                    Remaining
                </span>
                <p
                    className={cn(
                        'text-[12px] font-semibold tabular-nums',
                        selected ? 'text-amber-500' : 'text-foreground',
                    )}
                >
                    {formatNumber(remaining)}
                </p>
                {selected && (
                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                        {formatNumber(selectedQuantity)} selected
                    </p>
                )}
            </div>

            <Button
                type="button"
                variant={selected ? 'secondary' : 'outline'}
                disabled={processing || remaining <= 0}
                onClick={() => onAdd(product)}
                className={cn(
                    'h-9 w-full rounded-lg text-xs',
                    !selected &&
                        'border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400',
                )}
            >
                <Plus className="size-3.5" />
                {selected ? 'Add one more' : 'Add item'}
            </Button>
        </article>
    );
}

function ProductBrowserCard({
    searchInputRef,
    search,
    category,
    categoryOptions,
    products,
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
    selectedQuantities: Map<number, number>;
    processing: boolean;
    onSearchChange: (value: string) => void;
    onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onCategoryChange: (value: string) => void;
    onAddProduct: (product: ProductStock) => void;
}) {
    return (
        <SectionCard
            title="Select Stock Items"
            description="Search the current warehouse and add items to the withdrawal list."
            actions={
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 rounded-full px-2.5 text-[10px]">
                        <Boxes className="mr-1 size-3" />
                        {products.length} found
                    </Badge>
                    <Badge variant="outline" className="h-6 rounded-full px-2.5 text-[10px]">
                        Step 2
                    </Badge>
                </div>
            }
        >
            <div className="border-b border-border/60 p-4">
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            value={search}
                            disabled={processing}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                            onKeyDown={onSearchKeyDown}
                            placeholder="Search product, SKU, or scan barcode..."
                            className="pl-9 pr-9"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Clear product search"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    <Select
                        value={category}
                        disabled={processing}
                        onValueChange={onCategoryChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_CATEGORIES}>
                                All categories
                            </SelectItem>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Barcode className="size-3.5" />
                    Scan or enter an exact SKU/barcode, then press Enter to add it.
                </p>
            </div>

            <div className="hidden grid-cols-[minmax(0,1fr)_110px_110px_150px] gap-3 border-b border-border/60 bg-muted/[0.04] px-4 py-2 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground md:grid">
                <span>Product</span>
                <span className="text-right">Available</span>
                <span className="text-right">Remaining</span>
                <span className="text-center">Action</span>
            </div>

            {products.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground">
                        <Search className="size-5" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold">
                        No available stock found
                    </h3>
                    <p className="mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground">
                        Try another warehouse, category, or search term.
                    </p>
                </div>
            ) : (
                <div>
                    {products.map((product) => (
                        <ProductRow
                            key={product.stock_id}
                            product={product}
                            selectedQuantity={
                                selectedQuantities.get(product.product_id) ?? 0
                            }
                            processing={processing}
                            onAdd={onAddProduct}
                        />
                    ))}
                </div>
            )}
        </SectionCard>
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
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onStep(numericValue - 1)}
                disabled={disabled}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card transition-colors hover:bg-muted disabled:opacity-50"
                aria-label="Decrease withdrawal quantity"
            >
                <Minus className="size-3.5" />
            </button>

            <Input
                type="number"
                min={QUANTITY_STEP}
                step={QUANTITY_STEP}
                max={maximum}
                value={value}
                disabled={disabled}
                onChange={(event) => onInput(event.target.value)}
                className="h-9 flex-1 text-center text-sm font-semibold tabular-nums"
            />

            <button
                type="button"
                onClick={() => onStep(numericValue + 1)}
                disabled={disabled || numericValue >= maximum}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card transition-colors hover:bg-muted disabled:opacity-50"
                aria-label="Increase withdrawal quantity"
            >
                <Plus className="size-3.5" />
            </button>
        </div>
    );
}

function WithdrawalCart({
    entries,
    errors,
    processing,
    warehouseSelected,
    totalQuantity,
    estimatedCost,
    onClear,
    onRemove,
    onQuantityStep,
    onQuantityInput,
    onNoteChange,
}: {
    entries: CartEntry[];
    errors: FormErrors;
    processing: boolean;
    warehouseSelected: boolean;
    totalQuantity: number;
    estimatedCost: number;
    onClear: () => void;
    onRemove: (index: number) => void;
    onQuantityStep: (
        index: number,
        product: ProductStock,
        value: number,
    ) => void;
    onQuantityInput: (index: number, value: string) => void;
    onNoteChange: (index: number, value: string) => void;
}) {
    const canSubmit =
        warehouseSelected && entries.length > 0 && !processing;

    return (
        <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                            <ShoppingCart className="size-4" />
                        </span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold">
                                    Withdrawal List
                                </h2>
                                <Badge
                                    variant="outline"
                                    className="h-5 rounded-full px-2 text-[9px]"
                                >
                                    Step 3
                                </Badge>
                            </div>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {entries.length} selected product
                                {entries.length === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>

                    {entries.length > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClear}
                            disabled={processing}
                            className="h-8 px-2.5 text-[10px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
                        >
                            <Trash2 className="size-3.5" />
                            Clear
                        </Button>
                    )}
                </div>

                {entries.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground">
                            <ShoppingCart className="size-5" />
                        </span>
                        <h3 className="mt-3 text-sm font-semibold">
                            No items selected
                        </h3>
                        <p className="mt-1 max-w-xs text-[11px] leading-5 text-muted-foreground">
                            Add a product from the stock list to begin.
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[58vh] divide-y divide-border/60 overflow-y-auto xl:max-h-[calc(100vh-375px)]">
                        {entries.map(({ item, product, index }) => {
                            const quantity = Number(item.quantity_issued) || 0;
                            const remaining = Math.max(
                                0,
                                product.available_quantity - quantity,
                            );

                            return (
                                <div key={product.stock_id} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-[12px] font-semibold">
                                                {product.name}
                                            </p>
                                            <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                                                {product.sku ?? 'No SKU'} •{' '}
                                                {formatNumber(
                                                    product.available_quantity,
                                                )}{' '}
                                                {product.unit} available
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemove(index)}
                                            disabled={processing}
                                            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
                                            aria-label={`Remove ${product.name}`}
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>

                                    <div className="mt-3 rounded-xl border border-border/60 bg-muted/[0.04] p-3">
                                        <div className="mb-2.5 flex items-center justify-between gap-3 text-[10px]">
                                            <span className="font-medium text-muted-foreground">
                                                Quantity
                                            </span>
                                            <span className="text-muted-foreground">
                                                Remaining:{' '}
                                                <strong
                                                    className={cn(
                                                        'font-semibold',
                                                        remaining <=
                                                            product.reorder_level
                                                            ? 'text-amber-500'
                                                            : 'text-emerald-500',
                                                    )}
                                                >
                                                    {formatNumber(remaining)}{' '}
                                                    {product.unit}
                                                </strong>
                                            </span>
                                        </div>

                                        <QuantityControl
                                            value={item.quantity_issued}
                                            maximum={product.available_quantity}
                                            disabled={processing}
                                            onStep={(value) =>
                                                onQuantityStep(
                                                    index,
                                                    product,
                                                    value,
                                                )
                                            }
                                            onInput={(value) =>
                                                onQuantityInput(index, value)
                                            }
                                        />

                                        <InlineError
                                            message={getNestedError(
                                                errors,
                                                `items.${index}.quantity_issued`,
                                            )}
                                        />
                                    </div>

                                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                                        <span>Estimated value</span>
                                        <span className="font-semibold tabular-nums text-foreground">
                                            {formatMoney(
                                                quantity * product.average_cost,
                                            )}
                                        </span>
                                    </div>

                                    <Input
                                        value={item.notes}
                                        disabled={processing}
                                        onChange={(event) =>
                                            onNoteChange(index, event.target.value)
                                        }
                                        placeholder="Item note (optional)"
                                        className="mt-2 h-9 text-[11px]"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="border-t border-border/60 bg-muted/[0.04] p-4">
                    <div className="space-y-2.5 text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Selected products</span>
                            <span className="font-medium text-foreground">
                                {entries.length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Total quantity</span>
                            <span className="font-semibold tabular-nums text-rose-500">
                                −{formatNumber(totalQuantity)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                            <span className="font-medium text-foreground">
                                Estimated stock value
                            </span>
                            <span className="text-sm font-semibold tabular-nums text-foreground">
                                {formatMoney(estimatedCost)}
                            </span>
                        </div>
                    </div>

                    <InlineError message={errors.items} />
                    <InlineError
                        message={getNestedError(errors, 'issuance')}
                    />

                    <Button
                        type="submit"
                        disabled={!canSubmit}
                        className="mt-4 h-11 w-full rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500"
                    >
                        {processing ? (
                            <>
                                <Clock3 className="size-4 animate-pulse" />
                                Posting withdrawal...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="size-4" />
                                Confirm Stock Withdrawal
                            </>
                        )}
                    </Button>

                    <p className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-muted-foreground">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                        Confirmation immediately deducts stock and creates the
                        movement history record.
                    </p>
                </div>
            </div>
        </aside>
    );
}

function RecentWithdrawalsCard({
    withdrawals,
    onViewAll,
}: {
    withdrawals: RecentIssuance[];
    onViewAll: () => void;
}) {
    const latestWithdrawals = withdrawals.slice(0, 8);

    return (
        <SectionCard
            title="Recent Stock Withdrawals"
            description="Latest posted and voided withdrawal records."
            actions={
                <Button
                    type="button"
                    variant="outline"
                    onClick={onViewAll}
                    className="h-9 rounded-lg px-3 text-xs"
                >
                    <History className="size-3.5" />
                    View history
                    <ArrowRight className="size-3" />
                </Button>
            }
        >
            {latestWithdrawals.length === 0 ? (
                <div className="flex min-h-44 flex-col items-center justify-center px-6 py-10 text-center">
                    <History className="size-8 text-muted-foreground/40" />
                    <h3 className="mt-3 text-sm font-semibold">
                        No withdrawal history yet
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Completed withdrawals will appear here.
                    </p>
                </div>
            ) : (
                <div>
                    <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_150px_110px] gap-4 border-b border-border/60 bg-muted/[0.04] px-4 py-2 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground md:grid">
                        <span>Transaction</span>
                        <span>Recipient</span>
                        <span>Date / Branch</span>
                        <span className="text-right">Quantity</span>
                    </div>

                    {latestWithdrawals.map((withdrawal) => (
                        <div
                            key={withdrawal.id}
                            className="grid gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0 hover:bg-muted/[0.04] md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_150px_110px] md:items-center"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-mono text-[11px] font-semibold">
                                        {withdrawal.issuance_number}
                                    </p>
                                    <StatusBadge
                                        label={
                                            withdrawal.status === 'voided'
                                                ? 'Voided'
                                                : 'Posted'
                                        }
                                        variant={
                                            withdrawal.status === 'voided'
                                                ? 'danger'
                                                : 'success'
                                        }
                                    />
                                </div>
                                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                    {withdrawal.reason_label} •{' '}
                                    {withdrawal.warehouse.code ??
                                        withdrawal.warehouse.name}
                                </p>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-medium">
                                    {getRecipientLabel(withdrawal)}
                                </p>
                                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                    Issued by{' '}
                                    {withdrawal.issued_by?.name ?? 'System user'}
                                </p>
                            </div>

                            <div className="min-w-0">
                                <p className="text-[11px] font-medium">
                                    {formatDate(withdrawal.issuance_date)}
                                </p>
                                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                    {withdrawal.branch.name}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 md:block md:text-right">
                                <span className="text-[10px] text-muted-foreground md:hidden">
                                    Quantity / value
                                </span>
                                <div>
                                    <p className="text-sm font-semibold tabular-nums text-rose-500">
                                        −{formatNumber(withdrawal.total_quantity)}
                                    </p>
                                    <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                                        {formatMoney(withdrawal.total_cost)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}

export default function StockWithdrawalIndex({
    warehouses,
    products,
    reasons,
    recent_issuances,
    summary,
}: PageProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(ALL_CATEGORIES);

    const form = useForm<WithdrawalFormData>(
        getEmptyWithdrawalForm(warehouses, reasons),
    );

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
                .some((value) =>
                    String(value).toLowerCase().includes(query),
                );
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
            quantities.set(
                item.product_id,
                Number(item.quantity_issued) || 0,
            );
        });

        return quantities;
    }, [form.data.items]);

    const totalQuantity = useMemo(
        () =>
            cartEntries.reduce(
                (total, entry) =>
                    total +
                    Math.max(0, Number(entry.item.quantity_issued) || 0),
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
            return;
        }

        form.clearErrors('items');
        form.post(TERMINAL_URL, {
            preserveScroll: true,
            onSuccess: resetWithdrawal,
        });
    }

    function openHistory(): void {
        router.get(HISTORY_URL);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Withdraw Stock" />

            <PageContainer className="gap-4 md:gap-5">
                <PageHeader
                    selectedWarehouse={selectedWarehouse}
                    warehouseProductCount={warehouseProducts.length}
                    warehouseAvailableQuantity={warehouseAvailableQuantity}
                    selectedProducts={form.data.items.length}
                    withdrawalQuantity={totalQuantity}
                    summary={summary}
                    processing={form.processing}
                    onReset={resetWithdrawal}
                    onOpenHistory={openHistory}
                />

                <form
                    onSubmit={submitWithdrawal}
                    className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]"
                >
                    <div className="min-w-0 space-y-4">
                        <WithdrawalDetailsCard
                            warehouses={warehouses}
                            reasons={reasons}
                            data={form.data}
                            errors={form.errors}
                            processing={form.processing}
                            onWarehouseChange={changeWarehouse}
                            onFieldChange={changeTextField}
                        />

                        <ProductBrowserCard
                            searchInputRef={searchInputRef}
                            search={search}
                            category={category}
                            categoryOptions={categoryOptions}
                            products={visibleProducts}
                            selectedQuantities={selectedQuantities}
                            processing={form.processing}
                            onSearchChange={setSearch}
                            onSearchKeyDown={handleSearchKeyDown}
                            onCategoryChange={setCategory}
                            onAddProduct={addProduct}
                        />
                    </div>

                    <WithdrawalCart
                        entries={cartEntries}
                        errors={form.errors}
                        processing={form.processing}
                        warehouseSelected={Boolean(form.data.warehouse_id)}
                        totalQuantity={totalQuantity}
                        estimatedCost={estimatedCost}
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
                </form>

                <RecentWithdrawalsCard
                    withdrawals={recent_issuances}
                    onViewAll={openHistory}
                />
            </PageContainer>
        </AppLayout>
    );
}