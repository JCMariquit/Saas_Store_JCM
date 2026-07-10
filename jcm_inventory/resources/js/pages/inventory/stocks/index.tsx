import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRightLeft,
    ArrowUpRight,
    Boxes,
    Building2,
    CircleDollarSign,
    ClipboardPenLine,
    Layers3,
    LoaderCircle,
    Package2,
    Plus,
    RefreshCw,
    Search,
    Settings2,
    SlidersHorizontal,
    Trash2,
    TriangleAlert,
    Warehouse as WarehouseIcon,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useMemo,
    useState,
} from 'react';

type BranchOption = {
    id: number;
    name: string;
    code: string;
    is_main: boolean;
};

type WarehouseBranch = {
    id: number;
    name: string;
    code: string;
};

type WarehouseOption = {
    id: number;
    branch_id: number;
    name: string;
    code: string;
    is_main: boolean;
    branch: WarehouseBranch | null;
};

type CategoryOption = {
    id: number;
    parent_id: number | null;
    name: string;
};

type ProductCategory = {
    id: number;
    name: string;
};

type ProductOption = {
    id: number;
    category_id: number | null;
    name: string;
    sku: string | null;
    barcode: string | null;
    unit: string;
    cost_price: string | number;
    category: ProductCategory | null;
};

type StockProduct = {
    id: number;
    category_id: number | null;
    name: string;
    sku: string | null;
    barcode: string | null;
    unit: string;
    cost_price: string | number;
    selling_price: string | number;
    stock_tracking: 'tracked' | 'not_tracked';
    is_active: boolean;
    category: ProductCategory | null;
};

type StockWarehouse = {
    id: number;
    branch_id: number;
    name: string;
    code: string;
    is_main: boolean;
    is_active: boolean;
    branch: WarehouseBranch | null;
};

