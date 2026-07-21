import { PageContainer } from '@/components/shared/page-container';
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
    Clock3,
    History,
    Minus,
    PackageMinus,
    Plus,
    ReceiptText,
    RotateCcw,
    Search,
    Send,
    ShoppingCart,
    Trash2,
    Warehouse,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    type KeyboardEvent,
    useMemo,
    useRef,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

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

type IssuanceFormData = {
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

type PageProps = {
    warehouses: WarehouseOption[];
    products: ProductStock[];
    reasons: ReasonOption[];
    recent_issuances: RecentIssuance[];
    summary: TerminalSummary;
    permissions: TerminalPermissions;
};

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const TERMINAL_URL = '/stock-issuance/terminal';
const HISTORY_URL = '/stock-issuance/history';
const ALL_CATEGORIES = 'all';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Stock Issuance',
        href: TERMINAL_URL,
    },
    {
        title: 'Issuance Terminal',
        href: TERMINAL_URL,
    },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function todayLocal(): string {
    const currentDate = new Date();
    const timezoneOffset = currentDate.getTimezoneOffset();

    return new Date(
        currentDate.getTime() - timezoneOffset * 60_000,
    )
        .toISOString()
        .slice(0, 10);
}

function formatNumber(
    value: number,
    maximumFractionDigits = 3,
): string {
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

function getInitialWarehouseId(
    warehouses: WarehouseOption[],
): string {
    const mainWarehouse = warehouses.find(
        (warehouse) => warehouse.is_main,
    );

    return String(
        mainWarehouse?.id ??
            warehouses[0]?.id ??
            '',
    );
}

function getNestedError(
    errors: Partial<
        Record<keyof IssuanceFormData, string>
    >,
    key: string,
): string | undefined {
    return (
        errors as Record<string, string | undefined>
    )[key];
}

function FieldError({
    message,
}: {
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400">
            <AlertTriangle className="size-3 shrink-0" />
            {message}
        </p>
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function StockIssuanceTerminal({
    warehouses,
    products,
    reasons,
    recent_issuances,
    summary,
}: PageProps) {
    const searchInputRef =
        useRef<HTMLInputElement>(null);

    const [search, setSearch] = useState('');
    const [category, setCategory] =
        useState(ALL_CATEGORIES);

    const form = useForm<IssuanceFormData>({
        warehouse_id:
            getInitialWarehouseId(warehouses),

        issuance_date: todayLocal(),

        reason:
            reasons[0]?.value ??
            'used_consumed',

        issued_to: '',
        department: '',
        purpose: '',
        reference_no: '',
        notes: '',

        items: [],
    });

    const selectedWarehouseId = Number(
        form.data.warehouse_id || 0,
    );

    const selectedWarehouse = useMemo(
        () =>
            warehouses.find(
                (warehouse) =>
                    warehouse.id ===
                    selectedWarehouseId,
            ) ?? null,
        [
            warehouses,
            selectedWarehouseId,
        ],
    );

    const warehouseProducts = useMemo(
        () =>
            products.filter(
                (product) =>
                    product.warehouse_id ===
                    selectedWarehouseId,
            ),
        [
            products,
            selectedWarehouseId,
        ],
    );

    const categoryOptions = useMemo(() => {
        const categoryMap = new Map<
            string,
            string
        >();

        warehouseProducts.forEach(
            (product) => {
                const categoryName =
                    product.category.name?.trim();

                if (categoryName) {
                    categoryMap.set(
                        categoryName.toLowerCase(),
                        categoryName,
                    );
                }
            },
        );

        return Array.from(
            categoryMap.values(),
        ).sort((first, second) =>
            first.localeCompare(second),
        );
    }, [warehouseProducts]);

    const visibleProducts = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return warehouseProducts.filter(
            (product) => {
                const matchesCategory =
                    category ===
                        ALL_CATEGORIES ||
                    product.category.name?.toLowerCase() ===
                        category.toLowerCase();

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
                        String(value)
                            .toLowerCase()
                            .includes(query),
                    );
            },
        );
    }, [
        search,
        category,
        warehouseProducts,
    ]);

    const cartEntries = useMemo(
        () =>
            form.data.items
                .map((item, index) => {
                    const product =
                        products.find(
                            (candidate) =>
                                candidate.product_id ===
                                    item.product_id &&
                                candidate.warehouse_id ===
                                    selectedWarehouseId,
                        );

                    if (!product) {
                        return null;
                    }

                    return {
                        item,
                        product,
                        index,
                    };
                })
                .filter(
                    (
                        entry,
                    ): entry is {
                        item: CartItem;
                        product: ProductStock;
                        index: number;
                    } => entry !== null,
                ),
        [
            form.data.items,
            products,
            selectedWarehouseId,
        ],
    );

    const totalQuantity = useMemo(
        () =>
            cartEntries.reduce(
                (total, entry) =>
                    total +
                    Math.max(
                        0,
                        Number(
                            entry.item
                                .quantity_issued,
                        ) || 0,
                    ),
                0,
            ),
        [cartEntries],
    );

    const estimatedCost = useMemo(
        () =>
            cartEntries.reduce(
                (total, entry) =>
                    total +
                    Math.max(
                        0,
                        Number(
                            entry.item
                                .quantity_issued,
                        ) || 0,
                    ) *
                        Number(
                            entry.product
                                .average_cost || 0,
                        ),
                0,
            ),
        [cartEntries],
    );

    const warehouseAvailableQuantity =
        useMemo(
            () =>
                warehouseProducts.reduce(
                    (total, product) =>
                        total +
                        Number(
                            product.available_quantity ||
                                0,
                        ),
                    0,
                ),
            [warehouseProducts],
        );

    function resetTerminal(): void {
        form.setData({
            warehouse_id:
                getInitialWarehouseId(
                    warehouses,
                ),

            issuance_date: todayLocal(),

            reason:
                reasons[0]?.value ??
                'used_consumed',

            issued_to: '',
            department: '',
            purpose: '',
            reference_no: '',
            notes: '',

            items: [],
        });

        form.clearErrors();

        setSearch('');
        setCategory(ALL_CATEGORIES);

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 50);
    }

    function changeWarehouse(
        warehouseId: string,
    ): void {
        if (
            warehouseId ===
            form.data.warehouse_id
        ) {
            return;
        }

        if (
            form.data.items.length > 0 &&
            !window.confirm(
                'Changing warehouse will clear the current issuance cart. Continue?',
            )
        ) {
            return;
        }

        form.setData(
            'warehouse_id',
            warehouseId,
        );

        form.setData('items', []);
        form.clearErrors();

        setSearch('');
        setCategory(ALL_CATEGORIES);
    }

    function addProduct(
        product: ProductStock,
    ): void {
        if (
            product.warehouse_id !==
            selectedWarehouseId
        ) {
            return;
        }

        const existingIndex =
            form.data.items.findIndex(
                (item) =>
                    item.product_id ===
                    product.product_id,
            );

        if (existingIndex >= 0) {
            const currentItem =
                form.data.items[
                    existingIndex
                ];

            const currentQuantity =
                Number(
                    currentItem.quantity_issued,
                ) || 0;

            const nextQuantity = Math.min(
                product.available_quantity,
                currentQuantity + 1,
            );

            updateCartItem(
                existingIndex,
                'quantity_issued',
                String(nextQuantity),
            );

            return;
        }

        form.setData('items', [
            ...form.data.items,
            {
                product_id:
                    product.product_id,
                quantity_issued: '1',
                notes: '',
            },
        ]);

        form.clearErrors('items');
    }

    function removeProduct(
        index: number,
    ): void {
        form.setData(
            'items',
            form.data.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        );
    }

    function updateCartItem(
        index: number,
        field:
            | 'quantity_issued'
            | 'notes',
        value: string,
    ): void {
        form.setData(
            'items',
            form.data.items.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                              ...item,
                              [field]: value,
                          }
                        : item,
            ),
        );
    }

    function changeQuantity(
        index: number,
        product: ProductStock,
        value: number,
    ): void {
        const safeValue = Math.min(
            product.available_quantity,
            Math.max(0.001, value),
        );

        updateCartItem(
            index,
            'quantity_issued',
            String(
                Number(
                    safeValue.toFixed(3),
                ),
            ),
        );
    }

    function handleSearchKeyDown(
        event: KeyboardEvent<HTMLInputElement>,
    ): void {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();

        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return;
        }

        const exactProduct =
            warehouseProducts.find(
                (product) =>
                    product.barcode?.toLowerCase() ===
                        query ||
                    product.sku?.toLowerCase() ===
                        query,
            );

        if (exactProduct) {
            addProduct(exactProduct);
            setSearch('');

            searchInputRef.current?.focus();
        }
    }

    function submit(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (
            form.data.items.length === 0
        ) {
            form.setError(
                'items',
                'Add at least one product before posting.',
            );

            return;
        }

        const invalidEntry =
            cartEntries.find(
                ({ item, product }) => {
                    const quantity = Number(
                        item.quantity_issued,
                    );

                    return (
                        !Number.isFinite(
                            quantity,
                        ) ||
                        quantity <= 0 ||
                        quantity >
                            product.available_quantity
                    );
                },
            );

        if (invalidEntry) {
            form.setError(
                'items',
                `Check the quantity for ${invalidEntry.product.name}.`,
            );

            return;
        }

        form.clearErrors('items');

        form.post(TERMINAL_URL, {
            preserveScroll: true,

            onSuccess: () => {
                resetTerminal();
            },
        });
    }

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Issuance Terminal" />

            <PageContainer className="gap-3.5 md:gap-4">
                {/* Header */}

                <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/[0.08] text-rose-300">
                                <PackageMinus className="size-4" />

                                <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-card bg-emerald-400" />
                            </span>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-sm font-semibold tracking-tight">
                                        Stock Issuance
                                        Terminal
                                    </h1>

                                    <Badge
                                        variant="outline"
                                        className="h-5 rounded-full border-rose-500/15 bg-rose-500/[0.06] px-2 text-[8px] font-semibold tracking-[0.1em] text-rose-300"
                                    >
                                        STOCK OUT
                                    </Badge>
                                </div>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Controlled
                                    non-sales stock
                                    release for internal
                                    operations,
                                    employees,
                                    departments,
                                    damage, expiry,
                                    loss, and samples.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={
                                    resetTerminal
                                }
                                disabled={
                                    form.processing
                                }
                                className="h-8 rounded-lg px-3 text-[10px]"
                            >
                                <RotateCcw className="size-3.5" />
                                Reset
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.get(
                                        HISTORY_URL,
                                    )
                                }
                                className="h-8 rounded-lg border-violet-500/20 bg-violet-500/[0.06] px-3 text-[10px] text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
                            >
                                <History className="size-3.5" />
                                History
                                <ArrowRight className="size-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Compact metrics */}

                    <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/[0.08] text-amber-300">
                                <Warehouse className="size-3.5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    Warehouse
                                </p>

                                <p className="truncate text-xs font-semibold">
                                    {selectedWarehouse?.code ||
                                        selectedWarehouse?.name ||
                                        'Not selected'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300">
                                <Boxes className="size-3.5" />
                            </span>

                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    Available
                                </p>

                                <p className="text-xs font-semibold tabular-nums">
                                    {formatNumber(
                                        warehouseAvailableQuantity,
                                    )}

                                    <span className="ml-1 text-[9px] font-normal text-muted-foreground">
                                        across{' '}
                                        {
                                            warehouseProducts.length
                                        }{' '}
                                        items
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/[0.08] text-rose-300">
                                <PackageMinus className="size-3.5" />
                            </span>

                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    Issued Today
                                </p>

                                <p className="text-xs font-semibold tabular-nums">
                                    {formatNumber(
                                        summary.quantity_issued_today,
                                    )}

                                    <span className="ml-1 text-[9px] font-normal text-muted-foreground">
                                        {
                                            summary.issued_today
                                        }{' '}
                                        transactions
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex size-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/[0.08] text-violet-300">
                                <ShoppingCart className="size-3.5" />
                            </span>

                            <div>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    Current Cart
                                </p>

                                <p className="text-xs font-semibold tabular-nums">
                                    {formatNumber(
                                        totalQuantity,
                                    )}

                                    <span className="ml-1 text-[9px] font-normal text-muted-foreground">
                                        {
                                            form.data
                                                .items
                                                .length
                                        }{' '}
                                        products
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]"
                >
                    <div className="min-w-0 space-y-4">
                        {/* Configuration */}

                        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
                                <span className="flex size-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] text-blue-300">
                                    <ReceiptText className="size-3.5" />
                                </span>

                                <div>
                                    <h2 className="text-xs font-semibold">
                                        Issuance
                                        Information
                                    </h2>

                                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                                        Define where,
                                        why, and to whom
                                        the stock will be
                                        released.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium">
                                        Warehouse
                                    </label>

                                    <Select
                                        value={
                                            form.data
                                                .warehouse_id
                                        }
                                        onValueChange={
                                            changeWarehouse
                                        }
                                    >
                                        <SelectTrigger className="h-9 rounded-lg text-xs">
                                            <SelectValue placeholder="Select warehouse" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {warehouses.map(
                                                (
                                                    warehouse,
                                                ) => (
                                                    <SelectItem
                                                        key={
                                                            warehouse.id
                                                        }
                                                        value={String(
                                                            warehouse.id,
                                                        )}
                                                    >
                                                        {warehouse.code
                                                            ? `${warehouse.code} — ${warehouse.name}`
                                                            : warehouse.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .warehouse_id
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium">
                                        Issuance Date
                                    </label>

                                    <Input
                                        type="date"
                                        max={todayLocal()}
                                        value={
                                            form.data
                                                .issuance_date
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'issuance_date',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-9 rounded-lg text-xs"
                                    />

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .issuance_date
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium">
                                        Reason
                                    </label>

                                    <Select
                                        value={
                                            form.data
                                                .reason
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            form.setData(
                                                'reason',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-9 rounded-lg text-xs">
                                            <SelectValue placeholder="Select reason" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {reasons.map(
                                                (
                                                    reason,
                                                ) => (
                                                    <SelectItem
                                                        key={
                                                            reason.value
                                                        }
                                                        value={
                                                            reason.value
                                                        }
                                                    >
                                                        {
                                                            reason.label
                                                        }
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .reason
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium">
                                        Issued To

                                        {form.data
                                            .reason ===
                                            'employee_issuance' && (
                                            <span className="text-rose-400">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <Input
                                        value={
                                            form.data
                                                .issued_to
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'issued_to',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Employee or recipient"
                                        className="h-9 rounded-lg text-xs"
                                    />

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .issued_to
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium">
                                        Department

                                        {form.data
                                            .reason ===
                                            'department_issuance' && (
                                            <span className="text-rose-400">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <Input
                                        value={
                                            form.data
                                                .department
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'department',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Office or department"
                                        className="h-9 rounded-lg text-xs"
                                    />

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .department
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium">
                                        Reference No.
                                    </label>

                                    <Input
                                        value={
                                            form.data
                                                .reference_no
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'reference_no',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Request, memo, RIS..."
                                        className="h-9 rounded-lg text-xs"
                                    />

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .reference_no
                                        }
                                    />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3">
                                    <label className="mb-1.5 flex items-center gap-1 text-[10px] font-medium">
                                        Purpose

                                        {form.data
                                            .reason ===
                                            'other' && (
                                            <span className="text-rose-400">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <Input
                                        value={
                                            form.data
                                                .purpose
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'purpose',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Operational purpose or justification"
                                        className="h-9 rounded-lg text-xs"
                                    />

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .purpose
                                        }
                                    />
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3">
                                    <label className="mb-1.5 block text-[10px] font-medium">
                                        Transaction
                                        Notes
                                    </label>

                                    <Textarea
                                        value={
                                            form.data
                                                .notes
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'notes',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Supporting details or audit notes"
                                        rows={2}
                                        className="min-h-16 resize-y rounded-lg text-xs"
                                    />

                                    <FieldError
                                        message={
                                            form
                                                .errors
                                                .notes
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Product browser */}

                        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                            <div className="space-y-3 border-b border-border/60 px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300">
                                            <Boxes className="size-3.5" />
                                        </span>

                                        <div>
                                            <h2 className="text-xs font-semibold">
                                                Available
                                                Products
                                            </h2>

                                            <p className="mt-0.5 text-[9px] text-muted-foreground">
                                                Search or
                                                scan products
                                                from the
                                                selected
                                                warehouse.
                                            </p>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="h-6 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-2 text-[9px] text-emerald-300"
                                    >
                                        {
                                            visibleProducts.length
                                        }{' '}
                                        products
                                    </Badge>
                                </div>

                                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_210px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            ref={
                                                searchInputRef
                                            }
                                            value={
                                                search
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setSearch(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            onKeyDown={
                                                handleSearchKeyDown
                                            }
                                            placeholder="Search name, SKU, or scan barcode..."
                                            className="h-9 rounded-lg pl-9 pr-9 text-xs"
                                        />

                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearch(
                                                        '',
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <Select
                                        value={
                                            category
                                        }
                                        onValueChange={
                                            setCategory
                                        }
                                    >
                                        <SelectTrigger className="h-9 rounded-lg text-xs">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem
                                                value={
                                                    ALL_CATEGORIES
                                                }
                                            >
                                                All
                                                categories
                                            </SelectItem>

                                            {categoryOptions.map(
                                                (
                                                    option,
                                                ) => (
                                                    <SelectItem
                                                        key={
                                                            option
                                                        }
                                                        value={option.toLowerCase()}
                                                    >
                                                        {
                                                            option
                                                        }
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <p className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                    <Barcode className="size-3 text-blue-300" />
                                    Exact barcode
                                    or SKU + Enter
                                    automatically
                                    adds the product.
                                </p>
                            </div>

                            {visibleProducts.length ===
                            0 ? (
                                <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
                                    <Search className="size-8 text-muted-foreground/50" />

                                    <h3 className="mt-3 text-sm font-semibold">
                                        No available
                                        product found
                                    </h3>

                                    <p className="mt-1 max-w-sm text-[10px] text-muted-foreground">
                                        Select another
                                        warehouse or
                                        change your
                                        search and
                                        category filter.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-px bg-border/60 sm:grid-cols-2 2xl:grid-cols-3">
                                    {visibleProducts.map(
                                        (
                                            product,
                                        ) => {
                                            const cartItem =
                                                form.data.items.find(
                                                    (
                                                        item,
                                                    ) =>
                                                        item.product_id ===
                                                        product.product_id,
                                                );

                                            return (
                                                <button
                                                    key={
                                                        product.stock_id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        addProduct(
                                                            product,
                                                        )
                                                    }
                                                    className="group min-w-0 bg-card p-3.5 text-left transition hover:bg-muted/30"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30 text-muted-foreground group-hover:border-emerald-500/20 group-hover:text-emerald-300">
                                                            <Boxes className="size-4" />
                                                        </span>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[11px] font-semibold">
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                                                                        {product.sku ||
                                                                            'No SKU'}

                                                                        {product.barcode
                                                                            ? ` · ${product.barcode}`
                                                                            : ''}
                                                                    </p>
                                                                </div>

                                                                {cartItem && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="h-5 rounded-full border-violet-500/20 bg-violet-500/[0.08] px-2 text-[8px] text-violet-300"
                                                                    >
                                                                        IN
                                                                        CART
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="mt-3 flex items-end justify-between gap-2">
                                                                <div>
                                                                    <p className="text-[9px] text-muted-foreground">
                                                                        Available
                                                                    </p>

                                                                    <p className="text-sm font-semibold tabular-nums text-emerald-300">
                                                                        {formatNumber(
                                                                            product.available_quantity,
                                                                        )}

                                                                        <span className="ml-1 text-[9px] font-normal text-muted-foreground">
                                                                            {
                                                                                product.unit
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                </div>

                                                                <p className="max-w-28 truncate text-[9px] text-muted-foreground">
                                                                    {product
                                                                        .category
                                                                        .name ||
                                                                        'Uncategorized'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Recent issuances */}

                        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
                            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/[0.08] text-violet-300">
                                        <History className="size-3.5" />
                                    </span>

                                    <div>
                                        <h2 className="text-xs font-semibold">
                                            Recent
                                            Issuances
                                        </h2>

                                        <p className="mt-0.5 text-[9px] text-muted-foreground">
                                            Latest stock
                                            release
                                            transactions.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        router.get(
                                            HISTORY_URL,
                                        )
                                    }
                                    className="h-7 px-2 text-[9px] text-violet-300"
                                >
                                    View all
                                    <ArrowRight className="size-3" />
                                </Button>
                            </div>

                            {recent_issuances.length ===
                            0 ? (
                                <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                                    No issuance
                                    transaction yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {recent_issuances.map(
                                        (
                                            issuance,
                                        ) => (
                                            <div
                                                key={
                                                    issuance.id
                                                }
                                                className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-[10px] font-semibold">
                                                            {
                                                                issuance.issuance_number
                                                            }
                                                        </p>

                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'h-5 rounded-full px-2 text-[8px]',
                                                                issuance.status ===
                                                                    'voided'
                                                                    ? 'border-rose-500/20 bg-rose-500/[0.08] text-rose-300'
                                                                    : 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300',
                                                            )}
                                                        >
                                                            {issuance.status.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                                                        {
                                                            issuance.reason_label
                                                        }{' '}
                                                        ·{' '}
                                                        {issuance
                                                            .warehouse
                                                            .code ||
                                                            issuance
                                                                .warehouse
                                                                .name}
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[9px] font-medium">
                                                        {issuance.issued_to ||
                                                            issuance.department ||
                                                            'Internal release'}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                                                        {issuance
                                                            .issued_by
                                                            ?.name ||
                                                            'System user'}{' '}
                                                        ·{' '}
                                                        {formatDate(
                                                            issuance.issuance_date,
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-[10px] font-semibold tabular-nums text-rose-300">
                                                        −
                                                        {formatNumber(
                                                            issuance.total_quantity,
                                                        )}
                                                    </p>

                                                    <p className="text-[9px] text-muted-foreground">
                                                        {formatMoney(
                                                            issuance.total_cost,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Cart */}

                    <aside className="min-w-0">
                        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm xl:sticky xl:top-4">
                            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/[0.08] text-violet-300">
                                        <ShoppingCart className="size-3.5" />
                                    </span>

                                    <div>
                                        <h2 className="text-xs font-semibold">
                                            Issuance Cart
                                        </h2>

                                        <p className="text-[9px] text-muted-foreground">
                                            {
                                                form.data
                                                    .items
                                                    .length
                                            }{' '}
                                            selected
                                            products
                                        </p>
                                    </div>
                                </div>

                                {form.data.items
                                    .length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            form.setData(
                                                'items',
                                                [],
                                            )
                                        }
                                        className="h-7 px-2 text-[9px] text-rose-300"
                                    >
                                        <Trash2 className="size-3" />
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {cartEntries.length ===
                            0 ? (
                                <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                                    <ShoppingCart className="size-8 text-muted-foreground/40" />

                                    <h3 className="mt-3 text-sm font-semibold">
                                        Cart is empty
                                    </h3>

                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        Click an
                                        available
                                        product to add
                                        it to this
                                        issuance.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-[48vh] divide-y divide-border/60 overflow-y-auto xl:max-h-[calc(100vh-410px)]">
                                    {cartEntries.map(
                                        ({
                                            item,
                                            product,
                                            index,
                                        }) => {
                                            const quantity =
                                                Number(
                                                    item.quantity_issued,
                                                ) ||
                                                0;

                                            return (
                                                <div
                                                    key={
                                                        product.stock_id
                                                    }
                                                    className="p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-[10px] font-semibold">
                                                                {
                                                                    product.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                                                                {product.sku ||
                                                                    'No SKU'}{' '}
                                                                ·{' '}
                                                                {formatNumber(
                                                                    product.available_quantity,
                                                                )}{' '}
                                                                {
                                                                    product.unit
                                                                }{' '}
                                                                available
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeProduct(
                                                                    index,
                                                                )
                                                            }
                                                            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-300"
                                                        >
                                                            <X className="size-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="mt-3 flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeQuantity(
                                                                    index,
                                                                    product,
                                                                    quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="flex size-8 items-center justify-center rounded-lg border border-border/70"
                                                        >
                                                            <Minus className="size-3.5" />
                                                        </button>

                                                        <Input
                                                            type="number"
                                                            min="0.001"
                                                            step="0.001"
                                                            max={
                                                                product.available_quantity
                                                            }
                                                            value={
                                                                item.quantity_issued
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateCartItem(
                                                                    index,
                                                                    'quantity_issued',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-8 flex-1 rounded-lg text-center text-xs font-semibold"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeQuantity(
                                                                    index,
                                                                    product,
                                                                    quantity +
                                                                        1,
                                                                )
                                                            }
                                                            className="flex size-8 items-center justify-center rounded-lg border border-border/70"
                                                        >
                                                            <Plus className="size-3.5" />
                                                        </button>
                                                    </div>

                                                    <FieldError
                                                        message={getNestedError(
                                                            form.errors,
                                                            `items.${index}.quantity_issued`,
                                                        )}
                                                    />

                                                    <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
                                                        <span>
                                                            Estimated
                                                            cost
                                                        </span>

                                                        <span className="font-medium text-foreground">
                                                            {formatMoney(
                                                                quantity *
                                                                    product.average_cost,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <Input
                                                        value={
                                                            item.notes
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateCartItem(
                                                                index,
                                                                'notes',
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Item note (optional)"
                                                        className="mt-2 h-8 rounded-lg text-[10px]"
                                                    />
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}

                            <div className="border-t border-border/60 bg-muted/[0.12] p-4">
                                <div className="space-y-2 text-[10px]">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>
                                            Products
                                        </span>

                                        <span>
                                            {
                                                form.data
                                                    .items
                                                    .length
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-muted-foreground">
                                        <span>
                                            Total
                                            quantity
                                        </span>

                                        <span>
                                            {formatNumber(
                                                totalQuantity,
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t border-border/60 pt-2">
                                        <span className="font-medium">
                                            Estimated
                                            value
                                        </span>

                                        <span className="text-sm font-semibold">
                                            {formatMoney(
                                                estimatedCost,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <FieldError
                                    message={
                                        form.errors
                                            .items
                                    }
                                />

                                <FieldError
                                    message={getNestedError(
                                        form.errors,
                                        'issuance',
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        form.data
                                            .items
                                            .length ===
                                            0 ||
                                        !form.data
                                            .warehouse_id
                                    }
                                    className="mt-4 h-10 w-full rounded-lg bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500"
                                >
                                    {form.processing ? (
                                        <>
                                            <Clock3 className="size-4 animate-pulse" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="size-4" />
                                            Post Stock
                                            Issuance
                                        </>
                                    )}
                                </Button>

                                <div className="mt-2 flex gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2 text-[9px] leading-4 text-amber-200/80">
                                    <AlertTriangle className="mt-0.5 size-3 shrink-0" />

                                    <span>
                                        Posting
                                        immediately
                                        deducts stock
                                        and creates a
                                        stock movement
                                        record.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </form>
            </PageContainer>
        </AppLayout>
    );
}