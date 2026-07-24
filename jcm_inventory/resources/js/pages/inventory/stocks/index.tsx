import { ActionGroup } from '@/components/shared/action-group';
import { AppDrawer } from '@/components/shared/app-drawer';
import { AppDrawerActions } from '@/components/shared/app-drawer-actions';
import { AppPagination } from '@/components/shared/app-pagination';
import { CalloutCard } from '@/components/shared/callout-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ContextCard } from '@/components/shared/context-card';
import {
    DataTable,
    type DataTableColumn,
} from '@/components/shared/data-table';
import { EntityAvatar } from '@/components/shared/entity-avatar';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { FormField } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
import { IconButton } from '@/components/shared/icon-button';
import { MoneyInput } from '@/components/shared/money-input';
import { NumberInput } from '@/components/shared/number-input';
import { PageContainer } from '@/components/shared/page-container';
import { SearchInput } from '@/components/shared/search-input';
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
import {
    Head,
    Link,
    router,
    useForm,
} from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRightLeft,
    ArrowUpRight,
    Boxes,
    Building2,
    CheckCircle2,
    CircleDollarSign,
    ClipboardPenLine,
    Layers3,
    Package2,
    Plus,
    RefreshCw,
    Settings2,
    Trash2,
    TriangleAlert,
    Warehouse as WarehouseIcon,
    type LucideIcon,
} from 'lucide-react';
import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

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

type StockMetricTone =
    | 'primary'
    | 'amber'
    | 'red';

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

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