type WarehouseStock = {
    id: number;
    tenant_id: number;
    warehouse_id: number;
    product_id: number;
    quantity: string | number;
    reorder_level: string | number;
    max_stock_level: string | number | null;
    average_cost: string | number;
    last_movement_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    product: StockProduct | null;
    warehouse: StockWarehouse | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedStocks = {
    current_page: number;
    data: WarehouseStock[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type StockSummary = {
    records: number;
    total_quantity: number;
    low_stock: number;
    out_of_stock: number;
    inventory_value: number;
};

type StockFilters = {
    search: string;
    status: string;
    branch_id: number | null;
    warehouse_id: number | null;
    category_id: number | null;
};

type MovementType = {
    value: string;
    label: string;
    direction: 'in' | 'out';
};

type StockPageProps = {
    stocks: PaginatedStocks;
    branches: BranchOption[];
    warehouses: WarehouseOption[];
    categories: CategoryOption[];
    products: ProductOption[];
    summary: StockSummary;
    filters: StockFilters;
    movementTypes: MovementType[];
};

type CreateStockForm = {
    warehouse_id: string;
    product_id: string;
    opening_quantity: string;
    reorder_level: string;
    max_stock_level: string;
    unit_cost: string;
    remarks: string;
};

type StockSettingsForm = {
    reorder_level: string;
    max_stock_level: string;
};

type AdjustStockForm = {
    movement_type: string;
    quantity: string;
    unit_cost: string;
    reference_no: string;
    remarks: string;
};

type TransferStockForm = {
    destination_warehouse_id: string;
    quantity: string;
    remarks: string;
};

type DrawerType =
    | 'create'
    | 'settings'
    | 'adjust'
    | 'transfer'
    | null;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Inventory',
        href: '/inventory/overview',
    },
    {
        title: 'Stock Management',
        href: '/inventory/stocks',
    },
];

const inputClass =
    'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10';

const textareaClass =
    'w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10';

const emptySettingsForm: StockSettingsForm = {
    reorder_level: '0',
    max_stock_level: '',
};

const emptyAdjustForm: AdjustStockForm = {
    movement_type: 'stock_in',
    quantity: '',
    unit_cost: '',
    reference_no: '',
    remarks: '',
};

const emptyTransferForm: TransferStockForm = {
    destination_warehouse_id: '',
    quantity: '',
    remarks: '',
};

function getDefaultWarehouseId(
    warehouses: WarehouseOption[],
): string {
    const mainWarehouse = warehouses.find(
        (warehouse) => warehouse.is_main,
    );

    if (mainWarehouse) {
        return String(mainWarehouse.id);
    }

    return warehouses[0]
        ? String(warehouses[0].id)
        : '';
}

function getEmptyCreateForm(
    warehouses: WarehouseOption[],
): CreateStockForm {
    return {
        warehouse_id: getDefaultWarehouseId(warehouses),
        product_id: '',
        opening_quantity: '0',
        reorder_level: '5',
        max_stock_level: '',
        unit_cost: '',
        remarks: '',
    };
}

export default function StockIndex({
    stocks,
    branches,
    warehouses,
    categories,
    products,
    summary,
    filters,
    movementTypes,
}: StockPageProps) {
    const [drawerType, setDrawerType] =
        useState<DrawerType>(null);

    const [selectedStock, setSelectedStock] =
        useState<WarehouseStock | null>(null);

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const [branchId, setBranchId] = useState(
        filters.branch_id
            ? String(filters.branch_id)
            : '',
    );

    const [warehouseId, setWarehouseId] = useState(
        filters.warehouse_id
            ? String(filters.warehouse_id)
            : '',
    );

    const [categoryId, setCategoryId] = useState(
        filters.category_id
            ? String(filters.category_id)
            : '',
    );

    const createForm = useForm<CreateStockForm>(
        getEmptyCreateForm(warehouses),
    );

    const settingsForm =
        useForm<StockSettingsForm>({
            ...emptySettingsForm,
        });

    const adjustForm = useForm<AdjustStockForm>({
        ...emptyAdjustForm,
    });

    const transferForm =
        useForm<TransferStockForm>({
            ...emptyTransferForm,
        });

    const filteredWarehouses = useMemo(() => {
        if (!branchId) {
            return warehouses;
        }

        return warehouses.filter(
            (warehouse) =>
                String(warehouse.branch_id) === branchId,
        );
    }, [branchId, warehouses]);

    const destinationWarehouses = useMemo(() => {
        if (!selectedStock) {
            return warehouses;
        }

        return warehouses.filter(
            (warehouse) =>
                warehouse.id !==
                selectedStock.warehouse_id,
        );
    }, [selectedStock, warehouses]);

    const selectedMovement = movementTypes.find(
        (movement) =>
            movement.value ===
            adjustForm.data.movement_type,
    );

    const isIncomingMovement =
        selectedMovement?.direction === 'in';

    const isAnyFormProcessing =
        createForm.processing ||
        settingsForm.processing ||
        adjustForm.processing ||
        transferForm.processing;

    function resetDrawer(): void {
        setDrawerType(null);
        setSelectedStock(null);

        createForm.clearErrors();
        settingsForm.clearErrors();
        adjustForm.clearErrors();
        transferForm.clearErrors();

        createForm.setData(
            getEmptyCreateForm(warehouses),
        );

        settingsForm.setData({
            ...emptySettingsForm,
        });

        adjustForm.setData({
            ...emptyAdjustForm,
        });

        transferForm.setData({
            ...emptyTransferForm,
        });
    }

    function closeDrawer(): void {
        if (isAnyFormProcessing) {
            return;
        }

        resetDrawer();
    }

    function openCreateDrawer(): void {
        setSelectedStock(null);

        createForm.clearErrors();

        createForm.setData(
            getEmptyCreateForm(warehouses),
        );

        setDrawerType('create');
    }

    function openSettingsDrawer(
        stock: WarehouseStock,
    ): void {
        setSelectedStock(stock);

        settingsForm.clearErrors();

        settingsForm.setData({
            reorder_level: String(
                stock.reorder_level ?? 0,
            ),
            max_stock_level:
                stock.max_stock_level !== null
                    ? String(stock.max_stock_level)
                    : '',
        });

        setDrawerType('settings');
    }

    function openAdjustDrawer(
        stock: WarehouseStock,
    ): void {
        setSelectedStock(stock);

        adjustForm.clearErrors();

        adjustForm.setData({
            movement_type: 'stock_in',
            quantity: '',
            unit_cost: String(
                stock.average_cost ?? '',
            ),
            reference_no: '',
            remarks: '',
        });

        setDrawerType('adjust');
    }

    function openTransferDrawer(
        stock: WarehouseStock,
    ): void {
        setSelectedStock(stock);

        transferForm.clearErrors();

        const firstDestination = warehouses.find(
            (warehouse) =>
                warehouse.id !== stock.warehouse_id,
        );

        transferForm.setData({
            destination_warehouse_id:
                firstDestination
                    ? String(firstDestination.id)
                    : '',
            quantity: '',
            remarks: '',
        });

        setDrawerType('transfer');
    }

    function submitCreateStock(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        createForm.post('/inventory/stocks', {
            preserveScroll: true,
            onSuccess: resetDrawer,
        });
    }

    function submitSettings(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (!selectedStock) {
            return;
        }

        settingsForm.patch(
            `/inventory/stocks/${selectedStock.id}/settings`,
            {
                preserveScroll: true,
                onSuccess: resetDrawer,
            },
        );
    }

    function submitAdjustment(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (!selectedStock) {
            return;
        }

        adjustForm.post(
            `/inventory/stocks/${selectedStock.id}/adjust`,
            {
                preserveScroll: true,
                onSuccess: resetDrawer,
            },
        );
    }

    function submitTransfer(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        if (!selectedStock) {
            return;
        }

        transferForm.post(
            `/inventory/stocks/${selectedStock.id}/transfer`,
            {
                preserveScroll: true,
                onSuccess: resetDrawer,
            },
        );
    }

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/inventory/stocks',
            {
                search: search.trim() || undefined,
                status: status || undefined,
                branch_id: branchId || undefined,
                warehouse_id:
                    warehouseId || undefined,
                category_id:
                    categoryId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function resetFilters(): void {
        setSearch('');
        setStatus('');
        setBranchId('');
        setWarehouseId('');
        setCategoryId('');

        router.get(
            '/inventory/stocks',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function handleBranchChange(
        value: string,
    ): void {
        setBranchId(value);

        if (!value) {
            return;
        }

        const currentWarehouse =
            warehouses.find(
                (warehouse) =>
                    String(warehouse.id) ===
                    warehouseId,
            );

        if (
            currentWarehouse &&
            String(currentWarehouse.branch_id) !==
                value
        ) {
            setWarehouseId('');
        }
    }

    function deleteStock(
        stock: WarehouseStock,
    ): void {
        const productName =
            stock.product?.name ??
            'this stock record';

        const confirmed = window.confirm(
            `Delete the stock record for "${productName}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            `/inventory/stocks/${stock.id}`,
            {
                preserveScroll: true,
            },
        );
    }

    const requirementsComplete =
        warehouses.length > 0 &&
        products.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Management" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background">
                    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                                <Boxes className="size-3.5 text-primary" />
                                Inventory Control
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight">
                                Stock Management
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Monitor product quantities,
                                warehouse availability, stock
                                thresholds, adjustments, and
                                transfers from one place.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateDrawer}
                            disabled={!requirementsComplete}
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus className="size-4" />
                            Add Stock Record
                        </button>
                    </div>
                </section>

                {!requirementsComplete && (
                    <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                    <TriangleAlert className="size-5" />
                                </div>

                                <div>
                                    <p className="font-medium">
                                        Complete your inventory setup
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        An active warehouse and an
                                        active stock-tracked product
                                        are required before adding
                                        stock records.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {warehouses.length === 0 && (
                                    <Link
                                        href="/warehouses"
                                        className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                                    >
                                        Add Warehouse
                                    </Link>
                                )}

                                {products.length === 0 && (
                                    <Link
                                        href="/inventory/products"
                                        className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                                    >
                                        Add Product
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                <section className="grid gap-4 xl:grid-cols-[1.3fr_2fr]">
                    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/10">
                                    <CircleDollarSign className="size-5" />
                                </div>

                                <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
                                    Current valuation
                                </span>
                            </div>

                            <p className="mt-8 text-sm text-primary-foreground/70">
                                Total Inventory Value
                            </p>

                            <p className="mt-2 text-3xl font-semibold tracking-tight">
                                {formatCurrency(
                                    summary.inventory_value,
                                )}
                            </p>

                            <p className="mt-3 text-xs text-primary-foreground/70">
                                Based on current quantity and
                                average acquisition cost.
                            </p>
                        </div>

                        <div className="absolute -bottom-16 -right-12 size-52 rounded-full bg-primary-foreground/10" />
                        <div className="absolute -right-8 -top-20 size-40 rounded-full bg-primary-foreground/5" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <MetricCard
                            title="Stock Records"
                            value={formatNumber(
                                summary.records,
                            )}
                            description="Product and warehouse pairs"
                            icon={
                                <Layers3 className="size-5" />
                            }
                        />

                        <MetricCard
                            title="Total Quantity"
                            value={formatQuantity(
                                summary.total_quantity,
                            )}
                            description="Combined available units"
                            icon={<Boxes className="size-5" />}
                        />

                        <MetricCard
                            title="Low Stock"
                            value={formatNumber(
                                summary.low_stock,
                            )}
                            description="Needs replenishment"
                            icon={
                                <TriangleAlert className="size-5" />
                            }
                            tone="warning"
                        />

                        <MetricCard
                            title="Out of Stock"
                            value={formatNumber(
                                summary.out_of_stock,
                            )}
                            description="No available quantity"
                            icon={
                                <ArrowDownRight className="size-5" />
                            }
                            tone="danger"
                        />
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="border-b px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <SlidersHorizontal className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Stock Records
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Search and filter inventory
                                    records by location and status.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={applyFilters}
                        className="grid gap-3 border-b bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_repeat(4,minmax(150px,auto))_auto_auto]"
                    >
                        <div className="relative md:col-span-2 xl:col-span-1">
                            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search product, SKU, barcode, warehouse..."
                                className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={branchId}
                            onChange={(event) =>
                                handleBranchChange(
                                    event.target.value,
                                )
                            }
                            className={inputClass}
                        >
                            <option value="">
                                All branches
                            </option>

                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={warehouseId}
                            onChange={(event) =>
                                setWarehouseId(
                                    event.target.value,
                                )
                            }
                            className={inputClass}
                        >
                            <option value="">
                                All warehouses
                            </option>

                            {filteredWarehouses.map(
                                (warehouse) => (
                                    <option
                                        key={warehouse.id}
                                        value={warehouse.id}
                                    >
                                        {warehouse.name}
                                    </option>
                                ),
                            )}
                        </select>

                        <select
                            value={categoryId}
                            onChange={(event) =>
                                setCategoryId(
                                    event.target.value,
                                )
                            }
                            className={inputClass}
                        >
                            <option value="">
                                All categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.parent_id
                                        ? '— '
                                        : ''}
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value,
                                )
                            }
                            className={inputClass}
                        >
                            <option value="">
                                All statuses
                            </option>

                            <option value="in_stock">
                                In stock
                            </option>

                            <option value="low_stock">
                                Low stock
                            </option>

                            <option value="out_of_stock">
                                Out of stock
                            </option>
                        </select>

                        <button
                            type="submit"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
                        >
                            <Search className="size-4" />
                            Apply
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                        >
                            <RefreshCw className="size-4" />
                            Reset
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1180px] text-left">
                            <thead>
                                <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="px-5 py-3.5 font-medium">
                                        Product
                                    </th>

                                    <th className="px-5 py-3.5 font-medium">
                                        Location
                                    </th>

                                    <th className="px-5 py-3.5 font-medium">
                                        Availability
                                    </th>

                                    <th className="px-5 py-3.5 font-medium">
                                        Stock Levels
                                    </th>

                                    <th className="px-5 py-3.5 font-medium">
                                        Valuation
                                    </th>

                                    <th className="px-5 py-3.5 font-medium">
                                        Last Movement
                                    </th>

                                    <th className="px-5 py-3.5 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {stocks.data.map((stock) => {
                                    const quantity = Number(
                                        stock.quantity ?? 0,
                                    );

                                    const averageCost = Number(
                                        stock.average_cost ?? 0,
                                    );

                                    const statusInfo =
                                        getStockStatus(stock);

                                    const percentage =
                                        getStockPercentage(stock);

                                    return (
                                        <tr
                                            key={stock.id}
                                            className="group transition hover:bg-muted/20"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                        <Package2 className="size-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="max-w-[230px] truncate font-medium">
                                                            {stock.product
                                                                ?.name ??
                                                                'Unknown product'}
                                                        </p>

                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                            <span>
                                                                SKU:{' '}
                                                                {stock.product
                                                                    ?.sku ??
                                                                    '—'}
                                                            </span>

                                                            <span>
                                                                {stock.product
                                                                    ?.category
                                                                    ?.name ??
                                                                    'Uncategorized'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <WarehouseIcon className="size-4 text-primary" />

                                                        <span>
                                                            {stock.warehouse
                                                                ?.name ??
                                                                'Unknown warehouse'}
                                                        </span>

                                                        {stock.warehouse
                                                            ?.is_main && (
                                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                                                MAIN
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Building2 className="size-3.5" />

                                                        {stock.warehouse
                                                            ?.branch
                                                            ?.name ??
                                                            'No branch'}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="min-w-[180px]">
                                                    <div className="flex items-end justify-between gap-3">
                                                        <div>
                                                            <p className="text-xl font-semibold">
                                                                {formatQuantity(
                                                                    quantity,
                                                                )}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {stock.product
                                                                    ?.unit ??
                                                                    'unit'}
                                                            </p>
                                                        </div>

                                                        <StockStatusBadge
                                                            label={
                                                                statusInfo.label
                                                            }
                                                            tone={
                                                                statusInfo.tone
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={[
                                                                'h-full rounded-full transition-all',
                                                                statusInfo.progressClass,
                                                            ].join(
                                                                ' ',
                                                            )}
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between gap-5">
                                                        <span className="text-muted-foreground">
                                                            Reorder
                                                        </span>

                                                        <span className="font-medium">
                                                            {formatQuantity(
                                                                stock.reorder_level,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-5">
                                                        <span className="text-muted-foreground">
                                                            Maximum
                                                        </span>

                                                        <span className="font-medium">
                                                            {stock.max_stock_level !==
                                                            null
                                                                ? formatQuantity(
                                                                      stock.max_stock_level,
                                                                  )
                                                                : 'Not set'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold">
                                                        {formatCurrency(
                                                            quantity *
                                                                averageCost,
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCurrency(
                                                            averageCost,
                                                        )}{' '}
                                                        average cost
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm">
                                                    {formatDate(
                                                        stock.last_movement_at,
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatTime(
                                                        stock.last_movement_at,
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAdjustDrawer(
                                                                stock,
                                                            )
                                                        }
                                                        title="Adjust stock"
                                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                                                    >
                                                        <ClipboardPenLine className="size-3.5" />
                                                        Adjust
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openTransferDrawer(
                                                                stock,
                                                            )
                                                        }
                                                        disabled={
                                                            warehouses.length <=
                                                                1 ||
                                                            quantity <= 0
                                                        }
                                                        title="Transfer stock"
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <ArrowRightLeft className="size-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openSettingsDrawer(
                                                                stock,
                                                            )
                                                        }
                                                        title="Stock settings"
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                                                    >
                                                        <Settings2 className="size-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteStock(
                                                                stock,
                                                            )
                                                        }
                                                        title="Delete stock record"
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border text-destructive transition hover:border-destructive/40 hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {stocks.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
                                                <Boxes className="size-8 text-muted-foreground/50" />
                                            </div>

                                            <h3 className="mt-4 text-lg font-semibold">
                                                No stock records found
                                            </h3>

                                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                                No inventory records
                                                matched your filters.
                                                Add a stock record or
                                                reset the filters.
                                            </p>

                                            <div className="mt-5 flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={
                                                        resetFilters
                                                    }
                                                    className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
                                                >
                                                    <RefreshCw className="size-4" />
                                                    Reset Filters
                                                </button>

                                                {requirementsComplete && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            openCreateDrawer
                                                        }
                                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                                                    >
                                                        <Plus className="size-4" />
                                                        Add Stock
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <StockPagination stocks={stocks} />
                </section>
            </div>

            {drawerType === 'create' && (
                <Drawer
                    title="Add Stock Record"
                    description="Connect a tracked product to a warehouse and enter its opening inventory."
                    onClose={closeDrawer}
                    processing={createForm.processing}
                >
                    <form
                        onSubmit={submitCreateStock}
                        className="flex min-h-full flex-col"
                    >
                        <div className="flex-1 space-y-6 p-6">
                            <FormSection
                                title="Product Location"
                                description="Choose where the product stock will be stored."
                            >
                                <FormField
                                    label="Warehouse"
                                    error={
                                        createForm.errors
                                            .warehouse_id
                                    }
                                    required
                                >
                                    <select
                                        value={
                                            createForm.data
                                                .warehouse_id
                                        }
                                        onChange={(event) =>
                                            createForm.setData(
                                                'warehouse_id',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select warehouse
                                        </option>

                                        {warehouses.map(
                                            (warehouse) => (
                                                <option
                                                    key={
                                                        warehouse.id
                                                    }
                                                    value={
                                                        warehouse.id
                                                    }
                                                >
                                                    {warehouse.name}
                                                    {warehouse.branch
                                                        ? ` — ${warehouse.branch.name}`
                                                        : ''}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </FormField>

                                <FormField
                                    label="Product"
                                    error={
                                        createForm.errors
                                            .product_id
                                    }
                                    required
                                >
                                    <select
                                        value={
                                            createForm.data
                                                .product_id
                                        }
                                        onChange={(event) => {
                                            const value =
                                                event.target.value;

                                            const product =
                                                products.find(
                                                    (item) =>
                                                        String(
                                                            item.id,
                                                        ) ===
                                                        value,
                                                );

                                            createForm.setData({
                                                ...createForm.data,
                                                product_id:
                                                    value,
                                                unit_cost:
                                                    product
                                                        ? String(
                                                              product.cost_price,
                                                          )
                                                        : '',
                                            });
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select product
                                        </option>

                                        {products.map(
                                            (product) => (
                                                <option
                                                    key={
                                                        product.id
                                                    }
                                                    value={
                                                        product.id
                                                    }
                                                >
                                                    {product.name}
                                                    {product.sku
                                                        ? ` — ${product.sku}`
                                                        : ''}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </FormField>
                            </FormSection>

                            <FormSection
                                title="Opening Inventory"
                                description="Set the beginning quantity and valuation."
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        label="Opening Quantity"
                                        error={
                                            createForm.errors
                                                .opening_quantity
                                        }
                                        required
                                    >
                                        <NumberInput
                                            value={
                                                createForm.data
                                                    .opening_quantity
                                            }
                                            onChange={(value) =>
                                                createForm.setData(
                                                    'opening_quantity',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        label="Unit Cost"
                                        error={
                                            createForm.errors
                                                .unit_cost
                                        }
                                    >
                                        <PriceInput
                                            value={
                                                createForm.data
                                                    .unit_cost
                                            }
                                            onChange={(value) =>
                                                createForm.setData(
                                                    'unit_cost',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>
                                </div>
                            </FormSection>

                            <FormSection
                                title="Stock Thresholds"
                                description="Use these values to identify low stock items."
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        label="Reorder Level"
                                        error={
                                            createForm.errors
                                                .reorder_level
                                        }
                                        required
                                    >
                                        <NumberInput
                                            value={
                                                createForm.data
                                                    .reorder_level
                                            }
                                            onChange={(value) =>
                                                createForm.setData(
                                                    'reorder_level',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        label="Maximum Level"
                                        error={
                                            createForm.errors
                                                .max_stock_level
                                        }
                                    >
                                        <NumberInput
                                            value={
                                                createForm.data
                                                    .max_stock_level
                                            }
                                            onChange={(value) =>
                                                createForm.setData(
                                                    'max_stock_level',
                                                    value,
                                                )
                                            }
                                            allowEmpty
                                        />
                                    </FormField>
                                </div>
                            </FormSection>

                            <FormField
                                label="Remarks"
                                error={
                                    createForm.errors.remarks
                                }
                            >
                                <textarea
                                    rows={4}
                                    value={
                                        createForm.data.remarks
                                    }
                                    onChange={(event) =>
                                        createForm.setData(
                                            'remarks',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Optional notes about the opening stock..."
                                    className={textareaClass}
                                />
                            </FormField>
                        </div>

                        <DrawerActions
                            processing={
                                createForm.processing
                            }
                            onCancel={closeDrawer}
                            submitLabel="Create Stock Record"
                        />
                    </form>
                </Drawer>
            )}

            {drawerType === 'settings' &&
                selectedStock && (
                    <Drawer
                        title="Stock Settings"
                        description={`Update stock thresholds for ${selectedStock.product?.name ?? 'this product'}.`}
                        onClose={closeDrawer}
                        processing={
                            settingsForm.processing
                        }
                    >
                        <form
                            onSubmit={submitSettings}
                            className="flex min-h-full flex-col"
                        >
                            <div className="flex-1 space-y-6 p-6">
                                <StockContextCard
                                    stock={selectedStock}
                                />

                                <FormSection
                                    title="Threshold Settings"
                                    description="Set when the product should be considered low stock."
                                >
                                    <FormField
                                        label="Reorder Level"
                                        error={
                                            settingsForm.errors
                                                .reorder_level
                                        }
                                        required
                                    >
                                        <NumberInput
                                            value={
                                                settingsForm.data
                                                    .reorder_level
                                            }
                                            onChange={(value) =>
                                                settingsForm.setData(
                                                    'reorder_level',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        label="Maximum Stock Level"
                                        error={
                                            settingsForm.errors
                                                .max_stock_level
                                        }
                                    >
                                        <NumberInput
                                            value={
                                                settingsForm.data
                                                    .max_stock_level
                                            }
                                            onChange={(value) =>
                                                settingsForm.setData(
                                                    'max_stock_level',
                                                    value,
                                                )
                                            }
                                            allowEmpty
                                        />
                                    </FormField>
                                </FormSection>
                            </div>

                            <DrawerActions
                                processing={
                                    settingsForm.processing
                                }
                                onCancel={closeDrawer}
                                submitLabel="Save Settings"
                            />
                        </form>
                    </Drawer>
                )}

            {drawerType === 'adjust' &&
                selectedStock && (
                    <Drawer
                        title="Adjust Stock"
                        description="Record incoming or outgoing stock and automatically update the inventory balance."
                        onClose={closeDrawer}
                        processing={adjustForm.processing}
                    >
                        <form
                            onSubmit={submitAdjustment}
                            className="flex min-h-full flex-col"
                        >
                            <div className="flex-1 space-y-6 p-6">
                                <StockContextCard
                                    stock={selectedStock}
                                />

                                <FormSection
                                    title="Stock Movement"
                                    description="Choose the reason and quantity of the stock change."
                                >
                                    <FormField
                                        label="Movement Type"
                                        error={
                                            adjustForm.errors
                                                .movement_type
                                        }
                                        required
                                    >
                                        <select
                                            value={
                                                adjustForm.data
                                                    .movement_type
                                            }
                                            onChange={(event) =>
                                                adjustForm.setData(
                                                    'movement_type',
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            {movementTypes.map(
                                                (movement) => (
                                                    <option
                                                        key={
                                                            movement.value
                                                        }
                                                        value={
                                                            movement.value
                                                        }
                                                    >
                                                        {movement.direction ===
                                                        'in'
                                                            ? 'Stock In — '
                                                            : 'Stock Out — '}
                                                        {
                                                            movement.label
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </FormField>

                                    <div
                                        className={[
                                            'flex items-center gap-3 rounded-xl border p-4',
                                            isIncomingMovement
                                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                                : 'border-red-500/30 bg-red-500/5',
                                        ].join(' ')}
                                    >
                                        <div
                                            className={[
                                                'flex size-10 items-center justify-center rounded-xl',
                                                isIncomingMovement
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-red-500/10 text-red-600',
                                            ].join(' ')}
                                        >
                                            {isIncomingMovement ? (
                                                <ArrowUpRight className="size-5" />
                                            ) : (
                                                <ArrowDownRight className="size-5" />
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                {isIncomingMovement
                                                    ? 'Quantity will be added'
                                                    : 'Quantity will be deducted'}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Current available
                                                stock:{' '}
                                                {formatQuantity(
                                                    selectedStock.quantity,
                                                )}{' '}
                                                {selectedStock.product
                                                    ?.unit ?? ''}
                                            </p>
                                        </div>
                                    </div>

                                    <FormField
                                        label="Quantity"
                                        error={
                                            adjustForm.errors
                                                .quantity
                                        }
                                        required
                                    >
                                        <NumberInput
                                            value={
                                                adjustForm.data
                                                    .quantity
                                            }
                                            onChange={(value) =>
                                                adjustForm.setData(
                                                    'quantity',
                                                    value,
                                                )
                                            }
                                            minimum="0.001"
                                        />
                                    </FormField>

                                    {isIncomingMovement && (
                                        <FormField
                                            label="Unit Cost"
                                            error={
                                                adjustForm.errors
                                                    .unit_cost
                                            }
                                        >
                                            <PriceInput
                                                value={
                                                    adjustForm.data
                                                        .unit_cost
                                                }
                                                onChange={(value) =>
                                                    adjustForm.setData(
                                                        'unit_cost',
                                                        value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                    )}
                                </FormSection>

                                <FormSection
                                    title="Movement Details"
                                    description="Optional reference and explanation for audit purposes."
                                >
                                    <FormField
                                        label="Reference Number"
                                        error={
                                            adjustForm.errors
                                                .reference_no
                                        }
                                    >
                                        <input
                                            type="text"
                                            value={
                                                adjustForm.data
                                                    .reference_no
                                            }
                                            onChange={(event) =>
                                                adjustForm.setData(
                                                    'reference_no',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Invoice, receipt, or document number"
                                            className={inputClass}
                                        />
                                    </FormField>

                                    <FormField
                                        label="Remarks"
                                        error={
                                            adjustForm.errors
                                                .remarks
                                        }
                                    >
                                        <textarea
                                            rows={4}
                                            value={
                                                adjustForm.data
                                                    .remarks
                                            }
                                            onChange={(event) =>
                                                adjustForm.setData(
                                                    'remarks',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Explain the reason for this adjustment..."
                                            className={textareaClass}
                                        />
                                    </FormField>
                                </FormSection>
                            </div>

                            <DrawerActions
                                processing={
                                    adjustForm.processing
                                }
                                onCancel={closeDrawer}
                                submitLabel="Apply Adjustment"
                            />
                        </form>
                    </Drawer>
                )}

            {drawerType === 'transfer' &&
                selectedStock && (
                    <Drawer
                        title="Transfer Stock"
                        description="Move available stock to another active warehouse."
                        onClose={closeDrawer}
                        processing={
                            transferForm.processing
                        }
                    >
                        <form
                            onSubmit={submitTransfer}
                            className="flex min-h-full flex-col"
                        >
                            <div className="flex-1 space-y-6 p-6">
                                <StockContextCard
                                    stock={selectedStock}
                                />

                                <div className="flex items-center justify-center gap-3 rounded-2xl border bg-muted/20 p-5">
                                    <div className="rounded-xl border bg-background px-4 py-3 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Source
                                        </p>

                                        <p className="mt-1 text-sm font-medium">
                                            {selectedStock.warehouse
                                                ?.name ??
                                                'Warehouse'}
                                        </p>
                                    </div>

                                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ArrowRightLeft className="size-5" />
                                    </div>

                                    <div className="rounded-xl border bg-background px-4 py-3 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Destination
                                        </p>

                                        <p className="mt-1 text-sm font-medium">
                                            {destinationWarehouses.find(
                                                (warehouse) =>
                                                    String(
                                                        warehouse.id,
                                                    ) ===
                                                    transferForm
                                                        .data
                                                        .destination_warehouse_id,
                                            )?.name ??
                                                'Select warehouse'}
                                        </p>
                                    </div>
                                </div>

                                <FormSection
                                    title="Transfer Information"
                                    description="Choose the destination and quantity to move."
                                >
                                    <FormField
                                        label="Destination Warehouse"
                                        error={
                                            transferForm.errors
                                                .destination_warehouse_id
                                        }
                                        required
                                    >
                                        <select
                                            value={
                                                transferForm.data
                                                    .destination_warehouse_id
                                            }
                                            onChange={(event) =>
                                                transferForm.setData(
                                                    'destination_warehouse_id',
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Select destination
                                            </option>

                                            {destinationWarehouses.map(
                                                (warehouse) => (
                                                    <option
                                                        key={
                                                            warehouse.id
                                                        }
                                                        value={
                                                            warehouse.id
                                                        }
                                                    >
                                                        {warehouse.name}
                                                        {warehouse.branch
                                                            ? ` — ${warehouse.branch.name}`
                                                            : ''}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </FormField>

                                    <FormField
                                        label="Transfer Quantity"
                                        error={
                                            transferForm.errors
                                                .quantity
                                        }
                                        required
                                    >
                                        <NumberInput
                                            value={
                                                transferForm.data
                                                    .quantity
                                            }
                                            onChange={(value) =>
                                                transferForm.setData(
                                                    'quantity',
                                                    value,
                                                )
                                            }
                                            minimum="0.001"
                                            maximum={String(
                                                selectedStock.quantity,
                                            )}
                                        />

                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Maximum transferable:{' '}
                                            {formatQuantity(
                                                selectedStock.quantity,
                                            )}{' '}
                                            {selectedStock.product
                                                ?.unit ?? ''}
                                        </p>
                                    </FormField>
                                </FormSection>

                                <FormField
                                    label="Remarks"
                                    error={
                                        transferForm.errors
                                            .remarks
                                    }
                                >
                                    <textarea
                                        rows={4}
                                        value={
                                            transferForm.data
                                                .remarks
                                        }
                                        onChange={(event) =>
                                            transferForm.setData(
                                                'remarks',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Reason or additional transfer details..."
                                        className={textareaClass}
                                    />
                                </FormField>
                            </div>

                            <DrawerActions
                                processing={
                                    transferForm.processing
                                }
                                onCancel={closeDrawer}
                                submitLabel="Transfer Stock"
                            />
                        </form>
                    </Drawer>
                )}
        </AppLayout>
    );
}

function MetricCard({
    title,
    value,
    description,
    icon,
    tone = 'default',
}: {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
    tone?: 'default' | 'warning' | 'danger';
}) {
    const iconClass =
        tone === 'warning'
            ? 'bg-amber-500/10 text-amber-600'
            : tone === 'danger'
              ? 'bg-red-500/10 text-red-600'
              : 'bg-primary/10 text-primary';

    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function StockStatusBadge({
    label,
    tone,
}: {
    label: string;
    tone: 'healthy' | 'warning' | 'danger';
}) {
    const className =
        tone === 'danger'
            ? 'bg-red-500/10 text-red-600'
            : tone === 'warning'
              ? 'bg-amber-500/10 text-amber-600'
              : 'bg-emerald-500/10 text-emerald-600';

    return (
        <span
            className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
        >
            {label}
        </span>
    );
}

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border bg-card p-5">
            <div className="mb-5">
                <h3 className="text-sm font-semibold">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </section>
    );
}

function FormField({
    label,
    error,
    required = false,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-destructive">
                        *
                    </span>
                )}
            </span>

            {children}

            {error && (
                <span className="mt-1.5 block text-xs text-destructive">
                    {error}
                </span>
            )}
        </label>
    );
}

function StockContextCard({
    stock,
}: {
    stock: WarehouseStock;
}) {
    return (
        <div className="rounded-2xl border bg-muted/20 p-5">
            <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Package2 className="size-6" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                        {stock.product?.name ??
                            'Unknown product'}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {stock.warehouse?.name ??
                            'Unknown warehouse'}
                        {stock.warehouse?.branch
                            ? ` • ${stock.warehouse.branch.name}`
                            : ''}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border bg-background px-3 py-2">
                            <p className="text-xs text-muted-foreground">
                                Current Quantity
                            </p>

                            <p className="mt-1 font-semibold">
                                {formatQuantity(
                                    stock.quantity,
                                )}{' '}
                                {stock.product?.unit ?? ''}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-background px-3 py-2">
                            <p className="text-xs text-muted-foreground">
                                Average Cost
                            </p>

                            <p className="mt-1 font-semibold">
                                {formatCurrency(
                                    stock.average_cost,
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Drawer({
    title,
    description,
    processing,
    onClose,
    children,
}: {
    title: string;
    description: string;
    processing: boolean;
    onClose: () => void;
    children: ReactNode;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <aside className="flex h-full w-full max-w-xl flex-col border-l bg-background shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition hover:bg-muted disabled:opacity-50"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {children}
                </div>
            </aside>
        </div>
    );
}

function DrawerActions({
    processing,
    onCancel,
    submitLabel,
}: {
    processing: boolean;
    onCancel: () => void;
    submitLabel: string;
}) {
    return (
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background px-6 py-4">
            <button
                type="button"
                onClick={onCancel}
                disabled={processing}
                className="h-11 rounded-xl border px-5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
                Cancel
            </button>

            <button
                type="submit"
                disabled={processing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {processing && (
                    <LoaderCircle className="size-4 animate-spin" />
                )}

                {submitLabel}
            </button>
        </div>
    );
}

function NumberInput({
    value,
    onChange,
    minimum = '0',
    maximum,
    allowEmpty = false,
}: {
    value: string;
    onChange: (value: string) => void;
    minimum?: string;
    maximum?: string;
    allowEmpty?: boolean;
}) {
    return (
        <input
            type="number"
            min={minimum}
            max={maximum}
            step="0.001"
            value={value}
            onChange={(event) => {
                const nextValue = event.target.value;

                if (
                    nextValue === '' &&
                    allowEmpty
                ) {
                    onChange('');

                    return;
                }

                onChange(nextValue);
            }}
            placeholder={
                allowEmpty ? 'Optional' : '0'
            }
            className={inputClass}
        />
    );
}

function PriceInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                ₱
            </span>

            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder="0.00"
                className="h-11 w-full rounded-xl border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
        </div>
    );
}

function StockPagination({
    stocks,
}: {
    stocks: PaginatedStocks;
}) {
    if (stocks.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {stocks.from ?? 0} to{' '}
                {stocks.to ?? 0} of {stocks.total}{' '}
                stock records
            </p>

            <div className="flex flex-wrap gap-1.5">
                {stocks.links.map((link, index) => (
                    <button
                        key={`${link.label}-${index}`}
                        type="button"
                        disabled={!link.url}
                        onClick={() => {
                            if (!link.url) {
                                return;
                            }

                            router.get(
                                link.url,
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                        className={[
                            'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-muted',
                            !link.url
                                ? 'cursor-not-allowed opacity-40'
                                : '',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function getStockStatus(
    stock: WarehouseStock,
): {
    label: string;
    tone: 'healthy' | 'warning' | 'danger';
    progressClass: string;
} {
    const quantity = Number(stock.quantity ?? 0);
    const reorderLevel = Number(
        stock.reorder_level ?? 0,
    );

    if (quantity <= 0) {
        return {
            label: 'Out of stock',
            tone: 'danger',
            progressClass: 'bg-red-500',
        };
    }

    if (quantity <= reorderLevel) {
        return {
            label: 'Low stock',
            tone: 'warning',
            progressClass: 'bg-amber-500',
        };
    }

    return {
        label: 'In stock',
        tone: 'healthy',
        progressClass: 'bg-emerald-500',
    };
}

function getStockPercentage(
    stock: WarehouseStock,
): number {
    const quantity = Number(stock.quantity ?? 0);
    const maximum = Number(
        stock.max_stock_level ?? 0,
    );
    const reorder = Number(
        stock.reorder_level ?? 0,
    );

    if (maximum > 0) {
        return Math.min(
            100,
            Math.max(0, (quantity / maximum) * 100),
        );
    }

    if (quantity <= 0) {
        return 0;
    }

    if (reorder > 0 && quantity <= reorder) {
        return 35;
    }

    return 75;
}

function formatCurrency(
    value: string | number | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(
        Number.isFinite(amount) ? amount : 0,
    );
}

function formatQuantity(
    value: string | number | null,
): string {
    const quantity = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(
        Number.isFinite(quantity) ? quantity : 0,
    );
}

function formatNumber(
    value: string | number | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat(
        'en-PH',
    ).format(
        Number.isFinite(amount) ? amount : 0,
    );
}

function formatDate(
    value: string | null,
): string {
    if (!value) {
        return 'No movement';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function formatTime(
    value: string | null,
): string {
    if (!value) {
        return 'Waiting for activity';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}