const ALL_VALUE = 'all';
const NONE_VALUE = 'none';

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
        warehouse_id:
            getDefaultWarehouseId(warehouses),
        product_id: '',
        opening_quantity: '0',
        reorder_level: '5',
        max_stock_level: '',
        unit_cost: '',
        remarks: '',
    };
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

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

    const [deleteTarget, setDeleteTarget] =
        useState<WarehouseStock | null>(null);

    const [deleteProcessing, setDeleteProcessing] =
        useState(false);

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

    const [warehouseId, setWarehouseId] =
        useState(
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

    const adjustForm =
        useForm<AdjustStockForm>({
            ...emptyAdjustForm,
        });

    const transferForm =
        useForm<TransferStockForm>({
            ...emptyTransferForm,
        });

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');

        setBranchId(
            filters.branch_id
                ? String(filters.branch_id)
                : '',
        );

        setWarehouseId(
            filters.warehouse_id
                ? String(filters.warehouse_id)
                : '',
        );

        setCategoryId(
            filters.category_id
                ? String(filters.category_id)
                : '',
        );
    }, [
        filters.search,
        filters.status,
        filters.branch_id,
        filters.warehouse_id,
        filters.category_id,
    ]);

    const filteredWarehouses = useMemo(() => {
        if (!branchId) {
            return warehouses;
        }

        return warehouses.filter(
            (warehouse) =>
                String(warehouse.branch_id) ===
                branchId,
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

    const requirementsComplete =
        warehouses.length > 0 &&
        products.length > 0;

    /*
    |--------------------------------------------------------------------------
    | Drawer actions
    |--------------------------------------------------------------------------
    */

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
                    ? String(
                          stock.max_stock_level,
                      )
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

        const firstDestination =
            warehouses.find(
                (warehouse) =>
                    warehouse.id !==
                    stock.warehouse_id,
            );

        transferForm.setData({
            destination_warehouse_id:
                firstDestination
                    ? String(
                          firstDestination.id,
                      )
                    : '',
            quantity: '',
            remarks: '',
        });

        setDrawerType('transfer');
    }

    /*
    |--------------------------------------------------------------------------
    | Submit actions
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    function applyFilters(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        router.get(
            '/inventory/stocks',
            {
                search:
                    search.trim() || undefined,
                status: status || undefined,
                branch_id:
                    branchId || undefined,
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
            String(
                currentWarehouse.branch_id,
            ) !== value
        ) {
            setWarehouseId('');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    function requestDelete(
        stock: WarehouseStock,
    ): void {
        setDeleteTarget(stock);
    }

    function deleteStock(): void {
        if (
            !deleteTarget ||
            deleteProcessing
        ) {
            return;
        }

        router.delete(
            `/inventory/stocks/${deleteTarget.id}`,
            {
                preserveScroll: true,
                onStart: () =>
                    setDeleteProcessing(true),
                onSuccess: () =>
                    setDeleteTarget(null),
                onFinish: () =>
                    setDeleteProcessing(false),
            },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Table
    |--------------------------------------------------------------------------
    */

    const stockColumns: DataTableColumn<WarehouseStock>[] =
        [
            {
                key: 'product',
                header: 'Product',
                className: 'min-w-[250px]',
                cell: (stock) => (
                    <EntityInfo
                        avatar={
                            <EntityAvatar
                                icon={Package2}
                                className="border-primary/15 bg-primary/10 text-primary group-hover:border-primary/25 group-hover:bg-primary/15"
                            />
                        }
                        title={
                            stock.product?.name ??
                            'Unknown product'
                        }
                        subtitle={
                            <>
                                SKU:{' '}
                                <span className="font-semibold text-foreground/70">
                                    {stock.product
                                        ?.sku ?? '—'}
                                </span>
                            </>
                        }
                        description={
                            stock.product?.category
                                ?.name ??
                            'Uncategorized'
                        }
                    />
                ),
            },
            {
                key: 'location',
                header: 'Location',
                className: 'min-w-[200px]',
                cell: (stock) => (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex size-7 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                                <WarehouseIcon className="size-3.5" />
                            </span>

                            <span className="max-w-36 truncate text-[12px] font-semibold">
                                {stock.warehouse
                                    ?.name ??
                                    'Unknown warehouse'}
                            </span>

                            {stock.warehouse
                                ?.is_main && (
                                <Badge
                                    variant="outline"
                                    className="h-5 gap-1 rounded-full border-amber-500/20 bg-amber-500/10 px-2 text-[9px] font-semibold text-amber-300"
                                >
                                    MAIN
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 pl-1 text-[10px] text-muted-foreground">
                            <Building2 className="size-3" />

                            {stock.warehouse?.branch
                                ?.name ??
                                'No branch'}
                        </div>
                    </div>
                ),
            },
            {
                key: 'availability',
                header: 'Availability',
                className: 'min-w-[190px]',
                cell: (stock) => {
                    const statusInfo =
                        getStockStatus(stock);

                    const percentage =
                        getStockPercentage(stock);

                    return (
                        <div className="min-w-[170px]">
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-lg font-semibold leading-none tabular-nums">
                                        {formatQuantity(
                                            stock.quantity,
                                        )}
                                    </p>

                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        {stock.product
                                            ?.unit ??
                                            'unit'}
                                    </p>
                                </div>

                                <StatusBadge
                                    label={
                                        statusInfo.label
                                    }
                                    variant={
                                        statusInfo.variant
                                    }
                                />
                            </div>

                            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full ${statusInfo.progressClass}`}
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                },
            },
            {
                key: 'levels',
                header: 'Stock Levels',
                className: 'min-w-[150px]',
                cell: (stock) => (
                    <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between gap-5">
                            <span className="text-muted-foreground">
                                Reorder
                            </span>

                            <span className="font-semibold tabular-nums">
                                {formatQuantity(
                                    stock.reorder_level,
                                )}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-5">
                            <span className="text-muted-foreground">
                                Maximum
                            </span>

                            <span className="font-semibold tabular-nums">
                                {stock.max_stock_level !==
                                null
                                    ? formatQuantity(
                                          stock.max_stock_level,
                                      )
                                    : 'Not set'}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: 'valuation',
                header: 'Valuation',
                className: 'min-w-[165px]',
                cell: (stock) => {
                    const quantity = Number(
                        stock.quantity ?? 0,
                    );

                    const averageCost = Number(
                        stock.average_cost ?? 0,
                    );

                    return (
                        <div className="space-y-1">
                            <p className="text-[12px] font-semibold tabular-nums text-primary">
                                {formatCurrency(
                                    quantity *
                                        averageCost,
                                )}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                                {formatCurrency(
                                    averageCost,
                                )}{' '}
                                average cost
                            </p>
                        </div>
                    );
                },
            },
            {
                key: 'movement',
                header: 'Last Movement',
                className: 'min-w-[145px]',
                cell: (stock) => (
                    <div>
                        <p className="text-[11px] font-medium">
                            {formatDate(
                                stock.last_movement_at,
                            )}
                        </p>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                            {formatTime(
                                stock.last_movement_at,
                            )}
                        </p>
                    </div>
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                headerClassName:
                    'text-right',
                className: 'text-right',
                cell: (stock) => {
                    const quantity = Number(
                        stock.quantity ?? 0,
                    );

                    return (
                        <ActionGroup>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                    openAdjustDrawer(
                                        stock,
                                    )
                                }
                                className="h-8 rounded-lg px-3 text-[11px]"
                            >
                                <ClipboardPenLine className="size-3.5" />
                                Adjust
                            </Button>

                            <IconButton
                                label="Transfer stock"
                                disabled={
                                    warehouses.length <=
                                        1 ||
                                    quantity <= 0
                                }
                                onClick={() =>
                                    openTransferDrawer(
                                        stock,
                                    )
                                }
                                className="text-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <ArrowRightLeft className="size-3.5" />
                            </IconButton>

                            <IconButton
                                label="Stock settings"
                                onClick={() =>
                                    openSettingsDrawer(
                                        stock,
                                    )
                                }
                                className="text-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <Settings2 className="size-3.5" />
                            </IconButton>

                            <IconButton
                                label="Delete stock record"
                                onClick={() =>
                                    requestDelete(
                                        stock,
                                    )
                                }
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                            >
                                <Trash2 className="size-3.5" />
                            </IconButton>
                        </ActionGroup>
                    );
                },
            },
        ];

    /*
    |--------------------------------------------------------------------------
    | Derived overview values
    |--------------------------------------------------------------------------
    */

    const attentionRecords = Math.min(
        summary.records,
        summary.low_stock +
            summary.out_of_stock,
    );

    const healthyRecords = Math.max(
        0,
        summary.records - attentionRecords,
    );

    const healthyPercentage =
        summary.records > 0
            ? Math.round(
                  (healthyRecords /
                      summary.records) *
                      100,
              )
            : 0;

    const lowStockPercentage =
        summary.records > 0
            ? Math.round(
                  (summary.low_stock /
                      summary.records) *
                      100,
              )
            : 0;

    const outOfStockPercentage =
        summary.records > 0
            ? Math.max(
                  0,
                  Math.min(
                      100,
                      100 -
                          healthyPercentage -
                          lowStockPercentage,
                  ),
              )
            : 0;

    const hasActiveFilters = Boolean(
        search ||
            status ||
            branchId ||
            warehouseId ||
            categoryId,
    );

    const inventoryHealthLabel =
        summary.records === 0
            ? 'No stock positions'
            : summary.out_of_stock > 0
              ? `${summary.out_of_stock} out of stock`
              : summary.low_stock > 0
                ? `${summary.low_stock} low stock`
                : 'Inventory healthy';

    const inventoryHealthClass =
        summary.records === 0
            ? 'border-slate-500/20 bg-slate-500/10 text-slate-300'
            : summary.out_of_stock > 0
              ? 'border-red-500/20 bg-red-500/10 text-red-300'
              : summary.low_stock > 0
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Management" />

            <PageContainer className="min-w-0 max-w-full gap-4 overflow-x-hidden md:gap-5">
                {!requirementsComplete && (
                    <CalloutCard
                        tone="warning"
                        icon={TriangleAlert}
                        title="Complete your inventory setup"
                        description="An active warehouse and an active stock-tracked product are required before creating an inventory position."
                        actions={
                            <>
                                {warehouses.length === 0 && (
                                    <Button
                                        asChild
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Link href="/warehouses">
                                            Add Warehouse
                                        </Link>
                                    </Button>
                                )}

                                {products.length === 0 && (
                                    <Button
                                        asChild
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Link href="/inventory/products">
                                            Add Product
                                        </Link>
                                    </Button>
                                )}
                            </>
                        }
                    />
                )}

                {/* Inventory control board */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.075] via-card/70 to-card/40">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <Boxes className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-foreground">
                                    Inventory Control Board
                                </p>

                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    Live stock value, quantity, replenishment exposure, and warehouse position health.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'h-7 w-fit gap-1.5 rounded-full px-2.5 text-[9px] font-semibold',
                                    inventoryHealthClass,
                                )}
                            >
                                {summary.records === 0 ? (
                                    <Layers3 className="size-3" />
                                ) : summary.low_stock === 0 &&
                                  summary.out_of_stock === 0 ? (
                                    <CheckCircle2 className="size-3" />
                                ) : (
                                    <TriangleAlert className="size-3" />
                                )}

                                {inventoryHealthLabel}
                            </Badge>

                            <Button
                                type="button"
                                disabled={!requirementsComplete}
                                onClick={openCreateDrawer}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Set Opening Stock
                            </Button>
                        </div>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
                        <div className="relative overflow-hidden border-b border-border/60 p-4 xl:border-b-0 xl:border-r md:p-5">
                            <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-primary/10 blur-3xl" />
                            <CircleDollarSign className="pointer-events-none absolute -bottom-10 -right-6 size-36 text-primary opacity-[0.025]" />

                            <div className="relative">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-primary/80">
                                            Current Inventory Valuation
                                        </p>

                                        <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.045em] tabular-nums text-primary sm:text-[34px]">
                                            {formatCurrency(
                                                summary.inventory_value,
                                            )}
                                        </p>

                                        <p className="mt-2 max-w-xl text-[9px] leading-4 text-muted-foreground">
                                            Based on available quantity and the current weighted average acquisition cost of every stock position.
                                        </p>
                                    </div>

                                    <div className="grid min-w-[210px] grid-cols-2 gap-2">
                                        <div className="rounded-xl border border-primary/15 bg-primary/[0.045] px-3 py-2.5">
                                            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-primary/80">
                                                Quantity
                                            </p>
                                            <p className="mt-1.5 text-[15px] font-semibold tabular-nums">
                                                {formatQuantity(
                                                    summary.total_quantity,
                                                )}
                                            </p>
                                            <p className="mt-1 text-[8px] text-muted-foreground">
                                                Available units
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-primary/15 bg-primary/[0.045] px-3 py-2.5">
                                            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-primary/80">
                                                Positions
                                            </p>
                                            <p className="mt-1.5 text-[15px] font-semibold tabular-nums">
                                                {formatNumber(
                                                    summary.records,
                                                )}
                                            </p>
                                            <p className="mt-1 text-[8px] text-muted-foreground">
                                                Product-location pairs
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-xl border border-border/60 bg-background/35 p-3.5">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                                Stock Health Distribution
                                            </p>
                                            <p className="mt-1 text-[9px] text-muted-foreground">
                                                Healthy positions versus replenishment and availability risks.
                                            </p>
                                        </div>

                                        <span className="text-sm font-semibold tabular-nums text-emerald-400">
                                            {healthyPercentage}% healthy
                                        </span>
                                    </div>

                                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-emerald-400 transition-all duration-500"
                                            style={{
                                                width: `${healthyPercentage}%`,
                                            }}
                                        />
                                        <div
                                            className="h-full bg-amber-400 transition-all duration-500"
                                            style={{
                                                width: `${lowStockPercentage}%`,
                                            }}
                                        />
                                        <div
                                            className="h-full bg-red-400 transition-all duration-500"
                                            style={{
                                                width: `${outOfStockPercentage}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px]">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                            <span className="size-1.5 rounded-full bg-emerald-400" />
                                            {healthyRecords} healthy
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-amber-400">
                                            <span className="size-1.5 rounded-full bg-amber-400" />
                                            {summary.low_stock} low stock
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 text-red-400">
                                            <span className="size-1.5 rounded-full bg-red-400" />
                                            {summary.out_of_stock} unavailable
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-2">
                            <StockControlMetric
                                title="Inventory Positions"
                                value={formatNumber(
                                    summary.records,
                                )}
                                description="Product and warehouse pairs"
                                icon={Layers3}
                                tone="primary"
                                className="border-b border-r border-border/60"
                            />

                            <StockControlMetric
                                title="Available Quantity"
                                value={formatQuantity(
                                    summary.total_quantity,
                                )}
                                description="Combined units on hand"
                                icon={Boxes}
                                tone="primary"
                                className="border-b border-border/60"
                            />

                            <StockControlMetric
                                title="Low Stock"
                                value={formatNumber(
                                    summary.low_stock,
                                )}
                                description="Below replenishment threshold"
                                icon={TriangleAlert}
                                tone="amber"
                                className="border-r border-border/60"
                            />

                            <StockControlMetric
                                title="Out of Stock"
                                value={formatNumber(
                                    summary.out_of_stock,
                                )}
                                description="No quantity available"
                                icon={ArrowDownRight}
                                tone="red"
                            />
                        </div>
                    </div>
                </section>

                {/* Inventory position directory */}

                <SectionCard
                    title="Inventory Positions"
                    description="Search product-location balances, thresholds, valuation, movement activity, and stock condition."
                    className="min-w-0 max-w-full"
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-primary/15 bg-primary/[0.06] px-2.5 text-[10px] font-medium text-primary/80"
                            >
                                <Layers3 className="mr-1 size-3" />
                                {stocks.total} position
                                {stocks.total === 1 ? '' : 's'}
                            </Badge>

                            <Button
                                type="button"
                                disabled={!requirementsComplete}
                                onClick={openCreateDrawer}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Set Opening Stock
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(240px,1fr)_repeat(4,minmax(130px,0.62fr))]"
                        actions={
                            <>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="h-10 px-4 text-sm"
                                >
                                    Apply Filters
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilters}
                                    disabled={!hasActiveFilters}
                                    className="h-10 px-3 text-sm"
                                >
                                    <RefreshCw className="size-3.5" />
                                    Reset
                                </Button>
                            </>
                        }
                    >
                        <SearchInput
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            onClear={() => setSearch('')}
                            placeholder="Search product, SKU, barcode, warehouse, or branch..."
                            className="sm:col-span-2 xl:col-span-3 2xl:col-span-1"
                        />

                        <Select
                            value={branchId || ALL_VALUE}
                            onValueChange={(value) =>
                                handleBranchChange(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All branches" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All branches
                                </SelectItem>

                                {branches.map((branch) => (
                                    <SelectItem
                                        key={branch.id}
                                        value={String(
                                            branch.id,
                                        )}
                                    >
                                        {branch.name}
                                        {branch.is_main
                                            ? ' — Main'
                                            : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={warehouseId || ALL_VALUE}
                            onValueChange={(value) =>
                                setWarehouseId(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All warehouses" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All warehouses
                                </SelectItem>

                                {filteredWarehouses.map(
                                    (warehouse) => (
                                        <SelectItem
                                            key={warehouse.id}
                                            value={String(
                                                warehouse.id,
                                            )}
                                        >
                                            {warehouse.name}
                                            {warehouse.is_main
                                                ? ' — Main'
                                                : ''}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={categoryId || ALL_VALUE}
                            onValueChange={(value) =>
                                setCategoryId(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All categories
                                </SelectItem>

                                {categories.map(
                                    (category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(
                                                category.id,
                                            )}
                                        >
                                            {category.parent_id
                                                ? '— '
                                                : ''}
                                            {category.name}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={status || ALL_VALUE}
                            onValueChange={(value) =>
                                setStatus(
                                    value === ALL_VALUE
                                        ? ''
                                        : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All conditions" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>
                                    All conditions
                                </SelectItem>

                                <SelectItem value="in_stock">
                                    In stock
                                </SelectItem>

                                <SelectItem value="low_stock">
                                    Low stock
                                </SelectItem>

                                <SelectItem value="out_of_stock">
                                    Out of stock
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <DataTable
                        data={stocks.data}
                        columns={stockColumns}
                        getRowKey={(stock) => stock.id}
                        emptyIcon={Boxes}
                        emptyTitle="No inventory positions found"
                        emptyDescription="No product-location balances matched the current filters. Reset the filters or create an opening stock position."
                        emptyAction={
                            <div className="flex flex-wrap justify-center gap-2">
                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetFilters}
                                    >
                                        <RefreshCw className="size-4" />
                                        Reset Filters
                                    </Button>
                                )}

                                {requirementsComplete && (
                                    <Button
                                        type="button"
                                        onClick={openCreateDrawer}
                                    >
                                        <Plus className="size-4" />
                                        Set Opening Stock
                                    </Button>
                                )}
                            </div>
                        }
                        minWidth="1180px"
                    />

                    <AppPagination
                        pagination={stocks}
                        itemLabel="inventory positions"
                    />
                </SectionCard>
            </PageContainer>

            {/* Create stock */}

            <AppDrawer
                open={drawerType === 'create'}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDrawer();
                    }
                }}
                title="Set Opening Stock"
                description="Create the first inventory position for a tracked product at a warehouse."
                processing={createForm.processing}
            >
                <form
                    onSubmit={submitCreateStock}
                    className="flex min-h-full flex-col"
                >
                    <div className="flex-1 space-y-4 p-5">
                        <FormSection
                            title="Product Location"
                            description="Choose where the product stock will be stored."
                            icon={<WarehouseIcon />}
                        >
                            <FormField
                                id="warehouse_id"
                                label="Warehouse"
                                error={
                                    createForm.errors
                                        .warehouse_id
                                }
                                required
                            >
                                <Select
                                    value={
                                        createForm.data
                                            .warehouse_id ||
                                        NONE_VALUE
                                    }
                                    disabled={
                                        createForm.processing
                                    }
                                    onValueChange={(
                                        value,
                                    ) =>
                                        createForm.setData(
                                            'warehouse_id',
                                            value ===
                                                NONE_VALUE
                                                ? ''
                                                : value,
                                        )
                                    }
                                >
                                    <SelectTrigger id="warehouse_id">
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem
                                            value={
                                                NONE_VALUE
                                            }
                                        >
                                            Select warehouse
                                        </SelectItem>

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
                                                    {
                                                        warehouse.name
                                                    }
                                                    {warehouse.branch
                                                        ? ` — ${warehouse.branch.name}`
                                                        : ''}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField
                                id="product_id"
                                label="Product"
                                error={
                                    createForm.errors
                                        .product_id
                                }
                                required
                            >
                                <Select
                                    value={
                                        createForm.data
                                            .product_id ||
                                        NONE_VALUE
                                    }
                                    disabled={
                                        createForm.processing
                                    }
                                    onValueChange={(
                                        selectedValue,
                                    ) => {
                                        const value =
                                            selectedValue ===
                                            NONE_VALUE
                                                ? ''
                                                : selectedValue;

                                        const product =
                                            products.find(
                                                (
                                                    item,
                                                ) =>
                                                    String(
                                                        item.id,
                                                    ) ===
                                                    value,
                                            );

                                        createForm.setData(
                                            {
                                                ...createForm.data,
                                                product_id:
                                                    value,
                                                unit_cost:
                                                    product
                                                        ? String(
                                                              product.cost_price,
                                                          )
                                                        : '',
                                            },
                                        );
                                    }}
                                >
                                    <SelectTrigger id="product_id">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem
                                            value={
                                                NONE_VALUE
                                            }
                                        >
                                            Select product
                                        </SelectItem>

                                        {products.map(
                                            (product) => (
                                                <SelectItem
                                                    key={
                                                        product.id
                                                    }
                                                    value={String(
                                                        product.id,
                                                    )}
                                                >
                                                    {
                                                        product.name
                                                    }
                                                    {product.sku
                                                        ? ` — ${product.sku}`
                                                        : ''}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection
                            title="Opening Inventory"
                            description="Set the beginning quantity and valuation."
                            icon={<Boxes />}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id="opening_quantity"
                                    label="Opening Quantity"
                                    error={
                                        createForm
                                            .errors
                                            .opening_quantity
                                    }
                                    required
                                >
                                    <NumberInput
                                        id="opening_quantity"
                                        value={
                                            createForm
                                                .data
                                                .opening_quantity
                                        }
                                        disabled={
                                            createForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            createForm.setData(
                                                'opening_quantity',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>

                                <FormField
                                    id="unit_cost"
                                    label="Unit Cost"
                                    error={
                                        createForm
                                            .errors
                                            .unit_cost
                                    }
                                >
                                    <MoneyInput
                                        id="unit_cost"
                                        value={
                                            createForm
                                                .data
                                                .unit_cost
                                        }
                                        disabled={
                                            createForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
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
                            description="Use these values to identify low-stock items."
                            icon={
                                <TriangleAlert />
                            }
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id="reorder_level"
                                    label="Reorder Level"
                                    error={
                                        createForm
                                            .errors
                                            .reorder_level
                                    }
                                    required
                                >
                                    <NumberInput
                                        id="reorder_level"
                                        value={
                                            createForm
                                                .data
                                                .reorder_level
                                        }
                                        disabled={
                                            createForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            createForm.setData(
                                                'reorder_level',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>

                                <FormField
                                    id="max_stock_level"
                                    label="Maximum Level"
                                    description="Optional"
                                    error={
                                        createForm
                                            .errors
                                            .max_stock_level
                                    }
                                >
                                    <NumberInput
                                        id="max_stock_level"
                                        value={
                                            createForm
                                                .data
                                                .max_stock_level
                                        }
                                        disabled={
                                            createForm.processing
                                        }
                                        placeholder="Optional"
                                        onValueChange={(
                                            value,
                                        ) =>
                                            createForm.setData(
                                                'max_stock_level',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>
                            </div>
                        </FormSection>

                        <FormField
                            id="create_remarks"
                            label="Remarks"
                            error={
                                createForm.errors
                                    .remarks
                            }
                        >
                            <Textarea
                                id="create_remarks"
                                rows={4}
                                value={
                                    createForm.data
                                        .remarks
                                }
                                disabled={
                                    createForm.processing
                                }
                                onChange={(event) =>
                                    createForm.setData(
                                        'remarks',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Optional notes about the opening stock..."
                                className="resize-none"
                            />
                        </FormField>
                    </div>

                    <AppDrawerActions
                        processing={
                            createForm.processing
                        }
                        onCancel={closeDrawer}
                        submitLabel="Create Stock Position"
                        processingLabel="Creating Position..."
                    />
                </form>
            </AppDrawer>

            {/* Settings */}

            <AppDrawer
                open={
                    drawerType === 'settings' &&
                    selectedStock !== null
                }
                onOpenChange={(open) => {
                    if (!open) {
                        closeDrawer();
                    }
                }}
                title="Stock Settings"
                description={`Update stock thresholds for ${selectedStock?.product?.name ?? 'this product'}.`}
                processing={
                    settingsForm.processing
                }
            >
                {selectedStock && (
                    <form
                        onSubmit={submitSettings}
                        className="flex min-h-full flex-col"
                    >
                        <div className="flex-1 space-y-4 p-5">
                            <ContextCard
                                icon={<Package2 />}
                                title={
                                    selectedStock
                                        .product
                                        ?.name ??
                                    'Unknown product'
                                }
                                subtitle={
                                    <>
                                        {selectedStock
                                            .warehouse
                                            ?.name ??
                                            'Unknown warehouse'}
                                        {selectedStock
                                            .warehouse
                                            ?.branch
                                            ? ` • ${selectedStock.warehouse.branch.name}`
                                            : ''}
                                    </>
                                }
                                metrics={[
                                    {
                                        label:
                                            'Current Quantity',
                                        value: `${formatQuantity(
                                            selectedStock.quantity,
                                        )} ${
                                            selectedStock
                                                .product
                                                ?.unit ??
                                            ''
                                        }`,
                                    },
                                    {
                                        label:
                                            'Average Cost',
                                        value: formatCurrency(
                                            selectedStock.average_cost,
                                        ),
                                    },
                                ]}
                            />

                            <FormSection
                                title="Threshold Settings"
                                description="Set when the product should be considered low stock."
                                icon={
                                    <Settings2 />
                                }
                            >
                                <FormField
                                    id="settings_reorder_level"
                                    label="Reorder Level"
                                    error={
                                        settingsForm
                                            .errors
                                            .reorder_level
                                    }
                                    required
                                >
                                    <NumberInput
                                        id="settings_reorder_level"
                                        value={
                                            settingsForm
                                                .data
                                                .reorder_level
                                        }
                                        disabled={
                                            settingsForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            settingsForm.setData(
                                                'reorder_level',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>

                                <FormField
                                    id="settings_max_stock_level"
                                    label="Maximum Stock Level"
                                    description="Optional"
                                    error={
                                        settingsForm
                                            .errors
                                            .max_stock_level
                                    }
                                >
                                    <NumberInput
                                        id="settings_max_stock_level"
                                        value={
                                            settingsForm
                                                .data
                                                .max_stock_level
                                        }
                                        disabled={
                                            settingsForm.processing
                                        }
                                        placeholder="Optional"
                                        onValueChange={(
                                            value,
                                        ) =>
                                            settingsForm.setData(
                                                'max_stock_level',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>
                            </FormSection>
                        </div>

                        <AppDrawerActions
                            processing={
                                settingsForm.processing
                            }
                            onCancel={closeDrawer}
                            submitLabel="Save Settings"
                            processingLabel="Saving Settings..."
                        />
                    </form>
                )}
            </AppDrawer>

            {/* Adjustment */}

            <AppDrawer
                open={
                    drawerType === 'adjust' &&
                    selectedStock !== null
                }
                onOpenChange={(open) => {
                    if (!open) {
                        closeDrawer();
                    }
                }}
                title="Adjust Stock"
                description="Record incoming or outgoing stock and update the inventory balance."
                processing={adjustForm.processing}
            >
                {selectedStock && (
                    <form
                        onSubmit={
                            submitAdjustment
                        }
                        className="flex min-h-full flex-col"
                    >
                        <div className="flex-1 space-y-4 p-5">
                            <ContextCard
                                icon={<Package2 />}
                                title={
                                    selectedStock
                                        .product
                                        ?.name ??
                                    'Unknown product'
                                }
                                subtitle={
                                    <>
                                        {selectedStock
                                            .warehouse
                                            ?.name ??
                                            'Unknown warehouse'}
                                        {selectedStock
                                            .warehouse
                                            ?.branch
                                            ? ` • ${selectedStock.warehouse.branch.name}`
                                            : ''}
                                    </>
                                }
                                metrics={[
                                    {
                                        label:
                                            'Current Quantity',
                                        value: `${formatQuantity(
                                            selectedStock.quantity,
                                        )} ${
                                            selectedStock
                                                .product
                                                ?.unit ??
                                            ''
                                        }`,
                                    },
                                    {
                                        label:
                                            'Average Cost',
                                        value: formatCurrency(
                                            selectedStock.average_cost,
                                        ),
                                    },
                                ]}
                            />

                            <FormSection
                                title="Stock Movement"
                                description="Choose the reason and quantity of the stock change."
                                icon={
                                    <ClipboardPenLine />
                                }
                            >
                                <FormField
                                    id="movement_type"
                                    label="Movement Type"
                                    error={
                                        adjustForm.errors
                                            .movement_type
                                    }
                                    required
                                >
                                    <Select
                                        value={
                                            adjustForm
                                                .data
                                                .movement_type
                                        }
                                        disabled={
                                            adjustForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            adjustForm.setData(
                                                'movement_type',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="movement_type">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {movementTypes.map(
                                                (
                                                    movement,
                                                ) => (
                                                    <SelectItem
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
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <CalloutCard
                                    tone={
                                        isIncomingMovement
                                            ? 'success'
                                            : 'danger'
                                    }
                                    icon={
                                        isIncomingMovement
                                            ? ArrowUpRight
                                            : ArrowDownRight
                                    }
                                    title={
                                        isIncomingMovement
                                            ? 'Quantity will be added'
                                            : 'Quantity will be deducted'
                                    }
                                    description={`Current available stock: ${formatQuantity(
                                        selectedStock.quantity,
                                    )} ${
                                        selectedStock
                                            .product
                                            ?.unit ?? ''
                                    }`}
                                />

                                <FormField
                                    id="adjust_quantity"
                                    label="Quantity"
                                    error={
                                        adjustForm.errors
                                            .quantity
                                    }
                                    required
                                >
                                    <NumberInput
                                        id="adjust_quantity"
                                        min="0.001"
                                        value={
                                            adjustForm
                                                .data
                                                .quantity
                                        }
                                        disabled={
                                            adjustForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            adjustForm.setData(
                                                'quantity',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>

                                {isIncomingMovement && (
                                    <FormField
                                        id="adjust_unit_cost"
                                        label="Unit Cost"
                                        error={
                                            adjustForm
                                                .errors
                                                .unit_cost
                                        }
                                    >
                                        <MoneyInput
                                            id="adjust_unit_cost"
                                            value={
                                                adjustForm
                                                    .data
                                                    .unit_cost
                                            }
                                            disabled={
                                                adjustForm.processing
                                            }
                                            onValueChange={(
                                                value,
                                            ) =>
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
                                icon={<Layers3 />}
                            >
                                <FormField
                                    id="reference_no"
                                    label="Reference Number"
                                    error={
                                        adjustForm.errors
                                            .reference_no
                                    }
                                >
                                    <Input
                                        id="reference_no"
                                        type="text"
                                        value={
                                            adjustForm
                                                .data
                                                .reference_no
                                        }
                                        disabled={
                                            adjustForm.processing
                                        }
                                        onChange={(event) =>
                                            adjustForm.setData(
                                                'reference_no',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Invoice, receipt, or document number"
                                    />
                                </FormField>

                                <FormField
                                    id="adjust_remarks"
                                    label="Remarks"
                                    error={
                                        adjustForm.errors
                                            .remarks
                                    }
                                >
                                    <Textarea
                                        id="adjust_remarks"
                                        rows={4}
                                        value={
                                            adjustForm
                                                .data
                                                .remarks
                                        }
                                        disabled={
                                            adjustForm.processing
                                        }
                                        onChange={(event) =>
                                            adjustForm.setData(
                                                'remarks',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Explain the reason for this adjustment..."
                                        className="resize-none"
                                    />
                                </FormField>
                            </FormSection>
                        </div>

                        <AppDrawerActions
                            processing={
                                adjustForm.processing
                            }
                            onCancel={closeDrawer}
                            submitLabel="Apply Adjustment"
                            processingLabel="Applying Adjustment..."
                        />
                    </form>
                )}
            </AppDrawer>

            {/* Transfer */}

            <AppDrawer
                open={
                    drawerType === 'transfer' &&
                    selectedStock !== null
                }
                onOpenChange={(open) => {
                    if (!open) {
                        closeDrawer();
                    }
                }}
                title="Transfer Stock"
                description="Move available stock to another active warehouse."
                processing={
                    transferForm.processing
                }
            >
                {selectedStock && (
                    <form
                        onSubmit={submitTransfer}
                        className="flex min-h-full flex-col"
                    >
                        <div className="flex-1 space-y-4 p-5">
                            <ContextCard
                                icon={<Package2 />}
                                title={
                                    selectedStock
                                        .product
                                        ?.name ??
                                    'Unknown product'
                                }
                                subtitle={
                                    <>
                                        {selectedStock
                                            .warehouse
                                            ?.name ??
                                            'Unknown warehouse'}
                                        {selectedStock
                                            .warehouse
                                            ?.branch
                                            ? ` • ${selectedStock.warehouse.branch.name}`
                                            : ''}
                                    </>
                                }
                                metrics={[
                                    {
                                        label:
                                            'Available Quantity',
                                        value: `${formatQuantity(
                                            selectedStock.quantity,
                                        )} ${
                                            selectedStock
                                                .product
                                                ?.unit ??
                                            ''
                                        }`,
                                    },
                                    {
                                        label:
                                            'Average Cost',
                                        value: formatCurrency(
                                            selectedStock.average_cost,
                                        ),
                                    },
                                ]}
                            />

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-border/60 bg-muted/[0.025] p-3">
                                <div className="min-w-0 rounded-lg border border-border/50 bg-background/60 p-3 text-center">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                        Source
                                    </p>

                                    <p className="mt-1 truncate text-[11px] font-semibold">
                                        {selectedStock
                                            .warehouse
                                            ?.name ??
                                            'Warehouse'}
                                    </p>
                                </div>

                                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <ArrowRightLeft className="size-4" />
                                </div>

                                <div className="min-w-0 rounded-lg border border-border/50 bg-background/60 p-3 text-center">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                        Destination
                                    </p>

                                    <p className="mt-1 truncate text-[11px] font-semibold">
                                        {destinationWarehouses.find(
                                            (
                                                warehouse,
                                            ) =>
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
                                icon={
                                    <ArrowRightLeft />
                                }
                            >
                                <FormField
                                    id="destination_warehouse_id"
                                    label="Destination Warehouse"
                                    error={
                                        transferForm
                                            .errors
                                            .destination_warehouse_id
                                    }
                                    required
                                >
                                    <Select
                                        value={
                                            transferForm
                                                .data
                                                .destination_warehouse_id ||
                                            NONE_VALUE
                                        }
                                        disabled={
                                            transferForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            transferForm.setData(
                                                'destination_warehouse_id',
                                                value ===
                                                    NONE_VALUE
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="destination_warehouse_id">
                                            <SelectValue placeholder="Select destination" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem
                                                value={
                                                    NONE_VALUE
                                                }
                                            >
                                                Select destination
                                            </SelectItem>

                                            {destinationWarehouses.map(
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
                                                        {
                                                            warehouse.name
                                                        }
                                                        {warehouse.branch
                                                            ? ` — ${warehouse.branch.name}`
                                                            : ''}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <FormField
                                    id="transfer_quantity"
                                    label="Transfer Quantity"
                                    description={`Maximum transferable: ${formatQuantity(
                                        selectedStock.quantity,
                                    )} ${
                                        selectedStock
                                            .product
                                            ?.unit ?? ''
                                    }`}
                                    error={
                                        transferForm
                                            .errors
                                            .quantity
                                    }
                                    required
                                >
                                    <NumberInput
                                        id="transfer_quantity"
                                        min="0.001"
                                        max={String(
                                            selectedStock.quantity,
                                        )}
                                        value={
                                            transferForm
                                                .data
                                                .quantity
                                        }
                                        disabled={
                                            transferForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            transferForm.setData(
                                                'quantity',
                                                value,
                                            )
                                        }
                                    />
                                </FormField>
                            </FormSection>

                            <FormField
                                id="transfer_remarks"
                                label="Remarks"
                                error={
                                    transferForm.errors
                                        .remarks
                                }
                            >
                                <Textarea
                                    id="transfer_remarks"
                                    rows={4}
                                    value={
                                        transferForm.data
                                            .remarks
                                    }
                                    disabled={
                                        transferForm.processing
                                    }
                                    onChange={(event) =>
                                        transferForm.setData(
                                            'remarks',
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="Reason or additional transfer details..."
                                    className="resize-none"
                                />
                            </FormField>
                        </div>

                        <AppDrawerActions
                            processing={
                                transferForm.processing
                            }
                            onCancel={closeDrawer}
                            submitLabel="Transfer Stock"
                            processingLabel="Transferring Stock..."
                        />
                    </form>
                )}
            </AppDrawer>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
                title="Delete Stock Record"
                description={`Delete the stock record for "${deleteTarget?.product?.name ?? 'this product'}"? Existing stock movements may prevent deletion to preserve inventory history.`}
                confirmText="Delete Stock Record"
                processing={deleteProcessing}
                destructive
                onConfirm={deleteStock}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function StockControlMetric({
    title,
    value,
    description,
    icon: Icon,
    tone,
    className,
}: {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    tone: StockMetricTone;
    className?: string;
}) {
    const toneStyles: Record<
        StockMetricTone,
        {
            icon: string;
            value: string;
            glow: string;
        }
    > = {
        primary: {
            icon: 'border-primary/20 bg-primary/10 text-primary',
            value: 'text-primary',
            glow: 'bg-primary/10',
        },
        amber: {
            icon: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            glow: 'bg-amber-500/10',
        },
        red: {
            icon: 'border-red-500/20 bg-red-500/10 text-red-400',
            value: 'text-red-400',
            glow: 'bg-red-500/10',
        },
    };

    const styles = toneStyles[tone];

    return (
        <div
            className={cn(
                'group relative min-w-0 overflow-hidden p-4 transition-colors hover:bg-muted/[0.025]',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute -bottom-12 -right-12 size-28 rounded-full blur-3xl',
                    styles.glow,
                )}
            />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                        {title}
                    </p>

                    <p
                        className={cn(
                            'mt-2 text-xl font-semibold leading-none tabular-nums',
                            styles.value,
                        )}
                    >
                        {value}
                    </p>

                    <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                        {description}
                    </p>
                </div>

                <span
                    className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border',
                        styles.icon,
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>
        </div>
    );
}

function getStockStatus(
    stock: WarehouseStock,
): {
    label: string;
    variant:
        | 'success'
        | 'warning'
        | 'danger';
    progressClass: string;
} {
    const quantity = Number(
        stock.quantity ?? 0,
    );

    const reorderLevel = Number(
        stock.reorder_level ?? 0,
    );

    if (quantity <= 0) {
        return {
            label: 'Out of stock',
            variant: 'danger',
            progressClass: 'bg-red-400',
        };
    }

    if (quantity <= reorderLevel) {
        return {
            label: 'Low stock',
            variant: 'warning',
            progressClass: 'bg-amber-400',
        };
    }

    return {
        label: 'In stock',
        variant: 'success',
        progressClass: 'bg-emerald-400',
    };
}

function getStockPercentage(
    stock: WarehouseStock,
): number {
    const quantity = Number(
        stock.quantity ?? 0,
    );

    const maximum = Number(
        stock.max_stock_level ?? 0,
    );

    const reorder = Number(
        stock.reorder_level ?? 0,
    );

    if (maximum > 0) {
        return Math.min(
            100,
            Math.max(
                0,
                (quantity / maximum) * 100,
            ),
        );
    }

    if (quantity <= 0) {
        return 0;
    }

    if (
        reorder > 0 &&
        quantity <= reorder
    ) {
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
        Number.isFinite(amount)
            ? amount
            : 0,
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
        Number.isFinite(quantity)
            ? quantity
            : 0,
    );
}

function formatNumber(
    value: string | number | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat(
        'en-PH',
    ).format(
        Number.isFinite(amount)
            ? amount
            : 0,
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

    return new Intl.DateTimeFormat(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    ).format(date);
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

    return new Intl.DateTimeFormat(
        'en-PH',
        {
            hour: 'numeric',
            minute: '2-digit',
        },
    ).format(date);
}